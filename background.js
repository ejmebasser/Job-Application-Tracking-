// function that injects code to a specific tab
function injectScript(tabId) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ['inject.js'],
  });
}

// adds a listener to tab change
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // check for a URL in the changeInfo parameter (url is only added when it is changed)
  if (changeInfo.url) {
    // calls the inject function
    injectScript(tabId);
  }
  if (chrome.runtime.lastError) {
    injectScript(tabId);
  }
});

let sheetURL = null;
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'loadSheet') {
    sheetURL = request.sheetURL;
    chrome.storage.local.set({ sheetURL: sheetURL });
  }
});

chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.local.get(['sheetURL'], function (result) {
    if (result.sheetURL) {
      sheetURL = result.sheetURL;
    }
  });
});
