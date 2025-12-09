export default async function handler(req, res) {
    const apiKey = process.env.GEMINI_API_KEY; 
  
    if (!apiKey) {
      return res.status(500).json({ error: 'API Key not configured on server' });
    }
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(req.body), 
        }
      );
      const data = await response.json();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Error processing request' });
    }
  }