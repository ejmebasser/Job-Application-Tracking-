import OAuth from './utils/oauth';
import Settings from './popup/settings';

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.openPopup();
});

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

/**
 *  Adds a listener for the 'loadSheet' action.
 *  This will save the sheetURL to the chrome storage.
 */
chrome.runtime.onMessage.addListener(async function (
  message,
  sender,
  sendResponse
) {
  if (message.action === 'saveJob') {
    const oauth = await initializeOauth();

    sendResponse(oauth.appendValues(message.formData));
  }
});

/**
 * This function initializes the OAuth object, for use in the background script.
 * 
 * @returns {OAuth} The OAuth object.
 
 */
async function initializeOauth() {
  let oauth = new OAuth();
  oauth = await oauth.initilaize();
  return oauth;
}
