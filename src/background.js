import OAuth from './utils/oauth';

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
    // inject the script to the tab
    injectScript(tabId);
  }

  if (changeInfo.status === 'complete') {
    chrome.storage.local.get(['autoSave'], (result) => {
      if (result.autoSave) {
        chrome.tabs.sendMessage(tabId, {
          action: 'autoSave',
          autoSave: result.autoSave,
        });
      }
    });
  }
});

/**
 *  Adds a listener for the 'saveJob' action.
 *  This will save the sheetURL to the chrome storage.
 */
chrome.runtime.onMessage.addListener(async function (
  message,
  sender,
  sendResponse
) {
  console.log('listener started');
  if (message.action === 'saveJob') {
    const oauth = await initializeOauth();
    console.log('saving job');
    console.log(oauth);

    const response = await oauth.appendValues(message.formData);
    sendResponse(response);
  }

  // if the listener is an async function, it must return true
  return true;
});

/**
 * This function initializes the OAuth object, for use in the background script.
 * 
 * @returns {OAuth} The OAuth object.
 
 */
async function initializeOauth() {
  let oauth = new OAuth();
  oauth = await oauth.getOAuth();

  return oauth;
}
