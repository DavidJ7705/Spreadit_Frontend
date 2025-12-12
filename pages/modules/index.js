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
    } catch (error) {
      console.error('Failed to load modules:', error);
      setModules([]);
    } finally {
      setLoading(false);
    }
  }

  function loadProfile() {
    // Backend doesn't track enrolled modules yet
    setEnrolled([]);
  }

  async function toggleEnrollment(moduleId) {
    alert("Enrollment is not yet implemented in the backend.");
    // TODO: Implement when backend supports enrollment
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
