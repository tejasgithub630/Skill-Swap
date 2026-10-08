import React, { useState } from 'react';
import { X, Send, UserCheck, Microscope, AlertCircle, CheckCircle } from 'lucide-react';
import Button from './Button';

const PathologyConsultModal = ({ isOpen, onClose, onComplete }) => {
  const [selectedCase, setSelectedCase] = useState('gastric_biopsy');
  const [selectedSpecialist, setSelectedSpecialist] = useState('dr_wilson');
  const [urgency, setUrgency] = useState('stat');
  const [clinicalNotes, setClinicalNotes] = useState('Please review margins for intestinal metaplasia vs dysplasia in antral biopsy.');
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1300 }}>
      <div className="modal-content" style={{ maxWidth: '640px', width: '92%' }}>
        <header className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Microscope size={22} color="#10b981" />
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0 }}>Expert Swap: Request Pathology Consultation</h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0' }}>
              Connect directly with an expert pathologist to review complex histologic specimens or biopsy margins.
            </p>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={24} /></button>
        </header>

        <form onSubmit={handleSubmit} className="modal-body" style={{ padding: '1.25rem 0 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
              Select Consultation Case Specimen
            </label>
            <select 
              value={selectedCase} 
              onChange={(e) => setSelectedCase(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            >
              <option value="gastric_biopsy">Endoscopic Biopsy: Gastric Antrum (Suspicious Ulcer Margin)</option>
              <option value="thyroid_fna">Fine Needle Aspiration: Thyroid Bethesda Category IV</option>
              <option value="lymph_node">Core Needle Biopsy: Supraclavicular Lymph Node</option>
              <option value="dermatopathology">Punch Biopsy: Pigmented Cutaneous Lesion</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
              Consulting Pathologist Peer
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div 
                onClick={() => setSelectedSpecialist('dr_wilson')}
                style={{ 
                  flex: 1, 
                  padding: '10px', 
                  borderRadius: '8px', 
                  border: '1px solid', 
                  borderColor: selectedSpecialist === 'dr_wilson' ? '#10b981' : '#e2e8f0', 
                  background: selectedSpecialist === 'dr_wilson' ? '#ecfdf5' : '#ffffff',
                  cursor: 'pointer' 
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>Dr. James Wilson, MD</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Chief of Anatomic Pathology · Online</div>
              </div>

              <div 
                onClick={() => setSelectedSpecialist('dr_rose')}
                style={{ 
                  flex: 1, 
                  padding: '10px', 
                  borderRadius: '8px', 
                  border: '1px solid', 
                  borderColor: selectedSpecialist === 'dr_rose' ? '#10b981' : '#e2e8f0', 
                  background: selectedSpecialist === 'dr_rose' ? '#ecfdf5' : '#ffffff',
                  cursor: 'pointer' 
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>Dr. Emily Rose, MD</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Clinical Pathologist · Top Peer Mentor</div>
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
              Clinical Turnaround Priority
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input type="radio" name="urgency" value="stat" checked={urgency === 'stat'} onChange={() => setUrgency('stat')} />
                <span>Stat Review (&lt; 2 Hours)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input type="radio" name="urgency" value="standard" checked={urgency === 'standard'} onChange={() => setUrgency('standard')} />
                <span>Standard Review (24 Hours)</span>
              </label>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
              Clinical Questions / Specific Staining Requested
            </label>
            <textarea 
              rows="3"
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              placeholder="Specify special stains (e.g. Giemsa, H. pylori, IHC CK7/CK20) or specific differential diagnosis..."
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '0.5rem' }}>
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={sent}>
              {sent ? (
                <>
                  <CheckCircle size={16} /> Consultation Sent!
                </>
              ) : (
                <>
                  <Send size={16} /> Send Consultation Request
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PathologyConsultModal;
