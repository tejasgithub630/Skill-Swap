import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// ======================== USER & PROFILE ========================
export const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'engineering' }, // 'engineering' | 'medical' | 'admin'
  is_admin: { type: DataTypes.BOOLEAN, defaultValue: false },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  name_changes_count: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export const Profile = sequelize.define('Profile', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  bio: { type: DataTypes.TEXT },
  phone: { type: DataTypes.STRING },
  location: { type: DataTypes.STRING },
  education: { type: DataTypes.STRING },
  experience_years: { type: DataTypes.INTEGER, defaultValue: 0 },
  career_goal: { type: DataTypes.STRING },
  availability: { type: DataTypes.STRING },
  profile_picture: { type: DataTypes.STRING },
  interests: { type: DataTypes.TEXT }, // JSON string array of interest strings
  sessions_conducted: { type: DataTypes.INTEGER, defaultValue: 0 },
  rating_avg: { type: DataTypes.FLOAT, defaultValue: 5.0 },
  rating_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  reliability_score: { type: DataTypes.FLOAT, defaultValue: 1.0 },
  escrow_credits: { type: DataTypes.INTEGER, defaultValue: 5 }
}, {
  tableName: 'profiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export const Domain = sequelize.define('Domain', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.TEXT }
}, {
  tableName: 'domains',
  timestamps: false
});

// ======================== CANONICAL SKILL TAXONOMY ========================
export const Skill = sequelize.define('Skill', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  canonical_name: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: { 
    type: DataTypes.STRING, 
    allowNull: true,
    get() {
      return this.getDataValue('canonical_name') || this.getDataValue('name');
    }
  },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.TEXT },
  category: { type: DataTypes.STRING, defaultValue: 'General' }, // 'Programming Language', 'Framework', 'Clinical Speciality', etc.
  domain: { type: DataTypes.STRING, defaultValue: 'ENGINEERING' }, // 'ENGINEERING' | 'MEDICAL' | 'BOTH'
  normalized_name: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'ACTIVE' }, // 'ACTIVE' | 'UNDER_REVIEW' | 'DEPRECATED'
  difficulty_levels: { type: DataTypes.TEXT }, // JSON array e.g. ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]
  parent_skill_id: { type: DataTypes.UUID, allowNull: true },
  domain_id: { type: DataTypes.UUID, allowNull: true },
  created_by: { type: DataTypes.UUID, allowNull: true }
}, {
  tableName: 'skills',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export const SkillAlias = sequelize.define('SkillAlias', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  skill_id: { type: DataTypes.UUID, allowNull: false },
  alias: { type: DataTypes.STRING, allowNull: false },
  normalized_alias: { type: DataTypes.STRING, allowNull: false }
}, {
  tableName: 'skill_aliases',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { unique: true, fields: ['normalized_alias'] }
  ]
});

export const SkillRequest = sequelize.define('SkillRequest', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false },
  requested_name: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, defaultValue: 'General' },
  domain: { type: DataTypes.STRING, allowNull: false, defaultValue: 'ENGINEERING' },
  description: { type: DataTypes.TEXT, allowNull: false },
  justification: { type: DataTypes.TEXT },
  reference_url: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: 'REQUESTED' }, // 'REQUESTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'
  admin_feedback: { type: DataTypes.TEXT },
  reviewed_by: { type: DataTypes.UUID, allowNull: true },
  reviewed_at: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'skill_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export const SkillRelationship = sequelize.define('SkillRelationship', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  skill_id: { type: DataTypes.UUID, allowNull: false },
  related_skill_id: { type: DataTypes.UUID, allowNull: false },
  relationship_type: { type: DataTypes.STRING, allowNull: false }, // PARENT, CHILD, RELATED, SPECIALIZATION, COMPLEMENTARY
  relationship_strength: { type: DataTypes.FLOAT, defaultValue: 1.0 } // 0.0 - 1.0
}, {
  tableName: 'skill_relationships',
  timestamps: false
});

