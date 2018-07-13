import React from "react";
import HtmlReadable from "../server/HtmlReadable";

function createListComponent(length = 100) {
    const listItems = [];
    for (let i = 0; i < length; i++) {
        listItems.push(<li key={i}>List Item</li>);
    }

    return () => <ul>{listItems}</ul>;
}

describe("HtmlReadable", () => {
    describe("read", () => {
        test("should pause and resume without error", done => {
            const TestComponent = createListComponent();
            const readable = new HtmlReadable(<TestComponent />, false);

            let readLength = 0;
            let error = null;
            readable.on("data", chunk => {
                readLength += chunk.length;

                readable.pause();
                setTimeout(() => readable.resume(), 5);
            });

            readable.on("error", err => {
                error = err;
            });

            readable.on("end", () => {
                expect(error).toBe(null);
                expect(readLength > 0).toBe(true);
                done();
            });
        });

        test("should stop reading data when requested # bytes are returned", done => {
            const TestComponent = createListComponent(100000);
            const readable = new HtmlReadable(<TestComponent />, false);

            let len = 0;
            let readCount = 0;
            readable.on("readable", function() {
                // there is some data to read now
                let data;

                while ((data = this.read(10))) {
                    len += data.length;
                    readCount += 1;
                }
            });

            readable.on("end", function() {
                expect(len > 0).toBe(true);
                expect(readCount > 1).toBe(true);
                done();
            });
        });

        test("should not continue processing internal stream (_readStream) when internal buffer is full", done => {
            const TestComponent = createListComponent(100000);
            const readable = new HtmlReadable(<TestComponent />, false);

            let len = 0;
            let readCount = 0;
            readable.on("readable", function() {
                // there is some data to read now
                let data;

                // Use the timeout to allow internal buffer to fill
                // - once full, the internal stream should stop reading data
                // -> without this test the _readStream() method is not fully covered
                setTimeout(() => {
                    while ((data = this.read(1000))) {
                        len += data.length;
                        readCount += 1;
                    }
                }, 100);
            });

            readable.on("error", function(err) {
                done(err);
            });

            readable.on("end", function() {
                expect(len > 0).toBe(true);
                expect(readCount > 1).toBe(true);
                done();
            });
        });

        test("should emit error", done => {
            // Create an invalid React element so the stream is forced to emit an error
            const readable = new HtmlReadable(React.createElement("div", null, new Error()), false);

            readable.on("data", () => {});
            readable.on("error", err => {
                expect(err).not.toBeUndefined();
                done();
            });
        });

        test("render using low-level options with string head element", done => {
            const TestComponent = createListComponent();
            const readable = new HtmlReadable(<TestComponent />, false, {
                htmlElement: <html />,
                bodyElement: <body />,
                headElement: "<head><title>Title</title></head>",
                appContainerElement: <div id="app" />
            });

            let readLength = 0;
            let error = null;
            readable.on("data", chunk => {
                readLength += chunk.length;

                readable.pause();
                setTimeout(() => readable.resume(), 5);
            });

            readable.on("error", err => {
                error = err;
            });

            readable.on("end", () => {
                expect(error).toBe(null);
                expect(readLength > 0).toBe(true);
                done();
            });
        });
    });
});
