import Settings from './settings.js';
import JobForm from './jobForm.js';
import OAuth from '../utils/oauth.js';
import Utils from '../utils/utils.js';

/**
 * I am declaring these as global variables so they can be more available to the rest of the file.
 * Currently, this isn't really used as everything is scoped within the event listener.
 */

let settingsForm;
let jobForm;
let sheetElement;

let settings;
let job;
let oauth;
let utils;

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
  oauth = new OAuth();
  utils = new Utils(settingsForm, jobForm);

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) =>
    job.loadData(tabs)
  );

  settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
  });
  const submitButton = settingsForm.querySelector('button#saveSettings');
  submitButton.addEventListener('click', settings.saveSettings);

  chrome.storage.local.get(
    Object.keys(settings.fields),
    async function (result) {
      await settings.populateSheetList();
      settings.updateSettingsValues(result);

      if (!result.sheetId) {
        utils.toggleCogFunction();
      } else {
        settings.createSheetLink(result.sheetId);
      }
    }
  );

  jobForm.addEventListener('submit', (e) => {
    e.preventDefault();
  });
  jobForm.querySelector('#loadData').addEventListener('click', job.loadData);
  jobForm.querySelector('#saveData').addEventListener(
    'click',
    utils.throttle(() => job.handleSubmit(), 500)
  );

  document
    .querySelector('#settingsButton')
    .addEventListener('click', utils.toggleCogFunction);
});