// ======================== ASSESSMENTS & QUESTIONS ========================
export const Assessment = sequelize.define('Assessment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  skill_id: { type: DataTypes.UUID, allowNull: false, unique: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  domain: { type: DataTypes.STRING, defaultValue: 'ENGINEERING' },
  passing_percentage: { type: DataTypes.INTEGER, defaultValue: 80 },
  duration_minutes: { type: DataTypes.INTEGER, defaultValue: 30 },
  max_attempts: { type: DataTypes.INTEGER, defaultValue: 3 },
  cooldown_hours: { type: DataTypes.INTEGER, defaultValue: 24 },
  validity_months: { type: DataTypes.INTEGER, allowNull: true }, // null means no expiration
  status: { type: DataTypes.STRING, defaultValue: 'ACTIVE' } // 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
}, {
  tableName: 'assessments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export const AssessmentQuestion = sequelize.define('AssessmentQuestion', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  assessment_id: { type: DataTypes.UUID, allowNull: false },
  skill_id: { type: DataTypes.UUID, allowNull: true },
  question_type: { type: DataTypes.STRING, defaultValue: 'MCQ' }, // 'MCQ' | 'CODING' | 'SCENARIO'
  question_text: { type: DataTypes.TEXT, allowNull: false },
  difficulty: { type: DataTypes.STRING, defaultValue: 'INTERMEDIATE' }, // 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  options: { type: DataTypes.TEXT, allowNull: false }, // JSON array of options e.g. ["Option A", "Option B", ...]
  correct_answer: { type: DataTypes.TEXT, allowNull: false }, // SECRET: Never exposed to frontend!
  explanation: { type: DataTypes.TEXT },
  marks: { type: DataTypes.INTEGER, defaultValue: 1 },
  starter_code: { type: DataTypes.TEXT, allowNull: true },
  test_cases: { type: DataTypes.TEXT, allowNull: true } // JSON array of test cases for coding questions
}, {
  tableName: 'assessment_questions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

export const AssessmentAttempt = sequelize.define('AssessmentAttempt', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  assessment_id: { type: DataTypes.UUID, allowNull: false },
  user_id: { type: DataTypes.UUID, allowNull: false },
  started_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false },
  submitted_at: { type: DataTypes.DATE, allowNull: true },
  duration_seconds: { type: DataTypes.INTEGER, allowNull: true },
  score: { type: DataTypes.INTEGER, defaultValue: 0 },
  max_score: { type: DataTypes.INTEGER, defaultValue: 0 },
  percentage: { type: DataTypes.FLOAT, defaultValue: 0 },
  proficiency_level: { type: DataTypes.STRING, defaultValue: 'BEGINNER' }, // 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
  status: { type: DataTypes.STRING, defaultValue: 'IN_PROGRESS' }, // 'IN_PROGRESS' | 'PASSED' | 'FAILED' | 'TIMED_OUT' | 'INVALIDATED'
  security_flags_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  invalidation_reason: { type: DataTypes.TEXT, allowNull: true }
}, {
  tableName: 'assessment_attempts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export const AssessmentAnswer = sequelize.define('AssessmentAnswer', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  attempt_id: { type: DataTypes.UUID, allowNull: false },
  question_id: { type: DataTypes.UUID, allowNull: false },
  user_answer: { type: DataTypes.TEXT, allowNull: true },
  is_correct: { type: DataTypes.BOOLEAN, defaultValue: false },
  marks_awarded: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  tableName: 'assessment_answers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// ======================== CERTIFICATIONS ========================
export const Certification = sequelize.define('Certification', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false },
  skill_id: { type: DataTypes.UUID, allowNull: false },
  assessment_id: { type: DataTypes.UUID, allowNull: false },
  attempt_id: { type: DataTypes.UUID, allowNull: true },
  score: { type: DataTypes.FLOAT, allowNull: false },
  proficiency_level: { type: DataTypes.STRING, allowNull: false }, // 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
  certificate_number: { type: DataTypes.STRING, allowNull: false, unique: true }, // e.g. SKILLSWAP-RUST-2026-000182
  verification_token: { type: DataTypes.STRING, allowNull: false, unique: true },
  issued_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false },
  expires_at: { type: DataTypes.DATE, allowNull: true },
  verification_status: { type: DataTypes.STRING, defaultValue: 'VERIFIED' }, // 'VERIFIED' | 'EXPIRED' | 'REVOKED'
  revocation_reason: { type: DataTypes.TEXT, allowNull: true }
}, {
  tableName: 'certifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// ======================== USER SKILLS ========================
export const UserSkill = sequelize.define('UserSkill', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false },
  skill_id: { type: DataTypes.UUID, allowNull: false },
  proficiency_level: { type: DataTypes.STRING, defaultValue: 'BEGINNER' }, // 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
  verification_status: { type: DataTypes.STRING, defaultValue: 'SELF_DECLARED' }, // 'SELF_DECLARED' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'EXPIRED' | 'REVOKED'
  assessment_id: { type: DataTypes.UUID, allowNull: true },
  certification_id: { type: DataTypes.UUID, allowNull: true },
  score: { type: DataTypes.FLOAT, allowNull: true },
  verified_at: { type: DataTypes.DATE, allowNull: true },
  expires_at: { type: DataTypes.DATE, allowNull: true },
  is_teaching: { type: DataTypes.BOOLEAN, defaultValue: true },
  is_wanting: { type: DataTypes.BOOLEAN, defaultValue: false },
  years_experience: { type: DataTypes.INTEGER, defaultValue: 0 },
  is_primary: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  tableName: 'user_skills',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { unique: true, fields: ['user_id', 'skill_id', 'is_teaching', 'is_wanting'] }
  ]
});

