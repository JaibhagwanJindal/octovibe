export default async function handler(req, res) {
  // Enforce complete, production-grade SaaS CORS parameters allowing explicit POST exchanges
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Missing temporary authorization code parameter' });
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
    });

    const tokenData = await response.json();
    if (tokenData.error) {
      return res.status(400).json({ error: tokenData.error_description });
    }

    return res.status(200).json(tokenData);
  } catch (err) {
    return res.status(500).json({ error: 'Server-side token exchange loop failed securely' });
  }
}
