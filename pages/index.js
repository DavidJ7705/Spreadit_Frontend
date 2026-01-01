import PostItem from '../components/posts/PostItem';
import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import { POST_API, USER_API } from '../config/api';

import WelcomeText from '../components/WelcomeText';
import classes from '../styles/Home.module.css';

function HomePage() {
    const router = useRouter();
    const [posts, setPosts] = useState(null);
    const [username, setUsername] = useState("");
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        loadUserInfo();
        getAllPosts();
    }, []);

    function loadUserInfo() {
        // Get user info from localStorage
        const email = localStorage.getItem('userEmail');
        const id = localStorage.getItem('userId');

        if (id) {
            setCurrentUserId(id);
        }

        if (email) {
            // Extract username from email (before @) or use full email
            const usernameFromEmail = email.split('@')[0];
            setUsername(usernameFromEmail);
        }
    }

    async function handleDeletePost(postId) {
        if (!confirm("Are you sure you want to delete this post?")) return;
        try {
            const res = await fetch(POST_API.DELETE_POST(postId), {
                method: 'DELETE'
            });
            if (res.ok) {
                setPosts(prev => prev.filter(p => p.id !== postId));
            } else {
                alert("Failed to delete post");
            }
        } catch (e) {
            console.error(e);
            alert("Error deleting post");
        }
    }

    async function getAllPosts() {
        try {
            // Fetch all posts
            const response = await fetch('/api/get-posts', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            const postsData = data.posts || [];

            // Try to fetch all users to get names
            try {
                const usersResponse = await fetch(USER_API.GET_ALL_USERS);
                if (usersResponse.ok) {
                    const users = await usersResponse.json();

                    // Create a map of user_id to username
                    const userMap = {};
                    users.forEach(user => {
                        userMap[user.user_id] = user.name || user.username || user.email;
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
        } catch (error) {
            console.error('Failed to fetch posts:', error);
            setPosts([]);
        }
    }

    if (posts === null) {
        return null;
    }

    return (
        <>
            {/* Hero Section */}
            <div className={classes.heroSection}>
                <WelcomeText username={username} />
                <div className={classes.scrollIndicator} onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
                    <span>Scroll for posts</span>
                    <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>

            {/* Content Section - covers hero when scrolling */}
            <div className={classes.contentSection}>
                <div className={classes.backgroundLayer}></div>
                <div className={classes.postsWrapper}>
                    {/* Quick Links Sidebar */}
                    <div className={classes.quickLinks}>
                        <h3>Quick Links</h3>
                        <nav>
                            <a onClick={() => router.push('/your-courses')}>📚 Your Courses</a>
                            <a onClick={() => router.push('/your-modules')}>📖 Your Modules</a>
                            <a onClick={() => router.push('/profile')}>👤 Profile</a>
                            <a onClick={() => router.push('/new-post')}>✍️ New Post</a>
                            <a onClick={() => router.push('/settings')}>⚙️ Settings</a>
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className={classes.postsContent}>
                        {/* Header */}
                        <div className={classes.header}>
                            <h2>Recent Posts</h2>
                            <button className={classes.newPostBtn} onClick={() => router.push('/new-post')} aria-label="Create New Post">
                                +
                            </button>
                        </div>

                        {/* Posts */}
                        {posts.length === 0 ? (
                            <div className={classes.empty}>
                                <p>No posts yet. Be the first to create one!</p>
                            </div>
                        ) : (
                            <div className={classes.postsGrid}>
                                {posts.map((post) => (
                                    <PostItem
                                        key={post.id}
                                        id={post.id}
                                        image={null}
                                        title={post.post_title}
                                        description={post.content}
                                        username={post.username}
                                        profilePicture={null}
                                        likes={post.likes || []}
                                        comments={post.comments || []}
                                        authorId={post.user_id}
                                        currentUserId={currentUserId}
                                        onDelete={handleDeletePost}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Trending Sidebar */}
                    <div className={classes.trending}>
                        <h3>Trending</h3>
                        <div className={classes.trendingItem}>
                            <span className={classes.trendingTag}>#WebDevelopment</span>
                            <span className={classes.trendingCount}>248 posts</span>
                        </div>
                        <div className={classes.trendingItem}>
                            <span className={classes.trendingTag}>#JavaScript</span>
                            <span className={classes.trendingCount}>186 posts</span>
                        </div>
                        <div className={classes.trendingItem}>
                            <span className={classes.trendingTag}>#React</span>
                            <span className={classes.trendingCount}>142 posts</span>
                        </div>
                        <div className={classes.trendingItem}>
                            <span className={classes.trendingTag}>#NextJS</span>
                            <span className={classes.trendingCount}>98 posts</span>
                        </div>
                        <div className={classes.trendingItem}>
                            <span className={classes.trendingTag}>#CSS</span>
                            <span className={classes.trendingCount}>76 posts</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default HomePage;