import express from 'express';
import { Certification, Skill, User, Assessment, UserSkill } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

/**
 * GET /api/certifications/verify/:certificateNumber
 * Public certificate authenticity verification. Anyone with the certificate number can verify.
 */
router.get('/verify/:certificateNumber', async (req, res) => {
  try {
    const { certificateNumber } = req.params;

    const cert = await Certification.findOne({
      where: { certificate_number: certificateNumber.trim() },
      include: [
        { model: Skill, as: 'skill', attributes: ['id', 'canonical_name', 'category', 'domain', 'slug'] },
        { model: User, as: 'user', attributes: ['id', 'name'] },
        { model: Assessment, as: 'assessment', attributes: ['title', 'passing_percentage'] }
      ]
    });

    if (!cert) {
      return res.status(404).json({
        valid: false,
        error: 'Invalid Certificate Number. No credential found with this identification.'
      });
    }

    // Check expiration
    let currentStatus = cert.verification_status;
    if (currentStatus === 'VERIFIED' && cert.expires_at && new Date(cert.expires_at) < new Date()) {
      currentStatus = 'EXPIRED';
      cert.verification_status = 'EXPIRED';
      await cert.save();
    }

    // Mask name for privacy (e.g. "Alex Chen" -> "Alex C.")
    const nameParts = (cert.user?.name || 'Verified User').split(' ');
    const maskedName = nameParts.length > 1 
      ? `${nameParts[0]} ${nameParts[1][0]}.` 
      : nameParts[0];

    res.json({
      valid: currentStatus === 'VERIFIED',
      certificate_number: cert.certificate_number,
      verification_status: currentStatus,
      skill_name: cert.skill?.canonical_name || 'Skill',
      category: cert.skill?.category || 'General',
      domain: cert.skill?.domain || 'ENGINEERING',
      proficiency_level: cert.proficiency_level,
      score: cert.score,
      issued_at: cert.issued_at,
      expires_at: cert.expires_at,
      credential_holder: maskedName,
      platform: 'SkillSwap Peer Knowledge Network',
      revocation_reason: cert.revocation_reason || null
    });
  } catch (err) {
    console.error('Failed to verify certificate:', err);
    res.status(500).json({ error: 'Certificate verification service error' });
  }
});

/**
 * GET /api/certifications/my
 * Authenticated user's certifications history.
 */
router.get('/my', authenticate, async (req, res) => {
  try {
    const certs = await Certification.findAll({
      where: { user_id: req.user.id },
      include: [
        { model: Skill, as: 'skill', attributes: ['id', 'canonical_name', 'category', 'domain', 'slug'] }
      ],
      order: [['issued_at', 'DESC']]
    });

    res.json(certs.map(c => {
      let status = c.verification_status;
      if (status === 'VERIFIED' && c.expires_at && new Date(c.expires_at) < new Date()) {
        status = 'EXPIRED';
      }
      return {
        id: c.id,
        certificate_number: c.certificate_number,
        skill_id: c.skill_id,
        skill_name: c.skill?.canonical_name || 'Skill',
        category: c.skill?.category,
        domain: c.skill?.domain,
        proficiency_level: c.proficiency_level,
        score: c.score,
        issued_at: c.issued_at,
        expires_at: c.expires_at,
        status,
        verify_url: `/verify/certificate/${c.certificate_number}`
      };
    }));
  } catch (err) {
    console.error('Failed to get my certifications:', err);
    res.status(500).json({ error: 'Failed to retrieve certifications' });
  }
});

/**
 * PATCH /api/certifications/:id/revoke
 * Admin revocation of a certificate.
 */
router.patch('/:id/revoke', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { revocation_reason } = req.body;

    const cert = await Certification.findByPk(id);
    if (!cert) {
      return res.status(404).json({ error: 'Certification not found' });
    }

    cert.verification_status = 'REVOKED';
    cert.revocation_reason = revocation_reason || 'Revoked by platform administrator';
    await cert.save();

    // Update associated UserSkill
    const userSkill = await UserSkill.findOne({
      where: {
        user_id: cert.user_id,
        skill_id: cert.skill_id
      }
    });

    if (userSkill) {
      userSkill.verification_status = 'REVOKED';
      await userSkill.save();
    }

    res.json({ success: true, message: 'Certification revoked', certification: cert });
  } catch (err) {
    console.error('Failed to revoke certification:', err);
    res.status(500).json({ error: 'Failed to revoke certificate' });
  }
});

export default router;
