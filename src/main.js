import Settings from './popup/settings/settings.js';
import JobForm from './popup/jobForm/jobForm.js';
import OAuth from './user/oauth.js';
import Utils from './utils/utils.js';

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

  // prevent default Settings form submission
  settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
  });

  // find submit button and add event listener
  const submitButton = settingsForm.querySelector('button#saveSettings');
  submitButton.addEventListener('click', settings.saveSettings);

  // use the Chrome storage API to find settings saved under sync
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

  // prevent default form submission
  jobForm.addEventListener('submit', (e) => {
    e.preventDefault();
  });
  // add event listener to load data button
  jobForm.querySelector('#loadData').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) =>
      job.loadData(tabs)
    );
  });
  // add event listener to save data button
  jobForm.querySelector('#saveData').addEventListener(
    'click',
    utils.throttle(() => job.handleSubmit(), 500)
  );

  // TODO: We shouldn't need multiple instances of the same class in this situation
  const jobFormInstance = new JobForm(document.querySelector('#jobForm'));
  document.querySelector('#getData').addEventListener('click', () => {
    jobFormInstance.submitSimpleJobTitle();
  });

  // TODO: We shouldn't need multiple instances of the same class in this situation
  const jobFormInstance1 = new JobForm(document.querySelector('#jobForm'));
  document.querySelector('#retrieveData').addEventListener('click', () => {
    jobFormInstance1.retrieveData();
  });

  // Add event listener for hideJob button
  // TODO: this function should be moved to the JobForm class
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
  // TODO: this function should be moved to the JobForm class
  const dataSharingButton = document.querySelector('#dataSharing');
  if (dataSharingButton) {
    dataSharingButton.addEventListener('click', async function () {
      const dataConsentCheckbox = document.querySelector(
        'input[name="dataConsent"]'
      );
      const isDataSharingEnabled = dataConsentCheckbox
        ? dataConsentCheckbox.checked
        : false;
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

  document
    .querySelector('#settingsButton')
    .addEventListener('click', utils.toggleCogFunction);
});
