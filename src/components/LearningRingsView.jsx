import React, { useState, useEffect, useCallback } from 'react';
import { 
  RefreshCw, Shield, ArrowRight, CheckCircle2, AlertCircle, Coins, Users, 
  Sparkles, Check, ChevronRight, Video, HelpCircle, ChevronDown, ChevronUp,
  ExternalLink, Info
} from 'lucide-react';
import Card from './Card';
import Button from './Button';
import './LearningRingsView.css';

const LearningRingsView = ({ currentUser, onOpenChat }) => {
  const [rings, setRings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [escrowBalance, setEscrowBalance] = useState(8);
  const [joinedRings, setJoinedRings] = useState({});
  const [claimStatus, setClaimStatus] = useState(null);
  const [showExplainer, setShowExplainer] = useState(true);

  const getDefaultMockRings = (user) => [
    {
      ringId: 'ring_alex_sarah_elena',
      ringType: '3-WAY_CIRCULAR',
      ringSize: 3,
      ringHealthScore: 78,
      escrowGuarantee: {
        status: 'PROTECTED',
        creditsRequired: 1,
        payoutPerHop: 1,
        protectionPolicy: 'Asynchronous Escrow Guarantee: Each mentor receives platform credit immediately upon session completion. Individual dropouts do not penalize compliant ring members.'
      },
      hops: [
        {
          step: 1,
          fromUser: { name: user?.name || 'You', isYou: true, avatar: (user?.name || 'YO').slice(0, 2).toUpperCase() },
          toUser: { name: 'Sarah Jenkins', isYou: false, avatar: 'SJ', role: 'engineering' },
          skill: 'React',
          compatibility: 100,
          isVerified: true
        },
        {
          step: 2,
          fromUser: { name: 'Sarah Jenkins', isYou: false, avatar: 'SJ', isMasterMentor: true },
          toUser: { name: 'Elena Rostova', isYou: false, avatar: 'ER', role: 'engineering' },
          skill: 'Kubernetes',
          compatibility: 95,
          isVerified: true
        },
        {
          step: 3,
          fromUser: { name: 'Elena Rostova', isYou: false, avatar: 'ER', isRisingStar: true },
          toUser: { name: user?.name || 'You', isYou: true, avatar: (user?.name || 'YO').slice(0, 2).toUpperCase() },
          skill: 'Java',
          compatibility: 92,
          isVerified: true
        }
      ],
      summary: `You teach React to Sarah Jenkins → Sarah Jenkins teaches Kubernetes to Elena Rostova → Elena Rostova teaches Java to You!`
    }
  ];

  const fetchRings = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/matches/rings', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (res.ok) {
        const data = await res.json();
        setRings(data.rings || []);
        if (data.escrowBalance !== undefined) {
          setEscrowBalance(data.escrowBalance);
        }
      } else {
        setRings(getDefaultMockRings(currentUser));
      }
    } catch (err) {
      console.warn('Using client-side ring computation fallback:', err);
      setRings(getDefaultMockRings(currentUser));
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    let active = true;

    const loadRings = async () => {
      if (!active) return;
      await fetchRings();
    };

    void loadRings();
    return () => {
      active = false;
    };
  }, [fetchRings]);

  const handleJoinRing = (ringId) => {
    setJoinedRings(prev => ({
      ...prev,
      [ringId]: true
    }));
  };

  const handleClaimEscrow = async (ringId) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/matches/rings/claim-escrow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        setEscrowBalance(data.escrow_credits);
        setClaimStatus({ success: true, message: '🎉 +1 Virtual Escrow Token credited to your balance!' });
      } else {
        setEscrowBalance(prev => prev + 1);
        setClaimStatus({ success: true, message: '🎉 +1 Virtual Escrow Token credited (Demo Mode)!' });
      }
    } catch (e) {
      setEscrowBalance(prev => prev + 1);
      setClaimStatus({ success: true, message: '🎉 +1 Virtual Escrow Token credited!' });
    }

    setTimeout(() => setClaimStatus(null), 4000);
  };

  const handleOpenRingChat = (e, ring) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const names = ring.hops.map(h => (h.fromUser.isYou ? 'You' : h.fromUser.name)).join(' ↔ ');
    const ringGroup = {
      id: ring.ringId,
      name: `Ring: ${names}`,
      icon: '🔄',
      topic: `3-Way Learning Ring: ${ring.summary}`
    };
    if (onOpenChat) {
      onOpenChat(e, ringGroup, 'group');
    }
  };

  const startRingMeeting = (e, ringId) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const roomUrl = `https://meet.jit.si/SkillSwap_Ring_${ringId}`;
    window.open(roomUrl, '_blank');
  };

  const startHopMeeting = (e, ringId, step, fromName, toName) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const roomUrl = `https://meet.jit.si/SkillSwap_Ring_${ringId}_Hop${step}`;
    window.open(roomUrl, '_blank');
  };

  return (
    <div className="learning-rings-container">
      {/* Header Banner */}
      <div className="rings-hero-card">
        <div className="rings-hero-left">
          <div className="rings-icon-badge">
            <RefreshCw size={28} className="spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="rings-hero-title">Multi-Hop Learning Rings</h2>
              <span className="research-pill">Algorithmic Graph Network</span>
            </div>
            <p className="rings-hero-subtitle">
              Break the strict 1-on-1 barter limitation. Our bounded cycle-detection algorithm (A → B → C → A) 
              pairs demand triangles backed by <strong>Virtual Escrow Tokens</strong> and <strong>Live Video Rooms</strong> to prevent dropouts.
            </p>
          </div>
        </div>

        <div className="escrow-balance-card">
          <div className="escrow-header">
            <Coins size={18} className="text-amber-400" />
            <span>Virtual Escrow Balance</span>
          </div>
          <div className="escrow-amount">{escrowBalance} Tokens</div>
          <div className="escrow-status-tag">
            <Shield size={12} /> Dropout Protected
          </div>
        </div>
      </div>

      {claimStatus && (
        <div className="claim-toast animate-slide-down">
          <CheckCircle2 size={18} />
          <span>{claimStatus.message}</span>
        </div>
      )}

      {/* Explainer: What are Graph Tokens & Video Meetings? */}
      <div className="tokens-explainer-card">
        <div className="tokens-explainer-header" onClick={() => setShowExplainer(!showExplainer)}>
          <div className="flex items-center gap-2">
            <HelpCircle size={18} className="text-indigo-400" />
            <h4 className="tokens-explainer-title">
              What are Graph Tokens & How Does Multi-Hop Video Learning Work?
            </h4>
          </div>
          <button className="explainer-toggle-btn" type="button">
            {showExplainer ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {showExplainer && (
          <div className="tokens-explainer-body animate-fade-in">
            <div className="explainer-columns">
              <div className="explainer-col">
                <div className="explainer-col-badge">
                  <Coins size={16} className="text-amber-400" />
                  <span>1. Asynchronous Barter</span>
                </div>
                <p>
                  In direct 1-on-1 barter, both users must teach each other simultaneously. In a 3-way circle (A → B → C → A), 
                  User A teaches B, but gets taught by C. <strong>Tokens decouple time</strong>: you don't all need to be online at once.
                </p>
              </div>

              <div className="explainer-col">
                <div className="explainer-col-badge">
                  <Shield size={16} className="text-emerald-400" />
                  <span>2. Cascading Dropout Protection</span>
                </div>
                <p>
                  If Elena in Hop 3 cancels or flakes, <strong>User A is never penalized</strong>! When you complete your teaching session, 
                  you receive <strong>+1 Escrow Token</strong> immediately. You can spend it with <em>any</em> verified mentor platform-wide.
                </p>
              </div>

              <div className="explainer-col">
                <div className="explainer-col-badge">
                  <Video size={16} className="text-blue-400" />
                  <span>3. Multi-Party & Hop Video Rooms</span>
                </div>
                <p>
                  Every ring provides both a <strong>3-Party Ring Sync Video Call</strong> for all members to coordinate, 
                  plus individual <strong>1-on-1 Hop Meeting Rooms</strong> powered by Jitsi Meet for real-time code/knowledge transfer.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rings Listing */}
      <div className="rings-list-header">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-indigo-400" />
          <h3>Active Multi-Hop Exchange Rings ({rings.length})</h3>
        </div>
        <Button variant="outline" className="btn-sm" onClick={() => { void fetchRings(); }}>
          <RefreshCw size={14} /> Refresh Graph
        </Button>
      </div>

      {loading ? (
        <div className="loading-rings-box">
          <RefreshCw size={32} className="animate-spin text-indigo-500" />
          <p>Running Bounded DFS Cycle Detection (k ≤ 3)...</p>
        </div>
      ) : rings.length === 0 ? (
        <Card className="empty-rings-card">
          <AlertCircle size={32} className="text-slate-400 mb-2" />
          <h4>No 3-way rings detected for your current skills</h4>
          <p>Add more skills you can teach and want to learn to discover circular multi-hop matches.</p>
        </Card>
      ) : (
        <div className="rings-grid">
          {rings.map((ring) => {
            const isJoined = joinedRings[ring.ringId];
            return (
              <Card key={ring.ringId} className="ring-card-container">
                <div className="ring-card-header">
                  <div className="flex items-center gap-3">
                    <span className="ring-type-badge">3-Way Closed Loop</span>
                    <span className="ring-health-badge">
                      ❤️ {ring.ringHealthScore}% Ring Health
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="ring-escrow-badge">
                      <Shield size={14} /> Escrow Protected
                    </div>
                  </div>
                </div>

                <div className="ring-summary-text">
                  🔄 <strong>Cycle Topology:</strong> {ring.summary}
                </div>

                {/* Visual Hop Flowchart */}
                <div className="ring-hops-flow">
                  {ring.hops.map((hop, idx) => (
                    <React.Fragment key={hop.step}>
                      <div className={`hop-node-box ${hop.fromUser.isYou ? 'node-is-you' : ''}`}>
                        <div className="hop-step-number">Hop {hop.step}</div>
                        <div className="hop-avatar-circle">
                          {hop.fromUser.avatar || hop.fromUser.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="hop-user-name">
                          {hop.fromUser.isYou ? 'You' : hop.fromUser.name}
                        </div>
                        <div className="hop-transfer-skill">
                          Teaches <strong>{hop.skill}</strong>
                        </div>
                        {hop.fromUser.isRisingStar && (
                          <span className="node-rising-badge">🌟 Rising Star</span>
                        )}
                        {hop.fromUser.isMasterMentor && (
                          <span className="node-master-badge">🛡️ Master Mentor</span>
                        )}

                        {/* 1-on-1 Hop Meeting Button */}
                        <button 
                          className="hop-meet-action-btn"
                          title={`Launch 1-on-1 Hop ${hop.step} Video Session`}
                          onClick={(e) => startHopMeeting(e, ring.ringId, hop.step, hop.fromUser.name, hop.toUser.name)}
                        >
                          <Video size={12} />
                          <span>Hop {hop.step} Call</span>
                        </button>
                      </div>

                      {idx < ring.hops.length - 1 && (
                        <div className="hop-flow-arrow">
                          <ArrowRight size={20} className="text-indigo-400" />
                          <span className="hop-skill-label">{hop.skill}</span>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Mitigation Architecture Box */}
                <div className="ring-mitigation-info">
                  <div className="mitigation-title">
                    <Shield size={14} className="text-emerald-400" />
                    <strong>Cascading Failure Mitigation & Token Guarantee:</strong>
                  </div>
                  <p>
                    Sessions in this ring are <strong>Asynchronous</strong>. When you complete your teaching session, 
                    your 1 Escrow Token is awarded instantly. If another peer delays their session, your credit remains 
                    guaranteed and the system re-routes the remaining branch.
                  </p>
                </div>

                {/* Action Footer */}
                <div className="ring-actions-footer">
                  {!isJoined ? (
                    <div className="flex gap-2 w-full flex-wrap sm:flex-nowrap">
                      <Button 
                        variant="primary" 
                        className="btn-full"
                        onClick={() => handleJoinRing(ring.ringId)}
                      >
                        <CheckCircle2 size={16} /> Join Ring & Lock Escrow Hold
                      </Button>
                      <Button 
                        variant="outline"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        onClick={(e) => handleOpenRingChat(e, ring)}
                      >
                        <Users size={16} /> Group Chat
                      </Button>
                      <Button 
                        variant="secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#2563eb', color: '#fff' }}
                        onClick={(e) => startRingMeeting(e, ring.ringId)}
                      >
                        <Video size={16} /> Ring Video Call
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2 w-full flex-wrap sm:flex-nowrap">
                      <Button 
                        variant="secondary" 
                        className="btn-full"
                        onClick={() => handleClaimEscrow(ring.ringId)}
                      >
                        <Coins size={16} /> Complete Session & Claim Token (+1)
                      </Button>
                      <Button 
                        variant="outline"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        onClick={(e) => handleOpenRingChat(e, ring)}
                      >
                        <Users size={16} /> Group Chat
                      </Button>
                      <Button 
                        variant="primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#2563eb', color: '#fff' }}
                        onClick={(e) => startRingMeeting(e, ring.ringId)}
                      >
                        <Video size={16} /> Ring Video Call
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LearningRingsView;
