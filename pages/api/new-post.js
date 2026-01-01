// API route: /api/new-post

async function handler(req, res) {
  try {
    // Get user_id from request body (sent by frontend)
    const { user_id, ...postData } = req.body;

    // Validate inputs
    // Validate inputs
    const moduleIdInt = parseInt(postData.module_id);

    if (!user_id) {
      return res.status(422).json({ error: "Invalid User ID. Please log in again." });
    }

    if (!postData.module_id || isNaN(moduleIdInt)) {
      return res.status(422).json({ error: "Invalid Module ID. Please select a module." });
    }

    if (!postData.post_title || postData.post_title.trim().length < 2) {
      return res.status(422).json({ error: "Post title must be at least 2 characters." });
    }

    if (!postData.content) {
      return res.status(422).json({ error: "Post content is required." });
    }

    const payload = {
      post_title: postData.post_title,
      content: postData.content,
      module_id: moduleIdInt,
      user_id: user_id
    };

    console.log("Validated payload:", payload);



    // Forward post data to Post microservice
    const response = await fetch("http://post-service:8000/api/add-post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Backend error:", error);
      return res.status(response.status).json(error);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Failed to create post:', error);
    res.status(500).json({ error: `Failed to create post: ${error.message}` });
  }
}

export default handler;
