import React, { useState } from 'react';
import styles from './CreateMeetingModal.module.css';

const CreateMeetingModal = ({ onClose, onSave }) => {
    const [form, setForm] = useState({
        title: '',
        purpose: '',
        link: '',
        date: '',
        time: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Combine date and time into ISO strings
        const start = new Date(`${form.date}T${form.time}`);
        // Default duration 1 hour for now, or just use same time
        const end = new Date(start.getTime() + 60 * 60 * 1000);

        onSave({
            ...form,
            startTime: start.toISOString(),
            endTime: end.toISOString()
        });
    };

    // Get current date/time for min attribute
    const now = new Date();
    const isoString = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <h3>Schedule Team Meeting</h3>
                        <p>Plan your next sync with the team.</p>
                    </div>
                    <button onClick={onClose} className={styles.closeBtn}>×</button>
                </div>

                <form onSubmit={handleSubmit} className={styles.body}>
                    <div className={styles.formGroup}>
                        <label>Title</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Weekly Sync"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            autoFocus
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Purpose <span className={styles.optional}>(Optional)</span></label>
                        <textarea
                            placeholder="What's this meeting about?"
                            value={form.purpose}
                            onChange={e => setForm({ ...form, purpose: e.target.value })}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Meeting Link</label>
                        <input
                            type="url"
                            placeholder="https://meet.google.com/..."
                            value={form.link}
                            onChange={e => setForm({ ...form, link: e.target.value })}
                        />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>Date</label>
                            <input
                                type="date"
                                required
                                min={new Date().toISOString().split('T')[0]}
                                value={form.date}
                                onChange={e => setForm({ ...form, date: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Time</label>
                            <input
                                type="time"
                                required
                                value={form.time}
                                onChange={e => setForm({ ...form, time: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className={styles.footer}>
                        <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancel</button>
                        <button type="submit" className={styles.saveBtn}>
                            Schedule Meeting
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateMeetingModal;
