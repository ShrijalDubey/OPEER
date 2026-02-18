
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../components/Toast';
import ApplyProjectModal from '../components/ApplyProjectModal';

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

    // Button styles
    const btnStyle = (variant) => {
        const base = { padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', border: 'none', cursor: 'pointer', transition: 'all 0.2s' };
        const variants = {
            primary: { ...base, background: '#4f46e5', color: '#fff' },
            success: { ...base, background: '#22c55e', color: '#000' },
            secondary: { ...base, background: '#27272a', color: '#a1a1aa' },
            disabled: { ...base, background: '#3f3f46', color: '#71717a', cursor: 'default' },
            error: { ...base, background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'default' },
        };
        return variants[variant] || base;
    };

    const getActionButton = (project) => {
        if (project.author.id === user?.id) {
            return <button onClick={(e) => { e.stopPropagation(); navigate(`/projects/${project.id}/dashboard`); }} style={btnStyle('secondary')}>Manage</button>;
        }
        if (!project.myApplication) {
            return <button onClick={(e) => handleApplyClick(e, project)} style={btnStyle('primary')}>Apply</button>;
        }
        if (project.myApplication === 'pending') {
            return <button disabled style={btnStyle('disabled')}>Applied</button>;
        }
        if (project.myApplication === 'accepted') {
            return <button onClick={(e) => { e.stopPropagation(); navigate(`/projects/${project.id}/dashboard`); }} style={btnStyle('success')}>Enter</button>;
        }
        if (project.myApplication === 'rejected') {
            return <button disabled style={btnStyle('error')}>Rejected</button>;
        }
    };

    return (
        <div style={{ padding: '40px 60px', minHeight: '100vh', background: '#09090b', color: '#fafafa' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', background: 'linear-gradient(to right, #fff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Explore Projects</h1>
                <p style={{ color: '#a1a1aa', marginBottom: '32px' }}>
                    {isLoggedIn ? "Showing projects from your joined threads." : "Discover open source projects to contribute to."}
                </p>

                {/* Search Bar */}
                <div style={{ marginBottom: '40px', position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Search by title, skills, or tags..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%', padding: '16px 24px', paddingLeft: '50px',
                            background: '#18181b', border: '1px solid #27272a', borderRadius: '12px',
                            color: '#fff', fontSize: '16px', outline: 'none', transition: 'all 0.2s',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                        onBlur={(e) => e.target.style.borderColor = '#27272a'}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)' }}>
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </div>

                {fetching ? (
                    <div style={{ textAlign: 'center', color: '#71717a', padding: '40px' }}>Loading...</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
                        {projects.length === 0 ? (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#52525b', padding: '40px' }}>No projects found matching "{searchTerm}"</div>
                        ) : (
                            projects.map(project => (
                                <div key={project.id} style={{
                                    background: '#18181b', border: '1px solid #27272a', borderRadius: '16px',
                                    padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px',
                                    transition: 'transform 0.2s, borderColor 0.2s', cursor: 'pointer'
                                }}
                                    onClick={() => handleProjectClick(project)}
                                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#3f3f46'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#27272a'; }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fafafa', margin: 0, lineHeight: '1.4' }}>{project.title}</h3>
                                        {project.isShowcase && <span style={{ background: '#fbbf24', color: '#000', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '700' }}>SHOWCASE</span>}
                                    </div>

                                    <p style={{ fontSize: '14px', color: '#a1a1aa', margin: 0, lineHeight: '1.6', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {project.description}
                                    </p>

                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {project.skills.slice(0, 3).map((skill, i) => (
                                            <span key={i} style={{ background: '#27272a', color: '#a1a1aa', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '500' }}>{skill}</span>
                                        ))}
                                        {project.skills.length > 3 && <span style={{ color: '#52525b', fontSize: '11px' }}>+{project.skills.length - 3}</span>}
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #27272a' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <img src={project.author.avatarUrl || `https://ui-avatars.com/api/?name=${project.author.name}&background=random`} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                                            <span style={{ fontSize: '12px', color: '#71717a' }}>{project.author.name}</span>
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

