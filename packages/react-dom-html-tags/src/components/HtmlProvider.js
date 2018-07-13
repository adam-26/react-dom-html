// @flow
import React, {Component, Children} from "react";
import PropTypes from "prop-types";
import {Provider as HtmlContextProvider} from "./HtmlContextComponents";
import HtmlMetadata from "../HtmlMetadata";
import HeadFragment from "./HeadFragment";
import HeadContainer from "./HeadContainer";
import BrowserHeadPortal from "./BrowserHeadPortal";
import {warn} from "../util";

const IS_DEV = process.env.NODE_ENV !== "production";

export default class HtmlProvider extends Component {
    static propTypes = {
        metadata: PropTypes.instanceOf(HtmlMetadata).isRequired,
        headFragment: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
        headPortal: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
        suppressNonDeterministicWarnings: PropTypes.bool,
        headComponentPriorityKeys: PropTypes.arrayOf(PropTypes.string),
        children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired
    };

    static defaultProps = {
        headPortal: null,
        suppressNonDeterministicWarnings: false,
        headFragment: HeadFragment
    };

    constructor(props, context) {
        super(props, context);
        const {
            metadata,
            headFragment,
            headPortal,
            suppressNonDeterministicWarnings,
            headComponentPriorityKeys
        } = props;

        const htmlMetadata = metadata || HtmlMetadata.createForClientRender();
        htmlMetadata.setHeadFragment(headFragment);

        if (headComponentPriorityKeys) {
            htmlMetadata.setPriorityComponentKeys(headComponentPriorityKeys);
        }

        // Flag that the React component lifecycle has now started
        // - this is idempodent
        htmlMetadata.startComponentLifecycle();

        if (suppressNonDeterministicWarnings) {
            htmlMetadata.setIgnoreNonDeterministicHtml(true);
        }

        this._unsubscribe = null;
        this.state = {
            htmlMetadata: htmlMetadata,
            htmlContext: htmlMetadata.getRootContext(),
            headPortal:
                headPortal ||
                // Browser only renders should be "head-first", requires a Portal
                //  - use a portal to populate the <head> before rendering the app
                //  - browser `hydrate` needs to hydrate directly to <head>, can't use Portal for hydrate
                (!htmlMetadata.isServerRender() && !htmlMetadata.isHydratingClient())
                    ? BrowserHeadPortal
                    : null
        };
    }

    componentDidMount() {
        const {htmlMetadata, headPortal} = this.state;
        if (IS_DEV) {
            if (!htmlMetadata.isHeadMounted() && htmlMetadata.isRenderingClient()) {
                warn("The HeadContainer component is not mounted.");
            }
        }

        if (headPortal === null) {
            // when no portal is used to render the <HeadContainer>,
            // force all metadata to re-render after the entire app has been mounted
            // When the <HeadContainer> component is used for render, it is responsible for rendering all metadata
            htmlMetadata.headDidMount();
        }

        this._unsubscribe = htmlMetadata.htmlProviderDidMount(() => this.forceUpdate());
    }

    componentWillUnmount() {
        if (this._unsubscribe) {
            this._unsubscribe();
            this._unsubscribe = null;
        }

        this.state.htmlMetadata.htmlProviderWillUnmount();
    }

    render() {
        const {children, headFragment: HeadFragment} = this.props;
        const {htmlContext, htmlMetadata, headPortal: HeadPortal} = this.state;

        return (
            <HtmlContextProvider value={htmlContext}>
                {/* Render children FIRST - this resolves all metadata */}
                {Children.only(children)}

                {/* NOTE: If a commit lifecycle method is added to react, this should render correctly on initial render */}
                {/* HeadPortal is only assigned on client - use a Portal to render outside of App */}
                {HeadPortal && (
                    <HeadContainer metadata={htmlMetadata} clearExistingChildren={true}>
                        {headComponents => (
                            <HeadPortal>
                                <HeadFragment {...headComponents} />
                            </HeadPortal>
                        )}
                    </HeadContainer>
                )}
            </HtmlContextProvider>
        );
    }
}
