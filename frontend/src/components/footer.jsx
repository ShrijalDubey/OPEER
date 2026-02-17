import React from 'react';
import styles from '../styles/footer.module.css';
import logo from '../assets/logo.png';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brandSide}>
          <img src={logo} alt="Opeer" className={styles.logo} />
          <p>The decentralized campus for modern student collaboration.</p>
        </div>
        
        <div className={styles.linksSide}>
          <div className={styles.column}>
            <span>Product</span>
            <a href="#features">Features</a>
            <a href="#threads">Threads</a>
            <a href="#showcase">Showcase</a>
          </div>
          <div className={styles.column}>
            <span>Community</span>
            <a href="https://github.com/ShrijalDubey">GitHub</a>
            <a href="#discord">Discord</a>
            <a href="#contribute">Contribute</a>
          </div>
          <div className={styles.column}>
            <span>Legal</span>
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
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