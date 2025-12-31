import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import classes from "../../components/modules/modulePage.module.css";

export default function ModulesPage() {
  const router = useRouter();

  const [modules, setModules] = useState([]);
  const [enrolled, setEnrolled] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check admin status from localStorage
    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(adminStatus);

    loadModules();
    loadProfile();
  }, []);

  async function loadModules() {
    try {
      const res = await fetch("http://localhost:8003/api/module");
      const data = await res.json();
      setModules(data);

      // Check enrollment from the module data itself
      const userId = localStorage.getItem('userId');
      if (userId) {
        const userEnrolledModules = data
          .filter(m => m.enrolled_users && m.enrolled_users.includes(userId))
          .map(m => m.id_module);
        setEnrolled(userEnrolledModules);
      }
    } catch (error) {
      console.error('Failed to load modules:', error);
      setModules([]);
    } finally {
      setLoading(false);
    }
  }

  function loadProfile() {
    // Handled in loadModules now
  }

  async function toggleEnrollment(moduleId) {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert("Please log in to enroll.");
      return;
    }

    if (enrolled.includes(moduleId)) {
      alert("Unenrollment not implemented yet");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8003/api/modules/${moduleId}/enroll/${userId}`, {
        method: "POST"
      });

      if (res.ok) {
        setEnrolled([...enrolled, moduleId]);
        alert("Enrolled successfully!");
        loadModules(); // Refresh list to get updated enrolled_users
      } else {
        const err = await res.json();
        alert(err.detail || "Enrollment failed");
      }
    } catch (e) {
      console.error("Enrollment error:", e);
    }
  }

  return (
    <div className={classes.wrapper}>
      <div className={classes.page}>

        {/* Title only - no Create button, modules are created through courses */}
        <div className={classes.headerRow}>
          <h1 className={classes.title}>All Modules</h1>
        </div>

        {/* Module Grid */}
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-dim)' }}>Loading modules...</p>
        ) : modules.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: 'var(--text-dim)', fontSize: '1.1em' }}>
              No modules available yet.
            </p>
            {isAdmin && (
              <p style={{ color: 'var(--text-dim)', marginTop: '10px' }}>
                Go to a course page and click "Add Module" to create one!
              </p>
            )}
          </div>
        ) : (
          <div className={classes.grid}>
            {modules.map((m) => {
              const isEnrolled = enrolled.includes(m.id_module);

              return (
                <div key={m.id_module} className={classes.card}>
                  <h2>{m.id_module}</h2>
                  <p>{m.name}</p>
                  {m.course_id && (
                    <small style={{ color: 'var(--text-dim)' }}>
                      Course ID: {m.course_id}
                    </small>
                  )}

                  <button className={`${classes.btn} ${isEnrolled ? classes.unenroll : classes.enroll}`}
                    onClick={() => toggleEnrollment(m.id_module)}
                  >
                    {isEnrolled ? "Unenroll" : "Enroll"}
                  </button>
                  <button className={classes.enterBtn} onClick={() => router.push(`/modules/${m.id_module}`)}>
                    Enter
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
