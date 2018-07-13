/*
 * Copyright 2018 @adam-26.
 * Copyrights licensed under the MIT License.
 * See the accompanying LICENSE file for terms.
 */

'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var react = require('react');
var server = require('react-dom/server');
var invariant = _interopDefault(require('invariant'));
var stream = require('stream');

var DEFAULT_APP_ELEMENT_ID = "app";


function defaultTo(getter, value) {
    if (typeof getter === "function") {
        return getter();
    }

    return value;
}

function getAppContainerProps() {
    var rootElement = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var appContainerTagName = options.appContainerTagName,
        appContainerId = options.appContainerId;

    var type = rootElement === null ? null : rootElement.type;
    var elementId = appContainerId || defaultTo(type && type.getAppContainerId, DEFAULT_APP_ELEMENT_ID);

    return {
        tagName: appContainerTagName || defaultTo(type && type.getAppContainerTagName, "div"),
        id: elementId,
        querySelector: "#" + elementId
    };
}

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

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

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
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

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var IS_DEV = process.env.NODE_ENV !== "production";

var HTML5_DOCTYPE = "<!DOCTYPE html>";
var HTML_TAG = "html";
var HEAD_TAG = "head";
var BODY_TAG = "body";
var APP_TAG = "app";

function warn(msg) {
    if (IS_DEV) {
        console.warn(message(msg));
    }
}

function message(msg) {
    return "[react-dom-html] " + msg;
}

// Use callback to create react elements after the main application is rendered
function resolveOptionalElement(element) {
    return !react.isValidElement(element) && typeof element === "function" ? element() : element;
}
function renderStaticOpeningTagFromElement(element) {
    var markup = server.renderToStaticMarkup(element);
    return markup.substring(0, markup.length - (element.type.length + 3));
}

function createAppContainerElement(rootElement, appContainerTagName) {
    var appContainerProps = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var id = appContainerProps.id,
        children = appContainerProps.children,
        appContainerAttributes = objectWithoutProperties(appContainerProps, ["id", "children"]);

    var _getAppContainerProps = getAppContainerProps(rootElement, {
        appContainerTagName: appContainerTagName,
        appContainerId: id
    }),
        tagName = _getAppContainerProps.tagName,
        containerId = _getAppContainerProps.id;

    return react.createElement(tagName, _extends({ id: containerId }, appContainerAttributes), children);
}

var VALID_ROOT_CHILD_TAGS = [HTML_TAG];
var VALID_HTML_CHILD_TAGS = [HEAD_TAG, BODY_TAG];

function resolveHtml(child, htmlState, options) {
    var _child$props = child.props,
        nestedChildren = _child$props.children,
        childProps = objectWithoutProperties(_child$props, ["children"]);

    htmlState.htmlElement = react.createElement(HTML_TAG, childProps);

    if (nestedChildren && react.Children.count(nestedChildren) > 0) {
        react.Children.forEach(nestedChildren, function (nestedChild) {
            htmlState = resolveHtmlElement(nestedChild, htmlState, VALID_HTML_CHILD_TAGS, options);
        });
    }

    return htmlState;
}

function resolveBody(child, htmlState, options) {
    var _child$props2 = child.props,
        nestedChildren = _child$props2.children,
        childProps = objectWithoutProperties(_child$props2, ["children"]);

    htmlState.bodyElement = react.createElement(BODY_TAG, childProps);

    var idx = 0;
    var hasResolvedAppContainer = false;
    htmlState.beforeAppContainerElement = [];
    htmlState.afterAppContainerElement = [];

    react.Children.forEach(nestedChildren, function (nestedChild) {
        if (nestedChild.type === APP_TAG) {
            resolveApp(nestedChild, htmlState, options);
            hasResolvedAppContainer = true;
        } else if (!hasResolvedAppContainer) {
            htmlState.beforeAppContainerElement.push(react.cloneElement(nestedChild, { key: idx++ }));
        } else {
            htmlState.afterAppContainerElement.push(react.cloneElement(nestedChild, { key: idx++ }));
        }
    });

    return htmlState;
}

