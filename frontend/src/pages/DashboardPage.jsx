import { useState, useEffect } from 'react';
import { dashboardApi } from '../api';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardApi.stats()
      .then(setStats)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;
  if (error) return <div className="alert alert-error">{error}</div>;

  const statCards = [
    { label: 'Total Users',       value: stats?.total_users       ?? 0, icon: '👥', bg: 'rgba(108,71,255,0.15)' },
    { label: 'Courses',           value: stats?.total_courses      ?? 0, icon: '📚', bg: 'rgba(34,211,238,0.12)' },
    { label: 'Enrollments',       value: stats?.total_enrollments  ?? 0, icon: '🎯', bg: 'rgba(16,185,129,0.12)' },
    { label: 'Exams Created',     value: stats?.total_exams        ?? 0, icon: '📝', bg: 'rgba(245,158,11,0.12)' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <span className="badge badge-info">Live</span>
      </div>

      <div className="stats-grid">
        {statCards.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>
              {s.icon}
            </div>
            <div className="stat-info">
              <p className="label">{s.label}</p>
              <p className="value">{s.value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Enrollments */}
      <div className="card" style={{ marginTop: 8 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>Recent Enrollments</h2>
        {stats?.recent_enrollments?.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📋</div>
            <h3>No enrollments yet</h3>
            <p>When students enroll in courses, they'll appear here</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Course ID</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Enrolled</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recent_enrollments?.map(e => (
                  <tr key={e.id}>
                    <td>#{e.student_id}</td>
                    <td>#{e.course_id}</td>
                    <td>
                      <span className={`badge badge-${
                        e.status === 'completed' ? 'success' :
                        e.status === 'dropped'   ? 'danger'  : 'info'
                      }`}>
                        {e.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar" style={{ width: 80 }}>
                          <div className="progress-fill" style={{ width: `${e.progress_percent}%` }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {e.progress_percent.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td>{new Date(e.enrolled_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
