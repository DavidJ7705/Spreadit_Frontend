import { useState } from "react";
import { useRouter } from "next/router";
import classes from "../../components/modules/modulePage.module.css";

import BackButton from "../../components/ui/BackButton";
import Card from "../../components/ui/Card";

export default function NewCoursePage() {
    const router = useRouter();
    const [form, setForm] = useState({
        code: "",
        name: "",
        description: "",
        credits: 60,
        year: 1
    });
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        try {
            // Backend accepts alphanumeric course codes (2-10 chars)
            const payload = {
                course_id: form.code, // Send as-is (e.g., "CS101", "MATH201")
                course_name: form.name,
                description: form.description || "",
                enrolled_users: []
            };

            const res = await fetch("http://localhost:8002/api/add-course", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                router.push("/courses");
            } else {
                const data = await res.json();
                // Properly extract error message
                const errorMsg = typeof data.detail === 'string'
                    ? data.detail
                    : data.detail?.msg || data.message || "Failed to create course";
                setError(errorMsg);
            }
        } catch (err) {
            setError("Network error: " + err.message);
        }
    }

    return (
        <div className={classes.wrapper}>
            <BackButton />
            <div className={classes.page} style={{ maxWidth: "550px" }}>
                <Card>
                    <div style={{ padding: "20px" }}>
                        <h1 className={classes.title} style={{ marginBottom: "20px", textAlign: "center" }}>Create Course</h1>

                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <input
                                type="text"
                                placeholder="Course Code (e.g. CS101)"
                                value={form.code}
                                onChange={(e) => setForm({ ...form, code: e.target.value })}
                                required
                                style={{
                                    padding: "14px",
                                    borderRadius: "12px",
                                    border: "1px solid var(--border-soft)",
                                    background: "var(--input-bg)",
                                    color: "var(--text)",
                                    fontSize: "15px"
                                }}
                            />
                            <input
                                type="text"
                                placeholder="Course Name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                                style={{
                                    padding: "14px",
                                    borderRadius: "12px",
                                    border: "1px solid var(--border-soft)",
                                    background: "var(--input-bg)",
                                    color: "var(--text)",
                                    fontSize: "15px"
                                }}
                            />
                            <textarea
                                placeholder="Description (optional)"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                rows={3}
                                style={{
                                    padding: "14px",
                                    borderRadius: "12px",
                                    border: "1px solid var(--border-soft)",
                                    background: "var(--input-bg)",
                                    color: "var(--text)",
                                    fontSize: "15px",
                                    resize: "vertical"
                                }}
                            />
                            <input
                                type="number"
                                placeholder="Credits"
                                value={form.credits}
                                onChange={(e) => setForm({ ...form, credits: parseInt(e.target.value) || 0 })}
                                style={{
                                    padding: "14px",
                                    borderRadius: "12px",
                                    border: "1px solid var(--border-soft)",
                                    background: "var(--input-bg)",
                                    color: "var(--text)",
                                    fontSize: "15px"
                                }}
                            />
                            <select
                                value={form.year}
                                onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
                                style={{
                                    padding: "14px",
                                    borderRadius: "12px",
                                    border: "1px solid var(--border-soft)",
                                    background: "var(--input-bg)",
                                    color: "var(--text)",
                                    fontSize: "15px"
                                }}
                            >
                                <option value={1} style={{ color: "black" }}>Year 1</option>
                                <option value={2} style={{ color: "black" }}>Year 2</option>
                                <option value={3} style={{ color: "black" }}>Year 3</option>
                                <option value={4} style={{ color: "black" }}>Year 4</option>
                            </select>

                            {error && <p style={{ color: "#ff5f5f", textAlign: "center" }}>{error}</p>}

                            <button type="submit" className={classes.createBtn} style={{ width: "100%", padding: "14px", marginTop: "10px" }}>
                                Create Course
                            </button>
                        </form>
                    </div>
                </Card>
            </div>
        </div>
    );
}
