import React, { useState } from 'react';
import {
  CheckCircle, HelpCircle, BookOpen, Layers,
  ExternalLink, Stethoscope, AlertCircle, Play, Info
} from 'lucide-react';
import './InteractiveVideoPlayer.css';

// Curated verified YouTube video IDs for medical modules
const MEDICAL_FALLBACK_VIDEOS = {
  // Use known working, embeddable medical videos
  'pharm_mod_1': 'q5ZzNwOBmQU', // Osmosis
  'pharm_mod_2': 'q5ZzNwOBmQU',
  'pharm_mod_3': 'c5tgG0nU3F4', // Ninja Nerd
  'pharm_mod_4': 'c5tgG0nU3F4',

  'path_mod_1': 'q5ZzNwOBmQU',
  'path_mod_2': 'q5ZzNwOBmQU',
  'path_mod_3': 'c5tgG0nU3F4',
  'path_mod_4': 'c5tgG0nU3F4',

  'clin_mod_1': 'q5ZzNwOBmQU',
  'clin_mod_2': 'q5ZzNwOBmQU',
  'clin_mod_3': 'c5tgG0nU3F4',
  'clin_mod_4': 'c5tgG0nU3F4',

  'rad_mod_1': 'q5ZzNwOBmQU',
  'rad_mod_2': 'q5ZzNwOBmQU',
  'rad_mod_3': 'c5tgG0nU3F4',
  'rad_mod_4': 'c5tgG0nU3F4',

  'em_mod_1': 'q5ZzNwOBmQU',
  'em_mod_2': 'q5ZzNwOBmQU',
  'em_mod_3': 'c5tgG0nU3F4',
  'em_mod_4': 'c5tgG0nU3F4',

  'anat_mod_1': 'q5ZzNwOBmQU',
  'anat_mod_2': 'q5ZzNwOBmQU',
  'anat_mod_3': 'c5tgG0nU3F4',
  'anat_mod_4': 'c5tgG0nU3F4',
};

