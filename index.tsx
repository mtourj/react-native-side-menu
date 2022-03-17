/**
 * Fork of archived package https://github.com/Kureev/react-native-side-menu
 */

import React from "react";
import {
  PanResponder,
  View,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
  PanResponderInstance,
  GestureResponderEvent,
  PanResponderGestureState,
  ViewStyle,
} from "react-native";
import styles from "./styles";

import { Props, State } from ".";

type WindowDimensions = { width: number; height: number };

type Event = {
  nativeEvent: {
    layout: {
      width: number;
      height: number;
    };
  };
};

const deviceScreen: WindowDimensions = Dimensions.get("window");
const barrierForward: number = deviceScreen.width / 4;

function shouldOpenMenu(dx: number): boolean {
  return dx > barrierForward;
}

const defaultProps = {
  toleranceY: 10,
  toleranceX: 10,
  edgeHitWidth: 60,
  openMenuOffset: deviceScreen.width * (2 / 3),
  disableGestures: false,
  menuPosition: "left",
  hiddenMenuOffset: 0,
  onMove: () => {},
  onChange: () => {},
  onSliding: () => {},
  animatedContainerStyle: (value: Animated.Value) =>
    ({
      transform: [
        {
          translateX: value,
        },
      ],
    } as any),
  animationFunction: (prop: Animated.Value, value: number) =>
    Animated.spring(prop, {
      toValue: value,
      friction: 8,
      useNativeDriver: true,
    }),
  onAnimationComplete: () => {},
  isOpen: false,
  bounceBackOnOverdraw: true,
  autoClosing: true,
};

export default class SideMenu extends React.Component<
  Props & typeof defaultProps,
  State
