export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    googleSheetWebhookUrl: 'https://script.google.com/macros/s/AKfycby_placeholder/exec',
    googleDriveWebhookUrl: '',
    mediaDriveUrl: 'https://drive.google.com/drive/folders/1I_K2CNDEx9i9tX3e14P85PJcXHfk0EIX?usp=drive_link',
    formsStatus: {
      day1: true,
      day2: false,
      day3: false
    }
  });
}
