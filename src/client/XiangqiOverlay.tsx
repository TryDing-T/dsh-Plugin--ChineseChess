/** Frame-wide Chinese chess surface and its Host/Agent turn bridge. */

import { useEffect, useRef } from 'react'
import type { PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type { SessionId } from '@deepseek-ai/dsh-client-connection/client'
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol'
import type {
  XiangqiAiTurnRequest,
  XiangqiAiTurnResult,
  XiangqiDecisionTrace,
  XiangqiNewGameRequest,
  XiangqiRuntimeState,
  XiangqiSerializedState,
} from '../types.ts'
import type { XiangqiMoveRequest, XiangqiPageActions } from './types.ts'
import { createXiangqiStore } from './store.ts'
import { liveStatusTextOf, toXiangqiGameViewModel, turnOf, ucciOf } from './view-model.ts'
import { XiangqiPage } from './XiangqiPage.tsx'
import css from './XiangqiSlots.module.css'

export interface XiangqiClientRemote {
  newGame: (sessionId: SessionId, request: XiangqiNewGameRequest) => Promise<RemoteResult<XiangqiSerializedState>>
  get: (sessionId: SessionId, gameId?: string) => Promise<RemoteResult<XiangqiSerializedState>>
  getRuntimeState: (sessionId: SessionId) => Promise<RemoteResult<XiangqiRuntimeState>>
  getDecisionTrace: (sessionId: SessionId, gameId?: string) => Promise<RemoteResult<XiangqiDecisionTrace | null>>
  move: (sessionId: SessionId, request: {
    gameId: string
    revision: number
    move: { from: string; to: string }
  }) => Promise<RemoteResult<XiangqiSerializedState>>
  undo: (sessionId: SessionId, request: { gameId: string; revision: number }) => Promise<RemoteResult<XiangqiSerializedState>>
  resign: (sessionId: SessionId, request: {
    gameId: string
    revision: number
    side: 'red' | 'black'
  }) => Promise<RemoteResult<XiangqiSerializedState>>
  requestAiMove: (sessionId: SessionId, request: XiangqiAiTurnRequest) => Promise<RemoteResult<XiangqiAiTurnResult>>
  cancelAiMove: (sessionId: SessionId) => Promise<RemoteResult<{ readonly cancelled: boolean }>>
}

/**
 * Host reads the pending modelSelection projection before the last request
 * header, so changing the selected model does not require another chat turn.
 */

/** 决策进行中的轮询节奏；空闲时低频核对全局状态。 */
const AI_PENDING_POLL_MS = 350
const IDLE_POLL_MS = 1500

export type XiangqiOverlayProps =
  PropsRuntime<'shell.overlay'>
  & PropsStore<ReturnType<typeof createXiangqiStore>>

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function unwrap<T>(result: RemoteResult<T>): T {
  if (!result.ok) throw new Error(`${result.error.code}: ${result.error.message}`)
  return result.value
}

/**
 * Build a slot component with the mounted Remote face closed over the plugin
 * fiber. This avoids a module-level singleton and keeps HMR unload-safe.
 */
export function createXiangqiOverlay(
  remote: XiangqiClientRemote,
) {
  return function XiangqiOverlay({
    useSessions,
    useStore,
    actions,
  }: XiangqiOverlayProps) {
    const open = useStore(state => state.open)
    const minimized = useStore(state => state.minimized)
    const sessionId = useStore(state => state.sessionId)
    const gameId = useStore(state => state.gameId)
    const revision = useStore(state => state.revision)
    const game = useStore(state => state.game)
    const decisionTrace = useStore(state => state.decisionTrace)
    const operationBusy = useStore(state => state.operationBusy)
    const aiPending = useStore(state => state.aiPending)
    const error = useStore(state => state.error)
    const currentSessionId = useSessions(state => state.current)
    const currentSessionRef = useRef<SessionId | undefined>(currentSessionId)
    currentSessionRef.current = currentSessionId
    // Long-interval polls read the latest view through a ref so switching
    // intervals (busy ⇄ idle) is the only thing that re-arms the timer.
    const viewRef = useRef({ gameId, revision, operationBusy })
    viewRef.current = { gameId, revision, operationBusy }
    const autoStartSession = useRef<string | null>(null)
    const operationSequence = useRef(0)
    const beginOperation = (): number => {
      operationSequence.current += 1
      return operationSequence.current
    }
    const isCurrentOperation = (operation: number): boolean => operationSequence.current === operation

    const setGameSession = (
      current: SessionId,
      state: XiangqiSerializedState,
    ): void => {
      actions.setGame(String(current), state, toXiangqiGameViewModel(state, {
        humanSide: 'red',
        busy: false,
        aiPending,
        activity: 'idle',
      }))
    }

    const setGameForVisibleSession = (state: XiangqiSerializedState): void => {
      const current = currentSessionRef.current
      if (current !== undefined) setGameSession(current, state)
    }

    const getGlobalGame = async (current: SessionId): Promise<XiangqiSerializedState> =>
      unwrap(await remote.get(current, undefined))

    /**
     * 打开期间的唯一同步通道：原子运行状态一次带回棋局、aiPending 与追踪。
     * 决策进行中 350ms、空闲 1500ms；任何标签页的落子/取消都会被所有页面看到。
     */
    useEffect(() => {
      if (!open || currentSessionId === undefined || sessionId !== String(currentSessionId)) return
      let active = true
      let timer: ReturnType<typeof setTimeout> | undefined
      const poll = async (): Promise<void> => {
        try {
          const snapshot = unwrap(await remote.getRuntimeState(currentSessionId))
          if (!active) return
          actions.setAiPending(snapshot.aiPending)
          // 无条件跟随 Host：trace 为 null（新局/从未决策）时清掉本地旧链，
          // 避免其他标签页开新局后本页仍显示上一局的决策记录。
          actions.setDecisionTrace(snapshot.trace)
          const view = viewRef.current
          if (snapshot.state !== null) {
            if (!view.operationBusy && (snapshot.state.gameId !== view.gameId || snapshot.state.revision !== view.revision)) {
              setGameForVisibleSession(snapshot.state)
            }
          } else if (view.gameId !== null) {
            // Host 进程重建过（重启/HMR）：旧棋局已随内存消失，回到待初始化状态。
            actions.hostReset()
          } else if (!view.operationBusy && autoStartSession.current === String(currentSessionId)) {
            // 尚无全局棋局：与首次打开一致，显式读取会创建初始局。
            const created = await getGlobalGame(currentSessionId)
            if (!active) return
            setGameForVisibleSession(created)
          }
        } catch {
          // 单次轮询失败不打断界面，下一个周期自然重试。
        }
        if (!active) return
        timer = setTimeout(() => { void poll() }, aiPending ? AI_PENDING_POLL_MS : IDLE_POLL_MS)
      }
      void poll()
      return () => {
        active = false
        if (timer !== undefined) clearTimeout(timer)
      }
    }, [actions, aiPending, currentSessionId, open, sessionId])

    // 决策追踪的即时首拉（打开面板时不用等第一个轮询周期）。
    useEffect(() => {
      if (!open || currentSessionId === undefined || gameId === null || sessionId !== String(currentSessionId)) return
      let active = true
      void remote.getDecisionTrace(currentSessionId, gameId)
        .then((result) => {
          if (active && result.ok) actions.setDecisionTrace(result.value)
        })
        .catch(() => { /* 诊断失败不影响棋盘 */ })
      return () => { active = false }
    }, [actions, currentSessionId, gameId, open, sessionId])

    useEffect(() => {
      if (!open || currentSessionId === undefined) {
        autoStartSession.current = null
        return
      }
      const current = String(currentSessionId)
      if (sessionId !== null && sessionId !== current) {
        autoStartSession.current = null
        actions.attachSession(current)
        return
      }
      // The Host owns one global game. Every newly opened surface reads the
      // Host state directly instead of adopting any cached view.
      if (sessionId === null && !operationBusy && !aiPending && autoStartSession.current !== current) {
        // A failed Remote must not turn into a tight retry loop. The retry
        // button below starts another explicit attempt after this fuse has
        // already been armed for the current session.
        autoStartSession.current = current
        const operation = beginOperation()
        actions.setOperationBusy(true)
        actions.setActivity('sync')
        actions.setError(null)
        void getGlobalGame(currentSessionId)
          .then((state) => {
            if (!isCurrentOperation(operation)) return
            setGameForVisibleSession(state)
          })
          .catch((reason: unknown) => {
            if (isCurrentOperation(operation)) actions.setError(errorText(reason))
          })
          .finally(() => {
            if (isCurrentOperation(operation)) {
              actions.setOperationBusy(false)
              actions.setActivity('idle')
            }
          })
      }
    }, [actions, aiPending, currentSessionId, open, operationBusy, sessionId])

    /** 黑方回合统一入口：取模型快照 → 请求 DSH 决策 → 写回结果。 */
    const runAiTurn = async (
      current: SessionId,
      operation: number,
      turn: { readonly gameId: string; readonly revision: number },
    ): Promise<void> => {
      actions.setActivity('ai')
      try {
        // Host snapshots the current selection when this decision starts.
        const result = unwrap(await remote.requestAiMove(current, {
          gameId: turn.gameId,
          revision: turn.revision,
        }))
        const latestTrace = await remote.getDecisionTrace(current, turn.gameId)
          .then(response => response.ok ? response.value : null)
          .catch(() => null)
        if (latestTrace !== null) actions.setDecisionTrace(latestTrace)
        if (!isCurrentOperation(operation)) return
        if (result.status === 'moved') {
          setGameForVisibleSession(result.state)
        } else {
          // 失败/过期都只报告原因；绝不本地兜底，也绝不改动 revision。
          actions.setError(result.message)
        }
      } finally {
        // aiPending 的权威值由运行状态轮询维护；这里只复位本页面的操作标志。
        if (isCurrentOperation(operation)) {
          actions.setOperationBusy(false)
          actions.setActivity('idle')
        }
      }
    }

    const withCurrent = (
      action: (current: SessionId, operation: number) => Promise<void>,
      blockWhenBusy = false,
    ): (() => void) => {
      return () => {
        if (currentSessionId === undefined) {
          actions.setError('请先选择一个会话')
          return
        }
        if (blockWhenBusy && (operationBusy || aiPending)) return
        const operation = beginOperation()
        void action(currentSessionId, operation).catch((reason: unknown) => {
          if (isCurrentOperation(operation)) {
            actions.setError(errorText(reason))
            actions.setOperationBusy(false)
            actions.setActivity('idle')
          }
        })
      }
    }

    const onNewGame = withCurrent(async (current, operation) => {
      if (operationBusy || aiPending) return
      autoStartSession.current = String(current)
      actions.setOperationBusy(true)
      actions.setActivity('new')
      actions.setError(null)
      actions.setDecisionTrace(null)
      const state = unwrap(await remote.newGame(current, {}))
      if (!isCurrentOperation(operation)) return
      setGameForVisibleSession(state)
      actions.setOperationBusy(false)
      actions.setActivity('idle')
    }, true)

    const onUndo = withCurrent(async (current, operation) => {
      if (gameId === null || revision === null) throw new Error('棋局尚未同步完成')
      actions.setOperationBusy(true)
      actions.setActivity('undo')
      actions.setError(null)
      let state = unwrap(await remote.undo(current, { gameId, revision }))
      // A human-facing undo rewinds the model's reply together with the
      // human move, so the board returns to red's turn whenever possible.
      while (state.phase === 'active' && turnOf(state) === 'black') {
        const view = toXiangqiGameViewModel(state, { humanSide: 'red', busy: true })
        if (view.moves.length === 0) break
        state = unwrap(await remote.undo(current, { gameId: state.gameId, revision: state.revision }))
      }
      if (!isCurrentOperation(operation)) return
      setGameForVisibleSession(state)
      actions.setOperationBusy(false)
      actions.setActivity('idle')
    })

    const onResign = withCurrent(async (current, operation) => {
      if (gameId === null || revision === null) throw new Error('棋局尚未同步完成')
      actions.setOperationBusy(true)
      actions.setActivity('sync')
      actions.setError(null)
      const state = unwrap(await remote.resign(current, { gameId, revision, side: 'red' }))
      if (!isCurrentOperation(operation)) return
      setGameForVisibleSession(state)
      actions.setOperationBusy(false)
      actions.setActivity('idle')
    })

    const onMoveWith = async (move: XiangqiMoveRequest): Promise<void> => {
      if (currentSessionId === undefined) {
        actions.setError('请先选择一个会话')
        return
      }
      if (gameId === null || revision === null) {
        actions.setError('棋局尚未同步完成')
        return
      }
      if (operationBusy || aiPending) return
      actions.setOperationBusy(true)
      actions.setActivity('sync')
      actions.setError(null)
      const operation = beginOperation()
      try {
        const state = unwrap(await remote.move(currentSessionId, {
          gameId,
          revision,
          move: { from: ucciOf(move.from), to: ucciOf(move.to) },
        }))
        if (!isCurrentOperation(operation)) return
        const next = toXiangqiGameViewModel(state, { humanSide: 'red', busy: true, activity: 'ai' })
        const visibleSession = currentSessionRef.current
        if (visibleSession !== undefined) actions.setGame(String(visibleSession), state, next)
        if (state.phase === 'active' && next.status === 'playing' && turnOf(state) === 'black') {
          await runAiTurn(currentSessionId, operation, state)
        } else {
          actions.setOperationBusy(false)
          actions.setActivity('idle')
        }
      } catch (reason: unknown) {
        if (isCurrentOperation(operation)) {
          actions.setError(errorText(reason))
          actions.setOperationBusy(false)
          actions.setActivity('idle')
        }
      }
    }

    // 模型限流、供应商报错或网络失败后，棋盘停在黑方回合；只有 Host 确认
    // 没有决策在跑才允许重试，仍携带原 gameId + revision，无本地兜底。
    const onRequestAiMove = withCurrent(async (current, operation) => {
      if (gameId === null || revision === null) throw new Error('棋局尚未同步完成')
      if (aiPending) return
      actions.setError(null)
      actions.setOperationBusy(true)
      await runAiTurn(current, operation, { gameId, revision })
    }, true)

    const onCancelAiMove = (): void => {
      if (currentSessionId === undefined || !aiPending) return
      // beginOperation 让发起方 runAiTurn 的收尾失效——所以这里必须自己把
      // 本页面的操作标志复位，否则棋盘/新局/悔棋/重试会永久保持禁用。
      beginOperation()
      void remote.cancelAiMove(currentSessionId)
        .then(unwrap)
        .then(() => {
          actions.setAiPending(false)
          actions.setOperationBusy(false)
          actions.setActivity('idle')
          actions.setError(null)
          if (gameId !== null) {
            void remote.getDecisionTrace(currentSessionId, gameId).then((response) => {
              if (response.ok) actions.setDecisionTrace(response.value)
            }).catch(() => { /* 诊断失败不影响棋盘 */ })
          }
        })
        .catch((reason: unknown) => {
          actions.setError(errorText(reason))
          // 取消失败同样解锁：Host 侧决策可能已自行结束，轮询会纠正 aiPending。
          actions.setOperationBusy(false)
          actions.setActivity('idle')
        })
    }

    const onPageMove = (move: XiangqiMoveRequest): void => {
      // The callback keeps XiangqiPage's public surface UI-only while the
      // overlay supplies the current session/revision fence.
      void onMoveWith(move)
    }

    const onExit = (): void => {
      // Closing only hides the floating surface. The process-global game and
      // in-flight DSH decision continue; reopening reads the same state.
      actions.close()
    }

    const pageActions: XiangqiPageActions = {
      onMove: onPageMove,
      onNewGame,
      onUndo,
      onResign,
      onCancelAiMove,
      onRequestAiMove,
      onExit,
    }

    if (!open) return null

    return (
      <div className={minimized ? css.overlayBackdropMinimized : css.overlayBackdrop} role="presentation">
        <section
          className={minimized ? `${css.overlaySurface} ${css.overlaySurfaceMinimized}` : css.overlaySurface}
          role="dialog"
          aria-modal={minimized ? undefined : true}
          aria-labelledby="xiangqi-dialog-title"
        >
          <div className={css.overlayToolbar}>
            <h2 className={css.overlayTitle} id="xiangqi-dialog-title">中国象棋</h2>
            <div className={css.toolbarActions}>
              <button
                type="button"
                className={css.minimizeButton}
                aria-label={minimized ? '恢复棋盘' : '最小化棋盘'}
                onClick={() => { actions.toggleMinimized() }}
              >
                {minimized ? '恢复棋盘' : '最小化'}
              </button>
              <button type="button" className={css.closeButton} onClick={onExit}>关闭棋盘</button>
            </div>
          </div>
          {minimized ? (
            <div className={css.minimizedSummary}>
              <span className={css.minimizedDot} data-busy={operationBusy || aiPending || undefined} aria-hidden="true" />
              <span>{game === null ? '棋局未准备' : liveStatusTextOf(game)}</span>
            </div>
          ) : (
            <>
              {currentSessionId === undefined && (
                <div className={css.emptyState}>请先在左侧选择或创建一个会话。</div>
              )}
              {currentSessionId !== undefined && game === null && (
                <div className={css.emptyState}>
                  <p>正在准备棋局……</p>
                  {error !== null && <p className={css.errorText} role="alert">{error}</p>}
                  <button type="button" className={css.retryButton} onClick={onNewGame}>重新开局</button>
                </div>
              )}
              {game !== null && <XiangqiPage game={game} decisionTrace={decisionTrace} {...pageActions} />}
              {error !== null && game !== null && <p className={css.inlineError} role="alert">{error}</p>}
            </>
          )}
        </section>
      </div>
    )
  }
}
