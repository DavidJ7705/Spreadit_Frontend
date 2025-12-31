import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import classes from "../components/modules/modulePage.module.css";
import BackButton from '../components/ui/BackButton';
import { COURSE_API } from '../config/api';

export default function YourCoursesPage() {
    const router = useRouter();

    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            // Fetch all courses from Course microservice
            const coursesRes = await fetch(COURSE_API.GET_ALL_COURSES);
            const coursesData = await coursesRes.json();

            // Filter by enrollment using Source of Truth (enrolled_users list)
            const dbId = localStorage.getItem('userId');
            if (dbId) {
                // Check if the user's DB ID is in the enrolled_users list
                const myCourses = coursesData.filter(c => c.enrolled_users && c.enrolled_users.includes(dbId));
                setEnrolledCourses(myCourses);
            } else {
                setEnrolledCourses([]);
            }
        } catch (err) {
            console.error("Error loading data:", err);
            setEnrolledCourses([]);
        } finally {
            setLoading(false);
        }
    }

    async function unenroll(courseId, courseStringId) {
        if (!confirm("Are you sure you want to unenroll from this course?")) return;

        try {
            const userId = localStorage.getItem('userId');
            if (!userId) return;

            const res = await fetch(COURSE_API.UNENROLL_USER(courseStringId, userId), {
                method: "POST"
            });

            if (res.ok) {
                // Remove from local state immediately
                setEnrolledCourses(prev => prev.filter(c => c.id !== courseId));
            } else {
                const data = await res.json();
                alert(data.detail || "Failed to unenroll");
            }
        } catch (err) {
            console.error("Error unenrolling:", err);
            alert("Error unenrolling");
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

    return (
        <div className={classes.wrapper}>
            <BackButton />
            <div className={classes.page}>

                <div className={classes.headerRow}>
                    <h1 className={classes.title}>Your Courses</h1>
                </div>

                {enrolledCourses.length === 0 ? (
                    <p style={{ color: "var(--text)", textAlign: "center", marginTop: "40px" }}>
                        You are not enrolled in any courses yet.{" "}
                        <span
                            style={{ color: "var(--accent)", cursor: "pointer", textDecoration: "underline" }}
                            onClick={() => router.push("/courses")}
                        >
                            Browse all courses
                        </span>
                    </p>
                ) : (
                    <div className={classes.grid}>
                        {enrolledCourses.map((c) => (
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
                                        className={`${classes.btn} ${classes.unenroll}`}
                                        onClick={() => unenroll(c.id, c.course_id)}
                                    >
                                        Unenroll
                                    </button>
                                    <button
                                        className={classes.enterBtn}
                                        onClick={() => router.push(`/courses/${c.id}`)}
                                    >
                                        Enter
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
