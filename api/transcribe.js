export const config = {
  api: {
    bodyParser: { sizeLimit: '10mb' },
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { audio, mimeType, language } = req.body;
    if (!audio) return res.status(400).json({ error: 'No audio provided' });

    const buffer = Buffer.from(audio, 'base64');
    const blob = new Blob([buffer], { type: mimeType || 'audio/webm' });

    const form = new FormData();
    form.append('file', blob, 'audio.webm');
    form.append('model', 'whisper-large-v3-turbo');
    form.append('response_format', 'json');
    if (language) form.append('language', language);

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: form,
    });

    const data = await response.json();
    if (data.error) return res.status(400).json({ error: data.error.message || 'Transcription error' });
    return res.status(200).json({ text: data.text || '' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
