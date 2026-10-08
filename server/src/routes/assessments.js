import express from 'express';
import crypto from 'crypto';
import { Op } from 'sequelize';
import { 
  Assessment, 
  AssessmentQuestion, 
  AssessmentAttempt, 
  AssessmentAnswer, 
  Certification, 
  UserSkill, 
  Skill 
} from '../models/index.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/assessments/skill/:skillId
 * Get assessment details, questions count, and user's attempt eligibility.
 */
router.get('/skill/:skillId', authenticate, async (req, res) => {
  try {
    const { skillId } = req.params;
    let skill = null;
    if (/^[0-9a-fA-F-]{36}$/.test(skillId)) {
      skill = await Skill.findByPk(skillId);
    } else {
      skill = await Skill.findOne({
        where: {
          [Op.or]: [
            { slug: skillId.toLowerCase() },
            { canonical_name: skillId }
          ]
        }
      });
    }
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    const assessment = await Assessment.findOne({
      where: { skill_id: skill.id },
      include: [
        { model: AssessmentQuestion, as: 'questions', attributes: ['id', 'question_type', 'difficulty', 'marks'] }
      ]
    });

    if (!assessment) {
      return res.status(404).json({ error: 'No assessment configured for this skill yet.' });
    }

    // Check user's attempt history
    const userAttempts = await AssessmentAttempt.findAll({
      where: {
        assessment_id: assessment.id,
        user_id: req.user.id
      },
      order: [['started_at', 'DESC']]
    });

    const recentPassed = userAttempts.find(a => a.status === 'PASSED');
    const lastAttempt = userAttempts[0];

    // Check cooldown
    let inCooldown = false;
    let cooldownRemainingHours = 0;

    if (lastAttempt && lastAttempt.status === 'FAILED') {
      const hoursSince = (Date.now() - new Date(lastAttempt.started_at).getTime()) / (1000 * 60 * 60);
      if (hoursSince < assessment.cooldown_hours) {
        inCooldown = true;
        cooldownRemainingHours = Math.ceil(assessment.cooldown_hours - hoursSince);
      }
    }

    // Existing certification
    const certification = await Certification.findOne({
      where: {
        skill_id: skill.id,
        user_id: req.user.id,
        verification_status: 'VERIFIED'
      }
    });

    res.json({
      assessment: {
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
        domain: assessment.domain,
        passing_percentage: assessment.passing_percentage,
        duration_minutes: assessment.duration_minutes,
        total_questions: (assessment.questions || []).length,
        max_attempts: assessment.max_attempts,
        cooldown_hours: assessment.cooldown_hours,
        validity_months: assessment.validity_months
      },
      userStatus: {
        isCertified: !!certification,
        certification: certification || null,
        totalAttempts: userAttempts.length,
        inCooldown,
        cooldownRemainingHours,
        canAttempt: !inCooldown && (!certification || certification.verification_status !== 'VERIFIED')
      }
    });
  } catch (err) {
    console.error('Failed to get assessment info:', err);
    res.status(500).json({ error: 'Failed to retrieve assessment information' });
  }
});

/**
 * POST /api/assessments/:assessmentId/start
 * Securely start an assessment session. Returns questions with correct answers STRIPPED.
 */
