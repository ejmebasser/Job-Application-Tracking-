import OAuth from './utils/oauth';
import Utils from './utils/utils';

const utils = new Utils();

// function that injects code to a specific tab
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

// listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  // console.log('changeInfo', changeInfo);
  // check for a URL in the changeInfo parameter (url is only added when it is changed)
  if (changeInfo.status === 'complete') {
    console.log('tab updated, sending reset message');
    // inject the script to the tab
    setTimeout(() => utils.sendMessage({ action: 'tabUpdated' }), 500);
  }
});

// Open the popup when the extension icon is clicked
chrome.action.onClicked.addListener(() => {
  chrome.tabs.openPopup();
});

/**
 *  Adds a listener for the 'saveJob' action.
 *  This will save the sheetURL to the chrome storage.
 */
chrome.runtime.onMessage.addListener(
  async function (message, sender, sendResponse) {
    // console.log('message:', message);
    if (message.action === 'saveJob') {
      // console.log('saving job');
      const response = saveJob(message.formData);
      // LinkedIn closes the connection and there is likely no listener to receive the response
      // console.log('addListener response:', response);
      sendResponse(response);
    }

    if (message.action === 'addJobToApplied') {
      // console.log('adding job to applied');
      utils.addJobToApplied(message.jobId);
    }

    if (message.action === 'ready') {
      // console.log('inject ready');
      onLoad();
    }

    // if the listener is an async function, it must return true
    return true;
  }
);

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
