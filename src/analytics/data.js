import User from '../user/user';

const postURL =
  'https://script.google.com/macros/s/AKfycbwCoexkvlaRrF1UjGMpWzV5U_A5Esj7xq-mufXbIogBGf0Kn0U4SmzFihL_F_qn1GyF/exec';

const getURL =
  'https://script.google.com/macros/s/AKfycbwJno2QaJwmhEJ4Glf7yKixDRCQxKggD2jCXSHxGwnGw-ZWY3aT9_bEL-4iXncORf9B/exec';

/**
 * Function to handle the 'submitToMasterTracker' action.
 * This uses a Google Apps Script web app to submit data to a master tracker.
 *
 * @param {Object} requestData The message parameter containing the data to be submitted.
 * @param {*} sendResponse The function to send a response back to the sender.
 */
export async function handleSubmitToMasterTracker(requestData, sendResponse) {
  try {
    const response = await fetch(`${postURL}?action=addUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    sendResponse({ success: true, data: data });
  } catch (error) {
    console.error('Error submitting data:', error);
    sendResponse({ success: false, error: error.message });
  }
  return true; // indicates asynchronous response
}

export async function submitSimpleJobTitle() {
  const user = new User();

  alert('Fetching and submitting job application data...');
  const userEmail = await user.getUserEmail();

  alert('userEmail ' + userEmail);
  try {
    // Fetch the data prepared for the API
    const data = await fetchJobsDataAndPrepareForAPI();
    if (data.error) {
      throw new Error(data.error);
    }

    // Construct dataForAPI with dynamically fetched data
    const dataForAPI = {
      timestamp: data.timestamp || new Date().toISOString(),
      totalJobsToday: data.totalJobsToday
        ? data.totalJobsToday[0]
        : 'undefined',
      totalJobsTotal: data.totalJobsTotal
        ? data.totalJobsTotal[0]
        : 'undefined',
      advancedApplicationsToday: data.advancedApplicationsToday
        ? data.advancedApplicationsToday[0]
        : 'undefined',
      advancedApplicationsTotal: data.advancedApplicationsTotal
        ? data.advancedApplicationsTotal[0]
        : 'undefined',
      quickApplyToday: data.quickApplyToday
        ? data.quickApplyToday[0]
        : 'undefined',
      quickApplyTotal: data.quickApplyTotal
        ? data.quickApplyTotal[0]
        : 'undefined',
      jobSearchDuration: data.jobSearchDuration
        ? data.jobSearchDuration[0]
        : 'undefined',
      userName: userEmail ? userEmail : 'undfined',
    };

    console.log('Sending Data:', JSON.stringify(dataForAPI, null, 2));

    // Sending the prepared data to the server
    const response = await fetch(`${postURL}?action=addUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataForAPI),
    });

    if (!response.ok) {
      const errorResponse = await response.text();
      console.error('Failed API response:', errorResponse);
      throw new Error(`Network response was not ok: ${errorResponse}`);
    }

    const responseData = await response.json();
    console.log('Success:', responseData);
  } catch (error) {
    //console.error('Error submitting job data:', error);
    //alert('Failed to submit job data. Please check the console for more details.');
  }
}

