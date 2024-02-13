export default class OAuth {
  constructor(settingsForm) {
    this.settingsForm = settingsForm;

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

    const files = [];
    return new Promise((resolve, reject) => {
      fetch(url, {
        headers: {
          Authorization: 'Bearer ' + this.authToken,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          data.files.forEach((file) => {
            files.push({
              name: file.name,
              id: file.id,
            });
          });

          resolve(files);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  }

  async getSheetNames(spreadsheetId) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;

    return new Promise((resolve, reject) => {
      fetch(url, {
        headers: {
          Authorization: 'Bearer ' + this.authToken,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          const tabs = data.sheets.map((sheet) => sheet.properties.title);
          resolve(tabs);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  }

  async getSheetValues(cell) {
    let { sheetId, sheetName } = await chrome.storage.local.get([
      'sheetId',
      'sheetName',
    ]);

    sheetName += '!' + cell;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}`;

    return new Promise((resolve, reject) => {
      fetch(url, {
        headers: {
          Authorization: 'Bearer ' + this.authToken,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
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
    console.log(resource);
    console.log(this.authToken);

    return new Promise((resolve, reject) => {
      fetch(url, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + this.authToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resource),
      })
        .then((response) => resolve(response))
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  }
}
