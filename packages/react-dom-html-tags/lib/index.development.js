/*
 * Copyright 2018 @adam-26.
 * Copyrights licensed under the MIT License.
 * See the accompanying LICENSE file for terms.
 */

'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);
var invariant = _interopDefault(require('invariant'));
var ReactDOM = require('react-dom');
var ReactDOM__default = _interopDefault(ReactDOM);
var reactDomHtml = require('react-dom-html');
require('react-dom/server');
var getDisplayName = _interopDefault(require('react-display-name'));
var hoistNonReactStatic = _interopDefault(require('hoist-non-react-statics'));

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

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

var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

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

var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

var IS_DEV = "development" !== "production";

// TODO: Rename the attribute? value can be true/false (before/after main hydrate usage + it can be used for external on normal client render)
var HTML_TAGS_HYDRATE_ATTR = "data-react-dom-html-tags";

function message(msg) {
    return "[react-dom-html-tags] " + msg;
}

function warn(msg) {
    if (IS_DEV) {
        // eslint-disable-next-line no-console
        console.warn(message(msg));
    }
}

function error(msg) {
    if (IS_DEV) {
        // eslint-disable-next-line no-console
        console.error(message(msg));
    }
}

function forEachQuerySelectorAll(domNode, selector, eachCallback) {
    var nodes = domNode.querySelectorAll(selector);
    if (!nodes || nodes.length === 0) {
        return;
    }

    for (var i = 0, len = nodes.length; i < len; i++) {
        eachCallback(nodes[i]);
    }
}

function getDomElementAttributeNames(domElement) {
    if (typeof domElement.getAttributeNames === "function") {
        return domElement.getAttributeNames();
    }

    // TODO: Test this works in IE
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttributeNames
    var attributes = domElement.attributes;
    var length = attributes.length;
    var result = new Array(length);
    for (var i = 0; i < length; i++) {
        result[i] = attributes[i].name;
    }

    return result;
}

function reduceAttributes() {
    var attributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var defaultValues = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return Object.keys(attributes).reduce(function (renderAttributes, attributeName) {
        var attributeValues = attributes[attributeName];
        renderAttributes[attributeName] = Array.isArray(attributeValues) ? attributeValues.join(" ") : attributeValues;

        return renderAttributes;
    }, defaultValues);
}

function reduceAttributesToString() {
    var attributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return Object.keys(attributes).reduce(function (str, attributeName) {
        var attributeValue = attributes[attributeName];
        if (typeof attributeValue === "undefined") {
            return str;
        }

        return str + " " + attributeName + "=\"" + attributeValue + "\"";
    }, "");
}

function renderForError(elementName, _ref) {
    var children = _ref.children,
        attributes = objectWithoutProperties(_ref, ["children"]);

    var attrString = reduceAttributesToString(attributes, true);
    if (children) {
        return "<" + elementName + attrString + ">" + children + "</" + elementName + ">";
    }

    return "<" + elementName + attrString + " />";
}

var HEAD_TAG_NAMES = {
    BASE: "base",
    LINK: "link",
    META: "meta",
    NOSCRIPT: "noscript",
    SCRIPT: "script",
    STYLE: "style",
    TITLE: "title",
    TEMPLATE: "template"
};

var HTML_CHILD_TAG_NAMES = {
    BODY: "body",
    HEAD: "head",
    APP: "app" // special-case: used to style the application container
};

var TAG_NAMES = _extends({
    HTML: "html"
}, HTML_CHILD_TAG_NAMES, HEAD_TAG_NAMES);

var ATTRIBUTE_KEY_NAMES = {
    HTML: "htmlAttributes",
    HEAD: "headAttributes",
    BODY: "bodyAttributes",
    APP: "appAttributes"
};

var ATTRIBUTE_KEYS = Object.keys(ATTRIBUTE_KEY_NAMES).map(function (key) {
    return ATTRIBUTE_KEY_NAMES[key];
});

var ELEMENT_ATTRIBUTE_TUPLES = [[TAG_NAMES.HTML, ATTRIBUTE_KEY_NAMES.HTML], [TAG_NAMES.HEAD, ATTRIBUTE_KEY_NAMES.HEAD], [TAG_NAMES.BODY, ATTRIBUTE_KEY_NAMES.BODY], [TAG_NAMES.APP, ATTRIBUTE_KEY_NAMES.APP]];

var TITLE_TEMPLATE = "titleTemplate";

var NON_TAG_KEYS = ATTRIBUTE_KEYS.concat([TITLE_TEMPLATE]);

var HTML_CHILD_TAG_KEYS = Object.keys(HTML_CHILD_TAG_NAMES).map(function (key) {
    return HTML_CHILD_TAG_NAMES[key];
});

var HEAD_TAG_KEYS = Object.keys(HEAD_TAG_NAMES).map(function (key) {
    return HEAD_TAG_NAMES[key];
});

var IS_DEV$1 = "development" !== "production";

var TITLE_PLACEHOLDER = "[title]";

var NON_DETERMINISTIC_HELP_URL = "https://github.com/adam-26/react-dom-html/blob/master/docs/NON-DETERMINISTIC_HELP.md";

