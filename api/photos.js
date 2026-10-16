export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({ photos: [] });
  }

  if (req.method === 'POST') {
    const { imageData, caption, uploaderName } = req.body || {};
    const newPhoto = {
      id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      imageData: imageData || '',
      caption: caption || '',
      uploaderName: uploaderName || 'Operative',
      uploadedAt: new Date().toISOString(),
      likes: 0
    };
    return res.status(200).json({ success: true, photo: newPhoto });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
