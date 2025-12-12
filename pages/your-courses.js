import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import classes from "../components/modules/modulePage.module.css";
import BackButton from '../components/ui/BackButton';

export default function YourCoursesPage() {
    const router = useRouter();

    const [allCourses, setAllCourses] = useState([]);
    const [enrolled, setEnrolled] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            // Fetch all courses from Course microservice
            const coursesRes = await fetch("http://localhost:8002/api/get-all-courses");
            const coursesData = await coursesRes.json();
            setAllCourses(coursesData);

            // Backend doesn't track enrolled courses yet
            setEnrolled([]);
        } catch (err) {
            console.error("Error loading data:", err);
        } finally {
            setLoading(false);
        }
    }

    async function unenroll(courseId) {
        alert("Course enrollment tracking is not yet implemented in the backend.");
        // TODO: Implement when backend supports enrollment
    }

    // Filter to only show enrolled courses
    const enrolledCourses = allCourses.filter(c => enrolled.includes(c._id));

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
                                key={c._id}
                                className={classes.courseCard}
                                onClick={() => router.push(`/courses/${c._id}`)}
                            >
                                <div className={classes.courseContent}>
                                    <div className={classes.courseHeader}>
                                        <h2 className={classes.courseCode}>{c.code}</h2>
                                        <h3 className={classes.courseName}>{c.name}</h3>
                                    </div>
                                    {c.description && (
                                        <p className={classes.courseDescription}>{c.description}</p>
                                    )}
                                </div>
                                <div className={classes.courseActions} onClick={(e) => e.stopPropagation()}>
                                    <button
                                        className={`${classes.btn} ${classes.unenroll}`}
                                        onClick={() => unenroll(c._id)}
                                    >
                                        Unenroll
                                    </button>
                                    <button
                                        className={classes.enterBtn}
                                        onClick={() => router.push(`/courses/${c._id}`)}
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
