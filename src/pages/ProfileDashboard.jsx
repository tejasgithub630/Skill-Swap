import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Shield, Bell, CreditCard, ChevronRight, Edit2, Award, Zap, BookOpen, LogOut, CheckCircle, Smartphone, Globe, Lock, Plus, ExternalLink, ShieldCheck, AlertCircle, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Button from '../components/Button';
import SkillRequestModal from '../components/SkillRequestModal';
import AdminSkillDashboard from '../components/AdminSkillDashboard';
import AssessmentPopup from '../components/AssessmentPopup';
import './ProfileDashboard.css';

const ProfileDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [profileData, setProfileData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ phone: '', bio: '', location: '', interests: [] });

  // Dynamic Skill Registration & Certification states
  const [userSkillsData, setUserSkillsData] = useState({
    verifiedSkills: [],
    selfDeclaredSkills: [],
    expiredSkills: [],
    wantedSkills: []
  });
  const [canonicalSkills, setCanonicalSkills] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [assessmentTopic, setAssessmentTopic] = useState(null);
  const [showAddSkillForm, setShowAddSkillForm] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [selectedProficiency, setSelectedProficiency] = useState('INTERMEDIATE');
  const [statusNotice, setStatusNotice] = useState('');

  const fetchUserSkills = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      const res = await fetch('/api/users/me/skills', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserSkillsData(data);
      }
    } catch (err) {
      console.error('Failed to load user skills', err);
    }
  }, []);

  const fetchCanonicalSkills = useCallback(async () => {
    try {
      const res = await fetch('/api/skills');
      if (res.ok) {
        const data = await res.json();
        setCanonicalSkills(data.skills || []);
      }
    } catch (err) {
      console.error('Failed to fetch canonical skills', err);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch('/api/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfileData(data);
          let loadedInterests = [];
          if (data.profile?.interests) {
            try {
              loadedInterests = typeof data.profile.interests === 'string'
                ? JSON.parse(data.profile.interests)
                : data.profile.interests;
            } catch {
              loadedInterests = data.profile.interests.split(',').map(s => s.trim());
            }
          } else {
            loadedInterests = user.role === 'engineering' 
              ? ['Distributed Systems', 'Cloud Architecture', 'High Concurrency']
              : ['Cardiology Research', 'Clinical Pharmacology', 'Pharmacogenomics'];
          }

          setEditForm({
            name: data.name || user.name || '',
            phone: data.profile?.phone || '',
            bio: data.profile?.bio || '',
            location: data.profile?.location || '',
            interests: loadedInterests
          });
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUserSkills();
    fetchCanonicalSkills();
  }, [user, navigate, fetchUserSkills, fetchCanonicalSkills]);

  if (!user) return null;

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        const updatedProfile = await res.json();
        setProfileData(prev => ({ ...prev, ...updatedProfile, profile: updatedProfile.profile || updatedProfile }));
        
        // Update user name in local storage if changed
        if (editForm.name && editForm.name !== user.name) {
          const updatedUser = { ...user, name: editForm.name, name_changes_count: (user.name_changes_count || 0) + 1 };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          // Dispatch a custom event to sync across tabs/components if needed, though a reload might be needed to reflect everywhere.
          // For now, reload window is the simplest way to update the whole app state since user is fetched from localStorage in many places
          window.location.reload();
          return;
        }

        setIsEditing(false);
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    let prevInterests = [];
    if (profileData?.profile?.interests) {
      try {
        prevInterests = typeof profileData.profile.interests === 'string' 
          ? JSON.parse(profileData.profile.interests) 
          : profileData.profile.interests;
      } catch {
        prevInterests = profileData.profile.interests.split(',').map(s => s.trim());
      }
    }
    setEditForm({
      name: profileData?.name || user.name || '',
      phone: profileData?.profile?.phone || '',
      bio: profileData?.profile?.bio || '',
      location: profileData?.profile?.location || '',
      interests: prevInterests
    });
    setIsEditing(false);
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!selectedSkillId) return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/users/me/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          skill_id: selectedSkillId,
          proficiency_level: selectedProficiency,
          is_teaching: true
        })
      });
      if (res.ok) {
        const data = await res.json();
        setShowAddSkillForm(false);
        setSelectedSkillId('');
        fetchUserSkills();
        if (data.is_verified) {
          setStatusNotice('✓ Skill added with verified platform credential.');
        } else {
          setStatusNotice('Skill added as Self-Declared. Take the assessment to verify this skill.');
        }
        setTimeout(() => setStatusNotice(''), 7000);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add skill');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveSkill = async (skillId) => {
    if (!window.confirm('Remove this skill from your profile?')) return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/users/me/skills/${skillId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchUserSkills();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartCertification = (skillName) => {
    setAssessmentTopic(skillName);
  };

  const handleAssessmentComplete = () => {
    fetchUserSkills();
    setAssessmentTopic(null);
    setStatusNotice('🎉 Congratulations! Your skill is now officially verified on your profile.');
    setTimeout(() => setStatusNotice(''), 8000);
  };

  const sidebarItems = [
    { icon: <User size={20} />, label: 'Profile Overview', id: 'overview' },
    { icon: <Settings size={20} />, label: 'Account Settings', id: 'settings' },
    { icon: <Shield size={20} />, label: 'Privacy & Security', id: 'security' },
    { icon: <Bell size={20} />, label: 'Notifications', id: 'notifications' },
    { icon: <CreditCard size={20} />, label: 'Subscription', id: 'billing' },
  ];

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      <Sidebar items={sidebarItems} activeId={activeTab} onItemClick={setActiveTab} />
      <div className="dashboard-main">
        <Navbar />
        <div className="dashboard-content">
          <div className="profile-container section-animate">
            <header className="profile-header-new">
              <div className="profile-banner"></div>
              <div className="profile-identity">
                <div className="profile-avatar-large" style={{ overflow: 'hidden', position: 'relative' }}>
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    getInitials(user.name)
                  )}
                  <button 
                    className="edit-avatar"
                    onClick={() => {
                      const url = prompt("Enter the URL for your new profile picture:");
                      if (url) {
                        const updatedUser = { ...user, avatarUrl: url };
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                        setUser(updatedUser);
                      }
                    }}
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
                <div className="profile-name-info">
                  {isEditing ? (
                    <div>
                      <input 
                        type="text" 
                        value={editForm.name} 
                        onChange={e => setEditForm({...editForm, name: e.target.value})}
                        disabled={user.name_changes_count >= 1}
                        title={user.name_changes_count >= 1 ? "You have already changed your name once." : ""}
                        style={{ fontSize: '2rem', fontWeight: 800, padding: '4px 8px', borderRadius: '6px', border: '1px solid #ccc', marginBottom: '8px', width: '100%', maxWidth: '300px', backgroundColor: user.name_changes_count >= 1 ? '#f1f5f9' : 'white' }}
                      />
                      {user.name_changes_count >= 1 && <div style={{fontSize: '0.85rem', color: '#ef4444', marginTop: '-4px', marginBottom: '8px', fontWeight: 600}}>Name changes disabled (Limit reached)</div>}
                    </div>
                  ) : (
                    <h1>{user.name}</h1>
                  )}
                  <p className="profile-role-tag">{user.role === 'engineering' ? '⚙️ Senior Software Engineer' : '🏥 Medical Specialist'}</p>
                  <p className="profile-location">San Francisco, CA • Joined Jan 2024</p>
                </div>
                <div className="profile-actions">
                  {(user.is_admin || user.email === 'admin@skillswap.com' || user.role === 'admin') && (
                    <Button 
                      variant="outline" 
                      style={{ borderColor: '#f59e0b', color: '#fbbf24', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
                      onClick={() => navigate('/admin')}
                    >
                      🛡️ Admin Console
                    </Button>
                  )}
                  <Button variant="primary" onClick={() => { setActiveTab('settings'); handleStartEdit(); }}>Edit Profile</Button>
                  <Button variant="outline" onClick={handleLogout}>Log Out</Button>
                </div>
              </div>
            </header>

            {activeTab === 'overview' && (
              <div className="profile-grid">
                <div className="profile-col-main">
                  <Card className="profile-card-new">
                    <h3>About Me</h3>
                    {isEditing ? (
                      <textarea style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} rows="4" />
                    ) : (
                      <p>{profileData?.profile?.bio || (user.role === 'engineering' ? 'Software Engineer' : 'Medical Professional')}</p>
                    )}
                  </Card>

                  {/* Dynamic Skill Registration, Certification, and Verification Section */}
                  <Card className="profile-card-new">
                    <div className="taxonomy-header-bar mb-3">
                      <div>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <ShieldCheck size={22} color="#059669" />
                          Verified Skills & Dynamic Taxonomy
                        </h3>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                          SkillSwap separates self-declared skills from verified credentials certified through proctored assessments.
                        </p>
                      </div>
                      <div className="taxonomy-btn-group">
                        <Button 
                          variant="ghost" 
                          className="btn-sm" 
                          onClick={() => setShowRequestModal(true)}
                        >
                          Can't find your skill? Request New
                        </Button>
                        <Button 
                          variant="outline" 
                          className="btn-sm" 
                          onClick={() => setShowAddSkillForm(!showAddSkillForm)}
                        >
                          <Plus size={14} /> Add Skill
                        </Button>
                      </div>
                    </div>

                    {/* Status Notice Banner */}
                    {statusNotice && (
                      <div style={{ marginBottom: '14px', padding: '10px 14px', background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '8px', color: '#166534', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle size={18} />
                        <span>{statusNotice}</span>
                      </div>
                    )}

                    {/* Inline Add Skill Form */}
                    {showAddSkillForm && (
                      <form onSubmit={handleAddSkill} className="add-skill-inline-panel mb-4">
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>Add Skill to Profile</div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <select 
                            value={selectedSkillId} 
                            onChange={(e) => setSelectedSkillId(e.target.value)}
                            required
                            style={{ flex: 2, minWidth: '180px', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                          >
                            <option value="">Select a Canonical Skill...</option>
                            {canonicalSkills.map(s => (
                              <option key={s.id} value={s.id}>
                                {s.canonical_name} ({s.category || s.domain})
                              </option>
                            ))}
                          </select>
                          <select 
                            value={selectedProficiency} 
                            onChange={(e) => setSelectedProficiency(e.target.value)}
                            style={{ flex: 1, minWidth: '120px', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                          >
                            <option value="BEGINNER">Beginner</option>
                            <option value="INTERMEDIATE">Intermediate</option>
                            <option value="ADVANCED">Advanced</option>
                            <option value="EXPERT">Expert</option>
                          </select>
                          <Button variant="primary" className="btn-sm" type="submit">Add to Profile</Button>
                          <Button variant="ghost" className="btn-sm" type="button" onClick={() => setShowAddSkillForm(false)}>Cancel</Button>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                          Newly added skills start as <b>Self-Declared</b> until verified via proctored assessment.
                        </p>
                      </form>
                    )}

                    {/* SUB-SECTION 1: VERIFIED SKILLS */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#059669', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        ✓ Verified Skills (SkillSwap Certified)
                      </h4>
                      {userSkillsData.verifiedSkills && userSkillsData.verifiedSkills.length > 0 ? (
                        <div className="verified-skills-grid">
                          {userSkillsData.verifiedSkills.map(skill => (
                            <div key={skill.id || skill.skill_id} className="skill-verif-card verified-theme">
                              <div>
                                <div className="skill-card-top">
                                  <span className="skill-card-title">{skill.name}</span>
                                  <span className="skill-badge-pill badge-verified-glow">
                                    ✓ Verified
                                  </span>
                                </div>
                                <div className="skill-meta-details">
                                  <span className="skill-level-chip">{skill.proficiency_level}</span>
                                  {skill.score !== null && skill.score !== undefined && (
                                    <span className="skill-score-chip">Score: {skill.score}%</span>
                                  )}
                                </div>
                                {skill.certificate_number && (
                                  <div>
                                    <div className="cert-num-code">{skill.certificate_number}</div>
                                    <a 
                                      href={`/verify/certificate/${skill.certificate_number}`} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="cert-verify-link"
                                    >
                                      <ExternalLink size={12} /> Public Verification Link
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
                          No verified skills yet. Take an assessment to earn your official SkillSwap badge and verifiable certificate!
                        </p>
                      )}
                    </div>

                    {/* SUB-SECTION 2: SELF-DECLARED SKILLS */}
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#b45309', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        ○ Self-Declared Skills (Verification Required)
                      </h4>
                      {userSkillsData.selfDeclaredSkills && userSkillsData.selfDeclaredSkills.length > 0 ? (
                        <div className="verified-skills-grid">
                          {userSkillsData.selfDeclaredSkills.map(skill => (
                            <div key={skill.id || skill.skill_id} className="skill-verif-card self-declared-theme">
                              <div>
                                <div className="skill-card-top">
                                  <span className="skill-card-title">{skill.name}</span>
                                  <span className="skill-badge-pill badge-self-declared-pill">
                                    ○ Self Declared
                                  </span>
                                </div>
                                <div className="skill-meta-details">
                                  <span className="skill-level-chip">{skill.proficiency_level || 'Beginner'}</span>
                                  <span style={{ fontSize: '0.75rem', color: '#92400e' }}>Verification required</span>
                                </div>
                              </div>
                              <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <Button 
                                  variant="primary" 
                                  className="btn-sm" 
                                  style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem' }}
                                  onClick={() => handleStartCertification(skill.name)}
                                >
                                  <Award size={14} /> Take Certification
                                </Button>
                                <button 
                                  title="Remove Skill"
                                  onClick={() => handleRemoveSkill(skill.skill_id || skill.id)}
                                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
                          No self-declared skills. Add an existing skill from the canonical taxonomy above.
                        </p>
                      )}
                    </div>

                    {/* SUB-SECTION 3: EXPIRED CERTIFICATIONS (IF ANY) */}
                    {userSkillsData.expiredSkills && userSkillsData.expiredSkills.length > 0 && (
                      <div style={{ marginTop: '1.25rem' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#dc2626', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          ⚠️ Expired Certifications
                        </h4>
                        <div className="verified-skills-grid">
                          {userSkillsData.expiredSkills.map(skill => (
                            <div key={skill.id || skill.skill_id} className="skill-verif-card" style={{ borderColor: '#fca5a5', background: '#fef2f2' }}>
                              <div className="skill-card-top">
                                <span className="skill-card-title">{skill.name}</span>
                                <span className="skill-badge-pill badge-expired-pill">Expired</span>
                              </div>
                              <p style={{ fontSize: '0.78rem', color: '#991b1b', margin: '4px 0 10px' }}>
                                Certification validity period expired. Retake assessment to restore verified trust.
                              </p>
                              <Button 
                                variant="outline" 
                                className="btn-sm" 
                                onClick={() => handleStartCertification(skill.name)}
                              >
                                Recertify Now
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>

                  <Card className="profile-card-new">
                    <div className="card-header-flex">
                      <div>
                        <h3>My Interests & Specializations</h3>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>Personalizes your dashboard matches and recommended skill tracks</p>
                      </div>
                      {!isEditing && (
                        <Button variant="ghost" className="btn-sm" onClick={handleStartEdit}>
                          <Edit2 size={14} /> Edit Interests
                        </Button>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                      {editForm.interests && editForm.interests.length > 0 ? (
                        editForm.interests.map((interest, idx) => (
                          <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#EEF2FF', color: '#4F46E5', padding: '6px 12px', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 600 }}>
                            🏷️ {interest}
                            {isEditing && (
                              <button 
                                type="button"
                                onClick={() => {
                                  setEditForm(prev => ({
                                    ...prev,
                                    interests: prev.interests.filter((_, i) => i !== idx)
                                  }));
                                }}
                                style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 0, fontWeight: 'bold', marginLeft: '4px' }}
                              >
                                ✕
                              </button>
                            )}
                          </span>
                        ))
                      ) : (
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No interests added yet.</p>
                      )}
                    </div>
                    {isEditing && (
                      <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
                        <input 
                          type="text" 
                          placeholder="Add an interest (e.g. Distributed Systems, AI, Cardiology)..." 
                          id="new-interest-input"
                          style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = e.target.value.trim();
                              if (val && !editForm.interests.includes(val)) {
                                setEditForm(prev => ({ ...prev, interests: [...prev.interests, val] }));
                                e.target.value = '';
                              }
                            }
                          }}
                        />
                        <Button 
                          variant="outline" 
                          className="btn-sm"
                          type="button"
                          onClick={() => {
                            const input = document.getElementById('new-interest-input');
                            if (input && input.value.trim() && !editForm.interests.includes(input.value.trim())) {
                              setEditForm(prev => ({ ...prev, interests: [...prev.interests, input.value.trim()] }));
                              input.value = '';
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    )}
                  </Card>

                  <Card className="profile-card-new">
                    <h3>Badges & Achievements</h3>
                    <div className="badges-list">
                      <div className="badge-item" title="Top Swapper">🏅</div>
                      <div className="badge-item" title="Helpful Mentor">🤝</div>
                      <div className="badge-item" title="Quick Learner">⚡</div>
                      <div className="badge-item" title="50+ Swaps">🔥</div>
                      <div className="badge-item plus">+3 More</div>
                    </div>
                  </Card>
                </div>

                <div className="profile-col-side">
                  <Card className="profile-card-new stat-card">
                    <div className="stat-row">
                      <span className="stat-label">Total Swaps</span>
                      <span className="stat-value">24</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Rating</span>
                      <span className="stat-value">⭐ 4.9 (12 reviews)</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Response Rate</span>
                      <span className="stat-value">98%</span>
                    </div>
                  </Card>

                  <Card className="profile-card-new activity-card">
                    <h3>Recent Activity</h3>
                    <div className="activity-list">
                      <div className="activity-item">
                        <div className="activity-bullet"></div>
                        <div className="activity-text">Joined <b>Web Dev Mastery</b></div>
                      </div>
                      <div className="activity-item">
                        <div className="activity-bullet"></div>
                        <div className="activity-text">Swapped <b>React</b> for <b>Go</b></div>
                      </div>
                      <div className="activity-item">
                        <div className="activity-bullet"></div>
                        <div className="activity-text">Profile updated</div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="settings-view section-animate">
                <Card>
                  <div className="card-header-flex mb-4">
                    <h3>Account Settings</h3>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Button variant="outline" className="btn-sm" onClick={handleCancel}>Cancel</Button>
                        <Button variant="primary" className="btn-sm" onClick={handleSave}>Save Changes</Button>
                      </div>
                    ) : (
                      <Button variant="outline" className="btn-sm" onClick={handleStartEdit}>Edit Settings</Button>
                    )}
                  </div>
                  <div className="settings-list">
                    <div className="settings-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                      <p className="settings-label">Full Name</p>
                      <p className="settings-value">{user.name} <span style={{fontSize: '0.8rem', color: '#888'}}>(Read-only)</span></p>
                    </div>
                    <div className="settings-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                      <p className="settings-label">Email Address</p>
                      <p className="settings-value">{user.email} <span style={{fontSize: '0.8rem', color: '#888'}}>(Read-only)</span></p>
                    </div>
                    <div className="settings-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                      <p className="settings-label">Phone Number</p>
                      {isEditing ? (
                        <input type="tel" style={{ padding: '8px', width: '100%', borderRadius: '6px', border: '1px solid #ccc' }} value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                      ) : (
                        <p className="settings-value">{user.phone || '+1 (555) 000-0000'}</p>
                      )}
                    </div>
                    <div className="settings-item">
                      <div className="settings-info">
                        <p className="settings-label">Language</p>
                        <p className="settings-value">English (US)</p>
                      </div>
                      <Button variant="outline" className="btn-sm" disabled={!isEditing}>Change</Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="settings-view section-animate">
                <Card>
                  <h3>Privacy & Security</h3>
                  <div className="settings-list">
                    <div className="settings-item">
                      <div className="settings-icon-wrap"><Lock size={20} /></div>
                      <div className="settings-info">
                        <p className="settings-label">Two-Factor Authentication</p>
                        <p className="settings-desc">Add an extra layer of security to your account.</p>
                      </div>
                      <div className="toggle-switch active"></div>
                    </div>
                    <div className="settings-item">
                      <div className="settings-icon-wrap"><Smartphone size={20} /></div>
                      <div className="settings-info">
                        <p className="settings-label">Connected Devices</p>
                        <p className="settings-desc">Manage your active sessions on other devices.</p>
                      </div>
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="profile-grid">
                <div className="profile-col-main" style={{ flex: '1 1 100%' }}>
                  <Card className="profile-card-new section-animate">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Bell size={22} color="#0ea5e9" />
                      Recent Notifications
                    </h3>
                    <p style={{ color: '#64748b', marginBottom: '20px' }}>Stay updated with your skill matches, system alerts, and messages.</p>
                    
                    <div className="settings-list">
                      <div className="settings-item" style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                        <div className="settings-info">
                          <p className="settings-label">New Match Found! 🌟</p>
                          <p className="settings-desc">We found a perfect 95% match for your request to learn React. Check your Matches dashboard.</p>
                          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>2 hours ago</p>
                        </div>
                      </div>
                      
                      <div className="settings-item" style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #f59e0b', marginTop: '10px' }}>
                        <div className="settings-info">
                          <p className="settings-label">Skill Assessment Reminder ⏱️</p>
                          <p className="settings-desc">You started a 'Python' verification assessment but haven't finished. Complete it to boost your match rate!</p>
                          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>Yesterday</p>
                        </div>
                      </div>
                      
                      <div className="settings-item" style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #3b82f6', marginTop: '10px' }}>
                        <div className="settings-info">
                          <p className="settings-label">Welcome to SkillSwap V2 🚀</p>
                          <p className="settings-desc">We've upgraded our matching engine! Your matches will now be more accurate than ever.</p>
                          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>2 days ago</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {activeTab !== 'overview' && activeTab !== 'settings' && activeTab !== 'security' && activeTab !== 'notifications' && (
              <Card className="empty-card section-animate">
                <div className="flex flex-col items-center py-10">
                  <div className="mb-4 opacity-20"><BookOpen size={48} /></div>
                  <p className="text-secondary">This section is coming soon!</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Modals for Dynamic Skills, Administration, and Proctored Assessment */}
      {showRequestModal && (
        <SkillRequestModal 
          isOpen={showRequestModal} 
          onClose={() => setShowRequestModal(false)}
          onSkillCreated={() => {
            fetchCanonicalSkills();
            fetchUserSkills();
          }}
        />
      )}

      {showAdminModal && (
        <AdminSkillDashboard 
          isOpen={showAdminModal} 
          onClose={() => setShowAdminModal(false)}
        />
      )}

      {assessmentTopic && (
        <AssessmentPopup 
          user={user}
          topic={assessmentTopic}
          onClose={() => setAssessmentTopic(null)}
          onStart={handleAssessmentComplete}
        />
      )}
    </div>
  );
};

export default ProfileDashboard;
