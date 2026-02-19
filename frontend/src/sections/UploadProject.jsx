import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import styles from './UploadProject.module.css';

const UploadProject = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, loading } = useAuth();
  const toast = useToast();
  const [threads, setThreads] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    threadSlug: '',
    skills: '',
    dept: '',
    year: '',
    github: '',
  });

  const hasWarnedRef = React.useRef(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !isLoggedIn && !hasWarnedRef.current) {
      hasWarnedRef.current = true;
      toast.warn('Please login first to upload a project.');
      navigate('/', { replace: true });
    }
  }, [loading, isLoggedIn, navigate, toast]);

  // Fetch only user's joined threads for the dropdown
  useEffect(() => {
    if (!isLoggedIn) return;
    const token = localStorage.getItem('opeer_token');
    fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        const joined = data.user?.joinedThreads || [];
        // Map to same shape as thread list
        setThreads(joined.map((t) => ({ id: t.id, slug: t.slug, name: t.name })));
      })
      .catch(() => { });
  }, [isLoggedIn]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.description || !formData.threadSlug) {
      setError('Title, description, and target campus hub are required.');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('opeer_token');
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          threadSlug: formData.threadSlug,
          skills: formData.skills,
          dept: formData.dept,
          year: formData.year,
          githubUrl: formData.github,
        }),
      });

      if (res.ok) {
        navigate('/join-project');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to upload project');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <section className={styles.section} id="upload">
      <div className={styles.container}>
        <div className={`${styles.header} fadeInUp`}>
          <h1 className={styles.title}>Ship Your <span className={styles.highlight}>Idea</span></h1>
          <p style={{ color: '#a1a1aa', fontSize: '18px' }}>List your project to find the perfect collaborators on campus.</p>
        </div>

        <form className={`${styles.uploadCard} fadeInUp`} onSubmit={handleSubmit} style={{ animationDelay: '80ms' }}>
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              marginBottom: '20px',
            }}>
              {error}
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>Project Name</label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Autonomous Delivery Drone"
              className={styles.input}
              required
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Deep Description</label>
            <textarea
              name="description"
              placeholder="What are you building? What is the end goal?"
              className={styles.textarea}
              required
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Target Campus Hub</label>
              <select
                name="threadSlug"
                className={styles.select}
                required
                value={formData.threadSlug}
                onChange={handleChange}
              >
                <option value="">Select Thread</option>
                {threads.map((t) => (
                  <option key={t.id} value={t.slug}>
                    /{t.slug} — {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Relevant Department</label>
              <input
                type="text"
                name="dept"
                placeholder="e.g. Computer Science"
                className={styles.input}
                value={formData.dept}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Skills Needed Before Joining</label>
            <input
              type="text"
              name="skills"
              placeholder="e.g. React, Python, OpenCV (comma separated)"
              className={styles.input}
              required
              value={formData.skills}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Eligibility (Year)</label>
              <input
                type="text"
                name="year"
                placeholder="e.g. 2nd Year + / Any"
                className={styles.input}
                value={formData.year}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Repository / Documentation Link</label>
              <input
                type="url"
                name="github"
                placeholder="https://github.com/..."
                className={styles.input}
                value={formData.github}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.actionArea}>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={submitting}
            >
              {submitting ? <><span className="spinner" style={{ width: 16, height: 16 }}></span> Publishing...</> : 'Launch Project Recruitment'}
            </button>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default UploadProject;