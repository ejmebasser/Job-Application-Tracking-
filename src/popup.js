import {
  submitFormData,
  fetchTotalJobsApplied,
  fetchTotalJobsAppliedToday,
} from './appScriptConnector.js';

/**
 * Handling attaching mechanics after the DOM has been loaded.
 *
 * I have tested this and the query only sends the message to scrape when the popup is opened.
 */
document.addEventListener('DOMContentLoaded', function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: 'loadData' },
      function (response) {
        if (response) {
          updateForm(response);
        }
      }
    );
  });

  chrome.storage.local.get(['sheetURL'], function (result) {
    if (result.sheetURL) {
      createSheetLink(result.sheetURL);
    }
  });

  const form = document.getElementById('jobForm');
  form.addEventListener('submit', function (event) {
    event.preventDefault();
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

function updateForm(formJson) {
  for (const id in formJson) {
    try {
      document.querySelector(`input[name="${id}"]`).value = formJson[id];
    } catch (error) {
      console.log('id not found', id);
      console.error(error);
    }
  }

  const submit = document.getElementById('submitButton');
  submit.addEventListener(
    'click',
    debounce(() => handleSubmit(formJson), 500)
  );
}

function handleSubmit(formJson) {
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
  fetchTotalJobsApplied()
    .then((totalJobs) => {
      logTotalJobs(totalJobs);
    })
    .catch((error) => {
      console.error('Error:', error);
    });

  fetchTotalJobsAppliedToday()
    .then((jobsToday) => {
      logTotalJobsToday(jobsToday);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

function removeSubmitButton() {
  var submitButton = document.getElementById('submitButton');
  if (submitButton) {
    submitButton.remove();
  }
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

  appendResult(jobsMessage);
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

  appendResult(jobsMessage);
}

function appendResult(message) {
  const resultDiv = document.getElementById('result');
  const messageDiv = document.createElement('p');
  messageDiv.innerHTML = message;
  resultDiv.appendChild(messageDiv);
}

function debounce(func, delay) {
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