function resolveApp(child, htmlState, options) {
    // does <app> permit children?
    var _child$props3 = child.props,
        nestedChildren = _child$props3.children,
        childProps = objectWithoutProperties(_child$props3, ["children"]);

    var allowedChildren = options.allowAppContainerChildren;
    if (!allowedChildren && react.Children.count(nestedChildren) !== 0) {
        throw new Error(message("<app> does not support the use of children."));
    }

    // Do not set "id" value on <app>
    if (typeof childProps.id !== "undefined") {
        warn("Setting 'id=\"" + childProps.id + "\"' on the <app> tag may have unintended consequences. You should set the \"id\" before initial render.");
    }

    // Only assign the props here
    htmlState.appContainerProps = childProps;
    if (allowedChildren && nestedChildren) {
        htmlState.appContainerProps.children = nestedChildren;
    }

    return htmlState;
}

function resolveHead(child, htmlState) {
    // <head> keeps it children for rendering
    htmlState.headElement = child;
    return htmlState;
}

function resolveHtmlElement(children, htmlState, validTagNames, options) {
    var child = react.Children.only(children);
    var childType = child.type;

    if (validTagNames.indexOf(childType) !== -1) {
        if (childType === HTML_TAG) {
            return resolveHtml(child, htmlState, options);
        }

        if (childType === HEAD_TAG) {
            return resolveHead(child, htmlState);
        }

        if (childType === BODY_TAG) {
            return resolveBody(child, htmlState, options);
        }
    }

    throw new Error(message("Invalid html markup, tag \"" + childType + "\" is not supported in its current position."));
}

function assignOptions(defaultOptions, options) {
    var definedOptions = Object.keys(options).reduce(function (opts, key) {
        var optionValue = options[key];
        if (typeof optionValue !== "undefined" && options.hasOwnProperty(key)) {
            opts[key] = optionValue;
        }

        return opts;
    }, {});

    return Object.assign({}, defaultOptions, definedOptions);
}

var defaultElements = {
    htmlElement: react.createElement(HTML_TAG),
    headElement: react.createElement(HEAD_TAG),
    bodyElement: react.createElement(BODY_TAG)
};

function mapOptionsToState(element, options) {
    var html = options.html,
        appContainerTagName = options.appContainerTagName,
        htmlElements = options.htmlElements,
        allowAppContainerChildren = options.allowAppContainerChildren,
        otherOpts = objectWithoutProperties(options, ["html", "appContainerTagName", "htmlElements", "allowAppContainerChildren"]);

    // If a `html` element is provided, it takes priority

    if (html) {
        var htmlEl = resolveOptionalElement(html);
        invariant(react.isValidElement(htmlEl), "`html` is required to be a react element.");
        var opts = {
            allowAppContainerChildren: typeof allowAppContainerChildren === "boolean" ? allowAppContainerChildren : false
        };

        var _resolveHtmlElement = resolveHtmlElement(htmlEl, {}, VALID_ROOT_CHILD_TAGS, opts),
            appContainerProps = _resolveHtmlElement.appContainerProps,
            state = objectWithoutProperties(_resolveHtmlElement, ["appContainerProps"]);

        state.appContainerElement = createAppContainerElement(element, appContainerTagName, appContainerProps);

        if (typeof state.headElement === "undefined") {
            state.headElement = react.createElement(HEAD_TAG);
        }

        return assignOptions(defaultElements, _extends({}, otherOpts, state));
    }

    if (htmlElements) {
        var _ref = typeof htmlElements === "function" ? htmlElements() : htmlElements,
            htmlElement = _ref.htmlElement,
            bodyElement = _ref.bodyElement,
            headElement = _ref.headElement,
            appContainerElement = _ref.appContainerElement,
            beforeAppContainerElement = _ref.beforeAppContainerElement,
            afterAppContainerElement = _ref.afterAppContainerElement;

        return assignOptions(defaultElements, _extends({}, otherOpts, {
            htmlElement: htmlElement,
            bodyElement: bodyElement,
            headElement: headElement,
            beforeAppContainerElement: beforeAppContainerElement,
            afterAppContainerElement: afterAppContainerElement,
            appContainerElement: appContainerElement || createAppContainerElement(element, appContainerTagName)
        }));
    }

    return Object.assign({
        appContainerElement: createAppContainerElement(element, appContainerTagName)
    }, defaultElements, otherOpts);
}

function renderHtmlToString() {
    var element = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return renderString("renderHtmlToString", server.renderToString, false, element, options);
}

function renderHtmlToStaticMarkup() {
    var element = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return renderString("renderHtmlToStaticMarkup", server.renderToStaticMarkup, true, element, options);
}