export const UserWantedSkill = sequelize.define('UserWantedSkill', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false },
  skill_id: { type: DataTypes.UUID, allowNull: false },
  priority: { type: DataTypes.INTEGER, defaultValue: 1 }
}, {
  tableName: 'user_wanted_skills',
  timestamps: false
});

// ======================== INTERESTS & MATCHES ========================
export const Interest = sequelize.define('Interest', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  normalized_name: { type: DataTypes.STRING, allowNull: false }
}, {
  tableName: 'interests',
  timestamps: false
});

export const UserInterest = sequelize.define('UserInterest', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }
}, {
  tableName: 'user_interests',
  timestamps: false
});

export const Match = sequelize.define('Match', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false },
  matched_user_id: { type: DataTypes.UUID, allowNull: false },
  match_score: { type: DataTypes.FLOAT, allowNull: false },
  skill_score: { type: DataTypes.FLOAT, defaultValue: 0 },
  reciprocal_score: { type: DataTypes.FLOAT, defaultValue: 0 },
  goal_score: { type: DataTypes.FLOAT, defaultValue: 0 },
  interest_score: { type: DataTypes.FLOAT, defaultValue: 0 },
  domain_score: { type: DataTypes.FLOAT, defaultValue: 0 },
  experience_score: { type: DataTypes.FLOAT, defaultValue: 0 },
  availability_score: { type: DataTypes.FLOAT, defaultValue: 0 },
  match_explanation: { type: DataTypes.TEXT }
}, {
  tableName: 'matches',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// ======================== LEGACY EXAMS (Backward Compatibility) ========================
export const Exam = sequelize.define('Exam', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  domain_id: { type: DataTypes.UUID, allowNull: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  duration_minutes: { type: DataTypes.INTEGER, defaultValue: 30 },
  passing_percentage: { type: DataTypes.INTEGER, defaultValue: 80 }
}, {
  tableName: 'exams',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

export const ExamQuestion = sequelize.define('ExamQuestion', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  exam_id: { type: DataTypes.UUID, allowNull: false },
  question: { type: DataTypes.TEXT, allowNull: false },
  option_a: { type: DataTypes.STRING, allowNull: false },
  option_b: { type: DataTypes.STRING, allowNull: false },
  option_c: { type: DataTypes.STRING, allowNull: false },
  option_d: { type: DataTypes.STRING, allowNull: false },
  correct_option: { type: DataTypes.STRING, allowNull: false },
  difficulty: { type: DataTypes.STRING, defaultValue: 'medium' }
}, {
  tableName: 'exam_questions',
  timestamps: false
});

export const ExamAttempt = sequelize.define('ExamAttempt', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  exam_id: { type: DataTypes.UUID, allowNull: true },
  user_id: { type: DataTypes.UUID, allowNull: false },
  started_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  submitted_at: { type: DataTypes.DATE },
  score: { type: DataTypes.INTEGER },
  status: { type: DataTypes.STRING, defaultValue: 'in_progress' }
}, {
  tableName: 'exam_attempts',
  timestamps: false
});

export const ExamSecurityEvent = sequelize.define('ExamSecurityEvent', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  attempt_id: { type: DataTypes.UUID, allowNull: true },
  user_id: { type: DataTypes.UUID, allowNull: false },
  event_type: { type: DataTypes.STRING, allowNull: false },
  metadata: { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'exam_security_events',
  timestamps: false
});

// ======================== RELATIONSHIPS ========================
// User & Profile
User.hasOne(Profile, { foreignKey: 'user_id', as: 'profile', onDelete: 'CASCADE' });
Profile.belongsTo(User, { foreignKey: 'user_id' });

// Domain & Skill
Domain.hasMany(Skill, { foreignKey: 'domain_id' });
Skill.belongsTo(Domain, { foreignKey: 'domain_id' });

// Skill Hierarchy & Aliases
Skill.belongsTo(Skill, { foreignKey: 'parent_skill_id', as: 'parentSkill' });
Skill.hasMany(Skill, { foreignKey: 'parent_skill_id', as: 'subSkills' });

Skill.hasMany(SkillAlias, { foreignKey: 'skill_id', as: 'aliases', onDelete: 'CASCADE' });
SkillAlias.belongsTo(Skill, { foreignKey: 'skill_id' });

// Skill Relationships (Graph)
Skill.belongsToMany(Skill, {
  through: SkillRelationship,
  as: 'relatedSkills',
  foreignKey: 'skill_id',
  otherKey: 'related_skill_id'
});

// Skill Requests
User.hasMany(SkillRequest, { foreignKey: 'user_id', as: 'skillRequests' });
SkillRequest.belongsTo(User, { foreignKey: 'user_id', as: 'requester' });
SkillRequest.belongsTo(User, { foreignKey: 'reviewed_by', as: 'reviewer' });

// UserSkills & Certifications
User.hasMany(UserSkill, { foreignKey: 'user_id', as: 'userSkills', onDelete: 'CASCADE' });
UserSkill.belongsTo(User, { foreignKey: 'user_id' });
UserSkill.belongsTo(Skill, { foreignKey: 'skill_id', as: 'skill' });
Skill.hasMany(UserSkill, { foreignKey: 'skill_id', as: 'userSkills' });

// Teaching and Wanting conveniences
User.belongsToMany(Skill, { 
  through: { model: UserSkill, scope: { is_teaching: true } }, 
  foreignKey: 'user_id', 
  as: 'teachingSkills' 
});
Skill.belongsToMany(User, { 
  through: { model: UserSkill, scope: { is_teaching: true } }, 
  foreignKey: 'skill_id', 
  as: 'teachers' 
});

User.belongsToMany(Skill, { 
  through: { model: UserSkill, scope: { is_wanting: true } }, 
  foreignKey: 'user_id', 
  as: 'wantedSkills' 
});
Skill.belongsToMany(User, { 
  through: { model: UserSkill, scope: { is_wanting: true } }, 
  foreignKey: 'skill_id', 
  as: 'wantingUsers' 
});

// Assessments
Skill.hasOne(Assessment, { foreignKey: 'skill_id', as: 'assessment', onDelete: 'CASCADE' });
Assessment.belongsTo(Skill, { foreignKey: 'skill_id', as: 'skill' });

Assessment.hasMany(AssessmentQuestion, { foreignKey: 'assessment_id', as: 'questions', onDelete: 'CASCADE' });
AssessmentQuestion.belongsTo(Assessment, { foreignKey: 'assessment_id' });

Assessment.hasMany(AssessmentAttempt, { foreignKey: 'assessment_id', as: 'attempts', onDelete: 'CASCADE' });
AssessmentAttempt.belongsTo(Assessment, { foreignKey: 'assessment_id', as: 'assessment' });
AssessmentAttempt.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

AssessmentAttempt.hasMany(AssessmentAnswer, { foreignKey: 'attempt_id', as: 'answers', onDelete: 'CASCADE' });
AssessmentAnswer.belongsTo(AssessmentAttempt, { foreignKey: 'attempt_id' });
AssessmentAnswer.belongsTo(AssessmentQuestion, { foreignKey: 'question_id', as: 'question' });

// Certifications
User.hasMany(Certification, { foreignKey: 'user_id', as: 'certifications', onDelete: 'CASCADE' });
Certification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Skill.hasMany(Certification, { foreignKey: 'skill_id', as: 'certifications' });
Certification.belongsTo(Skill, { foreignKey: 'skill_id', as: 'skill' });

Assessment.hasMany(Certification, { foreignKey: 'assessment_id', as: 'certifications' });
Certification.belongsTo(Assessment, { foreignKey: 'assessment_id', as: 'assessment' });

Certification.belongsTo(AssessmentAttempt, { foreignKey: 'attempt_id', as: 'attempt' });

// UserSkill links to Certification and Assessment
UserSkill.belongsTo(Certification, { foreignKey: 'certification_id', as: 'certification' });
UserSkill.belongsTo(Assessment, { foreignKey: 'assessment_id', as: 'assessment' });

// Interests
User.belongsToMany(Interest, { through: UserInterest, foreignKey: 'user_id', as: 'interests' });
Interest.belongsToMany(User, { through: UserInterest, foreignKey: 'interest_id', as: 'interestedUsers' });

// Matches
User.hasMany(Match, { foreignKey: 'user_id', as: 'matches' });
Match.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Match, { foreignKey: 'matched_user_id', as: 'matchedBy' });
Match.belongsTo(User, { foreignKey: 'matched_user_id', as: 'matchedUser' });

export default {
  User,
  Profile,
  Domain,
  Skill,
  SkillAlias,
  SkillRequest,
  SkillRelationship,
  Assessment,
  AssessmentQuestion,
  AssessmentAttempt,
  AssessmentAnswer,
  Certification,
  UserSkill,
  UserWantedSkill,
  Interest,
  UserInterest,
  Match,
  Exam,
  ExamQuestion,
  ExamAttempt,
  ExamSecurityEvent
};
