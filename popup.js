var postURL = 'https://script.google.com/macros/s/AKfycbz9vrxvqiHk9gFLxFU4FTsM2tHTo1leh1CYxVO3foM0BJMN7Srr1ohSAif1ftBM0PI/exec';
var getURL = 'https://script.google.com/macros/s/AKfycbwmeb4AKGSoPc7-7URWWil_BpDWXueMiMmAcE6RnQWsKiabSB-1VeQhhucVLyyvWpXW/exec';
var getdailyURL = 'https://script.google.com/macros/s/AKfycbwZSXOZTzz--npozzkW2FOiXBzd2HMV4hPh8Xy3w4u4tH3F-tACDydqTylDfWi6yS8h/exec'

document.addEventListener('DOMContentLoaded', function() {
    var loadDataButton = document.getElementById('loadDataButton');
    loadDataButton.addEventListener('click', function() {
        loadDataButton.style.display = 'none';

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "loadData"}, function(response) {
                if (response) {
                    createForm(response);
                }
            });
        });
    });
});

function createForm(response) {
    var resultDiv = document.getElementById('result');
    var form = document.createElement('form');
    form.id = 'dataForm';
    form.innerHTML = `
        <label for="jobTitle">Job Title:</label>
        <input type="text" name="jobTitle" value="${response.jobTitle}"><br>
        <label for="company">Company:</label>
        <input type="text" name="company" value="${response.company}"><br>
        <label for="unknownInput">Unknown Input:</label>
        <input type="text" name="unknownInput" value="${response.unknownInput}"><br>
        <label for="applicationDateTime">Application Date and Time:</label>
        <input type="text" name="applicationDateTime" value="${response.applicationDateTime}"><br>
        <label for="url">URL:</label>
        <input type="text" name="url" value="${response.url}" readonly><br>
    `;

    var submitButton = document.createElement('input');
    submitButton.type = 'submit';
    submitButton.value = 'Submit';
    submitButton.id = 'submitButton';
    form.appendChild(submitButton);

    resultDiv.appendChild(form);

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        submitFormData();
        appendSubmissionMessage();
        removeSubmitButton();
        fetchTotalJobsApplied(); 
        fetchTotalJobsAppliedToday();
    });
}

function submitFormData() {
    var form = document.getElementById('dataForm');
    var formData = new FormData(form);
    var object = {};
    formData.forEach((value, key) => { object[key] = value; });

    // Fetch request to send the JSON data using baseURL with action parameter
    fetch(postURL + '?action=addUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(object)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Response:', data);
        fetchTotalJobsApplied(); // Fetch total jobs applied after successful submission
    })
    .catch(error => console.error('Error:', error));
}

function appendSubmissionMessage() {
    var resultDiv = document.getElementById('result');
    var successMessage = document.createElement('p');
    successMessage.textContent = 'Data Submitted';
    resultDiv.appendChild(successMessage);
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
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        logTotalJobs(data);
        console.log(data); 
        // console.alert(data) // Correct this to console.log or alert
    })
    .catch(error => console.error('Error fetching total jobs:', error));
}

function logTotalJobs(data) {
    var resultDiv = document.getElementById('result');
    var jobsMessage = document.createElement('p');

    // Check if the data is in the expected nested array format
    if (data && Array.isArray(data) && data[0] && Array.isArray(data[0])) {
        let totalJobs = data[0][0];
        jobsMessage.textContent = `${totalJobs} jobs applied to in total`;
    } else {
        jobsMessage.textContent = "Unable to find total jobs data";
    }

    resultDiv.appendChild(jobsMessage);
}

function fetchTotalJobsAppliedToday() {
    fetch(getdailyURL+'?action=getDailyTotal', {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Daily Total Response:', data); // Log the response
        logTotalJobsToday(data);
    })
    .catch(error => {
        console.error('Error fetching total jobs today:', error); // Log any errors
    });
}

function logTotalJobsToday(data) {
    var resultDiv = document.getElementById('result');
    var jobsMessage = document.createElement('p');

    if (data && Array.isArray(data) && data[0] && Array.isArray(data[0])) {
        let totalJobsToday = data[0][0];
        jobsMessage.textContent = `${totalJobsToday} jobs applied to in total today`;
    } else {
        console.error("Data format is not as expected:", data); // Log unexpected data format
        jobsMessage.textContent = "Unable to find total jobs data for today";
    }

    resultDiv.appendChild(jobsMessage);
}
