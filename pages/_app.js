import '../styles/globals.css'
import Layout from '../components/layout/Layout'
import { GlobalContextProvider } from './store/globalContext'
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  // Routes that do NOT require authentication
  const publicRoutes = ["/login", "/signup"];

  // Load appearance settings when user is authenticated
  useEffect(() => {
    if (authChecked && userEmail) {
      loadAppearanceSettings(userEmail);
    }
  }, [authChecked, userEmail]);

  function loadAppearanceSettings(email) {
    const savedTheme = localStorage.getItem(`theme_${email}`) || "dark";
    const savedAccent = localStorage.getItem(`accent_${email}`) || "#ff0055";
    const savedFontSize = localStorage.getItem(`fontSize_${email}`) || "medium";
    const savedGradient = localStorage.getItem(`gradient_${email}`) || "aurora";

    // Apply theme
    document.body.setAttribute("data-theme", savedTheme);

    // Convert hex to rgba for glow effect
    const hexToRgba = (hex, alpha) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // Apply accent color to body element directly (higher specificity than data-theme)
    document.body.style.setProperty("--accent", savedAccent);
    document.body.style.setProperty("--accent-glow", hexToRgba(savedAccent, savedTheme === "light" ? 0.2 : 0.6));
    document.body.style.setProperty("--input-focus", savedAccent);

    // Apply font size to both html and body
    const fontSizes = {
      small: "14px",
      medium: "16px",
      large: "18px",
    };
    const selectedSize = fontSizes[savedFontSize];
    document.documentElement.style.fontSize = selectedSize;
    document.body.style.fontSize = selectedSize;

    // Apply background gradient
    const gradientOptions = [
      {
        value: "aurora",
        gradient: "radial-gradient(circle at 50% 50%, rgba(255, 0, 85, 0.15) 0%, rgba(100, 0, 255, 0.15) 40%, rgba(0, 0, 0, 0) 70%)"
      },
      {
        value: "ocean",
        gradient: "radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.15) 0%, rgba(59, 130, 246, 0.15) 40%, rgba(0, 0, 0, 0) 70%)"
      },
      {
        value: "sunset",
        gradient: "radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.15) 0%, rgba(239, 68, 68, 0.15) 40%, rgba(0, 0, 0, 0) 70%)"
      },
      {
        value: "forest",
        gradient: "radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 40%, rgba(0, 0, 0, 0) 70%)"
      },
      {
        value: "purple",
        gradient: "radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.15) 0%, rgba(147, 51, 234, 0.15) 40%, rgba(0, 0, 0, 0) 70%)"
      },
      {
        value: "none",
        gradient: "none"
      },
    ];

    const gradient = gradientOptions.find(g => g.value === savedGradient);

    if (gradient && gradient.gradient !== "none") {
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

  useEffect(() => {
    // If it's a public page, skip auth check
    if (publicRoutes.includes(router.pathname)) {
      setAuthChecked(true);
      return;
    }

    // Check if user is authenticated via localStorage
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    const email = localStorage.getItem('userEmail');

    if (!isAuth || !email) {
      router.push("/login");
    } else {
      setAuthChecked(true);
      setUserEmail(email);
    }
  }, [router.pathname]);

  // Wait for auth check
  if (!authChecked) {
    return <p style={{ textAlign: "center", marginTop: "40px" }}>Checking authentication...</p>;
  }

  return (
    <GlobalContextProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </GlobalContextProvider>
  );
}

export default MyApp;
