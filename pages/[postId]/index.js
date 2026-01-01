import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import PostDetail from "../../components/posts/PostDetail";
import { USER_API, POST_API, MODULE_API } from '../../config/api';

export default function PostDetailPage() {
    const router = useRouter();
    const { postId } = router.query;

    const [post, setPost] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [moduleInfo, setModuleInfo] = useState(null);
    const [courseInfo, setCourseInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch current user
    useEffect(() => {
        const userId = localStorage.getItem('userId');
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        setCurrentUser(userId ? { id: userId, role: isAdmin ? "admin" : "user" } : null);
    }, []);

    // Fetch post
    useEffect(() => {
        if (!postId) return;

        async function fetchPostAndUser() {
            setLoading(true);
            setError(null);
            try {
                // Fetch post
                const postRes = await fetch(POST_API.GET_POST_BY_ID(postId));

                if (!postRes.ok) {
                    throw new Error(`Post not found (${postRes.status})`);
                }

                const postData = await postRes.json();

                if (!postData) {
                    throw new Error("No post data received");
                }

                // Fetch all users to get username
                try {
                    const usersRes = await fetch(USER_API.GET_ALL_USERS);
                    if (usersRes.ok) {
                        const users = await usersRes.json();
                        const postUser = users.find(u => u.user_id === postData.user_id);
                        postData.username = postUser ? (postUser.username || postUser.name || postUser.email) : `User ${postData.user_id}`;
                    } else {
                        postData.username = `User ${postData.user_id}`;
                    }
                } catch (userErr) {
                    console.error('Failed to fetch users:', userErr);
                    postData.username = `User ${postData.user_id}`;
                }

                setPost(postData);

                // Fetch module info if module_id exists
                if (postData?.module_id) {
                    loadModuleInfo(postData.module_id);
                }

                setLoading(false);
            } catch (err) {
                console.error('Failed to load post:', err);
                setError(err.message || 'Failed to load post');
                setLoading(false);
            }
        }

        fetchPostAndUser();
    }, [postId]);

    async function loadModuleInfo(moduleId) {
        try {
            const res = await fetch(MODULE_API.GET_MODULE_BY_ID(moduleId));
            if (res.ok) {
                const modData = await res.json();
                setModuleInfo(modData);
                // Backend doesn't have course relationships
            }
        } catch (err) {
            console.error("Error loading module info:", err);
        }
    }

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text)' }}>
                Loading post...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text)' }}>
                <h2>Error loading post</h2>
                <p>{error}</p>
                <button onClick={() => router.back()}>Go Back</button>
            </div>
        );
    }

    if (!post) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text)' }}>
                <h2>Post not found</h2>
                <button onClick={() => router.back()}>Go Back</button>
            </div>
        );
    }

    return (
        <PostDetail
            id={post.id}
            title={post.post_title || 'Untitled'}  // Backend uses post_title, with fallback
            image={null}  // Backend doesn't support images yet
            username={post.username || 'Unknown User'}  // Fetched from User service
            profilePicture={null}
            description={post.content || ''}  // Backend uses content
            currentUserId={currentUser?.id}
            currentUserRole={currentUser?.role}
            currentUserProfilePicture={null}
            postUserId={post.user_id}
            moduleId={post.module_id}
            moduleName={moduleInfo ? `${moduleInfo.id_module} - ${moduleInfo.name}` : null}
            courseId={null}
            courseName={null}
            likes={post.likes || []}
            comments={post.comments || []}
        />
    );
}
