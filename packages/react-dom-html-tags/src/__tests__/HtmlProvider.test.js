import React from "react";
import PropTypes from "prop-types";
import {mount} from "./enzyme";
import {renderToStaticMarkup} from "react-dom/server";
import HtmlProvider from "../components/HtmlProvider";
import HtmlMetadata from "../HtmlMetadata";

const SerializedData = ({windowKey, data}) => (
    <script
        type="text/javascript"
        dangerouslySetInnerHTML={{
            __html: `window.${windowKey}=${JSON.stringify(data)}`
        }}
    />
);

SerializedData.propTypes = {
    windowKey: PropTypes.string,
    data: PropTypes.object
};

class Content extends React.Component {
    static propTypes = {
        data: PropTypes.object
    };

    constructor(props, context) {
        super(props, context);
    }

    componentWillMount() {
        // modify data - to verify the 'lastChild' renders the modified value
        this.props.data.hello = "world";
    }

    render() {
        return <div>content</div>;
    }
}

describe("HtmlProvider", () => {
    describe("render", () => {
        test("returns html chrome", () => {
            const html = renderToStaticMarkup(<HtmlProvider>content</HtmlProvider>);
            expect(html).toBe("<html><head><title></title></head><body>content</body></html>");
        });

        test("returns html with metadata", () => {
            const md = HtmlMetadata.createForClientRender({
                htmlAttributes: {lang: "en"},
                bodyAttributes: {class: "root"},
                title: "Hello"
            });

            const html = renderToStaticMarkup(<HtmlProvider metadata={md}>content</HtmlProvider>);
            expect(html).toBe(
                '<html lang="en"><head><title>Hello</title></head><body class="root">content</body></html>'
            );
        });

        test("lastChild renders element after body has rendered", () => {
            // start with empty data
            // - the <Content> component should assign a value BEFORE the data is serialized
            const requestData = {};
            const wrapper = mount(
                <HtmlProvider
                    lastChild={<SerializedData windowKey="__appState" data={requestData} />}>
                    <Content data={requestData} />
                </HtmlProvider>
            );

            expect(wrapper.html()).toBe(
                '<html><head><title></title></head><body><div>content</div><script type="text/javascript">window.__appState={"hello":"world"}</script></body></html>'
            );
        });

        test("lastChild renders function after body has rendered", () => {
            // start with empty data
            // - the <Content> component should assign a value BEFORE the data is serialized
            const requestData = {};
            const wrapper = mount(
                <HtmlProvider
                    lastChild={() => <SerializedData windowKey="__appState" data={requestData} />}>
                    <Content data={requestData} />
                </HtmlProvider>
            );

            expect(wrapper.html()).toBe(
                '<html><head><title></title></head><body><div>content</div><script type="text/javascript">window.__appState={"hello":"world"}</script></body></html>'
            );
        });
    });
});