> {
  onMoveShouldSetPanResponder: (
    e: GestureResponderEvent,
    gestureState: PanResponderGestureState
  ) => boolean;
  onPanResponderMove: (
    e: GestureResponderEvent,
    gestureState: PanResponderGestureState
  ) => void;
  onPanResponderRelease: (
    e: GestureResponderEvent,
    gestureState: PanResponderGestureState
  ) => void;
  onPanResponderTerminate: (
    e: GestureResponderEvent,
    gestureState: PanResponderGestureState
  ) => void;
  state: State;
  prevLeft: number;
  isOpen: boolean;
  responder: PanResponderInstance;

  static defaultProps = defaultProps;

  constructor(props: Props & typeof defaultProps) {
    super(props);

    this.prevLeft = 0;
    this.isOpen = !!props.isOpen;

    const initialMenuPositionMultiplier =
      props.menuPosition === "right" ? -1 : 1;
    const openOffsetMenuPercentage =
      this.props.openMenuOffsetPercentage ??
      props.openMenuOffset / deviceScreen.width;
    let openMenuOffset = deviceScreen.width * openOffsetMenuPercentage;
    if (
      this.props.maxOpenMenuOffset &&
      openMenuOffset > this.props.maxOpenMenuOffset
    ) {
      openMenuOffset = this.props.maxOpenMenuOffset;
    }

    const hiddenMenuOffsetPercentage =
      props.hiddenMenuOffset / deviceScreen.width;
    const left: Animated.Value = new Animated.Value(
      props.isOpen
        ? props.openMenuOffset * initialMenuPositionMultiplier
        : props.hiddenMenuOffset
    );

    this.onLayoutChange = this.onLayoutChange.bind(this);
    this.onMoveShouldSetPanResponder =
      this.handleMoveShouldSetPanResponder.bind(this);
    this.onPanResponderMove = this.handlePanResponderMove.bind(this);
    this.onPanResponderRelease = this.handlePanResponderEnd.bind(this);
    this.onPanResponderTerminate = this.handlePanResponderEnd.bind(this);

    this.state = {
      width: deviceScreen.width,
      height: deviceScreen.height,
      openOffsetMenuPercentage: openOffsetMenuPercentage,
      openMenuOffset,
      hiddenMenuOffsetPercentage,
      hiddenMenuOffset: deviceScreen.width * hiddenMenuOffsetPercentage,
      left,
    };

    this.state.left.addListener(({ value }) =>
      this.props.onSliding(
        Math.abs(
          (value - this.state.hiddenMenuOffset) /
            (this.state.openMenuOffset - this.state.hiddenMenuOffset)
        )
      )
    );

    this.responder = PanResponder.create({
      onMoveShouldSetPanResponder: this.onMoveShouldSetPanResponder,
      onPanResponderMove: this.onPanResponderMove,
      onPanResponderRelease: this.onPanResponderRelease,
      onPanResponderTerminate: this.onPanResponderTerminate,
    });
  }

  UNSAFE_componentWillReceiveProps(props: Props): void {
    if (
      typeof props.isOpen !== "undefined" &&
      this.isOpen !== props.isOpen &&
      (props.autoClosing || this.isOpen === false)
    ) {
      this.openMenu(props.isOpen);
    }
  }

  onLayoutChange(e: Event) {
    const { width, height } = e.nativeEvent.layout;
    const hiddenMenuOffset = width * this.state.hiddenMenuOffsetPercentage;
    let openMenuOffset = width * this.state.openOffsetMenuPercentage;
    if (
      this.props.maxOpenMenuOffset &&
      openMenuOffset > this.props.maxOpenMenuOffset
    ) {
      openMenuOffset = this.props.maxOpenMenuOffset;
    }
    this.setState({ width, height, openMenuOffset, hiddenMenuOffset });
  }

  /** Maps sliding to animation to value betwen 0 and 1 */
  mapSlidingAnimationToPercentage() {
    let { hiddenMenuOffset, openMenuOffset } = this.state;

    const mult = this.menuPositionMultiplier();
    const smaller = Math.min(hiddenMenuOffset * mult, openMenuOffset * mult);
    const bigger = Math.max(hiddenMenuOffset * mult, openMenuOffset * mult);

    let outputRange = [0, 1, 1];

    if (mult === -1) outputRange.reverse();

    return this.state.left.interpolate({
      inputRange: [smaller, (smaller + bigger) / 3, bigger],
      outputRange,
    });
  }

  /**
   * Get content view. This view will be rendered over menu
   * @return {React.Component}
   */
  getContentView() {
    let overlay: React.ReactElement | null = null;

    if (this.isOpen) {
      const overlayOpacityStyle = {
        opacity: this.mapSlidingAnimationToPercentage(),
      };

      overlay = (
        <TouchableWithoutFeedback onPress={() => this.openMenu(false)}>
          <Animated.View style={[styles.overlay, overlayOpacityStyle]}>
            <View style={[styles.overlay, this.props.overlayStyle]} />
          </Animated.View>
        </TouchableWithoutFeedback>
      );
    }

    const { width, height } = this.state;
    const style = [
      styles.frontView,
      { width, height },
      this.props.animatedContainerStyle?.(this.state.left),
    ];

    return (
      <Animated.View style={style} {...this.responder.panHandlers}>
        {this.props.children}
        {overlay}
      </Animated.View>
    );
  }

  moveLeft(offset: number) {
    const newOffset = this.menuPositionMultiplier() * offset;

    this.props
      .animationFunction(this.state.left, newOffset)
      .start(this.props.onAnimationComplete);

    this.prevLeft = newOffset;
  }

  menuPositionMultiplier(): -1 | 1 {
    return this.props.menuPosition === "right" ? -1 : 1;
  }

  handlePanResponderMove(
    e: GestureResponderEvent,
    gestureState: PanResponderGestureState
  ) {
    // @ts-ignore -- __getValue() is protected
    if (this.state.left.__getValue() * this.menuPositionMultiplier() >= 0) {
      let newLeft = this.prevLeft + gestureState.dx;

      if (
        !this.props.bounceBackOnOverdraw &&
        Math.abs(newLeft) > this.state.openMenuOffset
      ) {
        newLeft = this.menuPositionMultiplier() * this.state.openMenuOffset;
      }

      this.props.onMove(newLeft);
      this.state.left.setValue(newLeft);
    }
  }

  handlePanResponderEnd(
    e: GestureResponderEvent,
    gestureState: PanResponderGestureState
  ) {
    const offsetLeft =
      this.menuPositionMultiplier() *
      // @ts-ignore -- __getValue() is protected
      (this.state.left.__getValue() + gestureState.dx);

    this.openMenu(shouldOpenMenu(offsetLeft));
  }

  handleMoveShouldSetPanResponder(
    e: GestureResponderEvent,
    gestureState: PanResponderGestureState
  ): boolean {
    if (this.gesturesAreEnabled()) {
      const x = Math.round(Math.abs(gestureState.dx));
      const y = Math.round(Math.abs(gestureState.dy));

      const touchMoved = x > this.props.toleranceX && y < this.props.toleranceY;

      if (this.isOpen) {
        return touchMoved;
      }

      const withinEdgeHitWidth =
        this.props.menuPosition === "right"
          ? gestureState.moveX > deviceScreen.width - this.props.edgeHitWidth
          : gestureState.moveX < this.props.edgeHitWidth;

      const swipingToOpen = this.menuPositionMultiplier() * gestureState.dx > 0;
      return withinEdgeHitWidth && touchMoved && swipingToOpen;
    }

    return false;
  }

  openMenu(isOpen: boolean): void {
    const { hiddenMenuOffset, openMenuOffset } = this.state;
    this.moveLeft(isOpen ? openMenuOffset : hiddenMenuOffset);
    this.isOpen = isOpen;

    this.forceUpdate();
    this.props.onChange(isOpen);
  }

  gesturesAreEnabled(): boolean {
    const { disableGestures } = this.props;

    if (typeof disableGestures === "function") {
      return !(disableGestures as () => boolean)();
    } else return !disableGestures;
  }

  render(): React.ReactElement {
    const boundryStyle =
      this.props.menuPosition === "right"
        ? { left: this.state.width - this.state.openMenuOffset }
        : { right: this.state.width - this.state.openMenuOffset };

    const menuOpacityStyle = {
      opacity: this.mapSlidingAnimationToPercentage(),
    };

    const menu = (
      <Animated.View
        style={[styles.menu, boundryStyle, this.props.style, menuOpacityStyle]}
      >
        {this.props.menu}
      </Animated.View>
    );

    return (
      <View style={styles.container} onLayout={this.onLayoutChange}>
        {menu}
        {this.getContentView()}
      </View>
    );
  }
}
