/** DSH Host service: per-session Chinese chess state, Remote methods, tool, and projection. */
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import { createXiangqiGameFactory } from "./game-adapter.js";
import { createXiangqiRuntimeTool } from "./runtime-tool.js";
import { XiangqiError, XiangqiHostService } from "./service.js";
import { registerXiangqiSessionEventType } from "../domain.js";
import { applyXiangqiProjection, viewXiangqiProjection, xiangqiProjectionSchema } from "../projection.js";
// Must run while the Host bundle is being loaded, before a persisted session
// is adopted by the persistence coordinator.
registerXiangqiSessionEventType();
function asSessionEvent(event) {
    return event.type === 'xiangqi/change';
}
function lastProjection(session) {
    let state = null;
    for (const event of session.events) {
        if (asSessionEvent(event))
            state = event.data.state;
    }
    return state;
}
function requireGameId(value) {
    if (value === undefined || value.trim().length === 0) {
        throw new XiangqiError('GAME_NOT_FOUND', 'no Chinese chess game exists in this session; call new_game first');
    }
    return value.trim();
}
/**
 * Host-side service loaded by the bundle patch. Every Remote method starts
 * with Agent so Typert maps the client SessionId to the exact live agent.
 */
let XiangqiService = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _newGame_decorators;
    let _get_decorators;
    let _move_decorators;
    let _undo_decorators;
    let _resign_decorators;
    return class XiangqiService extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _newGame_decorators = [Remote('newGame')];
            _get_decorators = [Remote('get')];
            _move_decorators = [Remote('move')];
            _undo_decorators = [Remote('undo')];
            _resign_decorators = [Remote('resign')];
            __esDecorate(this, null, _newGame_decorators, { kind: "method", name: "newGame", static: false, private: false, access: { has: obj => "newGame" in obj, get: obj => obj.newGame }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _get_decorators, { kind: "method", name: "get", static: false, private: false, access: { has: obj => "get" in obj, get: obj => obj.get }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _move_decorators, { kind: "method", name: "move", static: false, private: false, access: { has: obj => "move" in obj, get: obj => obj.move }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _undo_decorators, { kind: "method", name: "undo", static: false, private: false, access: { has: obj => "undo" in obj, get: obj => obj.undo }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _resign_decorators, { kind: "method", name: "resign", static: false, private: false, access: { has: obj => "resign" in obj, get: obj => obj.resign }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static inject = ['agents', 'tools'];
        games = (__runInitializers(this, _instanceExtraInitializers), new WeakMap());
        constructor(ctx) {
            super(ctx, 'xiangqi');
            ctx.inject(['sessionProjections'], (projectionCtx) => {
                projectionCtx.sessionProjections.register({
                    key: 'xiangqi',
                    schema: xiangqiProjectionSchema,
                    init: () => null,
                    apply: applyXiangqiProjection,
                    view: viewXiangqiProjection,
                    stateVersion: 1,
                });
            });
            ctx.tools.register(createXiangqiRuntimeTool(this));
        }
        /** Start one new game owned by the calling DSH session. */
        newGame(agent, _request) {
            const game = this.gameFor(agent);
            return game.service.newGame({ sessionId: String(agent.id) });
        }
        /** Read the requested game, or the session's latest game when omitted. */
        get(agent, gameId) {
            const game = this.gameFor(agent);
            return game.service.get(requireGameId(gameId ?? game.currentGameId));
        }
        /** Apply one revision-fenced move. */
        move(agent, request) {
            return this.gameFor(agent).service.move(request);
        }
        /** Undo one committed move. */
        undo(agent, request) {
            return this.gameFor(agent).service.undo(request);
        }
        /** Mark one side as resigned. */
        resign(agent, request) {
            return this.gameFor(agent).service.resign(request);
        }
        /** Execute the model tool against the exact agent owning the current turn. */
        executeTool(agent, args) {
            const game = this.gameFor(agent);
            const normalized = args.action === 'new_game'
                ? { ...args, session_id: String(agent.id) }
                : args;
            // Reuse the dependency-free command parser so the model boundary and the
            // Host Remote boundary reject the same malformed field combinations.
            return this.executeParsedTool(game.service, normalized);
        }
        executeParsedTool(service, args) {
            switch (args.action) {
                case 'new_game': {
                    const state = args.session_id === undefined
                        ? service.newGame({})
                        : service.newGame({ sessionId: args.session_id });
                    return { ok: true, action: args.action, state, message: 'New Chinese chess game created.' };
                }
                case 'get': {
                    const state = service.get(requireGameId(args.game_id));
                    return { ok: true, action: args.action, state, message: 'Current Chinese chess state.' };
                }
                case 'move': {
                    if (args.game_id === undefined || args.revision === undefined || args.from === undefined || args.to === undefined) {
                        throw new XiangqiError('INVALID_INPUT', 'move requires game_id, revision, from, and to');
                    }
                    const state = service.move({
                        gameId: args.game_id,
                        revision: args.revision,
                        move: { from: args.from, to: args.to },
                    });
                    return { ok: true, action: args.action, state, message: 'Move committed.' };
                }
                case 'undo': {
                    if (args.game_id === undefined || args.revision === undefined) {
                        throw new XiangqiError('INVALID_INPUT', 'undo requires game_id and revision');
                    }
                    const state = service.undo({ gameId: args.game_id, revision: args.revision });
                    return { ok: true, action: args.action, state, message: 'Last committed move undone.' };
                }
                case 'resign': {
                    if (args.game_id === undefined || args.revision === undefined || args.side === undefined) {
                        throw new XiangqiError('INVALID_INPUT', 'resign requires game_id, revision, and side');
                    }
                    const state = service.resign({ gameId: args.game_id, revision: args.revision, side: args.side });
                    return { ok: true, action: args.action, state, message: 'Resignation committed.' };
                }
            }
            throw new XiangqiError('INVALID_INPUT', `unsupported action: ${String(args.action)}`);
        }
        gameFor(agent) {
            if (this.ctx.agents.get(agent.id) !== agent) {
                throw new XiangqiError('INVALID_INPUT', 'the calling DSH agent is no longer live');
            }
            const session = agent.session;
            const existing = this.games.get(session);
            if (existing !== undefined)
                return existing;
            const service = new XiangqiHostService(createXiangqiGameFactory());
            const restored = lastProjection(session);
            const game = { service };
            if (restored !== null) {
                service.restore(restored);
                game.currentGameId = restored.gameId;
            }
            service.subscribe((change) => {
                game.currentGameId = change.state.gameId;
                session.append('xiangqi/change', change);
            });
            this.games.set(session, game);
            return game;
        }
    };
})();
export { XiangqiService };
export default XiangqiService;
//# sourceMappingURL=dsh-service.js.map