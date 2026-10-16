/**
 * ============================================================================
 * ASGARD'CO 26 (RABAT'CO 26.2) — GOOGLE DRIVE AUTOMATIC UPLOAD SCRIPT
 * ============================================================================
 * 
 * Target Google Drive Folder:
 * https://drive.google.com/drive/folders/1I_K2CNDEx9i9tX3e14P85PJcXHfk0EIX
 * Folder ID: 1I_K2CNDEx9i9tX3e14P85PJcXHfk0EIX
 * 
 * HOW TO DEPLOY AS A WEB APP (Takes ~1 minute):
 * 1. Open Google Drive (https://drive.google.com).
 * 2. Click "+ New" > "More" > "Google Apps Script" (or visit https://script.google.com).
 * 3. Title the project: "Asgard'CO 26 Photo Uploader".
 * 4. Paste THIS ENTIRE FILE into the code editor.
 * 5. Click Save (Ctrl+S).
 * 6. In top right corner, click "Deploy" > "New deployment".
 * 7. Click gear icon next to "Select type" and choose "Web app".
 * 8. Settings:
 *    - Description: "Asgard'CO 26 Photo Upload Service"
 *    - Execute as: "Me (your email)"
 *    - Who has access: "Anyone" (CRITICAL: Must be "Anyone" so delegates can upload)
 * 9. Click "Deploy". Authorize permissions when prompted.
 * 10. Copy the generated "Web app URL" (ends in /exec).
 * ============================================================================
 */

var TARGET_FOLDER_ID = "1I_K2CNDEx9i9tX3e14P85PJcXHfk0EIX";

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(30000);

  try {
    var data = null;
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

    var folder = DriveApp.getFolderById(TARGET_FOLDER_ID);
    if (!folder) {
      return createJsonResponse({ status: 'error', message: 'Target Google Drive folder not found' });
    }

    var imageData = data.imageData || data.base64 || '';
    if (!imageData) {
      return createJsonResponse({ status: 'error', message: 'No image data provided' });
    }

    // Extract mime type and base64 string
    var mimeType = 'image/jpeg';
    var base64Content = imageData;
    if (imageData.indexOf('data:') === 0 && imageData.indexOf(';base64,') > -1) {
      var parts = imageData.split(';base64,');
      mimeType = parts[0].replace('data:', '');
      base64Content = parts[1];
    }

    var decoded = Utilities.base64Decode(base64Content);
    var uploader = (data.uploaderName || 'delegate').replace(/[^a-zA-Z0-9_-]/g, '_');
    var timestamp = Utilities.formatDate(new Date(), 'GMT', 'yyyyMMdd_HHmmss');
    var extension = mimeType.indexOf('png') > -1 ? '.png' : '.jpg';
    var fileName = 'asgard_' + uploader + '_' + timestamp + extension;

    var blob = Utilities.newBlob(decoded, mimeType, fileName);
    var file = folder.createFile(blob);

    if (data.caption) {
      file.setDescription('Caption: ' + data.caption + ' | Uploaded by: ' + (data.uploaderName || 'Delegate'));
    }

    return createJsonResponse({
      status: 'success',
      message: 'Photo uploaded directly into Google Drive folder!',
      fileId: file.getId(),
      fileName: fileName,
      fileUrl: file.getUrl()
    });

  } catch (err) {
    return createJsonResponse({ status: 'error', error: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return createJsonResponse({
    status: 'online',
    message: 'Asgard CO 26 Photo Uploader is ready.',
    folderId: TARGET_FOLDER_ID
  });
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
