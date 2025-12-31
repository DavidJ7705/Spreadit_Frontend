// API route: /api/get-posts

async function handler(req, res) {
  try {
    const response = await fetch('http://post-service:8000/api/get-all-posts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const posts = await response.json();
    res.json({ posts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
}

export default handler;
