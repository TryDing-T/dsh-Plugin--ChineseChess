import { useEffect, useRef, useState } from 'react'
import type {
  XiangqiGameViewModel,
  XiangqiLegalMove,
  XiangqiMoveRecord,
  XiangqiPageActions,
  XiangqiPiece,
  XiangqiPieceKind,
  XiangqiPosition,
  XiangqiSide,
} from './types.ts'
import { XIANGQI_COLUMNS, XIANGQI_ROWS } from './types.ts'
import css from './XiangqiPage.module.css'

const SIDE_LABELS = {
  red: '红方',
  black: '黑方',
} as const

const PIECE_LABELS = {
  red: {
    general: '帅',
    advisor: '仕',
    elephant: '相',
    horse: '马',
    rook: '车',
    cannon: '炮',
    soldier: '兵',
  },
  black: {
    general: '将',
    advisor: '士',
    elephant: '象',
    horse: '马',
    rook: '车',
    cannon: '炮',
    soldier: '卒',
  },
} as const

const INITIAL_PIECES: Record<XiangqiSide, Record<XiangqiPieceKind, number>> = {
  red: {
    general: 1,
    advisor: 2,
    elephant: 2,
    horse: 2,
    rook: 2,
    cannon: 2,
    soldier: 5,
  },
  black: {
    general: 1,
    advisor: 2,
    elephant: 2,
    horse: 2,
    rook: 2,
    cannon: 2,
    soldier: 5,
  },
}

function samePosition(left: XiangqiPosition | null, right: XiangqiPosition | null): boolean {
  return left !== null
    && right !== null
    && left.row === right.row
    && left.col === right.col
}

function positionKey(position: XiangqiPosition): string {
  return `${position.row}:${position.col}`
}

function pieceAt(view: XiangqiGameViewModel, position: XiangqiPosition): XiangqiPiece | null {
  return view.board[position.row]?.[position.col] ?? null
}

function pieceLabel(piece: XiangqiPiece): string {
  return piece.label ?? PIECE_LABELS[piece.side][piece.kind]
}

function joinClasses(...names: Array<string | false | undefined | null>): string {
  return names.filter(Boolean).join(' ')
}

function isMoveEndpoint(move: XiangqiLegalMove | undefined, position: XiangqiPosition): 'from' | 'to' | null {
  if (!move) return null
  if (samePosition(move.from, position)) return 'from'
  if (samePosition(move.to, position)) return 'to'
  return null
}

/** 计算双方已被吃掉的棋子 */
function getCapturedPieces(game: XiangqiGameViewModel): { redLost: XiangqiPieceKind[]; blackLost: XiangqiPieceKind[] } {
  const currentCount: Record<XiangqiSide, Record<XiangqiPieceKind, number>> = {
    red: { general: 0, advisor: 0, elephant: 0, horse: 0, rook: 0, cannon: 0, soldier: 0 },
    black: { general: 0, advisor: 0, elephant: 0, horse: 0, rook: 0, cannon: 0, soldier: 0 },
  }

  for (let r = 0; r < XIANGQI_ROWS; r += 1) {
    for (let c = 0; c < XIANGQI_COLUMNS; c += 1) {
      const piece = game.board[r]?.[c]
      if (piece) {
        currentCount[piece.side][piece.kind] += 1
      }
    }
  }

  const redLost: XiangqiPieceKind[] = []
  const blackLost: XiangqiPieceKind[] = []

  const kinds: XiangqiPieceKind[] = ['rook', 'horse', 'cannon', 'elephant', 'advisor', 'soldier', 'general']
  for (const kind of kinds) {
    const redDiff = INITIAL_PIECES.red[kind] - currentCount.red[kind]
    for (let i = 0; i < redDiff; i += 1) redLost.push(kind)

    const blackDiff = INITIAL_PIECES.black[kind] - currentCount.black[kind]
    for (let i = 0; i < blackDiff; i += 1) blackLost.push(kind)
  }

  return { redLost, blackLost }
}

