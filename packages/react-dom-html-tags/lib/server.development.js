/*
 * Copyright 2018 @adam-26.
 * Copyrights licensed under the MIT License.
 * See the accompanying LICENSE file for terms.
 */

'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var react = require('react');
var index_js = require('react-dom-html-tags');
var invariant = _interopDefault(require('invariant'));
var server = require('react-dom-html/server');

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var objectWithoutProperties = function (obj, keys) {
  var target = {};

  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }

  return target;
};

function message(msg) {
    return "[react-dom-html-tags/server] " + msg;
}

function error(msg) {
    // eslint-disable-next-line no-console
    console.error(message(msg));
}

function getAppElement(htmlProvider, element) {
    return react.isValidElement(element) ? element : htmlProvider;
}

// Use callback to create react elements after the main application is rendered
function resolveOptionalElement(element) {
    return !react.isValidElement(element) && typeof element === "function" ? element() : element;
}

function getRenderOptions(renderFunctionName, isStaticMarkup, element, // The original react element passed to the render method
metadata) {
    var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
    var appContainerTagName = options.appContainerTagName,
        appContainerId = options.appContainerId,
        beforeAppContainer = options.beforeAppContainer,
        afterAppContainer = options.afterAppContainer,
        otherOptions = objectWithoutProperties(options, ["appContainerTagName", "appContainerId", "beforeAppContainer", "afterAppContainer"]);

    // Update the metadata state

    metadata.setStaticServerRender(isStaticMarkup); // TODO: All INTERNAL methods should be prefixed with '_'

    if (metadata._hasSerializedState()) {
        // === use serialized state to perform the render ===
        var _metadata$_getSeriali = metadata._getSerializedState(),
            _appTagName = _metadata$_getSeriali.appTagName,
            _htmlAttributes = _metadata$_getSeriali.htmlAttributes,
            _bodyAttributes = _metadata$_getSeriali.bodyAttributes,
            _appAttributes = _metadata$_getSeriali.appAttributes,
            head = _metadata$_getSeriali.head;

        return _extends({}, otherOptions, {
            htmlElement: react.createElement("html", _htmlAttributes),
            bodyElement: react.createElement("body", _bodyAttributes),
            headElement: head,
            appContainerElement: react.createElement(_appTagName, _appAttributes),
            beforeAppContainerElement: resolveOptionalElement(beforeAppContainer),
            afterAppContainerElement: resolveOptionalElement(afterAppContainer)
        });
    }

    var _metadata$getServerAt = metadata.getServerAttributes(element, { appContainerTagName: appContainerTagName, appContainerId: appContainerId }),
        appTagName = _metadata$getServerAt.appTagName,
        htmlAttributes = _metadata$getServerAt.htmlAttributes,
        headAttributes = _metadata$getServerAt.headAttributes,
        bodyAttributes = _metadata$getServerAt.bodyAttributes,
        appAttributes = _metadata$getServerAt.appAttributes;

    return _extends({}, otherOptions, {
        htmlElement: react.createElement("html", htmlAttributes),
        bodyElement: react.createElement("body", bodyAttributes),
        headElement: react.createElement("head", headAttributes, index_js.createHeadChildren(element, metadata)),
        appContainerElement: react.createElement(appTagName, appAttributes),
        beforeAppContainerElement: resolveOptionalElement(beforeAppContainer),
        afterAppContainerElement: resolveOptionalElement(afterAppContainer)
    });
}

function renderHtmlToString(element) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return renderString("renderHtmlToString", server.renderHtmlToString, false, element, options);
}

function renderHtmlToStaticMarkup(element) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return renderString("renderHtmlToStaticMarkup", server.renderHtmlToStaticMarkup, true, element, options);
}

function renderString(renderFunctionName, renderToFunc, isStaticMarkup, element) {
    var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
    var htmlMetadata = options.htmlMetadata,
        head = options.head,
        renderOpts = objectWithoutProperties(options, ["htmlMetadata", "head"]);

    if (htmlMetadata) {
        invariant(htmlMetadata.isServerStringRender(), message("Invalid `htmlMetadata` instance, not created for server string render."));
    }

    var metadata = htmlMetadata || index_js.HtmlMetadata.createForServerStringRender();

    // Wrap the application with a HtmlProvider
    var rootElement = index_js.withHtmlProvider(element, metadata);
    var appElement = getAppElement(rootElement, element);

    return renderToFunc(rootElement, {
        htmlElements: function htmlElements() {
            // head is not used when serialized state has been assigned
            if (head && !metadata._hasSerializedState()) {
                metadata.appendHead(resolveOptionalElement(head));
            }

            return getRenderOptions(renderFunctionName, isStaticMarkup, appElement, metadata, renderOpts);
        }
    });
}

var IS_DEV = process.env.NODE_ENV !== "production";

function renderHtmlToNodeStream(element) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return renderToStream("renderHtmlToNodeStream", server.renderHtmlToNodeStream, false, element, options);
}

function renderHtmlToStaticNodeStream(element) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return renderToStream("renderHtmlToStaticNodeStream", server.renderHtmlToStaticNodeStream, true, element, options);
}

function renderToStream(renderFunctionName, renderFunction, isStaticMarkup, element) {
    var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
    var htmlMetadata = options.htmlMetadata;

    if (htmlMetadata) {
        invariant(htmlMetadata.isServerStreamRender(), message("Invalid `htmlMetadata` instance, not created for server string render."));
    }

    var metadata = htmlMetadata || index_js.HtmlMetadata.createForServerStreamRender();

    // Wrap the application with a HtmlProvider
    var rootElement = index_js.withHtmlProvider(element, metadata);
    var appElement = getAppElement(rootElement, element);

    var stream = renderFunction(rootElement, getRenderOptions(renderFunctionName, isStaticMarkup, appElement, metadata, options));

    if (IS_DEV) {
        stream.on("end", function () {
            // TODO:: TEST THIS - verify it works as expected
            if (!metadata.didRenderCorrectHeadFragment()) {
                error("The wrong head fragment was rendered. " + "Stream rendering can not determine the head fragment, you need to define a " + "`static getHeadFragment()` function on the root element or pass it as an " + ("option `{ headFragment: HeadFragmentComponent }` to \"" + renderFunctionName + "\"."));
            }
        });
    }

    return stream;
}

exports.HTML5_DOCTYPE = server.HTML5_DOCTYPE;
exports.renderHtmlToString = renderHtmlToString;
exports.renderHtmlToStaticMarkup = renderHtmlToStaticMarkup;
exports.renderHtmlToNodeStream = renderHtmlToNodeStream;
exports.renderHtmlToStaticNodeStream = renderHtmlToStaticNodeStream;
