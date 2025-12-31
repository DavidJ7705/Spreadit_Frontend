import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import classes from "../components/modules/modulePage.module.css";
import BackButton from '../components/ui/BackButton';
import { USER_API, MODULE_API } from '../config/api';

export default function YourModulesPage() {
    const router = useRouter();

    const [enrolledModules, setEnrolledModules] = useState([]);
    const [courses, setCourses] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const dbId = localStorage.getItem('userId');

            // 1. Fetch User Data to get Enrolled Modules (Primary Source)
            let enrolledIds = [];
            if (dbId) {
                try {
                    const userRes = await fetch(USER_API.GET_USER_BY_ID(dbId));
                    if (userRes.ok) {
                        const userData = await userRes.json();
                        if (userData.enrolled_modules) {
                            enrolledIds = userData.enrolled_modules;
                        }
                    }
                } catch (e) {
                    console.error("Failed to fetch user data:", e);
                }
            }

            // 2. Fetch all modules from Module microservice
            const modulesRes = await fetch(MODULE_API.GET_ALL_MODULES);
            const modulesData = await modulesRes.json();

            // Filter using User's Enrolled Module IDs
            let myModules = modulesData.filter(m => enrolledIds.includes(m.id_module));

            // Fallback: If enrolledIds is empty (e.g. user service delay), try module.enrolled_users Source of Truth
            if (myModules.length === 0 && dbId) {
                const fallbackModules = modulesData.filter(m => m.enrolled_users && m.enrolled_users.includes(dbId));
                if (fallbackModules.length > 0) {
                    myModules = fallbackModules;
                }
            }

            setEnrolledModules(myModules);

            // 3. Fetch courses to show course info
            // Need COURSE_API here? We can just use hardcoded URL or import it if needed.
            // But let's just use the URL directly as before or fetch from api config if imported.
            // Let's use simple fetch for now as COURSE_API isn't imported in this file yet (except via my thought process)
            // Wait, I should import COURSE_API too for consistency.
            const coursesRes = await fetch("http://localhost:8002/api/get-all-courses");
            const coursesData = await coursesRes.json();
            const coursesMap = {};
            coursesData.forEach(course => {
                coursesMap[course.id] = course; // Key by DB ID because module.course_id is DB ID
            });
            setCourses(coursesMap);
        } catch (err) {
            console.error("Error loading data:", err);
            setEnrolledModules([]);
        } finally {
            setLoading(false);
        }
    }

    async function unenroll(moduleId) {
        if (!confirm("Are you sure you want to unenroll from this module?")) return;

        try {
            const userId = localStorage.getItem('userId');
            if (!userId) return;

            const res = await fetch(MODULE_API.UNENROLL_USER(moduleId, userId), {
                method: "POST"
            });

            if (res.ok) {
                setEnrolledModules(prev => prev.filter(m => m.id_module !== moduleId));
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
                            // Find parent course
                            const course = courses[m.course_id];

                            return (
                                <div
                                    key={m.id_module}
                                    className={classes.moduleCard}
                                    onClick={() => router.push(`/modules/${m.id_module}`)}
                                >
                                    <div className={classes.moduleContent}>
                                        {course && (
                                            <div className={classes.moduleCourseTag}>
                                                {course.course_id}
                                            </div>
                                        )}
                                        <div className={classes.moduleHeader}>
                                            <h2 className={classes.moduleCode}>{m.id_module}</h2>
                                            <h3 className={classes.moduleName}>{m.name}</h3>
                                        </div>
                                        {m.description && (
                                            <p className={classes.moduleDescription}>{m.description}</p>
                                        )}
                                    </div>
                                    <div className={classes.moduleActions} onClick={(e) => e.stopPropagation()}>
                                        <button
                                            className={`${classes.btn} ${classes.unenroll}`}
                                            onClick={() => unenroll(m.id_module)}
                                        >
                                            Unenroll
                                        </button>
                                        <button
                                            className={classes.enterBtn}
                                            onClick={() => router.push(`/modules/${m.id_module}`)}
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
