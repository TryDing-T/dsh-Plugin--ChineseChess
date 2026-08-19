/** Frame-wide Chinese chess surface and its Host/Agent turn bridge. */

import { useEffect, useRef } from 'react'
import type { PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-runtime/client'
import type { SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol'
import type { XiangqiNewGameRequest, XiangqiSerializedState } from '../types.ts'
import type { XiangqiMoveRequest, XiangqiPageActions } from './types.ts'
import { createXiangqiStore } from './store.ts'
import { toXiangqiGameViewModel, turnOf, ucciOf } from './view-model.ts'
import { XiangqiPage } from './XiangqiPage.tsx'
import css from './XiangqiSlots.module.css'
import { formatCoordinate } from '../game/coordinates.ts'
import { findBestMoves } from '../game/ai.ts'
import { deserialize } from '../game/serialization.ts'

export interface XiangqiClientRemote {
  newGame: (sessionId: SessionId, request: XiangqiNewGameRequest) => Promise<RemoteResult<XiangqiSerializedState>>
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
}

export type PromptDshTurn = (
  sessionId: SessionId,
  state: XiangqiSerializedState,
  suggestions: {
    depth: number
    nodes: number
    candidates: readonly { from: string; to: string; score: number }[]
  },
) => Promise<void>

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
  promptDshTurn: PromptDshTurn,
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
  const busy = useStore(state => state.busy)
  const error = useStore(state => state.error)
    const currentSessionId = useSessions(state => state.current)
    const projection = useSessions(state => {
      const current = state.current
      return current === undefined ? undefined : state.byId[current]?.projectionValues?.xiangqi
    })
    const autoStartSession = useRef<string | null>(null)

    useEffect(() => {
      if (!open) return
      if (currentSessionId === undefined) {
        if (sessionId !== null) actions.clearGame()
        return
      }
      const current = String(currentSessionId)
      if (sessionId !== null && sessionId !== current) actions.clearGame()
    }, [actions, currentSessionId, open, sessionId])

    useEffect(() => {
      if (!open || currentSessionId === undefined) {
        autoStartSession.current = null
        return
      }
      const current = String(currentSessionId)
      if (sessionId !== null && sessionId !== current) {
        autoStartSession.current = null
        return
      }
      // The summary has not received the plugin's projection baseline yet.
      // Waiting here prevents a duplicate new_game during the initial sync.
      if (projection === undefined) return
      if (projection === null) {
        // A failed Remote must not turn into a tight retry loop. The retry
        // button below starts another explicit attempt after this fuse has
        // already been armed for the current session.
        if (sessionId !== null || busy || autoStartSession.current === current) return
        autoStartSession.current = current
        actions.setBusy(true)
        void remote.newGame(currentSessionId, {})
          .then(unwrap)
          .then((state) => {
            actions.setGame(current, state, toXiangqiGameViewModel(state, { humanSide: 'red', busy: false }))
          })
          .catch((reason: unknown) => { actions.setError(errorText(reason)) })
          .finally(() => { actions.setBusy(false) })
        return
      }

      try {
        const next = toXiangqiGameViewModel(projection, { humanSide: 'red', busy })
        const projectionIsOlder = sessionId === current
          && revision !== null
          && projection.revision < revision
        if (!projectionIsOlder && (sessionId !== current || gameId !== projection.gameId || revision !== projection.revision)) {
          actions.setGame(current, projection, next)
        }
        if (!projectionIsOlder && busy && (projection.phase !== 'active' || turnOf(projection) === 'red')) actions.setBusy(false)
      } catch (reason: unknown) {
        actions.setError(errorText(reason))
      }
    }, [actions, busy, currentSessionId, gameId, open, projection, remote, revision, sessionId])

    const withCurrent = (action: (current: SessionId) => Promise<void>): (() => void) => {
      return () => {
        if (currentSessionId === undefined) {
          actions.setError('请先选择一个会话')
          return
        }
        void action(currentSessionId).catch((reason: unknown) => {
          actions.setError(errorText(reason))
          actions.setBusy(false)
        })
      }
    }

    const onNewGame = withCurrent(async (current) => {
      if (busy) return
      autoStartSession.current = String(current)
      actions.setBusy(true)
      actions.setError(null)
      const state = unwrap(await remote.newGame(current, {}))
      actions.setGame(String(current), state, toXiangqiGameViewModel(state, { humanSide: 'red', busy: false }))
      actions.setBusy(false)
    })

    const onUndo = withCurrent(async (current) => {
      if (gameId === null || revision === null) throw new Error('棋局尚未同步完成')
      actions.setBusy(true)
      actions.setError(null)
      let state = unwrap(await remote.undo(current, { gameId, revision }))
      // A human-facing undo rewinds the model's reply together with the
      // human move, so the board returns to red's turn whenever possible.
      while (state.phase === 'active' && turnOf(state) === 'black') {
        const view = toXiangqiGameViewModel(state, { humanSide: 'red', busy: true })
        if (view.moves.length === 0) break
        state = unwrap(await remote.undo(current, { gameId: state.gameId, revision: state.revision }))
      }
      actions.setGame(String(current), state, toXiangqiGameViewModel(state, { humanSide: 'red', busy: false }))
      actions.setBusy(false)
    })

    const onResign = withCurrent(async (current) => {
      if (gameId === null || revision === null) throw new Error('棋局尚未同步完成')
      actions.setBusy(true)
      actions.setError(null)
      const state = unwrap(await remote.resign(current, { gameId, revision, side: 'red' }))
      actions.setGame(String(current), state, toXiangqiGameViewModel(state, { humanSide: 'red', busy: false }))
      actions.setBusy(false)
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
      actions.setBusy(true)
      actions.setError(null)
      try {
        const state = unwrap(await remote.move(currentSessionId, {
          gameId,
          revision,
          move: { from: ucciOf(move.from), to: ucciOf(move.to) },
        }))
        const next = toXiangqiGameViewModel(state, { humanSide: 'red', busy: true })
        actions.setGame(String(currentSessionId), state, next)
        if (state.phase === 'active' && next.status === 'playing' && turnOf(state) === 'black') {
          // 候选排名留在浏览器本地，DSH 模型只需做一次决策。迭代加深 +
          // 时间预算：固定 ~180ms 内返回，剩余预算自动挖得更深（通常 3~5 层，
          // 含静态搜索兜底），浏览器无需等待另一个 Host Remote 往返。
          const summary = findBestMoves(deserialize(JSON.stringify(state.gameState)), {
            timeMs: 180,
            depth: 6,
            limit: 5,
          })
          const suggestions = {
            depth: summary.depth,
            nodes: summary.nodes,
            candidates: summary.candidates.map(candidate => ({
              from: formatCoordinate(candidate.move.from),
              to: formatCoordinate(candidate.move.to),
              score: candidate.score,
            })),
          }
          await promptDshTurn(currentSessionId, state, suggestions)
        } else {
          actions.setBusy(false)
        }
      } catch (reason: unknown) {
        actions.setError(errorText(reason))
        actions.setBusy(false)
      }
    }

    const onPageMove = (move: XiangqiMoveRequest): void => {
      // The callback keeps XiangqiPage's public surface UI-only while the
      // overlay supplies the current session/revision fence.
      void onMoveWith(move)
    }

    const pageActions: XiangqiPageActions = {
      onMove: onPageMove,
      onNewGame,
      onUndo,
      onResign,
      onExit: () => { actions.close() },
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
              <button type="button" className={css.closeButton} onClick={() => { actions.close() }}>关闭棋盘</button>
            </div>
          </div>
          {minimized ? (
            <div className={css.minimizedSummary}>
              <span className={css.minimizedDot} data-busy={busy || undefined} aria-hidden="true" />
              <span>{game === null ? '棋局未准备' : game.statusText}</span>
            </div>
          ) : (
            <>
              {currentSessionId === undefined && (
                <div className={css.emptyState}>请先在左侧选择或创建一个会话。</div>
              )}
              {currentSessionId !== undefined && game === null && (
                <div className={css.emptyState}>
                  <p>{projection === undefined ? '正在同步棋局……' : '正在准备棋局……'}</p>
                  {error !== null && <p className={css.errorText} role="alert">{error}</p>}
                  <button type="button" className={css.retryButton} onClick={onNewGame}>重新开局</button>
                </div>
              )}
              {game !== null && <XiangqiPage game={game} {...pageActions} />}
              {error !== null && game !== null && <p className={css.inlineError} role="alert">{error}</p>}
            </>
          )}
        </section>
      </div>
    )
  }
}