router.post('/:assessmentId/start', authenticate, async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const assessment = await Assessment.findByPk(assessmentId, {
      include: [
        { model: Skill, as: 'skill' },
        { model: AssessmentQuestion, as: 'questions' }
      ]
    });

    if (!assessment || assessment.status !== 'ACTIVE') {
      return res.status(404).json({ error: 'Assessment is not currently active.' });
    }

    // Cooldown verification
    const lastAttempt = await AssessmentAttempt.findOne({
      where: {
        assessment_id: assessment.id,
        user_id: req.user.id,
        status: 'FAILED'
      },
      order: [['started_at', 'DESC']]
    });

    if (lastAttempt) {
      const hoursSince = (Date.now() - new Date(lastAttempt.started_at).getTime()) / (1000 * 60 * 60);
      if (hoursSince < assessment.cooldown_hours) {
        const remaining = Math.ceil(assessment.cooldown_hours - hoursSince);
        return res.status(429).json({
          error: `Cooldown active. Please review the concepts and try again in ${remaining} hour(s).`,
          cooldownRemainingHours: remaining
        });
      }
    }

    // Create server-tracked attempt
    const attempt = await AssessmentAttempt.create({
      assessment_id: assessment.id,
      user_id: req.user.id,
      started_at: new Date(),
      status: 'IN_PROGRESS',
      security_flags_count: 0
    });

    // Sanitize questions: NEVER leak correct_answer or explanation to browser!
    const sanitizedQuestions = (assessment.questions || []).map(q => {
      let optionsList = [];
      try {
        optionsList = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
      } catch {
        optionsList = [];
      }

      return {
        id: q.id,
        question_type: q.question_type,
        question_text: q.question_text,
        difficulty: q.difficulty,
        marks: q.marks,
        options: optionsList,
        starter_code: q.starter_code || null
      };
    });

    res.json({
      attemptId: attempt.id,
      assessment: {
        id: assessment.id,
        title: assessment.title,
        skill_name: assessment.skill?.canonical_name || 'Skill',
        passing_percentage: assessment.passing_percentage,
        duration_minutes: assessment.duration_minutes
      },
      serverStartTime: attempt.started_at,
      duration_minutes: assessment.duration_minutes,
      questions: sanitizedQuestions
    });
  } catch (err) {
    console.error('Failed to start assessment:', err);
    res.status(500).json({ error: 'Failed to start assessment attempt' });
  }
});

/**
 * POST /api/assessments/attempts/:attemptId/security-event
 * Record browser proctoring flags (fullscreen exited, tab visibility change, clipboard attempts).
 */
router.post('/attempts/:attemptId/security-event', authenticate, async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { event_type, metadata } = req.body;

    const attempt = await AssessmentAttempt.findByPk(attemptId);
    if (!attempt || attempt.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Invalid attempt session.' });
    }

    if (attempt.status !== 'IN_PROGRESS') {
      return res.status(400).json({ error: 'Attempt is no longer in progress.' });
    }

    attempt.security_flags_count = (attempt.security_flags_count || 0) + 1;

    // Invalidate if serious violation threshold breached (> 6 violations)
    if (attempt.security_flags_count >= 6) {
      attempt.status = 'INVALIDATED';
      attempt.invalidation_reason = 'Excessive proctoring integrity violations (tab switches / exiting fullscreen)';
      await attempt.save();

      return res.status(403).json({
        invalidated: true,
        error: 'Exam attempt invalidated due to multiple proctoring policy violations.'
      });
    }

    await attempt.save();
    res.json({ success: true, flags_count: attempt.security_flags_count });
  } catch (err) {
    console.error('Failed to log security event:', err);
    res.status(500).json({ error: 'Failed to record event' });
  }
});

/**
 * POST /api/assessments/attempts/:attemptId/submit
 * Server-side grading, timing verification, and certification generation.
 */
