import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import classes from "../styles/profile.module.css";
import PostDetail from "../components/posts/PostDetail";
import GlobalContext from "./store/globalContext";
import BackButton from '../components/ui/BackButton';
import { USER_API } from '../config/api';

export default function ProfilePage() {
  const router = useRouter();
  const globalCtx = useContext(GlobalContext);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [userRole, setUserRole] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [modules, setModules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);

  // Edit profile modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editProfilePicture, setEditProfilePicture] = useState("");
  const [dragOver, setDragOver] = useState(false);

  // Logout confirmation state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    loadFullProfile();
    loadMyPosts();
  }, []);

  async function loadFullProfile() {
    try {
      // Get user info from localStorage
      const email = localStorage.getItem('userEmail');
      const storedUserId = localStorage.getItem('userId');

      if (!email) {
        router.push("/login");
        return;
      }

      setEmail(email);
      setUsername(email.split('@')[0]); // Use email prefix as username
      setUserId(storedUserId || "");

      // Backend doesn't have profile pictures or roles yet
      setUserRole("");
      setProfilePicture("");

      // Set user in global context for post count tracking
      if (storedUserId) {
        globalCtx.updateGlobals({ cmd: 'setUser', userId: storedUserId });
      }

      // Note: Backend doesn't track enrolled modules/courses yet
      // Leaving these empty for now
      setModules([]);
      setCourses([]);
    } catch (error) {
      console.error('Error loading profile:', error);
      router.push("/login");
    }
  }

  async function loadMyPosts() {
    try {
      const storedUserId = localStorage.getItem('userId');
      if (!storedUserId) {
        setPosts([]);
        return;
      }

      const res = await fetch("/api/get-my-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: storedUserId })
      });

      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      setPosts([]);
    }
  }

  function openEditModal() {
    setEditUsername(username);
    setEditEmail(email);
    setEditPassword("");
    setEditProfilePicture(profilePicture);
    setShowEditModal(true);
  }

  function closeEditModal() {
    setShowEditModal(false);
    setEditPassword("");
  }

  // Profile picture upload handlers
  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer?.files[0];
    if (file && file.type.startsWith("image/")) {
      compressAndSetImage(file);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      compressAndSetImage(file);
    }
  }

  function compressAndSetImage(file) {
    const img = new Image();
    const reader = new FileReader();

    reader.onloadend = () => {
      img.src = reader.result;
    };

    img.onload = () => {
      const MAX_SIZE = 200;
      let width = img.width;
      let height = img.height;

      if (width > MAX_SIZE || height > MAX_SIZE) {
        const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const result = canvas.toDataURL('image/jpeg', 0.7);
      setEditProfilePicture(result);
    };

    reader.readAsDataURL(file);
  }

  function clearProfilePicture() {
    setEditProfilePicture("");
  }

  async function handleUpdateProfile(e) {
    e.preventDefault();

    alert("Profile editing is not yet implemented in the backend.");
    closeEditModal();

    // TODO: Implement when backend supports profile updates
    // const storedUserId = localStorage.getItem('userId');
    // if (!storedUserId) return;
    // 
    // const updates = {};
    // if (editUsername && editUsername !== username) updates.username = editUsername;
    // if (editEmail && editEmail !== email) updates.email = editEmail;
    // if (editPassword) updates.password = editPassword;
    // 
    // const res = await fetch(USER_API.UPDATE_USER(storedUserId), {
    //   method: "PUT",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(updates)
    // });
  }

  function logoutHandler() {
    // Clear localStorage
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('isAuthenticated');

    setShowLogoutConfirm(false);
    router.push("/login");
  }

  // If viewing a post -> show PostDetail
  if (selectedPost) {
    return (
      <PostDetail
        id={selectedPost._id}
        title={selectedPost.title}
        image={selectedPost.image}
        description={selectedPost.description}
        username={selectedPost.username}
        profilePicture={selectedPost.profilePicture}
        currentUserId={userId}
        currentUserRole={userRole}
        postUserId={selectedPost.userId}
        onBack={() => {
          setSelectedPost(null);
          loadMyPosts();
        }}
      />
    );
  }


  return (
    <div className={classes.wrapper}>
      <BackButton />
      <div className={classes.card}>

        {/* Header */}
        <div className={classes.header}>
          {profilePicture ? (
            <img src={profilePicture} alt="" className={classes.avatarImg} />
          ) : (
            <div className={classes.avatar}>
              {username ? username[0].toUpperCase() : "U"}
            </div>
          )}
          <div>
            <h1>{username}</h1>
            <p>{email}</p>
          </div>
          <div className={classes.profileActions}>
            <button className={classes.editProfileBtn} onClick={openEditModal}>
              Edit Profile
            </button>
            <button className={classes.logoutBtn} onClick={() => setShowLogoutConfirm(true)}>
              Logout
            </button>
          </div>
        </div>

        <div className={classes.statsRow}>

          {/* COURSES */}
          <div className={classes.statBox}>
            <h3>Your Courses</h3>
            {courses.length === 0 ? (
              <p className={classes.empty}>No courses enrolled.</p>
            ) : (
              courses.map((c) => (
                <div
                  key={c._id}
                  className={classes.item}
                  onClick={() => router.push(`/courses/${c._id}`)}
                  style={{ cursor: "pointer" }}
                >
                  {c.code} — {c.name}
                </div>
              ))
            )}
          </div>

          {/* MODULES */}
          <div className={classes.statBox}>
            <h3>Your Modules</h3>
            {modules.length === 0 ? (
              <p className={classes.empty}>No modules enrolled.</p>
            ) : (
              modules.map((m) => (
                <div
                  key={m._id}
                  className={classes.item}
                  onClick={() => router.push(`/modules/${m._id}`)}
                  style={{ cursor: "pointer" }}
                >
                  {m.code} — {m.name}
                </div>
              ))
            )}
          </div>

          {/* POSTS */}
          <div className={classes.statBox}>
            <h3>Your Posts ({globalCtx.theGlobalObject.postCount})</h3>
            {posts.length === 0 ? (
              <p className={classes.empty}>No posts yet.</p>
            ) : (
              posts.map((p) => {
                const hasImage = p.image && p.image.length > 0;
                return (
                  <div
                    key={p._id}
                    className={`${classes.postMiniCard} ${!hasImage ? classes.noImageCard : ''}`}
                    onClick={() => setSelectedPost(p)}
                  >
                    {hasImage && (
                      <div className={classes.thumbWrapper}>
                        <img src={p.image} alt={p.title} />
                      </div>
                    )}

                    <div className={classes.postInfo}>
                      <h4>{p.title}</h4>
                      <p>{p.description?.slice(0, 40)}...</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className={classes.modalOverlay} onClick={closeEditModal}>
          <div className={classes.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Edit Profile</h2>
            <button className={classes.closeBtn} onClick={closeEditModal}>×</button>

            <form onSubmit={handleUpdateProfile} className={classes.editForm}>

              {/* Profile Picture Upload */}
              <div className={classes.formGroup}>
                <label>Profile Picture</label>
                <div
                  className={`${classes.profilePicDropZone} ${dragOver ? classes.dropZoneActive : ''}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  {editProfilePicture ? (
                    <div className={classes.profilePicPreview}>
                      <img src={editProfilePicture} alt="Profile" />
                      <button type="button" className={classes.clearPicBtn} onClick={clearProfilePicture}>×</button>
                    </div>
                  ) : (
                    <div className={classes.dropContent}>
                      <p>Drag & drop an image</p>
                      <span>or</span>
                      <label className={classes.fileLabel}>
                        Choose file
                        <input type="file" accept="image/*" onChange={handleFileSelect} hidden />
                      </label>
                    </div>
                  )}
                </div>
                <input
                  type="url"
                  placeholder="Or paste image URL..."
                  value={editProfilePicture?.startsWith("data:") ? "" : editProfilePicture}
                  onChange={(e) => setEditProfilePicture(e.target.value)}
                  className={classes.urlInput}
                />
              </div>

              <div className={classes.formGroup}>
                <label>Username</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder="Enter new username"
                />
              </div>

              <div className={classes.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="Enter new email"
                />
              </div>

              <div className={classes.formGroup}>
                <label>Password (leave blank to keep current)</label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>

              <div className={classes.modalButtons}>
                <button type="button" onClick={closeEditModal} className={classes.cancelBtn}>
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

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className={classes.modalOverlay} onClick={() => setShowLogoutConfirm(false)}>
          <div className={classes.logoutModal} onClick={(e) => e.stopPropagation()}>
            <h3>Are you sure?</h3>
            <p>Do you really want to log out?</p>
            <div className={classes.modalButtons}>
              <button className={classes.cancelBtn} onClick={() => setShowLogoutConfirm(false)}>
                Cancel
              </button>
              <button className={classes.confirmBtn} onClick={logoutHandler}>
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
