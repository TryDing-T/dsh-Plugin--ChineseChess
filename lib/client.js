window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-plugin-xiangqi",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_runtime_client = require("@deepseek-ai/dsh-client-runtime/client");
		//#region ../../DSHarness/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/core.js
		var _a$1;
		function $constructor(name, initializer, params) {
			function init(inst, def) {
				if (!inst._zod) Object.defineProperty(inst, "_zod", {
					value: {
						def,
						constr: _,
						traits: /* @__PURE__ */ new Set()
					},
					enumerable: false
				});
				if (inst._zod.traits.has(name)) return;
				inst._zod.traits.add(name);
				initializer(inst, def);
				const proto = _.prototype;
				const keys = Object.keys(proto);
				for (let i = 0; i < keys.length; i++) {
					const k = keys[i];
					if (!(k in inst)) inst[k] = proto[k].bind(inst);
				}
			}
			const Parent = params?.Parent ?? Object;
			class Definition extends Parent {}
			Object.defineProperty(Definition, "name", { value: name });
			function _(def) {
				var _a;
				const inst = params?.Parent ? new Definition() : this;
				init(inst, def);
				(_a = inst._zod).deferred ?? (_a.deferred = []);
				for (const fn of inst._zod.deferred) fn();
				return inst;
			}
			Object.defineProperty(_, "init", { value: init });
			Object.defineProperty(_, Symbol.hasInstance, { value: (inst) => {
				if (params?.Parent && inst instanceof params.Parent) return true;
				return inst?._zod?.traits?.has(name);
			} });
			Object.defineProperty(_, "name", { value: name });
			return _;
		}
		var $ZodAsyncError = class extends Error {
			constructor() {
				super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
			}
		};
		var $ZodEncodeError = class extends Error {
			constructor(name) {
				super(`Encountered unidirectional transform during encode: ${name}`);
				this.name = "ZodEncodeError";
			}
		};
		(_a$1 = globalThis).__zod_globalConfig ?? (_a$1.__zod_globalConfig = {});
		const globalConfig = globalThis.__zod_globalConfig;
		function config(newConfig) {
			if (newConfig) Object.assign(globalConfig, newConfig);
			return globalConfig;
		}
		//#endregion
		//#region ../../DSHarness/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/util.js
		function getEnumValues(entries) {
			const numericValues = Object.values(entries).filter((v) => typeof v === "number");
			return Object.entries(entries).filter(([k, _]) => numericValues.indexOf(+k) === -1).map(([_, v]) => v);
		}
		function jsonStringifyReplacer(_, value) {
			if (typeof value === "bigint") return value.toString();
			return value;
		}
		function cached(getter) {
			return { get value() {
				{
					const value = getter();
					Object.defineProperty(this, "value", { value });
					return value;
				}
				throw new Error("cached value already set");
			} };
		}
		function nullish(input) {
			return input === null || input === void 0;
		}
		function cleanRegex(source) {
			const start = source.startsWith("^") ? 1 : 0;
			const end = source.endsWith("$") ? source.length - 1 : source.length;
			return source.slice(start, end);
		}
		function floatSafeRemainder(val, step) {
			const ratio = val / step;
			const roundedRatio = Math.round(ratio);
			const tolerance = Number.EPSILON * Math.max(Math.abs(ratio), 1);
			if (Math.abs(ratio - roundedRatio) < tolerance) return 0;
			return ratio - roundedRatio;
		}
		const EVALUATING = /* @__PURE__*/ Symbol("evaluating");
		function defineLazy(object, key, getter) {
			let value = void 0;
			Object.defineProperty(object, key, {
				get() {
					if (value === EVALUATING) return;
					if (value === void 0) {
						value = EVALUATING;
						value = getter();
					}
					return value;
				},
				set(v) {
					Object.defineProperty(object, key, { value: v });
				},
				configurable: true
			});
		}
		function assignProp(target, prop, value) {
			Object.defineProperty(target, prop, {
				value,
				writable: true,
				enumerable: true,
				configurable: true
			});
		}
		function mergeDefs(...defs) {
			const mergedDescriptors = {};
			for (const def of defs) Object.assign(mergedDescriptors, Object.getOwnPropertyDescriptors(def));
			return Object.defineProperties({}, mergedDescriptors);
		}
		function esc(str) {
			return JSON.stringify(str);
		}
		function slugify(input) {
			return input.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
		}
		const captureStackTrace = "captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => {};
		function isObject(data) {
			return typeof data === "object" && data !== null && !Array.isArray(data);
		}
		const allowsEval = /* @__PURE__*/ cached(() => {
			if (globalConfig.jitless) return false;
			if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) return false;
			try {
				new Function("");
				return true;
			} catch (_) {
				return false;
			}
		});
		function isPlainObject(o) {
			if (isObject(o) === false) return false;
			const ctor = o.constructor;
			if (ctor === void 0) return true;
			if (typeof ctor !== "function") return true;
			const prot = ctor.prototype;
			if (isObject(prot) === false) return false;
			if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) return false;
			return true;
		}
		function shallowClone(o) {
			if (isPlainObject(o)) return { ...o };
			if (Array.isArray(o)) return [...o];
			if (o instanceof Map) return new Map(o);
			if (o instanceof Set) return new Set(o);
			return o;
		}
		const propertyKeyTypes = /* @__PURE__*/ new Set([
			"string",
			"number",
			"symbol"
		]);
		function escapeRegex(str) {
			return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		}
		function clone(inst, def, params) {
			const cl = new inst._zod.constr(def ?? inst._zod.def);
			if (!def || params?.parent) cl._zod.parent = inst;
			return cl;
		}
		function normalizeParams(_params) {
			const params = _params;
			if (!params) return {};
			if (typeof params === "string") return { error: () => params };
			if (params?.message !== void 0) {
				if (params?.error !== void 0) throw new Error("Cannot specify both `message` and `error` params");
				params.error = params.message;
			}
			delete params.message;
			if (typeof params.error === "string") return {
				...params,
				error: () => params.error
			};
			return params;
		}
		function optionalKeys(shape) {
			return Object.keys(shape).filter((k) => {
				return shape[k]._zod.optin === "optional" && shape[k]._zod.optout === "optional";
			});
		}
		const NUMBER_FORMAT_RANGES = {
			safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
			int32: [-2147483648, 2147483647],
			uint32: [0, 4294967295],
			float32: [-34028234663852886e22, 34028234663852886e22],
			float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
		};
		function pick(schema, mask) {
			const currDef = schema._zod.def;
			const checks = currDef.checks;
			if (checks && checks.length > 0) throw new Error(".pick() cannot be used on object schemas containing refinements");
			return clone(schema, mergeDefs(schema._zod.def, {
				get shape() {
					const newShape = {};
					for (const key in mask) {
						if (!(key in currDef.shape)) throw new Error(`Unrecognized key: "${key}"`);
						if (!mask[key]) continue;
						newShape[key] = currDef.shape[key];
					}
					assignProp(this, "shape", newShape);
					return newShape;
				},
				checks: []
			}));
		}
		function omit(schema, mask) {
			const currDef = schema._zod.def;
			const checks = currDef.checks;
			if (checks && checks.length > 0) throw new Error(".omit() cannot be used on object schemas containing refinements");
			return clone(schema, mergeDefs(schema._zod.def, {
				get shape() {
					const newShape = { ...schema._zod.def.shape };
					for (const key in mask) {
						if (!(key in currDef.shape)) throw new Error(`Unrecognized key: "${key}"`);
						if (!mask[key]) continue;
						delete newShape[key];
					}
					assignProp(this, "shape", newShape);
					return newShape;
				},
				checks: []
			}));
		}
		function extend(schema, shape) {
			if (!isPlainObject(shape)) throw new Error("Invalid input to extend: expected a plain object");
			const checks = schema._zod.def.checks;
			if (checks && checks.length > 0) {
				const existingShape = schema._zod.def.shape;
				for (const key in shape) if (Object.getOwnPropertyDescriptor(existingShape, key) !== void 0) throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
			}
			return clone(schema, mergeDefs(schema._zod.def, { get shape() {
				const _shape = {
					...schema._zod.def.shape,
					...shape
				};
				assignProp(this, "shape", _shape);
				return _shape;
			} }));
		}
		function safeExtend(schema, shape) {
			if (!isPlainObject(shape)) throw new Error("Invalid input to safeExtend: expected a plain object");
			return clone(schema, mergeDefs(schema._zod.def, { get shape() {
				const _shape = {
					...schema._zod.def.shape,
					...shape
				};
				assignProp(this, "shape", _shape);
				return _shape;
			} }));
		}
		function merge(a, b) {
			if (a._zod.def.checks?.length) throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
			return clone(a, mergeDefs(a._zod.def, {
				get shape() {
					const _shape = {
						...a._zod.def.shape,
						...b._zod.def.shape
					};
					assignProp(this, "shape", _shape);
					return _shape;
				},
				get catchall() {
					return b._zod.def.catchall;
				},
				checks: b._zod.def.checks ?? []
			}));
		}
		function partial(Class, schema, mask) {
			const checks = schema._zod.def.checks;
			if (checks && checks.length > 0) throw new Error(".partial() cannot be used on object schemas containing refinements");
			return clone(schema, mergeDefs(schema._zod.def, {
				get shape() {
					const oldShape = schema._zod.def.shape;
					const shape = { ...oldShape };
					if (mask) for (const key in mask) {
						if (!(key in oldShape)) throw new Error(`Unrecognized key: "${key}"`);
						if (!mask[key]) continue;
						shape[key] = Class ? new Class({
							type: "optional",
							innerType: oldShape[key]
						}) : oldShape[key];
					}
					else for (const key in oldShape) shape[key] = Class ? new Class({
						type: "optional",
						innerType: oldShape[key]
					}) : oldShape[key];
					assignProp(this, "shape", shape);
					return shape;
				},
				checks: []
			}));
		}
		function required(Class, schema, mask) {
			return clone(schema, mergeDefs(schema._zod.def, { get shape() {
				const oldShape = schema._zod.def.shape;
				const shape = { ...oldShape };
				if (mask) for (const key in mask) {
					if (!(key in shape)) throw new Error(`Unrecognized key: "${key}"`);
					if (!mask[key]) continue;
					shape[key] = new Class({
						type: "nonoptional",
						innerType: oldShape[key]
					});
				}
				else for (const key in oldShape) shape[key] = new Class({
					type: "nonoptional",
					innerType: oldShape[key]
				});
				assignProp(this, "shape", shape);
				return shape;
			} }));
		}
		function aborted(x, startIndex = 0) {
			if (x.aborted === true) return true;
			for (let i = startIndex; i < x.issues.length; i++) if (x.issues[i]?.continue !== true) return true;
			return false;
		}
		function explicitlyAborted(x, startIndex = 0) {
			if (x.aborted === true) return true;
			for (let i = startIndex; i < x.issues.length; i++) if (x.issues[i]?.continue === false) return true;
			return false;
		}
		function prefixIssues(path, issues) {
			return issues.map((iss) => {
				var _a;
				(_a = iss).path ?? (_a.path = []);
				iss.path.unshift(path);
				return iss;
			});
		}
		function unwrapMessage(message) {
			return typeof message === "string" ? message : message?.message;
		}
		function finalizeIssue(iss, ctx, config) {
			const message = iss.message ? iss.message : unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ?? unwrapMessage(ctx?.error?.(iss)) ?? unwrapMessage(config.customError?.(iss)) ?? unwrapMessage(config.localeError?.(iss)) ?? "Invalid input";
			const { inst: _inst, continue: _continue, input: _input, ...rest } = iss;
			rest.path ?? (rest.path = []);
			rest.message = message;
			if (ctx?.reportInput) rest.input = _input;
			return rest;
		}
		function getLengthableOrigin(input) {
			if (Array.isArray(input)) return "array";
			if (typeof input === "string") return "string";
			return "unknown";
		}
		function issue(...args) {
			const [iss, input, inst] = args;
			if (typeof iss === "string") return {
				message: iss,
				code: "custom",
				input,
				inst
			};
			return { ...iss };
		}
		//#endregion
		//#region ../../DSHarness/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/errors.js
		const initializer$1 = (inst, def) => {
			inst.name = "$ZodError";
			Object.defineProperty(inst, "_zod", {
				value: inst._zod,
				enumerable: false
			});
			Object.defineProperty(inst, "issues", {
				value: def,
				enumerable: false
			});
			inst.message = JSON.stringify(def, jsonStringifyReplacer, 2);
			Object.defineProperty(inst, "toString", {
				value: () => inst.message,
				enumerable: false
			});
		};
		const $ZodError = $constructor("$ZodError", initializer$1);
		const $ZodRealError = $constructor("$ZodError", initializer$1, { Parent: Error });
		function flattenError(error, mapper = (issue) => issue.message) {
			const fieldErrors = {};
			const formErrors = [];
			for (const sub of error.issues) if (sub.path.length > 0) {
				fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
				fieldErrors[sub.path[0]].push(mapper(sub));
			} else formErrors.push(mapper(sub));
			return {
				formErrors,
				fieldErrors
			};
		}
		function formatError(error, mapper = (issue) => issue.message) {
			const fieldErrors = { _errors: [] };
			const processError = (error, path = []) => {
				for (const issue of error.issues) if (issue.code === "invalid_union" && issue.errors.length) issue.errors.map((issues) => processError({ issues }, [...path, ...issue.path]));
				else if (issue.code === "invalid_key") processError({ issues: issue.issues }, [...path, ...issue.path]);
				else if (issue.code === "invalid_element") processError({ issues: issue.issues }, [...path, ...issue.path]);
				else {
					const fullpath = [...path, ...issue.path];
					if (fullpath.length === 0) fieldErrors._errors.push(mapper(issue));
					else {
						let curr = fieldErrors;
						let i = 0;
						while (i < fullpath.length) {
							const el = fullpath[i];
							if (!(i === fullpath.length - 1)) curr[el] = curr[el] || { _errors: [] };
							else {
								curr[el] = curr[el] || { _errors: [] };
								curr[el]._errors.push(mapper(issue));
							}
							curr = curr[el];
							i++;
						}
					}
				}
			};
			processError(error);
			return fieldErrors;
		}
		//#endregion
		//#region ../../DSHarness/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/parse.js
		const _parse = (_Err) => (schema, value, _ctx, _params) => {
			const ctx = _ctx ? {
				..._ctx,
				async: false
			} : { async: false };
			const result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) throw new $ZodAsyncError();
			if (result.issues.length) {
				const e = new ((_params?.Err) ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
				captureStackTrace(e, _params?.callee);
				throw e;
			}
			return result.value;
		};
		const _parseAsync = (_Err) => async (schema, value, _ctx, params) => {
			const ctx = _ctx ? {
				..._ctx,
				async: true
			} : { async: true };
			let result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) result = await result;
			if (result.issues.length) {
				const e = new ((params?.Err) ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
				captureStackTrace(e, params?.callee);
				throw e;
			}
			return result.value;
		};
		const _safeParse = (_Err) => (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				async: false
			} : { async: false };
			const result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) throw new $ZodAsyncError();
			return result.issues.length ? {
				success: false,
				error: new (_Err ?? $ZodError)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
			} : {
				success: true,
				data: result.value
			};
		};
		const safeParse$1 = /* @__PURE__*/ _safeParse($ZodRealError);
		const _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				async: true
			} : { async: true };
			let result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) result = await result;
			return result.issues.length ? {
				success: false,
				error: new _Err(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
			} : {
				success: true,
				data: result.value
			};
		};
		const safeParseAsync$1 = /* @__PURE__*/ _safeParseAsync($ZodRealError);
		const _encode = (_Err) => (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _parse(_Err)(schema, value, ctx);
		};
		const _decode = (_Err) => (schema, value, _ctx) => {
			return _parse(_Err)(schema, value, _ctx);
		};
		const _encodeAsync = (_Err) => async (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _parseAsync(_Err)(schema, value, ctx);
		};
		const _decodeAsync = (_Err) => async (schema, value, _ctx) => {
			return _parseAsync(_Err)(schema, value, _ctx);
		};
		const _safeEncode = (_Err) => (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _safeParse(_Err)(schema, value, ctx);
		};
		const _safeDecode = (_Err) => (schema, value, _ctx) => {
			return _safeParse(_Err)(schema, value, _ctx);
		};
		const _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _safeParseAsync(_Err)(schema, value, ctx);
		};
		const _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
			return _safeParseAsync(_Err)(schema, value, _ctx);
		};
		//#endregion
		//#region ../../DSHarness/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/regexes.js
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link cuid2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		const cuid = /^[cC][0-9a-z]{6,}$/;
		const cuid2 = /^[0-9a-z]+$/;
		const ulid = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/;
		const xid = /^[0-9a-vA-V]{20}$/;
		const ksuid = /^[A-Za-z0-9]{27}$/;
		const nanoid = /^[a-zA-Z0-9_-]{21}$/;
		/** ISO 8601-1 duration regex. Does not support the 8601-2 extensions like negative durations or fractional/negative components. */
		const duration$1 = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
		/** A regex for any UUID-like identifier: 8-4-4-4-12 hex pattern */
		const guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
		/** Returns a regex for validating an RFC 9562/4122 UUID.
		*
		* @param version Optionally specify a version 1-8. If no version is specified, all versions are supported. */
		const uuid = (version) => {
			if (!version) return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
			return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
		};
		/** Practical email validation */
		const email = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
		const _emoji$1 = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
		function emoji() {
			return new RegExp(_emoji$1, "u");
		}
		const ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
		const ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
		const cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
		const cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
		const base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
		const base64url = /^[A-Za-z0-9_-]*$/;
		const httpProtocol = /^https?$/;
		const e164 = /^\+[1-9]\d{6,14}$/;
		const dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
		const date$1 = /*@__PURE__*/ new RegExp(`^${dateSource}$`);
		function timeSource(args) {
			const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
			return typeof args.precision === "number" ? args.precision === -1 ? `${hhmm}` : args.precision === 0 ? `${hhmm}:[0-5]\\d` : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}` : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
		}
		function time$1(args) {
			return new RegExp(`^${timeSource(args)}$`);
		}
		function datetime$1(args) {
			const time = timeSource({ precision: args.precision });
			const opts = ["Z"];
			if (args.local) opts.push("");
			if (args.offset) opts.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);
			const timeRegex = `${time}(?:${opts.join("|")})`;
			return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
		}
		const string$1 = (params) => {
			const regex = params ? `[\\s\\S]{${params?.minimum ?? 0},${params?.maximum ?? ""}}` : `[\\s\\S]*`;
			return new RegExp(`^${regex}$`);
		};
		const integer = /^-?\d+$/;
		const number$1 = /^-?\d+(?:\.\d+)?$/;
		const _undefined$2 = /^undefined$/i;
		const lowercase = /^[^A-Z]*$/;
		const uppercase = /^[^a-z]*$/;
		//#endregion
		//#region ../../DSHarness/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/checks.js
		const $ZodCheck = /*@__PURE__*/ $constructor("$ZodCheck", (inst, def) => {
			var _a;
			inst._zod ?? (inst._zod = {});
			inst._zod.def = def;
			(_a = inst._zod).onattach ?? (_a.onattach = []);
		});
		const numericOriginMap = {
			number: "number",
			bigint: "bigint",
			object: "date"
		};
		const $ZodCheckLessThan = /*@__PURE__*/ $constructor("$ZodCheckLessThan", (inst, def) => {
			$ZodCheck.init(inst, def);
			const origin = numericOriginMap[typeof def.value];
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				const curr = (def.inclusive ? bag.maximum : bag.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
				if (def.value < curr) if (def.inclusive) bag.maximum = def.value;
				else bag.exclusiveMaximum = def.value;
			});
			inst._zod.check = (payload) => {
				if (def.inclusive ? payload.value <= def.value : payload.value < def.value) return;
				payload.issues.push({
					origin,
					code: "too_big",
					maximum: typeof def.value === "object" ? def.value.getTime() : def.value,
					input: payload.value,
					inclusive: def.inclusive,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckGreaterThan = /*@__PURE__*/ $constructor("$ZodCheckGreaterThan", (inst, def) => {
			$ZodCheck.init(inst, def);
			const origin = numericOriginMap[typeof def.value];
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				const curr = (def.inclusive ? bag.minimum : bag.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
				if (def.value > curr) if (def.inclusive) bag.minimum = def.value;
				else bag.exclusiveMinimum = def.value;
			});
			inst._zod.check = (payload) => {
				if (def.inclusive ? payload.value >= def.value : payload.value > def.value) return;
				payload.issues.push({
					origin,
					code: "too_small",
					minimum: typeof def.value === "object" ? def.value.getTime() : def.value,
					input: payload.value,
					inclusive: def.inclusive,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckMultipleOf = /*@__PURE__*/ $constructor("$ZodCheckMultipleOf", (inst, def) => {
			$ZodCheck.init(inst, def);
			inst._zod.onattach.push((inst) => {
				var _a;
				(_a = inst._zod.bag).multipleOf ?? (_a.multipleOf = def.value);
			});
			inst._zod.check = (payload) => {
				if (typeof payload.value !== typeof def.value) throw new Error("Cannot mix number and bigint in multiple_of check.");
				if (typeof payload.value === "bigint" ? payload.value % def.value === BigInt(0) : floatSafeRemainder(payload.value, def.value) === 0) return;
				payload.issues.push({
					origin: typeof payload.value,
					code: "not_multiple_of",
					divisor: def.value,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckNumberFormat = /*@__PURE__*/ $constructor("$ZodCheckNumberFormat", (inst, def) => {
			$ZodCheck.init(inst, def);
			def.format = def.format || "float64";
			const isInt = def.format?.includes("int");
			const origin = isInt ? "int" : "number";
			const [minimum, maximum] = NUMBER_FORMAT_RANGES[def.format];
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.format = def.format;
				bag.minimum = minimum;
				bag.maximum = maximum;
				if (isInt) bag.pattern = integer;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				if (isInt) {
					if (!Number.isInteger(input)) {
						payload.issues.push({
							expected: origin,
							format: def.format,
							code: "invalid_type",
							continue: false,
							input,
							inst
						});
						return;
					}
					if (!Number.isSafeInteger(input)) {
						if (input > 0) payload.issues.push({
							input,
							code: "too_big",
							maximum: Number.MAX_SAFE_INTEGER,
							note: "Integers must be within the safe integer range.",
							inst,
							origin,
							inclusive: true,
							continue: !def.abort
						});
						else payload.issues.push({
							input,
							code: "too_small",
							minimum: Number.MIN_SAFE_INTEGER,
							note: "Integers must be within the safe integer range.",
							inst,
							origin,
							inclusive: true,
							continue: !def.abort
						});
						return;
					}
				}
				if (input < minimum) payload.issues.push({
					origin: "number",
					input,
					code: "too_small",
					minimum,
					inclusive: true,
					inst,
					continue: !def.abort
				});
				if (input > maximum) payload.issues.push({
					origin: "number",
					input,
					code: "too_big",
					maximum,
					inclusive: true,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckMaxLength = /*@__PURE__*/ $constructor("$ZodCheckMaxLength", (inst, def) => {
			var _a;
			$ZodCheck.init(inst, def);
			(_a = inst._zod.def).when ?? (_a.when = (payload) => {
				const val = payload.value;
				return !nullish(val) && val.length !== void 0;
			});
			inst._zod.onattach.push((inst) => {
				const curr = inst._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
				if (def.maximum < curr) inst._zod.bag.maximum = def.maximum;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				if (input.length <= def.maximum) return;
				const origin = getLengthableOrigin(input);
				payload.issues.push({
					origin,
					code: "too_big",
					maximum: def.maximum,
					inclusive: true,
					input,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckMinLength = /*@__PURE__*/ $constructor("$ZodCheckMinLength", (inst, def) => {
			var _a;
			$ZodCheck.init(inst, def);
			(_a = inst._zod.def).when ?? (_a.when = (payload) => {
				const val = payload.value;
				return !nullish(val) && val.length !== void 0;
			});
			inst._zod.onattach.push((inst) => {
				const curr = inst._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
				if (def.minimum > curr) inst._zod.bag.minimum = def.minimum;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				if (input.length >= def.minimum) return;
				const origin = getLengthableOrigin(input);
				payload.issues.push({
					origin,
					code: "too_small",
					minimum: def.minimum,
					inclusive: true,
					input,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckLengthEquals = /*@__PURE__*/ $constructor("$ZodCheckLengthEquals", (inst, def) => {
			var _a;
			$ZodCheck.init(inst, def);
			(_a = inst._zod.def).when ?? (_a.when = (payload) => {
				const val = payload.value;
				return !nullish(val) && val.length !== void 0;
			});
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.minimum = def.length;
				bag.maximum = def.length;
				bag.length = def.length;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				const length = input.length;
				if (length === def.length) return;
				const origin = getLengthableOrigin(input);
				const tooBig = length > def.length;
				payload.issues.push({
					origin,
					...tooBig ? {
						code: "too_big",
						maximum: def.length
					} : {
						code: "too_small",
						minimum: def.length
					},
					inclusive: true,
					exact: true,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckStringFormat = /*@__PURE__*/ $constructor("$ZodCheckStringFormat", (inst, def) => {
			var _a, _b;
			$ZodCheck.init(inst, def);
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.format = def.format;
				if (def.pattern) {
					bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
					bag.patterns.add(def.pattern);
				}
			});
			if (def.pattern) (_a = inst._zod).check ?? (_a.check = (payload) => {
				def.pattern.lastIndex = 0;
				if (def.pattern.test(payload.value)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: def.format,
					input: payload.value,
					...def.pattern ? { pattern: def.pattern.toString() } : {},
					inst,
					continue: !def.abort
				});
			});
			else (_b = inst._zod).check ?? (_b.check = () => {});
		});
		const $ZodCheckRegex = /*@__PURE__*/ $constructor("$ZodCheckRegex", (inst, def) => {
			$ZodCheckStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				def.pattern.lastIndex = 0;
				if (def.pattern.test(payload.value)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "regex",
					input: payload.value,
					pattern: def.pattern.toString(),
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckLowerCase = /*@__PURE__*/ $constructor("$ZodCheckLowerCase", (inst, def) => {
			def.pattern ?? (def.pattern = lowercase);
			$ZodCheckStringFormat.init(inst, def);
		});
		const $ZodCheckUpperCase = /*@__PURE__*/ $constructor("$ZodCheckUpperCase", (inst, def) => {
			def.pattern ?? (def.pattern = uppercase);
			$ZodCheckStringFormat.init(inst, def);
		});
		const $ZodCheckIncludes = /*@__PURE__*/ $constructor("$ZodCheckIncludes", (inst, def) => {
			$ZodCheck.init(inst, def);
			const escapedRegex = escapeRegex(def.includes);
			const pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position}}${escapedRegex}` : escapedRegex);
			def.pattern = pattern;
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
				bag.patterns.add(pattern);
			});
			inst._zod.check = (payload) => {
				if (payload.value.includes(def.includes, def.position)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "includes",
					includes: def.includes,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckStartsWith = /*@__PURE__*/ $constructor("$ZodCheckStartsWith", (inst, def) => {
			$ZodCheck.init(inst, def);
			const pattern = new RegExp(`^${escapeRegex(def.prefix)}.*`);
			def.pattern ?? (def.pattern = pattern);
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
				bag.patterns.add(pattern);
			});
			inst._zod.check = (payload) => {
				if (payload.value.startsWith(def.prefix)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "starts_with",
					prefix: def.prefix,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckEndsWith = /*@__PURE__*/ $constructor("$ZodCheckEndsWith", (inst, def) => {
			$ZodCheck.init(inst, def);
			const pattern = new RegExp(`.*${escapeRegex(def.suffix)}$`);
			def.pattern ?? (def.pattern = pattern);
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
				bag.patterns.add(pattern);
			});
			inst._zod.check = (payload) => {
				if (payload.value.endsWith(def.suffix)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "ends_with",
					suffix: def.suffix,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckOverwrite = /*@__PURE__*/ $constructor("$ZodCheckOverwrite", (inst, def) => {
			$ZodCheck.init(inst, def);
			inst._zod.check = (payload) => {
				payload.value = def.tx(payload.value);
			};
		});
		//#endregion
		//#region ../../DSHarness/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/doc.js
		var Doc = class {
			constructor(args = []) {
				this.content = [];
				this.indent = 0;
				if (this) this.args = args;
			}
			indented(fn) {
				this.indent += 1;
				fn(this);
				this.indent -= 1;
			}
			write(arg) {
				if (typeof arg === "function") {
					arg(this, { execution: "sync" });
					arg(this, { execution: "async" });
					return;
				}
				const lines = arg.split("\n").filter((x) => x);
				const minIndent = Math.min(...lines.map((x) => x.length - x.trimStart().length));
				const dedented = lines.map((x) => x.slice(minIndent)).map((x) => " ".repeat(this.indent * 2) + x);
				for (const line of dedented) this.content.push(line);
			}
			compile() {
				const F = Function;
				const args = this?.args;
				const lines = [...(this?.content ?? [``]).map((x) => `  ${x}`)];
				return new F(...args, lines.join("\n"));
			}
		};
		//#endregion
		//#region ../../DSHarness/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/versions.js
		const version = {
			major: 4,
			minor: 4,
			patch: 3
		};
		//#endregion
		//#region ../../DSHarness/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/schemas.js
		const $ZodType = /*@__PURE__*/ $constructor("$ZodType", (inst, def) => {
			var _a;
			inst ?? (inst = {});
			inst._zod.def = def;
			inst._zod.bag = inst._zod.bag || {};
			inst._zod.version = version;
			const checks = [...inst._zod.def.checks ?? []];
			if (inst._zod.traits.has("$ZodCheck")) checks.unshift(inst);
			for (const ch of checks) for (const fn of ch._zod.onattach) fn(inst);
			if (checks.length === 0) {
				(_a = inst._zod).deferred ?? (_a.deferred = []);
				inst._zod.deferred?.push(() => {
					inst._zod.run = inst._zod.parse;
				});
			} else {
				const runChecks = (payload, checks, ctx) => {
					let isAborted = aborted(payload);
					let asyncResult;
					for (const ch of checks) {
						if (ch._zod.def.when) {
							if (explicitlyAborted(payload)) continue;
							if (!ch._zod.def.when(payload)) continue;
						} else if (isAborted) continue;
						const currLen = payload.issues.length;
						const _ = ch._zod.check(payload);
						if (_ instanceof Promise && ctx?.async === false) throw new $ZodAsyncError();
						if (asyncResult || _ instanceof Promise) asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
							await _;
							if (payload.issues.length === currLen) return;
							if (!isAborted) isAborted = aborted(payload, currLen);
						});
						else {
							if (payload.issues.length === currLen) continue;
							if (!isAborted) isAborted = aborted(payload, currLen);
						}
					}
					if (asyncResult) return asyncResult.then(() => {
						return payload;
					});
					return payload;
				};
				const handleCanaryResult = (canary, payload, ctx) => {
					if (aborted(canary)) {
						canary.aborted = true;
						return canary;
					}
					const checkResult = runChecks(payload, checks, ctx);
					if (checkResult instanceof Promise) {
						if (ctx.async === false) throw new $ZodAsyncError();
						return checkResult.then((checkResult) => inst._zod.parse(checkResult, ctx));
					}
					return inst._zod.parse(checkResult, ctx);
				};
				inst._zod.run = (payload, ctx) => {
					if (ctx.skipChecks) return inst._zod.parse(payload, ctx);
					if (ctx.direction === "backward") {
						const canary = inst._zod.parse({
							value: payload.value,
							issues: []
						}, {
							...ctx,
							skipChecks: true
						});
						if (canary instanceof Promise) return canary.then((canary) => {
							return handleCanaryResult(canary, payload, ctx);
						});
						return handleCanaryResult(canary, payload, ctx);
					}
					const result = inst._zod.parse(payload, ctx);
					if (result instanceof Promise) {
						if (ctx.async === false) throw new $ZodAsyncError();
						return result.then((result) => runChecks(result, checks, ctx));
					}
					return runChecks(result, checks, ctx);
				};
			}
			defineLazy(inst, "~standard", () => ({
				validate: (value) => {
					try {
						const r = safeParse$1(inst, value);
						return r.success ? { value: r.data } : { issues: r.error?.issues };
					} catch (_) {
						return safeParseAsync$1(inst, value).then((r) => r.success ? { value: r.data } : { issues: r.error?.issues });
					}
				},
				vendor: "zod",
				version: 1
			}));
		});
		const $ZodString = /*@__PURE__*/ $constructor("$ZodString", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.pattern = [...inst?._zod.bag?.patterns ?? []].pop() ?? string$1(inst._zod.bag);
			inst._zod.parse = (payload, _) => {
				if (def.coerce) try {
					payload.value = String(payload.value);
				} catch (_) {}
				if (typeof payload.value === "string") return payload;
				payload.issues.push({
					expected: "string",
					code: "invalid_type",
					input: payload.value,
					inst
				});
				return payload;
			};
		});
		const $ZodStringFormat = /*@__PURE__*/ $constructor("$ZodStringFormat", (inst, def) => {
			$ZodCheckStringFormat.init(inst, def);
			$ZodString.init(inst, def);
		});
		const $ZodGUID = /*@__PURE__*/ $constructor("$ZodGUID", (inst, def) => {
			def.pattern ?? (def.pattern = guid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodUUID = /*@__PURE__*/ $constructor("$ZodUUID", (inst, def) => {
			if (def.version) {
				const v = {
					v1: 1,
					v2: 2,
					v3: 3,
					v4: 4,
					v5: 5,
					v6: 6,
					v7: 7,
					v8: 8
				}[def.version];
				if (v === void 0) throw new Error(`Invalid UUID version: "${def.version}"`);
				def.pattern ?? (def.pattern = uuid(v));
			} else def.pattern ?? (def.pattern = uuid());
			$ZodStringFormat.init(inst, def);
		});
		const $ZodEmail = /*@__PURE__*/ $constructor("$ZodEmail", (inst, def) => {
			def.pattern ?? (def.pattern = email);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodURL = /*@__PURE__*/ $constructor("$ZodURL", (inst, def) => {
			$ZodStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				try {
					const trimmed = payload.value.trim();
					if (!def.normalize && def.protocol?.source === httpProtocol.source) {
						if (!/^https?:\/\//i.test(trimmed)) {
							payload.issues.push({
								code: "invalid_format",
								format: "url",
								note: "Invalid URL format",
								input: payload.value,
								inst,
								continue: !def.abort
							});
							return;
						}
					}
					const url = new URL(trimmed);
					if (def.hostname) {
						def.hostname.lastIndex = 0;
						if (!def.hostname.test(url.hostname)) payload.issues.push({
							code: "invalid_format",
							format: "url",
							note: "Invalid hostname",
							pattern: def.hostname.source,
							input: payload.value,
							inst,
							continue: !def.abort
						});
					}
					if (def.protocol) {
						def.protocol.lastIndex = 0;
						if (!def.protocol.test(url.protocol.endsWith(":") ? url.protocol.slice(0, -1) : url.protocol)) payload.issues.push({
							code: "invalid_format",
							format: "url",
							note: "Invalid protocol",
							pattern: def.protocol.source,
							input: payload.value,
							inst,
							continue: !def.abort
						});
					}
					if (def.normalize) payload.value = url.href;
					else payload.value = trimmed;
					return;
				} catch (_) {
					payload.issues.push({
						code: "invalid_format",
						format: "url",
						input: payload.value,
						inst,
						continue: !def.abort
					});
				}
			};
		});
		const $ZodEmoji = /*@__PURE__*/ $constructor("$ZodEmoji", (inst, def) => {
			def.pattern ?? (def.pattern = emoji());
			$ZodStringFormat.init(inst, def);
		});
		const $ZodNanoID = /*@__PURE__*/ $constructor("$ZodNanoID", (inst, def) => {
			def.pattern ?? (def.pattern = nanoid);
			$ZodStringFormat.init(inst, def);
		});
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link $ZodCUID2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		const $ZodCUID = /*@__PURE__*/ $constructor("$ZodCUID", (inst, def) => {
			def.pattern ?? (def.pattern = cuid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodCUID2 = /*@__PURE__*/ $constructor("$ZodCUID2", (inst, def) => {
			def.pattern ?? (def.pattern = cuid2);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodULID = /*@__PURE__*/ $constructor("$ZodULID", (inst, def) => {
			def.pattern ?? (def.pattern = ulid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodXID = /*@__PURE__*/ $constructor("$ZodXID", (inst, def) => {
			def.pattern ?? (def.pattern = xid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodKSUID = /*@__PURE__*/ $constructor("$ZodKSUID", (inst, def) => {
			def.pattern ?? (def.pattern = ksuid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISODateTime = /*@__PURE__*/ $constructor("$ZodISODateTime", (inst, def) => {
			def.pattern ?? (def.pattern = datetime$1(def));
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISODate = /*@__PURE__*/ $constructor("$ZodISODate", (inst, def) => {
			def.pattern ?? (def.pattern = date$1);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISOTime = /*@__PURE__*/ $constructor("$ZodISOTime", (inst, def) => {
			def.pattern ?? (def.pattern = time$1(def));
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISODuration = /*@__PURE__*/ $constructor("$ZodISODuration", (inst, def) => {
			def.pattern ?? (def.pattern = duration$1);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodIPv4 = /*@__PURE__*/ $constructor("$ZodIPv4", (inst, def) => {
			def.pattern ?? (def.pattern = ipv4);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.format = `ipv4`;
		});
		const $ZodIPv6 = /*@__PURE__*/ $constructor("$ZodIPv6", (inst, def) => {
			def.pattern ?? (def.pattern = ipv6);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.format = `ipv6`;
			inst._zod.check = (payload) => {
				try {
					new URL(`http://[${payload.value}]`);
				} catch {
					payload.issues.push({
						code: "invalid_format",
						format: "ipv6",
						input: payload.value,
						inst,
						continue: !def.abort
					});
				}
			};
		});
		const $ZodCIDRv4 = /*@__PURE__*/ $constructor("$ZodCIDRv4", (inst, def) => {
			def.pattern ?? (def.pattern = cidrv4);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodCIDRv6 = /*@__PURE__*/ $constructor("$ZodCIDRv6", (inst, def) => {
			def.pattern ?? (def.pattern = cidrv6);
			$ZodStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				const parts = payload.value.split("/");
				try {
					if (parts.length !== 2) throw new Error();
					const [address, prefix] = parts;
					if (!prefix) throw new Error();
					const prefixNum = Number(prefix);
					if (`${prefixNum}` !== prefix) throw new Error();
					if (prefixNum < 0 || prefixNum > 128) throw new Error();
					new URL(`http://[${address}]`);
				} catch {
					payload.issues.push({
						code: "invalid_format",
						format: "cidrv6",
						input: payload.value,
						inst,
						continue: !def.abort
					});
				}
			};
		});
		function isValidBase64(data) {
			if (data === "") return true;
			if (/\s/.test(data)) return false;
			if (data.length % 4 !== 0) return false;
			try {
				atob(data);
				return true;
			} catch {
				return false;
			}
		}
		const $ZodBase64 = /*@__PURE__*/ $constructor("$ZodBase64", (inst, def) => {
			def.pattern ?? (def.pattern = base64);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.contentEncoding = "base64";
			inst._zod.check = (payload) => {
				if (isValidBase64(payload.value)) return;
				payload.issues.push({
					code: "invalid_format",
					format: "base64",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		function isValidBase64URL(data) {
			if (!base64url.test(data)) return false;
			const base64 = data.replace(/[-_]/g, (c) => c === "-" ? "+" : "/");
			return isValidBase64(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
		}
		const $ZodBase64URL = /*@__PURE__*/ $constructor("$ZodBase64URL", (inst, def) => {
			def.pattern ?? (def.pattern = base64url);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.contentEncoding = "base64url";
			inst._zod.check = (payload) => {
				if (isValidBase64URL(payload.value)) return;
				payload.issues.push({
					code: "invalid_format",
					format: "base64url",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodE164 = /*@__PURE__*/ $constructor("$ZodE164", (inst, def) => {
			def.pattern ?? (def.pattern = e164);
			$ZodStringFormat.init(inst, def);
		});
		function isValidJWT(token, algorithm = null) {
			try {
				const tokensParts = token.split(".");
				if (tokensParts.length !== 3) return false;
				const [header] = tokensParts;
				if (!header) return false;
				const parsedHeader = JSON.parse(atob(header));
				if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT") return false;
				if (!parsedHeader.alg) return false;
				if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm)) return false;
				return true;
			} catch {
				return false;
			}
		}
		const $ZodJWT = /*@__PURE__*/ $constructor("$ZodJWT", (inst, def) => {
			$ZodStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				if (isValidJWT(payload.value, def.alg)) return;
				payload.issues.push({
					code: "invalid_format",
					format: "jwt",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodNumber = /*@__PURE__*/ $constructor("$ZodNumber", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.pattern = inst._zod.bag.pattern ?? number$1;
			inst._zod.parse = (payload, _ctx) => {
				if (def.coerce) try {
					payload.value = Number(payload.value);
				} catch (_) {}
				const input = payload.value;
				if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) return payload;
				const received = typeof input === "number" ? Number.isNaN(input) ? "NaN" : !Number.isFinite(input) ? "Infinity" : void 0 : void 0;
				payload.issues.push({
					expected: "number",
					code: "invalid_type",
					input,
					inst,
					...received ? { received } : {}
				});
				return payload;
			};
		});
		const $ZodNumberFormat = /*@__PURE__*/ $constructor("$ZodNumberFormat", (inst, def) => {
			$ZodCheckNumberFormat.init(inst, def);
			$ZodNumber.init(inst, def);
		});
		const $ZodUndefined = /*@__PURE__*/ $constructor("$ZodUndefined", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.pattern = _undefined$2;
			inst._zod.values = new Set([void 0]);
			inst._zod.parse = (payload, _ctx) => {
				const input = payload.value;
				if (typeof input === "undefined") return payload;
				payload.issues.push({
					expected: "undefined",
					code: "invalid_type",
					input,
					inst
				});
				return payload;
			};
		});
		const $ZodUnknown = /*@__PURE__*/ $constructor("$ZodUnknown", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload) => payload;
		});
		const $ZodNever = /*@__PURE__*/ $constructor("$ZodNever", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, _ctx) => {
				payload.issues.push({
					expected: "never",
					code: "invalid_type",
					input: payload.value,
					inst
				});
				return payload;
			};
		});
		function handleArrayResult(result, final, index) {
			if (result.issues.length) final.issues.push(...prefixIssues(index, result.issues));
			final.value[index] = result.value;
		}
		const $ZodArray = /*@__PURE__*/ $constructor("$ZodArray", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, ctx) => {
				const input = payload.value;
				if (!Array.isArray(input)) {
					payload.issues.push({
						expected: "array",
						code: "invalid_type",
						input,
						inst
					});
					return payload;
				}
				payload.value = Array(input.length);
				const proms = [];
				for (let i = 0; i < input.length; i++) {
					const item = input[i];
					const result = def.element._zod.run({
						value: item,
						issues: []
					}, ctx);
					if (result instanceof Promise) proms.push(result.then((result) => handleArrayResult(result, payload, i)));
					else handleArrayResult(result, payload, i);
				}
				if (proms.length) return Promise.all(proms).then(() => payload);
				return payload;
			};
		});
		function handlePropertyResult(result, final, key, input, isOptionalIn, isOptionalOut) {
			const isPresent = key in input;
			if (result.issues.length) {
				if (isOptionalIn && isOptionalOut && !isPresent) return;
				final.issues.push(...prefixIssues(key, result.issues));
			}
			if (!isPresent && !isOptionalIn) {
				if (!result.issues.length) final.issues.push({
					code: "invalid_type",
					expected: "nonoptional",
					input: void 0,
					path: [key]
				});
				return;
			}
			if (result.value === void 0) {
				if (isPresent) final.value[key] = void 0;
			} else final.value[key] = result.value;
		}
		function normalizeDef(def) {
			const keys = Object.keys(def.shape);
			for (const k of keys) if (!def.shape?.[k]?._zod?.traits?.has("$ZodType")) throw new Error(`Invalid element at key "${k}": expected a Zod schema`);
			const okeys = optionalKeys(def.shape);
			return {
				...def,
				keys,
				keySet: new Set(keys),
				numKeys: keys.length,
				optionalKeys: new Set(okeys)
			};
		}
		function handleCatchall(proms, input, payload, ctx, def, inst) {
			const unrecognized = [];
			const keySet = def.keySet;
			const _catchall = def.catchall._zod;
			const t = _catchall.def.type;
			const isOptionalIn = _catchall.optin === "optional";
			const isOptionalOut = _catchall.optout === "optional";
			for (const key in input) {
				if (key === "__proto__") continue;
				if (keySet.has(key)) continue;
				if (t === "never") {
					unrecognized.push(key);
					continue;
				}
				const r = _catchall.run({
					value: input[key],
					issues: []
				}, ctx);
				if (r instanceof Promise) proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut)));
				else handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
			}
			if (unrecognized.length) payload.issues.push({
				code: "unrecognized_keys",
				keys: unrecognized,
				input,
				inst
			});
			if (!proms.length) return payload;
			return Promise.all(proms).then(() => {
				return payload;
			});
		}
		const $ZodObject = /*@__PURE__*/ $constructor("$ZodObject", (inst, def) => {
			$ZodType.init(inst, def);
			if (!Object.getOwnPropertyDescriptor(def, "shape")?.get) {
				const sh = def.shape;
				Object.defineProperty(def, "shape", { get: () => {
					const newSh = { ...sh };
					Object.defineProperty(def, "shape", { value: newSh });
					return newSh;
				} });
			}
			const _normalized = cached(() => normalizeDef(def));
			defineLazy(inst._zod, "propValues", () => {
				const shape = def.shape;
				const propValues = {};
				for (const key in shape) {
					const field = shape[key]._zod;
					if (field.values) {
						propValues[key] ?? (propValues[key] = /* @__PURE__ */ new Set());
						for (const v of field.values) propValues[key].add(v);
					}
				}
				return propValues;
			});
			const isObject$1 = isObject;
			const catchall = def.catchall;
			let value;
			inst._zod.parse = (payload, ctx) => {
				value ?? (value = _normalized.value);
				const input = payload.value;
				if (!isObject$1(input)) {
					payload.issues.push({
						expected: "object",
						code: "invalid_type",
						input,
						inst
					});
					return payload;
				}
				payload.value = {};
				const proms = [];
				const shape = value.shape;
				for (const key of value.keys) {
					const el = shape[key];
					const isOptionalIn = el._zod.optin === "optional";
					const isOptionalOut = el._zod.optout === "optional";
					const r = el._zod.run({
						value: input[key],
						issues: []
					}, ctx);
					if (r instanceof Promise) proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut)));
					else handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
				}
				if (!catchall) return proms.length ? Promise.all(proms).then(() => payload) : payload;
				return handleCatchall(proms, input, payload, ctx, _normalized.value, inst);
			};
		});
		const $ZodObjectJIT = /*@__PURE__*/ $constructor("$ZodObjectJIT", (inst, def) => {
			$ZodObject.init(inst, def);
			const superParse = inst._zod.parse;
			const _normalized = cached(() => normalizeDef(def));
			const generateFastpass = (shape) => {
				const doc = new Doc([
					"shape",
					"payload",
					"ctx"
				]);
				const normalized = _normalized.value;
				const parseStr = (key) => {
					const k = esc(key);
					return `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;
				};
				doc.write(`const input = payload.value;`);
				const ids = Object.create(null);
				let counter = 0;
				for (const key of normalized.keys) ids[key] = `key_${counter++}`;
				doc.write(`const newResult = {};`);
				for (const key of normalized.keys) {
					const id = ids[key];
					const k = esc(key);
					const schema = shape[key];
					const isOptionalIn = schema?._zod?.optin === "optional";
					const isOptionalOut = schema?._zod?.optout === "optional";
					doc.write(`const ${id} = ${parseStr(key)};`);
					if (isOptionalIn && isOptionalOut) doc.write(`
        if (${id}.issues.length) {
          if (${k} in input) {
            payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${k}, ...iss.path] : [${k}]
            })));
          }
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
					else if (!isOptionalIn) doc.write(`
        const ${id}_present = ${k} in input;
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        if (!${id}_present && !${id}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${k}]
          });
        }

        if (${id}_present) {
          if (${id}.value === undefined) {
            newResult[${k}] = undefined;
          } else {
            newResult[${k}] = ${id}.value;
          }
        }

      `);
					else doc.write(`
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
				}
				doc.write(`payload.value = newResult;`);
				doc.write(`return payload;`);
				const fn = doc.compile();
				return (payload, ctx) => fn(shape, payload, ctx);
			};
			let fastpass;
			const isObject$2 = isObject;
			const jit = !globalConfig.jitless;
			const fastEnabled = jit && allowsEval.value;
			const catchall = def.catchall;
			let value;
			inst._zod.parse = (payload, ctx) => {
				value ?? (value = _normalized.value);
				const input = payload.value;
				if (!isObject$2(input)) {
					payload.issues.push({
						expected: "object",
						code: "invalid_type",
						input,
						inst
					});
					return payload;
				}
				if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
					if (!fastpass) fastpass = generateFastpass(def.shape);
					payload = fastpass(payload, ctx);
					if (!catchall) return payload;
					return handleCatchall([], input, payload, ctx, value, inst);
				}
				return superParse(payload, ctx);
			};
		});
		function handleUnionResults(results, final, inst, ctx) {
			for (const result of results) if (result.issues.length === 0) {
				final.value = result.value;
				return final;
			}
			const nonaborted = results.filter((r) => !aborted(r));
			if (nonaborted.length === 1) {
				final.value = nonaborted[0].value;
				return nonaborted[0];
			}
			final.issues.push({
				code: "invalid_union",
				input: final.value,
				inst,
				errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
			});
			return final;
		}
		const $ZodUnion = /*@__PURE__*/ $constructor("$ZodUnion", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "optin", () => def.options.some((o) => o._zod.optin === "optional") ? "optional" : void 0);
			defineLazy(inst._zod, "optout", () => def.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0);
			defineLazy(inst._zod, "values", () => {
				if (def.options.every((o) => o._zod.values)) return new Set(def.options.flatMap((option) => Array.from(option._zod.values)));
			});
			defineLazy(inst._zod, "pattern", () => {
				if (def.options.every((o) => o._zod.pattern)) {
					const patterns = def.options.map((o) => o._zod.pattern);
					return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
				}
			});
			const first = def.options.length === 1 ? def.options[0]._zod.run : null;
			inst._zod.parse = (payload, ctx) => {
				if (first) return first(payload, ctx);
				let async = false;
				const results = [];
				for (const option of def.options) {
					const result = option._zod.run({
						value: payload.value,
						issues: []
					}, ctx);
					if (result instanceof Promise) {
						results.push(result);
						async = true;
					} else {
						if (result.issues.length === 0) return result;
						results.push(result);
					}
				}
				if (!async) return handleUnionResults(results, payload, inst, ctx);
				return Promise.all(results).then((results) => {
					return handleUnionResults(results, payload, inst, ctx);
				});
			};
		});
		const $ZodIntersection = /*@__PURE__*/ $constructor("$ZodIntersection", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, ctx) => {
				const input = payload.value;
				const left = def.left._zod.run({
					value: input,
					issues: []
				}, ctx);
				const right = def.right._zod.run({
					value: input,
					issues: []
				}, ctx);
				if (left instanceof Promise || right instanceof Promise) return Promise.all([left, right]).then(([left, right]) => {
					return handleIntersectionResults(payload, left, right);
				});
				return handleIntersectionResults(payload, left, right);
			};
		});
		function mergeValues(a, b) {
			if (a === b) return {
				valid: true,
				data: a
			};
			if (a instanceof Date && b instanceof Date && +a === +b) return {
				valid: true,
				data: a
			};
			if (isPlainObject(a) && isPlainObject(b)) {
				const bKeys = Object.keys(b);
				const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
				const newObj = {
					...a,
					...b
				};
				for (const key of sharedKeys) {
					const sharedValue = mergeValues(a[key], b[key]);
					if (!sharedValue.valid) return {
						valid: false,
						mergeErrorPath: [key, ...sharedValue.mergeErrorPath]
					};
					newObj[key] = sharedValue.data;
				}
				return {
					valid: true,
					data: newObj
				};
			}
			if (Array.isArray(a) && Array.isArray(b)) {
				if (a.length !== b.length) return {
					valid: false,
					mergeErrorPath: []
				};
				const newArray = [];
				for (let index = 0; index < a.length; index++) {
					const itemA = a[index];
					const itemB = b[index];
					const sharedValue = mergeValues(itemA, itemB);
					if (!sharedValue.valid) return {
						valid: false,
						mergeErrorPath: [index, ...sharedValue.mergeErrorPath]
					};
					newArray.push(sharedValue.data);
				}
				return {
					valid: true,
					data: newArray
				};
			}
			return {
				valid: false,
				mergeErrorPath: []
			};
		}
		function handleIntersectionResults(result, left, right) {
			const unrecKeys = /* @__PURE__ */ new Map();
			let unrecIssue;
			for (const iss of left.issues) if (iss.code === "unrecognized_keys") {
				unrecIssue ?? (unrecIssue = iss);
				for (const k of iss.keys) {
					if (!unrecKeys.has(k)) unrecKeys.set(k, {});
					unrecKeys.get(k).l = true;
				}
			} else result.issues.push(iss);
			for (const iss of right.issues) if (iss.code === "unrecognized_keys") for (const k of iss.keys) {
				if (!unrecKeys.has(k)) unrecKeys.set(k, {});
				unrecKeys.get(k).r = true;
			}
			else result.issues.push(iss);
			const bothKeys = [...unrecKeys].filter(([, f]) => f.l && f.r).map(([k]) => k);
			if (bothKeys.length && unrecIssue) result.issues.push({
				...unrecIssue,
				keys: bothKeys
			});
			if (aborted(result)) return result;
			const merged = mergeValues(left.value, right.value);
			if (!merged.valid) throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(merged.mergeErrorPath)}`);
			result.value = merged.data;
			return result;
		}
		const $ZodRecord = /*@__PURE__*/ $constructor("$ZodRecord", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, ctx) => {
				const input = payload.value;
				if (!isPlainObject(input)) {
					payload.issues.push({
						expected: "record",
						code: "invalid_type",
						input,
						inst
					});
					return payload;
				}
				const proms = [];
				const values = def.keyType._zod.values;
				if (values) {
					payload.value = {};
					const recordKeys = /* @__PURE__ */ new Set();
					for (const key of values) if (typeof key === "string" || typeof key === "number" || typeof key === "symbol") {
						recordKeys.add(typeof key === "number" ? key.toString() : key);
						const keyResult = def.keyType._zod.run({
							value: key,
							issues: []
						}, ctx);
						if (keyResult instanceof Promise) throw new Error("Async schemas not supported in object keys currently");
						if (keyResult.issues.length) {
							payload.issues.push({
								code: "invalid_key",
								origin: "record",
								issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
								input: key,
								path: [key],
								inst
							});
							continue;
						}
						const outKey = keyResult.value;
						const result = def.valueType._zod.run({
							value: input[key],
							issues: []
						}, ctx);
						if (result instanceof Promise) proms.push(result.then((result) => {
							if (result.issues.length) payload.issues.push(...prefixIssues(key, result.issues));
							payload.value[outKey] = result.value;
						}));
						else {
							if (result.issues.length) payload.issues.push(...prefixIssues(key, result.issues));
							payload.value[outKey] = result.value;
						}
					}
					let unrecognized;
					for (const key in input) if (!recordKeys.has(key)) {
						unrecognized = unrecognized ?? [];
						unrecognized.push(key);
					}
					if (unrecognized && unrecognized.length > 0) payload.issues.push({
						code: "unrecognized_keys",
						input,
						inst,
						keys: unrecognized
					});
				} else {
					payload.value = {};
					for (const key of Reflect.ownKeys(input)) {
						if (key === "__proto__") continue;
						if (!Object.prototype.propertyIsEnumerable.call(input, key)) continue;
						let keyResult = def.keyType._zod.run({
							value: key,
							issues: []
						}, ctx);
						if (keyResult instanceof Promise) throw new Error("Async schemas not supported in object keys currently");
						if (typeof key === "string" && number$1.test(key) && keyResult.issues.length) {
							const retryResult = def.keyType._zod.run({
								value: Number(key),
								issues: []
							}, ctx);
							if (retryResult instanceof Promise) throw new Error("Async schemas not supported in object keys currently");
							if (retryResult.issues.length === 0) keyResult = retryResult;
						}
						if (keyResult.issues.length) {
							if (def.mode === "loose") payload.value[key] = input[key];
							else payload.issues.push({
								code: "invalid_key",
								origin: "record",
								issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
								input: key,
								path: [key],
								inst
							});
							continue;
						}
						const result = def.valueType._zod.run({
							value: input[key],
							issues: []
						}, ctx);
						if (result instanceof Promise) proms.push(result.then((result) => {
							if (result.issues.length) payload.issues.push(...prefixIssues(key, result.issues));
							payload.value[keyResult.value] = result.value;
						}));
						else {
							if (result.issues.length) payload.issues.push(...prefixIssues(key, result.issues));
							payload.value[keyResult.value] = result.value;
						}
					}
				}
				if (proms.length) return Promise.all(proms).then(() => payload);
				return payload;
			};
		});
		const $ZodEnum = /*@__PURE__*/ $constructor("$ZodEnum", (inst, def) => {
			$ZodType.init(inst, def);
			const values = getEnumValues(def.entries);
			const valuesSet = new Set(values);
			inst._zod.values = valuesSet;
			inst._zod.pattern = new RegExp(`^(${values.filter((k) => propertyKeyTypes.has(typeof k)).map((o) => typeof o === "string" ? escapeRegex(o) : o.toString()).join("|")})$`);
			inst._zod.parse = (payload, _ctx) => {
				const input = payload.value;
				if (valuesSet.has(input)) return payload;
				payload.issues.push({
					code: "invalid_value",
					values,
					input,
					inst
				});
				return payload;
			};
		});
		const $ZodLiteral = /*@__PURE__*/ $constructor("$ZodLiteral", (inst, def) => {
			$ZodType.init(inst, def);
			if (def.values.length === 0) throw new Error("Cannot create literal schema with no valid values");
			const values = new Set(def.values);
			inst._zod.values = values;
			inst._zod.pattern = new RegExp(`^(${def.values.map((o) => typeof o === "string" ? escapeRegex(o) : o ? escapeRegex(o.toString()) : String(o)).join("|")})$`);
			inst._zod.parse = (payload, _ctx) => {
				const input = payload.value;
				if (values.has(input)) return payload;
				payload.issues.push({
					code: "invalid_value",
					values: def.values,
					input,
					inst
				});
				return payload;
			};
		});
		const $ZodTransform = /*@__PURE__*/ $constructor("$ZodTransform", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
				const _out = def.transform(payload.value, payload);
				if (ctx.async) return (_out instanceof Promise ? _out : Promise.resolve(_out)).then((output) => {
					payload.value = output;
					payload.fallback = true;
					return payload;
				});
				if (_out instanceof Promise) throw new $ZodAsyncError();
				payload.value = _out;
				payload.fallback = true;
				return payload;
			};
		});
		function handleOptionalResult(result, input) {
			if (input === void 0 && (result.issues.length || result.fallback)) return {
				issues: [],
				value: void 0
			};
			return result;
		}
		const $ZodOptional = /*@__PURE__*/ $constructor("$ZodOptional", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			inst._zod.optout = "optional";
			defineLazy(inst._zod, "values", () => {
				return def.innerType._zod.values ? new Set([...def.innerType._zod.values, void 0]) : void 0;
			});
			defineLazy(inst._zod, "pattern", () => {
				const pattern = def.innerType._zod.pattern;
				return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : void 0;
			});
			inst._zod.parse = (payload, ctx) => {
				if (def.innerType._zod.optin === "optional") {
					const input = payload.value;
					const result = def.innerType._zod.run(payload, ctx);
					if (result instanceof Promise) return result.then((r) => handleOptionalResult(r, input));
					return handleOptionalResult(result, input);
				}
				if (payload.value === void 0) return payload;
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodExactOptional = /*@__PURE__*/ $constructor("$ZodExactOptional", (inst, def) => {
			$ZodOptional.init(inst, def);
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			defineLazy(inst._zod, "pattern", () => def.innerType._zod.pattern);
			inst._zod.parse = (payload, ctx) => {
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodNullable = /*@__PURE__*/ $constructor("$ZodNullable", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
			defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
			defineLazy(inst._zod, "pattern", () => {
				const pattern = def.innerType._zod.pattern;
				return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : void 0;
			});
			defineLazy(inst._zod, "values", () => {
				return def.innerType._zod.values ? new Set([...def.innerType._zod.values, null]) : void 0;
			});
			inst._zod.parse = (payload, ctx) => {
				if (payload.value === null) return payload;
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodDefault = /*@__PURE__*/ $constructor("$ZodDefault", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				if (payload.value === void 0) {
					payload.value = def.defaultValue;
					/**
					* $ZodDefault returns the default value immediately in forward direction.
					* It doesn't pass the default value into the validator ("prefault"). There's no reason to pass the default value through validation. The validity of the default is enforced by TypeScript statically. Otherwise, it's the responsibility of the user to ensure the default is valid. In the case of pipes with divergent in/out types, you can specify the default on the `in` schema of your ZodPipe to set a "prefault" for the pipe.   */
					return payload;
				}
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then((result) => handleDefaultResult(result, def));
				return handleDefaultResult(result, def);
			};
		});
		function handleDefaultResult(payload, def) {
			if (payload.value === void 0) payload.value = def.defaultValue;
			return payload;
		}
		const $ZodPrefault = /*@__PURE__*/ $constructor("$ZodPrefault", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				if (payload.value === void 0) payload.value = def.defaultValue;
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodNonOptional = /*@__PURE__*/ $constructor("$ZodNonOptional", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "values", () => {
				const v = def.innerType._zod.values;
				return v ? new Set([...v].filter((x) => x !== void 0)) : void 0;
			});
			inst._zod.parse = (payload, ctx) => {
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then((result) => handleNonOptionalResult(result, inst));
				return handleNonOptionalResult(result, inst);
			};
		});
		function handleNonOptionalResult(payload, inst) {
			if (!payload.issues.length && payload.value === void 0) payload.issues.push({
				code: "invalid_type",
				expected: "nonoptional",
				input: payload.value,
				inst
			});
			return payload;
		}
		const $ZodCatch = /*@__PURE__*/ $constructor("$ZodCatch", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then((result) => {
					payload.value = result.value;
					if (result.issues.length) {
						payload.value = def.catchValue({
							...payload,
							error: { issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())) },
							input: payload.value
						});
						payload.issues = [];
						payload.fallback = true;
					}
					return payload;
				});
				payload.value = result.value;
				if (result.issues.length) {
					payload.value = def.catchValue({
						...payload,
						error: { issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())) },
						input: payload.value
					});
					payload.issues = [];
					payload.fallback = true;
				}
				return payload;
			};
		});
		const $ZodPipe = /*@__PURE__*/ $constructor("$ZodPipe", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "values", () => def.in._zod.values);
			defineLazy(inst._zod, "optin", () => def.in._zod.optin);
			defineLazy(inst._zod, "optout", () => def.out._zod.optout);
			defineLazy(inst._zod, "propValues", () => def.in._zod.propValues);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") {
					const right = def.out._zod.run(payload, ctx);
					if (right instanceof Promise) return right.then((right) => handlePipeResult(right, def.in, ctx));
					return handlePipeResult(right, def.in, ctx);
				}
				const left = def.in._zod.run(payload, ctx);
				if (left instanceof Promise) return left.then((left) => handlePipeResult(left, def.out, ctx));
				return handlePipeResult(left, def.out, ctx);
			};
		});
		function handlePipeResult(left, next, ctx) {
			if (left.issues.length) {
				left.aborted = true;
				return left;
			}
			return next._zod.run({
				value: left.value,
				issues: left.issues,
				fallback: left.fallback
			}, ctx);
		}
		const $ZodReadonly = /*@__PURE__*/ $constructor("$ZodReadonly", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "propValues", () => def.innerType._zod.propValues);
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			defineLazy(inst._zod, "optin", () => def.innerType?._zod?.optin);
			defineLazy(inst._zod, "optout", () => def.innerType?._zod?.optout);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then(handleReadonlyResult);
				return handleReadonlyResult(result);
			};
		});
		function handleReadonlyResult(payload) {
			payload.value = Object.freeze(payload.value);
			return payload;
		}
		const $ZodLazy = /*@__PURE__*/ $constructor("$ZodLazy", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "innerType", () => {
				const d = def;
				if (!d._cachedInner) d._cachedInner = def.getter();
				return d._cachedInner;
			});
			defineLazy(inst._zod, "pattern", () => inst._zod.innerType?._zod?.pattern);
			defineLazy(inst._zod, "propValues", () => inst._zod.innerType?._zod?.propValues);
			defineLazy(inst._zod, "optin", () => inst._zod.innerType?._zod?.optin ?? void 0);
			defineLazy(inst._zod, "optout", () => inst._zod.innerType?._zod?.optout ?? void 0);
			inst._zod.parse = (payload, ctx) => {
				return inst._zod.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodCustom = /*@__PURE__*/ $constructor("$ZodCustom", (inst, def) => {
			$ZodCheck.init(inst, def);
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, _) => {
				return payload;
			};
			inst._zod.check = (payload) => {
				const input = payload.value;
				const r = def.fn(input);
				if (r instanceof Promise) return r.then((r) => handleRefineResult(r, payload, input, inst));
				handleRefineResult(r, payload, input, inst);
			};
		});
		function handleRefineResult(result, payload, input, inst) {
			if (!result) {
				const _iss = {
					code: "custom",
					input,
					inst,
					path: [...inst._zod.def.path ?? []],
					continue: !inst._zod.def.abort
				};
				if (inst._zod.def.params) _iss.params = inst._zod.def.params;
				payload.issues.push(issue(_iss));
			}
		}
		//#endregion
		//#region ../../DSHarness/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/registries.js
		var _a;
		var $ZodRegistry = class {
			constructor() {
				this._map = /* @__PURE__ */ new WeakMap();
				this._idmap = /* @__PURE__ */ new Map();
			}
			add(schema, ..._meta) {
				const meta = _meta[0];
				this._map.set(schema, meta);
				if (meta && typeof meta === "object" && "id" in meta) this._idmap.set(meta.id, schema);
				return this;
			}
			clear() {
				this._map = /* @__PURE__ */ new WeakMap();
				this._idmap = /* @__PURE__ */ new Map();
				return this;
			}
			remove(schema) {
				const meta = this._map.get(schema);
				if (meta && typeof meta === "object" && "id" in meta) this._idmap.delete(meta.id);
				this._map.delete(schema);
				return this;
			}
			get(schema) {
				const p = schema._zod.parent;
				if (p) {
					const pm = { ...this.get(p) ?? {} };
					delete pm.id;
					const f = {
						...pm,
						...this._map.get(schema)
					};
					return Object.keys(f).length ? f : void 0;
				}
				return this._map.get(schema);
			}
			has(schema) {
				return this._map.has(schema);
			}
		};
		function registry() {
			return new $ZodRegistry();
		}
		(_a = globalThis).__zod_globalRegistry ?? (_a.__zod_globalRegistry = registry());
		const globalRegistry = globalThis.__zod_globalRegistry;
		//#endregion
		//#region ../../DSHarness/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/api.js
		// @__NO_SIDE_EFFECTS__
		function _string(Class, params) {
			return new Class({
				type: "string",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _email(Class, params) {
			return new Class({
				type: "string",
				format: "email",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _guid(Class, params) {
			return new Class({
				type: "string",
				format: "guid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuid(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuidv4(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				version: "v4",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuidv6(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				version: "v6",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuidv7(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				version: "v7",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _url(Class, params) {
			return new Class({
				type: "string",
				format: "url",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _emoji(Class, params) {
			return new Class({
				type: "string",
				format: "emoji",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _nanoid(Class, params) {
			return new Class({
				type: "string",
				format: "nanoid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link _cuid2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		// @__NO_SIDE_EFFECTS__
		function _cuid(Class, params) {
			return new Class({
				type: "string",
				format: "cuid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _cuid2(Class, params) {
			return new Class({
				type: "string",
				format: "cuid2",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ulid(Class, params) {
			return new Class({
				type: "string",
				format: "ulid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _xid(Class, params) {
			return new Class({
				type: "string",
				format: "xid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ksuid(Class, params) {
			return new Class({
				type: "string",
				format: "ksuid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ipv4(Class, params) {
			return new Class({
				type: "string",
				format: "ipv4",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ipv6(Class, params) {
			return new Class({
				type: "string",
				format: "ipv6",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _cidrv4(Class, params) {
			return new Class({
				type: "string",
				format: "cidrv4",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _cidrv6(Class, params) {
			return new Class({
				type: "string",
				format: "cidrv6",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _base64(Class, params) {
			return new Class({
				type: "string",
				format: "base64",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _base64url(Class, params) {
			return new Class({
				type: "string",
				format: "base64url",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _e164(Class, params) {
			return new Class({
				type: "string",
				format: "e164",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _jwt(Class, params) {
			return new Class({
				type: "string",
				format: "jwt",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoDateTime(Class, params) {
			return new Class({
				type: "string",
				format: "datetime",
				check: "string_format",
				offset: false,
				local: false,
				precision: null,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoDate(Class, params) {
			return new Class({
				type: "string",
				format: "date",
				check: "string_format",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoTime(Class, params) {
			return new Class({
				type: "string",
				format: "time",
				check: "string_format",
				precision: null,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoDuration(Class, params) {
			return new Class({
				type: "string",
				format: "duration",
				check: "string_format",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _number(Class, params) {
			return new Class({
				type: "number",
				checks: [],
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _int(Class, params) {
			return new Class({
				type: "number",
				check: "number_format",
				abort: false,
				format: "safeint",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _undefined$1(Class, params) {
			return new Class({
				type: "undefined",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _unknown(Class) {
			return new Class({ type: "unknown" });
		}
		// @__NO_SIDE_EFFECTS__
		function _never(Class, params) {
			return new Class({
				type: "never",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _lt(value, params) {
			return new $ZodCheckLessThan({
				check: "less_than",
				...normalizeParams(params),
				value,
				inclusive: false
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _lte(value, params) {
			return new $ZodCheckLessThan({
				check: "less_than",
				...normalizeParams(params),
				value,
				inclusive: true
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _gt(value, params) {
			return new $ZodCheckGreaterThan({
				check: "greater_than",
				...normalizeParams(params),
				value,
				inclusive: false
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _gte(value, params) {
			return new $ZodCheckGreaterThan({
				check: "greater_than",
				...normalizeParams(params),
				value,
				inclusive: true
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _multipleOf(value, params) {
			return new $ZodCheckMultipleOf({
				check: "multiple_of",
				...normalizeParams(params),
				value
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _maxLength(maximum, params) {
			return new $ZodCheckMaxLength({
				check: "max_length",
				...normalizeParams(params),
				maximum
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _minLength(minimum, params) {
			return new $ZodCheckMinLength({
				check: "min_length",
				...normalizeParams(params),
				minimum
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _length(length, params) {
			return new $ZodCheckLengthEquals({
				check: "length_equals",
				...normalizeParams(params),
				length
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _regex(pattern, params) {
			return new $ZodCheckRegex({
				check: "string_format",
				format: "regex",
				...normalizeParams(params),
				pattern
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _lowercase(params) {
			return new $ZodCheckLowerCase({
				check: "string_format",
				format: "lowercase",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uppercase(params) {
			return new $ZodCheckUpperCase({
				check: "string_format",
				format: "uppercase",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _includes(includes, params) {
			return new $ZodCheckIncludes({
				check: "string_format",
				format: "includes",
				...normalizeParams(params),
				includes
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _startsWith(prefix, params) {
			return new $ZodCheckStartsWith({
				check: "string_format",
				format: "starts_with",
				...normalizeParams(params),
				prefix
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _endsWith(suffix, params) {
			return new $ZodCheckEndsWith({
				check: "string_format",
				format: "ends_with",
				...normalizeParams(params),
				suffix
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _overwrite(tx) {
			return new $ZodCheckOverwrite({
				check: "overwrite",
				tx
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _normalize(form) {
			return /* @__PURE__ */ _overwrite((input) => input.normalize(form));
		}
		// @__NO_SIDE_EFFECTS__
		function _trim() {
			return /* @__PURE__ */ _overwrite((input) => input.trim());
		}
		// @__NO_SIDE_EFFECTS__
		function _toLowerCase() {
			return /* @__PURE__ */ _overwrite((input) => input.toLowerCase());
		}
		// @__NO_SIDE_EFFECTS__
		function _toUpperCase() {
			return /* @__PURE__ */ _overwrite((input) => input.toUpperCase());
		}
		// @__NO_SIDE_EFFECTS__
		function _slugify() {
			return /* @__PURE__ */ _overwrite((input) => slugify(input));
		}
		// @__NO_SIDE_EFFECTS__
		function _array(Class, element, params) {
			return new Class({
				type: "array",
				element,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _refine(Class, fn, _params) {
			return new Class({
				type: "custom",
				check: "custom",
				fn,
				...normalizeParams(_params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _superRefine(fn, params) {
			const ch = /* @__PURE__ */ _check((payload) => {
				payload.addIssue = (issue$2) => {
					if (typeof issue$2 === "string") payload.issues.push(issue(issue$2, payload.value, ch._zod.def));
					else {
						const _issue = issue$2;
						if (_issue.fatal) _issue.continue = false;
						_issue.code ?? (_issue.code = "custom");
						_issue.input ?? (_issue.input = payload.value);
						_issue.inst ?? (_issue.inst = ch);
						_issue.continue ?? (_issue.continue = !ch._zod.def.abort);
						payload.issues.push(issue(_issue));
					}
				};
				return fn(payload.value, payload);
			}, params);
			return ch;
		}
		// @__NO_SIDE_EFFECTS__
		function _check(fn, params) {
			const ch = new $ZodCheck({
				check: "custom",
				...normalizeParams(params)
			});
			ch._zod.check = fn;
			return ch;
		}
		//#endregion
		//#region ../../DSHarness/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/to-json-schema.js
		function initializeContext(params) {
			let target = params?.target ?? "draft-2020-12";
			if (target === "draft-4") target = "draft-04";
			if (target === "draft-7") target = "draft-07";
			return {
				processors: params.processors ?? {},
				metadataRegistry: params?.metadata ?? globalRegistry,
				target,
				unrepresentable: params?.unrepresentable ?? "throw",
				override: params?.override ?? (() => {}),
				io: params?.io ?? "output",
				counter: 0,
				seen: /* @__PURE__ */ new Map(),
				cycles: params?.cycles ?? "ref",
				reused: params?.reused ?? "inline",
				external: params?.external ?? void 0
			};
		}
		function process(schema, ctx, _params = {
			path: [],
			schemaPath: []
		}) {
			var _a;
			const def = schema._zod.def;
			const seen = ctx.seen.get(schema);
			if (seen) {
				seen.count++;
				if (_params.schemaPath.includes(schema)) seen.cycle = _params.path;
				return seen.schema;
			}
			const result = {
				schema: {},
				count: 1,
				cycle: void 0,
				path: _params.path
			};
			ctx.seen.set(schema, result);
			const overrideSchema = schema._zod.toJSONSchema?.();
			if (overrideSchema) result.schema = overrideSchema;
			else {
				const params = {
					..._params,
					schemaPath: [..._params.schemaPath, schema],
					path: _params.path
				};
				if (schema._zod.processJSONSchema) schema._zod.processJSONSchema(ctx, result.schema, params);
				else {
					const _json = result.schema;
					const processor = ctx.processors[def.type];
					if (!processor) throw new Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);
					processor(schema, ctx, _json, params);
				}
				const parent = schema._zod.parent;
				if (parent) {
					if (!result.ref) result.ref = parent;
					process(parent, ctx, params);
					ctx.seen.get(parent).isParent = true;
				}
			}
			const meta = ctx.metadataRegistry.get(schema);
			if (meta) Object.assign(result.schema, meta);
			if (ctx.io === "input" && isTransforming(schema)) {
				delete result.schema.examples;
				delete result.schema.default;
			}
			if (ctx.io === "input" && "_prefault" in result.schema) (_a = result.schema).default ?? (_a.default = result.schema._prefault);
			delete result.schema._prefault;
			return ctx.seen.get(schema).schema;
		}
		function extractDefs(ctx, schema) {
			const root = ctx.seen.get(schema);
			if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
			const idToSchema = /* @__PURE__ */ new Map();
			for (const entry of ctx.seen.entries()) {
				const id = ctx.metadataRegistry.get(entry[0])?.id;
				if (id) {
					const existing = idToSchema.get(id);
					if (existing && existing !== entry[0]) throw new Error(`Duplicate schema id "${id}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
					idToSchema.set(id, entry[0]);
				}
			}
			const makeURI = (entry) => {
				const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
				if (ctx.external) {
					const externalId = ctx.external.registry.get(entry[0])?.id;
					const uriGenerator = ctx.external.uri ?? ((id) => id);
					if (externalId) return { ref: uriGenerator(externalId) };
					const id = entry[1].defId ?? entry[1].schema.id ?? `schema${ctx.counter++}`;
					entry[1].defId = id;
					return {
						defId: id,
						ref: `${uriGenerator("__shared")}#/${defsSegment}/${id}`
					};
				}
				if (entry[1] === root) return { ref: "#" };
				const defUriPrefix = `#/${defsSegment}/`;
				const defId = entry[1].schema.id ?? `__schema${ctx.counter++}`;
				return {
					defId,
					ref: defUriPrefix + defId
				};
			};
			const extractToDef = (entry) => {
				if (entry[1].schema.$ref) return;
				const seen = entry[1];
				const { ref, defId } = makeURI(entry);
				seen.def = { ...seen.schema };
				if (defId) seen.defId = defId;
				const schema = seen.schema;
				for (const key in schema) delete schema[key];
				schema.$ref = ref;
			};
			if (ctx.cycles === "throw") for (const entry of ctx.seen.entries()) {
				const seen = entry[1];
				if (seen.cycle) throw new Error(`Cycle detected: #/${seen.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
			}
			for (const entry of ctx.seen.entries()) {
				const seen = entry[1];
				if (schema === entry[0]) {
					extractToDef(entry);
					continue;
				}
				if (ctx.external) {
					const ext = ctx.external.registry.get(entry[0])?.id;
					if (schema !== entry[0] && ext) {
						extractToDef(entry);
						continue;
					}
				}
				if (ctx.metadataRegistry.get(entry[0])?.id) {
					extractToDef(entry);
					continue;
				}
				if (seen.cycle) {
					extractToDef(entry);
					continue;
				}
				if (seen.count > 1) {
					if (ctx.reused === "ref") {
						extractToDef(entry);
						continue;
					}
				}
			}
		}
		function finalize(ctx, schema) {
			const root = ctx.seen.get(schema);
			if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
			const flattenRef = (zodSchema) => {
				const seen = ctx.seen.get(zodSchema);
				if (seen.ref === null) return;
				const schema = seen.def ?? seen.schema;
				const _cached = { ...schema };
				const ref = seen.ref;
				seen.ref = null;
				if (ref) {
					flattenRef(ref);
					const refSeen = ctx.seen.get(ref);
					const refSchema = refSeen.schema;
					if (refSchema.$ref && (ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0")) {
						schema.allOf = schema.allOf ?? [];
						schema.allOf.push(refSchema);
					} else Object.assign(schema, refSchema);
					Object.assign(schema, _cached);
					if (zodSchema._zod.parent === ref) for (const key in schema) {
						if (key === "$ref" || key === "allOf") continue;
						if (!(key in _cached)) delete schema[key];
					}
					if (refSchema.$ref && refSeen.def) for (const key in schema) {
						if (key === "$ref" || key === "allOf") continue;
						if (key in refSeen.def && JSON.stringify(schema[key]) === JSON.stringify(refSeen.def[key])) delete schema[key];
					}
				}
				const parent = zodSchema._zod.parent;
				if (parent && parent !== ref) {
					flattenRef(parent);
					const parentSeen = ctx.seen.get(parent);
					if (parentSeen?.schema.$ref) {
						schema.$ref = parentSeen.schema.$ref;
						if (parentSeen.def) for (const key in schema) {
							if (key === "$ref" || key === "allOf") continue;
							if (key in parentSeen.def && JSON.stringify(schema[key]) === JSON.stringify(parentSeen.def[key])) delete schema[key];
						}
					}
				}
				ctx.override({
					zodSchema,
					jsonSchema: schema,
					path: seen.path ?? []
				});
			};
			for (const entry of [...ctx.seen.entries()].reverse()) flattenRef(entry[0]);
			const result = {};
			if (ctx.target === "draft-2020-12") result.$schema = "https://json-schema.org/draft/2020-12/schema";
			else if (ctx.target === "draft-07") result.$schema = "http://json-schema.org/draft-07/schema#";
			else if (ctx.target === "draft-04") result.$schema = "http://json-schema.org/draft-04/schema#";
			else if (ctx.target === "openapi-3.0") {}
			if (ctx.external?.uri) {
				const id = ctx.external.registry.get(schema)?.id;
				if (!id) throw new Error("Schema is missing an `id` property");
				result.$id = ctx.external.uri(id);
			}
			Object.assign(result, root.def ?? root.schema);
			const rootMetaId = ctx.metadataRegistry.get(schema)?.id;
			if (rootMetaId !== void 0 && result.id === rootMetaId) delete result.id;
			const defs = ctx.external?.defs ?? {};
			for (const entry of ctx.seen.entries()) {
				const seen = entry[1];
				if (seen.def && seen.defId) {
					if (seen.def.id === seen.defId) delete seen.def.id;
					defs[seen.defId] = seen.def;
				}
			}
			if (ctx.external) {} else if (Object.keys(defs).length > 0) if (ctx.target === "draft-2020-12") result.$defs = defs;
			else result.definitions = defs;
			try {
				const finalized = JSON.parse(JSON.stringify(result));
				Object.defineProperty(finalized, "~standard", {
					value: {
						...schema["~standard"],
						jsonSchema: {
							input: createStandardJSONSchemaMethod(schema, "input", ctx.processors),
							output: createStandardJSONSchemaMethod(schema, "output", ctx.processors)
						}
					},
					enumerable: false,
					writable: false
				});
				return finalized;
			} catch (_err) {
				throw new Error("Error converting schema to JSON.");
			}
		}
		function isTransforming(_schema, _ctx) {
			const ctx = _ctx ?? { seen: /* @__PURE__ */ new Set() };
			if (ctx.seen.has(_schema)) return false;
			ctx.seen.add(_schema);
			const def = _schema._zod.def;
			if (def.type === "transform") return true;
			if (def.type === "array") return isTransforming(def.element, ctx);
			if (def.type === "set") return isTransforming(def.valueType, ctx);
			if (def.type === "lazy") return isTransforming(def.getter(), ctx);
			if (def.type === "promise" || def.type === "optional" || def.type === "nonoptional" || def.type === "nullable" || def.type === "readonly" || def.type === "default" || def.type === "prefault") return isTransforming(def.innerType, ctx);
			if (def.type === "intersection") return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
			if (def.type === "record" || def.type === "map") return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
			if (def.type === "pipe") {
				if (_schema._zod.traits.has("$ZodCodec")) return true;
				return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
			}
			if (def.type === "object") {
				for (const key in def.shape) if (isTransforming(def.shape[key], ctx)) return true;
				return false;
			}
			if (def.type === "union") {
				for (const option of def.options) if (isTransforming(option, ctx)) return true;
				return false;
			}
			if (def.type === "tuple") {
				for (const item of def.items) if (isTransforming(item, ctx)) return true;
				if (def.rest && isTransforming(def.rest, ctx)) return true;
				return false;
			}
			return false;
		}
		/**
		* Creates a toJSONSchema method for a schema instance.
		* This encapsulates the logic of initializing context, processing, extracting defs, and finalizing.
		*/
		const createToJSONSchemaMethod = (schema, processors = {}) => (params) => {
			const ctx = initializeContext({
				...params,
				processors
			});
			process(schema, ctx);
			extractDefs(ctx, schema);
			return finalize(ctx, schema);
		};
		const createStandardJSONSchemaMethod = (schema, io, processors = {}) => (params) => {
			const { libraryOptions, target } = params ?? {};
			const ctx = initializeContext({
				...libraryOptions ?? {},
				target,
				io,
				processors
			});
			process(schema, ctx);
			extractDefs(ctx, schema);
			return finalize(ctx, schema);
		};
		//#endregion
		//#region ../../DSHarness/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/json-schema-processors.js
		const formatMap = {
			guid: "uuid",
			url: "uri",
			datetime: "date-time",
			json_string: "json-string",
			regex: ""
		};
		const stringProcessor = (schema, ctx, _json, _params) => {
			const json = _json;
			json.type = "string";
			const { minimum, maximum, format, patterns, contentEncoding } = schema._zod.bag;
			if (typeof minimum === "number") json.minLength = minimum;
			if (typeof maximum === "number") json.maxLength = maximum;
			if (format) {
				json.format = formatMap[format] ?? format;
				if (json.format === "") delete json.format;
				if (format === "time") delete json.format;
			}
			if (contentEncoding) json.contentEncoding = contentEncoding;
			if (patterns && patterns.size > 0) {
				const regexes = [...patterns];
				if (regexes.length === 1) json.pattern = regexes[0].source;
				else if (regexes.length > 1) json.allOf = [...regexes.map((regex) => ({
					...ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0" ? { type: "string" } : {},
					pattern: regex.source
				}))];
			}
		};
		const numberProcessor = (schema, ctx, _json, _params) => {
			const json = _json;
			const { minimum, maximum, format, multipleOf, exclusiveMaximum, exclusiveMinimum } = schema._zod.bag;
			if (typeof format === "string" && format.includes("int")) json.type = "integer";
			else json.type = "number";
			const exMin = typeof exclusiveMinimum === "number" && exclusiveMinimum >= (minimum ?? Number.NEGATIVE_INFINITY);
			const exMax = typeof exclusiveMaximum === "number" && exclusiveMaximum <= (maximum ?? Number.POSITIVE_INFINITY);
			const legacy = ctx.target === "draft-04" || ctx.target === "openapi-3.0";
			if (exMin) if (legacy) {
				json.minimum = exclusiveMinimum;
				json.exclusiveMinimum = true;
			} else json.exclusiveMinimum = exclusiveMinimum;
			else if (typeof minimum === "number") json.minimum = minimum;
			if (exMax) if (legacy) {
				json.maximum = exclusiveMaximum;
				json.exclusiveMaximum = true;
			} else json.exclusiveMaximum = exclusiveMaximum;
			else if (typeof maximum === "number") json.maximum = maximum;
			if (typeof multipleOf === "number") json.multipleOf = multipleOf;
		};
		const undefinedProcessor = (_schema, ctx, _json, _params) => {
			if (ctx.unrepresentable === "throw") throw new Error("Undefined cannot be represented in JSON Schema");
		};
		const neverProcessor = (_schema, _ctx, json, _params) => {
			json.not = {};
		};
		const enumProcessor = (schema, _ctx, json, _params) => {
			const def = schema._zod.def;
			const values = getEnumValues(def.entries);
			if (values.every((v) => typeof v === "number")) json.type = "number";
			if (values.every((v) => typeof v === "string")) json.type = "string";
			json.enum = values;
		};
		const literalProcessor = (schema, ctx, json, _params) => {
			const def = schema._zod.def;
			const vals = [];
			for (const val of def.values) if (val === void 0) {
				if (ctx.unrepresentable === "throw") throw new Error("Literal `undefined` cannot be represented in JSON Schema");
			} else if (typeof val === "bigint") if (ctx.unrepresentable === "throw") throw new Error("BigInt literals cannot be represented in JSON Schema");
			else vals.push(Number(val));
			else vals.push(val);
			if (vals.length === 0) {} else if (vals.length === 1) {
				const val = vals[0];
				json.type = val === null ? "null" : typeof val;
				if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") json.enum = [val];
				else json.const = val;
			} else {
				if (vals.every((v) => typeof v === "number")) json.type = "number";
				if (vals.every((v) => typeof v === "string")) json.type = "string";
				if (vals.every((v) => typeof v === "boolean")) json.type = "boolean";
				if (vals.every((v) => v === null)) json.type = "null";
				json.enum = vals;
			}
		};
		const customProcessor = (_schema, ctx, _json, _params) => {
			if (ctx.unrepresentable === "throw") throw new Error("Custom types cannot be represented in JSON Schema");
		};
		const transformProcessor = (_schema, ctx, _json, _params) => {
			if (ctx.unrepresentable === "throw") throw new Error("Transforms cannot be represented in JSON Schema");
		};
		const arrayProcessor = (schema, ctx, _json, params) => {
			const json = _json;
			const def = schema._zod.def;
			const { minimum, maximum } = schema._zod.bag;
			if (typeof minimum === "number") json.minItems = minimum;
			if (typeof maximum === "number") json.maxItems = maximum;
			json.type = "array";
			json.items = process(def.element, ctx, {
				...params,
				path: [...params.path, "items"]
			});
		};
		const objectProcessor = (schema, ctx, _json, params) => {
			const json = _json;
			const def = schema._zod.def;
			json.type = "object";
			json.properties = {};
			const shape = def.shape;
			for (const key in shape) json.properties[key] = process(shape[key], ctx, {
				...params,
				path: [
					...params.path,
					"properties",
					key
				]
			});
			const allKeys = new Set(Object.keys(shape));
			const requiredKeys = new Set([...allKeys].filter((key) => {
				const v = def.shape[key]._zod;
				if (ctx.io === "input") return v.optin === void 0;
				else return v.optout === void 0;
			}));
			if (requiredKeys.size > 0) json.required = Array.from(requiredKeys);
			if (def.catchall?._zod.def.type === "never") json.additionalProperties = false;
			else if (!def.catchall) {
				if (ctx.io === "output") json.additionalProperties = false;
			} else if (def.catchall) json.additionalProperties = process(def.catchall, ctx, {
				...params,
				path: [...params.path, "additionalProperties"]
			});
		};
		const unionProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			const isExclusive = def.inclusive === false;
			const options = def.options.map((x, i) => process(x, ctx, {
				...params,
				path: [
					...params.path,
					isExclusive ? "oneOf" : "anyOf",
					i
				]
			}));
			if (isExclusive) json.oneOf = options;
			else json.anyOf = options;
		};
		const intersectionProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			const a = process(def.left, ctx, {
				...params,
				path: [
					...params.path,
					"allOf",
					0
				]
			});
			const b = process(def.right, ctx, {
				...params,
				path: [
					...params.path,
					"allOf",
					1
				]
			});
			const isSimpleIntersection = (val) => "allOf" in val && Object.keys(val).length === 1;
			json.allOf = [...isSimpleIntersection(a) ? a.allOf : [a], ...isSimpleIntersection(b) ? b.allOf : [b]];
		};
		const recordProcessor = (schema, ctx, _json, params) => {
			const json = _json;
			const def = schema._zod.def;
			json.type = "object";
			const keyType = def.keyType;
			const patterns = keyType._zod.bag?.patterns;
			if (def.mode === "loose" && patterns && patterns.size > 0) {
				const valueSchema = process(def.valueType, ctx, {
					...params,
					path: [
						...params.path,
						"patternProperties",
						"*"
					]
				});
				json.patternProperties = {};
				for (const pattern of patterns) json.patternProperties[pattern.source] = valueSchema;
			} else {
				if (ctx.target === "draft-07" || ctx.target === "draft-2020-12") json.propertyNames = process(def.keyType, ctx, {
					...params,
					path: [...params.path, "propertyNames"]
				});
				json.additionalProperties = process(def.valueType, ctx, {
					...params,
					path: [...params.path, "additionalProperties"]
				});
			}
			const keyValues = keyType._zod.values;
			if (keyValues) {
				const validKeyValues = [...keyValues].filter((v) => typeof v === "string" || typeof v === "number");
				if (validKeyValues.length > 0) json.required = validKeyValues;
			}
		};
		const nullableProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			const inner = process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			if (ctx.target === "openapi-3.0") {
				seen.ref = def.innerType;
				json.nullable = true;
			} else json.anyOf = [inner, { type: "null" }];
		};
		const nonoptionalProcessor = (schema, ctx, _json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
		};
		const defaultProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			json.default = JSON.parse(JSON.stringify(def.defaultValue));
		};
		const prefaultProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			if (ctx.io === "input") json._prefault = JSON.parse(JSON.stringify(def.defaultValue));
		};
		const catchProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			let catchValue;
			try {
				catchValue = def.catchValue(void 0);
			} catch {
				throw new Error("Dynamic catch values are not supported in JSON Schema");
			}
			json.default = catchValue;
		};
		const pipeProcessor = (schema, ctx, _json, params) => {
			const def = schema._zod.def;
			const inIsTransform = def.in._zod.traits.has("$ZodTransform");
			const innerType = ctx.io === "input" ? inIsTransform ? def.out : def.in : def.out;
			process(innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = innerType;
		};
		const readonlyProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			json.readOnly = true;
		};
		const optionalProcessor = (schema, ctx, _json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
		};
		const lazyProcessor = (schema, ctx, _json, params) => {
			const innerType = schema._zod.innerType;
			process(innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = innerType;
		};
		//#endregion
		//#region ../../DSHarness/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/iso.js
		const ZodISODateTime = /*@__PURE__*/ $constructor("ZodISODateTime", (inst, def) => {
			$ZodISODateTime.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function datetime(params) {
			return /* @__PURE__ */ _isoDateTime(ZodISODateTime, params);
		}
		const ZodISODate = /*@__PURE__*/ $constructor("ZodISODate", (inst, def) => {
			$ZodISODate.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function date(params) {
			return /* @__PURE__ */ _isoDate(ZodISODate, params);
		}
		const ZodISOTime = /*@__PURE__*/ $constructor("ZodISOTime", (inst, def) => {
			$ZodISOTime.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function time(params) {
			return /* @__PURE__ */ _isoTime(ZodISOTime, params);
		}
		const ZodISODuration = /*@__PURE__*/ $constructor("ZodISODuration", (inst, def) => {
			$ZodISODuration.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function duration(params) {
			return /* @__PURE__ */ _isoDuration(ZodISODuration, params);
		}
		//#endregion
		//#region ../../DSHarness/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/errors.js
		const initializer = (inst, issues) => {
			$ZodError.init(inst, issues);
			inst.name = "ZodError";
			Object.defineProperties(inst, {
				format: { value: (mapper) => formatError(inst, mapper) },
				flatten: { value: (mapper) => flattenError(inst, mapper) },
				addIssue: { value: (issue) => {
					inst.issues.push(issue);
					inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
				} },
				addIssues: { value: (issues) => {
					inst.issues.push(...issues);
					inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
				} },
				isEmpty: { get() {
					return inst.issues.length === 0;
				} }
			});
		};
		const ZodRealError = /*@__PURE__*/ $constructor("ZodError", initializer, { Parent: Error });
		//#endregion
		//#region ../../DSHarness/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/parse.js
		const parse = /* @__PURE__ */ _parse(ZodRealError);
		const parseAsync = /* @__PURE__ */ _parseAsync(ZodRealError);
		const safeParse = /* @__PURE__ */ _safeParse(ZodRealError);
		const safeParseAsync = /* @__PURE__ */ _safeParseAsync(ZodRealError);
		const encode = /* @__PURE__ */ _encode(ZodRealError);
		const decode = /* @__PURE__ */ _decode(ZodRealError);
		const encodeAsync = /* @__PURE__ */ _encodeAsync(ZodRealError);
		const decodeAsync = /* @__PURE__ */ _decodeAsync(ZodRealError);
		const safeEncode = /* @__PURE__ */ _safeEncode(ZodRealError);
		const safeDecode = /* @__PURE__ */ _safeDecode(ZodRealError);
		const safeEncodeAsync = /* @__PURE__ */ _safeEncodeAsync(ZodRealError);
		const safeDecodeAsync = /* @__PURE__ */ _safeDecodeAsync(ZodRealError);
		//#endregion
		//#region ../../DSHarness/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/schemas.js
		const _installedGroups = /* @__PURE__ */ new WeakMap();
		function _installLazyMethods(inst, group, methods) {
			const proto = Object.getPrototypeOf(inst);
			let installed = _installedGroups.get(proto);
			if (!installed) {
				installed = /* @__PURE__ */ new Set();
				_installedGroups.set(proto, installed);
			}
			if (installed.has(group)) return;
			installed.add(group);
			for (const key in methods) {
				const fn = methods[key];
				Object.defineProperty(proto, key, {
					configurable: true,
					enumerable: false,
					get() {
						const bound = fn.bind(this);
						Object.defineProperty(this, key, {
							configurable: true,
							writable: true,
							enumerable: true,
							value: bound
						});
						return bound;
					},
					set(v) {
						Object.defineProperty(this, key, {
							configurable: true,
							writable: true,
							enumerable: true,
							value: v
						});
					}
				});
			}
		}
		const ZodType = /*@__PURE__*/ $constructor("ZodType", (inst, def) => {
			$ZodType.init(inst, def);
			Object.assign(inst["~standard"], { jsonSchema: {
				input: createStandardJSONSchemaMethod(inst, "input"),
				output: createStandardJSONSchemaMethod(inst, "output")
			} });
			inst.toJSONSchema = createToJSONSchemaMethod(inst, {});
			inst.def = def;
			inst.type = def.type;
			Object.defineProperty(inst, "_def", { value: def });
			inst.parse = (data, params) => parse(inst, data, params, { callee: inst.parse });
			inst.safeParse = (data, params) => safeParse(inst, data, params);
			inst.parseAsync = async (data, params) => parseAsync(inst, data, params, { callee: inst.parseAsync });
			inst.safeParseAsync = async (data, params) => safeParseAsync(inst, data, params);
			inst.spa = inst.safeParseAsync;
			inst.encode = (data, params) => encode(inst, data, params);
			inst.decode = (data, params) => decode(inst, data, params);
			inst.encodeAsync = async (data, params) => encodeAsync(inst, data, params);
			inst.decodeAsync = async (data, params) => decodeAsync(inst, data, params);
			inst.safeEncode = (data, params) => safeEncode(inst, data, params);
			inst.safeDecode = (data, params) => safeDecode(inst, data, params);
			inst.safeEncodeAsync = async (data, params) => safeEncodeAsync(inst, data, params);
			inst.safeDecodeAsync = async (data, params) => safeDecodeAsync(inst, data, params);
			_installLazyMethods(inst, "ZodType", {
				check(...chks) {
					const def = this.def;
					return this.clone(mergeDefs(def, { checks: [...def.checks ?? [], ...chks.map((ch) => typeof ch === "function" ? { _zod: {
						check: ch,
						def: { check: "custom" },
						onattach: []
					} } : ch)] }), { parent: true });
				},
				with(...chks) {
					return this.check(...chks);
				},
				clone(def, params) {
					return clone(this, def, params);
				},
				brand() {
					return this;
				},
				register(reg, meta) {
					reg.add(this, meta);
					return this;
				},
				refine(check, params) {
					return this.check(refine(check, params));
				},
				superRefine(refinement, params) {
					return this.check(superRefine(refinement, params));
				},
				overwrite(fn) {
					return this.check(/* @__PURE__ */ _overwrite(fn));
				},
				optional() {
					return optional(this);
				},
				exactOptional() {
					return exactOptional(this);
				},
				nullable() {
					return nullable(this);
				},
				nullish() {
					return optional(nullable(this));
				},
				nonoptional(params) {
					return nonoptional(this, params);
				},
				array() {
					return array(this);
				},
				or(arg) {
					return union([this, arg]);
				},
				and(arg) {
					return intersection(this, arg);
				},
				transform(tx) {
					return pipe(this, transform(tx));
				},
				default(d) {
					return _default(this, d);
				},
				prefault(d) {
					return prefault(this, d);
				},
				catch(params) {
					return _catch(this, params);
				},
				pipe(target) {
					return pipe(this, target);
				},
				readonly() {
					return readonly(this);
				},
				describe(description) {
					const cl = this.clone();
					globalRegistry.add(cl, { description });
					return cl;
				},
				meta(...args) {
					if (args.length === 0) return globalRegistry.get(this);
					const cl = this.clone();
					globalRegistry.add(cl, args[0]);
					return cl;
				},
				isOptional() {
					return this.safeParse(void 0).success;
				},
				isNullable() {
					return this.safeParse(null).success;
				},
				apply(fn) {
					return fn(this);
				}
			});
			Object.defineProperty(inst, "description", {
				get() {
					return globalRegistry.get(inst)?.description;
				},
				configurable: true
			});
			return inst;
		});
		/** @internal */
		const _ZodString = /*@__PURE__*/ $constructor("_ZodString", (inst, def) => {
			$ZodString.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => stringProcessor(inst, ctx, json, params);
			const bag = inst._zod.bag;
			inst.format = bag.format ?? null;
			inst.minLength = bag.minimum ?? null;
			inst.maxLength = bag.maximum ?? null;
			_installLazyMethods(inst, "_ZodString", {
				regex(...args) {
					return this.check(/* @__PURE__ */ _regex(...args));
				},
				includes(...args) {
					return this.check(/* @__PURE__ */ _includes(...args));
				},
				startsWith(...args) {
					return this.check(/* @__PURE__ */ _startsWith(...args));
				},
				endsWith(...args) {
					return this.check(/* @__PURE__ */ _endsWith(...args));
				},
				min(...args) {
					return this.check(/* @__PURE__ */ _minLength(...args));
				},
				max(...args) {
					return this.check(/* @__PURE__ */ _maxLength(...args));
				},
				length(...args) {
					return this.check(/* @__PURE__ */ _length(...args));
				},
				nonempty(...args) {
					return this.check(/* @__PURE__ */ _minLength(1, ...args));
				},
				lowercase(params) {
					return this.check(/* @__PURE__ */ _lowercase(params));
				},
				uppercase(params) {
					return this.check(/* @__PURE__ */ _uppercase(params));
				},
				trim() {
					return this.check(/* @__PURE__ */ _trim());
				},
				normalize(...args) {
					return this.check(/* @__PURE__ */ _normalize(...args));
				},
				toLowerCase() {
					return this.check(/* @__PURE__ */ _toLowerCase());
				},
				toUpperCase() {
					return this.check(/* @__PURE__ */ _toUpperCase());
				},
				slugify() {
					return this.check(/* @__PURE__ */ _slugify());
				}
			});
		});
		const ZodString = /*@__PURE__*/ $constructor("ZodString", (inst, def) => {
			$ZodString.init(inst, def);
			_ZodString.init(inst, def);
			inst.email = (params) => inst.check(/* @__PURE__ */ _email(ZodEmail, params));
			inst.url = (params) => inst.check(/* @__PURE__ */ _url(ZodURL, params));
			inst.jwt = (params) => inst.check(/* @__PURE__ */ _jwt(ZodJWT, params));
			inst.emoji = (params) => inst.check(/* @__PURE__ */ _emoji(ZodEmoji, params));
			inst.guid = (params) => inst.check(/* @__PURE__ */ _guid(ZodGUID, params));
			inst.uuid = (params) => inst.check(/* @__PURE__ */ _uuid(ZodUUID, params));
			inst.uuidv4 = (params) => inst.check(/* @__PURE__ */ _uuidv4(ZodUUID, params));
			inst.uuidv6 = (params) => inst.check(/* @__PURE__ */ _uuidv6(ZodUUID, params));
			inst.uuidv7 = (params) => inst.check(/* @__PURE__ */ _uuidv7(ZodUUID, params));
			inst.nanoid = (params) => inst.check(/* @__PURE__ */ _nanoid(ZodNanoID, params));
			inst.guid = (params) => inst.check(/* @__PURE__ */ _guid(ZodGUID, params));
			inst.cuid = (params) => inst.check(/* @__PURE__ */ _cuid(ZodCUID, params));
			inst.cuid2 = (params) => inst.check(/* @__PURE__ */ _cuid2(ZodCUID2, params));
			inst.ulid = (params) => inst.check(/* @__PURE__ */ _ulid(ZodULID, params));
			inst.base64 = (params) => inst.check(/* @__PURE__ */ _base64(ZodBase64, params));
			inst.base64url = (params) => inst.check(/* @__PURE__ */ _base64url(ZodBase64URL, params));
			inst.xid = (params) => inst.check(/* @__PURE__ */ _xid(ZodXID, params));
			inst.ksuid = (params) => inst.check(/* @__PURE__ */ _ksuid(ZodKSUID, params));
			inst.ipv4 = (params) => inst.check(/* @__PURE__ */ _ipv4(ZodIPv4, params));
			inst.ipv6 = (params) => inst.check(/* @__PURE__ */ _ipv6(ZodIPv6, params));
			inst.cidrv4 = (params) => inst.check(/* @__PURE__ */ _cidrv4(ZodCIDRv4, params));
			inst.cidrv6 = (params) => inst.check(/* @__PURE__ */ _cidrv6(ZodCIDRv6, params));
			inst.e164 = (params) => inst.check(/* @__PURE__ */ _e164(ZodE164, params));
			inst.datetime = (params) => inst.check(datetime(params));
			inst.date = (params) => inst.check(date(params));
			inst.time = (params) => inst.check(time(params));
			inst.duration = (params) => inst.check(duration(params));
		});
		function string(params) {
			return /* @__PURE__ */ _string(ZodString, params);
		}
		const ZodStringFormat = /*@__PURE__*/ $constructor("ZodStringFormat", (inst, def) => {
			$ZodStringFormat.init(inst, def);
			_ZodString.init(inst, def);
		});
		const ZodEmail = /*@__PURE__*/ $constructor("ZodEmail", (inst, def) => {
			$ZodEmail.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodGUID = /*@__PURE__*/ $constructor("ZodGUID", (inst, def) => {
			$ZodGUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodUUID = /*@__PURE__*/ $constructor("ZodUUID", (inst, def) => {
			$ZodUUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodURL = /*@__PURE__*/ $constructor("ZodURL", (inst, def) => {
			$ZodURL.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodEmoji = /*@__PURE__*/ $constructor("ZodEmoji", (inst, def) => {
			$ZodEmoji.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodNanoID = /*@__PURE__*/ $constructor("ZodNanoID", (inst, def) => {
			$ZodNanoID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link ZodCUID2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		const ZodCUID = /*@__PURE__*/ $constructor("ZodCUID", (inst, def) => {
			$ZodCUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodCUID2 = /*@__PURE__*/ $constructor("ZodCUID2", (inst, def) => {
			$ZodCUID2.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodULID = /*@__PURE__*/ $constructor("ZodULID", (inst, def) => {
			$ZodULID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodXID = /*@__PURE__*/ $constructor("ZodXID", (inst, def) => {
			$ZodXID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodKSUID = /*@__PURE__*/ $constructor("ZodKSUID", (inst, def) => {
			$ZodKSUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodIPv4 = /*@__PURE__*/ $constructor("ZodIPv4", (inst, def) => {
			$ZodIPv4.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodIPv6 = /*@__PURE__*/ $constructor("ZodIPv6", (inst, def) => {
			$ZodIPv6.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodCIDRv4 = /*@__PURE__*/ $constructor("ZodCIDRv4", (inst, def) => {
			$ZodCIDRv4.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodCIDRv6 = /*@__PURE__*/ $constructor("ZodCIDRv6", (inst, def) => {
			$ZodCIDRv6.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodBase64 = /*@__PURE__*/ $constructor("ZodBase64", (inst, def) => {
			$ZodBase64.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodBase64URL = /*@__PURE__*/ $constructor("ZodBase64URL", (inst, def) => {
			$ZodBase64URL.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodE164 = /*@__PURE__*/ $constructor("ZodE164", (inst, def) => {
			$ZodE164.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodJWT = /*@__PURE__*/ $constructor("ZodJWT", (inst, def) => {
			$ZodJWT.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodNumber = /*@__PURE__*/ $constructor("ZodNumber", (inst, def) => {
			$ZodNumber.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => numberProcessor(inst, ctx, json, params);
			_installLazyMethods(inst, "ZodNumber", {
				gt(value, params) {
					return this.check(/* @__PURE__ */ _gt(value, params));
				},
				gte(value, params) {
					return this.check(/* @__PURE__ */ _gte(value, params));
				},
				min(value, params) {
					return this.check(/* @__PURE__ */ _gte(value, params));
				},
				lt(value, params) {
					return this.check(/* @__PURE__ */ _lt(value, params));
				},
				lte(value, params) {
					return this.check(/* @__PURE__ */ _lte(value, params));
				},
				max(value, params) {
					return this.check(/* @__PURE__ */ _lte(value, params));
				},
				int(params) {
					return this.check(int(params));
				},
				safe(params) {
					return this.check(int(params));
				},
				positive(params) {
					return this.check(/* @__PURE__ */ _gt(0, params));
				},
				nonnegative(params) {
					return this.check(/* @__PURE__ */ _gte(0, params));
				},
				negative(params) {
					return this.check(/* @__PURE__ */ _lt(0, params));
				},
				nonpositive(params) {
					return this.check(/* @__PURE__ */ _lte(0, params));
				},
				multipleOf(value, params) {
					return this.check(/* @__PURE__ */ _multipleOf(value, params));
				},
				step(value, params) {
					return this.check(/* @__PURE__ */ _multipleOf(value, params));
				},
				finite() {
					return this;
				}
			});
			const bag = inst._zod.bag;
			inst.minValue = Math.max(bag.minimum ?? Number.NEGATIVE_INFINITY, bag.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null;
			inst.maxValue = Math.min(bag.maximum ?? Number.POSITIVE_INFINITY, bag.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null;
			inst.isInt = (bag.format ?? "").includes("int") || Number.isSafeInteger(bag.multipleOf ?? .5);
			inst.isFinite = true;
			inst.format = bag.format ?? null;
		});
		function number(params) {
			return /* @__PURE__ */ _number(ZodNumber, params);
		}
		const ZodNumberFormat = /*@__PURE__*/ $constructor("ZodNumberFormat", (inst, def) => {
			$ZodNumberFormat.init(inst, def);
			ZodNumber.init(inst, def);
		});
		function int(params) {
			return /* @__PURE__ */ _int(ZodNumberFormat, params);
		}
		const ZodUndefined = /*@__PURE__*/ $constructor("ZodUndefined", (inst, def) => {
			$ZodUndefined.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => undefinedProcessor(inst, ctx, json, params);
		});
		function _undefined(params) {
			return /* @__PURE__ */ _undefined$1(ZodUndefined, params);
		}
		const ZodUnknown = /*@__PURE__*/ $constructor("ZodUnknown", (inst, def) => {
			$ZodUnknown.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => void 0;
		});
		function unknown() {
			return /* @__PURE__ */ _unknown(ZodUnknown);
		}
		const ZodNever = /*@__PURE__*/ $constructor("ZodNever", (inst, def) => {
			$ZodNever.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => neverProcessor(inst, ctx, json, params);
		});
		function never(params) {
			return /* @__PURE__ */ _never(ZodNever, params);
		}
		const ZodArray = /*@__PURE__*/ $constructor("ZodArray", (inst, def) => {
			$ZodArray.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => arrayProcessor(inst, ctx, json, params);
			inst.element = def.element;
			_installLazyMethods(inst, "ZodArray", {
				min(n, params) {
					return this.check(/* @__PURE__ */ _minLength(n, params));
				},
				nonempty(params) {
					return this.check(/* @__PURE__ */ _minLength(1, params));
				},
				max(n, params) {
					return this.check(/* @__PURE__ */ _maxLength(n, params));
				},
				length(n, params) {
					return this.check(/* @__PURE__ */ _length(n, params));
				},
				unwrap() {
					return this.element;
				}
			});
		});
		function array(element, params) {
			return /* @__PURE__ */ _array(ZodArray, element, params);
		}
		const ZodObject = /*@__PURE__*/ $constructor("ZodObject", (inst, def) => {
			$ZodObjectJIT.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => objectProcessor(inst, ctx, json, params);
			defineLazy(inst, "shape", () => {
				return def.shape;
			});
			_installLazyMethods(inst, "ZodObject", {
				keyof() {
					return _enum(Object.keys(this._zod.def.shape));
				},
				catchall(catchall) {
					return this.clone({
						...this._zod.def,
						catchall
					});
				},
				passthrough() {
					return this.clone({
						...this._zod.def,
						catchall: unknown()
					});
				},
				loose() {
					return this.clone({
						...this._zod.def,
						catchall: unknown()
					});
				},
				strict() {
					return this.clone({
						...this._zod.def,
						catchall: never()
					});
				},
				strip() {
					return this.clone({
						...this._zod.def,
						catchall: void 0
					});
				},
				extend(incoming) {
					return extend(this, incoming);
				},
				safeExtend(incoming) {
					return safeExtend(this, incoming);
				},
				merge(other) {
					return merge(this, other);
				},
				pick(mask) {
					return pick(this, mask);
				},
				omit(mask) {
					return omit(this, mask);
				},
				partial(...args) {
					return partial(ZodOptional, this, args[0]);
				},
				required(...args) {
					return required(ZodNonOptional, this, args[0]);
				}
			});
		});
		function object(shape, params) {
			return new ZodObject({
				type: "object",
				shape: shape ?? {},
				...normalizeParams(params)
			});
		}
		const ZodUnion = /*@__PURE__*/ $constructor("ZodUnion", (inst, def) => {
			$ZodUnion.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => unionProcessor(inst, ctx, json, params);
			inst.options = def.options;
		});
		function union(options, params) {
			return new ZodUnion({
				type: "union",
				options,
				...normalizeParams(params)
			});
		}
		const ZodIntersection = /*@__PURE__*/ $constructor("ZodIntersection", (inst, def) => {
			$ZodIntersection.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => intersectionProcessor(inst, ctx, json, params);
		});
		function intersection(left, right) {
			return new ZodIntersection({
				type: "intersection",
				left,
				right
			});
		}
		const ZodRecord = /*@__PURE__*/ $constructor("ZodRecord", (inst, def) => {
			$ZodRecord.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => recordProcessor(inst, ctx, json, params);
			inst.keyType = def.keyType;
			inst.valueType = def.valueType;
		});
		function record(keyType, valueType, params) {
			if (!valueType || !valueType._zod) return new ZodRecord({
				type: "record",
				keyType: string(),
				valueType: keyType,
				...normalizeParams(valueType)
			});
			return new ZodRecord({
				type: "record",
				keyType,
				valueType,
				...normalizeParams(params)
			});
		}
		const ZodEnum = /*@__PURE__*/ $constructor("ZodEnum", (inst, def) => {
			$ZodEnum.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => enumProcessor(inst, ctx, json, params);
			inst.enum = def.entries;
			inst.options = Object.values(def.entries);
			const keys = new Set(Object.keys(def.entries));
			inst.extract = (values, params) => {
				const newEntries = {};
				for (const value of values) if (keys.has(value)) newEntries[value] = def.entries[value];
				else throw new Error(`Key ${value} not found in enum`);
				return new ZodEnum({
					...def,
					checks: [],
					...normalizeParams(params),
					entries: newEntries
				});
			};
			inst.exclude = (values, params) => {
				const newEntries = { ...def.entries };
				for (const value of values) if (keys.has(value)) delete newEntries[value];
				else throw new Error(`Key ${value} not found in enum`);
				return new ZodEnum({
					...def,
					checks: [],
					...normalizeParams(params),
					entries: newEntries
				});
			};
		});
		function _enum(values, params) {
			return new ZodEnum({
				type: "enum",
				entries: Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values,
				...normalizeParams(params)
			});
		}
		const ZodLiteral = /*@__PURE__*/ $constructor("ZodLiteral", (inst, def) => {
			$ZodLiteral.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => literalProcessor(inst, ctx, json, params);
			inst.values = new Set(def.values);
			Object.defineProperty(inst, "value", { get() {
				if (def.values.length > 1) throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
				return def.values[0];
			} });
		});
		function literal(value, params) {
			return new ZodLiteral({
				type: "literal",
				values: Array.isArray(value) ? value : [value],
				...normalizeParams(params)
			});
		}
		const ZodTransform = /*@__PURE__*/ $constructor("ZodTransform", (inst, def) => {
			$ZodTransform.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => transformProcessor(inst, ctx, json, params);
			inst._zod.parse = (payload, _ctx) => {
				if (_ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
				payload.addIssue = (issue$1) => {
					if (typeof issue$1 === "string") payload.issues.push(issue(issue$1, payload.value, def));
					else {
						const _issue = issue$1;
						if (_issue.fatal) _issue.continue = false;
						_issue.code ?? (_issue.code = "custom");
						_issue.input ?? (_issue.input = payload.value);
						_issue.inst ?? (_issue.inst = inst);
						payload.issues.push(issue(_issue));
					}
				};
				const output = def.transform(payload.value, payload);
				if (output instanceof Promise) return output.then((output) => {
					payload.value = output;
					payload.fallback = true;
					return payload;
				});
				payload.value = output;
				payload.fallback = true;
				return payload;
			};
		});
		function transform(fn) {
			return new ZodTransform({
				type: "transform",
				transform: fn
			});
		}
		const ZodOptional = /*@__PURE__*/ $constructor("ZodOptional", (inst, def) => {
			$ZodOptional.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function optional(innerType) {
			return new ZodOptional({
				type: "optional",
				innerType
			});
		}
		const ZodExactOptional = /*@__PURE__*/ $constructor("ZodExactOptional", (inst, def) => {
			$ZodExactOptional.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function exactOptional(innerType) {
			return new ZodExactOptional({
				type: "optional",
				innerType
			});
		}
		const ZodNullable = /*@__PURE__*/ $constructor("ZodNullable", (inst, def) => {
			$ZodNullable.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => nullableProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function nullable(innerType) {
			return new ZodNullable({
				type: "nullable",
				innerType
			});
		}
		const ZodDefault = /*@__PURE__*/ $constructor("ZodDefault", (inst, def) => {
			$ZodDefault.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => defaultProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
			inst.removeDefault = inst.unwrap;
		});
		function _default(innerType, defaultValue) {
			return new ZodDefault({
				type: "default",
				innerType,
				get defaultValue() {
					return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
				}
			});
		}
		const ZodPrefault = /*@__PURE__*/ $constructor("ZodPrefault", (inst, def) => {
			$ZodPrefault.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => prefaultProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function prefault(innerType, defaultValue) {
			return new ZodPrefault({
				type: "prefault",
				innerType,
				get defaultValue() {
					return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
				}
			});
		}
		const ZodNonOptional = /*@__PURE__*/ $constructor("ZodNonOptional", (inst, def) => {
			$ZodNonOptional.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => nonoptionalProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function nonoptional(innerType, params) {
			return new ZodNonOptional({
				type: "nonoptional",
				innerType,
				...normalizeParams(params)
			});
		}
		const ZodCatch = /*@__PURE__*/ $constructor("ZodCatch", (inst, def) => {
			$ZodCatch.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => catchProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
			inst.removeCatch = inst.unwrap;
		});
		function _catch(innerType, catchValue) {
			return new ZodCatch({
				type: "catch",
				innerType,
				catchValue: typeof catchValue === "function" ? catchValue : () => catchValue
			});
		}
		const ZodPipe = /*@__PURE__*/ $constructor("ZodPipe", (inst, def) => {
			$ZodPipe.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => pipeProcessor(inst, ctx, json, params);
			inst.in = def.in;
			inst.out = def.out;
		});
		function pipe(in_, out) {
			return new ZodPipe({
				type: "pipe",
				in: in_,
				out
			});
		}
		const ZodReadonly = /*@__PURE__*/ $constructor("ZodReadonly", (inst, def) => {
			$ZodReadonly.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => readonlyProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function readonly(innerType) {
			return new ZodReadonly({
				type: "readonly",
				innerType
			});
		}
		const ZodLazy = /*@__PURE__*/ $constructor("ZodLazy", (inst, def) => {
			$ZodLazy.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => lazyProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.getter();
		});
		function lazy(getter) {
			return new ZodLazy({
				type: "lazy",
				getter
			});
		}
		const ZodCustom = /*@__PURE__*/ $constructor("ZodCustom", (inst, def) => {
			$ZodCustom.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => customProcessor(inst, ctx, json, params);
		});
		function refine(fn, _params = {}) {
			return /* @__PURE__ */ _refine(ZodCustom, fn, _params);
		}
		function superRefine(fn, params) {
			return /* @__PURE__ */ _superRefine(fn, params);
		}
		//#endregion
		//#region lib/typert.remote-client.js
		const JsonValueRemoteCodec$schema = union([
			literal(null),
			string(),
			number(),
			literal(false),
			literal(true),
			record(string(), lazy(() => JsonValueRemoteCodec$schema)),
			array(lazy(() => JsonValueRemoteCodec$schema))
		]);
		const JsonValueRemoteCodec$schema2 = union([
			literal(null),
			string(),
			number(),
			literal(false),
			literal(true),
			record(string(), lazy(() => JsonValueRemoteCodec$schema2)),
			array(lazy(() => JsonValueRemoteCodec$schema2))
		]);
		const JsonValueRemoteCodec$schema3 = union([
			literal(null),
			string(),
			number(),
			literal(false),
			literal(true),
			record(string(), lazy(() => JsonValueRemoteCodec$schema3)),
			array(lazy(() => JsonValueRemoteCodec$schema3))
		]);
		const JsonValueRemoteCodec$schema4 = union([
			literal(null),
			string(),
			number(),
			literal(false),
			literal(true),
			record(string(), lazy(() => JsonValueRemoteCodec$schema4)),
			array(lazy(() => JsonValueRemoteCodec$schema4))
		]);
		const JsonValueRemoteCodec$schema5 = union([
			literal(null),
			string(),
			number(),
			literal(false),
			literal(true),
			record(string(), lazy(() => JsonValueRemoteCodec$schema5)),
			array(lazy(() => JsonValueRemoteCodec$schema5))
		]);
		const _deepseek_ai_dsh_plugin_xiangqi_xiangqi_get_parameter_0$schema = intersection(string(), unknown());
		const _deepseek_ai_dsh_plugin_xiangqi_xiangqi_get_parameter_1$schema = union([_undefined(), string()]);
		const _deepseek_ai_dsh_plugin_xiangqi_xiangqi_get_result$schema = object({
			"gameId": string().readonly(),
			"sessionId": string().readonly().optional(),
			"revision": number().readonly(),
			"phase": union([literal("active"), literal("resigned")]).readonly(),
			"winner": union([literal("red"), literal("black")]).readonly().optional(),
			"gameState": union([
				literal(null),
				string(),
				number(),
				literal(false),
				literal(true),
				record(string(), lazy(() => JsonValueRemoteCodec$schema3)),
				array(lazy(() => JsonValueRemoteCodec$schema3))
			]).readonly(),
			"lastMove": object({
				"from": string().readonly(),
				"to": string().readonly()
			}).readonly().optional()
		});
		const _deepseek_ai_dsh_plugin_xiangqi_xiangqi_move_parameter_0$schema = intersection(string(), unknown());
		const _deepseek_ai_dsh_plugin_xiangqi_xiangqi_move_parameter_1$schema = object({
			"gameId": string().readonly(),
			"revision": number().readonly(),
			"move": object({
				"from": string().readonly(),
				"to": string().readonly()
			}).readonly()
		});
		const _deepseek_ai_dsh_plugin_xiangqi_xiangqi_move_result$schema = object({
			"gameId": string().readonly(),
			"sessionId": string().readonly().optional(),
			"revision": number().readonly(),
			"phase": union([literal("active"), literal("resigned")]).readonly(),
			"winner": union([literal("red"), literal("black")]).readonly().optional(),
			"gameState": union([
				literal(null),
				string(),
				number(),
				literal(false),
				literal(true),
				record(string(), lazy(() => JsonValueRemoteCodec$schema4)),
				array(lazy(() => JsonValueRemoteCodec$schema4))
			]).readonly(),
			"lastMove": object({
				"from": string().readonly(),
				"to": string().readonly()
			}).readonly().optional()
		});
		const _deepseek_ai_dsh_plugin_xiangqi_xiangqi_newGame_parameter_0$schema = intersection(string(), unknown());
		const _deepseek_ai_dsh_plugin_xiangqi_xiangqi_newGame_parameter_1$schema = union([_undefined(), object({ "sessionId": string().readonly().optional() })]);
		const _deepseek_ai_dsh_plugin_xiangqi_xiangqi_newGame_result$schema = object({
			"gameId": string().readonly(),
			"sessionId": string().readonly().optional(),
			"revision": number().readonly(),
			"phase": union([literal("active"), literal("resigned")]).readonly(),
			"winner": union([literal("red"), literal("black")]).readonly().optional(),
			"gameState": union([
				literal(null),
				string(),
				number(),
				literal(false),
				literal(true),
				record(string(), lazy(() => JsonValueRemoteCodec$schema2)),
				array(lazy(() => JsonValueRemoteCodec$schema2))
			]).readonly(),
			"lastMove": object({
				"from": string().readonly(),
				"to": string().readonly()
			}).readonly().optional()
		});
		const _deepseek_ai_dsh_plugin_xiangqi_xiangqi_resign_parameter_0$schema = intersection(string(), unknown());
		const _deepseek_ai_dsh_plugin_xiangqi_xiangqi_resign_parameter_1$schema = object({
			"gameId": string().readonly(),
			"revision": number().readonly(),
			"side": union([literal("red"), literal("black")]).readonly()
		});
		const _deepseek_ai_dsh_plugin_xiangqi_xiangqi_resign_result$schema = object({
			"gameId": string().readonly(),
			"sessionId": string().readonly().optional(),
			"revision": number().readonly(),
			"phase": union([literal("active"), literal("resigned")]).readonly(),
			"winner": union([literal("red"), literal("black")]).readonly().optional(),
			"gameState": union([
				literal(null),
				string(),
				number(),
				literal(false),
				literal(true),
				record(string(), lazy(() => JsonValueRemoteCodec$schema)),
				array(lazy(() => JsonValueRemoteCodec$schema))
			]).readonly(),
			"lastMove": object({
				"from": string().readonly(),
				"to": string().readonly()
			}).readonly().optional()
		});
		const _deepseek_ai_dsh_plugin_xiangqi_xiangqi_undo_parameter_0$schema = intersection(string(), unknown());
		const _deepseek_ai_dsh_plugin_xiangqi_xiangqi_undo_parameter_1$schema = object({
			"gameId": string().readonly(),
			"revision": number().readonly()
		});
		const _deepseek_ai_dsh_plugin_xiangqi_xiangqi_undo_result$schema = object({
			"gameId": string().readonly(),
			"sessionId": string().readonly().optional(),
			"revision": number().readonly(),
			"phase": union([literal("active"), literal("resigned")]).readonly(),
			"winner": union([literal("red"), literal("black")]).readonly().optional(),
			"gameState": union([
				literal(null),
				string(),
				number(),
				literal(false),
				literal(true),
				record(string(), lazy(() => JsonValueRemoteCodec$schema5)),
				array(lazy(() => JsonValueRemoteCodec$schema5))
			]).readonly(),
			"lastMove": object({
				"from": string().readonly(),
				"to": string().readonly()
			}).readonly().optional()
		});
		const TYPERT_REMOTE = {
			package: "@deepseek-ai/dsh-plugin-xiangqi",
			descriptors: [
				{
					id: "@deepseek-ai/dsh-plugin-xiangqi#xiangqi/get",
					service: "xiangqi",
					namespace: "xiangqi",
					method: "get",
					invocation: { kind: "direct" },
					scope: {
						context: "agent",
						wire: "agentId"
					},
					parameters: [{
						name: "agent",
						wire: "agentId",
						source: "lookup",
						lookup: "agent",
						codec: {
							mode: "strict",
							typeSymbol: "@deepseek-ai/dsh-session/types#SessionId",
							schema: _deepseek_ai_dsh_plugin_xiangqi_xiangqi_get_parameter_0$schema
						}
					}, {
						name: "gameId",
						wire: "gameId",
						source: "json",
						acceptsUndefined: true,
						codec: {
							mode: "strict",
							typeSymbol: "@deepseek-ai/dsh-plugin-xiangqi#xiangqi/get:gameId",
							schema: _deepseek_ai_dsh_plugin_xiangqi_xiangqi_get_parameter_1$schema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "@deepseek-ai/dsh-plugin-xiangqi/types#XiangqiSerializedState",
						schema: _deepseek_ai_dsh_plugin_xiangqi_xiangqi_get_result$schema
					},
					sourceLocation: {
						"file": "packages/extensions/xiangqi-validation/src/host/dsh-service.ts",
						"line": 84,
						"column": 3
					}
				},
				{
					id: "@deepseek-ai/dsh-plugin-xiangqi#xiangqi/move",
					service: "xiangqi",
					namespace: "xiangqi",
					method: "move",
					invocation: { kind: "direct" },
					scope: {
						context: "agent",
						wire: "agentId"
					},
					parameters: [{
						name: "agent",
						wire: "agentId",
						source: "lookup",
						lookup: "agent",
						codec: {
							mode: "strict",
							typeSymbol: "@deepseek-ai/dsh-session/types#SessionId",
							schema: _deepseek_ai_dsh_plugin_xiangqi_xiangqi_move_parameter_0$schema
						}
					}, {
						name: "request",
						wire: "request",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "@deepseek-ai/dsh-plugin-xiangqi/types#XiangqiMoveRequest",
							schema: _deepseek_ai_dsh_plugin_xiangqi_xiangqi_move_parameter_1$schema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "@deepseek-ai/dsh-plugin-xiangqi/types#XiangqiSerializedState",
						schema: _deepseek_ai_dsh_plugin_xiangqi_xiangqi_move_result$schema
					},
					sourceLocation: {
						"file": "packages/extensions/xiangqi-validation/src/host/dsh-service.ts",
						"line": 91,
						"column": 3
					}
				},
				{
					id: "@deepseek-ai/dsh-plugin-xiangqi#xiangqi/newGame",
					service: "xiangqi",
					namespace: "xiangqi",
					method: "newGame",
					invocation: { kind: "direct" },
					scope: {
						context: "agent",
						wire: "agentId"
					},
					parameters: [{
						name: "agent",
						wire: "agentId",
						source: "lookup",
						lookup: "agent",
						codec: {
							mode: "strict",
							typeSymbol: "@deepseek-ai/dsh-session/types#SessionId",
							schema: _deepseek_ai_dsh_plugin_xiangqi_xiangqi_newGame_parameter_0$schema
						}
					}, {
						name: "_request",
						wire: "_request",
						source: "json",
						acceptsUndefined: true,
						codec: {
							mode: "strict",
							typeSymbol: "@deepseek-ai/dsh-plugin-xiangqi/types#XiangqiNewGameRequest",
							schema: _deepseek_ai_dsh_plugin_xiangqi_xiangqi_newGame_parameter_1$schema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "@deepseek-ai/dsh-plugin-xiangqi/types#XiangqiSerializedState",
						schema: _deepseek_ai_dsh_plugin_xiangqi_xiangqi_newGame_result$schema
					},
					sourceLocation: {
						"file": "packages/extensions/xiangqi-validation/src/host/dsh-service.ts",
						"line": 77,
						"column": 3
					}
				},
				{
					id: "@deepseek-ai/dsh-plugin-xiangqi#xiangqi/resign",
					service: "xiangqi",
					namespace: "xiangqi",
					method: "resign",
					invocation: { kind: "direct" },
					scope: {
						context: "agent",
						wire: "agentId"
					},
					parameters: [{
						name: "agent",
						wire: "agentId",
						source: "lookup",
						lookup: "agent",
						codec: {
							mode: "strict",
							typeSymbol: "@deepseek-ai/dsh-session/types#SessionId",
							schema: _deepseek_ai_dsh_plugin_xiangqi_xiangqi_resign_parameter_0$schema
						}
					}, {
						name: "request",
						wire: "request",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "@deepseek-ai/dsh-plugin-xiangqi/types#XiangqiResignRequest",
							schema: _deepseek_ai_dsh_plugin_xiangqi_xiangqi_resign_parameter_1$schema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "@deepseek-ai/dsh-plugin-xiangqi/types#XiangqiSerializedState",
						schema: _deepseek_ai_dsh_plugin_xiangqi_xiangqi_resign_result$schema
					},
					sourceLocation: {
						"file": "packages/extensions/xiangqi-validation/src/host/dsh-service.ts",
						"line": 103,
						"column": 3
					}
				},
				{
					id: "@deepseek-ai/dsh-plugin-xiangqi#xiangqi/undo",
					service: "xiangqi",
					namespace: "xiangqi",
					method: "undo",
					invocation: { kind: "direct" },
					scope: {
						context: "agent",
						wire: "agentId"
					},
					parameters: [{
						name: "agent",
						wire: "agentId",
						source: "lookup",
						lookup: "agent",
						codec: {
							mode: "strict",
							typeSymbol: "@deepseek-ai/dsh-session/types#SessionId",
							schema: _deepseek_ai_dsh_plugin_xiangqi_xiangqi_undo_parameter_0$schema
						}
					}, {
						name: "request",
						wire: "request",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "@deepseek-ai/dsh-plugin-xiangqi/types#XiangqiUndoRequest",
							schema: _deepseek_ai_dsh_plugin_xiangqi_xiangqi_undo_parameter_1$schema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "@deepseek-ai/dsh-plugin-xiangqi/types#XiangqiSerializedState",
						schema: _deepseek_ai_dsh_plugin_xiangqi_xiangqi_undo_result$schema
					},
					sourceLocation: {
						"file": "packages/extensions/xiangqi-validation/src/host/dsh-service.ts",
						"line": 97,
						"column": 3
					}
				}
			]
		};
		//#endregion
		//#region lib/types/game/coordinates.js
		const FILES = "abcdefghi";
		function isOnBoard(position) {
			return Number.isInteger(position.x) && Number.isInteger(position.y) && position.x >= 0 && position.x < 9 && position.y >= 0 && position.y < 10;
		}
		function assertPosition(position) {
			if (!isOnBoard(position)) throw new RangeError(`棋盘坐标越界: (${position.x},${position.y})`);
			return {
				x: position.x,
				y: position.y
			};
		}
		function positionToIndex(position) {
			assertPosition(position);
			return position.y * 9 + position.x;
		}
		function indexToPosition(index) {
			if (!Number.isInteger(index) || index < 0 || index >= 90) throw new RangeError(`棋盘索引越界: ${index}`);
			return {
				x: index % 9,
				y: Math.floor(index / 9)
			};
		}
		/**
		* 将内部坐标转成 UCCI/PEN 风格的两字符坐标。
		* 例如红帅初始位置为 e0，黑将初始位置为 e9。
		*/
		function formatCoordinate(position) {
			assertPosition(position);
			return `${FILES[position.x]}${9 - position.y}`;
		}
		/** 支持 a9..i0，也支持用于 UI 调试的“x,y”形式。 */
		function parseCoordinate(value) {
			if (typeof value !== "string") return assertPosition(value);
			const text = value.trim().toLowerCase();
			const coordinate = /^([a-i])([0-9])$/.exec(text);
			if (coordinate) return {
				x: FILES.indexOf(coordinate[1]),
				y: 9 - Number(coordinate[2])
			};
			const pair = /^(\d)\s*,\s*(\d)$/.exec(text);
			if (pair) return assertPosition({
				x: Number(pair[1]),
				y: Number(pair[2])
			});
			throw new TypeError(`无法解析棋盘坐标“${value}”，应为 a9..i0 或 x,y`);
		}
		function clonePosition(position) {
			return {
				x: position.x,
				y: position.y
			};
		}
		//#endregion
		//#region lib/types/game/notation.js
		function pieceLabel$1(piece) {
			if (piece.type === "general") return piece.side === "red" ? "帅" : "将";
			if (piece.type === "advisor") return piece.side === "red" ? "仕" : "士";
			if (piece.type === "elephant") return piece.side === "red" ? "相" : "象";
			if (piece.type === "horse") return "马";
			if (piece.type === "rook") return "车";
			if (piece.type === "cannon") return "炮";
			return piece.side === "red" ? "兵" : "卒";
		}
		/** 将记录转换成可直接展示的中文棋谱，附带将军/将死标记。 */
		function formatMoveRecord(record) {
			if (record.result === "checkmate") return `${record.notation}将死`;
			if (record.givesCheck) return `${record.notation}将军`;
			return record.notation;
		}
		function getPieceLabel(piece) {
			return pieceLabel$1(piece);
		}
		//#endregion
		//#region lib/types/game/rules.js
		var InvalidPositionError = class extends Error {
			code = "INVALID_POSITION";
			constructor(message) {
				super(message);
				this.name = "InvalidPositionError";
			}
		};
		function otherSide$1(side) {
			return side === "red" ? "black" : "red";
		}
		function clonePiece(piece) {
			return piece ? {
				side: piece.side,
				type: piece.type
			} : null;
		}
		function cloneBoard(board) {
			return board.map(clonePiece);
		}
		function validSide(value) {
			return value === "red" || value === "black";
		}
		function validPieceType(value) {
			return value === "general" || value === "advisor" || value === "elephant" || value === "horse" || value === "rook" || value === "cannon" || value === "soldier";
		}
		function validateBoard(board) {
			if (board.length !== 90) throw new InvalidPositionError(`棋盘必须正好有 90 个格子`);
			let redGeneralCount = 0;
			let blackGeneralCount = 0;
			for (const piece of board) {
				if (piece === null) continue;
				if (!validSide(piece.side) || !validPieceType(piece.type)) throw new InvalidPositionError("棋盘包含未知棋子");
				if (piece.type === "general") if (piece.side === "red") redGeneralCount += 1;
				else blackGeneralCount += 1;
			}
			if (redGeneralCount !== 1 || blackGeneralCount !== 1) throw new InvalidPositionError("合法局面必须恰好包含一个红帅和一个黑将");
		}
		/** 内部和 FEN 解析共用的状态构造器；会重新计算将军和终局状态。 */
		function makeGameState(board, turn, options = {}) {
			validateBoard(board);
			if (!validSide(turn)) throw new InvalidPositionError(`未知轮次: ${String(turn)}`);
			const halfmoveClock = options.halfmoveClock ?? 0;
			const fullmoveNumber = options.fullmoveNumber ?? 1;
			if (!Number.isInteger(halfmoveClock) || halfmoveClock < 0) throw new InvalidPositionError("半回合计数必须是非负整数");
			if (!Number.isInteger(fullmoveNumber) || fullmoveNumber < 1) throw new InvalidPositionError("全回合计数必须是正整数");
			const copiedHistory = (options.history ?? []).map(cloneMoveRecord);
			const evaluation = evaluateBoard(board, turn);
			return {
				board: cloneBoard(board),
				turn,
				inCheck: evaluation.inCheck,
				status: evaluation.status,
				winner: evaluation.winner,
				halfmoveClock,
				fullmoveNumber,
				history: copiedHistory,
				lastMove: copiedHistory.length > 0 ? copiedHistory[copiedHistory.length - 1] : null
			};
		}
		function getLegalMoves(game, from) {
			if (game.status !== "playing") return [];
			const moves = generateLegalMoves(game.board, game.turn);
			if (from === void 0) return moves;
			const normalized = parseCoordinate(from);
			return moves.filter((move) => move.from.x === normalized.x && move.from.y === normalized.y);
		}
		function cloneMoveRecord(record) {
			return {
				from: clonePosition(record.from),
				to: clonePosition(record.to),
				piece: clonePiece(record.piece),
				captured: clonePiece(record.captured),
				notation: record.notation,
				givesCheck: record.givesCheck,
				result: record.result,
				halfmoveClockBefore: record.halfmoveClockBefore,
				fullmoveNumberBefore: record.fullmoveNumberBefore
			};
		}
		function evaluateBoard(board, turn) {
			const general = findGeneral(board, turn);
			if (!general) throw new InvalidPositionError(`${turn}方缺少将帅`);
			const inCheck = isSquareAttacked(board, general, otherSide$1(turn));
			if (generateLegalMoves(board, turn).length > 0) return {
				inCheck,
				status: "playing",
				winner: null
			};
			if (inCheck) return {
				inCheck,
				status: "checkmate",
				winner: otherSide$1(turn)
			};
			return {
				inCheck,
				status: "stalemate",
				winner: null
			};
		}
		function generateLegalMoves(board, side) {
			const pseudoMoves = generatePseudoMoves(board, side);
			const legalMoves = [];
			for (const move of pseudoMoves) if (!isInCheckOnBoard(applyMoveToBoard(board, move), side)) legalMoves.push(move);
			return legalMoves;
		}
		/**
		* 生成某方的全部伪走法（含把己方将帅置于被将军状态、以及不可取的非法走法）。
		* 导出给 AI 搜索内核，内核会做就地走子 + 单点将军过滤以节省每次克隆整盘的开销，
		* 从而与规则引擎共用同一套走法与判定，避免搜索与规则失同步。
		*/
		function generatePseudoMoves(board, side) {
			const moves = [];
			for (let index = 0; index < 90; index += 1) {
				const piece = board[index];
				if (!piece || piece.side !== side) continue;
				const from = indexToPosition(index);
				for (const to of getPseudoTargets(board, from, piece)) {
					const captured = board[positionToIndex(to)];
					if (captured?.side === side) continue;
					if (captured?.type === "general") continue;
					moves.push({
						from: clonePosition(from),
						to: clonePosition(to),
						piece: clonePiece(piece),
						captured: clonePiece(captured)
					});
				}
			}
			return moves;
		}
		function applyMoveToBoard(board, move) {
			const nextBoard = cloneBoard(board);
			nextBoard[positionToIndex(move.from)] = null;
			nextBoard[positionToIndex(move.to)] = clonePiece(move.piece);
			return nextBoard;
		}
		function getPseudoTargets(board, from, piece) {
			switch (piece.type) {
				case "general": return getGeneralTargets(from, piece.side);
				case "advisor": return getAdvisorTargets(from, piece.side);
				case "elephant": return getElephantTargets(board, from, piece.side);
				case "horse": return getHorseTargets(board, from);
				case "rook": return getRookTargets(board, from);
				case "cannon": return getCannonTargets(board, from, piece.side);
				case "soldier": return getSoldierTargets(from, piece.side);
			}
		}
		function getGeneralTargets(from, side) {
			const targets = [];
			for (const [dx, dy] of [
				[-1, 0],
				[1, 0],
				[0, -1],
				[0, 1]
			]) {
				const target = {
					x: from.x + dx,
					y: from.y + dy
				};
				if (isInPalace(target, side)) targets.push(target);
			}
			return targets;
		}
		function getAdvisorTargets(from, side) {
			const targets = [];
			for (const [dx, dy] of [
				[-1, -1],
				[1, -1],
				[-1, 1],
				[1, 1]
			]) {
				const target = {
					x: from.x + dx,
					y: from.y + dy
				};
				if (isInPalace(target, side)) targets.push(target);
			}
			return targets;
		}
		function getElephantTargets(board, from, side) {
			const targets = [];
			for (const [dx, dy] of [
				[-2, -2],
				[2, -2],
				[-2, 2],
				[2, 2]
			]) {
				const target = {
					x: from.x + dx,
					y: from.y + dy
				};
				const eye = {
					x: from.x + dx / 2,
					y: from.y + dy / 2
				};
				if (isInElephantTerritory(target, side) && isEmpty(board, eye)) targets.push(target);
			}
			return targets;
		}
		function getHorseTargets(board, from) {
			const targets = [];
			for (const [dx, dy, legX, legY] of [
				[
					-2,
					-1,
					-1,
					0
				],
				[
					-2,
					1,
					-1,
					0
				],
				[
					2,
					-1,
					1,
					0
				],
				[
					2,
					1,
					1,
					0
				],
				[
					-1,
					-2,
					0,
					-1
				],
				[
					1,
					-2,
					0,
					-1
				],
				[
					-1,
					2,
					0,
					1
				],
				[
					1,
					2,
					0,
					1
				]
			]) {
				const target = {
					x: from.x + dx,
					y: from.y + dy
				};
				const leg = {
					x: from.x + legX,
					y: from.y + legY
				};
				if (isOnBoardSafe(target) && isEmpty(board, leg)) targets.push(target);
			}
			return targets;
		}
		function getRookTargets(board, from) {
			return getSlidingTargets(board, from);
		}
		function getCannonTargets(board, from, side) {
			const targets = [];
			for (const [dx, dy] of [
				[-1, 0],
				[1, 0],
				[0, -1],
				[0, 1]
			]) {
				let x = from.x + dx;
				let y = from.y + dy;
				let hasScreen = false;
				while (isOnBoardSafe({
					x,
					y
				})) {
					const piece = board[y * 9 + x];
					if (!hasScreen) if (piece === null) targets.push({
						x,
						y
					});
					else hasScreen = true;
					else if (piece !== null) {
						if (piece.side !== side) targets.push({
							x,
							y
						});
						break;
					}
					x += dx;
					y += dy;
				}
			}
			return targets;
		}
		function getSlidingTargets(board, from) {
			const targets = [];
			for (const [dx, dy] of [
				[-1, 0],
				[1, 0],
				[0, -1],
				[0, 1]
			]) {
				let x = from.x + dx;
				let y = from.y + dy;
				while (isOnBoardSafe({
					x,
					y
				})) {
					const piece = board[y * 9 + x];
					if (piece === null) targets.push({
						x,
						y
					});
					else {
						if (piece.side !== board[positionToIndex(from)]?.side) targets.push({
							x,
							y
						});
						break;
					}
					x += dx;
					y += dy;
				}
			}
			return targets;
		}
		function getSoldierTargets(from, side) {
			const targets = [];
			const forward = side === "red" ? -1 : 1;
			const forwardTarget = {
				x: from.x,
				y: from.y + forward
			};
			if (isOnBoardSafe(forwardTarget)) targets.push(forwardTarget);
			if (side === "red" ? from.y <= 4 : from.y >= 5) for (const dx of [-1, 1]) {
				const target = {
					x: from.x + dx,
					y: from.y
				};
				if (isOnBoardSafe(target)) targets.push(target);
			}
			return targets;
		}
		/**
		* 就地走子后判断某方是否处于被将军状态。
		* 导出给 AI 搜索内核做单点合法性过滤，避免每次全量克隆棋盘。
		*/
		function isInCheckOnBoard(board, side) {
			const general = findGeneral(board, side);
			if (!general) return true;
			return isSquareAttacked(board, general, otherSide$1(side));
		}
		function findGeneral(board, side) {
			for (let index = 0; index < board.length; index += 1) {
				const piece = board[index];
				if (piece?.side === side && piece.type === "general") return indexToPosition(index);
			}
			return null;
		}
		/** 判断某格是否被 bySide 的一方攻击。 */
		function isSquareAttacked(board, target, bySide) {
			for (let index = 0; index < 90; index += 1) {
				const piece = board[index];
				if (!piece || piece.side !== bySide) continue;
				if (pieceAttacksSquare(board, indexToPosition(index), piece, target)) return true;
			}
			return false;
		}
		function pieceAttacksSquare(board, from, piece, target) {
			const dx = target.x - from.x;
			const dy = target.y - from.y;
			const absX = Math.abs(dx);
			const absY = Math.abs(dy);
			switch (piece.type) {
				case "general": return absX + absY === 1 || from.x === target.x && countBetween(board, from, target) === 0;
				case "advisor": return absX === 1 && absY === 1;
				case "elephant": return absX === 2 && absY === 2 && isEmpty(board, {
					x: from.x + dx / 2,
					y: from.y + dy / 2
				});
				case "horse":
					if (!(absX === 2 && absY === 1 || absX === 1 && absY === 2)) return false;
					return isEmpty(board, absX === 2 ? {
						x: from.x + dx / 2,
						y: from.y
					} : {
						x: from.x,
						y: from.y + dy / 2
					});
				case "rook": return (from.x === target.x || from.y === target.y) && countBetween(board, from, target) === 0;
				case "cannon": {
					if (from.x !== target.x && from.y !== target.y) return false;
					const blockers = countBetween(board, from, target);
					return board[positionToIndex(target)] === null ? blockers === 0 : blockers === 1;
				}
				case "soldier": {
					const forward = piece.side === "red" ? -1 : 1;
					if (dx === 0 && dy === forward) return true;
					return (piece.side === "red" ? from.y <= 4 : from.y >= 5) && absX === 1 && dy === 0;
				}
			}
		}
		function countBetween(board, from, target) {
			if (from.x !== target.x && from.y !== target.y) return Number.POSITIVE_INFINITY;
			const stepX = Math.sign(target.x - from.x);
			const stepY = Math.sign(target.y - from.y);
			let x = from.x + stepX;
			let y = from.y + stepY;
			let count = 0;
			while (x !== target.x || y !== target.y) {
				if (board[y * 9 + x] !== null) count += 1;
				x += stepX;
				y += stepY;
			}
			return count;
		}
		function isEmpty(board, position) {
			return isOnBoardSafe(position) && board[position.y * 9 + position.x] === null;
		}
		function isOnBoardSafe(position) {
			return position.x >= 0 && position.x < 9 && position.y >= 0 && position.y < 10;
		}
		function isInPalace(position, side) {
			if (position.x < 3 || position.x > 5) return false;
			return side === "red" ? position.y >= 7 && position.y <= 9 : position.y >= 0 && position.y <= 2;
		}
		function isInElephantTerritory(position, side) {
			return side === "red" ? position.y >= 5 && position.y <= 9 : position.y >= 0 && position.y <= 4;
		}
		//#endregion
		//#region lib/types/game/serialization.js
		const FEN_BY_TYPE = {
			general: "k",
			advisor: "a",
			elephant: "b",
			horse: "n",
			rook: "r",
			cannon: "c",
			soldier: "p"
		};
		const TYPE_BY_FEN = {
			k: "general",
			a: "advisor",
			b: "elephant",
			n: "horse",
			r: "rook",
			c: "cannon",
			p: "soldier"
		};
		function pieceToFen(piece) {
			const code = FEN_BY_TYPE[piece.type];
			return piece.side === "red" ? code.toUpperCase() : code;
		}
		function parseFenPiece(code) {
			const type = TYPE_BY_FEN[code.toLowerCase()];
			if (!type) throw new InvalidPositionError(`未知 FEN 棋子: ${code}`);
			return {
				side: code === code.toUpperCase() ? "red" : "black",
				type
			};
		}
		function toFen(game) {
			const rows = [];
			for (let y = 0; y < 10; y += 1) {
				let row = "";
				let empty = 0;
				for (let x = 0; x < 9; x += 1) {
					const piece = game.board[y * 9 + x];
					if (piece === null) {
						empty += 1;
						continue;
					}
					if (empty > 0) {
						row += String(empty);
						empty = 0;
					}
					row += pieceToFen(piece);
				}
				if (empty > 0) row += String(empty);
				rows.push(row);
			}
			const side = game.turn === "red" ? "w" : "b";
			return `${rows.join("/")} ${side} - - ${game.halfmoveClock} ${game.fullmoveNumber}`;
		}
		function fromFen(fen) {
			const fields = fen.trim().split(/\s+/);
			if (fields.length < 2 || fields.length > 6) throw new InvalidPositionError("FEN 至少需要棋盘布局和轮次字段");
			return makeGameState(parsePlacement(fields[0]), parseSide(fields[1]), {
				halfmoveClock: fields[4] === void 0 || fields[4] === "-" ? 0 : parseNonNegativeInt(fields[4], "半回合计数"),
				fullmoveNumber: fields[5] === void 0 || fields[5] === "-" ? 1 : parsePositiveInt(fields[5], "全回合计数")
			});
		}
		function deserialize(serialized) {
			const text = serialized.trim();
			if (text.length === 0) throw new InvalidPositionError("不能反序列化空字符串");
			if (!text.startsWith("{")) return fromFen(text);
			let value;
			try {
				value = JSON.parse(text);
			} catch {
				throw new InvalidPositionError("棋局 JSON 格式错误");
			}
			if (!isRecord(value) || value.version !== 1 || typeof value.fen !== "string") throw new InvalidPositionError("不支持的棋局序列化格式");
			const base = fromFen(value.fen);
			const history = value.history === void 0 ? [] : parseHistory(value.history);
			return makeGameState(base.board, base.turn, {
				halfmoveClock: base.halfmoveClock,
				fullmoveNumber: base.fullmoveNumber,
				history
			});
		}
		function parsePlacement(placement) {
			const rows = placement.split("/");
			if (rows.length !== 10) throw new InvalidPositionError(`FEN 棋盘必须有 10 行`);
			const board = Array.from({ length: 90 }, () => null);
			for (let y = 0; y < rows.length; y += 1) {
				let x = 0;
				for (const code of rows[y]) if (/^[1-9]$/.test(code)) x += Number(code);
				else {
					if (!TYPE_BY_FEN[code.toLowerCase()] || x >= 9) throw new InvalidPositionError(`FEN 第 ${y + 1} 行包含非法内容`);
					board[y * 9 + x] = parseFenPiece(code);
					x += 1;
				}
				if (x !== 9) throw new InvalidPositionError(`FEN 第 ${y + 1} 行不是 9 列`);
			}
			return board;
		}
		function parseSide(value) {
			if (value === "w" || value === "r" || value === "red") return "red";
			if (value === "b" || value === "black") return "black";
			throw new InvalidPositionError(`未知 FEN 轮次: ${value}`);
		}
		function parseNonNegativeInt(value, label) {
			if (!/^\d+$/.test(value)) throw new InvalidPositionError(`${label}不是非负整数`);
			return Number(value);
		}
		function parsePositiveInt(value, label) {
			const result = parseNonNegativeInt(value, label);
			if (result < 1) throw new InvalidPositionError(`${label}必须大于 0`);
			return result;
		}
		function isRecord(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value);
		}
		function parseHistory(value) {
			if (!Array.isArray(value)) throw new InvalidPositionError("棋局历史必须是数组");
			return value.map((item, index) => parseMoveRecord(item, index));
		}
		function parseMoveRecord(value, index) {
			if (!isRecord(value)) throw new InvalidPositionError(`历史第 ${index + 1} 步格式错误`);
			const from = parseSerializedPosition(value.from, `历史第 ${index + 1} 步起点`);
			const to = parseSerializedPosition(value.to, `历史第 ${index + 1} 步终点`);
			const piece = parsePiece(value.piece, `历史第 ${index + 1} 步棋子`);
			const captured = value.captured === null || value.captured === void 0 ? null : parsePiece(value.captured, `历史第 ${index + 1} 步被吃棋子`);
			if (typeof value.notation !== "string") throw new InvalidPositionError(`历史第 ${index + 1} 步缺少棋谱`);
			if (typeof value.givesCheck !== "boolean") throw new InvalidPositionError(`历史第 ${index + 1} 步将军标记错误`);
			if (value.result !== "playing" && value.result !== "checkmate" && value.result !== "stalemate") throw new InvalidPositionError(`历史第 ${index + 1} 步结果错误`);
			return {
				from,
				to,
				piece,
				captured,
				notation: value.notation,
				givesCheck: value.givesCheck,
				result: value.result,
				halfmoveClockBefore: parseNonNegativeInt(String(value.halfmoveClockBefore), "历史半回合计数"),
				fullmoveNumberBefore: parsePositiveInt(String(value.fullmoveNumberBefore), "历史全回合计数")
			};
		}
		function parseSerializedPosition(value, label) {
			if (typeof value === "string") try {
				return parseCoordinate(value);
			} catch {
				throw new InvalidPositionError(`${label}格式错误`);
			}
			if (isRecord(value) && typeof value.x === "number" && typeof value.y === "number") try {
				return parseCoordinate({
					x: value.x,
					y: value.y
				});
			} catch {
				throw new InvalidPositionError(`${label}格式错误`);
			}
			throw new InvalidPositionError(`${label}格式错误`);
		}
		function parsePiece(value, label) {
			if (!isRecord(value) || value.side !== "red" && value.side !== "black" || !isPieceType(value.type)) throw new InvalidPositionError(`${label}格式错误`);
			return {
				side: value.side,
				type: value.type
			};
		}
		function isPieceType(value) {
			return value === "general" || value === "advisor" || value === "elephant" || value === "horse" || value === "rook" || value === "cannon" || value === "soldier";
		}
		//#endregion
		//#region lib/types/client/view-model.js
		/** Convert the Host's authoritative JSON snapshot into the board view model. */
		function positionOf(position) {
			return {
				row: position.y,
				col: position.x
			};
		}
		function moveOf(move) {
			return {
				from: positionOf(move.from),
				to: positionOf(move.to)
			};
		}
		function pieceOf(game, x, y) {
			const piece = game.board[y * 9 + x];
			if (piece === null) return null;
			return {
				id: `${piece.side}-${piece.type}-${x}-${y}`,
				side: piece.side,
				kind: piece.type,
				label: getPieceLabel(piece)
			};
		}
		function statusOf(state, game) {
			if (state.phase === "resigned") return "resigned";
			if (game.status === "checkmate") return game.winner === "red" ? "red-won" : "black-won";
			if (game.status === "stalemate") return "draw";
			return "playing";
		}
		function sideLabel(side) {
			return side === "red" ? "红方" : "黑方";
		}
		function statusTextOf(state, game, status, humanSide, busy) {
			if (busy && status === "playing" && game.turn !== humanSide) return "AI 正在计算下一步";
			if (status === "resigned") return `${sideLabel(state.winner ?? "red")}获胜（对方认输）`;
			if (status === "red-won" || status === "black-won") return `${status === "red-won" ? "红方" : "黑方"}将死，${status === "red-won" ? "红方" : "黑方"}获胜`;
			if (status === "draw") return "无子可走，和棋";
			if (game.inCheck) return `${sideLabel(game.turn)}被将军，轮到${sideLabel(game.turn)}应对`;
			return `轮到${sideLabel(game.turn)}落子`;
		}
		function moveRecords(game) {
			return game.history.map((record) => ({
				...moveOf(record),
				side: record.piece.side,
				notation: formatMoveRecord(record),
				...record.captured === null ? {} : { captured: record.captured.type }
			}));
		}
		/**
		* Project one Host snapshot. The client uses the pure core only to format the
		* already committed state and legal destinations; move acceptance remains a
		* revision-fenced Host operation.
		*/
		function toXiangqiGameViewModel(state, options = {}) {
			const game = deserialize(JSON.stringify(state.gameState));
			const humanSide = options.humanSide ?? "red";
			const busy = options.busy ?? false;
			const status = statusOf(state, game);
			const board = Array.from({ length: 10 }, (_row, y) => Array.from({ length: 9 }, (_column, x) => pieceOf(game, x, y)));
			const legalMoves = getLegalMoves(game).map(moveOf);
			const lastMove = game.lastMove === null ? void 0 : moveOf(game.lastMove);
			return {
				board,
				currentTurn: game.turn,
				humanSide,
				legalMoves,
				moves: moveRecords(game),
				status,
				statusText: statusTextOf(state, game, status, humanSide, busy),
				inCheck: game.inCheck,
				...lastMove === void 0 ? {} : { lastMove },
				busy
			};
		}
		/** Read the current turn without duplicating the board projection. */
		function turnOf(state) {
			return deserialize(JSON.stringify(state.gameState)).turn;
		}
		/** Convert a visible row/column pair into the Host's canonical UCCI coordinate. */
		function ucciOf(position) {
			return formatCoordinate({
				x: position.col,
				y: position.row
			});
		}
		//#endregion
		//#region lib/types/client/types.js
		/** Number of ranks on a Chinese chess board. */
		const XIANGQI_ROWS = 10;
		/** Number of files on a Chinese chess board. */
		const XIANGQI_COLUMNS = 9;
		//#endregion
		//#region \0dsh-css:D:\Agent\dsh插件\dsh-Plugin-中国象棋\src\client\XiangqiPage.module.css.mjs
		const css$1 = ".cvymIq_page{box-sizing:border-box;color:#e2e8f0;background:radial-gradient(circle at 50% 0,#1a1e26 0%,#111317 70%,#0a0c0e 100%);width:100%;min-height:100%;padding:clamp(16px,2.5vw,32px);font-family:-apple-system,BlinkMacSystemFont,PingFang SC,Hiragino Sans GB,Microsoft YaHei,sans-serif;overflow:hidden auto}.cvymIq_header,.cvymIq_layout{width:min(100%,1160px);margin:0 auto}.cvymIq_header{backdrop-filter:blur(12px);background:linear-gradient(135deg,#ffffff0a 0%,#ffffff03 100%);border:1px solid #d4af3726;border-radius:16px;justify-content:space-between;align-items:center;gap:20px;margin-bottom:clamp(16px,2.5vw,26px);padding:18px 24px;display:flex;box-shadow:0 8px 24px -4px #0006,inset 0 1px #ffffff14}.cvymIq_headerMain{flex-direction:column;gap:4px;display:flex}.cvymIq_badgeRow{align-items:center;gap:8px;display:flex}.cvymIq_gameTag{color:#e8c46c;letter-spacing:.05em;text-transform:uppercase;background:#d4af3726;border:1px solid #d4af3759;border-radius:4px;align-items:center;padding:2px 8px;font-size:11px;font-weight:600;display:inline-flex}.cvymIq_versionTag{color:#8a99ad;font-size:11px}.cvymIq_title{letter-spacing:-.01em;background:linear-gradient(135deg,#fff 30%,#e2d1a8 100%);-webkit-text-fill-color:transparent;-webkit-background-clip:text;margin:2px 0 0;font-size:clamp(20px,3.2vw,28px);font-weight:700}.cvymIq_subtitle{color:#94a3b8;margin:0;font-size:13px;line-height:18px}.cvymIq_turnCard{background:#0006;border:1px solid #ffffff1a;border-radius:12px;align-items:center;gap:14px;padding:10px 18px;transition:all .3s;display:flex;box-shadow:0 4px 12px #0000004d}.cvymIq_turnCard[data-side=red]{background:linear-gradient(135deg,#ef44441f,#0006);border-color:#ef444459}.cvymIq_turnCard[data-side=black]{background:linear-gradient(135deg,#94a3b81f,#0006);border-color:#94a3b859}.cvymIq_turnVisual{justify-content:center;align-items:center;display:flex;position:relative}.cvymIq_turnAvatar{z-index:2;border-radius:50%;justify-content:center;align-items:center;width:38px;height:38px;font-family:Kaiti,STKaiti,Noto Serif SC,Songti SC,serif;font-size:20px;font-weight:700;display:flex;position:relative;box-shadow:0 4px 10px #00000080}.cvymIq_turnAvatar[data-side=red]{color:#ff5e5e;text-shadow:0 0 8px #ef444480;background:radial-gradient(circle at 35% 35%,#47171a,#230c0e);border:2px solid #ef4444}.cvymIq_turnAvatar[data-side=black]{color:#f1f5f9;text-shadow:0 0 8px #94a3b880;background:radial-gradient(circle at 35% 35%,#2d3542,#141820);border:2px solid #94a3b8}.cvymIq_turnPulse{background:inherit;opacity:0;border-radius:50%;animation:2s ease-out infinite cvymIq_radarPulse;position:absolute;inset:-3px}.cvymIq_turnCard[data-busy=true] .cvymIq_turnPulse{animation:1.2s ease-out infinite cvymIq_radarPulse}@keyframes cvymIq_radarPulse{0%{opacity:.8;transform:scale(.9)}to{opacity:0;transform:scale(1.4)}}.cvymIq_turnDetails{flex-direction:column;gap:2px;display:flex}.cvymIq_turnStatusBadge{color:#d4af37;letter-spacing:.04em;font-size:11px;font-weight:600}.cvymIq_turnPlayer{color:#fff;font-size:14px;font-weight:650}.cvymIq_layout{grid-template-columns:minmax(0,1.4fr) minmax(310px,380px);align-items:start;gap:clamp(16px,2.5vw,28px);display:grid}.cvymIq_boardColumn,.cvymIq_sideColumn{min-width:0}.cvymIq_sectionHeading{width:min(100%,680px);margin:0 auto 12px}.cvymIq_playerStrip{background:#12161cb3;border:1px solid #ffffff14;border-radius:12px;align-items:center;gap:10px;padding:10px 14px;display:flex;box-shadow:0 4px 14px #00000059}.cvymIq_playerCard{background:#ffffff05;border:1px solid #0000;border-radius:8px;flex:1;align-items:center;gap:10px;padding:6px 10px;transition:all .25s;display:flex}.cvymIq_playerCardActive{background:#d4af3714;border-color:#d4af374d;box-shadow:inset 0 0 12px #d4af371a}.cvymIq_playerPieceIcon{border-radius:50%;flex:none;justify-content:center;align-items:center;width:26px;height:26px;font-family:Kaiti,STKaiti,serif;font-size:14px;font-weight:700;display:flex}.cvymIq_playerPieceIcon[data-side=red]{color:#ff5e5e;background:#2a1113;border:1.5px solid #ef4444}.cvymIq_playerPieceIcon[data-side=black]{color:#f1f5f9;background:#1c222b;border:1.5px solid #94a3b8}.cvymIq_playerMeta{flex-direction:column;gap:2px;min-width:0;display:flex}.cvymIq_playerName{color:#cbd5e1;white-space:nowrap;font-size:12px;font-weight:600}.cvymIq_lostPieces{flex-wrap:wrap;align-items:center;gap:3px;display:flex}.cvymIq_lostPiece{opacity:.75;border-radius:50%;justify-content:center;align-items:center;width:17px;height:17px;font-family:Kaiti,STKaiti,serif;font-size:10px;font-weight:700;line-height:1;display:inline-flex}.cvymIq_lostPiece[data-side=red]{color:#f87171;background:#3b1416;border:1px solid #ef444466}.cvymIq_lostPiece[data-side=black]{color:#cbd5e1;background:#1e2530;border:1px solid #94a3b866}.cvymIq_lostEmpty{color:#64748b;font-size:10px}.cvymIq_vsDivider{color:#d4af37;letter-spacing:.05em;opacity:.6;padding:0 4px;font-size:12px;font-weight:800}.cvymIq_boardSurface{width:min(100%,680px);margin:0 auto;position:relative}.cvymIq_fileLabelsTop,.cvymIq_fileLabelsBottom{text-align:center;pointer-events:none;grid-template-columns:repeat(9,minmax(0,1fr));width:100%;padding:4px 0;display:grid}.cvymIq_coordLabel{color:#828e9e;opacity:.7;font-family:Noto Serif SC,Kaiti,serif;font-size:11px;font-weight:600}.cvymIq_boardGrid{--xiangqi-line:#d4af3752;--xiangqi-outer-border:#8b7336;aspect-ratio:9/10;border:2px solid var(--xiangqi-outer-border);isolation:isolate;background:linear-gradient(145deg,#242931 0%,#1a1e24 50%,#15181e 100%);border-radius:12px;grid-template-rows:repeat(10,minmax(0,1fr));grid-template-columns:repeat(9,minmax(0,1fr));width:100%;display:grid;position:relative;overflow:hidden;box-shadow:0 20px 40px -10px #000000b3,0 0 0 1px #ffffff0f,inset 0 0 40px #0009}.cvymIq_boardGrid:before{z-index:0;border:1px solid var(--xiangqi-line);background-image:linear-gradient(to right, var(--xiangqi-line) 0 1px, transparent 1px), linear-gradient(to bottom, var(--xiangqi-line) 0 1px, transparent 1px);content:\"\";pointer-events:none;background-size:12.5% 100%,100% 11.1111%;position:absolute;inset:5% 5.5556%}.cvymIq_boardDecorationSvg{z-index:1;pointer-events:none;color:#d4af378c;width:100%;height:100%;position:absolute;inset:0}.cvymIq_riverArea{z-index:2;border-top:1px solid var(--xiangqi-line);border-bottom:1px solid var(--xiangqi-line);pointer-events:none;background:linear-gradient(90deg,#1c2026,#181b21 50%,#1c2026);justify-content:space-around;align-items:center;display:flex;position:absolute;inset:45% 5.5556%}.cvymIq_riverTextLeft,.cvymIq_riverTextRight{letter-spacing:.35em;color:#c9a44c;text-shadow:0 2px 6px #000c,0 0 12px #c9a44c4d;opacity:.88;font-family:Kaiti,STKaiti,Noto Serif SC,Songti SC,serif;font-size:clamp(14px,2.6vw,22px);font-weight:700}.cvymIq_riverEmblem{color:#8b7336;opacity:.5;font-size:clamp(12px,2vw,18px)}.cvymIq_cell{z-index:3;justify-content:center;align-items:center;min-width:0;min-height:0;display:flex;position:relative}.cvymIq_cellButton{z-index:4;cursor:pointer;background:0 0;border:0;outline:none;justify-content:center;align-items:center;width:100%;height:100%;padding:0;transition:transform .15s cubic-bezier(.4,0,.2,1);display:flex;position:relative}.cvymIq_cellButton:hover{background:radial-gradient(circle,#d4af3726 0%,#0000 70%)}.cvymIq_cellButton:disabled{cursor:default}.cvymIq_cellButton:disabled:hover{background:0 0}.cvymIq_lastMoveFromCell .cvymIq_cellButton:after{content:\"\";pointer-events:none;background:#d4af3714;border:1.5px dashed #d4af3780;border-radius:8px;width:75%;height:75%;position:absolute}.cvymIq_lastMoveToCell .cvymIq_lastMoveTargetIndicator{pointer-events:none;border:2px solid #e8c46c;border-radius:8px;position:absolute;inset:12%;box-shadow:0 0 10px #e8c46c66,inset 0 0 6px #e8c46c33}.cvymIq_piece{z-index:2;aspect-ratio:1;box-sizing:border-box;user-select:none;border-radius:50%;justify-content:center;align-items:center;width:min(84%,60px);transition:transform .2s cubic-bezier(.34,1.56,.64,1),box-shadow .2s;display:inline-flex;position:relative}.cvymIq_pieceInnerRing{border-radius:50%;justify-content:center;align-items:center;width:82%;height:82%;display:inline-flex}.cvymIq_pieceText{font-family:Kaiti,STKaiti,Noto Serif SC,Songti SC,serif;font-size:clamp(17px,3.4vw,30px);font-weight:750;line-height:1}.cvymIq_piece[data-side=red]{background:radial-gradient(circle at 35% 30%,#4a191c 0%,#2e0e11 60%,#190709 100%);border:2px solid #e05252;box-shadow:0 4px 10px #000000a6,0 1px 2px #ef44444d,inset 0 2px 4px #ff78784d,inset 0 -2px 4px #000c}.cvymIq_piece[data-side=red] .cvymIq_pieceInnerRing{background:radial-gradient(circle,#ef44441a 0%,#0000 80%);border:1px solid #e0525273}.cvymIq_piece[data-side=red] .cvymIq_pieceText{color:#ff6464;text-shadow:0 1px 2px #000000e6,0 0 10px #ff646473}.cvymIq_piece[data-side=black]{background:radial-gradient(circle at 35% 30%,#2f3744 0%,#1c222c 60%,#0e1218 100%);border:2px solid #a8b8cc;box-shadow:0 4px 10px #000000a6,0 1px 2px #a8b8cc40,inset 0 2px 4px #ffffff40,inset 0 -2px 4px #000c}.cvymIq_piece[data-side=black] .cvymIq_pieceInnerRing{background:radial-gradient(circle,#a8b8cc14 0%,#0000 80%);border:1px solid #a8b8cc66}.cvymIq_piece[data-side=black] .cvymIq_pieceText{color:#f1f5f9;text-shadow:0 1px 2px #000000e6,0 0 8px #f1f5f966}.cvymIq_pieceSelected{transform:translateY(-5px)scale(1.08)!important;box-shadow:0 12px 20px -2px #000000b3,0 0 0 3px #d4af37,0 0 16px #d4af37bf!important}.cvymIq_pieceInCheck{animation:1.4s ease-in-out infinite cvymIq_checkTremor;border-color:#f33!important;box-shadow:0 0 20px #ff3232d9!important}.cvymIq_checkBadge{z-index:10;color:#fff;letter-spacing:.05em;background:#dc2626;border-radius:4px;padding:1px 5px;font-size:10px;font-weight:800;animation:1s infinite alternate cvymIq_pulseBadge;position:absolute;top:-8px;right:-8px;box-shadow:0 2px 6px #00000080}@keyframes cvymIq_checkTremor{0%,to{transform:scale(1)}50%{transform:scale(1.06)}}@keyframes cvymIq_pulseBadge{0%{opacity:.85;transform:scale(.95)}to{opacity:1;transform:scale(1.05)}}.cvymIq_legalDot{aspect-ratio:1;pointer-events:none;background:radial-gradient(circle,#34d399 0%,#059669 100%);border-radius:50%;width:22%;animation:1.6s ease-in-out infinite cvymIq_breatheDot;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);box-shadow:0 0 10px #34d399cc}@keyframes cvymIq_breatheDot{0%,to{opacity:.8;transform:translate(-50%,-50%)scale(.9)}50%{opacity:1;transform:translate(-50%,-50%)scale(1.2)}}.cvymIq_captureReticle{pointer-events:none;animation:1.5s ease-in-out infinite cvymIq_targetLock;position:absolute;inset:6%}.cvymIq_reticleCornerTopLeft,.cvymIq_reticleCornerTopRight,.cvymIq_reticleCornerBottomLeft,.cvymIq_reticleCornerBottomRight{border-style:solid;border-color:#f87171;width:10px;height:10px;position:absolute}.cvymIq_reticleCornerTopLeft{border-width:2.5px 0 0 2.5px;top:0;left:0}.cvymIq_reticleCornerTopRight{border-width:2.5px 2.5px 0 0;top:0;right:0}.cvymIq_reticleCornerBottomLeft{border-width:0 0 2.5px 2.5px;bottom:0;left:0}.cvymIq_reticleCornerBottomRight{border-width:0 2.5px 2.5px 0;bottom:0;right:0}@keyframes cvymIq_targetLock{0%,to{opacity:.85;transform:scale(1)}50%{opacity:1;transform:scale(1.08)}}.cvymIq_statusCard{backdrop-filter:blur(8px);background:#12161cd9;border:1px solid #ffffff14;border-radius:12px;align-items:center;gap:14px;width:min(100%,680px);margin:14px auto 0;padding:12px 18px;display:flex;box-shadow:0 6px 18px #00000059}.cvymIq_statusIconWrapper{background:#d4af371f;border:1px solid #d4af374d;border-radius:50%;flex:none;justify-content:center;align-items:center;width:32px;height:32px;display:flex}.cvymIq_statusPulseDot{background:#10b981;border-radius:50%;width:10px;height:10px;animation:1.5s infinite cvymIq_pulseDot;box-shadow:0 0 8px #10b981cc}@keyframes cvymIq_pulseDot{0%,to{opacity:.8;transform:scale(.9)}50%{opacity:1;transform:scale(1.2)}}.cvymIq_statusResultIcon{font-size:16px}.cvymIq_statusInfo{flex-direction:column;gap:2px;display:flex}.cvymIq_statusHeadline{color:#fff;font-size:13.5px;font-weight:650}.cvymIq_statusSubtext{color:#94a3b8;font-size:12px}.cvymIq_sideColumn{flex-direction:column;gap:16px;display:flex}.cvymIq_panel{backdrop-filter:blur(12px);background:linear-gradient(145deg,#1c2129d9 0%,#12151bd9 100%);border:1px solid #ffffff14;border-radius:14px;padding:16px;box-shadow:0 8px 24px -4px #00000073}.cvymIq_panelHeader{justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px;display:flex}.cvymIq_panelTitleGroup{align-items:center;gap:8px;display:flex}.cvymIq_panelTitle{color:#f1f5f9;letter-spacing:-.01em;margin:0;font-size:15px;font-weight:700}.cvymIq_moveBadge{color:#e8c46c;background:#d4af3726;border:1px solid #d4af374d;border-radius:10px;padding:2px 7px;font-size:11px;font-weight:600}.cvymIq_copyButton{color:#cbd5e1;cursor:pointer;background:#ffffff0a;border:1px solid #ffffff1f;border-radius:6px;padding:4px 10px;font-size:11.5px;transition:all .2s}.cvymIq_copyButton:hover:not(:disabled){color:#f1f5f9;background:#d4af3726;border-color:#d4af3766}.cvymIq_copyButton:disabled{opacity:.4;cursor:default}.cvymIq_latestMoveBar{background:#0006;border-left:3px solid #d4af37;border-radius:8px;align-items:center;gap:8px;margin-bottom:12px;padding:8px 12px;font-size:12px;display:flex}.cvymIq_latestLabel{color:#94a3b8;flex:none;font-weight:600}.cvymIq_latestValue{color:#f8fafc;align-items:center;gap:6px;font-weight:550;display:flex}.cvymIq_latestValue[data-side=red] strong{color:#ff6b6b}.cvymIq_latestValue[data-side=black] strong{color:#94a3b8}.cvymIq_latestEmpty{color:#64748b}.cvymIq_checkTag,.cvymIq_mateTag{border-radius:3px;padding:1px 4px;font-size:10px;font-weight:700}.cvymIq_checkTag{color:#f87171;background:#ef444433;border:1px solid #ef444466}.cvymIq_mateTag{color:#fca5a5;background:#dc26264d;border:1px solid #dc2626}.cvymIq_moveList{scroll-behavior:smooth;flex-direction:column;gap:6px;max-height:320px;margin:0;padding:0 4px 0 0;list-style:none;display:flex;overflow-y:auto}.cvymIq_moveList::-webkit-scrollbar{width:5px}.cvymIq_moveList::-webkit-scrollbar-track{background:#0003;border-radius:4px}.cvymIq_moveList::-webkit-scrollbar-thumb{background:#ffffff26;border-radius:4px}.cvymIq_moveList::-webkit-scrollbar-thumb:hover{background:#d4af3766}.cvymIq_emptyMovesState{text-align:center;color:#64748b;flex-direction:column;justify-content:center;align-items:center;padding:40px 16px;display:flex}.cvymIq_emptyMovesIcon{opacity:.6;margin-bottom:8px;font-size:32px}.cvymIq_emptyMovesTitle{color:#cbd5e1;margin:0;font-size:13.5px;font-weight:600}.cvymIq_emptyMovesHint{color:#64748b;margin:4px 0 0;font-size:11.5px}.cvymIq_roundItem{background:#ffffff05;border:1px solid #0000;border-radius:8px;grid-template-columns:28px 1fr 1fr;align-items:center;gap:6px;padding:4px 6px;transition:all .2s;display:grid}.cvymIq_roundItem:hover{background:#ffffff0a}.cvymIq_roundItemLatest{background:#d4af370f;border-color:#d4af3733}.cvymIq_roundIndex{color:#64748b;text-align:center;font-family:monospace;font-size:11px}.cvymIq_moveBlock{background:#00000040;border:1px solid #ffffff0d;border-radius:6px;align-items:center;gap:6px;padding:5px 8px;font-size:12px;display:flex}.cvymIq_moveBlockLatest{box-shadow:0 0 10px #d4af3740;background:#d4af3726!important;border-color:#d4af3780!important}.cvymIq_moveSideIcon{border-radius:4px;flex:none;justify-content:center;align-items:center;width:16px;height:16px;font-size:9.5px;font-weight:700;display:inline-flex}.cvymIq_moveSideIcon[data-side=red]{color:#ff6b6b;background:#3c1518;border:1px solid #ef444466}.cvymIq_moveSideIcon[data-side=black]{color:#94a3b8;background:#1e242d;border:1px solid #94a3b866}.cvymIq_moveNotationText{color:#f1f5f9;white-space:nowrap;text-overflow:ellipsis;flex:1;font-weight:550;overflow:hidden}.cvymIq_latestBadge{color:#111317;background:#d4af37;border-radius:3px;padding:1px 4px;font-size:9px;font-weight:800;animation:1.2s infinite alternate cvymIq_pulseBadge}.cvymIq_pendingMoveBlock{opacity:.4;border-style:dashed;justify-content:center}.cvymIq_pendingDot{color:#64748b;font-size:12px}.cvymIq_actionsGrid{grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px;display:grid}.cvymIq_actionNewGame,.cvymIq_actionUndo,.cvymIq_actionResign{cursor:pointer;border-radius:8px;outline:none;justify-content:center;align-items:center;gap:6px;min-height:38px;padding:8px 12px;font-size:13px;font-weight:600;transition:all .2s cubic-bezier(.4,0,.2,1);display:inline-flex}.cvymIq_btnIcon{font-size:14px}.cvymIq_actionNewGame{color:#fff;background:linear-gradient(135deg,#10b981 0%,#059669 100%);border:1px solid #34d399;box-shadow:0 4px 12px #10b9814d}.cvymIq_actionNewGame:hover:not(:disabled){background:linear-gradient(135deg,#34d399 0%,#10b981 100%);transform:translateY(-1px);box-shadow:0 6px 16px #10b98173}.cvymIq_actionUndo{color:#e2e8f0;background:#ffffff0d;border:1px solid #ffffff1f}.cvymIq_actionUndo:hover:not(:disabled){color:#fff;background:#ffffff1a;border-color:#d4af3766;transform:translateY(-1px)}.cvymIq_actionResign{color:#f87171;background:#ef444414;border:1px solid #ef44444d}.cvymIq_actionResign:hover:not(:disabled){color:#fff;background:#ef444433;border-color:#ef4444;transform:translateY(-1px)}.cvymIq_actionNewGame:disabled,.cvymIq_actionUndo:disabled,.cvymIq_actionResign:disabled{opacity:.4;cursor:default;box-shadow:none;transform:none}@media (width<=960px){.cvymIq_layout{grid-template-columns:minmax(0,1fr)}.cvymIq_boardColumn{width:min(100%,720px);margin:0 auto}.cvymIq_sideColumn{grid-template-columns:repeat(2,minmax(0,1fr));align-items:start;display:grid}}@media (width<=600px){.cvymIq_page{padding:12px}.cvymIq_header{flex-direction:column;align-items:flex-start;padding:14px 16px}.cvymIq_turnCard{box-sizing:border-box;width:100%}.cvymIq_sideColumn{grid-template-columns:minmax(0,1fr)}.cvymIq_playerStrip{flex-direction:column;align-items:stretch}.cvymIq_vsDivider{text-align:center}}";
		const tagId$1 = "@deepseek-ai/dsh-plugin-xiangqi/XiangqiPage.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-plugin-xiangqi";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var XiangqiPage_module_css_default = {
			"panelHeader": "cvymIq_panelHeader",
			"emptyMovesHint": "cvymIq_emptyMovesHint",
			"turnCard": "cvymIq_turnCard",
			"pieceInCheck": "cvymIq_pieceInCheck",
			"coordLabel": "cvymIq_coordLabel",
			"pieceText": "cvymIq_pieceText",
			"versionTag": "cvymIq_versionTag",
			"lastMoveToCell": "cvymIq_lastMoveToCell",
			"latestLabel": "cvymIq_latestLabel",
			"roundIndex": "cvymIq_roundIndex",
			"sectionHeading": "cvymIq_sectionHeading",
			"moveBlockLatest": "cvymIq_moveBlockLatest",
			"statusPulseDot": "cvymIq_statusPulseDot",
			"pendingMoveBlock": "cvymIq_pendingMoveBlock",
			"actionsGrid": "cvymIq_actionsGrid",
			"actionUndo": "cvymIq_actionUndo",
			"riverEmblem": "cvymIq_riverEmblem",
			"actionNewGame": "cvymIq_actionNewGame",
			"moveSideIcon": "cvymIq_moveSideIcon",
			"playerName": "cvymIq_playerName",
			"vsDivider": "cvymIq_vsDivider",
			"lastMoveTargetIndicator": "cvymIq_lastMoveTargetIndicator",
			"fileLabelsBottom": "cvymIq_fileLabelsBottom",
			"latestMoveBar": "cvymIq_latestMoveBar",
			"mateTag": "cvymIq_mateTag",
			"emptyMovesIcon": "cvymIq_emptyMovesIcon",
			"boardSurface": "cvymIq_boardSurface",
			"statusSubtext": "cvymIq_statusSubtext",
			"emptyMovesTitle": "cvymIq_emptyMovesTitle",
			"riverTextRight": "cvymIq_riverTextRight",
			"turnPulse": "cvymIq_turnPulse",
			"boardColumn": "cvymIq_boardColumn",
			"playerCard": "cvymIq_playerCard",
			"pulseDot": "cvymIq_pulseDot",
			"turnVisual": "cvymIq_turnVisual",
			"checkTag": "cvymIq_checkTag",
			"legalDot": "cvymIq_legalDot",
			"copyButton": "cvymIq_copyButton",
			"lostPieces": "cvymIq_lostPieces",
			"subtitle": "cvymIq_subtitle",
			"captureReticle": "cvymIq_captureReticle",
			"lostEmpty": "cvymIq_lostEmpty",
			"sideColumn": "cvymIq_sideColumn",
			"lastMoveFromCell": "cvymIq_lastMoveFromCell",
			"moveBlock": "cvymIq_moveBlock",
			"playerStrip": "cvymIq_playerStrip",
			"statusInfo": "cvymIq_statusInfo",
			"latestBadge": "cvymIq_latestBadge",
			"cell": "cvymIq_cell",
			"checkTremor": "cvymIq_checkTremor",
			"badgeRow": "cvymIq_badgeRow",
			"pendingDot": "cvymIq_pendingDot",
			"statusResultIcon": "cvymIq_statusResultIcon",
			"targetLock": "cvymIq_targetLock",
			"playerPieceIcon": "cvymIq_playerPieceIcon",
			"cellButton": "cvymIq_cellButton",
			"panelTitle": "cvymIq_panelTitle",
			"panel": "cvymIq_panel",
			"latestEmpty": "cvymIq_latestEmpty",
			"turnAvatar": "cvymIq_turnAvatar",
			"reticleCornerTopRight": "cvymIq_reticleCornerTopRight",
			"radarPulse": "cvymIq_radarPulse",
			"page": "cvymIq_page",
			"piece": "cvymIq_piece",
			"statusCard": "cvymIq_statusCard",
			"layout": "cvymIq_layout",
			"breatheDot": "cvymIq_breatheDot",
			"gameTag": "cvymIq_gameTag",
			"boardGrid": "cvymIq_boardGrid",
			"statusIconWrapper": "cvymIq_statusIconWrapper",
			"riverTextLeft": "cvymIq_riverTextLeft",
			"moveBadge": "cvymIq_moveBadge",
			"checkBadge": "cvymIq_checkBadge",
			"roundItem": "cvymIq_roundItem",
			"btnIcon": "cvymIq_btnIcon",
			"title": "cvymIq_title",
			"reticleCornerBottomRight": "cvymIq_reticleCornerBottomRight",
			"turnPlayer": "cvymIq_turnPlayer",
			"turnDetails": "cvymIq_turnDetails",
			"reticleCornerTopLeft": "cvymIq_reticleCornerTopLeft",
			"riverArea": "cvymIq_riverArea",
			"header": "cvymIq_header",
			"statusHeadline": "cvymIq_statusHeadline",
			"playerMeta": "cvymIq_playerMeta",
			"emptyMovesState": "cvymIq_emptyMovesState",
			"lostPiece": "cvymIq_lostPiece",
			"moveNotationText": "cvymIq_moveNotationText",
			"turnStatusBadge": "cvymIq_turnStatusBadge",
			"fileLabelsTop": "cvymIq_fileLabelsTop",
			"panelTitleGroup": "cvymIq_panelTitleGroup",
			"pulseBadge": "cvymIq_pulseBadge",
			"moveList": "cvymIq_moveList",
			"playerCardActive": "cvymIq_playerCardActive",
			"latestValue": "cvymIq_latestValue",
			"roundItemLatest": "cvymIq_roundItemLatest",
			"pieceInnerRing": "cvymIq_pieceInnerRing",
			"boardDecorationSvg": "cvymIq_boardDecorationSvg",
			"headerMain": "cvymIq_headerMain",
			"pieceSelected": "cvymIq_pieceSelected",
			"actionResign": "cvymIq_actionResign",
			"reticleCornerBottomLeft": "cvymIq_reticleCornerBottomLeft"
		};
		//#endregion
		//#region lib/types/client/XiangqiPage.js
		const SIDE_LABELS = {
			red: "红方",
			black: "黑方"
		};
		const PIECE_LABELS = {
			red: {
				general: "帅",
				advisor: "仕",
				elephant: "相",
				horse: "马",
				rook: "车",
				cannon: "炮",
				soldier: "兵"
			},
			black: {
				general: "将",
				advisor: "士",
				elephant: "象",
				horse: "马",
				rook: "车",
				cannon: "炮",
				soldier: "卒"
			}
		};
		const INITIAL_PIECES = {
			red: {
				general: 1,
				advisor: 2,
				elephant: 2,
				horse: 2,
				rook: 2,
				cannon: 2,
				soldier: 5
			},
			black: {
				general: 1,
				advisor: 2,
				elephant: 2,
				horse: 2,
				rook: 2,
				cannon: 2,
				soldier: 5
			}
		};
		function samePosition(left, right) {
			return left !== null && right !== null && left.row === right.row && left.col === right.col;
		}
		function positionKey(position) {
			return `${position.row}:${position.col}`;
		}
		function pieceAt(view, position) {
			return view.board[position.row]?.[position.col] ?? null;
		}
		function pieceLabel(piece) {
			return piece.label ?? PIECE_LABELS[piece.side][piece.kind];
		}
		function joinClasses(...names) {
			return names.filter(Boolean).join(" ");
		}
		function isMoveEndpoint(move, position) {
			if (!move) return null;
			if (samePosition(move.from, position)) return "from";
			if (samePosition(move.to, position)) return "to";
			return null;
		}
		/** 计算双方已被吃掉的棋子 */
		function getCapturedPieces(game) {
			const currentCount = {
				red: {
					general: 0,
					advisor: 0,
					elephant: 0,
					horse: 0,
					rook: 0,
					cannon: 0,
					soldier: 0
				},
				black: {
					general: 0,
					advisor: 0,
					elephant: 0,
					horse: 0,
					rook: 0,
					cannon: 0,
					soldier: 0
				}
			};
			for (let r = 0; r < 10; r += 1) for (let c = 0; c < 9; c += 1) {
				const piece = game.board[r]?.[c];
				if (piece) currentCount[piece.side][piece.kind] += 1;
			}
			const redLost = [];
			const blackLost = [];
			for (const kind of [
				"rook",
				"horse",
				"cannon",
				"elephant",
				"advisor",
				"soldier",
				"general"
			]) {
				const redDiff = INITIAL_PIECES.red[kind] - currentCount.red[kind];
				for (let i = 0; i < redDiff; i += 1) redLost.push(kind);
				const blackDiff = INITIAL_PIECES.black[kind] - currentCount.black[kind];
				for (let i = 0; i < blackDiff; i += 1) blackLost.push(kind);
			}
			return {
				redLost,
				blackLost
			};
		}
		/** 格式化整局棋谱为文本 */
		function exportPgn(moves) {
			if (moves.length === 0) return "尚未落子";
			const lines = [];
			for (let i = 0; i < moves.length; i += 2) {
				const round = Math.floor(i / 2) + 1;
				const redMove = moves[i] ? `${moves[i].notation}` : "";
				const blackMove = moves[i + 1] ? `  ${moves[i + 1].notation}` : "";
				lines.push(`${round}. ${redMove}${blackMove}`);
			}
			return lines.join("\n");
		}
		/**
		* 现代新国风 9x10 中国象棋主界面
		*/
		function XiangqiPage({ game, onMove, onNewGame, onUndo, onResign }) {
			const [selected, setSelected] = (0, react.useState)(null);
			const [copySuccess, setCopySuccess] = (0, react.useState)(false);
			const moveListEndRef = (0, react.useRef)(null);
			const moveListContainerRef = (0, react.useRef)(null);
			const humanCanMove = game.humanSide === void 0 || game.currentTurn === game.humanSide;
			const selectedLegalMoves = selected === null ? [] : game.legalMoves.filter((move) => samePosition(move.from, selected));
			(0, react.useEffect)(() => {
				if (game.moves.length > 0) {
					if (moveListEndRef.current?.scrollIntoView) moveListEndRef.current.scrollIntoView({
						behavior: "smooth",
						block: "nearest"
					});
					else if (moveListContainerRef.current?.scrollTo) moveListContainerRef.current.scrollTo({
						top: moveListContainerRef.current.scrollHeight,
						behavior: "smooth"
					});
				}
			}, [game.moves.length]);
			const invokeAction = (action) => {
				setSelected(null);
				action();
			};
			const handleCellClick = (position) => {
				if (game.busy === true || game.status !== "playing" || !humanCanMove) return;
				const legalMove = selectedLegalMoves.find((move) => samePosition(move.to, position));
				if (selected !== null && legalMove !== void 0) {
					setSelected(null);
					onMove({
						from: legalMove.from,
						to: legalMove.to
					});
					return;
				}
				if (pieceAt(game, position)?.side === game.currentTurn) {
					setSelected(samePosition(selected, position) ? null : position);
					return;
				}
				setSelected(null);
			};
			const handleCopyNotation = async () => {
				const text = exportPgn(game.moves);
				try {
					if (navigator.clipboard && navigator.clipboard.writeText) await navigator.clipboard.writeText(text);
					else {
						const textarea = document.createElement("textarea");
						textarea.value = text;
						document.body.appendChild(textarea);
						textarea.select();
						document.execCommand("copy");
						document.body.removeChild(textarea);
					}
					setCopySuccess(true);
					setTimeout(() => {
						setCopySuccess(false);
					}, 2e3);
				} catch {}
			};
			const { redLost, blackLost } = getCapturedPieces(game);
			const lastMove = game.moves[game.moves.length - 1];
			const boardCells = [];
			for (let row = 0; row < 10; row += 1) for (let col = 0; col < 9; col += 1) {
				const position = {
					row,
					col
				};
				const piece = pieceAt(game, position);
				const cellMove = game.lastMove;
				const moveEndpoint = isMoveEndpoint(cellMove, position);
				const cellIsSelected = samePosition(selected, position);
				const cellIsLegal = selectedLegalMoves.some((move) => samePosition(move.to, position));
				const isCapturable = cellIsLegal && piece !== null;
				const isCheckingGeneral = game.inCheck && piece !== null && piece.kind === "general" && piece.side === game.currentTurn;
				const cellLabel = `${piece === null ? `第${row + 1}行第${col + 1}列，空位` : `第${row + 1}行第${col + 1}列，${SIDE_LABELS[piece.side]}${pieceLabel(piece)}`}${cellIsLegal ? isCapturable ? "，可吃子" : "，合法落点" : ""}${cellIsSelected ? "，已选中" : ""}`;
				boardCells.push((0, react_jsx_runtime.jsx)("div", {
					className: joinClasses(XiangqiPage_module_css_default.cell, cellIsSelected && XiangqiPage_module_css_default.selectedCell, cellIsLegal && XiangqiPage_module_css_default.legalCell, isCapturable && XiangqiPage_module_css_default.capturableCell, moveEndpoint === "from" && XiangqiPage_module_css_default.lastMoveFromCell, moveEndpoint === "to" && XiangqiPage_module_css_default.lastMoveToCell),
					role: "gridcell",
					"aria-label": cellLabel,
					"aria-rowindex": row + 1,
					"aria-colindex": col + 1,
					children: (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: XiangqiPage_module_css_default.cellButton,
						"aria-label": cellLabel,
						"aria-pressed": cellIsSelected,
						"data-col": col,
						"data-row": row,
						disabled: game.busy === true || game.status !== "playing" || !humanCanMove,
						onClick: () => {
							handleCellClick(position);
						},
						children: [
							piece !== null && (0, react_jsx_runtime.jsxs)("span", {
								className: joinClasses(XiangqiPage_module_css_default.piece, cellIsSelected && XiangqiPage_module_css_default.pieceSelected, isCheckingGeneral && XiangqiPage_module_css_default.pieceInCheck),
								"data-side": piece.side,
								"data-piece-kind": piece.kind,
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: XiangqiPage_module_css_default.pieceInnerRing,
									children: (0, react_jsx_runtime.jsx)("span", {
										className: XiangqiPage_module_css_default.pieceText,
										children: pieceLabel(piece)
									})
								}), isCheckingGeneral && (0, react_jsx_runtime.jsx)("span", {
									className: XiangqiPage_module_css_default.checkBadge,
									children: "将军"
								})]
							}),
							cellIsLegal && !isCapturable && (0, react_jsx_runtime.jsx)("span", {
								className: XiangqiPage_module_css_default.legalDot,
								"aria-hidden": "true"
							}),
							cellIsLegal && isCapturable && (0, react_jsx_runtime.jsxs)("span", {
								className: XiangqiPage_module_css_default.captureReticle,
								"aria-hidden": "true",
								children: [
									(0, react_jsx_runtime.jsx)("span", { className: XiangqiPage_module_css_default.reticleCornerTopLeft }),
									(0, react_jsx_runtime.jsx)("span", { className: XiangqiPage_module_css_default.reticleCornerTopRight }),
									(0, react_jsx_runtime.jsx)("span", { className: XiangqiPage_module_css_default.reticleCornerBottomLeft }),
									(0, react_jsx_runtime.jsx)("span", { className: XiangqiPage_module_css_default.reticleCornerBottomRight })
								]
							}),
							moveEndpoint === "to" && !cellIsSelected && (0, react_jsx_runtime.jsx)("span", {
								className: XiangqiPage_module_css_default.lastMoveTargetIndicator,
								"aria-hidden": "true"
							})
						]
					})
				}, positionKey(position)));
			}
			return (0, react_jsx_runtime.jsxs)("main", {
				className: XiangqiPage_module_css_default.page,
				"aria-labelledby": "xiangqi-page-title",
				children: [(0, react_jsx_runtime.jsxs)("header", {
					className: XiangqiPage_module_css_default.header,
					children: [(0, react_jsx_runtime.jsxs)("div", {
						className: XiangqiPage_module_css_default.headerMain,
						children: [
							(0, react_jsx_runtime.jsxs)("div", {
								className: XiangqiPage_module_css_default.badgeRow,
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: XiangqiPage_module_css_default.gameTag,
									children: "DSH 象棋对弈"
								}), (0, react_jsx_runtime.jsx)("span", {
									className: XiangqiPage_module_css_default.versionTag,
									children: "标准规则"
								})]
							}),
							(0, react_jsx_runtime.jsx)("h1", {
								className: XiangqiPage_module_css_default.title,
								id: "xiangqi-page-title",
								children: "楚汉风云 · 象棋对弈"
							}),
							(0, react_jsx_runtime.jsx)("p", {
								className: XiangqiPage_module_css_default.subtitle,
								children: "与 DSH AI 展开中国象棋博弈，运筹帷幄，决胜千里"
							})
						]
					}), (0, react_jsx_runtime.jsxs)("div", {
						className: XiangqiPage_module_css_default.turnCard,
						"data-side": game.currentTurn,
						"data-busy": game.busy || void 0,
						children: [(0, react_jsx_runtime.jsxs)("div", {
							className: XiangqiPage_module_css_default.turnVisual,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: XiangqiPage_module_css_default.turnAvatar,
								"data-side": game.currentTurn,
								children: game.currentTurn === "red" ? "帅" : "将"
							}), (0, react_jsx_runtime.jsx)("span", { className: XiangqiPage_module_css_default.turnPulse })]
						}), (0, react_jsx_runtime.jsxs)("div", {
							className: XiangqiPage_module_css_default.turnDetails,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: XiangqiPage_module_css_default.turnStatusBadge,
								children: game.busy ? "AI 思考中…" : "落子中"
							}), (0, react_jsx_runtime.jsx)("strong", {
								className: XiangqiPage_module_css_default.turnPlayer,
								children: game.currentTurn === "red" ? "红方（您）" : "黑方（AI）"
							})]
						})]
					})]
				}), (0, react_jsx_runtime.jsxs)("div", {
					className: XiangqiPage_module_css_default.layout,
					children: [(0, react_jsx_runtime.jsxs)("section", {
						className: XiangqiPage_module_css_default.boardColumn,
						"aria-labelledby": "xiangqi-board-title",
						children: [
							(0, react_jsx_runtime.jsx)("div", {
								className: XiangqiPage_module_css_default.sectionHeading,
								children: (0, react_jsx_runtime.jsxs)("div", {
									className: XiangqiPage_module_css_default.playerStrip,
									children: [
										(0, react_jsx_runtime.jsxs)("div", {
											className: joinClasses(XiangqiPage_module_css_default.playerCard, game.currentTurn === "black" && XiangqiPage_module_css_default.playerCardActive),
											children: [(0, react_jsx_runtime.jsx)("span", {
												className: XiangqiPage_module_css_default.playerPieceIcon,
												"data-side": "black",
												children: "将"
											}), (0, react_jsx_runtime.jsxs)("div", {
												className: XiangqiPage_module_css_default.playerMeta,
												children: [(0, react_jsx_runtime.jsx)("span", {
													className: XiangqiPage_module_css_default.playerName,
													children: "黑方 · DSH AI"
												}), (0, react_jsx_runtime.jsxs)("div", {
													className: XiangqiPage_module_css_default.lostPieces,
													children: [redLost.map((k, i) => (0, react_jsx_runtime.jsx)("span", {
														className: XiangqiPage_module_css_default.lostPiece,
														"data-side": "red",
														title: `吃掉红方 ${PIECE_LABELS.red[k]}`,
														children: PIECE_LABELS.red[k]
													}, `redLost-${i}`)), redLost.length === 0 && (0, react_jsx_runtime.jsx)("span", {
														className: XiangqiPage_module_css_default.lostEmpty,
														children: "暂无失子"
													})]
												})]
											})]
										}),
										(0, react_jsx_runtime.jsx)("div", {
											className: XiangqiPage_module_css_default.vsDivider,
											children: "VS"
										}),
										(0, react_jsx_runtime.jsxs)("div", {
											className: joinClasses(XiangqiPage_module_css_default.playerCard, game.currentTurn === "red" && XiangqiPage_module_css_default.playerCardActive),
											children: [(0, react_jsx_runtime.jsx)("span", {
												className: XiangqiPage_module_css_default.playerPieceIcon,
												"data-side": "red",
												children: "帅"
											}), (0, react_jsx_runtime.jsxs)("div", {
												className: XiangqiPage_module_css_default.playerMeta,
												children: [(0, react_jsx_runtime.jsx)("span", {
													className: XiangqiPage_module_css_default.playerName,
													children: "红方 · 执红先行（执子）"
												}), (0, react_jsx_runtime.jsxs)("div", {
													className: XiangqiPage_module_css_default.lostPieces,
													children: [blackLost.map((k, i) => (0, react_jsx_runtime.jsx)("span", {
														className: XiangqiPage_module_css_default.lostPiece,
														"data-side": "black",
														title: `吃掉黑方 ${PIECE_LABELS.black[k]}`,
														children: PIECE_LABELS.black[k]
													}, `blackLost-${i}`)), blackLost.length === 0 && (0, react_jsx_runtime.jsx)("span", {
														className: XiangqiPage_module_css_default.lostEmpty,
														children: "暂无失子"
													})]
												})]
											})]
										})
									]
								})
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: XiangqiPage_module_css_default.boardSurface,
								children: [
									(0, react_jsx_runtime.jsx)("div", {
										className: XiangqiPage_module_css_default.fileLabelsTop,
										"aria-hidden": "true",
										children: [
											"1",
											"2",
											"3",
											"4",
											"5",
											"6",
											"7",
											"8",
											"9"
										].map((n) => (0, react_jsx_runtime.jsx)("span", {
											className: XiangqiPage_module_css_default.coordLabel,
											children: n
										}, `top-${n}`))
									}),
									(0, react_jsx_runtime.jsxs)("div", {
										className: XiangqiPage_module_css_default.boardGrid,
										role: "grid",
										"aria-label": "中国象棋棋盘，9列10行",
										"aria-rowcount": 10,
										"aria-colcount": 9,
										children: [
											(0, react_jsx_runtime.jsxs)("svg", {
												className: XiangqiPage_module_css_default.boardDecorationSvg,
												viewBox: "0 0 900 1000",
												preserveAspectRatio: "none",
												"aria-hidden": "true",
												children: [
													(0, react_jsx_runtime.jsxs)("defs", { children: [
														(0, react_jsx_runtime.jsxs)("g", {
															id: "star-mark-full",
															children: [
																(0, react_jsx_runtime.jsx)("path", {
																	d: "M -14,-4 L -4,-4 L -4,-14",
																	fill: "none",
																	stroke: "currentColor",
																	strokeWidth: "1.5"
																}),
																(0, react_jsx_runtime.jsx)("path", {
																	d: "M 4,-14 L 4,-4 L 14,-4",
																	fill: "none",
																	stroke: "currentColor",
																	strokeWidth: "1.5"
																}),
																(0, react_jsx_runtime.jsx)("path", {
																	d: "M -14,4 L -4,4 L -4,14",
																	fill: "none",
																	stroke: "currentColor",
																	strokeWidth: "1.5"
																}),
																(0, react_jsx_runtime.jsx)("path", {
																	d: "M 4,14 L 4,4 L 14,4",
																	fill: "none",
																	stroke: "currentColor",
																	strokeWidth: "1.5"
																})
															]
														}),
														(0, react_jsx_runtime.jsxs)("g", {
															id: "star-mark-left",
															children: [(0, react_jsx_runtime.jsx)("path", {
																d: "M 4,-14 L 4,-4 L 14,-4",
																fill: "none",
																stroke: "currentColor",
																strokeWidth: "1.5"
															}), (0, react_jsx_runtime.jsx)("path", {
																d: "M 4,14 L 4,4 L 14,4",
																fill: "none",
																stroke: "currentColor",
																strokeWidth: "1.5"
															})]
														}),
														(0, react_jsx_runtime.jsxs)("g", {
															id: "star-mark-right",
															children: [(0, react_jsx_runtime.jsx)("path", {
																d: "M -14,-4 L -4,-4 L -4,-14",
																fill: "none",
																stroke: "currentColor",
																strokeWidth: "1.5"
															}), (0, react_jsx_runtime.jsx)("path", {
																d: "M -14,4 L -4,4 L -4,14",
																fill: "none",
																stroke: "currentColor",
																strokeWidth: "1.5"
															})]
														})
													] }),
													(0, react_jsx_runtime.jsx)("line", {
														x1: "350",
														y1: "50",
														x2: "550",
														y2: "250",
														stroke: "currentColor",
														strokeWidth: "1.2",
														strokeOpacity: "0.75"
													}),
													(0, react_jsx_runtime.jsx)("line", {
														x1: "550",
														y1: "50",
														x2: "350",
														y2: "250",
														stroke: "currentColor",
														strokeWidth: "1.2",
														strokeOpacity: "0.75"
													}),
													(0, react_jsx_runtime.jsx)("line", {
														x1: "350",
														y1: "750",
														x2: "550",
														y2: "950",
														stroke: "currentColor",
														strokeWidth: "1.2",
														strokeOpacity: "0.75"
													}),
													(0, react_jsx_runtime.jsx)("line", {
														x1: "550",
														y1: "750",
														x2: "350",
														y2: "950",
														stroke: "currentColor",
														strokeWidth: "1.2",
														strokeOpacity: "0.75"
													}),
													(0, react_jsx_runtime.jsx)("use", {
														href: "#star-mark-full",
														x: "150",
														y: "250",
														opacity: "0.6"
													}),
													(0, react_jsx_runtime.jsx)("use", {
														href: "#star-mark-full",
														x: "750",
														y: "250",
														opacity: "0.6"
													}),
													(0, react_jsx_runtime.jsx)("use", {
														href: "#star-mark-full",
														x: "150",
														y: "750",
														opacity: "0.6"
													}),
													(0, react_jsx_runtime.jsx)("use", {
														href: "#star-mark-full",
														x: "750",
														y: "750",
														opacity: "0.6"
													}),
													(0, react_jsx_runtime.jsx)("use", {
														href: "#star-mark-left",
														x: "50",
														y: "350",
														opacity: "0.6"
													}),
													(0, react_jsx_runtime.jsx)("use", {
														href: "#star-mark-full",
														x: "250",
														y: "350",
														opacity: "0.6"
													}),
													(0, react_jsx_runtime.jsx)("use", {
														href: "#star-mark-full",
														x: "450",
														y: "350",
														opacity: "0.6"
													}),
													(0, react_jsx_runtime.jsx)("use", {
														href: "#star-mark-full",
														x: "650",
														y: "350",
														opacity: "0.6"
													}),
													(0, react_jsx_runtime.jsx)("use", {
														href: "#star-mark-right",
														x: "850",
														y: "350",
														opacity: "0.6"
													}),
													(0, react_jsx_runtime.jsx)("use", {
														href: "#star-mark-left",
														x: "50",
														y: "650",
														opacity: "0.6"
													}),
													(0, react_jsx_runtime.jsx)("use", {
														href: "#star-mark-full",
														x: "250",
														y: "650",
														opacity: "0.6"
													}),
													(0, react_jsx_runtime.jsx)("use", {
														href: "#star-mark-full",
														x: "450",
														y: "650",
														opacity: "0.6"
													}),
													(0, react_jsx_runtime.jsx)("use", {
														href: "#star-mark-full",
														x: "650",
														y: "650",
														opacity: "0.6"
													}),
													(0, react_jsx_runtime.jsx)("use", {
														href: "#star-mark-right",
														x: "850",
														y: "650",
														opacity: "0.6"
													})
												]
											}),
											(0, react_jsx_runtime.jsxs)("div", {
												className: XiangqiPage_module_css_default.riverArea,
												"aria-hidden": "true",
												children: [
													(0, react_jsx_runtime.jsx)("span", {
														className: XiangqiPage_module_css_default.riverTextLeft,
														children: "楚　河"
													}),
													(0, react_jsx_runtime.jsx)("span", {
														className: XiangqiPage_module_css_default.riverEmblem,
														children: "☯"
													}),
													(0, react_jsx_runtime.jsx)("span", {
														className: XiangqiPage_module_css_default.riverTextRight,
														children: "漢　界"
													})
												]
											}),
											boardCells
										]
									}),
									(0, react_jsx_runtime.jsx)("div", {
										className: XiangqiPage_module_css_default.fileLabelsBottom,
										"aria-hidden": "true",
										children: [
											"九",
											"八",
											"七",
											"六",
											"五",
											"四",
											"三",
											"二",
											"一"
										].map((n) => (0, react_jsx_runtime.jsx)("span", {
											className: XiangqiPage_module_css_default.coordLabel,
											children: n
										}, `bot-${n}`))
									})
								]
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: XiangqiPage_module_css_default.statusCard,
								role: "status",
								"aria-live": "polite",
								children: [(0, react_jsx_runtime.jsx)("div", {
									className: XiangqiPage_module_css_default.statusIconWrapper,
									"data-status": game.status,
									children: game.status === "playing" ? (0, react_jsx_runtime.jsx)("span", { className: XiangqiPage_module_css_default.statusPulseDot }) : (0, react_jsx_runtime.jsx)("span", {
										className: XiangqiPage_module_css_default.statusResultIcon,
										children: "🏆"
									})
								}), (0, react_jsx_runtime.jsxs)("div", {
									className: XiangqiPage_module_css_default.statusInfo,
									children: [(0, react_jsx_runtime.jsx)("strong", {
										className: XiangqiPage_module_css_default.statusHeadline,
										children: game.statusText
									}), (0, react_jsx_runtime.jsx)("span", {
										className: XiangqiPage_module_css_default.statusSubtext,
										children: game.status === "playing" ? game.inCheck ? "⚠️ 当前将军，请化解危机！" : humanCanMove ? "请选择己方棋子并点击绿色/红色落点走子" : "AI 正在计算最佳应手…" : "对局已结束，可点击下方【新局】重新开盘"
									})]
								})]
							})
						]
					}), (0, react_jsx_runtime.jsxs)("aside", {
						className: XiangqiPage_module_css_default.sideColumn,
						"aria-label": "棋局走法与操作",
						children: [(0, react_jsx_runtime.jsxs)("section", {
							className: XiangqiPage_module_css_default.panel,
							"aria-labelledby": "xiangqi-moves-title",
							children: [
								(0, react_jsx_runtime.jsxs)("div", {
									className: XiangqiPage_module_css_default.panelHeader,
									children: [(0, react_jsx_runtime.jsxs)("div", {
										className: XiangqiPage_module_css_default.panelTitleGroup,
										children: [(0, react_jsx_runtime.jsx)("h2", {
											className: XiangqiPage_module_css_default.panelTitle,
											id: "xiangqi-moves-title",
											children: "实时走法"
										}), (0, react_jsx_runtime.jsxs)("span", {
											className: XiangqiPage_module_css_default.moveBadge,
											children: [game.moves.length, " 步"]
										})]
									}), (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: XiangqiPage_module_css_default.copyButton,
										onClick: handleCopyNotation,
										disabled: game.moves.length === 0,
										title: "复制整局中文棋谱",
										children: copySuccess ? "✓ 已复制" : "复制棋谱"
									})]
								}),
								(0, react_jsx_runtime.jsxs)("div", {
									className: XiangqiPage_module_css_default.latestMoveBar,
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: XiangqiPage_module_css_default.latestLabel,
										children: "最新一手"
									}), lastMove ? (0, react_jsx_runtime.jsxs)("span", {
										className: XiangqiPage_module_css_default.latestValue,
										"data-side": lastMove.side,
										children: [
											(0, react_jsx_runtime.jsx)("strong", { children: SIDE_LABELS[lastMove.side] }),
											" ",
											lastMove.notation,
											lastMove.notation.includes("将军") && (0, react_jsx_runtime.jsx)("span", {
												className: XiangqiPage_module_css_default.checkTag,
												children: "⚡将军"
											}),
											lastMove.notation.includes("将死") && (0, react_jsx_runtime.jsx)("span", {
												className: XiangqiPage_module_css_default.mateTag,
												children: "🔥将死"
											})
										]
									}) : (0, react_jsx_runtime.jsx)("span", {
										className: XiangqiPage_module_css_default.latestEmpty,
										children: "尚未开始，等待红方起手"
									})]
								}),
								(0, react_jsx_runtime.jsxs)("ol", {
									ref: moveListContainerRef,
									className: XiangqiPage_module_css_default.moveList,
									"aria-label": "象棋对弈走法记录",
									children: [
										game.moves.length === 0 && (0, react_jsx_runtime.jsxs)("li", {
											className: XiangqiPage_module_css_default.emptyMovesState,
											children: [
												(0, react_jsx_runtime.jsx)("span", {
													className: XiangqiPage_module_css_default.emptyMovesIcon,
													children: "📜"
												}),
												(0, react_jsx_runtime.jsx)("p", {
													className: XiangqiPage_module_css_default.emptyMovesTitle,
													children: "棋谱虚席以待"
												}),
												(0, react_jsx_runtime.jsx)("p", {
													className: XiangqiPage_module_css_default.emptyMovesHint,
													children: "红方先行，落子后此处将实时记录每步着法"
												})
											]
										}),
										Array.from({ length: Math.ceil(game.moves.length / 2) }).map((_, roundIndex) => {
											const redMoveIndex = roundIndex * 2;
											const blackMoveIndex = redMoveIndex + 1;
											const redMove = game.moves[redMoveIndex];
											const blackMove = game.moves[blackMoveIndex];
											const isLatestRound = blackMove ? blackMoveIndex === game.moves.length - 1 : redMoveIndex === game.moves.length - 1;
											return (0, react_jsx_runtime.jsxs)("li", {
												className: joinClasses(XiangqiPage_module_css_default.roundItem, isLatestRound && XiangqiPage_module_css_default.roundItemLatest),
												children: [
													(0, react_jsx_runtime.jsx)("span", {
														className: XiangqiPage_module_css_default.roundIndex,
														children: String(roundIndex + 1).padStart(2, "0")
													}),
													(0, react_jsx_runtime.jsxs)("div", {
														className: joinClasses(XiangqiPage_module_css_default.moveBlock, XiangqiPage_module_css_default.redMoveBlock, redMoveIndex === game.moves.length - 1 && XiangqiPage_module_css_default.moveBlockLatest),
														children: [
															(0, react_jsx_runtime.jsx)("span", {
																className: XiangqiPage_module_css_default.moveSideIcon,
																"data-side": "red",
																children: "红"
															}),
															(0, react_jsx_runtime.jsx)("span", {
																className: XiangqiPage_module_css_default.moveNotationText,
																children: redMove.notation
															}),
															redMoveIndex === game.moves.length - 1 && (0, react_jsx_runtime.jsx)("span", {
																className: XiangqiPage_module_css_default.latestBadge,
																children: "最新"
															})
														]
													}),
													blackMove ? (0, react_jsx_runtime.jsxs)("div", {
														className: joinClasses(XiangqiPage_module_css_default.moveBlock, XiangqiPage_module_css_default.blackMoveBlock, blackMoveIndex === game.moves.length - 1 && XiangqiPage_module_css_default.moveBlockLatest),
														children: [
															(0, react_jsx_runtime.jsx)("span", {
																className: XiangqiPage_module_css_default.moveSideIcon,
																"data-side": "black",
																children: "黑"
															}),
															(0, react_jsx_runtime.jsx)("span", {
																className: XiangqiPage_module_css_default.moveNotationText,
																children: blackMove.notation
															}),
															blackMoveIndex === game.moves.length - 1 && (0, react_jsx_runtime.jsx)("span", {
																className: XiangqiPage_module_css_default.latestBadge,
																children: "最新"
															})
														]
													}) : (0, react_jsx_runtime.jsx)("div", {
														className: joinClasses(XiangqiPage_module_css_default.moveBlock, XiangqiPage_module_css_default.pendingMoveBlock),
														children: (0, react_jsx_runtime.jsx)("span", {
															className: XiangqiPage_module_css_default.pendingDot,
															children: "…"
														})
													})
												]
											}, `round-${roundIndex + 1}`);
										}),
										(0, react_jsx_runtime.jsx)("div", {
											ref: moveListEndRef,
											style: { height: "1px" }
										})
									]
								})
							]
						}), (0, react_jsx_runtime.jsxs)("section", {
							className: XiangqiPage_module_css_default.panel,
							"aria-labelledby": "xiangqi-actions-title",
							children: [(0, react_jsx_runtime.jsx)("h2", {
								className: XiangqiPage_module_css_default.panelTitle,
								id: "xiangqi-actions-title",
								children: "棋局操作"
							}), (0, react_jsx_runtime.jsxs)("div", {
								className: XiangqiPage_module_css_default.actionsGrid,
								children: [
									(0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: XiangqiPage_module_css_default.actionNewGame,
										disabled: game.busy === true,
										onClick: () => {
											invokeAction(onNewGame);
										},
										children: [(0, react_jsx_runtime.jsx)("span", {
											className: XiangqiPage_module_css_default.btnIcon,
											children: "🔄"
										}), (0, react_jsx_runtime.jsx)("span", { children: "新局" })]
									}),
									(0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: XiangqiPage_module_css_default.actionUndo,
										disabled: game.busy === true || game.moves.length === 0,
										onClick: () => {
											invokeAction(onUndo);
										},
										title: "撤销上一步落子",
										children: [(0, react_jsx_runtime.jsx)("span", {
											className: XiangqiPage_module_css_default.btnIcon,
											children: "↩️"
										}), (0, react_jsx_runtime.jsx)("span", { children: "悔棋" })]
									}),
									(0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: XiangqiPage_module_css_default.actionResign,
										disabled: game.busy === true || game.status !== "playing",
										onClick: () => {
											invokeAction(onResign);
										},
										title: "向对方认输结束本局",
										children: [(0, react_jsx_runtime.jsx)("span", {
											className: XiangqiPage_module_css_default.btnIcon,
											children: "🏳️"
										}), (0, react_jsx_runtime.jsx)("span", { children: "认输" })]
									})
								]
							})]
						})]
					})]
				})]
			});
		}
		/** Backwards-compatible board name for slot adapters that call the surface a board. */
		const XiangqiBoard = XiangqiPage;
		//#endregion
		//#region \0dsh-css:D:\Agent\dsh插件\dsh-Plugin-中国象棋\src\client\XiangqiSlots.module.css.mjs
		const css = ".l0paaq_sidebarAction{width:100%}.l0paaq_sidebarButton{width:100%;min-height:34px;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;background:0 0;border:1px solid #0000;border-radius:8px;justify-content:flex-start;align-items:center;gap:9px;padding:6px 10px;font-size:13px;line-height:20px;display:flex}.l0paaq_sidebarButton:hover{border-color:var(--dsw-alias-border-l1);background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.l0paaq_sidebarButton:focus-visible,.l0paaq_closeButton:focus-visible,.l0paaq_retryButton:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}.l0paaq_sidebarGlyph{width:20px;height:20px;color:var(--dsw-alias-state-error-primary);border:1px solid;border-radius:50%;justify-content:center;align-items:center;font-family:Noto Serif SC,Songti SC,serif;font-size:12px;font-weight:650;line-height:1;display:inline-flex}.l0paaq_sidebarLabel{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}.l0paaq_overlayBackdrop{z-index:20;background:color-mix(in srgb, var(--dsw-alias-bg-base) 72%, transparent);pointer-events:auto;justify-content:center;align-items:center;padding:20px;display:flex;position:fixed;inset:0}.l0paaq_overlayBackdropMinimized{z-index:20;pointer-events:auto;position:fixed;bottom:20px;right:20px}.l0paaq_overlaySurface{background:#111317;border:1px solid #d4af3733;border-radius:18px;flex-direction:column;width:min(1280px,100%);max-height:min(94vh,1100px);display:flex;overflow:hidden;box-shadow:0 25px 60px -15px #000c,0 0 0 1px #ffffff0d}.l0paaq_overlaySurfaceMinimized{border-radius:14px;width:min(360px,100vw - 32px);max-height:none}.l0paaq_overlayToolbar{background:linear-gradient(#1d222a 0%,#15181f 100%);border-bottom:1px solid #ffffff14;justify-content:space-between;align-items:center;gap:14px;min-height:52px;padding:8px 20px;display:flex}.l0paaq_toolbarActions{flex:none;align-items:center;gap:8px;display:flex}.l0paaq_overlayTitle{color:#f1f5f9;letter-spacing:.02em;align-items:center;gap:8px;margin:0;font-size:16px;font-weight:700;display:flex}.l0paaq_overlayTitle:before{content:\"♟️\";font-size:15px}.l0paaq_minimizeButton,.l0paaq_closeButton,.l0paaq_retryButton{color:#cbd5e1;min-height:32px;font:inherit;cursor:pointer;background:#ffffff0a;border:1px solid #ffffff1f;border-radius:8px;padding:5px 12px;font-size:12px;font-weight:550;line-height:20px;transition:all .2s}.l0paaq_minimizeButton{color:#cbd5e1;background:#ffffff0f;border-color:#ffffff1a}.l0paaq_minimizeButton:hover,.l0paaq_closeButton:hover,.l0paaq_retryButton:hover{color:#fff;background:#d4af3726;border-color:#d4af3766}.l0paaq_minimizedSummary{min-height:42px;color:var(--dsw-alias-label-secondary);align-items:center;gap:9px;padding:0 14px;font-size:12px;line-height:18px;display:flex}.l0paaq_minimizedDot{background:var(--dsw-alias-state-business-primary);border-radius:50%;flex:none;width:8px;height:8px}.l0paaq_minimizedDot[data-busy=true]{background:var(--dsw-alias-state-warning-primary,var(--dsw-alias-state-business-primary))}.l0paaq_emptyState{min-height:240px;color:var(--dsw-alias-label-secondary);text-align:center;justify-items:center;gap:10px;padding:60px 20px;font-size:14px;line-height:22px;display:grid}.l0paaq_emptyState p{margin:0}.l0paaq_errorText,.l0paaq_inlineError{color:var(--dsw-alias-state-error-primary)}.l0paaq_sidebarButton:focus-visible,.l0paaq_minimizeButton:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}.l0paaq_inlineError{margin:0;padding:0 18px 12px;font-size:12px;line-height:18px}@media (width<=560px){.l0paaq_overlayBackdrop{align-items:stretch;padding:0}.l0paaq_overlayBackdropMinimized{bottom:12px;left:12px;right:12px}.l0paaq_overlaySurface{border-radius:0;max-height:none}.l0paaq_overlayToolbar{padding-inline:14px}}";
		const tagId = "@deepseek-ai/dsh-plugin-xiangqi/XiangqiSlots.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-plugin-xiangqi";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var XiangqiSlots_module_css_default = {
			"sidebarAction": "l0paaq_sidebarAction",
			"retryButton": "l0paaq_retryButton",
			"sidebarGlyph": "l0paaq_sidebarGlyph",
			"toolbarActions": "l0paaq_toolbarActions",
			"minimizeButton": "l0paaq_minimizeButton",
			"closeButton": "l0paaq_closeButton",
			"sidebarLabel": "l0paaq_sidebarLabel",
			"overlayToolbar": "l0paaq_overlayToolbar",
			"overlayBackdropMinimized": "l0paaq_overlayBackdropMinimized",
			"minimizedSummary": "l0paaq_minimizedSummary",
			"emptyState": "l0paaq_emptyState",
			"inlineError": "l0paaq_inlineError",
			"overlayBackdrop": "l0paaq_overlayBackdrop",
			"overlayTitle": "l0paaq_overlayTitle",
			"overlaySurfaceMinimized": "l0paaq_overlaySurfaceMinimized",
			"errorText": "l0paaq_errorText",
			"sidebarButton": "l0paaq_sidebarButton",
			"overlaySurface": "l0paaq_overlaySurface",
			"minimizedDot": "l0paaq_minimizedDot"
		};
		//#endregion
		//#region lib/types/game/ai.js
		/**
		* 中国象棋 AI：迭代加深 + Alpha-Beta + 置换表 + 静态搜索。
		*
		* 设计目标：速度与棋力兼顾。
		* - 就地 make/unmake 棋盘：搜索过程中不再克隆整盘、不生成中文记谱、不重建
		*   GameState，单次节点开销比直接调用 applyMove 低一个数量级。
		* - 迭代加深 + 时间预算：默认在几百毫秒内返回可靠结果，剩余预算自动向下挖掘
		*   更深；未配置时间预算时退化为固定深度模式（兼顾旧调用方）。
		* - Zobrist 置换表（TT）：缓存重复局面，避免重复搜索。
		* - 静态搜索（QSearch）：叶子只延伸吃子与将军应对，消除“白送子/白吃子”的
		*   水平线效应——这是提升棋感最直接的一项。
		* - 走法排序：TT 首选走法 > MVV-LVA 吃子分 > 杀手走法 > 历史启发，让剪枝效率
		*   进一步成倍提升。
		* - 评估：物质 + 位置价值表（红黑对称）+ 过河兵奖励。
		*
		* 走法与合法性判定完全复用 rules.ts 导出的伪走法与就地将军判断，搜索与规则
		* 引擎不会失同步。
		*/
		const DEFAULT_MAX_DEPTH = 6;
		const FIXED_DEPTH_MIN = 1;
		const FIXED_DEPTH_MAX = 6;
		const DEFAULT_LIMIT = 5;
		const MAX_LIMIT = 8;
		/** 将死/绝杀分数；一层约相差 1_000_000 / MATE_PLY_BONUS，避免多步将死互相混淆。 */
		const MATE_SCORE = 1e6;
		/** 接近将死值即视为“将死分数”的阈值。 */
		const MATE_THRESHOLD = MATE_SCORE - 100;
		/** 静态搜索最大深度（含吃子/将军应对）。 */
		const QSEARCH_PLY_LIMIT = 24;
		const PAWN_CROSSED_RIVER_BONUS = 40;
		/** 基础子力价值（红黑共用）。 */
		const PIECE_VALUES = {
			general: 1e4,
			rook: 1e3,
			cannon: 550,
			horse: 400,
			elephant: 250,
			advisor: 250,
			soldier: 150
		};
		/** 确定性 64 位 PRNG，保证同一次命中的哈希表每次一致。 */
		function splitmix64(seed) {
			let state = seed & 18446744073709551615n;
			return () => {
				state = state + 11400714819323198485n & 18446744073709551615n;
				let z = state;
				z = (z ^ z >> 30n) * 13787848793156543929n & 18446744073709551615n;
				z = (z ^ z >> 27n) * 10723151780598845931n & 18446744073709551615n;
				return z ^ z >> 31n;
			};
		}
		const PIECE_TYPE_ORDER = [
			"general",
			"advisor",
			"elephant",
			"horse",
			"rook",
			"cannon",
			"soldier"
		];
		const PIECE_HASH = (() => {
			const random = splitmix64(11325522273671422743n);
			const table = new BigUint64Array(1260);
			for (let i = 0; i < table.length; i += 1) table[i] = random();
			return table;
		})();
		const SIDE_HASH = (() => {
			return splitmix64(8158064426821842807n)();
		})();
		/** 就地棋盘上的 Zobrist 增量键（不含轮次边 switch）。 */
		function boardKey(board) {
			let key = 0n;
			for (let index = 0; index < board.length; index += 1) {
				const piece = board[index];
				if (piece === null) continue;
				key ^= PIECE_HASH[index * 14 + pieceCode(piece.side, piece.type)];
			}
			return key;
		}
		function pieceCode(side, type) {
			return (side === "black" ? 7 : 0) + PIECE_TYPE_ORDER.indexOf(type);
		}
		function indexOf(position) {
			return position.y * 9 + position.x;
		}
		/** 切换轮次的边。 */
		function otherSide(side) {
			return side === "red" ? "black" : "red";
		}
		/** 就地走子并增量更新 Zobrist 键；返回撤销信息。 */
		function makeMoveInPlace(board, fromIndex, toIndex, context) {
			const mover = board[fromIndex];
			const captured = board[toIndex];
			if (mover === null) throw new Error(`AI 内部错误: 起点 ${fromIndex} 无棋子`);
			board[toIndex] = mover;
			board[fromIndex] = null;
			let key = context.key;
			key ^= PIECE_HASH[fromIndex * 14 + pieceCode(mover.side, mover.type)];
			key ^= PIECE_HASH[toIndex * 14 + pieceCode(mover.side, mover.type)];
			if (captured !== null) key ^= PIECE_HASH[toIndex * 14 + pieceCode(captured.side, captured.type)];
			context.key = key;
			return {
				mover,
				captured
			};
		}
		/** 撤销就地走子并还原 Zobrist 键。 */
		function unmakeMoveInPlace(board, fromIndex, toIndex, undo, context) {
			board[fromIndex] = undo.mover;
			board[toIndex] = undo.captured;
			let key = context.key;
			key ^= PIECE_HASH[toIndex * 14 + pieceCode(undo.mover.side, undo.mover.type)];
			key ^= PIECE_HASH[fromIndex * 14 + pieceCode(undo.mover.side, undo.mover.type)];
			if (undo.captured !== null) key ^= PIECE_HASH[toIndex * 14 + pieceCode(undo.captured.side, undo.captured.type)];
			context.key = key;
		}
		const PST_BY_TYPE = {
			general: { rows: [
				[
					0,
					0,
					0,
					-2,
					-4,
					-2,
					0,
					0,
					0
				],
				[
					0,
					0,
					0,
					4,
					6,
					4,
					0,
					0,
					0
				],
				[
					0,
					0,
					0,
					2,
					4,
					2,
					0,
					0,
					0
				],
				[
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0
				],
				[
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0
				],
				[
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0
				],
				[
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0
				],
				[
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0
				],
				[
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0
				],
				[
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0
				]
			] },
			advisor: { rows: [
				[
					0,
					0,
					0,
					4,
					0,
					4,
					0,
					0,
					0
				],
				[
					0,
					0,
					0,
					0,
					6,
					0,
					0,
					0,
					0
				],
				[
					0,
					0,
					0,
					4,
					0,
					4,
					0,
					0,
					0
				],
				[
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0
				],
				[
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0
				],
				[
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0
				],
				[
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0
				],
				[
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0
				],
				[
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0
				],
				[
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0
				]
			] },
			elephant: { rows: [
				[
					0,
					0,
					6,
					0,
					0,
					0,
					6,
					0,
					0
				],
				[
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0
				],
				[
					6,
					0,
					0,
					6,
					8,
					6,
					0,
					0,
					6
				],
				[
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0
				],
				[
					0,
					0,
					6,
					0,
					6,
					0,
					6,
					0,
					0
				],
				[
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0
				],
				[
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0
				],
				[
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0
				],
				[
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0
				],
				[
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0
				]
			] },
			horse: { rows: [
				[
					-10,
					-8,
					-6,
					-4,
					-2,
					-4,
					-6,
					-8,
					-10
				],
				[
					-8,
					-4,
					0,
					2,
					4,
					2,
					0,
					-4,
					-8
				],
				[
					-4,
					0,
					6,
					8,
					10,
					8,
					6,
					0,
					-4
				],
				[
					0,
					4,
					8,
					12,
					14,
					12,
					8,
					4,
					0
				],
				[
					4,
					8,
					12,
					16,
					18,
					16,
					12,
					8,
					4
				],
				[
					4,
					8,
					12,
					16,
					18,
					16,
					12,
					8,
					4
				],
				[
					0,
					4,
					8,
					12,
					14,
					12,
					8,
					4,
					0
				],
				[
					-4,
					0,
					6,
					8,
					10,
					8,
					6,
					0,
					-4
				],
				[
					-8,
					-4,
					0,
					2,
					4,
					2,
					0,
					-4,
					-8
				],
				[
					-10,
					-8,
					-6,
					-4,
					-2,
					-4,
					-6,
					-8,
					-10
				]
			] },
			rook: { rows: [
				[
					-8,
					-6,
					-2,
					0,
					2,
					0,
					-2,
					-6,
					-8
				],
				[
					-6,
					-4,
					0,
					2,
					4,
					2,
					0,
					-4,
					-6
				],
				[
					-4,
					-2,
					2,
					4,
					6,
					4,
					2,
					-2,
					-4
				],
				[
					-2,
					0,
					4,
					6,
					8,
					6,
					4,
					0,
					-2
				],
				[
					0,
					2,
					6,
					8,
					10,
					8,
					6,
					2,
					0
				],
				[
					0,
					2,
					6,
					8,
					10,
					8,
					6,
					2,
					0
				],
				[
					-2,
					0,
					4,
					6,
					8,
					6,
					4,
					0,
					-2
				],
				[
					-4,
					-2,
					2,
					4,
					6,
					4,
					2,
					-2,
					-4
				],
				[
					-6,
					-4,
					0,
					2,
					4,
					2,
					0,
					-4,
					-6
				],
				[
					-8,
					-6,
					-2,
					0,
					2,
					0,
					-2,
					-6,
					-8
				]
			] },
			cannon: { rows: [
				[
					-4,
					-2,
					0,
					2,
					2,
					2,
					0,
					-2,
					-4
				],
				[
					-2,
					0,
					2,
					4,
					4,
					4,
					2,
					0,
					-2
				],
				[
					0,
					2,
					4,
					6,
					8,
					6,
					4,
					2,
					0
				],
				[
					2,
					4,
					6,
					8,
					10,
					8,
					6,
					4,
					2
				],
				[
					4,
					6,
					8,
					10,
					12,
					10,
					8,
					6,
					4
				],
				[
					2,
					4,
					6,
					8,
					10,
					8,
					6,
					4,
					2
				],
				[
					0,
					2,
					4,
					6,
					8,
					6,
					4,
					2,
					0
				],
				[
					0,
					2,
					4,
					6,
					8,
					6,
					4,
					2,
					0
				],
				[
					-2,
					0,
					2,
					4,
					4,
					4,
					2,
					0,
					-2
				],
				[
					-4,
					-2,
					0,
					2,
					2,
					2,
					0,
					-2,
					-4
				]
			] },
			soldier: { rows: [
				[
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0
				],
				[
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0
				],
				[
					0,
					0,
					-2,
					-2,
					-2,
					-2,
					-2,
					0,
					0
				],
				[
					0,
					0,
					0,
					-4,
					-6,
					-4,
					0,
					0,
					0
				],
				[
					0,
					-2,
					-2,
					-4,
					-6,
					-4,
					-2,
					-2,
					0
				],
				[
					6,
					6,
					8,
					10,
					14,
					10,
					8,
					6,
					6
				],
				[
					8,
					10,
					12,
					16,
					20,
					16,
					12,
					10,
					8
				],
				[
					12,
					14,
					18,
					22,
					26,
					22,
					18,
					14,
					12
				],
				[
					14,
					16,
					20,
					24,
					30,
					24,
					20,
					16,
					14
				],
				[
					10,
					12,
					16,
					20,
					24,
					20,
					16,
					12,
					10
				]
			] }
		};
		/** 某方视角下的表格行（红方从底部旋转，黑方正序）。 */
		function pstValue(type, side, x, y) {
			const row = side === "red" ? 9 - y : y;
			const table = PST_BY_TYPE[type];
			if (row < 0 || row >= table.rows.length) return 0;
			const line = table.rows[row];
			if (x < 0 || x >= line.length) return 0;
			return line[x];
		}
		function crossedRiver(side, y) {
			return side === "red" ? y <= 4 : y >= 5;
		}
		/**
		* 静态评估：从“当前轮到的一方”视角返回分数（适配 Negamax）。
		* 物质 + 位置表 + 过河兵 + 被将军惩罚，不生成走法，保证叶子评估极快。
		*/
		function evaluate(board, turn) {
			let score = 0;
			for (let index = 0; index < board.length; index += 1) {
				const piece = board[index];
				if (piece === null) continue;
				const x = index % 9;
				const y = Math.floor(index / 9);
				let value = PIECE_VALUES[piece.type] + pstValue(piece.type, piece.side, x, y);
				if (piece.type === "soldier" && crossedRiver(piece.side, y)) value += PAWN_CROSSED_RIVER_BONUS;
				score += piece.side === turn ? value : -value;
			}
			if (isInCheckOnBoard(board, turn)) score -= 160;
			return score;
		}
		/**
		* 就地棋盘合法性走法：伪走法 + 落子后单点将军判定，全程不克隆整盘。
		* rules.ts 的 generatePseudoMoves / isInCheckOnBoard 保证与规则引擎一致。
		*/
		function legalMovesInPlace(board, side, includeCapturesOnly) {
			const pseudo = generatePseudoMoves(board, side);
			const legal = [];
			for (const move of pseudo) {
				if (includeCapturesOnly && move.captured === null) continue;
				const fromIndex = indexOf(move.from);
				const toIndex = indexOf(move.to);
				const mover = board[fromIndex];
				const captured = board[toIndex];
				board[toIndex] = mover;
				board[fromIndex] = null;
				const safe = !isInCheckOnBoard(board, side);
				board[fromIndex] = mover;
				board[toIndex] = captured;
				if (safe) legal.push(move);
			}
			return legal;
		}
		/** 将死分数按约定深度归一化，避免 TT 中不同深度的将死分互相混淆。 */
		function toMateScale(score) {
			return score > MATE_THRESHOLD ? score + 1 : score < -999900 ? score - 1 : score;
		}
		function fromMateScale(score) {
			return score > MATE_THRESHOLD ? score - 1 : score < -999900 ? score + 1 : score;
		}
		/** 越早的将死分越高，避免不同深度的将死分数互相混淆。 */
		function mateScoreAgainst(ply) {
			return MATE_SCORE - ply;
		}
		/** MVV-LVA 风格走法排序分：吃高价值子优先，吃子时按被吃价值×10 - 己方子力。 */
		function moveOrderScore(move) {
			if (move.captured === null) return 0;
			const victim = PIECE_VALUES[move.captured.type];
			const attacker = PIECE_VALUES[move.piece.type];
			return victim * 10 - attacker;
		}
		function sideIndex(side) {
			return side === "red" ? 0 : 1;
		}
		/** 时间预算放行检查；超时置 aborted，所有层快速展开。timeMs<0 表示未启用预算。 */
		function outOfTime(context, ply) {
			if (context.timeMs < 0 || ply <= 0) return false;
			if ((context.nodes & 1023) !== 0) return false;
			if (context.startTime + context.timeMs <= Date.now()) {
				context.aborted = true;
				return true;
			}
			return false;
		}
		/**
		* 静态搜索（QSearch）：叶子层沿“吃子 + 被将军时的全部应对”继续，
		* 直到局面安静或深度用尽，消除水平线效应（白送/白吃）。
		*/
		function quiesce(board, side, alpha, beta, context, ply) {
			context.nodes += 1;
			if (context.aborted) return alpha;
			if (outOfTime(context, ply)) return alpha;
			if (ply >= QSEARCH_PLY_LIMIT) return evaluate(board, side);
			const standPat = evaluate(board, side);
			if (standPat >= beta) return standPat;
			if (standPat > alpha) alpha = standPat;
			const inCheck = isInCheckOnBoard(board, side);
			const moves = legalMovesInPlace(board, side, !inCheck);
			if (moves.length === 0) return inCheck ? -mateScoreAgainst(ply) : standPat;
			const captures = moves.filter((move) => move.captured !== null);
			if (inCheck) captures.unshift(...moves.filter((move) => move.captured === null));
			const ordered = captures.sort((left, right) => moveOrderScore(right) - moveOrderScore(left));
			for (const move of ordered) {
				const fromIndex = indexOf(move.from);
				const toIndex = indexOf(move.to);
				const undo = makeMoveInPlace(board, fromIndex, toIndex, context);
				const score = -quiesce(board, otherSide(side), -beta, -alpha, context, ply + 1);
				unmakeMoveInPlace(board, fromIndex, toIndex, undo, context);
				if (score >= beta) return beta;
				if (score > alpha) alpha = score;
			}
			return alpha;
		}
		function alphaBeta(board, side, depth, alpha, beta, context, ply) {
			context.nodes += 1;
			if (context.aborted) return alpha;
			if (outOfTime(context, ply)) return alpha;
			const key = context.key ^ (side === "red" ? SIDE_HASH : 0n);
			const hashEntry = context.tt.get(key);
			if (hashEntry !== void 0 && hashEntry.depth >= depth) {
				const storedScore = fromMateScale(hashEntry.score);
				if (hashEntry.flag === "exact") return storedScore;
				if (hashEntry.flag === "lower" && storedScore >= beta) return storedScore;
				if (hashEntry.flag === "upper" && storedScore <= alpha) return storedScore;
			}
			if (depth <= 0) return quiesce(board, side, alpha, beta, context, ply);
			const moves = legalMovesInPlace(board, side, false);
			if (moves.length === 0) return isInCheckOnBoard(board, side) ? -mateScoreAgainst(ply) : 0;
			const ttMove = hashEntry === void 0 ? null : {
				from: hashEntry.bestFrom,
				to: hashEntry.bestTo
			};
			const ordered = [...moves].sort((left, right) => {
				const leftTt = ttMove !== null && indexOf(left.from) === ttMove.from && indexOf(left.to) === ttMove.to;
				if (leftTt !== (ttMove !== null && indexOf(right.from) === ttMove.from && indexOf(right.to) === ttMove.to)) return leftTt ? -1 : 1;
				const leftCap = moveOrderScore(left);
				const rightCap = moveOrderScore(right);
				if (leftCap !== rightCap) return rightCap - leftCap;
				const leftKiller = isKiller(context, ply, left);
				if (leftKiller !== isKiller(context, ply, right)) return leftKiller ? -1 : 1;
				const leftHist = historyScore(context, side, left);
				return historyScore(context, side, right) - leftHist;
			});
			let best = -Infinity;
			let bestMove = null;
			let flag = "upper";
			const startAlpha = alpha;
			for (const move of ordered) {
				const fromIndex = indexOf(move.from);
				const toIndex = indexOf(move.to);
				const undo = makeMoveInPlace(board, fromIndex, toIndex, context);
				const score = -alphaBeta(board, otherSide(side), depth - 1, -beta, -alpha, context, ply + 1);
				unmakeMoveInPlace(board, fromIndex, toIndex, undo, context);
				if (score > best) {
					best = score;
					bestMove = move;
				}
				if (score > alpha) alpha = score;
				if (alpha >= beta) {
					if (move.captured === null) recordKiller(context, ply, move);
					else rewardHistory(context, side, move, depth);
					flag = "lower";
					break;
				}
			}
			if (bestMove !== null) rewardHistory(context, side, bestMove, depth);
			if (best <= startAlpha) flag = "upper";
			else if (best >= beta) flag = "lower";
			else flag = "exact";
			const storedBest = toMateScale(best);
			if (bestMove !== null) context.tt.set(key, {
				flag,
				depth,
				score: storedBest,
				bestFrom: indexOf(bestMove.from),
				bestTo: indexOf(bestMove.to)
			});
			else context.tt.set(key, {
				flag,
				depth,
				score: storedBest,
				bestFrom: -1,
				bestTo: -1
			});
			return best;
		}
		/** 历史启发得分：同一起点-终点走法过去越有效，之后越优先尝试。 */
		function historyScore(context, side, move) {
			const from = indexOf(move.from);
			const to = indexOf(move.to);
			return context.history[sideIndex(side) * 90 * 90 + from * 90 + to];
		}
		function rewardHistory(context, side, move, depth) {
			const from = indexOf(move.from);
			const to = indexOf(move.to);
			const slot = sideIndex(side) * 90 * 90 + from * 90 + to;
			const bonus = depth * 16;
			const current = context.history[slot];
			context.history[slot] = current + bonus - (current * bonus >> 12);
		}
		function recordKiller(context, ply, move) {
			const offset = ply * 2;
			const fromTo = indexOf(move.from) * 90 + indexOf(move.to);
			if (context.killer[offset] !== fromTo) {
				context.killer[offset + 1] = context.killer[offset];
				context.killer[offset] = fromTo;
			}
		}
		function isKiller(context, ply, move) {
			const offset = ply * 2;
			const fromTo = indexOf(move.from) * 90 + indexOf(move.to);
			return context.killer[offset] === fromTo || context.killer[offset + 1] === fromTo;
		}
		const TT_MAX_ENTRIES = 1 << 17;
		function integerInRange(value, fallback, min, max) {
			if (!Number.isInteger(value)) return fallback;
			return Math.max(min, Math.min(max, value));
		}
		/**
		* 搜索当前局面的候选走法。结果按引擎分数从高到低排列。
		*
		* 速度策略：
		* - 有 timeMs 时迭代加深：从 depth 1 逐步加深。每层完整搜索所有根走法
		*   后才更新结果；若下一层在预算内无法完成，则整层丢弃，返回最近一层
		*   完整结果（保证“有限时间内必有可靠答案”）。
		* - 无 timeMs 时固定 depth（兼容旧调用方），默认 2。
		*/
		function findBestMoves(game, options = {}) {
			const limit = integerInRange(options.limit, DEFAULT_LIMIT, 1, MAX_LIMIT);
			const board = game.board.slice();
			const turn = game.turn;
			const hasTimeBudget = Number.isFinite(options.timeMs) && (options.timeMs ?? 0) > 0;
			const maxDepth = hasTimeBudget ? integerInRange(options.depth, DEFAULT_MAX_DEPTH, FIXED_DEPTH_MIN, DEFAULT_MAX_DEPTH) : integerInRange(options.depth, 2, FIXED_DEPTH_MIN, FIXED_DEPTH_MAX);
			const context = {
				nodes: 0,
				tt: /* @__PURE__ */ new Map(),
				killer: new Int32Array(28),
				history: new Int32Array(16200),
				startTime: Date.now(),
				timeMs: hasTimeBudget ? Math.min(Math.max(options.timeMs ?? 0, 8), 3e3) : -1,
				aborted: false,
				key: boardKey(board)
			};
			const rootMoves = legalMovesInPlace(board, turn, false);
			const results = rootMoves.map((move) => ({
				move,
				score: 0
			}));
			let lastCompleted = [];
			let completedDepth = 0;
			const firstDepth = hasTimeBudget ? 1 : maxDepth;
			for (let depth = firstDepth; depth <= maxDepth; depth += 1) {
				if (context.aborted) break;
				if (hasTimeBudget && context.startTime + context.timeMs <= Date.now()) break;
				let rootAlpha = -Infinity;
				let firstRootMove = true;
				let layerAborted = false;
				for (const entry of results) {
					if (context.aborted) {
						layerAborted = true;
						break;
					}
					const fromIndex = indexOf(entry.move.from);
					const toIndex = indexOf(entry.move.to);
					const undo = makeMoveInPlace(board, fromIndex, toIndex, context);
					let score;
					if (firstRootMove) {
						score = -alphaBeta(board, otherSide(turn), depth - 1, -Infinity, Infinity, context, 1);
						firstRootMove = false;
					} else {
						score = -alphaBeta(board, otherSide(turn), depth - 1, -rootAlpha - 1, -rootAlpha, context, 1);
						if (!context.aborted && score > rootAlpha) score = -alphaBeta(board, otherSide(turn), depth - 1, -Infinity, -rootAlpha, context, 1);
					}
					unmakeMoveInPlace(board, fromIndex, toIndex, undo, context);
					entry.score = score;
					if (score > rootAlpha) rootAlpha = score;
					if (context.tt.size > TT_MAX_ENTRIES) context.tt.clear();
				}
				if (layerAborted) break;
				results.sort((left, right) => right.score - left.score);
				lastCompleted = results.map((entry) => ({
					move: entry.move,
					score: entry.score
				}));
				completedDepth = depth;
			}
			if (completedDepth === 0) {
				completedDepth = 1;
				lastCompleted = rootMoves.map((move) => ({
					move,
					score: evaluate(applyMoveLocally(board, move), otherSide(turn))
				})).sort((left, right) => right.score - left.score);
			}
			return {
				turn,
				depth: completedDepth,
				nodes: context.nodes,
				candidates: lastCompleted.slice(0, limit)
			};
		}
		/** 计算“走一步后对手视角”的静态评估（仅兜底用）。 */
		function applyMoveLocally(board, move) {
			const next = board.slice();
			next[indexOf(move.to)] = next[indexOf(move.from)];
			next[indexOf(move.from)] = null;
			return next;
		}
		//#endregion
		//#region lib/types/client/XiangqiOverlay.js
		/** Frame-wide Chinese chess surface and its Host/Agent turn bridge. */
		function errorText(error) {
			return error instanceof Error ? error.message : String(error);
		}
		function unwrap(result) {
			if (!result.ok) throw new Error(`${result.error.code}: ${result.error.message}`);
			return result.value;
		}
		/**
		* Build a slot component with the mounted Remote face closed over the plugin
		* fiber. This avoids a module-level singleton and keeps HMR unload-safe.
		*/
		function createXiangqiOverlay(remote, promptDshTurn) {
			return function XiangqiOverlay({ useSessions, useStore, actions }) {
				const open = useStore((state) => state.open);
				const minimized = useStore((state) => state.minimized);
				const sessionId = useStore((state) => state.sessionId);
				const gameId = useStore((state) => state.gameId);
				const revision = useStore((state) => state.revision);
				const game = useStore((state) => state.game);
				const busy = useStore((state) => state.busy);
				const error = useStore((state) => state.error);
				const currentSessionId = useSessions((state) => state.current);
				const projection = useSessions((state) => {
					const current = state.current;
					return current === void 0 ? void 0 : state.byId[current]?.projectionValues?.xiangqi;
				});
				const autoStartSession = (0, react.useRef)(null);
				(0, react.useEffect)(() => {
					if (!open) return;
					if (currentSessionId === void 0) {
						if (sessionId !== null) actions.clearGame();
						return;
					}
					if (sessionId !== null && sessionId !== String(currentSessionId)) actions.clearGame();
				}, [
					actions,
					currentSessionId,
					open,
					sessionId
				]);
				(0, react.useEffect)(() => {
					if (!open || currentSessionId === void 0) {
						autoStartSession.current = null;
						return;
					}
					const current = String(currentSessionId);
					if (sessionId !== null && sessionId !== current) {
						autoStartSession.current = null;
						return;
					}
					if (projection === void 0) return;
					if (projection === null) {
						if (sessionId !== null || busy || autoStartSession.current === current) return;
						autoStartSession.current = current;
						actions.setBusy(true);
						remote.newGame(currentSessionId, {}).then(unwrap).then((state) => {
							actions.setGame(current, state, toXiangqiGameViewModel(state, {
								humanSide: "red",
								busy: false
							}));
						}).catch((reason) => {
							actions.setError(errorText(reason));
						}).finally(() => {
							actions.setBusy(false);
						});
						return;
					}
					try {
						const next = toXiangqiGameViewModel(projection, {
							humanSide: "red",
							busy
						});
						const projectionIsOlder = sessionId === current && revision !== null && projection.revision < revision;
						if (!projectionIsOlder && (sessionId !== current || gameId !== projection.gameId || revision !== projection.revision)) actions.setGame(current, projection, next);
						if (!projectionIsOlder && busy && (projection.phase !== "active" || turnOf(projection) === "red")) actions.setBusy(false);
					} catch (reason) {
						actions.setError(errorText(reason));
					}
				}, [
					actions,
					busy,
					currentSessionId,
					gameId,
					open,
					projection,
					remote,
					revision,
					sessionId
				]);
				const withCurrent = (action) => {
					return () => {
						if (currentSessionId === void 0) {
							actions.setError("请先选择一个会话");
							return;
						}
						action(currentSessionId).catch((reason) => {
							actions.setError(errorText(reason));
							actions.setBusy(false);
						});
					};
				};
				const onNewGame = withCurrent(async (current) => {
					if (busy) return;
					autoStartSession.current = String(current);
					actions.setBusy(true);
					actions.setError(null);
					const state = unwrap(await remote.newGame(current, {}));
					actions.setGame(String(current), state, toXiangqiGameViewModel(state, {
						humanSide: "red",
						busy: false
					}));
					actions.setBusy(false);
				});
				const onUndo = withCurrent(async (current) => {
					if (gameId === null || revision === null) throw new Error("棋局尚未同步完成");
					actions.setBusy(true);
					actions.setError(null);
					let state = unwrap(await remote.undo(current, {
						gameId,
						revision
					}));
					while (state.phase === "active" && turnOf(state) === "black") {
						if (toXiangqiGameViewModel(state, {
							humanSide: "red",
							busy: true
						}).moves.length === 0) break;
						state = unwrap(await remote.undo(current, {
							gameId: state.gameId,
							revision: state.revision
						}));
					}
					actions.setGame(String(current), state, toXiangqiGameViewModel(state, {
						humanSide: "red",
						busy: false
					}));
					actions.setBusy(false);
				});
				const onResign = withCurrent(async (current) => {
					if (gameId === null || revision === null) throw new Error("棋局尚未同步完成");
					actions.setBusy(true);
					actions.setError(null);
					const state = unwrap(await remote.resign(current, {
						gameId,
						revision,
						side: "red"
					}));
					actions.setGame(String(current), state, toXiangqiGameViewModel(state, {
						humanSide: "red",
						busy: false
					}));
					actions.setBusy(false);
				});
				const onMoveWith = async (move) => {
					if (currentSessionId === void 0) {
						actions.setError("请先选择一个会话");
						return;
					}
					if (gameId === null || revision === null) {
						actions.setError("棋局尚未同步完成");
						return;
					}
					actions.setBusy(true);
					actions.setError(null);
					try {
						const state = unwrap(await remote.move(currentSessionId, {
							gameId,
							revision,
							move: {
								from: ucciOf(move.from),
								to: ucciOf(move.to)
							}
						}));
						const next = toXiangqiGameViewModel(state, {
							humanSide: "red",
							busy: true
						});
						actions.setGame(String(currentSessionId), state, next);
						if (state.phase === "active" && next.status === "playing" && turnOf(state) === "black") {
							const summary = findBestMoves(deserialize(JSON.stringify(state.gameState)), {
								timeMs: 180,
								depth: 6,
								limit: 5
							});
							await promptDshTurn(currentSessionId, state, {
								depth: summary.depth,
								nodes: summary.nodes,
								candidates: summary.candidates.map((candidate) => ({
									from: formatCoordinate(candidate.move.from),
									to: formatCoordinate(candidate.move.to),
									score: candidate.score
								}))
							});
						} else actions.setBusy(false);
					} catch (reason) {
						actions.setError(errorText(reason));
						actions.setBusy(false);
					}
				};
				const onPageMove = (move) => {
					onMoveWith(move);
				};
				const pageActions = {
					onMove: onPageMove,
					onNewGame,
					onUndo,
					onResign
				};
				if (!open) return null;
				return (0, react_jsx_runtime.jsx)("div", {
					className: minimized ? XiangqiSlots_module_css_default.overlayBackdropMinimized : XiangqiSlots_module_css_default.overlayBackdrop,
					role: "presentation",
					children: (0, react_jsx_runtime.jsxs)("section", {
						className: minimized ? `${XiangqiSlots_module_css_default.overlaySurface} ${XiangqiSlots_module_css_default.overlaySurfaceMinimized}` : XiangqiSlots_module_css_default.overlaySurface,
						role: "dialog",
						"aria-modal": minimized ? void 0 : true,
						"aria-labelledby": "xiangqi-dialog-title",
						children: [(0, react_jsx_runtime.jsxs)("div", {
							className: XiangqiSlots_module_css_default.overlayToolbar,
							children: [(0, react_jsx_runtime.jsx)("h2", {
								className: XiangqiSlots_module_css_default.overlayTitle,
								id: "xiangqi-dialog-title",
								children: "中国象棋"
							}), (0, react_jsx_runtime.jsxs)("div", {
								className: XiangqiSlots_module_css_default.toolbarActions,
								children: [(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: XiangqiSlots_module_css_default.minimizeButton,
									"aria-label": minimized ? "恢复棋盘" : "最小化棋盘",
									onClick: () => {
										actions.toggleMinimized();
									},
									children: minimized ? "恢复棋盘" : "最小化"
								}), (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: XiangqiSlots_module_css_default.closeButton,
									onClick: () => {
										actions.close();
									},
									children: "关闭棋盘"
								})]
							})]
						}), minimized ? (0, react_jsx_runtime.jsxs)("div", {
							className: XiangqiSlots_module_css_default.minimizedSummary,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: XiangqiSlots_module_css_default.minimizedDot,
								"data-busy": busy || void 0,
								"aria-hidden": "true"
							}), (0, react_jsx_runtime.jsx)("span", { children: game === null ? "棋局未准备" : game.statusText })]
						}) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
							currentSessionId === void 0 && (0, react_jsx_runtime.jsx)("div", {
								className: XiangqiSlots_module_css_default.emptyState,
								children: "请先在左侧选择或创建一个会话。"
							}),
							currentSessionId !== void 0 && game === null && (0, react_jsx_runtime.jsxs)("div", {
								className: XiangqiSlots_module_css_default.emptyState,
								children: [
									(0, react_jsx_runtime.jsx)("p", { children: projection === void 0 ? "正在同步棋局……" : "正在准备棋局……" }),
									error !== null && (0, react_jsx_runtime.jsx)("p", {
										className: XiangqiSlots_module_css_default.errorText,
										role: "alert",
										children: error
									}),
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: XiangqiSlots_module_css_default.retryButton,
										onClick: onNewGame,
										children: "重新开局"
									})
								]
							}),
							game !== null && (0, react_jsx_runtime.jsx)(XiangqiPage, {
								game,
								...pageActions
							}),
							error !== null && game !== null && (0, react_jsx_runtime.jsx)("p", {
								className: XiangqiSlots_module_css_default.inlineError,
								role: "alert",
								children: error
							})
						] })]
					})
				});
			};
		}
		//#endregion
		//#region lib/types/client/SidebarAction.js
		function XiangqiSidebarAction({ wide, actions }) {
			return (0, react_jsx_runtime.jsx)("div", {
				className: XiangqiSlots_module_css_default.sidebarAction,
				"data-xiangqi-sidebar-action": true,
				children: (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: XiangqiSlots_module_css_default.sidebarButton,
					"aria-label": "下盘象棋",
					title: "下盘象棋",
					onClick: () => {
						actions.open();
					},
					children: [(0, react_jsx_runtime.jsx)("span", {
						className: XiangqiSlots_module_css_default.sidebarGlyph,
						"aria-hidden": "true",
						children: "象"
					}), wide && (0, react_jsx_runtime.jsx)("span", {
						className: XiangqiSlots_module_css_default.sidebarLabel,
						children: "下盘象棋"
					})]
				})
			});
		}
		//#endregion
		//#region lib/types/client/store.js
		/** Root-scoped UI state for the independent Chinese chess overlay. */
		/**
		* Store factory rather than a module-level handle: DSH slot registration owns
		* the handle identity and can dispose/recreate it during client HMR.
		*/
		function createXiangqiStore() {
			return (0, _deepseek_ai_dsh_client_runtime_client.defineStore)({
				init: () => ({
					open: false,
					minimized: false,
					sessionId: null,
					gameId: null,
					revision: null,
					game: null,
					busy: false,
					error: null
				}),
				actions: {
					open: (d) => {
						d.open = true;
						d.minimized = false;
					},
					close: (d) => {
						d.open = false;
						d.minimized = false;
					},
					toggleMinimized: (d) => {
						d.minimized = !d.minimized;
					},
					clearGame: (d) => {
						d.minimized = false;
						d.sessionId = null;
						d.gameId = null;
						d.revision = null;
						d.game = null;
						d.busy = false;
						d.error = null;
					},
					setBusy: (d, busy) => {
						d.busy = busy;
					},
					setError: (d, error) => {
						d.error = error;
					},
					setGame: (d, sessionId, state, game) => {
						d.sessionId = sessionId;
						d.gameId = state.gameId;
						d.revision = state.revision;
						d.game = game;
						d.error = null;
					}
				}
			});
		}
		//#endregion
		//#region lib/types/client/index.js
		/** Browser half: sidebar action, frame overlay, fast candidate search, and DSH turn prompt. */
		/** Required services for the browser slots, sessions, and Remote carrier. */
		const inject = [
			"slots",
			"sessions",
			"remote"
		];
		/** Mount the Host Remote and the two additive browser surfaces. */
		async function apply(ctx) {
			const disposeRemote = await ctx.remote.$mount(TYPERT_REMOTE);
			ctx.effect(() => () => {
				disposeRemote();
			}, "ui-xiangqi: Remote mount");
			const store = createXiangqiStore();
			const remote = ctx.get("remote.xiangqi");
			if (remote === void 0) throw new Error("象棋 Remote 挂载后仍不可用");
			const promptDshTurn = async (sessionId, state, suggestions) => {
				const session = ctx.sessions.binding(sessionId)?.session;
				if (session === void 0) throw new Error("当前会话不可用，无法让 DSH 落子");
				const fen = toFen(deserialize(JSON.stringify(state.gameState)));
				const candidateText = suggestions.candidates.length === 0 ? "无候选走法，请根据 FEN 选择一手合法黑方棋。" : suggestions.candidates.map((candidate, index) => `${index + 1}. ${candidate.from}-${candidate.to}（${candidate.score}）`).join("；");
				const result = await session.prompt([{
					type: "text",
					text: `你正在和用户进行中国象棋对弈，当前轮到黑方。请结合当前 FEN 和本地引擎候选，快速判断并立即调用一次 xiangqi_game。禁止 get、new_game、undo、resign，禁止长篇解释；只允许 action="move"，必须使用 game_id="${state.gameId}"、revision=${state.revision}，从候选中选择或修正为一手合法黑方棋。\n当前 FEN：${fen}\n本地引擎候选（深度 ${suggestions.depth}，搜索 ${suggestions.nodes} 个节点）：${candidateText}`
				}], "queue");
				if (!result.ok) throw new Error(`${result.error.code}: ${result.error.message}`);
			};
			ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
				name: "sidebar.footer.action",
				id: "xiangqi",
				store
			}, XiangqiSidebarAction));
			const Overlay = createXiangqiOverlay(remote, promptDshTurn);
			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "xiangqi-overlay",
				order: 80,
				store
			}, Overlay));
		}
		//#endregion
		exports.XIANGQI_COLUMNS = XIANGQI_COLUMNS;
		exports.XIANGQI_ROWS = XIANGQI_ROWS;
		exports.XiangqiBoard = XiangqiBoard;
		exports.XiangqiPage = XiangqiPage;
		exports.apply = apply;
		exports.createXiangqiOverlay = createXiangqiOverlay;
		exports.createXiangqiStore = createXiangqiStore;
		exports.inject = inject;
		exports.toXiangqiGameViewModel = toXiangqiGameViewModel;
		exports.turnOf = turnOf;
		exports.ucciOf = ucciOf;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map