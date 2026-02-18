import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './ProfileSetup.module.css';

const ProfileSetup = () => {
    const { user, isLoggedIn, loading, refreshUser } = useAuth();
    const navigate = useNavigate();

    const [threads, setThreads] = useState([]);
    const [formData, setFormData] = useState({
        college: '',
        year: '',
        department: '',
        skills: '',
        bio: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Redirect if not logged in
    useEffect(() => {
        if (!loading && !isLoggedIn) {
            navigate('/', { replace: true });
        }
    }, [loading, isLoggedIn, navigate]);

    // If profile already complete, go home
    useEffect(() => {
        if (!loading && user?.college) {
            navigate('/', { replace: true });
        }
    }, [loading, user, navigate]);

    // Fetch available threads for the college dropdown
    useEffect(() => {
        fetch('/api/threads')
            .then((res) => res.json())
            .then((data) => setThreads(data.threads || []))
            .catch(() => { });
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.college) {
            setError('Please select your college.');
            return;
        }

        setSubmitting(true);

        try {
            const token = localStorage.getItem('opeer_token');

            // 1. Update user profile
            const profileRes = await fetch('/api/users/me', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    college: formData.college,
                    year: formData.year,
                    skills: formData.skills,
                    bio: formData.bio,
                }),
            });

            if (!profileRes.ok) {
                throw new Error('Failed to save profile');
            }

            // 2. Auto-join the selected college thread
            const thread = threads.find((t) => t.name === formData.college);
            if (thread) {
                await fetch(`/api/threads/${thread.slug}/join`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                });
            }

            // 3. Refresh user in context and navigate home
            await refreshUser();
            navigate('/', { replace: true });
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return null;

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>
                        Complete Your <span className={styles.highlight}>Profile</span>
                    </h1>
                    <p className={styles.subtitle}>
                        Welcome, <strong>{user?.name}</strong>! Tell us a bit about yourself so we can connect you with the right people.
                    </p>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    {error && <div className={styles.error}>{error}</div>}

                    {/* College */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>College / University *</label>
                        <select
                            name="college"
                            className={styles.select}
                            value={formData.college}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select your college</option>
                            {threads.map((t) => (
                                <option key={t.id} value={t.name}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGrid}>
                        {/* Year */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Year</label>
                            <select
                                name="year"
                                className={styles.select}
                                value={formData.year}
                                onChange={handleChange}
                            >
                                <option value="">Select year</option>
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

                        {/* Department */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Department</label>
                            <input
                                type="text"
                                name="department"
                                placeholder="e.g. Computer Science"
                                className={styles.input}
                                value={formData.department}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Skills */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Skills</label>
                        <input
                            type="text"
                            name="skills"
                            placeholder="e.g. React, Python, Machine Learning (comma separated)"
                            className={styles.input}
                            value={formData.skills}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Bio */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Short Bio</label>
                        <textarea
                            name="bio"
                            placeholder="What are you passionate about? What do you want to build?"
                            className={styles.textarea}
                            value={formData.bio}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={submitting}
                    >
                        {submitting ? 'Saving...' : 'Launch My Profile'}
                    </button>
                </form>
            </div>
        </section>
    );
};

export default ProfileSetup;
