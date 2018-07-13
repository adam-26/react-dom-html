import React from "react";
import HtmlMetadata from "../HtmlMetadata";
import HtmlProvider from "../components/HtmlProvider";
import withHtml from "../components/withHtml";
import {
    renderHtmlToNodeStream,
    renderHtmlToStaticNodeStream,
    renderHtmlToStaticMarkup,
    renderHtmlToString
} from "../server";

function streamToString(stream, callback) {
    const chunks = [];
    stream.on("data", chunk => {
        chunks.push(chunk.toString());
    });

    stream.on("end", () => {
        callback(chunks.join(""));
    });
}

function AppMetadataComponent({children}) {
    return children;
}

const AppMetadata = withHtml(() => (
    <html lang="en">
        <head>
            <title>Hello</title>
            <style type="text/css">{"body { margin: 10px; }"}</style>
        </head>
        <body className="root" />
    </html>
))(AppMetadataComponent);

const CustomHeadFragment = props => {
    // eslint-disable-next-line react/prop-types
    const {priority, title, style} = props;
    return (
        <React.Fragment>
            {style}
            {priority}
            {title}
            <noscript>no script</noscript>
        </React.Fragment>
    );
};

class App extends React.Component {
    render() {
        return (
            // eslint-disable-next-line react/prop-types
            <HtmlProvider metadata={this.props.metadata}>
                <AppMetadata>
                    <div>content</div>
                </AppMetadata>
            </HtmlProvider>
        );
    }
}

// eslint-disable-next-line react/prop-types
const StatelessApp = ({metadata}) => {
    return (
        <HtmlProvider metadata={metadata}>
            <AppMetadata>
                <div>content</div>
            </AppMetadata>
        </HtmlProvider>
    );
};

const CustomProvider = ({children, ...props}) => <HtmlProvider {...props}>{children}</HtmlProvider>;
CustomProvider.getHeadFragment = () => CustomHeadFragment;

const testSets = [
    [
        "returns html using explicit HtmlProvider",
        htmlMetadata => (
            <HtmlProvider metadata={htmlMetadata}>
                <AppMetadata>
                    <div>content</div>
                </AppMetadata>
            </HtmlProvider>
        ),
        (reactRootAttr = "") =>
            `<html lang="en"><head${reactRootAttr}><title>Hello</title><style type="text/css">body { margin: 10px; }</style></head><body class="root"><div id="app"><div>content</div></div></body></html>`
    ],
    [
        "returns html using implicit HtmlProvider",
        <AppMetadata>
            <div>content</div>
        </AppMetadata>,
        (reactRootAttr = "") =>
            `<html lang="en"><head${reactRootAttr}><title>Hello</title><style type="text/css">body { margin: 10px; }</style></head><body class="root"><div id="app"><div>content</div></div></body></html>`
    ],
    [
        "returns html using custom HtmlProvider element",
        htmlMetadata => <App metadata={htmlMetadata} />,
        (reactRootAttr = "") =>
            `<html lang="en"><head${reactRootAttr}><title>Hello</title><style type="text/css">body { margin: 10px; }</style></head><body class="root"><div id="app"><div>content</div></div></body></html>`
    ],
    [
        "returns html using stateless HtmlProvider component",
        htmlMetadata => <StatelessApp metadata={htmlMetadata} />,
        (reactRootAttr = "") =>
            `<html lang="en"><head${reactRootAttr}><title>Hello</title><style type="text/css">body { margin: 10px; }</style></head><body class="root"><div id="app"><div>content</div></div></body></html>`
    ],
    [
        "returns html using same HeadContainer component as HtmlProvider component",
        htmlMetadata => (
            <HtmlProvider metadata={htmlMetadata} headFragment={CustomHeadFragment}>
                <AppMetadata>
                    <div>content</div>
                </AppMetadata>
            </HtmlProvider>
        ),
        (reactRootAttr = "") =>
            `<html lang="en"><head${reactRootAttr}><style type="text/css">body { margin: 10px; }</style><title>Hello</title><noscript>no script</noscript></head><body class="root"><div id="app"><div>content</div></div></body></html>`
    ],
    [
        "returns html using wrapper HtmlProvider with `static getHeadFragment()` method",
        htmlMetadata => (
            <CustomProvider metadata={htmlMetadata}>
                <AppMetadata>
                    <div>content</div>
                </AppMetadata>
            </CustomProvider>
        ),
        (reactRootAttr = "") =>
            `<html lang="en"><head${reactRootAttr}><style type="text/css">body { margin: 10px; }</style><title>Hello</title><noscript>no script</noscript></head><body class="root"><div id="app"><div>content</div></div></body></html>`
    ],
    [
        "returns html with content 'beforeAppContainer'",
        <AppMetadata>
            <div>content</div>
        </AppMetadata>,
        (reactRootAttr = "") =>
            `<html lang="en"><head${reactRootAttr}><title>Hello</title><style type="text/css">body { margin: 10px; }</style></head><body class="root"><div>before</div><div id="app"><div>content</div></div></body></html>`,
        {beforeAppContainer: <div>before</div>}
    ],
    [
        "returns html with content 'afterAppContainer'",
        <AppMetadata>
            <div>content</div>
        </AppMetadata>,
        (reactRootAttr = "") =>
            `<html lang="en"><head${reactRootAttr}><title>Hello</title><style type="text/css">body { margin: 10px; }</style></head><body class="root"><div id="app"><div>content</div></div><div>after</div></body></html>`,
        {afterAppContainer: <div>after</div>}
    ],
    [
        "returns html with custom appContainer",
        <AppMetadata>
            <div>content</div>
        </AppMetadata>,
        (reactRootAttr = "") =>
            `<html lang="en"><head${reactRootAttr}><title>Hello</title><style type="text/css">body { margin: 10px; }</style></head><body class="root"><span id="custom"><div>content</div></span></body></html>`,
        {appContainerTagName: "span", appContainerId: "custom"}
    ]
];

