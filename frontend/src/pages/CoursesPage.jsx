import { useState, useEffect } from 'react';
import { coursesApi, enrollmentsApi } from '../api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Technology', 'Business', 'Design', 'Languages', 'Finance', 'Health', 'Arts'];
const LEVELS = ['beginner', 'intermediate', 'advanced'];

const EMOJI_BY_CATEGORY = {
  Technology: '💻', Business: '💼', Design: '🎨', Languages: '🗣️',
  Finance: '💰', Health: '🏥', Arts: '🎭',
};

export default function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [toast, setToast] = useState('');

  const fetchCourses = () => {
    setLoading(true);
    coursesApi.list({ search, category, skill_level: level })
      .then(setCourses)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCourses(); }, [search, category, level]);

  const handleEnroll = async (courseId) => {
    try {
      await enrollmentsApi.enroll(courseId);
      showToast('✅ Enrolled successfully!');
    } catch (err) {
      showToast(`❌ ${err.message}`);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div>
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 999,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          padding: '12px 20px', borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)', fontSize: '0.9rem',
          animation: 'slideUp 0.2s ease',
        }}>
          {toast}
        </div>
      )}

      <div className="page-header">
        <h1>Explore Courses</h1>
        <span className="badge badge-primary">{courses.length} courses</span>
      </div>

      <div className="search-bar">
        <input
          id="course-search"
          placeholder="🔍 Search courses..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select id="course-category" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select id="course-level" value={level} onChange={e => setLevel(e.target.value)}>
          <option value="">All Levels</option>
          {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📭</div>
          <h3>No courses found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="course-grid">
          {courses.map(course => (
            <div key={course.id} className="course-card">
              <div className="course-card-thumb">
                {EMOJI_BY_CATEGORY[course.category] || '📖'}
              </div>
              <div className="course-card-body">
                <h3 className="course-card-title">{course.title}</h3>
                <div className="course-card-meta">
                  {course.category && <span className="badge badge-primary">{course.category}</span>}
                  <span className="badge badge-info">{course.skill_level}</span>
                </div>
                {course.description && (
                  <p className="course-card-desc" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {course.description}
                  </p>
                )}
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  👤 {course.instructor?.full_name || 'Instructor'} · 
                  👥 {course.enrollment_count} enrolled
                </div>
                <div className="course-card-footer">
                  <span className={`course-price ${course.price === 0 ? 'free' : ''}`}>
                    {course.price === 0 ? 'Free' : `KES ${course.price.toLocaleString()}`}
                  </span>
                  {user?.role === 'student' && (
                    <button
                      id={`enroll-${course.id}`}
                      className="btn btn-primary btn-sm"
                      onClick={() => handleEnroll(course.id)}
                    >
                      Enroll
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
