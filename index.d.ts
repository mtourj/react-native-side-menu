import React, { ReactElement } from "react";
import { Animated, ViewStyle } from "react-native";

type MenuPosition = "left" | "right";

interface Props {
  menu: ReactElement;
  /** Style for View that wraps the menu component */
  style?: ViewStyle;
  /** Style for Animated View that wraps children. Receives animated value for sliding animation. */
  animatedContainerStyle?: (left: Animated.Value) => ViewStyle;
  overlayStyle?: ViewStyle;
  edgeHitWidth?: number;
  toleranceX?: number;
  toleranceY?: number;
  menuPosition?: MenuPosition;
  onChange?: (isOpen: boolean) => void;
  onMove?: (left: number) => void;
  onSliding?: (position: number) => void;
  openMenuOffset?: number;
  /** If set, openMenuOffset is ignored */
  openMenuOffsetPercentage?: number;
  hiddenMenuOffset?: number;
  disableGestures?: (() => boolean) | boolean;
  animationFunction?: Function;
  onAnimationComplete?: Function;
  onStartShouldSetResponderCapture?: Function;
  isOpen?: boolean;
  bounceBackOnOverdraw?: boolean;
  autoClosing?: boolean;
}

interface State {
  width: number;
  height: number;
  openOffsetMenuPercentage: number;
  openMenuOffset: number;
  hiddenMenuOffsetPercentage: number;
  hiddenMenuOffset: number;
  left: Animated.Value;
}

export default class SideMenu extends React.Component<Props, State> {}
