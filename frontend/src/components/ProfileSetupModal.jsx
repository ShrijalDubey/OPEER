import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/animations.css';
import styles from './ProfileSetupModal.module.css';

const ProfileSetupModal = () => {
    const { user, isLoggedIn, loading, isProfileComplete, refreshUser } = useAuth();

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
    const [searchCollege, setSearchCollege] = useState('');

    // Fetch threads for dropdown
    useEffect(() => {
        if (isLoggedIn && !isProfileComplete) {
            fetch('/api/threads')
                .then((res) => res.json())
                .then((data) => setThreads(data.threads || []))
                .catch(() => { });
        }
    }, [isLoggedIn, isProfileComplete]);

    // Don't render if not needed
    if (loading || !isLoggedIn || isProfileComplete) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const allFilled = formData.college && formData.year && formData.skills.trim() && formData.bio.trim();

    // Filter colleges for search
    const filteredColleges = threads.filter(
        (t) =>
            t.name.toLowerCase().includes(searchCollege.toLowerCase()) ||
            t.slug.toLowerCase().includes(searchCollege.toLowerCase()) ||
            (t.description || '').toLowerCase().includes(searchCollege.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!allFilled) {
            setError('All fields are required. Please fill everything.');
            return;
        }

        setSubmitting(true);

        try {
            const token = localStorage.getItem('opeer_token');

            const collegeName = formData.college === '__none__' ? 'Other' : formData.college;

            // Save profile
            const res = await fetch('/api/users/me', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    college: collegeName,
                    year: formData.year,
                    skills: formData.skills,
                    bio: formData.bio,
                }),
            });

            if (!res.ok) throw new Error('Failed to save profile');

            // Auto-join college thread (skip for "none")
            if (formData.college !== '__none__') {
                const thread = threads.find((t) => t.name === formData.college);
                if (thread) {
                    await fetch(`/api/threads/${thread.slug}/join`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}` },
                    }).catch(() => { }); // ignore if already joined
                }
            }

            await refreshUser();
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <div className={styles.avatarCircle}>
                        {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className={styles.avatarImg} />
                        ) : (
                            <span>{user?.name?.charAt(0)?.toUpperCase()}</span>
                        )}
                    </div>
                    <h2 className={styles.title}>
                        Welcome, <span className={styles.highlight}>{user?.name?.split(' ')[0]}</span>
                    </h2>
                    <p className={styles.subtitle}>Let's complete your profile so peers can find you.</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.field}>
                        <label>College / University <span className={styles.req}>*</span></label>
                        <input
                            type="text"
                            name="college"
                            list="colleges"
                            placeholder="Type your college name..."
                            value={formData.college}
                            onChange={handleChange}
                            required
                        />
                        <datalist id="colleges">
                            {threads.map((t) => (
                                <option key={t.id} value={t.name} />
                            ))}
                        </datalist>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label>Year <span className={styles.req}>*</span></label>
                            <select name="year" value={formData.year} onChange={handleChange} required>
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

                        <div className={styles.field}>
                            <label>Department</label>
                            <input
                                type="text"
                                name="department"
                                placeholder="e.g. Computer Science"
                                value={formData.department}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label>Skills <span className={styles.req}>*</span></label>
                        <input
                            type="text"
                            name="skills"
                            placeholder="React, Python, ML (comma separated)"
                            value={formData.skills}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Bio <span className={styles.req}>*</span></label>
                        <textarea
                            name="bio"
                            placeholder="I'm passionate about building..."
                            value={formData.bio}
                            onChange={handleChange}
                            rows={3}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.btn}
                        disabled={submitting || !allFilled}
                    >
                        {submitting ? (
                            <><span className="spinner" style={{ width: 16, height: 16 }} /> Saving...</>
                        ) : (
                            'Complete Profile →'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileSetupModal;
