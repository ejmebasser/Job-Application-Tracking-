import Settings from './settings.js';
import JobForm from './jobForm.js';
import OAuth from '../utils/oauth.js';
import Utils from '../utils/utils.js';

let settingsForm;
let jobForm;
let sheetElement;

let settings;
let job;
let oauth;
let utils;


// Function to fetch and use the stored user information
function fetchAndUseUserInfo() {
  chrome.storage.local.get('userInfo', function(result) {
    if (result.userInfo) {
      console.log("Retrieved stored user info:", result.userInfo);
      // Here you can use the userInfo however you need to within your app
      // For example, display it in the UI, use it to make authenticated requests, etc.
      result.userInfo;
    } else {
      console.log("No user info found in storage.");
    }
  });
}

// Example function to handle the user info
function handleUserInfo(userInfo) {
  console.log("Handling user info in the app:", userInfo);
  // Update UI or perform other actions with the user info
}



document.addEventListener('DOMContentLoaded', function () {
  //alert('line 16 of main.js')
  fetchAndUseUserInfo(); 
//   chrome.storage.local.get(null, function(items) {
//     console.log(items);
// });

  //console.log('line 21 ' +oauth.getUsername())
  settingsForm = document.querySelector('form#settings');
  jobForm = document.querySelector('form#jobForm');
  sheetElement = document.querySelector('#sheet');

  settings = new Settings(jobForm, settingsForm, sheetElement);
  job = new JobForm(jobForm);
  oauth = new OAuth();
  utils = new Utils(settingsForm, jobForm);

  settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
  });
  const submitButton = settingsForm.querySelector('button#saveSettings');
  submitButton.addEventListener('click', settings.saveSettings);

  let ready = false;
  chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
      if (request.ready && !ready) {
        ready = true;
      }
    }
  );

  chrome.storage.sync.get(
    Object.keys(settings.fields),
    async function (result) {
      settings.updateSettingsValues(result);
      await settings.populateSheetList();

      if (!result.sheetId) {
        utils.toggleCogFunction();
      } else {
        settings.createSheetLink(result.sheetId);
      }

      if (settings.fields.autoLoad) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) =>
          job.loadData(tabs)
        );
      }
      if (settings.fields.autoSave) {
        chrome.runtime.sendMessage({ autoSave: true });
      }
    }
  );

  jobForm.addEventListener('submit', (e) => {
    e.preventDefault();
  });
  jobForm.querySelector('#loadData').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) =>
      job.loadData(tabs)
    );
  });
  jobForm.querySelector('#saveData').addEventListener(
    'click',
    utils.throttle(() => job.handleSubmit(), 500)
  );

  const jobFormInstance = new JobForm(document.querySelector('#jobForm'));
  document.querySelector('#getData').addEventListener('click', () => {
    jobFormInstance.submitSimpleJobTitle();
  });
  

  const jobFormInstance1 = new JobForm(document.querySelector('#jobForm'));
  document.querySelector('#retrieveData').addEventListener('click', () => {
    jobFormInstance1.retrieveData();
  });

  jobForm.querySelector('#hideJob').addEventListener('click', function () {
    // Show an alert (this works only if it's within the same page or a popup)
    // Use the Chrome scripting API to execute the script in the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: () => {
          const dismissButton = document.querySelector(
            '.jobs-search-results-list__list-item--active button.job-card-container__action'
          );
          if (dismissButton) {
            dismissButton.click();
          } else {
            console.error('Dismiss button not found.');
          }
        },
      });
    });
  });

  // Add event listener for dataSharing button
  const dataSharingButton = document.querySelector('#dataSharing');
  if (dataSharingButton) {
    dataSharingButton.addEventListener('click', async function () {
      const dataConsentCheckbox = document.querySelector('input[name="dataConsent"]');
      const isDataSharingEnabled = dataConsentCheckbox ? dataConsentCheckbox.checked : false;
      if (isDataSharingEnabled) {
        // Ensure oauth is initialized and has authToken
        try {
          const userEmail = await oauth.getUsername();
          alert(`Data sharing is ON. User email: ${userEmail}`);
        } catch (error) {
          console.error('Failed to fetch user email:', error);
          alert('Data sharing is ON, but failed to fetch user email.');
        }
      } else {
        alert('Data sharing is OFF.');
      }
    });
  }

  document.querySelector('#settingsButton').addEventListener('click', utils.toggleCogFunction);
});

// Assuming the OAuth class is defined elsewhere and imported
OAuth.prototype.getUsername = async function() {
  const userInfoUrl = 'https://openidconnect.googleapis.com/v1/userinfo';
  try {
    const response = await fetch(userInfoUrl, {
      headers: {
        'Authorization': 'Bearer ' + this.authToken,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch user info');
    const userInfo = await response.json();
    // Save user email to chrome.storage.sync
    chrome.storage.sync.set({ userInfo: userInfo.email }, () => {
      console.log("User email saved to sync storage:", userInfo.email);
    });
    return userInfo.email;
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw error; // It's generally a good practice to re-throw the error so it can be caught by the caller.
  }
};
