import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/courses',   icon: '📚', label: 'Courses'   },
  { path: '/my-learning', icon: '🎯', label: 'My Learning' },
];

const instructorItems = [
  { path: '/my-courses', icon: '🏫', label: 'My Courses' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navStyle = (path) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 16px',
    borderRadius: 'var(--radius-md)',
    color: isActive(path) ? 'var(--text-primary)' : 'var(--text-secondary)',
    background: isActive(path) ? 'rgba(108,71,255,0.2)' : 'transparent',
    border: isActive(path) ? '1px solid rgba(108,71,255,0.3)' : '1px solid transparent',
    fontWeight: isActive(path) ? 600 : 400,
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    fontSize: '0.92rem',
  });

  return (
    <aside style={{
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      width: 'var(--sidebar-width)',
      background: 'var(--bg-card)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 12px',
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '8px 4px 24px', borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
        <h2 style={{
          fontSize: '1.4rem',
          fontWeight: 900,
          background: 'linear-gradient(135deg, var(--primary-light), var(--accent))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.03em',
        }}>
          🎓 Elimika
        </h2>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Upskill Programme</p>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', padding: '4px 16px 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Menu
        </p>
        {navItems.map(item => (
          <Link key={item.path} to={item.path} style={navStyle(item.path)}>
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}

        {(user?.role === 'instructor' || user?.role === 'admin') && (
          <>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', padding: '16px 16px 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Teach
            </p>
            {instructorItems.map(item => (
              <Link key={item.path} to={item.path} style={navStyle(item.path)}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* User */}
      <div style={{
        borderTop: '1px solid var(--border)',
        paddingTop: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 4px' }}>
          <div style={{
            width: 36, height: 36,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.9rem', flexShrink: 0,
          }}>
            {user?.full_name?.[0] || '?'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.full_name}
            </p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{user?.role}</p>
          </div>
        </div>
        <button
          id="sidebar-logout"
          onClick={logout}
          className="btn btn-outline btn-sm"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
