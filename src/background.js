// // Import the necessary modules at the top
// import OAuth from './utils/oauth';
// import Utils from './utils/utils';


// const utils = new Utils();
// let oauth = new OAuth();

// // Initialize OAuth and store user info right after OAuth has been initialized
// async function initializeAndStoreUserInfo() {
//   oauth = await initializeOauth();
//   storeUserInfo();
// }



// async function storeUserInfo() {
//   try {
//     const userInfo = await oauth.getUsername();
//     chrome.storage.local.set({userInfo: userInfo}, () => {
//       console.log("User info stored:", userInfo);
//     });
//   } catch (error) {
//     console.error('Error storing user info:', error);
//   }
// }
// initializeAndStoreUserInfo();
// // function that injects code to a specific tab
// export function injectScript(tabId) {
//   chrome.scripting.executeScript({
//     target: { tabId: tabId },
//     files: ['dist/inject.bundle.js'],
//   });
// }

// /**
//  * Gets the current tab ID.
//  *
//  * @return {number} The current tab ID.
//  */
// async function getCurrentTabId() {
//   let [response] = await chrome.tabs.query({
//     active: true,
//     lastFocusedWindow: true,
//   });
//   // console.log('response:', response);
//   return 'id' in response ? response.id : -1;
// }

// /**
//  * Function to load when the page has completed loading.
//  */
// async function onLoad() {
//   chrome.storage.sync.get(['autoSave', 'autoHide'], (result) => {
//     // console.log('autoSave:', result.autoSave);
//     if (result.autoSave) {
//       utils.sendMessage({ action: 'autoSave', autoSave: result.autoSave });
//     }

//     if (result.autoHide) {
//       utils.sendMessage({
//         action: 'autoHide',
//         autoHide: result.autoHide,
//       });
//     }
//   });
// }

// // // listen for tab updates
// // chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
// //   // console.log('changeInfo', changeInfo);
// //   // check for a URL in the changeInfo parameter (url is only added when it is changed)
// //   if (changeInfo.status === 'complete') {
// //     console.log('tab updated, sending reset message');
// //     // inject the script to the tab
// //     setTimeout(() => utils.sendMessage({ action: 'tabUpdated' }), 500);
// //   }
// // });

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   // Check if the tab's status is 'complete'
//   if (changeInfo.status === 'complete') {
//     console.log('tab updated, sending reset message');
    
//     // Inject the content script to the tab
//     chrome.scripting.executeScript({
//       target: { tabId: tabId },
//       files: ['dist/inject.bundle.js']
//     }, () => {
//       // After injecting the script, send the reset message
//       setTimeout(() => {
//         chrome.tabs.sendMessage(tabId, { action: 'tabUpdated' });
//       }, 500);
//     });
//   }
// });


// // Open the popup when the extension icon is clicked
// chrome.action.onClicked.addListener(() => {
//   chrome.tabs.openPopup();
// });

// chrome.action.onClicked.addListener(async function(tab) {
//   try {
//     const sheets = await oauth.getSheets();
//     console.log('Sheets:', sheets);
//   } catch (error) {
//     console.error('Error fetching sheets:', error);
//   }
// });

// /**
//  *  Adds a listener for the 'saveJob' action.
//  *  This will save the sheetURL to the chrome storage.
//  */
// chrome.runtime.onMessage.addListener(
//   async function (message, sender, sendResponse) {
//     // console.log('message:', message);
//     if (message.action === 'saveJob') {
//       // console.log('saving job');
//       const response = saveJob(message.formData);
//       // LinkedIn closes the connection and there is likely no listener to receive the response
//       // console.log('addListener response:', response);
//       sendResponse(response);
//     }

//     if (message.action === 'addJobToApplied') {
//       // console.log('adding job to applied');
//       utils.addJobToApplied(message.jobId);
//     }

//     if (message.action === 'ready') {
//       // console.log('inject ready');
//       onLoad();
//     }

//     // if the listener is an async function, it must return true
//     return true;
//   }
// );

// /**
//  * Initializes the OAuth object, for use in the background script.
//  *
//  * @return {OAuth} The OAuth object.

//  */
// export async function initializeOauth() {
//   let oauth = new OAuth();
//   oauth = await oauth.getOAuth();

