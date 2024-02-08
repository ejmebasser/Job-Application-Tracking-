/**
 * This is the Apps Scripts script that will be used to interact with the Google Sheet.
 * This will need to be deployed to the user, and be specific to a user's Google account.
 */

const wbookID = '1o7XBilaVR3bLHaqAADiJMgHs1dscsH_ezZuXHiAqdfU';
const sheetName = 'Sheet1';

const wbook = SpreadsheetApp.openById(wbookID);
const sheet = wbook.getSheetByName(sheetName);

function doPost(e) {
  const action = e.parameter.action;

  if (action == 'addRow') {
    return addRow(e);
  }
}

function addRow(e) {
  const rowData = JSON.parse(e.postData.contents);

  sheet.appendRow([
    rowData.jobTitle,
    rowData.company,
    rowData.source,
    rowData.applicationDateTime,
    rowData.url,
  ]);

  return ContentService.createTextOutput('Success').setMimeType(
    'ContentService.MimeType.TEXT'
  );
}

function doGet(e) {
  const action = e.parameter.action;

  if (action == 'getTotalJobs') {
    return getTotalJobs('H1');
  }
  if (action == 'getDailyTotal') {
    return getDailyTotal('J1');
  }
}

function getCellValue(cell) {
  try {
    const rows = sheet.getRange(cell).getValues();

    const result = JSON.stringify(rows);

    return ContentService.createTextOutput(result).setMimeType(
      ContentService.MimeType.JSON
    );
  } catch (error) {
    console.error('Error in getUsers:', error);
    return ContentService.createTextOutput(
      'Error: ' + error.message
    ).setMimeType(ContentService.MimeType.TEXT);
  }
}
