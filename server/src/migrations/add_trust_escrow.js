import sequelize from '../config/database.js';
import { User, Profile, Skill, UserSkill, Assessment, Certification } from '../models/index.js';
import crypto from 'crypto';

async function migrateAndSeedEnhancedData() {
  console.log('Running database migration for Trust, Experience, Cold-Start & Escrow...');

  const queryInterface = sequelize.getQueryInterface();
  const tableDesc = await queryInterface.describeTable('profiles');

  const addColumnIfNotExists = async (colName, colDef) => {
    if (!tableDesc[colName]) {
      console.log(`Adding column '${colName}' to profiles table...`);
      await queryInterface.addColumn('profiles', colName, colDef);
    } else {
      console.log(`Column '${colName}' already exists.`);
    }
  };

  await addColumnIfNotExists('sessions_conducted', {
    type: sequelize.Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false
  });

  await addColumnIfNotExists('rating_avg', {
    type: sequelize.Sequelize.FLOAT,
    defaultValue: 5.0,
    allowNull: false
  });

  await addColumnIfNotExists('rating_count', {
    type: sequelize.Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false
  });

  await addColumnIfNotExists('reliability_score', {
    type: sequelize.Sequelize.FLOAT,
    defaultValue: 1.0,
    allowNull: false
  });

  await addColumnIfNotExists('escrow_credits', {
    type: sequelize.Sequelize.INTEGER,
    defaultValue: 5,
    allowNull: false
  });

  console.log('Columns ensured. Now updating user profiles and skills for multi-hop rings...');

  // 1. Alex Chen - Master Mentor
  const alex = await User.findOne({ where: { name: 'Alex Chen' }, include: ['profile'] });
  if (alex && alex.profile) {
    await alex.profile.update({
      sessions_conducted: 18,
      rating_avg: 4.92,
      rating_count: 24,
      reliability_score: 0.98,
      escrow_credits: 8
    });
    console.log('Updated Alex Chen (Master Mentor).');
  }

  // 2. Sarah Jenkins - Experienced Mentor
  const sarah = await User.findOne({ where: { name: 'Sarah Jenkins' }, include: ['profile'] });
  if (sarah && sarah.profile) {
    await sarah.profile.update({
      sessions_conducted: 11,
      rating_avg: 4.85,
      rating_count: 14,
      reliability_score: 0.95,
      escrow_credits: 6
    });
    console.log('Updated Sarah Jenkins (Experienced Mentor).');
  }

  // 3. Elena Rostova - Cold-Start "Rising Star" Rookie
  const elena = await User.findOne({ where: { name: 'Elena Rostova' }, include: ['profile'] });
  if (elena && elena.profile) {
    await elena.profile.update({
      sessions_conducted: 1, // Rookie: < 5 sessions -> triggers Cold-Start boost
      rating_avg: 5.0,
      rating_count: 1,
      reliability_score: 1.0,
      escrow_credits: 5
    });
    console.log('Updated Elena Rostova (Rising Star Rookie).');
  }

  // Skills
  const javaSkill = await Skill.findOne({ where: { canonical_name: 'Java' } });
  const k8sSkill = await Skill.findOne({ where: { canonical_name: 'Kubernetes' } });
  const reactSkill = await Skill.findOne({ where: { canonical_name: 'React' } });
  const dockerSkill = await Skill.findOne({ where: { canonical_name: 'Docker' } });

  // Clean Elena skills and set:
  // Elena teaches Java (Certified, score 92) and wants Kubernetes!
  if (elena && javaSkill && k8sSkill) {
    await UserSkill.destroy({ where: { user_id: elena.id } });

    // Give Elena a certified assessment & certification for Java
    const javaAssessment = await Assessment.findOne({ where: { skill_id: javaSkill.id } });
    let certId = null;
    if (javaAssessment) {
      const cert = await Certification.create({
        user_id: elena.id,
        skill_id: javaSkill.id,
        assessment_id: javaAssessment.id,
        score: 92,
        proficiency_level: 'ADVANCED',
        certificate_number: 'SKILLSWAP-JAVA-2026-300401',
        verification_token: crypto.randomUUID(),
        issued_at: new Date(),
        expires_at: new Date(Date.now() + 365*24*3600*1000*2),
        verification_status: 'VERIFIED'
      });
      certId = cert.id;
    }

    await UserSkill.create({
      user_id: elena.id,
      skill_id: javaSkill.id,
      proficiency_level: 'ADVANCED',
      verification_status: 'VERIFIED',
      certification_id: certId,
      score: 92,
      is_teaching: true,
      is_wanting: false,
      years_experience: 1
    });

    await UserSkill.create({
      user_id: elena.id,
      skill_id: k8sSkill.id,
      proficiency_level: 'BEGINNER',
      verification_status: 'SELF_DECLARED',
      is_teaching: false,
      is_wanting: true,
      years_experience: 0
    });
    console.log('Set Elena Rostova: Teaches Java (Verified 92%), Wants Kubernetes.');
  }

  // Medical Peers Trust & Experience Setup
  const emily = await User.findOne({ where: { name: 'Dr. Emily Rose' }, include: ['profile'] });
  if (emily && emily.profile) {
    await emily.profile.update({
      sessions_conducted: 15,
      rating_avg: 4.95,
      rating_count: 20,
      reliability_score: 0.99,
      escrow_credits: 7
    });
  }

  const james = await User.findOne({ where: { name: 'James Wilson' }, include: ['profile'] });
  if (james && james.profile) {
    await james.profile.update({
      sessions_conducted: 2, // Rising star in medical
      rating_avg: 4.80,
      rating_count: 3,
      reliability_score: 1.0,
      escrow_credits: 5
    });
  }

  console.log('Enhanced data migration and ring topology setup complete!');
  process.exit(0);
}

migrateAndSeedEnhancedData().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
