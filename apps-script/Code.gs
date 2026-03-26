var SHEET_NAME = 'Bookings';

var HEADERS = [
  'Timestamp',
  'Type',
  'Name',
  'Phone',
  'Address',
  'Preferred Datetime',
  'Source',
  'Calendar Event ID'
];

function formatDate(date) {
  var month   = date.getMonth() + 1;
  var day     = date.getDate();
  var year    = date.getFullYear();
  var hours   = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();
  var ampm    = hours >= 12 ? 'PM' : 'AM';
  hours       = hours % 12 || 12;
  minutes     = minutes < 10 ? '0' + minutes : minutes;
  seconds     = seconds < 10 ? '0' + seconds : seconds;
  return month + '-' + day + '-' + year + ', ' + hours + ':' + minutes + ':' + seconds + ' ' + ampm;
}

function doGet(e) {
  if (!e || !e.parameter || !e.parameter.name) {
    return ContentService
      .createTextOutput('Harlans Gardens booking endpoint is live.')
      .setMimeType(ContentService.MimeType.TEXT);
  }

  try {
    var p = e.parameter;
    var sheet = SpreadsheetApp
      .openById('1JRgiCyUqLseiMlj8Tb6zWNOuNe8FXmQOvesA804NygM')
      .getSheetByName(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    }

    sheet.appendRow([
      formatDate(new Date()),
      p.type || '',
      p.name || '',
      p.phone || '',
      p.address || '',
      p.datetime ? formatDate(new Date(p.datetime)) : '',
      p.source || '',
      p.calendarEventId || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
