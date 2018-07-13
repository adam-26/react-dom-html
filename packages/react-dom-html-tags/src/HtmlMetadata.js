// @flow
import {createElement} from "react";
import invariant from "invariant";
import {render, unmountComponentAtNode} from "react-dom";
import {getAppContainerProps} from "react-dom-html";
import HtmlContext from "./HtmlContext";
import {
    message,
    warn,
    getDomElementAttributeNames,
    reduceAttributes,
    HTML_TAGS_HYDRATE_ATTR
} from "./util";
import {
    ATTRIBUTE_KEYS,
    HEAD_TAG_KEYS,
    ATTRIBUTE_KEY_NAMES,
    TAG_NAMES,
    TITLE_TEMPLATE,
    ELEMENT_ATTRIBUTE_TUPLES
} from "./constants";
import {mapHeadElementToState} from "./mapHtmlToState";
import {renderToStaticMarkup} from "react-dom/server";

const IS_DEV = process.env.NODE_ENV !== "production";

const DIV = "div";
const DATA_REACT_ROOT_ATTR = "data-reactroot";

const defaultOptions = {
    isHydrating: false,
    isServerRender: false,
    isStreamRender: false
};

// The keys used to order the FIRST components in the <head> element
const defaultPriorityComponentKeys = [
    "meta:charSet",
    "meta:httpEquiv=X-UA-Compatible",
    "meta:name=viewport",
    TAG_NAMES.TITLE
];

export default class HtmlMetadata {
    // TODO: Add required vars here...
    _isHydratingClient: boolean;

    /**
     * Create a new metadata instance for a client render.
     *
     * @returns {HtmlMetadata}
     * @public
     */
    static createForClientRender() {
        return new HtmlMetadata();
    }

    /**
     * Create a new metadata instance for hydrating a client.
     * @returns {HtmlMetadata}
     * @public
     */
    static createForClientHydrate() {
        return new HtmlMetadata({
            isHydrating: true
        });
    }

