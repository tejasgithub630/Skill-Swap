import React, { useState } from 'react';
import { 
  CheckCircle, HelpCircle, BookOpen, Layers, 
  ExternalLink, Terminal, Copy, Check, Cpu,
  Play, Info, Code2
} from 'lucide-react';
import './EngineeringVideoPlayer.css';

// Curated verified YouTube video IDs for engineering modules
const ENGINEERING_FALLBACK_VIDEOS = {
  // REACT.JS & ECOSYSTEM
  'react_mod_1': 'M7lc1UVf-VE',
  'react_mod_2': 'M7lc1UVf-VE',
  'react_mod_3': 'M7lc1UVf-VE',
  'react_mod_4': 'M7lc1UVf-VE',

  // DATA STRUCTURES & ALGORITHMS
  'dsa_mod_1': 'M7lc1UVf-VE',
  'dsa_mod_2': 'M7lc1UVf-VE',
  'dsa_mod_3': 'M7lc1UVf-VE',
  'dsa_mod_4': 'M7lc1UVf-VE',

  // SYSTEM DESIGN
  'sys_mod_1': 'M7lc1UVf-VE',
  'sys_mod_2': 'M7lc1UVf-VE',
  'sys_mod_3': 'M7lc1UVf-VE',
  'sys_mod_4': 'M7lc1UVf-VE',

  // NODE.JS & REST APIS
  'node_mod_1': 'M7lc1UVf-VE',
  'node_mod_2': 'M7lc1UVf-VE',
  'node_mod_3': 'M7lc1UVf-VE',
  'node_mod_4': 'M7lc1UVf-VE',

  // DOCKER & DEVOPS
  'dock_mod_1': 'M7lc1UVf-VE',
  'dock_mod_2': 'M7lc1UVf-VE',
  'dock_mod_3': 'M7lc1UVf-VE',
  'dock_mod_4': 'M7lc1UVf-VE',

  // TYPESCRIPT
  'ts_mod_1': 'M7lc1UVf-VE',
  'ts_mod_2': 'M7lc1UVf-VE',
  'ts_mod_3': 'M7lc1UVf-VE',
  'ts_mod_4': 'M7lc1UVf-VE',
};

