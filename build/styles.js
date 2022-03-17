"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_native_1 = require("react-native");
/** For some reason, using StyleSheet.absoluteFill does
 * not work, so we just make our own.
 */
const absoluteFill = {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
};
exports.default = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
    },
    menu: Object.assign({}, absoluteFill),
    frontView: {
        flex: 1,
        position: "absolute",
        left: 0,
        top: 0,
        backgroundColor: "transparent",
        overflow: "hidden",
    },
    overlay: Object.assign(Object.assign({}, absoluteFill), { backgroundColor: "transparent" }),
});
