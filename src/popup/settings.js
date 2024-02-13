export default class Settings {
  /**
   * Constructor for Settings class
   *
   * @param {HTMLElement} jobForm
   * @param {HTMLElement} settingsForm
   * @param {string} sheetId
   * @param {boolean} consent
   */
  constructor(
    jobForm,
    settingsForm,
    sheetElement,
    sheetId = '',
    consent = true
  ) {
    this.applicationForm = jobForm;
    this.settingsForm = settingsForm;
    this.sheetElement = sheetElement;
    this.sheetId = sheetId;
    this.consent = consent;

    this.toggleCogFunction = this.toggleCogFunction.bind(this);
    this.saveSheet = this.saveSheet.bind(this);

    this.submitButton = settingsForm.getElementsByTagName('button')[0];
    this.submitButton.addEventListener('click', this.saveSheet);
  }

  /**
   * Function to handle the linkSheet button click event.
   */
  updateSheet() {
    // if (this.sheetElement.firstChild) {
    //   sheetElement.removeChild(sheetElement.firstChild);
    // }
    // const sheetInput = document.createElement('input');
    // sheetInput.type = 'text';
    // sheetInput.id = 'sheetUrl';
    // sheetInput.placeholder = 'Enter Google Sheet URL';
    // sheetInput.onkeydown = function (event) {
    //   if (event.key === 'Enter') {
    //     sheetURL = sheetInput.value;
    //     saveSheet();
    //   }
    // };
    // sheetElement.appendChild(sheetInput);
    // toggleCogFunction(true);
  }

  /**
   * Function to handle the saveSheet button click event.
   */
  saveSheet() {
    const sheetId = this.settingsForm.querySelector(
      'input[name="sheetId"]'
    ).value;
    const consent = this.settingsForm.querySelector(
      'input[type="checkbox"]'
    ).checked;

    if (sheetId) {
      this.createSheetLink(sheetId);
      chrome.runtime.sendMessage({ action: 'loadSheet', sheetId: sheetId });
    }
    this.storeSettingsValues(sheetId, consent);

    this.toggleCogFunction();
  }

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
  updateSettingValues(sheetId = '', consent = true) {
    // this.settingsForm.getElementByName('sheetId').value = sheetURL;
    // this.settingsForm.getElementByName('consent').value = consent;
    this.sheetURL = sheetId;
    this.consent = consent;

    this.settingsForm.querySelector('input[type="checkbox"]').checked = consent;
    this.settingsForm.querySelector('input[name="sheetId"]').value = sheetId;
  }

  /**
   * Toggle display of Settings and Job Application form.
   */
  toggleCogFunction() {
    const display = 'block';
    const hide = 'none';
    let settingsDisplayed = false;

    if (this.settingsForm.style.display === 'block') {
      settingsDisplayed = true;
    }

    this.settingsForm.style.display = settingsDisplayed ? hide : display;
    this.applicationForm.style.display = settingsDisplayed ? display : hide;
  }

  /**
   * Store the values of the settings fields in Chrome's local storage.
   */
  storeSettingsValues(sheetId, consent) {
    chrome.storage.local.set({ sheetId: sheetId, consent: consent });
  }
}
