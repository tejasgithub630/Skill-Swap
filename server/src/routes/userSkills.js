import express from 'express';
import { UserSkill, Skill, Certification, Assessment } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/users/me/skills
 * Get authenticated user's verified, self-declared, expired, and wanted skills.
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const userSkills = await UserSkill.findAll({
      where: { user_id: req.user.id },
      include: [
        { 
          model: Skill, 
          as: 'skill',
          attributes: ['id', 'canonical_name', 'category', 'domain', 'slug', 'description'],
          include: [{ model: Assessment, as: 'assessment', attributes: ['id', 'title', 'passing_percentage', 'duration_minutes'] }]
        },
        { 
          model: Certification, 
          as: 'certification',
          attributes: ['id', 'certificate_number', 'proficiency_level', 'score', 'issued_at', 'expires_at', 'verification_status']
        }
      ]
    });

    const now = new Date();
    const verifiedSkills = [];
    const selfDeclaredSkills = [];
    const expiredSkills = [];
    const wantedSkills = [];

    for (const us of userSkills) {
      if (!us.skill) continue;

      let status = us.verification_status;
      if (status === 'VERIFIED' && us.expires_at && new Date(us.expires_at) < now) {
        status = 'EXPIRED';
      }

      const item = {
        id: us.id,
        skill_id: us.skill_id,
        name: us.skill.canonical_name,
        canonical_name: us.skill.canonical_name,
        category: us.skill.category,
        domain: us.skill.domain,
        slug: us.skill.slug,
        proficiency_level: us.proficiency_level,
        verification_status: status,
        score: us.score,
        verified_at: us.verified_at,
        expires_at: us.expires_at,
        years_experience: us.years_experience,
        has_assessment: !!us.skill.assessment,
        assessment_id: us.skill.assessment?.id || null,
        certificate_number: us.certification?.certificate_number || null,
        verify_url: us.certification?.certificate_number ? `/verify/certificate/${us.certification.certificate_number}` : null
      };

      if (us.is_wanting) {
        wantedSkills.push(item);
      }

      if (us.is_teaching) {
        if (status === 'VERIFIED') {
          verifiedSkills.push(item);
        } else if (status === 'EXPIRED') {
          expiredSkills.push(item);
        } else {
          selfDeclaredSkills.push(item);
        }
      }
    }

    res.json({
      verifiedSkills,
      selfDeclaredSkills,
      expiredSkills,
      wantedSkills,
      allSkills: userSkills
    });
  } catch (err) {
    console.error('Failed to get user skills:', err);
    res.status(500).json({ error: 'Failed to retrieve user skills' });
  }
});

/**
 * POST /api/users/me/skills
 * Add a skill to teaching or wanting.
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { skill_id, is_teaching = true, is_wanting = false, proficiency_level = 'BEGINNER', years_experience = 1 } = req.body;

    const skill = await Skill.findByPk(skill_id);
    if (!skill) {
      return res.status(404).json({ error: 'Canonical skill not found' });
    }

    // Check if user already holds a valid certification for this skill
    const existingCert = await Certification.findOne({
      where: {
        user_id: req.user.id,
        skill_id,
        verification_status: 'VERIFIED'
      }
    });

    let verification_status = 'SELF_DECLARED';
    let certId = null;
    let score = null;
    let verifiedAt = null;
    let expiresAt = null;

    if (existingCert && is_teaching) {
      verification_status = 'VERIFIED';
      certId = existingCert.id;
      score = existingCert.score;
      verifiedAt = existingCert.issued_at;
      expiresAt = existingCert.expires_at;
    }

    // Check if already in user_skills
    let userSkill = await UserSkill.findOne({
      where: {
        user_id: req.user.id,
        skill_id
      }
    });

    if (userSkill) {
      if (is_teaching !== undefined) userSkill.is_teaching = is_teaching;
      if (is_wanting !== undefined) userSkill.is_wanting = is_wanting;
      userSkill.proficiency_level = existingCert ? existingCert.proficiency_level : proficiency_level;
      if (existingCert) {
        userSkill.verification_status = 'VERIFIED';
        userSkill.certification_id = existingCert.id;
        userSkill.score = existingCert.score;
      }
      await userSkill.save();
    } else {
      userSkill = await UserSkill.create({
        user_id: req.user.id,
        skill_id,
        proficiency_level: existingCert ? existingCert.proficiency_level : proficiency_level,
        verification_status,
        certification_id: certId,
        score,
        verified_at: verifiedAt,
        expires_at: expiresAt,
        is_teaching,
        is_wanting,
        years_experience
      });
    }

    res.status(201).json({
      success: true,
      message: verification_status === 'VERIFIED'
        ? `Skill "${skill.canonical_name}" added as VERIFIED.`
        : `Skill "${skill.canonical_name}" added as Self-Declared. Take assessment to verify.`,
      userSkill: {
        ...userSkill.toJSON(),
        skill_name: skill.canonical_name
      }
    });
  } catch (err) {
    console.error('Failed to add user skill:', err);
    res.status(500).json({ error: 'Failed to add skill to profile' });
  }
});

/**
 * DELETE /api/users/me/skills/:skillId
 * Remove a skill from user profile.
 */
router.delete('/:skillId', authenticate, async (req, res) => {
  try {
    const { skillId } = req.params;
    const deleted = await UserSkill.destroy({
      where: {
        user_id: req.user.id,
        skill_id: skillId
      }
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Skill not found on user profile' });
    }

    res.json({ success: true, message: 'Skill removed from profile' });
  } catch (err) {
    console.error('Failed to remove skill:', err);
    res.status(500).json({ error: 'Failed to remove skill' });
  }
});

export default router;