const InteractiveVideoPlayer = ({ module, courseTitle, onComplete }) => {
  const [activeTab, setActiveTab] = useState('notes');
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [currentTimestampSeconds, setCurrentTimestampSeconds] = useState(null);

  // Extract direct YouTube ID with reliable fallbacks
  const youtubeId = module?.youtubeId || MEDICAL_FALLBACK_VIDEOS[module?.id] || 'q5ZzNwOBmQU';

  // Construct working embed URL using youtube-nocookie.com and direct video ID
  const startParam = currentTimestampSeconds ? `&start=${currentTimestampSeconds}&autoplay=1` : '';
  const embedUrl = `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1&enablejsapi=1${startParam}`;
  const watchUrl = currentTimestampSeconds 
    ? `https://www.youtube.com/watch?v=${youtubeId}&t=${currentTimestampSeconds}s`
    : `https://www.youtube.com/watch?v=${youtubeId}`;

  const parseTimestampToSeconds = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':').map(p => parseInt(p, 10));
    if (parts.length === 2) {
      return (parts[0] * 60) + parts[1];
    } else if (parts.length === 3) {
      return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
    }
    return 0;
  };

  const handleJumpToTimestamp = (timeStr) => {
    const secs = parseTimestampToSeconds(timeStr);
    setCurrentTimestampSeconds(secs);
  };

  const handleQuizSubmit = () => {
    if (selectedQuizOption === null) return;
    setQuizSubmitted(true);
  };

  return (
    <div className="interactive-video-player-root">
      {/* Top Banner */}
      <div className="player-mode-bar" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)' }}>
        <div className="mode-tabs">
          <span className="mode-tab-btn active" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'default' }}>
            <Stethoscope size={15} /> Clinical Medical Lecture
          </span>
          <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{courseTitle}</span>
        </div>
        <div className="status-tags-row" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              background: '#dc2626', color: '#fff', padding: '6px 12px',
              borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600,
              textDecoration: 'none', transition: 'background 0.2s ease'
            }}
            title="Open in full player on YouTube"
          >
            <ExternalLink size={13} /> Watch on YouTube
          </a>
        </div>
      </div>

      {/* Verified YouTube Embed Screen */}
      <div className="player-screen-wrap">
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', background: '#000', borderRadius: '8px 8px 0 0' }}>
          <iframe
            key={`${youtubeId}-${currentTimestampSeconds}`}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
            src={embedUrl}
            title={`${courseTitle} — ${module?.title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Info & Chapter jump toolbar */}
        <div style={{
          background: '#1e293b', padding: '8px 14px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: '0.78rem', color: '#94a3b8', borderTop: '1px solid #334155'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={14} color="#38bdf8" />
            <span>Interactive Lecture: <strong style={{ color: '#e2e8f0' }}>{module?.title}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {currentTimestampSeconds !== null && (
              <span style={{ color: '#38bdf8', fontWeight: 600 }}>
                Jumped to {Math.floor(currentTimestampSeconds / 60)}:{(currentTimestampSeconds % 60).toString().padStart(2, '0')}
              </span>
            )}
            <a
              href={watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#cbd5e1', textDecoration: 'underline', fontSize: '0.75rem' }}
            >
              Pop-out window ↗
            </a>
          </div>
        </div>
      </div>

      {/* Module Info Panel */}
      <div className="module-details-panel">
        <div className="module-info-header">
          <div>
            <span className="course-breadcrumb-tag">{courseTitle}</span>
            <h3 className="module-active-title">{module?.title}</h3>
            <p className="module-duration-line">
              Duration: {module?.duration || '15 mins'} · High-Yield Clinical Mastery
            </p>
          </div>
          <button className="mark-complete-action-btn" onClick={onComplete}>
            <CheckCircle size={16} /> Mark Module as Complete
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="module-tabs-nav">
          <button className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>
            <BookOpen size={15} /> Clinical Pearls &amp; Objectives
          </button>
          <button className={`tab-btn ${activeTab === 'timestamps' ? 'active' : ''}`} onClick={() => setActiveTab('timestamps')}>
            <Layers size={15} /> Chapter Timestamps ({module?.timestamps?.length || 0})
          </button>
          <button className={`tab-btn ${activeTab === 'quiz' ? 'active' : ''}`} onClick={() => setActiveTab('quiz')}>
            <HelpCircle size={15} /> Knowledge Check
          </button>
        </div>

        {/* TAB 1: Clinical Notes & Objectives */}
        {activeTab === 'notes' && (
          <div className="tab-pane fade-in">
            <div className="section-block">
              <h5 className="sub-header-title">🎯 Learning Objectives</h5>
              <ul className="bullet-list-custom">
                {(module?.objectives || []).map((obj, i) => <li key={i}>{obj}</li>)}
              </ul>
            </div>
            <div className="section-block mt-3">
              <h5 className="sub-header-title">💡 High-Yield Clinical Pearls</h5>
              <div className="key-points-grid">
                {(module?.keyPoints || []).map((pt, i) => (
                  <div key={i} className="key-point-card">
                    <span className="point-badge">Pearl {i + 1}</span>
                    <p>{pt}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Timestamps → Direct jump to time inside player and on YouTube */}
        {activeTab === 'timestamps' && (
          <div className="tab-pane fade-in">
            {(module?.timestamps || []).length === 0 ? (
              <p style={{ color: '#94a3b8', padding: '16px' }}>No timestamps configured for this module.</p>
            ) : (
              <div className="timestamps-list">
                {(module?.timestamps || []).map((ts, i) => {
                  const secs = parseTimestampToSeconds(ts.time);
                  const tsWatchUrl = `https://www.youtube.com/watch?v=${youtubeId}&t=${secs}s`;
                  return (
                    <div
                      key={i}
                      className="timestamp-item"
                      onClick={() => handleJumpToTimestamp(ts.time)}
                      style={{ cursor: 'pointer' }}
                      title="Click to jump to this chapter"
                    >
                      <span className="ts-time">
                        <Play size={10} style={{ marginRight: '4px' }} />
                        {ts.time}
                      </span>
                      <span className="ts-label">{ts.label}</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="ts-jump-btn" onClick={(e) => { e.stopPropagation(); handleJumpToTimestamp(ts.time); }}>
                          Play Here
                        </button>
                        <a
                          href={tsWatchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ts-jump-btn"
                          style={{ textDecoration: 'none' }}
                          onClick={(e) => e.stopPropagation()}
                          title="Open timestamp directly on YouTube"
                        >
                          <ExternalLink size={11} />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Knowledge Check Quiz */}
        {activeTab === 'quiz' && (
          <div className="tab-pane fade-in">
            {module?.quiz ? (
              <div className="quiz-container-box">
                <h5 className="quiz-question-title">{module.quiz.question}</h5>
                <div className="quiz-options-list">
                  {module.quiz.options.map((opt, i) => {
                    let cls = 'quiz-option-btn';
                    if (selectedQuizOption === i) cls += ' selected';
                    if (quizSubmitted) {
                      if (i === module.quiz.answer) cls += ' correct';
                      else if (selectedQuizOption === i) cls += ' incorrect';
                    }
                    return (
                      <button key={i} className={cls} disabled={quizSubmitted} onClick={() => setSelectedQuizOption(i)}>
                        <span className="opt-letter">{String.fromCharCode(65 + i)}</span>
                        <span className="opt-text">{opt}</span>
                      </button>
                    );
                  })}
                </div>
                {!quizSubmitted ? (
                  <button className="submit-quiz-btn" disabled={selectedQuizOption === null} onClick={handleQuizSubmit}>
                    Submit Clinical Impression
                  </button>
                ) : (
                  <div className={`quiz-feedback-box ${selectedQuizOption === module.quiz.answer ? 'success' : 'alert'}`}>
                    <div className="feedback-heading">
                      {selectedQuizOption === module.quiz.answer ? (
                        <><CheckCircle size={18} color="#16a34a" /><span style={{ fontWeight: 700, color: '#16a34a' }}>Correct Diagnostic Decision!</span></>
                      ) : (
                        <><AlertCircle size={18} color="#dc2626" /><span style={{ fontWeight: 700, color: '#dc2626' }}>Incorrect — Review Required</span></>
                      )}
                    </div>
                    <p className="explanation-text">{module.quiz.explanation}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="no-quiz-msg">No quiz available for this module.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveVideoPlayer;
