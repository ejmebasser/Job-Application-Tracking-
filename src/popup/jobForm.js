import OAuth from '../utils/oauth.js';
import Utils from '../utils/utils.js';

export default class JobForm {
  constructor(element) {
    this.form = element;

    this.updateForm = this.updateForm.bind(this);
    this.loadData = this.loadData.bind(this);
    this.formToJson = this.formToJson.bind(this);

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
   * Updates the form with the data from the website.
   *
   * @param {object} formData The object to populate the form with.
   */
  updateForm(formData) {
    for (const id in formData) {
      try {
        this.form.querySelector(`input[name="${id}"]`).value = formData[id];
      } catch (error) {
        console.error(error);
      }
    }
  }

  formToJson() {
    const formData = new FormData(this.form);
    const data = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    return data;
  }

  /**
   * Handles what happens when we submit data to the Google Sheet.
   */
  async handleSubmit() {
    const formJson = this.formToJson();

    const saveButtonId = '#saveData';
    const saveButton = this.form.querySelector(saveButtonId);
    saveButton.textContent = 'Submitting...';

    const oauth = await this.getOauth();

    // submit the form data to Google Apps Script
    oauth
      .appendValues(formJson)
      .then((response) => {
        if (response.status >= 200 && response.status < 300) {
          this.utils.appendMessage('#result', 'Data Submitted');
          this.utils.removeButton(saveButtonId);

          // fetch the total jobs applied to from Google Apps Script
          this.fetchTotalJobsApplied();

          // fetch the total jobs applied to today from Google Apps Script
          this.fetchTotalJobsAppliedToday();
        } else {
          console.error('Error:', response);
          this.utils.appendMessage('#result', 'Error submitting data');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        this.utils.appendMessage('#result', 'Error submitting data');
        saveButton.textContent = 'Save Data';
      });
  }

  async fetchTotalJobsApplied() {
    const oauth = await this.getOauth();
    oauth
      .getSheetValues('H1')
      .then((data) => {
        const totalJobs = data.values[0];
        this.utils.appendMessage(
          '#result',
          `${totalJobs} jobs applied to in total`
        );
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  async fetchTotalJobsAppliedToday() {
    const oauth = await this.getOauth();
    oauth
      .getSheetValues('J1')
      .then((data) => {
        const totalJobsToday = data.values[0];
        this.utils.appendMessage(
          '#result',
          `${totalJobsToday} jobs applied to in total today`
        );
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  /**
   * Handles the load data button click event.
   * @param {object} tabs The tabs object from the chrome API.
   */
  loadData(tabs) {
    // There is a bit of tricky scoping with this within this function.
    // We are going to use another variable to reference this to avoid the scoping issue.
    const jobForm = this;

    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: 'loadData' },
      function (response) {
        if (response) {
          jobForm.updateForm(response);
        }
      }
    );
  }
}
