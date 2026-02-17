import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import hooks
import styles from './Navbar.module.css';
import logo from '../assets/logo.png'; 
import LoginModal from './LoginModal';

const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  
  const location = useLocation(); // Get current page
  const navigate = useNavigate(); // Function to change pages

 const navItems = [
  { label: "Home", link: "/", type: "page" },
  { label: "Getting started", link: "/#features", type: "scroll" }, 
  { label: "Join a Thread", link: "/join-thread", type: "page" },
  { label: "Join a Project", link: "/join-project", type: "page" }, // New link added
  { label: "Upload Project", link: "/#features", type: "scroll" }, 
  { label: "Contribute", link: "https://github.com/ShrijalDubey/OPEER/tree/main", type: "external" },
  { label: "Contact Us", link: "#contact", type: "scroll" } 
];

  const handleNavigation = (e, item) => {
    e.preventDefault();

    // 1. External Links
    if (item.type === "external") {
      window.open(item.link, '_blank', 'noopener,noreferrer');
      return;
    }

    // 2. Page Navigation (e.g., Join a Thread)
    if (item.type === "page") {
      navigate(item.link);
      return;
    }

    // 3. Scroll Links (e.g., Getting Started)
    if (item.type === "scroll") {
      // Extract the ID (e.g., "/#features" -> "features")
      const targetId = item.link.replace('/#', '').replace('#', '');
      
      // Check if we are already on the Home page
      if (location.pathname === '/') {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // If we are NOT on home, navigate home first, then scroll
        navigate('/');
        // Use a small timeout to allow the page to load before scrolling
        setTimeout(() => {
          const element = document.getElementById(targetId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    }
  };

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.topSection}>
          <div className={styles.brand} onClick={handleLogoClick}>
            <img src={logo} alt="OPEER Logo" className={styles.logoImage} />
          </div>

          <div className={styles.topRight}>
            <div className={styles.toggleSwitch}>
              <input 
                type="checkbox" 
                id="theme-toggle" 
                className={styles.toggleInput} 
                checked={isDarkMode}
                onChange={() => setIsDarkMode(!isDarkMode)}
              />
              <label htmlFor="theme-toggle" className={styles.toggleLabel}>
                <div className={styles.toggleThumb}>
                  {isDarkMode ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                  )}
                </div>
              </label>
            </div>

            <a href="https://github.com/ShrijalDubey" target="_blank" rel="noopener noreferrer" className={styles.githubWrapper}>
              <svg viewBox="0 0 24 24" className={styles.githubIcon} fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.744.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
            </a>

            <button className={styles.loginBtn} onClick={() => setIsLoginOpen(true)}>Login</button>
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
      </header>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
};

export default Navbar;