import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import layoutClasses from "../../styles/ModuleLayout.module.css";
// Keeping the original CSS for reused Modal styles if needed, 
// or simpler to just use the new one if I ported everything. 
// I ported Modal styles to the new file too, so let's try to use layoutClasses for everything 
// where possible, or keep `classes` for specific form elements inside modals if I missed them. 
// Let's keep `classes` for the specific "editForm" inner stylings which I didn't fully copy (formGroup etc).
import classes from "../../components/modules/modulePage.module.css";
import PostItem from "../../components/posts/PostItem";
import postListClasses from "../../components/posts/PostList.module.css";
import BackButton from '../../components/ui/BackButton';

export default function ModulePage() {
  const router = useRouter();
  const { id } = router.query; // moduleId

  const [moduleData, setModuleData] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ id_module: "", name: "" });

  useEffect(() => {
    // Check admin status
    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(adminStatus);

    if (!id) return;

    loadModule();
    loadPosts();
    loadProfile();
  }, [id]);

  async function loadModule() {
    try {
      const res = await fetch(`http://localhost:8003/api/module/${id}`);
      const data = await res.json();
      setModuleData(data);
      setEditForm({
        id_module: data.id_module || "",
        name: data.name || ""
      });

      // Load course info if course_id exists
      if (data.course_id) {
        try {
          const courseRes = await fetch(`http://localhost:8002/api/get-course-by-id/${data.course_id}`);
          if (courseRes.ok) {
            const courseInfo = await courseRes.json();
            setCourseData(courseInfo);
          }
        } catch (err) {
          console.error("Error loading course:", err);
        }
      }
    } catch (err) {
      console.error("Error loading module:", err);
    }
  }

  async function loadPosts() {
    try {
      const res = await fetch(`http://localhost:8004/api/post-by-module_id/${id}`);
      if (res.ok) {
        const postsData = await res.json();

        // Try to fetch all users to get names
        try {
          const usersResponse = await fetch('http://localhost:8001/api/all-users');
          if (usersResponse.ok) {
            const users = await usersResponse.json();

            // Create a map of user_id to username
            const userMap = {};
            users.forEach(user => {
              userMap[user.id] = user.name || user.username || user.email;
            });

            // Enhance posts with usernames
            const enhancedPosts = postsData.map(post => ({
              ...post,
              username: userMap[post.user_id] || `User ${post.user_id}`
            }));

            setPosts(enhancedPosts);
          } else {
            // If user fetch fails, just show posts without usernames
            setPosts(postsData.map(post => ({
              ...post,
              username: `User ${post.user_id}`
            })));
          }
        } catch (userError) {
          console.error('Failed to fetch users:', userError);
          // Show posts anyway without usernames
          setPosts(postsData.map(post => ({
            ...post,
            username: `User ${post.user_id}`
          })));
        }
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.error("Error loading posts:", err);
      setPosts([]);
    }
  }

  function loadProfile() {
    // Get user info from localStorage
    const storedUserId = localStorage.getItem('userId');
    setUserId(storedUserId);
    // Backend doesn't have roles yet
    setUserRole(null);
  }

  async function handleDeleteModule() {
    try {
      const res = await fetch(`http://localhost:8003/api/module/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        router.push("/modules");
      }
    } catch (err) {
      console.error("Error deleting module:", err);
    }
  }

  async function handleEditModule(e) {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:8003/api/module/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });

      if (res.ok) {
        setShowEditModal(false);
        loadModule();
      }
    } catch (err) {
      console.error("Error updating module:", err);
    }
  }

  if (!moduleData) return (
    <div className={layoutClasses.loading}>
      Loading module details...
    </div>
  );

  return (
    <>
      <div className={layoutClasses.wrapper}>
        <div className={layoutClasses.mainGrid}>
          {/* Quick Links Sidebar */}
          <div className={layoutClasses.quickLinks}>
            <h3 className={layoutClasses.sidebarTitle}>Quick Links</h3>
            <nav>
              <a className={layoutClasses.navLink} onClick={() => router.push('/your-courses')}>📚 Your Courses</a>
              <a className={layoutClasses.navLink} onClick={() => router.push('/your-modules')}>📖 Your Modules</a>
              <a className={layoutClasses.navLink} onClick={() => router.push('/profile')}>👤 Profile</a>
              <a className={layoutClasses.navLink} onClick={() => router.push('/new-post')}>✍️ New Post</a>
              <a className={layoutClasses.navLink} onClick={() => router.push('/settings')}>⚙️ Settings</a>
            </nav>

          </div>

          {/* Main Content: Module Header + Posts */}
          <div className={layoutClasses.centerContent}>
            <div style={{ marginTop: "20px" }}>
              <BackButton />
            </div>
            {/* Module Info Card which is now FLUID width */}
            <div className={layoutClasses.moduleHeaderCard}>

              {/* Course breadcrumb */}
              {courseData && (
                <p className={layoutClasses.courseBreadcrumb}>
                  <span onClick={() => router.push(`/courses/${courseData.course_id}`)} style={{ cursor: "pointer", color: "var(--accent)" }}>
                    {courseData.course_id} - {courseData.course_name}
                  </span>
                  {" › "}Module
                </p>
              )}

              <h1 className={layoutClasses.pageTitle}>{moduleData.id_module} — {moduleData.name}</h1>
              {/* Backend doesn't have description field */}

              {/* Admin controls */}
              {isAdmin && (
                <div className={layoutClasses.adminControls}>
                  <button className={layoutClasses.editBtn} onClick={() => setShowEditModal(true)}>
                    Edit Module
                  </button>
                  <button className={layoutClasses.deleteBtn} onClick={() => setShowDeleteModal(true)}>
                    Delete Module
                  </button>
                </div>
              )}
            </div>

            {/* Posts Section */}
            <div>
              <div className={layoutClasses.headerRow}>
                <h2 style={{ margin: 0, color: "var(--text)" }}>Posts in this Module</h2>
                <button
                  className={layoutClasses.createBtn}
                  onClick={() => router.push(`/new-post?moduleId=${id}`)}
                >
                  + New Post
                </button>
              </div>

              {posts.length === 0 && (
                <p style={{ color: "var(--text-soft)", marginTop: "20px" }}>No posts yet in this module.</p>
              )}

              <div className={postListClasses.grid}>
                {posts.map((p) => (
                  <PostItem
                    key={p.id}
                    id={p.id}
                    image={null}  // Backend doesn't support images yet
                    title={p.post_title}  // Backend uses post_title
                    description={p.content}  // Backend uses content
                    username={p.username}
                    profilePicture={null}
                    likes={p.likes || []}
                    comments={p.comments || []}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Trending Sidebar */}
          <div className={layoutClasses.trending}>
            <h3 className={layoutClasses.sidebarTitle}>Trending</h3>
            <div className={layoutClasses.trendingItem}>
              <span className={layoutClasses.trendingTag}>#WebDevelopment</span>
              <span className={layoutClasses.trendingCount}>248 posts</span>
            </div>
            <div className={layoutClasses.trendingItem}>
              <span className={layoutClasses.trendingTag}>#JavaScript</span>
              <span className={layoutClasses.trendingCount}>186 posts</span>
            </div>
            <div className={layoutClasses.trendingItem}>
              <span className={layoutClasses.trendingTag}>#React</span>
              <span className={layoutClasses.trendingCount}>142 posts</span>
            </div>
            <div className={layoutClasses.trendingItem}>
              <span className={layoutClasses.trendingTag}>#NextJS</span>
              <span className={layoutClasses.trendingCount}>98 posts</span>
            </div>
            <div className={layoutClasses.trendingItem}>
              <span className={layoutClasses.trendingTag}>#CSS</span>
              <span className={layoutClasses.trendingCount}>76 posts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal (using existing classes for safe inner styling) */}
      {showDeleteModal && (
        <div className={classes.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div className={classes.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Delete Module</h2>
            <p>Are you sure you want to delete "{moduleData.name}"? This action cannot be undone.</p>
            <div className={classes.modalButtons}>
              <button className={classes.cancelBtn} onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className={classes.confirmDeleteBtn} onClick={handleDeleteModule}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Module Modal */}
      {showEditModal && (
        <div className={classes.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div className={classes.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Edit Module</h2>
            <button className={classes.closeBtn} onClick={() => setShowEditModal(false)}>×</button>
            <form onSubmit={handleEditModule} className={classes.editForm}>
              <div className={classes.formGroup}>
                <label>Module Code</label>
                <input
                  type="text"
                  value={editForm.code}
                  onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                />
              </div>
              <div className={classes.formGroup}>
                <label>Module Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div className={classes.formGroup}>
                <label>Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows="3"
                />
              </div>
              <div className={classes.formGroup}>
                <label>Credits</label>
                <input
                  type="number"
                  value={editForm.credits}
                  onChange={(e) => setEditForm({ ...editForm, credits: e.target.value })}
                />
              </div>
              <div className={classes.formGroup}>
                <label>Semester</label>
                <input
                  type="number"
                  value={editForm.semester}
                  onChange={(e) => setEditForm({ ...editForm, semester: e.target.value })}
                />
              </div>
              <div className={classes.modalButtons}>
                <button type="button" className={classes.cancelBtn} onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={classes.saveBtn}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}