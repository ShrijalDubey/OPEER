import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import CreateMeetingModal from './CreateMeetingModal';
import styles from './MeetingList.module.css';

const MeetingList = ({ project }) => {
    const { id } = useParams();
    const { user } = useAuth();
    const toast = useToast();
    const [meetings, setMeetings] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);

    const isOwner = project?.authorId === user?.id;

    useEffect(() => {
        fetchMeetings();
    }, [id]);

    const fetchMeetings = async () => {
        try {
            const token = localStorage.getItem('opeer_token');
            const res = await fetch(`/api/projects/${id}/meetings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMeetings(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateMeeting = async (meetingData) => {
        try {
            const token = localStorage.getItem('opeer_token');
            const res = await fetch(`/api/projects/${id}/meetings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(meetingData)
            });

            if (res.ok) {
                toast.success('Meeting scheduled!');
                setShowModal(false);
                fetchMeetings();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to schedule meeting');
            }
        } catch (error) {
            toast.error('Something went wrong');
        }
    };

    const handleDeleteMeeting = async (meetingId) => {
        if (!await toast.confirm('Cancel this meeting?')) return;

        try {
            const token = localStorage.getItem('opeer_token');
            const res = await fetch(`/api/projects/meetings/${meetingId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                toast.success('Meeting cancelled');
                fetchMeetings();
            } else {
                toast.error('Failed to cancel meeting');
            }
        } catch (error) {
            toast.error('Something went wrong');
        }
    };

    if (loading) return <div className={styles.loading}>Loading schedule...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>Team Schedule</h3>
                {isOwner && (
                    <button onClick={() => setShowModal(true)} className={styles.addBtn}>
                        + Schedule Meeting
                    </button>
                )}
            </div>

            <div className={styles.grid}>
                {meetings.length === 0 ? (
                    <div className={styles.emptyState}>No upcoming meetings.</div>
                ) : (
                    meetings.map(meeting => {
                        // Check if meeting is 5 mins past its start time
                        const meetingTime = new Date(meeting.startTime);
                        const isPast = new Date() > new Date(meetingTime.getTime() + 5 * 60000);

                        return (
                            <div
                                key={meeting.id}
                                className={`${styles.card} ${isPast ? styles.past : ''}`}
                            >
                                <div className={styles.cardHeader}>
                                    <div className={styles.dateBadge}>
                                        <span className={styles.month}>{meetingTime.toLocaleString('default', { month: 'short' })}</span>
                                        <span className={styles.day}>{meetingTime.getDate()}</span>
                                    </div>
                                    <div className={styles.meta}>
                                        <h4 className={styles.title}>{meeting.title}</h4>
                                        <span className={styles.time}>
                                            {meetingTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    {(isOwner || meeting.createdById === user?.id) && (
                                        <button
                                            onClick={() => handleDeleteMeeting(meeting.id)}
                                            className={styles.deleteBtn}
                                            title="Cancel Meeting"
                                        >×</button>
                                    )}
                                </div>

                                {meeting.purpose && (
                                    <p className={styles.purpose}>{meeting.purpose}</p>
                                )}

                                <div className={styles.footer}>
                                    <div className={styles.host}>
                                        <img
                                            src={meeting.createdBy?.avatarUrl || `https://ui-avatars.com/api/?name=${meeting.createdBy?.name}&background=random`}
                                            className={styles.avatar}
                                            alt=""
                                        />
                                        <span>Host: {meeting.createdBy?.name}</span>
                                    </div>
                                    {meeting.link && !isPast && (
                                        <a href={meeting.link} target="_blank" rel="noreferrer" className={styles.joinBtn}>
                                            Join Call →
                                        </a>
                                    )}
                                    {isPast && (
                                        <span className={styles.endedBadge}>Ended</span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {showModal && (
                <CreateMeetingModal
                    onClose={() => setShowModal(false)}
                    onSave={handleCreateMeeting}
                />
            )}
        </div>
    );
};

export default MeetingList;
