import {
  submitFormData,
  fetchTotalJobsApplied,
  fetchTotalJobsAppliedToday,
} from '../utils/appScriptConnector.js';

import Settings from './settings.js';
import JobForm from './jobForm.js';

const settingsForm = document.querySelector('form#settings');
const jobForm = document.querySelector('form#jobForm');
const sheetElement = document.querySelector('#sheet');

const settings = new Settings(jobForm, settingsForm, sheetElement);
const job = new JobForm(jobForm);

/**
 * Handling attaching mechanics after the DOM has been loaded.
 *
 * I have tested this and the query only sends the message to scrape when the popup is opened.
 */
document.addEventListener('DOMContentLoaded', function () {
  chrome.tabs.query({ active: true, currentWindow: true }, loadData);

  document.querySelector('#loadData').addEventListener('click', loadData);

  chrome.storage.local.get(['sheetId', 'consent'], function (result) {
    settings.updateSettingValues(result.sheetId, result.consent);
    if (!result.sheetId) {
      settings.toggleCogFunction();
    } else {
      settings.createSheetLink(result.sheetId);
    }
  });

  settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
  });
  jobForm.addEventListener('submit', (e) => {
    e.preventDefault();
  });

  document
    .querySelector('#settingsButton')
    .addEventListener('click', settings.toggleCogFunction);
});

const loadData = (tabs) => {
  chrome.tabs.sendMessage(
    tabs[0].id,
    { action: 'loadData' },
    function (response) {
      if (response) {
        job.updateForm(response);
      }
    }
  );
};
