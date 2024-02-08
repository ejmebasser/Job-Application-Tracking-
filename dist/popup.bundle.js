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


/***/ }),
/* 2 */,
/* 3 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createSheetLink: () => (/* binding */ createSheetLink),
/* harmony export */   saveSheet: () => (/* binding */ saveSheet),
/* harmony export */   toggleCogFunction: () => (/* binding */ toggleCogFunction),
/* harmony export */   updateSheet: () => (/* binding */ updateSheet)
/* harmony export */ });
/**
 * Function to handle the linkSheet button click event.
 */
function updateSheet() {
  const sheetElement = document.querySelector('#sheet');
  if (sheetElement.firstChild) {
    sheetElement.removeChild(sheetElement.firstChild);
  }

  const sheetInput = document.createElement('input');
  sheetInput.type = 'text';
  sheetInput.id = 'sheetUrl';
  sheetInput.placeholder = 'Enter Google Sheet URL';
  sheetInput.onkeydown = function (event) {
    if (event.key === 'Enter') {
      sheetURL = sheetInput.value;
      saveSheet();
    }
  };
  sheetElement.appendChild(sheetInput);

  toggleCogFunction(true);
}

/**
 * Function to handle the saveSheet button click event.
 */
function saveSheet() {
  const sheetElement = document.querySelector('#sheet');
  const sheetURL = sheetElement.querySelector('input').value;
  console.log(sheetURL);

  if (sheetElement.firstChild) {
    sheetElement.removeChild(sheetElement.firstChild);
  }
  if (!sheetURL) {
    const textElement = document.createElement('span');
    textElement.textContent = 'No Google Sheet URL provided';
    sheetElement.appendChild(textElement);
  } else {
    createSheetLink(sheetURL);

    chrome.runtime.sendMessage({ action: 'loadSheet', sheetURL: sheetURL });
  }

  toggleCogFunction(false);
}

function createSheetLink(sheetURL) {
  const sheetElement = document.querySelector('#sheet');

  const link = document.createElement('a');
  link.text = 'Open Google Sheet';
  link.href = sheetURL;
  link.target = '_blank';
  sheetElement.appendChild(link);
}

function toggleCogFunction(save = false) {
  const clickFunction = save ? saveSheet : updateSheet;
  const oldFunction = save ? updateSheet : saveSheet;

  const cog = document.querySelector('#linkSheet');
  cog.removeEventListener('click', oldFunction);
  cog.addEventListener('click', clickFunction);
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
/* harmony import */ var _utils_appScriptConnector_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var _sheet_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);




/**
 * Handling attaching mechanics after the DOM has been loaded.
 *
 * I have tested this and the query only sends the message to scrape when the popup is opened.
 */
document.addEventListener('DOMContentLoaded', function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: 'loadData' },
      function (response) {
        if (response) {
          updateForm(response);
        }
      }
    );
  });

  chrome.storage.local.get(['sheetURL'], function (result) {
    if (result.sheetURL) {
      (0,_sheet_js__WEBPACK_IMPORTED_MODULE_1__.createSheetLink)(result.sheetURL);
    }
  });

  const form = document.getElementById('jobForm');
  form.addEventListener('submit', function (event) {
    event.preventDefault();
  });

  (0,_sheet_js__WEBPACK_IMPORTED_MODULE_1__.toggleCogFunction)();
});

/**
 * Updates the form with the data from the website.
 *
 * @param {object} formData The object to populate the form with.
 */
function updateForm(formData) {
  for (const id in formData) {
    try {
      document.querySelector(`input[name="${id}"]`).value = formData[id];
    } catch (error) {
      console.log('id not found', id);
      console.error(error);
    }
  }

  const submit = document.getElementById('submitButton');
  submit.addEventListener(
    'click',
    debounce(() => handleSubmit(formData), 500)
  );
}

/**
 * Handles what happens when we submit data to the Google Sheet.
 *
 * @param {object} formJson
 */
function handleSubmit(formJson) {
  // submit the form data to Google Apps Script
  (0,_utils_appScriptConnector_js__WEBPACK_IMPORTED_MODULE_0__.submitFormData)(formJson)
    .then((response) => {
      if (response.ok) {
        appendResult('Data Submitted');
        removeSubmitButton();
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });

  // fetch the total jobs applied to from Google Apps Script
  (0,_utils_appScriptConnector_js__WEBPACK_IMPORTED_MODULE_0__.fetchTotalJobsApplied)()
    .then((totalJobs) => {
      logTotalJobs(totalJobs);
    })
    .catch((error) => {
      console.error('Error:', error);
    });

  // fetch the total jobs applied to today from Google Apps Script
  (0,_utils_appScriptConnector_js__WEBPACK_IMPORTED_MODULE_0__.fetchTotalJobsAppliedToday)()
    .then((jobsToday) => {
      logTotalJobsToday(jobsToday);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

/**
 * Removes the submit button from the popup.
 */
function removeSubmitButton() {
  var submitButton = document.getElementById('submitButton');
  if (submitButton) {
    submitButton.remove();
  }
}

/**
 * Display the total jobs applied to.
 *
 * @param {object} data The data returned from the Google Apps Script for the total jobs applied to.
 */
function logTotalJobs(data) {
  let jobsMessage = '';

  // Check if the data is in the expected nested array format
  if (data && Array.isArray(data) && data[0] && Array.isArray(data[0])) {
    const totalJobs = data[0][0];
    jobsMessage = `${totalJobs} jobs applied to in total`;
  } else {
    jobsMessage = 'Unable to find total jobs data';
  }

  appendResult(jobsMessage);
}

/**
 * Display the total jobs applied to today.
 *
 * @param {object} data The data returned from the Google Apps Script for the total jobs applied to today.
 */
function logTotalJobsToday(data) {
  let jobsMessage = '';

  // Check if the data is in the expected nested array format
  if (data && Array.isArray(data) && data[0] && Array.isArray(data[0])) {
    const totalJobsToday = data[0][0];
    jobsMessage = `${totalJobsToday} jobs applied to in total today`;
  } else {
    console.error('Data format is not as expected:', data); // Log unexpected data format
    jobsMessage = 'Unable to find total jobs data for today';
  }

  appendResult(jobsMessage);
}

/**
 * Append a message to the result div.
 *
 * @param {string} message The message to append.
 */
function appendResult(message) {
  const resultDiv = document.getElementById('result');
  const messageDiv = document.createElement('p');
  messageDiv.innerHTML = message;
  resultDiv.appendChild(messageDiv);
}

/**
 * Debounce function to limit the rate of function calls.
 *
 * @param {Function} func The function to debounce
 * @param {int} delay The delay in milliseconds
 * @returns function with debounce
 */
function debounce(func, delay) {
  let timeoutId;
  let called = false; // Flag to track if the function has been called already
  return function () {
    const context = this;
    const args = arguments;
    if (!called) {
      clearTimeout(timeoutId);
      called = true;
      timeoutId = setTimeout(() => {
        func.apply(context, args);
        called = false; // Reset the flag after the function is called
      }, delay);
    }
  };
}

})();

/******/ })()
;