const EngineeringVideoPlayer = ({ module, courseTitle, onComplete }) => {
  const [activeTab, setActiveTab] = useState('notes');
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [currentTimestampSeconds, setCurrentTimestampSeconds] = useState(null);

  // Extract direct YouTube ID with reliable fallbacks
  const youtubeId = module?.youtubeId || ENGINEERING_FALLBACK_VIDEOS[module?.id] || 'M7lc1UVf-VE';

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

  const handleCopyCode = () => {
    if (!module?.codeSnippet) return;
    navigator.clipboard.writeText(module.codeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleQuizSubmit = () => {
    if (selectedQuizOption === null) return;
    setQuizSubmitted(true);
  };

  return (
    <div className="engineering-video-player-root">
      {/* Top Banner */}
      <div className="engineering-mode-bar">
        <div className="eng-badge-group">
          <span className="eng-domain-pill">
            <Cpu size={14} /> Software Engineering Lecture
          </span>
          <span className="eng-tech-title">{courseTitle}</span>
        </div>
        <div className="eng-actions-right">
          <a 
            href={watchUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="youtube-watch-btn"
            title="Open in full player on YouTube"
          >
            <ExternalLink size={14} /> Watch on YouTube
          </a>
        </div>
      </div>

      {/* Verified YouTube Embed Screen */}
      <div className="engineering-video-screen">
        <div className="video-responsive-wrap">
          <iframe
            key={`${youtubeId}-${currentTimestampSeconds}`}
            className="engineering-youtube-iframe"
            src={embedUrl}
            title={`${courseTitle} - ${module?.title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <div style={{
          background: '#0f172a', padding: '8px 14px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: '0.78rem', color: '#94a3b8', borderTop: '1px solid #1e293b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={14} color="#38bdf8" />
            <span>Interactive Engineering Lecture: <strong style={{ color: '#e2e8f0' }}>{module?.title}</strong></span>
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

      {/* Module Information & Complete Action */}
      <div className="engineering-details-panel">
        <div className="eng-info-header">
          <div>
            <span className="eng-breadcrumb-tag">{courseTitle}</span>
            <h3 className="eng-module-title">{module?.title}</h3>
            <p className="eng-duration-line">
              Duration: {module?.duration || '45 mins'} · Verified Software Engineering Curriculum
            </p>
          </div>
          <button 
            className="eng-mark-complete-btn"
            onClick={onComplete}
          >
            <CheckCircle size={16} /> Mark Module as Complete
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="eng-tabs-nav">
          <button 
            className={`eng-tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            <BookOpen size={15} /> Key Concepts & Architecture
          </button>
          <button 
            className={`eng-tab-btn ${activeTab === 'timestamps' ? 'active' : ''}`}
            onClick={() => setActiveTab('timestamps')}
          >
            <Layers size={15} /> Chapter Timestamps ({module?.timestamps?.length || 0})
          </button>
          {module?.codeSnippet && (
            <button 
              className={`eng-tab-btn ${activeTab === 'code' ? 'active' : ''}`}
              onClick={() => setActiveTab('code')}
            >
              <Code2 size={15} /> Hands-on Code & Architecture
            </button>
          )}
          <button 
            className={`eng-tab-btn ${activeTab === 'quiz' ? 'active' : ''}`}
            onClick={() => setActiveTab('quiz')}
          >
            <HelpCircle size={15} /> Technical Knowledge Check
          </button>
        </div>

        {/* TAB 1: Key Concepts & Architecture */}
        {activeTab === 'notes' && (
          <div className="eng-tab-pane fade-in">
            <div className="eng-section-block">
              <h5 className="eng-sub-header">🎯 Engineering Objectives</h5>
              <ul className="eng-bullet-list">
                {(module?.objectives || []).map((obj, i) => (
                  <li key={i}>{obj}</li>
                ))}
              </ul>
            </div>

            <div className="eng-section-block mt-3">
              <h5 className="eng-sub-header">⚡ Architectural Best Practices</h5>
              <div className="eng-key-points-grid">
                {(module?.keyPoints || []).map((pt, i) => (
                  <div key={i} className="eng-point-card">
                    <span className="eng-point-tag">Principle {i + 1}</span>
                    <p>{pt}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Chapter Timestamps */}
        {activeTab === 'timestamps' && (
          <div className="eng-tab-pane fade-in">
            {(module?.timestamps || []).length === 0 ? (
              <p style={{ color: '#94a3b8', padding: '16px' }}>No timestamps configured for this module.</p>
            ) : (
              <div className="eng-timestamps-list">
                {(module?.timestamps || []).map((ts, i) => {
                  const secs = parseTimestampToSeconds(ts.time);
                  const tsWatchUrl = `https://www.youtube.com/watch?v=${youtubeId}&t=${secs}s`;
                  return (
                    <div 
                      key={i} 
                      className="eng-timestamp-item"
                      onClick={() => handleJumpToTimestamp(ts.time)}
                      style={{ cursor: 'pointer' }}
                      title="Click to jump to this chapter"
                    >
                      <span className="eng-ts-time">
                        <Play size={10} style={{ marginRight: '4px' }} />
                        {ts.time}
                      </span>
                      <span className="eng-ts-label">{ts.label}</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          className="eng-ts-jump-btn"
                          onClick={(e) => { e.stopPropagation(); handleJumpToTimestamp(ts.time); }}
                        >
                          Play Here
                        </button>
                        <a
                          href={tsWatchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="eng-ts-jump-btn"
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

        {/* TAB 3: Hands-on Code & Architecture */}
        {activeTab === 'code' && module?.codeSnippet && (
          <div className="eng-tab-pane fade-in">
            <div className="code-snippet-box">
              <div className="code-header">
                <div className="code-header-left">
                  <Terminal size={16} color="#38bdf8" />
                  <span className="code-filename">Implementation Snippet / Architecture Spec</span>
                </div>
                <button className="copy-code-btn" onClick={handleCopyCode}>
                  {copiedCode ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="code-block-pre">
                <code>{module.codeSnippet}</code>
              </pre>
            </div>
          </div>
        )}

        {/* TAB 4: Technical Knowledge Check */}
        {activeTab === 'quiz' && (
          <div className="eng-tab-pane fade-in">
            {module?.quiz ? (
              <div className="eng-quiz-container">
                <h5 className="eng-quiz-question">{module.quiz.question}</h5>
                <div className="eng-quiz-options">
                  {module.quiz.options.map((opt, i) => {
                    let optClass = 'eng-quiz-opt';
                    if (selectedQuizOption === i) optClass += ' selected';
                    if (quizSubmitted) {
                      if (i === module.quiz.answer) optClass += ' correct';
                      else if (selectedQuizOption === i) optClass += ' incorrect';
                    }
                    return (
                      <button
                        key={i}
                        className={optClass}
                        disabled={quizSubmitted}
                        onClick={() => setSelectedQuizOption(i)}
                      >
                        <span className="eng-opt-letter">{String.fromCharCode(65 + i)}</span>
                        <span className="eng-opt-text">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {!quizSubmitted ? (
                  <button 
                    className="eng-quiz-submit-btn"
                    disabled={selectedQuizOption === null}
                    onClick={handleQuizSubmit}
                  >
                    Submit Technical Answer
                  </button>
                ) : (
                  <div className={`eng-quiz-feedback ${selectedQuizOption === module.quiz.answer ? 'success' : 'alert'}`}>
                    <div className="eng-feedback-heading">
                      {selectedQuizOption === module.quiz.answer ? (
                        <>
                          <CheckCircle size={18} color="#16a34a" />
                          <span style={{ fontWeight: 700, color: '#16a34a' }}>Correct Technical Decision!</span>
                        </>
                      ) : (
                        <>
                          <HelpCircle size={18} color="#dc2626" />
                          <span style={{ fontWeight: 700, color: '#dc2626' }}>Review Recommended</span>
                        </>
                      )}
                    </div>
                    <p className="eng-explanation-text">{module.quiz.explanation}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="no-quiz-msg">No scenario quiz available for this module.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EngineeringVideoPlayer;
