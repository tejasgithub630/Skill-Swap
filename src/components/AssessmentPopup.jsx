import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, BookOpen, Award, RotateCcw, ShieldCheck, Zap } from 'lucide-react';
import Webcam from 'react-webcam';
import Button from './Button';
import { getQuestionsForTopic } from '../data/questionBank';
import './AssessmentPopup.css';

const AssessmentPopup = ({ user, topic, onClose, onStart }) => {
  const [step, setStep] = useState('intro'); // 'intro' | 'question' | 'result'
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [backendAssessment, setBackendAssessment] = useState(null);
  const [backendQuestions, setBackendQuestions] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [codingAnswers, setCodingAnswers] = useState(['', '']);
  const [resultData, setResultData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const containerRef = useRef(null);

  const [answeredLevelBreakdown, setAnsweredLevelBreakdown] = useState({
    Easy: { total: 0, correct: 0 },
    Medium: { total: 0, correct: 0 },
    Hard: { total: 0, correct: 0 },
  });

  // Fetch assessment metadata from backend if available
  useEffect(() => {
    let isMounted = true;
    const fetchAssessmentInfo = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token || !topic) return;
        const res = await fetch(`/api/assessments/skill/${encodeURIComponent(topic)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok && isMounted) {
          const data = await res.json();
          setBackendAssessment(data.assessment);
        }
      } catch (err) {
        console.warn('Backend assessment info not available, using local question bank', err);
      }
    };
    fetchAssessmentInfo();
    return () => { isMounted = false; };
  }, [topic]);

  const fallbackQuestions = React.useMemo(() => {
    return getQuestionsForTopic(topic, user?.role);
  }, [topic, user?.role]);

  const activeQuestions = backendQuestions && backendQuestions.length > 0
    ? backendQuestions
    : fallbackQuestions;

  const totalQuestions = activeQuestions.length;
  const passingScorePercentage = backendAssessment?.passing_percentage || 80;
  const passingQuestionsCount = Math.ceil(totalQuestions * (passingScorePercentage / 100));

  const currentQ = activeQuestions[currentQuestionIdx] || activeQuestions[0] || {};
  const progressPct = totalQuestions > 0 ? Math.round(((currentQuestionIdx + 1) / totalQuestions) * 100) : 0;

  const logSecurityEvent = useCallback(async (eventType) => {
    if (!attemptId) return;
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`/api/assessments/attempts/${attemptId}/security-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ event_type: eventType, metadata: { timestamp: new Date().toISOString() } })
      });
    } catch (err) {
      console.error(err);
    }
  }, [attemptId]);

  useEffect(() => {
    if (step === 'question' || step === 'coding') {
      const handleCopy = (e) => { e.preventDefault(); logSecurityEvent('COPY_ATTEMPT'); alert('Copying is disabled during the exam.'); };
      const handlePaste = (e) => { e.preventDefault(); logSecurityEvent('PASTE_ATTEMPT'); alert('Pasting is disabled during the exam.'); };
      const handleCut = (e) => { e.preventDefault(); logSecurityEvent('CUT_ATTEMPT'); alert('Cutting is disabled during the exam.'); };
      const handleContext = (e) => { e.preventDefault(); logSecurityEvent('CONTEXT_MENU_ATTEMPT'); };
      const handleKeydown = (e) => {
        if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'a'].includes(e.key.toLowerCase())) {
          e.preventDefault();
          logSecurityEvent('SHORTCUT_ATTEMPT');
        }
      };

      const handleVisibility = () => {
        if (document.visibilityState === 'hidden') {
          logSecurityEvent('VISIBILITY_CHANGE');
          alert('Warning: You switched tabs. The test has automatically been submitted and failed.');
          setStep('result');
          setResultData({ passed: false, percentage: 0, reason: 'Tab switched' });
        }
      };

      const handleFullscreenChange = () => {
        if (!document.fullscreenElement) {
          logSecurityEvent('FULLSCREEN_EXITED');
          alert('Warning: You exited fullscreen mode. The test has automatically been submitted and failed.');
          setStep('result');
          setResultData({ passed: false, percentage: 0, reason: 'Exited fullscreen' });
        } else {
          logSecurityEvent('FULLSCREEN_ENTERED');
        }
      };

      document.addEventListener('copy', handleCopy);
      document.addEventListener('paste', handlePaste);
      document.addEventListener('cut', handleCut);
      document.addEventListener('contextmenu', handleContext);
      document.addEventListener('keydown', handleKeydown);
      document.addEventListener('visibilitychange', handleVisibility);
      document.addEventListener('fullscreenchange', handleFullscreenChange);

      return () => {
        document.removeEventListener('copy', handleCopy);
        document.removeEventListener('paste', handlePaste);
        document.removeEventListener('cut', handleCut);
        document.removeEventListener('contextmenu', handleContext);
        document.removeEventListener('keydown', handleKeydown);
        document.removeEventListener('visibilitychange', handleVisibility);
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
      };
    }
  }, [step, attemptId, logSecurityEvent]);

  const handleStart = async () => {
    try {
      if (containerRef.current && containerRef.current.requestFullscreen) {
        await containerRef.current.requestFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen request bypassed', err);
    }

    // Try starting session with backend
    try {
      const token = localStorage.getItem('auth_token');
      if (token && backendAssessment?.id) {
        const res = await fetch(`/api/assessments/${backendAssessment.id}/start`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAttemptId(data.attemptId);
          if (data.questions && data.questions.length > 0) {
            setBackendQuestions(data.questions);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to start backend attempt, using local exam mode', err);
    }

    setStep('question');
    setCurrentQuestionIdx(0);
    setScore(0);
    setSelectedOption(null);
    setUserAnswers({});
    setResultData(null);
    setAnsweredLevelBreakdown({
      Easy: { total: 0, correct: 0 },
      Medium: { total: 0, correct: 0 },
      Hard: { total: 0, correct: 0 },
    });
  };

  const handleAnswerSelect = async (option) => {
    if (selectedOption !== null || isSubmitting) return; // prevent double click
    setSelectedOption(option);

    const qId = currentQ.id || currentQuestionIdx;
    const updatedAnswers = { ...userAnswers, [qId]: option };
    setUserAnswers(updatedAnswers);

    const isCorrect = option === currentQ.a || option === currentQ.correct_answer;
    const newScore = isCorrect ? score + 1 : score;

    const level = currentQ.level || currentQ.difficulty || 'Easy';
    const normLevel = level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();
    const safeKey = ['Easy', 'Medium', 'Hard'].includes(normLevel) ? normLevel : 'Medium';

    setAnsweredLevelBreakdown(prev => ({
      ...prev,
      [safeKey]: {
        total: (prev[safeKey]?.total || 0) + 1,
        correct: (prev[safeKey]?.correct || 0) + (isCorrect ? 1 : 0),
      }
    }));

    setTimeout(async () => {
      setScore(newScore);
      setSelectedOption(null);
      if (currentQuestionIdx < totalQuestions - 1) {
        setCurrentQuestionIdx(currentQuestionIdx + 1);
      } else {
        // Final question answered
        if (user?.role === 'medical') {
          submitFinalExam(newScore);
        } else {
          setStep('coding');
        }
      }
    }, 350);
  };

  const submitFinalExam = async (overrideScore = null) => {
    setIsSubmitting(true);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.log(err));
    }

    const currentScore = overrideScore !== null ? overrideScore : score;
    const finalPercentage = Math.round((currentScore / totalQuestions) * 100);
    const isMcqPassed = finalPercentage >= passingScorePercentage;

    let passedCoding = true;
    if (user?.role !== 'medical') {
      passedCoding = codingAnswers[0].trim().length > 5 || codingAnswers[1].trim().length > 5;
    }

    const finalPassed = isMcqPassed && passedCoding;

    if (attemptId) {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`/api/assessments/attempts/${attemptId}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ answers: userAnswers })
        });
        if (res.ok) {
          const data = await res.json();
          setResultData({ ...data, passed: finalPassed });
        }
      } catch (err) {
        console.error('Failed to submit exam attempt', err);
      }
    } else {
      setResultData({ passed: finalPassed, percentage: finalPercentage });
    }
    setIsSubmitting(false);
    setStep('result');
  };

  const finalPercentage = Math.round((score / totalQuestions) * 100);
  const isPassed = finalPercentage >= passingScorePercentage;

  const getDifficultyBadge = (level) => {
    if (level === 'Easy') return <span className="diff-badge diff-easy">🟢 Level 1: Fundamentals</span>;
    if (level === 'Medium') return <span className="diff-badge diff-medium">🟡 Level 2: Intermediate</span>;
    return <span className="diff-badge diff-hard">🔴 Level 3: Advanced</span>;
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1200 }}>
      <div className="modal-content assessment-modal" ref={containerRef} style={{ userSelect: step === 'question' ? 'none' : 'auto' }}>
        <button className="icon-btn close-modal-btn" onClick={() => {
          if (document.fullscreenElement) document.exitFullscreen().catch(() => { });
          onClose();
        }}>
          <X size={20} />
        </button>

        {/* STEP 1: INTRO */}
        {step === 'intro' && (
          <div className="assessment-intro fade-in">
            <div className="assessment-icon-circle">
              <ShieldCheck size={40} />
            </div>
            <h2>Skill Assessment: {topic}</h2>
            <p className="assessment-desc">
              Test your knowledge in <strong>{topic}</strong> with a structured examination. Questions are organized progressively from fundamentals to advanced scenarios.
            </p>

            <div className="assessment-meta-grid">
              <div className="meta-box">
                <span className="meta-label">Total Questions</span>
                <span className="meta-val">{totalQuestions} Questions</span>
              </div>
              <div className="meta-box">
                <span className="meta-label">Difficulty Flow</span>
                <span className="meta-val">Easy ➔ Med ➔ Hard</span>
              </div>
              <div className="meta-box highlight">
                <span className="meta-label">Passing Criteria</span>
                <span className="meta-val">≥ 80% ({passingQuestionsCount}/{totalQuestions} correct)</span>
              </div>
            </div>

            <div className="assessment-notice" style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '8px' }}><Zap size={18} style={{ minWidth: '18px' }} /><span>Score 80% or higher to earn a Verified Skill Badge on your profile!</span></div>
              <div style={{ display: 'flex', gap: '8px' }}><AlertTriangle size={18} color="#ef4444" style={{ minWidth: '18px' }} /><span><strong>Strict Rules:</strong> Your webcam will be active. Do NOT exit fullscreen or switch tabs, or your test will automatically fail. {user?.role !== 'medical' && "You must also pass at least 1 coding question at the end!"}</span></div>
            </div>

            <div className="assessment-actions">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button variant="primary" onClick={handleStart}>
                <BookOpen size={16} /> Begin Assessment
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: QUESTIONS */}
        {step === 'question' && (
          <div className="assessment-question-view fade-in">
            <div style={{ position: 'absolute', top: '20px', right: '20px', width: '120px', height: '90px', borderRadius: '8px', overflow: 'hidden', border: '2px solid #0ea5e9', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10 }}>
              <Webcam audio={false} width="100%" height="100%" style={{ objectFit: 'cover' }} />
            </div>
            <div className="question-header">
              <div className="topic-and-step">
                <span className="topic-name">{topic}</span>
                <span className="step-counter">Question {currentQuestionIdx + 1} of {totalQuestions}</span>
              </div>
              <div className="difficulty-tag-wrap">
                {getDifficultyBadge(currentQ.level)}
              </div>
            </div>

            {/* Progress bar */}
            <div className="assessment-progress-track">
              <div
                className="assessment-progress-fill"
                style={{ width: `${progressPct}%` }}
              ></div>
            </div>

            <div className="question-body">
              <h3 className="question-title">{currentQ.question_text || currentQ.q}</h3>

              {currentQ.starter_code && (
                <div style={{ background: '#0f172a', color: '#38bdf8', padding: '12px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.85rem', marginBottom: '16px', whiteSpace: 'pre-wrap' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '6px' }}>Starter Code:</div>
                  {currentQ.starter_code}
                </div>
              )}

              <div className="options-list">
                {(currentQ.options || []).map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isSelected = selectedOption === opt;
                  return (
                    <button
                      key={idx}
                      className={`option-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleAnswerSelect(opt)}
                      disabled={selectedOption !== null || isSubmitting}
                    >
                      <span className="opt-letter">{letter}</span>
                      <span className="opt-text">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2.5: CODING */}
        {step === 'coding' && (
          <div className="assessment-question-view fade-in" style={{ height: '100%', overflowY: 'auto' }}>
            <div style={{ position: 'absolute', top: '20px', right: '20px', width: '160px', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '3px solid #0ea5e9', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10 }}>
              <Webcam audio={false} width="100%" height="100%" style={{ objectFit: 'cover' }} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Practical Challenge: {topic}</h2>
            <p style={{ marginBottom: '24px', color: '#64748b' }}>You must solve at least one of these challenges in <strong>{topic}</strong> to pass the certification.</p>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '8px' }}>1. Write a function in {topic} that reverses a string or array.</h4>
              <textarea
                style={{ width: '100%', height: '150px', fontFamily: 'monospace', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                value={codingAnswers[0]}
                onChange={e => setCodingAnswers([e.target.value, codingAnswers[1]])}
                placeholder={`// ${topic} solution here...`}
              ></textarea>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ marginBottom: '8px' }}>2. Write a function in {topic} that adds two numbers together.</h4>
              <textarea
                style={{ width: '100%', height: '150px', fontFamily: 'monospace', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                value={codingAnswers[1]}
                onChange={e => setCodingAnswers([codingAnswers[0], e.target.value])}
                placeholder={`// ${topic} solution here...`}
              ></textarea>
            </div>

            <Button variant="primary" style={{ width: '100%' }} onClick={() => submitFinalExam()} disabled={isSubmitting}>
              Submit Final Exam
            </Button>
          </div>
        )}

        {/* STEP 3: RESULT */}
        {step === 'result' && (
          <div className="assessment-result-view fade-in">
            {(resultData ? resultData.passed : false) ? (
              <div className="result-card passed">
                <div className="result-icon-circle success">
                  <Award size={48} />
                </div>
                <h2>Assessment Passed! 🎉</h2>
                <div className="score-banner success">
                  <span className="score-number">{resultData ? resultData.percentage : finalPercentage}%</span>
                  <span className="score-text">({resultData ? `${resultData.score}/${resultData.maxScore}` : `${score}/${totalQuestions}`} Correct — Passed ≥ {passingScorePercentage}%)</span>
                </div>

                <div style={{ margin: '14px 0', padding: '10px 16px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>
                    🏅 Verified Proficiency Level: <strong>{resultData?.proficiency_level || 'INTERMEDIATE'}</strong>
                  </span>
                  {resultData?.certification?.certificate_number && (
                    <div style={{ marginTop: '6px', fontSize: '0.82rem', color: '#15803D' }}>
                      Certificate ID: <code>{resultData.certification.certificate_number}</code>
                      <div style={{ marginTop: '8px' }}>
                        <a
                          href={`/verify/certificate/${resultData.certification.certificate_number}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#4F46E5', fontWeight: 600, textDecoration: 'underline' }}
                        >
                          🔗 View Public Certificate Record
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <p className="result-message">
                  Congratulations! You demonstrated mastery in <strong>{topic}</strong>. This skill is now officially verified on your profile!
                </p>

                <div className="breakdown-row">
                  <div className="breakdown-chip">
                    <span>🟢 Easy:</span> <b>{answeredLevelBreakdown.Easy.correct}/{answeredLevelBreakdown.Easy.total}</b>
                  </div>
                  <div className="breakdown-chip">
                    <span>🟡 Medium:</span> <b>{answeredLevelBreakdown.Medium.correct}/{answeredLevelBreakdown.Medium.total}</b>
                  </div>
                  <div className="breakdown-chip">
                    <span>🔴 Hard:</span> <b>{answeredLevelBreakdown.Hard.correct}/{answeredLevelBreakdown.Hard.total}</b>
                  </div>
                </div>

                <div className="result-actions">
                  <Button variant="primary" className="btn-full" onClick={onStart}>
                    <CheckCircle size={16} /> Save & Add Skill to Profile
                  </Button>
                </div>
              </div>
            ) : (
              <div className="result-card failed">
                <div className="result-icon-circle failed">
                  <AlertTriangle size={48} />
                </div>
                <h2>Assessment Not Passed</h2>
                <div className="score-banner failed">
                  <span className="score-number">{finalPercentage}%</span>
                  <span className="score-text">({score} / {totalQuestions} Correct — Minimum 80% Required)</span>
                </div>
                <p className="result-message">
                  {resultData?.reason ? (
                    <span style={{ color: '#ef4444', fontWeight: 600 }}>Test Failed: {resultData.reason}. </span>
                  ) : (
                    <span>You scored {resultData ? resultData.percentage : finalPercentage}%. You must score ≥ 80% on the quiz AND successfully complete a coding challenge to pass. </span>
                  )}
                  Review the core concepts and try again!
                </p>

                <div className="breakdown-row">
                  <div className="breakdown-chip">
                    <span>🟢 Easy:</span> <b>{answeredLevelBreakdown.Easy.correct}/{answeredLevelBreakdown.Easy.total}</b>
                  </div>
                  <div className="breakdown-chip">
                    <span>🟡 Medium:</span> <b>{answeredLevelBreakdown.Medium.correct}/{answeredLevelBreakdown.Medium.total}</b>
                  </div>
                  <div className="breakdown-chip">
                    <span>🔴 Hard:</span> <b>{answeredLevelBreakdown.Hard.correct}/{answeredLevelBreakdown.Hard.total}</b>
                  </div>
                </div>

                <div className="result-actions" style={{ display: 'flex', gap: '12px' }}>
                  <Button variant="outline" className="w-full" onClick={onClose}>
                    Close
                  </Button>
                  <Button variant="primary" className="w-full" onClick={handleStart}>
                    <RotateCcw size={16} /> Retry Assessment
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AssessmentPopup;
