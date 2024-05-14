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

  async submitSimpleJobTitle() {
    //alert('Fetching and submitting job application data...');
    const postURL = "https://script.google.com/macros/s/AKfycbwCoexkvlaRrF1UjGMpWzV5U_A5Esj7xq-mufXbIogBGf0Kn0U4SmzFihL_F_qn1GyF/exec";
    const userEmail = await fetchUserInfo_01();
    //alert('userEmail ' + userEmail);
    try {
      const data = await this.fetchJobsDataAndPrepareForAPI();
      if (data.error) {
        throw new Error(data.error);
      }
      const dataForAPI = {
        "timestamp": data.timestamp || new Date().toISOString(),
        "totalJobsToday": data.totalJobsToday ? data.totalJobsToday[0] : 'undefined',
        "totalJobsTotal": data.totalJobsTotal ? data.totalJobsTotal[0] : 'undefined',
        "advancedApplicationsToday": data.advancedApplicationsToday ? data.advancedApplicationsToday[0] : 'undefined',
        "advancedApplicationsTotal": data.advancedApplicationsTotal ? data.advancedApplicationsTotal[0] : 'undefined',
        "quickApplyToday": data.quickApplyToday ? data.quickApplyToday[0] : 'undefined',
        "quickApplyTotal": data.quickApplyTotal ? data.quickApplyTotal[0] : 'undefined',
        "jobSearchDuration": data.jobSearchDuration ? data.jobSearchDuration[0] : 'undefined',
        "userName": userEmail ? userEmail : 'undefined'
      };
      console.log('Sending Data:', JSON.stringify(dataForAPI, null, 2));
      const response = await fetch(`${postURL}?action=addUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataForAPI)
      });
      if (!response.ok) {
        const errorResponse = await response.text();
        console.error('Failed API response:', errorResponse);
        throw new Error(`Network response was not ok: ${errorResponse}`);
      }
      const responseData = await response.json();
      console.log('Success:', responseData);
    } catch (error) {
      console.error('Error submitting job data:', error);
    }
  }

  async fetchJobsDataAndPrepareForAPI() {
    try {
      const oauth = await this.initializeOAuth();
      const currentTime = new Date();
      const formattedTime = currentTime.toISOString();
      const results = await Promise.all([
        oauth.getCellValue('B1'),
        oauth.getCellValue('B2'),
        oauth.getCellValue('D1'),
        oauth.getCellValue('D2'),
        oauth.getCellValue('F1'),
        oauth.getCellValue('F2'),
        oauth.getCellValue('H1')
      ]);
      const dataForAPI = {
        timestamp: formattedTime,
        totalJobsToday: results[0].values[0],
        totalJobsTotal: results[1].values[0],
        advancedApplicationsToday: results[2].values[0],
        advancedApplicationsTotal: results[3].values[0],
        quickApplyToday: results[4].values[0],
        quickApplyTotal: results[5].values[0],
        jobSearchDuration: results[6].values[0]
      };
      //alert("Line 115 " + JSON.stringify(dataForAPI, null, 2));
      return dataForAPI;
    } catch (error) {
      console.error('Error fetching job application data:', error);
      return { error: 'Failed to fetch job application data. See console for details.' };
    }
  }

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
      this.utils.clearMessage('#result');
      this.utils.showElement('#saveData');
    }
  }

  async handleSubmit() {
    //alert('line 130-04')
    //await fetchAndUseUserInfo03()
    //fetchAndUseUserInfo03()
    //alert('line 56, jobform.js');
    //fetchUserInfo_01()
    const alpha = await fetchUserInfo_01()
    console.log(alpha + "this is line 136 of handlesubmit")
    const formJson = this.utils.formToObj(this.form);
    const userInfo = alpha;
    //const userInfo = 'sampleInfo@emai.com';
    //alert(`User Info: ${JSON.stringify(userInfo, null, 2)}`);
    const applyType = isEasyApplyAvailable();
    formJson.email = userInfo;
    formJson["applicationType"] = applyType;
    //alert(JSON.stringify(formJson, null, 2));
    const saveButtonId = '#saveData';
    const saveButton = this.form.querySelector(saveButtonId);
    saveButton.textContent = 'Submitting...';
    const oauth = await this.initializeOAuth();
    oauth.appendValues(formJson)
      .then((response) => {
        if (response.status >= 200 && response.status < 300) {
          //alert('it worked');
          const jobId = this.utils.getJobIdFromUrl(formJson.url);
          this.utils.addJobToApplied(jobId);
          this.utils.appendMessage('#result', 'Data Submitted');
          this.utils.hideElement(saveButtonId);
          this.fetchTotalJobsApplied();
          this.fetchTotalJobsAppliedToday();
          //alert('testing data sharing');
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
    const autoHideCheckbox = document.querySelector('input[name="autoHide"]');
    alert(autoHideCheckbox.checked)
    if (autoHideCheckbox && autoHideCheckbox.checked) {
        // Job dismissal code runs only if the autoHide checkbox is checked
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'dismissJob' }, function (response) {
                if (response && response.result === 'success') {
                    console.log('Job dismissed successfully');
                } else {
                    console.error('Failed to dismiss job');
                }
            });
        });
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: () => {
                    const dismissButton = document.querySelector('.jobs-search-results-list__list-item--active-v2 .job-card-container__action');
                    if (dismissButton) {
                        dismissButton.click();
                    } else {
                        console.error('Dismiss button not found.');
                    }
                },
            });
        });
    } else {
        // If the checkbox is not checked, log a message or handle accordingly
        console.log('Auto-hide is disabled, not dismissing the job.');
    }
    
    ///end of dismissing of a
    alert('line 434-01');
   // Check the value of 'dataConsent' input field
   // Correctly check the 'dataConsent' checkbox status
   const dataConsentCheckbox = document.querySelector('input[name="dataConsent"]');
   console.log("DataConsentCheckbox:", dataConsentCheckbox);

   if (dataConsentCheckbox) {
       alert(dataConsentCheckbox);
       const isDataConsentEnabled = dataConsentCheckbox.checked;
       console.log("Is data consent enabled:", isDataConsentEnabled);
       if (isDataConsentEnabled) {
           await this.submitSimpleJobTitle();
       }
   } else {
       console.error("Data consent checkbox not found");
   }
  }

  async fetchTotalJobsApplied() {
    const oauth = await this.initializeOAuth();
    oauth.getCellValue('B2')
      .then((data) => {
        const totalJobs = data.values[0];
        this.utils.appendMessage('#result', `${totalJobs} jobs applied to in total`);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  async fetchTotalJobsAppliedToday() {
    const oauth = await this.initializeOAuth();
    oauth.getCellValue('B1')
      .then((data) => {
        const totalJobsToday = data.values[0];
        this.utils.appendMessage('#result', `${totalJobsToday} jobs applied to in total today`);
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
      return totalJobsToday;
    } catch (error) {
      console.error('Error:', error);
      return 'Error fetching data';
    }
  }

  async fetchJobsAndAlert() {
    try {
      const oauth = await this.initializeOAuth();
      const currentTime = new Date();
      const formattedTime = currentTime.toLocaleString();
      const results = await Promise.all([
        oauth.getCellValue('B1'),
        oauth.getCellValue('B2'),
        oauth.getCellValue('D1'),
        oauth.getCellValue('D2'),
        oauth.getCellValue('F1'),
        oauth.getCellValue('F2'),
        oauth.getCellValue('H1')
      ]);
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
      //alert(alertMessage);
    } catch (error) {
      console.error('Error fetching job application data:', error);
      //alert('Error fetching job application data. Please check the console for more details.');
    }
  }

  async retrieveData() {
    //alert("jobForm line 254");
    const getURL = "https://script.google.com/macros/s/AKfycbwJno2QaJwmhEJ4Glf7yKixDRCQxKggD2jCXSHxGwnGw-ZWY3aT9_bEL-4iXncORf9B/exec";
    try {
      const response = await fetch(`${getURL}?action=getUsers`, {
        method: 'GET',
      });
      const data = await response.json();
      console.log(data);
      //alert(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error fetching users:', error);
      //alert('Error fetching data. Please check the console for more details.');
    }
  }

  loadData() {
    const jobForm = this;
    this.utils.sendMessage({ action: 'loadData' }, function (response) {
      console.log('loadData response:', response);
      if (response) {
        jobForm.updateForm(response);
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
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(['userInfo'], function(result) {
      if (chrome.runtime.lastError) {
        console.error('Error retrieving userInfo:', chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else if (result.userInfo) {
        console.log('Retrieved userInfo:', result.userInfo);
        resolve(result.userInfo);
      } else {
        console.log('No userInfo found in storage.');
        resolve(undefined);  // You might want to reject here instead to handle this as an error.
      }
    });
  });
}


function isEasyApplyAvailable() {
  const easyApplyButton = Array.from(document.querySelectorAll('button')).find(button => button.textContent.trim() === 'Easy Apply');
  return easyApplyButton ? "QUICK APPLY" : "ADVANCED APPLY";
}

function fetchUsernameEmail() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get('userInfo', (result) => {
      if (chrome.runtime.lastError) {
        console.error('Error retrieving user info from chrome.storage:', chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        if (result.userInfo) {
          console.log("Retrieved user email from storage:", result.userInfo);
          resolve(result.userInfo);
        } else {
          console.log("No user info found in storage.");
          reject(new Error("No user info found in storage."));
        }
      }
    });
  });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "invokeTestAlert") {
    testAlert();
    sendResponse({message: 'Alert displayed successfully'});
  }
});

function testAlert() {
  //alert('This is data from the test alert on the jobform.js');
}

function fetchUsernameEmail01() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get('userInfo', (result) => {
      if (chrome.runtime.lastError) {
        console.error('Error retrieving user info from chrome.storage:', chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else if (result.userInfo) {
        console.log("Retrieved user email from storage:", result.userInfo);
        resolve(result.userInfo);
      } else {
        console.log("No user info found in storage.");
        reject(new Error("No user info found in storage."));
      }
    });
  });
}

function fetchAndUseUserInfo03() {
  chrome.storage.local.get('userInfo', function(result) {
    if (result.userInfo) {
      console.log("Retrieved stored user info:-01", result.userInfo);
      // Here you can use the userInfo however you need to within your app
      // For example, display it in the UI, use it to make authenticated requests, etc.
      handleUserInfo(result.userInfo);
    } else {
      console.log("No user info found in storage-03.");
    }
  });
}

// Example function to handle the user info
function handleUserInfo(userInfo) {
  console.log("Handling user info in the app:", userInfo);
  // Update UI or perform other actions with the user info
}

// This modified version returns a Promise that resolves with the user info or rejects with an error.
function fetchUserInfo_01() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({action: "getUserInfo"}, function(response) {
      if (response.error) {
        console.error("Failed to fetch user info:", response.error);
        reject(response.error);  // Reject the Promise with the error
      } else {
        console.log("Received user info: line 395", response.userInfo);
        resolve(response.userInfo);  // Resolve the Promise with the user info
      }
    });
  });
}
