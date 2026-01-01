import { useState } from "react";
import { useRouter } from "next/router";
import classes from "../styles/auth.module.css";
import PasswordInput from "../components/PasswordInput";
import WelcomeText from "../components/WelcomeText";
import { USER_API } from "../config/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Login with email and password
      const res = await fetch(USER_API.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        // Backend now returns { message, user_id, is_admin, access_token, token_type }
        const data = await res.json();

        // Store JWT token and user info in localStorage
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('token_type', data.token_type);
        localStorage.setItem('userId', data.user_id);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('isAdmin', data.is_admin ? 'true' : 'false');

        setFadeOut(true);
        setTimeout(() => router.push("/"), 1000);
      } else {
        const errorData = await res.json().catch(() => ({ detail: "Invalid email or password" }));
        setError(errorData.detail || "Invalid email or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Connection error. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>

      <WelcomeText isLoginPage={true} fadeOut={fadeOut} />
      <div className={`${classes.authWrapper} ${fadeOut ? classes.fadeOut : ''}`}>
        <div className={classes.authCard}>
          <div className={classes.logoSection}>
            <h1 className={classes.logo}>SPREADIT</h1>
            <p className={classes.tagline}>Share knowledge, spread ideas</p>
          </div>
          <form onSubmit={handleLogin} className={classes.authForm}>

            {error && <div className={classes.error}>{error}</div>}

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

            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className={classes.inputGroup}
            />

            <button
              type="submit"
              className={classes.submitBtn}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className={classes.switchAuth}>
            <p>Don't have an account?</p>
            <button onClick={() => router.push("/signup")}>
              Create Account
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
