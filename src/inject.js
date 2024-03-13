let autoSave = false;
let autoHide = false;
let savedApplication = false;
let observer;

const appliedJobs = [];
const LOAD_DELAY = 1000;

// maybe we want to parse the url and set a bunch of variables for use in all the scripts
// that way functions can just call something like 'pageData.dismissSelector'

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  let response = {};
  switch (request.action) {
    case 'loadData':
      const pageUrl = window.location.href;
      response = parseUrl(pageUrl);
      break;
    case 'autoSave':
      handleAutoSave(request.autoSave);
      break;
    case 'autoHide':
      handleAutoHide(request.autoHide);
      break;
    case 'dismissJob':
      const dismissButton = document.querySelector(
        '.jobs-search-results-list__list-item--active button[aria-label="Dismiss job"]'
      );
      response = dismissJob(dismissButton);
      break;
    case 'tabUpdated':
      reset();
      break;
  }
  sendResponse(response);

  return true;
});

function reset() {
  autoSave = false;
  autoHide = false;

  if (observer) {
    observer.disconnect();
    observer = null;
  }

  delayedLoad();
}

if (document.readyState === 'complete') {
  delayedLoad();
} else {
  window.addEventListener('load', () => {
    delayedLoad();
  });
}

function delayedLoad() {
  setTimeout(onLoad, LOAD_DELAY);
}

/**
 * Function to coordinate background and inject scripts.
 */
function onLoad() {
  // console.log('page loading');
  sendReady();

  // We will set it here to disconnect the autosave if there is one,
  // and then we will reset the value when we get the "autoSave" message
  handleAutoSave(autoSave);

  // Do more stuff here after the document has fully loaded
  handleAutoHide(autoHide);
}

/**
 * Sends a message to the background script to indicate that the content script is ready.
 */
async function sendReady() {
  let readyResponse;
  await chrome.runtime.sendMessage({ action: 'ready' }, function (response) {
    readyResponse = response;
  });
  return readyResponse;
}

/**
 * Removes the already applied jobs from the list of jobs.
 * The default selectors are for LinkedIn, but they can be overridden.
 */
function dismissAlreadyApplied(
  appliedIndicatorSelector = '.job-card-container__footer-item .tvm__text',
  hideSelector = 'button[aria-label="Dismiss job"]',
  parentSelector = '.job-card-container'
) {
  // console.log('autoHide:', autoHide);
  if (!autoHide) {
    return;
  }

  const appliedRegex = /^applied/i;
  // console.log('appliedIndicatorSelector:', appliedIndicatorSelector);
  const appliedJobs = document.querySelectorAll(appliedIndicatorSelector);
  // console.log('appliedJobs', appliedJobs);

  appliedJobs.forEach((job) => {
    // console.log(job.textContent);
    if (appliedRegex.test(job.textContent)) {
      const jobCard = job.closest(parentSelector);
      // console.log('jobCard:', jobCard);
      // console.log('hideSelector:', hideSelector);
      const hideElement = jobCard.querySelector(hideSelector);
      // console.log('hideElement:', hideElement);
      dismissJob(hideElement);
    }
  });
}

/**
 * Sets the autosave value, and disconnects an observer if one is connected.
 *
 * @param {boolean} autoSaveValue
 */
function handleAutoSave(autoSaveValue) {
  // console.log('Auto save:', autoSaveValue);
  autoSave = autoSaveValue;
  if (autoSave) {
    sendFormDataOnEasyApply();
  }

  if (!autoSave && observer) {
    observer.disconnect();
  }
}

function handleScroll() {
  // these should be replaced based upon url when generalizing this function
  const appliedIndicatorSelector =
    '.job-card-container__footer-item .tvm__text';
  const hideSelector = 'button[aria-label="Dismiss job"]';
  const appliedParentSelector = '.job-card-container';
  // console.log('handleScroll');

  dismissAlreadyApplied(
    appliedIndicatorSelector,
    hideSelector,
    appliedParentSelector
  );
}

/**
 * Sets the autoHide value, and connects or disconnects automatically hiding jobs.
 */
function handleAutoHide(autoHideValue) {
  // console.log('Auto hide:', autoHideValue);
  autoHide = autoHideValue;

  let scrollElement = document.querySelector('.jobs-search-results-list');

  // console.log('scrollElement:', scrollElement);
  if (autoHide && scrollElement) {
    handleScroll();
    // console.log('Adding scroll listener.');
    scrollElement.addEventListener('scroll', handleScroll);
  } else if (scrollElement) {
    // console.log('Removing scroll listener.');
    scrollElement.removeEventListener('scroll', handleScroll);
  }
}

/**
 * Dismisses the job on the LinkedIn job search page.
 * This could probably be reused for behavior on other sites.
 */
function dismissJob(dismissButton) {
  // what does it mean if the dismiss button isn't found?
  // You may not be on the page with a list of jobs
  if (dismissButton) {
    dismissButton.click();
    // console.log('Dismiss job button clicked.');
    return { success: true, message: 'Job dismissed successfully.' };
  } else {
    // changing this to // console.log since it may not be an error
    // console.log('Dismiss button not found.');
    return { success: false, message: 'Dismiss button not found.' };
  }
}

/**
 * Submits the form data to the Google Sheet when an Easy Apply has completed.
 * This could probably be reused for behavior on other sites and with other application types.
 */
export async function sendFormDataOnEasyApply() {
  // Identify the classes to look for
  const applyDivClass = '.jobs-s-apply';
  const postApplyClass = 'artdeco-inline-feedback--success';

  // Get the elements
  const jobElement = document.querySelector(applyDivClass);

  const MUTATION_DELAY = 2;
  const currentUrl = window.location.href;

  // console.log('jobElement:', jobElement);
  if (!observer && jobElement) {
    // Initialize the observer only if it hasn't been initialized and the job element is found

    // Debounce timer variable declaration

    observer = new MutationObserver((mutations, mutationObserver) => {
      // Clear the debounce timer on each mutation

      // Reset the debounce timer
      checkForEasyApply(mutations, postApplyClass, currentUrl);

      // console.log('Disconnecting observer.');
      observer.disconnect();
      // console.log('Observer disconnected.');
    });

    const config = { childList: true, subtree: true };

    observer.observe(jobElement, config);
    // console.log('Observer connected.', observer);
  }
}

function checkForEasyApply(mutations, postApplyClass, url) {
  if (url !== window.location.href) {
    return;
  }

  for (const mutation of mutations) {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === 1 && node.classList.contains(postApplyClass)) {
          // Check if the application has already been saved to prevent duplicate submissions
          if (!savedApplication) {
            // Now we need to send this to the Google Sheet
            savedApplication = true; // Prevent further submissions
            const pageMap = parseUrl(url);
            saveJob(pageMap);

            appliedJobs.push(pageMap.url);
          }
        }
      }
    }
  }
}

/**
 * Sends the message to the background script to save the job data.
 *
 * @param {Object} formData The form data to be saved to the Google Sheet.
 */
export function saveJob(formData) {
  // Sending a message to the background script to save the job data
  chrome.runtime.sendMessage(
    { action: 'saveJob', formData: formData },
    function (response) {
      // console.log('saveJob response:', response);
      if (autoHide) {
        // we will assume that the job was saved successfully
        // The page reloads before we get a response
        // if (response.ok && autoHide) {
        // console.log('dismissJob');
        const dismissButton = document.querySelector(
          '.jobs-search-results-list__list-item--active button[aria-label="Dismiss job"]'
        );
        dismissJob(dismissButton);
      }
    }
  );
}

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
