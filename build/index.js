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
    constructor(props) {
        var _a;
        super(props);
        this.prevLeft = 0;
        this.isOpen = !!props.isOpen;
        const initialMenuPositionMultiplier = props.menuPosition === "right" ? -1 : 1;
        const openOffsetMenuPercentage = (_a = this.props.openMenuOffsetPercentage) !== null && _a !== void 0 ? _a : props.openMenuOffset / deviceScreen.width;
        let openMenuOffset = deviceScreen.width * openOffsetMenuPercentage;
        if (this.props.maxOpenMenuOffset &&
            openMenuOffset > this.props.maxOpenMenuOffset) {
            openMenuOffset = this.props.maxOpenMenuOffset;
        }
        const hiddenMenuOffsetPercentage = props.hiddenMenuOffset / deviceScreen.width;
        const left = new react_native_1.Animated.Value(props.isOpen
            ? props.openMenuOffset * initialMenuPositionMultiplier
            : props.hiddenMenuOffset);
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
        this.state.left.addListener(({ value }) => this.props.onSliding(Math.abs((value - this.state.hiddenMenuOffset) /
            (this.state.openMenuOffset - this.state.hiddenMenuOffset))));
        this.responder = react_native_1.PanResponder.create({
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
        const hiddenMenuOffset = width * this.state.hiddenMenuOffsetPercentage;
        let openMenuOffset = width * this.state.openOffsetMenuPercentage;
        if (this.props.maxOpenMenuOffset &&
            openMenuOffset > this.props.maxOpenMenuOffset) {
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
        if (mult === -1)
            outputRange.reverse();
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
        var _a, _b;
        let overlay = null;
        if (this.isOpen) {
            const overlayOpacityStyle = {
                opacity: this.mapSlidingAnimationToPercentage(),
            };
            overlay = (react_1.default.createElement(react_native_1.TouchableWithoutFeedback, { onPress: () => this.openMenu(false) },
                react_1.default.createElement(react_native_1.Animated.View, { style: [styles_1.default.overlay, overlayOpacityStyle] },
                    react_1.default.createElement(react_native_1.View, { style: [styles_1.default.overlay, this.props.overlayStyle] }))));
        }
        const { width, height } = this.state;
        const style = [
            styles_1.default.frontView,
            { width, height },
            (_b = (_a = this.props).animatedContainerStyle) === null || _b === void 0 ? void 0 : _b.call(_a, this.state.left),
        ];
        return (react_1.default.createElement(react_native_1.Animated.View, Object.assign({ style: style }, this.responder.panHandlers),
            this.props.children,
            overlay));
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
        const menuOpacityStyle = {
            opacity: this.mapSlidingAnimationToPercentage(),
        };
        const menu = (react_1.default.createElement(react_native_1.Animated.View, { style: [styles_1.default.menu, boundryStyle, this.props.style, menuOpacityStyle] }, this.props.menu));
        return (react_1.default.createElement(react_native_1.View, { style: styles_1.default.container, onLayout: this.onLayoutChange },
            menu,
            this.getContentView()));
    }
}
exports.default = SideMenu;
SideMenu.defaultProps = defaultProps;
