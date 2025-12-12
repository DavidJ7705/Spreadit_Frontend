import { useState } from "react";
import { useRouter } from "next/router";
import classes from "../styles/auth.module.css";
import PasswordInput from "../components/PasswordInput";
import { USER_API } from "../config/api";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [year, setYear] = useState("1");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignup(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name,
        username,
        email,
        password,
        year: parseInt(year)
      };

      const res = await fetch(USER_API.SIGN_UP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const createdUser = await res.json();

        // Store in localStorage
        localStorage.setItem('userId', createdUser.id.toString());
        localStorage.setItem('userEmail', createdUser.email);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('isAdmin', createdUser.is_admin ? 'true' : 'false');

        router.push("/");
      } else {
        const data = await res.json();
        setError(data.detail || "Signup failed. Please try again.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Connection error. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={classes.authWrapper}>
      <div className={classes.authCard}>
        <div className={classes.logoSection}>
          <h1 className={classes.logo}>SPREADIT</h1>
          <p className={classes.tagline}>Join the community today</p>
        </div>

        <form onSubmit={handleSignup} className={classes.authForm}>
          <h2 className={classes.formTitle}>Create Account</h2>

          {error && <div className={classes.error}>{error}</div>}

          <div className={classes.inputGroup}>
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className={classes.inputGroup}>
            <label>Username</label>
            <input
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          <div className={classes.inputGroup}>
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={classes.inputGroup}>
            <label>Year</label>
            <select
              value={year}
              onChange={e => setYear(e.target.value)}
              required
            >
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
              <option value="4">Year 4</option>
            </select>
          </div>

          <PasswordInput
            label="Password"
            placeholder="Create a password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className={classes.inputGroup}
          />

          <PasswordInput
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            className={classes.inputGroup}
          />

          <button
            type="submit"
            className={classes.submitBtn}
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className={classes.switchAuth}>
          <p>Already have an account?</p>
          <button onClick={() => router.push("/login")}>
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
