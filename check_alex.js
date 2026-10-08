import sequelize from './server/src/config/database.js';
import { User, Skill, UserSkill, UserWantedSkill } from './server/src/models/index.js';

async function check() {
  const users = await User.findAll({ include: [
    { model: Skill, as: 'teachingSkills' },
    { model: Skill, as: 'wantedSkills' }
  ]});
  
  for (const u of users) {
    if (u.name && u.name.includes('Alex')) {
      console.log(`Found Alex! ID: ${u.id}, Email: ${u.email}`);
      console.log('Teaching Skills:', u.teachingSkills.map(s => s.canonical_name));
      console.log('Wanted Skills:', u.wantedSkills.map(s => s.canonical_name));
    }
  }
  process.exit(0);
}
check();
