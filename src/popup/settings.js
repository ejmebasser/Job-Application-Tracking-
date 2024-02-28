import OAuth from '../utils/oauth';
import Utils from '../utils/utils';

/**
 * Class to handle the settings form.
 */
export default class Settings {
  /**
   * Constructor for Settings class
   *
   * @param {HTMLElement} jobForm
   * @param {HTMLElement} settingsForm
   * @param {HTMLElement} sheetElement
   */
  constructor(jobForm, settingsForm, sheetElement) {
    this.applicationForm = jobForm;
    this.settingsForm = settingsForm;
    this.sheetElement = sheetElement;

    this.saveSettings = this.saveSettings.bind(this);
    this.updateSettingsValues = this.updateSettingsValues.bind(this);

    this.utils = new Utils(settingsForm, jobForm);
    this.fields = this.utils.formToObj(settingsForm);
  }

  async initializeOAuth() {
    if (!this.oauth) {
      const oauth = new OAuth();
      this.oauth = await oauth.getOAuth();
    }

    return this.oauth;
  }

  /**
   * Function to handle the saveSheet button click event.
   */
  saveSettings() {
    const values = this.utils.formToObj(this.settingsForm);
    // GRABBING THE VALUES OF THE SETTING FORM
    if (values.sheetId) {
      this.createSheetLink(values.sheetId);
      // THIS IS THE LINK TO THE DOCUMENT WITH A PRESS OF A BUTTON
    }
    this.storeSettingsValues(values);
    // STORES IT IN STORAGE
    this.sendAutoSettingMessage('autoSave', values.autoSave);
    this.sendAutoSettingMessage('autoHide', values.autoHide);
    // THIS WORKS IN TANDEM WITH THE INJECT & BACKGROUND SCRIPT to signal if htey can save or not.

    this.utils.toggleCogFunction();
    // SWQITCHING BETWEEN TEH SETTINGS FORM AND THE JOB FORM.
  }

  /**
   * Create the URL link to the Google Sheet using the sheetId.
   *
   * @param {string} sheetId
   * @return {string} The URL to the Google Sheet.
   */
  buildSheetURL(sheetId) {
    return 'https://docs.google.com/spreadsheets/d/' + sheetId + '/edit#gid=0';
    // THE HYPER LINK TO THE SHEET.
  }

  createSheetLink(sheetId) {
    this.sheetElement.firstChild.remove();
    const link = document.createElement('a');
    link.text = 'Open Google Sheet';
    link.href = this.buildSheetURL(sheetId);
    link.target = '_blank';
    this.sheetElement.appendChild(link);
  }
  // THIS IS THE HYPER LINK

  /**
   * Update the values of the settings fields from stored values.
   *
   * @param {object} settings The settings object.
   */
  updateSettingsValues(settings) {
    // THIS IS THE VALUES OF THE SETTINGS. THIS PULLS IN THE DATA FROM THE STORAGE and updates the setting form.
    this.fields = settings;

    for (let [key, value] of Object.entries(settings)) {
      let inputField;
      switch (typeof value) {
        case 'boolean':
          value = value === null ? false : value;
          inputField = this.settingsForm.querySelector(`input[name="${key}"]`);
          if (inputField) {
            inputField.checked = value;
          }
          break;
        default:
          value = value === null ? '' : value;
          inputField = this.settingsForm.querySelector(
            `input[name="${key}"], select[name="${key}"]`
          );
          if (inputField) {
            inputField.value = value;
          }
          break;
      }
    }

    return this.fields;
  }

  /**
   * Store the values of the settings fields in Chrome's local storage.
   *
   * @param {object} settings The settings object.
   */
  // JUST THE SAVE FUNCTION
  storeSettingsValues(settings) {
    chrome.storage.sync.set(settings, (results) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      }
    });
  }

  /**
   * Populate sheetId list from Google Drive.
   */
  async populateSheetList() {
    const sheetInput = this.settingsForm.querySelector(
      'input[name="sheetId"], select[name="sheetId"]'

      // THIS just chagnes the drop down from an input to a drop down selector.
    );
    if (!sheetInput) {
      return;
    }

    const sheetSelector = document.createElement('select');

    for (let i = 0; i < sheetInput.attributes.length; i++) {
      const attr = sheetInput.attributes[i];
      sheetSelector.setAttribute(attr.name, attr.value);
    }

    const oauth = await this.initializeOAuth();
    const files = await oauth.getSheets();
    files.forEach((sheet) => {
      const option = document.createElement('option');
      option.value = sheet.id;
      option.text = sheet.name;
      sheetSelector.appendChild(option);
    });
    // GETS ALL SHEETS FROM GOOGLE DRIVE
    const defaultSheet = this.fields.sheetId
      ? this.fields.sheetId
      : files[0].id;
    this.populateSheetNameList(defaultSheet);
    sheetSelector.value = defaultSheet;

    sheetSelector.addEventListener('change', (event) => {
      this.populateSheetNameList(event.target.value);
    });
    sheetInput.parentNode.replaceChild(sheetSelector, sheetInput);
  }

  /**
   * Poupulate the sheetName (tabs) list from the Google Sheet.
   *
   * @param {*} spreadsheetId
   */
  async populateSheetNameList(spreadsheetId) {
    const oauth = await this.initializeOAuth();

    const sheetInput = this.settingsForm.querySelector(
      'input[name="sheetName"], select[name="sheetName"]'
    );
    const sheetSelector = document.createElement('select');

    for (let i = 0; i < sheetInput.attributes.length; i++) {
      const attr = sheetInput.attributes[i];
      sheetSelector.setAttribute(attr.name, attr.value);
    }

    const sheetNames = await oauth.getSheetNames(spreadsheetId);
    sheetNames.forEach((sheet) => {
      const option = document.createElement('option');
      option.value = sheet;
      option.text = sheet;
      sheetSelector.appendChild(option);
    });
    sheetSelector.value = this.fields.sheetName
      ? this.fields.sheetName
      : sheetNames[0];

    sheetInput.parentNode.replaceChild(sheetSelector, sheetInput);
  }

  /**
   * Send a message to the tab to set an auto setting value.
   *
   * @param {string} setting
   * @param {boolean} value
   */
  sendAutoSettingMessage(setting, value) {
    this.utils.sendMessage({ action: setting, value: value });
  }
}