function renderString(renderFunctionName, renderToFunc, isStaticMarkup, element, options) {
    // render the main element(s) first
    var appMarkup = renderToFunc(element);

    var _mapOptionsToState = mapOptionsToState(element, options),
        htmlElement = _mapOptionsToState.htmlElement,
        bodyElement = _mapOptionsToState.bodyElement,
        headElement = _mapOptionsToState.headElement,
        appContainerElement = _mapOptionsToState.appContainerElement,
        beforeAppContainerElement = _mapOptionsToState.beforeAppContainerElement,
        afterAppContainerElement = _mapOptionsToState.afterAppContainerElement;

    var openingHtmlTag = renderStaticOpeningTagFromElement(htmlElement);
    var openingBodyTag = renderStaticOpeningTagFromElement(bodyElement);
    var openingAppTag = renderStaticOpeningTagFromElement(appContainerElement);

    // The head may be assigned as a pre-rendered string
    var headTag = typeof headElement === "string" ? headElement : isStaticMarkup ? server.renderToStaticMarkup(headElement) : server.renderToString(headElement);
    var beforeAppContainerMarkup = beforeAppContainerElement ? server.renderToStaticMarkup(beforeAppContainerElement) : "";
    var afterAppContainerMarkup = afterAppContainerElement ? server.renderToStaticMarkup(afterAppContainerElement) : "";

    return "" + openingHtmlTag + headTag + openingBodyTag + beforeAppContainerMarkup + openingAppTag + appMarkup + "</" + appContainerElement.type + ">" + afterAppContainerMarkup + "</body></html>";
}

