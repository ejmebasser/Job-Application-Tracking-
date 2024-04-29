// import Settings from './settings.js';
// import JobForm from './jobForm.js';
// import OAuth from '../utils/oauth.js';
// import Utils from '../utils/utils.js';

// /**
//  * I am declaring these as global variables so they can be more available to the rest of the file.
//  * Currently, this isn't really used as everything is scoped within the event listener.
//  */

// let settingsForm;
// let jobForm;
// let sheetElement;

// let settings;
// let job;
// let oauth;
// let utils;

// /**
//  * Handling attaching mechanics after the DOM has been loaded.
//  *
//  * I have tested this and the query only sends the message to scrape when the popup is opened.
//  */
// document.addEventListener('DOMContentLoaded', function () {
//   settingsForm = document.querySelector('form#settings');
//   jobForm = document.querySelector('form#jobForm');
//   sheetElement = document.querySelector('#sheet');

//   settings = new Settings(jobForm, settingsForm, sheetElement);
//   job = new JobForm(jobForm);
//   oauth = new OAuth();
//   utils = new Utils(settingsForm, jobForm);

//   settingsForm.addEventListener('submit', (e) => {
//     e.preventDefault();
//   });
//   const submitButton = settingsForm.querySelector('button#saveSettings');
//   submitButton.addEventListener('click', settings.saveSettings);

//   let ready = false;
//   chrome.runtime.onMessage.addListener(
//     function (request, sender, sendResponse) {
//       if (request.ready && !ready) {
//         ready = true;
//       }
//     }
//   );

//   chrome.storage.sync.get(
//     Object.keys(settings.fields),
//     async function (result) {
//       settings.updateSettingsValues(result);
//       await settings.populateSheetList();

//       if (!result.sheetId) {
//         utils.toggleCogFunction();
//       } else {
//         settings.createSheetLink(result.sheetId);
//       }

//       if (settings.fields.autoLoad) {
//         chrome.tabs.query({ active: true, currentWindow: true }, (tabs) =>
//           job.loadData(tabs)
//         );
//       }
//       if (settings.fields.autoSave) {
//         chrome.runtime.sendMessage({ autoSave: true });
//       }
//     }
//   );

//   jobForm.addEventListener('submit', (e) => {
//     e.preventDefault();
//   });
//   jobForm.querySelector('#loadData').addEventListener('click', () => {
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) =>
//       job.loadData(tabs)
//     );
//   });
//   jobForm.querySelector('#saveData').addEventListener(
//     'click',
//     utils.throttle(() => job.handleSubmit(), 500)
//   );


//   // jobForm.querySelector('#hideJob').addEventListener('click', function () {
//   //   // Show an alert (this works only if it's within the same page or a popup)
//   //    alert('Hide Job button clicked @ 323PM');

//   //   // Use the Chrome scripting API to execute the script in the active tab
//   //   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//   //     chrome.scripting.executeScript({
//   //       target: { tabId: tabs[0].id },
//   //       function: () => {
//   //         const dismissButton = document.querySelector(
//   //           '.jobs-search-results-list__list-item--active button.job-card-container__action'
//   //         );
//   //         if (dismissButton) {
//   //           dismissButton.click();
//   //           // console.log('Dismiss job button clicked.');
//   //         } else {
//   //           console.error('Dismiss button not found.');
//   //         }
//   //       },
//   //     });
//   //   });
//   // });

//   // Assuming jobForm is already defined and references the correct form element.
// jobForm.querySelector('#hideJob').addEventListener('click', function () {
//   //alert('Hide Job button clicked @ 323PM'); // Confirm button click.

//   // Use Chrome's tabs API to find the active tab in the current window.
//   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//       // Ensure there's at least one active tab.
//       if (tabs.length > 0) {
//           // Execute the script in the active tab.
//           chrome.scripting.executeScript({
//               target: { tabId: tabs[0].id },
//               function: dismissActiveJob
//           });
//       }
//   });
// });

// // This function will be serialized and executed in the context of the active tab.
// function dismissActiveJob() {
//   const dismissButton = document.querySelector(
//       '.jobs-search-results-list__list-item--active-v2 .job-card-container__action'
//   );
//   if (dismissButton) {
//       dismissButton.click();
//   } else {
//       console.error('Dismiss button not found.');
//   }
// }


//   // this is what i added
//   jobForm
//     .querySelector('#storeJobNumber')
//     .addEventListener('click', function () {
//       // Show the first alert with the current time
//       const currentTime = new Date().toLocaleTimeString();
//       //alert('Clicked at ' + currentTime);

//       // Use the Chrome scripting API to execute the script in the active tab to get the current URL
//       chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//         const url = tabs[0].url;
//         // Extract the jobID from the URL
//         const jobIdMatch = url.match(/(\/view\/|currentJobId=)(\d+)/);
//         const jobId = jobIdMatch ? jobIdMatch[2] : null;
//         alert('Job ID: ' + jobId);

//         if (jobId) {
//           // Show the second alert with the jobID
//           // alert('Job ID: ' + jobId);

//           // Retrieve the current 'jobsApplied' array from chrome.storage.sync
//           chrome.storage.sync.get('jobsApplied', function (result) {
//             const jobsApplied = result.jobsApplied || [];

//             // Alert the current 'jobsApplied' array before adding the new jobID
//             alert(
//               'Current saved jobs: ' +
//                 (jobsApplied.length > 0 ? jobsApplied.join(', ') : 'None')
//             );

//             if (!jobsApplied.includes(jobId)) {
//               jobsApplied.push(jobId);

//               // Save the updated 'jobsApplied' array back to chrome.storage.sync
//               chrome.storage.sync.set(
//                 { jobsApplied: jobsApplied },
//                 function () {
//                   console.log('Job ID added to jobsApplied:', jobId);
//                   // Alert the updated 'jobsApplied' array after adding the new jobID
//                   alert('Updated jobs list: ' + jobsApplied.join(', '));
//                   utils.appendMessage(
//                     '#result',
//                     'Job ID added to jobsApplied: ' + jobId
//                   );
//                 }
//               );
//             } else {
//               // Alert that the job ID already exists and cancel out of this function with a specific message
//               // alert(
//               //   'Will not load because you have already applied to this position. Job ID ' +
//               //     jobId +
//               //     ' already exists in your list.'
//               // );
//               return; // Cancel out of the function if the jobID already exists
//             }
//           });
//         } else {
//           // alert('Job ID not found.');
//           utils.appendMessage('#result', 'Job ID not found or already added.');
//           console.error('Job ID not found.');
//         }
//       });
//     });

//   // this is what i added

//   document
//     .querySelector('#settingsButton')
//     .addEventListener('click', utils.toggleCogFunction);
// });


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

document.addEventListener('DOMContentLoaded', function () {
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
