// pages/api/get-post.js

export default async function handler(req, res) {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Post ID is required" });
    }

    const response = await fetch(`http://localhost:8004/api/post-by-id/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json(error);
    }

    const post = await response.json();
    res.json({ post });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
}
