import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './JoinProject.module.css';

const JoinProject = () => {
  const navigate = useNavigate();
  
  // States to simulate user data
  const [joinedThreads] = useState(['/iitb', '/mit-manipal']); // Empty array to test "No threads joined"
  const [selectedThread, setSelectedThread] = useState(null);

  const sampleProjects = [
    { id: 1, title: "AI Study Buddy", roles: "Frontend, Python", desc: "Building an LLM for campus curriculum." },
    { id: 2, title: "Campus RideShare", roles: "UI/UX, Flutter", desc: "Reducing cab costs for students." },
  ];

  // 1. View: No threads joined
  if (joinedThreads.length === 0) {
    return (
      <section className={styles.section} id="join-project">
        <div className={styles.container}>
          <div className={styles.emptyState}>
            <h2 className={styles.emptyTitle}>No Threads Joined Yet</h2>
            <p className={styles.emptyDesc}>
              You need to join a campus thread before you can browse projects. 
              Find your college and start collaborating.
            </p>
            <button className={styles.joinLink} onClick={() => navigate('/join')}>
              Go to Join Thread →
            </button>
          </div>
        </div>
      </section>
    );
  }

  // 2. View: Select a thread
  if (!selectedThread) {
    return (
      <section className={styles.section} id="join-project">
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.title}>Select a Thread</h2>
            <p className={styles.emptyDesc}>Choose one of your joined campuses to see active projects.</p>
          </div>
          <div className={styles.threadGrid}>
            {joinedThreads.map(thread => (
              <div key={thread} className={styles.threadChip} onClick={() => setSelectedThread(thread)}>
                {thread}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // 3. View: Browser projects in selected thread
  return (
    <section className={styles.section} id="join-project">
      <div className={styles.container}>
        <div className={styles.browserTop}>
          <button className={styles.backBtn} onClick={() => setSelectedThread(null)}>← Change Thread</button>
          <h3 style={{color: '#fff'}}>Projects in {selectedThread}</h3>
        </div>

        <div className={styles.projectGrid}>
          {sampleProjects.map(proj => (
            <div key={proj.id} className={styles.projectCard}>
              <span className={styles.tag}>Looking for {proj.roles}</span>
              <h4 style={{color: '#fff', fontSize: '20px', marginBottom: '8px'}}>{proj.title}</h4>
              <p style={{color: '#a1a1aa', fontSize: '14px', marginBottom: '20px'}}>{proj.desc}</p>
              <button className={styles.joinLink}>Apply to Project</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default JoinProject;