module.exports = [
"[project]/edu-kinder/node_modules/next/dist/client/components/builtin/forbidden.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return Forbidden;
    }
});
const _jsxruntime = __turbopack_context__.r("[project]/edu-kinder/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-runtime.js [app-rsc] (ecmascript)");
const _errorfallback = __turbopack_context__.r("[project]/edu-kinder/node_modules/next/dist/client/components/http-access-fallback/error-fallback.js [app-rsc] (ecmascript)");
function Forbidden() {
    return /*#__PURE__*/ (0, _jsxruntime.jsx)(_errorfallback.HTTPAccessErrorFallback, {
        status: 403,
        message: "This page could not be accessed."
    });
}
if ((typeof exports.default === 'function' || typeof exports.default === 'object' && exports.default !== null) && typeof exports.default.__esModule === 'undefined') {
    Object.defineProperty(exports.default, '__esModule', {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
} //# sourceMappingURL=forbidden.js.map
}),
];

//# sourceMappingURL=c2704_next_dist_client_components_builtin_forbidden_2e4c9af3.js.map