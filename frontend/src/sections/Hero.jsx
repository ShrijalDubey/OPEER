import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Hero.module.css';

const Hero = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 1. Function to handle navigation to the Join page
  const handleFindThread = () => {
    if (searchTerm.trim()) {
      navigate('/join-thread', { state: { query: searchTerm } });
    } else {
      navigate('/join-thread');
    }
  };

  // 2. Function to listen for Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleFindThread();
    }
  };

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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown} // Trigger on Enter
            />
            <button 
              className={styles.joinButton} 
              onClick={handleFindThread} // Trigger on Click
            >
              Find My Thread
            </button>
          </div>
          
          <div className={styles.secondaryActions}>
            <button 
              className={styles.getStartedButton}
              onClick={scrollToFeatures}
            >
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