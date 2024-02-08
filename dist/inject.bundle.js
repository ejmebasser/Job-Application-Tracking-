/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
// Add a listener to listen for the 'loadData' action.
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'loadData') {
    const pageUrl = window.location.href;

    const pageMap = parseUrl(pageUrl);
    // Store data in Chrome's local storage and send response
    chrome.storage.local.set(pageMap, function () {
      sendResponse(pageMap);
    });

    return true; // Indicates that the response is asynchronous
  }
});

/**
 * Formats the current time as "MM/DD/YYYY HH:MM:SS".
 *
 * @returns {string} The formated date and time.
 */
function formatCurrentDateTime() {
  const now = new Date();
  const date = now.toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const time = now.toLocaleTimeString('en-GB');
  return `${date} ${time}`;
}

/**
 * Get the URL of the current job. If the selector is not found, return the current URL.
 *
 * @param {string} selector The CSS selector to find the URL.
 * @return {string} The URL of the current job.
 */
function getURL(selector) {
  const link = document.querySelector(selector);
  return link ? link.href : window.location.href;
}

/**
 * Get the text from within a selected element. If the selector is not found, return an empty string.
 *
 * @param {text} selector The CSS selector to find the element.
 * @returns {string} The text of the current element.
 */
function getText(selector) {
  return document.querySelector(selector)?.textContent.trim() || '';
}

/**
 * Parses the URL of the current job application page using a map of site
 * specific CSS tags and returns the data for storage in the Google Sheet.
 * The keys in the urlMap object are used as RegEx patterns to match the current URL.
 *
 * @param {string} url The current URL of the job application page.
 * @returns {object} The parsed data from the URL.
 */
function parseUrl(url) {
  const urlMap = {
    'www.linkedin.com': {
      jobTitle: '.job-details-jobs-unified-top-card__job-title',
      company:
        '.job-details-jobs-unified-top-card__primary-description-without-tagline a',
      source: 'LinkedIn',
      url: '.jobs-search-results-list__list-item--active a',
    },
    'www.indeed.com': {
      jobTitle: '.jobsearch-JobInfoHeader-title',
      company: '[data-testid="inlineHeader-companyName"]',
      source: 'Indeed',
      url: '.vjs-highlight .jobTitle a',
    },
    'www.glassdoor.com': {
      jobTitle: '.JobDetails_jobTitle__Rw_gn',
      company: '.EmployerProfile_employerName__Xemli',
      source: 'GlassDoor',
      url: '.JobCard_selected__q_cLS .JobCard_trackingLink__zUSOo a',
    },
  };

  const storage = {
    jobTitle: '',
    company: '',
    source: '',
    applicationDateTime: formatCurrentDateTime(),
    url: 'N/A',
  };

  for (const [key, element] of Object.entries(urlMap)) {
    const urlRegex = new RegExp(key);
    if (urlRegex.test(url)) {
      storage.jobTitle = getText(element.jobTitle);
      storage.company = getText(element.company);
      storage.source = element.source;
      storage.applicationDateTime = formatCurrentDateTime();
      storage.url = getURL(element.url);
    }
  }

  return storage;
}

/**
 * Below this is the beginning of the implementation to save the data to the Google Sheet after Easy Apply.
 *
 *******************************************************************************************************
 */

if (window.location.href.includes('www.linkedin.com/jobs')) {
  // The button changes to easy apply a short time after the entire page has loaded, so we need to wait a bit before checking for it
  window.onload = setTimeout(sendFormDataOnEasyApply, 1000);
}

/**
 * Submits the form data to the Google Sheet when an Easy Apply has completed.
 */
function sendFormDataOnEasyApply() {
  const easyApplyButtonClass = '.jobs-apply-button span.artdeco-button__text';
  const applyDivClass = '.jobs-s-apply';
  const postApplyClass = 'artdeco-inline-feedback--success';

  const easyApplyButton = document.querySelector(easyApplyButtonClass);

  let observer;
  if (
    !observer && // If the observer is not already attached
    easyApplyButton &&
    easyApplyButton.innerText.toLowerCase() === 'easy apply'
  ) {
    // Easy apply has been found
    console.log('Easy Apply found!');
    const jobElement = document.querySelector(applyDivClass);

    console.log('Create observer for:', jobElement);
    observer = new MutationObserver((mutations, sent = sentApplication) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          for (const node of mutation.addedNodes) {
            // console.log('Node:', node);
            if (
              node.nodeType === 1 &&
              node.classList.contains(postApplyClass)
            ) {
              // Now we need to send this to the Google Sheet.
              sentApplication = true;
              console.log('Sending data to Google Sheet...');
              const pageMap = parseUrl(window.location.href);

              chrome.runtime.sendMessage(
                { action: 'saveJob', formData: pageMap },
                function (response) {
                  console.log('Data sent:', pageMap);
                  console.log('Response:', response);
                }
              );
            }
          }
        }
      }
    });
    const config = { childList: true, subtree: true };

    console.log('Attach observer to:', jobElement);
    observer.observe(jobElement, config);
  }
}

/******/ })()
;