// const { JSDOM } = require('jsdom');
import {
    render,
    shallow,
    mount,
    ShallowWrapper,
    ReactWrapper,
    configure,
    EnzymeAdapter
} from "enzyme";
// import Adapter from 'enzyme-adapter-react-16';
import Adapter from "./reactSixteenAdapter"; // Temporary workaround until new enzyme version is released
configure({adapter: new Adapter()});
// initJsDom();
export {render, shallow, mount, ShallowWrapper, ReactWrapper, configure, EnzymeAdapter};
// TODO: is this required? can it be removed?
// function initJsDom() {
//     const jsdom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>');
//     const { window } = jsdom;
//
//     function copyProps(src, target) {
//         const props = Object.getOwnPropertyNames(src)
//             .filter(prop => typeof target[prop] === 'undefined')
//             .reduce((result, prop) => ({
//                 ...result,
//                 [prop]: Object.getOwnPropertyDescriptor(src, prop),
//             }), {});
//         Object.defineProperties(target, props);
//     }
//
//     global.window = window;
//     global.document = window.document;
//     global.navigator = {
//         userAgent: 'node.js',
//     };
//     copyProps(window, global);
// }
