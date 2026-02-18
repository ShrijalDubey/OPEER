import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import styles from './JoinProject.module.css';

const JoinProject = () => {
  const { user, isLoggedIn } = useAuth();
  const toast = useToast();
  const [selectedThread, setSelectedThread] = useState(null);
  const [myHubs, setMyHubs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loadingHubs, setLoadingHubs] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [applyingId, setApplyingId] = useState(null);
  const [leavingSlug, setLeavingSlug] = useState(null);

  // Fetch joined hubs
  const fetchHubs = async () => {
    if (!isLoggedIn) { setLoadingHubs(false); return; }
    try {
      const token = localStorage.getItem('opeer_token');
      const res = await fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      const threads = data.user?.joinedThreads || [];
      const full = await Promise.all(
        threads.map(async (t) => {
          const r = await fetch(`/api/threads/${t.slug}`);
          const d = await r.json();
          return d.thread;
        })
      );
      setMyHubs(full.filter(Boolean));

      // Also track applied project IDs
      const ids = (data.user?.applications || []).map((a) => a.project?.id);
      setAppliedIds(new Set(ids.filter(Boolean)));
    } catch { /* ignore */ }
    setLoadingHubs(false);
  };

  useEffect(() => { fetchHubs(); }, [isLoggedIn]);

  // Fetch projects when a hub is selected
  useEffect(() => {
    if (!selectedThread) return;
    setLoadingProjects(true);
    fetch(`/api/threads/${selectedThread}/projects`)
      .then((res) => res.json())
      .then((data) => {
        setProjects(data.projects || []);
        setLoadingProjects(false);
      })
      .catch(() => setLoadingProjects(false));
  }, [selectedThread]);

  const handleApply = async (projectId) => {
    if (!isLoggedIn) { toast.warn('Please login first.'); return; }
    setApplyingId(projectId);
    try {
      const token = localStorage.getItem('opeer_token');
      const res = await fetch(`/api/projects/${projectId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: 'I would love to contribute to this project!' }),
      });
      if (res.ok) { setAppliedIds((prev) => new Set([...prev, projectId])); toast.success('Application sent!'); }
      else { const d = await res.json(); toast.error(d.error || 'Failed to apply'); }
    } catch { toast.error('Something went wrong'); }
    finally { setApplyingId(null); }
  };

  const handleLeaveHub = async (slug) => {
    const ok = await toast.confirm(`Leave /${slug}? You can rejoin later.`);
    if (!ok) return;
    setLeavingSlug(slug);
    try {
      const token = localStorage.getItem('opeer_token');
      const res = await fetch(`/api/threads/${slug}/leave`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMyHubs((prev) => prev.filter((h) => h.slug !== slug));
        if (selectedThread === slug) {
          setSelectedThread(null);
          setProjects([]);
        }
        toast.success(`Left /${slug}`);
      } else { toast.error('Failed to leave hub'); }
    } catch { toast.error('Something went wrong'); }
    finally { setLeavingSlug(null); }
  };

  const handleDeleteProject = async (projectId) => {
    const ok = await toast.confirm('Delete this project? This cannot be undone.');
    if (!ok) return;
    try {
      const token = localStorage.getItem('opeer_token');
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { setProjects((prev) => prev.filter((p) => p.id !== projectId)); toast.success('Project deleted'); }
      else { toast.error('Failed to delete'); }
    } catch { toast.error('Something went wrong'); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Skeleton row
  const SkeletonRow = () => (
    <div className={styles.hubRow} style={{ pointerEvents: 'none' }}>
      <div className="skeleton" style={{ width: '100px', height: '16px' }}></div>
      <div className="skeleton" style={{ width: '200px', height: '14px' }}></div>
      <div className="skeleton" style={{ width: '40px', height: '14px' }}></div>
      <div className="skeleton" style={{ width: '40px', height: '14px' }}></div>
      <div></div>
    </div>
  );

  // VIEW 1: JOINED HUBS
  if (!selectedThread) {
    return (
      <section className={styles.section} id="join-project">
        <div className={styles.container}>
          <div className={`${styles.header} fadeInUp`}>
            <h1 className={styles.title}>Your <span className={styles.highlight}>Joined Hubs</span></h1>
          </div>

          {!isLoggedIn ? (
            <p className="fadeInUp" style={{ textAlign: 'center', color: '#71717a', padding: '60px 0', fontSize: '16px' }}>
              Please login and join a thread first to see projects.
            </p>
          ) : loadingHubs ? (
            <div>
              <div className={styles.directoryHeader}>
                <span>Thread</span><span>Description</span><span>Members</span><span>Projects</span><span></span>
              </div>
              {Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : myHubs.length === 0 ? (
            <p className="fadeInUp" style={{ textAlign: 'center', color: '#71717a', padding: '60px 0', fontSize: '16px' }}>
              You haven't joined any threads yet. Go to <a href="/join-thread" style={{ color: '#818cf8' }}>Join a Thread</a> first!
            </p>
          ) : (
            <>
              <div className={styles.directoryHeader}>
                <span>Thread</span><span>Description</span><span>Members</span><span>Projects</span><span></span>
              </div>
              <div className="stagger">
                {myHubs.map((hub) => (
                  <div key={hub.id} className={`${styles.hubRow} fadeInUp`}>
                    <span className={styles.hubName} onClick={() => setSelectedThread(hub.slug)} style={{ cursor: 'pointer' }}>
                      /{hub.slug}
                    </span>
                    <span className={styles.hubDescription} title={hub.description}>{hub.description}</span>
                    <span className={styles.hubStatText}>{hub.memberCount}</span>
                    <span className={styles.hubStatText}>{hub.projectCount}</span>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setSelectedThread(hub.slug)}
                        style={{ background: 'none', border: '1px solid #27272a', color: '#a1a1aa', padding: '5px 24px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => { e.target.style.borderColor = '#818cf8'; e.target.style.color = '#fff'; }}
                        onMouseLeave={(e) => { e.target.style.borderColor = '#27272a'; e.target.style.color = '#a1a1aa'; }}
                      >
                        View →
                      </button>
                      <button
                        onClick={() => handleLeaveHub(hub.slug)}
                        disabled={leavingSlug === hub.slug}
                        style={{ background: 'none', border: '1px solid #27272a', color: '#71717a', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => { e.target.style.borderColor = '#ef4444'; e.target.style.color = '#f87171'; }}
                        onMouseLeave={(e) => { e.target.style.borderColor = '#27272a'; e.target.style.color = '#71717a'; }}
                      >
                        {leavingSlug === hub.slug ? '...' : 'Leave'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    );
  }

  // VIEW 2: PROJECTS IN A HUB
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className="fadeInUp" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <button onClick={() => { setSelectedThread(null); setProjects([]); }} style={{ background: 'none', border: '1px solid #27272a', color: '#71717a', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}>
            ← Back
          </button>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#fafafa' }}>Recruiting in <span className={styles.highlight}>/{selectedThread}</span></h2>
        </div>

        {loadingProjects ? (
          <div className="stagger">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className={`${styles.projectCard} fadeInUp`} style={{ pointerEvents: 'none' }}>
                <div className={styles.content}>
                  <div className="skeleton" style={{ width: '200px', height: '22px', marginBottom: '16px' }}></div>
                  <div className="skeleton" style={{ width: '100%', height: '14px', marginBottom: '8px' }}></div>
                  <div className="skeleton" style={{ width: '80%', height: '14px', marginBottom: '8px' }}></div>
                  <div className="skeleton" style={{ width: '60%', height: '14px' }}></div>
                </div>
                <div className={styles.sideDetails}>
                  <div>
                    <div className="skeleton" style={{ width: '80px', height: '12px', marginBottom: '8px' }}></div>
                    <div className="skeleton" style={{ width: '100px', height: '16px' }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <p className="fadeInUp" style={{ textAlign: 'center', color: '#52525b', padding: '60px 0', fontSize: '16px' }}>
            No projects in /{selectedThread} yet. <a href="/upload" style={{ color: '#818cf8' }}>Upload one</a>!
          </p>
        ) : (
          <div className="stagger">
            {projects.map((proj) => (
              <div key={proj.id} className={`${styles.projectCard} fadeInUp`}>
                <div className={styles.content}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: '#000' }}>
                      {proj.author?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <span style={{ fontSize: '13px', color: '#71717a' }}>by <strong>{proj.author?.name || 'Unknown'}</strong></span>
                  </div>

                  {proj.team?.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '-8px', marginBottom: '16px' }}>
                      <span style={{ fontSize: '12px', color: '#71717a' }}>Team:</span>
                      <div style={{ display: 'flex', marginLeft: '4px' }}>
                        {proj.team.map((member, idx) => (
                          <div
                            key={member.id}
                            title={member.name}
                            style={{
                              width: '22px', height: '22px', borderRadius: '50%',
                              background: '#4ade80', border: '2px solid #18181b',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '10px', fontWeight: 'bold', color: '#000',
                              marginLeft: idx > 0 ? '-8px' : '0'
                            }}
                          >
                            {member.avatarUrl ? <img src={member.avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : member.name?.charAt(0).toUpperCase()}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <h2 className={styles.projectTitle}>{proj.title}</h2>
                  <p style={{ color: '#a1a1aa', lineHeight: '1.6', fontSize: '15px', marginBottom: '30px' }}>{proj.description}</p>

                  {proj.skills?.length > 0 && (
                    <>
                      <span className={styles.skillsHeader}>Skills Required : </span>
                      <div className={styles.skillContainer}>
                        {proj.skills.map((s) => <span key={s} className={styles.skillPill}>{s}</span>)}
                      </div>
                    </>
                  )}
                </div>

                <div className={styles.sideDetails}>
                  <div>
                    {proj.dept && (<><span className={styles.detailLabel}>Department</span><span className={styles.detailValue}>{proj.dept}</span></>)}
                    {proj.year && (<><span className={styles.detailLabel}>Eligibility</span><span className={styles.detailValue}>{proj.year}</span></>)}
                    <span className={styles.detailLabel}>Listed</span>
                    <span className={styles.detailValue}>{formatDate(proj.createdAt)}</span>
                    <span className={styles.detailLabel}>Applications</span>
                    <span className={styles.detailValue}>{proj.applicationCount || 0}</span>
                  </div>

                  {proj.author?.id === user?.id ? (
                    <button
                      className={styles.applyBtn}
                      onClick={() => handleDeleteProject(proj.id)}
                      style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)', color: '#f87171' }}
                    >
                      Delete Project
                    </button>
                  ) : appliedIds.has(proj.id) ? (
                    <button className={styles.applyBtn} disabled style={{ opacity: 0.5 }}>✓ Applied</button>
                  ) : (
                    <button
                      className={styles.applyBtn}
                      onClick={() => handleApply(proj.id)}
                      disabled={applyingId === proj.id}
                    >
                      {applyingId === proj.id ? <span className="spinner"></span> : 'Apply to Build'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default JoinProject;