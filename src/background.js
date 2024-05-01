// Import the necessary modules at the top
import OAuth from './utils/oauth';
import Utils from './utils/utils';

// Initilize the OAuth and Utils instances
const utils = new Utils();
let oauth = new OAuth();

// Call the function to initialize OAuth and store user info
initializeAndStoreUserInfo();

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  // console.log('changeInfo', changeInfo);
  // check for a URL in the changeInfo parameter (url is only added when it is changed)
  if (changeInfo.status === 'complete') {
    console.log('tab updated, sending reset message');
    // inject the script to the tab
    setTimeout(() => utils.sendMessage({ action: 'tabUpdated' }), 500);
  }
});

// Listen for runtime messages
chrome.runtime.onMessage.addListener(
  async function (message, sender, sendResponse) {
    switch (message.action) {
      case 'saveJob':
        // console.log('saving job');
        const response = saveJob(message.formData);
        // LinkedIn closes the connection and there is likely no listener to receive the response
        // console.log('addListener response:', response);
        sendResponse(response);
        break;
      case 'addJobToApplied':
        utils.addJobToApplied(message.jobId);
        break;
      case 'ready':
        onLoad();
        break;
      case 'easyApplyClicked':
        handleEasyApplyClicked(sender.tab, sendResponse);
        break;
      case 'getUserEmail':
        handleGetUserEmail(sendResponse);
        break;
      case 'getUserInfo':
        handleGetUserInfo(sendResponse);
        break;
      case 'submitJobTitle':
        handleSubmitJobTitle(message.jobData, sendResponse);
        break;
      case 'invokeTestAlert':
        const testAlert =
          'This is data from the test alert on the jobform.js now in background.js';
        sendResponse({ message: 'Alert triggered in background' + testAlert });
        break;
      case 'fetchJobsData':
        handleFetchJobsData(sendResponse);
        break;
      case 'submitToMasterTracker':
        handleSubmitToMasterTracker(message.data, sendResponse);
      default:
        sendResponse({ error: 'Invalid action' });
        break;
    }

    // if the listener is an async function, it must return true
    return true;
  }
);

// Open the popup when the extension icon is clicked
chrome.action.onClicked.addListener(() => {
  chrome.tabs.openPopup();
});

/**
 * Begin function definition section
 */

/**
 * Initialize OAuth and store user info right after OAuth has been initialized
 */
async function initializeAndStoreUserInfo() {
  oauth = await initializeOauth();
  storeUserInfo();
}

/**
 * Stores the user info in the Chrome storage.
 */
async function storeUserInfo() {
  try {
    const userInfo = await oauth.getUserEmail();
    chrome.storage.local.set({ userInfo: userInfo }, () => {
      // console.log('User info stored:', userInfo);
    });
  } catch (error) {
    console.error('Error storing user info:', error);
  }
}

/**
 * injects the script into the given tab
 *
 * @param {number} tabId
 */
export function injectScript(tabId) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ['dist/inject.bundle.js'],
  });
}

/**
 * Gets the current tab ID.
 *
 * @return {number} The current tab ID.
 */
async function getCurrentTabId() {
  let [response] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  // console.log('response:', response);
  return 'id' in response ? response.id : -1;
}

/**
 * Function to load when the page has completed loading.
 */
async function onLoad() {
  chrome.storage.sync.get(['autoSave', 'autoHide'], (result) => {
    // console.log('autoSave:', result.autoSave);
    if (result.autoSave) {
      utils.sendMessage({ action: 'autoSave', autoSave: result.autoSave });
    }

    if (result.autoHide) {
      utils.sendMessage({
        action: 'autoHide',
        autoHide: result.autoHide,
      });
    }
  });
}

/**
 * Initializes the OAuth object, for use in the background script.
 *
 * @return {OAuth} The OAuth object.

 */
export async function initializeOauth() {
  let oauth = new OAuth();
  oauth = await oauth.getOAuth();

  return oauth;
}

/**
 * Saves the form data to the Google Sheet.
 *
 * @param {Object} formData The form data to be saved to the Google Sheet.
 * @return {Object} The response from the appendValues method.
 */
export async function saveJob(formData) {
  //formData.EMAIL = "user@example.com"; // Using dot notation
  const oauth = await initializeOauth();
  // console.log('saving job');
  // console.log(oauth);

  const response = await oauth.appendValues(formData);

  const jobId = utils.getJobIdFromUrl(formData.url);
  utils.addJobToApplied(jobId);

  // alert('line 73 of background');
  // console.log('saveJob response:', response);
  return response;
}

/**
 * Function to handle the 'easyApplyClicked' action.
 *
 * @param {*} senderTab The tab that sent the message.
 * @param {*} sendResponse The function to send a response back to the sender.
 */
function handleEasyApplyClicked(senderTab, sendResponse) {
  if (!senderTab) {
    return;
  }

  console.log('Easy Apply button was clicked in content script.');

  // Dismiss the job in the active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0 && tabs[0].id) {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          func: dismissJobDirectly,
        },
        () => {
          // Optional: Handle errors or perform actions after the script has executed
          if (chrome.runtime.lastError) {
            console.error(
              'Error executing script: ',
              chrome.runtime.lastError.message
            );
            sendResponse({ status: 'Error executing dismiss script' });
          } else {
            console.log('Dismiss job script executed successfully.');
            sendResponse({ status: 'Dismiss job action triggered' });
          }
        }
      );
    } else {
      console.error('No active tab found.');
      sendResponse({ status: 'No active tab' });
    }
  });
}

