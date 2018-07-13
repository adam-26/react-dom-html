// @flow
import React, { Component } from "react";
import Html from "react-dom-html-tags";

const ToggleOn = () => (
    <Html lang="sv">
        <head>
            <title template={title => `${title} | Title Template On`}>
                Declarative Toggle On Title
            </title>
            <meta name="description" content="Free Web tutorials" />
        </head>
        <body className="declarativeToggleOn">
            <app>Declarative Toggle On</app>
        </body>
    </Html>
);

const ToggleOff = () => (
    <Html lang="nb">
        <head>
            <title template={title => `${title} | Title Template Off`}>
                Declarative Toggle Off Title
            </title>
            <meta name="keywords" content="HTML,CSS,XML,JavaScript" />
        </head>
        <body className="declarativeToggleOff">
            <app>
                <span>Declarative Toggle Off</span>
            </app>
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
                {on ? <ToggleOn /> : <ToggleOff />}
            </div>
        );
    }
}
