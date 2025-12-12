import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import classes from "../components/modules/modulePage.module.css";
import BackButton from '../components/ui/BackButton';

export default function YourModulesPage() {
    const router = useRouter();

    const [allModules, setAllModules] = useState([]);
    const [enrolled, setEnrolled] = useState([]);
    const [courses, setCourses] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            // Fetch all modules from Module microservice
            const modulesRes = await fetch("http://localhost:8003/api/module");
            const modulesData = await modulesRes.json();
            setAllModules(modulesData);

            // Backend doesn't track enrolled modules yet
            setEnrolled([]);

            // Fetch courses from Course microservice
            const coursesRes = await fetch("http://localhost:8002/api/get-all-courses");
            const coursesData = await coursesRes.json();
            const coursesMap = {};
            coursesData.forEach(course => {
                coursesMap[course.course_id] = course;
            });
            setCourses(coursesMap);
        } catch (err) {
            console.error("Error loading data:", err);
        } finally {
            setLoading(false);
        }
    }

    async function unenroll(moduleId) {
        alert("Enrollment tracking is not yet implemented in the backend.");
        // TODO: Implement when backend supports enrollment
    }

    // Filter to only show enrolled modules
    const enrolledModules = allModules.filter(m => enrolled.includes(m._id));

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
                    <h1 className={classes.title}>Your Modules</h1>
                </div>

                {enrolledModules.length === 0 ? (
                    <p style={{ color: "var(--text)", textAlign: "center", marginTop: "40px" }}>
                        You are not enrolled in any modules yet.{" "}
                        <span
                            style={{ color: "var(--accent)", cursor: "pointer", textDecoration: "underline" }}
                            onClick={() => router.push("/modules")}
                        >
                            Browse all modules
                        </span>
                    </p>
                ) : (
                    <div className={classes.grid}>
                        {enrolledModules.map((m) => {
                            const course = courses[m.courseId];

                            return (
                                <div
                                    key={m._id}
                                    className={classes.moduleCard}
                                    onClick={() => router.push(`/modules/${m._id}`)}
                                >
                                    <div className={classes.moduleContent}>
                                        {course && (
                                            <div className={classes.moduleCourseTag}>
                                                {course.code} - {course.name}
                                            </div>
                                        )}
                                        <div className={classes.moduleHeader}>
                                            <h2 className={classes.moduleCode}>{m.code}</h2>
                                            <h3 className={classes.moduleName}>{m.name}</h3>
                                        </div>
                                        {m.description && (
                                            <p className={classes.moduleDescription}>{m.description}</p>
                                        )}
                                    </div>
                                    <div className={classes.moduleActions} onClick={(e) => e.stopPropagation()}>
                                        <button
                                            className={`${classes.btn} ${classes.unenroll}`}
                                            onClick={() => unenroll(m._id)}
                                        >
                                            Unenroll
                                        </button>
                                        <button
                                            className={classes.enterBtn}
                                            onClick={() => router.push(`/modules/${m._id}`)}
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
