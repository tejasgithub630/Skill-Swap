import React from 'react';
import { X, Shield, Sparkles, Award, Zap, CheckCircle2 } from 'lucide-react';
import Button from './Button';
import './ScoreBreakdownModal.css';

const ScoreBreakdownModal = ({ match, onClose }) => {
  if (!match) return null;

  const raw = match.rawScores || {};
  const weights = match.weights || {
    skillCompatibility: 0.40,
    trustScore: 0.25,
    experienceScore: 0.20,
    coldStartBoost: 0.15
  };

  const skillScore = Math.round((raw.skillScore || 0.85) * 100);
  const trustScore = Math.round((raw.trustScore || 0.95) * 100);
  const expScore = Math.round((raw.experienceScore || 0.70) * 100);
  const coldBoost = Math.round((raw.coldStartBoost || 0) * 100);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content breakdown-modal" onClick={e => e.stopPropagation()}>
        <div className="breakdown-modal-header">
          <div>
            <span className="breakdown-kicker">Algorithmic Decomposition</span>
            <h3>Match Compatibility with {match.user}</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="total-score-banner">
          <div className="total-score-number">{match.matchScore}%</div>
          <div className="total-score-meta">
            <h4>Composite Algorithmic Match Score</h4>
            <p>{match.explanation}</p>
          </div>
        </div>

        {/* 4 Components Breakdown */}
        <div className="components-list">
          {/* Component 1: Skill Compatibility */}
          <div className="component-row">
            <div className="comp-icon comp-skill">
              <Zap size={18} />
            </div>
            <div className="comp-info">
              <div className="comp-title-line">
                <h5>1. Skill Compatibility (Bigram Jaccard + Taxonomy)</h5>
                <span className="comp-math">{skillScore}% × {Math.round(weights.skillCompatibility * 100)}% wt</span>
              </div>
              <p>Canonical identity and taxonomy graph distance between offered and demanded competencies.</p>
            </div>
          </div>

          {/* Component 2: Bayesian Trust */}
          <div className="component-row">
            <div className="comp-icon comp-trust">
              <Shield size={18} />
            </div>
            <div className="comp-info">
              <div className="comp-title-line">
                <h5>2. Bayesian Trust & Attendance Reliability</h5>
                <span className="comp-math">{trustScore}% × {Math.round(weights.trustScore * 100)}% wt</span>
              </div>
              <p>
                Bayesian shrinkage ($m=4.5, C=3$) combined with {match.reliabilityScore || 98}% attendance follow-through.
                Protected against review bombing anomalies.
              </p>
            </div>
          </div>

          {/* Component 3: Experience */}
          <div className="component-row">
            <div className="comp-icon comp-exp">
              <Award size={18} />
            </div>
            <div className="comp-info">
              <div className="comp-title-line">
                <h5>3. Pedagogical Experience (Log-Saturation)</h5>
                <span className="comp-math">{expScore}% × {Math.round(weights.experienceScore * 100)}% wt</span>
              </div>
              <p>
                {match.sessionsCompleted || 0} completed teaching sessions. Diminishing returns prevents top-mentor monopolies.
              </p>
            </div>
          </div>

          {/* Component 4: Cold Start */}
          <div className="component-row">
            <div className="comp-icon comp-cold">
              <Sparkles size={18} />
            </div>
            <div className="comp-info">
              <div className="comp-title-line">
                <h5>4. Cold-Start Exploration Bonus</h5>
                <span className="comp-math">+{coldBoost}% (δ)</span>
              </div>
              <p>
                {match.isRisingStar 
                  ? '🌟 Active! Granted to newly certified mentors passing the 70% assessment threshold to promote platform fairness.' 
                  : 'Inactive (Veteran tutor with established session history).'}
              </p>
            </div>
          </div>
        </div>

        <div className="breakdown-modal-footer">
          <Button variant="primary" className="btn-full" onClick={onClose}>
            <CheckCircle2 size={16} /> Close Breakdown
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScoreBreakdownModal;
