
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import KanbanBoard from '../components/KanbanBoard';
import ProjectFiles from '../components/ProjectFiles';

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
        if (!loading && !isLoggedIn) { navigate('/'); return; }

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

    // Layout Styles
    const containerStyle = {
        display: 'grid',
        gridTemplateColumns: '380px 1fr', // Sidebar (Info Card) + Chat Card
        gridTemplateRows: '1fr',
        gap: '16px',
        height: 'calc(100vh - 112px)', // Adjust for Navbar
        padding: '16px',
        background: '#09090b',
        boxSizing: 'border-box',
        overflow: 'hidden'
    };

    const cardStyle = {
        background: '#18181b',
        borderRadius: '24px',
        border: '1px solid #27272a',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    };

    return (
        <div style={containerStyle}>
            {/* LEFT COLUMN: INFO (Single Card) */}
            <div style={{ ...cardStyle, padding: '24px', gap: '32px', overflowY: 'auto' }}>

                {/* 1. Header Section */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <button onClick={() => navigate('/projects')} style={{ background: '#27272a', border: 'none', width: '32px', height: '32px', borderRadius: '50%', color: '#a1a1aa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
                        {isOwner && (
                            <button
                                onClick={editingInfo ? handleSaveInfo : () => setEditingInfo(true)}
                                style={{ background: editingInfo ? '#4f46e5' : '#27272a', color: editingInfo ? '#fff' : '#a1a1aa', border: 'none', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                                {editingInfo ? 'Save' : 'Edit'}
                            </button>
                        )}
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 12px 0', color: '#fafafa', lineHeight: '1.2' }}>{project.title}</h2>
                    <p style={{ fontSize: '14px', color: '#d4d4d8', margin: 0, lineHeight: '1.6' }}>
                        {project.description}
                    </p>
                </div>

                <div style={{ width: '100%', height: '1px', background: '#27272a' }}></div>

                {/* 2. Goal Section */}
                <div>
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
                <div>
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
                <div>
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

                <div style={{ width: '100%', height: '1px', background: '#27272a' }}></div>

                {/* 5. Team Members */}
                <div>
                    <h3 style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Team Members</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Owner */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img
                                src={project.author?.avatarUrl || `https://ui-avatars.com/api/?name=${project.author?.name}&background=random`}
                                alt=""
                                style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid #818cf8' }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '13px', color: '#fafafa', fontWeight: '500' }}>{project.author?.name}</span>
                                <span style={{ fontSize: '10px', color: '#818cf8' }}>Owner</span>
                            </div>
                        </div>

                        {/* Members */}
                        {project.applications?.map((app) => (
                            <div key={app.user.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <img
                                    src={app.user.avatarUrl || `https://ui-avatars.com/api/?name=${app.user.name}&background=random`}
                                    alt=""
                                    style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid #3f3f46' }}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '13px', color: '#e4e4e7' }}>{app.user.name}</span>
                                    <span style={{ fontSize: '10px', color: '#71717a' }}>Member</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 6. Pending Requests (Owner Only) */}
                {isOwner && pendingApps.length > 0 && (
                    <>
                        <div style={{ width: '100%', height: '1px', background: '#27272a' }}></div>
                        <div>
                            <h3 style={{ fontSize: '11px', color: '#fbbf24', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fbbf24' }}></span>
                                Pending Requests
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {pendingApps.map((app) => (
                                    <div key={app.id} style={{ background: '#27272a', padding: '12px', borderRadius: '12px', border: '1px solid #3f3f46' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                            <img
                                                src={app.user.avatarUrl || `https://ui-avatars.com/api/?name=${app.user.name}&background=random`}
                                                alt=""
                                                style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                                            />
                                            <span style={{ fontSize: '13px', color: '#fff', fontWeight: '500' }}>{app.user.name}</span>
                                        </div>
                                        {app.message && <p style={{ fontSize: '12px', color: '#a1a1aa', margin: '0 0 10px 0', lineHeight: '1.4', fontStyle: 'italic' }}>"{app.message}"</p>}
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => handleAppStatus(app.id, 'accepted')}
                                                style={{ flex: 1, padding: '6px', background: '#4ade80', color: '#000', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleAppStatus(app.id, 'rejected')}
                                                style={{ flex: 1, padding: '6px', background: '#27272a', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* RIGHT COLUMN: CHAT (Single Card) */}
            <div style={{ ...cardStyle, position: 'relative', padding: 0, border: '1px solid #27272a', background: 'linear-gradient(135deg, #18181b 0%, #0c0c0e 100%)' }}>

                {/* Chat Header / Tab Bar */}
                <div style={{ padding: '0 24px', borderBottom: '1px solid #27272a', display: 'flex', alignItems: 'center', background: 'rgba(24, 24, 27, 0.8)', backdropFilter: 'blur(8px)', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, height: '60px' }}>
                    <div style={{ display: 'flex', gap: '24px', height: '100%' }}>
                        <button
                            onClick={() => setActiveTab('chat')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                borderBottom: activeTab === 'chat' ? '2px solid #22c55e' : '2px solid transparent',
                                color: activeTab === 'chat' ? '#fafafa' : '#71717a',
                                fontWeight: '600',
                                fontSize: '14px',
                                cursor: 'pointer',
                                padding: '0 4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                height: '100%'
                            }}
                        >
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', opacity: activeTab === 'chat' ? 1 : 0.5 }} />
                            Team Chat
                            <span style={{ fontSize: '10px', background: '#27272a', padding: '2px 6px', borderRadius: '10px', color: '#a1a1aa' }}>{messages.length}</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('tasks')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                borderBottom: activeTab === 'tasks' ? '2px solid #818cf8' : '2px solid transparent',
                                color: activeTab === 'tasks' ? '#fafafa' : '#71717a',
                                fontWeight: '600',
                                fontSize: '14px',
                                cursor: 'pointer',
                                padding: '0 4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                height: '100%'
                            }}
                        >
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#818cf8', opacity: activeTab === 'tasks' ? 1 : 0.5 }} />
                            Tasks (Kanban)
                        </button>

                        <button
                            onClick={() => setActiveTab('files')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                borderBottom: activeTab === 'files' ? '2px solid #ef4444' : '2px solid transparent',
                                color: activeTab === 'files' ? '#fafafa' : '#71717a',
                                fontWeight: '600',
                                fontSize: '14px',
                                cursor: 'pointer',
                                padding: '0 4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                height: '100%'
                            }}
                        >
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', opacity: activeTab === 'files' ? 1 : 0.5 }} />
                            Files
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div style={{ flex: 1, position: 'relative', height: '100%', overflow: 'hidden' }}>

                    {/* CHAT VIEW */}
                    {activeTab === 'chat' && (
                        <>
                            <div style={{ height: '100%', overflowY: 'auto', padding: '80px 24px 100px 24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {messages.map((msg, idx) => {
                                    const isMe = msg.senderId === user?.id;
                                    const prevMsg = messages[idx - 1];
                                    const isSequence = prevMsg && prevMsg.senderId === msg.senderId && (new Date(msg.createdAt) - new Date(prevMsg.createdAt) < 60000);

                                    return (
                                        <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '65%', marginTop: isSequence ? '2px' : '24px', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                                            {!isSequence && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexDirection: isMe ? 'row-reverse' : 'row' }}>
                                                    <img
                                                        src={msg.sender?.avatarUrl || `https://ui-avatars.com/api/?name=${msg.sender?.name || 'User'}&background=random`}
                                                        alt=""
                                                        style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #27272a' }}
                                                    />
                                                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#a1a1aa' }}>{msg.sender?.name}</span>
                                                    <span style={{ fontSize: '10px', color: '#52525b' }}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            )}
                                            <div style={{
                                                background: isMe ? '#4f46e5' : '#27272a',
                                                color: isMe ? '#fff' : '#e4e4e7',
                                                padding: '12px 18px',
                                                borderRadius: isMe ? '20px 4px 20px 20px' : '4px 20px 20px 20px',
                                                fontSize: '14px',
                                                lineHeight: '1.5',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                            }}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Input Area (Floating) */}
                            <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24 }}>
                                <form onSubmit={handleSendMessage} style={{ background: '#27272a', padding: '8px', borderRadius: '60px', display: 'flex', alignItems: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', border: '1px solid #3f3f46' }}>
                                    <input
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        placeholder="Type your message..."
                                        style={{ flex: 1, background: 'transparent', border: 'none', padding: '12px 24px', color: '#fff', fontSize: '14px', outline: 'none' }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!chatInput.trim() || sending}
                                        style={{ width: '44px', height: '44px', borderRadius: '50%', background: chatInput.trim() ? '#4f46e5' : '#3f3f46', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: chatInput.trim() ? 'pointer' : 'default', transition: 'all 0.2s' }}
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

                </div>

            </div>
        </div>
    );
};

// Helper for input fields (Outside component to prevent focus loss)
const InputField = ({ label, value, field, placeholder, multiline = false, editing, onChange }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minHeight: 0 }}>
        <label style={{ fontSize: '11px', color: '#71717a', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
        {editing ? (
            multiline ? (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={{ width: '100%', flex: 1, padding: '12px', background: '#09090b', border: '1px solid #3f3f46', borderRadius: '12px', color: '#fafafa', fontSize: '13px', lineHeight: '1.5', resize: 'none', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit' }}
                    placeholder={placeholder}
                />
            ) : (
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={{ width: '100%', padding: '12px', background: '#09090b', border: '1px solid #3f3f46', borderRadius: '12px', color: '#fafafa', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}
                    placeholder={placeholder}
                />
            )
        ) : (
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <p style={{ fontSize: '14px', color: value ? '#fafafa' : '#52525b', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{value || 'Not set.'}</p>
            </div>
        )}
    </div>
);

export default ProjectDashboard;
