/**
 * ============================================================================
 * RABAT CO 26.2 — "AVENGERS ASSEMBLE"
 * Google Sheets Auto-Sync Webhook (Bulletproof Edition)
 * ============================================================================
 * 
 * STEP-BY-STEP SETUP INSTRUCTIONS (Takes ~1 minute):
 * 1. Open your Google Spreadsheet (or create a new one: "Rabat CO 26.2 Debriefs").
 * 2. In Google Sheets menu, click: Extensions > Apps Script.
 * 3. Delete ANY code inside the editor, select all (Ctrl+A), and paste THIS ENTIRE FILE.
 * 4. Click the Save icon (or Ctrl+S).
 * 5. In the top right corner, click the blue "Deploy" button > "New deployment".
 * 6. Click the gear icon next to "Select type" and choose "Web app".
 * 7. In the form:
 *    - Description: "Rabat CO 26.2 Webhook"
 *    - Execute as: "Me (your email)"
 *    - Who has access: "Anyone" (CRITICAL: Do NOT choose "Only myself" or "Anyone with Google account")
 * 8. Click "Deploy".
 *    - If Google asks for Authorization, click "Review permissions", pick your Google account,
 *      click "Advanced", then click "Go to Untitled project (unsafe)", and click "Allow".
 * 9. Copy the "Web app URL" (it ends with /exec).
 * 10. In the Rabat CO 26.2 Admin Dashboard (/admin), paste the URL and click "Save URL" then "Test Live Ping"!
 * ============================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(15000);

  try {
    var data = null;

    // Parse incoming payload safely
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        data = e.parameter;
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    if (!data) {
      return createJsonResponse({ status: 'error', message: 'No payload data received' });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // Map day number and codename
    var dayNumber = Number(data.dayNumber) || 1;
    var dayCodename = data.dayName || (dayNumber === 1 ? 'Civil War' : dayNumber === 2 ? 'Infinity War' : 'Endgame');
    var sheetName = 'Day ' + dayNumber + ' - ' + dayCodename;

    var sheet = ss.getSheetByName(sheetName);

    // If sheet tab doesn't exist yet, create it with Marvel theme styling
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);

      var headers = [
        'Timestamp',
        'Operative Name',
        'Device IP',
        'Overall Day Rating (1-5)',
        'Sessions Rating (1-5)',
        'Food Rating (1-5)',
        'Food & Catering Notes',
        'What Went Well',
        'What Went Bad',
        'What Can Be Improved'
      ];

      sheet.appendRow(headers);

      // Marvel theme header colors per day
      var headerBg = '#B71C1C'; // Stark Red
      if (dayNumber === 2) headerBg = '#6A1B9A'; // Infinity Purple
      if (dayNumber === 3) headerBg = '#D4AF37'; // Endgame Gold

      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setFontColor('#FFFFFF');
      headerRange.setBackground(headerBg);
      headerRange.setHorizontalAlignment('center');
      headerRange.setVerticalAlignment('middle');
      sheet.setRowHeight(1, 35);
      sheet.setFrozenRows(1);

      // Initial column widths for comfortable reading
      sheet.setColumnWidth(1, 170); // Timestamp
      sheet.setColumnWidth(2, 160); // Name
      sheet.setColumnWidth(3, 130); // IP
      sheet.setColumnWidth(4, 150); // Overall
      sheet.setColumnWidth(5, 150); // Sessions
      sheet.setColumnWidth(6, 140); // Food
      sheet.setColumnWidth(7, 240); // Food Notes
      sheet.setColumnWidth(8, 280); // Went Well
      sheet.setColumnWidth(9, 280); // Went Bad
      sheet.setColumnWidth(10, 280); // Improvements
    }

    // Format timestamp
    var timestamp = data.submittedAt || new Date().toISOString();

    // Append operative debrief row
    sheet.appendRow([
      timestamp,
      data.memberName || 'Anonymous Operative',
      data.clientIp || '',
      data.overallRating || 0,
      data.sessionRating || 0,
      data.foodRating || 0,
      data.foodComment || '',
      data.wentWell || '',
      data.wentBad || '',
      data.improvement || ''
    ]);

    var lastRow = sheet.getLastRow();
    
    // Style the new row: center numerical ratings and align text top
    var rowRange = sheet.getRange(lastRow, 1, 1, 10);
    rowRange.setVerticalAlignment('middle');
    sheet.getRange(lastRow, 4, 1, 3).setHorizontalAlignment('center').setFontWeight('bold');

    return createJsonResponse({
      status: 'success',
      row: lastRow,
      sheet: sheetName,
      recordedName: data.memberName
    });

  } catch (err) {
    return createJsonResponse({ status: 'error', error: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

// Allow GET request to verify URL is working directly in the browser
function doGet(e) {
  // If test parameter is provided via GET, process it too!
  if (e && e.parameter && e.parameter.test === '1') {
    return doPost(e);
  }

  return createJsonResponse({
    status: 'online',
    message: 'Rabat CO 26.2 Google Sheets Webhook is active and listening for debriefs.',
    spreadsheet: SpreadsheetApp.getActiveSpreadsheet().getName()
  });
}

function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
