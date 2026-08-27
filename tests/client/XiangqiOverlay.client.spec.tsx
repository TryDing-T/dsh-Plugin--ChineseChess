// @vitest-environment jsdom

import { useMemo, useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createXiangqiOverlay, type XiangqiClientRemote } from '../../src/client/XiangqiOverlay.tsx'
import { newGame as createGame } from '../../src/game/rules.ts'
import { serialize } from '../../src/game/serialization.ts'
import type { XiangqiUiState } from '../../src/client/store.ts'

afterEach(cleanup)

function initialState(): XiangqiUiState {
  return {
    open: true,
    minimized: false,
    sessionId: null,
    gameId: null,
    revision: null,
    game: null,
    decisionTrace: null,
    operationBusy: false,
    aiPending: false,
    activity: 'idle',
    error: null,
  }
}

function Harness({
  Overlay,
  currentSession = 'session-1',
  initialSessionId = null,
  onDetachSession,
}: {
  Overlay: ReturnType<typeof createXiangqiOverlay>
  currentSession?: string
  initialSessionId?: string | null
  onDetachSession?: () => void
}) {
  const [state, setState] = useState(() => ({ ...initialState(), sessionId: initialSessionId }))
  const actions = useMemo(() => {
    const update = (patch: Partial<XiangqiUiState>) => {
      setState(previous => ({ ...previous, ...patch }))
    }
    return {
      open: () => update({ open: true }),
      close: () => update({ open: false }),
      toggleMinimized: () => setState(previous => ({ ...previous, minimized: !previous.minimized })),
      attachSession: (sessionId: string) => update({ sessionId }),
      detachSession: () => {
        onDetachSession?.()
        update({ sessionId: null, operationBusy: false, activity: 'idle', error: null })
      },
      clearGame: () => update({ sessionId: null, gameId: null, revision: null, game: null, operationBusy: false, aiPending: false, activity: 'idle', error: null }),
      hostReset: () => update({ gameId: null, revision: null, game: null, decisionTrace: null, aiPending: false }),
      setOperationBusy: (busy: boolean) => update({ operationBusy: busy }),
      setAiPending: (pending: boolean) => update({ aiPending: pending }),
      setActivity: (activity: XiangqiUiState['activity']) => update({ activity }),
      setError: (error: string | null) => update({ error }),
      setDecisionTrace: (decisionTrace: XiangqiUiState['decisionTrace']) => update({ decisionTrace }),
      setGame: () => undefined,
    }
  }, [])

  const useStore = <T,>(select: (value: XiangqiUiState) => T): T => select(state)
  // 投影通道已随会话事件一起移除；客户端只从 useSessions 读当前会话 id。
  const sessionSnapshot = { current: currentSession }
  const useSessions = <T,>(select: (value: typeof sessionSnapshot) => T): T => select(sessionSnapshot)

  return (
    <Overlay
      useStore={useStore as never}
      useSessions={useSessions as never}
      actions={actions as never}
    />
  )
}

/** 运行状态轮询的空实现：不返回任何棋局，避免测试受轮询节奏影响。 */
function runtimePollingStub() {
  return vi.fn().mockRejectedValue(new Error('runtime state not mocked'))
}

describe('XiangqiOverlay', () => {
  it('does not create a new game when global synchronization fails', async () => {
    const remote = {
      get: vi.fn().mockRejectedValue(new Error('internal: xiangqi: game "game-stale" was not found')),
      newGame: vi.fn(),
      getRuntimeState: runtimePollingStub(),
    } as unknown as XiangqiClientRemote
    const Overlay = createXiangqiOverlay(remote)

    render(<Harness Overlay={Overlay} />)

    await waitFor(() => expect(remote.get).toHaveBeenCalledTimes(1))
    await new Promise(resolve => setTimeout(resolve, 30))

    expect(remote.newGame).not.toHaveBeenCalled()
    expect(screen.getByText('internal: xiangqi: game "game-stale" was not found')).toBeTruthy()
  })

  it('reads the Host global game directly when the surface opens', async () => {
    const remote = {
      get: vi.fn().mockResolvedValue({
        ok: true,
        value: {
          gameId: 'game-2',
          revision: 1,
          phase: 'active',
          gameState: JSON.parse(serialize(createGame())),
        },
      }),
      newGame: vi.fn(),
      getRuntimeState: runtimePollingStub(),
    } as unknown as XiangqiClientRemote
    const Overlay = createXiangqiOverlay(remote)

    render(<Harness Overlay={Overlay} />)

    await waitFor(() => expect(remote.get).toHaveBeenCalledWith('session-1', undefined))
    expect(remote.newGame).not.toHaveBeenCalled()
  })

  it('keeps the floating surface and does not cancel AI when switching chats', async () => {
    const remote = {
      get: vi.fn(),
      newGame: vi.fn(),
      cancelAiMove: vi.fn().mockResolvedValue({ ok: true, value: { cancelled: true } }),
      getRuntimeState: runtimePollingStub(),
    } as unknown as XiangqiClientRemote
    const Overlay = createXiangqiOverlay(remote)
    const onDetachSession = vi.fn()

    const view = render(<Harness
      Overlay={Overlay}
      currentSession="session-1"
      initialSessionId="session-1"
      onDetachSession={onDetachSession}
    />)
    expect(screen.getByRole('dialog')).toBeTruthy()

    view.rerender(<Harness
      Overlay={Overlay}
      currentSession="session-2"
      initialSessionId="session-1"
    />)

    await waitFor(() => expect(screen.getByRole('dialog')).toBeTruthy())
    expect(remote.cancelAiMove).not.toHaveBeenCalled()
    expect(onDetachSession).not.toHaveBeenCalled()
  })

  it('can minimize and restore the floating chess surface', async () => {
    const remote = {
      get: vi.fn().mockRejectedValue(new Error('GAME_NOT_FOUND: no global game')),
      newGame: vi.fn().mockRejectedValue(new Error('测试 Remote 失败')),
      getRuntimeState: runtimePollingStub(),
    } as unknown as XiangqiClientRemote
    const Overlay = createXiangqiOverlay(remote)

    render(<Harness Overlay={Overlay} />)

    await waitFor(() => expect(screen.getByRole('button', { name: '最小化棋盘' })).toBeTruthy())
    fireEvent.click(screen.getByRole('button', { name: '最小化棋盘' }))
    expect(screen.getByRole('button', { name: '恢复棋盘' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '恢复棋盘' }))
    expect(screen.getByRole('button', { name: '最小化棋盘' })).toBeTruthy()
  })

  it('hides without cancelling a pending AI decision', async () => {
    const remote = {
      get: vi.fn().mockRejectedValue(new Error('GAME_NOT_FOUND: no global game')),
      newGame: vi.fn().mockRejectedValue(new Error('测试 Remote 失败')),
      cancelAiMove: vi.fn(),
      getRuntimeState: runtimePollingStub(),
    } as unknown as XiangqiClientRemote
    const Overlay = createXiangqiOverlay(remote)

    render(<Harness Overlay={Overlay} />)

    await waitFor(() => expect(screen.getByRole('button', { name: '关闭棋盘' })).toBeTruthy())
    fireEvent.click(screen.getByRole('button', { name: '关闭棋盘' }))

    expect(screen.queryByRole('dialog')).toBeNull()
    expect(remote.cancelAiMove).not.toHaveBeenCalled()
  })
})
