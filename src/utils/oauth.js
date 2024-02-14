import axios from 'axios';

export default class OAuth {
  constructor() {
    this.getOAuth();

    this.searchFile = this.getSheets.bind(this);
  }

  async getOAuth() {
    this.authToken = await this.getAuthToken();

    return this;
  }

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

  getSheets() {
    const url =
      'https://www.googleapis.com/drive/v3/files?q=mimeType="application/vnd.google-apps.spreadsheet"';

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

  async getSheetValues(cell) {
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

  async appendValues(jsonData) {
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
          jsonData.jobTitle,
          jsonData.company,
          jsonData.source,
          jsonData.applicationDateTime,
          jsonData.url,
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
