import React, { useState } from 'react';
import { X, CheckCircle, RotateCw, Award, ArrowRight, ArrowLeft } from 'lucide-react';
import Button from './Button';

const FLASHCARDS = [
  {
    id: 1,
    question: 'Which nerve and artery wrap around the surgical neck of the humerus and are at highest risk during fractures?',
    answer: 'Axillary Nerve & Posterior Circumflex Humeral Artery',
    pearl: 'Clinical manifestation: Deltoid paralysis with loss of shoulder abduction beyond 15 degrees and cutaneous numbness over the lateral shoulder badge area.'
  },
  {
    id: 2,
    question: 'What are the anatomical boundaries of the Femoral Triangle, and what is the lateral-to-medial order of its contents?',
    answer: 'Boundaries: Inguinal Ligament (superior), Sartorius (lateral), Adductor Longus (medial). Contents: NAVeL (Nerve, Artery, Vein, Empty space, Lymphatics).',
    pearl: 'Femoral canal lies medial to the femoral vein, representing the site of femoral hernias (which are prone to incarceration/strangulation in females).'
  },
  {
    id: 3,
    question: 'Which three cranial nerves exit the skull base via the Jugular Foramen?',
    answer: 'CN IX (Glossopharyngeal), CN X (Vagus), and CN XI (Accessory Nerve)',
    pearl: 'Jugular Foramen (Vernet) syndrome results in dysphagia, loss of gag reflex, hoarseness, and weakness of the trapezius and sternocleidomastoid.'
  },
  {
    id: 4,
    question: 'What nerve roots form the Phrenic Nerve, and what is its anatomical relationship to the anterior scalene muscle?',
    answer: 'C3, C4, C5 ("keep the diaphragm alive"). Travels from lateral to medial on the ANTERIOR surface of the anterior scalene muscle.',
    pearl: 'Ipsilateral phrenic nerve injury causes paradoxical elevation of the paralyzed hemidiaphragm during inspiration on fluoroscopy (sniff test).'
  },
  {
    id: 5,
    question: 'In a right-dominant coronary circulation, which vessel supplies the Atrioventricular (AV) node and the posterior 1/3 of the interventricular septum?',
    answer: 'Posterior Descending Artery (PDA), arising from the Right Coronary Artery (RCA)',
    pearl: 'Inferior myocardial infarction (leads II, III, aVF) is therefore frequently complicated by AV nodal conduction blocks and sinus bradycardia.'
  }
];

const AnatomyFlashcardModal = ({ isOpen, onClose, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completedCards, setCompletedCards] = useState([]);
  const [isFinished, setIsFinished] = useState(false);

  if (!isOpen) return null;

  const currentCard = FLASHCARDS[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    if (!completedCards.includes(currentCard.id)) {
      setCompletedCards([...completedCards, currentCard.id]);
    }
    if (currentIndex < FLASHCARDS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleClaimReward = () => {
    onComplete();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1300 }}>
      <div className="modal-content" style={{ maxWidth: '640px', width: '92%' }}>
        <header className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0 }}>🧠 Daily Anatomy Quiz: 5 Clinical Flashcards</h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0' }}>
              Test your recall on high-yield surgical and clinical anatomy landmarks.
            </p>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={24} /></button>
        </header>

        <div className="modal-body" style={{ padding: '1.25rem 0 0' }}>
          {!isFinished ? (
            <>
              {/* Progress Tracker */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>Card {currentIndex + 1} of {FLASHCARDS.length}</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>{Math.round(((currentIndex) / FLASHCARDS.length) * 100)}% Complete</span>
              </div>

              {/* Progress bar */}
              <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', marginBottom: '1.5rem', overflow: 'hidden' }}>
                <div style={{ width: `${((currentIndex + 1) / FLASHCARDS.length) * 100}%`, height: '100%', background: '#10b981', transition: 'width 0.3s' }}></div>
              </div>

              {/* 3D Flashcard Box */}
              <div 
                onClick={() => setIsFlipped(!isFlipped)}
                style={{
                  minHeight: '220px',
                  background: isFlipped ? '#f0fdf4' : '#ffffff',
                  border: '2px solid',
                  borderColor: isFlipped ? '#86efac' : '#cbd5e1',
                  borderRadius: '12px',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.25s ease',
                  position: 'relative',
                  marginBottom: '1.5rem'
                }}
              >
                <span style={{ position: 'absolute', top: '12px', left: '16px', fontSize: '0.75rem', fontWeight: 700, color: isFlipped ? '#15803d' : '#64748b' }}>
                  {isFlipped ? 'REVEALED ANSWER:' : 'CLINICAL QUESTION:'}
                </span>

                <span style={{ position: 'absolute', top: '12px', right: '16px', fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <RotateCw size={12} /> Click to flip
                </span>

                {!isFlipped ? (
                  <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', margin: '1rem 0 0', lineHeight: 1.5 }}>
                    {currentCard.question}
                  </p>
                ) : (
                  <div>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803d', margin: '0.5rem 0' }}>
                      {currentCard.answer}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: '#166534', margin: '8px 0 0', lineHeight: 1.4 }}>
                      💡 <b>Clinical Pearl:</b> {currentCard.pearl}
                    </p>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button 
                  variant="outline" 
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                >
                  <ArrowLeft size={16} /> Previous
                </Button>

                <Button 
                  variant="primary" 
                  onClick={handleNext}
                >
                  {currentIndex === FLASHCARDS.length - 1 ? 'Finish Quiz' : 'Next Card'} <ArrowRight size={16} />
                </Button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <Award size={64} color="#10b981" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Daily Anatomy Quiz Completed! 🎉</h3>
              <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '1.5rem' }}>
                Great work! You have successfully reviewed all 5 high-yield clinical anatomy flashcards. Your daily streak has been updated.
              </p>
              <Button variant="primary" style={{ padding: '10px 24px' }} onClick={handleClaimReward}>
                <CheckCircle size={18} style={{ marginRight: '6px' }} /> Claim Daily Task Completion (+3% Boost)
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnatomyFlashcardModal;
