import sequelize from './server/src/config/database.js';
import { User, Profile, Skill } from './server/src/models/index.js';
import { calculateMatch } from './server/src/matching/engine.js';

async function testMatches() {
  const currentUser = await User.findOne({
    where: { name: 'Alex Chen' },
    include: [
      { model: Profile, as: 'profile' },
      { model: Skill, as: 'teachingSkills' },
      { model: Skill, as: 'wantedSkills' }
    ]
  });

  if (!currentUser) {
    console.log("Alex Chen not found!");
    process.exit(1);
  }

  const otherUsers = await User.findAll({
    where: { is_active: true },
    include: [
      { model: Profile, as: 'profile' },
      { model: Skill, as: 'teachingSkills' },
      { model: Skill, as: 'wantedSkills' }
    ]
  });

  console.log(`Found ${otherUsers.length} total users.`);
  
  const matches = [];
  for (const otherUser of otherUsers) {
    if (otherUser.id === currentUser.id) continue;
    const matchResult = await calculateMatch(currentUser, otherUser);
    matches.push({
      user: otherUser.name,
      matchScore: matchResult.matchPercentage,
      bestAOfferSkill: matchResult.bestAOfferSkill,
      bestAWantSkill: matchResult.bestAWantSkill
    });
  }

  matches.sort((a, b) => b.matchScore - a.matchScore);
  console.log("Matches:", matches);
  process.exit(0);
}
testMatches();
