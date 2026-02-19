import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import styles from './ProjectsPage.module.css';

const ProjectsPage = () => {
    const { isLoggedIn, user, loading } = useAuth();
    const navigate = useNavigate();

    // Keeping track of all the projects here - ones you own and ones you've joined
    const [projects, setProjects] = useState({ owned: [], joined: [] });
    const [fetching, setFetching] = useState(true);
    const [visibleOwned, setVisibleOwned] = useState(6);
    const [visibleJoined, setVisibleJoined] = useState(6);

    const toast = useToast();

    // When the page loads, let's grab the data
    useEffect(() => {
        // Safety check: if not logged in, back to home you go
        if (!loading && !isLoggedIn) {
            toast.warn('Please login to view your projects.');
            navigate('/', { replace: true });
            return;
        }

        if (isLoggedIn) {
            const token = localStorage.getItem('opeer_token');

            // Fetching user details including their projects
            fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` } })
                .then(res => res.json())
                .then(data => {
                    // Projects you created
                    const owned = data.user.projects || [];

                    // Projects you're a part of (need to transform from application to project structure)
                    const joined = data.user.applications?.filter(a => a.status === 'accepted').map(a => ({
                        ...a.project,
                        joinedAt: a.createdAt,
                        isJoined: true
                    })) || [];

                    setProjects({ owned, joined });
                })
                .catch((err) => {
                    // Just logging this for now, hopefully doesn't happen often!
                    console.error("Failed to fetch projects", err);
                })
                .finally(() => setFetching(false));
        }
    }, [isLoggedIn, loading, navigate]);

    if (loading || fetching) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71717a', background: '#09090b' }}>Loading projects...</div>;

    // Reusable Card Component
    const Card = ({ p, isOwned }) => {
        // Estimating team size: applications length + 1 (the owner)
        const memberCount = (p.applications?.length || 0) + 1;

        return (
            <div
                className={styles.card}
                onClick={() => navigate(`/projects/${p.id}/dashboard`)}
            >
                <div>
                    <div className={styles.cardHeader}>
                        <span className={`${styles.roleBadge} ${isOwned ? styles.roleOwner : styles.roleMember}`}>
                            {isOwned ? 'Owner' : 'Team Member'}
                        </span>
                        <span className={styles.dateText}>
                            {new Date(p.createdAt).toLocaleDateString()}
                        </span>
                    </div>

                    <h3 className={styles.projectTitle}>{p.title}</h3>
                    <p className={styles.projectDesc}>
                        {p.description || 'No description provided.'}
                    </p>
                </div>

                <div className={styles.cardFooter}>
                    <div className={styles.memberCount}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        <span>{memberCount} members</span>
                    </div>

                    <div className={`${styles.accessLink} ${isOwned ? styles.linkOwner : styles.linkMember}`}>
                        Dashboard →
                    </div>
                </div>
            </div>
        );
    };

    return (
        <section className={styles.container}>
            <div className={styles.innerContainer}>
                <h1 className={`${styles.pageTitle} ${styles.fadeInUp}`}>Your Projects</h1>
                <p className={`${styles.pageSubtitle} ${styles.fadeInUp}`}>Manage your active projects and collaborations.</p>

                <div className={styles.stagger}>
                    {/* Projects you Manage */}
                    {projects.owned.length > 0 && (
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>Managed by You ({projects.owned.length})</h3>
                            <div className={styles.projectsGrid}>
                                {projects.owned.slice(0, visibleOwned).map(p => <Card key={p.id} p={p} isOwned={true} />)}
                            </div>
                            {projects.owned.length > visibleOwned && (
                                <button onClick={() => setVisibleOwned(prev => prev + 6)} className={styles.showMoreBtn}>Show More</button>
                            )}
                        </div>
                    )}

                    {/* Projects you Joined */}
                    {projects.joined.length > 0 && (
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>Joined Projects ({projects.joined.length})</h3>
                            <div className={styles.projectsGrid}>
                                {projects.joined.slice(0, visibleJoined).map(p => <Card key={p.id} p={p} isOwned={false} />)}
                            </div>
                            {projects.joined.length > visibleJoined && (
                                <button onClick={() => setVisibleJoined(prev => prev + 6)} className={styles.showMoreBtn}>Show More</button>
                            )}
                        </div>
                    )}

                    {/* Empty State */}
                    {projects.owned.length === 0 && projects.joined.length === 0 && (
                        <div className={`${styles.emptyState} ${styles.fadeInUp}`}>
                            <div className={styles.emptyIcon}>🚀</div>
                            <h3 className={styles.emptyTitle}>No projects yet</h3>
                            <p className={styles.emptyText}>Start your journey by creating a project or joining an existing one.</p>
                            <div className={styles.buttonGroup}>
                                <button onClick={() => navigate('/join-project')} className={styles.btnPrimary}>Find Projects</button>
                                <button onClick={() => navigate('/upload')} className={styles.btnSecondary}>Create Project</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ProjectsPage;
