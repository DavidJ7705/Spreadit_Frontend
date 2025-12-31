import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import classes from "../../components/modules/modulePage.module.css";
import { COURSE_API } from '../../config/api';

export default function CoursesPage() {
    const router = useRouter();

    const [courses, setCourses] = useState([]);
    const [enrolled, setEnrolled] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check admin status from localStorage
        const adminStatus = localStorage.getItem('isAdmin') === 'true';
        setIsAdmin(adminStatus);

        loadCourses();
    }, []);

    async function loadCourses() {
        try {
            const res = await fetch("http://localhost:8002/api/get-all-courses");
            const data = await res.json();
            setCourses(data);

            // Calculate enrollment from course data directly (Source of Truth)
            const userId = localStorage.getItem('userEmail')?.split('@')[0]; // Fallback if userId not set matching backend logic, or better:
            // Actually, let's use the stored user_id (string)
            // Backend UserDB.user_id is what's stored in course.enrolled_users

            // We need to fetch the actual User Object to get the 'user_id' string if localStorage only has DB ID?
            // Login stores: localStorage.setItem('userId', user.id.toString()) -> This is DB ID!
            // WE NEED THE STRING ID (e.g. "jdoe") to check enrolled_users!

            // Let's get the username/user_id string
            const dbId = localStorage.getItem('userId');
            if (dbId) {
                // Find courses where dbId is in enrolled_users
                const userCourses = data.filter(c => c.enrolled_users && c.enrolled_users.includes(dbId));
                setEnrolled(userCourses.map(c => c.course_id));
            }
        } catch (error) {
            console.error('Failed to load courses:', error);
            setCourses([]);
        } finally {
            setLoading(false);
        }
    }

    // Removed broken loadProfile function


    async function toggleEnrollment(courseId, courseStringId) {
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                alert('Please log in to enroll in courses');
                return;
            }

            const isEnrolled = enrolled.includes(courseStringId);

            if (isEnrolled) {
                const res = await fetch(COURSE_API.UNENROLL_USER(courseStringId, userId), {
                    method: 'POST'
                });
                if (res.ok) {
                    setEnrolled(prev => prev.filter(id => id !== courseStringId));
                    alert('Successfully unenrolled!');
                } else {
                    alert('Failed to unenroll');
                }
            } else {
                const res = await fetch(COURSE_API.ENROLL_USER(courseStringId, userId), {
                    method: 'POST'
                });
                if (res.ok) {
                    setEnrolled(prev => [...prev, courseStringId]);
                    alert('Successfully enrolled!');
                } else {
                    alert('Failed to enroll');
                }
            }
        } catch (error) {
            console.error('Enrollment error:', error);
            alert('An error occurred');
        }
    }

    return (
        <div className={classes.wrapper}>
            <div className={classes.page}>

                {/* Title + Admin Create Button */}
                <div className={classes.headerRow}>
                    <h1 className={classes.title}>All Courses</h1>

                    {isAdmin && (
                        <button
                            className={classes.createBtn}
                            onClick={() => router.push("/courses/new")}
                        >
                            + Create Course
                        </button>
                    )}
                </div>

                {/* Course Grid */}
                {loading ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-dim)' }}>Loading courses...</p>
                ) : courses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <p style={{ color: 'var(--text-dim)', fontSize: '1.1em' }}>
                            No courses available yet.
                        </p>
                        {isAdmin && (
                            <p style={{ color: 'var(--text-dim)', marginTop: '10px' }}>
                                Click "+ Create Course" to add your first course!
                            </p>
                        )}
                    </div>
                ) : (
                    <div className={classes.grid}>
                        {courses.map((c) => {
                            const isEnrolled = enrolled.includes(c.course_id);

                            return (
                                <div
                                    key={c.id}
                                    className={classes.courseCard}
                                    onClick={() => router.push(`/courses/${c.id}`)}
                                >
                                    <div className={classes.courseContent}>
                                        <div className={classes.courseHeader}>
                                            <h2 className={classes.courseCode}>{c.course_id}</h2>
                                            <h3 className={classes.courseName}>{c.course_name}</h3>
                                        </div>
                                        {c.description && (
                                            <p className={classes.courseDescription}>{c.description}</p>
                                        )}
                                    </div>
                                    <div className={classes.courseActions} onClick={(e) => e.stopPropagation()}>
                                        <button
                                            className={`${classes.btn} ${isEnrolled ? classes.unenroll : classes.enroll}`}
                                            onClick={() => toggleEnrollment(c.id, c.course_id)}
                                        >
                                            {isEnrolled ? "Unenroll" : "Enroll"}
                                        </button>
                                        <button
                                            className={classes.enterBtn}
                                            onClick={() => router.push(`/courses/${c.id}`)}
                                        >
                                            Enter
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
