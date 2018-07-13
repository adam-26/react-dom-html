// @flow
import React from "react";
import PropTypes from "prop-types";

export default function HeadFragment({
    priority,
    title,
    base,
    meta,
    link,
    style,
    script,
    noscript,
    template
}) {
    return (
        <React.Fragment>
            {priority}
            {title}
            {base}
            {meta}
            {style}
            {link}
            {template}
            {noscript}
            {script}
        </React.Fragment>
    );
}

HeadFragment.propTypes = {
    priority: PropTypes.array,
    title: PropTypes.array,
    base: PropTypes.array,
    meta: PropTypes.array,
    link: PropTypes.array,
    style: PropTypes.array,
    script: PropTypes.array,
    noscript: PropTypes.array,
    template: PropTypes.array
};