//   return oauth;
// }

// /**
//  * Saves the form data to the Google Sheet.
//  *
//  * @param {Object} formData The form data to be saved to the Google Sheet.
//  * @return {Object} The response from the appendValues method.
//  */
// export async function saveJob(formData) {
//   //formData.EMAIL = "user@example.com"; // Using dot notation
//   const oauth = await initializeOauth();
//   // console.log('saving job');
//   // console.log(oauth);

//   const response = await oauth.appendValues(formData);

//   const jobId = utils.getJobIdFromUrl(formData.url);
//   utils.addJobToApplied(jobId);

//   // alert('line 73 of background');
//   // console.log('saveJob response:', response);
//   return response;
// }


// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//   if (request.action === "easyApplyClicked" && sender.tab) {
//     console.log("Easy Apply button was clicked in content script.");

//     // Dismiss the job in the active tab
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//       if (tabs.length > 0 && tabs[0].id) {
//         chrome.scripting.executeScript({
//           target: { tabId: tabs[0].id },
//           func: dismissJobDirectly,
//         }, () => {
//           // Optional: Handle errors or perform actions after the script has executed
//           if (chrome.runtime.lastError) {
//             console.error('Error executing script: ', chrome.runtime.lastError.message);
//             sendResponse({status: "Error executing dismiss script"});
//           } else {
//             console.log('Dismiss job script executed successfully.');
//             sendResponse({status: "Dismiss job action triggered"});
//           }
//         });
//       } else {
//         console.error("No active tab found.");
//         sendResponse({status: "No active tab"});
//       }
//     });

//     return true; // Indicates an asynchronous response (due to chrome.tabs.query being async)
//   }
// });

// function dismissJobDirectly() {
//     const dismissButton = document.querySelector(
//       '.jobs-search-results-list__list-item--active button.job-card-container__action'
//     );
//     if (dismissButton) {
//         dismissButton.click();
//         console.log('Dismiss job button clicked.');
//     } else {
//         console.error('Dismiss button not found.');
//     }
// }

// // At the top where you initialize OAut
// // Function to fetch user email
// async function fetchUserEmail() {
//   try {
//     const email = await oauth.getUsername();
//     return email;
//   } catch (error) {
//     console.error('Error fetching user email:', error);
//     return null;
//   }
// }

// chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
//   if (request.action === "getUserEmail") {
//     // Try to fetch the user email
//     try {
//       const email = await oauth.getUsername();
//       sendResponse({ email: email });
//     } catch (error) {
//       console.error('Error fetching user email:', error);
//       sendResponse({ error: 'Failed to fetch user email.' });
//     }
//     return true;  // Indicate you're asynchronously responding.
//   }
// });

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.action === "getUserInfo") { // Change "getUserEmail" to "getUserInfo" if that's what you're using
//     chrome.storage.local.get("userInfo", (result) => {
//       if (result.userInfo) {
//         sendResponse({ userInfo: result.userInfo });
//       } else {
//         sendResponse({ error: 'User info not found.' });
//       }
//     });
//     return true; // Indicate asynchronous response
//   }
// });


// chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
//   if (message.action === "submitJobTitle") {
//     // Assuming submitSimpleJobTitle is a method of a class or a standalone function that can process the data
//     // If it's a method, you'll need an instance of the class to call it
//     const jobFormInstance = new JobForm(); // You may need to properly initialize this instance
//     jobFormInstance.submitSimpleJobTitle(message.jobData)
//       .then(response => sendResponse({status: 'Success', details: response}))
//       .catch(error => sendResponse({status: 'Error', details: error}));
//   }
//   return true;  // Indicates that the response is sent asynchronously
// });

// const testAlert = 'This is data from the test alert on the jobform.js now in background.js'

// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//   if (request.action === "invokeTestAlert") {
      
//       sendResponse({message: 'Alert triggered in background ' + testAlert});
//   }
//   return true; // Indicates that the response is sent asynchronously
// });

// // In background.js
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.action === "fetchJobsData") {
//     // Call your OAuth and Sheets API logic here
//     getJobsData().then(data => {
//       sendResponse({success: true, data: data});
//     }).catch(error => {
//       sendResponse({success: false, error: error.toString()});
//     });
//   }
//   return true; // Return true to indicate you wish to send a response asynchronously
// });

// async function getJobsData() {
//   const oauth = await initializeOauth();
//   console.log(oauth);
//   //const result = await oauth.getCellValue('B1'); // No need for Promise.all if you're only fetching one value
//   const results = await Promise.all([
//     oauth.getCellValue('B1'), // Total jobs applied today
//     oauth.getCellValue('B2'), // Total jobs applied in total
//     oauth.getCellValue('D1'), // Total advanced applications today
//     oauth.getCellValue('D2'), // Total advanced applications in total
//     oauth.getCellValue('F1'), // Total quick apply today
//     oauth.getCellValue('F2'), // Total quick apply in total
//     oauth.getCellValue('H1')  // Job search duration
//   ]);
// // Map results to extract values, assuming each result is an object with a structure {values: [[value]]}
// const data = results.map(result => result.values[0][0]);

// // Constructing an object with all the fetched data
// const dataForAPI = {
//   totalJobsToday: data[0],
//   totalJobsTotal: data[1],
//   advancedApplicationsToday: data[2],
//   advancedApplicationsTotal: data[3],
//   quickApplyToday: data[4],
//   quickApplyTotal: data[5],
//   jobSearchDuration: data[6]
// };
//   return {
//     dataForAPI
//   };
// }


// chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
//   if (request.action === "submitToMasterTracker") {
//     const postURL = "https://script.google.com/macros/s/AKfycbwCoexkvlaRrF1UjGMpWzV5U_A5Esj7xq-mufXbIogBGf0Kn0U4SmzFihL_F_qn1GyF/exec";
//     try {
//       const response = await fetch(`${postURL}?action=addUser`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(request.data)
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       sendResponse({success: true, data: data});
//     } catch (error) {
//       console.error('Error submitting data:', error);
//       sendResponse({success: false, error: error.message});
//     }
//     return true; // indicates asynchronous response
//   }
// });


// Import the necessary modules at the top
import OAuth from './utils/oauth';
import Utils from './utils/utils';

const utils = new Utils();
let oauth = new OAuth();
const injectedTabs = new Set(); // Keep track of injected tabs

// Initialize OAuth and store user info right after OAuth has been initialized
async function initializeAndStoreUserInfo() {
  oauth = await initializeOauth();
  storeUserInfo();
}

async function storeUserInfo() {
  try {
    const userInfo = await oauth.getUsername();
    chrome.storage.local.set({ userInfo: userInfo }, () => {
      console.log("User info stored:", userInfo);
    });
  } catch (error) {
    console.error('Error storing user info:', error);
  }
}

initializeAndStoreUserInfo();

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
  return 'id' in response ? response.id : -1;
}

/**
 * Function to load when the page has completed loading.
 */
async function onLoad() {
  chrome.storage.sync.get(['autoSave', 'autoHide'], (result) => {
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

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check if the tab's status is 'complete'
  if (changeInfo.status === 'complete' && !injectedTabs.has(tabId)) {
    console.log('tab updated, injecting script and sending reset message');
    
    // Inject the content script to the tab
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['dist/inject.bundle.js']
    }, () => {
      // After injecting the script, mark the tab as injected
      injectedTabs.add(tabId);
      console.log('Script injected:', tabId);

      // Send the reset message
      setTimeout(() => {
        chrome.tabs.sendMessage(tabId, { action: 'tabUpdated' });
      }, 500);
    });
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  // Remove the tab from the set when it is closed
  injectedTabs.delete(tabId);
});

// Open the popup when the extension icon is clicked
chrome.action.onClicked.addListener(() => {
  chrome.tabs.openPopup();
});

chrome.action.onClicked.addListener(async function (tab) {
  try {
    const sheets = await oauth.getSheets();
    console.log('Sheets:', sheets);
  } catch (error) {
    console.error('Error fetching sheets:', error);
  }
});

/**
 *  Adds a listener for the 'saveJob' action.
 *  This will save the sheetURL to the chrome storage.
 */
