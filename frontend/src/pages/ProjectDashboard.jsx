import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import KanbanBoard from '../components/KanbanBoard';
import ProjectFiles from '../components/ProjectFiles';
import MeetingList from '../components/MeetingList';
import styles from './ProjectDashboard.module.css';

const ProjectDashboard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isLoggedIn, loading } = useAuth();
    const toast = useToast();

    // Keeping track of project data details here
    const [project, setProject] = useState(null);
    const [messages, setMessages] = useState([]);

    // Holding the list of folks waiting to join the team
    const [pendingApps, setPendingApps] = useState([]);

    // UI State management - knowing when things are loading or being edited
    const [fetching, setFetching] = useState(true);
    const [editingInfo, setEditingInfo] = useState(false);

    // Form state for editing project details
    const [infoForm, setInfoForm] = useState({ goal: '', executionPlan: '', resources: '' });

    // Chat state
    const [chatInput, setChatInput] = useState('');
    const [sending, setSending] = useState(false);
    const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'tasks', 'files'

    const chatEndRef = useRef(null);
    const pollInterval = useRef(null);

    // When the component mounts or ID changes, let's load everything up
    useEffect(() => {
        // If they aren't logged in, kick them back to home
        if (!loading && !isLoggedIn) {
            toast.warn('Please login to access this project.');
            navigate('/', { replace: true });
            return;
        }

        // If we have an ID and a user, go get the project details
        if (isLoggedIn && id) fetchProjectDetails();

        // Start listening for new chat messages
        startPolling();

        return () => stopPolling();
    }, [id, isLoggedIn, loading, navigate]);

    const fetchProjectDetails = async () => {
        const token = localStorage.getItem('opeer_token');
        try {
            const res = await fetch(`/api/projects/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
                const data = await res.json();
                setProject(data.project);

                // Pre-fill the edit form with current data
                setInfoForm({
                    goal: data.project.goal || '',
                    executionPlan: data.project.executionPlan || '',
                    resources: data.project.resources || ''
                });

                // If you're the boss (owner), let's see who wants to join
                if (data.project.authorId === user?.id) {
                    fetchPendingApps();
                }
            } else {
                toast.error('Failed to load project');
                navigate('/projects');
            }
        } catch {
            navigate('/projects');
        } finally {
            setFetching(false);
        }
    };

    const fetchPendingApps = async () => {
        const token = localStorage.getItem('opeer_token');
        try {
            const res = await fetch(`/api/projects/${id}/applications`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
                const data = await res.json();
                // Just grabbing the ones that haven't been dealt with yet
                setPendingApps(data.applications.filter(a => a.status === 'pending') || []);
            }
        } catch { /* ignore silently */ }
    };

    const handleAppStatus = async (appId, status) => {
        const token = localStorage.getItem('opeer_token');
        try {
            const res = await fetch(`/api/projects/${id}/applications/${appId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                toast.success(`Application ${status}`);
                fetchPendingApps(); // Refresh the pending list
                fetchProjectDetails(); // Refresh the team member list
            } else {
                toast.error('Failed to update status');
            }
        } catch {
            toast.error('Something went wrong');
        }
    };

    const handleLeaveProject = async () => {
        const ok = await toast.confirm('Leave this project? You will lose access to the dashboard.');
        if (!ok) return;
        const token = localStorage.getItem('opeer_token');
        try {
            const res = await fetch(`/api/projects/${id}/leave`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                toast.success('Left the project');
                navigate('/');
            } else {
                const d = await res.json();
                toast.error(d.error || 'Failed to leave project');
            }
        } catch { toast.error('Something went wrong'); }
    };

    const handleKickMember = async (memberId, memberName) => {
        const ok = await toast.confirm(`Remove ${memberName} from this project?`);
        if (!ok) return;
        const token = localStorage.getItem('opeer_token');
        try {
            const res = await fetch(`/api/projects/${id}/members/${memberId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                toast.success(`${memberName} removed`);
                fetchProjectDetails();
            } else {
                const d = await res.json();
                toast.error(d.error || 'Failed to remove member');
            }
        } catch { toast.error('Something went wrong'); }
    };

    const fetchMessages = async () => {
        const token = localStorage.getItem('opeer_token');
        try {
            const res = await fetch(`/api/projects/${id}/chat`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages);
            }
        } catch { /* ignore */ }
    };

    const startPolling = () => {
        if (pollInterval.current) clearInterval(pollInterval.current);
        fetchMessages(); // initial
        pollInterval.current = setInterval(fetchMessages, 3000); // 3s polling
    };

    const stopPolling = () => {
        if (pollInterval.current) clearInterval(pollInterval.current);
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSaveInfo = async () => {
        const token = localStorage.getItem('opeer_token');
        try {
            const res = await fetch(`/api/projects/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(infoForm),
            });
            if (res.ok) {
                const data = await res.json();
                setProject(data.project);
                setEditingInfo(false);
                toast.success('Project info updated');
            } else {
                toast.error('Failed to update info');
            }
        } catch {
            toast.error('Something went wrong');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        setSending(true);
        const token = localStorage.getItem('opeer_token');
        try {
            const res = await fetch(`/api/projects/${id}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ content: chatInput }),
            });
            if (res.ok) {
                setChatInput('');
                fetchMessages();
            }
        } catch {
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    if (loading || fetching || !project) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71717a', background: '#09090b' }}>Loading...</div>;

    const isOwner = project.authorId === user?.id;

    return (
        <div className={styles.container}>
            {/* LEFT COLUMN: INFO PANEL */}
            <div className={`${styles.card} ${styles.infoPanel}`}>

                {/* 1. Header Section */}
                <div className={styles.headerSection}>
                    <div className={styles.headerTop}>
                        <button onClick={() => navigate('/projects')} className={styles.backBtn}>←</button>
                        {isOwner && (
                            <button
                                onClick={editingInfo ? handleSaveInfo : () => setEditingInfo(true)}
                                className={`${styles.editBtn} ${editingInfo ? styles.editBtnActive : ''}`}
                            >
                                {editingInfo ? '✓ Save Changes' : '✎ Edit'}
                            </button>
                        )}
                    </div>
                    <h2 className={styles.projectTitle}>{project.title}</h2>
                    <p className={styles.projectDescription}>
                        {project.description}
                    </p>

                    {/* Skills tags */}
                    {project.skills?.length > 0 && (
                        <div className={styles.skillsWrapper}>
                            {project.skills.map((skill, i) => (
                                <span key={i} className={styles.skillTag}>{skill}</span>
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. Goal Section */}
                <div className={styles.infoBox}>
                    <InputField
                        label="🎯 Main Goal"
                        value={editingInfo ? infoForm.goal : project.goal}
                        field="goal"
                        placeholder="Define the vision..."
                        multiline
                        editing={editingInfo}
                        onChange={(val) => setInfoForm(prev => ({ ...prev, goal: val }))}
                    />
                </div>

                {/* 3. Execution Plan Section */}
                <div className={styles.infoBox}>
                    <InputField
                        label="📋 Execution Plan"
                        value={editingInfo ? infoForm.executionPlan : project.executionPlan}
                        field="executionPlan"
                        placeholder="Step 1... Step 2..."
                        multiline
                        editing={editingInfo}
                        onChange={(val) => setInfoForm(prev => ({ ...prev, executionPlan: val }))}
                    />
                </div>

                {/* 4. Resources Section */}
                <div className={`${styles.infoBox} ${styles.infoBoxLast}`}>
                    <InputField
                        label="🔗 Resources"
                        value={editingInfo ? infoForm.resources : project.resources}
                        field="resources"
                        placeholder="Links to docs, drives..."
                        multiline
                        editing={editingInfo}
                        onChange={(val) => setInfoForm(prev => ({ ...prev, resources: val }))}
                    />
                </div>

                {/* 5. Team Members */}
                <div className={styles.teamSection}>
                    <h3 className={styles.sectionLabel}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        Team ({1 + (project.applications?.length || 0)})
                    </h3>
                    <div className={styles.teamList}>
                        {/* Owner */}
                        <div className={`${styles.teamMemberCard} ${styles.ownerCard}`}>
                            <img
                                src={project.author?.avatarUrl || `https://ui-avatars.com/api/?name=${project.author?.name}&background=random`}
                                alt=""
                                className={`${styles.avatar} ${styles.ownerAvatar}`}
                            />
                            <div style={{ flex: 1 }}>
                                <div className={styles.memberName}>{project.author?.name}</div>
                                <div className={`${styles.memberRole} ${styles.ownerRole}`}>Owner</div>
                            </div>
                        </div>

                        {/* Members */}
                        {project.applications?.map((app) => (
                            <div key={app.user.id} className={`${styles.teamMemberCard} ${styles.memberCard}`}>
                                <img
                                    src={app.user.avatarUrl || `https://ui-avatars.com/api/?name=${app.user.name}&background=random`}
                                    alt=""
                                    className={styles.avatar}
                                />
                                <div style={{ flex: 1 }}>
                                    <div className={styles.memberName}>{app.user.name}</div>
                                    <div className={styles.memberRole}>Member</div>
                                </div>
                                {isOwner ? (
                                    <button
                                        onClick={() => handleKickMember(app.user.id, app.user.name)}
                                        title={`Remove ${app.user.name}`}
                                        className={styles.removeBtn}
                                    >✕</button>
                                ) : app.user.id === user?.id ? (
                                    <button
                                        onClick={handleLeaveProject}
                                        className={styles.leaveBtn}
                                    >Leave</button>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 6. Pending Requests (Owner Only) */}
                {isOwner && pendingApps.length > 0 && (
                    <div>
                        <h3 className={styles.sectionLabel} style={{ color: '#fbbf24' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fbbf24', boxShadow: '0 0 8px rgba(251,191,36,0.4)', display: 'inline-block' }}></span>
                            Pending Requests ({pendingApps.length})
                        </h3>
                        <div className={styles.teamList}>
                            {pendingApps.map((app) => (
                                <div key={app.id} style={{
                                    background: '#141416', padding: '20px', borderRadius: '16px',
                                    border: '1px solid #27272a'
                                }}>
                                    {/* Applicant Header */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                                        <img
                                            src={app.user.avatarUrl || `https://ui-avatars.com/api/?name=${app.user.name}&background=random`}
                                            alt=""
                                            className={styles.avatar}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div className={styles.memberName}>{app.user.name}</div>
                                            <div className={styles.memberRole}>{app.user.email}</div>
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#52525b', background: '#1e1e22', padding: '4px 10px', borderRadius: '8px' }}>
                                            {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </div>
                                    </div>

                                    {/* Profile Info Pills */}
                                    <div className={styles.skillsWrapper} style={{ marginBottom: '12px' }}>
                                        {app.user.college && (
                                            <span style={{ background: '#1e1e22', color: '#d4d4d8', padding: '5px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '500' }}>
                                                🎓 {app.user.college}
                                            </span>
                                        )}
                                        {app.user.year && (
                                            <span style={{ background: '#1e1e22', color: '#d4d4d8', padding: '5px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '500' }}>
                                                📅 {app.user.year}
                                            </span>
                                        )}
                                        {app.user.githubUrl && (
                                            <a href={app.user.githubUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ background: '#1e1e22', color: '#d4d4d8', padding: '5px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', textDecoration: 'none' }}>
                                                🔗 GitHub
                                            </a>
                                        )}
                                    </div>

                                    {/* Skills */}
                                    {app.user.skills?.length > 0 && (
                                        <div className={styles.skillsWrapper} style={{ marginBottom: '12px' }}>
                                            {app.user.skills.map((skill, i) => (
                                                <span key={i} className={styles.skillTag}>
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Bio */}
                                    {app.user.bio && (
                                        <p style={{ fontSize: '14px', color: '#a1a1aa', margin: '0 0 12px 0', lineHeight: '1.6', fontStyle: 'italic' }}>
                                            "{app.user.bio}"
                                        </p>
                                    )}

                                    {/* Contribution Message */}
                                    {app.message && (
                                        <div style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '12px', padding: '14px 16px', marginBottom: '14px' }}>
                                            <div style={{ fontSize: '12px', color: '#71717a', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>How they want to contribute</div>
                                            <p style={{ fontSize: '14px', color: '#e4e4e7', margin: 0, lineHeight: '1.7' }}>{app.message}</p>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            onClick={() => handleAppStatus(app.id, 'accepted')}
                                            style={{
                                                flex: 1, padding: '11px', background: '#22c55e', color: '#000',
                                                border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700',
                                                cursor: 'pointer', transition: 'all 0.2s',
                                                boxShadow: '0 2px 8px rgba(34,197,94,0.2)'
                                            }}
                                        >
                                            ✓ Accept
                                        </button>
                                        <button
                                            onClick={() => handleAppStatus(app.id, 'rejected')}
                                            style={{
                                                flex: 1, padding: '11px', background: 'transparent',
                                                border: '1px solid #3f3f46', color: '#ef4444',
                                                borderRadius: '10px', fontSize: '14px', fontWeight: '700',
                                                cursor: 'pointer', transition: 'all 0.2s'
                                            }}
                                        >
                                            ✕ Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* RIGHT COLUMN: CHAT (Single Card) */}
            <div className={`${styles.card} ${styles.chatPanel}`}>

                {/* Chat Header / Tab Bar */}
                <div className={styles.chatHeader}>
                    <div className={styles.tabGroup}>
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={`${styles.tabBtn} ${activeTab === 'chat' ? styles.tabBtnActive : ''}`}
                            style={{ borderBottomColor: activeTab === 'chat' ? 'var(--accent-success)' : 'transparent' }}
                        >
                            <div className={`${styles.tabDot} ${activeTab === 'chat' ? styles.tabDotActive : ''}`} style={{ background: 'var(--accent-success)' }} />
                            Team Chat
                            <span className={styles.msgCount}>{messages.length}</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('tasks')}
                            className={`${styles.tabBtn} ${activeTab === 'tasks' ? styles.tabBtnActive : ''}`}
                            style={{ borderBottomColor: activeTab === 'tasks' ? '#818cf8' : 'transparent' }}
                        >
                            <div className={`${styles.tabDot} ${activeTab === 'tasks' ? styles.tabDotActive : ''}`} style={{ background: '#818cf8' }} />
                            Tasks
                        </button>

                        <button
                            onClick={() => setActiveTab('files')}
                            className={`${styles.tabBtn} ${activeTab === 'files' ? styles.tabBtnActive : ''}`}
                            style={{ borderBottomColor: activeTab === 'files' ? 'var(--accent-danger)' : 'transparent' }}
                        >
                            <div className={`${styles.tabDot} ${activeTab === 'files' ? styles.tabDotActive : ''}`} style={{ background: 'var(--accent-danger)' }} />
                            Files
                        </button>

                        <button
                            onClick={() => setActiveTab('meetings')}
                            className={`${styles.tabBtn} ${activeTab === 'meetings' ? styles.tabBtnActive : ''}`}
                            style={{ borderBottomColor: activeTab === 'meetings' ? '#fbbf24' : 'transparent' }}
                        >
                            <div className={`${styles.tabDot} ${activeTab === 'meetings' ? styles.tabDotActive : ''}`} style={{ background: '#fbbf24' }} />
                            Meetings
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className={styles.contentArea}>

                    {/* CHAT VIEW */}
                    {activeTab === 'chat' && (
                        <>
                            <div className={styles.chatContainer}>
                                {messages.map((msg, idx) => {
                                    const isMe = msg.senderId === user?.id;
                                    const prevMsg = messages[idx - 1];
                                    const isSequence = prevMsg && prevMsg.senderId === msg.senderId && (new Date(msg.createdAt) - new Date(prevMsg.createdAt) < 60000);

                                    return (
                                        <div key={msg.id} className={styles.messageWrapper} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', marginTop: isSequence ? '2px' : '24px', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                                            {!isSequence && (
                                                <div className={styles.msgHeader} style={{ flexDirection: isMe ? 'row-reverse' : 'row' }}>
                                                    <img
                                                        src={msg.sender?.avatarUrl || `https://ui-avatars.com/api/?name=${msg.sender?.name || 'User'}&background=random`}
                                                        alt=""
                                                        className={styles.msgAvatar}
                                                    />
                                                    <span className={styles.msgSender}>{msg.sender?.name}</span>
                                                    <span className={styles.msgTime}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            )}
                                            <div className={`${styles.msgBubble} ${isMe ? styles.msgBubbleMe : styles.msgBubbleOthers}`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Input Area (Floating) */}
                            <div className={styles.inputArea}>
                                <form onSubmit={handleSendMessage} className={styles.inputForm}>
                                    <input
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        placeholder="Type your message..."
                                        className={styles.chatInput}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!chatInput.trim() || sending}
                                        className={`${styles.sendBtn} ${chatInput.trim() ? styles.sendBtnActive : ''}`}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                    </button>
                                </form>
                            </div>
                        </>
                    )}

                    {/* TASKS VIEW */}
                    {activeTab === 'tasks' && (
                        <div style={{ height: '100%', padding: '80px 24px 24px 24px', overflow: 'hidden' }}>
                            <KanbanBoard projectId={id} />
                        </div>
                    )}

                    {/* FILES VIEW */}
                    {activeTab === 'files' && (
                        <ProjectFiles project={project} onUpdate={setProject} />
                    )}

                    {/* MEETINGS VIEW */}
                    {activeTab === 'meetings' && (
                        <MeetingList project={project} />
                    )}

                </div>

            </div>
        </div >
    );
};

// Helper for input fields (Outside component to prevent focus loss)
const InputField = ({ label, value, field, placeholder, multiline = false, editing, onChange }) => (
    <div className={styles.inputField}>
        <label className={styles.inputLabel}>{label}</label>
        {editing ? (
            multiline ? (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={styles.textArea}
                    placeholder={placeholder}
                />
            ) : (
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={styles.textInput}
                    placeholder={placeholder}
                />
            )
        ) : (
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <p className={styles.readOnlyText}>{value || 'Not set.'}</p>
            </div>
        )}
    </div>
);

export default ProjectDashboard;
