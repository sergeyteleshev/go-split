import { SplitContext, defaultState } from "./context";
import React from "react";
export class Split extends React.Component {
    constructor(props) {
        var _a, _b, _c;
        super(props);
        this.isMainSecond = () => {
            let main = false;
            React.Children.forEach(this.props.children, (child, i) => {
                if (React.isValidElement(child) && 'main' in child.props) {
                    if (i > 0) {
                        main = true;
                    }
                }
            });
            return (main
                || this.getSecondOffset() < this.getMainOffset()
                || (this.getSecondOffset() === this.getContainerOffset()
                    && this.getSecondSize() === 0
                    && this.getMainSize() !== 0));
        };
        this.getMainSizeStyle = () => {
            switch (this.state.mode) {
                case 'minimize':
                    return '0px';
                case 'maximize':
                    return '100%';
                default:
                    if (this.state.size === -1) {
                        return 'auto';
                    }
                    const container = this.getContainerSize();
                    if (container === -1) {
                        return `${this.state.size}px`;
                    }
                    return `${Math.min(this.state.size, container)}px`;
            }
        };
        this.getContainerSize = () => this.getSize(this.splitRef.current);
        this.getMainSize = () => this.getSize(this.mainRef);
        this.getSecondSize = () => this.getSize(this.secondRef);
        this.getMainOffset = () => {
            if (!this.mainRef) {
                return -1;
            }
            const rect = this.mainRef.getBoundingClientRect();
            if (this.state.split === "vertical") {
                return rect.left;
            }
            return rect.top;
        };
        this.getSecondOffset = () => {
            if (!this.secondRef) {
                return -1;
            }
            const rect = this.secondRef.getBoundingClientRect();
            if (this.state.split === "vertical") {
                return rect.left;
            }
            return rect.top;
        };
        this.getContainerOffset = (inverse) => {
            if (!this.splitRef.current) {
                return -1;
            }
            const rect = this.splitRef.current.getBoundingClientRect();
            if (this.state.split === "vertical") {
                return rect.left + (inverse ? rect.width : 0);
            }
            return rect.top + (inverse ? rect.height : 0);
        };
        this.stopResize = () => {
            this.setState({
                isResizing: false
            });
        };
        this.startResize = (clientX, clientY) => {
            this.setState({
                isResizing: true
            });
            // const clientPosition = this.state.split === "vertical" ? clientX : clientY;
            // let newSize = -1;
            // if (this.isMainSecond()) {
            //   newSize = this.getContainerOffset(true) - clientPosition;
            // } else {
            //   newSize = clientPosition - this.getContainerOffset();
            // }
            // this.setSize(newSize, true);
        };
        this.resize = (clientX, clientY) => {
            if (!this.state.isResizing) {
                return;
            }
            const clientPosition = this.state.split === "vertical" ? clientX : clientY;
            let newSize = -1;
            if (this.isMainSecond()) {
                newSize = this.getContainerOffset(true) - clientPosition;
            }
            else {
                newSize = clientPosition - this.getContainerOffset();
            }
            this.setSize(newSize, true);
        };
        this.setDisable = (disable) => {
            var _a, _b, _c;
            this.setState({
                disable
            });
            if (disable) {
                this.setMode('maximize');
            }
            else {
                this.setMode((_a = this.props.mode) !== null && _a !== void 0 ? _a : 'resize');
            }
            (_c = (_b = this.props).onDisable) === null || _c === void 0 ? void 0 : _c.call(_b, disable);
        };
        this.setSize = (size, updateRatio) => {
            var _a, _b, _c, _d;
            const sideSize = this.getContainerSize();
            if (sideSize === -1) {
                return;
            }
            let newSize = size;
            let mode = this.state.mode;
            if (this.state.maxSize > -1 && newSize > this.state.maxSize) {
                newSize = this.state.maxSize;
            }
            if (this.state.minSize > -1 && newSize < this.state.minSize) {
                newSize = this.state.minSize;
            }
            if (mode !== 'maximize' && newSize < this.state.sticky) {
                if (updateRatio) {
                    newSize = 0;
                }
                mode = 'minimize';
            }
            else if (sideSize < newSize + this.state.sticky) {
                if (updateRatio) {
                    newSize = sideSize;
                }
                mode = 'maximize';
            }
            else {
                mode = 'resize';
            }
            const ratio = updateRatio ? newSize / sideSize : this.state.ratio;
            this.setState({
                size: newSize,
                mode,
                ratio
            });
            (_b = (_a = this.props).onResize) === null || _b === void 0 ? void 0 : _b.call(_a, newSize, ratio);
            (_d = (_c = this.props).onModeChange) === null || _d === void 0 ? void 0 : _d.call(_c, mode);
        };
        this.setMode = (mode) => {
            var _a, _b;
            this.setState({ mode });
            (_b = (_a = this.props).onModeChange) === null || _b === void 0 ? void 0 : _b.call(_a, mode);
        };
        this.handleReactStartResize = (event) => {
            if (event.target !== event.currentTarget) {
                return;
            }
            this.onStartResize(event.nativeEvent);
        };
        this.onStartResize = (event) => {
            let clientX;
            let clientY;
            if (event instanceof MouseEvent) {
                clientX = event.clientX;
                clientY = event.clientX;
            }
            else {
                const touch = event.touches[0];
                clientX = touch.clientX;
                clientY = touch.clientX;
            }
            this.startResize(clientX, clientY);
        };
        this.handleReactEndResize = (event) => {
            if (event.target !== event.currentTarget) {
                return;
            }
            this.onEndResize(event.nativeEvent);
        };
        this.onEndResize = (event) => {
            if (!this.state.isResizing) {
                return;
            }
            this.stopResize();
        };
        this.onDoubleClick = (event) => {
            var _a, _b;
            if (event.target !== event.currentTarget) {
                return;
            }
            const size = -1;
            this.setState({ size });
            (_b = (_a = this.props).onResize) === null || _b === void 0 ? void 0 : _b.call(_a, size, this.state.ratio);
        };
        this.onMouseMove = (event) => {
            if (!this.state.isResizing) {
                return;
            }
            event.preventDefault();
            const { clientX, clientY } = event;
            this.resize(clientX, clientY);
        };
        this.onTouchMove = (event) => {
            if (!this.state.isResizing) {
                return;
            }
            event.preventDefault();
            const { clientX, clientY } = event.touches[0];
            this.resize(clientX, clientY);
        };
        this.onSplitResize = () => {
            if (this.state.size !== -1 && this.state.mode === 'resize') {
                if (this.state.keepRatio) {
                    this.setSize(Math.round(this.state.ratio * this.getContainerSize()));
                }
            }
        };
        this.splitRef = React.createRef();
        this.sizeObserver = new ResizeObserver(() => {
            this.onSplitResize();
        });
        this.state = Object.assign(Object.assign({}, defaultState), { isFixed: !!props.mode, split: props.split || "vertical", sticky: props.sticky || -1, maxSize: props.maxSize || -1, minSize: props.minSize || -1, keepRatio: !!props.keepRatio, disable: !!props.disable, size: (_b = (_a = props.size) !== null && _a !== void 0 ? _a : props.minSize) !== null && _b !== void 0 ? _b : -1, ratio: (_c = props.ratio) !== null && _c !== void 0 ? _c : -1, mode: props.mode || 'resize', isMainSecond: this.isMainSecond, getContainerSize: this.getContainerSize, getMainSize: this.getMainSize, getMainSizeStyle: this.getMainSizeStyle, setMode: this.setMode, setSize: this.setSize, setDisable: this.setDisable, onMouseDown: this.handleReactStartResize, onTouchStart: this.handleReactStartResize, onClick: this.handleReactEndResize, onTouchEnd: this.handleReactEndResize, onDoubleClick: this.onDoubleClick });
    }
    get mainRef() {
        var _a, _b;
        return (_b = (_a = this.splitRef.current) === null || _a === void 0 ? void 0 : _a.querySelector(`#pane-true`)) !== null && _b !== void 0 ? _b : null;
    }
    get secondRef() {
        var _a, _b;
        return (_b = (_a = this.splitRef.current) === null || _a === void 0 ? void 0 : _a.querySelector(`#pane-false`)) !== null && _b !== void 0 ? _b : null;
    }
    static getDerivedStateFromProps(props, state) {
        var _a, _b, _c;
        if (props.split !== state.split ||
            props.maxSize !== state.maxSize ||
            props.minSize !== state.minSize ||
            props.sticky !== state.sticky ||
            props.keepRatio !== state.keepRatio ||
            props.disable !== state.disable ||
            props.mode !== state.mode ||
            props.size !== state.size ||
            props.ratio !== state.ratio) {
            return {
                split: props.split || "vertical",
                sticky: props.sticky || 0,
                maxSize: props.maxSize || -1,
                minSize: props.minSize || -1,
                keepRatio: !!props.keepRatio,
                disable: (_a = props.disable) !== null && _a !== void 0 ? _a : state.disable,
                isFixed: !!props.mode,
                mode: props.mode || (state.isFixed ? 'resize' : state.mode),
                size: (_b = props.size) !== null && _b !== void 0 ? _b : state.size,
                ratio: (_c = props.ratio) !== null && _c !== void 0 ? _c : state.ratio
            };
        }
        return null;
    }
    componentDidMount() {
        if (this.splitRef.current) {
            this.sizeObserver.observe(this.splitRef.current);
        }
        document.addEventListener("mouseup", this.onEndResize);
        document.addEventListener("mousemove", this.onMouseMove);
        document.addEventListener("touchmove", this.onTouchMove);
        document.addEventListener("touchend", this.onEndResize);
        document.addEventListener("touchcancel", this.onEndResize);
    }
    componentWillUnmount() {
        if (this.splitRef.current) {
            this.sizeObserver.unobserve(this.splitRef.current);
        }
        document.removeEventListener("mouseup", this.onEndResize);
        document.removeEventListener("mousemove", this.onMouseMove);
        document.removeEventListener("touchmove", this.onTouchMove);
        document.removeEventListener("touchend", this.onEndResize);
        document.removeEventListener("touchcancel", this.onEndResize);
    }
    render() {
        const { className, children, style } = this.props;
        return (React.createElement(SplitContext.Provider, { value: this.state },
            React.createElement("div", { className: className, style: style, ref: this.splitRef }, children)));
    }
    getSize(element) {
        if (!element) {
            return -1;
        }
        const rect = element.getBoundingClientRect();
        if (this.state.split === "vertical") {
            return rect.width;
        }
        return rect.height;
    }
}
//# sourceMappingURL=Split.js.map