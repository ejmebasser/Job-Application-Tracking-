import OAuth from './oauth';

export default class Sheets extends OAuth {
  constructor() {
    super();

    this.getCellValue = this.getCellValue.bind(this);
  }

  /**
   * Get the list of Google Sheets, ordered by descending modified time.
   *
   * @return {array} The list of Google Sheets as an array of objects with name and id properties.
   */
  getSheets() {
    const url =
      'https://www.googleapis.com/drive/v3/files?q=mimeType="application/vnd.google-apps.spreadsheet"&orderBy=modifiedTime desc';
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

  /**
   * Gets the sheet names from a Google Sheet. The sheet names are the labelled tabs at the bottom of a Google Sheet.
   *
   * @param {string} spreadsheetId The id of the Google Sheet.
   * @return {array} The list of sheet names as an array of strings.
   */
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

  /**
   * Get a value from a particular cell in a Google Sheet.
   *
   * @param {string} cell The cell to get the value from. e.g. A1
   * @return {object} The value of the cell.
   */
  async getCellValue(cell) {
    let { sheetId, sheetName } = await chrome.storage.sync.get([
      'sheetId',
      'sheetName',
    ]);
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

  /**
   * Append a row of values to a Google Sheet. The order of the rows is specified in the resource object, with the values array.
   * There may be a better way to map this data to the Google Sheet.
   *
   * @param {object} data The data to append to the Google Sheet.
   * @return {object} The response from the Google Sheets API.
   */
  async appendValues(data) {
    const { sheetId, sheetName } = await chrome.storage.sync.get([
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
          data.email,
          data.applicationType,
        ],
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

  /**
   * Get the jobs data from the Google Sheet. This is for job analytics.
   *
   * @return {Object} The object containing the jobs data.
   */
  async getJobsData() {
    console.log(this);
    //const result = await oauth.getCellValue('B1'); // No need for Promise.all if you're only fetching one value
    const results = await Promise.all([
      this.getCellValue('B1'), // Total jobs applied today
      this.getCellValue('B2'), // Total jobs applied in total
      this.getCellValue('D1'), // Total advanced applications today
      this.getCellValue('D2'), // Total advanced applications in total
      this.getCellValue('F1'), // Total quick apply today
      this.getCellValue('F2'), // Total quick apply in total
      this.getCellValue('H1'), // Job search duration
    ]);

    // Map results to extract values, assuming each result is an object with a structure {values: [[value]]}
    const data = results.map((result) => result.values[0][0]);

    // Constructing an object with all the fetched data
    const dataForAPI = {
      totalJobsToday: data[0],
      totalJobsTotal: data[1],
      advancedApplicationsToday: data[2],
      advancedApplicationsTotal: data[3],
      quickApplyToday: data[4],
      quickApplyTotal: data[5],
      jobSearchDuration: data[6],
    };

    // Why is this an object containing an object?
    return {
      dataForAPI,
    };
  }

  async fetchJobsDataAndPrepareForAPI() {
    try {
      const currentTime = new Date();
      const formattedTime = currentTime.toISOString(); // Use ISO format for API data

      const jobsData = await this.getJobsData();
      const dataForAPI = {
        timestamp: formattedTime,
        ...jobsData.dataForAPI,
      };

      alert('Line 115 ' + JSON.stringify(dataForAPI, null, 2));
      return dataForAPI;
    } catch (error) {
      console.error('Error fetching job application data:', error);
      return {
        error: 'Failed to fetch job application data. See console for details.',
      };
    }
  }
}