chrome.runtime.onMessage.addListener(
  async function (message, sender, sendResponse) {
    if (message.action === 'saveJob') {
      const response = saveJob(message.formData);
      sendResponse(response);
    }

    if (message.action === 'addJobToApplied') {
      utils.addJobToApplied(message.jobId);
    }

    if (message.action === 'ready') {
      onLoad();
    }

    return true; // Indicates that the response is sent asynchronously
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
  const response = await oauth.appendValues(formData);
  const jobId = utils.getJobIdFromUrl(formData.url);
  utils.addJobToApplied(jobId);
  return response;
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "easyApplyClicked" && sender.tab) {
    console.log("Easy Apply button was clicked in content script.");

    // Dismiss the job in the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0 && tabs[0].id) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: dismissJobDirectly,
        }, () => {
          if (chrome.runtime.lastError) {
            console.error('Error executing script: ', chrome.runtime.lastError.message);
            sendResponse({ status: "Error executing dismiss script" });
          } else {
            console.log('Dismiss job script executed successfully.');
            sendResponse({ status: "Dismiss job action triggered" });
          }
        });
      } else {
        console.error("No active tab found.");
        sendResponse({ status: "No active tab" });
      }
    });

    return true; // Indicates an asynchronous response
  }
});

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

// At the top where you initialize OAuth
async function fetchUserEmail() {
  try {
    const email = await oauth.getUsername();
    return email;
  } catch (error) {
    console.error('Error fetching user email:', error);
    return null;
  }
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "getUserEmail") {
    try {
      const email = await oauth.getUsername();
      sendResponse({ email: email });
    } catch (error) {
      console.error('Error fetching user email:', error);
      sendResponse({ error: 'Failed to fetch user email.' });
    }
    return true;  // Indicate you're asynchronously responding.
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getUserInfo") {
    chrome.storage.local.get("userInfo", (result) => {
      if (result.userInfo) {
        sendResponse({ userInfo: result.userInfo });
      } else {
        sendResponse({ error: 'User info not found.' });
      }
    });
    return true; // Indicate asynchronous response
  }
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "submitJobTitle") {
    const jobFormInstance = new JobForm(); // You may need to properly initialize this instance
    jobFormInstance.submitSimpleJobTitle(message.jobData)
      .then(response => sendResponse({ status: 'Success', details: response }))
      .catch(error => sendResponse({ status: 'Error', details: error }));
  }
  return true;  // Indicates that the response is sent asynchronously
});

const testAlert = 'This is data from the test alert on the jobform.js now in background.js'

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "invokeTestAlert") {
    sendResponse({ message: 'Alert triggered in background ' + testAlert });
  }
  return true; // Indicates that the response is sent asynchronously
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fetchJobsData") {
    getJobsData().then(data => {
      sendResponse({ success: true, data: data });
    }).catch(error => {
      sendResponse({ success: false, error: error.toString() });
    });
  }
  return true; // Return true to indicate you wish to send a response asynchronously
});

async function getJobsData() {
  const oauth = await initializeOauth();
  const results = await Promise.all([
    oauth.getCellValue('B1'), // Total jobs applied today
    oauth.getCellValue('B2'), // Total jobs applied in total
    oauth.getCellValue('D1'), // Total advanced applications today
    oauth.getCellValue('D2'), // Total advanced applications in total
    oauth.getCellValue('F1'), // Total quick apply today
    oauth.getCellValue('F2'), // Total quick apply in total
    oauth.getCellValue('H1')  // Job search duration
  ]);

  // Map results to extract values, assuming each result is an object with a structure {values: [[value]]}
  const data = results.map(result => result.values[0][0]);

  // Constructing an object with all the fetched data
  const dataForAPI = {
    totalJobsToday: data[0],
    totalJobsTotal: data[1],
    advancedApplicationsToday: data[2],
    advancedApplicationsTotal: data[3],
    quickApplyToday: data[4],
    quickApplyTotal: data[5],
    jobSearchDuration: data[6]
  };
  return {
    dataForAPI
  };
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "submitToMasterTracker") {
    const postURL = "https://script.google.com/macros/s/AKfycbwCoexkvlaRrF1UjGMpWzV5U_A5Esj7xq-mufXbIogBGf0Kn0U4SmzFihL_F_qn1GyF/exec";
    try {
      const response = await fetch(`${postURL}?action=addUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request.data)
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
});
