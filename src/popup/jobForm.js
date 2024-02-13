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
    const formJson = this.formToJson();

    const oauth = await this.getOauth();

    // submit the form data to Google Apps Script
    oauth
      .appendValues(formJson)
      .then((response) => {
        console.log(response);
        if (response.ok) {
          this.appendResult('Data Submitted');
          removeSubmitButton();
        } else {
          console.log(response);
          this.appendResult('Error submitting data');
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
    const oauth = await this.getOauth();
    oauth
      .getSheetValues('H1')
      .then((data) => {
        const totalJobs = data.values[0];
        this.appendResult(`${totalJobs} jobs applied to in total`);
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
        this.appendResult(`${totalJobsToday} jobs applied to in total today`);
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
