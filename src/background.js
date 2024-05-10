// Import the necessary modules at the top
import OAuth from './user/oauth';
import Sheets from './user/sheets';
import User from './user/user';
import Utils from './utils/utils';
import './utils/chrome';

// Initilize the needed class instances
const utils = new Utils();
const oauth = initializeOauth();
const sheets = new Sheets();
const user = new User();

// Call the function to store user info
storeUserInfo();

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
 * Stores the user info in the Chrome storage.
 */
async function storeUserInfo() {
  try {
    const userInfo = await user.getUserEmail();
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
 * Saves the form data to the Google Sheet.
 *
 * @param {Object} formData The form data to be saved to the Google Sheet.
 * @return {Object} The response from the appendValues method.
 */
export async function saveJob(formData) {
  // We are now initializing OAuth in the background script at the top
  const response = await sheets.appendValues(formData);

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

/**
 * Function to handle the 'getUserEmail' action.
 *
 * @param {*} sendResponse The function to send a response back to the sender.
 */
async function handleGetUserEmail(sendResponse) {
  try {
    const email = await user.getUserEmail();
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
  sheets
    .getJobsData()
    .then((data) => {
      sendResponse({ success: true, data: data });
    })
    .catch((error) => {
      sendResponse({ success: false, error: error.toString() });
    });
}
