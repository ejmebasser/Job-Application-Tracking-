import OAuth from '../utils/oauth.js';

export default class JobForm {
  constructor(element) {
    this.form = element;

    this.updateForm = this.updateForm.bind(this);
    this.loadData = this.loadData.bind(this);
    this.formToJson = this.formToJson.bind(this);

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
    });

    this.form
      .querySelector('#loadData')
      .addEventListener('click', this.loadData);
    this.form.querySelector('#saveData').addEventListener(
      'click',
      this.debounce(() => this.handleSubmit(), 500)
    );
  }

  async initializeOauth() {
    if (!this.oauth) {
      this.oauth = new OAuth();
      await this.oauth.initilaize();
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
        console.log('id not found', id);
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
    console.log('handleSubmit');

    const formJson = this.formToJson();
    console.log(formJson);

    const oauth = await this.initializeOauth();

    // submit the form data to Google Apps Script
    oauth
      .appendValues(formJson)
      .then((response) => {
        if (response.ok) {
          appendResult('Data Submitted');
          removeSubmitButton();
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    // fetch the total jobs applied to from Google Apps Script
    this.fetchTotalJobsApplied();

    // fetch the total jobs applied to today from Google Apps Script
    this.fetchTotalJobsAppliedToday();
  }

  async fetchTotalJobsApplied() {
    const oauth = await this.initializeOauth();
    oauth
      .getSheetValues('H1')
      .then((totalJobs) => {
        logTotalJobs(totalJobs);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  async fetchTotalJobsAppliedToday() {
    const oauth = await this.initializeOauth();
    oauth
      .getSheetValues('J1')
      .then((totalJobsToday) => {
        logTotalJobsToday(totalJobsToday);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  /**
   * Removes the submit button from the popup.
   */
  removeSubmitButton() {
    var submitButton = document.getElementById('submitButton');
    if (submitButton) {
      submitButton.remove();
    }
  }

  /**
   * Display the total jobs applied to.
   *
   * @param {object} data The data returned from the Google Apps Script for the total jobs applied to.
   */
  logTotalJobs(data) {
    let jobsMessage = '';

    // Check if the data is in the expected nested array format
    if (data && Array.isArray(data) && data[0] && Array.isArray(data[0])) {
      const totalJobs = data[0][0];
      jobsMessage = `${totalJobs} jobs applied to in total`;
    } else {
      jobsMessage = 'Unable to find total jobs data';
    }

    appendResult(jobsMessage);
  }

  /**
   * Display the total jobs applied to today.
   *
   * @param {object} data The data returned from the Google Apps Script for the total jobs applied to today.
   */
  logTotalJobsToday(data) {
    let jobsMessage = '';

    // Check if the data is in the expected nested array format
    if (data && Array.isArray(data) && data[0] && Array.isArray(data[0])) {
      const totalJobsToday = data[0][0];
      jobsMessage = `${totalJobsToday} jobs applied to in total today`;
    } else {
      console.error('Data format is not as expected:', data); // Log unexpected data format
      jobsMessage = 'Unable to find total jobs data for today';
    }

    appendResult(jobsMessage);
  }

  /**
   * Append a message to the result div.
   *
   * @param {string} message The message to append.
   */
  appendResult(message) {
    const resultDiv = document.getElementById('result');
    const messageDiv = document.createElement('p');
    messageDiv.innerHTML = message;
    resultDiv.appendChild(messageDiv);
  }

  /**
   * Debounce function to limit the rate of function calls.
   *
   * @param {Function} func The function to debounce
   * @param {int} delay The delay in milliseconds
   * @returns function with debounce
   */
  debounce(func, delay) {
    let timeoutId;
    let called = false; // Flag to track if the function has been called already
    return function () {
      const context = this;
      const args = arguments;
      if (!called) {
        clearTimeout(timeoutId);
        called = true;
        timeoutId = setTimeout(() => {
          func.apply(context, args);
          called = false; // Reset the flag after the function is called
        }, delay);
      }
    };
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
