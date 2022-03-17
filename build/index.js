"use strict";
/**
 * Fork of archived package https://github.com/Kureev/react-native-side-menu
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const styles_1 = __importDefault(require("./styles"));
const deviceScreen = react_native_1.Dimensions.get("window");
const barrierForward = deviceScreen.width / 4;
function shouldOpenMenu(dx) {
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
    onMove: () => { },
    onStartShouldSetResponderCapture: () => true,
    onChange: () => { },
    onSliding: () => { },
    animatedContainerStyle: (value) => ({
        transform: [
            {
                translateX: value,
            },
        ],
    }),
    animationFunction: (prop, value) => react_native_1.Animated.spring(prop, {
        toValue: value,
        friction: 8,
        useNativeDriver: true,
    }),
    onAnimationComplete: () => { },
    isOpen: false,
    bounceBackOnOverdraw: true,
    autoClosing: true,
};
class SideMenu extends react_1.default.Component {
    onStartShouldSetResponderCapture;
    onMoveShouldSetPanResponder;
    onPanResponderMove;
    onPanResponderRelease;
    onPanResponderTerminate;
    state;
    prevLeft;
    isOpen;
    responder;
    static defaultProps = defaultProps;
    constructor(props) {
        super(props);
        this.prevLeft = 0;
        this.isOpen = !!props.isOpen;
        const initialMenuPositionMultiplier = props.menuPosition === "right" ? -1 : 1;
        const openOffsetMenuPercentage = this.props.openMenuOffsetPercentage ??
            props.openMenuOffset / deviceScreen.width;
        const hiddenMenuOffsetPercentage = props.hiddenMenuOffset / deviceScreen.width;
        const left = new react_native_1.Animated.Value(props.isOpen
            ? props.openMenuOffset * initialMenuPositionMultiplier
            : props.hiddenMenuOffset);
        this.onLayoutChange = this.onLayoutChange.bind(this);
        this.onStartShouldSetResponderCapture =
            props.onStartShouldSetResponderCapture.bind(this);
        this.onMoveShouldSetPanResponder =
            this.handleMoveShouldSetPanResponder.bind(this);
        this.onPanResponderMove = this.handlePanResponderMove.bind(this);
        this.onPanResponderRelease = this.handlePanResponderEnd.bind(this);
        this.onPanResponderTerminate = this.handlePanResponderEnd.bind(this);
        this.state = {
            width: deviceScreen.width,
            height: deviceScreen.height,
            openOffsetMenuPercentage: openOffsetMenuPercentage,
            openMenuOffset: deviceScreen.width * openOffsetMenuPercentage,
            hiddenMenuOffsetPercentage,
            hiddenMenuOffset: deviceScreen.width * hiddenMenuOffsetPercentage,
            left,
        };
        this.state.left.addListener(({ value }) => this.props.onSliding(Math.abs((value - this.state.hiddenMenuOffset) /
            (this.state.openMenuOffset - this.state.hiddenMenuOffset))));
        this.responder = react_native_1.PanResponder.create({
            onStartShouldSetPanResponderCapture: this.onStartShouldSetResponderCapture,
            onMoveShouldSetPanResponder: this.onMoveShouldSetPanResponder,
            onPanResponderMove: this.onPanResponderMove,
            onPanResponderRelease: this.onPanResponderRelease,
            onPanResponderTerminate: this.onPanResponderTerminate,
        });
    }
    UNSAFE_componentWillReceiveProps(props) {
        if (typeof props.isOpen !== "undefined" &&
            this.isOpen !== props.isOpen &&
            (props.autoClosing || this.isOpen === false)) {
            this.openMenu(props.isOpen);
        }
    }
    onLayoutChange(e) {
        const { width, height } = e.nativeEvent.layout;
        const openMenuOffset = width * this.state.openOffsetMenuPercentage;
        const hiddenMenuOffset = width * this.state.hiddenMenuOffsetPercentage;
        this.setState({ width, height, openMenuOffset, hiddenMenuOffset });
    }
    /**
     * Get content view. This view will be rendered over menu
     * @return {React.Component}
     */
    getContentView() {
        let overlay = <></>;
        if (this.isOpen) {
            overlay = (<react_native_1.TouchableWithoutFeedback onPress={() => this.openMenu(false)}>
          <react_native_1.View style={[styles_1.default.overlay, this.props.overlayStyle]}/>
        </react_native_1.TouchableWithoutFeedback>);
        }
        const { width, height } = this.state;
        const style = [
            styles_1.default.frontView,
            { width, height },
            this.props.animatedContainerStyle?.(this.state.left),
        ];
        return (<react_native_1.Animated.View style={style} {...this.responder.panHandlers}>
        {this.props.children}
        {overlay}
      </react_native_1.Animated.View>);
    }
    moveLeft(offset) {
        const newOffset = this.menuPositionMultiplier() * offset;
        this.props
            .animationFunction(this.state.left, newOffset)
            .start(this.props.onAnimationComplete);
        this.prevLeft = newOffset;
    }
    menuPositionMultiplier() {
        return this.props.menuPosition === "right" ? -1 : 1;
    }
    handlePanResponderMove(e, gestureState) {
        // @ts-ignore -- __getValue() is protected
        if (this.state.left.__getValue() * this.menuPositionMultiplier() >= 0) {
            let newLeft = this.prevLeft + gestureState.dx;
            if (!this.props.bounceBackOnOverdraw &&
                Math.abs(newLeft) > this.state.openMenuOffset) {
                newLeft = this.menuPositionMultiplier() * this.state.openMenuOffset;
            }
            this.props.onMove(newLeft);
            this.state.left.setValue(newLeft);
        }
    }
    handlePanResponderEnd(e, gestureState) {
        const offsetLeft = this.menuPositionMultiplier() *
            // @ts-ignore -- __getValue() is protected
            (this.state.left.__getValue() + gestureState.dx);
        this.openMenu(shouldOpenMenu(offsetLeft));
    }
    handleMoveShouldSetPanResponder(e, gestureState) {
        if (this.gesturesAreEnabled()) {
            const x = Math.round(Math.abs(gestureState.dx));
            const y = Math.round(Math.abs(gestureState.dy));
            const touchMoved = x > this.props.toleranceX && y < this.props.toleranceY;
            if (this.isOpen) {
                return touchMoved;
            }
            const withinEdgeHitWidth = this.props.menuPosition === "right"
                ? gestureState.moveX > deviceScreen.width - this.props.edgeHitWidth
                : gestureState.moveX < this.props.edgeHitWidth;
            const swipingToOpen = this.menuPositionMultiplier() * gestureState.dx > 0;
            return withinEdgeHitWidth && touchMoved && swipingToOpen;
        }
        return false;
    }
    openMenu(isOpen) {
        const { hiddenMenuOffset, openMenuOffset } = this.state;
        this.moveLeft(isOpen ? openMenuOffset : hiddenMenuOffset);
        this.isOpen = isOpen;
        this.forceUpdate();
        this.props.onChange(isOpen);
    }
    gesturesAreEnabled() {
        const { disableGestures } = this.props;
        if (typeof disableGestures === "function") {
            return !disableGestures();
        }
        else
            return !disableGestures;
    }
    render() {
        const boundryStyle = this.props.menuPosition === "right"
            ? { left: this.state.width - this.state.openMenuOffset }
            : { right: this.state.width - this.state.openMenuOffset };
        const clipMenuIfClosed = 
        // @ts-ignore -- Member __getValue() is untyped
        this.state.left.__getValue() === 0
            ? {
                display: "none",
            }
            : null;
        const menu = (<react_native_1.View style={[styles_1.default.menu, boundryStyle, this.props.style, clipMenuIfClosed]}>
        {this.props.menu}
      </react_native_1.View>);
        return (<react_native_1.View style={styles_1.default.container} onLayout={this.onLayoutChange}>
        {menu}
        {this.getContentView()}
      </react_native_1.View>);
    }
}
exports.default = SideMenu;
