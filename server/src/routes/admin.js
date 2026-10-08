import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import {
  User, Profile, Skill, SkillAlias, SkillRequest,
  Assessment, AssessmentQuestion, AssessmentAttempt,
  Certification, UserSkill, Match
} from '../models/index.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import { getQuestionsForTopic } from '../../../src/data/questionBank.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '../../../database/skillswap.sqlite');

const router = express.Router();

// All admin routes require admin authentication
router.use(requireAdmin);

/**
 * GET /api/admin/stats
 * Aggregate system and database statistics.
 */
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      engUsers,
      medUsers,
      adminUsers,
      totalSkills,
      engSkills,
      medSkills,
      totalCerts,
      verifiedCerts,
      revokedCerts,
      pendingRequests,
      approvedRequests,
      totalAttempts,
      flaggedAttempts,
      totalMatches,
      distinctCertifiedUsers,
      failedAttempts,
      certificationsBySkill
    ] = await Promise.all([
      User.count(),
      User.count({ where: { role: 'engineering' } }),
      User.count({ where: { role: 'medical' } }),
      User.count({ where: { role: 'admin' } }),
      Skill.count(),
      Skill.count({ where: { domain: 'ENGINEERING' } }),
      Skill.count({ where: { domain: 'MEDICAL' } }),
      Certification.count(),
      Certification.count({ where: { verification_status: 'VERIFIED' } }),
      Certification.count({ where: { verification_status: 'REVOKED' } }),
      SkillRequest.count({ where: { status: 'REQUESTED' } }),
      SkillRequest.count({ where: { status: 'APPROVED' } }),
      AssessmentAttempt.count(),
      AssessmentAttempt.count({ where: { security_flags_count: { [Op.gt]: 0 } } }).catch(() => 0),
      Match.count(),
      Certification.count({ distinct: true, col: 'user_id' }),
      AssessmentAttempt.count({ where: { status: 'FAILED' } }),
      sequelize.query(`
        SELECT s.canonical_name as skill, s.domain, COUNT(c.id) as count
        FROM certifications c
        JOIN skills s ON c.skill_id = s.id
        GROUP BY s.id, s.canonical_name, s.domain
        ORDER BY count DESC
      `, { type: sequelize.QueryTypes.SELECT }).catch(() => [])
    ]);

    let dbSizeBytes = 0;
    try {
      if (fs.existsSync(DB_PATH)) {
        dbSizeBytes = fs.statSync(DB_PATH).size;
      }
    } catch {
      // ignore
    }

    res.json({
      users: {
        total: totalUsers,
        engineering: engUsers,
        medical: medUsers,
        admin: adminUsers
      },
      skills: {
        total: totalSkills,
        engineering: engSkills,
        medical: medSkills
      },
      certifications: {
        total: totalCerts,
        verified: verifiedCerts,
        revoked: revokedCerts
      },
      requests: {
        pending: pendingRequests,
        approved: approvedRequests
      },
      assessments: {
        totalAttempts,
        flaggedAttempts
      },
      matches: totalMatches,
      database: {
        engine: 'SQLite 3 (Sequelize ORM)',
        sizeBytes: dbSizeBytes,
        sizeFormatted: `${(dbSizeBytes / 1024).toFixed(1)} KB`,
        healthy: true,
        tablesCount: 16
      },
      advanced: {
        certifiedUsersCount: distinctCertifiedUsers,
        avgAttemptsToPass: totalCerts > 0 ? (totalAttempts / totalCerts).toFixed(1) : 0,
        failedAttempts: failedAttempts,
        certificationsBySkill: certificationsBySkill
      }
    });
  } catch (err) {
    console.error('Failed to get admin stats:', err);
    res.status(500).json({ error: 'Failed to retrieve admin statistics' });
  }
});

