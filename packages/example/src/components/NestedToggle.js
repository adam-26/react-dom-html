// @flow
import React, { Component } from "react";
import Html from "react-dom-html-tags";

const ToggleOn = ({ children }) => (
    <Html lang="sv">
        <head>
            <title template={title => `${title} | Nested Title Template On`}>
                Nested Toggle On Title
            </title>
            <meta name="description" content="Free Web tutorials" />
        </head>
        <body className="nestedToggleOn">
            <app>{children}</app>
        </body>
    </Html>
);

const ToggleOff = ({ children }) => (
    <Html lang="nb">
        <head>
            <title template={title => `${title} | Nested Title Template Off`}>
                Nested Toggle Off Title
            </title>
            <meta name="keywords" content="HTML,CSS,XML,JavaScript" />
        </head>
        <body className="nestedToggleOff">
            <app>{children}</app>
        </body>
    </Html>
);

export default class DeclarativeToggle extends Component {
    state = {
        on: false
    };

    toggle() {
        this.setState({ on: !this.state.on });
    }

    render() {
        const { on } = this.state;
        return (
            <div style={{ border: "2px solid #000", margin: 5 }}>
                <button onClick={() => this.toggle()}>Toggle Metadata</button>
                {on ? (
                    <ToggleOn>Toggled On</ToggleOn>
                ) : (
                    <ToggleOff>Toggled Off</ToggleOff>
                )}
            </div>
        );
    }
}
