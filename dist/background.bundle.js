/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   fetchTotalJobsApplied: () => (/* binding */ fetchTotalJobsApplied),
/* harmony export */   fetchTotalJobsAppliedToday: () => (/* binding */ fetchTotalJobsAppliedToday),
/* harmony export */   submitFormData: () => (/* binding */ submitFormData)
/* harmony export */ });
const doPostUrl =
  'https://script.google.com/macros/s/AKfycbwr3w6msxSLbQaKl_ohpZbng0M3gRojzqqiOorKoreVKMLjky64ZzRDJfWAR4h28Hdyxg/exec';

/**
 * Submits the form data to the Google Sheet.
 *
 * @param {object} formData The form data to be saved in the Google Sheet.
 * @returns the Promise returned by the fetch request, or nothing if there is an error.
 */
function submitFormData(formData) {
  // I'm not quite sure how to handle the fetch request with error in this split version
  return fetch(doPostUrl + '?action=addRow', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  }).catch((error) => console.error('Error:', error));
}

/**
 * Fetches the result for the getTotalJobs action from the Google Apps Script.
 *
 * @returns the response data returned by the fetch request, or nothing if there is an error.
 */
function fetchTotalJobsApplied() {
  // Fetch request using baseURL with a different action parameter
  return fetch(doPostUrl + '?action=getTotalJobs', {
    method: 'GET',
  })
    .then((response) => {
      return response.json();
    })
    .catch((error) => console.error('Error fetching total jobs:', error));
}

/**
 * Fetches the result for the getDailyTotal action from the Google Apps Script.
 *
 * @returns the response data returned by the fetch request, or nothing if there is an error.
 */
function fetchTotalJobsAppliedToday() {
  return fetch(doPostUrl + '?action=getDailyTotal', {
    method: 'GET',
  })
    .then((response) => {
      return response.json();
    })
    .catch((error) => {
      console.error('Error fetching total jobs today:', error);
    });
}


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils_appScriptConnector__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);


// function that injects code to a specific tab
function injectScript(tabId) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ['dist/inject.bundle.js'],
  });
}

// adds a listener to tab change
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // check for a URL in the changeInfo parameter (url is only added when it is changed)
  if (changeInfo.url) {
    injectScript(tabId);
  }

  // check if chrome has a runtime error as the last error,
  // if it does, then inject the script
  if (chrome.runtime.lastError) {
    injectScript(tabId);
  }
});

let sheetURL = null;

/**
 *  Adds a listener for the 'loadSheet' action.
 *  This will save the sheetURL to the chrome storage.
 */
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'loadSheet') {
    chrome.storage.local.set({ sheetURL: message.sheetURL });
  }

  if (message.action === 'saveJob') {
    sendResponse((0,_utils_appScriptConnector__WEBPACK_IMPORTED_MODULE_0__.submitFormData)(message.formData));
  }
});

/**
 * This will load the sheetURL from the chrome storage when the extension is loaded.
 */
chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.local.get(['sheetURL'], function (result) {
    if (result.sheetURL) {
      sheetURL = result.sheetURL;
    }
  });
});

})();

/******/ })()
;