/**
 * Dismisses the job directly by clicking the dismiss button.
 * The current implementation only works on LinkedIn.
 */
function dismissJobDirectly() {
  const dismissButton = document.querySelector(
    '.jobs-search-results-list__list-item--active button.job-card-container__action'
  );
  if (dismissButton) {
    dismissButton.click();
    console.log('Dismiss job button clicked.');
  } else {
    console.error('Dismiss button not found.');
  }
}

// At the top where you initialize OAut
// Function to fetch user email
async function fetchUserEmail() {
  try {
    const email = await oauth.getUserEmail();
    return email;
  } catch (error) {
    console.error('Error fetching user email:', error);
    return null;
  }
}

/**
 * Function to handle the 'getUserEmail' action.
 *
 * @param {*} sendResponse The function to send a response back to the sender.
 */
async function handleGetUserEmail(sendResponse) {
  try {
    const email = await oauth.getUserEmail();
    sendResponse({ email: email });
  } catch (error) {
    console.error('Error fetching user email:', error);
    sendResponse({ error: 'Failed to fetch user email.' });
  }
}

/**
 * Function to handle the 'getUserInfo' action.
 *
 * @param {*} sendResponse The function to send a response back to the sender.
 */
async function handleGetUserInfo(sendResponse) {
  chrome.storage.local.get('userInfo', (result) => {
    if (result.userInfo) {
      sendResponse({ userInfo: result.userInfo });
    } else {
      sendResponse({ error: 'User info not found.' });
    }
  });
}

/**
 * Function to handle the 'submitJobTitle' action.
 *
 * @param {Object} jobData The message paramater containing the job data.
 * @param {*} sendResponse The function to send a response back to the sender.
 */
function handleSubmitJobTitle(jobData, sendResponse) {
  // Assuming submitSimpleJobTitle is a method of a class or a standalone function that can process the data
  // If it's a method, you'll need an instance of the class to call it
  const jobFormInstance = new JobForm(); // You may need to properly initialize this instance
  jobFormInstance
    .submitSimpleJobTitle(jobData)
    .then((response) => sendResponse({ status: 'Success', details: response }))
    .catch((error) => sendResponse({ status: 'Error', details: error }));
}

/**
 * Function to handle the 'fetchJobsData' action.
 *
 * @param {*} sendResponse The function to send a response back to the sender.
 */
function handleFetchJobsData(sendResponse) {
  getJobsData()
    .then((data) => {
      sendResponse({ success: true, data: data });
    })
    .catch((error) => {
      sendResponse({ success: false, error: error.toString() });
    });
}

/**
 * Get the jobs data from the Google Sheet. This is for job analytics.
 *
 * @return {Object} The object containing the jobs data.
 */
async function getJobsData() {
  const oauth = await initializeOauth();
  console.log(oauth);
  //const result = await oauth.getCellValue('B1'); // No need for Promise.all if you're only fetching one value
  const results = await Promise.all([
    oauth.getCellValue('B1'), // Total jobs applied today
    oauth.getCellValue('B2'), // Total jobs applied in total
    oauth.getCellValue('D1'), // Total advanced applications today
    oauth.getCellValue('D2'), // Total advanced applications in total
    oauth.getCellValue('F1'), // Total quick apply today
    oauth.getCellValue('F2'), // Total quick apply in total
    oauth.getCellValue('H1'), // Job search duration
  ]);

  // Map results to extract values, assuming each result is an object with a structure {values: [[value]]}
  const data = results.map((result) => result.values[0][0]);

  // Constructing an object with all the fetched data
  const dataForAPI = {
    totalJobsToday: data[0],
    totalJobsTotal: data[1],
    advancedApplicationsToday: data[2],
    advancedApplicationsTotal: data[3],
    quickApplyToday: data[4],
    quickApplyTotal: data[5],
    jobSearchDuration: data[6],
  };

  // Why is this an object containing an object?
  return {
    dataForAPI,
  };
}

/**
 * Function to handle the 'submitToMasterTracker' action.
 * This uses a Google Apps Script web app to submit data to a master tracker.
 *
 * @param {Object} requestData The message parameter containing the data to be submitted.
 * @param {*} sendResponse The function to send a response back to the sender.
 */
async function handleSubmitToMasterTracker(requestData, sendResponse) {
  const postURL =
    'https://script.google.com/macros/s/AKfycbwCoexkvlaRrF1UjGMpWzV5U_A5Esj7xq-mufXbIogBGf0Kn0U4SmzFihL_F_qn1GyF/exec';
  try {
    const response = await fetch(`${postURL}?action=addUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    sendResponse({ success: true, data: data });
  } catch (error) {
    console.error('Error submitting data:', error);
    sendResponse({ success: false, error: error.message });
  }
  return true; // indicates asynchronous response
}
