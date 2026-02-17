import React from 'react';
import styles from '../styles/hero.module.css';

const Hero = () => {
  return (
    <section className={styles.heroContainer}>
      <div className={styles.backgroundEffect}></div>
      
      <div className={styles.content}>
        <div className={styles.badge}>
          <span>🚀 Join 500+ campus hubs</span>
        </div>

        <h1 className={styles.title}>
          The Place Where <br />
          <span className={styles.highlight}>Students Build Together</span>
        </h1>
        
        <p className={styles.subtitle}>
          Stop building in isolation. Join your college thread to find collaborators 
          for personal projects, startups, research, or competitions. 
          Your campus network is your greatest resource—use it.
        </p>

        <div className={styles.actionArea}>
          <div className={styles.searchWrapper}>
            <span className={styles.slash}>/</span>
            <input 
              type="text" 
              placeholder="Enter your college (e.g. iitb, mit)" 
              className={styles.searchInput}
            />
            <button className={styles.joinButton}>Find My Thread</button>
          </div>
          
          <div className={styles.secondaryActions}>
            <button className={styles.getStartedButton}>
              Getting Started
            </button>
          </div>
        </div>

        <div className={styles.stats}>
          <div className={styles.statItem}>
            <strong>500+</strong>
            <span>Active Campuses</span>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <strong>10k+</strong>
            <span>Student Builders</span>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <strong>3k+</strong>
            <span>Projects Launched</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;