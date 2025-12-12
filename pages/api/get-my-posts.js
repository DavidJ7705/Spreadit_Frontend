export default async function handler(req, res) {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Get user's posts from Post microservice
    const response = await fetch(`http://localhost:8004/api/post-by-user_id/${user_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json(error);
    }

    const posts = await response.json();
    res.json({ posts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
}
