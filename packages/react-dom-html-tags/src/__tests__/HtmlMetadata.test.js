import HtmlMetadata from "../HtmlMetadata";

describe("HtmlMetadata", () => {
    // TODO: Update tests for new API

    describe("_getInternalState", () => {
        test("returns internal state", () => {
            const stateEntry = {title: "hello"};
            const state = [stateEntry];
            const md = new HtmlMetadata(true, false, state);

            expect(md._getInternalState()[0]).toEqual(stateEntry);
        });
    });

    describe("markHydrated", () => {
        test("does not set flag when state is empty", () => {
            const md = new HtmlMetadata(true, false, []);
            md.markHydrated();

            expect(md._hydrationMark).toBe(-1);
        });

        test("sets flag zero when no metadata appended after ctor", () => {
            const md = new HtmlMetadata(true, false, [{title: "hello"}]);
            md.markHydrated();

            expect(md._hydrationMark).toBe(1);
        });

        test("does not set flag when flag previously set", () => {
            const md = new HtmlMetadata(true, false, [{title: "hello"}]);
            md.appendMetadata({title: "world"});
            md.markHydrated();

            expect(md._hydrationMark).toBe(2);

            md.appendMetadata({title: "world"});
            md.markHydrated();
            expect(md._hydrationMark).toBe(2); // verify not changed
        });
    });

    describe("htmlComponentDidMount", () => {
        test("queues a render to refresh all DOM metadata", () => {
            const md = new HtmlMetadata(false, false, []);
            md.notifySubscribers = jest.fn();

            md.htmlComponentDidMount();

            expect(md.notifySubscribers.mock.calls).toHaveLength(1);
        });

        test("does not remove appended metadata when none has been appended", () => {
            const md = new HtmlMetadata(true, false, []);
            md.notifySubscribers = jest.fn();

            expect(md._hydrationMark).toBe(-1);
            md.htmlComponentDidMount();

            expect(md._hydrationMark).toBe(-1);
            expect(md.notifySubscribers.mock.calls).toHaveLength(1);
        });

        test("removes hydrated metadata after hydrating client", () => {
            const initialState = {title: "hello"};
            const md = new HtmlMetadata(true, false, [initialState]);
            md.notifySubscribers = jest.fn();

            md.markHydrated(); // flag as hydrating
            expect(md._hydrationMark).toBe(1);

            md.appendMetadata({title: "world"}); // append additional md - will be removed after mount
            md.htmlComponentDidMount(); // flag as mounted

            expect(md._hydrationMark).toBe(-1); // reset
            expect(md._getInternalState()).toHaveLength(1);
            expect(md._getInternalState()[0].title).toBe("world");
            expect(md.notifySubscribers.mock.calls).toHaveLength(1);
        });
    });

    describe("update", () => {
        test("does nothing on server render", () => {
            const md = new HtmlMetadata(false, false, []);

            expect(md._getInternalState()).toHaveLength(0);
            md.update({}, {});
            expect(md._getInternalState()).toHaveLength(0);
        });

        test("appends metadata on client hydration", () => {
            const md = new HtmlMetadata(true, false, []);
            const newMd = {title: "hello"};
            md.update({}, newMd);

            expect(md._getInternalState()[0]).toEqual(newMd);
        });

        test("removes previous metadata on client render", () => {
            const oldMd = {title: "hello"};
            const newMd = {title: "world"};
            const md = new HtmlMetadata(false, false, [oldMd]);
            md.notifySubscribers = jest.fn();

            md.update(oldMd, newMd);

            expect(md._getInternalState()[0]).toEqual(newMd);
            expect(md.notifySubscribers.mock.calls).toHaveLength(1);
        });
    });

    describe("onChange", () => {
        test("subscribers are notified of change events", () => {
            const md = new HtmlMetadata(false, false, []);
            const mockCb = jest.fn();
            const unsubscribe = md.onChange(mockCb);

            md.notifySubscribers();
            expect(mockCb.mock.calls).toHaveLength(1);

            unsubscribe();
            expect(md._onChangeSubscribers).toHaveLength(0);
        });
    });
});
