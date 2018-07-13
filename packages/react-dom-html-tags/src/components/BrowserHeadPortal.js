// @flow
import {Component} from "react";
import ReactDOM from "react-dom";
import {node} from "prop-types";

export default class BrowserHeadPortal extends Component {
    static propTypes = {
        children: node
    };

    render() {
        return ReactDOM.createPortal(this.props.children, document.querySelector("head"));
    }
}