function fetchJobsDataAndPrepareForAPI() {
  return new Promise((resolve, reject) => {
    fetchUsernameEmail()
      .then((email) => {
        alert('Email retrieved: ' + email); // Display the retrieved email in an alert

        chrome.runtime.sendMessage({ action: 'fetchJobsData' }, (response) => {
          if (response.success && response.data && response.data.dataForAPI) {
            console.log('Data fetched:', response.data);

            const apiData = response.data.dataForAPI;

            const structuredData = {
              timestamp: apiData.timestamp || new Date().toISOString(),
              totalJobsToday:
                typeof apiData.totalJobsToday === 'string'
                  ? apiData.totalJobsToday
                  : 'undefined',
              totalJobsTotal:
                typeof apiData.totalJobsTotal === 'string'
                  ? apiData.totalJobsTotal
                  : 'undefined',
              advancedApplicationsToday:
                typeof apiData.advancedApplicationsToday === 'string'
                  ? apiData.advancedApplicationsToday
                  : 'undefined',
              advancedApplicationsTotal:
                typeof apiData.advancedApplicationsTotal === 'string'
                  ? apiData.advancedApplicationsTotal
                  : 'undefined',
              quickApplyToday:
                typeof apiData.quickApplyToday === 'string'
                  ? apiData.quickApplyToday
                  : 'undefined',
              quickApplyTotal:
                typeof apiData.quickApplyTotal === 'string'
                  ? apiData.quickApplyTotal
                  : 'undefined',
              jobSearchDuration:
                typeof apiData.jobSearchDuration === 'string'
                  ? apiData.jobSearchDuration
                  : 'undefined',
              userName: email || 'undefined', // Use the fetched email in the data structure
            };

            // Submit the structured data
            chrome.runtime.sendMessage(
              {
                action: 'submitToMasterTracker',
                data: structuredData,
              },
              (submitResponse) => {
                if (submitResponse.success) {
                  console.log(
                    'Data submitted successfully:',
                    submitResponse.data
                  );
                  resolve(submitResponse.data);
                } else {
                  console.error('Failed to submit data:', submitResponse.error);
                  reject(submitResponse.error);
                }
              }
            );
          } else {
            console.error(
              'Failed to fetch data or data is improperly structured:',
              response.error
            );
            reject('Data fetch failed or data structure incorrect');
          }
        });
      })
      .catch((error) => {
        console.error('Failed to retrieve email:', error);
        reject('Email retrieval failed: ' + error.message);
      });
  });
}

async function submitSimpleJobTitle() {
  alert('Fetching and submitting job application data...');

  const userEmail = await fetchUsernameEmail();
  alert('userEmail ' + userEmail);
  try {
    // Fetch the data prepared for the API
    const data = await this.fetchJobsDataAndPrepareForAPI();
    if (data.error) {
      throw new Error(data.error);
    }

    // Construct dataForAPI with dynamically fetched data
    const dataForAPI = {
      timestamp: data.timestamp || new Date().toISOString(),
      totalJobsToday: data.totalJobsToday
        ? data.totalJobsToday[0]
        : 'undefined',
      totalJobsTotal: data.totalJobsTotal
        ? data.totalJobsTotal[0]
        : 'undefined',
      advancedApplicationsToday: data.advancedApplicationsToday
        ? data.advancedApplicationsToday[0]
        : 'undefined',
      advancedApplicationsTotal: data.advancedApplicationsTotal
        ? data.advancedApplicationsTotal[0]
        : 'undefined',
      quickApplyToday: data.quickApplyToday
        ? data.quickApplyToday[0]
        : 'undefined',
      quickApplyTotal: data.quickApplyTotal
        ? data.quickApplyTotal[0]
        : 'undefined',
      jobSearchDuration: data.jobSearchDuration
        ? data.jobSearchDuration[0]
        : 'undefined',
      userName: userEmail ? userEmail : 'undfined',
    };

    console.log('Sending Data:', JSON.stringify(dataForAPI, null, 2));

    // Sending the prepared data to the server
    const response = await fetch(`${postURL}?action=addUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataForAPI),
    });

    if (!response.ok) {
      const errorResponse = await response.text();
      console.error('Failed API response:', errorResponse);
      throw new Error(`Network response was not ok: ${errorResponse}`);
    }

    const responseData = await response.json();
    console.log('Success:', responseData);
  } catch (error) {
    //console.error('Error submitting job data:', error);
    //alert('Failed to submit job data. Please check the console for more details.');
  }
}

async function retrieveData() {
  alert('jobForm line 254');

  try {
    const response = await fetch(`${getURL}?action=getUsers`, {
      method: 'GET',
    });
    const data = await response.json();
    console.log(data);
    // Display data or log message depending on the requirement
    alert(JSON.stringify(data, null, 2)); // Example of displaying data
  } catch (error) {
    console.error('Error fetching users:', error);
    alert('Error fetching data. Please check the console for more details.');
  }
}
