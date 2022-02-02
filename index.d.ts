import React, { ReactElement } from "react";
import { Animated } from "react-native";

type Props = {
  menu: ReactElement;
  edgeHitWidth?: number;
  toleranceX?: number;
  toleranceY?: number;
  menuPosition?: "left" | "right";
  onChange?: Function;
  onMove?: Function;
  onSliding?: Function;
  openMenuOffset?: number;
  hiddenMenuOffset?: number;
  disableGestures?: Function | bool;
  animationFunction?: Function;
  onAnimationComplete?: Function;
  onStartShouldSetResponderCapture?: Function;
  isOpen?: bool;
  bounceBackOnOverdraw?: bool;
  autoClosing?: bool;
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