var HtmlContext = function () {
    function HtmlContext(parent) {
        classCallCheck(this, HtmlContext);

        this._parent = parent;
        this._children = [];
        this._forceUpdateCallback = null;
        this._nonDeterministicElements = [];

        // State of HTML elements defined by the wrapped component
        this._ownComponentState = null;

        // Resolved state of all children components
        this._childrenComponentState = null;

        // State of resolving childrenComponentState with ownComponentState
        // - merged state "sideway"; ownState with childrenState from context
        this._resolvedComponentState = null;
    }

    createClass(HtmlContext, [{
        key: "isServerStringRender",
        value: function isServerStringRender() {
            return this._parent.isServerStringRender();
        }
    }, {
        key: "isPreLoaded",
        value: function isPreLoaded() {
            return this._parent.isPreLoaded();
        }
    }, {
        key: "isServerRender",
        value: function isServerRender() {
            return this._parent.isServerRender();
        }
    }, {
        key: "createChildContext",
        value: function createChildContext() {
            return new HtmlContext(this);
        }
    }, {
        key: "hasChildren",
        value: function hasChildren() {
            return this._children.length !== 0;
        }
    }, {
        key: "registerForceUpdateCallback",
        value: function registerForceUpdateCallback(forceUpdateCallback) {
            var _this = this;

            if (forceUpdateCallback) {
                this._forceUpdateCallback = forceUpdateCallback;
                return function () {
                    // Callback can be used during testing
                    _this._forceUpdateCallback = null;
                };
            }
        }
    }, {
        key: "unregisterForceUpdateCallback",
        value: function unregisterForceUpdateCallback() {
            if (this._forceUpdateCallback) {
                // Ensure the callback ref is removed
                this._forceUpdateCallback = null;
            }
        }
    }, {
        key: "htmlComponentDidMount",
        value: function htmlComponentDidMount(forceUpdateCallback) {
            this._parent._children.push(this);
            this._clearProviderState();
            return this.registerForceUpdateCallback(forceUpdateCallback);
        }
    }, {
        key: "htmlComponentWillUnmount",
        value: function htmlComponentWillUnmount() {
            var idx = this._parent._children.indexOf(this);
            if (idx === -1) {
                if (IS_DEV$1) {
                    warn("Child failed to unregister with parent on componentWillUnmount.");
                }

                return;
            }

            // Remove the child provider
            this._parent._children.splice(idx, 1);
            this._parent = null;
            this._clearProviderState(); // TODO: Order...
            this.unregisterForceUpdateCallback(); // TODO: Ensure somewhere in this method, the parent(s) are invalidated
        }
    }, {
        key: "forceComponentUpdate",
        value: function forceComponentUpdate(updateCallback) {
            if (this._forceUpdateCallback) {
                // invoke the callback before the update to increase the update count
                // it returns a function to be used as the forceUpdate callback that
                // is invoked after the update is complete
                this._forceUpdateCallback(updateCallback());
                return true;
            }

            return false;
        }
    }, {
        key: "ignoreNonDeterministicHtml",
        value: function ignoreNonDeterministicHtml() {
            return this._parent.ignoreNonDeterministicHtml();
        }
    }, {
        key: "setHtmlState",
        value: function setHtmlState(htmlState) {
            var invalidateParentState = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            this._ownComponentState = htmlState;
            this._resolvedComponentState = null;
            // this._notifyParentOnChange();
            if (invalidateParentState) {
                // invalidate parent state, and re-render the HTML
                this._invalidateParentState(true); // TODO: To correctly render non-deterministic errors, don't ONLY reset _ownComponentState, assign it to an alternative var and use as backup when rendering the error message.
            }
        }

        // TODO: Rename -> _clearResolvedState()

    }, {
        key: "_clearProviderState",
        value: function _clearProviderState() {
            var refreshHtmlRender = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            if (IS_DEV$1) {
                // Clear existing non-deterministic elements
                this._nonDeterministicElements.splice(0, this._nonDeterministicElements.length);
            }

            this._childrenComponentState = null;
            this._resolvedComponentState = null;
            this._invalidateParentState(refreshHtmlRender);
        }

        // // TODO: Use a SINGLE notification methods with args?
        // // TODO: Update more descriptive name - what is the notification about?
        // _notifyParentOnChange(): void {
        //     if (this._parent) {
        //         this._parent._notifyParentOnChange();
        //     }
        // }

        // Notify the parent the render has resulted in non-deterministic html

    }, {
        key: "notifyParentOnError",
        value: function notifyParentOnError() {
            if (this._parent) {
                this._parent.notifyParentOnError();
            }
        }

        // Attempts to resolve any non-deterministic html rendering errors

    }, {
        key: "resolveNonDeterministicErrors",
        value: function resolveNonDeterministicErrors(callback) {
            // TODO: Test this logic, may need to walk entire tree to all leaf nodes?
            if (this._isNonDeterministic()) {
                this._clearProviderState();
                if (this.forceComponentUpdate(callback)) {
                    // force update here should also force all children to update
                    return;
                }
            }

            // No "forceUpdate" function here - attempt to update children
            this._children.forEach(function (child) {
                child.resolveNonDeterministicErrors(callback);
            });
        }

        // Notify the parent that it needs to invalidate any cached child state

    }, {
        key: "_invalidateParentState",
        value: function _invalidateParentState() {
            var refreshHtmlRender = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            if (this._parent) {
                this._parent._clearProviderState(refreshHtmlRender);
            }
        }
    }, {
        key: "resolveHtmlState",
        value: function resolveHtmlState() {
            var displayNonDeterministicWarnings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            if (this._resolvedComponentState === null) {
                var childState = this._resolveChildHtmlState(displayNonDeterministicWarnings);
                this._resolvedComponentState = this._ownComponentState === null ? childState : this._mergeResolvedState(this._ownComponentState, childState, false);
            }

            return this._resolvedComponentState;
        }

        // resolve all child state to a single Object

    }, {
        key: "_resolveChildHtmlState",
        value: function _resolveChildHtmlState() {
            var _this2 = this;

            var displayNonDeterministicWarnings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            if (this._childrenComponentState === null) {
                var childProviderLen = this._children.length;
                if (childProviderLen === 0) {
                    this._childrenComponentState = {};
                } else if (childProviderLen === 1) {
                    this._childrenComponentState = this._children[0].resolveHtmlState(displayNonDeterministicWarnings);
                } else {
                    this._childrenComponentState = this._children.reduce(function (resolved, child) {
                        return _this2._mergeResolvedState(resolved, child.resolveHtmlState(displayNonDeterministicWarnings), displayNonDeterministicWarnings);
                    }, {});

                    // Renders can only be non-deterministic when multiple children exist
                    if (IS_DEV$1) {
                        if (this._isNonDeterministic()) {
                            this._logNonDeterministicWarnings();
                        }
                    }
                }
            }

            if (IS_DEV$1) {
                // Non-Deterministic errors can only occur when resolving siblings (multiple children)
                // - initial renders always resolve correctly - this will never be invoked during a server render
                if (this._isNonDeterministic()) {
                    if (!this.ignoreNonDeterministicHtml()) {
                        // Notify the parent, not self
                        this._parent.notifyParentOnError();
                    }
                }
            }

            return this._childrenComponentState;
        }
    }, {
        key: "_isNonDeterministic",
        value: function _isNonDeterministic() {
            return this._nonDeterministicElements.length !== 0;
        }

        // TODO: Most of these can be static

    }, {
        key: "_mergeResolvedState",
        value: function _mergeResolvedState() {
            var parent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var child = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var displayNonDeterministicWarnings = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var mergedState = {};
            this._mergeTitleTemplate(mergedState, parent, child, displayNonDeterministicWarnings);
            this._mergeAttributes(mergedState, ELEMENT_ATTRIBUTE_TUPLES, parent, child, displayNonDeterministicWarnings, ["className"]); // TODO: last prop -> CONST
            this._mergeElements(mergedState, HEAD_TAG_KEYS, parent, child, displayNonDeterministicWarnings);
            return mergedState;
        }
    }, {
        key: "_mergeTitleTemplate",
        value: function _mergeTitleTemplate(mergedState, parent, child, displayNonDeterministicWarnings) {
            var hasParentTemplate = !!parent[TITLE_TEMPLATE];
            var hasChildTemplate = !!child[TITLE_TEMPLATE];

            if (hasParentTemplate || hasChildTemplate) {
                // Create an array of templates - reduce when rendering the title text
                mergedState[TITLE_TEMPLATE] = hasParentTemplate ? parent[TITLE_TEMPLATE].slice() : [];

                if (hasChildTemplate) {
                    Array.prototype.push.apply(mergedState[TITLE_TEMPLATE], child[TITLE_TEMPLATE]);
                }

                if (IS_DEV$1) {
                    /*
                     * This code will not run in production
                     */

                    if (displayNonDeterministicWarnings && hasParentTemplate && hasChildTemplate) {
                        this._flagNonDeterministic(TAG_NAMES.TITLE, TITLE_TEMPLATE, ["template"]); // TODO: is last prop required here?
                    }
                }
            }
        }
    }, {
        key: "_mergeAttributes",
        value: function _mergeAttributes(mergedState, tagTuples, parent, child, displayNonDeterministicWarnings) {
            var _this3 = this;

            var ignoreWarningKeys = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : [];

            tagTuples.forEach(function (_ref) {
                var _ref2 = slicedToArray(_ref, 2),
                    elementName = _ref2[0],
                    attributeKey = _ref2[1];

                if (parent[attributeKey] || child[attributeKey]) {
                    mergedState[attributeKey] = _this3._mergeAttribute(mergedState, parent[attributeKey], child[attributeKey], elementName, attributeKey, displayNonDeterministicWarnings, ignoreWarningKeys);
                }
            });
        }
    }, {
        key: "_mergeElements",
        value: function _mergeElements(mergedState, tagNames, parent, child, displayNonDeterministicWarnings) {
            var _this4 = this;

            var ignoreWarningKeys = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : [];

            tagNames.forEach(function (tagName) {
                if (parent[tagName] || child[tagName]) {
                    mergedState[tagName] = _this4._mergeElement(mergedState, parent[tagName], child[tagName], tagName, displayNonDeterministicWarnings, ignoreWarningKeys);
                }
            });
        }
    }, {
        key: "_mergeAttribute",
        value: function _mergeAttribute(mergedState, parentElement, childElement, elementName, attributeKey, displayNonDeterministicWarnings, ignoreWarningKeys) {
            if (IS_DEV$1) {
                /*
                 * This code will not run in production
                 */

                if (displayNonDeterministicWarnings) {
                    if (parentElement && childElement) {
                        var uniquePropNames = getUniquePropNames(parentElement, childElement);

                        // Determine if there are any conflicting props
                        var nonDeterministicPropNames = uniquePropNames.reduce(function (propNames, uniqueKey) {
                            if (ignoreWarningKeys.indexOf(uniqueKey) !== -1) {
                                // ignore the key
                                return propNames;
                            }

                            if (!isUndefined(parentElement[uniqueKey]) && !isUndefined(childElement[uniqueKey])) {
                                propNames.push(uniqueKey);
                            }

                            return propNames;
                        }, []);

                        if (nonDeterministicPropNames.length !== 0) {
                            this._flagNonDeterministic(elementName, attributeKey, nonDeterministicPropNames);
                        }
                    }
                }
            }

            // "className" attributes need to be appended
            var hasParentClassNames = parentElement && Array.isArray(parentElement.className);
            var hasChildClassNames = childElement && Array.isArray(childElement.className);

            if (hasParentClassNames || hasChildClassNames) {
                var _ref3 = parentElement || {},
                    parentClassName = _ref3.className,
                    parentAttributes = objectWithoutProperties(_ref3, ["className"]);

                var _ref4 = childElement || {},
                    childClassName = _ref4.className,
                    childAttributes = objectWithoutProperties(_ref4, ["className"]);

                return _extends({}, this._mergeTag(parentAttributes, childAttributes), {
                    className: hasParentClassNames && hasChildClassNames ? // Combine parent &child className(s), without duplicates
                    childClassName.reduce(function (classNames, className) {
                        if (classNames.indexOf(className) === -1) {
                            classNames.push(className);
                        }

                        return classNames;
                    }, parentClassName.slice()) : // Only parent classNames
                    parentClassName && parentClassName.slice() ||
                    // Only child classNames
                    childClassName && childClassName.slice()
                });
            }

            return this._mergeTag(parentElement, childElement);
        }
    }, {
        key: "_mergeElement",
        value: function _mergeElement(mergedState, parentElement, childElement, elementName, displayNonDeterministicWarnings, ignoreWarningKeys) {
            var _this5 = this;

            if (IS_DEV$1) {
                /*
                 * This code will not run in production
                 */

                if (displayNonDeterministicWarnings) {
                    if (parentElement && childElement) {
                        var uniquePropNames = getUniquePropNames(parentElement, childElement);

                        // Determine the prop that are non-deterministic
                        uniquePropNames.forEach(function (propName) {
                            if (ignoreWarningKeys.indexOf(propName) !== -1) {
                                // ignore the key
                                return;
                            }

                            if (!isUndefined(parentElement[propName]) && !isUndefined(childElement[propName])) {
                                var valuePropName = propName === elementName ? CHILDREN : propName;
                                _this5._flagNonDeterministic(elementName, propName, [valuePropName]);
                            }
                        });
                    }
                }
            }

            return this._mergeTag(parentElement, childElement);
        }
    }, {
        key: "_mergeTag",
        value: function _mergeTag(parentElement, childElement) {
            return Object.assign({}, parentElement || {}, childElement || {});
        }

        // ==========================================================================
        // ========== Functions below this line are NOT used in PRODUCTION ==========
        // ==========================================================================

        // Walks the html tree, to determine the non-deterministic error(s) sibling(s)

    }, {
        key: "resolveNonDeterministicChildren",
        value: function resolveNonDeterministicChildren(type, key, propNames) {
            var _this6 = this;

            // Ensure all state is resolved before attempting to render a descriptive error message
            // this.resolveHtmlState(false);

            // TODO: Why are error messages rendered when no component is currently registered with the context?
            // todo -> could this be avoided if non-deterministic errors were NOT rendered AFTER a "componentDidUnmount"???
            // todo    * if errors are rendered after unmount; it may be confusing for developers???
            // todo *** this CAN'T be done - must PREVENT errors being written during a FORCE-RENDER
            // todo *** - when this happens the written errors are NOT in a deterministic order (which adds more confusion)
            // const temporaryOwnState = this._ownComponentState || {};

            // render a developer-friendly error
            var errorNode = renderNonDeterministicNode(this._ownComponentState, type, key, propNames);

            var branch = [];
            var resolvedChildren = this._children.length === 0 ? {} : this._children.reduce(function (resolved, child) {
                var _child$resolveNonDete = child.resolveNonDeterministicChildren(type, key, propNames),
                    _child$resolveNonDete2 = slicedToArray(_child$resolveNonDete, 2),
                    previousNode = _child$resolveNonDete2[0],
                    childrenStates = _child$resolveNonDete2[1];

                if (previousNode[key]) {
                    branch = childrenStates.slice();
                }

                if (_this6._children.length === 1) {
                    return previousNode;
                }

                return _this6._mergeResolvedState(resolved, previousNode, false);
            }, {});

            branch.unshift(errorNode);
            return [this._mergeResolvedState(this._ownComponentState, resolvedChildren), branch];
        }
    }, {
        key: "_logNonDeterministicWarnings",
        value: function _logNonDeterministicWarnings() {
            var _this7 = this;

            // Log an error per non-deterministic element
            this._nonDeterministicElements.forEach(function (_ref5) {
                var _ref6 = slicedToArray(_ref5, 3),
                    elementType = _ref6[0],
                    elementKey = _ref6[1],
                    nonDeterministicPropNames = _ref6[2];

                var siblingBranches = [];
                _this7._children.forEach(function (child) {
                    var _child$resolveNonDete3 = child.resolveNonDeterministicChildren(elementType, elementKey, nonDeterministicPropNames),
                        _child$resolveNonDete4 = slicedToArray(_child$resolveNonDete3, 2),
                        _ = _child$resolveNonDete4[0],
                        childNodes = _child$resolveNonDete4[1];

                    siblingBranches.push("\n" + childNodes.join("  <-  "));
                });

                _this7._logNonDeterministicWarning(elementType, nonDeterministicPropNames, siblingBranches.join("\n"));
            });
        }
    }, {
        key: "_flagNonDeterministic",
        value: function _flagNonDeterministic(elementType, elementKey, nonDeterministicPropNames) {
            this._nonDeterministicElements.push([elementType, elementKey, nonDeterministicPropNames]);
        }
    }, {
        key: "_logNonDeterministicWarning",
        value: function _logNonDeterministicWarning(tagName, propNames, siblingValues) {
            var propName = propNames.join(", ");
            var propType = propNames.length === 1 ? "prop" : "props";
            var propTypePrefix = propNames.length === 1 ? " a " : " ";
            var tagDescriptor = "<" + tagName + "> \"" + propName + "\"";
            warn("WARNING: Non-deterministic " + tagDescriptor + " " + propType + ", " + // ie: title template attribute
            "this occurs in a client render during the react update lifecycle when " + ("two or more sibling html elements define" + propTypePrefix + tagDescriptor + " " + propType + ", ") + ("or sibling children define " + tagDescriptor + " props that resolve to parent html siblings. ") + ("The non-deterministic sibling branches are:\n\n" + siblingValues + "\n\n\n") + "Use the sibling branches to identify the non-deterministic components. " + ("For more information read " + NON_DETERMINISTIC_HELP_URL));
        }
    }]);
    return HtmlContext;
}();


