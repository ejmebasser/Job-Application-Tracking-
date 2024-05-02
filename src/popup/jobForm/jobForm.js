import OAuth from '../../user/oauth.js';
import Utils from '../../utils/utils.js';

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

  async fetchJobsAndAlert() {
    try {
      const oauth = await this.initializeOAuth();

      // Getting the current time when the function is run
      const currentTime = new Date();
      // Formatting the time; for simplicity, we'll use toLocaleString() here,
      // but you can format it as per your requirements
      const formattedTime = currentTime.toLocaleString();

      // Fetching values from multiple cells simultaneously
      const results = await Promise.all([
        oauth.getCellValue('B1'), // Total jobs applied today
        oauth.getCellValue('B2'), // Total jobs applied in total
        oauth.getCellValue('D1'), // Total advanced applications today
        oauth.getCellValue('D2'), // Total advanced applications in total
        oauth.getCellValue('F1'), // Total quick apply today
        oauth.getCellValue('F2'), // Total quick apply in total
        oauth.getCellValue('H1'), // Job search duration
      ]);

      // Constructing a message from the fetched values, including the time
      const alertMessage = `
        Function run at: ${formattedTime}
        Total jobs applied today: ${results[0].values[0]}
        Total jobs applied in total: ${results[1].values[0]}
        Total advanced applications today: ${results[2].values[0]}
        Total advanced applications in total: ${results[3].values[0]}
        Total quick apply today: ${results[4].values[0]}
        Total quick apply in total: ${results[5].values[0]}
        Job search duration: ${results[6].values[0]}
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

function getChromeStorageData(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(key, (result) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(result[key]);
    });
  });
}

async function requestUserInfo() {
  try {
    const userInfo = await getChromeStorageData('userInfo');
    if (userInfo) {
      console.log('User info retrieved:', userInfo);
      return userInfo; // Use or return userInfo as needed
    } else {
      throw new Error('No user info found.');
    }
  } catch (error) {
    console.error(error);
    // Handle error or absence of userInfo as needed
  }
}

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

function fetchUsernameEmail() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get('userInfo', (result) => {
      if (chrome.runtime.lastError) {
        // Handle errors during storage access
        console.error(
          'Error retrieving user info from chrome.storage:',
          chrome.runtime.lastError
        );
        reject(chrome.runtime.lastError);
      } else {
        // Check if the userInfo exists and is not undefined
        if (result.userInfo) {
          console.log('Retrieved user email from storage:', result.userInfo);
          resolve(result.userInfo);
        } else {
          console.log('No user info found in storage.');
          reject(new Error('No user info found in storage.'));
        }
      }
    });
  });
}

// Make sure this code exists in a context where chrome.runtime.onMessage is accessible
// Typically this would be in a background script or a content script

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'invokeTestAlert') {
    testAlert();
    sendResponse({ message: 'Alert displayed successfully' });
  }
});

function testAlert() {
  alert('This is data from the test alert on the jobform.js');
}