router.post('/attempts/:attemptId/submit', authenticate, async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body; // { [questionId]: "selected_answer" }

    const attempt = await AssessmentAttempt.findByPk(attemptId, {
      include: [
        {
          model: Assessment,
          as: 'assessment',
          include: [
            { model: Skill, as: 'skill' },
            { model: AssessmentQuestion, as: 'questions' }
          ]
        }
      ]
    });

    if (!attempt || attempt.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Invalid attempt session.' });
    }

    if (attempt.status !== 'IN_PROGRESS') {
      return res.status(400).json({ error: `Attempt is already finalized (${attempt.status}).` });
    }

    const assessment = attempt.assessment;
    const now = new Date();
    const durationSeconds = Math.round((now.getTime() - new Date(attempt.started_at).getTime()) / 1000);
    const maxAllowedSeconds = (assessment.duration_minutes * 60) + 60; // 60s network grace period

    // Check if timed out
    if (durationSeconds > maxAllowedSeconds) {
      attempt.status = 'TIMED_OUT';
      attempt.submitted_at = now;
      attempt.duration_seconds = durationSeconds;
      await attempt.save();
      return res.status(400).json({
        error: 'Exam timed out. The time limit was exceeded before submission.',
        status: 'TIMED_OUT'
      });
    }

    // Server-side grading
    const questions = assessment.questions || [];
    let totalScore = 0;
    let maxScore = 0;
    const questionReview = [];

    for (const q of questions) {
      const qMarks = q.marks || 1;
      maxScore += qMarks;

      const userAnswer = answers ? answers[q.id] : null;
      let isCorrect = false;

      if (userAnswer) {
        // Compare trimmed lowercase
        isCorrect = String(userAnswer).trim().toLowerCase() === String(q.correct_answer).trim().toLowerCase();
      }

      if (isCorrect) {
        totalScore += qMarks;
      }

      // Record answer
      await AssessmentAnswer.create({
        attempt_id: attempt.id,
        question_id: q.id,
        user_answer: userAnswer ? String(userAnswer) : '',
        is_correct: isCorrect,
        marks_awarded: isCorrect ? qMarks : 0
      });

      questionReview.push({
        questionId: q.id,
        questionText: q.question_text,
        userAnswer,
        isCorrect,
        explanation: q.explanation
      });
    }

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const isPassed = percentage >= assessment.passing_percentage;

    // Determine Proficiency Level
    let proficiencyLevel = 'BEGINNER';
    if (percentage >= 90) {
      proficiencyLevel = 'EXPERT';
    } else if (percentage >= 80) {
      proficiencyLevel = 'ADVANCED';
    } else if (percentage >= 70) {
      proficiencyLevel = 'INTERMEDIATE';
    } else {
      proficiencyLevel = 'BEGINNER';
    }

    attempt.submitted_at = now;
    attempt.duration_seconds = durationSeconds;
    attempt.score = totalScore;
    attempt.max_score = maxScore;
    attempt.percentage = percentage;
    attempt.proficiency_level = proficiencyLevel;
    attempt.status = isPassed ? 'PASSED' : 'FAILED';
    await attempt.save();

    let certification = null;

    if (isPassed) {
      // Generate Unique Certificate Number
      const slug = assessment.skill?.slug || 'skill';
      const year = now.getFullYear();
      const randomSuffix = crypto.randomInt(100000, 999999);
      const certificateNumber = `SKILLSWAP-${slug.toUpperCase()}-${year}-${randomSuffix}`;
      const verificationToken = crypto.randomUUID();

      // Calculate expiration date
      let expiresAt = null;
      if (assessment.validity_months) {
        expiresAt = new Date(now.getTime() + (assessment.validity_months * 30 * 24 * 60 * 60 * 1000));
      }

      // Create Certification
      certification = await Certification.create({
        user_id: req.user.id,
        skill_id: assessment.skill_id,
        assessment_id: assessment.id,
        attempt_id: attempt.id,
        score: percentage,
        proficiency_level: proficiencyLevel,
        certificate_number: certificateNumber,
        verification_token: verificationToken,
        issued_at: now,
        expires_at: expiresAt,
        verification_status: 'VERIFIED'
      });

      // Update or create UserSkill to VERIFIED
      let userSkill = await UserSkill.findOne({
        where: {
          user_id: req.user.id,
          skill_id: assessment.skill_id
        }
      });

      if (userSkill) {
        userSkill.verification_status = 'VERIFIED';
        userSkill.proficiency_level = proficiencyLevel;
        userSkill.certification_id = certification.id;
        userSkill.assessment_id = assessment.id;
        userSkill.score = percentage;
        userSkill.verified_at = now;
        userSkill.expires_at = expiresAt;
        userSkill.is_teaching = true;
        await userSkill.save();
      } else {
        await UserSkill.create({
          user_id: req.user.id,
          skill_id: assessment.skill_id,
          proficiency_level: proficiencyLevel,
          verification_status: 'VERIFIED',
          certification_id: certification.id,
          assessment_id: assessment.id,
          score: percentage,
          verified_at: now,
          expires_at: expiresAt,
          is_teaching: true,
          is_wanting: false
        });
      }
    }

    res.json({
      success: true,
      passed: isPassed,
      score: totalScore,
      maxScore,
      percentage,
      proficiencyLevel,
      status: attempt.status,
      passing_percentage: assessment.passing_percentage,
      certification: certification ? {
        certificate_number: certification.certificate_number,
        verification_token: certification.verification_token,
        proficiency_level: certification.proficiency_level,
        issued_at: certification.issued_at,
        expires_at: certification.expires_at,
        verify_url: `/verify/certificate/${certification.certificate_number}`
      } : null,
      questionReview
    });
  } catch (err) {
    console.error('Failed to submit assessment:', err);
    res.status(500).json({ error: 'Failed to process assessment submission' });
  }
});

export default router;