var CHILDREN = "children";

function isUndefined(value) {
    return typeof value !== "undefined";
}

// TODO: Move to utils

function renderNonDeterministicNode(htmlState, type, key, propNames) {
    if (htmlState[key]) {
        // Elements and attributes store state differently - retrieve the required state
        var element = NON_TAG_KEYS.indexOf(key) === -1 ? htmlState[type][key].props // elements are stored as nested React elements
        : htmlState[key]; // attributes are stored as Objects in state

        if (key === TITLE_TEMPLATE) {
            // special-case
            if (Array.isArray(element) && element.length === 1) {
                return renderForError(type, { template: element[0](TITLE_PLACEHOLDER) });
            }

            return renderForError(type, { template: "[Invalid template]" });
        }

        return renderForError(type, propNames.reduce(function (props, propName) {
            if (typeof element[propName] !== "undefined") {
                props[propName] = element[propName];
            }

            return props;
        }, {}));
    }

    return "<>";
}

function getUniquePropNames(parentProps, childProps) {
    return Object.keys(childProps).reduce(function (keys, key) {
        if (keys.indexOf(key) === -1) {
            keys.push(key);
        }

        return keys;
    }, Object.keys(parentProps));
}

var IS_PROD = "development" === "production";

// TODO: Add any attributes that should be case-sensitive that react-dom/server does not correctly render
// TODO: Can this be MOVED to the SERVER directory?
// react-dom doesn't correctly case all attributes on the server
// for some attributes, this is problematic.
// export const SERVER_TAG_MAP = {
//     // server gets this wrong
//     charSet: "charset",
//
//     // required for google metadata
//     hrefLang: "hreflang",
//
//     // other micro-data
//     itemProp: "itemprop",
//     itemType: "itemtype",
//     itemRef: "itemref",
//     itemScope: "itemscope",
//     itemId: "itemid",
// };

// Use react props camel case
var REACT_PROP_NAMES = {
    CHARSET: "charSet",
    HTTPEQUIV: "httpEquiv",
    ITEM_PROP: "itemProp",
    NAME: "name",
    PROPERTY: "property",
    REL: "rel",
    SRC: "src",
    CANONICAL: "canonical",
    HREF: "href"
};

function resolveAttributes() {
    var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    if (Object.keys(props).length === 0) {
        return;
    }

    var className = props.className,
        attributes = objectWithoutProperties(props, ["className"]);

    if (className) {
        return _extends({}, attributes, {
            className: className.split(" ") // special-case; append class names
        });
    }

    return attributes;
}

function assignAttributes(target, tagName, props, options) {
    var attributeValues = resolveAttributes(props, options);
    if (attributeValues) {
        return _extends({}, target, defineProperty({}, tagName, attributeValues));
    }

    return target;
}

function resolveHtml(child, htmlState, options) {
    var _child$props = child.props,
        nestedChildren = _child$props.children,
        childProps = objectWithoutProperties(_child$props, ["children"]);

    if (nestedChildren && React.Children.count(nestedChildren) > 0) {
        React.Children.forEach(nestedChildren, function (nestedChild) {
            htmlState = resolveHtmlElements(nestedChild, htmlState, options);
        });
    }

    return assignAttributes(htmlState, ATTRIBUTE_KEY_NAMES.HTML, childProps, options);
}

function resolveBody(child, htmlState, options) {
    var _child$props2 = child.props,
        nestedChildren = _child$props2.children,
        childProps = objectWithoutProperties(_child$props2, ["children"]);

    var childCount = React.Children.count(nestedChildren);

    // <body> permits a single child, and must be type <app(Container)>
    if (childCount === 1) {
        htmlState = resolveApp(nestedChildren, htmlState, options);
    } else if (childCount !== 0) {
        throw new Error("<body> is only permitted to have a single child, <app>.");
    }

    return assignAttributes(htmlState, ATTRIBUTE_KEY_NAMES.BODY, childProps, options);
}

function resolveApp(child, htmlState, options) {
    // <app> does not permit children
    var _child$props3 = child.props,
        nestedChildren = _child$props3.children,
        childProps = objectWithoutProperties(_child$props3, ["children"]);

    if (!options.permitAppChildren && React.Children.count(nestedChildren) !== 0) {
        throw new Error("<app> does not support the use of children.");
    }

    // Do not set "id" value on <app>
    if (typeof childProps.id !== "undefined") {
        warn("Setting 'id=\"" + childProps.id + "\"' on the <app> tag may have unintended consequences. You should set the \"id\" before initial render.");
    }

    return assignAttributes(htmlState, "appAttributes", childProps, options);
}

function isAttributeEqualTo(props, attributeName, lowerCaseValue) {
    var attributeValue = props[attributeName];
    return typeof attributeValue !== "undefined" && attributeValue.toLowerCase() === lowerCaseValue;
}

var LINK_KEY_ATTRIBUTES = [REACT_PROP_NAMES.REL, REACT_PROP_NAMES.ITEM_PROP, REACT_PROP_NAMES.HREF];

var META_KEY_ATTRIBUTES = [REACT_PROP_NAMES.NAME, REACT_PROP_NAMES.HTTPEQUIV, REACT_PROP_NAMES.PROPERTY, REACT_PROP_NAMES.ITEM_PROP];

function getKeySuffix(props, keyAttributes, tagName) {
    var suffix = "";
    for (var i = 0, len = keyAttributes.length; i < len; i++) {
        var keyAttribute = keyAttributes[i];
        var attributeValue = props[keyAttribute];
        if (attributeValue) {
            suffix += keyAttribute + "=" + attributeValue;
        }
    }

    if (suffix === "") {
        throw new Error(message("Html <head> contain invalid <" + tagName + "> tag, " + ("one of the primary props is required: " + keyAttributes.join(", "))));
    }

    return suffix;
}

function getKey(prefix) {
    var suffix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var applyHashCode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    if (!suffix) {
        return prefix;
    }

    return prefix + ":" + (applyHashCode ? hashCode(suffix) : suffix);
}

// Keys CAN be used to determine if tags are considered to be the "same" / define the same data
// - this simplifies appending and merging tags
function assignKey(type, props) {
    if (TAG_NAMES.BASE === type) {
        // Only a single 'base' tag is permitted per document
        return getKey(type);
    }

    if (TAG_NAMES.LINK === type) {
        return getKey(type, isAttributeEqualTo(props, REACT_PROP_NAMES.REL, REACT_PROP_NAMES.CANONICAL) ? // only a single <link rel="canonical" .../> tag is permitted per document
        REACT_PROP_NAMES.CANONICAL : // all other link tags can be appended - get key suffix
        getKeySuffix(props, LINK_KEY_ATTRIBUTES, type));
    }

    if (TAG_NAMES.META === type) {
        return getKey(type, typeof props[REACT_PROP_NAMES.CHARSET] !== "undefined" ? // Only a single "charset" metatag is permitted per document
        REACT_PROP_NAMES.CHARSET : getKeySuffix(props, META_KEY_ATTRIBUTES, type));
    }

    if (TAG_NAMES.TEMPLATE === type) {
        var id = props.id;

        if (typeof id !== "string" || id.length === 0) {
            warn("<template> requires an `id` attribute.");
        }

        return getKey(type, id || "");
    }

    throw new Error(message("\"<" + type + ">\" tag is not a valid \"<head>\" child element. Valid child tag names are: \"" + HEAD_TAG_KEYS.join('", "') + "\"."));
}

