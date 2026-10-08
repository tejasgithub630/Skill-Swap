import express from 'express';
import { User, Profile, Skill, Match } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { calculateMatch, findMultiHopRings, calculatePlatformMetrics } from '../matching/engine.js';

const router = express.Router();

// 1. Direct Matches (with Trust, Experience, and Cold-Start)
router.get('/', authenticate, async (req, res) => {
  try {
    const urgency = req.query.urgency === 'urgent' ? 'urgent' : 'standard';

    const currentUser = await User.findByPk(req.user.id, {
      include: [
        { model: Profile, as: 'profile' },
        { model: Skill, as: 'teachingSkills' },
        { model: Skill, as: 'wantedSkills' }
      ]
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch all active candidate peers
    const otherUsers = await User.findAll({
      where: { is_active: true },
      include: [
        { model: Profile, as: 'profile' },
        { model: Skill, as: 'teachingSkills' },
        { model: Skill, as: 'wantedSkills' }
      ]
    });

    const matches = [];

    for (const otherUser of otherUsers) {
      if (otherUser.id === currentUser.id) continue;

      const matchResult = await calculateMatch(currentUser, otherUser, { urgency });

      if (matchResult.matchPercentage >= 0) {
        matches.push({
          id: otherUser.id,
          user: otherUser.name,
          avatar: otherUser.name.slice(0, 2).toUpperCase(),
          role: otherUser.role,
          bio: otherUser.profile?.bio || `Verified peer exchange member.`,
          matchScore: matchResult.matchPercentage,
          mySkill: matchResult.bestAOfferSkill || matchResult.bestBWantSkill || 'General',
          wantSkill: matchResult.bestBOfferSkill || matchResult.bestAWantSkill || 'General',
          explanation: matchResult.explanation || 'Potential connection',
          isRisingStar: matchResult.isRisingStar,
          isMasterMentor: matchResult.isMasterMentor,
          reliabilityScore: Math.round(matchResult.reliabilityScore * 100),
          sessionsCompleted: matchResult.sessionsCompleted,
          isAOfferVerified: matchResult.isAOfferVerified,
          isBOfferVerified: matchResult.isBOfferVerified,
          rawScores: matchResult.rawScores,
          weights: matchResult.weights,
          urgencyMode: urgency
        });
      }
    }

    matches.sort((a, b) => b.matchScore - a.matchScore);

    res.json(matches);
  } catch (error) {
    console.error('Failed to generate direct matches:', error);
    res.status(500).json({ error: 'Failed to generate matches' });
  }
});

// 2. Multi-Hop "Learning Rings" Discovery (k=3 Cycle Detection)
router.get('/rings', authenticate, async (req, res) => {
  try {
    const urgency = req.query.urgency === 'urgent' ? 'urgent' : 'standard';

    const currentUser = await User.findByPk(req.user.id, {
      include: [
        { model: Profile, as: 'profile' },
        { model: Skill, as: 'teachingSkills' },
        { model: Skill, as: 'wantedSkills' }
      ]
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const allUsers = await User.findAll({
      where: { is_active: true },
      include: [
        { model: Profile, as: 'profile' },
        { model: Skill, as: 'teachingSkills' },
        { model: Skill, as: 'wantedSkills' }
      ]
    });

    const rings = await findMultiHopRings(currentUser, allUsers, { urgency });

    res.json({
      totalRingsFound: rings.length,
      escrowBalance: currentUser.profile?.escrow_credits || 5,
      rings
    });
  } catch (error) {
    console.error('Failed to discover multi-hop rings:', error);
    res.status(500).json({ error: 'Failed to discover multi-hop learning rings' });
  }
});

// 3. Academic Research Platform Metrics (Gini Fairness & Escrow Simulation)
router.get('/metrics', async (req, res) => {
  try {
    const allUsers = await User.findAll({
      where: { is_active: true },
      include: [
        { model: Profile, as: 'profile' },
        { model: Skill, as: 'teachingSkills' },
        { model: Skill, as: 'wantedSkills' }
      ]
    });

    const metrics = calculatePlatformMetrics(allUsers);
    res.json(metrics);
  } catch (error) {
    console.error('Failed to calculate platform metrics:', error);
    res.status(500).json({ error: 'Failed to calculate academic metrics' });
  }
});

// 4. Claim / Release Virtual Escrow Token for a Completed Hop
router.post('/rings/claim-escrow', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Profile, as: 'profile' }]
    });

    if (!user || !user.profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const newCredits = (user.profile.escrow_credits || 5) + 1;
    const newSessions = (user.profile.sessions_conducted || 0) + 1;

    await user.profile.update({
      escrow_credits: newCredits,
      sessions_conducted: newSessions
    });

    res.json({
      success: true,
      message: 'Escrow token credited successfully upon session completion!',
      escrow_credits: newCredits,
      sessions_conducted: newSessions
    });
  } catch (error) {
    console.error('Failed to claim escrow token:', error);
    res.status(500).json({ error: 'Failed to claim escrow token' });
  }
});

export default router;
