import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import css from './XiangqiSlots.module.css';
export function XiangqiSidebarAction({ wide, actions }) {
    return (_jsx("div", { className: css.sidebarAction, "data-xiangqi-sidebar-action": true, children: _jsxs("button", { type: "button", className: css.sidebarButton, "aria-label": "\u4E0B\u76D8\u8C61\u68CB", title: "\u4E0B\u76D8\u8C61\u68CB", onClick: () => { actions.open(); }, children: [_jsx("span", { className: css.sidebarGlyph, "aria-hidden": "true", children: "\u8C61" }), wide && _jsx("span", { className: css.sidebarLabel, children: "\u4E0B\u76D8\u8C61\u68CB" })] }) }));
}
//# sourceMappingURL=SidebarAction.js.map