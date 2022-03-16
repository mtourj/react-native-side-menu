// @flow

import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  menu: {
    ...StyleSheet.absoluteFill,
  },
  frontView: {
    flex: 1,
    position: "absolute",
    left: 0,
    top: 0,
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "transparent",
  },
});
