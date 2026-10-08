import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, MessageSquare, BarChart2, Star, ArrowRight, CheckCircle, PlusCircle, MessageCircle, Calendar, X, Search, Clock, Target, Trophy, TrendingUp, Check, Video, Award, Shield, Activity, Sparkles, Sliders } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Button from '../components/Button';
import ChatRoom from '../components/ChatRoom';
import CourseModal from '../components/CourseModal';
import AssessmentPopup from '../components/AssessmentPopup';
import SkillRequestModal from '../components/SkillRequestModal';
import RadiologyReviewModal from '../components/RadiologyReviewModal';
import PathologyConsultModal from '../components/PathologyConsultModal';
import AnatomyFlashcardModal from '../components/AnatomyFlashcardModal';
import LearningRingsView from '../components/LearningRingsView';
import ScoreBreakdownModal from '../components/ScoreBreakdownModal';
import { getGroups, joinGroup, leaveGroup, getRecommendations, getProgress, startLearning, getCourseDetails, syncUser, getPeersForSkill, getUserStats, updateStreak, recordAssessmentPassed, recordSession, completeDailyTask, getTodayTasks, updateSkillProgress } from '../data/db';
import './Dashboard.css';

const MedicalDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : {};
  });
  const userName = user.name || 'User';

  // ── Live stats (zeroed for new users) ──
  const [userStats, setUserStats] = useState(() => {
    const s = getUserStats(user);
    return updateStreak(user) || s;
  });

  const refreshStats = (u) => {
    setUserStats(getUserStats(u || user));
  };

  const [showAssessment, setShowAssessment] = useState(false);
  const [pendingSkill, setPendingSkill] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [dynamicSkills, setDynamicSkills] = useState([]);

  // Daily clinical task modals
  const [showRadiologyModal, setShowRadiologyModal] = useState(false);
  const [showPathologyModal, setShowPathologyModal] = useState(false);
  const [showFlashcardsModal, setShowFlashcardsModal] = useState(false);

  const [urgencyMode, setUrgencyMode] = useState('standard');
  const [selectedBreakdownMatch, setSelectedBreakdownMatch] = useState(null);

  const [matches, setMatches] = useState([]);
  const [groups, setGroups] = useState(() => getGroups('medical'));
  const [recommendations, setRecommendations] = useState(() => getRecommendations('medical'));
  const [userInterests, setUserInterests] = useState([]);
  const [progressData, setProgressData] = useState(() => getProgress('medical', user));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          navigate('/');
          return;
        }

        // Fetch Matches
        const res = await fetch(`/api/matches?urgency=${urgencyMode}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const medMatches = data.filter(m => m.role === 'medical' && m.matchScore >= 45);
          setMatches(medMatches);
        } else if (res.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          navigate('/');
          return;
        } else {
          setMatches([]);
        }

        // Fetch Interest-driven Recommendations
        const recRes = await fetch('/api/recommendations', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (recRes.ok) {
          const recData = await recRes.json();
          if (recData.recommendations && recData.recommendations.length > 0) {
            setRecommendations(recData.recommendations);
          }
          if (recData.userInterests) {
            setUserInterests(recData.userInterests);
          }
        }

        // Fetch dynamic canonical medical skills from backend
        const skillsRes = await fetch('/api/skills?domain=MEDICAL');
        if (skillsRes.ok) {
          const skillsData = await skillsRes.json();
          if (skillsData.skills && skillsData.skills.length > 0) {
            setDynamicSkills(skillsData.skills.map(s => s.canonical_name));
          }
        }
      } catch (err) {
        console.error('Failed to fetch medical dashboard data:', err);
        setMatches([]);
      }
    };
    fetchData();
  }, [urgencyMode, navigate]);

  // Daily task completion (persisted per-day)
  const [todayTasks, setTodayTasks] = useState(() => getTodayTasks(user));

  const [activeSection, setActiveSection] = useState('exchange');
  const joinedGroups = groups.filter(g => g.joined).map(g => g.id);

  const [activeChat, setActiveChat] = useState(null);
  const [showBrowseSkills, setShowBrowseSkills] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("Anatomy");
  const [activeCourse, setActiveCourse] = useState(null);

  const dismissAssessment = () => {
    setShowAssessment(false);
    setPendingSkill(null);
  };

  const completeAssessment = () => {
    if (pendingSkill) {
      const isAlreadyMine = user.mySkills?.includes(pendingSkill);
      const isAlreadyWant = user.wantSkills?.includes(pendingSkill);
      const updatedUser = { 
        ...user, 
        mySkills: isAlreadyMine ? user.mySkills : [...(user.mySkills || []), pendingSkill],
        wantSkills: isAlreadyWant ? user.wantSkills.filter(s => s !== pendingSkill) : (user.wantSkills || []),
        hasTakenAssessment: true
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      syncUser(updatedUser);
      setUser(updatedUser);
      recordAssessmentPassed(updatedUser, pendingSkill);
      refreshStats(updatedUser);
      alert(`🎉 Congratulations! You scored ≥80% and verified ${pendingSkill} on your profile.`);
    }
    dismissAssessment();
    setShowBrowseSkills(false);
  };

  const toggleJoin = (e, id) => {
    e.stopPropagation();
    const isJoined = joinedGroups.includes(id);
    if (isJoined) {
      leaveGroup('medical', id);
    } else {
      joinGroup('medical', id);
    }
    setGroups(getGroups('medical'));
  };

  const handleStartLearning = (rec) => {
    startLearning('medical', rec);
    setRecommendations(getRecommendations('medical'));
    setProgressData(getProgress('medical', user));
    setActiveSection('progress');
  };

  const handleOpenChat = (e, target, type) => {
    e.stopPropagation();
    setActiveChat({ [type]: target });
    // Record chat swap session for the specific skill
    const targetSkill = target.wantSkill || target.mySkill || null;
    recordSession(user, 'chat', targetSkill);
    refreshStats();
  };

  const handleOpenCourse = (courseName) => {
    const details = getCourseDetails(courseName);
    setActiveCourse(details);
    updateSkillProgress(user, courseName, Math.min(100, (userStats.skillProgress[courseName] || 0) + 5));
    refreshStats();
  };

  const startMeeting = (e, match) => {
    e.stopPropagation();
    
    // Generate a deterministic meeting ID so both users join the same room.
    let meetingId;
    if (user?.id && match?.id) {
      // Sort IDs to ensure the order is identical for both users
      const ids = [user.id.toString(), match.id.toString()].sort();
      meetingId = `Match_${ids[0]}_${ids[1]}`;
    } else {
      // Fallback for generic connections
      meetingId = Math.floor(100000000 + Math.random() * 900000000).toString();
    }
    
    alert(`Connecting you to ${match?.user || 'an online specialist'} for a live session...`);
    // Using ffmuc.net's public Jitsi instance because meet.jit.si now requires moderator login
    window.open(`https://meet.ffmuc.net/SkillSwap_${meetingId}`, '_blank');
    // Record session and boost stats for specific skill
    const targetSkill = match?.wantSkill || match?.mySkill || null;
    recordSession(user, 'zoom', targetSkill);
    refreshStats();
  };

  const handleCompleteTask = (taskId) => {
    completeDailyTask(user, taskId);
    setTodayTasks(getTodayTasks(user));
    refreshStats();
  };

  const sidebarItems = [
    { icon: <RefreshCw size={20} />, label: 'Skill Exchange', id: 'exchange' },
    { icon: <RefreshCw size={20} />, label: 'Learning Rings (Multi-Hop)', id: 'rings' },
    { icon: <MessageSquare size={20} />, label: 'Case Discussions', id: 'discussions' },
    { icon: <BarChart2 size={20} />, label: 'Progress Tracker', id: 'progress' },
    { icon: <Star size={20} />, label: 'Recommendations', id: 'recommendations' },
  ];

  const myGroups = groups.filter(g => joinedGroups.includes(g.id));
  const availableGroups = groups.filter(g => !joinedGroups.includes(g.id));

  const defaultMedSkills = [
    "Anatomy", "Pharmacology", "Pathology", "Clinical Examination", "Radiology Basics", "Emergency Medicine",
    "Internal Medicine", "Surgery", "Pediatrics", "Obstetrics", "Gynecology", "Psychiatry", "Dermatology",
    "Ophthalmology", "ENT", "Orthopedics", "Cardiology", "Neurology", "Endocrinology", "Gastroenterology",
    "Hematology", "Immunology", "Microbiology", "Biochemistry", "Physiology", "Forensic Medicine"
  ];
  const allMedicalSkills = Array.from(new Set([...dynamicSkills, ...defaultMedSkills]));

  const filteredSkills = allMedicalSkills.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

  const categoryColors = {
    'Preclinical': '#6366F1',
    'Clinical': '#10B981',
  };

  return (
    <div className="dashboard-layout">
      <Sidebar items={sidebarItems} activeId={activeSection} onItemClick={setActiveSection} />
      <div className="dashboard-main">
        <Navbar />
        <div className="dashboard-content">
          {(user?.role === 'admin' || user?.is_admin) && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.25) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.5)',
              borderRadius: '10px',
              padding: '12px 18px',
              marginBottom: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: '#fbbf24'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Shield size={20} />
                <span><strong>Administrator Mode:</strong> You are currently previewing medical courses with Platform Administrator privileges.</span>
              </div>
              <button
                onClick={() => navigate('/admin')}
                style={{
                  background: '#f59e0b',
                  color: '#000',
                  fontWeight: 700,
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                Go to Admin Console →
              </button>
            </div>
          )}

          <header className="content-header">
            <div>
              <h1>Medical Dashboard</h1>
              <p>Welcome back, <strong>{userName}</strong>! Enhance clinical expertise through collaborative knowledge sharing.</p>
            </div>
          </header>

          {/* Skill Exchange */}
          {activeSection === 'exchange' && (
            <div className="section-animate">
              <div className="section-header mb-4" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <div className="flex items-center gap-4">
                  <h3>Exchange Requests</h3>
                  <Button variant="outline" className="btn-sm" onClick={() => setShowBrowseSkills(true)}>
                    <PlusCircle size={14} /> Browse All Skills
                  </Button>
                </div>

                {/* Algorithmic Routing Mode Toggle */}
                <div className="flex items-center gap-2" style={{ background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
                  <button
                    style={{
                      padding: '5px 12px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      borderRadius: '8px',
                      border: 'none',
                      background: urgencyMode === 'standard' ? '#ffffff' : 'transparent',
                      color: urgencyMode === 'standard' ? '#059669' : '#64748b',
                      boxShadow: urgencyMode === 'standard' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => setUrgencyMode('standard')}
                  >
                    🌟 Standard (Cold-Start Boost Active)
                  </button>
                  <button
                    style={{
                      padding: '5px 12px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      borderRadius: '8px',
                      border: 'none',
                      background: urgencyMode === 'urgent' ? '#ffffff' : 'transparent',
                      color: urgencyMode === 'urgent' ? '#b45309' : '#64748b',
                      boxShadow: urgencyMode === 'urgent' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => setUrgencyMode('urgent')}
                  >
                    🛡️ Urgent / Clinical Exam Mode
                  </button>
                </div>
              </div>

              <div className="match-grid">
                {matches.length > 0 ? matches.map(match => (
                  <Card key={match.id} className="match-card-v2">
                    <div className="match-card-top">
                      <div className="match-avatar" style={{ background: 'linear-gradient(135deg,#10B981,#3B82F6)' }}>{match.avatar}</div>
                      <div style={{ flex: 1 }}>
                        <div className="flex items-center justify-between">
                          <div className="match-user">{match.user}</div>
                          <span className="match-score-badge match-score-medical">{match.matchScore}% Match</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1" style={{ flexWrap: 'wrap' }}>
                          {match.isRisingStar && (
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, background: '#fef3c7', color: '#b45309', padding: '2px 6px', borderRadius: '4px' }}>
                              🌟 Rising Star
                            </span>
                          )}
                          {match.isMasterMentor && (
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, background: '#ecfdf5', color: '#047857', padding: '2px 6px', borderRadius: '4px' }}>
                              🛡️ Master Mentor
                            </span>
                          )}
                          {match.reliabilityScore !== undefined && (
                            <span style={{ fontSize: '0.68rem', fontWeight: 600, background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px' }}>
                              ✓ {match.reliabilityScore}% Reliability
                            </span>
                          )}
                          {match.sessionsCompleted !== undefined && (
                            <span style={{ fontSize: '0.68rem', fontWeight: 600, background: '#f1f5f9', color: '#64748b', padding: '2px 6px', borderRadius: '4px' }}>
                              {match.sessionsCompleted} sessions
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="skill-swap-row">
                      <span className="skill-pill skill-mine-medical">{match.mySkill}</span>
                      <ArrowRight size={16} className="swap-arrow" />
                      <span className="skill-pill skill-want">{match.wantSkill}</span>
                    </div>
                    {match.explanation && (
                      <div className="match-explanation-text" style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 10px', fontStyle: 'italic' }}>
                        💡 {match.explanation}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button variant="secondary" className="btn-full" onClick={(e) => handleOpenChat(e, match, 'match')}>Accept Exchange</Button>
                      <Button 
                        variant="outline" 
                        title="Zoom Video Call"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 10px', borderColor: '#2D8CFF', color: '#2D8CFF' }}
                        onClick={(e) => startMeeting(e, match)}
                      >
                        <Video size={16} />
                      </Button>
                      <Button 
                        variant="outline"
                        title="View Algorithmic Score Breakdown"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 10px', fontSize: '0.78rem' }}
                        onClick={() => setSelectedBreakdownMatch(match)}
                      >
                        <Sliders size={14} /> Breakdown
                      </Button>
                    </div>
                  </Card>
                )) : (
                  <div className="col-span-full" style={{ textAlign: 'center', padding: '3rem 2rem', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderRadius: '16px', border: '1px dashed #86efac' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏥</div>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#14532d', marginBottom: '0.5rem' }}>No matches yet — let's fix that!</h4>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                      The algorithm needs to know what clinical skills you <strong>teach</strong> and what you want to <strong>learn</strong> to find your ideal peers.
                    </p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => navigate('/profile')}
                        style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
                      >
                        ✏️ Add My Clinical Skills
                      </button>
                      <button
                        onClick={() => setShowBrowseSkills(true)}
                        style={{ background: '#fff', color: '#16a34a', border: '2px solid #16a34a', padding: '10px 22px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
                      >
                        🔍 Browse Medical Skills
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Multi-Hop Learning Rings Section */}
          {activeSection === 'rings' && (
            <div className="section-animate">
              <LearningRingsView currentUser={user} onOpenChat={handleOpenChat} />
            </div>
          )}



          {/* Progress Tracker */}
          {activeSection === 'progress' && (
            <div className="section-animate">
              <div className="section-header mb-4">
                <h3>📊 Medical Roadmap</h3>
                <span className="roadmap-meta">Track your clinical learning journey</span>
              </div>

              <div className="progress-stats-row mb-6">
                <Card className="stat-summary-card">
                  <div className="stat-icon-bg success"><TrendingUp size={24} /></div>
                  <div className="stat-content">
                    <h4>Clinical Proficiency</h4>
                    <div className="stat-number">72%</div>
                  </div>
                </Card>
                <Card className="stat-summary-card">
                  <div className="stat-icon-bg secondary"><Trophy size={24} /></div>
                  <div className="stat-content">
                    <h4>Cases Solved</h4>
                    <div className="stat-number">45</div>
                  </div>
                </Card>
                <Card className="stat-summary-card">
                  <div className="stat-icon-bg warning"><Clock size={24} /></div>
                  <div className="stat-content">
                    <h4>Study Streak</h4>
                    <div className="stat-number">22 Days</div>
                  </div>
                </Card>
              </div>

              <div className="daily-task-section mb-6">
                <div className="section-header mb-3">
                  <h4>📅 Daily Clinical Cases ({new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })})</h4>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{todayTasks.length}/3 completed</span>
                </div>
                <div className="daily-tasks-grid">
                  {/* Task 1: Radiology Case Review */}
                  {(() => {
                    const done = todayTasks.includes('radiology-review');
                    return (
                      <Card className={`daily-task-card ${done ? 'completed' : ''}`}>
                        <div className="task-status" style={{ color: done ? '#16a34a' : '#94a3b8' }}>
                          {done ? <CheckCircle size={18} /> : <Clock size={18} />}
                        </div>
                        <div className="task-info">
                          <h5>Case Review</h5>
                          <p>{done ? '✓ Analyzed 3 radiology reports' : 'Analyze 3 emergency chest X-rays'}</p>
                        </div>
                        {!done ? (
                          <Button 
                            variant="ghost" 
                            className="btn-sm" 
                            onClick={() => setShowRadiologyModal(true)}
                          >
                            Review
                          </Button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>Completed</span>
                        )}
                      </Card>
                    );
                  })()}

                  {/* Task 2: Pathology Consultation Swap */}
                  {(() => {
                    const done = todayTasks.includes('pathology-consult');
                    return (
                      <Card className={`daily-task-card ${done ? 'completed' : ''}`}>
                        <div className="task-status" style={{ color: done ? '#16a34a' : '#94a3b8' }}>
                          {done ? <CheckCircle size={18} /> : <Clock size={18} />}
                        </div>
                        <div className="task-info">
                          <h5>Expert Swap</h5>
                          <p>{done ? '✓ Requested 1 pathology consultation' : 'Request 1 pathology consultation'}</p>
                        </div>
                        {!done ? (
                          <Button 
                            variant="ghost" 
                            className="btn-sm" 
                            onClick={() => setShowPathologyModal(true)}
                          >
                            Request
                          </Button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>Requested</span>
                        )}
                      </Card>
                    );
                  })()}

                  {/* Task 3: Anatomy Flashcard Quiz */}
                  {(() => {
                    const done = todayTasks.includes('anatomy-flashcards');
                    return (
                      <Card className={`daily-task-card ${done ? 'completed' : ''}`}>
                        <div className="task-status" style={{ color: done ? '#16a34a' : '#94a3b8' }}>
                          {done ? <CheckCircle size={18} /> : <Target size={18} />}
                        </div>
                        <div className="task-info">
                          <h5>Quiz</h5>
                          <p>{done ? '✓ Completed 5 anatomy flashcards' : 'Complete 5 anatomy flashcards'}</p>
                        </div>
                        {!done ? (
                          <Button 
                            variant="ghost" 
                            className="btn-sm" 
                            onClick={() => setShowFlashcardsModal(true)}
                          >
                            Start
                          </Button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>Mastered</span>
                        )}
                      </Card>
                    );
                  })()}
                </div>
              </div>

              <div className="roadmap-grid-improved">
                {progressData.map((item, index) => {
                  const color = categoryColors[item.category] || '#10B981';
                  const pct = item.progress;
                  return (
                    <Card key={index} className="roadmap-card-v3">
                      <div className="roadmap-card-header">
                        <div>
                          <span className="roadmap-category-mini" style={{ color }}>{item.category}</span>
                          <h4 className="roadmap-skill-title">{item.skill}</h4>
                        </div>
                        <div className="roadmap-pct-bubble" style={{ backgroundColor: color }}>{pct}%</div>
                      </div>
                      
                      <div className="roadmap-track-container">
                        <div className="roadmap-track-bar">
                          <div 
                            className="roadmap-track-fill" 
                            style={{ width: `${pct}%`, backgroundColor: color }}
                          ></div>
                        </div>
                      </div>

                      <div className="roadmap-details">
                        <div className="detail-item">
                          <Target size={14} />
                          <span>
                            <b>Next:</b>{' '}
                            {pct === 0 && 'Module 1 - Core Fundamentals'}
                            {pct > 0 && pct < 50 && 'Module 2 - Clinical Patterns'}
                            {pct >= 50 && pct < 75 && 'Module 3 - Case Diagnostics'}
                            {pct >= 75 && pct < 100 && 'Module 4 - Practical Assessment'}
                            {pct >= 100 && 'Curriculum Completed ✓'}
                          </span>
                        </div>
                        <div className="detail-item">
                          <Clock size={14} />
                          <span>
                            <b>Est:</b>{' '}
                            {pct === 0 && '4 hours left'}
                            {pct > 0 && pct < 50 && '3 hours left'}
                            {pct >= 50 && pct < 75 && '2 hours left'}
                            {pct >= 75 && pct < 100 && '1 hour left'}
                            {pct >= 100 && 'Mastered'}
                          </span>
                        </div>
                      </div>

                      <div className="roadmap-footer">
                        <Button variant="ghost" className="btn-sm w-full" onClick={() => handleOpenCourse(item.skill)}>View Modules</Button>
                        <Button variant="secondary" className="btn-sm w-full" onClick={() => handleOpenCourse(item.skill)}>Continue</Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Case Discussions */}
          {activeSection === 'discussions' && (
            <div className="section-animate">
              <div className="section-header mb-2">
                <h3>✅ My Groups <span className="count-badge">{myGroups.length}</span></h3>
              </div>
              {myGroups.length === 0 ? (
                <Card className="empty-card"><p>You haven't joined any groups yet.</p></Card>
              ) : (
                <div className="groups-grid mb-6">
                  {myGroups.map(group => (
                    <Card 
                      key={group.id} 
                      className="group-card-v2 joined clickable"
                      onClick={(e) => handleOpenChat(e, group, 'group')}
                    >
                      <div className="group-emoji">{group.icon}</div>
                      <div className="group-body">
                        <h4>{group.name}</h4>
                        <p className="group-desc">{group.description}</p>
                        <div className="group-meta">
                          <span>👥 {group.members.toLocaleString()} members</span>
                          <button className="open-chat-btn open-chat-btn-medical" onClick={(e) => handleOpenChat(e, group, 'group')}>
                            <MessageCircle size={14} /> Open Chat
                          </button>
                        </div>
                      </div>
                      <button className="leave-btn" onClick={(e) => toggleJoin(e, group.id)}>
                        <CheckCircle size={14} /> Joined
                      </button>
                    </Card>
                  ))}
                </div>
              )}

              <div className="section-header mb-2 mt-4">
                <h3>🌐 Available Groups <span className="count-badge">{availableGroups.length}</span></h3>
              </div>
              <div className="groups-grid">
                {availableGroups.map(group => (
                  <Card key={group.id} className="group-card-v2">
                    <div className="group-emoji">{group.icon}</div>
                    <div className="group-body">
                      <h4>{group.name}</h4>
                      <p className="group-desc">{group.description}</p>
                      <div className="group-meta">
                        <span>👥 {group.members.toLocaleString()} members</span>
                        <span>💬 {group.posts} posts</span>
                      </div>
                    </div>
                    <button className="join-btn-v2 join-btn-medical" onClick={(e) => toggleJoin(e, group.id)}>
                      <PlusCircle size={14} /> Join
                    </button>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {activeSection === 'recommendations' && (
            <div className="section-animate">
              <div className="section-header mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3>⭐ Personalized Clinical Topics</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>Curated intelligently based on your clinical interests & medical goals</p>
                </div>
                {userInterests.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Your Interests:</span>
                    {userInterests.map((interest, i) => (
                      <span key={i} style={{ fontSize: '0.75rem', background: '#ECFDF5', color: '#059669', padding: '4px 10px', borderRadius: '12px', fontWeight: 600 }}>
                        🩺 {interest}
                      </span>
                    ))}
                    <button 
                      onClick={() => navigate('/profile')} 
                      style={{ background: 'none', border: 'none', color: '#059669', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline', padding: '2px 4px', fontWeight: 600 }}
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
              <div className="rec-grid">
                {recommendations.map((rec, index) => (
                  <Card key={index} className="rec-card-v2">
                    <div className="rec-tag rec-tag-medical" style={{ background: '#ECFDF5', color: '#059669', fontWeight: 600 }}>{rec.tag}</div>
                    <h4 className="rec-title">{rec.title}</h4>
                    {rec.reason && (
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 10px', lineHeight: 1.4 }}>
                        💡 {rec.reason}
                      </p>
                    )}
                    <div className="rec-meta">
                      <span className={`rec-level level-${rec.level.toLowerCase()}`}>{rec.level}</span>
                      <span className="rec-duration">⏱ {rec.duration}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <Button variant="secondary" className="btn-full" onClick={() => handleStartLearning(rec)}>Start Learning</Button>
                      <Button 
                        variant="primary" 
                        title="Find Skill Match & Zoom"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', background: '#2D8CFF', color: 'white', border: 'none', gap: '6px' }}
                        onClick={(e) => startMeeting(e, { user: `Specialist in ${rec.title}` })}
                      >
                        <Video size={16} /> Match
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Room Modal */}
      {activeChat && (
        <ChatRoom 
          key={activeChat.group ? `group_${activeChat.group.id}` : `match_${activeChat.match?.id || 'room'}`}
          group={activeChat.group}
          match={activeChat.match}
          onClose={() => setActiveChat(null)} 
        />
      )}

      {/* Browse Skills & Matched Peers Modal */}
      {showBrowseSkills && (
        <div className="modal-overlay">
          <div className="modal-content skills-modal-enhanced">
            <header className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '700', marginBottom: '4px' }}>Find Medical Skills & Specialists</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Search any clinical topic to connect directly with expert peers or verify your clinical expertise.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Button 
                  variant="outline" 
                  className="btn-sm" 
                  onClick={() => setShowRequestModal(true)}
                  style={{ fontSize: '0.8rem' }}
                >
                  Can't find your skill? Request New
                </Button>
                <button className="icon-btn" onClick={() => setShowBrowseSkills(false)}><X size={24} /></button>
              </div>
            </header>
            <div className="modal-body">
              <div className="search-box mb-3">
                <Search size={20} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Type a clinical topic (e.g., Anatomy, Pharmacology, Pathology, Cardiology)..." 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.trim()) {
                      setSelectedSkill(e.target.value.trim());
                    }
                  }}
                />
              </div>

              {/* Skill Chips */}
              <div className="skill-chips-scroll">
                {filteredSkills.map(skill => {
                  const isActive = (selectedSkill || '').toLowerCase() === skill.toLowerCase();
                  return (
                    <button 
                      key={skill} 
                      className={`skill-chip-btn ${isActive ? 'medical-active' : ''}`}
                      onClick={() => {
                        setSelectedSkill(skill);
                        setSearchQuery('');
                      }}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>

              {/* Matched Medical Peers for Active Skill */}
              {(() => {
                const activeSkill = selectedSkill || filteredSkills[0] || 'Anatomy';
                const matchedPeers = getPeersForSkill(activeSkill, user);
                return (
                  <div className="matched-skill-section">
                    <div className="selected-skill-header">
                      <h4>
                        <span>🩺 Matched Specialists in <b>{activeSkill}</b></span>
                        <span className="count-badge">{matchedPeers.length}</span>
                      </h4>
                      <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: '600' }}>✓ Direct Connect (No Assessment Required)</span>
                    </div>

                    <div className="peers-grid-modal">
                      {matchedPeers.map(peer => (
                        <div key={peer.id} className="peer-match-card-modal">
                          {/* Top: Avatar initials */}
                          <div className="peer-avatar-circle medical-avatar">{peer.avatar}</div>

                          {/* Name + match */}
                          <div className="peer-details">
                            <h5>
                              {peer.user}
                              <span className="peer-score-tag">{peer.matchScore}% Match</span>
                            </h5>
                          </div>

                          {/* Skill swap line */}
                          <div className="peer-skills-swap-preview">
                            <span className="swap-badge-teaches">{peer.mySkill}</span>
                            <span style={{ color: '#10b981', fontWeight: '700' }}>→</span>
                            <span className="swap-badge-wants">{peer.wantSkill}</span>
                          </div>

                          {/* Actions */}
                          <div className="peer-actions-row">
                            <Button 
                              variant="secondary"
                              style={{ flex: 1, justifyContent: 'center', fontSize: '0.82rem', padding: '0.45rem 0.5rem' }}
                              onClick={(e) => {
                                setShowBrowseSkills(false);
                                handleOpenChat(e, peer, 'match');
                              }}
                            >
                              <MessageCircle size={13} /> Request Swap
                            </Button>
                            <Button 
                              variant="outline"
                              style={{ padding: '0.45rem 0.6rem', borderColor: '#2D8CFF', color: '#2D8CFF', display: 'flex', alignItems: 'center' }}
                              title="Zoom Call"
                              onClick={(e) => startMeeting(e, peer)}
                            >
                              <Video size={15} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>


                    {/* Verified Assessment Option Banner */}
                    <div className="assessment-banner-card medical-banner">
                      <div className="banner-text">
                        <h5><Award size={18} color="#10b981" /> Verify Clinical Proficiency in {activeSkill}</h5>
                        <p>Take the 20 to 25 question medical examination sorted by difficulty levels (Fundamentals ➔ Clinical ➔ Advanced). Minimum 80% passing grade required.</p>
                      </div>
                      <Button 
                        variant="secondary" 
                        className="btn-sm"
                        onClick={() => {
                          setPendingSkill(activeSkill);
                          setShowAssessment(true);
                        }}
                      >
                        Take Assessment
                      </Button>
                    </div>
                  </div>
                );
              })()}

            </div>
          </div>
        </div>
      )}

      {/* Course Modal */}
      {activeCourse && (
        <CourseModal 
          course={activeCourse} 
          user={user}
          onClose={() => {
            setActiveCourse(null);
            setProgressData(getProgress('medical', user));
          }} 
        />
      )}

      {/* Assessment Popup */}
      {showAssessment && (
        <AssessmentPopup 
          user={user} 
          topic={pendingSkill}
          onClose={dismissAssessment} 
          onStart={completeAssessment} 
        />
      )}

      {/* Skill Request Modal */}
      {showRequestModal && (
        <SkillRequestModal 
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          onSkillCreated={() => {
            fetch('/api/skills?domain=MEDICAL')
              .then(res => res.json())
              .then(data => {
                if (data.skills) setDynamicSkills(data.skills.map(s => s.canonical_name));
              })
              .catch(err => console.error(err));
          }}
        />
      )}

      {/* Daily Clinical Task Modals */}
      {showRadiologyModal && (
        <RadiologyReviewModal
          isOpen={showRadiologyModal}
          onClose={() => setShowRadiologyModal(false)}
          onComplete={() => {
            handleCompleteTask('radiology-review');
            setShowRadiologyModal(false);
          }}
        />
      )}

      {showPathologyModal && (
        <PathologyConsultModal
          isOpen={showPathologyModal}
          onClose={() => setShowPathologyModal(false)}
          onComplete={() => {
            handleCompleteTask('pathology-consult');
            setShowPathologyModal(false);
          }}
        />
      )}

      {showFlashcardsModal && (
        <AnatomyFlashcardModal
          isOpen={showFlashcardsModal}
          onClose={() => setShowFlashcardsModal(false)}
          onComplete={() => {
            handleCompleteTask('anatomy-flashcards');
            setShowFlashcardsModal(false);
          }}
        />
      )}

      {/* Algorithmic Score Breakdown Modal */}
      {selectedBreakdownMatch && (
        <ScoreBreakdownModal 
          match={selectedBreakdownMatch} 
          onClose={() => setSelectedBreakdownMatch(null)} 
        />
      )}
    </div>
  );
};

export default MedicalDashboard;
