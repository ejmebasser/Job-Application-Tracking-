import axios from 'axios';

/**
 * OAuth class to handle Google OAuth2.0
 */
export default class OAuth {
  /**
   * Constructor for OAuth class
   */
  constructor() {
    this.getOAuth();

    this.searchFile = this.getSheets.bind(this);
  }

  /**
   * We cannot use async/await in the constructor, so we use this function to ensure that the OAuth object is available and has been authorized.
   * We also set the authToken property.
   *
   * @returns {OAuth} The OAuth object.
   */
  async getOAuth() {
    this.authToken = this.getAuthToken();

    return this;
  }

  /**
   * Function to get the authToken from chrome.identity.
   *
   * @returns {string} The OAuth token.
   */
  getAuthToken() {
    return new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, function (token) {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
          reject(chrome.runtime.lastError.message);
        } else {
          resolve(token);
        }
      });
    });
  }

  /**
   * Get the list of Google Sheets, ordered by descending modified time.
   *
   * @returns {array} The list of Google Sheets as an array of objects with name and id properties.
   */
  getSheets() {
    const url =
      'https://www.googleapis.com/drive/v3/files?q=mimeType="application/vnd.google-apps.spreadsheet"&orderBy=modifiedTime desc';

    return axios
      .get(url, {
        headers: {
          Authorization: 'Bearer ' + this.authToken,
        },
      })
      .then((response) => {
        const files = response.data.files.map((file) => ({
          name: file.name,
          id: file.id,
        }));

        return files;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  }

  /**
   * Gets the sheet names from a Google Sheet. The sheet names are the labelled tabs at the bottom of a Google Sheet.
   *
   * @param {string} spreadsheetId The id of the Google Sheet.
   * @returns {array} The list of sheet names as an array of strings.
   */
  async getSheetNames(spreadsheetId) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;

    return axios
      .get(url, {
        headers: {
          Authorization: 'Bearer ' + this.authToken,
        },
      })
      .then((response) => {
        const tabs = response.data.sheets.map(
          (sheet) => sheet.properties.title
        );

        return tabs;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  }

  /**
   * Get a value from a particular cell in a Google Sheet.
   *
   * @param {string} cell The cell to get the value from. e.g. A1
   * @returns {object} The value of the cell.
   */
  async getCellValue(cell) {
    let { sheetId, sheetName } = await chrome.storage.local.get([
      'sheetId',
      'sheetName',
    ]);

    sheetName += '!' + cell;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}`;

    return axios
      .get(url, { headers: { Authorization: 'Bearer ' + this.authToken } })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  }

  /**
   * Append a row of values to a Google Sheet. The order of the rows is specified in the resource object, with the values array.
   * There may be a better way to map this data to the Google Sheet.
   *
   * @param {object} data The data to append to the Google Sheet.
   * @returns {object} The response from the Google Sheets API.
   */
  async appendValues(data) {
    let { sheetId, sheetName } = await chrome.storage.local.get([
      'sheetId',
      'sheetName',
    ]);
    const valueInputOption = 'USER_ENTERED';

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}:append?valueInputOption=${valueInputOption}`;

    const resource = {
      range: sheetName,
      majorDimension: 'ROWS',
      values: [
        [
          data.jobTitle,
          data.company,
          data.source,
          data.applicationDateTime,
          data.url,
        ],
      ],
    };

    return axios
      .post(url, resource, {
        headers: {
          Authorization: 'Bearer ' + this.authToken,
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  }
}
