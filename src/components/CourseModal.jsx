import React, { useState } from 'react';
import { X, PlayCircle, CheckCircle, Clock, ArrowLeft, Award, Download, ShieldCheck, Sparkles } from 'lucide-react';
import Button from './Button';
import InteractiveVideoPlayer from './InteractiveVideoPlayer';
import EngineeringVideoPlayer from './EngineeringVideoPlayer';
import { courseCurriculum } from '../data/courseCurriculum';
import { updateCourseProgress, updateSkillProgress } from '../data/db';

const CourseModal = ({ course, onClose, user }) => {
  const [certNumber] = useState(() => `SKILLSWAP-COURSE-${(course?.title || "COURSE").replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}-2026-${Math.floor(100000 + Math.random() * 900000)}`);
  const [activeModuleIndex, setActiveModuleIndex] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);

  // Domain detection — engineering uses YouTube player, medical uses clinical simulation
  const isEngineering = course?.domain === 'ENGINEERING';

  // Load detailed curriculum if available
  const curriculumInfo = courseCurriculum[course?.title] || null;

  const [modules, setModules] = useState(() => {
    if (curriculumInfo?.modules) {
      // Check saved completed module IDs
      const savedCompleted = JSON.parse(localStorage.getItem(`course_modules_${course?.title}_${user?.email}`) || '[]');
      return curriculumInfo.modules.map(m => ({
        ...m,
        completed: savedCompleted.includes(m.id)
      }));
    }
    return course?.modules || [];
  });

  if (!course) return null;

  const handleMarkComplete = () => {
    if (activeModuleIndex === null) return;
    const updated = [...modules];
    updated[activeModuleIndex].completed = true;
    setModules(updated);

    // Save completed module IDs
    const completedIds = updated.filter(m => m.completed).map(m => m.id);
    localStorage.setItem(`course_modules_${course.title}_${user?.email}`, JSON.stringify(completedIds));

    // Calculate real-time progress
    const completedCount = updated.filter(m => m.completed).length;
    const pct = Math.round((completedCount / updated.length) * 100);

    updateCourseProgress(course.title, pct, user);
    updateSkillProgress(user, course.title, pct);

    setActiveModuleIndex(null);
  };

  const allCompleted = modules.length > 0 && modules.every(m => m.completed);
  const instructor = curriculumInfo?.instructor || course.instructor || 'SkillSwap Clinical Faculty';
  const aiSummary = curriculumInfo?.aiSummary || course.aiSummary || 'A comprehensive, high-yield mastery curriculum designed for rapid clinical knowledge acquisition.';

  if (showCertificate) {
    return (
      <div className="modal-overlay" style={{ zIndex: 1300 }}>
        <div className="modal-content" style={{ maxWidth: '800px', width: '90%', textAlign: 'center', padding: '2.5rem' }}>
          <button className="icon-btn" onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem' }}><X size={24} /></button>
          
          <div style={{ border: `6px double ${isEngineering ? '#bfdbfe' : '#cbd5e1'}`, padding: '2.5rem', borderRadius: '12px', backgroundColor: isEngineering ? '#eff6ff' : '#f8fafc', position: 'relative' }}>
            <Award size={64} color={isEngineering ? '#3b82f6' : '#f59e0b'} style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '2.2rem', fontFamily: 'serif', color: '#1e293b', marginBottom: '0.75rem' }}>
              Certificate of {isEngineering ? 'Engineering' : 'Curriculum'} Mastery
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '1.5rem' }}>This officially certifies that</p>
            <h3 style={{ fontSize: '1.8rem', color: isEngineering ? '#2563eb' : '#0284c7', margin: '0 0 1rem', fontWeight: 800 }}>{user?.name || 'Student'}</h3>
            <p style={{ fontSize: '1rem', color: '#64748b', marginBottom: '0.5rem' }}>
              has successfully completed all modules of
            </p>
            <h4 style={{ fontSize: '1.5rem', color: '#0f172a', margin: '0 0 2rem' }}>{course.title}</h4>
            
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: isEngineering ? '#eff6ff' : '#ecfdf5', border: `1px solid ${isEngineering ? '#93c5fd' : '#86efac'}`, borderRadius: '20px', color: isEngineering ? '#1d4ed8' : '#15803d', fontSize: '0.85rem', fontWeight: 600, marginBottom: '2rem' }}>
              <ShieldCheck size={16} /> SkillSwap Verified {isEngineering ? 'Engineering' : 'Medical'} Curriculum · 100% Completed
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #cbd5e1', paddingTop: '1.25rem', fontSize: '0.85rem', color: '#64748b' }}>
              <div style={{ textAlign: 'left' }}>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#0f172a' }}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                <p style={{ margin: 0 }}>Date Issued</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, fontFamily: 'monospace', color: '#0284c7', fontWeight: 'bold' }}>{certNumber}</p>
                <p style={{ margin: 0 }}>Certificate ID</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#0f172a' }}>SkillSwap {isEngineering ? 'Engineering' : 'Medical'} Faculty</p>
                <p style={{ margin: 0 }}>Authorized Signature</p>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '1.5rem' }}>
            <Button variant="outline" onClick={() => setShowCertificate(false)}>
              Back to Modules
            </Button>
            <Button variant="primary" onClick={() => window.print()}>
              <Download size={16} style={{ marginRight: '6px' }} /> Print / Save Certificate
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" style={{ zIndex: 1250 }}>
      <div className="modal-content" style={{ maxWidth: '880px', width: '92%', maxHeight: '90vh', overflowY: 'auto' }}>
        <header className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{course.title}</h3>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#e0f2fe', color: '#0284c7', padding: '2px 8px', borderRadius: '12px' }}>
                High-Yield Course
              </span>
            </div>
            <p className="text-sm text-slate-500" style={{ margin: '4px 0 0 0' }}>Instructor: <b>{instructor}</b></p>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={24} /></button>
        </header>
        
        <div className="modal-body" style={{ padding: '1.25rem 0 0 0' }}>
          {/* AI Clinical Summary Banner */}
          <div 
            style={{ 
              background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)', 
              padding: '1.25rem', 
              borderRadius: '10px', 
              marginBottom: '1.5rem',
              borderLeft: '4px solid #10b981',
              border: '1px solid #e2e8f0'
            }}
          >
            <p style={{ lineHeight: '1.6', color: '#0f172a', fontSize: '0.92rem', margin: 0 }}>
              {aiSummary}
            </p>
          </div>

          {activeModuleIndex !== null ? (
            <div className="module-player-wrapper fade-in">
              <button 
                onClick={() => setActiveModuleIndex(null)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#0284c7', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  cursor: 'pointer', 
                  marginBottom: '1rem', 
                  fontWeight: '600',
                  fontSize: '0.9rem' 
                }}
              >
                <ArrowLeft size={18} /> ← Back to All Course Modules
              </button>
              
              {/* Domain-specific Video Player */}
              {isEngineering ? (
                <EngineeringVideoPlayer
                  module={modules[activeModuleIndex]}
                  courseTitle={course.title}
                  onComplete={handleMarkComplete}
                />
              ) : (
                <InteractiveVideoPlayer 
                  module={modules[activeModuleIndex]} 
                  courseTitle={course.title}
                  onComplete={handleMarkComplete}
                />
              )}
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Course Modules ({modules.filter(m => m.completed).length}/{modules.length} Completed)</h4>
                <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>
                  {Math.round((modules.filter(m => m.completed).length / Math.max(1, modules.length)) * 100)}% Complete
                </span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {modules.map((module, idx) => (
                  <div 
                    key={module.id || idx} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '1rem 1.25rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      background: module.completed ? '#f0fdf4' : '#ffffff',
                      borderColor: module.completed ? '#bbf7d0' : '#e2e8f0',
                      cursor: 'pointer',
                      transition: 'transform 0.15s, box-shadow 0.15s'
                    }}
                    className="hover-lift"
                    onClick={() => setActiveModuleIndex(idx)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {module.completed ? (
                        <CheckCircle size={26} color="#10b981" />
                      ) : (
                        <PlayCircle size={26} color="#0284c7" />
                      )}
                      <div>
                        <h5 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: 600 }}>
                          Module {idx + 1}: {module.title}
                        </h5>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.35rem', color: '#64748b', fontSize: '0.82rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={13} /> {module.duration}
                          </span>
                          <span>•</span>
                          <span style={{ color: '#0284c7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Sparkles size={12} /> {isEngineering ? 'YouTube Lecture Included' : 'Interactive Visualizer Included'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant={module.completed ? "ghost" : "primary"} 
                      className="btn-sm" 
                      onClick={(e) => { e.stopPropagation(); setActiveModuleIndex(idx); }}
                    >
                      {module.completed ? "Review Module" : "Start Lesson"}
                    </Button>
                  </div>
                ))}
              </div>

              {allCompleted && (
                <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: isEngineering ? '#eff6ff' : '#f0fdf4', border: `1px solid ${isEngineering ? '#93c5fd' : '#bbf7d0'}`, borderRadius: '10px', textAlign: 'center' }}>
                  <Award size={48} color={isEngineering ? '#3b82f6' : '#22c55e'} style={{ margin: '0 auto 0.75rem' }} />
                  <h3 style={{ color: isEngineering ? '#1e40af' : '#166534', margin: '0 0 0.5rem 0', fontWeight: 700 }}>Course Completed! 🎉</h3>
                  <p style={{ color: isEngineering ? '#1d4ed8' : '#15803d', margin: '0 0 1rem 0', fontSize: '0.9rem' }}>
                    Congratulations! You have mastered all {modules.length} modules of <strong>{course.title}</strong>.
                  </p>
                  <Button variant="primary" onClick={() => setShowCertificate(true)}>
                    <Award size={16} style={{ marginRight: '6px' }} /> View Verified Certificate
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseModal;