function hashCode(value) {
    // TODO: May need to set a max number of characters to hash, to avoid very long strings from causing performance problems
    // https://stackoverflow.com/questions/6122571/simple-non-secure-hash-function-for-javascript
    var hash = 0;
    for (var i = 0, len = value.length; i < len; i++) {
        var char = value.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    return hash;
}

function mapDangerouslySetToState(typeName, typeState, element) {
    var _element$props = element.props,
        children = _element$props.children,
        dangerouslySetInnerHTML = _element$props.dangerouslySetInnerHTML;


    if (!IS_PROD) {
        if (typeof children !== "undefined") {
            warn("<" + typeName + "> can not define 'dangerouslySetInnerHTML' and 'children' props.");
        }
    }

    var key = getKey(typeName, dangerouslySetInnerHTML.__html, true);
    return assignState(typeName, typeState, key, React.cloneElement(element, { key: key }));
}

var SCRIPT = TAG_NAMES.SCRIPT;

function assertPropOrDangerouslySet(tagName, propName, propValue, expectedType) {
    if (typeof propValue === "undefined") {
        throw new Error("<" + tagName + "> expects a 'dangerouslySetInnerHTML' or '" + propName + "' prop.");
    }

    if (expectedType && (typeof propValue === "undefined" ? "undefined" : _typeof(propValue)) !== expectedType) {
        throw new Error("<" + tagName + "> expects '" + propName + "' to be a '" + expectedType + "' type.");
    }
}

function isDangerouslySetDefined(element) {
    return typeof element.props.dangerouslySetInnerHTML !== "undefined";
}

function mapScriptToState(element, scriptState) {
    var src = element.props.src;

    if (isDangerouslySetDefined(element)) {
        return mapDangerouslySetToState(SCRIPT, scriptState, element);
    }

    assertPropOrDangerouslySet(SCRIPT, REACT_PROP_NAMES.SRC, src, "string");

    var key = getKey(SCRIPT, src);
    assignState(SCRIPT, scriptState, key, React.cloneElement(element, { key: key }));
}

var STYLE = TAG_NAMES.STYLE;

function mapStyleToState(element, styleState) {
    var _element$props2 = element.props,
        children = _element$props2.children,
        styleProps = objectWithoutProperties(_element$props2, ["children"]);


    if (isDangerouslySetDefined(element)) {
        return mapDangerouslySetToState(STYLE, styleState, element);
    }

    assertPropOrDangerouslySet(STYLE, "children", children, "string");

    var key = getKey(STYLE, children, true);
    return assignState(STYLE, styleState, key, React.createElement(STYLE, _extends({}, styleProps, {
        key: key,
        dangerouslySetInnerHTML: { __html: children.trim() }
    })));
}

var NOSCRIPT = TAG_NAMES.NOSCRIPT;

function mapNoScriptToState(element, noScriptState, options) {
    var children = element.props.children;

    if (isDangerouslySetDefined(element)) {
        return mapDangerouslySetToState(NOSCRIPT, noScriptState, element);
    }

    assertPropOrDangerouslySet(NOSCRIPT, "children", children);

    if (typeof children !== "string") {
        if (!IS_PROD) {
            invariant(React.isValidElement(children), "Html head <noscript> element only accepts a string or a react component as children.");
        }

        if (options.isServerRender) {
            warn("<noscript> requires children to be a string to hydrate correctly on the client. " + "You can follow the react issue at https://github.com/facebook/react/issues/11423.");
        }

        // https://www.w3.org/TR/html5/scripting-1.html#the-noscript-element
        // only link, style and meta tags permitted as children of <noscript> in the <head>
        // Map the <noscript> children while maintaining child element order.
        var childState = {};
        var childKeys = [];
        React.Children.forEach(children, function (child) {
            var type = child.type;
            if (type === STYLE) {
                return childKeys.push(mapStyleToState(child, childState));
            }

            if (type === TAG_NAMES.LINK || type === TAG_NAMES.META) {
                return childKeys.push(mapElementToState(type, child, childState));
            }

            throw new Error(message("Element <" + type + "> is not permitted to be a child of <" + NOSCRIPT + "> " + ("when in the document <" + TAG_NAMES.HEAD + ">.")));
        });

        // Reduce the nested children
        var _key = "";
        var noScriptKids = childKeys.reduce(function (nestedChildren, childKey) {
            // append the child element key
            _key += childKey;

            // append the child element
            nestedChildren.push(childState[childKey]);
            return nestedChildren;
        }, []);

        return assignState(NOSCRIPT, noScriptState, _key, React.createElement(NOSCRIPT, {
            key: _key
        }, noScriptKids));
    }

    // noscript children is a string
    var _element$props3 = element.props,
        stringScript = _element$props3.children,
        noScriptProps = objectWithoutProperties(_element$props3, ["children"]);

    var key = getKey(NOSCRIPT, stringScript, true);
    assignState(NOSCRIPT, noScriptState, key, React.createElement(NOSCRIPT, _extends({}, noScriptProps, {
        key: key,
        dangerouslySetInnerHTML: { __html: stringScript }
    })));
}

var TITLE = TAG_NAMES.TITLE;
function mapTitleToState(element, titleState, htmlState) {
    var _element$props4 = element.props,
        titleText = _element$props4.children,
        template = _element$props4.template,
        titleAttributes = objectWithoutProperties(_element$props4, ["children", "template"]);

    if (typeof template === "function") {
        htmlState[TITLE_TEMPLATE] = [template];
    } else if (typeof template !== "undefined") {
        throw new Error(message("title template expects a function."));
    }

    // Only a single 'title' tag is permitted per document - always use the same KEY value
    assignState(TITLE, titleState, TITLE, React.createElement(TITLE, _extends({}, titleAttributes, {
        key: titleText
    }), titleText));
}

function assignState(tagName, state, key, element) {
    // Use key(s) to determine if there are any conflicting html elements
    if (!IS_PROD) {
        if (Object.keys(state).indexOf(key) !== -1) {
            warn("<head> includes conflicting <" + tagName + "> tags that will result in only the last element " + ("being rendered. The conflicting element is: " + renderForError(tagName, element.props)));
        }
    }

    state[key] = element;
    return key;
}

function mapElementToState(childType, child, typeState) {
    // all other elements use the original React element for rendering
    var key = assignKey(childType, child.props);
    return assignState(childType, typeState, key, React.cloneElement(child, { key: key }));
}

function resolveHead(child, htmlState, options) {
    var allowProps = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
    var _child$props4 = child.props,
        nestedChildren = _child$props4.children,
        childProps = objectWithoutProperties(_child$props4, ["children"]);

    if (!allowProps && Object.keys(childProps).length !== 0) {
        warn("The <head> element assigned after render does not accept attributes, " + "they can not be hydrated on the client.");
    }

    if (nestedChildren) {
        React.Children.forEach(nestedChildren, function (nestedChild) {
            var nestedChildType = nestedChild.type;
            var typeState = htmlState[nestedChildType] = htmlState[nestedChildType] || {};

            if (nestedChildType === TITLE) {
                mapTitleToState(nestedChild, typeState, htmlState);
            } else if (nestedChildType === STYLE) {
                mapStyleToState(nestedChild, typeState);
            } else if (nestedChildType === SCRIPT) {
                mapScriptToState(nestedChild, typeState);
            } else if (nestedChildType === NOSCRIPT) {
                mapNoScriptToState(nestedChild, typeState, options);
            } else {
                // all other elements use the original React element for rendering
                mapElementToState(nestedChildType, nestedChild, typeState);
            }
        });
    }

    return assignAttributes(htmlState, ATTRIBUTE_KEY_NAMES.HEAD, childProps, options);
}

function resolveHtmlElement(children, htmlState, options) {
    var child = React.Children.only(children);
    var childType = child.type;

    if (childType === TAG_NAMES.HTML) {
        return resolveHtml(child, htmlState, options);
    }

    if (childType === TAG_NAMES.HEAD) {
        return resolveHead(child, htmlState, options);
    }

    if (childType === TAG_NAMES.BODY) {
        return resolveBody(child, htmlState, options);
    }

    if (childType === TAG_NAMES.APP) {
        return resolveApp(child, htmlState, options);
    }

    throw new Error(message("Invalid html markup, tag \"" + childType + "\" is not supported."));
}

function resolveHtmlElements(htmlElement, htmlState, options) {
    if (!htmlElement || React.Children.count(htmlElement) === 0) {
        return {};
    }

    return resolveHtmlElement(htmlElement, htmlState, options);
}

function mapHtmlToState(htmlElement, options) {
    return resolveHtmlElement(htmlElement, {}, options);
}

function mapHeadElementToState(headElement, options) {
    return resolveHead(headElement, {}, options, false);
}

var IS_DEV$2 = "development" !== "production";

var DIV = "div";
var DATA_REACT_ROOT_ATTR = "data-reactroot";

var defaultOptions = {
    isHydrating: false,
    isServerRender: false,
    isStreamRender: false
};

// The keys used to order the FIRST components in the <head> element
var defaultPriorityComponentKeys = ["meta:charSet", "meta:httpEquiv=X-UA-Compatible", "meta:name=viewport", TAG_NAMES.TITLE];

var HtmlMetadata = function () {
    createClass(HtmlMetadata, null, [{
        key: "createForClientRender",


        /**
         * Create a new metadata instance for a client render.
         *
         * @returns {HtmlMetadata}
         * @public
         */
        value: function createForClientRender() {
            return new HtmlMetadata();
        }

        /**
         * Create a new metadata instance for hydrating a client.
         * @returns {HtmlMetadata}
         * @public
         */

        // TODO: Add required vars here...

    }, {
        key: "createForClientHydrate",
        value: function createForClientHydrate() {
            return new HtmlMetadata({
                isHydrating: true
            });
        }

        /**
         * Create a new metadata instance for a server stream render.
         * @returns {HtmlMetadata}
         * @public
         */

    }, {
        key: "createForServerStreamRender",
        value: function createForServerStreamRender() {
            return new HtmlMetadata({
                isServerRender: true,
                isStreamRender: true
            });
        }

        /**
         * Create a new metadata instance for a server string render.
         * @returns {HtmlMetadata}
         * @public
         */

    }, {
        key: "createForServerStringRender",
        value: function createForServerStringRender() {
            return new HtmlMetadata({
                isServerRender: true
            });
        }

        /**
         * Creates a new HtmlMetadata instance.
         *
         * @param options
         * @private
         */

    }]);

    function HtmlMetadata() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        classCallCheck(this, HtmlMetadata);

        var _Object$assign = Object.assign({}, defaultOptions, options),
            isHydrating = _Object$assign.isHydrating,
            isServerRender = _Object$assign.isServerRender,
            isStreamRender = _Object$assign.isStreamRender;

        this._htmlContext = new HtmlContext(this);
        this._priorityComponentKeys = defaultPriorityComponentKeys;
        this._externalHeadElementSelectors = ["[" + HTML_TAGS_HYDRATE_ATTR + "]"];
        this._onChangeSubscribers = [];
        this._isServerRender = isServerRender;
        this._isHydratingClient = !isServerRender && isHydrating;
        this._isServerStreamRender = isServerRender && isStreamRender;
        this._isStaticServerRender = false;
        this._isPreloaded = false;
        this._headFragment = null;
        this._isHtmlProviderMounted = false;
        this._isHeadMounted = false;
        this._ignoreNonDeterministicHtml = false;
        this._isNonDeterministic = false;
        this._appliedAttributes = {};
        this._appContainer = null;
        this._nonDeterministicUpdateCounter = 0;
        this._htmlState = null;
        this._headComponentCache = null;
        this._attributeCache = null;
        this._serializedState = null;
    }

    createClass(HtmlMetadata, [{
        key: "getRootContext",
        value: function getRootContext() {
            return this._htmlContext;
        }
    }, {
        key: "appendExternalHeadSelectors",
        value: function appendExternalHeadSelectors(externalHeadElementSelectors) {
            if (externalHeadElementSelectors && externalHeadElementSelectors.length !== 0) {
                if (Array.isArray(externalHeadElementSelectors)) {
                    Array.prototype.push.apply(this._externalHeadElementSelectors, externalHeadElementSelectors);
                } else {
                    this._externalHeadElementSelectors.push(externalHeadElementSelectors);
                }
            }
        }
    }, {
        key: "getExternalHeadSelectors",
        value: function getExternalHeadSelectors() {
            return this._externalHeadElementSelectors;
        }
    }, {
        key: "_clearProviderState",
        value: function _clearProviderState() {
            var refreshHtmlRender = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            // Clear all state/cache
            this._htmlState = null;
            this._headComponentCache = null;
            this._attributeCache = null;

            if (refreshHtmlRender && this._nonDeterministicUpdateCounter === 0) {
                this.notifySubscribers();
            }
        }

        // _notifyParentOnChange(): void {
        //     // Force a render - only when an existing update is not in progress
        //     if (this._nonDeterministicUpdateCounter === 0) {
        //         this.notifySubscribers();
        //     }
        // }

    }, {
        key: "startComponentLifecycle",
        value: function startComponentLifecycle() {
            if (!this._isPreloaded && this.getRootContext().hasChildren()) {
                // Metadata was pre-loaded, outside of the react render lifecycle
                // - this flag prevents metadata being loaded again during the
                //   react component lifecycle methods.
                this._isPreloaded = true;
            }
        }
    }, {
        key: "isPreLoaded",
        value: function isPreLoaded() {
            return this._isPreloaded;
        }
    }, {
        key: "isHtmlProviderMounted",
        value: function isHtmlProviderMounted() {
            return this._isHtmlProviderMounted;
        }
    }, {
        key: "isHeadMounted",
        value: function isHeadMounted() {
            return this._isHeadMounted;
        }
    }, {
        key: "headDidMount",
        value: function headDidMount(doneCallback) {
            if (!this._isHeadMounted) {
                this._isHeadMounted = true;
            }

            // Update all metadata after the application has mounted
            // - this should resolve to the initial server render
            this.notifySubscribers(doneCallback);
        }
    }, {
        key: "htmlProviderDidMount",
        value: function htmlProviderDidMount(forceUpdateCallback) {
            if (!this._isHtmlProviderMounted) {
                this._isHtmlProviderMounted = true;
                return this._htmlContext.registerForceUpdateCallback(forceUpdateCallback);
            }
        }
    }, {
        key: "htmlProviderWillUnmount",
        value: function htmlProviderWillUnmount() {
            if (this._isHtmlProviderMounted) {
                this._isHtmlProviderMounted = false;
                this._htmlContext.unregisterForceUpdateCallback();
            }
        }
    }, {
        key: "isNonDeterministic",
        value: function isNonDeterministic() {
            return this._isNonDeterministic === true;
        }

        // Notify the parent the render has resulted in non-deterministic html

    }, {
        key: "notifyParentOnError",
        value: function notifyParentOnError() {
            if (!this.ignoreNonDeterministicHtml() && !this.isNonDeterministic()) {
                this._isNonDeterministic = true;
            }
        }

        // Attempts to resolve any non-deterministic html rendering errors

    }, {
        key: "resolveNonDeterministicErrors",
        value: function resolveNonDeterministicErrors() {
            var _this = this;

            if (IS_DEV$2) {
                if (this._nonDeterministicUpdateCounter === 0 && !this.ignoreNonDeterministicHtml() && this.isNonDeterministic()) {
                    warn("'forceRender()' has been used to resolve non-deterministic html. " + "To avoid additional renders, fix the non-deterministic behavior or " + "set the HtmlProvider \"suppressNonDeterministicWarnings\" prop.");

                    // Pass a callback that increments the count when an update is being performed
                    // and return a function that will decrease the counter after the update has
                    // completed - this prevents a recursive update cycle.
                    this._htmlContext.resolveNonDeterministicErrors(function () {
                        // Increment the active update counter
                        _this._nonDeterministicUpdateCounter++;

                        // Return a function to decrease the counter after the update is finished
                        return function () {
                            // Decrease the active update counter
                            _this._nonDeterministicUpdateCounter--;

                            if (_this._nonDeterministicUpdateCounter === 0) {
                                // reset the deterministic flag
                                _this._isNonDeterministic = false;

                                // Prime the cache, don't display any non-deterministic errors after forced update
                                _this._getInternalState(false);

                                // Force the metadata to update
                                _this.notifySubscribers();
                            }
                        };
                    });
                }
            }
        }
    }, {
        key: "setIgnoreNonDeterministicHtml",
        value: function setIgnoreNonDeterministicHtml() {
            var ignore = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            this._ignoreNonDeterministicHtml = ignore;
        }
    }, {
        key: "ignoreNonDeterministicHtml",
        value: function ignoreNonDeterministicHtml() {
            return this._ignoreNonDeterministicHtml === true;
        }

        /**
         * appendHtmlState
         *
         * Used to append state externally of the react lifecycle.
         * @param htmlState
         * @public
         */

    }, {
        key: "appendHtmlState",
        value: function appendHtmlState(htmlState) {
            var childContext = this.getRootContext().createChildContext();
            childContext.htmlComponentDidMount();
            childContext.setHtmlState(htmlState);
        }
    }, {
        key: "appendHead",
        value: function appendHead(headElement) {
            // The "rootContext" is used by the <HtmlProvider>
            // - it never has any htmlState directly assigned to it
            // - therefore, its safe to assign state to the root context here
            this.getRootContext().setHtmlState(mapHeadElementToState(headElement));
        }
    }, {
        key: "_getInternalState",
        value: function _getInternalState() {
            var displayNonDeterministicWarnings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.isHtmlProviderMounted();

            if (!this._htmlState) {
                this._htmlState = this._htmlContext.resolveHtmlState(displayNonDeterministicWarnings);
            }

            return this._htmlState;
        }

        /**
         * Gets the serialized HTML state
         * @param renderToString {function} react-dom/server renderToString function
         * @returns {Object}
         * @public
         */

    }, {
        key: "serializeState",
        value: function serializeState(renderToString) {
            invariant(this.isServerRender(), message("`serializeState` is not supported on the client."));
            invariant(typeof renderToString === "function", message("`serializeState()` requires a 'renderToString' function argument."));

            var _getServerAttributes = this.getServerAttributes(),
                headAttributes = _getServerAttributes.headAttributes,
                attributes = objectWithoutProperties(_getServerAttributes, ["headAttributes"]);

            return _extends({}, attributes, {
                head: renderToString(React.createElement(TAG_NAMES.HEAD, headAttributes, React.createElement(this._headFragment, this.getHeadComponents())))
            });
        }

        /**
         * Assigns the serialized state to be used for the current render.
         *
         * This prevents component HTML metadata from rendered used for the current render.
         *
         * @param serializedState
         * @public
         */

    }, {
        key: "useSerializedState",
        value: function useSerializedState(serializedState) {
            invariant(this.isServerRender(), message("`useSerializedState` is not supported on the client."));

            // Set "preLoaded" flag to prevent loading metadata unnecessarily
            this._isPreloaded = true;
            this._serializedState = serializedState;
        }
    }, {
        key: "_hasSerializedState",
        value: function _hasSerializedState() {
            return this._serializedState !== null;
        }
    }, {
        key: "_getSerializedState",
        value: function _getSerializedState() {
            return this._serializedState;
        }
    }, {
        key: "getHeadComponents",
        value: function getHeadComponents() {
            if (!this._headComponentCache) {
                var htmlState = this._getInternalState();
                this._headComponentCache = reduceStateToComponents(HEAD_TAG_KEYS, htmlState, this._priorityComponentKeys);
            }

            return this._headComponentCache;
        }
    }, {
        key: "getServerAttributes",
        value: function getServerAttributes(element, appContainerOptions) {
            var _getAppContainerProps = reactDomHtml.getAppContainerProps(element, appContainerOptions),
                tagName = _getAppContainerProps.tagName,
                id = _getAppContainerProps.id;

            return _extends({ appTagName: tagName }, this.getAttributes({ id: id }));
        }
    }, {
        key: "getAttributes",
        value: function getAttributes() {
            var applicationAttributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

            // The "applicationAttributes" should never change - so a single cache is ok
            // - the appAttributes are only passed once on initial server render.
            if (!this._attributeCache) {
                var htmlState = this._getInternalState();

                this._attributeCache = ATTRIBUTE_KEYS.reduce(function (attributes, attributeKey) {
                    var attributeValues = htmlState[attributeKey];
                    var hasAppAttributes = attributeKey === ATTRIBUTE_KEY_NAMES.APP && applicationAttributes !== null;

                    if (hasAppAttributes || typeof attributeValues !== "undefined") {
                        attributes[attributeKey] = reduceAttributes(attributeValues, hasAppAttributes ? applicationAttributes : {});
                    }

                    return attributes;
                }, {});
            }

            return this._attributeCache;
        }
    }, {
        key: "setAppContainer",
        value: function setAppContainer(appContainer) {
            // This is only required for browser render
            this._appContainer = appContainer;
        }
    }, {
        key: "_getDomAttributesToRemove",
        value: function _getDomAttributesToRemove(tagName, domNode) {
            if (typeof this._appliedAttributes[tagName] === "undefined") {
                // initialize applied attributes from DOMNode
                this._appliedAttributes[tagName] = getDomElementAttributeNames(domNode);

                // Remove the "data-reactroot" attribute, so its not removed from the DOM.
                var reactRootIdx = this._appliedAttributes[tagName].indexOf(DATA_REACT_ROOT_ATTR);
                if (reactRootIdx !== -1) {
                    this._appliedAttributes[tagName].splice(reactRootIdx, 1);
                }

                if (tagName === TAG_NAMES.APP) {
                    // Prevent the app container "id" attribute from being removed
                    var idIdx = this._appliedAttributes[tagName].indexOf("id");
                    if (idIdx !== -1) {
                        this._appliedAttributes[tagName].splice(idIdx, 1);
                    }
                }
            }

            return this._appliedAttributes[tagName].slice();
        }
    }, {
        key: "_setDomAttributesFor",
        value: function _setDomAttributesFor(tagName, values) {
            this._appliedAttributes[tagName] = values;
        }
    }, {
        key: "renderAttributes",
        value: function renderAttributes() {
            var _this2 = this;

            /*
             * Utilize React to render all attributes
             * This ensures document-level attributes are consistent
             * with application attributes, and reduces code complexity.
             */

            if (this.isServerRender()) {
                throw new Error(message("can not render attributes on server"));
            }

            // TODO: This really needs to be tested as part of CI process - using KARMA

            var attributes = this.getAttributes();
            // console.log(attributes);
            ELEMENT_ATTRIBUTE_TUPLES.forEach(function (_ref) {
                var _ref2 = slicedToArray(_ref, 2),
                    tagName = _ref2[0],
                    attributeKey = _ref2[1];

                var tagAttributes = attributes[attributeKey];
                var domNode = tagName === TAG_NAMES.APP ? _this2._appContainer : document.querySelector(tagName);

                var attributeNamesToRemove = _this2._getDomAttributesToRemove(tagName, domNode);

                if (typeof tagAttributes !== "undefined") {
                    // Use react-dom to render to a temporary node
                    var tempNode = document.createElement(DIV);
                    ReactDOM.render(React.createElement(DIV, tagAttributes), tempNode, function () {
                        var tempRenderedNode = tempNode.childNodes[0];

                        var domAttributeNames = getDomElementAttributeNames(tempRenderedNode);
                        domAttributeNames.forEach(function (attributeName) {
                            var attributeValue = tempRenderedNode.getAttribute(attributeName);

                            if (domNode.hasAttribute(attributeName)) {
                                if (domNode.getAttribute(attributeName) !== attributeValue) {
                                    // Replace the attribute value
                                    domNode.setAttribute(attributeName, attributeValue);
                                }
                            } else {
                                // Add the attribute
                                domNode.setAttribute(attributeName, attributeValue);
                            }

                            var removeIdx = attributeNamesToRemove.indexOf(attributeName);
                            if (removeIdx !== -1) {
                                attributeNamesToRemove.splice(removeIdx, 1);
                            }
                        });

                        // update state with current attribute names
                        _this2._setDomAttributesFor(tagName, domAttributeNames);

                        // Unmount the temp component
                        ReactDOM.unmountComponentAtNode(tempNode);

                        if (typeof tempNode.remove === "function") {
                            // In browsers where its supported, remove the temporary
                            // DOM node from its parent.
                            tempNode.remove();
                        }

                        // remove remaining attributes from the dom node
                        removeAttributesFromDomNode(attributeNamesToRemove, domNode);
                    });
                } else {
                    removeAttributesFromDomNode(attributeNamesToRemove, domNode);
                }
            });
        }
    }, {
        key: "notifySubscribers",
        value: function notifySubscribers(doneCallback) {
            var self = this;
            var subscriberCount = 0;
            var subscriberLen = this._onChangeSubscribers.length;

            self._onChangeSubscribers.forEach(function (subscriber) {
                return subscriber(function () {
                    subscriberCount++;
                    if (subscriberCount === subscriberLen && typeof doneCallback === "function") {
                        doneCallback();
                    }
                });
            });
        }

        /**
         * Subscribe to be notified when metadata changes. Be sure to unsubscribe to prevent memory leaks.
         *
         * @param callback
         * @returns {unsubscribe}
         */

    }, {
        key: "onChange",
        value: function onChange(callback) {
            var self = this;
            self._onChangeSubscribers.push(callback);

            return function () {
                var idx = self._onChangeSubscribers.indexOf(callback);
                if (idx > -1) {
                    self._onChangeSubscribers.splice(idx, 1);
                }
            };
        }
    }, {
        key: "setPriorityComponentKeys",
        value: function setPriorityComponentKeys(keys) {
            this._priorityComponentKeys = keys;
        }
    }, {
        key: "setHeadFragment",
        value: function setHeadFragment(headFragment) {
            this._headFragment = headFragment;
        }
    }, {
        key: "setRenderedHeadFragment",
        value: function setRenderedHeadFragment(headFragment) {
            this._renderedHeadFragment = headFragment;
        }
    }, {
        key: "didRenderCorrectHeadFragment",
        value: function didRenderCorrectHeadFragment() {
            if (this.isHydratingClient()) {
                return this._renderedHeadFragment === this._headFragment;
            }

            return true;
        }
    }, {
        key: "isClientRender",
        value: function isClientRender() {
            return !this._isServerRender;
        }
    }, {
        key: "isHydratingClient",
        value: function isHydratingClient() {
            return this.isClientRender() && this._isHydratingClient === true;
        }
    }, {
        key: "isRenderingClient",
        value: function isRenderingClient() {
            return this.isClientRender() && this._isHydratingClient === false;
        }
    }, {
        key: "isServerRender",
        value: function isServerRender() {
            return this._isServerRender;
        }
    }, {
        key: "isServerStreamRender",
        value: function isServerStreamRender() {
            return this.isServerRender() && this._isServerStreamRender;
        }
    }, {
        key: "isServerStringRender",
        value: function isServerStringRender() {
            return this.isServerRender() && !this._isServerStreamRender;
        }
    }, {
        key: "setStaticServerRender",
        value: function setStaticServerRender(isStaticServerRender) {
            this._isStaticServerRender = isStaticServerRender;
        }
    }, {
        key: "isServerStaticRender",
        value: function isServerStaticRender() {
            return this.isServerRender() && this._isStaticServerRender;
        }
    }]);
    return HtmlMetadata;
}();


