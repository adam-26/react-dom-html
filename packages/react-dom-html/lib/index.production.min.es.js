/*
 * Copyright 2018 @adam-26.
 * Copyrights licensed under the MIT License.
 * See the accompanying LICENSE file for terms.
 */

import{render,hydrate}from"react-dom";var DEFAULT_APP_ELEMENT_ID="app";function defaultTo(e,t){return"function"==typeof e?e():t}function getAppContainerProps(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=t.appContainerTagName,r=t.appContainerId,o=null===e?null:e.type,p=r||defaultTo(o&&o.getAppContainerId,DEFAULT_APP_ELEMENT_ID);return{tagName:n||defaultTo(o&&o.getAppContainerTagName,"div"),id:p,querySelector:"#"+p}}function getAppContainer(e){return document.querySelector(getAppContainerProps(e).querySelector)}function hydrateHtml(e,t,n){"function"==typeof t&&void 0===n&&(n=t,t=null),hydrate(e,t||getAppContainer(e),n)}function renderHtml(e,t,n){"function"==typeof t&&void 0===n&&(n=t,t=null),render(e,t||getAppContainer(e),n)}export{renderHtml,hydrateHtml,getAppContainerProps};
