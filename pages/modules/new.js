import NewModuleForm from "../../components/modules/NewModuleForm";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import BackButton from "../../components/ui/BackButton";

function NewModulePage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [courseId, setCourseId] = useState(null);
  const [courseName, setCourseName] = useState(null);

  useEffect(() => {
    // Check admin status from localStorage
    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(adminStatus);
    setLoading(false);
  }, []);

  // Wait for router to be ready before reading query params
  useEffect(() => {
    if (router.isReady && router.query.courseId) {
      setCourseId(router.query.courseId);
      // Load course name
      fetch(`http://localhost:8002/api/get-all-courses`)
        .then(res => res.json())
        .then(data => {
          const course = data.find(c => c.id === parseInt(router.query.courseId));
          if (course) setCourseName(course.course_name);
        })
        .catch(() => { });
    }
  }, [router.isReady, router.query.courseId]);

  async function addModuleHandler(moduleData) {
    try {
      const idModuleInt = parseInt(moduleData.id_module);
      const courseIdRaw = courseId || moduleData.course_id;
      const courseIdInt = parseInt(courseIdRaw);

      if (isNaN(idModuleInt)) {
        alert("Please enter a valid numeric Module ID.");
        return;
      }

      if (idModuleInt < 1000 || idModuleInt > 9999) {
        alert("Module ID must be a 4-digit number (1000-9999).");
        return;
      }

      if (isNaN(courseIdInt)) {
        alert("Missing or invalid Course ID. Please try navigating from the Courses page again.");
        console.error("Invalid courseId:", courseIdRaw);
        return;
      }

      // Module API expects id_module, name, and course_id
      const payload = {
        id_module: idModuleInt,
        name: moduleData.name,
        course_id: courseIdInt
      };

      const res = await fetch("http://localhost:8003/api/module", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Navigate back to course if courseId was provided, else modules list
        if (courseId) {
          router.push(`/courses/${courseId}`);
        } else {
          router.push("/modules");
        }
      } else {
        const error = await res.json();
        // Handle different error formats
        let errorMsg = 'Unknown error';
        if (typeof error.detail === 'string') {
          errorMsg = error.detail;
        } else if (Array.isArray(error.detail)) {
          errorMsg = error.detail.map(e => e.msg || JSON.stringify(e)).join(', ');
        } else if (error.detail) {
          errorMsg = JSON.stringify(error.detail);
        }
        alert(`Failed to create module: ${errorMsg}`);
      }
    } catch (err) {
      alert("Network error: " + err.message);
    }
  }

  if (loading) return <p>Loading...</p>;
  if (!isAdmin) return <p>Access Denied - Admin only</p>;

  // Redirect if no course ID - modules must be created through a course
  if (!courseId) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Modules must be created from a course page.</p>
        <button
          onClick={() => router.push('/courses')}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Go to Courses
        </button>
      </div>
    );
  }

  return (
    <div>
      <BackButton />
      {courseName && (
        <p style={{
          textAlign: "center",
          color: "var(--text)",
          marginTop: "120px",
          marginBottom: "-80px",
          fontSize: "14px"
        }}>
          Adding module to: <strong>{courseName}</strong>
        </p>
      )}
      <NewModuleForm
        onAddModule={addModuleHandler}
        courseId={courseId}
        courseName={courseName}
      />
    </div>
  );
}

export default NewModulePage;


