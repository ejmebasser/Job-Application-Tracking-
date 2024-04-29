
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
let listenerAdded = false;

function onLoad() {
  sendReady();
  handleAutoSave(autoSave);
  handleAutoHide(autoHide);

  // Add the Apply button listener only if it hasn't been added before
  if (!listenerAdded) {
    addApplyButtonListener();
    listenerAdded = true; // Mark the listener as added
  }
}

// function addApplyButtonListener() {
//   document.addEventListener('click', async function(event) {
//     if (event.target.matches('.jobs-apply-button') || event.target.closest('.jobs-apply-button')) {
//       alert('Button pressed 70');
//       let easyApply = isEasyApplyAvailable()
//       chrome.runtime.sendMessage({action: "easyApplyClicked"}, function(response) {
//         console.log(response.status);
//     });
// alert('line92'); 
// alert('line 93');
//       // Determine the website name based on the window.location.host or another characteristic
//       let websiteName = 'Unknown Website'; // Default value
//       if (window.location.href.indexOf('linkedin.com') !== -1) {
//         websiteName = 'LinkedIn';
//       } else if (window.location.href.indexOf('indeed.com') !== -1) {
//         websiteName = 'Indeed';
//       } // Add more conditions for other websites as needed
// alert('line 101');
//       // Example of what you might want to collect; adjust based on actual content and requirements
//       const email = await requestUserInfo(); // Await the email from requestUserInfo
//       alert('line 104')
//       const jobData = {
//         jobTitle: getText('.job-details-jobs-unified-top-card__job-title') || 'Unknown Title',
//         company: getText('.job-details-jobs-unified-top-card__primary-description-without-tagline a') || 'Unknown Company',
//         applicationDateTime: formatCurrentDateTime(),
//         source: websiteName, // Add the website name here
//         url: window.location.href,
//         email: email, // Set the email value here
//         applicationType:easyApply
//       };

//       // Call saveJob function with the collected job data
//       saveJob(jobData);
//       alert('line 109 of inject.js')
//       // Assuming dismissJob requires a dismissButton element
//       //nst activeJobCard = document.querySelector('.jobs-search-results-list__list-item--active-v2');
//       const dismissButton = document.querySelector('.jobs-search-results-list__list-item--active-v2 .job-card-container__action')?.click();
//       if(dismissButton) {
//         dismissJob(dismissButton);
//       } else {
//         console.log('Dismiss button not found.');
//       }
//     alert('line 118, we will try to get the email name here--417PM')
//     const alpha = requestUserInfo()
//     alert(alpha);
//     const beta = fetchJobsDataAndPrepareForAPI();
//     alert(beta);

//   }
// //alert('line 119 of inject.js hit')
//   });
//   //alert('line 121 of inject.js hit')
//   //requestUserEmail()  
// }
//Look here 
async function addApplyButtonListener() {
  document.addEventListener('click', async function(event) {
    if (event.target.matches('.jobs-apply-button') || event.target.closest('.jobs-apply-button')) {
      alert('Button pressed 172');
      let easyApply = isEasyApplyAvailable()
      chrome.runtime.sendMessage({action: "easyApplyClicked"}, function(response) {
        console.log(response.status);
      });

      alert('line148'); 
      alert('line 149');
      
      let websiteName = 'Unknown Website'; // Default value
      if (window.location.href.indexOf('linkedin.com') !== -1) {
        websiteName = 'LinkedIn';
      } else if (window.location.href.indexOf('indeed.com') !== -1) {
        websiteName = 'Indeed';
      }

      alert('line 158');
      const email = await requestUserInfo(); // Properly awaiting the promise
      alert('Email: ' + email); // Now showing the email

      const jobData = {
        jobTitle: getText('.job-details-jobs-unified-top-card__job-title') || 'Unknown Title',
        company: getText('.job-details-jobs-unified-top-card__primary-description-without-tagline a') || 'Unknown Company',
        applicationDateTime: formatCurrentDateTime(),
        source: websiteName,
        url: window.location.href,
        email: email,
        applicationType: easyApply
      };

      saveJob(jobData);
      alert('line 173 of inject.js');

      const dismissButton = document.querySelector('.jobs-search-results-list__list-item--active-v2 .job-card-container__action')?.click();
      if(dismissButton) {
        dismissJob(dismissButton);
      } else {
        console.log('Dismiss button not found.');
      }

      alert('line 182-28')

      fetchJobsDataAndPrepareForAPI()
    }
  });
}


