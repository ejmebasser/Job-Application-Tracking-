export default class JobForm {
  constructor(element) {
    this.form = element;

    this.updateForm = this.updateForm.bind(this);
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

  /**
   * Handles what happens when we submit data to the Google Sheet.
   *
   * @param {object} formJson
   */
  handleSubmit(formJson) {
    // submit the form data to Google Apps Script
    submitFormData(formJson)
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
    fetchTotalJobsApplied()
      .then((totalJobs) => {
        logTotalJobs(totalJobs);
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    // fetch the total jobs applied to today from Google Apps Script
    fetchTotalJobsAppliedToday()
      .then((jobsToday) => {
        logTotalJobsToday(jobsToday);
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
}
