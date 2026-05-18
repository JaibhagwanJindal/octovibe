export default async function handler(req, res) {
  // Set up robust CORS headers to allow your GitHub Pages static domain to communicate with the Vercel API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Missing temporary handshake authorization code' });
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

    // Return the authenticated, multi-tenant user access token back to the client browser
    return res.status(200).json(tokenData);
  } catch (err) {
    return res.status(500).json({ error: 'Internal OAuth exchange loop failure' });
  }
}
