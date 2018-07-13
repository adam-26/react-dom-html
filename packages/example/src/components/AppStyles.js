// @flow
import React, { Component } from "react";
import PropTypes from "prop-types";
import Html, { withHtml } from "react-dom-html-tags";

/*
Used to embed app styles in ALL renders
 */
class AppStyles extends Component {
    static propTypes = {
        children: PropTypes.node
    };

    static defaultProps = {
        children: null
    };

    render() {
        const { children } = this.props;

        return (
            <Html amp="">
                <head>
                    <meta charSet="utf-8" />
                    <style type="text/css">{`
                        body { margin: 10px; padding: 0; font-family: sans-serif; }
                    `}</style>
                </head>
                <app>
                    <div>{children}</div>
                </app>
            </Html>
        );
    }
}

export default AppStyles;