/**
 * GET /api/admin/users
 * Returns all platform users with profile and activity info.
 */
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'is_admin', 'is_active', 'created_at'],
      include: [
        { model: Profile, as: 'profile', attributes: ['bio', 'location', 'experience_years', 'career_goal'] },
        { model: Certification, as: 'certifications', attributes: ['id', 'certificate_number', 'proficiency_level', 'verification_status'] },
        { model: UserSkill, as: 'userSkills', attributes: ['id', 'proficiency_level', 'is_teaching', 'is_wanting'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(users);
  } catch (err) {
    console.error('Failed to get admin users:', err);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

/**
 * PATCH /api/admin/users/:id
 * Toggle user active status or promote/demote role.
 */
router.patch('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { role, is_active, is_admin } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (role !== undefined) user.role = role;
    if (is_active !== undefined) user.is_active = is_active;
    if (is_admin !== undefined) user.is_admin = is_admin;

    await user.save();
    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    console.error('Failed to update user:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

/**
 * GET /api/admin/skills
 * Returns all skills with aliases and subskills.
 */
router.get('/skills', async (req, res) => {
  try {
    const skills = await Skill.findAll({
      include: [
        { model: SkillAlias, as: 'aliases', attributes: ['id', 'alias'] },
        { model: Assessment, as: 'assessment', attributes: ['id', 'title', 'passing_percentage', 'duration_minutes'] }
      ],
      order: [['canonical_name', 'ASC']]
    });

    res.json(skills);
  } catch (err) {
    console.error('Failed to get skills for admin:', err);
    res.status(500).json({ error: 'Failed to retrieve skills' });
  }
});

/**
 * POST /api/admin/skills
 * Directly add a canonical skill to the taxonomy.
 */
router.post('/skills', async (req, res) => {
  try {
    const { canonical_name, category, domain, description, aliases = [] } = req.body;
    if (!canonical_name) {
      return res.status(400).json({ error: 'Canonical name is required' });
    }

    const slug = canonical_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const normalized = canonical_name.toLowerCase().replace(/[^a-z0-9]/g, '');

    const skill = await Skill.create({
      canonical_name,
      slug,
      description: description || `Standardized ${canonical_name} curriculum and competency.`,
      category: category || 'General',
      domain: (domain || 'ENGINEERING').toUpperCase(),
      normalized_name: normalized,
      status: 'ACTIVE',
      difficulty_levels: JSON.stringify(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'])
    });

    // Create aliases
    for (const aliasStr of aliases) {
      if (aliasStr.trim()) {
        await SkillAlias.create({
          skill_id: skill.id,
          alias: aliasStr.trim(),
          normalized_alias: aliasStr.toLowerCase().replace(/[^a-z0-9]/g, '')
        }).catch(() => null);
      }
    }

    // Auto-create standard Assessment with 80% cutoff
    const assessment = await Assessment.create({
      skill_id: skill.id,
      title: `${canonical_name} Proctored Competency Exam`,
      description: `Comprehensive 3-tier proctored assessment for ${canonical_name}.`,
      domain: skill.domain,
      passing_percentage: 80,
      duration_minutes: 25
    });

    // Seed comprehensive authentic evaluation questions (20-22 questions)
    const mapDiff = (lvl) => {
      const l = (lvl || '').toLowerCase();
      if (l === 'easy' || l === 'beginner') return 'BEGINNER';
      if (l === 'hard' || l === 'advanced') return 'ADVANCED';
      return 'INTERMEDIATE';
    };
    const bankQs = getQuestionsForTopic(canonical_name, (skill.domain || 'engineering').toLowerCase());
    const qRecords = bankQs.map(q => ({
      assessment_id: assessment.id,
      skill_id: skill.id,
      question_type: q.type || 'MCQ',
      question_text: q.q || q.question_text,
      difficulty: mapDiff(q.level || q.difficulty),
      options: JSON.stringify(q.options),
      correct_answer: q.a || q.correct_answer,
      explanation: q.explanation || `Verification of core competence in ${canonical_name}.`,
      marks: 1
    }));
    await AssessmentQuestion.bulkCreate(qRecords);

    res.status(201).json({ skill, assessment });
  } catch (err) {
    console.error('Failed to create skill:', err);
    res.status(500).json({ error: err.message || 'Failed to create skill' });
  }
});

/**
 * GET /api/admin/certifications
 * Returns all platform certifications.
 */
router.get('/certifications', async (req, res) => {
  try {
    const certs = await Certification.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Skill, as: 'skill', attributes: ['id', 'canonical_name', 'category', 'domain'] }
      ],
      order: [['issued_at', 'DESC']]
    });

    res.json(certs);
  } catch (err) {
    console.error('Failed to get certifications for admin:', err);
    res.status(500).json({ error: 'Failed to retrieve certifications' });
  }
});

/**
 * PATCH /api/admin/certifications/:id/revoke
 * Revoke certificate with reason.
 */
router.patch('/certifications/:id/revoke', async (req, res) => {
  try {
    const { id } = req.params;
    const { revocation_reason } = req.body;

    const cert = await Certification.findByPk(id);
    if (!cert) {
      return res.status(404).json({ error: 'Certification not found' });
    }

    cert.verification_status = 'REVOKED';
    cert.revocation_reason = revocation_reason || 'Revoked by Platform Administrator after compliance audit.';
    await cert.save();

    res.json({ message: 'Certification successfully revoked', certification: cert });
  } catch (err) {
    console.error('Failed to revoke certification:', err);
    res.status(500).json({ error: 'Failed to revoke certification' });
  }
});

/**
 * GET /api/admin/attempts
 * Returns recent assessment attempts with user and security flag count.
 */
router.get('/attempts', async (req, res) => {
  try {
    const attempts = await AssessmentAttempt.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        {
          model: Assessment,
          as: 'assessment',
          attributes: ['id', 'title', 'passing_percentage'],
          include: [{ model: Skill, as: 'skill', attributes: ['canonical_name', 'domain'] }]
        }
      ],
      order: [['started_at', 'DESC']],
      limit: 50
    });

    res.json(attempts);
  } catch (err) {
    console.error('Failed to get attempts for admin:', err);
    res.status(500).json({ error: 'Failed to retrieve assessment attempts' });
  }
});

