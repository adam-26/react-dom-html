// @flow
import {Readable} from "stream";
import {renderToNodeStream, renderToStaticNodeStream} from "react-dom/server";
import mapOptionsToState from "./mapOptionsToState";
import {
    createAppContainerElement,
    renderStaticOpeningTagFromElement,
    resolveAndRenderStaticOpeningTag,
    resolveOptionalElement
} from "./serverUtil";
import type {ElementType} from "../flowTypes";

export default class HtmlReadable extends Readable {
    constructor(element: ElementType, isStaticMarkup: boolean, options?: Object = {}) {
        const {
            htmlElement,
            bodyElement,
            headElement,
            appContainerElement,
            beforeAppContainerElement,
            afterAppContainerElement,
            headIsReactRoot,
            ...streamOptions
        } = mapOptionsToState(element, options);

        super(streamOptions);
        this._isStaticMarkup = isStaticMarkup;
        this._activeStream = null;
        this._rootElement = element;
        this._htmlElement = htmlElement;
        this._headElement = headElement;
        this._headIsReactRoot = headIsReactRoot;
        this._bodyElement = bodyElement;
        this._beforeAppContainerElement = beforeAppContainerElement;
        this._afterAppContainerElement = afterAppContainerElement;
        this._appContainerElement = appContainerElement;
        this._appContainerElementType = null;

        // All other props must be set before invoking _getReaders()
        this._readers = this._getReaders();
    }

    _getReaders() {
        const readers = [
            callback => this._readHtmlOpenTags(callback),
            callback => this._readHead(callback),
            callback => this._readBodyOpenTag(callback)
        ];

        if (this._beforeAppContainerElement) {
            readers.push(callback =>
                this._readStaticNodeStream(resolveOptionalElement(this._beforeAppContainerElement), callback)
            );
        }

        Array.prototype.push.apply(readers, [
            callback => this._readAppOpenTag(callback),
            callback => this._readHtmlApp(callback),
            callback => this._readAppCloseTag(callback)
        ]);

        if (this._afterAppContainerElement) {
            readers.push(callback =>
                this._readStaticNodeStream(resolveOptionalElement(this._afterAppContainerElement), callback)
            );
        }

        readers.push(callback => this._readHtmlCloseTags(callback));
        return readers;
    }

    _read(size: number): void {
        // ignore the size argument
        // the internal streams can write until internal buffer is full
        this._readNext(this._readers, () => {
            this._signalComplete();
        });
    }

    _readNext(readers, callback) {
        if (readers.length === 0) {
            // all readers have been read
            return callback();
        }

        if (this._activeStream) {
            // resume the active streamResponse
            return this._activeStream.resume();
        }

        const writer = readers.shift();
        writer(pushNext => {
            if (pushNext) {
                // Continue reading chunks
                this._readNext(readers, callback);
            }
        });
    }

    _readHtmlOpenTags(callback) {
        this._pushMarkup(resolveAndRenderStaticOpeningTag(this._htmlElement), callback);
    }

    _readHead(callback) {
        if (typeof this._headElement === "string") {
            // The head has been pre-rendered and assigned as a string
            return this._pushMarkup(this._headElement, callback);
        }

        // Document head(s) can be large, use a stream to render the head
        const headEl = resolveOptionalElement(this._headElement);
        if (this._isStaticMarkup || !this._headIsReactRoot) {
            return this._readStaticNodeStream(headEl, callback);
        }

        this._readNodeStream(headEl, callback);
    }

    _readBodyOpenTag(callback) {
        this._pushMarkup(resolveAndRenderStaticOpeningTag(this._bodyElement), callback);
    }

    _readAppOpenTag(callback) {
        const appContainerEl = resolveOptionalElement(this._appContainerElement);
        this._appContainerElementType = appContainerEl.type;
        this._pushMarkup(renderStaticOpeningTagFromElement(appContainerEl), callback);
    }

    _readAppCloseTag(callback) {
        this._pushMarkup(`</${this._appContainerElementType}>`, callback);
    }

    _readHtmlApp(callback) {
        if (this._isStaticMarkup) {
            return this._readStaticNodeStream(this._rootElement, callback);
        }

        this._readNodeStream(this._rootElement, callback);
    }

    _readHtmlCloseTags(callback) {
        this._pushMarkup("</body></html>", callback);
    }

    _signalComplete() {
        // Signal complete
        this.push(null);
    }

    _pushChunk(chunk: Buffer | string | null, encoding?: string) {
        return this.push(chunk, encoding);
    }

    _pushMarkup(markup, callback) {
        if (!this._pushChunk(markup, "utf8")) {
            return callback(false);
        }

        callback(true);
    }

    _emitError(err) {
        this.emit("error", err);
    }

    _readNodeStream(element, callback) {
        const stream = (this._activeStream = renderToNodeStream(element));
        this._readStream(stream, callback);
    }

    _readStaticNodeStream(element, callback) {
        const stream = (this._activeStream = renderToStaticNodeStream(element));
        this._readStream(stream, callback);
    }

    _readStream(stream, callback) {
        stream.on("error", err => {
            // the 'error' event ends the streamResponse - the 'end' event will not fire.
            this._emitError(err);
        });
        stream.on("end", () => {
            this._activeStream = null;
            callback(true);
        });
        stream.on("data", chunk => {
            if (!this._pushChunk(chunk)) {
                return callback(false);
            }

            callback(true);
        });
    }
}
