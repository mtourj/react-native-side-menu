import React, { ReactElement } from "react";
import { Animated, ViewStyle } from "react-native";

type Props = {
  menu: ReactElement;
  style?: ViewStyle;
  edgeHitWidth?: number;
  toleranceX?: number;
  toleranceY?: number;
  menuPosition?: "left" | "right";
  onChange?: Function;
  onMove?: Function;
  onSliding?: Function;
  openMenuOffset?: number;
  hiddenMenuOffset?: number;
  disableGestures?: Function | boolean;
  animationFunction?: Function;
  onAnimationComplete?: Function;
  onStartShouldSetResponderCapture?: Function;
  isOpen?: boolean;
  bounceBackOnOverdraw?: boolean;
  autoClosing?: boolean;
};

type State = {
  width: number;
  height: number;
  openOffsetMenuPercentage: number;
  openMenuOffset: number;
  hiddenMenuOffsetPercentage: number;
  hiddenMenuOffset: number;
  left: Animated.Value;
};

export default class SideMenu extends React.Component<Props, State> {}
