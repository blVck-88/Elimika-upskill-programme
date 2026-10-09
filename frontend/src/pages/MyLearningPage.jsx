import { useState, useEffect } from 'react';
import { enrollmentsApi } from '../api';

export default function MyLearningPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    enrollmentsApi.myEnrollments()
      .then(setEnrollments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateProgress = async (enrollment, newProgress) => {
    try {
      const updated = await enrollmentsApi.updateProgress(enrollment.id, newProgress);
      setEnrollments(prev => prev.map(e => e.id === updated.id ? updated : e));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div className="page-header">
        <h1>My Learning</h1>
        <span className="badge badge-primary">{enrollments.length} courses</span>
      </div>

      {enrollments.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🎯</div>
          <h3>No enrollments yet</h3>
          <p>Explore courses and start learning new marketable skills!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {enrollments.map(e => (
            <div key={e.id} className="card" style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{
                width: 60, height: 60, borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.6rem', flexShrink: 0,
              }}>
                📖
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>
                    {e.course?.title || `Course #${e.course_id}`}
                  </h3>
                  <span className={`badge badge-${
                    e.status === 'completed' ? 'success' :
                    e.status === 'dropped'   ? 'danger'  : 'info'
                  }`}>
                    {e.status}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-fill" style={{ width: `${e.progress_percent}%` }} />
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', minWidth: 36 }}>
                    {e.progress_percent.toFixed(0)}%
                  </span>
                </div>
                {e.status === 'active' && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[25, 50, 75, 100].map(pct => (
                      <button
                        key={pct}
                        id={`progress-${e.id}-${pct}`}
                        className="btn btn-outline btn-sm"
                        disabled={e.progress_percent >= pct}
                        onClick={() => updateProgress(e, pct)}
                      >
                        Mark {pct}%
                      </button>
                    ))}
                  </div>
                )}
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 8 }}>
                  Enrolled {new Date(e.enrolled_at).toLocaleDateString()}
                  {e.completed_at && ` · Completed ${new Date(e.completed_at).toLocaleDateString()}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
