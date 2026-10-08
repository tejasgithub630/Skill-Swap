import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Database, BookOpen, CheckCircle2, XCircle, AlertTriangle,
  Users, Award, Search, Filter, RefreshCw, Plus, ChevronRight,
  Eye, ExternalLink, Activity, Check, X, FileText, Stethoscope,
  Cpu, ArrowLeft, LogOut, Clock, Layers, HelpCircle, AlertCircle
} from 'lucide-react';
import { courseCurriculum } from '../data/courseCurriculum';
import { getUserStats, getProgress } from '../data/db';
import AlgorithmLabView from '../components/AlgorithmLabView';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [currentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  });

  // Main navigation tabs: 'database' | 'courses' | 'approvals'
  const [activeMainTab, setActiveMainTab] = useState('database');

  // Sub-tab inside Database: 'users' | 'skills' | 'certifications' | 'attempts'
  const [dbSubTab, setDbSubTab] = useState('users');

  // Data states
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [skillsList, setSkillsList] = useState([]);
  const [certsList, setCertsList] = useState([]);
  const [attemptsList, setAttemptsList] = useState([]);
  const [requestsList, setRequestsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal / Inspector states
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [approveModalItem, setApproveModalItem] = useState(null);
  const [approveForm, setApproveForm] = useState({
    canonical_name: '',
    category: '',
    domain: 'ENGINEERING',
    aliases: '',
    admin_feedback: ''
  });
  const [rejectModalItem, setRejectModalItem] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [revokeModalCert, setRevokeModalCert] = useState(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [addSkillModal, setAddSkillModal] = useState(false);
  const [newSkillForm, setNewSkillForm] = useState({
    canonical_name: '',
    category: 'Framework',
    domain: 'ENGINEERING',
    description: '',
    aliases: ''
  });
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [inspectUserProgress, setInspectUserProgress] = useState(null);

  const token = localStorage.getItem('auth_token');

  // Verify Admin authorization
  useEffect(() => {
    if (!currentUser || (!currentUser.is_admin && currentUser.role !== 'admin')) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Fetch all admin data
  const fetchAllData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const authHeader = { 'Authorization': `Bearer ${token}` };

      const [statsRes, usersRes, skillsRes, certsRes, attemptsRes, requestsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: authHeader }).catch(() => null),
        fetch('/api/admin/users', { headers: authHeader }).catch(() => null),
        fetch('/api/admin/skills', { headers: authHeader }).catch(() => null),
        fetch('/api/admin/certifications', { headers: authHeader }).catch(() => null),
        fetch('/api/admin/attempts', { headers: authHeader }).catch(() => null),
        fetch('/api/admin/requests', { headers: authHeader }).catch(() => null)
      ]);

      if (statsRes?.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
      if (usersRes?.ok) {
        const data = await usersRes.json();
        setUsersList(data);
      }
      if (skillsRes?.ok) {
        const data = await skillsRes.json();
        setSkillsList(data);
      }
      if (certsRes?.ok) {
        const data = await certsRes.json();
        setCertsList(data);
      }
      if (attemptsRes?.ok) {
        const data = await attemptsRes.json();
        setAttemptsList(data);
      }
      if (requestsRes?.ok) {
        const data = await requestsRes.json();
        setRequestsList(data);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line
    fetchAllData();
    const interval = setInterval(() => fetchAllData(true), 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showNotification = (msg) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  // Toggle user active status
  const handleToggleUserStatus = async (user) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: !user.is_active })
      });
      if (res.ok) {
        showNotification(`User ${user.name} status updated to ${!user.is_active ? 'Active' : 'Suspended'}`);
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Change user role
  const handleChangeUserRole = async (user, newRole) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole, is_admin: newRole === 'admin' })
      });
      if (res.ok) {
        showNotification(`User ${user.name} role changed to ${newRole}`);
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open approve modal for skill request
  const openApproveModal = (reqItem) => {
    setApproveModalItem(reqItem);
    setApproveForm({
      canonical_name: reqItem.requested_name,
      category: reqItem.category || 'General',
      domain: reqItem.domain || 'ENGINEERING',
      aliases: `${reqItem.requested_name}lang, ${reqItem.requested_name}.js`,
      admin_feedback: `Approved and verified by Lead Proctor. Added to global SkillSwap ${reqItem.domain} catalogue.`
    });
  };

  // Submit approval
  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    if (!approveModalItem) return;

    try {
      const aliasesArray = approveForm.aliases
        ? approveForm.aliases.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const res = await fetch(`/api/admin/requests/${approveModalItem.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'APPROVED',
          canonical_name: approveForm.canonical_name,
          category: approveForm.category,
          domain: approveForm.domain,
          aliases: aliasesArray,
          admin_feedback: approveForm.admin_feedback
        })
      });

      if (res.ok) {
        showNotification(`Skill "${approveForm.canonical_name}" approved & auto-configured with competency assessment!`);
        setApproveModalItem(null);
        fetchAllData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to approve request');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit rejection
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectModalItem) return;

    try {
      const res = await fetch(`/api/admin/requests/${rejectModalItem.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'REJECTED',
          admin_feedback: rejectReason || 'Does not meet current platform taxonomy criteria.'
        })
      });

      if (res.ok) {
        showNotification('Skill request rejected.');
        setRejectModalItem(null);
        setRejectReason('');
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit certificate revocation
  const handleRevokeSubmit = async (e) => {
    e.preventDefault();
    if (!revokeModalCert) return;

    try {
      const res = await fetch(`/api/admin/certifications/${revokeModalCert.id}/revoke`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          revocation_reason: revokeReason || 'Revoked by Platform Administrator after integrity audit.'
        })
      });

      if (res.ok) {
        showNotification(`Certificate ${revokeModalCert.certificate_number} has been revoked.`);
        setRevokeModalCert(null);
        setRevokeReason('');
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add new skill directly
  const handleAddSkillSubmit = async (e) => {
    e.preventDefault();
    try {
      const aliasesArray = newSkillForm.aliases
        ? newSkillForm.aliases.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const res = await fetch('/api/admin/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          canonical_name: newSkillForm.canonical_name,
          category: newSkillForm.category,
          domain: newSkillForm.domain,
          description: newSkillForm.description,
          aliases: aliasesArray
        })
      });

      if (res.ok) {
        showNotification(`Canonical skill "${newSkillForm.canonical_name}" successfully added to taxonomy!`);
        setAddSkillModal(false);
        setNewSkillForm({ canonical_name: '', category: 'Framework', domain: 'ENGINEERING', description: '', aliases: '' });
        fetchAllData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add skill');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  // Prepare courses list from courseCurriculum
  const coursesArray = Object.entries(courseCurriculum).map(([key, data]) => ({
    key,
    ...data
  }));

  // Filtering for Database Users
  const filteredUsers = usersList.filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = domainFilter === 'ALL' || u.role?.toLowerCase() === domainFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  // Filtering for Skills
  const filteredSkills = skillsList.filter(s => {
    const matchesSearch = s.canonical_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = domainFilter === 'ALL' || s.domain === domainFilter;
    return matchesSearch && matchesDomain;
  });

  // Filtering for Certifications
  const filteredCerts = certsList.filter(c => {
    const matchesSearch = c.certificate_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.skill?.canonical_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.verification_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtering for Skill Requests
  const filteredRequests = requestsList.filter(r => {
    const matchesSearch = r.requested_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.requester?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtering for Courses
  const filteredCourses = coursesArray.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = domainFilter === 'ALL' || c.domain.toUpperCase() === domainFilter.toUpperCase();
    return matchesSearch && matchesDomain;
  });

  const pendingRequestsCount = requestsList.filter(r => r.status === 'REQUESTED').length;

  return (
    <div className="admin-console-page">
      {/* Top Global Administrative Bar */}
      <header className="admin-header">
        <div className="admin-header-left">
          <div className="admin-brand-badge">
            <Shield size={22} className="admin-shield-icon" />
            <div>
              <h1 className="admin-brand-title">SkillSwap Admin Console</h1>
              <span className="admin-brand-subtitle">Platform Governance &amp; Infrastructure Portal</span>
            </div>
          </div>
        </div>

        <div className="admin-header-center">
          <div className="admin-role-status-chip">
            <Activity size={14} color="#10b981" />
            <span>Role: Lead Platform Administrator</span>
            <span className="admin-mode-pill">Operational Mode</span>
          </div>
        </div>

        <div className="admin-header-right">
          <button className="admin-refresh-btn" onClick={fetchAllData} title="Refresh Live Database Sync">
            <RefreshCw size={15} className={loading ? 'spin-icon' : ''} />
            <span>Sync</span>
          </button>

          <button className="admin-logout-btn" onClick={handleLogout} title="Log out">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Action Notification Alert */}
      {actionSuccessMsg && (
        <div className="admin-toast-banner">
          <CheckCircle2 size={18} color="#10b981" />
          <span>{actionSuccessMsg}</span>
          <button onClick={() => setActionSuccessMsg('')}><X size={14} /></button>
        </div>
      )}

      {/* Main Navigation Tabs */}
      <nav className="admin-nav-tabs">
        <button
          className={`admin-nav-tab-btn ${activeMainTab === 'database' ? 'active' : ''}`}
          onClick={() => { setActiveMainTab('database'); setSearchTerm(''); setDomainFilter('ALL'); setStatusFilter('ALL'); }}
        >
          <Database size={18} />
          <span>Database &amp; Platform Stats</span>
        </button>

        <button
          className={`admin-nav-tab-btn ${activeMainTab === 'courses' ? 'active' : ''}`}
          onClick={() => { setActiveMainTab('courses'); setSearchTerm(''); setDomainFilter('ALL'); }}
        >
          <BookOpen size={18} />
          <span>Course Catalogue ({coursesArray.length})</span>
        </button>

        <button
          className={`admin-nav-tab-btn ${activeMainTab === 'approvals' ? 'active' : ''}`}
          onClick={() => { setActiveMainTab('approvals'); setSearchTerm(''); setStatusFilter('ALL'); }}
        >
          <CheckCircle2 size={18} />
          <span>Approvals Queue</span>
          {pendingRequestsCount > 0 && (
            <span className="admin-nav-counter">{pendingRequestsCount}</span>
          )}
        </button>

        <button
          className={`admin-nav-tab-btn ${activeMainTab === 'algorithm' ? 'active' : ''}`}
          onClick={() => { setActiveMainTab('algorithm'); setSearchTerm(''); }}
        >
          <Activity size={18} />
          <span>Algorithm Research Lab</span>
        </button>
      </nav>

      <main className="admin-main-content">
        {/* ========================================================================= */}
        {/* TAB 1: DATABASE & PLATFORM STATS */}
        {/* ========================================================================= */}
        {activeMainTab === 'database' && (
          <div className="admin-section fade-in">
            {/* Live Metrics Grid */}
            <div className="admin-kpi-grid">
              <div className="admin-kpi-card">
                <div className="kpi-icon-wrap user-kpi">
                  <Users size={22} />
                </div>
                <div className="kpi-details">
                  <span className="kpi-label">Total Users</span>
                  <div className="kpi-value">{stats?.users?.total || usersList.length}</div>
                  <div className="kpi-subtext">
                    <span>⚙️ {stats?.users?.engineering || 0} Eng</span> · 
                    <span>🏥 {stats?.users?.medical || 0} Med</span> · 
                    <span>🛡️ {stats?.users?.admin || 0} Admin</span>
                  </div>
                </div>
              </div>

              <div className="admin-kpi-card">
                <div className="kpi-icon-wrap skill-kpi">
                  <Cpu size={22} />
                </div>
                <div className="kpi-details">
                  <span className="kpi-label">Skills Taxonomy</span>
                  <div className="kpi-value">{stats?.skills?.total || skillsList.length}</div>
                  <div className="kpi-subtext">
                    <span>{stats?.skills?.engineering || 0} Engineering</span> · 
                    <span>{stats?.skills?.medical || 0} Medical</span>
                  </div>
                </div>
              </div>

              <div className="admin-kpi-card">
                <div className="kpi-icon-wrap cert-kpi">
                  <Award size={22} />
                </div>
                <div className="kpi-details">
                  <span className="kpi-label">Certifications Issued</span>
                  <div className="kpi-value">{stats?.certifications?.total || certsList.length}</div>
                  <div className="kpi-subtext">
                    <span style={{ color: '#10b981' }}>✓ {stats?.certifications?.verified || 0} Verified</span> · 
                    <span style={{ color: '#ef4444' }}>✕ {stats?.certifications?.revoked || 0} Revoked</span>
                  </div>
                </div>
              </div>

              <div className="admin-kpi-card">
                <div className="kpi-icon-wrap db-kpi">
                  <Database size={22} />
                </div>
                <div className="kpi-details">
                  <span className="kpi-label">SQLite Engine Health</span>
                  <div className="kpi-value">{stats?.database?.sizeFormatted || '280 KB'}</div>
                  <div className="kpi-subtext">
                    <span style={{ color: '#10b981' }}>● Synchronized</span> · 16 Core Tables
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Metrics Grid (Real-time Analytics) */}
            <div className="admin-kpi-grid" style={{ marginTop: '16px' }}>
              <div className="admin-kpi-card">
                <div className="kpi-icon-wrap user-kpi" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                  <Award size={22} />
                </div>
                <div className="kpi-details">
                  <span className="kpi-label">Certified Users</span>
                  <div className="kpi-value">{stats?.advanced?.certifiedUsersCount || 0}</div>
                  <div className="kpi-subtext">Unique users with ≥1 cert</div>
                </div>
              </div>

              <div className="admin-kpi-card">
                <div className="kpi-icon-wrap" style={{ backgroundColor: '#fff7ed', color: '#ea580c' }}>
                  <Activity size={22} />
                </div>
                <div className="kpi-details">
                  <span className="kpi-label">Avg. Attempts to Pass</span>
                  <div className="kpi-value">{stats?.advanced?.avgAttemptsToPass || '0.0'}</div>
                  <div className="kpi-subtext">Failed Attempts: {stats?.advanced?.failedAttempts || 0}</div>
                </div>
              </div>

              <div className="admin-kpi-card" style={{ gridColumn: 'span 2' }}>
                 <div className="kpi-details">
                   <span className="kpi-label">Certifications by Skill</span>
                   <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
                     {(stats?.advanced?.certificationsBySkill || []).map(skillStat => (
                       <div key={skillStat.skill} style={{ backgroundColor: '#f8fafc', padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                         <strong>{skillStat.skill}</strong>: {skillStat.count}
                       </div>
                     ))}
                     {(!stats?.advanced?.certificationsBySkill || stats.advanced.certificationsBySkill.length === 0) && (
                       <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>No certifications yet.</span>
                     )}
                   </div>
                 </div>
              </div>
            </div>

            {/* Database Table Navigation Sub-tabs */}
            <div className="db-subnav-row">
              <div className="db-subnav-tabs">
                <button
                  className={`db-subtab-btn ${dbSubTab === 'users' ? 'active' : ''}`}
                  onClick={() => { setDbSubTab('users'); setSearchTerm(''); }}
                >
                  <Users size={15} /> Platform Users ({usersList.length})
                </button>

                <button
                  className={`db-subtab-btn ${dbSubTab === 'skills' ? 'active' : ''}`}
                  onClick={() => { setDbSubTab('skills'); setSearchTerm(''); }}
                >
                  <Cpu size={15} /> Skills Taxonomy ({skillsList.length})
                </button>

                <button
                  className={`db-subtab-btn ${dbSubTab === 'certifications' ? 'active' : ''}`}
                  onClick={() => { setDbSubTab('certifications'); setSearchTerm(''); }}
                >
                  <Award size={15} /> Certifications ({certsList.length})
                </button>

                <button
                  className={`db-subtab-btn ${dbSubTab === 'attempts' ? 'active' : ''}`}
                  onClick={() => { setDbSubTab('attempts'); setSearchTerm(''); }}
                >
                  <Activity size={15} /> Assessment Attempts ({attemptsList.length})
                </button>
              </div>

              <div className="db-subnav-actions">
                {dbSubTab === 'skills' && (
                  <button className="admin-primary-btn" onClick={() => setAddSkillModal(true)}>
                    <Plus size={15} /> Add Canonical Skill
                  </button>
                )}
              </div>
            </div>

            {/* Search & Filters */}
            <div className="admin-search-filter-bar">
              <div className="admin-search-wrap">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder={`Search ${dbSubTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="admin-search-input"
                />
              </div>

              {(dbSubTab === 'users' || dbSubTab === 'skills') && (
                <div className="admin-filter-group">
                  <Filter size={15} />
                  <select
                    value={domainFilter}
                    onChange={(e) => setDomainFilter(e.target.value)}
                    className="admin-select"
                  >
                    <option value="ALL">All Roles / Domains</option>
                    <option value="ENGINEERING">Engineering</option>
                    <option value="MEDICAL">Medical</option>
                    {dbSubTab === 'users' && <option value="ADMIN">Admin</option>}
                  </select>
                </div>
              )}

              {dbSubTab === 'certifications' && (
                <div className="admin-filter-group">
                  <Filter size={15} />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="admin-select"
                  >
                    <option value="ALL">All Verification Statuses</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="REVOKED">Revoked</option>
                  </select>
                </div>
              )}
            </div>

            {/* SUB-TABLE 1: USERS */}
            {dbSubTab === 'users' && (
              <div className="admin-table-container">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Certifications</th>
                      <th>Skills Registered</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="admin-empty-cell">No users found matching your criteria.</td>
                      </tr>
                    ) : (
                      filteredUsers.map(u => (
                        <tr key={u.id} className={!u.is_active ? 'row-suspended' : ''}>
                          <td>
                            <div className="admin-user-cell">
                              <div className="admin-avatar-small">
                                {u.name ? u.name.slice(0, 2).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <strong className="user-name-text">{u.name}</strong>
                                <span className="user-id-text">{u.id.slice(0, 8)}...</span>
                              </div>
                            </div>
                          </td>
                          <td><code>{u.email}</code></td>
                          <td>
                            <select
                              value={u.role}
                              onChange={(e) => handleChangeUserRole(u, e.target.value)}
                              className={`role-select-pill ${u.role}`}
                            >
                              <option value="engineering">Engineering</option>
                              <option value="medical">Medical</option>
                              <option value="admin">Platform Admin</option>
                            </select>
                          </td>
                          <td>
                            <span className={`status-pill ${u.is_active ? 'active' : 'suspended'}`}>
                              {u.is_active ? '● Active' : '✕ Suspended'}
                            </span>
                          </td>
                          <td>
                            <span className="count-pill">{u.certifications?.length || 0} Certs</span>
                          </td>
                          <td>
                            <span className="count-pill">{u.userSkills?.length || 0} Skills</span>
                          </td>
                          <td>
                            <button
                              className={`action-btn-status ${u.is_active ? 'suspend' : 'activate'}`}
                              onClick={() => handleToggleUserStatus(u)}
                            >
                              {u.is_active ? 'Suspend' : 'Activate'}
                            </button>
                            <button
                              className="action-btn-status"
                              style={{ marginLeft: '6px', background: '#3b82f6', color: '#fff', borderColor: '#2563eb' }}
                              onClick={() => setInspectUserProgress(u)}
                            >
                              Progress
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* SUB-TABLE 2: SKILLS */}
            {dbSubTab === 'skills' && (
              <div className="admin-table-container">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Canonical Skill</th>
                      <th>Domain</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Aliases Configured</th>
                      <th>Assessment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSkills.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="admin-empty-cell">No skills found matching your filter.</td>
                      </tr>
                    ) : (
                      filteredSkills.map(s => (
                        <tr key={s.id}>
                          <td>
                            <strong>{s.canonical_name}</strong>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>slug: {s.slug}</div>
                          </td>
                          <td>
                            <span className={`domain-tag ${s.domain.toLowerCase()}`}>
                              {s.domain === 'ENGINEERING' ? <Cpu size={12} /> : <Stethoscope size={12} />}
                              {s.domain}
                            </span>
                          </td>
                          <td>{s.category}</td>
                          <td>
                            <span className="status-pill active">● ACTIVE</span>
                          </td>
                          <td>
                            <div className="aliases-wrap">
                              {(s.aliases || []).length > 0 ? (
                                s.aliases.map(a => <span key={a.id} className="alias-tag">{a.alias}</span>)
                              ) : (
                                <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>None</span>
                              )}
                            </div>
                          </td>
                          <td>
                            {s.assessment ? (
                              <span className="assessment-ready-tag">
                                ✓ Proctored ({s.assessment.passing_percentage}% pass)
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>Unconfigured</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* SUB-TABLE 3: CERTIFICATIONS */}
            {dbSubTab === 'certifications' && (
              <div className="admin-table-container">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Certificate Number</th>
                      <th>Candidate</th>
                      <th>Skill / Subject</th>
                      <th>Score</th>
                      <th>Status</th>
                      <th>Issued Date</th>
                      <th>Audit Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCerts.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="admin-empty-cell">No certifications match your query.</td>
                      </tr>
                    ) : (
                      filteredCerts.map(c => (
                        <tr key={c.id}>
                          <td>
                            <a
                              href={`/verify/certificate/${c.certificate_number}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="cert-number-link"
                              title="Inspect Public Verification Page"
                            >
                              <code>{c.certificate_number}</code>
                              <ExternalLink size={12} />
                            </a>
                          </td>
                          <td>
                            <strong>{c.user?.name || 'Verified User'}</strong>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.user?.email}</div>
                          </td>
                          <td>
                            <span className="cert-skill-pill">
                              {c.skill?.canonical_name || 'Skill Competency'}
                            </span>
                          </td>
                          <td>
                            <strong style={{ color: c.score >= 70 ? '#10b981' : '#f59e0b' }}>
                              {Math.round(c.score)}%
                            </strong>
                          </td>
                          <td>
                            <span className={`status-pill ${c.verification_status === 'VERIFIED' ? 'active' : 'suspended'}`}>
                              {c.verification_status}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {new Date(c.issued_at).toLocaleDateString()}
                          </td>
                          <td>
                            {c.verification_status === 'VERIFIED' ? (
                              <button
                                className="action-btn-revoke"
                                onClick={() => { setRevokeModalCert(c); setRevokeReason(''); }}
                              >
                                Revoke Certificate
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>
                                Reason: {c.revocation_reason?.slice(0, 30)}...
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* SUB-TABLE 4: ATTEMPTS */}
            {dbSubTab === 'attempts' && (
              <div className="admin-table-container">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Assessment</th>
                      <th>Score</th>
                      <th>Proficiency</th>
                      <th>Status</th>
                      <th>Security Flags</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attemptsList.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="admin-empty-cell">No assessment attempts recorded yet.</td>
                      </tr>
                    ) : (
                      attemptsList.map(a => (
                        <tr key={a.id}>
                          <td>
                            <strong>{a.user?.name || 'Candidate'}</strong>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{a.user?.email}</div>
                          </td>
                          <td>{a.assessment?.title || 'Competency Exam'}</td>
                          <td>
                            <strong style={{ color: a.score >= 70 ? '#10b981' : '#ef4444' }}>
                              {Math.round(a.percentage || a.score || 0)}%
                            </strong>
                          </td>
                          <td><span className="proficiency-pill">{a.proficiency_level}</span></td>
                          <td>
                            <span className={`status-pill ${a.status === 'PASSED' ? 'active' : 'suspended'}`}>
                              {a.status}
                            </span>
                          </td>
                          <td>
                            {a.security_flags_count > 0 ? (
                              <span className="flag-alert-pill">
                                <AlertTriangle size={12} /> {a.security_flags_count} Flag(s)
                              </span>
                            ) : (
                              <span style={{ color: '#10b981', fontSize: '0.78rem' }}>✓ Clean</span>
                            )}
                          </td>
                          <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {new Date(a.started_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: COURSE CATALOGUE */}
        {/* ========================================================================= */}
        {activeMainTab === 'courses' && (
          <div className="admin-section fade-in">
            {/* Header / Filter Toolbar */}
            <div className="admin-section-header">
              <div>
                <h2 className="admin-section-title">Verified Course Registry</h2>
                <p className="admin-section-subtitle">
                  Inspect structured curricula, interactive modules, visualizer engines, and video lectures.
                </p>
              </div>

              <div className="admin-filter-group">
                <Filter size={15} />
                <select
                  value={domainFilter}
                  onChange={(e) => setDomainFilter(e.target.value)}
                  className="admin-select"
                >
                  <option value="ALL">All Domains</option>
                  <option value="ENGINEERING">Software Engineering</option>
                  <option value="MEDICAL">Clinical Medicine</option>
                </select>
              </div>
            </div>

            {/* Courses Grid */}
            <div className="admin-courses-grid">
              {filteredCourses.map(course => (
                <div key={course.title} className="admin-course-card">
                  <div className="admin-course-header">
                    <span className={`domain-tag ${course.domain.toLowerCase()}`}>
                      {course.domain === 'ENGINEERING' ? <Cpu size={12} /> : <Stethoscope size={12} />}
                      {course.domain}
                    </span>
                    <span className="course-cat-tag">{course.category}</span>
                  </div>

                  <h3 className="admin-course-title">{course.title}</h3>
                  <p className="admin-course-instructor">Instructor: {course.instructor}</p>
                  <p className="admin-course-summary">{course.aiSummary}</p>

                  <div className="admin-course-meta">
                    <span>📚 {course.modules.length} Modules</span>
                    <span>⏱️ ~60 mins total</span>
                    <span style={{ color: '#10b981' }}>✓ 100% Verified</span>
                  </div>

                  <button
                    className="admin-inspect-curriculum-btn"
                    onClick={() => { setSelectedCourse(course); setSelectedModule(course.modules[0]); }}
                  >
                    <Eye size={15} /> Inspect Curriculum &amp; Modules
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: APPROVALS & GOVERNANCE QUEUE */}
        {/* ========================================================================= */}
        {activeMainTab === 'approvals' && (
          <div className="admin-section fade-in">
            <div className="admin-section-header">
              <div>
                <h2 className="admin-section-title">Taxonomy &amp; Skill Requests Approval Queue</h2>
                <p className="admin-section-subtitle">
                  Review student and mentor requests for new skills, provision canonical taxonomy nodes, and auto-generate evaluation assessments.
                </p>
              </div>

              <div className="admin-filter-group">
                <Filter size={15} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="admin-select"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="REQUESTED">Pending Review</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>

            {/* Skill Requests List */}
            <div className="admin-requests-grid">
              {filteredRequests.length === 0 ? (
                <div className="admin-empty-placeholder">
                  <CheckCircle2 size={36} color="#10b981" />
                  <h4>Approvals Queue is Clear!</h4>
                  <p>There are no pending skill requests matching this filter.</p>
                </div>
              ) : (
                filteredRequests.map(reqItem => (
                  <div key={reqItem.id} className={`admin-request-card-box ${reqItem.status.toLowerCase()}`}>
                    <div className="request-card-top">
                      <div className="request-title-group">
                        <span className={`domain-tag ${reqItem.domain.toLowerCase()}`}>
                          {reqItem.domain === 'ENGINEERING' ? <Cpu size={12} /> : <Stethoscope size={12} />}
                          {reqItem.domain}
                        </span>
                        <h3 className="request-skill-name">{reqItem.requested_name}</h3>
                      </div>

                      <span className={`request-status-badge ${reqItem.status.toLowerCase()}`}>
                        {reqItem.status === 'REQUESTED' ? 'Pending Review' : reqItem.status}
                      </span>
                    </div>

                    <div className="request-metadata-row">
                      <span><strong>Requested by:</strong> {reqItem.requester?.name || 'User'} ({reqItem.requester?.email})</span>
                      <span><strong>Category:</strong> {reqItem.category || 'General'}</span>
                    </div>

                    <div className="request-desc-box">
                      <strong>Description &amp; Justification:</strong>
                      <p>{reqItem.description}</p>
                    </div>

                    {reqItem.admin_feedback && (
                      <div className="request-feedback-box">
                        <strong>Admin Feedback:</strong>
                        <p>{reqItem.admin_feedback}</p>
                      </div>
                    )}

                    {reqItem.status === 'REQUESTED' && (
                      <div className="request-actions-row">
                        <button
                          className="admin-btn-approve"
                          onClick={() => openApproveModal(reqItem)}
                        >
                          <Check size={16} /> Approve &amp; Provision Skill
                        </button>
                        <button
                          className="admin-btn-reject"
                          onClick={() => { setRejectModalItem(reqItem); setRejectReason(''); }}
                        >
                          <X size={16} /> Reject Request
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: ALGORITHM RESEARCH LAB (Admin Governance) */}
        {/* ========================================================================= */}
        {activeMainTab === 'algorithm' && (
          <div className="admin-section fade-in" style={{ padding: '0.5rem 0' }}>
            <AlgorithmLabView />
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: COURSE CURRICULUM INSPECTOR */}
      {/* ========================================================================= */}
      {selectedCourse && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedCourse(null)}>
          <div className="admin-course-inspector-modal" onClick={(e) => e.stopPropagation()}>
            <div className="inspector-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BookOpen size={20} color="#0284c7" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>{selectedCourse.title}</h3>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    {selectedCourse.domain} · Instructor: {selectedCourse.instructor}
                  </span>
                </div>
              </div>
              <button className="modal-close-icon-btn" onClick={() => setSelectedCourse(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="inspector-modal-body">
              {/* Modules Sidebar */}
              <div className="inspector-modules-sidebar">
                <h4 className="inspector-sidebar-title">Course Modules ({selectedCourse.modules.length})</h4>
                {selectedCourse.modules.map((mod, idx) => (
                  <div
                    key={mod.id}
                    className={`inspector-module-item ${selectedModule?.id === mod.id ? 'active' : ''}`}
                    onClick={() => setSelectedModule(mod)}
                  >
                    <span className="mod-num">{idx + 1}</span>
                    <div className="mod-info">
                      <strong className="mod-title">{mod.title}</strong>
                      <span className="mod-duration">{mod.duration || '15 mins'}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Module Content Inspector */}
              <div className="inspector-module-content">
                {selectedModule && (
                  <div>
                    <h4 className="active-module-header">{selectedModule.title}</h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                      Verified YouTube ID: <code>{selectedModule.youtubeId || 'Standard ID'}</code> · Duration: {selectedModule.duration}
                    </p>

                    {/* Verified Video Preview Screen */}
                    <div className="admin-preview-video-box">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${selectedModule.youtubeId || 'bMknfKXIFA8'}?rel=0&modestbranding=1`}
                        title={selectedModule.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="admin-preview-iframe"
                      />
                    </div>

                    <div className="admin-preview-details">
                      <h5 style={{ margin: '14px 0 8px', color: '#e2e8f0', fontSize: '0.95rem' }}>🎯 Module Objectives</h5>
                      <ul style={{ margin: 0, paddingLeft: '20px', color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6 }}>
                        {(selectedModule.objectives || []).map((o, idx) => <li key={idx}>{o}</li>)}
                      </ul>

                      <h5 style={{ margin: '16px 0 8px', color: '#e2e8f0', fontSize: '0.95rem' }}>💡 High-Yield Core Principles</h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {(selectedModule.keyPoints || []).map((pt, idx) => (
                          <div key={idx} style={{ background: '#1e293b', padding: '10px', borderRadius: '6px', fontSize: '0.83rem', color: '#cbd5e1' }}>
                            <span style={{ color: '#38bdf8', fontWeight: 700, marginRight: '6px' }}>#{idx + 1}:</span>
                            {pt}
                          </div>
                        ))}
                      </div>

                      {selectedModule.quiz && (
                        <div style={{ marginTop: '16px', background: '#0f172a', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
                          <span style={{ color: '#f59e0b', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Interactive Assessment Question</span>
                          <p style={{ margin: '6px 0', fontWeight: 600, color: '#f8fafc', fontSize: '0.88rem' }}>{selectedModule.quiz.question}</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                            {selectedModule.quiz.options.map((opt, i) => (
                              <div
                                key={i}
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: '4px',
                                  fontSize: '0.8rem',
                                  background: i === selectedModule.quiz.answer ? '#064e3b' : '#1e293b',
                                  color: i === selectedModule.quiz.answer ? '#6ee7b7' : '#94a3b8',
                                  border: i === selectedModule.quiz.answer ? '1px solid #10b981' : 'none'
                                }}
                              >
                                {String.fromCharCode(65 + i)}. {opt} {i === selectedModule.quiz.answer && '✓ (Correct)'}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: APPROVE SKILL REQUEST */}
      {/* ========================================================================= */}
      {approveModalItem && (
        <div className="admin-modal-backdrop" onClick={() => setApproveModalItem(null)}>
          <div className="admin-action-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top-bar">
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
                Approve &amp; Provision Canonical Skill
              </h3>
              <button className="modal-close-icon-btn" onClick={() => setApproveModalItem(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleApproveSubmit} className="admin-form">
              <div className="form-group-admin">
                <label>Canonical Skill Name</label>
                <input
                  type="text"
                  required
                  value={approveForm.canonical_name}
                  onChange={(e) => setApproveForm({ ...approveForm, canonical_name: e.target.value })}
                  className="admin-input-control"
                />
              </div>

              <div className="form-row-admin">
                <div className="form-group-admin">
                  <label>Domain</label>
                  <select
                    value={approveForm.domain}
                    onChange={(e) => setApproveForm({ ...approveForm, domain: e.target.value })}
                    className="admin-input-control"
                  >
                    <option value="ENGINEERING">Software Engineering</option>
                    <option value="MEDICAL">Clinical Medicine</option>
                    <option value="BOTH">Cross-disciplinary / Both</option>
                  </select>
                </div>

                <div className="form-group-admin">
                  <label>Category</label>
                  <input
                    type="text"
                    value={approveForm.category}
                    onChange={(e) => setApproveForm({ ...approveForm, category: e.target.value })}
                    className="admin-input-control"
                  />
                </div>
              </div>

              <div className="form-group-admin">
                <label>Search Aliases (comma-separated)</label>
                <input
                  type="text"
                  value={approveForm.aliases}
                  onChange={(e) => setApproveForm({ ...approveForm, aliases: e.target.value })}
                  placeholder="e.g. rustlang, rust-cli, rust-wasm"
                  className="admin-input-control"
                />
              </div>

              <div className="form-group-admin">
                <label>Admin Feedback / Resolution Note</label>
                <textarea
                  rows="3"
                  value={approveForm.admin_feedback}
                  onChange={(e) => setApproveForm({ ...approveForm, admin_feedback: e.target.value })}
                  className="admin-textarea-control"
                />
              </div>

              <div className="form-actions-admin">
                <button type="button" className="admin-cancel-btn" onClick={() => setApproveModalItem(null)}>
                  Cancel
                </button>
                <button type="submit" className="admin-primary-btn">
                  Publish to Taxonomy &amp; Auto-create Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: REJECT SKILL REQUEST */}
      {/* ========================================================================= */}
      {rejectModalItem && (
        <div className="admin-modal-backdrop" onClick={() => setRejectModalItem(null)}>
          <div className="admin-action-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top-bar">
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#ef4444' }}>
                Reject Skill Request
              </h3>
              <button className="modal-close-icon-btn" onClick={() => setRejectModalItem(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="admin-form">
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: '0 0 12px' }}>
                Rejecting request for <strong>{rejectModalItem.requested_name}</strong> submitted by {rejectModalItem.requester?.name}.
              </p>

              <div className="form-group-admin">
                <label>Rejection Reason (visible to requester)</label>
                <textarea
                  rows="3"
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why this skill does not meet standard taxonomy guidelines..."
                  className="admin-textarea-control"
                />
              </div>

              <div className="form-actions-admin">
                <button type="button" className="admin-cancel-btn" onClick={() => setRejectModalItem(null)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn-reject" style={{ padding: '8px 16px' }}>
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: REVOKE CERTIFICATE */}
      {/* ========================================================================= */}
      {revokeModalCert && (
        <div className="admin-modal-backdrop" onClick={() => setRevokeModalCert(null)}>
          <div className="admin-action-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top-bar">
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#ef4444' }}>
                Revoke Certificate
              </h3>
              <button className="modal-close-icon-btn" onClick={() => setRevokeModalCert(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRevokeSubmit} className="admin-form">
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: '0 0 12px' }}>
                You are revoking Certificate <code>{revokeModalCert.certificate_number}</code> issued to <strong>{revokeModalCert.user?.name}</strong>.
              </p>

              <div className="form-group-admin">
                <label>Audit Revocation Reason</label>
                <textarea
                  rows="3"
                  required
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="State the audit finding (e.g. proctor security policy breach, invalidated attempt)..."
                  className="admin-textarea-control"
                />
              </div>

              <div className="form-actions-admin">
                <button type="button" className="admin-cancel-btn" onClick={() => setRevokeModalCert(null)}>
                  Cancel
                </button>
                <button type="submit" className="action-btn-revoke" style={{ padding: '8px 16px' }}>
                  Revoke Credential
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: ADD CANONICAL SKILL DIRECTLY */}
      {/* ========================================================================= */}
      {addSkillModal && (
        <div className="admin-modal-backdrop" onClick={() => setAddSkillModal(false)}>
          <div className="admin-action-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top-bar">
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
                Add New Canonical Skill
              </h3>
              <button className="modal-close-icon-btn" onClick={() => setAddSkillModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSkillSubmit} className="admin-form">
              <div className="form-group-admin">
                <label>Canonical Skill Name</label>
                <input
                  type="text"
                  required
                  value={newSkillForm.canonical_name}
                  onChange={(e) => setNewSkillForm({ ...newSkillForm, canonical_name: e.target.value })}
                  placeholder="e.g. Next.js App Router"
                  className="admin-input-control"
                />
              </div>

              <div className="form-row-admin">
                <div className="form-group-admin">
                  <label>Domain</label>
                  <select
                    value={newSkillForm.domain}
                    onChange={(e) => setNewSkillForm({ ...newSkillForm, domain: e.target.value })}
                    className="admin-input-control"
                  >
                    <option value="ENGINEERING">Software Engineering</option>
                    <option value="MEDICAL">Clinical Medicine</option>
                  </select>
                </div>

                <div className="form-group-admin">
                  <label>Category</label>
                  <input
                    type="text"
                    value={newSkillForm.category}
                    onChange={(e) => setNewSkillForm({ ...newSkillForm, category: e.target.value })}
                    placeholder="e.g. Web Framework"
                    className="admin-input-control"
                  />
                </div>
              </div>

              <div className="form-group-admin">
                <label>Aliases (comma-separated)</label>
                <input
                  type="text"
                  value={newSkillForm.aliases}
                  onChange={(e) => setNewSkillForm({ ...newSkillForm, aliases: e.target.value })}
                  placeholder="e.g. nextjs, next14, next-app"
                  className="admin-input-control"
                />
              </div>

              <div className="form-group-admin">
                <label>Description &amp; Curriculum Scope</label>
                <textarea
                  rows="3"
                  value={newSkillForm.description}
                  onChange={(e) => setNewSkillForm({ ...newSkillForm, description: e.target.value })}
                  placeholder="Summary of skill scope and competency expectations..."
                  className="admin-textarea-control"
                />
              </div>

              <div className="form-actions-admin">
                <button type="button" className="admin-cancel-btn" onClick={() => setAddSkillModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-primary-btn">
                  Create Skill &amp; Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: USER PROGRESS ROADMAP */}
      {/* ========================================================================= */}
      {inspectUserProgress && (() => {
        const domain = inspectUserProgress.role === 'medical' ? 'medical' : 'engineering';
        const progressData = getProgress(domain, inspectUserProgress);
        const userStats = getUserStats(inspectUserProgress);
        return (
          <div className="admin-modal-backdrop" onClick={() => setInspectUserProgress(null)}>
            <div className="admin-action-modal-box" style={{ maxWidth: '800px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-top-bar">
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
                  Learning Roadmap: {inspectUserProgress.name}
                </h3>
                <button className="modal-close-icon-btn" onClick={() => setInspectUserProgress(null)}>
                  <X size={18} />
                </button>
              </div>
              <div style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                  {progressData.map((item, index) => {
                    const pct = userStats.skillProgress[item.skill] ?? 0;
                    return (
                      <div key={index} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ color: '#38bdf8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>{item.category}</span>
                          <span style={{ color: pct >= 80 ? '#10b981' : '#f59e0b', fontWeight: 700 }}>{pct}%</span>
                        </div>
                        <h4 style={{ margin: '0 0 12px', fontSize: '1.1rem' }}>{item.skill}</h4>
                        <div style={{ background: '#0f172a', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: pct >= 80 ? '#10b981' : '#3b82f6', transition: 'width 0.3s' }}></div>
                        </div>
                        <p style={{ marginTop: '12px', fontSize: '0.85rem', color: '#94a3b8' }}>
                          {pct === 0 ? 'Not started' : pct < 80 ? 'In Progress' : 'Mastered'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default AdminDashboard;
