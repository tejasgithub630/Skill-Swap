import { User, Profile, Skill } from './server/src/models/index.js';
import { calculateMatch, findMultiHopRings, calculatePlatformMetrics } from './server/src/matching/engine.js';

async function runTest() {
  const alex = await User.findOne({
    where: { name: 'Alex Chen' },
    include: ['profile', 'teachingSkills', 'wantedSkills']
  });
  const allUsers = await User.findAll({
    include: ['profile', 'teachingSkills', 'wantedSkills']
  });

  console.log('--- DIRECT MATCHES FOR ALEX ---');
  for (const u of allUsers) {
    if (u.id === alex.id) continue;
    const match = await calculateMatch(alex, u);
    console.log(u.name, '-> Match %:', match.matchPercentage, '| Rising Star:', match.isRisingStar, '| Master Mentor:', match.isMasterMentor);
    console.log('   Exp Score:', match.rawScores.experienceScore.toFixed(2), '| Trust Score:', match.rawScores.trustScore.toFixed(2), '| Cold Boost:', match.rawScores.coldStartBoost.toFixed(2));
    console.log('   Explanation:', match.explanation);
  }

  console.log('\n--- MULTI-HOP RINGS FOR ALEX ---');
  const rings = await findMultiHopRings(alex, allUsers);
  console.log('Discovered Rings Count:', rings.length);
  rings.forEach((r, idx) => {
    console.log(`Ring ${idx + 1}:`, r.summary);
    console.log('   Health Score:', r.ringHealthScore + '%', '| Escrow Status:', r.escrowGuarantee.status);
    console.log('   Hops Detail:', JSON.stringify(r.hops.map(h => ({ from: h.fromUser.name, to: h.toUser.name, skill: h.skill, comp: h.compatibility }))));
  });

  console.log('\n--- ACADEMIC PLATFORM METRICS ---');
  console.log(JSON.stringify(calculatePlatformMetrics(allUsers), null, 2));

  process.exit(0);
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
