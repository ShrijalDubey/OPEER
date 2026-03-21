import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../components/Toast';
import ApplyProjectModal from '../components/ApplyProjectModal';
import styles from './ExploreProjects.module.css';

const ExploreProjects = () => {
    const { isLoggedIn, user, loading } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const toast = useToast();

    const [projects, setProjects] = useState([]);
    const [fetching, setFetching] = useState(true);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [visibleCount, setVisibleCount] = useState(9); // Pagination
    const [applyModal, setApplyModal] = useState({ open: false, projectId: null, projectTitle: '' });

    // AI Recommend State
    const [aiFiltering, setAiFiltering] = useState(false);
    const [aiRecommendations, setAiRecommendations] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            setFetching(true);
            setVisibleCount(9); // Reset pagination on new search
            try {
                const params = new URLSearchParams();
                if (searchTerm) params.append('search', searchTerm);

                const headers = {};
                const token = localStorage.getItem('opeer_token');
                if (token) headers.Authorization = `Bearer ${token}`;

                const res = await fetch(`/api/projects?${params.toString()}`, { headers });
                const data = await res.json();
                if (res.ok) {
                    setProjects(data.projects);
                    setAiRecommendations(null); // Reset AI data on new search
                } else {
                    console.error('Failed to fetch projects');
                }
            } catch (err) {
                console.error(err);
                toast.error('Failed to load projects');
            } finally {
                setFetching(false);
            }
        };

        const timeoutId = setTimeout(() => { fetchProjects(); }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, toast]);

    useEffect(() => {
        if (searchTerm) { setSearchParams({ search: searchTerm }); }
        else { setSearchParams({}); }
    }, [searchTerm, setSearchParams]);

    // Card click: only navigate for owners or accepted members
    const handleProjectClick = (project) => {
        if (project.author.id === user?.id) {
            navigate(`/projects/${project.id}/dashboard`);
            return;
        }
        if (project.myApplication === 'accepted') {
            navigate(`/projects/${project.id}/dashboard`);
            return;
        }
        // For everyone else, do nothing (they use the action button)
    };

    const handleApplyClick = (e, project) => {
        e.stopPropagation();
        if (!isLoggedIn) { toast.error('Please login to apply'); return; }
        setApplyModal({ open: true, projectId: project.id, projectTitle: project.title });
    };

    const submitApplication = async (projectId, message) => {
        const token = localStorage.getItem('opeer_token');
        const res = await fetch(`/api/projects/${projectId}/apply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ message }),
        });

        if (res.ok) {
            toast.success('Application submitted!');
            setProjects(prev => prev.map(p =>
                p.id === projectId ? { ...p, myApplication: 'pending' } : p
            ));
        } else {
            const data = await res.json();
            toast.error(data.error || 'Failed to apply');
        }
    };

    const handleAIFilter = async () => {
        if (!isLoggedIn) {
            toast.warn('Please login to get AI recommendations');
            return;
        }
        if (projects.length === 0) return;
        
        setAiFiltering(true);
        const token = localStorage.getItem('opeer_token');
        try {
            const projectIds = projects.map(p => p.id);
            const res = await fetch('/api/projects/recommend-batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ projectIds })
            });
            
            if (res.ok) {
                const data = await res.json();
                const recMap = {};
                if (data.recommendations && Array.isArray(data.recommendations)) {
                    data.recommendations.forEach(r => { recMap[r.projectId] = r; });
                }
                setAiRecommendations(recMap);
                
                const sorted = [...projects].sort((a, b) => {
                    const scoreA = recMap[a.id]?.score || 0;
                    const scoreB = recMap[b.id]?.score || 0;
                    return scoreB - scoreA;
                });
                
                const filtered = sorted.filter(p => (recMap[p.id]?.score || 0) >= 50);
                setProjects(filtered.length > 0 ? filtered : sorted);
                setVisibleCount(18); // Show more since we filtered
                toast.success('Projects sorted by AI match!');
            } else {
                toast.error('Failed to get AI recommendations');
            }
        } catch (err) {
            console.error(err);
            toast.error('AI Service unavailable');
        } finally {
            setAiFiltering(false);
        }
    };

    const getActionButton = (project) => {
        if (project.author.id === user?.id) {
            return <button onClick={(e) => { e.stopPropagation(); navigate(`/projects/${project.id}/dashboard`); }} className={`${styles.btn} ${styles.btnSecondary}`}>Manage</button>;
        }
        if (!project.myApplication) {
            return <button onClick={(e) => handleApplyClick(e, project)} className={`${styles.btn} ${styles.btnPrimary}`}>Apply</button>;
        }
        if (project.myApplication === 'pending') {
            return <button disabled className={`${styles.btn} ${styles.btnDisabled}`}>Applied</button>;
        }
        if (project.myApplication === 'accepted') {
            return <button onClick={(e) => { e.stopPropagation(); navigate(`/projects/${project.id}/dashboard`); }} className={`${styles.btn} ${styles.btnSuccess}`}>Enter</button>;
        }
        if (project.myApplication === 'rejected') {
            return <button disabled className={`${styles.btn} ${styles.btnError}`}>Rejected</button>;
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.innerContainer}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Explore Projects</h1>
                    <p className={styles.subtitle}>
                        {isLoggedIn ? "Showing projects from your joined threads." : "Discover open source projects to contribute to."}
                    </p>
                </div>

                {/* Search Bar & AI Filter */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch', marginBottom: '30px' }}>
                    <div className={styles.searchWrapper} style={{ flex: 1, margin: 0 }}>
                        <input
                            type="text"
                            placeholder="Search by title, skills, or tags..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.searchIcon}>
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                    
                    {isLoggedIn && (
                        <button 
                            onClick={handleAIFilter} 
                            disabled={aiFiltering || projects.length === 0}
                            style={{
                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
                                color: '#f4f4f5', border: '1px solid rgba(168, 85, 247, 0.3)',
                                borderRadius: '30px', padding: '0 24px', fontWeight: '600',
                                cursor: aiFiltering ? 'wait' : 'pointer', transition: 'all 0.2s',
                                display: 'flex', alignItems: 'center', gap: '8px', 
                                opacity: aiFiltering || projects.length === 0 ? 0.6 : 1,
                                boxShadow: aiFiltering ? 'none' : '0 4px 12px rgba(168, 85, 247, 0.15)'
                            }}
                        >
                            <span style={{ fontSize: '18px' }}>🤖</span>
                            {aiFiltering ? 'Analyzing...' : 'AI Recommend'}
                        </button>
                    )}
                </div>

                {fetching ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>Loading...</div>
                ) : (
                    <>
                        <div className={styles.projectsGrid}>
                            {projects.length === 0 ? (
                                <div className={styles.noProjects}>
                                    {searchTerm
                                        ? `No projects found matching "${searchTerm}"`
                                        : 'No projects available yet. Join a thread and start exploring!'}
                                </div>
                            ) : (
                                projects.slice(0, visibleCount).map(project => (
                                    <div key={project.id} className={styles.projectCard} onClick={() => handleProjectClick(project)}>
                                        <div className={styles.cardHeader}>
                                            <h3 className={styles.cardTitle}>{project.title}</h3>
                                            {project.isShowcase && <span className={styles.showcaseBadge}>SHOWCASE</span>}
                                        </div>

                                        <p className={styles.cardDescription}>
                                            {project.description}
                                        </p>

                                        {/* AI Recommendation Reason */}
                                        {aiRecommendations && aiRecommendations[project.id] && (
                                            <div style={{
                                                padding: '12px', background: 'rgba(168, 85, 247, 0.08)',
                                                border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '12px',
                                                marginBottom: '16px', fontSize: '13px', color: '#e4e4e7',
                                                display: 'flex', gap: '12px', alignItems: 'center',
                                                lineHeight: '1.5'
                                            }}>
                                                <div style={{
                                                    background: aiRecommendations[project.id].score >= 80 ? 'rgba(74, 222, 128, 0.15)' : aiRecommendations[project.id].score >= 50 ? 'rgba(250, 204, 21, 0.15)' : 'rgba(248, 113, 113, 0.15)',
                                                    color: aiRecommendations[project.id].score >= 80 ? '#4ade80' : aiRecommendations[project.id].score >= 50 ? '#facc15' : '#f87171',
                                                    padding: '6px 10px', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px',
                                                    border: `1px solid ${aiRecommendations[project.id].score >= 80 ? 'rgba(74, 222, 128, 0.4)' : aiRecommendations[project.id].score >= 50 ? 'rgba(250, 204, 21, 0.4)' : 'rgba(248, 113, 113, 0.4)'}`,
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {aiRecommendations[project.id].score}% Match
                                                </div>
                                                <div style={{ 
                                                    flex: 1, 
                                                    color: '#d4d4d8',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}>
                                                    {aiRecommendations[project.id].reason}
                                                </div>
                                            </div>
                                        )}

                                        <div className={styles.skillsWrapper}>
                                            {project.skills.slice(0, 3).map((skill, i) => (
                                                <span key={i} className={styles.skillPill}>{skill}</span>
                                            ))}
                                            {project.skills.length > 3 && <span className={styles.moreSkills}>+{project.skills.length - 3}</span>}
                                        </div>

                                        <div className={styles.cardFooter}>
                                            <div className={styles.authorInfo}>
                                                <img src={project.author.avatarUrl || `https://ui-avatars.com/api/?name=${project.author.name}&background=random`} alt="" className={styles.authorAvatar} referrerPolicy="no-referrer" />
                                                <span className={styles.authorName}>{project.author.name}</span>
                                            </div>
                                            <div className={styles.slugPill}>
                                                <span style={{ 
                                                    fontSize: '11px', 
                                                    color: '#818cf8',
                                                    fontWeight: '600',
                                                    fontFamily: 'monospace'
                                                }}>
                                                    /{project.thread?.slug}
                                                </span>
                                            </div>
                                            {isLoggedIn && getActionButton(project)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {!searchTerm && projects.length > visibleCount && (
                            <div style={{ textAlign: 'center', marginTop: '40px', paddingBottom: '20px' }}>
                                <button
                                    onClick={() => setVisibleCount(prev => prev + 9)}
                                    className={styles.btn}
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: 'var(--text-secondary)',
                                        padding: '12px 24px',
                                        minWidth: '200px'
                                    }}
                                >
                                    Show More Projects
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <ApplyProjectModal
                isOpen={applyModal.open}
                onClose={() => setApplyModal({ open: false, projectId: null, projectTitle: '' })}
                projectId={applyModal.projectId}
                projectTitle={applyModal.projectTitle}
                onApply={submitApplication}
            />
        </div>
    );
};

export default ExploreProjects;

