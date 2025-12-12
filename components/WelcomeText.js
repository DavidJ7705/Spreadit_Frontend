import { useEffect, useState } from 'react';
import classes from './WelcomeText.module.css';

export default function WelcomeText({ username, isLoginPage = false, fadeOut = false }) {
  const [animating, setAnimating] = useState(false);
  const [showUsername, setShowUsername] = useState(false);

  useEffect(() => {
    if (fadeOut && isLoginPage) {
      setAnimating(true);
    }
  }, [fadeOut, isLoginPage]);

  useEffect(() => {
    if (!isLoginPage) {
      const fromLogin = sessionStorage.getItem('fromLogin');
      if (fromLogin) {
        sessionStorage.removeItem('fromLogin');
        setTimeout(() => setShowUsername(true), 1050);
      } else {
        setShowUsername(true);
      }
    }
  }, [isLoginPage]);

  const positionClass = animating ? classes.transitioning : (!isLoginPage ? classes.homePosition : classes.loginPosition);

  return (
    <div className={`${classes.welcomeText} ${positionClass}`}>
      <h2 className={classes.text}>
        Welcome back{showUsername && <>, <span className={classes.username}>{username || 'User'}</span> 👋</>}
      </h2>
      {showUsername && <p className={classes.subtitle}>Your dashboard is ready. Explore posts and modules.</p>}
    </div>
  );
}
