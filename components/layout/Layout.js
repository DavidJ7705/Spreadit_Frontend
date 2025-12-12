import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MainNavigation from './MainNavigation';
import classes from './Layout.module.css';

function Layout(props) {
  const router = useRouter();
  const [theme, setTheme] = useState("dark");
  const [showNav, setShowNav] = useState(false);

  // Pages that should not show navbar
  const authPages = ["/login", "/signup"];
  const isAuthPage = authPages.includes(router.pathname);

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "dark";
    setTheme(saved);
    document.body.setAttribute("data-theme", saved);
  }, []);

  useEffect(() => {
    if (!isAuthPage) {
      const fromLogin = sessionStorage.getItem('fromLogin');
      if (fromLogin) {
        setTimeout(() => setShowNav(true), 1200);
      } else {
        setShowNav(true);
      }
    }
  }, [isAuthPage]);

  function toggleTheme() {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.body.setAttribute("data-theme", newTheme);
  }

  // For auth pages, render without navbar
  if (isAuthPage) {
    return (
      <>
        <div className="spreadit-bg">SPREADIT</div>
        <main className={classes.main}>{props.children}</main>
      </>
    );
  }

  return (
    <>
      <div className="spreadit-bg-universal">SPREADIT</div>

      {showNav && <MainNavigation onToggleTheme={toggleTheme} theme={theme} />}
      {/* Render without .main wrapper for Home and Module Details (full width layouts) */}
      {router.pathname === "/" || router.pathname === "/modules/[id]" ? (
        <>{props.children}</>
      ) : (
        <main className={classes.main}>{props.children}</main>
      )}
    </>
  );
}

export default Layout;
