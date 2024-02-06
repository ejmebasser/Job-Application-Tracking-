var postURL =
  'https://script.google.com/macros/s/AKfycbz9vrxvqiHk9gFLxFU4FTsM2tHTo1leh1CYxVO3foM0BJMN7Srr1ohSAif1ftBM0PI/exec';
var getURL =
  'https://script.google.com/macros/s/AKfycbwmeb4AKGSoPc7-7URWWil_BpDWXueMiMmAcE6RnQWsKiabSB-1VeQhhucVLyyvWpXW/exec';
var getdailyURL =
  'https://script.google.com/macros/s/AKfycbwZSXOZTzz--npozzkW2FOiXBzd2HMV4hPh8Xy3w4u4tH3F-tACDydqTylDfWi6yS8h/exec';

document.addEventListener('DOMContentLoaded', function () {
  var loadDataButton = document.getElementById('loadDataButton');
  loadDataButton.addEventListener('click', function () {
    loadDataButton.style.display = 'none';

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: 'loadData' },
        function (response) {
          if (response) {
            createForm(response);
          }
        }
      );
    });
  });
  // chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  //   chrome.tabs.sendMessage(
  //     tabs[0].id,
  //     { action: 'loadData' },
  //     function (response) {
  //       if (response) {
  //         updateForm(response);
  //       }
  //     }
  //   );
  // });

  chrome.storage.local.get(['sheetURL'], function (result) {
    if (result.sheetURL) {
      createSheetLink(result.sheetURL);
    }
  });

  toggleCogFunction();
});

/**
 * Function to handle the linkSheet button click event.
 */
function updateSheet() {
  const sheetElement = document.querySelector('#sheet');
  if (sheetElement.firstChild) {
    sheetElement.removeChild(sheetElement.firstChild);
  }

  const sheetInput = document.createElement('input');
  sheetInput.type = 'text';
  sheetInput.id = 'sheetUrl';
  sheetInput.onkeydown = function (event) {
    if (event.key === 'Enter') {
      sheetURL = sheetInput.value;
      saveSheet();
    }
  };
  sheetElement.appendChild(sheetInput);

  toggleCogFunction(true);
}

/**
 * Function to handle the saveSheet button click event.
 */
function saveSheet() {
  const sheetElement = document.querySelector('#sheet');
  const sheetURL = sheetElement.querySelector('input').value;
  console.log(sheetURL);

  if (sheetElement.firstChild) {
    sheetElement.removeChild(sheetElement.firstChild);
  }
  if (!sheetURL) {
    const textElement = document.createElement('span');
    textElement.textContent = 'No Google Sheet URL provided';
    sheetElement.appendChild(textElement);
  } else {
    createSheetLink(sheetURL);

    chrome.runtime.sendMessage({ action: 'loadSheet', sheetURL: sheetURL });
  }

  toggleCogFunction(false);
}

function createSheetLink(sheetURL) {
  const sheetElement = document.querySelector('#sheet');

  const link = document.createElement('a');
  link.text = 'Open Google Sheet';
  link.href = sheetURL;
  link.target = '_blank';
  sheetElement.appendChild(link);
}

function toggleCogFunction(save = false) {
  const clickFunction = save ? saveSheet : updateSheet;
  const oldFunction = save ? updateSheet : saveSheet;

  const cog = document.querySelector('#linkSheet');
  cog.removeEventListener('click', oldFunction);
  cog.addEventListener('click', clickFunction);
}

function updateForm(response) {
  const form = document.querySelector('#jobForm');
  for (const id in response) {
    document.querySelector(`input[name="${id}"]`).value = response[id];
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    submitFormData();
    appendSubmissionMessage();
    removeSubmitButton();
    fetchTotalJobsApplied();
    fetchTotalJobsAppliedToday();
  });
}

function submitFormData() {
  var form = document.getElementById('jobForm');
  var formData = new FormData(form);
  var object = {};
  formData.forEach((value, key) => {
    object[key] = value;
  });

  // Fetch request to send the JSON data using baseURL with action parameter
  fetch(postURL + '?action=addUser', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(object),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Response:', data);
      fetchTotalJobsApplied(); // Fetch total jobs applied after successful submission
    })
    .catch((error) => console.error('Error:', error));
}

function appendSubmissionMessage() {
  updateResult('Data Submitted');
}

function removeSubmitButton() {
  var submitButton = document.getElementById('submitButton');
  if (submitButton) {
    submitButton.remove();
  }
}

function fetchTotalJobsApplied() {
  // Fetch request using baseURL with a different action parameter
  fetch(getURL + '?action=getUsers', {
    method: 'GET',
  })
    .then((response) => response.json())
    .then((data) => {
      logTotalJobs(data);
      console.log(data);
      // console.alert(data) // Correct this to console.log or alert
    })
    .catch((error) => console.error('Error fetching total jobs:', error));
}

function logTotalJobs(data) {
  let jobsMessage = '';

  // Check if the data is in the expected nested array format
  if (data && Array.isArray(data) && data[0] && Array.isArray(data[0])) {
    const totalJobs = data[0][0];
    jobsMessage = `${totalJobs} jobs applied to in total`;
  } else {
    jobsMessage = 'Unable to find total jobs data';
  }

  updateResult(jobsMessage);
}

function fetchTotalJobsAppliedToday() {
  fetch(getdailyURL + '?action=getDailyTotal', {
    method: 'GET',
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Daily Total Response:', data); // Log the response
      logTotalJobsToday(data);
    })
    .catch((error) => {
      console.error('Error fetching total jobs today:', error); // Log any errors
    });
}

function logTotalJobsToday(data) {
  let jobsMessage = '';

  if (data && Array.isArray(data) && data[0] && Array.isArray(data[0])) {
    const totalJobsToday = data[0][0];
    jobsMessage = `${totalJobsToday} jobs applied to in total today`;
  } else {
    console.error('Data format is not as expected:', data); // Log unexpected data format
    jobsMessage = 'Unable to find total jobs data for today';
  }

  updateResult(jobsMessage);
}

function updateResult(message) {
  const resultDiv = document.getElementById('result');
  const messageDiv = document.createElement('p');
  resultDiv.appendChild(messageDiv);
}