    /**
     * Create a new metadata instance for a server stream render.
     * @returns {HtmlMetadata}
     * @public
     */
    static createForServerStreamRender() {
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
    static createForServerStringRender() {
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
    constructor(options?: Object = {}) {
        const {isHydrating, isServerRender, isStreamRender} = Object.assign(
            {},
            defaultOptions,
            options
        );

        this._htmlContext = new HtmlContext(this);
        this._priorityComponentKeys = defaultPriorityComponentKeys;
        this._externalHeadElementSelectors = [`[${HTML_TAGS_HYDRATE_ATTR}]`];
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

    getRootContext() {
        return this._htmlContext;
    }

    appendExternalHeadSelectors(externalHeadElementSelectors): void {
        if (externalHeadElementSelectors && externalHeadElementSelectors.length !== 0) {
            if (Array.isArray(externalHeadElementSelectors)) {
                Array.prototype.push.apply(
                    this._externalHeadElementSelectors,
                    externalHeadElementSelectors
                );
            } else {
                this._externalHeadElementSelectors.push(externalHeadElementSelectors);
            }
        }
    }

    getExternalHeadSelectors(): string {
        return this._externalHeadElementSelectors;
    }

    _clearProviderState(refreshHtmlRender?: boolean = false): void {
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

    startComponentLifecycle(): void {
        if (!this._isPreloaded && this.getRootContext().hasChildren()) {
            // Metadata was pre-loaded, outside of the react render lifecycle
            // - this flag prevents metadata being loaded again during the
            //   react component lifecycle methods.
            this._isPreloaded = true;
        }
    }

    isPreLoaded(): boolean {
        return this._isPreloaded;
    }

    isHtmlProviderMounted(): boolean {
        return this._isHtmlProviderMounted;
    }

    isHeadMounted(): boolean {
        return this._isHeadMounted;
    }

    headDidMount(doneCallback) {
        if (!this._isHeadMounted) {
            this._isHeadMounted = true;
        }

        // Update all metadata after the application has mounted
        // - this should resolve to the initial server render
        this.notifySubscribers(doneCallback);
    }

    htmlProviderDidMount(forceUpdateCallback) {
        if (!this._isHtmlProviderMounted) {
            this._isHtmlProviderMounted = true;
            return this._htmlContext.registerForceUpdateCallback(forceUpdateCallback);
        }
    }

    htmlProviderWillUnmount() {
        if (this._isHtmlProviderMounted) {
            this._isHtmlProviderMounted = false;
            this._htmlContext.unregisterForceUpdateCallback();
        }
    }

    isNonDeterministic(): boolean {
        return this._isNonDeterministic === true;
    }

    // Notify the parent the render has resulted in non-deterministic html
    notifyParentOnError(): void {
        if (!this.ignoreNonDeterministicHtml() && !this.isNonDeterministic()) {
            this._isNonDeterministic = true;
        }
    }

    // Attempts to resolve any non-deterministic html rendering errors
    resolveNonDeterministicErrors(): void {
        if (IS_DEV) {
            if (
                this._nonDeterministicUpdateCounter === 0 &&
                !this.ignoreNonDeterministicHtml() &&
                this.isNonDeterministic()
            ) {
                warn(
                    `'forceRender()' has been used to resolve non-deterministic html. ` +
                        `To avoid additional renders, fix the non-deterministic behavior or ` +
                        `set the HtmlProvider "suppressNonDeterministicWarnings" prop.`
                );

                // Pass a callback that increments the count when an update is being performed
                // and return a function that will decrease the counter after the update has
                // completed - this prevents a recursive update cycle.
                this._htmlContext.resolveNonDeterministicErrors(() => {
                    // Increment the active update counter
                    this._nonDeterministicUpdateCounter++;

                    // Return a function to decrease the counter after the update is finished
                    return () => {
                        // Decrease the active update counter
                        this._nonDeterministicUpdateCounter--;

                        if (this._nonDeterministicUpdateCounter === 0) {
                            // reset the deterministic flag
                            this._isNonDeterministic = false;

                            // Prime the cache, don't display any non-deterministic errors after forced update
                            this._getInternalState(false);

                            // Force the metadata to update
                            this.notifySubscribers();
                        }
                    };
                });
            }
        }
    }

    setIgnoreNonDeterministicHtml(ignore?: boolean = true) {
        this._ignoreNonDeterministicHtml = ignore;
    }

    ignoreNonDeterministicHtml(): boolean {
        return this._ignoreNonDeterministicHtml === true;
    }

    /**
     * appendHtmlState
     *
     * Used to append state externally of the react lifecycle.
     * @param htmlState
     * @public
     */
    appendHtmlState(htmlState): void {
        const childContext = this.getRootContext().createChildContext();
        childContext.htmlComponentDidMount();
        childContext.setHtmlState(htmlState);
    }

    appendHead(headElement: mixed): void {
        // The "rootContext" is used by the <HtmlProvider>
        // - it never has any htmlState directly assigned to it
        // - therefore, its safe to assign state to the root context here
        this.getRootContext().setHtmlState(mapHeadElementToState(headElement));
    }

    _getInternalState(displayNonDeterministicWarnings?: boolean = this.isHtmlProviderMounted()) {
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
    serializeState(renderToString: element => string): Object {
        invariant(
            this.isServerRender(),
            message("`serializeState` is not supported on the client.")
        );
        invariant(
            typeof renderToString === "function",
            message("`serializeState()` requires a 'renderToString' function argument.")
        );
        const {headAttributes, ...attributes} = this.getServerAttributes();
        return {
            ...attributes,
            head: renderToString(
                createElement(
                    TAG_NAMES.HEAD,
                    headAttributes,
                    createElement(this._headFragment, this.getHeadComponents())
                )
            )
        };
    }

    /**
     * Assigns the serialized state to be used for the current render.
     *
     * This prevents component HTML metadata from rendered used for the current render.
     *
     * @param serializedState
     * @public
     */
    useSerializedState(serializedState): void {
        invariant(
            this.isServerRender(),
            message("`useSerializedState` is not supported on the client.")
        );

        // Set "preLoaded" flag to prevent loading metadata unnecessarily
        this._isPreloaded = true;
        this._serializedState = serializedState;
    }

    _hasSerializedState(): boolean {
        return this._serializedState !== null;
    }

    _getSerializedState(): Object {
        return this._serializedState;
    }

    getHeadComponents() {
        if (!this._headComponentCache) {
            const htmlState = this._getInternalState();
            this._headComponentCache = reduceStateToComponents(
                HEAD_TAG_KEYS,
                htmlState,
                this._priorityComponentKeys
            );
        }

        return this._headComponentCache;
    }

    getServerAttributes(element, appContainerOptions) {
        const {tagName, id} = getAppContainerProps(element, appContainerOptions);
        return {appTagName: tagName, ...this.getAttributes({id})};
    }

    getAttributes(applicationAttributes?: Object = null) {
        // The "applicationAttributes" should never change - so a single cache is ok
        // - the appAttributes are only passed once on initial server render.
        if (!this._attributeCache) {
            const htmlState = this._getInternalState();

            this._attributeCache = ATTRIBUTE_KEYS.reduce((attributes, attributeKey) => {
                const attributeValues = htmlState[attributeKey];
                const hasAppAttributes =
                    attributeKey === ATTRIBUTE_KEY_NAMES.APP && applicationAttributes !== null;

                if (hasAppAttributes || typeof attributeValues !== "undefined") {
                    attributes[attributeKey] = reduceAttributes(
                        attributeValues,
                        hasAppAttributes ? applicationAttributes : {}
                    );
                }

                return attributes;
            }, {});
        }

        return this._attributeCache;
    }

    setAppContainer(appContainer) {
        // This is only required for browser render
        this._appContainer = appContainer;
    }

    _getDomAttributesToRemove(tagName: string, domNode): Array {
        if (typeof this._appliedAttributes[tagName] === "undefined") {
            // initialize applied attributes from DOMNode
            this._appliedAttributes[tagName] = getDomElementAttributeNames(domNode);

            // Remove the "data-reactroot" attribute, so its not removed from the DOM.
            const reactRootIdx = this._appliedAttributes[tagName].indexOf(DATA_REACT_ROOT_ATTR);
            if (reactRootIdx !== -1) {
                this._appliedAttributes[tagName].splice(reactRootIdx, 1);
            }

            if (tagName === TAG_NAMES.APP) {
                // Prevent the app container "id" attribute from being removed
                const idIdx = this._appliedAttributes[tagName].indexOf("id");
                if (idIdx !== -1) {
                    this._appliedAttributes[tagName].splice(idIdx, 1);
                }
            }
        }

        return this._appliedAttributes[tagName].slice();
    }

    _setDomAttributesFor(tagName: string, values: Array<string>): void {
        this._appliedAttributes[tagName] = values;
    }

    renderAttributes() {
        /*
         * Utilize React to render all attributes
         * This ensures document-level attributes are consistent
         * with application attributes, and reduces code complexity.
         */

        if (this.isServerRender()) {
            throw new Error(message("can not render attributes on server"));
        }

        // TODO: This really needs to be tested as part of CI process - using KARMA

        const attributes = this.getAttributes();
        // console.log(attributes);
        ELEMENT_ATTRIBUTE_TUPLES.forEach(([tagName, attributeKey]) => {
            const tagAttributes = attributes[attributeKey];
            const domNode =
                tagName === TAG_NAMES.APP ? this._appContainer : document.querySelector(tagName);

            const attributeNamesToRemove = this._getDomAttributesToRemove(tagName, domNode);

            if (typeof tagAttributes !== "undefined") {
                // Use react-dom to render to a temporary node
                const tempNode = document.createElement(DIV);
                render(createElement(DIV, tagAttributes), tempNode, () => {
                    const tempRenderedNode = tempNode.childNodes[0];

                    const domAttributeNames = getDomElementAttributeNames(tempRenderedNode);
                    domAttributeNames.forEach(attributeName => {
                        const attributeValue = tempRenderedNode.getAttribute(attributeName);

                        if (domNode.hasAttribute(attributeName)) {
                            if (domNode.getAttribute(attributeName) !== attributeValue) {
                                // Replace the attribute value
                                domNode.setAttribute(attributeName, attributeValue);
                            }
                        } else {
                            // Add the attribute
                            domNode.setAttribute(attributeName, attributeValue);
                        }

                        const removeIdx = attributeNamesToRemove.indexOf(attributeName);
                        if (removeIdx !== -1) {
                            attributeNamesToRemove.splice(removeIdx, 1);
                        }
                    });

                    // update state with current attribute names
                    this._setDomAttributesFor(tagName, domAttributeNames);

                    // Unmount the temp component
                    unmountComponentAtNode(tempNode);

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

    notifySubscribers(doneCallback) {
        const self = this;
        let subscriberCount = 0;
        const subscriberLen = this._onChangeSubscribers.length;

        self._onChangeSubscribers.forEach(subscriber =>
            subscriber(() => {
                subscriberCount++;
                if (subscriberCount === subscriberLen && typeof doneCallback === "function") {
                    doneCallback();
                }
            })
        );
    }

    /**
     * Subscribe to be notified when metadata changes. Be sure to unsubscribe to prevent memory leaks.
     *
     * @param callback
     * @returns {unsubscribe}
     */
    onChange(callback): () => void {
        const self = this;
        self._onChangeSubscribers.push(callback);

        return function unsubscribe() {
            const idx = self._onChangeSubscribers.indexOf(callback);
            if (idx > -1) {
                self._onChangeSubscribers.splice(idx, 1);
            }
        };
    }

    setPriorityComponentKeys(keys: Array<string>): void {
        this._priorityComponentKeys = keys;
    }

    setHeadFragment(headFragment) {
        this._headFragment = headFragment;
    }

    setRenderedHeadFragment(headFragment) {
        this._renderedHeadFragment = headFragment;
    }

    didRenderCorrectHeadFragment() {
        if (this.isHydratingClient()) {
            return this._renderedHeadFragment === this._headFragment;
        }

        return true;
    }

    isClientRender(): boolean {
        return !this._isServerRender;
    }

    isHydratingClient(): boolean {
        return this.isClientRender() && this._isHydratingClient === true;
    }

    isRenderingClient(): boolean {
        return this.isClientRender() && this._isHydratingClient === false;
    }

    isServerRender(): boolean {
        return this._isServerRender;
    }

    isServerStreamRender(): boolean {
        return this.isServerRender() && this._isServerStreamRender;
    }

    isServerStringRender(): boolean {
        return this.isServerRender() && !this._isServerStreamRender;
    }

    setStaticServerRender(isStaticServerRender: boolean) {
        this._isStaticServerRender = isStaticServerRender;
    }

    isServerStaticRender(): boolean {
        return this.isServerRender() && this._isStaticServerRender;
    }
}

function removeAttributesFromDomNode(attributesToRemove: Array<String>, domNode) {
    if (domNode !== null) {
        // Remove remaining attribute values
        attributesToRemove.forEach(attributeName => {
            if (domNode.hasAttribute(attributeName)) {
                domNode.removeAttribute(attributeName);
            }
        });
    }
}

const TITLE = TAG_NAMES.TITLE;
function reduceStateToComponents(tagNames, state, priorityTagKeys = []) {
    const priorityComponents = {};
    const tagComponents = tagNames.reduce((tags, tagName) => {
        const tagComponents = state[tagName];
        if (typeof tagComponents === "undefined") {
            return tags;
        }

        if (tagName === TITLE) {
            // special-case: render title using templates
            if (state[TITLE_TEMPLATE] || state[TITLE]) {
                const {children: titleText, ...titleAttributes} =
                    state[TITLE] && state[TITLE].title ? state[TITLE].title.props : {children: ""};

                const resolvedTitleText =
                    state.titleTemplate && state.titleTemplate.length > 0
                        ? // rightReduce template to generate the title text using template functions
                          state.titleTemplate.reduceRight((title, template) => {
                              return template(title);
                          }, titleText)
                        : // fallback to using a plain title text
                          titleText;

                const titleElement = createElement(
                    TITLE,
                    {
                        key: resolvedTitleText,
                        ...titleAttributes
                    },
                    resolvedTitleText
                );

                if (priorityTagKeys.indexOf(TITLE) !== -1) {
                    priorityComponents[TITLE] = titleElement;
                } else {
                    // Include the title as the key
                    tags[tagName] = [titleElement];
                }
            }

            return tags;
        }

        const namedTags = Object.keys(tagComponents).reduce((components, key) => {
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
    let hasOrderedComponents = false;
    const orderedComponents = priorityTagKeys.reduce((components, key) => {
        const orderedComponent = priorityComponents[key];
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
