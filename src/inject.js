/**
 * Formats the current time as "MM/DD/YYYY HH:MM:SS".
 *
 * @return {string} The formated date and time.
 */
export function formatCurrentDateTime() {
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
export function getURL(selector) {
  const link = document.querySelector(selector);
  return link ? link.href : window.location.href;
}

/**
 * Get the text from within a selected element. If the selector is not found, return an empty string.
 *
 * @param {text} selector The CSS selector to find the element.
 * @return {string} The text of the current element.
 */
export function getText(selector) {
  return document.querySelector(selector)?.textContent.trim() || '';
}

/**
 * Parses the URL of the current job application page using a map of site
 * specific CSS tags and returns the data for storage in the Google Sheet.
 * The keys in the urlMap object are used as RegEx patterns to match the current URL.
 *
 * @param {string} url The current URL of the job application page.
 * @return {object} The parsed data from the URL.
 */
export function parseUrl(url) {
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
 * This is specific to linkedin.com and will need to be refactored to be more general.
 *
 *******************************************************************************************************
 */

let autoSave = false;
let savedApplication = false;
let observer;

// Add a listener to listen for the 'loadData' action.
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'loadData') {
    const pageUrl = window.location.href;

    const pageMap = parseUrl(pageUrl);
    // Store data in Chrome's local storage and send response

    sendResponse(pageMap);

    return true; // Indicates that the response is asynchronous
  }

  // If we have set autosave to true, we need to send the form data to the Google Sheet on saving
  if (request.action === 'autoSave') {
    console.log('Auto save:', request.autoSave);
    autoSave = request.autoSave;
    if (!savedApplication && autoSave) {
      setTimeout(sendFormDataOnEasyApply, 500);
    }
  }
  // ****************** New Code Block Starts Here ******************
  else if (request.action === 'dismissJob') {
    const dismissButton = document.querySelector(
      '.jobs-search-results-list__list-item--active button[aria-label="Dismiss job"]'
    );
    if (dismissButton) {
      dismissButton.click();
      console.log('Dismiss job button clicked.');
      sendResponse({ success: true, message: 'Job dismissed successfully.' });
    } else {
      console.error('Dismiss button not found.');
      sendResponse({ success: false, message: 'Dismiss button not found.' });
    }
    return true; // Indicates that the response is asynchronous
  }
  // ****************** New Code Block Ends Here ******************
});

if (window.location.href.includes('linkedin.com/jobs')) {
  // The button changes to easy apply a short time after the entire page has loaded, so we need to wait a bit before checking for it
}

/**
 * Submits the form data to the Google Sheet when an Easy Apply has completed.
 * This could probably be reused for behavior on other sites and with other application types.
 */
export async function sendFormDataOnEasyApply() {
  // Identify the classes to look for
  const easyApplyButtonClass = '.jobs-apply-button span.artdeco-button__text';
  const applyDivClass = '.jobs-s-apply';
  const postApplyClass = 'artdeco-inline-feedback--success';

  // Get the elements
  const easyApplyButton = document.querySelector(easyApplyButtonClass);
  const jobElement = document.querySelector(applyDivClass);

  if (
    !observer &&
    jobElement // If the job element is found
    // && easyApplyButton.innerText.toLowerCase() === 'easy apply'
  ) {
    // Easy apply has been found
    // console.log('Easy apply found!');

    observer = new MutationObserver((mutations, mutationObserver) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          for (const node of mutation.addedNodes) {
            if (
              node.nodeType === 1 &&
              node.classList.contains(postApplyClass)
            ) {
              // Now we need to send this to the Google Sheet.
              savedApplication = true;

              const pageMap = parseUrl(window.location.href);
              saveJob(pageMap);

              // I was trying to debug why I sometimes get two job saves at a time
              // I am preserving this here as I think it may be due to multiple mutations,
              // but I stopped observing the behavior during debugging.
              // console.log(
              //   'Application submitted from mutation on:',
              //   mutationObserver
              // );

              observer.disconnect();
            }
          }
        }
      }
    });
    const config = { childList: true, subtree: true };

    observer.observe(jobElement, config);
  }
}

export function saveJob(formData) {
  // Sending a message to the background script to save the job data
  chrome.runtime.sendMessage(
    { action: 'saveJob', formData: formData },
    function (response) {
      // Optional logging for debugging purposes
      // console.log('Data sent:', formData);
      // console.log('Response:', response);
      // alert('line 203 inject.js')
      const dismissButton = document.querySelector(
        '.jobs-search-results-list__list-item--active button[aria-label="Dismiss job"]'
      );
      if (dismissButton) {
        dismissButton.click(); // Click the button if found
        console.log('Dismiss job button clicked.'); // Log success
      } else {
        console.error('Dismiss button not found.'); // Log failure to find the button
      }
    }
  );
}
