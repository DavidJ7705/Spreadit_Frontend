import { useRef } from "react";
import Card from "../ui/Card";
import classes from "../posts/NewPostForm.module.css";

function NewModuleForm(props) {
  const { courseId, courseName } = props;
  const idModuleRef = useRef();
  const nameRef = useRef();

  function submitHandler(event) {
    event.preventDefault();

    const moduleData = {
      id_module: idModuleRef.current.value,
      name: nameRef.current.value,
      course_id: courseId, // Always from the course page
    };

    props.onAddModule(moduleData);
  }

  return (
    <Card>
      <form className={classes.form} onSubmit={submitHandler}>
        {/* Show which course this module will be added to */}
        {courseName && (
          <div className={classes.control}>
            <label>Course</label>
            <div style={{
              padding: "14px",
              borderRadius: "12px",
              border: "1px solid var(--border-soft)",
              background: "var(--input-bg-disabled, #f5f5f5)",
              color: "var(--text)",
              fontSize: "15px"
            }}>
              {courseName}
            </div>
          </div>
        )}

        <div className={classes.control}>
          <label htmlFor="id_module">Module ID (4 digits)</label>
          <input
            type="number"
            required
            id="id_module"
            ref={idModuleRef}
            min="1000"
            max="9999"
            placeholder="e.g. 2001"
          />
        </div>

        <div className={classes.control}>
          <label htmlFor="name">Module Name</label>
          <input type="text" required id="name" ref={nameRef} placeholder="e.g. Introduction to Programming" />
        </div>

        <div className={classes.actions}>
          <button>Add Module</button>
        </div>
      </form>
    </Card>
  );
}

export default NewModuleForm;
