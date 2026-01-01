import { useState, useContext, useEffect } from 'react';
import classes from './PostDetail.module.css';
import { IoArrowBack } from "react-icons/io5";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { useRouter } from 'next/router';
import GlobalContext from '../../pages/store/globalContext';
import { POST_API, USER_API } from '../../config/api';

export default function PostDetail(props) {
    const router = useRouter();
    const globalCtx = useContext(GlobalContext);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState(null);

    // Likes state
    const [likes, setLikes] = useState(props.likes || []);
    const [isLiked, setIsLiked] = useState(false);

    // Comments state
    const [comments, setComments] = useState(props.comments || []);
    const [newComment, setNewComment] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);

    // Check if current user has liked
    useEffect(() => {
        if (props.currentUserId && likes.length > 0) {
            const currentId = props.currentUserId;
            setIsLiked(likes.some(l => l.user_id === currentId));
        }
    }, [props.currentUserId, likes]);

    // Load initial data
    useEffect(() => {
        loadLikes();
        loadComments();
    }, [props.id]);

    async function loadLikes() {
        try {
            const res = await fetch(POST_API.GET_ALL_LIKES);
            if (res.ok) {
                const allLikes = await res.json();
                const postLikes = allLikes.filter(l => l.post_id === props.id);
                setLikes(postLikes);

                if (props.currentUserId) {
                    const currentId = props.currentUserId;
                    setIsLiked(postLikes.some(l => l.user_id === currentId));
                }
            }
        } catch (err) {
            console.error("Failed to load likes:", err);
        }
    }

    async function loadComments() {
        try {
            const res = await fetch(POST_API.GET_COMMENTS_FOR_POST(props.id));
            if (res.ok) {
                const postComments = await res.json();

                // We need to fetch user details for each comment to show username
                const commentsWithUsers = await Promise.all(postComments.map(async (c) => {
                    try {
                        const uRes = await fetch(USER_API.GET_USER_BY_ID(c.user_id));
                        if (uRes.ok) {
                            const uData = await uRes.json();
                            return { ...c, username: uData.username || `User ${c.user_id}` };
                        }
                    } catch (e) {
                        // ignore
                    }
                    return { ...c, username: `User ${c.user_id}` };
                }));

                setComments(commentsWithUsers);
            }
        } catch (err) {
            // 404 is expected if no comments
            if (err.message && !err.message.includes("404")) {
                console.error("Failed to load comments:", err);
            }
        }
    }

    // Toggle like
    async function handleLike() {
        if (!props.currentUserId) {
            alert("Please log in to like posts");
            return;
        }

        try {
            if (isLiked) {
                // Unlike
                const res = await fetch(POST_API.REMOVE_LIKE(props.currentUserId, props.id), {
                    method: "DELETE"
                });
                if (res.ok || res.status === 404) {
                    setIsLiked(false);
                    loadLikes();
                }
            } else {
                // Like
                const res = await fetch(POST_API.ADD_LIKE, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_id: props.currentUserId,
                        post_id: props.id
                    })
                });
                if (res.ok) {
                    setIsLiked(true);
                    loadLikes();
                }
            }
        } catch (err) {
            console.error("Like error:", err);
        }
    }

    // Add comment
    async function handleAddComment(e) {
        e.preventDefault();
        if (!newComment.trim() || submittingComment) return;

        if (!props.currentUserId) {
            alert("Please log in to comment");
            return;
        }

        setSubmittingComment(true);
        try {
            const res = await fetch(POST_API.ADD_COMMENT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: props.currentUserId,
                    post_id: props.id,
                    content: newComment
                })
            });

            if (res.ok) {
                setNewComment("");
                loadComments();
            }
        } catch (err) {
            console.error("Add comment error:", err);
        }
        setSubmittingComment(false);
    }

    // Delete comment - show confirmation first
    function confirmDeleteComment(commentId) {
        setCommentToDelete(commentId);
        setShowDeleteCommentModal(true);
    }

    async function handleDeleteComment() {
        if (!commentToDelete) return;
        try {
            const res = await fetch(POST_API.DELETE_COMMENT(commentToDelete), {
                method: "DELETE"
            });

            if (res.ok) {
                loadComments();
            }
        } catch (err) {
            console.error("Delete comment error:", err);
        }
        setShowDeleteCommentModal(false);
        setCommentToDelete(null);
    }

    async function handleDelete() {
        const res = await fetch(POST_API.DELETE_POST(props.id), {
            method: "DELETE"
        });

        if (res.ok) {
            setShowDeleteModal(false);
            const isOwner = props.currentUserId === props.postUserId;
            if (isOwner) {
                globalCtx.updateGlobals({ cmd: 'decPostCount' });
            }
            if (props.onBack) {
                props.onBack();
            } else {
                router.push("/");
            }
        } else {
            alert("Failed to delete post.");
        }
    }

    return (
        <div className={classes.wrapper}>
            <section className={classes.card}>

                {/* Back button */}
                <div
                    className={classes.backBtn}
                    onClick={() => {
                        if (props.onBack) props.onBack();
                        else router.back();
                    }}
                >
                    <IoArrowBack size={28} />
                </div>

                <div className={classes.postedByRow}>
                    {props.profilePicture ? (
                        <img src={props.profilePicture} alt="" className={classes.authorPic} />
                    ) : (
                        <div className={classes.authorPicPlaceholder}>
                            {props.username ? props.username[0].toUpperCase() : "U"}
                        </div>
                    )}
                    <p className={classes.postedBy}>
                        Posted by <span>{props.username}</span>
                    </p>
                </div>

                {/* Course and Module info */}
                {(props.courseName || props.moduleName) && (
                    <div className={classes.postMeta}>
                        {props.courseName && (
                            <span
                                className={classes.metaLink}
                                onClick={() => props.courseId && router.push(`/courses/${props.courseId}`)}
                            >
                                📚 {props.courseName}
                            </span>
                        )}
                        {props.courseName && props.moduleName && <span className={classes.metaSeparator}>›</span>}
                        {props.moduleName && (
                            <span
                                className={classes.metaLink}
                                onClick={() => props.moduleId && router.push(`/modules/${props.moduleId}`)}
                            >
                                📖 {props.moduleName}
                            </span>
                        )}
                    </div>
                )}

                {props.image && props.image.length > 0 && (
                    <div className={classes.imageWrapper}>
                        <img src={props.image} alt={props.title} />
                    </div>
                )}

                {/* Role-based authorization for Edit/Delete buttons */}
                {(() => {
                    const isOwner = props.currentUserId === props.postUserId;
                    const isAdmin = props.currentUserRole === "admin";
                    const canEdit = isOwner;
                    const canDelete = isOwner || isAdmin;

                    if (!canEdit && !canDelete) return null;

                    return (
                        <div className={classes.actions}>
                            {canDelete && (
                                <button
                                    className={classes.deleteBtn}
                                    onClick={() => setShowDeleteModal(true)}
                                >
                                    Delete
                                </button>
                            )}
                            {canEdit && (
                                <button
                                    className={classes.editBtn}
                                    onClick={() => router.push(`/edit-post/${props.id}`)}
                                >
                                    Edit
                                </button>
                            )}
                        </div>
                    );
                })()}

                <h1 className={classes.title}>{props.title}</h1>
                <p className={classes.description}>{props.description}</p>

                {/* Like Button */}
                <div className={classes.likeSection}>
                    <button
                        className={`${classes.likeBtn} ${isLiked ? classes.liked : ''}`}
                        onClick={handleLike}
                    >
                        {isLiked ? <AiFillHeart size={24} /> : <AiOutlineHeart size={24} />}
                        <span>{likes.length} {likes.length === 1 ? 'Like' : 'Likes'}</span>
                    </button>
                </div>

                {/* Comments Section */}
                <div className={classes.commentsSection}>
                    <h3>Comments ({comments.length})</h3>

                    {/* Add Comment Form */}
                    <form onSubmit={handleAddComment} className={classes.commentForm}>
                        <input
                            type="text"
                            placeholder="Write a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                        <button type="submit" disabled={submittingComment || !newComment.trim()}>
                            Post
                        </button>
                    </form>

                    {/* Comments List */}
                    <div className={classes.commentsList}>
                        {comments.length === 0 ? (
                            <p className={classes.noComments}>No comments yet. Be the first to comment!</p>
                        ) : (
                            comments.map((comment) => {
                                const canDeleteComment = comment.user_id === props.currentUserId || props.currentUserRole === "admin";
                                return (
                                    <div key={comment.id || comment._id} className={classes.commentCard}>
                                        <div className={classes.commentHeader}>
                                            {comment.profilePicture ? (
                                                <img src={comment.profilePicture} alt="" className={classes.commentPic} />
                                            ) : (
                                                <div className={classes.commentPicPlaceholder}>
                                                    {comment.username ? comment.username[0].toUpperCase() : "U"}
                                                </div>
                                            )}
                                            <span className={classes.commentUsername}>{comment.username}</span>
                                            <span className={classes.commentTime}>
                                                {comment.created_at ? new Date(comment.created_at).toLocaleDateString() : 'Just now'}
                                            </span>
                                            {canDeleteComment && (
                                                <button
                                                    className={classes.deleteCommentBtn}
                                                    onClick={() => confirmDeleteComment(comment.id || comment._id)}
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                        <p className={classes.commentText}>{comment.content}</p>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

            </section>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className={classes.modalOverlay} onClick={() => setShowDeleteModal(false)}>
                    <div className={classes.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h2>Delete Post</h2>
                        <p>Are you sure you want to delete this post? This action cannot be undone.</p>
                        <div className={classes.modalButtons}>
                            <button
                                className={classes.cancelBtn}
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className={classes.confirmDeleteBtn}
                                onClick={handleDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Comment Confirmation Modal */}
            {showDeleteCommentModal && (
                <div className={classes.modalOverlay} onClick={() => setShowDeleteCommentModal(false)}>
                    <div className={classes.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h2>Delete Comment</h2>
                        <p>Are you sure you want to delete this comment?</p>
                        <div className={classes.modalButtons}>
                            <button
                                className={classes.cancelBtn}
                                onClick={() => setShowDeleteCommentModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className={classes.confirmDeleteBtn}
                                onClick={handleDeleteComment}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