function removeAttributesFromDomNode(attributesToRemove, domNode) {
    if (domNode !== null) {
        // Remove remaining attribute values
        attributesToRemove.forEach(function (attributeName) {
            if (domNode.hasAttribute(attributeName)) {
                domNode.removeAttribute(attributeName);
            }
        });
    }
}

var TITLE$1 = TAG_NAMES.TITLE;
function reduceStateToComponents(tagNames, state) {
    var priorityTagKeys = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    var priorityComponents = {};
    var tagComponents = tagNames.reduce(function (tags, tagName) {
        var tagComponents = state[tagName];
        if (typeof tagComponents === "undefined") {
            return tags;
        }

        if (tagName === TITLE$1) {
            // special-case: render title using templates
            if (state[TITLE_TEMPLATE] || state[TITLE$1]) {
                var _ref3 = state[TITLE$1] && state[TITLE$1].title ? state[TITLE$1].title.props : { children: "" },
                    titleText = _ref3.children,
                    titleAttributes = objectWithoutProperties(_ref3, ["children"]);

                var resolvedTitleText = state.titleTemplate && state.titleTemplate.length > 0 ? // rightReduce template to generate the title text using template functions
                state.titleTemplate.reduceRight(function (title, template) {
                    return template(title);
                }, titleText) : // fallback to using a plain title text
                titleText;

                var titleElement = React.createElement(TITLE$1, _extends({
                    key: resolvedTitleText
                }, titleAttributes), resolvedTitleText);

                if (priorityTagKeys.indexOf(TITLE$1) !== -1) {
                    priorityComponents[TITLE$1] = titleElement;
                } else {
                    // Include the title as the key
                    tags[tagName] = [titleElement];
                }
            }

            return tags;
        }

        var namedTags = Object.keys(tagComponents).reduce(function (components, key) {
            if (priorityTagKeys.indexOf(key) !== -1) {
                priorityComponents[key] = tagComponents[key];
            } else {
                components.push(tagComponents[key]);
            }

            return components;
        }, []);

        if (namedTags.length !== 0) {
            tags[tagName] = namedTags;
        }

        return tags;
    }, {});

    // Render the "priority" components in the configured order
    var hasOrderedComponents = false;
    var orderedComponents = priorityTagKeys.reduce(function (components, key) {
        var orderedComponent = priorityComponents[key];
        if (typeof orderedComponent !== "undefined") {
            if (!hasOrderedComponents) {
                hasOrderedComponents = true;
            }

            components.push(orderedComponent);
        }

        return components;
    }, []);

    if (hasOrderedComponents) {
        tagComponents.priority = orderedComponents;
    }

    return tagComponents;
}

