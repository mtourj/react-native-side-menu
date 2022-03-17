import { StyleSheet } from "react-native";

/** For some reason, using StyleSheet.absoluteFill does
 * not work, so we just make our own.
 */
const absoluteFill = {
  position: "absolute" as "absolute",
  top: 0,
  right: 0,
  left: 0,
  bottom: 0,
};

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  menu: { ...absoluteFill },
  frontView: {
    flex: 1,
    position: "absolute",
    left: 0,
    top: 0,
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  overlay: {
    ...absoluteFill,
    backgroundColor: "transparent",
  },
});
