import Settings from './settings.js';
import JobForm from './jobForm.js';
import OAuth from '../utils/oauth.js';

// declaring these as global variables so they can be more available to the rest of the code
let settingsForm;
let jobForm;
let sheetElement;

let settings;
let job;
let oauth;

/**
 * Handling attaching mechanics after the DOM has been loaded.
 *
 * I have tested this and the query only sends the message to scrape when the popup is opened.
 */
document.addEventListener('DOMContentLoaded', function () {
  settingsForm = document.querySelector('form#settings');
  jobForm = document.querySelector('form#jobForm');
  sheetElement = document.querySelector('#sheet');

  settings = new Settings(jobForm, settingsForm, sheetElement);
  job = new JobForm(jobForm);
  oauth = new OAuth(settingsForm);

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) =>
    job.loadData(tabs)
  );

  chrome.storage.local.get(['sheetId', 'consent'], function (result) {
    settings.updateSettingValues(result.sheetId, result.consent);
    if (!result.sheetId) {
      settings.toggleCogFunction();
    } else {
      settings.createSheetLink(result.sheetId);
    }
  });

  document
    .querySelector('#settingsButton')
    .addEventListener('click', settings.toggleCogFunction);
});
