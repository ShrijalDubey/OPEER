
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        const token = localStorage.getItem('opeer_token');
        if (!token) return;
        try {
            const res = await fetch('/api/notifications', { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
            }
        } catch { /* ignore */ }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkRead = async (id, link) => {
        const token = localStorage.getItem('opeer_token');
        try {
            await fetch(`/api/notifications/${id}/read`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            if (link) {
                setIsOpen(false);
                navigate(link);
            }
        } catch { /* ignore */ }
    };

    const handleMarkAllRead = async () => {
        const token = localStorage.getItem('opeer_token');
        try {
            await fetch('/api/notifications/read-all', {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch { /* ignore */ }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'relative',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: isOpen ? '#fff' : '#a1a1aa',
                    padding: '8px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.background = '#27272a';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.color = isOpen ? '#fff' : '#a1a1aa';
                    e.currentTarget.style.background = 'none';
                }}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: '4px', right: '4px',
                        background: '#ef4444',
                        width: '8px', height: '8px', borderRadius: '50%',
                        border: '2px solid #18181b'
                    }}></span>
                )}
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '120%',
                    right: '0',  // Align to right edge of container to prevent overflow
                    width: '320px',
                    maxWidth: '90vw', // Responsive safety
                    background: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
                    zIndex: 50,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    transformOrigin: 'top right',
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#27272a' }}>
                        <span style={{ fontWeight: '600', color: '#fafafa', fontSize: '13px' }}>Notifications</span>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '11px', cursor: 'pointer', fontWeight: '500' }}
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '32px 16px', textAlign: 'center', color: '#71717a', fontSize: '13px' }}>
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n.id}
                                    onClick={() => handleMarkRead(n.id, n.link)}
                                    style={{
                                        padding: '12px 16px',
                                        borderBottom: '1px solid #27272a',
                                        cursor: 'pointer',
                                        background: n.read ? 'transparent' : 'rgba(129, 140, 248, 0.05)',
                                        transition: 'background 0.2s',
                                        position: 'relative',
                                        display: 'flex', gap: '12px'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#27272a'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(129, 140, 248, 0.05)'}
                                >
                                    <div style={{ paddingTop: '2px' }}>
                                        {!n.read ? (
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#818cf8' }} />
                                        ) : (
                                            <div style={{ width: '8px', height: '8px' }} />
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: n.read ? '#a1a1aa' : '#e4e4e7', lineHeight: '1.4' }}>
                                            {n.message}
                                        </p>
                                        <span style={{ fontSize: '11px', color: '#52525b' }}>
                                            {new Date(n.createdAt).toLocaleDateString()} • {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
