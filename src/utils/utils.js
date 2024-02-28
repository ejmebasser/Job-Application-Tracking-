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
    resultDiv.appendChild(messageDiv);
  }

  /**
   * Removes a button from the popup.
   *
   * @param {string} buttonId The id of the button to remove.
   */
  removeButton(buttonId) {
    const submitButton = document.querySelector(buttonId);
    if (submitButton) {
      submitButton.remove();
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
    console.log('sending message:', message);
    console.log('callback:', callback);
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
}
