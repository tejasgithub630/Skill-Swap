import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, Award, Calendar, CheckCircle, AlertTriangle, XCircle, ExternalLink, ArrowLeft } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import './PublicCertificateVerify.css';

const PublicCertificateVerify = () => {
  const { certificateNumber } = useParams();
  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCert = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/certifications/verify/${certificateNumber}`);
        const data = await res.json();
        if (res.ok) {
          setCertData(data);
        } else {
          setError(data.error || 'Certificate not found.');
        }
      } catch {
        setError('Network error while validating certificate.');
      } finally {
        setLoading(false);
      }
    };
    if (certificateNumber) {
      fetchCert();
    }
  }, [certificateNumber]);

  return (
    <div className="verify-page-wrapper">
      <div className="verify-container">
        <div className="verify-header">
          <Link to="/" className="verify-brand">
            <span className="logo-icon">🚀</span>
            <span className="logo-text gradient-text">SkillSwap</span>
          </Link>
          <span className="verify-badge-top">Official Credential Registry</span>
        </div>

        {loading ? (
          <Card className="verify-card text-center p-8">
            <div className="spinner-border"></div>
            <p className="mt-4 text-slate-500">Verifying cryptographic certificate signature...</p>
          </Card>
        ) : error ? (
          <Card className="verify-card text-center p-8">
            <div className="verify-icon-wrap error">
              <XCircle size={48} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mt-3">Invalid Credential</h2>
            <p className="text-slate-600 mt-2">{error}</p>
            <p className="text-xs text-slate-400 mt-1">Certificate Number: {certificateNumber}</p>
            <div className="mt-6">
              <Link to="/"><Button variant="outline">Return to SkillSwap Home</Button></Link>
            </div>
          </Card>
        ) : (
          <Card className={`verify-card cert-card-main ${certData.verification_status.toLowerCase()}`}>
            <div className="cert-border-seal">
              <div className="cert-top-banner">
                <div className="platform-crest">
                  <ShieldCheck size={36} className="crest-icon" />
                  <div>
                    <h4 className="platform-name">SkillSwap Global Verification Authority</h4>
                    <span className="platform-sub">Decentralized Peer Skill & Competency Standard</span>
                  </div>
                </div>
                <div className={`status-pill ${certData.verification_status.toLowerCase()}`}>
                  {certData.verification_status === 'VERIFIED' && <CheckCircle size={16} />}
                  {certData.verification_status === 'EXPIRED' && <AlertTriangle size={16} />}
                  {certData.verification_status === 'REVOKED' && <XCircle size={16} />}
                  <span>{certData.verification_status}</span>
                </div>
              </div>

              <div className="cert-body">
                <span className="cert-lead">This official registry certifies that</span>
                <h1 className="cert-holder-name">{certData.credential_holder}</h1>
                <p className="cert-affirmation">
                  has demonstrated rigorous verified competency and passed proctored examination in
                </p>

                <div className="cert-skill-box">
                  <Award size={32} className="skill-box-icon" />
                  <div>
                    <h2 className="cert-skill-title">{certData.skill_name}</h2>
                    <span className="cert-domain-tag">{certData.category} • {certData.domain}</span>
                  </div>
                </div>

                <div className="cert-meta-grid">
                  <div className="meta-cell">
                    <span className="meta-cell-label">Proficiency Level</span>
                    <span className="meta-cell-val font-bold text-indigo-600">{certData.proficiency_level}</span>
                  </div>
                  <div className="meta-cell">
                    <span className="meta-cell-label">Assessment Score</span>
                    <span className="meta-cell-val font-bold text-emerald-600">{certData.score}%</span>
                  </div>
                  <div className="meta-cell">
                    <span className="meta-cell-label">Date Issued</span>
                    <span className="meta-cell-val">{new Date(certData.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="meta-cell">
                    <span className="meta-cell-label">Expiration</span>
                    <span className="meta-cell-val">
                      {certData.expires_at ? new Date(certData.expires_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Lifetime Validity (No Expiry)'}
                    </span>
                  </div>
                </div>

                {certData.verification_status === 'REVOKED' && (
                  <div className="cert-revoked-notice">
                    <AlertTriangle size={18} />
                    <span>Revocation Note: {certData.revocation_reason || 'Certificate revoked by proctoring authority.'}</span>
                  </div>
                )}
              </div>

              <div className="cert-footer">
                <div className="cert-id-block">
                  <span className="cert-id-label">Cryptographic Registry ID</span>
                  <span className="cert-id-code">{certData.certificate_number}</span>
                </div>
                <div className="cert-seal-symbol">
                  <div className="seal-ring">
                    <span className="seal-text">VERIFIED CREDENTIAL</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="cert-bottom-actions">
              <Link to="/"><Button variant="outline"><ArrowLeft size={16} /> Home</Button></Link>
              <Button variant="primary" onClick={() => window.print()}><ExternalLink size={16} /> Print Official Transcript</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PublicCertificateVerify;
