import React from "react";
import { hydrateHtml, renderHtml } from "react-dom-html-tags";
import App from "./components/App";
// import {HydrateErrorComponent} from './components/Toggle';

// Extract the state from the server render
const { hydrateClient } = window.__AppState;

if (hydrateClient) {
    // === standard usage ===
    // hydrateHtml(htmlMetadata => <App htmlMetadata={htmlMetadata}><HydrateErrorComponent /></App>);
    // hydrateHtml(<App />);

    // === required for styled-components to correctly hydrate ===
    hydrateHtml(<App />, {
        // NOTE: if styled-components supported assigning additional props on server, this would not be required
        hydratedHeadElementSelectors: "[data-styled-components]"
    });
} else {
    // === standard usage ===
    // renderHtml(<App />);

    // === required for styled-components to correctly render ===
    renderHtml(<App />, {
        externalHeadElementSelectors: ["[data-styled-components]"]
    });
}
