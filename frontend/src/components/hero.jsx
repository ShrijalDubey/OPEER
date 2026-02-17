import React from 'react';
import styles from '../styles/hero.module.css';

const Hero = () => {
  return (
    <section className={styles.heroContainer}>
      <div className={styles.backgroundEffect}></div>
      
      <div className={styles.content}>
        <div className={styles.badge}>
          <span>🚀 beta is now live!</span>
        </div>

        <h1 className={styles.title}>
          Find Your Next <br />
          <span className={styles.highlight}>Hackathon Dream Team</span>
        </h1>
        
        <p className={styles.subtitle}>
          The ultimate collaboration hub for students. Join your college thread, 
          pitch your personal projects, and connect with the perfect teammates 
          to build something amazing.
        </p>

        <div className={styles.actionArea}>
          <div className={styles.searchWrapper}>
            <span className={styles.slash}>/</span>
            <input 
              type="text" 
              placeholder="Enter your college (e.g. iitb, nitw)" 
              className={styles.searchInput}
            />
            <button className={styles.joinButton}>Join Hub</button>
          </div>
          
          <div className={styles.secondaryActions}>
            <span className={styles.orText}>or</span>
            <button className={styles.postButton}>
              Post a Project
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
            <span>Students Building</span>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <strong>3k+</strong>
            <span>Projects Shipped</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;