import OAuth from '../utils/oauth.js';
import Utils from '../utils/utils.js';

/**
 * Class to handle the job form in the popup.
 */
export default class JobForm {
  /**
   * Constructor for JobForm class
   *
   * @param {HTMLElement} jobForm
   */
  constructor(jobForm) {
    this.form = jobForm;

    this.updateForm = this.updateForm.bind(this);
    this.loadData = this.loadData.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.utils = new Utils(jobForm, null);
  }

  /**
   * Function to ensure that the OAuth object is available and has been authorized.
   *
   * @return {OAuth} The OAuth object.
   */
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

  /**
   * Handles what happens when we submit data to the Google Sheet.
   */
  async handleSubmit() {
    alert('line 56, jobform.js');
    const formJson = this.utils.formToObj(this.form);

    const saveButtonId = '#saveData';
    const saveButton = this.form.querySelector(saveButtonId);
    saveButton.textContent = 'Submitting...';

    const oauth = await this.getOauth();
    // console.log(oauth);

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
    alert('line 89, jobform.js');
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'dismissJob'}, function(response) {
        if (response && response.result === 'success') {
          console.log('Dismiss job action was successful.');
        } else {
          console.log('Dismiss job action failed or the content script is not active.');
        }
      });
    });
  }

  /**
   * Function to fetch the total number of jobs applied to from Google API and append a message to the result div.
   * It gets the value from the Google Sheet cell H1.
   */
  async fetchTotalJobsApplied() {
    const oauth = await this.getOauth();
    oauth
        .getCellValue('H1')
        .then((data) => {
          const totalJobs = data.values[0];
          this.utils.appendMessage(
              '#result',
              `${totalJobs} jobs applied to in total`,
          );
        })
        .catch((error) => {
          console.error('Error:', error);
        });
  }

  /**
   * Function to fetch the total number of jobs applied to today from Google API and append a message to the result div.
   * It gets the value from the Google Sheet cell J1.
   */
  async fetchTotalJobsAppliedToday() {
    const oauth = await this.getOauth();
    oauth
        .getCellValue('J1')
        .then((data) => {
          const totalJobsToday = data.values[0];
          this.utils.appendMessage(
              '#result',
              `${totalJobsToday} jobs applied to in total today`,
          );
        })
        .catch((error) => {
          console.error('Error:', error);
        });
  }

  /**
   * Handles the load data button click event.
   * This will send the loadData action to the content script.
   *
   * @param {object} tabs The tabs object from the chrome API.
   */
  loadData(tabs) {
    // There is a bit of tricky scoping with this within this function.
    // We are going to use another variable to reference this to avoid the scoping issue.
    const jobForm = this;

    this.utils.sendMessage({action: 'loadData'}, function(response) {
      if (response) {
        jobForm.updateForm(response);
        // alert('line 144 triggered from jobForm.js')
      }
    });
  }
}