describe("server", () => {
    describe("renderHtmlToString", () => {
        testSets.forEach(([testName, input, getExpectedResult, options]) => {
            test(testName, () => {
                const html = renderHtmlToString(input, options);
                expect(html).toBe(getExpectedResult(' data-reactroot=""'));
            });
        });

        test("should include head elements assigned after render", () => {
            const html = renderHtmlToString(
                <AppMetadata>
                    <div>content</div>
                </AppMetadata>,
                {
                    head: (
                        <head>
                            <style type="text/css" data-react-dom-html-tags={false}>
                                {`body {background-color: #ccc;}`}
                            </style>
                        </head>
                    )
                }
            );
            expect(html).toBe(
                '<html lang="en"><head data-reactroot=""><title>Hello</title><style type="text/css" data-react-dom-html-tags="false">body {background-color: #ccc;}</style><style type="text/css">body { margin: 10px; }</style></head><body class="root"><div id="app"><div>content</div></div></body></html>'
            );
        });
    });

    describe("renderHtmlToStaticMarkup", () => {
        testSets.forEach(([testName, input, getExpectedResult, options]) => {
            test(testName, () => {
                const html = renderHtmlToStaticMarkup(input, options);
                expect(html).toBe(getExpectedResult());
            });
        });
    });

    describe("renderHtmlToNodeStream", () => {
        testSets.forEach(([testName, input, getExpectedResult, options]) => {
            test(testName, done => {
                const metadata = HtmlMetadata.createForServerStreamRender();
                AppMetadata.appendHtmlMetadata(metadata, {});

                const stream = renderHtmlToNodeStream(input, {...options, htmlMetadata: metadata});
                streamToString(stream, html => {
                    expect(html).toBe(getExpectedResult(' data-reactroot=""'));
                    done();
                });
            });
        });
    });

    describe("renderHtmlToStaticNodeStream", () => {
        testSets.forEach(([testName, input, getExpectedResult, options]) => {
            test(testName, done => {
                const metadata = HtmlMetadata.createForServerStreamRender();
                AppMetadata.appendHtmlMetadata(metadata, {});

                const stream = renderHtmlToStaticNodeStream(input, {
                    ...options,
                    htmlMetadata: metadata
                });
                streamToString(stream, html => {
                    expect(html).toBe(getExpectedResult());
                    done();
                });
            });
        });
    });
});
