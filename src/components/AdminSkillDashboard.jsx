import React, { useState, useEffect } from 'react';
import { Shield, Check, X, AlertTriangle, Layers, Award, RefreshCw, ExternalLink, Sparkles } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import './AdminSkillDashboard.css';

const AdminSkillDashboard = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'skills' | 'certifications'
  const [requests, setRequests] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      const [reqRes, skillRes] = await Promise.all([
        fetch('/api/skills/requests', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/skills', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setRequests(reqData);
      }
      if (skillRes.ok) {
        const skillData = await skillRes.json();
        setSkills(skillData);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAdminData();
  }, []);

  const handleApprove = async (reqItem) => {
    const canonicalName = prompt("Confirm or edit Canonical Skill Name:", reqItem.requested_name);
    if (!canonicalName) return;

    const aliasesInput = prompt("Enter common aliases separated by comma (optional):", `${canonicalName}lang, ${canonicalName}.js`);
    const aliases = aliasesInput ? aliasesInput.split(',').map(s => s.trim()) : [];

    try {
      setActionLoading(reqItem.id);
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/skills/requests/${reqItem.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'APPROVED',
          canonical_name: canonicalName,
          category: reqItem.category,
          domain: reqItem.domain,
          aliases,
          admin_feedback: `Approved and published globally to SkillSwap ${reqItem.domain} catalogue.`
        })
      });

      if (res.ok) {
        alert(`Skill "${canonicalName}" approved! It is now globally available in the skill catalogue with an auto-configured assessment.`);
        fetchAdminData();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (reqItem) => {
    const feedback = prompt("Enter rejection reason for requester:", "Does not meet taxonomy guidelines.");
    if (!feedback) return;

    try {
      setActionLoading(reqItem.id);
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/skills/requests/${reqItem.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'REJECTED',
          admin_feedback: feedback
        })
      });

      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1150 }}>
      <div className="modal-content admin-modal-content">
        <header className="modal-header">
          <div className="flex items-center gap-2">
            <div className="admin-badge-icon">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Admin Skill Management Console</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>Approve new skill requests, configure taxonomy aliases, and govern certifications.</p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </header>

        <div className="admin-tab-nav">
          <button 
            className={`admin-tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Pending Skill Requests ({requests.filter(r => r.status === 'REQUESTED' || r.status === 'UNDER_REVIEW').length})
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            Canonical Taxonomy ({skills.length})
          </button>
        </div>

        <div className="admin-modal-body">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading taxonomy data...</div>
          ) : activeTab === 'requests' ? (
            <div className="requests-table-container">
              {requests.length === 0 ? (
                <div className="p-6 text-center text-slate-400">No skill requests logged yet.</div>
              ) : (
                <div className="admin-requests-list">
                  {requests.map(reqItem => (
                    <Card key={reqItem.id} className={`admin-request-card ${reqItem.status.toLowerCase()}`}>
                      <div className="admin-request-main">
                        <div className="request-title-row">
                          <h4>{reqItem.requested_name}</h4>
                          <span className={`domain-badge ${reqItem.domain.toLowerCase()}`}>{reqItem.domain}</span>
                          <span className={`status-badge status-${reqItem.status.toLowerCase()}`}>{reqItem.status}</span>
                        </div>
                        <p className="request-desc">{reqItem.description}</p>
                        {reqItem.justification && (
                          <p className="request-justification"><b>Justification:</b> {reqItem.justification}</p>
                        )}
                        <div className="request-meta-info">
                          <span>Requested by: <b>{reqItem.requester?.name || 'User'}</b> ({reqItem.requester?.email})</span>
                          <span>Category: <b>{reqItem.category}</b></span>
                          <span>Date: {new Date(reqItem.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {reqItem.status === 'REQUESTED' || reqItem.status === 'UNDER_REVIEW' ? (
                        <div className="admin-action-btns">
                          <Button 
                            variant="primary" 
                            className="btn-sm"
                            isLoading={actionLoading === reqItem.id}
                            onClick={() => handleApprove(reqItem)}
                          >
                            <Check size={14} /> Approve & Publish
                          </Button>
                          <Button 
                            variant="outline" 
                            className="btn-sm"
                            onClick={() => handleReject(reqItem)}
                          >
                            <X size={14} /> Reject
                          </Button>
                        </div>
                      ) : (
                        <div className="status-resolved-text">
                          {reqItem.status === 'APPROVED' ? '✓ Published to Global Taxonomy' : '✕ Request Rejected'}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="skills-table-container">
              <div className="skills-grid-admin">
                {skills.map(s => (
                  <Card key={s.id} className="admin-skill-pill-card">
                    <div className="flex justify-between items-start">
                      <span className="skill-name-bold">{s.canonical_name}</span>
                      <span className={`domain-badge ${s.domain.toLowerCase()}`}>{s.domain}</span>
                    </div>
                    <span className="skill-cat-sub">{s.category}</span>
                    {s.aliases && s.aliases.length > 0 && (
                      <div className="aliases-row">
                        <span className="aliases-label">Aliases:</span>
                        {s.aliases.map((a, i) => (
                          <span key={i} className="alias-chip">{a}</span>
                        ))}
                      </div>
                    )}
                    <div className="assessment-indicator">
                      {s.has_assessment ? '✓ Proctored Assessment Active' : '⚠ No Assessment'}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSkillDashboard;
