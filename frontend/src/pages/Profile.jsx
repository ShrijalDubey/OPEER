import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import styles from './Profile.module.css';

const Profile = () => {
    const { user, isLoggedIn, loading, logout, refreshUser } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const [profileData, setProfileData] = useState(null);
    const [activeTab, setActiveTab] = useState('threads');
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({ college: '', year: '', skills: '', bio: '' });
    const [saving, setSaving] = useState(false);

    // Application Management State
    const [viewingAppProject, setViewingAppProject] = useState(null); // projectId
    const [applicants, setApplicants] = useState([]);
    const [loadingApps, setLoadingApps] = useState(false);

    const fetchProfile = async () => {
        const token = localStorage.getItem('opeer_token');
        try {
            const res = await fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            setProfileData(data.user);
        } catch { /* ignore */ }
    };

    useEffect(() => {
        if (!loading && !isLoggedIn) { navigate('/', { replace: true }); return; }
        if (isLoggedIn) fetchProfile();
    }, [isLoggedIn, loading, navigate]);

    const handleLogout = async () => {
        await logout();
        navigate('/', { replace: true });
    };

    const startEditing = () => {
        setEditForm({
            college: profileData?.college || '',
            year: profileData?.year || '',
            skills: (profileData?.skills || []).join(', '),
            bio: profileData?.bio || '',
        });
        setEditing(true);
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('opeer_token');
            const res = await fetch('/api/users/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(editForm),
            });
            if (res.ok) {
                await refreshUser();
                await fetchProfile();
                setEditing(false);
                toast.success('Profile updated!');
            } else { toast.error('Failed to save profile'); }
        } catch { toast.error('Something went wrong'); }
        finally { setSaving(false); }
    };

    const handleDeleteAccount = async () => {
        const ok = await toast.confirm('⚠️ This will permanently delete your account and all your data. This cannot be undone.');
        if (!ok) return;

        try {
            const token = localStorage.getItem('opeer_token');
            await fetch('/api/users/me', { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
            await logout();
            navigate('/', { replace: true });
        } catch { toast.error('Failed to delete account'); }
    };

    const handleLeaveThread = async (slug) => {
        const ok = await toast.confirm(`Leave /${slug}? You can rejoin later.`);
        if (!ok) return;
        try {
            const token = localStorage.getItem('opeer_token');
            await fetch(`/api/threads/${slug}/leave`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
            setProfileData((prev) => ({ ...prev, joinedThreads: prev.joinedThreads.filter((t) => t.slug !== slug) }));
            toast.success(`Left /${slug}`);
        } catch { toast.error('Failed to leave thread'); }
    };

    const handleDeleteProject = async (id) => {
        const ok = await toast.confirm('Delete this project permanently? This cannot be undone.');
        if (!ok) return;
        try {
            const token = localStorage.getItem('opeer_token');
            await fetch(`/api/projects/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
            setProfileData((prev) => ({ ...prev, projects: prev.projects.filter((p) => p.id !== id) }));
            toast.success('Project deleted');
        } catch { toast.error('Failed to delete project'); }
    };

    // --- Application Management ---

    const openApplicationModal = async (projectId) => {
        setViewingAppProject(projectId);
        setLoadingApps(true);
        const token = localStorage.getItem('opeer_token');
        try {
            const res = await fetch(`/api/projects/${projectId}/applications`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
                const data = await res.json();
                setApplicants(data.applications || []);
            } else {
                toast.error('Failed to load applicants');
                setViewingAppProject(null);
            }
        } catch {
            toast.error('Something went wrong');
            setViewingAppProject(null);
        } finally {
            setLoadingApps(false);
        }
    };

    const handleApplicationAction = async (appId, status) => {
        // Optimistic update
        setApplicants((prev) => prev.map((a) => (a.id === appId ? { ...a, status } : a)));

        const token = localStorage.getItem('opeer_token');
        try {
            const res = await fetch(`/api/projects/${viewingAppProject}/applications/${appId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status }),
            });

            if (res.ok) {
                const action = status === 'accepted' ? 'Accepted' : 'Rejected';
                toast.success(`Applicant ${action}`);
                // Update profile data if count changed? (optional)
            } else {
                toast.error('Failed to update status');
                // Revert
                // Trigger refetch?
            }
        } catch {
            toast.error('Something went wrong');
        }
    };

    // Derived Lists
    const myProjects = profileData?.projects || [];
    const joinedProjects = profileData?.applications?.filter((a) => a.status === 'accepted') || [];
    const pendingApplications = profileData?.applications?.filter((a) => a.status !== 'accepted') || [];

    if (loading || !profileData) {
        return (
            <section className={styles.section}>
                <div className={styles.container}>
                    <div className="fadeInUp" style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '40px' }}>
                        <div className="skeleton" style={{ width: '72px', height: '72px', borderRadius: '50%' }}></div>
                        <div>
                            <div className="skeleton" style={{ width: '180px', height: '22px', marginBottom: '8px' }}></div>
                            <div className="skeleton" style={{ width: '140px', height: '14px' }}></div>
                        </div>
                    </div>
                    <div className="skeleton" style={{ width: '100%', height: '80px', borderRadius: '12px', marginBottom: '20px' }}></div>
                    <div className="skeleton" style={{ width: '100%', height: '200px', borderRadius: '12px' }}></div>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.section}>
            <div className={styles.container}>

                {/* Header */}
                <div className={`${styles.profileHeader} fadeInUp`}>
                    <div className={styles.avatarSection}>
                        {profileData.avatarUrl ? (
                            <img src={profileData.avatarUrl} alt={profileData.name} className={styles.avatar} />
                        ) : (
                            <div className={styles.avatarPlaceholder}>
                                {profileData.name?.charAt(0)?.toUpperCase()}
                            </div>
                        )}
                        <div className={styles.userInfo}>
                            <h1 className={styles.userName}>{profileData.name}</h1>
                            <p className={styles.userEmail}>{profileData.email}</p>
                            <div className={styles.metaTags}>
                                {profileData.college && <span className={styles.metaTag}>🎓 {profileData.college}</span>}
                                {profileData.year && <span className={styles.metaTag}>📅 {profileData.year}</span>}
                                <span className={styles.metaTag}>🔗 {profileData.provider === 'google' ? 'Google' : 'GitHub'}</span>
                            </div>
                        </div>
                    </div>
                    <div className={styles.headerActions}>
                        <button className={styles.editBtn} onClick={editing ? () => setEditing(false) : startEditing}>
                            {editing ? 'Cancel' : 'Edit Profile'}
                        </button>
                        <button className={styles.logoutBtn} onClick={handleLogout}>Log Out</button>
                    </div>
                </div>

                {/* Edit Form */}
                {editing && (
                    <div className={`${styles.editSection} fadeInUp`}>
                        <h3 className={styles.sectionLabel}>Edit Profile</h3>
                        <div className={styles.editGrid}>
                            <div className={styles.editField}>
                                <label>College</label>
                                <input value={editForm.college} onChange={(e) => setEditForm({ ...editForm, college: e.target.value })} placeholder="Your college" />
                            </div>
                            <div className={styles.editField}>
                                <label>Year</label>
                                <select value={editForm.year} onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}>
                                    <option value="">Select</option>
                                    <option value="1st Year">1st Year</option>
                                    <option value="2nd Year">2nd Year</option>
                                    <option value="3rd Year">3rd Year</option>
                                    <option value="4th Year">4th Year</option>
                                    <option value="5th Year">5th Year</option>
                                    <option value="Postgraduate">Postgraduate</option>
                                    <option value="PhD">PhD</option>
                                    <option value="Alumni">Alumni</option>
                                </select>
                            </div>
                        </div>
                        <div className={styles.editField}>
                            <label>Skills (comma separated)</label>
                            <input value={editForm.skills} onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })} placeholder="React, Python, ML" />
                        </div>
                        <div className={styles.editField}>
                            <label>Bio</label>
                            <textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} placeholder="About you..." rows={3} />
                        </div>
                        <button className={styles.saveBtn} onClick={handleSaveProfile} disabled={saving}>
                            {saving ? <><span className="spinner" style={{ width: 14, height: 14 }}></span> Saving...</> : 'Save Changes'}
                        </button>
                    </div>
                )}

                {/* Bio & Skills (when not editing) */}
                {!editing && (
                    <>
                        {profileData.bio && (
                            <div className={`${styles.bioSection} fadeInUp`} style={{ animationDelay: '60ms' }}>
                                <p>{profileData.bio}</p>
                            </div>
                        )}

                        {profileData.skills?.length > 0 && (
                            <div className={`${styles.skillsSection} fadeInUp`} style={{ animationDelay: '120ms' }}>
                                <h3 className={styles.sectionLabel}>Skills</h3>
                                <div className={styles.skillsList}>
                                    {profileData.skills.map((skill) => <span key={skill} className={styles.skillPill}>{skill}</span>)}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Tabs */}
                <div className={`${styles.tabs} fadeInUp`} style={{ animationDelay: '180ms' }}>
                    {['threads', 'projects', 'applications'].map((tab) => (
                        <button
                            key={tab}
                            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab === 'threads' ? `Threads (${profileData.joinedThreads?.length || 0})` :
                                tab === 'projects' ? `Projects (${myProjects.length + joinedProjects.length})` :
                                    `Applications (${pendingApplications.length})`}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className={`${styles.tabContent} stagger`}>
                    {activeTab === 'threads' && (
                        profileData.joinedThreads?.length > 0 ? (
                            profileData.joinedThreads.map((thread) => (
                                <div key={thread.id} className={`${styles.listItem} fadeInUp`}>
                                    <div>
                                        <span className={styles.threadSlug}>/{thread.slug}</span>
                                        <span className={styles.threadName}>{thread.name}</span>
                                    </div>
                                    <button className={styles.actionBtn} onClick={() => handleLeaveThread(thread.slug)}>Leave</button>
                                </div>
                            ))
                        ) : (
                            <p className={`${styles.emptyState} fadeInUp`}>You haven't joined any threads yet.</p>
                        )
                    )}

                    {activeTab === 'projects' && (
                        <>
                            {/* Owned Projects */}
                            {myProjects.length > 0 && (
                                <div className="fadeInUp">
                                    <h3 className={styles.sectionLabel}>My Projects (Owner)</h3>
                                    {myProjects.map((project) => (
                                        <div key={project.id} className={styles.listItem}>
                                            <div>
                                                <span className={styles.projectTitle}>{project.title}</span>
                                                <span className={styles.projectMeta}>
                                                    in /{project.thread?.slug}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {project._count?.applications > 0 && (
                                                    <button
                                                        className={styles.actionBtn}
                                                        onClick={() => openApplicationModal(project.id)}
                                                        style={{ color: '#818cf8', borderColor: '#818cf8' }}
                                                    >
                                                        Review Applications ({project._count.applications})
                                                    </button>
                                                )}
                                                <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDeleteProject(project.id)}>Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Joined Projects (Team Member) */}
                            {joinedProjects.length > 0 && (
                                <div className="fadeInUp" style={{ marginTop: '24px' }}>
                                    <h3 className={styles.sectionLabel}>Joined Projects (Team Member)</h3>
                                    {joinedProjects.map((app) => (
                                        <div key={app.id} className={styles.listItem}>
                                            <div>
                                                <span className={styles.projectTitle}>{app.project?.title}</span>
                                                <span className={styles.projectMeta}>
                                                    Lead: <strong>{app.project?.author?.name}</strong> · in /{app.project?.thread?.slug}
                                                </span>
                                            </div>
                                            <span className={`${styles.statusBadge} ${styles.status_accepted}`}>Accepted</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {myProjects.length === 0 && joinedProjects.length === 0 && (
                                <p className={`${styles.emptyState} fadeInUp`}>No projects found.</p>
                            )}
                        </>
                    )}

                    {activeTab === 'applications' && (
                        pendingApplications.length > 0 ? (
                            pendingApplications.map((app) => (
                                <div key={app.id} className={`${styles.listItem} fadeInUp`}>
                                    <div>
                                        <span className={styles.projectTitle}>{app.project?.title}</span>
                                        <span className={styles.projectMeta}>in /{app.project?.thread?.slug}</span>
                                    </div>
                                    <span className={`${styles.statusBadge} ${styles[`status_${app.status}`]}`}>{app.status}</span>
                                </div>
                            ))
                        ) : (
                            <p className={`${styles.emptyState} fadeInUp`}>No pending applications.</p>
                        )
                    )}
                </div>

                {/* Danger Zone */}
                <div className={`${styles.dangerZone} fadeInUp`}>
                    <h3 className={styles.dangerTitle}>Danger Zone</h3>
                    <p className={styles.dangerDesc}>Permanently delete your account and all associated data.</p>
                    <button className={styles.dangerBtn} onClick={handleDeleteAccount}>Delete My Account</button>
                </div>
            </div>

            {/* Application Modal */}
            {viewingAppProject && (
                <div className={styles.modalOverlay} onClick={() => setViewingAppProject(null)}>
                    <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Review Applications</h3>
                            <button className={styles.modalClose} onClick={() => setViewingAppProject(null)}>×</button>
                        </div>
                        <div className={styles.modalBody}>
                            {loadingApps ? (
                                <p style={{ textAlign: 'center', color: '#71717a' }}>Loading...</p>
                            ) : applicants.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#71717a' }}>No applicants yet.</p>
                            ) : (
                                applicants.map((app) => (
                                    <div key={app.id} className={styles.applicantItem}>
                                        <div className={styles.applicantHeader}>
                                            <div className={styles.avatarPlaceholder} style={{ width: 32, height: 32, fontSize: 14 }}>
                                                {app.user.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className={styles.applicantInfo}>
                                                <h4>{app.user.name}</h4>
                                                <p className={styles.applicantMeta}>
                                                    {app.user.college} · {app.user.year}
                                                </p>
                                            </div>
                                        </div>
                                        {app.message && <div className={styles.applicantMessage}>"{app.message}"</div>}

                                        {app.status === 'pending' ? (
                                            <div className={styles.applicantActions}>
                                                <button className={styles.approveBtn} onClick={() => handleApplicationAction(app.id, 'accepted')}>Accept</button>
                                                <button className={styles.rejectBtn} onClick={() => handleApplicationAction(app.id, 'rejected')}>Reject</button>
                                            </div>
                                        ) : (
                                            <span className={`${styles.statusLabel} ${styles[`status_${app.status}`]}`} style={{
                                                background: app.status === 'accepted' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                color: app.status === 'accepted' ? '#4ade80' : '#f87171',
                                                border: `1px solid ${app.status === 'accepted' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                                            }}>
                                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                            </span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Profile;
