import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Search, HelpCircle, Send, Sparkles } from 'lucide-react';
import Button from './Button';
import './SkillRequestModal.css';

const SkillRequestModal = ({ isOpen, onClose, defaultDomain = 'ENGINEERING', onSkillAdded }) => {
  const [skillName, setSkillName] = useState('');
  const [category, setCategory] = useState('Programming Language');
  const [domain, setDomain] = useState(defaultDomain.toUpperCase());
  const [description, setDescription] = useState('');
  const [justification, setJustification] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');

  const [checkingDup, setCheckingDup] = useState(false);
  
  const [dupResult, setDupResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Live duplicate checking on debounce
  useEffect(() => {
    if (!skillName.trim() || skillName.trim().length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDupResult(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setCheckingDup(true);
        const res = await fetch('/api/skills/check-duplicate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: skillName.trim(), domain })
        });
        const data = await res.json();
        setDupResult(data);
      } catch {
        console.error("error");
      } finally {
        setCheckingDup(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [skillName, domain]);

  if (!isOpen) return null;

  const handleUseExisting = async (existingSkill) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/users/me/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          skill_id: existingSkill.id,
          is_teaching: true,
          proficiency_level: 'BEGINNER'
        })
      });
      if (res.ok) {
        if (onSkillAdded) onSkillAdded(existingSkill);
        onClose();
        alert(`Skill "${existingSkill.canonical_name}" added to your profile as Self-Declared! Take the certification assessment to verify.`);
      }
    } catch {
      console.error('error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!skillName.trim() || !description.trim()) {
      setErrorMsg('Skill name and description are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/skills/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          requested_name: skillName.trim(),
          category,
          domain,
          description: description.trim(),
          justification: justification.trim(),
          reference_url: referenceUrl.trim()
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSubmitSuccess(data.message || 'Skill request submitted for review.');
        setTimeout(() => {
          setSubmitSuccess(null);
          onClose();
        }, 2500);
      } else {
        setErrorMsg(data.error || 'Failed to submit skill request.');
      }
    } catch (err) {
      setErrorMsg('Network error while submitting request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal-content skill-request-modal">
        <header className="modal-header">
          <div className="flex items-center gap-2">
            <Sparkles size={22} className="text-indigo-600" />
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Request New Skill</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>Propose a language or competency to be added to the global SkillSwap taxonomy.</p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </header>

        {submitSuccess ? (
          <div className="request-success-box text-center p-6">
            <CheckCircle size={48} className="text-emerald-500 mx-auto mb-3" />
            <h4 className="text-lg font-bold text-slate-800">Request Submitted!</h4>
            <p className="text-sm text-slate-600 mt-1">{submitSuccess}</p>
            <p className="text-xs text-slate-400 mt-2">Our proctoring team will review the proposal and prepare an assessment benchmark.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="skill-request-form">
            {errorMsg && (
              <div className="request-error-alert">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Duplicate / Alias Warning Hint */}
            {dupResult?.isDuplicate && (
              <div className="duplicate-warning-banner">
                <AlertCircle size={18} className="warning-icon" />
                <div className="warning-content">
                  <strong>Existing Skill Detected</strong>
                  <p>{dupResult.suggestion}</p>
                  <Button 
                    type="button" 
                    variant="primary" 
                    className="btn-sm mt-2"
                    onClick={() => handleUseExisting(dupResult.matchedSkill)}
                  >
                    Add Existing "{dupResult.matchedSkill.canonical_name}"
                  </Button>
                </div>
              </div>
            )}

            {dupResult?.potentialMatch && !dupResult.isDuplicate && (
              <div className="potential-match-banner">
                <HelpCircle size={16} />
                <span>{dupResult.suggestion}</span>
              </div>
            )}

            <div className="form-grid-2">
              <div className="form-group">
                <label>Skill Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Rust, Kotlin, Svelte, Cardiology AI..."
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Domain *</label>
                <select value={domain} onChange={(e) => setDomain(e.target.value)}>
                  <option value="ENGINEERING">Software Engineering</option>
                  <option value="MEDICAL">Medical & Clinical</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {domain === 'ENGINEERING' ? (
                  <>
                    <option value="Programming Language">Programming Language</option>
                    <option value="Frontend Framework">Frontend Framework</option>
                    <option value="Backend Framework">Backend Framework</option>
                    <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                    <option value="DevOps & Containers">DevOps & Containers</option>
                    <option value="Database Engineering">Database Engineering</option>
                    <option value="Systems Programming">Systems Programming</option>
                    <option value="AI & Machine Learning">AI & Machine Learning</option>
                  </>
                ) : (
                  <>
                    <option value="Clinical Speciality">Clinical Speciality</option>
                    <option value="Diagnostic Imaging">Diagnostic Imaging</option>
                    <option value="Clinical Therapeutics">Clinical Therapeutics</option>
                    <option value="Surgical Competency">Surgical Competency</option>
                    <option value="Emergency Care">Emergency Care</option>
                    <option value="Laboratory Medicine">Laboratory Medicine</option>
                    <option value="Pediatric Medicine">Pediatric Medicine</option>
                  </>
                )}
              </select>
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea 
                rows="3"
                placeholder="Describe what this skill encompasses, core principles, and use cases..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Why should this skill be added to SkillSwap?</label>
              <textarea 
                rows="2"
                placeholder="Industry adoption, technical demand, peer exchange value..."
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Documentation or Reference URL (Optional)</label>
              <input 
                type="url" 
                placeholder="https://..."
                value={referenceUrl}
                onChange={(e) => setReferenceUrl(e.target.value)}
              />
            </div>

            <div className="modal-actions-footer">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button 
                type="submit" 
                variant="primary" 
                isLoading={isSubmitting}
                disabled={dupResult?.isDuplicate}
              >
                <Send size={16} /> Submit Skill Request
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SkillRequestModal;