/**
 * GET /api/admin/requests
 * Returns all skill requests.
 */
router.get('/requests', async (req, res) => {
  try {
    const requests = await SkillRequest.findAll({
      include: [
        { model: User, as: 'requester', attributes: ['id', 'name', 'email', 'role'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(requests);
  } catch (err) {
    console.error('Failed to get requests for admin:', err);
    res.status(500).json({ error: 'Failed to retrieve skill requests' });
  }
});

/**
 * PATCH /api/admin/requests/:id
 * Review a skill request (APPROVE or REJECT).
 */
router.patch('/requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_feedback, canonical_name, category, domain, aliases = [] } = req.body;

    const request = await SkillRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ error: 'Skill request not found' });
    }

    if (status === 'REJECTED') {
      request.status = 'REJECTED';
      request.admin_feedback = admin_feedback || 'Skill request rejected after taxonomy review.';
      request.reviewed_by = req.user.id;
      request.reviewed_at = new Date();
      await request.save();
      return res.json({ message: 'Request rejected', request });
    }

    if (status === 'APPROVED') {
      request.status = 'APPROVED';
      request.admin_feedback = admin_feedback || 'Approved and published to the global taxonomy.';
      request.reviewed_by = req.user.id;
      request.reviewed_at = new Date();
      await request.save();

      const finalName = canonical_name || request.requested_name;
      const slug = finalName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const normalized = finalName.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Check if skill already exists
      let skill = await Skill.findOne({ where: { canonical_name: finalName } });
      if (!skill) {
        skill = await Skill.create({
          canonical_name: finalName,
          slug,
          description: request.description || `Canonical ${finalName} curriculum.`,
          category: category || request.category || 'General',
          domain: (domain || request.domain || 'ENGINEERING').toUpperCase(),
          normalized_name: normalized,
          status: 'ACTIVE',
          difficulty_levels: JSON.stringify(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'])
        });

        // Add aliases
        for (const aliasStr of aliases) {
          if (aliasStr.trim()) {
            await SkillAlias.create({
              skill_id: skill.id,
              alias: aliasStr.trim(),
              normalized_alias: aliasStr.toLowerCase().replace(/[^a-z0-9]/g, '')
            }).catch(() => null);
          }
        }

        // Auto-create assessment with 80% cutoff
        const assessment = await Assessment.create({
          skill_id: skill.id,
          title: `${finalName} Proctored Competency Exam`,
          description: `Auto-configured proctored evaluation for ${finalName}.`,
          domain: skill.domain,
          passing_percentage: 80,
          duration_minutes: 25
        });

        // Seed comprehensive authentic evaluation questions (20-22 questions)
        const mapDiff = (lvl) => {
          const l = (lvl || '').toLowerCase();
          if (l === 'easy' || l === 'beginner') return 'BEGINNER';
          if (l === 'hard' || l === 'advanced') return 'ADVANCED';
          return 'INTERMEDIATE';
        };
        const bankQs = getQuestionsForTopic(finalName, (skill.domain || 'engineering').toLowerCase());
        const qRecords = bankQs.map(q => ({
          assessment_id: assessment.id,
          skill_id: skill.id,
          question_type: q.type || 'MCQ',
          question_text: q.q || q.question_text,
          difficulty: mapDiff(q.level || q.difficulty),
          options: JSON.stringify(q.options),
          correct_answer: q.a || q.correct_answer,
          explanation: q.explanation || `Verification of core competence in ${finalName}.`,
          marks: 1
        }));
        await AssessmentQuestion.bulkCreate(qRecords);
      }

      return res.json({ message: 'Request approved and skill provisioned', request, skill });
    }

    res.status(400).json({ error: 'Invalid status' });
  } catch (err) {
    console.error('Failed to review request:', err);
    res.status(500).json({ error: err.message || 'Failed to review request' });
  }
});

export default router;
