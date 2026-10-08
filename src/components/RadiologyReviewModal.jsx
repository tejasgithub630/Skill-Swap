import React, { useState } from 'react';
import { X, CheckCircle, FileText, Activity, AlertCircle, ChevronRight, Check } from 'lucide-react';
import Button from './Button';

const RADIOLOGY_CASES = [
  {
    id: 1,
    title: 'Case 1: 58-Year-Old Male with Fever & Productive Cough',
    history: 'A 58-year-old male presents to the ED with 3 days of worsening productive cough, fever of 39.1°C, and pleuritic right-sided chest pain. Crackles audible at right base.',
    modality: 'PA & Lateral Chest Radiograph (CXR)',
    findings: 'Homogeneous airspace consolidation in the right lower lobe with visible air bronchograms. Cardiac silhouette normal (CTR 0.44). Costophrenic angles sharp. No pneumothorax.',
    diagnosis: 'Right Lower Lobe Acute Bacterial Lobar Pneumonia (Streptococcus pneumoniae)',
    plan: 'Initiate empiric Ceftriaxone 1g IV + Azithromycin 500mg IV. Sputum and blood cultures sent.',
    keySign: 'Air Bronchogram Sign'
  },
  {
    id: 2,
    title: 'Case 2: 24-Year-Old Female Post-MVC with Severe Dyspnea',
    history: 'A 24-year-old female driver unrestrained in a motor vehicle collision. Presents with tachypnea (RR 34/min), tracheal deviation to the right, and absent breath sounds on the left.',
    modality: 'Emergency Supine Chest Radiograph',
    findings: 'Prominent visceral pleural line at the left hemithorax with complete absence of peripheral vascular markings. Flattening of the left hemidiaphragm and contralateral mediastinal shift.',
    diagnosis: 'Left-Sided Tension Pneumothorax with Hemodynamic Compromise',
    plan: 'Immediate needle decompression at 5th intercostal space anterior axillary line, followed by formal 28-Fr chest tube placement connected to water seal.',
    keySign: 'Deep Sulcus & Visceral Pleural Line Sign'
  },
  {
    id: 3,
    title: 'Case 3: 72-Year-Old Male with Orthopnea & Bilateral Leg Edema',
    history: 'A 72-year-old male with long-standing hypertension presents with progressive dyspnea on exertion, paroxysmal nocturnal dyspnea, and 3-pillow orthopnea. Bilateral pitting edema to knees.',
    modality: 'Erect PA Chest Radiograph',
    findings: 'Marked cardiomegaly (CTR 0.62). Upper lobe vascular cephalization. Interstitial thickening with horizontal Kerley B lines at the right costophrenic angle. Mild blunting of bilateral costophrenic sulci consistent with bilateral transudative pleural effusions.',
    diagnosis: 'Acute Decompensated Congestive Heart Failure (ADHF) with Pulmonary Edema',
    plan: 'IV Furosemide 40mg bolus, non-invasive positive pressure ventilation (BiPAP), continuous pulse oximetry and telemetry monitoring.',
    keySign: 'Kerley B Lines & Bat-Wing Infiltrates'
  }
];

const RadiologyReviewModal = ({ isOpen, onClose, onComplete }) => {
  const [activeCaseIdx, setActiveCaseIdx] = useState(0);
  const [analyzedCases, setAnalyzedCases] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const currentCase = RADIOLOGY_CASES[activeCaseIdx];
  const isCaseAnalyzed = analyzedCases.includes(currentCase.id);

  const handleMarkAnalyzed = () => {
    if (!analyzedCases.includes(currentCase.id)) {
      const updated = [...analyzedCases, currentCase.id];
      setAnalyzedCases(updated);
      if (activeCaseIdx < RADIOLOGY_CASES.length - 1) {
        setActiveCaseIdx(activeCaseIdx + 1);
      }
    }
  };

  const handleFinalSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      onComplete();
    }, 1200);
  };

  const allAnalyzed = analyzedCases.length === RADIOLOGY_CASES.length;

  return (
    <div className="modal-overlay" style={{ zIndex: 1300 }}>
      <div className="modal-content" style={{ maxWidth: '820px', width: '92%', maxHeight: '90vh', overflowY: 'auto' }}>
        <header className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={22} color="#10b981" />
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0 }}>Daily Case Review: Analyze 3 Radiology Reports</h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0' }}>
              Review the emergency imaging findings and confirm clinical impression to complete your daily case task.
            </p>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={24} /></button>
        </header>

        <div className="modal-body" style={{ padding: '1.25rem 0 0' }}>
          {/* Case Navigation Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
            {RADIOLOGY_CASES.map((c, i) => {
              const done = analyzedCases.includes(c.id);
              const isActive = activeCaseIdx === i;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCaseIdx(i)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: isActive ? '#10b981' : (done ? '#bbf7d0' : '#e2e8f0'),
                    background: isActive ? '#ecfdf5' : (done ? '#f0fdf4' : '#ffffff'),
                    color: isActive ? '#065f46' : '#1e293b',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {done ? <Check size={14} color="#10b981" /> : <span>Case {i + 1}</span>}
                  <span>{done ? 'Analyzed' : `Report ${i + 1}`}</span>
                </button>
              );
            })}
          </div>

          {/* Active Case Details */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: 700 }}>{currentCase.title}</h4>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: '#dbeafe', color: '#1d4ed8' }}>
                {currentCase.modality}
              </span>
            </div>

            <div style={{ marginBottom: '1rem', fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>
              <b>Clinical Presentation:</b>
              <p style={{ margin: '4px 0 0', color: '#475569' }}>{currentCase.history}</p>
            </div>

            {/* Imaging Simulation Box */}
            <div style={{ background: '#090d16', borderRadius: '8px', padding: '16px', color: '#38bdf8', marginBottom: '1rem', fontFamily: 'monospace', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '6px', marginBottom: '8px' }}>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>RADIOLOGICAL FINDINGS:</span>
                <span style={{ color: '#94a3b8' }}>Key Sign: {currentCase.keySign}</span>
              </div>
              <p style={{ color: '#cbd5e1', margin: 0, lineHeight: 1.6 }}>{currentCase.findings}</p>
            </div>

            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '12px 14px', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#065f46', marginBottom: '4px' }}>DIAGNOSTIC IMPRESSION:</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#047857' }}>{currentCase.diagnosis}</div>
              <div style={{ fontSize: '0.8rem', color: '#065f46', marginTop: '6px' }}><b>Recommended Intervention:</b> {currentCase.plan}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              {!isCaseAnalyzed ? (
                <Button variant="primary" className="btn-sm" onClick={handleMarkAnalyzed}>
                  <CheckCircle size={15} /> Confirm Case Analysis
                </Button>
              ) : (
                <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle size={16} /> Case Analysis Recorded
                </span>
              )}
            </div>
          </div>

          {/* Submission Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Progress: <b>{analyzedCases.length} / 3</b> reports analyzed
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="outline" onClick={onClose}>Close</Button>
              <Button 
                variant="primary" 
                onClick={handleFinalSubmit}
                disabled={!allAnalyzed || submitted}
              >
                {submitted ? 'Saving Task...' : (allAnalyzed ? 'Complete Daily Task (3/3 Analyzed)' : 'Analyze All 3 Reports')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadiologyReviewModal;
