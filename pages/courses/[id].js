import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import classes from "../../components/modules/modulePage.module.css";
import BackButton from '../../components/ui/BackButton';
import { USER_API, MODULE_API } from '../../config/api';

export default function CourseDetailPage() {
    const router = useRouter();
    const { id } = router.query;

    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [enrolled, setEnrolled] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);

    // Modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({ course_id: "", course_name: "", description: "" });

    useEffect(() => {
        // Check admin status from localStorage
        const adminStatus = localStorage.getItem('isAdmin') === 'true';
        setIsAdmin(adminStatus);
        setCurrentUserId(localStorage.getItem('userId'));

        if (id) {
            loadCourse();
            loadModules();
            loadEnrollment();
        }
    }, [id]);

    async function loadCourse() {
        try {
            const res = await fetch(`http://localhost:8002/api/get-course-by-db-id/${id}`);
            const data = await res.json();
            setCourse(data);
            setEditForm({
                course_id: data.course_id || "",
                course_name: data.course_name || "",
                description: data.description || ""
            });
        } catch (err) {
            console.error("Error loading course:", err);
        } finally {
            setLoading(false);
        }
    }

    async function loadModules() {
        try {
            // Fetch modules for this specific course
            const res = await fetch(`http://localhost:8003/api/module?course_id=${id}`);
            if (res.ok) {
                const data = await res.json();
                setModules(Array.isArray(data) ? data : []);
            } else {
                setModules([]);
            }
        } catch (err) {
            console.error("Error loading modules:", err);
            setModules([]);
        }
    }



    async function loadEnrollment() {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            setEnrolled([]);
            return;
        }

        try {
            // Fetch user data to get enrolled_modules
            const userRes = await fetch(USER_API.GET_USER_BY_ID(userId));
            if (userRes.ok) {
                const userData = await userRes.json();
                setEnrolled(userData.enrolled_modules || []);
            } else {
                setEnrolled([]);
            }
        } catch (err) {
            console.error("Error loading enrollment:", err);
            setEnrolled([]);
        }
    }

    async function toggleModuleEnrollment(moduleId) {
        if (!currentUserId) {
            alert('Please log in to enroll in modules');
            return;
        }

        // Find module to check its specific enrolled_users
        const module = modules.find(m => m.id_module === moduleId);
        const moduleSideEnrollment = module && module.enrolled_users && module.enrolled_users.includes(currentUserId);
        const userSideEnrollment = enrolled.includes(moduleId);

        const isEnrolled = userSideEnrollment || moduleSideEnrollment;

        try {
            if (isEnrolled) {
                const res = await fetch(MODULE_API.UNENROLL_USER(moduleId, currentUserId), { method: "POST" });
                if (res.ok) {
                    // Update User Side State
                    setEnrolled(prev => prev.filter(id => id !== moduleId));

                    // Update Module Side State (UI Mirror)
                    setModules(prev => prev.map(m => {
                        if (m.id_module === moduleId) {
                            return {
                                ...m,
                                enrolled_users: (m.enrolled_users || []).filter(uid => uid !== currentUserId)
                            };
                        }
                        return m;
                    }));

                    alert('Successfully unenrolled from module!');
                } else {
                    const error = await res.json();
                    if (error.detail === "User was not enrolled") {
                        // Fix for sync issues: If backend says not enrolled, force remove from local state
                        setEnrolled(prev => prev.filter(id => id !== moduleId));
                        setModules(prev => prev.map(m => {
                            if (m.id_module === moduleId) {
                                return {
                                    ...m,
                                    enrolled_users: (m.enrolled_users || []).filter(uid => uid !== currentUserId)
                                };
                            }
                            return m;
                        }));
                    }
                    alert(error.detail || 'Failed to unenroll');
                }
            } else {
                const res = await fetch(MODULE_API.ENROLL_USER(moduleId, currentUserId), { method: "POST" });
                if (res.ok) {
                    // Update User Side State
                    setEnrolled(prev => [...prev, moduleId]);

                    // Update Module Side State (UI Mirror)
                    setModules(prev => prev.map(m => {
                        if (m.id_module === moduleId) {
                            return {
                                ...m,
                                enrolled_users: [...(m.enrolled_users || []), currentUserId]
                            };
                        }
                        return m;
                    }));

                    alert('Successfully enrolled in module!');
                } else {
                    const error = await res.json();
                    if (error.detail === "User already enrolled in module") {
                        // Fix for sync issues: If backend says already enrolled, force add to local state
                        if (!enrolled.includes(moduleId)) setEnrolled(prev => [...prev, moduleId]);
                        setModules(prev => prev.map(m => {
                            if (m.id_module === moduleId) {
                                if (m.enrolled_users && m.enrolled_users.includes(currentUserId)) return m;
                                return {
                                    ...m,
                                    enrolled_users: [...(m.enrolled_users || []), currentUserId]
                                };
                            }
                            return m;
                        }));
                    }
                    alert(error.detail || 'Failed to enroll');
                }
            }
        } catch (error) {
            console.error('Enrollment error:', error);
            alert('An error occurred');
        }
    }

    async function handleDeleteCourse() {
        try {
            const res = await fetch(`http://localhost:8002/api/delete-course-by-id/${course.course_id}`, {
                method: "DELETE"
            });

            if (res.ok) {
                router.push("/courses");
            }
        } catch (err) {
            console.error("Error deleting course:", err);
        }
    }

    async function handleEditCourse(e) {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:8002/api/patch-course-by-id/${course.course_id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm)
            });

            if (res.ok) {
                setShowEditModal(false);
                loadCourse();
            }
        } catch (err) {
            console.error("Error updating course:", err);
        }
    }

    if (loading) {
        return (
            <div className={classes.wrapper}>
                <BackButton />
                <div className={classes.page}>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className={classes.wrapper}>
                <BackButton />
                <div className={classes.page}>
                    <p>Course not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className={classes.wrapper}>
            <BackButton />
            <div className={classes.page}>

                {/* Course Header Card */}
                <div className={classes.courseHeaderCard}>
                    <div className={classes.courseHeaderContent}>
                        <div className={classes.courseTitleSection}>
                            <span className={classes.courseCodeLarge}>{course.course_id}</span>
                            <h1 className={classes.courseNameLarge}>{course.course_name}</h1>
                            {course.description && (
                                <p className={classes.courseDescLarge}>{course.description}</p>
                            )}
                        </div>

                        {/* Admin controls */}
                        {isAdmin && (
                            <div className={classes.adminActionsGroup}>
                                <button
                                    className={classes.actionBtnEdit}
                                    onClick={() => setShowEditModal(true)}
                                >
                                    <span className={classes.actionIcon}>✏️</span>
                                    <span>Edit</span>
                                </button>
                                <button
                                    className={classes.actionBtnDelete}
                                    onClick={() => setShowDeleteModal(true)}
                                >
                                    <span className={classes.actionIcon}>🗑️</span>
                                    <span>Delete</span>
                                </button>
                                <button
                                    className={classes.actionBtnAdd}
                                    onClick={() => router.push(`/modules/new?courseId=${course.id}`)}
                                >
                                    <span className={classes.actionIcon}>➕</span>
                                    <span>Add Module</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <h2 className={classes.sectionTitle}>Modules in this Course</h2>

                {modules.length === 0 ? (
                    <p style={{ color: "var(--text-soft)" }}>No modules in this course yet.</p>
                ) : (
                    <div className={classes.grid}>
                        {modules.map((m) => {
                            // Check both User Service list (enrolled) and Module Service list (m.enrolled_users)
                            const isEnrolled = enrolled.includes(m.id_module) ||
                                (currentUserId && m.enrolled_users && m.enrolled_users.includes(currentUserId));

                            return (
                                <div key={m.id_module} className={classes.card}>
                                    <h2>{m.id_module}</h2>
                                    <p>{m.name}</p>

                                    <button
                                        className={`${classes.btn} ${isEnrolled ? classes.unenroll : classes.enroll}`}
                                        onClick={() => toggleModuleEnrollment(m.id_module)}
                                    >
                                        {isEnrolled ? "Unenroll" : "Enroll"}
                                    </button>
                                    <button
                                        className={classes.enterBtn}
                                        onClick={() => router.push(`/modules/${m.id || m.id_module}`)}
                                    >
                                        Enter
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className={classes.modalOverlay} onClick={() => setShowDeleteModal(false)}>
                    <div className={classes.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h2>Delete Course</h2>
                        <p>Are you sure you want to delete "{course.name}"? This action cannot be undone.</p>
                        <div className={classes.modalButtons}>
                            <button className={classes.cancelBtn} onClick={() => setShowDeleteModal(false)}>
                                Cancel
                            </button>
                            <button className={classes.confirmDeleteBtn} onClick={handleDeleteCourse}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Course Modal */}
            {showEditModal && (
                <div className={classes.modalOverlay} onClick={() => setShowEditModal(false)}>
                    <div className={classes.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h2>Edit Course</h2>
                        <button className={classes.closeBtn} onClick={() => setShowEditModal(false)}>×</button>
                        <form onSubmit={handleEditCourse} className={classes.editForm}>
                            <div className={classes.formGroup}>
                                <label>Course ID</label>
                                <input
                                    type="text"
                                    value={editForm.course_id}
                                    onChange={(e) => setEditForm({ ...editForm, course_id: e.target.value })}
                                />
                            </div>
                            <div className={classes.formGroup}>
                                <label>Course Name</label>
                                <input
                                    type="text"
                                    value={editForm.course_name}
                                    onChange={(e) => setEditForm({ ...editForm, course_name: e.target.value })}
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
        </div>
    );
}
