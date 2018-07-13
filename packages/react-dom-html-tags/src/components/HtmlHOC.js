// @flow
import React, {Component} from "react";
import PropTypes from "prop-types";
import {Provider as HtmlContextProvider} from "./HtmlContextComponents";
import type HtmlContext from "../HtmlContext";
import {message} from "../util";

export default function createHtmlHOC(
    getHtmlElements: (props: Object, options?: Object) => null | Object,
    defaultProps?: Object = {}
) {
    return class HtmlHOC extends Component {
        static propTypes = {
            htmlContext: PropTypes.instanceOf(HtmlContext).isRequired
        };

        // Assign default props from the wrapped component
        static defaultProps = defaultProps;

        static getDerivedStateFromProps(nextProps, prevState) {
            // eslint-disable-next-line no-unused-vars
            const {children, htmlContext, ...componentProps} = nextProps;
            const derivedMetadata = getHtmlElements(componentProps, prevState.mapOptions);
            return derivedMetadata ? {derivedMetadata} : null;
        }

        constructor(props, context) {
            super(props, context);
            // eslint-disable-next-line react/prop-types
            const {children, htmlContext, ...componentProps} = props;

            if (!htmlContext) {
                throw new Error(
                    message("Missing `htmlContext`, are you missing a parent HtmlProvider?")
                );
            }

            this._unsubscribe = null;
            this.state = {
                derivedMetadata: null,
                htmlContext: htmlContext.createChildContext(), // TODO: Could this be moved to afterRenderCommit lifecycle method?
                mapOptions: {
                    isServerRender: htmlContext.isServerRender()
                }
            };

            // NOTE: This really belongs in a post-render commit lifecycle, but one does not exist.
            if (htmlContext.isServerStringRender() && !htmlContext.isPreLoaded()) {
                // Minimize the evil - constructor should not include side-effects
                // This is only invoked for server-side string rendering when html metadata is not pre-loaded
                // When async rendering is enabled, add a WARNING here
                this.state.htmlContext.htmlComponentDidMount();
                this._setHtmlContextState(
                    getHtmlElements(componentProps, this.state.mapOptions),
                    false
                );
            }
        }

        componentDidMount() {
            const {htmlContext, derivedMetadata} = this.state;
            this._unsubscribe = htmlContext.htmlComponentDidMount(forceUpdateCallback => {
                // Resolve non-deterministic renders, then invoke the callback to signal update complete
                this.forceUpdate(forceUpdateCallback);
            });

            // NOTE: This would be better in a post-render commit lifecycle, but one does not exist.
            //       ideally; a post-commit lifecycle method where you could append state without re-render
            // No need to "invalidateParentState" here because the <head> is always mounted AFTER the application
            this._setHtmlContextState(derivedMetadata, false);
        }

        componentDidUpdate(/*prevProps, prevState*/) {
            const {derivedMetadata} = this.state;
            this._setHtmlContextState(derivedMetadata, true); // TODO: is this ever set to a value of NULL??? Check this first.
        }

        componentWillUnmount() {
            if (this._unsubscribe) {
                this._unsubscribe();
                this._unsubscribe = null;
            }

            const {htmlContext} = this.state;
            this._setHtmlContextState(null, true); // TODO: Maybe... `this.state.htmlState.clearHtmlState();`
            htmlContext.htmlComponentWillUnmount(); // TODO: Above line is NOT required, utilize THIS line via htmlCtx...???
        }

        render() {
            return (
                <HtmlContextProvider value={this.state.htmlContext}>
                    {this.props.children}
                </HtmlContextProvider>
            );
        }

        _setHtmlContextState(nextState?: mixed = null, invalidateParentState?: boolean = false) {
            this.state.htmlContext.setHtmlState(nextState, invalidateParentState);
        }
    };
}