function triggerTestAlert() {
  chrome.runtime.sendMessage({ action: "invokeTestAlert" }, function(response) {
      console.log('Response from background:', response.message);
  });
}

// You can call this function directly or from an event, for example:
document.addEventListener('DOMContentLoaded', function() {
  triggerTestAlert();
});


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
  parentSelector = '.job-card-container',
  jobIdSelector = '[data-job-id]'
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

      addJobToApplied(jobId);
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

function hideJobs(){
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: () => {
        const dismissButton = document.querySelector(
          '.jobs-search-results-list__list-item--active button.job-card-container__action'
        );
        if (dismissButton) {
          dismissButton.click();
          // console.log('Dismiss job button clicked.');
        } else {
          console.error('Dismiss button not found.');
        }
      },
    });
  });
}

function checkForEasyApply(mutations, postApplyClass = 'artdeco-inline-feedback--success', url) {
  if (url !== window.location.href) {
    return;
  }

  // Removed the redeclaration of postApplyClass

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

function addJobToApplied(jobId) {
  chrome.runtime.sendMessage({ action: 'addJobToApplied', jobId: jobId });
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
    'www.GlassDoor.com': {
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
    email:'',
    applicationType:'',
  };

  for (const [key, element] of Object.entries(urlMap)) {
    const urlRegex = new RegExp(key);
    if (urlRegex.test(url)) {
      storage.jobTitle = getText(element.jobTitle);
      storage.company = getText(element.company);
      storage.source = element.source;
      storage.applicationDateTime = formatCurrentDateTime();
      storage.url = getURL(element.url);
      storage.email = '';
      storage.applicationType='';
    }
  }

  return storage;
}

function requestUserInfo() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get('userInfo', function(data) {
      if (data.userInfo) {
        resolve(data.userInfo); // Resolve with the user info
      } else {
        reject('No user info found.'); // Reject if no user info
      }
    });
  });
}

//add in function here to figure out if its a quick apply or not:


function isEasyApplyAvailable() {
  // Search for a button that contains the text "Easy Apply"
  const easyApplyButton = Array.from(document.querySelectorAll('button')).find(button => button.textContent.trim() === 'Easy Apply');
  
  // Return "QUICK APPLY" if such a button is found, "ADVANCED APPLY" otherwise
  if (easyApplyButton) {
      return "QUICK APPLY";
  } else {
      return "ADVANCED APPLY";
  }
}

// // This sends a message to either a background script or directly to jobform.js if it listens for messages
// chrome.runtime.sendMessage({action: "invokeTestAlert"}, function(response) {
//   console.log('Response received:', response);
// });



// In inject.js
// function fetchJobsDataAndPrepareForAPI() {
//   chrome.runtime.sendMessage({action: "fetchJobsData"}, (response) => {
//     if (response.success) {
//       console.log("Data fetched:", response.data);
//       // Process and display data here or perform further logic
//       return response.data
//     } else {
//       console.error("Failed to fetch data:", response.error);
//     }
//   });
// }


// function fetchJobsDataAndPrepareForAPI() {
//   return new Promise((resolve, reject) => {
//     chrome.runtime.sendMessage({action: "fetchJobsData"}, (response) => {
//       if (response.success) {
//         console.log("Data fetched:", response.data);
//         resolve(response.data);
//       } else {
//         console.error("Failed to fetch data:", response.error);
//         reject(response.error);
//       }
//     });
//   });
// }

// function sendHardcodedDataToMasterTracker() {
//   const hardcodedData = {
//     timestamp: new Date().toISOString(),
//     userName: 'test@email.com',
//     totalJobsToday: '5',
//     totalJobsTotal: '50',
//     advancedApplicationsToday: '2',
//     advancedApplicationsTotal: '20',
//     quickApplyToday: '1',
//     quickApplyTotal: '10',
//     jobSearchDuration: '120 minutes'
//   };

//   chrome.runtime.sendMessage({
//     action: "submitToMasterTracker",
//     data: hardcodedData
//   }, response => {
//     if (response.success) {
//       console.log('Data submitted successfully:', response.data);
//     } else {
//       console.error('Failed to submit data:', response.error);
//     }
//   });
// }

// function fetchJobsDataAndPrepareForAPI() {
//   return new Promise((resolve, reject) => {
//     chrome.runtime.sendMessage({action: "fetchJobsData"}, (response) => {
//       if (response.success) {
//         console.log("Data fetched:", response.data);

