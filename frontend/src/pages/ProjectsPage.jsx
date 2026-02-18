import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Profile.module.css';

const ProjectsPage = () => {
    const { isLoggedIn, user, loading } = useAuth();
    const navigate = useNavigate();

    // Keeping track of all the projects here - ones you own and ones you've joined
    const [projects, setProjects] = useState({ owned: [], joined: [] });
    const [fetching, setFetching] = useState(true);

    // When the page loads, let's grab the data
    useEffect(() => {
        // Safety check: if not logged in, back to home you go
        if (!loading && !isLoggedIn) { navigate('/'); return; }

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

    // Layout Styles - sleek and dark
    const pageStyle = {
        padding: '40px 60px',
        background: '#09090b',
        minHeight: '100vh',
        color: '#fafafa'
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '24px',
        marginTop: '24px'
    };

    const cardStyle = {
        background: '#18181b', // Darker card background for depth
        border: '1px solid #27272a',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
        minHeight: '200px',
        justifyContent: 'space-between'
    };

    // Reusable Card Component
    const Card = ({ p, isOwned }) => {
        // Estimating team size: applications length + 1 (the owner)
        const memberCount = (p.applications?.length || 0) + 1;

        return (
            <div
                style={cardStyle}
                onClick={() => navigate(`/projects/${p.id}/dashboard`)}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px -8px rgba(0, 0, 0, 0.5)';
                    e.currentTarget.style.borderColor = '#3f3f46';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = '#27272a';
                }}
            >
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <span style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            background: isOwned ? 'rgba(79, 70, 229, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                            color: isOwned ? '#818cf8' : '#4ade80',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            {isOwned ? 'Owner' : 'Team Member'}
                        </span>
                        <span style={{ fontSize: '11px', color: '#52525b' }}>
                            {new Date(p.createdAt).toLocaleDateString()}
                        </span>
                    </div>

                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', margin: '0 0 8px 0', lineHeight: '1.3' }}>{p.title}</h3>
                    <p style={{ fontSize: '14px', color: '#a1a1aa', margin: 0, lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {p.description || 'No description provided.'}
                    </p>
                </div>

                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        <span style={{ fontSize: '12px', color: '#71717a' }}>{memberCount} members</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isOwned ? '#818cf8' : '#4ade80', fontSize: '13px', fontWeight: '500' }}>
                        Dashboard →
                    </div>
                </div>
            </div>
        );
    };

    return (
        <section style={pageStyle}>
            <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
                <h1 className="fadeInUp" style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.5px' }}>Your Projects</h1>
                <p className="fadeInUp" style={{ color: '#a1a1aa', marginBottom: '40px', fontSize: '15px' }}>Manage your active projects and collaborations.</p>

                <div className="stagger">
                    {/* Projects you Manage */}
                    {projects.owned.length > 0 && (
                        <div style={{ marginBottom: '60px' }}>
                            <h3 style={{ fontSize: '14px', color: '#71717a', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Managed by You ({projects.owned.length})</h3>
                            <div style={gridStyle}>
                                {projects.owned.map(p => <Card key={p.id} p={p} isOwned={true} />)}
                            </div>
                        </div>
                    )}

                    {/* Projects you Joined */}
                    {projects.joined.length > 0 && (
                        <div>
                            <h3 style={{ fontSize: '14px', color: '#71717a', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Joined Projects ({projects.joined.length})</h3>
                            <div style={gridStyle}>
                                {projects.joined.map(p => <Card key={p.id} p={p} isOwned={false} />)}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {projects.owned.length === 0 && projects.joined.length === 0 && (
                        <div className="fadeInUp" style={{ padding: '80px', border: '1px dashed #27272a', borderRadius: '24px', textAlign: 'center', background: '#101012' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
                            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>No projects yet</h3>
                            <p style={{ color: '#a1a1aa', marginBottom: '32px' }}>Start your journey by creating a project or joining an existing one.</p>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                <button onClick={() => navigate('/join-project')} style={{ padding: '10px 24px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Find Projects</button>
                                <button onClick={() => navigate('/upload')} style={{ padding: '10px 24px', background: '#27272a', color: '#fff', border: '1px solid #3f3f46', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Create Project</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ProjectsPage;
