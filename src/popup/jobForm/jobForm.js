import OAuth from '../../user/oauth.js';
import Utils from '../../utils/utils.js';
import { requestUserInfo } from '../../utils/chrome.js';
import Sheets from '../../user/sheets.js';

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
    this.sheets = new Sheets();
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
    alert('line 56, jobform.js');
    //const formJson = this.utils.formToObj(this.form);
    const formJson = this.utils.formToObj(this.form);
    const userInfo = await requestUserInfo();
    alert(`User Info: ${JSON.stringify(userInfo, null, 2)}`);
    const applyType = isEasyApplyAvailable();
    // Append new key-value pairs
    formJson.email = userInfo; // Using dot notation
    //formJson = formJson
    formJson['applicationType'] = applyType; // Using bracket notation
    alert(JSON.stringify(formJson, null, 2));

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
          alert('it worked');
          const jobId = this.utils.getJobIdFromUrl(formJson.url);
          this.utils.addJobToApplied(jobId);

          this.utils.appendMessage('#result', 'Data Submitted');

          this.utils.hideElement(saveButtonId);

          // fetch the total jobs applied to from Google Apps Script
          this.fetchTotalJobsApplied();

          // fetch the total jobs applied to today from Google Apps Script
          this.fetchTotalJobsAppliedToday();

          alert('testing data sharing');

          //Assuming that data sharing is on:
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
          // Updated selector to match the accurate classes discussed
          const dismissButton = document.querySelector(
            '.jobs-search-results-list__list-item--active-v2 .job-card-container__action'
          );
          if (dismissButton) {
            dismissButton.click();
            console.log('Dismiss job button clicked.'); // Optional: for debugging
          } else {
            console.error('Dismiss button not found.');
          }
        },
      });
    });
    alert('line 434');
    await this.submitSimpleJobTitle();
  }

  /**
   * Function to fetch the total number of jobs applied to from Google API and append a message to the result div.
   * It gets the value from the Google Sheet cell H1.
   */
  async fetchTotalJobsApplied() {
    const oauth = await this.initializeOAuth();
    oauth
      .getCellValue('B2')
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
      .getCellValue('B1')
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
   * Test that the OAuth object is working and can fetch a value from the Google Sheet.
   *
   * @returns The value of the cell B1
   */
  async tester_Value_return() {
    try {
      const oauth = await this.initializeOAuth();
      const data = await oauth.getCellValue('B1');
      const totalJobsToday = data.values[0];
      return totalJobsToday; // Directly return the value
    } catch (error) {
      console.error('Error:', error);
      return 'Error fetching data'; // Return an error message or handle it as needed
    }
  }

  /**
   * Fetches the job data from the saved sheet and alerts the user.
   */
  async fetchJobsAndAlert() {
    try {
      const oauth = await this.initializeOAuth();

      // Getting the current time when the function is run
      const currentTime = new Date();
      // Formatting the time; for simplicity, we'll use toLocaleString() here,
      // but you can format it as per your requirements
      const formattedTime = currentTime.toLocaleString();

      // Fetching values from multiple cells simultaneously
      const results = await this.sheets.fetchJobsDataAndPrepareForAPI();

      // Constructing a message from the fetched values, including the time
      const alertMessage = `
        Function run at: ${results.timestamp}
        Total jobs applied today: ${results.totalJobsToday}
        Total jobs applied in total: ${results.totalJobsTotal}
        Total advanced applications today: ${results.advancedApplicationsToday}
        Total advanced applications in total: ${results.advancedApplicationsTotal}
        Total quick apply today: ${results.quickApplyToday}
        Total quick apply in total: ${results.quickApplyTotal}
        Job search duration: ${results.jobSearchDuration}
      `;

      // Displaying the combined message
      alert(alertMessage);
    } catch (error) {
      console.error('Error fetching job application data:', error);
      alert(
        'Error fetching job application data. Please check the console for more details.'
      );
    }
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

// Function to check if the "Easy Apply" button is available on the page
function isEasyApplyAvailable() {
  // Search for a button that contains the text "Easy Apply"
  const easyApplyButton = Array.from(document.querySelectorAll('button')).find(
    (button) => button.textContent.trim() === 'Easy Apply'
  );

  // Return "QUICK APPLY" if such a button is found, "ADVANCED APPLY" otherwise
  if (easyApplyButton) {
    return 'QUICK APPLY';
  } else {
    return 'ADVANCED APPLY';
  }
}
