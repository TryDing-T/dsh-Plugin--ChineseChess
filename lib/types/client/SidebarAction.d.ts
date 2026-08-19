/** Sidebar entry that opens the independent Chinese chess surface. */
import type { PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots';
import { createXiangqiStore } from './store.ts';
export type XiangqiSidebarActionProps = PropsRuntime<'sidebar.footer.action'> & PropsStore<ReturnType<typeof createXiangqiStore>>;
export declare function XiangqiSidebarAction({ wide, actions }: XiangqiSidebarActionProps): import("react").JSX.Element;
//# sourceMappingURL=SidebarAction.d.ts.map