import { Skill, Assessment, AssessmentQuestion, SkillAlias } from '../models/index.js';
import sequelize from '../config/database.js';
import { getQuestionsForTopic } from '../../../src/data/questionBank.js';

// All standard platform skills across Engineering and Medical disciplines
const ALL_ENGINEERING_SKILLS = [
  "React", "JavaScript", "Node.js", "Python", "Java", "TypeScript", "Docker", "Kubernetes", 
  "AWS", "GraphQL", "System Design", "SQL", "MongoDB", "C++", "Go", "Rust", "Swift", "Flutter",
  "Tailwind CSS", "Redux", "Next.js", "Express", "PostgreSQL", "Firebase", "Algorithms", "Data Structures"
];

const ALL_MEDICAL_SKILLS = [
  "Anatomy", "Pharmacology", "Pathology", "Clinical Examination", "Radiology", "Emergency Medicine",
  "Internal Medicine", "Surgery", "Pediatrics", "Obstetrics", "Gynecology", "Psychiatry", "Dermatology",
  "Ophthalmology", "ENT", "Orthopedics", "Cardiology", "Neurology", "Endocrinology", "Gastroenterology",
  "Hematology", "Immunology", "Microbiology", "Biochemistry", "Physiology", "Forensic Medicine"
];

export const seedComprehensiveQuestions = async () => {
  console.log('🔄 Starting Comprehensive Assessment Question & 80% Cutoff Migration for ALL Platform Skills...');

  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');

  try {
    // 1. Ensure all engineering skills exist
    for (const name of ALL_ENGINEERING_SKILLS) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const normalized_name = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      let skill = await Skill.findOne({ where: { canonical_name: name } });
      if (!skill) {
        skill = await Skill.create({
          canonical_name: name,
          slug,
          normalized_name,
          domain: 'ENGINEERING',
          category: 'Software Engineering',
          description: `Industry-standard core competencies and practical architecture in ${name}.`,
          status: 'ACTIVE'
        });
      }
    }

    // 2. Ensure all medical skills exist
    for (const name of ALL_MEDICAL_SKILLS) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const normalized_name = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      let skill = await Skill.findOne({ where: { canonical_name: name } });
      if (!skill) {
        skill = await Skill.create({
          canonical_name: name,
          slug,
          normalized_name,
          domain: 'MEDICAL',
          category: 'Clinical Medicine',
          description: `Clinical competencies, diagnostics, and patient management protocols in ${name}.`,
          status: 'ACTIVE'
        });
      }
    }

    // 3. Fetch all skills in DB
    const skills = await Skill.findAll({
      include: [{ model: Assessment, as: 'assessment' }]
    });

    console.log(`Found ${skills.length} total platform skills. Generating authentic assessments with 80% cutoff...`);

    let totalQuestionsInserted = 0;

    for (const skill of skills) {
      let assessment = skill.assessment;
      if (!assessment) {
        assessment = await Assessment.create({
          skill_id: skill.id,
          title: `${skill.canonical_name} Official Certification Assessment`,
          description: `Comprehensive evaluation of core theory, practical implementation, and clinical/engineering scenarios in ${skill.canonical_name}.`,
          domain: skill.domain,
          passing_percentage: 80,
          duration_minutes: 25,
          max_attempts: 3,
          cooldown_hours: 24,
          validity_months: 24,
          status: 'ACTIVE'
        });
      } else {
        assessment.passing_percentage = 80;
        await assessment.save();
      }

      // Get authentic, course-specific questions (NO MIXING!)
      const bankQuestions = getQuestionsForTopic(skill.canonical_name, skill.domain ? skill.domain.toLowerCase() : 'engineering');
      
      // Clear old questions
      await AssessmentQuestion.destroy({
        where: { assessment_id: assessment.id }
      });

      // Difficulty mapper
      const mapDifficulty = (level) => {
        const l = (level || '').toLowerCase();
        if (l === 'easy' || l === 'beginner') return 'BEGINNER';
        if (l === 'hard' || l === 'advanced') return 'ADVANCED';
        return 'INTERMEDIATE';
      };

      // Bulk insert new questions
      const questionRecords = bankQuestions.map(q => ({
        assessment_id: assessment.id,
        skill_id: skill.id,
        question_type: q.type || 'MCQ',
        question_text: q.q || q.question_text,
        difficulty: mapDifficulty(q.level || q.difficulty),
        options: JSON.stringify(q.options),
        correct_answer: q.a || q.correct_answer,
        explanation: q.explanation || `Verification of core competence in ${skill.canonical_name}.`,
        marks: q.marks || 1
      }));

      await AssessmentQuestion.bulkCreate(questionRecords);
      totalQuestionsInserted += questionRecords.length;

      console.log(`  ✓ [${skill.domain}] ${skill.canonical_name.padEnd(24)}: ${questionRecords.length} questions (Passing Cutoff: 80%)`);
    }

    console.log(`\n🎉 Success! Seeded ${totalQuestionsInserted} total authentic questions across all ${skills.length} skills with strictly 80% cut-off score.`);
  } finally {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  }
};

// Execute if run directly
seedComprehensiveQuestions()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
