import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Search, Bell, LogOut, ChevronDown, User, ExternalLink, X, CheckCheck, Zap, BookOpen, Users, Star, Shield } from 'lucide-react';
import { getPeersForSkill } from '../data/db';
import './Navbar.css';

const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      return true;
    }
    return false;
  });
  const [user] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => {
    // Generate contextual notifications based on user
    const u = (() => { try { return JSON.parse(localStorage.getItem('user')) || {}; } catch { return {}; } })();
    const role = u.role || 'engineering';
    const isMedical = role === 'medical';
    return [
      {
        id: 1, read: false, time: '2m ago',
        icon: 'match',
        title: 'New Skill Match Found!',
        body: isMedical ? 'Dr. Emily Rose wants to swap Pharmacology for Cardiology.' : 'Alex Chen wants to swap React for System Design.',
      },
      {
        id: 2, read: false, time: '15m ago',
        icon: 'swap',
        title: 'Swap Request Received',
        body: isMedical ? 'James Wilson sent you a session request for Pathology.' : 'Sarah Jenkins sent you a collaboration request.',
      },
      {
        id: 3, read: false, time: '1h ago',
        icon: 'course',
        title: 'New Course Module Available',
        body: isMedical ? 'Radiology Basics — Module 3: Abdominal Radiographs is now live.' : 'React.js & Ecosystem — Module 3: Context API & Performance is now live.',
      },
      {
        id: 4, read: true, time: '3h ago',
        icon: 'community',
        title: 'Community Post in Your Group',
        body: isMedical ? 'New discussion in "USMLE Step 1 Prep": High-yield pharmacology mnemonics.' : 'New post in "DSA Interview Prep": Graph algorithm patterns.',
      },
      {
        id: 5, read: true, time: 'Yesterday',
        icon: 'star',
        title: 'You Received a 5-Star Rating!',
        body: 'A peer gave you 5 stars for your last skill-swap session. Great work!',
      },
    ];
  });
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const getNotifIcon = (type) => {
    if (type === 'match') return <Zap size={16} color="#f59e0b" />;
    if (type === 'swap') return <Users size={16} color="#6366f1" />;
    if (type === 'course') return <BookOpen size={16} color="#0284c7" />;
    if (type === 'community') return <Users size={16} color="#10b981" />;
    if (type === 'star') return <Star size={16} color="#f59e0b" />;
    return <Bell size={16} />;
  };

  const toggleTheme = (e) => {
    e.stopPropagation();
    if (isDarkMode) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isAdmin = user?.role === 'admin' || !!user?.is_admin;
  const roleBadgeClass = isAdmin ? 'badge-admin' : (user?.role === 'engineering' ? 'badge-engineering' : 'badge-medical');

  const goToDashboard = () => {
    if (isAdmin) {
      navigate('/admin');
    } else {
      navigate(user?.role === 'engineering' ? '/dashboard/engineering' : '/dashboard/medical');
    }
  };

  const matchedPeers = searchQuery.trim() ? getPeersForSkill(searchQuery, user) : [];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Left: Logo */}
        <div className="navbar-left">
          <div className="logo clickable" onClick={goToDashboard}>
            <span className="logo-icon">🚀</span>
            <span className="logo-text gradient-text">SkillSwap</span>
          </div>
        </div>

        {/* Center: Search */}
        <div className="navbar-center">
          <div className="navbar-search-wrapper" ref={searchRef}>
            <div className="search-bar">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search skills, peers (e.g. React, Python, Anatomy)..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
              />
              {searchQuery && (
                <button 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                  onClick={() => setSearchQuery('')}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Live Search Dropdown */}
            {searchFocused && searchQuery.trim() && (
              <div className="nav-search-results-dropdown">
                <div className="nav-search-section-title">
                  Matched Peers for "{searchQuery}"
                </div>
                {matchedPeers.length > 0 ? (
                  matchedPeers.map(peer => (
                    <div 
                      key={peer.id} 
                      className="nav-search-item"
                      onClick={() => {
                        setSearchFocused(false);
                        goToDashboard();
                      }}
                    >
                      <div className="nav-search-item-left">
                        <div className={`nav-search-avatar ${peer.role === 'medical' ? 'med' : ''}`}>{peer.avatar}</div>
                        <div>
                          <div className="nav-search-name">{peer.user}</div>
                          <div className="nav-search-sub">Teaches: <b>{peer.mySkill}</b> • Wants: {peer.wantSkill}</div>
                        </div>
                      </div>
                      <span className="nav-search-tag">{peer.matchScore}% Match</span>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '12px', fontSize: '0.82rem', color: '#94a3b8', textAlign: 'center' }}>
                    No exact matches found. Try searching another skill!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="navbar-right">
          <button className="icon-btn" onClick={toggleTheme} title="Toggle Dark Mode" id="theme-toggle">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notifications Bell */}
          <div className="user-dropdown-wrapper" ref={notifRef} style={{ position: 'relative' }}>
            <button
              className="icon-btn"
              title="Notifications"
              id="notifications-btn"
              onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false); }}
              style={{ position: 'relative' }}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="notif-dot" style={{
                  position: 'absolute', top: '2px', right: '2px',
                  background: '#ef4444', color: '#fff', borderRadius: '50%',
                  fontSize: '0.6rem', fontWeight: 800, width: '16px', height: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  lineHeight: 1, border: '2px solid var(--bg-primary, #fff)'
                }}>{unreadCount}</span>
              )}
            </button>

            {notifOpen && (
              <div className="user-dropdown" style={{ width: '340px', right: 0, left: 'auto', maxHeight: '420px', overflowY: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 8px', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary, #0f172a)' }}>
                    🔔 Notifications {unreadCount > 0 && <span style={{ background: '#ef4444', color: '#fff', borderRadius: '12px', padding: '1px 7px', fontSize: '0.7rem', marginLeft: '4px' }}>{unreadCount} new</span>}
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0284c7', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}
                    >
                      <CheckCheck size={13} /> Mark all read
                    </button>
                  )}
                </div>

                {notifications.map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => markRead(notif.id)}
                    style={{
                      display: 'flex', gap: '10px', padding: '10px 16px',
                      background: notif.read ? 'transparent' : 'rgba(2, 132, 199, 0.06)',
                      borderBottom: '1px solid var(--border-color, #f1f5f9)',
                      cursor: 'pointer', transition: 'background 0.15s',
                      borderLeft: notif.read ? 'none' : '3px solid #0284c7'
                    }}
                  >
                    <div style={{ marginTop: '2px', flexShrink: 0 }}>{getNotifIcon(notif.icon)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontWeight: notif.read ? 500 : 700, fontSize: '0.83rem', color: 'var(--text-primary, #0f172a)', lineHeight: 1.3 }}>
                          {notif.title}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', whiteSpace: 'nowrap', marginLeft: '8px', marginTop: '1px' }}>{notif.time}</span>
                      </div>
                      <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>{notif.body}</p>
                    </div>
                    {!notif.read && (
                      <div style={{ width: '8px', height: '8px', background: '#0284c7', borderRadius: '50%', marginTop: '5px', flexShrink: 0 }} />
                    )}
                  </div>
                ))}

                <div style={{ padding: '10px', textAlign: 'center', borderTop: '1px solid var(--border-color, #e2e8f0)' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>That's all your recent notifications</span>
                </div>
              </div>
            )}
          </div>

          {/* Admin Console Direct Link Button */}
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                color: '#fbbf24',
                padding: '6px 12px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                marginRight: '6px'
              }}
              title="Open Platform Governance Admin Console"
            >
              <Shield size={14} /> Admin Console
            </button>
          )}

          {/* User Dropdown */}
          <div className="user-dropdown-wrapper" ref={dropdownRef}>
            <button
              className="user-profile-nav"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              id="user-menu-btn"
            >
              <div className="avatar" style={{ overflow: 'hidden' }}>
                {user?.avatarUrl ? <img src={user.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getInitials(user?.name)}
              </div>
              <div className="user-info">
                <span className="user-name">{user?.name || 'User'}</span>
                <span className={`role-badge ${roleBadgeClass}`}>
                  {isAdmin ? '🛡️ Admin' : (user?.role === 'engineering' ? 'Engineering' : 'Medical')}
                </span>
              </div>
              <ChevronDown size={16} className={`chevron ${dropdownOpen ? 'open' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="user-dropdown">
                {/* Profile Header - Clickable */}
                <div className="dropdown-profile clickable" onClick={() => { navigate(isAdmin ? '/admin' : '/profile'); setDropdownOpen(false); }}>
                  <div className="dp-avatar" style={{ overflow: 'hidden' }}>
                    {user?.avatarUrl ? <img src={user.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getInitials(user?.name)}
                  </div>
                  <div className="dp-info">
                    <div className="dp-name">{user?.name || 'User'}</div>
                    <div className="dp-email">{user?.email}</div>
                    <span className={`role-badge ${roleBadgeClass}`}>
                      {isAdmin ? '🛡️ Platform Admin' : (user?.role === 'engineering' ? '⚙️ Engineering' : '🏥 Medical')}
                    </span>
                  </div>
                  <ExternalLink size={14} className="dp-link-icon" />
                </div>
                
                <div className="dropdown-divider"></div>
                
                {isAdmin && (
                  <>
                    <button className="dropdown-item" onClick={() => { navigate('/admin'); setDropdownOpen(false); }}>
                      <Shield size={16} color="#fbbf24" />
                      <span style={{ fontWeight: 700, color: '#fbbf24' }}>Platform Admin Console</span>
                    </button>
                    <div className="dropdown-divider"></div>
                  </>
                )}

                <button className="dropdown-item" onClick={() => { navigate('/profile'); setDropdownOpen(false); }}>
                  <User size={16} />
                  <span>View Full Profile</span>
                </button>
                
                <div className="dropdown-divider"></div>
                
                {/* Skills Preview */}
                <div className="dp-skills-section">
                  <div className="dp-skills-label">Teaching</div>
                  <div className="dp-tags">
                    {(user?.role === 'engineering'
                      ? ['React', 'JavaScript', 'Java']
                      : ['Anatomy', 'Patient Care', 'Suturing']
                    ).map(s => (
                      <span key={s} className="dp-tag dp-tag-teach">{s}</span>
                    ))}
                  </div>
                </div>
                
                <div className="dropdown-divider"></div>
                
                <button
                  className="dropdown-item logout-item"
                  onClick={handleLogout}
                  id="logout-btn"
                >
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
