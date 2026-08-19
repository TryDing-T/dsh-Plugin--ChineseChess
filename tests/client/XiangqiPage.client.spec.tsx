// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { XiangqiPage } from '../../src/client/XiangqiPage.tsx'
import type {
  XiangqiGameViewModel,
  XiangqiMoveRecord,
  XiangqiPiece,
} from '../../src/client/types.ts'

afterEach(cleanup)

function emptyBoard(): Array<Array<XiangqiPiece | null>> {
  return Array.from({ length: 10 }, () => Array<XiangqiPiece | null>(9).fill(null))
}

function makePiece(side: XiangqiPiece['side'], kind: XiangqiPiece['kind'], id: string): XiangqiPiece {
  return { id, side, kind }
}

function makeMove(side: XiangqiMoveRecord['side'] = 'red'): XiangqiMoveRecord {
  return {
    from: { row: 6, col: 0 },
    to: { row: 5, col: 0 },
    side,
    notation: '兵七进一',
  }
}

function makeGame(overrides: Partial<XiangqiGameViewModel> = {}): XiangqiGameViewModel {
  return {
    board: emptyBoard(),
    currentTurn: 'red',
    legalMoves: [],
    moves: [],
    status: 'playing',
    statusText: '等待你落子',
    ...overrides,
  }
}

function renderPage(game: XiangqiGameViewModel = makeGame()) {
  return render(
    <XiangqiPage
      game={game}
      onMove={vi.fn()}
      onNewGame={vi.fn()}
      onUndo={vi.fn()}
      onResign={vi.fn()}
    />,
  )
}

describe('XiangqiPage', () => {
  it('renders a visible 9x10 board, turn, status, move list, and controls', () => {
    const board = emptyBoard()
    board[0]![4] = makePiece('black', 'general', 'black-general')
    board[9]![4] = makePiece('red', 'general', 'red-general')
    board[6]![0] = makePiece('red', 'soldier', 'red-soldier-1')

    renderPage(makeGame({ board }))

    expect(screen.getByRole('heading', { name: '楚汉风云 · 象棋对弈' })).toBeTruthy()
    expect(screen.getByRole('grid', { name: '中国象棋棋盘，9列10行' })).toBeTruthy()
    expect(screen.getAllByRole('gridcell')).toHaveLength(90)
    expect(screen.getAllByText('帅').length).toBeGreaterThan(0)
    expect(screen.getAllByText('将').length).toBeGreaterThan(0)
    expect(screen.getAllByText('兵').length).toBeGreaterThan(0)
    expect(document.body.textContent).toContain('楚　河')
    expect(document.body.textContent).toContain('漢　界')
    expect(screen.getByText('等待你落子')).toBeTruthy()
    expect(screen.getByText('尚未开始，等待红方起手')).toBeTruthy()
    expect(screen.getByRole('button', { name: /新局/ })).toBeTruthy()
    expect((screen.getByRole('button', { name: /悔棋/ }) as HTMLButtonElement).disabled).toBe(true)
    expect(screen.getByRole('button', { name: /认输/ })).toBeTruthy()
  })

  it('selects a piece, exposes legal destinations, and sends the selected move', () => {
    const board = emptyBoard()
    board[6]![0] = makePiece('red', 'soldier', 'red-soldier-1')
    const onMove = vi.fn()
    const game = makeGame({
      board,
      legalMoves: [{ from: { row: 6, col: 0 }, to: { row: 5, col: 0 } }],
    })

    render(
      <XiangqiPage
        game={game}
        onMove={onMove}
        onNewGame={vi.fn()}
        onUndo={vi.fn()}
        onResign={vi.fn()}
      />,
    )

    const cells = screen.getAllByRole('gridcell')
    fireEvent.click(within(cells[54]!).getByRole('button'))

    expect(screen.getByRole('gridcell', { name: /第7行第1列.*已选中/ })).toBeTruthy()
    expect(screen.getByRole('gridcell', { name: /第6行第1列，空位，合法落点/ })).toBeTruthy()

    fireEvent.click(within(cells[45]!).getByRole('button'))
    expect(onMove).toHaveBeenCalledTimes(1)
    expect(onMove).toHaveBeenCalledWith({
      from: { row: 6, col: 0 },
      to: { row: 5, col: 0 },
    })
  })

  it('calls the injected new-game, undo, and resign callbacks', () => {
    const onNewGame = vi.fn()
    const onUndo = vi.fn()
    const onResign = vi.fn()

    render(
      <XiangqiPage
        game={makeGame({ moves: [makeMove()] })}
        onMove={vi.fn()}
        onNewGame={onNewGame}
        onUndo={onUndo}
        onResign={onResign}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /新局/ }))
    fireEvent.click(screen.getByRole('button', { name: /悔棋/ }))
    fireEvent.click(screen.getByRole('button', { name: /认输/ }))

    expect(onNewGame).toHaveBeenCalledTimes(1)
    expect(onUndo).toHaveBeenCalledTimes(1)
    expect(onResign).toHaveBeenCalledTimes(1)
  })

  it('reflects a new projected turn and move history without owning game state', () => {
    const view = renderPage()

    view.rerender(
      <XiangqiPage
        game={makeGame({
          currentTurn: 'black',
          statusText: 'AI 正在计算下一步',
          moves: [makeMove(), { ...makeMove('black'), notation: '卒３进１' }],
        })}
        onMove={vi.fn()}
        onNewGame={vi.fn()}
        onUndo={vi.fn()}
        onResign={vi.fn()}
      />,
    )

    expect(screen.getAllByText('黑方（AI）').length).toBeGreaterThan(0)
    expect(screen.getByText('AI 正在计算下一步')).toBeTruthy()
    expect(screen.getByText('2 步')).toBeTruthy()
    expect(screen.getAllByText('卒３进１').length).toBeGreaterThan(0)
  })

  it('keeps the page controls available in a narrow viewport and disables ended games', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 360 })
    renderPage(makeGame({ status: 'resigned', statusText: '本局已认输' }))

    expect(screen.getByRole('main', { name: '楚汉风云 · 象棋对弈' })).toBeTruthy()
    expect(screen.getByRole('grid', { name: '中国象棋棋盘，9列10行' })).toBeTruthy()
    expect(screen.getByRole('button', { name: /新局/ })).toBeTruthy()
    expect((screen.getByRole('button', { name: /悔棋/ }) as HTMLButtonElement).disabled).toBe(true)
    expect((screen.getByRole('button', { name: /认输/ }) as HTMLButtonElement).disabled).toBe(true)
    expect((screen.getByRole('button', { name: /第1行第1列/ }) as HTMLButtonElement).disabled).toBe(true)
  })
})
