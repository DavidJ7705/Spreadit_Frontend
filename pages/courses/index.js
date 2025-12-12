import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import classes from "../../components/modules/modulePage.module.css";

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
        loadProfile();
    }, []);

    async function loadCourses() {
        try {
            const res = await fetch("http://localhost:8002/api/get-all-courses");
            const data = await res.json();
            setCourses(data);
        } catch (error) {
            console.error('Failed to load courses:', error);
            setCourses([]);
        } finally {
            setLoading(false);
        }
    }

    function loadProfile() {
        // Backend doesn't track enrolled courses yet
        setEnrolled([]);
    }

    async function toggleEnrollment(courseId) {
        alert("Course enrollment is not yet implemented in the backend.");
        // TODO: Implement when backend supports enrollment
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
                                            onClick={() => toggleEnrollment(c.id)}
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
