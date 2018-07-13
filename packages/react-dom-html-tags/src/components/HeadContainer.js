// @flow
import React from "react";
import PropTypes from "prop-types";
import {forEachQuerySelectorAll} from "../util";

export default class HeadContainer extends React.Component {
    static propTypes = {
        children: PropTypes.func,
        clearExistingChildren: PropTypes.bool,
        metadata: PropTypes.any.isRequired
    };

    static defaultProps = {
        clearExistingChildren: false
    };

    constructor(props, context) {
        super(props, context);

        this._unsubscribe = null;
        this.state = {
            htmlMetadata: props.metadata,
            lastUpdated: 0
        };
    }

    componentDidMount() {
        const self = this;
        const {htmlMetadata} = this.state;
        const {clearExistingChildren} = this.props;

        let onHeadRendered;
        if (clearExistingChildren) {
            // remove existing <head> children - except elements with specified selectors
            const selectors = htmlMetadata.getExternalHeadSelectors();
            const removeSelectors = selectors.map(selector => `:not(${selector})`);

            const headDomNode = document.querySelector("head");

            // Remove dom nodes from <head>
            forEachQuerySelectorAll(headDomNode, removeSelectors.join(""), domElement => {
                headDomNode.removeChild(domElement);
            });

            onHeadRendered = () => {
                // move other elements to the end of the <head> children
                // - this should ensure consistent ordering for hydrate/render
                forEachQuerySelectorAll(headDomNode, selectors.join(", "), domElement => {
                    headDomNode.appendChild(domElement);
                });
            };
        }

        self._unsubscribe = htmlMetadata.onChange(done => {
            // setState to queue a re-render
            htmlMetadata.renderAttributes();
            self.setState({lastUpdated: Date.now()}, done);
        });

        // if a commit lifecycle method is added to react, this only needs to be done for client hydrate
        // forces all metadata to render to update body & html attributes
        htmlMetadata.headDidMount(onHeadRendered);
    }

    componentDidUpdate(/*prevProps, prevState, snapshot*/) {
        const {htmlMetadata} = this.state;
        if (htmlMetadata.isNonDeterministic()) {
            // If the render resulted in non-deterministic html metadata
            // Force a re-render in an attempt to resolve the errors
            htmlMetadata.resolveNonDeterministicErrors();
        }
    }

    componentWillUnmount() {
        if (this._unsubscribe) {
            this._unsubscribe();
            this._unsubscribe = null;
        }
    }

    render() {
        return this.props.children(this.state.htmlMetadata.getHeadComponents());
    }
}
