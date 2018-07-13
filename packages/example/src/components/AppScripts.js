// @flow
import React, { Component } from "react";
import PropTypes from "prop-types";

/*
Used to embed app scripts in ALL renders (including the client-side rendering markup, for verifying missing Provider warnings)
 */
export default class AppScripts extends Component {
    static propTypes = {
        assets: PropTypes.object.isRequired,
        hydrateClient: PropTypes.bool
    };

    static defaultProps = {
        hydrateClient: false
    };

    render() {
        const { assets, hydrateClient } = this.props;

        return (
            <React.Fragment>
                <noscript
                    dangerouslySetInnerHTML={{
                        __html: `<b>Enable JavaScript to run this app.</b>`
                    }}
                />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `__AppState=${JSON.stringify({
                            assets,
                            hydrateClient
                        })};`
                    }}
                />
                <script src={assets["main.js"]} />
            </React.Fragment>
        );
    }
}
