import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';
import logo from '../assets/logo.png';

const Footer = () => {
  return (
    <footer className={styles.footer} id="contact">
      <div className={styles.container}>
        <div className={styles.brandSide}>
          {/* <img src={logo} alt="Opeer" className={styles.logo} /> */}
          <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: '800', marginBottom: '16px', letterSpacing: '1px' }}>OPEER</h2>
          <p>The decentralized campus for modern student collaboration.</p>
        </div>

        <div className={styles.linksSide}>
          <div className={styles.column}>
            <span>Explore</span>
            <Link to="/">Home</Link>
            <Link to="/projects">Projects</Link>
            <Link to="/join-thread">Threads</Link>
          </div>
          <div className={styles.column}>
            <span>Contribute</span>
            <Link to="/upload">Upload Project</Link>
            <Link to="/join-project">Join a Team</Link>
            <a href="https://github.com/ShrijalDubey/OPEER" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
          <div className={styles.column}>
            <span>Support</span>
            <a href="https://github.com/ShrijalDubey/OPEER/issues" target="_blank" rel="noopener noreferrer" style={{ color: '#ef4444' }}>Report a Bug</a>
            <a href="mailto:contact@opeer.com">Contact Us</a>
          </div>
        </div>
      </div>
      <div className={styles.bottomBar}>
        <p>© 2026 OPEER. Built by students, for students.</p>
      </div>
    </footer>
  );
};

export default Footer;