// Assign a rootContext to use a default for testing, etc...

var _createContext = React.createContext(HtmlMetadata.createForClientRender().getRootContext()),
    Provider = _createContext.Provider,
    Consumer = _createContext.Consumer;

function createHtmlHOC(getHtmlElements) {
    var _class, _temp;

    var defaultProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return _temp = _class = function (_Component) {
        inherits(HtmlHOC, _Component);
        createClass(HtmlHOC, null, [{
            key: "getDerivedStateFromProps",
            value: function getDerivedStateFromProps(nextProps, prevState) {
                // eslint-disable-next-line no-unused-vars
                var children = nextProps.children,
                    htmlContext = nextProps.htmlContext,
                    componentProps = objectWithoutProperties(nextProps, ["children", "htmlContext"]);

                var derivedMetadata = getHtmlElements(componentProps, prevState.mapOptions);
                return derivedMetadata ? { derivedMetadata: derivedMetadata } : null;
            }

            // Assign default props from the wrapped component

        }]);

        function HtmlHOC(props, context) {
            classCallCheck(this, HtmlHOC);

            // eslint-disable-next-line react/prop-types
            var _this = possibleConstructorReturn(this, (HtmlHOC.__proto__ || Object.getPrototypeOf(HtmlHOC)).call(this, props, context));

            var children = props.children,
                htmlContext = props.htmlContext,
                componentProps = objectWithoutProperties(props, ["children", "htmlContext"]);


            if (!htmlContext) {
                throw new Error(message("Missing `htmlContext`, are you missing a parent HtmlProvider?"));
            }

            _this._unsubscribe = null;
            _this.state = {
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
                _this.state.htmlContext.htmlComponentDidMount();
                _this._setHtmlContextState(getHtmlElements(componentProps, _this.state.mapOptions), false);
            }
            return _this;
        }

        createClass(HtmlHOC, [{
            key: "componentDidMount",
            value: function componentDidMount() {
                var _this2 = this;

                var _state = this.state,
                    htmlContext = _state.htmlContext,
                    derivedMetadata = _state.derivedMetadata;

                this._unsubscribe = htmlContext.htmlComponentDidMount(function (forceUpdateCallback) {
                    // Resolve non-deterministic renders, then invoke the callback to signal update complete
                    _this2.forceUpdate(forceUpdateCallback);
                });

                // NOTE: This would be better in a post-render commit lifecycle, but one does not exist.
                //       ideally; a post-commit lifecycle method where you could append state without re-render
                // No need to "invalidateParentState" here because the <head> is always mounted AFTER the application
                this._setHtmlContextState(derivedMetadata, false);
            }
        }, {
            key: "componentDidUpdate",
            value: function componentDidUpdate() /*prevProps, prevState*/{
                var derivedMetadata = this.state.derivedMetadata;

                this._setHtmlContextState(derivedMetadata, true); // TODO: is this ever set to a value of NULL??? Check this first.
            }
        }, {
            key: "componentWillUnmount",
            value: function componentWillUnmount() {
                if (this._unsubscribe) {
                    this._unsubscribe();
                    this._unsubscribe = null;
                }

                var htmlContext = this.state.htmlContext;

                this._setHtmlContextState(null, true); // TODO: Maybe... `this.state.htmlState.clearHtmlState();`
                htmlContext.htmlComponentWillUnmount(); // TODO: Above line is NOT required, utilize THIS line via htmlCtx...???
            }
        }, {
            key: "render",
            value: function render() {
                return React__default.createElement(
                    Provider,
                    { value: this.state.htmlContext },
                    this.props.children
                );
            }
        }, {
            key: "_setHtmlContextState",
            value: function _setHtmlContextState() {
                var nextState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
                var invalidateParentState = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

                this.state.htmlContext.setHtmlState(nextState, invalidateParentState);
            }
        }]);
        return HtmlHOC;
    }(React.Component), _class.defaultProps = defaultProps, _temp;
}

