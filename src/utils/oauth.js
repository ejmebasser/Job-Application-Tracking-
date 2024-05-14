// // /**
// //  * OAuth class to handle Google OAuth2.0
// //  */
// // export default class OAuth {
// //   /**
// //    * Constructor for OAuth class
// //    */
// //   constructor() {
// //     this.getOAuth();

// //     this.searchFile = this.getSheets.bind(this);
// //   }

// //   /**
// //    * We cannot use async/await in the constructor, so we use this function to ensure that the OAuth object is available and has been authorized.
// //    * We also set the authToken property.
// //    *
// //    * I really don't like this. It seems like a poor singleton attempt.
// //    * There is probably a better way to handle this.
// //    *
// //    * @return {OAuth} The OAuth object.
// //    */
// //   async getOAuth() {
// //     this.authToken = await this.getAuthToken();

// //     return this;
// //   }

// //   /**
// //    * Function to get the authToken from chrome.identity.
// //    *
// //    * @return {string} The OAuth token.
// //    */
// //   getAuthToken() {
// //     return new Promise((resolve, reject) => {
// //       chrome.identity.getAuthToken({ interactive: true }, function (token) {
// //         if (chrome.runtime.lastError) {
// //           console.error(chrome.runtime.lastError.message);
// //           reject(chrome.runtime.lastError.message);
// //         } else {
// //           resolve(token);
// //         }
// //       });
// //     });
// //   }

// //   /**
// //    * Get the list of Google Sheets, ordered by descending modified time.
// //    *
// //    * @return {array} The list of Google Sheets as an array of objects with name and id properties.
// //    */
// //   getSheets() {
// //     const url =
// //       'https://www.googleapis.com/drive/v3/files?q=mimeType="application/vnd.google-apps.spreadsheet"&orderBy=modifiedTime desc';

// //     return fetch(url, {
// //       headers: {
// //         Authorization: 'Bearer ' + this.authToken,
// //       },
// //     })
// //       .then((response) => {
// //         return response.json();
// //       })
// //       .then((data) => {
// //         const files = data.files.map((file) => ({
// //           name: file.name,
// //           id: file.id,
// //         }));

// //         return files;
// //       })
// //       .catch((error) => {
// //         console.error(error);
// //       });
// //   }

// //   /**
// //    * Gets the sheet names from a Google Sheet. The sheet names are the labelled tabs at the bottom of a Google Sheet.
// //    *
// //    * @param {string} spreadsheetId The id of the Google Sheet.
// //    * @return {array} The list of sheet names as an array of strings.
// //    */
// //   async getSheetNames(spreadsheetId) {
// //     const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;

// //     return fetch(url, {
// //       headers: {
// //         Authorization: 'Bearer ' + this.authToken,
// //       },
// //     })
// //       .then((response) => {
// //         return response.json();
// //       })
// //       .then((data) => {
// //         const tabs = data.sheets.map((sheet) => sheet.properties.title);

// //         return tabs;
// //       })
// //       .catch((error) => {
// //         console.error(error);
// //       });
// //   }

// //   /**
// //    * Get a value from a particular cell in a Google Sheet.
// //    *
// //    * @param {string} cell The cell to get the value from. e.g. A1
// //    * @return {object} The value of the cell.
// //    */
// //   async getCellValue(cell) {
// //     let { sheetId, sheetName } = await chrome.storage.sync.get([
// //       'sheetId',
// //       'sheetName',
// //     ]);

// //     sheetName += '!' + cell;
// //     const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}`;

// //     return fetch(url, {
// //       headers: { Authorization: 'Bearer ' + this.authToken },
// //     })
// //       .then((response) => {
// //         return response.json();
// //       })
// //       .catch((error) => {
// //         console.error(error);
// //       });
// //   }

// //   /**
// //    * Append a row of values to a Google Sheet. The order of the rows is specified in the resource object, with the values array.
// //    * There may be a better way to map this data to the Google Sheet.
// //    *
// //    * @param {object} data The data to append to the Google Sheet.
// //    * @return {object} The response from the Google Sheets API.
// //    */
// //   async appendValues(data) {
// //     const { sheetId, sheetName } = await chrome.storage.sync.get([
// //       'sheetId',
// //       'sheetName',
// //     ]);
// //     const valueInputOption = 'USER_ENTERED';

// //     const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}:append?valueInputOption=${valueInputOption}`;

// //     const resource = {
// //       range: sheetName,
// //       majorDimension: 'ROWS',
// //       values: [
// //         [
// //           data.jobTitle,
// //           data.company,
// //           data.source,
// //           data.applicationDateTime,
// //           data.url,
// //         ],
// //       ],
// //     };

// //     // I tried using axios here, but I couldn't get axios to use HTTP, and the service worker
// //     // script (background.js) cannot use xhr, so I have stuck with fetch.
// //     return fetch(url, {
// //       method: 'POST',
// //       headers: {
// //         Authorization: 'Bearer ' + this.authToken,
// //         'Content-Type': 'application/json',
// //       },
// //       body: JSON.stringify(resource),
// //     })
// //       .then((response) => {
// //         return response;
// //       })
// //       .catch((error) => {
// //         console.error(error);
// //       });
// //   }


