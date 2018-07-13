import React from "react";

export default {
    includeDocType: true,
    headElement: (
        <head>
            <meta charSet="utf-8" />
            <title>My Application</title>
        </head>
    ),
    appElement: <div>Loading...</div>,
    afterAppContainerElement: <script src="/public/scripts/appBundle.js" />
};
