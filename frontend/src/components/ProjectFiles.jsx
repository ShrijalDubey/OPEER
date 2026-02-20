
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const ProjectFiles = ({ project, onUpdate }) => {
    const { user } = useAuth();
    const toast = useToast();
    const [isAdding, setIsAdding] = useState(false);
    const [newFile, setNewFile] = useState({ name: '', url: '', type: 'link' });
    const [loading, setLoading] = useState(false);

    const isOwner = project.authorId === user?.id;
    const files = project.files || []; // JSON array

    const handleAddFile = async () => {
        if (!newFile.name || !newFile.url) {
            toast.error('Name and URL are required');
            return;
        }

        setLoading(true);
        const updatedFiles = [...files, { ...newFile, uploadedAt: new Date().toISOString() }];

        try {
            const token = localStorage.getItem('opeer_token');
            const res = await fetch(`/api/projects/${project.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ files: updatedFiles })
            });

            if (res.ok) {
                const data = await res.json();
                onUpdate(data.project);
                setNewFile({ name: '', url: '', type: 'link' });
                setIsAdding(false);
                toast.success('Link added');
            } else {
                toast.error('Failed to add link');
            }
        } catch (err) {
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteFile = async (index) => {
        if (!confirm('Are you sure you want to remove this link?')) return;

        setLoading(true);
        const updatedFiles = files.filter((_, i) => i !== index);

        try {
            const token = localStorage.getItem('opeer_token');
            const res = await fetch(`/api/projects/${project.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ files: updatedFiles })
            });

            if (res.ok) {
                const data = await res.json();
                onUpdate(data.project);
                toast.success('Link removed');
            } else {
                toast.error('Failed to remove link');
            }
        } catch (err) {
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'docs': return '📄';
            case 'image': return '🖼️';
            case 'video': return '🎥';
            default: return '🔗';
        }
    };

    return (
        <div style={{ height: '100%', padding: '80px 24px 24px 24px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#fafafa', margin: 0 }}>Project Resources</h2>
                {isOwner && (
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        style={{ background: '#4f46e5', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                    >
                        {isAdding ? 'Cancel' : '+ Add Link'}
                    </button>
                )}
            </div>

            {isAdding && (
                <div style={{ background: '#27272a', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #3f3f46' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px auto', gap: '12px', alignItems: 'end' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '11px', color: '#a1a1aa' }}>Name</label>
                            <input
                                value={newFile.name}
                                onChange={e => setNewFile({ ...newFile, name: e.target.value })}
                                placeholder="e.g. Design Specs"
                                style={{ background: '#18181b', border: '1px solid #3f3f46', padding: '8px', borderRadius: '6px', color: '#fff', fontSize: '13px', outline: 'none' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '11px', color: '#a1a1aa' }}>URL</label>
                            <input
                                value={newFile.url}
                                onChange={e => setNewFile({ ...newFile, url: e.target.value })}
                                placeholder="https://..."
                                style={{ background: '#18181b', border: '1px solid #3f3f46', padding: '8px', borderRadius: '6px', color: '#fff', fontSize: '13px', outline: 'none' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '11px', color: '#a1a1aa' }}>Type</label>
                            <select
                                value={newFile.type}
                                onChange={e => setNewFile({ ...newFile, type: e.target.value })}
                                style={{ background: '#18181b', border: '1px solid #3f3f46', padding: '8px', borderRadius: '6px', color: '#fff', fontSize: '13px', outline: 'none' }}
                            >
                                <option value="link">Link</option>
                                <option value="docs">Doc</option>
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                            </select>
                        </div>
                        <button
                            onClick={handleAddFile}
                            disabled={loading}
                            style={{ background: '#22c55e', color: '#000', border: 'none', padding: '9px 16px', borderRadius: '6px', cursor: loading ? 'default' : 'pointer', fontWeight: '600', fontSize: '13px', opacity: loading ? 0.7 : 1 }}
                        >
                            {loading ? '...' : 'Save'}
                        </button>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {files.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#52525b', fontSize: '14px' }}>
                        No resources added yet.
                    </div>
                )}
                {files.map((file, idx) => (
                    <div key={idx} style={{ background: '#27272a', border: '1px solid #3f3f46', borderRadius: '12px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start', position: 'relative', transition: 'all 0.2s', cursor: 'pointer' }}
                        onClick={() => window.open(file.url, '_blank')}
                        onMouseEnter={e => e.currentTarget.style.borderColor = '#52525b'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = '#3f3f46'}
                    >
                        <div style={{ width: '40px', height: '40px', background: '#18181b', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                            {getIcon(file.type)}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontWeight: '600', color: '#fafafa', fontSize: '14px', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</div>
                            <div style={{ fontSize: '11px', color: '#a1a1aa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.url}</div>
                        </div>
                        {isOwner && (
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteFile(idx); }}
                                style={{ position: 'absolute', top: '8px', right: '8px', background: 'transparent', border: 'none', color: '#52525b', cursor: 'pointer', padding: '4px' }}
                                onMouseEnter={e => e.target.style.color = '#ef4444'}
                                onMouseLeave={e => e.target.style.color = '#52525b'}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectFiles;