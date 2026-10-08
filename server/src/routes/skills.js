import express from 'express';
import { Op } from 'sequelize';
import { Skill, SkillAlias, SkillRequest, SkillRelationship, Assessment, AssessmentQuestion, User } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import { normalizeSkillName, slugify, checkDuplicateSkill } from '../services/skillNormalization.js';
import { getQuestionsForTopic } from '../../../src/data/questionBank.js';

const router = express.Router();

/**
 * GET /api/skills
 * List all active canonical skills with aliases and assessment availability.
 */
router.get('/', async (req, res) => {
  try {
    const { domain, category, search } = req.query;
    const where = { status: 'ACTIVE' };

    if (domain && domain.toUpperCase() !== 'ALL') {
      where[Op.or] = [
        { domain: domain.toUpperCase() },
        { domain: 'BOTH' }
      ];
    }

    if (category) {
      where.category = category;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where[Op.or] = [
        { canonical_name: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } },
        { category: { [Op.like]: `%${q}%` } }
      ];
    }

    const skills = await Skill.findAll({
      where,
      include: [
        { model: SkillAlias, as: 'aliases', attributes: ['alias'] },
        { model: Assessment, as: 'assessment', attributes: ['id', 'title', 'passing_percentage', 'duration_minutes'] }
      ],
      order: [['canonical_name', 'ASC']]
    });

    res.json(skills.map(s => ({
      id: s.id,
      canonical_name: s.canonical_name,
      name: s.canonical_name,
      slug: s.slug,
      category: s.category,
      domain: s.domain,
      description: s.description,
      aliases: (s.aliases || []).map(a => a.alias),
      has_assessment: !!s.assessment,
      assessment: s.assessment
    })));
  } catch (err) {
    console.error('Failed to list skills:', err);
    res.status(500).json({ error: 'Failed to retrieve skills taxonomy' });
  }
});

/**
 * GET /api/skills/search?q=
 * Search skills by canonical name, normalized query, or alias.
 */
