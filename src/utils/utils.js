/**
 * Utility functions for the application.
 */
export default class Utils {
  /**
   * The constructor for the Utils class.
   *
   * @param {HTMLElement} settingsForm
   * @param {HTMLElement} applicationForm
   */
  constructor(settingsForm, applicationForm) {
    this.settingsForm = settingsForm;
    this.applicationForm = applicationForm;

    this.toggleCogFunction = this.toggleCogFunction.bind(this);
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
   * Append a message to the result div.
   *
   * @param {string} element The element to append the message to.
   * @param {string} message The message to append.
   */
  appendMessage(element, message) {
    const resultDiv = document.querySelector(element);
    const messageDiv = document.createElement('p');
    messageDiv.innerHTML = message;

    // Check if the message is already in the result div
    for (const child of resultDiv.children) {
      if (child.innerHTML === message) {
        // we have already attached this message, exit
        return;
      }
    }
    resultDiv.appendChild(messageDiv);
  }

  /**
   * Remove all messages from the indicated element.
   *
   * @param {string} element The element to remove the messages from.
   */
  clearMessage(element) {
    const resultDiv = document.querySelector(element);
    resultDiv.innerHTML = '';
  }

  /**
   * Hides an element from the popup if it exists.
   *
   * @param {string} selector The id of the element to hide.
   */
  hideElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
      element.hide();
    }
  }

  /**
   * Shows an element from the popup.
   *
   * @param {string} selector The id of the element to show.
   */
  showElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
      element.show();
    }
  }

  /**
   * Throttle function to limit the rate of function calls.
   *
   * @param {Function} func The function to throttle
   * @param {int} delay The delay in milliseconds
   * @return {func} function with throlling
   */
  throttle(func, delay) {
    let timeoutId;
    let called = false; // Flag to track if the function has been called already

    return function () {
      const context = this;
      const args = arguments;
      if (!called) {
        func.apply(context, args);
        called = true;
        timeoutId = setTimeout(() => {
          called = false; // Reset the flag after the function is called
        }, delay);
      }
    };
  }

  /**
   * Convert the form and its values to an object.
   *
   * @param {HTMLFormElement} form The form to convert to an object.
   * @return {object} The form data as an object.
   */
  formToObj(form) {
    const data = {};
    for (const element of form.elements) {
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
   * Send a message to the tab.
   *
   * @param {Object} message The message to send.
   * @param {Function} callback A callback function to handle the response.
   */
  sendMessage(message, callback) {
    // console.log('sending message:', message);
    // console.log('callback:', callback);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error sending message:', chrome.runtime.lastError);
          } else {
            if (callback && typeof callback === 'function') {
              callback(response);
            }
          }
        });
      } else {
        console.error('No active tabs found.');
      }
    });
  }

  /**
   * Get a value from chrome.storage.sync.
   *
   * @param {string} key The key to get the value of.
   * @return {Promise} The value of the key.
   */
  getValueFromSync(key) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get([key], function (result) {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
          reject(chrome.runtime.lastError.message);
        } else {
          resolve(result[key]);
        }
      });
    });
  }

  /**
   * Retrieve the job ID from the URL.
   * This should only work on LinkedIn.
   *
   * @param {string} url The URL to extract the job ID from.
   * @return {string} The job ID or null if not found.
   */
  getJobIdFromUrl(url) {
    // const jobIdMatch = url.match(/view\/|currentJobId=(\d+)\//);
    const jobIdMatch = url.match(/(\/view\/|currentJobId=)(\d+)/);
    // console.log('jobIdMatch:', jobIdMatch);
    return jobIdMatch ? jobIdMatch[2] : '';
  }

  /**
   * Add a job to the applied jobs list.
   *
   * @param {string} jobId The ID of the job to add.
   * @return {void}
   */
  async addJobToApplied(jobId) {
    if (jobId === '') {
      console.error('Job ID not found in URL:', jobId);
      return;
    }

    const appliedJobs = await this.getAppliedJobs();
    if (appliedJobs.includes(jobId)) {
      console.error('Job already in applied jobs:', jobId);
      return;
    }

    appliedJobs.push(jobId);
    console.log('Applied jobs:', appliedJobs);
    chrome.storage.sync.set({ appliedJobs: appliedJobs }, function () {
      console.log('Job added to applied jobs:', jobId);
    });
  }

  /**
   * Retrieve the applied jobs from chrome.storage.sync.
   *
   * @returns {string[]} The saved applied jobs.
   */
  getAppliedJobs() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get('appliedJobs', function (result) {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
          reject(chrome.runtime.lastError.message);
        } else {
          resolve(result.appliedJobs || []);
        }
      });
    });
  }
}
