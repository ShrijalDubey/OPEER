import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';
import LoginModal from './LoginModal';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { user, isLoggedIn, loading, logout } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: "Home", link: "/", type: "page" },
    { label: "Getting started", link: "/#features", type: "scroll" },
    { label: "Join a Thread", link: "/join-thread", type: "page" },
    { label: "Join a Project", link: "/join-project", type: "page" },
    { label: "Explore", link: "/explore", type: "page" },
    { label: "Projects", link: "/projects", type: "page" },
    { label: "Upload Project", link: "/upload", type: "page" },
    { label: "Contribute", link: "https://github.com/ShrijalDubey/OPEER/tree/main", type: "external" },
    { label: "Contact Us", link: "#contact", type: "scroll" }
  ];

  // Handling navigation clicks - some are pages, some are sections to scroll to, and one is external!
  const handleNavigation = (e, item) => {
    e.preventDefault();

    // If it's a link to outside (like GitHub), notify the browser to open a new tab
    if (item.type === "external") {
      window.open(item.link, '_blank', 'noopener,noreferrer');
      return;
    }

    // Standard internal page route
    if (item.type === "page") {
      navigate(item.link);
      return;
    }

    // Smooth scrolling to sections on the landing page
    if (item.type === "scroll") {
      const targetId = item.link.replace('/#', '').replace('#', '');

      // If we're already home, just scroll there
      if (location.pathname === '/') {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // Otherwise, go home first, wait a split second, then scroll
        navigate('/');
        setTimeout(() => {
          const element = document.getElementById(targetId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    }
  };

  // Clicking the logo should take you to the top if you're home, or go home if you're not
  const handleLogoClick = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.topSection}>
          <div className={styles.brand} onClick={handleLogoClick}>
            <span className={styles.logoText}>OPEER</span>
          </div>

          <div className={styles.topRight}>
            <a href="https://github.com/ShrijalDubey/OPEER" target="_blank" rel="noopener noreferrer" className={styles.githubWrapper}>
              <svg viewBox="0 0 24 24" className={styles.githubIcon} fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.744.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
            </a>

            {/* Notification Bell (Only if logged in) */}
            {!loading && isLoggedIn && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <NotificationDropdown />
              </div>
            )}

            {!loading && (
              isLoggedIn ? (
                <div className={styles.userSection}>
                  <div className={styles.userAvatar} onClick={() => navigate('/profile')}>
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className={styles.avatarImg} />
                    ) : (
                      <span>{user.name?.charAt(0)?.toUpperCase()}</span>
                    )}
                  </div>
                  <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
                </div>
              ) : (
                <button className={styles.loginBtn} onClick={() => setIsLoginOpen(true)}>Login</button>
              )
            )}
          </div>
        </div>

        <nav className={styles.bottomSection}>
          <ul className={styles.navLinks}>
            {navItems.map((item, index) => (
              <li key={index}>
                <a
                  href={item.link}
                  className={styles.navLink}
                  onClick={(e) => handleNavigation(e, item)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header >

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
};

export default Navbar;