router.get('/search', async (req, res) => {
  try {
    const query = (req.query.q || '').trim();
    if (!query) {
      return res.json([]);
    }

    const normalized = normalizeSkillName(query);

    // 1. Search aliases
    const aliases = await SkillAlias.findAll({
      where: {
        [Op.or]: [
          { alias: { [Op.like]: `%${query}%` } },
          { normalized_alias: { [Op.like]: `%${normalized}%` } }
        ]
      },
      include: [{ model: Skill, as: 'Skill', include: [{ model: Assessment, as: 'assessment' }] }]
    });

    const aliasSkillIds = aliases.map(a => a.skill_id);

    // 2. Search canonical skills
    const canonicalSkills = await Skill.findAll({
      where: {
        status: 'ACTIVE',
        [Op.or]: [
          { canonical_name: { [Op.like]: `%${query}%` } },
          { normalized_name: { [Op.like]: `%${normalized}%` } },
          { id: { [Op.in]: aliasSkillIds } }
        ]
      },
      include: [
        { model: SkillAlias, as: 'aliases', attributes: ['alias'] },
        { model: Assessment, as: 'assessment', attributes: ['id', 'title', 'passing_percentage'] }
      ]
    });

    const results = canonicalSkills.map(skill => {
      const matchingAlias = (skill.aliases || []).find(a =>
        a.alias.toLowerCase().includes(query.toLowerCase())
      );

      return {
        id: skill.id,
        canonical_name: skill.canonical_name,
        name: skill.canonical_name,
        slug: skill.slug,
        category: skill.category,
        domain: skill.domain,
        description: skill.description,
        matchedAlias: matchingAlias ? matchingAlias.alias : null,
        has_assessment: !!skill.assessment
      };
    });

    res.json(results);
  } catch (err) {
    console.error('Failed to search skills:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

/**
 * POST /api/skills/check-duplicate
 * Duplicate prevention check before user/admin submits a new skill request.
 */
router.post('/check-duplicate', async (req, res) => {
  try {
    const { name, domain } = req.body;
    const result = await checkDuplicateSkill(name, domain);
    res.json(result);
  } catch (err) {
    console.error('Duplicate check error:', err);
    res.status(500).json({ error: 'Duplicate check failed' });
  }
});

/**
 * POST /api/skills/request
 * User submits request to add a new skill to the global taxonomy.
 */
router.post('/request', authenticate, async (req, res) => {
  try {
    const { requested_name, category, domain, description, justification, reference_url } = req.body;

    if (!requested_name || !requested_name.trim()) {
      return res.status(400).json({ error: 'Skill name is required.' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Description is required.' });
    }

    // Duplicate check
    const dupCheck = await checkDuplicateSkill(requested_name, domain);
    if (dupCheck.isDuplicate) {
      return res.status(409).json({
        error: `Skill already exists or resolves to "${dupCheck.matchedSkill.canonical_name}".`,
        matchedSkill: dupCheck.matchedSkill,
        suggestion: dupCheck.suggestion
      });
    }

    // Check if an identical request is already pending
    const existingPending = await SkillRequest.findOne({
      where: {
        requested_name: { [Op.like]: requested_name.trim() },
        status: { [Op.in]: ['REQUESTED', 'UNDER_REVIEW'] }
      }
    });

    if (existingPending) {
      return res.status(409).json({
        error: `A skill request for "${requested_name}" is already under review.`,
        request: existingPending
      });
    }

    const skillRequest = await SkillRequest.create({
      user_id: req.user.id,
      requested_name: requested_name.trim(),
      category: category || 'General',
      domain: (domain || 'ENGINEERING').toUpperCase(),
      description: description.trim(),
      justification: justification?.trim() || '',
      reference_url: reference_url?.trim() || '',
      status: 'REQUESTED'
    });

    res.status(201).json({
      success: true,
      message: 'Skill request submitted for review.',
      request: skillRequest
    });
  } catch (err) {
    console.error('Failed to submit skill request:', err);
    res.status(500).json({ error: 'Failed to submit skill request' });
  }
});

/**
 * GET /api/skills/requests
 * View skill requests. Admins see all; regular users see their own.
 */
router.get('/requests', authenticate, async (req, res) => {
  try {
    const isAdmin = req.user.is_admin || req.user.role === 'admin';
    const where = {};

    if (!isAdmin) {
      where.user_id = req.user.id;
    }

    if (req.query.status) {
      where.status = req.query.status.toUpperCase();
    }

    const requests = await SkillRequest.findAll({
      where,
      include: [
        { model: User, as: 'requester', attributes: ['id', 'name', 'email', 'role'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(requests);
  } catch (err) {
    console.error('Failed to list skill requests:', err);
    res.status(500).json({ error: 'Failed to retrieve skill requests' });
  }
});

/**
 * PATCH /api/skills/requests/:id
 * Admin review: APPROVE, REJECT, or UNDER_REVIEW.
 */
router.patch('/requests/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_feedback, canonical_name, category, domain, aliases, description, questions } = req.body;

    const request = await SkillRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ error: 'Skill request not found' });
    }

    if (status === 'REJECTED') {
      request.status = 'REJECTED';
      request.admin_feedback = admin_feedback || 'Skill request rejected.';
      request.reviewed_by = req.user.id;
      request.reviewed_at = new Date();
      await request.save();
      return res.json({ success: true, message: 'Skill request rejected.', request });
    }

    if (status === 'UNDER_REVIEW') {
      request.status = 'UNDER_REVIEW';
      request.admin_feedback = admin_feedback || '';
      request.reviewed_by = req.user.id;
      await request.save();
      return res.json({ success: true, message: 'Skill request marked under review.', request });
    }

    if (status === 'APPROVED') {
      const targetName = (canonical_name || request.requested_name).trim();
      const targetCategory = category || request.category || 'General';
      const targetDomain = (domain || request.domain || 'ENGINEERING').toUpperCase();
      const targetDesc = description || request.description || '';
      const slug = slugify(targetName);

      // Verify no duplicate canonical name or slug
      const existing = await Skill.findOne({
        where: {
          [Op.or]: [{ canonical_name: targetName }, { slug }]
        }
      });

      let skill = existing;
      if (!skill) {
        skill = await Skill.create({
          canonical_name: targetName,
          slug,
          description: targetDesc,
          category: targetCategory,
          domain: targetDomain,
          normalized_name: normalizeSkillName(targetName),
          status: 'ACTIVE',
          created_by: req.user.id
        });
      }

      // Add Aliases
      const aliasList = Array.isArray(aliases) ? aliases : (aliases ? aliases.split(',') : []);
      // Add requested_name as alias if different from canonical_name
      if (request.requested_name.toLowerCase() !== targetName.toLowerCase()) {
        aliasList.push(request.requested_name);
      }

      for (const a of aliasList) {
        const cleanAlias = a.trim();
        if (cleanAlias && cleanAlias.toLowerCase() !== targetName.toLowerCase()) {
          const normAlias = normalizeSkillName(cleanAlias);
          const aliasExists = await SkillAlias.findOne({ where: { normalized_alias: normAlias } });
          if (!aliasExists) {
            await SkillAlias.create({
              skill_id: skill.id,
              alias: cleanAlias,
              normalized_alias: normAlias
            });
          }
        }
      }

      // Auto-configure Assessment for newly approved skill
      let assessment = await Assessment.findOne({ where: { skill_id: skill.id } });
      if (!assessment) {
        assessment = await Assessment.create({
          skill_id: skill.id,
          title: `${targetName} Skill Certification Assessment`,
          description: `Official SkillSwap verified evaluation for ${targetName}. Demonstrates certified proficiency.`,
          domain: targetDomain,
          passing_percentage: 80,
          duration_minutes: 25,
          max_attempts: 3,
          cooldown_hours: 24,
          validity_months: 24, // 2 year validity
          status: 'ACTIVE'
        });

        // Seed domain-specific authentic assessment questions (20-22 questions)
        const mapDiff = (lvl) => {
          const l = (lvl || '').toLowerCase();
          if (l === 'easy' || l === 'beginner') return 'BEGINNER';
          if (l === 'hard' || l === 'advanced') return 'ADVANCED';
          return 'INTERMEDIATE';
        };

        const bankQuestions = getQuestionsForTopic(targetName, targetDomain.toLowerCase());
        const qRecords = bankQuestions.map(q => ({
          assessment_id: assessment.id,
          skill_id: skill.id,
          question_type: q.type || 'MCQ',
          question_text: q.q || q.question_text,
          difficulty: mapDiff(q.level || q.difficulty),
          options: JSON.stringify(q.options),
          correct_answer: q.a || q.correct_answer,
          explanation: q.explanation || `Core concept evaluation for ${targetName}.`,
          marks: 1
        }));
        await AssessmentQuestion.bulkCreate(qRecords);
      }

      request.status = 'APPROVED';
      request.admin_feedback = admin_feedback || `Approved and added to global ${targetDomain} taxonomy.`;
      request.reviewed_by = req.user.id;
      request.reviewed_at = new Date();
      await request.save();

      return res.json({
        success: true,
        message: `Skill "${targetName}" approved and published globally with certification assessment.`,
        skill,
        assessment,
        request
      });
    }

    res.status(400).json({ error: 'Invalid status action.' });
  } catch (err) {
    console.error('Failed to review skill request:', err);
    res.status(500).json({ error: 'Failed to process review' });
  }
});

/**
 * GET /api/skills/:id
 * Retrieve single skill details, aliases, and certification parameters.
 */
router.get('/:id', async (req, res) => {
  try {
    const skill = await Skill.findByPk(req.params.id, {
      include: [
        { model: SkillAlias, as: 'aliases', attributes: ['id', 'alias'] },
        {
          model: Assessment,
          as: 'assessment',
          attributes: ['id', 'title', 'description', 'passing_percentage', 'duration_minutes', 'validity_months']
        }
      ]
    });

    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    res.json(skill);
  } catch (err) {
    console.error('Failed to get skill:', err);
    res.status(500).json({ error: 'Failed to fetch skill details' });
  }
});

// Helper to provide rich default starter questions for new skills
function getDefaultQuestionsForSkill(skillName, domain, category) {
  if (domain === 'ENGINEERING') {
    return [
      {
        question_type: 'MCQ',
        difficulty: 'BEGINNER',
        question_text: `What is the primary design philosophy and advantage of ${skillName}?`,
        options: [
          `High performance, reliability, and modern developer ergonomics`,
          `Legacy backward compatibility with 1970s hardware architectures`,
          `Unrestricted global mutable memory access by default`,
          `Exclusive support for single-threaded batch execution`
        ],
        correct_answer: `High performance, reliability, and modern developer ergonomics`,
        explanation: `${skillName} was developed to deliver strong performance, developer safety, and maintainable software architecture.`
      },
      {
        question_type: 'CODING',
        difficulty: 'INTERMEDIATE',
        question_text: `In ${skillName}, how are errors and concurrency/state typically managed in production systems?`,
        options: [
          `Structured error handling mechanisms and explicit concurrency primitives`,
          `Ignoring uncaught exceptions until program termination`,
          `Hardcoding static thread IDs and sleeping arbitrarily`,
          `Disabling memory management checks entirely`
        ],
        correct_answer: `Structured error handling mechanisms and explicit concurrency primitives`,
        explanation: `Production patterns in ${skillName} emphasize robust error boundaries, structured concurrency, and deterministic resource lifecycles.`
      },
      {
        question_type: 'SCENARIO',
        difficulty: 'ADVANCED',
        question_text: `You are architecting a high-throughput microservice using ${skillName}. What is the recommended strategy to avoid resource contention?`,
        options: [
          `Leverage connection pooling, non-blocking I/O, and asynchronous processing`,
          `Spawn an unlimited number of unbounded OS threads per incoming request`,
          `Disable garbage collection / memory management permanently`,
          `Route all database queries through a single synchronous global lock`
        ],
        correct_answer: `Leverage connection pooling, non-blocking I/O, and asynchronous processing`,
        explanation: `Asynchronous pipelines, bounded buffers, and connection reuse ensure predictable latency under high concurrency.`
      }
    ];
  } else {
    // Medical questions
    return [
      {
        question_type: 'MCQ',
        difficulty: 'BEGINNER',
        question_text: `In clinical practice related to ${skillName}, what is the fundamental baseline diagnostic evaluation?`,
        options: [
          `Thorough clinical patient history, physical examination, and vital sign assessment`,
          `Immediate high-risk invasive surgical exploration without prior workup`,
          `Administering maximum-dose broad-spectrum antibiotics empirically`,
          `Discharging patient without documentation`
        ],
        correct_answer: `Thorough clinical patient history, physical examination, and vital sign assessment`,
        explanation: `Accurate diagnostic workup always begins with systematic history-taking, vital signs, and targeted physical exam.`
      },
      {
        question_type: 'SCENARIO',
        difficulty: 'INTERMEDIATE',
        question_text: `A patient presents with acute distress relevant to ${skillName}. What is the primary priority in stabilization?`,
        options: [
          `Securing Airway, Breathing, and Circulation (ABCs) and establishing IV access`,
          `Waiting 48 hours for outpatient specialist referral`,
          `Administering oral sedatives prior to evaluating airway patency`,
          `Ordering elective genetic sequencing`
        ],
        correct_answer: `Securing Airway, Breathing, and Circulation (ABCs) and establishing IV access`,
        explanation: `Emergency stabilization protocols mandate immediate ABC evaluation before proceeding to specialized interventions.`
      },
      {
        question_type: 'SCENARIO',
        difficulty: 'ADVANCED',
        question_text: `Which guideline-directed therapeutic intervention is indicated when initial first-line management fails in ${skillName}?`,
        options: [
          `Multidisciplinary consultation, escalation to secondary protocols, and close hemodynamic monitoring`,
          `Abruptly stopping all supportive care`,
          `Doubling dosage without renal or hepatic clearance evaluation`,
          `Immediate discharge against medical advice`
        ],
        correct_answer: `Multidisciplinary consultation, escalation to secondary protocols, and close hemodynamic monitoring`,
        explanation: `Refractory cases require evidence-based protocol escalation, organ function monitoring, and specialist consultation.`
      }
    ];
  }
}

export default router;
