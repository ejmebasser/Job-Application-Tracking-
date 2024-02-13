export default class OAuth {
  constructor(settingsForm) {
    this.settingsForm = settingsForm;

    this.initilaize();

    this.searchFile = this.searchFile.bind(this);
  }

  async initilaize() {
    this.authToken = await this.getAuthToken();

    this.files = await this.searchFile();
    this.populateSheetList(this.files);
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

  searchFile() {
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

  /**
   * Populate sheetId list from Google Drive.
   */
  async populateSheetList(files) {
    const sheetInput = this.settingsForm.querySelector('input[name="sheetId"]');
    if (!sheetInput) {
      return;
    }

    const sheetSelector = document.createElement('select');

    for (let i = 0; i < sheetInput.attributes.length; i++) {
      const attr = sheetInput.attributes[i];
      sheetSelector.setAttribute(attr.name, attr.value);
    }

    files.forEach((sheet) => {
      const option = document.createElement('option');
      option.value = sheet.id;
      option.text = sheet.name;
      sheetSelector.appendChild(option);
    });

    this.populateSheetNameList(files[0].id);

    sheetSelector.addEventListener('change', (event) => {
      this.populateSheetNameList(event.target.value);
    });
    sheetInput.parentNode.replaceChild(sheetSelector, sheetInput);
  }

  async populateSheetNameList(spreadsheetId) {
    const sheetNames = await this.getSheetNames(spreadsheetId);

    const sheetInput = this.settingsForm.querySelector(
      'input[name="sheetName"], select[name="sheetName"]'
    );
    const sheetSelector = document.createElement('select');

    for (let i = 0; i < sheetInput.attributes.length; i++) {
      const attr = sheetInput.attributes[i];
      sheetSelector.setAttribute(attr.name, attr.value);
    }

    sheetNames.forEach((sheet) => {
      const option = document.createElement('option');
      option.value = sheet;
      option.text = sheet;
      sheetSelector.appendChild(option);
    });

    sheetSelector.addEventListener('change', (event) => {
      this.settingsForm.querySelector('input[name="sheetName"]').value =
        event.target.value;
    });
    sheetInput.parentNode.replaceChild(sheetSelector, sheetInput);
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
    let { sheetId, sheetName } = chrome.storage.local.get([
      'sheetId',
      'sheetName',
    ]);

    sheetName = sheetName + '!' + cell;
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

  async appendValues(_values) {
    let { sheetId, sheetName } = await chrome.storage.local.get([
      'sheetId',
      'sheetName',
    ]);

    sheetName = sheetName + '!A1';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}:append`;

    const values = [
      _values, // values array
      // additional rows (from documentation)
    ];
    const resource = {
      values,
    };
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
}
