import React, { useState } from 'react';
import styles from './JoinProject.module.css';

const JoinProject = () => {
  const [selectedThread, setSelectedThread] = useState(null);

  // Data for the "Joined Hubs" Directory
  const myHubs = [
    { 
      id: 1, 
      name: "iitb", 
      description: "The official hub for IIT Bombay student developers, researchers, and campus startups.",
      members: "4,203", 
      projects: "24" 
    },
    { 
      id: 2, 
      name: "mit-manipal", 
      description: "Collaborative space for Manipal Institute of Technology builders. Hackathons, projects, and tech culture.",
      members: "1,850", 
      projects: "12" 
    },
    { 
      id: 3, 
      name: "stanford", 
      description: "Connecting Silicon Valley's brightest student minds for interdisciplinary research and commercial startups.",
      members: "8,920", 
      projects: "56" 
    }
  ];

  const projects = [
    {
      id: 1,
      title: "Decentralized Campus Identity",
      postedBy: "Shrijal Dubey",
      dept: "Software Engineering",
      year: "2nd Year+",
      date: "Feb 18, 2026",
      skills: ["Solidity", "React", "Ethers.js", "Hardhat"],
      desc: "We are building a blockchain-based ID system for the university to manage library access and mess credits without physical cards. Looking for secure-contract specialists."
    },
    {
      id: 2,
      title: "Autonomous Delivery Bot",
      postedBy: "Arjun Mehta",
      dept: "Robotics / AI",
      year: "Final Year",
      date: "Feb 17, 2026",
      skills: ["ROS2", "C++", "Python", "OpenCV"],
      desc: "Hardware project focused on last-mile delivery within the hostel area. Need a developer to optimize the pathfinding algorithms and SLAM integration."
    }
  ];

  // VIEW 1: JOINED HUBS DIRECTORY
  if (!selectedThread) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Your <span className={styles.highlight}>Joined Hubs</span></h1>
          </div>
          
          <div className={styles.directoryHeader}>
            <span>Campus Thread</span>
            <span>Description</span>
            <span>Members</span>
            <span>Active Projects</span>
            <span></span>
          </div>

          <div className={styles.hubList}>
            {myHubs.map(hub => (
              <div key={hub.id} className={styles.hubRow} onClick={() => setSelectedThread(hub.name)}>
                <span className={styles.hubName}>{hub.name}</span>
                <span className={styles.hubDescription} title={hub.description}>
                  {hub.description}
                </span>
                <span className={styles.hubStatText}>{hub.members}</span>
                <span className={styles.hubStatText}>{hub.projects}</span>
                <span style={{color: '#52525b', textAlign: 'right'}}>→</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // VIEW 2: PROJECT LISTINGS WITHIN A HUB
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px'}}>
          <button onClick={() => setSelectedThread(null)} style={{background: 'none', border: '1px solid #27272a', color: '#71717a', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer'}}>
            ← Back to Directory
          </button>
          <h2 style={{fontSize: '22px', fontWeight: '800'}}>Recruiting in <span className={styles.highlight}>/{selectedThread}</span></h2>
        </div>

        {projects.map(proj => (
          <div key={proj.id} className={styles.projectCard}>
            <div className={styles.content}>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px'}}>
                <div style={{width: '24px', height: '24px', borderRadius: '50%', background: '#818cf8', display: 'flex', alignItems: 'center', justifySelf: 'center', fontSize: '10px', fontWeight: 'bold', color: '#000', justifyContent: 'center'}}>{proj.postedBy[0]}</div>
                <span style={{fontSize: '13px', color: '#71717a'}}>Posted by <strong>{proj.postedBy}</strong></span>
              </div>
              
              <h2 className={styles.projectTitle}>{proj.title}</h2>
              <p style={{color: '#a1a1aa', lineHeight: '1.6', fontSize: '15px', marginBottom: '30px'}}>{proj.desc}</p>
              
              <span className={styles.skillsHeader}>Skills Required : </span>
              <div className={styles.skillContainer}>
                {proj.skills.map(skill => (
                  <span key={skill} className={styles.skillPill}>{skill}</span>
                ))}
              </div>
            </div>

            <div className={styles.sideDetails}>
              <div>
                <span className={styles.detailLabel}>Department</span>
                <span className={styles.detailValue}>{proj.dept}</span>
                
                <span className={styles.detailLabel}>Eligibility</span>
                <span className={styles.detailValue}>{proj.year}</span>
                
                <span className={styles.detailLabel}>Listed Date</span>
                <span className={styles.detailValue}>{proj.date}</span>
              </div>
              <button className={styles.applyBtn}>Apply to Build</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default JoinProject;