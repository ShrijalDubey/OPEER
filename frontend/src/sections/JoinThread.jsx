import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import styles from './JoinThread.module.css';

const INITIAL_SHOW = 17;

const JoinThread = () => {
  const location = useLocation();
  const { user, isLoggedIn } = useAuth();
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinedSlugs, setJoinedSlugs] = useState(new Set());
  const [actionSlug, setActionSlug] = useState(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_SHOW);

  // Create thread state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', slug: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    if (location.state?.query) {
      setSearchTerm(location.state.query);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Fetch threads
  const fetchThreads = () => {
    fetch('/api/threads')
      .then((res) => res.json())
      .then((data) => {
        setThreads(data.threads || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchThreads(); }, []);

  // Fetch joined threads
  useEffect(() => {
    if (isLoggedIn) {
      const token = localStorage.getItem('opeer_token');
      fetch('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          const slugs = (data.user?.joinedThreads || []).map((t) => t.slug);
          setJoinedSlugs(new Set(slugs));
        })
        .catch(() => { });
    }
  }, [isLoggedIn]);

  const handleJoin = async (slug) => {
    if (!isLoggedIn) {
      toast.warn('Please login first to join a thread.');
      return;
    }
    setActionSlug(slug);
    try {
      const token = localStorage.getItem('opeer_token');
      const res = await fetch(`/api/threads/${slug}/join`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setJoinedSlugs((prev) => new Set([...prev, slug]));
        setThreads((prev) => prev.map((t) => t.slug === slug ? { ...t, memberCount: t.memberCount + 1 } : t));
        toast.success(`Joined /${slug}`);
      } else {
        const d = await res.json();
        if (d.error?.includes('Already')) {
          setJoinedSlugs((prev) => new Set([...prev, slug]));
          toast.info(`Already in /${slug}`);
        } else {
          toast.error(d.error || 'Failed to join');
        }
      }
    } catch { toast.error('Something went wrong'); }
    finally { setActionSlug(null); }
  };

  const handleLeave = async (slug) => {
    const ok = await toast.confirm(`Leave /${slug}? You can rejoin later.`);
    if (!ok) return;
    setActionSlug(slug);
    try {
      const token = localStorage.getItem('opeer_token');
      const res = await fetch(`/api/threads/${slug}/leave`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setJoinedSlugs((prev) => {
          const next = new Set(prev);
          next.delete(slug);
          return next;
        });
        setThreads((prev) => prev.map((t) => t.slug === slug ? { ...t, memberCount: Math.max(0, t.memberCount - 1) } : t));
        toast.success(`Left /${slug}`);
      } else { toast.error('Failed to leave thread'); }
    } catch { toast.error('Something went wrong'); }
    finally { setActionSlug(null); }
  };

  // Auto-generate slug from name
  const handleCreateNameChange = (name) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    setCreateForm({ ...createForm, name, slug });
  };

  const handleCreateThread = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) { toast.warn('Please login first.'); return; }
    if (!createForm.name || !createForm.slug) { setCreateError('Name and slug are required.'); return; }
    setCreating(true);
    setCreateError('');
    try {
      const token = localStorage.getItem('opeer_token');
      const res = await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(createForm),
      });
      if (res.ok) {
        const data = await res.json();
        setShowCreateModal(false);
        setCreateForm({ name: '', slug: '', description: '' });
        fetchThreads();
        if (data.thread?.slug) {
          setJoinedSlugs((prev) => new Set([...prev, data.thread.slug]));
        }
        toast.success(`Created /${data.thread?.slug || createForm.slug}!`);
      } else {
        const d = await res.json();
        setCreateError(d.error || 'Failed to create thread');
      }
    } catch { setCreateError('Something went wrong'); }
    finally { setCreating(false); }
  };

  const filteredThreads = threads.filter(
    (thread) =>
      thread.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thread.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (thread.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const visibleThreads = searchTerm
    ? filteredThreads
    : filteredThreads.slice(0, visibleCount);

  const hasMore = !searchTerm && filteredThreads.length > visibleCount;

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + INITIAL_SHOW);
  };

  // Skeleton cards
  const SkeletonCard = () => (
    <div className={styles.card} style={{ pointerEvents: 'none' }}>
      <div className={styles.cardTop}>
        <div className="skeleton" style={{ width: '120px', height: '20px' }}></div>
        <div className="skeleton" style={{ width: '80px', height: '16px' }}></div>
      </div>
      <div className="skeleton" style={{ width: '100%', height: '14px', marginTop: '12px' }}></div>
      <div className="skeleton" style={{ width: '70%', height: '14px', marginTop: '8px' }}></div>
      <div className="skeleton" style={{ width: '100%', height: '38px', marginTop: '20px', borderRadius: '8px' }}></div>
    </div>
  );

  return (
    <section className={styles.section} id="join-thread">
      <div className={styles.container}>
        <div className={`${styles.header} fadeInUp`}>
          <h2 className={styles.title}>
            Find Your <span className={styles.highlight}>Campus Hub</span>
          </h2>
          <p className={styles.subtitle}>
            Connect with peers who are actually building things. <br />
            Join a thread to start collaborating.
          </p>
        </div>

        <div className={`${styles.searchWrapper} fadeInUp`} style={{ animationDelay: '80ms' }}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search for your college..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className={styles.searchIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        </div>

        {loading ? (
          <div className={`${styles.grid} stagger`}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <>
            <div className={`${styles.grid} stagger`}>
              {visibleThreads.length > 0 ? (
                visibleThreads.map((thread) => {
                  const isJoined = joinedSlugs.has(thread.slug);
                  const isBusy = actionSlug === thread.slug;
                  return (
                    <div key={thread.id} className={`${styles.card} fadeInUp`}>
                      <div className={styles.cardTop}>
                        <h3 className={styles.threadName}>
                          <span>/</span>{thread.slug}
                        </h3>
                        <div className={styles.statsBadge}>
                          <div className={styles.onlineDot}></div>
                          {thread.memberCount} members
                        </div>
                      </div>

                      <p className={styles.threadDesc}>{thread.description}</p>

                      {isJoined ? (
                        <button
                          className={`${styles.joinBtn} ${styles.leaveBtn}`}
                          onClick={() => handleLeave(thread.slug)}
                          disabled={isBusy}
                        >
                          {isBusy ? <span className="spinner"></span> : '✓ Joined · Leave'}
                        </button>
                      ) : (
                        <button
                          className={styles.joinBtn}
                          onClick={() => handleJoin(thread.slug)}
                          disabled={isBusy}
                        >
                          {isBusy ? <span className="spinner"></span> : (
                            <>
                              Join Thread
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14"></path>
                                <path d="M12 5l7 7-7 7"></path>
                              </svg>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className={styles.noResults}>
                  <p>No hubs found matching "{searchTerm}"</p>
                </div>
              )}

              {/* Create New Thread Card */}
              <div
                className={`${styles.card} ${styles.createCard} fadeInUp`}
                onClick={() => {
                  if (!isLoggedIn) { toast.warn('Please login first.'); return; }
                  setShowCreateModal(true);
                }}
              >
                <div className={styles.plusIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </div>
                <h3 className={styles.createTitle}>Your college missing?</h3>
                <p className={styles.createDesc}>Create a new thread for everyone.</p>
              </div>
            </div>

            {hasMore && (
              <div className="fadeInUp" style={{ textAlign: 'center', marginTop: '32px' }}>
                <button
                  className={styles.showMoreBtn}
                  onClick={handleShowMore}
                >
                  Show more threads
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '6px' }}>
                    <path d="M6 9l6 6 6-6"></path>
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── Create Thread Modal ─────────────────────── */}
      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Create a New Thread</h3>
            <p className={styles.modalSubtitle}>This thread will be visible to all users on OPEER.</p>

            <form onSubmit={handleCreateThread} className={styles.modalForm}>
              {createError && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' }}>
                  {createError}
                </div>
              )}

              <div className={styles.modalField}>
                <label>College / Hub Name</label>
                <input
                  type="text"
                  placeholder="e.g. IIT Bombay"
                  value={createForm.name}
                  onChange={(e) => handleCreateNameChange(e.target.value)}
                  required
                />
              </div>

              <div className={styles.modalField}>
                <label>Slug (auto-generated)</label>
                <input
                  type="text"
                  placeholder="e.g. iit-bombay"
                  value={createForm.slug}
                  onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value })}
                  required
                />
              </div>

              <div className={styles.modalField}>
                <label>Description</label>
                <input
                  type="text"
                  placeholder="Short description of the college"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="submit" className={styles.modalSubmitBtn} disabled={creating}>
                  {creating ? <><span className="spinner" style={{ width: 14, height: 14 }}></span> Creating...</> : 'Create Thread'}
                </button>
                <button type="button" className={styles.modalCancelBtn} onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default JoinThread;