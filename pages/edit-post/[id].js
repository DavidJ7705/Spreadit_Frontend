import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import classes from "../../components/posts/PostDetail.module.css"; // reuse same styling card
import { IoArrowBack } from "react-icons/io5";

export default function EditPost() {
  const router = useRouter();
  const { id } = router.query;

  const [post, setPost] = useState(null);

  // Load post
  useEffect(() => {
    if (!id) return;

    fetch("http://localhost:8000/getPost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    })
      .then(res => res.json())
      .then(data => setPost(data.post));
  }, [id]);

  async function updateHandler(e) {
    e.preventDefault();

    await fetch(`http://localhost:8000/updatePost/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(post),
      credentials: "include"
    });

    router.replace(`/${id}`);

  }

  if (!post) {
    return (
      <>
        <div style={{ paddingTop: "120px", textAlign: "center", color: "var(--text)" }}>
          Loading...
        </div>
      </>
    );
  }


  return (
    <div className={classes.wrapper}>
      <section className={classes.card}>
        {/* Back button */}
        <div
          className={classes.backBtn}
          onClick={() => router.push("/profile")}
        >
          <IoArrowBack size={28} />
        </div>

        <h1 className={classes.title}>Edit Post</h1>

        <form onSubmit={updateHandler} className={classes.editForm}>

          {/* Title */}
          <input
            className={classes.editInput}
            type="text"
            value={post.title}
            onChange={(e) => setPost({ ...post, title: e.target.value })}
            placeholder="Title"
          />

          {/* Image URL */}
          <input
            className={classes.editInput}
            type="text"
            value={post.image}
            onChange={(e) => setPost({ ...post, image: e.target.value })}
            placeholder="Image URL"
          />


          {/* Description */}
          <textarea
            className={classes.editTextarea}
            value={post.description}
            onChange={(e) => setPost({ ...post, description: e.target.value })}
            placeholder="Description"
          />

          <button className={classes.editBtn} type="submit">
            Save Changes
          </button>
        </form>
      </section>
    </div>
  );
}
