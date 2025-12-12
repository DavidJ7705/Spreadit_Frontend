"use client";

import classes from './MainNavigation.module.css';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { BsMoon, BsSun } from "react-icons/bs";
import { IoIosMenu, IoIosClose, IoMdSettings } from 'react-icons/io';


function MainNavigation({ onToggleTheme, theme }) {
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);


  useEffect(() => {
    async function loadRole() {
      try {
        const res = await fetch("http://localhost:8001/auth/profile", {
          credentials: "include"
        });
        if (res.ok) {
          const data = await res.json();
          setRole(data.role);
        }
      } catch (err) { }
    }
    loadRole();

    function handleScroll() {
      setIsCollapsed(window.scrollY > 100);
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  function toggleMenu() {
    setMenuOpen((prev) => !prev);
  }

  function closeMenu() {
    setMenuOpen(false);
  }



  return (
    <>
      <header className={classes.header}>
        <nav className={classes.wrapper}>
          {/* Hamburger button - circular, always visible on desktop left of navbar */}
          <button
            className={`${classes.hamburger} ${isCollapsed && !isHovered ? classes.hamburgerCollapsed : ''}`}
            onClick={toggleMenu}
            aria-label="Open menu"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <IoIosMenu size={24} />
          </button>

          <div
            className={`${classes.navbar} ${isCollapsed && !isHovered ? classes.collapsed : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Link href="/your-courses">Your Courses</Link>
            <Link href="/your-modules">Your Modules</Link>
            <Link href="/">Home</Link>
            <Link href="/profile">Profile</Link>

            {/* Theme Toggle Restored */}
            <button className={classes.themeToggle} onClick={onToggleTheme}>
              {theme === "dark" ? <BsSun size={18} /> : <BsMoon size={18} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Overlay */}
      {menuOpen && <div className={classes.overlay} onClick={closeMenu}></div>}

      {/* Sidebar Drawer */}
      <aside className={`${classes.sidebar} ${menuOpen ? classes.sidebarOpen : ''}`}>
        <button className={classes.closeBtn} onClick={closeMenu} aria-label="Close menu">
          <IoIosClose size={32} />
        </button>
        <nav className={classes.sidebarNav}>
          <Link href="/courses" onClick={closeMenu}>All Courses</Link>
          <Link href="/your-courses" onClick={closeMenu}>Your Courses</Link>
          <Link href="/modules" onClick={closeMenu}>All Modules</Link>
          <Link href="/your-modules" onClick={closeMenu}>Your Modules</Link>
          <Link href="/" onClick={closeMenu}>Home</Link>
          <Link href="/new-post" onClick={closeMenu}>New Post</Link>
          <Link href="/profile" onClick={closeMenu}>Profile</Link>
          <button className={classes.themeToggle} onClick={onToggleTheme}>
            {theme === "dark" ? <BsSun size={18} /> : <BsMoon size={18} />}
          </button>
        </nav>
        <div className={classes.sidebarFooter}>
          <Link href="/settings" legacyBehavior>
            <a onClick={closeMenu} className={classes.settingsLink}>
              <IoMdSettings size={20} />
              <span>Settings</span>
            </a>
          </Link>
        </div>
      </aside>


    </>
  );
}

export default MainNavigation;

