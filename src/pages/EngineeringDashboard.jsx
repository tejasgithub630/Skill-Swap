import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, BarChart2, Users, Star, ArrowRight, Code, Database, Layout, CheckCircle, PlusCircle, MessageCircle, Calendar, X, Search, Clock, Target, Trophy, TrendingUp, Check, Video, Award, Shield, RefreshCw, Activity, Sparkles, Sliders, Coins } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Button from '../components/Button';
import ChatRoom from '../components/ChatRoom';
import CourseModal from '../components/CourseModal';
import AssessmentPopup from '../components/AssessmentPopup';
import SkillRequestModal from '../components/SkillRequestModal';
import LearningRingsView from '../components/LearningRingsView';
import ScoreBreakdownModal from '../components/ScoreBreakdownModal';
import { getGroups, joinGroup, leaveGroup, getRecommendations, getProgress, startLearning, getCourseDetails, syncUser, getPeersForSkill, getUserStats, updateStreak, recordAssessmentPassed, recordSession, completeDailyTask, getTodayTasks, updateSkillProgress, getMatches } from '../data/db';
import './Dashboard.css';

const EngineeringDashboard = () => {
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

  const [urgencyMode, setUrgencyMode] = useState('standard'); // 'standard' (Cold-start active) | 'urgent' (Proven Veterans only)
  const [selectedBreakdownMatch, setSelectedBreakdownMatch] = useState(null);

  const [matches, setMatches] = useState([]);
  const [groups, setGroups] = useState(() => getGroups('engineering'));
  const [recommendations, setRecommendations] = useState(() => getRecommendations('engineering'));
  const [userInterests, setUserInterests] = useState([]);
  const [progressData, setProgressData] = useState(() => getProgress('engineering', user));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          // Not logged in — clear everything and redirect
          navigate('/');
          return;
        }

        // Fetch Matches with active routing urgency strategy
        const res = await fetch(`/api/matches?urgency=${urgencyMode}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Only show engineering matches with meaningful score
          const engMatches = data.filter(m => m.role === 'engineering' && m.matchScore >= 45);
          setMatches(engMatches);
        } else if (res.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          navigate('/');
          return;
        } else {
          // API error (e.g. 500) — show empty, not fake data
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

        // Fetch dynamic canonical skills from backend
        const skillsRes = await fetch('/api/skills?domain=ENGINEERING');
        if (skillsRes.ok) {
          const skillsData = await skillsRes.json();
          if (skillsData.skills && skillsData.skills.length > 0) {
            setDynamicSkills(skillsData.skills.map(s => s.canonical_name));
          }
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        // Network error — show empty state, NOT mock data
        setMatches([]);
      }
    };
    fetchData();
  }, [urgencyMode, navigate]);

  // Daily task completion (persisted per-day)
  const [todayTasks, setTodayTasks] = useState(() => getTodayTasks(user));

  const [activeSection, setActiveSection] = useState('matches');
  const joinedGroups = groups.filter(g => g.joined).map(g => g.id);

  const [activeChat, setActiveChat] = useState(null);
  const [showBrowseSkills, setShowBrowseSkills] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("React");
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
      // Record stats
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
      leaveGroup('engineering', id);
    } else {
      joinGroup('engineering', id);
    }
    setGroups(getGroups('engineering'));
  };

  const handleStartLearning = (rec) => {
    startLearning('engineering', rec);
    setRecommendations(getRecommendations('engineering'));
    setProgressData(getProgress('engineering', user));
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
    // Boost skill progress when opening a course
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
    
    alert(`Connecting you to ${match?.user || 'an online expert'} for a live session...`);
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
    { icon: <Zap size={20} />, label: 'Skill Matches', id: 'matches' },
    { icon: <RefreshCw size={20} />, label: 'Learning Rings (Multi-Hop)', id: 'rings' },
    { icon: <BarChart2 size={20} />, label: 'Progress Tracker', id: 'progress' },
    { icon: <Users size={20} />, label: 'Community Groups', id: 'groups' },
    { icon: <Star size={20} />, label: 'Recommendations', id: 'recommendations' },
  ];

  const myGroups = groups.filter(g => joinedGroups.includes(g.id));
  const availableGroups = groups.filter(g => !joinedGroups.includes(g.id));

  const defaultEngSkills = [
    "React", "JavaScript", "Node.js", "Python", "Java", "TypeScript", "Docker", "Kubernetes", 
    "AWS", "GraphQL", "System Design", "SQL", "MongoDB", "C++", "Go", "Rust", "Swift", "Flutter",
    "Tailwind CSS", "Redux", "Next.js", "Express", "PostgreSQL", "Firebase", "Algorithms", "Data Structures"
  ];
  const allSkills = Array.from(new Set([...dynamicSkills, ...defaultEngSkills]));

  const filteredSkills = allSkills.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

  const categoryColors = {
    'Core CS': '#6366F1',
    'Frontend': '#F59E0B',
    'Architecture': '#EC4899',
    'Backend': '#10B981',
    'Infrastructure': '#3B82F6',
    'Language': '#8B5CF6',
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
                <span><strong>Administrator Mode:</strong> You are currently previewing student courses with Platform Administrator privileges.</span>
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
              <h1>Engineering Dashboard</h1>
              <p>Welcome back, <strong>{userName}</strong>! Master new tech skills through peer-to-peer exchange.</p>
            </div>
          </header>

          {/* Skill Matches */}
          {activeSection === 'matches' && (
            <div className="section-animate">
              <div className="section-header mb-4" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <div className="flex items-center gap-4">
                  <h3>Top Skill Matches</h3>
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
                      color: urgencyMode === 'standard' ? '#4f46e5' : '#64748b',
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
                    🛡️ Urgent / Exam Prep (Veterans Only)
                  </button>
                </div>
              </div>

              <div className="match-grid">
                {matches.length > 0 ? matches.map(match => (
                  <Card key={match.id} className="match-card-v2">
                    <div className="match-card-top">
                      <div className="match-avatar">{match.avatar}</div>
                      <div style={{ flex: 1 }}>
                        <div className="flex items-center justify-between">
                          <div className="match-user">{match.user}</div>
                          <span className="match-score-badge">{match.matchScore}% Match</span>
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
                            <span style={{ fontSize: '0.68rem', fontWeight: 600, background: '#e0e7ff', color: '#4338ca', padding: '2px 6px', borderRadius: '4px' }}>
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
                      <span className="skill-pill skill-mine">{match.mySkill}</span>
                      <ArrowRight size={16} className="swap-arrow" />
                      <span className="skill-pill skill-want">{match.wantSkill}</span>
                    </div>
                    {match.explanation && (
                      <div className="match-explanation-text" style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 10px', fontStyle: 'italic' }}>
                        💡 {match.explanation}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button variant="primary" className="btn-full" onClick={(e) => handleOpenChat(e, match, 'match')}>Request Swap</Button>
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
                  <div className="col-span-full" style={{ textAlign: 'center', padding: '3rem 2rem', background: 'linear-gradient(135deg, #f8faff 0%, #eef2ff 100%)', borderRadius: '16px', border: '1px dashed #c7d2fe' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#312e81', marginBottom: '0.5rem' }}>No matches yet — let's fix that!</h4>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                      The algorithm needs to know what skills you <strong>teach</strong> and what you want to <strong>learn</strong> to find your perfect matches.
                    </p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => navigate('/profile')}
                        style={{ background: '#4f46e5', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
                      >
                        ✏️ Add My Skills to Profile
                      </button>
                      <button
                        onClick={() => setShowBrowseSkills(true)}
                        style={{ background: '#fff', color: '#4f46e5', border: '2px solid #4f46e5', padding: '10px 22px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
                      >
                        🔍 Browse All Skills
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
                <h3>📊 Advanced Learning Roadmap</h3>
                <span className="roadmap-meta">Detailed tracking of your skill journey</span>
              </div>
              
              <div className="progress-stats-row mb-6">
                <Card className="stat-summary-card">
                  <div className="stat-icon-bg primary"><TrendingUp size={24} /></div>
                  <div className="stat-content">
                    <h4>Overall Proficiency</h4>
                    <div className="stat-number">{userStats.overallProficiency}%</div>
                    <div className="stat-sub">{userStats.overallProficiency === 0 ? 'Start learning to track progress!' : `+${Math.min(5, userStats.overallProficiency)}% this week`}</div>
                  </div>
                </Card>
                <Card className="stat-summary-card">
                  <div className="stat-icon-bg secondary"><Trophy size={24} /></div>
                  <div className="stat-content">
                    <h4>Skills Mastered</h4>
                    <div className="stat-number">{userStats.skillsMastered}</div>
                    <div className="stat-sub">{userStats.skillsMastered === 0 ? 'Pass an assessment to earn badges!' : `${userStats.assessmentsPassed} assessments passed`}</div>
                  </div>
                </Card>
                <Card className="stat-summary-card">
                  <div className="stat-icon-bg warning"><Clock size={24} /></div>
                  <div className="stat-content">
                    <h4>Study Streak</h4>
                    <div className="stat-number">{userStats.studyStreakDays} {userStats.studyStreakDays === 1 ? 'Day' : 'Days'}</div>
                    <div className="stat-sub">{userStats.studyStreakDays === 0 ? 'Log in daily to build your streak!' : `${userStats.swapsCompleted} swaps · ${userStats.sessionsCompleted} sessions`}</div>
                  </div>
                </Card>
              </div>

              {/* Daily Tasks */}
              <div className="daily-task-section mb-6">
                <div className="section-header mb-3">
                  <h4>📅 Daily Tasks ({new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })})</h4>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{todayTasks.length}/3 completed</span>
                </div>
                <div className="daily-tasks-grid">
                  {/* Task 1: Morning Review */}
                  {(() => {
                    const done = todayTasks.includes('morning-review');
                    return (
                      <Card className={`daily-task-card ${done ? 'completed' : ''}`}>
                        <div className="task-status" style={{ color: done ? '#16a34a' : '#94a3b8' }}>
                          {done ? <CheckCircle size={18} /> : <Clock size={18} />}
                        </div>
                        <div className="task-info">
                          <h5>Morning Review</h5>
                          <p>{done ? '✓ Completed – 20 mins of skill review' : 'Review a skill for 20 minutes'}</p>
                        </div>
                        {!done && (
                          <Button variant="ghost" className="btn-sm" onClick={() => handleCompleteTask('morning-review')}>
                            Mark Done
                          </Button>
                        )}
                      </Card>
                    );
                  })()}

                  {/* Task 2: Community Swap */}
                  {(() => {
                    const done = todayTasks.includes('community-swap');
                    return (
                      <Card className={`daily-task-card ${done ? 'completed' : ''}`}>
                        <div className="task-status" style={{ color: done ? '#16a34a' : '#94a3b8' }}>
                          {done ? <CheckCircle size={18} /> : <Clock size={18} />}
                        </div>
                        <div className="task-info">
                          <h5>Community Swap</h5>
                          <p>{done ? '✓ Connected with a peer!' : 'Connect with 1 new peer today'}</p>
                        </div>
                        {!done && (
                          <Button variant="ghost" className="btn-sm" onClick={() => {
                            handleCompleteTask('community-swap');
                            setShowBrowseSkills(true);
                          }}>
                            Start
                          </Button>
                        )}
                      </Card>
                    );
                  })()}

                  {/* Task 3: Case Study */}
                  {(() => {
                    const done = todayTasks.includes('case-study');
                    return (
                      <Card className={`daily-task-card ${done ? 'completed' : ''}`}>
                        <div className="task-status" style={{ color: done ? '#16a34a' : '#94a3b8' }}>
                          {done ? <CheckCircle size={18} /> : <Target size={18} />}
                        </div>
                        <div className="task-info">
                          <h5>Case Study</h5>
                          <p>{done ? '✓ Problem solved!' : 'Solve 1 system design problem'}</p>
                        </div>
                        {!done && (
                          <Button variant="ghost" className="btn-sm" onClick={() => handleCompleteTask('case-study')}>
                            Start
                          </Button>
                        )}
                      </Card>
                    );
                  })()}
                </div>
              </div>

              <div className="roadmap-grid-improved">
                {progressData.map((item, index) => {
                  const color = categoryColors[item.category] || '#6366F1';
                  // Use real user progress – defaults to 0 for new users
                  const pct = userStats.skillProgress[item.skill] ?? 0;
                  const nextLabel = pct === 0 ? 'Start: Fundamentals' : pct < 50 ? 'Next: Intermediate' : pct < 80 ? 'Next: Advanced Patterns' : '🎉 Mastered!';
                  const estHours = pct === 0 ? '~8 hrs to start' : pct >= 100 ? 'Complete!' : `~${Math.round((100 - pct) / 12)} hrs left`;
                  return (
                    <Card key={index} className="roadmap-card-v3">
                      <div className="roadmap-card-header">
                        <div>
                          <span className="roadmap-category-mini" style={{ color }}>{item.category}</span>
                          <h4 className="roadmap-skill-title">{item.skill}</h4>
                        </div>
                        <div className="roadmap-pct-bubble" style={{ backgroundColor: pct >= 80 ? '#16a34a' : color }}>{pct}%</div>
                      </div>
                      
                      <div className="roadmap-track-container">
                        <div className="roadmap-track-bar">
                          <div 
                            className="roadmap-track-fill" 
                            style={{ width: `${pct}%`, backgroundColor: pct >= 80 ? '#16a34a' : color, transition: 'width 0.6s ease' }}
                          ></div>
                        </div>
                      </div>

                      <div className="roadmap-details">
                        <div className="detail-item">
                          <Target size={14} />
                          <span><b>Next:</b> {nextLabel}</span>
                        </div>
                        <div className="detail-item">
                          <Clock size={14} />
                          <span><b>Est:</b> {estHours}</span>
                        </div>
                      </div>

                      <div className="roadmap-footer">
                        <Button variant="ghost" className="btn-sm w-full" onClick={() => handleOpenCourse(item.skill)}>View Curriculum</Button>
                        <Button variant="primary" className="btn-sm w-full" onClick={() => handleOpenCourse(item.skill)}>{pct === 0 ? 'Begin' : 'Continue'}</Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}


          {/* Community Groups */}
          {activeSection === 'groups' && (
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
                          <button className="open-chat-btn" onClick={(e) => handleOpenChat(e, group, 'group')}>
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
                    <button className="join-btn-v2" onClick={(e) => toggleJoin(e, group.id)}>
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
                  <h3>⭐ Personalized Recommendations</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>Curated intelligently based on your declared interests & goals</p>
                </div>
                {userInterests.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Your Interests:</span>
                    {userInterests.map((interest, i) => (
                      <span key={i} style={{ fontSize: '0.75rem', background: '#EEF2FF', color: '#4F46E5', padding: '4px 10px', borderRadius: '12px', fontWeight: 600 }}>
                        🏷️ {interest}
                      </span>
                    ))}
                    <button 
                      onClick={() => navigate('/profile')} 
                      style={{ background: 'none', border: 'none', color: '#4F46E5', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline', padding: '2px 4px', fontWeight: 600 }}
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
              <div className="rec-grid">
                {recommendations.map((rec, index) => (
                  <Card key={index} className="rec-card-v2">
                    <div className="rec-tag" style={{ background: '#EEF2FF', color: '#4F46E5', fontWeight: 600 }}>{rec.tag}</div>
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
                      <Button variant="outline" className="btn-full" onClick={() => handleStartLearning(rec)}>Start Learning</Button>
                      <Button 
                        variant="primary" 
                        title="Find Skill Match & Zoom"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', background: '#2D8CFF', color: 'white', border: 'none', gap: '6px' }}
                        onClick={(e) => startMeeting(e, { user: `Expert in ${rec.title}` })}
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
                <h3 style={{ fontSize: '1.35rem', fontWeight: '700', marginBottom: '4px' }}>Find Skills & Connect With Peers</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Search any skill to match directly with expert peers or take the 20-question certification test.</p>
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
                  placeholder="Type a skill (e.g., React, Python, Go, Docker, System Design)..." 
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
                      className={`skill-chip-btn ${isActive ? 'active' : ''}`}
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

              {/* Matched Peers for Active Skill */}
              {(() => {
                const activeSkill = selectedSkill || filteredSkills[0] || 'React';
                const matchedPeers = getPeersForSkill(activeSkill, user);
                return (
                  <div className="matched-skill-section">
                    <div className="selected-skill-header">
                      <h4>
                        <span>🔥 Matched Peers Teaching <b>{activeSkill}</b></span>
                        <span className="count-badge">{matchedPeers.length}</span>
                      </h4>
                      <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: '600' }}>✓ Direct Connect (No Assessment Required)</span>
                    </div>

                    <div className="peers-grid-modal">
                      {matchedPeers.map(peer => (
                        <div key={peer.id} className="peer-match-card-modal">
                          {/* Top: Avatar initials */}
                          <div className="peer-avatar-circle">{peer.avatar}</div>

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
                            <span style={{ color: '#6366f1', fontWeight: '700' }}>→</span>
                            <span className="swap-badge-wants">{peer.wantSkill}</span>
                          </div>

                          {/* Actions */}
                          <div className="peer-actions-row">
                            <Button 
                              variant="primary" 
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
                    <div className="assessment-banner-card">
                      <div className="banner-text">
                        <h5><Award size={18} color="#4f46e5" /> Earn Verified Skill Badge in {activeSkill}</h5>
                        <p>Take the 20 to 25 question skill assessment sorted by difficulty levels (Easy ➔ Med ➔ Hard). Minimum 80% passing score required.</p>
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
            setProgressData(getProgress('engineering', user));
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
            fetch('/api/skills?domain=ENGINEERING')
              .then(res => res.json())
              .then(data => {
                if (data.skills) setDynamicSkills(data.skills.map(s => s.canonical_name));
              })
              .catch(err => console.error(err));
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

export default EngineeringDashboard;
