// @vitest-environment jsdom

import { useMemo, useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createXiangqiOverlay, type XiangqiClientRemote } from '../../src/client/XiangqiOverlay.tsx'
import type { XiangqiUiState } from '../../src/client/store.ts'

afterEach(cleanup)

const sessionSnapshot = {
  current: 'session-1',
  byId: {
    'session-1': { projectionValues: { xiangqi: null } },
  },
}

function initialState(): XiangqiUiState {
  return {
    open: true,
    minimized: false,
    sessionId: null,
    gameId: null,
    revision: null,
    game: null,
    busy: false,
    error: null,
  }
}

function Harness({ Overlay }: { Overlay: ReturnType<typeof createXiangqiOverlay> }) {
  const [state, setState] = useState(initialState)
  const actions = useMemo(() => {
    const update = (patch: Partial<XiangqiUiState>) => {
      setState(previous => ({ ...previous, ...patch }))
    }
    return {
      open: () => update({ open: true }),
      close: () => update({ open: false }),
      toggleMinimized: () => setState(previous => ({ ...previous, minimized: !previous.minimized })),
      clearGame: () => update({ sessionId: null, gameId: null, revision: null, game: null, busy: false, error: null }),
      setBusy: (busy: boolean) => update({ busy }),
      setError: (error: string | null) => update({ error }),
      setGame: () => undefined,
    }
  }, [])

  const useStore = <T,>(select: (value: XiangqiUiState) => T): T => select(state)
  const useSessions = <T,>(select: (value: typeof sessionSnapshot) => T): T => select(sessionSnapshot)

  return (
    <Overlay
      useStore={useStore as never}
      useSessions={useSessions as never}
      actions={actions as never}
    />
  )
}

describe('XiangqiOverlay', () => {
  it('does not retry a failed automatic new game in a tight loop', async () => {
    const remote = {
      newGame: vi.fn().mockRejectedValue(new Error('测试 Remote 失败')),
    } as unknown as XiangqiClientRemote
    const Overlay = createXiangqiOverlay(remote, vi.fn().mockResolvedValue(undefined))

    render(<Harness Overlay={Overlay} />)

    await waitFor(() => expect(remote.newGame).toHaveBeenCalledTimes(1))
    expect(remote.newGame).toHaveBeenCalledWith('session-1', {})
    await new Promise(resolve => setTimeout(resolve, 30))

    expect(remote.newGame).toHaveBeenCalledTimes(1)
    expect(screen.getByText('测试 Remote 失败')).toBeTruthy()
  })

  it('can minimize and restore the floating chess surface', async () => {
    const remote = {
      newGame: vi.fn().mockRejectedValue(new Error('测试 Remote 失败')),
    } as unknown as XiangqiClientRemote
    const Overlay = createXiangqiOverlay(remote, vi.fn().mockResolvedValue(undefined))

    render(<Harness Overlay={Overlay} />)

    await waitFor(() => expect(screen.getByRole('button', { name: '最小化棋盘' })).toBeTruthy())
    fireEvent.click(screen.getByRole('button', { name: '最小化棋盘' }))
    expect(screen.getByRole('button', { name: '恢复棋盘' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '恢复棋盘' }))
    expect(screen.getByRole('button', { name: '最小化棋盘' })).toBeTruthy()
  })
})
