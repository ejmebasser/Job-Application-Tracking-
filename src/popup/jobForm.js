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
  async initializeOAuth() {
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
  async updateForm(formData) {
    console.log(formData);
    for (const id in formData) {
      try {
        this.form.querySelector(`input[name="${id}"]`).value = formData[id];
      } catch (error) {
        console.error(error);
      }
    }

    const appliedJobs = await this.utils.getAppliedJobs();
    const jobId = this.utils.getJobIdFromUrl(formData.url);
    console.log('appliedJobs:', appliedJobs);
    console.log('jobId:', jobId);
    if (appliedJobs.includes(jobId)) {
      this.utils.hideElement('#saveData');
      this.utils.appendMessage('#result', 'Job already applied to');
    } else {
      // clear result and show the saveData button
      this.utils.clearMessage('#result');
      this.utils.showElement('#saveData');
    }
  }

  /**
   * Handles what happens when we submit data to the Google Sheet.
   */
  async handleSubmit() {
    // alert('line 56, jobform.js');
    const formJson = this.utils.formToObj(this.form);

    const saveButtonId = '#saveData';
    const saveButton = this.form.querySelector(saveButtonId);
    saveButton.textContent = 'Submitting...';

    const oauth = await this.initializeOAuth();
    // console.log(oauth);
    // console.log(formJson);

    // submit the form data to Google Apps Script
    oauth
      .appendValues(formJson)
      .then((response) => {
        if (response.status >= 200 && response.status < 300) {
          const jobId = this.utils.getJobIdFromUrl(formJson.url);
          this.utils.addJobToApplied(jobId);

          this.utils.appendMessage('#result', 'Data Submitted');

          this.utils.hideElement(saveButtonId);

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
    // alert('line 89, jobform.js');
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: 'dismissJob' },
        function (response) {
          if (response && response.result === 'success') {
            // console.log('Dismiss job action was successful.');
          } else {
            // console.log(
            //   'Dismiss job action failed or the content script is not active.'
            // );
          }
        }
      );
    });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: () => {
          const dismissButton = document.querySelector(
            '.jobs-search-results-list__list-item--active button.job-card-container__action'
          );
          if (dismissButton) {
            dismissButton.click();
            // console.log('Dismiss job button clicked.');
          } else {
            console.error('Dismiss button not found.');
          }
        },
      });
    })

  }

  /**
   * Function to fetch the total number of jobs applied to from Google API and append a message to the result div.
   * It gets the value from the Google Sheet cell H1.
   */
  async fetchTotalJobsApplied() {
    const oauth = await this.initializeOAuth();
    oauth
      .getCellValue('H1')
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

  /**
   * Function to fetch the total number of jobs applied to today from Google API and append a message to the result div.
   * It gets the value from the Google Sheet cell J1.
   */
  async fetchTotalJobsAppliedToday() {
    const oauth = await this.initializeOAuth();
    oauth
      .getCellValue('J1')
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
   * This will send the loadData action to the content script.
   */
  loadData() {
    // There is a bit of tricky scoping with this within this function.
    // We are going to use another variable to reference this to avoid the scoping issue.
    const jobForm = this;

    this.utils.sendMessage({ action: 'loadData' }, function (response) {
      console.log('loadData response:', response);
      if (response) {
        jobForm.updateForm(response);
        // alert('line 144 triggered from jobForm.js')
      }
    });
  }
}
