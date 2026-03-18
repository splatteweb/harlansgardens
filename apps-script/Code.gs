// Harlan's Gardens — Booking Widget Backend
//
// SETUP:
//   1. In Google Sheets, open Extensions > Apps Script and paste this file.
//   2. Click Deploy > New Deployment > Web App.
//   3. Execute as: Me | Who has access: Anyone
//   4. Copy the /exec URL into booking.js as APPS_SCRIPT_URL.
//
// SHEET: The script writes to a tab named "Bookings" in the container spreadsheet.

const SHEET_NAME = 'Bookings';

const HEADERS = [
  'Timestamp',
  'Type',
  'Name',
  'Phone',
  'Address',
  'Preferred Datetime',
  'Source',
  'Calendar Event ID',   // reserved — populated once Google Calendar is integrated
];

function doPost(e) {
  try {
    var data   = JSON.parse(e.postData.contents);
    var sheet  = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    }

    sheet.appendRow([
      new Date().toISOString(),
      data.type             || '',
      data.name             || '',
      data.phone            || '',
      data.address          || '',
      data.datetime         || '',
      data.source           || '',
      data.calendarEventId  || '',
    ]);

    // ── FUTURE: Google Calendar integration ─────────────────────────────────
    // Uncomment the block below once you're ready to accept bookings on a
    // specific calendar. Requires enabling the Calendar API in Apps Script
    // (Services > Google Calendar API).
    //
    // if (data.datetime) {
    //   var cal   = CalendarApp.getCalendarById('YOUR_CALENDAR_ID');
    //   var start = new Date(data.datetime);
    //   var end   = new Date(start.getTime() + 60 * 60 * 1000); // 1-hour slot
    //   var event = cal.createEvent(
    //     'Consultation — ' + data.name,
    //     start,
    //     end,
    //     {
    //       description: 'Type: '    + data.type    + '\n' +
    //                    'Phone: '   + data.phone   + '\n' +
    //                    'Address: ' + data.address,
    //     }
    //   );
    //   sheet.getRange(sheet.getLastRow(), 8).setValue(event.getId());
    // }
    // ────────────────────────────────────────────────────────────────────────

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Allows confirming the endpoint is live by visiting the /exec URL in a browser.
function doGet() {
  return ContentService
    .createTextOutput("Harlan's Gardens booking endpoint is live.")
    .setMimeType(ContentService.MimeType.TEXT);
}