var HtmlReadable = function (_Readable) {
    inherits(HtmlReadable, _Readable);

    function HtmlReadable(element, isStaticMarkup) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        classCallCheck(this, HtmlReadable);

        var _mapOptionsToState = mapOptionsToState(element, options),
            htmlElement = _mapOptionsToState.htmlElement,
            bodyElement = _mapOptionsToState.bodyElement,
            headElement = _mapOptionsToState.headElement,
            appContainerElement = _mapOptionsToState.appContainerElement,
            beforeAppContainerElement = _mapOptionsToState.beforeAppContainerElement,
            afterAppContainerElement = _mapOptionsToState.afterAppContainerElement,
            streamOptions = objectWithoutProperties(_mapOptionsToState, ["htmlElement", "bodyElement", "headElement", "appContainerElement", "beforeAppContainerElement", "afterAppContainerElement"]);

        var _this = possibleConstructorReturn(this, (HtmlReadable.__proto__ || Object.getPrototypeOf(HtmlReadable)).call(this, streamOptions));

        _this._isStaticMarkup = isStaticMarkup;
        _this._activeStream = null;
        _this._rootElement = element;
        _this._htmlElement = htmlElement;
        _this._headElement = headElement;
        _this._bodyElement = bodyElement;
        _this._beforeAppContainerElement = beforeAppContainerElement;
        _this._afterAppContainerElement = afterAppContainerElement;
        _this._appContainerElement = appContainerElement;

        // All other props must be set before invoking _getReaders()
        _this._readers = _this._getReaders();
        return _this;
    }

    createClass(HtmlReadable, [{
        key: "_getReaders",
        value: function _getReaders() {
            var _this2 = this;

            var readers = [function (callback) {
                return _this2._readHtmlOpenTags(callback);
            }, function (callback) {
                return _this2._readHead(callback);
            }, function (callback) {
                return _this2._readBodyOpenTag(callback);
            }];

            if (this._beforeAppContainerElement) {
                readers.push(function (callback) {
                    return _this2._readStaticNodeStream(_this2._beforeAppContainerElement, callback);
                });
            }

            Array.prototype.push.apply(readers, [function (callback) {
                return _this2._readAppOpenTag(callback);
            }, function (callback) {
                return _this2._readHtmlApp(callback);
            }, function (callback) {
                return _this2._readAppCloseTag(callback);
            }]);

            if (this._afterAppContainerElement) {
                readers.push(function (callback) {
                    return _this2._readStaticNodeStream(_this2._afterAppContainerElement, callback);
                });
            }

            readers.push(function (callback) {
                return _this2._readHtmlCloseTags(callback);
            });
            return readers;
        }
    }, {
        key: "_read",
        value: function _read() {
            var _this3 = this;

            // ignore the size argument
            // the internal streams can write until internal buffer is full
            this._readNext(this._readers, function () {
                _this3._signalComplete();
            });
        }
    }, {
        key: "_readNext",
        value: function _readNext(readers, callback) {
            var _this4 = this;

            if (readers.length === 0) {
                // all readers have been read
                return callback();
            }

            if (this._activeStream) {
                // resume the active streamResponse
                return this._activeStream.resume();
            }

            var writer = readers.shift();
            writer(function (pushNext) {
                if (pushNext) {
                    // Continue reading chunks
                    _this4._readNext(readers, callback);
                }
            });
        }
    }, {
        key: "_readHtmlOpenTags",
        value: function _readHtmlOpenTags(callback) {
            this._pushMarkup(renderStaticOpeningTagFromElement(this._htmlElement), callback);
        }
    }, {
        key: "_readHead",
        value: function _readHead(callback) {
            if (typeof this._headElement === "string") {
                // The head has been pre-rendered and assigned as a string
                return this._pushMarkup(this._headElement, callback);
            }

            // Document head(s) can be large, use a stream to render the head
            if (this._isStaticMarkup) {
                return this._readStaticNodeStream(this._headElement, callback);
            }

            this._readNodeStream(this._headElement, callback);
        }
    }, {
        key: "_readBodyOpenTag",
        value: function _readBodyOpenTag(callback) {
            this._pushMarkup(renderStaticOpeningTagFromElement(this._bodyElement), callback);
        }
    }, {
        key: "_readAppOpenTag",
        value: function _readAppOpenTag(callback) {
            this._pushMarkup(renderStaticOpeningTagFromElement(this._appContainerElement), callback);
        }
    }, {
        key: "_readAppCloseTag",
        value: function _readAppCloseTag(callback) {
            this._pushMarkup("</" + this._appContainerElement.type + ">", callback);
        }
    }, {
        key: "_readHtmlApp",
        value: function _readHtmlApp(callback) {
            if (this._isStaticMarkup) {
                return this._readStaticNodeStream(this._rootElement, callback);
            }

            this._readNodeStream(this._rootElement, callback);
        }
    }, {
        key: "_readHtmlCloseTags",
        value: function _readHtmlCloseTags(callback) {
            this._pushMarkup("</body></html>", callback);
        }
    }, {
        key: "_signalComplete",
        value: function _signalComplete() {
            // Signal complete
            this.push(null);
        }
    }, {
        key: "_pushChunk",
        value: function _pushChunk(chunk, encoding) {
            return this.push(chunk, encoding);
        }
    }, {
        key: "_pushMarkup",
        value: function _pushMarkup(markup, callback) {
            if (!this._pushChunk(markup, "utf8")) {
                return callback(false);
            }

            callback(true);
        }
    }, {
        key: "_emitError",
        value: function _emitError(err) {
            this.emit("error", err);
        }
    }, {
        key: "_readNodeStream",
        value: function _readNodeStream(element, callback) {
            var stream$$1 = this._activeStream = server.renderToNodeStream(element);
            this._readStream(stream$$1, callback);
        }
    }, {
        key: "_readStaticNodeStream",
        value: function _readStaticNodeStream(element, callback) {
            var stream$$1 = this._activeStream = server.renderToStaticNodeStream(element);
            this._readStream(stream$$1, callback);
        }
    }, {
        key: "_readStream",
        value: function _readStream(stream$$1, callback) {
            var _this5 = this;

            stream$$1.on("error", function (err) {
                // the 'error' event ends the streamResponse - the 'end' event will not fire.
                _this5._emitError(err);
            });
            stream$$1.on("end", function () {
                _this5._activeStream = null;
                callback(true);
            });
            stream$$1.on("data", function (chunk) {
                if (!_this5._pushChunk(chunk)) {
                    return callback(false);
                }

                callback(true);
            });
        }
    }]);
    return HtmlReadable;
}(stream.Readable);

function renderHtmlToNodeStream() {
    var element = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return renderToStream("renderHtmlToStaticNodeStream", false, element, options);
}

function renderHtmlToStaticNodeStream() {
    var element = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return renderToStream("renderHtmlToStaticNodeStream", true, element, options);
}

function renderToStream(renderFunctionName, isStaticMarkup, element, options) {
    return new HtmlReadable(element, isStaticMarkup, options);
}

exports.HTML5_DOCTYPE = HTML5_DOCTYPE;
exports.renderHtmlToString = renderHtmlToString;
exports.renderHtmlToStaticMarkup = renderHtmlToStaticMarkup;
exports.renderHtmlToNodeStream = renderHtmlToNodeStream;
exports.renderHtmlToStaticNodeStream = renderHtmlToStaticNodeStream;
