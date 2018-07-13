// @flow
import {renderForError, warn} from "./util";
import {
    ELEMENT_ATTRIBUTE_TUPLES,
    HEAD_TAG_KEYS,
    NON_TAG_KEYS,
    TAG_NAMES,
    TITLE_TEMPLATE
} from "./constants";

const IS_DEV = process.env.NODE_ENV !== "production";

const TITLE_PLACEHOLDER = "[title]";

const NON_DETERMINISTIC_HELP_URL =
    "https://github.com/adam-26/react-dom-html/blob/master/docs/NON-DETERMINISTIC_HELP.md";

export default class HtmlContext {
    constructor(parent) {
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

    isServerStringRender(): boolean {
        return this._parent.isServerStringRender();
    }

    isPreLoaded(): boolean {
        return this._parent.isPreLoaded();
    }

    isServerRender(): boolean {
        return this._parent.isServerRender();
    }

    createChildContext() {
        return new HtmlContext(this);
    }

    hasChildren(): boolean {
        return this._children.length !== 0;
    }

    registerForceUpdateCallback(forceUpdateCallback) {
        if (forceUpdateCallback) {
            this._forceUpdateCallback = forceUpdateCallback;
            return () => {
                // Callback can be used during testing
                this._forceUpdateCallback = null;
            };
        }
    }

    unregisterForceUpdateCallback() {
        if (this._forceUpdateCallback) {
            // Ensure the callback ref is removed
            this._forceUpdateCallback = null;
        }
    }

    htmlComponentDidMount(forceUpdateCallback) {
        this._parent._children.push(this);
        this._clearProviderState();
        return this.registerForceUpdateCallback(forceUpdateCallback);
    }

    htmlComponentWillUnmount() {
        const idx = this._parent._children.indexOf(this);
        if (idx === -1) {
            if (IS_DEV) {
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

    forceComponentUpdate(updateCallback): boolean {
        if (this._forceUpdateCallback) {
            // invoke the callback before the update to increase the update count
            // it returns a function to be used as the forceUpdate callback that
            // is invoked after the update is complete
            this._forceUpdateCallback(updateCallback());
            return true;
        }

        return false;
    }

    ignoreNonDeterministicHtml(): boolean {
        return this._parent.ignoreNonDeterministicHtml();
    }

    setHtmlState(htmlState: Object, invalidateParentState?: boolean = false) {
        this._ownComponentState = htmlState;
        this._resolvedComponentState = null;
        // this._notifyParentOnChange();
        if (invalidateParentState) {
            // invalidate parent state, and re-render the HTML
            this._invalidateParentState(true); // TODO: To correctly render non-deterministic errors, don't ONLY reset _ownComponentState, assign it to an alternative var and use as backup when rendering the error message.
        }
    }

    // TODO: Rename -> _clearResolvedState()
    _clearProviderState(refreshHtmlRender?: boolean = false): void {
        if (IS_DEV) {
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
    notifyParentOnError(): void {
        if (this._parent) {
            this._parent.notifyParentOnError();
        }
    }

    // Attempts to resolve any non-deterministic html rendering errors
    resolveNonDeterministicErrors(callback): void {
        // TODO: Test this logic, may need to walk entire tree to all leaf nodes?
        if (this._isNonDeterministic()) {
            this._clearProviderState();
            if (this.forceComponentUpdate(callback)) {
                // force update here should also force all children to update
                return;
            }
        }

        // No "forceUpdate" function here - attempt to update children
        this._children.forEach(child => {
            child.resolveNonDeterministicErrors(callback);
        });
    }

    // Notify the parent that it needs to invalidate any cached child state
    _invalidateParentState(refreshHtmlRender?: boolean = false): void {
        if (this._parent) {
            this._parent._clearProviderState(refreshHtmlRender);
        }
    }

    resolveHtmlState(displayNonDeterministicWarnings?: boolean = false) {
        if (this._resolvedComponentState === null) {
            const childState = this._resolveChildHtmlState(displayNonDeterministicWarnings);
            this._resolvedComponentState =
                this._ownComponentState === null
                    ? childState
                    : this._mergeResolvedState(this._ownComponentState, childState, false);
        }

        return this._resolvedComponentState;
    }

    // resolve all child state to a single Object
    _resolveChildHtmlState(displayNonDeterministicWarnings?: boolean = false) {
        if (this._childrenComponentState === null) {
            const childProviderLen = this._children.length;
            if (childProviderLen === 0) {
                this._childrenComponentState = {};
            } else if (childProviderLen === 1) {
                this._childrenComponentState = this._children[0].resolveHtmlState(
                    displayNonDeterministicWarnings
                );
            } else {
                this._childrenComponentState = this._children.reduce((resolved, child) => {
                    return this._mergeResolvedState(
                        resolved,
                        child.resolveHtmlState(displayNonDeterministicWarnings),
                        displayNonDeterministicWarnings
                    );
                }, {});

                // Renders can only be non-deterministic when multiple children exist
                if (IS_DEV) {
                    if (this._isNonDeterministic()) {
                        this._logNonDeterministicWarnings();
                    }
                }
            }
        }

        if (IS_DEV) {
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

    _isNonDeterministic(): boolean {
        return this._nonDeterministicElements.length !== 0;
    }

    // TODO: Most of these can be static
    _mergeResolvedState(parent = {}, child = {}, displayNonDeterministicWarnings = false) {
        const mergedState = {};
        this._mergeTitleTemplate(mergedState, parent, child, displayNonDeterministicWarnings);
        this._mergeAttributes(
            mergedState,
            ELEMENT_ATTRIBUTE_TUPLES,
            parent,
            child,
            displayNonDeterministicWarnings,
            ["className"]
        ); // TODO: last prop -> CONST
        this._mergeElements(
            mergedState,
            HEAD_TAG_KEYS,
            parent,
            child,
            displayNonDeterministicWarnings
        );
        return mergedState;
    }

    _mergeTitleTemplate(mergedState, parent, child, displayNonDeterministicWarnings) {
        const hasParentTemplate = !!parent[TITLE_TEMPLATE];
        const hasChildTemplate = !!child[TITLE_TEMPLATE];

        if (hasParentTemplate || hasChildTemplate) {
            // Create an array of templates - reduce when rendering the title text
            mergedState[TITLE_TEMPLATE] = hasParentTemplate ? parent[TITLE_TEMPLATE].slice() : [];

            if (hasChildTemplate) {
                Array.prototype.push.apply(mergedState[TITLE_TEMPLATE], child[TITLE_TEMPLATE]);
            }

            if (IS_DEV) {
                /*
                 * This code will not run in production
                 */

                if (displayNonDeterministicWarnings && hasParentTemplate && hasChildTemplate) {
                    this._flagNonDeterministic(TAG_NAMES.TITLE, TITLE_TEMPLATE, ["template"]); // TODO: is last prop required here?
                }
            }
        }
    }

    _mergeAttributes(
        mergedState,
        tagTuples,
        parent,
        child,
        displayNonDeterministicWarnings,
        ignoreWarningKeys = []
    ) {
        tagTuples.forEach(([elementName, attributeKey]) => {
            if (parent[attributeKey] || child[attributeKey]) {
                mergedState[attributeKey] = this._mergeAttribute(
                    mergedState,
                    parent[attributeKey],
                    child[attributeKey],
                    elementName,
                    attributeKey,
                    displayNonDeterministicWarnings,
                    ignoreWarningKeys
                );
            }
        });
    }

    _mergeElements(
        mergedState,
        tagNames,
        parent,
        child,
        displayNonDeterministicWarnings,
        ignoreWarningKeys = []
    ) {
        tagNames.forEach(tagName => {
            if (parent[tagName] || child[tagName]) {
                mergedState[tagName] = this._mergeElement(
                    mergedState,
                    parent[tagName],
                    child[tagName],
                    tagName,
                    displayNonDeterministicWarnings,
                    ignoreWarningKeys
                );
            }
        });
    }

    _mergeAttribute(
        mergedState,
        parentElement,
        childElement,
        elementName,
        attributeKey,
        displayNonDeterministicWarnings,
        ignoreWarningKeys
    ) {
        if (IS_DEV) {
            /*
             * This code will not run in production
             */

            if (displayNonDeterministicWarnings) {
                if (parentElement && childElement) {
                    const uniquePropNames = getUniquePropNames(parentElement, childElement);

                    // Determine if there are any conflicting props
                    const nonDeterministicPropNames = uniquePropNames.reduce(
                        (propNames, uniqueKey) => {
                            if (ignoreWarningKeys.indexOf(uniqueKey) !== -1) {
                                // ignore the key
                                return propNames;
                            }

                            if (
                                !isUndefined(parentElement[uniqueKey]) &&
                                !isUndefined(childElement[uniqueKey])
                            ) {
                                propNames.push(uniqueKey);
                            }

                            return propNames;
                        },
                        []
                    );

                    if (nonDeterministicPropNames.length !== 0) {
                        this._flagNonDeterministic(
                            elementName,
                            attributeKey,
                            nonDeterministicPropNames
                        );
                    }
                }
            }
        }

        // "className" attributes need to be appended
        const hasParentClassNames = parentElement && Array.isArray(parentElement.className);
        const hasChildClassNames = childElement && Array.isArray(childElement.className);

        if (hasParentClassNames || hasChildClassNames) {
            const {className: parentClassName, ...parentAttributes} = parentElement || {};
            const {className: childClassName, ...childAttributes} = childElement || {};
            return {
                ...this._mergeTag(parentAttributes, childAttributes),
                className:
                    hasParentClassNames && hasChildClassNames
                        ? // Combine parent &child className(s), without duplicates
                          childClassName.reduce((classNames, className) => {
                              if (classNames.indexOf(className) === -1) {
                                  classNames.push(className);
                              }

                              return classNames;
                          }, parentClassName.slice())
                        : // Only parent classNames
                          (parentClassName && parentClassName.slice()) ||
                          // Only child classNames
                          (childClassName && childClassName.slice())
            };
        }

        return this._mergeTag(parentElement, childElement);
    }

    _mergeElement(
        mergedState,
        parentElement,
        childElement,
        elementName,
        displayNonDeterministicWarnings,
        ignoreWarningKeys
    ) {
        if (IS_DEV) {
            /*
             * This code will not run in production
             */

            if (displayNonDeterministicWarnings) {
                if (parentElement && childElement) {
                    const uniquePropNames = getUniquePropNames(parentElement, childElement);

                    // Determine the prop that are non-deterministic
                    uniquePropNames.forEach(propName => {
                        if (ignoreWarningKeys.indexOf(propName) !== -1) {
                            // ignore the key
                            return;
                        }

                        if (
                            !isUndefined(parentElement[propName]) &&
                            !isUndefined(childElement[propName])
                        ) {
                            const valuePropName = propName === elementName ? CHILDREN : propName;
                            this._flagNonDeterministic(elementName, propName, [valuePropName]);
                        }
                    });
                }
            }
        }

        return this._mergeTag(parentElement, childElement);
    }

    _mergeTag(parentElement, childElement) {
        return Object.assign({}, parentElement || {}, childElement || {});
    }

    // ==========================================================================
    // ========== Functions below this line are NOT used in PRODUCTION ==========
    // ==========================================================================

    // Walks the html tree, to determine the non-deterministic error(s) sibling(s)
    resolveNonDeterministicChildren(type, key, propNames) {
        // Ensure all state is resolved before attempting to render a descriptive error message
        // this.resolveHtmlState(false);

        // TODO: Why are error messages rendered when no component is currently registered with the context?
        // todo -> could this be avoided if non-deterministic errors were NOT rendered AFTER a "componentDidUnmount"???
        // todo    * if errors are rendered after unmount; it may be confusing for developers???
        // todo *** this CAN'T be done - must PREVENT errors being written during a FORCE-RENDER
        // todo *** - when this happens the written errors are NOT in a deterministic order (which adds more confusion)
        // const temporaryOwnState = this._ownComponentState || {};

        // render a developer-friendly error
        const errorNode = renderNonDeterministicNode(this._ownComponentState, type, key, propNames);

        let branch = [];
        const resolvedChildren =
            this._children.length === 0
                ? {}
                : this._children.reduce((resolved, child) => {
                      const [previousNode, childrenStates] = child.resolveNonDeterministicChildren(
                          type,
                          key,
                          propNames
                      );
                      if (previousNode[key]) {
                          branch = childrenStates.slice();
                      }

                      if (this._children.length === 1) {
                          return previousNode;
                      }

                      return this._mergeResolvedState(resolved, previousNode, false);
                  }, {});

        branch.unshift(errorNode);
        return [this._mergeResolvedState(this._ownComponentState, resolvedChildren), branch];
    }

    _logNonDeterministicWarnings() {
        // Log an error per non-deterministic element
        this._nonDeterministicElements.forEach(
            ([elementType, elementKey, nonDeterministicPropNames]) => {
                const siblingBranches = [];
                this._children.forEach(child => {
                    const [_, childNodes] = child.resolveNonDeterministicChildren(
                        elementType,
                        elementKey,
                        nonDeterministicPropNames
                    );
                    siblingBranches.push(`\n${childNodes.join("  <-  ")}`);
                });

                this._logNonDeterministicWarning(
                    elementType,
                    nonDeterministicPropNames,
                    siblingBranches.join("\n")
                );
            }
        );
    }

    _flagNonDeterministic(elementType, elementKey, nonDeterministicPropNames) {
        this._nonDeterministicElements.push([elementType, elementKey, nonDeterministicPropNames]);
    }

    _logNonDeterministicWarning(tagName, propNames, siblingValues) {
        const propName = propNames.join(", ");
        const propType = propNames.length === 1 ? "prop" : "props";
        const propTypePrefix = propNames.length === 1 ? " a " : " ";
        const tagDescriptor = `<${tagName}> "${propName}"`;
        warn(
            `WARNING: Non-deterministic ${tagDescriptor} ${propType}, ` + // ie: title template attribute
                `this occurs in a client render during the react update lifecycle when ` +
                `two or more sibling html elements define${propTypePrefix}${tagDescriptor} ${propType}, ` +
                `or sibling children define ${tagDescriptor} props that resolve to parent html siblings. ` +
                `The non-deterministic sibling branches are:\n\n${siblingValues}\n\n\n` +
                `Use the sibling branches to identify the non-deterministic components. ` +
                `For more information read ${NON_DETERMINISTIC_HELP_URL}`
        );
    }
}

const CHILDREN = "children";

function isUndefined(value) {
    return typeof value !== "undefined";
}

// TODO: Move to utils

function renderNonDeterministicNode(htmlState, type, key, propNames) {
    if (htmlState[key]) {
        // Elements and attributes store state differently - retrieve the required state
        const element =
            NON_TAG_KEYS.indexOf(key) === -1
                ? htmlState[type][key].props // elements are stored as nested React elements
                : htmlState[key]; // attributes are stored as Objects in state

        if (key === TITLE_TEMPLATE) {
            // special-case
            if (Array.isArray(element) && element.length === 1) {
                return renderForError(type, {template: element[0](TITLE_PLACEHOLDER)});
            }

            return renderForError(type, {template: "[Invalid template]"});
        }

        return renderForError(
            type,
            propNames.reduce((props, propName) => {
                if (typeof element[propName] !== "undefined") {
                    props[propName] = element[propName];
                }

                return props;
            }, {})
        );
    }

    return "<>";
}

function getUniquePropNames(parentProps, childProps) {
    return Object.keys(childProps).reduce((keys, key) => {
        if (keys.indexOf(key) === -1) {
            keys.push(key);
        }

        return keys;
    }, Object.keys(parentProps));
}
