import dotenv from 'dotenv';

dotenv.config();
const doPostUrl = process.env.DO_POST_URL;

/**
 * Submits the form data to the Google Sheet.
 *
 * @param {object} formData The form data to be saved in the Google Sheet.
 * @returns the Promise returned by the fetch request, or nothing if there is an error.
 */
export function submitFormData(formData) {
  // I'm not quite sure how to handle the fetch request with error in this split version
  return fetch(doPostUrl + '?action=addRow', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  }).catch((error) => console.error('Error:', error));
}

/**
 * Fetches the result for the getTotalJobs action from the Google Apps Script.
 *
 * @returns the response data returned by the fetch request, or nothing if there is an error.
 */
export function fetchTotalJobsApplied() {
  // Fetch request using baseURL with a different action parameter
  return fetch(doPostUrl + '?action=getTotalJobs', {
    method: 'GET',
  })
    .then((response) => {
      return response.json();
    })
    .catch((error) => console.error('Error fetching total jobs:', error));
}

/**
 * Fetches the result for the getDailyTotal action from the Google Apps Script.
 *
 * @returns the response data returned by the fetch request, or nothing if there is an error.
 */
export function fetchTotalJobsAppliedToday() {
  return fetch(doPostUrl + '?action=getDailyTotal', {
    method: 'GET',
  })
    .then((response) => {
      return response.json();
    })
    .catch((error) => {
      console.error('Error fetching total jobs today:', error);
    });
}
