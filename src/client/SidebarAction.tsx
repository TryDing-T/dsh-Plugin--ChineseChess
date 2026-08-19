/** Sidebar entry that opens the independent Chinese chess surface. */

import type { PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import { createXiangqiStore } from './store.ts'
import css from './XiangqiSlots.module.css'

export type XiangqiSidebarActionProps =
  PropsRuntime<'sidebar.footer.action'>
  & PropsStore<ReturnType<typeof createXiangqiStore>>

export function XiangqiSidebarAction({ wide, actions }: XiangqiSidebarActionProps) {
  return (
    <div className={css.sidebarAction} data-xiangqi-sidebar-action>
      <button
        type="button"
        className={css.sidebarButton}
        aria-label="下盘象棋"
        title="下盘象棋"
        onClick={() => { actions.open() }}
      >
        <span className={css.sidebarGlyph} aria-hidden="true">象</span>
        {wide && <span className={css.sidebarLabel}>下盘象棋</span>}
      </button>
    </div>
  )
}
