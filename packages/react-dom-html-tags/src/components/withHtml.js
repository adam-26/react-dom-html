// @flow
import React from "react";
import createHtmlHOC from "./HtmlHOC";
import {Consumer as HtmlContextConsumer} from "./HtmlContextComponents";
import getDisplayName from "react-display-name";
import hoistNonReactStatic from "hoist-non-react-statics";
import mapHtmlToState from "../mapHtmlToState";
import type HtmlMetadata from "../HtmlMetadata";

export default function withHtml(
    renderHtml: (props: Object, state: Object) => Node,
    options?: Object = {}
): (Component: Component) => Component {
    const {componentDisplayName, displayNamePrefix} = options;

    const getHtmlState = (props, options) => {
        return mapHtmlToState(renderHtml(props), {...options, permitAppChildren: false});
    };

    return Component => {
        const componentName = componentDisplayName || getDisplayName(Component);
        const displayName = `${displayNamePrefix}(${componentName})`;

        const HtmlHOC = createHtmlHOC(getHtmlState, Component && Component.defaultProps);

        // eslint-disable-next-line react/prop-types
        const HtmlMetadataHOC = ({children, ...props}) => {
            const wrappedChildren =
                Component === null ? null : typeof children !== "undefined" ? (
                    <Component {...props}>{children}</Component>
                ) : (
                    <Component {...props} />
                );

            return (
                <HtmlContextConsumer>
                    {htmlContext => (
                        <HtmlHOC {...props} htmlContext={htmlContext}>
                            {wrappedChildren}
                        </HtmlHOC>
                    )}
                </HtmlContextConsumer>
            );
        };

        // Expose a static method for pre-loading metadata on server to facilitate stream rendering
        HtmlMetadataHOC.appendHtmlMetadata = (htmlMetadata: HtmlMetadata, props) => {
            htmlMetadata.appendHtmlState(getHtmlState(props));
        };

        HtmlMetadataHOC.displayName = displayName;
        if (Component === null) {
            return HtmlMetadataHOC;
        }

        HtmlMetadataHOC.WrappedComponent = Component;
        return hoistNonReactStatic(HtmlMetadataHOC, Component);
    };
}
