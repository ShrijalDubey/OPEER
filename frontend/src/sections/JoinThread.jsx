import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './JoinThread.module.css';

const JoinThread = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Listen for the search term coming from the Hero section
  useEffect(() => {
    if (location.state && location.state.query) {
      setSearchTerm(location.state.query);
      
      // Clean up state so refreshing doesn't keep the search term forever
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const threads = [
    { id: 1, name: "iitb", members: "1.2k", online: "142", desc: "The hub for IIT Bombay researchers, founders, and builders." },
    { id: 2, name: "mit-manipal", members: "850", online: "64", desc: "Official thread for Manipal. Find hackathon teams here." },
    { id: 3, name: "bits-pilani", members: "2.1k", online: "310", desc: "Startups, Magic, and everything in between at BITS." },
    { id: 4, name: "dtu", members: "600", online: "45", desc: "Delhi Tech Univ projects, placement prep, and dev teams." },
    { id: 5, name: "stanford", members: "3.4k", online: "500", desc: "Global innovation hub. Find your next co-founder here." },
  ];

  const filteredThreads = threads.filter(thread => 
    thread.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thread.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className={styles.section} id="join-thread">
      <div className={styles.container}>
        
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Find Your <span className={styles.highlight}>Campus Hub</span></h2>
          <p className={styles.subtitle}>
            Connect with peers who are actually building things. <br/>
            Join a thread to start collaborating.
          </p>
        </div>

        {/* Search Input */}
        <div className={styles.searchWrapper}>
          <input 
            type="text" 
            className={styles.searchInput} 
            placeholder="Search for your college..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className={styles.searchIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        </div>

        {/* Grid */}
        <div className={styles.grid}>
          {filteredThreads.length > 0 ? (
            filteredThreads.map((thread) => (
              <div key={thread.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <h3 className={styles.threadName}>
                    <span>/</span>{thread.name}
                  </h3>
                  <div className={styles.statsBadge}>
                    <div className={styles.onlineDot}></div>
                    {thread.members}
                  </div>
                </div>
                
                <p className={styles.threadDesc}>{thread.desc}</p>
                
                <button className={styles.joinBtn}>
                  Join Thread 
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="M12 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            ))
          ) : (
            <div className={styles.noResults}>
              <p>No hubs found matching "{searchTerm}"</p>
            </div>
          )}

          {/* Create New Card */}
          <div className={`${styles.card} ${styles.createCard}`}>
            <div className={styles.plusIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            <h3 className={styles.createTitle}>Your college missing?</h3>
            <p className={styles.createDesc}>Create a new thread.</p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default JoinThread;