/** 格式化整局棋谱为文本 */
function exportPgn(moves: readonly XiangqiMoveRecord[]): string {
  if (moves.length === 0) return '尚未落子'
  const lines: string[] = []
  for (let i = 0; i < moves.length; i += 2) {
    const round = Math.floor(i / 2) + 1
    const redMove = moves[i] ? `${moves[i].notation}` : ''
    const blackMove = moves[i + 1] ? `  ${moves[i + 1].notation}` : ''
    lines.push(`${round}. ${redMove}${blackMove}`)
  }
  return lines.join('\n')
}

/** Props for the visible DSH Chinese chess page. */
export interface XiangqiPageProps extends XiangqiPageActions {
  /** Current JSON view model projected by the game/host layer. */
  readonly game: XiangqiGameViewModel
}

/**
 * 现代新国风 9x10 中国象棋主界面
 */
export function XiangqiPage({ game, onMove, onNewGame, onUndo, onResign }: XiangqiPageProps) {
  const [selected, setSelected] = useState<XiangqiPosition | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)
  const moveListEndRef = useRef<HTMLDivElement | null>(null)
  const moveListContainerRef = useRef<HTMLOListElement | null>(null)

  const humanCanMove = game.humanSide === undefined || game.currentTurn === game.humanSide
  const selectedLegalMoves = selected === null
    ? []
    : game.legalMoves.filter(move => samePosition(move.from, selected))

  // 走法列表实时自动滚动到最新一步
  useEffect(() => {
    if (game.moves.length > 0) {
      if (moveListEndRef.current?.scrollIntoView) {
        moveListEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      } else if (moveListContainerRef.current?.scrollTo) {
        moveListContainerRef.current.scrollTo({
          top: moveListContainerRef.current.scrollHeight,
          behavior: 'smooth',
        })
      }
    }
  }, [game.moves.length])

  const invokeAction = (action: () => void | Promise<void>): void => {
    setSelected(null)
    void action()
  }

  const handleCellClick = (position: XiangqiPosition): void => {
    if (game.busy === true || game.status !== 'playing' || !humanCanMove) return

    const legalMove = selectedLegalMoves.find(move => samePosition(move.to, position))
    if (selected !== null && legalMove !== undefined) {
      setSelected(null)
      void onMove({ from: legalMove.from, to: legalMove.to })
      return
    }

    const piece = pieceAt(game, position)
    if (piece?.side === game.currentTurn) {
      setSelected(samePosition(selected, position) ? null : position)
      return
    }

    setSelected(null)
  }

  const handleCopyNotation = async () => {
    const text = exportPgn(game.moves)
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = text
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopySuccess(true)
      setTimeout(() => { setCopySuccess(false) }, 2000)
    } catch {
      // ignore
    }
  }

  const { redLost, blackLost } = getCapturedPieces(game)
  const lastMove = game.moves[game.moves.length - 1]

  // 生成 10行 9列 棋盘格
  const boardCells = []
  for (let row = 0; row < XIANGQI_ROWS; row += 1) {
    for (let col = 0; col < XIANGQI_COLUMNS; col += 1) {
      const position = { row, col }
      const piece = pieceAt(game, position)
      const cellMove = game.lastMove
      const moveEndpoint = isMoveEndpoint(cellMove, position)
      const cellIsSelected = samePosition(selected, position)
      const cellIsLegal = selectedLegalMoves.some(move => samePosition(move.to, position))
      const isCapturable = cellIsLegal && piece !== null
      const isCheckingGeneral = game.inCheck && piece !== null && piece.kind === 'general' && piece.side === game.currentTurn

      const baseCellLabel = piece === null
        ? `第${row + 1}行第${col + 1}列，空位`
        : `第${row + 1}行第${col + 1}列，${SIDE_LABELS[piece.side]}${pieceLabel(piece)}`
      const cellLabel = `${baseCellLabel}${cellIsLegal ? (isCapturable ? '，可吃子' : '，合法落点') : ''}${cellIsSelected ? '，已选中' : ''}`

      boardCells.push(
        <div
          className={joinClasses(
            css.cell,
            cellIsSelected && css.selectedCell,
            cellIsLegal && css.legalCell,
            isCapturable && css.capturableCell,
            moveEndpoint === 'from' && css.lastMoveFromCell,
            moveEndpoint === 'to' && css.lastMoveToCell,
          )}
          key={positionKey(position)}
          role="gridcell"
          aria-label={cellLabel}
          aria-rowindex={row + 1}
          aria-colindex={col + 1}
        >
          <button
            type="button"
            className={css.cellButton}
            aria-label={cellLabel}
            aria-pressed={cellIsSelected}
            data-col={col}
            data-row={row}
            disabled={game.busy === true || game.status !== 'playing' || !humanCanMove}
            onClick={() => { handleCellClick(position) }}
          >
            {piece !== null && (
              <span
                className={joinClasses(
                  css.piece,
                  cellIsSelected && css.pieceSelected,
                  isCheckingGeneral && css.pieceInCheck,
                )}
                data-side={piece.side}
                data-piece-kind={piece.kind}
              >
                <span className={css.pieceInnerRing}>
                  <span className={css.pieceText}>{pieceLabel(piece)}</span>
                </span>
                {isCheckingGeneral && <span className={css.checkBadge}>将军</span>}
              </span>
            )}

            {/* 合法落点指示器 */}
            {cellIsLegal && !isCapturable && <span className={css.legalDot} aria-hidden="true" />}
            {cellIsLegal && isCapturable && (
              <span className={css.captureReticle} aria-hidden="true">
                <span className={css.reticleCornerTopLeft} />
                <span className={css.reticleCornerTopRight} />
                <span className={css.reticleCornerBottomLeft} />
                <span className={css.reticleCornerBottomRight} />
              </span>
            )}

            {/* 上一步落子位置指示框 */}
            {moveEndpoint === 'to' && !cellIsSelected && (
              <span className={css.lastMoveTargetIndicator} aria-hidden="true" />
            )}
          </button>
        </div>,
      )
    }
  }

  return (
    <main className={css.page} aria-labelledby="xiangqi-page-title">
      {/* 顶部标题栏与对局状态 */}
      <header className={css.header}>
        <div className={css.headerMain}>
          <div className={css.badgeRow}>
            <span className={css.gameTag}>DSH 象棋对弈</span>
            <span className={css.versionTag}>标准规则</span>
          </div>
          <h1 className={css.title} id="xiangqi-page-title">楚汉风云 · 象棋对弈</h1>
          <p className={css.subtitle}>与 DSH AI 展开中国象棋博弈，运筹帷幄，决胜千里</p>
        </div>

        <div className={css.turnCard} data-side={game.currentTurn} data-busy={game.busy || undefined}>
          <div className={css.turnVisual}>
            <span className={css.turnAvatar} data-side={game.currentTurn}>
              {game.currentTurn === 'red' ? '帅' : '将'}
            </span>
            <span className={css.turnPulse} />
          </div>
          <div className={css.turnDetails}>
            <span className={css.turnStatusBadge}>
              {game.busy ? 'AI 思考中…' : '落子中'}
            </span>
            <strong className={css.turnPlayer}>
              {game.currentTurn === 'red' ? '红方（您）' : '黑方（AI）'}
            </strong>
          </div>
        </div>
      </header>

      {/* 主工作区 */}
      <div className={css.layout}>
        {/* 左侧：棋盘区域 */}
        <section className={css.boardColumn} aria-labelledby="xiangqi-board-title">
          {/* 棋盘顶栏信息 */}
          <div className={css.sectionHeading}>
            <div className={css.playerStrip}>
              <div className={joinClasses(css.playerCard, game.currentTurn === 'black' && css.playerCardActive)}>
                <span className={css.playerPieceIcon} data-side="black">将</span>
                <div className={css.playerMeta}>
                  <span className={css.playerName}>黑方 · DSH AI</span>
                  <div className={css.lostPieces}>
                    {redLost.map((k, i) => (
                      <span key={`redLost-${i}`} className={css.lostPiece} data-side="red" title={`吃掉红方 ${PIECE_LABELS.red[k]}`}>
                        {PIECE_LABELS.red[k]}
                      </span>
                    ))}
                    {redLost.length === 0 && <span className={css.lostEmpty}>暂无失子</span>}
                  </div>
                </div>
              </div>

              <div className={css.vsDivider}>VS</div>

              <div className={joinClasses(css.playerCard, game.currentTurn === 'red' && css.playerCardActive)}>
                <span className={css.playerPieceIcon} data-side="red">帅</span>
                <div className={css.playerMeta}>
                  <span className={css.playerName}>红方 · 执红先行（执子）</span>
                  <div className={css.lostPieces}>
                    {blackLost.map((k, i) => (
                      <span key={`blackLost-${i}`} className={css.lostPiece} data-side="black" title={`吃掉黑方 ${PIECE_LABELS.black[k]}`}>
                        {PIECE_LABELS.black[k]}
                      </span>
                    ))}
                    {blackLost.length === 0 && <span className={css.lostEmpty}>暂无失子</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 棋盘外框 */}
          <div className={css.boardSurface}>
            {/* 顶部数字标 (黑方视角 1~9) */}
            <div className={css.fileLabelsTop} aria-hidden="true">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(n => (
                <span key={`top-${n}`} className={css.coordLabel}>{n}</span>
              ))}
            </div>

            {/* 核心棋盘网格 */}
            <div
              className={css.boardGrid}
              role="grid"
              aria-label="中国象棋棋盘，9列10行"
              aria-rowcount={XIANGQI_ROWS}
              aria-colcount={XIANGQI_COLUMNS}
            >
              {/* 棋盘背景装饰层：九宫格斜线与十字折角星标 */}
              <svg className={css.boardDecorationSvg} viewBox="0 0 900 1000" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  {/* 十字折角星标模板 */}
                  <g id="star-mark-full">
                    {/* 左上 */}
                    <path d="M -14,-4 L -4,-4 L -4,-14" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    {/* 右上 */}
                    <path d="M 4,-14 L 4,-4 L 14,-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    {/* 左下 */}
                    <path d="M -14,4 L -4,4 L -4,14" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    {/* 右下 */}
                    <path d="M 4,14 L 4,4 L 14,4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </g>
                  <g id="star-mark-left">
                    <path d="M 4,-14 L 4,-4 L 14,-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M 4,14 L 4,4 L 14,4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </g>
                  <g id="star-mark-right">
                    <path d="M -14,-4 L -4,-4 L -4,-14" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M -14,4 L -4,4 L -4,14" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </g>
                </defs>

                {/* 九宫格斜线 (顶九宫 3~5列, 0~2行；底九宫 3~5列, 7~9行) */}
                {/* 坐标计算：col x = 50 + col*100, row y = 50 + row*100 */}
                <line x1="350" y1="50" x2="550" y2="250" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.75" />
                <line x1="550" y1="50" x2="350" y2="250" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.75" />
                <line x1="350" y1="750" x2="550" y2="950" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.75" />
                <line x1="550" y1="750" x2="350" y2="950" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.75" />

                {/* 炮位星标 */}
                {/* 黑炮 (1,2) (7,2) */}
                <use href="#star-mark-full" x="150" y="250" opacity="0.6" />
                <use href="#star-mark-full" x="750" y="250" opacity="0.6" />
                {/* 红炮 (1,7) (7,7) */}
                <use href="#star-mark-full" x="150" y="750" opacity="0.6" />
                <use href="#star-mark-full" x="750" y="750" opacity="0.6" />

                {/* 兵卒位星标 */}
                {/* 黑卒 row 3: col 0, 2, 4, 6, 8 */}
                <use href="#star-mark-left" x="50" y="350" opacity="0.6" />
                <use href="#star-mark-full" x="250" y="350" opacity="0.6" />
                <use href="#star-mark-full" x="450" y="350" opacity="0.6" />
                <use href="#star-mark-full" x="650" y="350" opacity="0.6" />
                <use href="#star-mark-right" x="850" y="350" opacity="0.6" />

                {/* 红兵 row 6: col 0, 2, 4, 6, 8 */}
                <use href="#star-mark-left" x="50" y="650" opacity="0.6" />
                <use href="#star-mark-full" x="250" y="650" opacity="0.6" />
                <use href="#star-mark-full" x="450" y="650" opacity="0.6" />
                <use href="#star-mark-full" x="650" y="650" opacity="0.6" />
                <use href="#star-mark-right" x="850" y="650" opacity="0.6" />
              </svg>

              {/* 楚河汉界 */}
              <div className={css.riverArea} aria-hidden="true">
                <span className={css.riverTextLeft}>楚　河</span>
                <span className={css.riverEmblem}>☯</span>
                <span className={css.riverTextRight}>漢　界</span>
              </div>

              {/* 棋盘各个格点与棋子 */}
              {boardCells}
            </div>

            {/* 底部中文路数标 (红方视角 九~一) */}
            <div className={css.fileLabelsBottom} aria-hidden="true">
              {['九', '八', '七', '六', '五', '四', '三', '二', '一'].map(n => (
                <span key={`bot-${n}`} className={css.coordLabel}>{n}</span>
              ))}
            </div>
          </div>

          {/* 状态与对局提示卡片 */}
          <div className={css.statusCard} role="status" aria-live="polite">
            <div className={css.statusIconWrapper} data-status={game.status}>
              {game.status === 'playing' ? (
                <span className={css.statusPulseDot} />
              ) : (
                <span className={css.statusResultIcon}>🏆</span>
              )}
            </div>
            <div className={css.statusInfo}>
              <strong className={css.statusHeadline}>{game.statusText}</strong>
              <span className={css.statusSubtext}>
                {game.status === 'playing'
                  ? (game.inCheck ? '⚠️ 当前将军，请化解危机！' : (humanCanMove ? '请选择己方棋子并点击绿色/红色落点走子' : 'AI 正在计算最佳应手…'))
                  : '对局已结束，可点击下方【新局】重新开盘'}
              </span>
            </div>
          </div>
        </section>

        {/* 右侧：实时走法列表 & 操作面板 */}
        <aside className={css.sideColumn} aria-label="棋局走法与操作">
          {/* 走法列表面板（核心重点） */}
          <section className={css.panel} aria-labelledby="xiangqi-moves-title">
            <div className={css.panelHeader}>
              <div className={css.panelTitleGroup}>
                <h2 className={css.panelTitle} id="xiangqi-moves-title">实时走法</h2>
                <span className={css.moveBadge}>{game.moves.length} 步</span>
              </div>
              <button
                type="button"
                className={css.copyButton}
                onClick={handleCopyNotation}
                disabled={game.moves.length === 0}
                title="复制整局中文棋谱"
              >
                {copySuccess ? '✓ 已复制' : '复制棋谱'}
              </button>
            </div>

            {/* 最新一手实时快报条 */}
            <div className={css.latestMoveBar}>
              <span className={css.latestLabel}>最新一手</span>
              {lastMove ? (
                <span className={css.latestValue} data-side={lastMove.side}>
                  <strong>{SIDE_LABELS[lastMove.side]}</strong> {lastMove.notation}
                  {lastMove.notation.includes('将军') && <span className={css.checkTag}>⚡将军</span>}
                  {lastMove.notation.includes('将死') && <span className={css.mateTag}>🔥将死</span>}
                </span>
              ) : (
                <span className={css.latestEmpty}>尚未开始，等待红方起手</span>
              )}
            </div>

            {/* 走法记录容器 - 自动置底平滑滚动 */}
            <ol
              ref={moveListContainerRef}
              className={css.moveList}
              aria-label="象棋对弈走法记录"
            >
              {game.moves.length === 0 && (
                <li className={css.emptyMovesState}>
                  <span className={css.emptyMovesIcon}>📜</span>
                  <p className={css.emptyMovesTitle}>棋谱虚席以待</p>
                  <p className={css.emptyMovesHint}>红方先行，落子后此处将实时记录每步着法</p>
                </li>
              )}

              {/* 回合制双列渲染或单步流水列表 */}
              {Array.from({ length: Math.ceil(game.moves.length / 2) }).map((_, roundIndex) => {
                const redMoveIndex = roundIndex * 2
                const blackMoveIndex = redMoveIndex + 1
                const redMove = game.moves[redMoveIndex]
                const blackMove = game.moves[blackMoveIndex]
                const isLatestRound = blackMove ? blackMoveIndex === game.moves.length - 1 : redMoveIndex === game.moves.length - 1

                return (
                  <li
                    key={`round-${roundIndex + 1}`}
                    className={joinClasses(css.roundItem, isLatestRound && css.roundItemLatest)}
                  >
                    <span className={css.roundIndex}>
                      {String(roundIndex + 1).padStart(2, '0')}
                    </span>

                    {/* 红方着法 */}
                    <div
                      className={joinClasses(
                        css.moveBlock,
                        css.redMoveBlock,
                        redMoveIndex === game.moves.length - 1 && css.moveBlockLatest,
                      )}
                    >
                      <span className={css.moveSideIcon} data-side="red">红</span>
                      <span className={css.moveNotationText}>{redMove.notation}</span>
                      {redMoveIndex === game.moves.length - 1 && (
                        <span className={css.latestBadge}>最新</span>
                      )}
                    </div>

                    {/* 黑方着法 */}
                    {blackMove ? (
                      <div
                        className={joinClasses(
                          css.moveBlock,
                          css.blackMoveBlock,
                          blackMoveIndex === game.moves.length - 1 && css.moveBlockLatest,
                        )}
                      >
                        <span className={css.moveSideIcon} data-side="black">黑</span>
                        <span className={css.moveNotationText}>{blackMove.notation}</span>
                        {blackMoveIndex === game.moves.length - 1 && (
                          <span className={css.latestBadge}>最新</span>
                        )}
                      </div>
                    ) : (
                      <div className={joinClasses(css.moveBlock, css.pendingMoveBlock)}>
                        <span className={css.pendingDot}>…</span>
                      </div>
                    )}
                  </li>
                )
              })}
              <div ref={moveListEndRef} style={{ height: '1px' }} />
            </ol>
          </section>

          {/* 棋局操作控制面板 */}
          <section className={css.panel} aria-labelledby="xiangqi-actions-title">
            <h2 className={css.panelTitle} id="xiangqi-actions-title">棋局操作</h2>
            <div className={css.actionsGrid}>
              <button
                type="button"
                className={css.actionNewGame}
                disabled={game.busy === true}
                onClick={() => { invokeAction(onNewGame) }}
              >
                <span className={css.btnIcon}>🔄</span>
                <span>新局</span>
              </button>

              <button
                type="button"
                className={css.actionUndo}
                disabled={game.busy === true || game.moves.length === 0}
                onClick={() => { invokeAction(onUndo) }}
                title="撤销上一步落子"
              >
                <span className={css.btnIcon}>↩️</span>
                <span>悔棋</span>
              </button>

              <button
                type="button"
                className={css.actionResign}
                disabled={game.busy === true || game.status !== 'playing'}
                onClick={() => { invokeAction(onResign) }}
                title="向对方认输结束本局"
              >
                <span className={css.btnIcon}>🏳️</span>
                <span>认输</span>
              </button>
            </div>
          </section>
        </aside>
      </div>
    </main>
  )
}

/** Backwards-compatible board name for slot adapters that call the surface a board. */
export const XiangqiBoard = XiangqiPage
