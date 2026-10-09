import { useState, useEffect } from 'react';
import { coursesApi } from '../api';

const CATEGORIES = ['Technology', 'Business', 'Design', 'Languages', 'Finance', 'Health', 'Arts'];
const LEVELS = ['beginner', 'intermediate', 'advanced'];

function CourseModal({ course, onClose, onSaved }) {
  const isEdit = !!course?.id;
  const [form, setForm] = useState({
    title: course?.title || '',
    description: course?.description || '',
    category: course?.category || '',
    skill_level: course?.skill_level || 'beginner',
    price: course?.price ?? 0,
    is_published: course?.is_published ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const saved = isEdit
        ? await coursesApi.update(course.id, form)
        : await coursesApi.create(form);
      onSaved(saved);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Course' : 'Create Course'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Course title" />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What will students learn?" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="">Select...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Level</label>
              <select value={form.skill_level} onChange={e => setForm({ ...form, skill_level: e.target.value })}>
                {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Price (KES)</label>
              <input type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={form.is_published ? 'published' : 'draft'} onChange={e => setForm({ ...form, is_published: e.target.value === 'published' })}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Update Course' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MyCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);

  useEffect(() => {
    coursesApi.myCourses()
      .then(setCourses)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSaved = (saved) => {
    setCourses(prev => {
      const exists = prev.find(c => c.id === saved.id);
      return exists ? prev.map(c => c.id === saved.id ? saved : c) : [saved, ...prev];
    });
    setShowModal(false);
    setEditCourse(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this course?')) return;
    try {
      await coursesApi.delete(id);
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePublishToggle = async (course) => {
    try {
      const updated = await coursesApi.update(course.id, { is_published: !course.is_published });
      setCourses(prev => prev.map(c => c.id === updated.id ? updated : c));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div>
      {(showModal || editCourse) && (
        <CourseModal
          course={editCourse}
          onClose={() => { setShowModal(false); setEditCourse(null); }}
          onSaved={handleSaved}
        />
      )}

      <div className="page-header">
        <h1>My Courses</h1>
        <button
          id="create-course-btn"
          className="btn btn-primary"
          onClick={() => { setEditCourse(null); setShowModal(true); }}
        >
          + Create Course
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🏫</div>
          <h3>No courses yet</h3>
          <p>Create your first course and start sharing your skills</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Category</th>
                  <th>Level</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Enrolled</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {c.description?.slice(0, 60)}{c.description?.length > 60 ? '…' : ''}
                      </div>
                    </td>
                    <td>{c.category || '—'}</td>
                    <td><span className="badge badge-info">{c.skill_level}</span></td>
                    <td>{c.price === 0 ? <span className="badge badge-success">Free</span> : `KES ${c.price}`}</td>
                    <td>
                      <span className={`badge ${c.is_published ? 'badge-success' : 'badge-warning'}`}>
                        {c.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>{c.enrollment_count}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          id={`edit-course-${c.id}`}
                          className="btn btn-outline btn-sm"
                          onClick={() => setEditCourse(c)}
                        >
                          Edit
                        </button>
                        <button
                          id={`publish-course-${c.id}`}
                          className="btn btn-outline btn-sm"
                          onClick={() => handlePublishToggle(c)}
                        >
                          {c.is_published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          id={`delete-course-${c.id}`}
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(c.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
