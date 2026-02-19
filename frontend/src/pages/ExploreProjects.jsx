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
    const [applyModal, setApplyModal] = useState({ open: false, projectId: null, projectTitle: '' });

    useEffect(() => {
        const fetchProjects = async () => {
            setFetching(true);
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

                {/* Search Bar */}
                <div className={styles.searchWrapper}>
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

                {fetching ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>Loading...</div>
                ) : (
                    <div className={styles.projectsGrid}>
                        {projects.length === 0 ? (
                            <div className={styles.noProjects}>No projects found matching "{searchTerm}"</div>
                        ) : (
                            projects.map(project => (
                                <div key={project.id} className={styles.projectCard} onClick={() => handleProjectClick(project)}>
                                    <div className={styles.cardHeader}>
                                        <h3 className={styles.cardTitle}>{project.title}</h3>
                                        {project.isShowcase && <span className={styles.showcaseBadge}>SHOWCASE</span>}
                                    </div>

                                    <p className={styles.cardDescription}>
                                        {project.description}
                                    </p>

                                    <div className={styles.skillsWrapper}>
                                        {project.skills.slice(0, 3).map((skill, i) => (
                                            <span key={i} className={styles.skillPill}>{skill}</span>
                                        ))}
                                        {project.skills.length > 3 && <span className={styles.moreSkills}>+{project.skills.length - 3}</span>}
                                    </div>

                                    <div className={styles.cardFooter}>
                                        <div className={styles.authorInfo}>
                                            <img src={project.author.avatarUrl || `https://ui-avatars.com/api/?name=${project.author.name}&background=random`} alt="" className={styles.authorAvatar} />
                                            <span className={styles.authorName}>{project.author.name}</span>
                                        </div>
                                        {isLoggedIn && getActionButton(project)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
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