var IS_PROD$1 = "development";
var HTML = TAG_NAMES.HTML;
var BODY = TAG_NAMES.BODY;
var APP = TAG_NAMES.APP;

var VALID_BODY_CHILDREN = [APP];

function findAppElement(_ref, validTagKeys) {
    var children = _ref.children;

    var appTag = null;
    React.Children.forEach(children, function (child) {
        if (!IS_PROD$1) {
            if (child === null || validTagKeys.indexOf(child.type) === -1) {
                var elementName = child === null ? "`null`" : "<" + child.type + ">";
                throw new Error("Html element " + elementName + " is not supported, only <head>, <body> and <app> are allowed to be used as immediate children.");
            }
        }

        if (appTag || child === null) {
            return;
        }

        if (child.type === BODY) {
            appTag = findAppElement(child.props, VALID_BODY_CHILDREN);
        } else if (child.type === APP) {
            appTag = child;
        }
    });

    return appTag;
}

function findApplicationChildren(props) {
    var appElement = findAppElement(props, HTML_CHILD_TAG_KEYS);

    /*
    Reasoning on requiring <app> children:
     - <Html> is used to apply metadata to applications
     - I can think of no reason to define metadata at a tree leaf
     - It should encourage use of a standard pattern when using <Html>
     */
    if (!appElement) {
        throw new Error(message("<Html> requires an <app> element. It can be an immediate child, or a child of <body>."));
    }

    var appChildChildren = appElement.props.children;
    if (!appChildChildren || React.Children.count(appChildChildren) === 0) {
        throw new Error(message("<Html> requires the <app> element to have children."));
    }

    return appChildChildren;
}

var HtmlHOC = createHtmlHOC(function (_ref2, options) {
    var htmlElement = _ref2.htmlElement;
    return mapHtmlToState(htmlElement, _extends({}, options, { permitAppChildren: true }));
});

function Html(props) {
    var appChildren = findApplicationChildren(props);

    // eslint-disable-next-line react/prop-types
    var children = props.children,
        htmlAttributes = objectWithoutProperties(props, ["children"]);

    var htmlElement = React__default.createElement(HTML, htmlAttributes, children);

    return React__default.createElement(
        Consumer,
        null,
        function (htmlContext) {
            return React__default.createElement(
                HtmlHOC,
                { htmlElement: htmlElement, htmlContext: htmlContext },
                appChildren || null
            );
        }
    );
}

function HeadFragment(_ref) {
    var priority = _ref.priority,
        title = _ref.title,
        base = _ref.base,
        meta = _ref.meta,
        link = _ref.link,
        style = _ref.style,
        script = _ref.script,
        noscript = _ref.noscript,
        template = _ref.template;

    return React__default.createElement(
        React__default.Fragment,
        null,
        priority,
        title,
        base,
        meta,
        style,
        link,
        template,
        noscript,
        script
    );
}

var HeadContainer = function (_React$Component) {
    inherits(HeadContainer, _React$Component);

    function HeadContainer(props, context) {
        classCallCheck(this, HeadContainer);

        var _this = possibleConstructorReturn(this, (HeadContainer.__proto__ || Object.getPrototypeOf(HeadContainer)).call(this, props, context));

        _this._unsubscribe = null;
        _this.state = {
            htmlMetadata: props.metadata,
            lastUpdated: 0
        };
        return _this;
    }

    createClass(HeadContainer, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            var self = this;
            var htmlMetadata = this.state.htmlMetadata;
            var clearExistingChildren = this.props.clearExistingChildren;


            var onHeadRendered = void 0;
            if (clearExistingChildren) {
                // remove existing <head> children - except elements with specified selectors
                var selectors = htmlMetadata.getExternalHeadSelectors();
                var removeSelectors = selectors.map(function (selector) {
                    return ":not(" + selector + ")";
                });

                var headDomNode = document.querySelector("head");

                // Remove dom nodes from <head>
                forEachQuerySelectorAll(headDomNode, removeSelectors.join(""), function (domElement) {
                    headDomNode.removeChild(domElement);
                });

                onHeadRendered = function () {
                    // move other elements to the end of the <head> children
                    // - this should ensure consistent ordering for hydrate/render
                    forEachQuerySelectorAll(headDomNode, selectors.join(", "), function (domElement) {
                        headDomNode.appendChild(domElement);
                    });
                };
            }

            self._unsubscribe = htmlMetadata.onChange(function (done) {
                // setState to queue a re-render
                htmlMetadata.renderAttributes();
                self.setState({ lastUpdated: Date.now() }, done);
            });

            // if a commit lifecycle method is added to react, this only needs to be done for client hydrate
            // forces all metadata to render to update body & html attributes
            htmlMetadata.headDidMount(onHeadRendered);
        }
    }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate() /*prevProps, prevState, snapshot*/{
            var htmlMetadata = this.state.htmlMetadata;

            if (htmlMetadata.isNonDeterministic()) {
                // If the render resulted in non-deterministic html metadata
                // Force a re-render in an attempt to resolve the errors
                htmlMetadata.resolveNonDeterministicErrors();
            }
        }
    }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
            if (this._unsubscribe) {
                this._unsubscribe();
                this._unsubscribe = null;
            }
        }
    }, {
        key: "render",
        value: function render() {
            return this.props.children(this.state.htmlMetadata.getHeadComponents());
        }
    }]);
    return HeadContainer;
}(React__default.Component);

HeadContainer.defaultProps = {
    clearExistingChildren: false
};

var BrowserHeadPortal = function (_Component) {
    inherits(BrowserHeadPortal, _Component);

    function BrowserHeadPortal() {
        classCallCheck(this, BrowserHeadPortal);
        return possibleConstructorReturn(this, (BrowserHeadPortal.__proto__ || Object.getPrototypeOf(BrowserHeadPortal)).apply(this, arguments));
    }

    createClass(BrowserHeadPortal, [{
        key: "render",
        value: function render() {
            return ReactDOM__default.createPortal(this.props.children, document.querySelector("head"));
        }
    }]);
    return BrowserHeadPortal;
}(React.Component);

var IS_DEV$3 = "development" !== "production";

