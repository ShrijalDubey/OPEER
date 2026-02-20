import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './Hero.module.css';

const Hero = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleFindThread = () => {
    if (searchTerm.trim()) {
      navigate('/join-thread', { state: { query: searchTerm } });
    } else {
      navigate('/join-thread');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleFindThread();
    }
  };

  return (
    <section className={styles.heroSection}>

      {/* Background Decor */}
      <div className={styles.gridBackground}></div>
      <div className={styles.spotlight}></div>

      {/* Static Prism Wrapper (No Tilt) */}
      <div className={styles.prismWrapper}>
        <motion.div
          className={styles.prismCard}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Decorative Corner Accents */}
          <div className={`${styles.corner} ${styles.tl}`}></div>
          <div className={`${styles.corner} ${styles.tr}`}></div>
          <div className={`${styles.corner} ${styles.bl}`}></div>
          <div className={`${styles.corner} ${styles.br}`}></div>

          <div className={styles.contentInner}>
            <div className={styles.tagline}>
              <span className={styles.pulseDot}></span>
              The Student Builder Network
            </div>

            <h1 className={styles.prismTitle}>
              Connect with the Best <br />
              <span className={styles.gradientText}>Builders on your Campus.</span>
            </h1>

            <div className={styles.searchBlock}>
              <div className={styles.inputContainer}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  placeholder="Find your college thread..."
                  className={styles.prismInput}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
              </div>
              <button className={styles.actionBtn} onClick={handleFindThread}>
                Join Now <span className={styles.arrow}>→</span>
              </button>
            </div>

            <div className={styles.statsRow}>
              <div className={styles.statItem}>
                <strong>160+</strong>
                <span>Universities</span>
              </div>
              <div className={styles.divider}></div>
              <div className={styles.statItem}>
                <strong>1k+</strong>
                <span>Projects</span>
              </div>
              <div className={styles.divider}></div>
              <div className={styles.statItem}>
                <strong>Free</strong>
                <span>For Students</span>
              </div>
            </div>

          </div>
        </motion.div>
      </div>

    </section>
  );
};

export default Hero;