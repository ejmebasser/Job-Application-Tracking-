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

    this.saveSheet = this.saveSheet.bind(this);

    this.utils = new Utils();
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
  saveSheet() {
    const sheetId = this.settingsForm.querySelector(
      'input[name="sheetId"], select[name="sheetId"]'
    ).value;
    const consent = this.settingsForm.querySelector(
      'input[type="checkbox"]'
    ).checked;
    const sheetName = this.settingsForm.querySelector(
      'input[name="sheetName"], select[name="sheetName"]'
    ).value;

    if (sheetId) {
      this.createSheetLink(sheetId);
      chrome.runtime.sendMessage({
        action: 'loadSheet',
        sheetId: sheetId,
        consent: consent,
        sheetName: sheetName,
      });
    }
    this.storeSettingsValues(sheetId, consent, sheetName);

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

  /**
   * Update the values of the settings fields.
   */
  updateSettingValues(sheetId = '', consent = true, sheetName = '') {
    const sheetIdInput = this.settingsForm.querySelector(
      'input[name="sheetId"], select[name="sheetId"]'
    );
    const consentInput = this.settingsForm.querySelector(
      'input[type="checkbox"]'
    );
    const sheetNameInput = this.settingsForm.querySelector(
      'input[name="sheetName"], select[name="sheetName"]'
    );

    this.sheetId = sheetId;
    this.consent = consent;
    this.sheetName = sheetName;

    sheetIdInput.value = sheetId;
    consentInput.checked = consent;
    sheetNameInput.value = sheetName;
  }

  /**
   * Store the values of the settings fields in Chrome's local storage.
   */
  storeSettingsValues(sheetId, consent, sheetName) {
    chrome.storage.local.set({
      sheetId: sheetId,
      consent: consent,
      sheetName: sheetName,
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

    const defaultSheet = this.sheetId ? this.sheetId : files[0].id;
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
    sheetSelector.value = this.sheetName;

    sheetSelector.addEventListener('change', (event) => {
      this.settingsForm.querySelector('input[name="sheetName"]').value =
        event.target.value;
    });
    sheetInput.parentNode.replaceChild(sheetSelector, sheetInput);
  }
}