// //   async getUserInfo() {
// //     const userInfoUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';
// //     try {
// //       const response = await fetch(userInfoUrl, {
// //         headers: {
// //           Authorization: 'Bearer ' + this.authToken,
// //         },
// //       });
// //       const userInfo = await response.json();
// //       return userInfo; // This object includes the user's email
// //     } catch (error) {
// //       console.error('Error fetching user info:', error);
// //       throw error;
// //     }
// //   }
// // }


// export default class OAuth {
//   constructor() {
//     this.getOAuth();
//     this.searchFile = this.getSheets.bind(this);
//   }

//   async getOAuth() {
//     this.authToken = await this.getAuthToken();
//     return this;
//   }

//   getAuthToken() {
//     return new Promise((resolve, reject) => {
//       chrome.identity.getAuthToken({ interactive: true }, function(token) {
//         if (chrome.runtime.lastError) {
//           console.error(chrome.runtime.lastError.message);
//           reject(chrome.runtime.lastError.message);
//         } else {
//           resolve(token);
//         }
//       });
//     });
//   }

//   getSheets() {
//     const url = 'https://www.googleapis.com/drive/v3/files?q=mimeType="application/vnd.google-apps.spreadsheet"&orderBy=modifiedTime desc';
//     return fetch(url, {
//       headers: {
//         Authorization: 'Bearer ' + this.authToken,
//       },
//     })
//       .then((response) => response.json())
//       .then((data) => {
//         const files = data.files.map((file) => ({
//           name: file.name,
//           id: file.id,
//         }));
//         return files;
//       })
//       .catch((error) => {
//         console.error(error);
//       });
//   }

//   async getSheetNames(spreadsheetId) {
//     const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;
//     return fetch(url, {
//       headers: {
//         Authorization: 'Bearer ' + this.authToken,
//       },
//     })
//       .then((response) => response.json())
//       .then((data) => {
//         const tabs = data.sheets.map((sheet) => sheet.properties.title);
//         return tabs;
//       })
//       .catch((error) => {
//         console.error(error);
//       });
//   }

//   async getCellValue(cell) {
//     let { sheetId, sheetName } = await chrome.storage.sync.get(['sheetId', 'sheetName']);
//     sheetName += '!' + cell;
//     const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}`;
//     return fetch(url, {
//       headers: { Authorization: 'Bearer ' + this.authToken },
//     })
//       .then((response) => response.json())
//       .catch((error) => {
//         console.error(error);
//       });
//   }

//   async appendValues(data) {
//     const { sheetId, sheetName } = await chrome.storage.sync.get(['sheetId', 'sheetName']);
//     const valueInputOption = 'USER_ENTERED';
//     const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}:append?valueInputOption=${valueInputOption}`;
//     const resource = {
//       range: sheetName,
//       majorDimension: 'ROWS',
//       values: [
//         [data.jobTitle, data.company, data.source, data.applicationDateTime, data.url],
//       ],
//     };
//     return fetch(url, {
//       method: 'POST',
//       headers: {
//         Authorization: 'Bearer ' + this.authToken,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(resource),
//     })
//       .then((response) => response)
//       .catch((error) => {
//         console.error(error);
//       });
//   }

//   async getUsername() {
//     const userInfoUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';
//     try {
//       const response = await fetch(userInfoUrl, {
//         headers: {
//           'Authorization': 'Bearer ' + this.authToken,
//         },
//       });
//       if (!response.ok) throw new Error('Failed to fetch user info');
//       const data = await response.json();
//       return data.email;
//     } catch (error) {
//       console.error('Error fetching user info:', error);
//       throw error;
//     }
//   }
// }


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
      chrome.identity.getAuthToken({ interactive: true }, function(token) {
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
    const url = 'https://www.googleapis.com/drive/v3/files?q=mimeType="application/vnd.google-apps.spreadsheet"&orderBy=modifiedTime desc';
    return fetch(url, {
      headers: {
        Authorization: 'Bearer ' + this.authToken,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const files = data.files.map((file) => ({
          name: file.name,
          id: file.id,
        }));
        return files;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  async getSheetNames(spreadsheetId) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;
    return fetch(url, {
      headers: {
        Authorization: 'Bearer ' + this.authToken,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const tabs = data.sheets.map((sheet) => sheet.properties.title);
        return tabs;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  async getCellValue(cell) {
    let { sheetId, sheetName } = await chrome.storage.sync.get(['sheetId', 'sheetName']);
    sheetName += '!' + cell;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}`;
    return fetch(url, {
      headers: { Authorization: 'Bearer ' + this.authToken },
    })
      .then((response) => response.json())
      .catch((error) => {
        console.error(error);
      });
  }

  async appendValues(data) {
    const { sheetId, sheetName } = await chrome.storage.sync.get(['sheetId', 'sheetName']);
    const valueInputOption = 'USER_ENTERED';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}:append?valueInputOption=${valueInputOption}`;
    const resource = {
      range: sheetName,
      majorDimension: 'ROWS',
      values: [
        [data.jobTitle, data.company, data.source, data.applicationDateTime, data.url, data.email,data.applicationType],
      ],
    };
    return fetch(url, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + this.authToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resource),
    })
      .then((response) => response)
      .catch((error) => {
        console.error(error);
      });
  }

  // New method to fetch user's email as a username
  async getUsername() {
    const userInfoUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';
    try {
      const response = await fetch(userInfoUrl, {
        headers: {
          Authorization: 'Bearer ' + this.authToken,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }
      const userInfo = await response.json();
      return userInfo.email; // This assumes you want to use the email as the username
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }
}
