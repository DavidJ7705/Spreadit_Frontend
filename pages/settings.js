import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import classes from "../styles/settings.module.css";
import BackButton from '../components/ui/BackButton';

export default function SettingsPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Appearance settings
    const [theme, setTheme] = useState("dark");
    const [accentColor, setAccentColor] = useState("#ff0055");
    const [fontSize, setFontSize] = useState("medium");
    const [backgroundGradient, setBackgroundGradient] = useState("aurora");

    const accentColors = [
        { name: "Pink", value: "#ff0055" },
        { name: "Purple", value: "#a855f7" },
        { name: "Blue", value: "#3b82f6" },
        { name: "Cyan", value: "#06b6d4" },
        { name: "Green", value: "#10b981" },
        { name: "Orange", value: "#f97316" },
        { name: "Red", value: "#ef4444" },
    ];

    const gradientOptions = [
        {
            name: "Aurora",
            value: "aurora",
            gradient: "radial-gradient(circle at 50% 50%, rgba(255, 0, 85, 0.15) 0%, rgba(100, 0, 255, 0.15) 40%, rgba(0, 0, 0, 0) 70%)"
        },
        {
            name: "Ocean",
            value: "ocean",
            gradient: "radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.15) 0%, rgba(59, 130, 246, 0.15) 40%, rgba(0, 0, 0, 0) 70%)"
        },
        {
            name: "Sunset",
            value: "sunset",
            gradient: "radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.15) 0%, rgba(239, 68, 68, 0.15) 40%, rgba(0, 0, 0, 0) 70%)"
        },
        {
            name: "Forest",
            value: "forest",
            gradient: "radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 40%, rgba(0, 0, 0, 0) 70%)"
        },
        {
            name: "Purple Haze",
            value: "purple",
            gradient: "radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.15) 0%, rgba(147, 51, 234, 0.15) 40%, rgba(0, 0, 0, 0) 70%)"
        },
        {
            name: "None",
            value: "none",
            gradient: "none"
        },
    ];

    useEffect(() => {
        loadProfile();
    }, []);

    // Load appearance settings when email is available
    useEffect(() => {
        if (email) {
            loadAppearanceSettings();
        }
    }, [email]);

    function loadAppearanceSettings() {
        // Load from localStorage (unique per user based on email)
        const savedTheme = localStorage.getItem(`theme_${email}`) || "dark";
        const savedAccent = localStorage.getItem(`accent_${email}`) || "#ff0055";
        const savedFontSize = localStorage.getItem(`fontSize_${email}`) || "medium";
        const savedGradient = localStorage.getItem(`gradient_${email}`) || "aurora";

        setTheme(savedTheme);
        setAccentColor(savedAccent);
        setFontSize(savedFontSize);
        setBackgroundGradient(savedGradient);

        applyAppearanceSettings(savedTheme, savedAccent, savedFontSize, savedGradient);
    }

    function applyAppearanceSettings(themeValue, accentValue, fontSizeValue, gradientValue) {
        // Apply theme
        document.body.setAttribute("data-theme", themeValue);

        // Convert hex to rgba for glow effect
        const hexToRgba = (hex, alpha) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        // Apply accent color to body element directly (higher specificity)
        document.body.style.setProperty("--accent", accentValue);
        document.body.style.setProperty("--accent-glow", hexToRgba(accentValue, themeValue === "light" ? 0.2 : 0.6));
        document.body.style.setProperty("--input-focus", accentValue);

        // Apply font size to body and html
        const fontSizes = {
            small: "14px",
            medium: "16px",
            large: "18px",
        };
        const selectedSize = fontSizes[fontSizeValue];
        document.documentElement.style.fontSize = selectedSize;
        document.body.style.fontSize = selectedSize;

        // Apply background gradient
        const gradient = gradientOptions.find(g => g.value === gradientValue);
        const beforeElement = document.querySelector('body::before') || document.body;

        if (gradient && gradient.gradient !== "none") {
            document.body.style.setProperty("--bg-gradient", gradient.gradient);
            // Update the pseudo-element through a style tag
            let styleTag = document.getElementById('custom-gradient-style');
            if (!styleTag) {
                styleTag = document.createElement('style');
                styleTag.id = 'custom-gradient-style';
                document.head.appendChild(styleTag);
            }
            styleTag.textContent = `
                body::before {
                    background: ${gradient.gradient} !important;
                }
            `;
        } else {
            // Remove gradient
            const styleTag = document.getElementById('custom-gradient-style');
            if (styleTag) {
                styleTag.textContent = `
                    body::before {
                        background: none !important;
                    }
                `;
            }
        }
    }

    function handleThemeChange(newTheme) {
        setTheme(newTheme);
        localStorage.setItem(`theme_${email}`, newTheme);
        applyAppearanceSettings(newTheme, accentColor, fontSize, backgroundGradient);
        setMessage({ type: "success", text: "Theme updated!" });
    }

    function handleAccentChange(newAccent) {
        setAccentColor(newAccent);
        localStorage.setItem(`accent_${email}`, newAccent);
        applyAppearanceSettings(theme, newAccent, fontSize, backgroundGradient);
        setMessage({ type: "success", text: "Accent color updated!" });
    }

    function handleFontSizeChange(newSize) {
        setFontSize(newSize);
        localStorage.setItem(`fontSize_${email}`, newSize);
        applyAppearanceSettings(theme, accentColor, newSize, backgroundGradient);
        setMessage({ type: "success", text: "Font size updated!" });
    }

    function handleGradientChange(newGradient) {
        setBackgroundGradient(newGradient);
        localStorage.setItem(`gradient_${email}`, newGradient);
        applyAppearanceSettings(theme, accentColor, fontSize, newGradient);
        setMessage({ type: "success", text: "Background gradient updated!" });
    }

    function loadProfile() {
        // Get email from localStorage
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
            router.push("/login");
            return;
        }
        setEmail(userEmail);
        setNewEmail(userEmail);
    }

    async function handleUpdateEmail(e) {
        e.preventDefault();
        setMessage({ type: "error", text: "Email update is not yet implemented in the backend." });
        // TODO: Implement when backend supports profile updates
    }

    async function handleUpdatePassword(e) {
        e.preventDefault();
        setMessage({ type: "error", text: "Password update is not yet implemented in the backend." });
        // TODO: Implement when backend supports profile updates
    }

    function handleLogout() {
        // Clear localStorage
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userId');
        localStorage.removeItem('isAuthenticated');
        router.push("/login");
    }

    return (
        <div className={classes.wrapper}>
            <BackButton />
            <div className={classes.container}>
                <h1 className={classes.title}>Settings</h1>
                <p className={classes.subtitle}>Manage your account security</p>

                {message.text && (
                    <div className={`${classes.message} ${classes[message.type]}`}>
                        {message.text}
                    </div>
                )}

                {/* Email Section */}
                <div className={classes.section}>
                    <h2 className={classes.sectionTitle}>Email Address</h2>
                    <form onSubmit={handleUpdateEmail} className={classes.form}>
                        <div className={classes.inputGroup}>
                            <label>Current Email</label>
                            <input
                                type="email"
                                value={email}
                                disabled
                                className={classes.disabledInput}
                            />
                        </div>
                        <div className={classes.inputGroup}>
                            <label>New Email</label>
                            <input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="Enter new email"
                            />
                        </div>
                        <button type="submit" className={classes.updateBtn} disabled={loading}>
                            {loading ? "Updating..." : "Update Email"}
                        </button>
                    </form>
                </div>

                {/* Password Section */}
                <div className={classes.section}>
                    <h2 className={classes.sectionTitle}>Change Password</h2>
                    <form onSubmit={handleUpdatePassword} className={classes.form}>
                        <div className={classes.inputGroup}>
                            <label>New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                            />
                        </div>
                        <div className={classes.inputGroup}>
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                            />
                        </div>
                        <button type="submit" className={classes.updateBtn} disabled={loading}>
                            {loading ? "Updating..." : "Update Password"}
                        </button>
                    </form>
                </div>

                {/* Appearance Section */}
                <div className={classes.section}>
                    <h2 className={classes.sectionTitle}>Appearance</h2>
                    <p className={classes.sectionDesc}>Customize how your website looks</p>

                    {/* Theme Selection */}
                    <div className={classes.appearanceGroup}>
                        <label className={classes.appearanceLabel}>Theme</label>
                        <div className={classes.themeButtons}>
                            <button
                                className={`${classes.themeBtn} ${theme === "dark" ? classes.active : ""}`}
                                onClick={() => handleThemeChange("dark")}
                            >
                                🌙 Dark
                            </button>
                            <button
                                className={`${classes.themeBtn} ${theme === "light" ? classes.active : ""}`}
                                onClick={() => handleThemeChange("light")}
                            >
                                ☀️ Light
                            </button>
                        </div>
                    </div>

                    {/* Accent Color */}
                    <div className={classes.appearanceGroup}>
                        <label className={classes.appearanceLabel}>Accent Color</label>
                        <div className={classes.colorGrid}>
                            {accentColors.map((color) => (
                                <button
                                    key={color.value}
                                    className={`${classes.colorBtn} ${accentColor === color.value ? classes.activeColor : ""}`}
                                    style={{ backgroundColor: color.value }}
                                    onClick={() => handleAccentChange(color.value)}
                                    title={color.name}
                                >
                                    {accentColor === color.value && "✓"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Font Size */}
                    <div className={classes.appearanceGroup}>
                        <label className={classes.appearanceLabel}>Font Size</label>
                        <div className={classes.fontSizeButtons}>
                            <button
                                className={`${classes.fontSizeBtn} ${fontSize === "small" ? classes.active : ""}`}
                                onClick={() => handleFontSizeChange("small")}
                            >
                                A
                            </button>
                            <button
                                className={`${classes.fontSizeBtn} ${classes.medium} ${fontSize === "medium" ? classes.active : ""}`}
                                onClick={() => handleFontSizeChange("medium")}
                            >
                                A
                            </button>
                            <button
                                className={`${classes.fontSizeBtn} ${classes.large} ${fontSize === "large" ? classes.active : ""}`}
                                onClick={() => handleFontSizeChange("large")}
                            >
                                A
                            </button>
                        </div>
                    </div>

                    {/* Background Gradient */}
                    <div className={classes.appearanceGroup}>
                        <label className={classes.appearanceLabel}>Background Gradient</label>
                        <div className={classes.gradientGrid}>
                            {gradientOptions.map((grad) => (
                                <button
                                    key={grad.value}
                                    className={`${classes.gradientBtn} ${backgroundGradient === grad.value ? classes.activeGradient : ""}`}
                                    onClick={() => handleGradientChange(grad.value)}
                                    title={grad.name}
                                >
                                    <div
                                        className={classes.gradientPreview}
                                        style={{ background: grad.gradient !== "none" ? grad.gradient : "#1a1a1a" }}
                                    >
                                        {grad.value === "none" && <span style={{ fontSize: "20px" }}>∅</span>}
                                    </div>
                                    <span className={classes.gradientName}>{grad.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Logout Section */}
                <div className={classes.section}>
                    <h2 className={classes.sectionTitle}>Session</h2>
                    <p className={classes.sectionDesc}>Sign out of your account on this device.</p>
                    <button
                        className={classes.logoutBtn}
                        onClick={() => setShowLogoutConfirm(true)}
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className={classes.modalOverlay} onClick={() => setShowLogoutConfirm(false)}>
                    <div className={classes.modal} onClick={(e) => e.stopPropagation()}>
                        <h3>Are you sure?</h3>
                        <p>Do you really want to log out?</p>
                        <div className={classes.modalButtons}>
                            <button
                                className={classes.cancelBtn}
                                onClick={() => setShowLogoutConfirm(false)}
                            >
                                Cancel
                            </button>
                            <button className={classes.confirmBtn} onClick={handleLogout}>
                                Yes, Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
