import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ApplyProjectModal = ({ isOpen, onClose, projectId, projectTitle, onApply }) => {
    const { user } = useAuth();
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        setSubmitting(true);
        try {
            await onApply(projectId, message);
            onClose();
            setMessage('');
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const inputStyle = {
        width: '100%', padding: '10px 14px', background: '#09090b',
        border: '1px solid #3f3f46', borderRadius: '10px', color: '#fafafa',
        fontSize: '13px', lineHeight: '1.5', outline: 'none',
        fontFamily: 'inherit', boxSizing: 'border-box',
        transition: 'border-color 0.2s'
    };

    const labelStyle = {
        fontSize: '11px', color: '#71717a', fontWeight: '600',
        textTransform: 'uppercase', letterSpacing: '0.5px',
        display: 'block', marginBottom: '6px'
    };

    const pillStyle = {
        background: '#27272a', color: '#a1a1aa', padding: '3px 10px',
        borderRadius: '20px', fontSize: '11px', fontWeight: '500'
    };

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                backdropFilter: 'blur(8px)'
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: '#18181b', borderRadius: '20px', padding: '0',
                    width: '100%', maxWidth: '520px', border: '1px solid #27272a',
                    boxShadow: '0 24px 48px rgba(0,0,0,0.6)', overflow: 'hidden'
                }}
            >
                {/* Header */}
                <div style={{ padding: '24px 28px 16px', borderBottom: '1px solid #27272a' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fafafa', margin: '0 0 4px 0' }}>
                                Apply to Join
                            </h3>
                            <p style={{ fontSize: '13px', color: '#71717a', margin: 0 }}>
                                {projectTitle}
                            </p>
                        </div>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: '4px', fontSize: '20px', lineHeight: 1 }}>×</button>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '60vh', overflowY: 'auto' }}>

                        {/* Your Profile Preview */}
                        <div style={{ background: '#0f0f11', border: '1px solid #27272a', borderRadius: '12px', padding: '14px 16px' }}>
                            <label style={{ ...labelStyle, marginBottom: '10px' }}>Your Profile</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                <img
                                    src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name}&background=random`}
                                    alt=""
                                    style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #3f3f46' }}
                                />
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#fafafa' }}>{user?.name}</div>
                                    <div style={{ fontSize: '11px', color: '#71717a' }}>{user?.email}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                                {user?.college && <span style={pillStyle}>🎓 {user.college}</span>}
                                {user?.year && <span style={pillStyle}>📅 {user.year}</span>}
                            </div>

                            {user?.skills?.length > 0 && (
                                <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                    {user.skills.map((skill, i) => (
                                        <span key={i} style={{
                                            background: 'rgba(79,70,229,0.12)', color: '#818cf8',
                                            padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '600'
                                        }}>
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {user?.bio && (
                                <p style={{ fontSize: '12px', color: '#a1a1aa', margin: '8px 0 0 0', lineHeight: '1.5', fontStyle: 'italic' }}>
                                    "{user.bio}"
                                </p>
                            )}
                        </div>

                        {/* Contribution Message */}
                        <div>
                            <label style={labelStyle}>How would you like to contribute? <span style={{ color: '#ef4444' }}>*</span></label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="e.g. I can help with the React frontend and have experience building authentication flows. I'm also familiar with the tech stack used in this project..."
                                rows={5}
                                required
                                style={{ ...inputStyle, resize: 'none' }}
                                onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                                onBlur={(e) => e.target.style.borderColor = '#3f3f46'}
                            />
                            <div style={{ fontSize: '11px', color: '#52525b', marginTop: '4px', textAlign: 'right' }}>
                                {message.length} characters
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{
                        padding: '16px 28px', borderTop: '1px solid #27272a',
                        display: 'flex', gap: '10px', justifyContent: 'flex-end',
                        background: '#141416'
                    }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '10px 20px', background: '#27272a', color: '#a1a1aa',
                                border: 'none', borderRadius: '10px', fontSize: '13px',
                                fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !message.trim()}
                            style={{
                                padding: '10px 24px', background: submitting || !message.trim() ? '#3f3f46' : '#4f46e5',
                                color: submitting || !message.trim() ? '#71717a' : '#fff',
                                border: 'none', borderRadius: '10px', fontSize: '13px',
                                fontWeight: '600', cursor: submitting || !message.trim() ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: submitting || !message.trim() ? 'none' : '0 4px 12px rgba(79,70,229,0.3)'
                            }}
                        >
                            {submitting ? 'Sending...' : 'Submit Application'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApplyProjectModal;
