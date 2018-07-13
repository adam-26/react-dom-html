// @flow
import React from "react";
import AppStyles from "./AppStyles";
import Toggle from "./Toggle";
import DeclarativeToggle from "./DeclarativeToggle";
import NestedToggle from "./NestedToggle";

import "./app.css";

import styled from "styled-components";
const Title = styled.h1`
    font-size: 1.5em;
    text-align: center;
    color: palevioletred;
`;

const App = () => (
    <AppStyles>
        <Title>A styled-components title</Title>
        <p>Open the browser dev tools to inspect the metadata</p>
        <h3>Try different render techniques:</h3>
        <h4>
            <a href="/">server render - string</a>
        </h4>
        <h4>
            <a href="/?stream">
                server render - stream (Client hydrate will ONLY match the
                server render if all html metadata is pre-loaded)
            </a>
        </h4>
        <h4>
            <a href="/?client">client render - as string from server</a>
        </h4>
        <h4>
            <a href="/?stream&client">client render - as stream from server</a>
        </h4>
        <Toggle>
            <NestedToggle />
        </Toggle>
        <DeclarativeToggle />
    </AppStyles>
);

export default App;