//         // Structure the data with default failure messages for missing fields
//         const structuredData = {
//           timestamp: new Date().toISOString(),
//           userName: response.data.userName || 'FAILURE, HARD CODED RESPONSE', 
//           totalJobsToday: response.data.totalJobsToday || 'FAILURE, HARD CODED RESPONSE',
//           totalJobsTotal: response.data.totalJobsTotal || 'FAILURE, HARD CODED RESPONSE',
//           advancedApplicationsToday: response.data.advancedApplicationsToday || 'FAILURE, HARD CODED RESPONSE',
//           advancedApplicationsTotal: response.data.advancedApplicationsTotal || 'FAILURE, HARD CODED RESPONSE',
//           quickApplyToday: response.data.quickApplyToday || 'FAILURE, HARD CODED RESPONSE',
//           quickApplyTotal: response.data.quickApplyTotal || 'FAILURE, HARD CODED RESPONSE',
//           jobSearchDuration: response.data.jobSearchDuration || 'FAILURE, HARD CODED RESPONSE'
//         };

//         // Submit the structured data
//         chrome.runtime.sendMessage({
//           action: "submitToMasterTracker",
//           data: structuredData
//         }, submitResponse => {
//           if (submitResponse.success) {
//             console.log('Data submitted successfully:', submitResponse.data);
//             resolve(submitResponse.data);  // Resolve the promise with the submission response data
//           } else {
//             console.error('Failed to submit data:', submitResponse.error);
//             reject(submitResponse.error);  // Reject the promise with the submission error
//           }
//         });
        
//       } else {
//         console.error("Failed to fetch data:", response.error);
//         reject(response.error);
//       }
//     });
//   });
// }

function fetchJobsDataAndPrepareForAPI() {
  return new Promise((resolve, reject) => {

    fetchUsernameEmail().then(email => {
      alert("Email retrieved: " + email);  // Display the retrieved email in an alert
  
      
      chrome.runtime.sendMessage({action: "fetchJobsData"}, (response) => {
        if (response.success && response.data && response.data.dataForAPI) {
          console.log("Data fetched:", response.data);

          const apiData = response.data.dataForAPI;

          const structuredData = {
            timestamp: apiData.timestamp || new Date().toISOString(),
            totalJobsToday: typeof apiData.totalJobsToday === 'string' ? apiData.totalJobsToday : 'undefined',
            totalJobsTotal: typeof apiData.totalJobsTotal === 'string' ? apiData.totalJobsTotal : 'undefined',
            advancedApplicationsToday: typeof apiData.advancedApplicationsToday === 'string' ? apiData.advancedApplicationsToday : 'undefined',
            advancedApplicationsTotal: typeof apiData.advancedApplicationsTotal === 'string' ? apiData.advancedApplicationsTotal : 'undefined',
            quickApplyToday: typeof apiData.quickApplyToday === 'string' ? apiData.quickApplyToday : 'undefined',
            quickApplyTotal: typeof apiData.quickApplyTotal === 'string' ? apiData.quickApplyTotal : 'undefined',
            jobSearchDuration: typeof apiData.jobSearchDuration === 'string' ? apiData.jobSearchDuration : 'undefined',
            userName: email || 'undefined'  // Use the fetched email in the data structure
          };

          // Submit the structured data
          chrome.runtime.sendMessage({
            action: "submitToMasterTracker",
            data: structuredData
          }, submitResponse => {
            if (submitResponse.success) {
              console.log('Data submitted successfully:', submitResponse.data);
              resolve(submitResponse.data);
            } else {
              console.error('Failed to submit data:', submitResponse.error);
              reject(submitResponse.error);
            }
          });

        } else {
          console.error("Failed to fetch data or data is improperly structured:", response.error);
          reject("Data fetch failed or data structure incorrect");
        }
      });
    }).catch(error => {
      console.error("Failed to retrieve email:", error);
      reject("Email retrieval failed: " + error.message);
    });
 
  });
}


document.addEventListener('DOMContentLoaded', function() {
  fetchUsernameEmail().then(email => {
    console.log("Email retrieved:", email);
    // You can now use the email in your content script's logic
  }).catch(error => {
    console.error("Failed to retrieve email:", error);
  });
});

function fetchUsernameEmail() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get('userInfo', (result) => {
      if (chrome.runtime.lastError) {
        // Handle errors during storage access
        console.error('Error retrieving user info from chrome.storage:', chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        // Check if the userInfo exists and is not undefined
        if (result.userInfo) {
          console.log("Retrieved user email from storage:", result.userInfo);
          resolve(result.userInfo);
        } else {
          console.log("No user info found in storage.");
          reject(new Error("No user info found in storage."));
        }
      }
    });
  });
}