var SHEET_NAME    = 'Bookings';
var HARLAN_EMAIL  = 'harlansgardens@gmail.com';
var SPREADSHEET_ID = '1JRgiCyUqLseiMlj8Tb6zWNOuNe8FXmQOvesA804NygM';

var HEADERS = [
  'Timestamp',
  'Type',
  'Name',
  'Phone',
  'Email',
  'Address',
  'Preferred Datetime',
  'Notes',
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
      .openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    }

    var preferredDatetime = p.datetime ? formatDate(new Date(p.datetime)) : '';

    sheet.appendRow([
      formatDate(new Date()),
      p.type || '',
      p.name || '',
      p.phone || '',
      p.email || '',
      p.address || '',
      preferredDatetime,
      p.notes || '',
      p.source || '',
      p.calendarEventId || ''
    ]);

    sendHarlanNotification(p, preferredDatetime);

    if (p.email) {
      sendCustomerConfirmation(p);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function sendHarlanNotification(p, preferredDatetime) {
  var typeLabel = p.type === 'onsite' ? 'On-Site Visit' : 'Phone or Video Call';

  var body = 'New consultation request from ' + p.name + '\n\n'
    + 'Type:   ' + typeLabel + '\n'
    + 'Name:   ' + p.name + '\n'
    + 'Phone:  ' + p.phone + '\n';

  if (p.email) {
    body += 'Email:  ' + p.email + '\n';
  }
  if (p.address) {
    body += 'Address: ' + p.address + '\n';
  }
  if (preferredDatetime) {
    body += 'Preferred time: ' + preferredDatetime + '\n';
  }
  if (p.notes) {
    body += '\nNotes from customer:\n' + p.notes + '\n';
  }

  MailApp.sendEmail({
    to:      HARLAN_EMAIL,
    subject: 'New consultation request — ' + p.name,
    body:    body
  });
}

function sendCustomerConfirmation(p) {
  var body = 'Hi ' + p.name + ',\n\n'
    + 'Thanks for submitting! We\'ve received your consultation request and will be in contact within the next 24 hours.\n\n'
    + 'If you need anything else or want to give us more information about your project, feel free to reply to this email.\n\n'
    + '— Harlan\n'
    + 'harlansgardens.com';

  MailApp.sendEmail({
    to:      p.email,
    replyTo: HARLAN_EMAIL,
    subject: 'Your consultation request — Harlan\'s Gardens',
    body:    body
  });
}
