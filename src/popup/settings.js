import OAuth from '../utils/oauth';
import Utils from '../utils/utils';

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

    this.fields = {
      autoHide: true,
      autoSave: true,
      sheetId: '',
      consent: false,
      sheetName: '',
    };

    this.saveSettings = this.saveSettings.bind(this);
    this.formToJson = this.formToJson.bind(this);
    this.updateSettingsValues = this.updateSettingsValues.bind(this);

    this.utils = new Utils(settingsForm, jobForm);
  }

  async getOauth() {
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
    const values = this.formToJson();

    if (values.sheetId) {
      this.createSheetLink(values.sheetId);
    }
    this.storeSettingsValues(values);

    this.utils.toggleCogFunction();
  }

  /**
   * Create the URL link to the Google Sheet using the sheetId.
   *
   * @param {string} sheetId
   * @returns {string} The URL to the Google Sheet.
   */
  buildSheetURL(sheetId) {
    return 'https://docs.google.com/spreadsheets/d/' + sheetId + '/edit#gid=0';
  }

  createSheetLink(sheetId) {
    this.sheetElement.firstChild.remove();
    const link = document.createElement('a');
    link.text = 'Open Google Sheet';
    link.href = this.buildSheetURL(sheetId);
    link.target = '_blank';
    this.sheetElement.appendChild(link);
  }

  formToJson() {
    const data = {};
    for (const element of this.settingsForm.elements) {
      if (!element.name) {
        continue;
      }

      if (element.type === 'checkbox') {
        data[element.name] = element.checked;
        continue;
      } else {
        data[element.name] = element.value;
      }
    }

    return data;
  }

  /**
   * Update the values of the settings fields.
   */
  updateSettingsValues(settings) {
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
   */
  storeSettingsValues(settings) {
    this.fields = settings;
    chrome.storage.local.set(settings, (results) => {
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
    );
    if (!sheetInput) {
      return;
    }

    const sheetSelector = document.createElement('select');

    for (let i = 0; i < sheetInput.attributes.length; i++) {
      const attr = sheetInput.attributes[i];
      sheetSelector.setAttribute(attr.name, attr.value);
    }

    let oauth = await this.getOauth();
    const files = await oauth.getSheets();
    files.forEach((sheet) => {
      const option = document.createElement('option');
      option.value = sheet.id;
      option.text = sheet.name;
      sheetSelector.appendChild(option);
    });

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
   * Poupulate the sheetName list from the Google Sheet.
   *
   * @param {*} spreadsheetId
   */
  async populateSheetNameList(spreadsheetId) {
    let oauth = await this.getOauth();

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
}
