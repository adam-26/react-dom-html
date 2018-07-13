// @flow
import React, { Component } from "react";
import Html from "react-dom-html-tags";

function ToggleOn(props) {
    return (
        <Html className="htmlToggledOn">
            <head>
                <title>Toggle On Title</title>
            </head>
            <body className="bodyToggledOn">
                <app>
                    <div>
                        Toggle On
                        <div>{props.children}</div>
                    </div>
                </app>
            </body>
        </Html>
    );
}

function ToggleOff(props) {
    return (
        <Html className="htmlToggledOff">
            <head>
                <title>Toggle Off Title</title>
            </head>
            <body className="bodyToggledOff">
                <app>
                    <div>
                        Toggle Off
                        <div>{props.children}</div>
                    </div>
                </app>
            </body>
        </Html>
    );
}

export default class Toggle extends Component {
    state = {
        on: false
    };

    toggle() {
        this.setState({ on: !this.state.on });
    }

    render() {
        const { on } = this.state;
        const { children } = this.props;

        return (
            <div style={{ border: "2px solid #000", margin: 5 }}>
                <button onClick={() => this.toggle()}>Toggle</button>
                {on ? (
                    <ToggleOn>{children}</ToggleOn>
                ) : (
                    <ToggleOff>{children}</ToggleOff>
                )}
            </div>
        );
    }
}
