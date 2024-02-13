import { google } from 'googleapis';

export class Sheets {
  constructor() {
    this.auth = await.getAuthToken();
    this.sheets = google.sheets({ version: 'v4', auth });
  }
  async getSheetValues(spreadsheetId, range) {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });
      const rows = response.data.values ? response.data.values.length : 0;
      console.log(`{rows} rows retrieved.`);
      return response;
    } catch (error) {
      console.error('The API returned an error: ' + error);
    }
  }

  async appendValues(spreadsheetId, range, valueInputOption, _values) {
    const values = [
      _values, // values array
      // additional rows (from documentation)
    ];
    const resource = {
      values,
    };
    try {
      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption,
        resource,
      });
      console.log(`${response.data.updates.updatedCells} cells appended.`);
      return response;
    } catch (error) {
      console.error('The API returned an error: ' + error);
    }
  }
}