var HtmlProvider = function (_Component) {
    inherits(HtmlProvider, _Component);

    function HtmlProvider(props, context) {
        classCallCheck(this, HtmlProvider);

        var _this = possibleConstructorReturn(this, (HtmlProvider.__proto__ || Object.getPrototypeOf(HtmlProvider)).call(this, props, context));

        var metadata = props.metadata,
            headFragment = props.headFragment,
            headPortal = props.headPortal,
            suppressNonDeterministicWarnings = props.suppressNonDeterministicWarnings,
            headComponentPriorityKeys = props.headComponentPriorityKeys;


        var htmlMetadata = metadata || HtmlMetadata.createForClientRender();
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

        _this._unsubscribe = null;
        _this.state = {
            htmlMetadata: htmlMetadata,
            htmlContext: htmlMetadata.getRootContext(),
            headPortal: headPortal ||
            // Browser only renders should be "head-first", requires a Portal
            //  - use a portal to populate the <head> before rendering the app
            //  - browser `hydrate` needs to hydrate directly to <head>, can't use Portal for hydrate
            !htmlMetadata.isServerRender() && !htmlMetadata.isHydratingClient() ? BrowserHeadPortal : null
        };
        return _this;
    }

    createClass(HtmlProvider, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            var _this2 = this;

            var _state = this.state,
                htmlMetadata = _state.htmlMetadata,
                headPortal = _state.headPortal;

            if (IS_DEV$3) {
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

            this._unsubscribe = htmlMetadata.htmlProviderDidMount(function () {
                return _this2.forceUpdate();
            });
        }
    }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
            if (this._unsubscribe) {
                this._unsubscribe();
                this._unsubscribe = null;
            }

            this.state.htmlMetadata.htmlProviderWillUnmount();
        }
    }, {
        key: "render",
        value: function render() {
            var _props = this.props,
                children = _props.children,
                HeadFragment$$1 = _props.headFragment;
            var _state2 = this.state,
                htmlContext = _state2.htmlContext,
                htmlMetadata = _state2.htmlMetadata,
                HeadPortal = _state2.headPortal;


            return React__default.createElement(
                Provider,
                { value: htmlContext },
                React.Children.only(children),
                HeadPortal && React__default.createElement(
                    HeadContainer,
                    { metadata: htmlMetadata, clearExistingChildren: true },
                    function (headComponents) {
                        return React__default.createElement(
                            HeadPortal,
                            null,
                            React__default.createElement(HeadFragment$$1, headComponents)
                        );
                    }
                )
            );
        }
    }]);
    return HtmlProvider;
}(React.Component);

HtmlProvider.defaultProps = {
    headPortal: null,
    suppressNonDeterministicWarnings: false,
    headFragment: HeadFragment
};

function withHtml(renderHtml) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var componentDisplayName = options.componentDisplayName,
        displayNamePrefix = options.displayNamePrefix;


    var getHtmlState = function (props, options) {
        return mapHtmlToState(renderHtml(props), _extends({}, options, { permitAppChildren: false }));
    };

    return function (Component) {
        var componentName = componentDisplayName || getDisplayName(Component);


        var HtmlHOC = createHtmlHOC(getHtmlState, Component && Component.defaultProps);

        // eslint-disable-next-line react/prop-types
        var HtmlMetadataHOC = function (_ref) {
            var children = _ref.children,
                props = objectWithoutProperties(_ref, ["children"]);

            var wrappedChildren = Component === null ? null : typeof children !== "undefined" ? React__default.createElement(
                Component,
                props,
                children
            ) : React__default.createElement(Component, props);

            return React__default.createElement(
                Consumer,
                null,
                function (htmlContext) {
                    return React__default.createElement(
                        HtmlHOC,
                        _extends({}, props, { htmlContext: htmlContext }),
                        wrappedChildren
                    );
                }
            );
        };

        // Expose a static method for pre-loading metadata on server to facilitate stream rendering
        HtmlMetadataHOC.appendHtmlMetadata = function (htmlMetadata, props) {
            htmlMetadata.appendHtmlState(getHtmlState(props));
        };

        HtmlMetadataHOC.displayName = displayNamePrefix + "(" + componentName + ")";
        if (Component === null) {
            return HtmlMetadataHOC;
        }

        HtmlMetadataHOC.WrappedComponent = Component;
        return hoistNonReactStatic(HtmlMetadataHOC, Component);
    };
}

var IS_DEV$4 = "development" !== "production";

function createHeadChildren(rootElement, metadata) {
    var rootElementType = rootElement.type || {};
    var headFragment = typeof rootElementType.getHeadFragment === "function" // 1. check for static method on root element
    ? rootElementType.getHeadFragment() : rootElementType === HtmlProvider // 2. check for prop assigned to <HtmlProvider>
    ? rootElement.props.headFragment : HeadFragment; // 3. fallback

    if (IS_DEV$4) {
        // Required to verify that the render used the correct head fragment
        metadata.setRenderedHeadFragment(headFragment);
    }

    return React.createElement(HeadContainer, { metadata: metadata }, headFragment);
}

function withHtmlProvider(element, metadata) {
    if (React.isValidElement(element)) {
        return React__default.createElement(
            HtmlProvider,
            { metadata: metadata },
            element
        );
    }

    if (typeof element === "function") {
        return element(metadata);
    }

    throw new Error(message("Root element must be React element or function that returns a React element"));
}

var IS_DEV$5 = "development";

function removeHeadElements(headDomNode, defaultSelector) {
    var additionalSelectors = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    var removedElements = [];
    var selectors = [defaultSelector];
    if (typeof additionalSelectors === "string") {
        selectors.push(additionalSelectors);
    } else if (Array.isArray(additionalSelectors) && additionalSelectors.length !== 0) {
        [].push.apply(selectors, additionalSelectors);
    }

    // Remove the element(s) from <head>
    forEachQuerySelectorAll(headDomNode, selectors.join(", "), function (tag) {
        removedElements.push(headDomNode.removeChild(tag));
    });

    return removedElements;
}

function hydrateHtml(element) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var serverSnapshot = void 0;
    if (IS_DEV$5) {
        serverSnapshot = takeAttributeSnapshot();
    }

    var headDomNode = document.querySelector("head");
    var htmlMetadata = HtmlMetadata.createForClientHydrate();
    var container = options.container,
        callback = options.callback,
        externalHeadElementSelectors = options.externalHeadElementSelectors,
        hydratedHeadElementSelectors = options.hydratedHeadElementSelectors;


    return prepareForRender(htmlMetadata, element, container, function (rootElement, appContainer) {
        // Remove any "ignored" html tags from the <head> element
        // - required to support head elements outside of the react lifecycle
        // - react will remove them as part of the render lifecycle
        // - removing them here allows react to hydrate without warnings
        var externalHeadTags = removeHeadElements(headDomNode, "[" + HTML_TAGS_HYDRATE_ATTR + "='false']", externalHeadElementSelectors);

        // === 2 phase hydrate - same order as server render should prevent hydration warnings ===:
        // 1. hydrate the app
        // 2. hydrate the <head>
        reactDomHtml.hydrateHtml(rootElement, appContainer, function () {
            // Remove any "hydrated" <head> elements after application is rendered
            // - required to prevent hydrated head elements being removed when we mount <head>
            // - these elements are re-applied to <head> after mounting
            var hydratedHeadTags = removeHeadElements(headDomNode, "[" + HTML_TAGS_HYDRATE_ATTR + "='true']", hydratedHeadElementSelectors);

            reactDomHtml.hydrateHtml(createHeadChildren(rootElement, htmlMetadata), headDomNode, function () {
                // After hydrating the head - re-apply any DOM nodes that were previously removed
                if (hydratedHeadTags.length > 0) {
                    hydratedHeadTags.forEach(function (tag) {
                        return headDomNode.appendChild(tag);
                    });
                }

                if (externalHeadTags.length > 0) {
                    externalHeadTags.forEach(function (tag) {
                        return headDomNode.appendChild(tag);
                    });
                }

                if (IS_DEV$5) {
                    var clientSnapshot = takeAttributeSnapshot();
                    compareSnapshots(serverSnapshot, clientSnapshot);
                }

                if (callback) {
                    callback();
                }
            });
        });
    });
}

function renderHtml(element) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var htmlMetadata = HtmlMetadata.createForClientRender();
    var container = options.container,
        callback = options.callback,
        externalHeadElementSelectors = options.externalHeadElementSelectors;


    if (externalHeadElementSelectors) {
        htmlMetadata.appendExternalHeadSelectors(externalHeadElementSelectors);
    }

    return prepareForRender(htmlMetadata, element, container, function (rootElement, appContainer) {
        reactDomHtml.renderHtml(rootElement, appContainer, callback);
    });
}

function prepareForRender(htmlMetadata, element, container, renderCallback) {
    var rootElement = withHtmlProvider(element, htmlMetadata);
    var appContainer = container || document.querySelector(reactDomHtml.getAppContainerProps(React.isValidElement(element) ? element : rootElement).querySelector);

    // Assign the container to the html metadata
    // - required for updating appContainer attributes
    htmlMetadata.setAppContainer(appContainer);

    // Invoke the render
    renderCallback(rootElement, appContainer);

    return function () {
        // Release the ref to the container DOM node
        htmlMetadata.setAppContainer(null);
    };
}

function compareSnapshots(serverSnapshot, clientSnapshot) {
    if (serverSnapshot.htmlAttributes !== clientSnapshot.htmlAttributes) {
        error("Warning: The hydrated html attributes do not match. Server: " + ("`" + serverSnapshot.htmlAttributes + "` Client: `" + clientSnapshot.htmlAttributes + "`."));
    }

    if (serverSnapshot.bodyAttributes !== clientSnapshot.bodyAttributes) {
        error("Warning: The hydrated body attributes do not match. Server: " + ("`" + serverSnapshot.bodyAttributes + "` Client: `" + clientSnapshot.bodyAttributes + "`."));
    }
}

function takeAttributeSnapshot() {
    return {
        htmlAttributes: snapshotAttributes(document.querySelector("html")),
        bodyAttributes: snapshotAttributes(document.querySelector("body"))
    };
}

// From MDN: https://developer.mozilla.org/en-US/docs/Web/API/Element/className
// The name className is used for this property instead of class because of conflicts with
// the "class" keyword in many languages which are used to manipulate the DOM.
var ATTRIBUTE_NAME_MAP = {
    classname: "class",
    className: "class"
};

function snapshotAttributes(element) {
    if (!element || !element.hasAttributes()) {
        return "";
    }

    var attributes = {};
    var elementAttributes = element.attributes;
    for (var i = elementAttributes.length - 1; i >= 0; i--) {
        attributes[elementAttributes[i].name] = elementAttributes[i].value;
    }

    return Object.keys(attributes).sort().reduce(function (snapshot, attributeName) {
        var attributeValue = attributes[attributeName];
        if (typeof attributeValue !== "undefined") {
            snapshot.push((ATTRIBUTE_NAME_MAP[attributeName] || attributeName) + "=\"" + attributeValue + "\"");
        }

        return snapshot;
    }, []).join(" ");
}

exports.Html = Html;
exports.withHtml = withHtml;
exports.renderHtml = renderHtml;
exports.hydrateHtml = hydrateHtml;
exports.HtmlProvider = HtmlProvider;
exports.HtmlMetadata = HtmlMetadata;
exports.withHtmlProvider = withHtmlProvider;
exports.createHeadChildren = createHeadChildren;
exports.default = Html;
