import { submitFormData } from './utils/appScriptConnector';

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

let sheetURL = null;

/**
 *  Adds a listener for the 'loadSheet' action.
 *  This will save the sheetURL to the chrome storage.
 */
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'loadSheet') {
    chrome.storage.local.set({ sheetURL: message.sheetURL });
  }

  if (message.action === 'saveJob') {
    sendResponse(submitFormData(message.formData));
  }
});

/**
 * This will load the sheetURL from the chrome storage when the extension is loaded.
 */
chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.local.get(['sheetURL'], function (result) {
    if (result.sheetURL) {
      sheetURL = result.sheetURL;
    }
  });
});
