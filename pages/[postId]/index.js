import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import PostDetail from "../../components/posts/PostDetail";

export default function PostDetailPage() {
    const router = useRouter();
    const { postId } = router.query;

    const [post, setPost] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [moduleInfo, setModuleInfo] = useState(null);
    const [courseInfo, setCourseInfo] = useState(null);

    // Fetch current user
    useEffect(() => {
        const userId = localStorage.getItem('userId');
        setCurrentUser(userId ? { id: parseInt(userId) } : null);
    }, []);

    // Fetch post
    useEffect(() => {
        if (!postId) return;

        async function fetchPostAndUser() {
            try {
                // Fetch post
                const postRes = await fetch(`http://localhost:8004/api/post-by-id/${postId}`);
                const postData = await postRes.json();

                // Fetch all users to get username
                try {
                    const usersRes = await fetch('http://localhost:8001/api/all-users');
                    if (usersRes.ok) {
                        const users = await usersRes.json();
                        const postUser = users.find(u => u.id === postData.user_id);
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
            } catch (err) {
                console.error('Failed to load post:', err);
            }
        }

        fetchPostAndUser();
    }, [postId]);

    async function loadModuleInfo(moduleId) {
        try {
            const res = await fetch(`http://localhost:8003/api/module/${moduleId}`);
            if (res.ok) {
                const modData = await res.json();
                setModuleInfo(modData);
                // Backend doesn't have course relationships
            }
        } catch (err) {
            console.error("Error loading module info:", err);
        }
    }

    if (!post) return null;

    return (
        <PostDetail
            id={post.id}
            title={post.post_title}  // Backend uses post_title
            image={null}  // Backend doesn't support images yet
            username={post.username || 'Unknown User'}  // Fetched from User service
            profilePicture={null}
            description={post.content}  // Backend uses content
            currentUserId={currentUser?.id}
            currentUserRole={null}  // Backend doesn't have roles
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

