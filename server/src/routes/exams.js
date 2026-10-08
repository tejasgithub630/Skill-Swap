import express from 'express';
import { Exam, ExamQuestion, ExamAttempt, ExamSecurityEvent } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get exam details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id, {
      include: [{ model: ExamQuestion, as: 'questions' }]
    });
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    res.json(exam);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Start exam
router.post('/:id/start', authenticate, async (req, res) => {
  try {
    let examId = req.params.id;
    let exam = null;
    try {
      exam = await Exam.findByPk(examId);
    } catch (e) {
      // not a UUID or error
    }

    if (!exam) {
      exam = await Exam.findOne();
      if (!exam) {
        exam = await Exam.create({
          title: 'General Skill Assessment',
          description: 'Standard proctored technical evaluation',
          duration_minutes: 30,
          passing_percentage: 80
        });
      }
      examId = exam.id;
    }

    const attempt = await ExamAttempt.create({
      exam_id: examId,
      user_id: req.user.id,
      status: 'in_progress'
    });
    res.json(attempt);
  } catch (err) {
    console.error('Error starting exam:', err);
    res.status(500).json({ error: 'Failed to start exam' });
  }
});

// Submit exam
router.post('/:id/submit', authenticate, async (req, res) => {
  try {
    const { attempt_id, score } = req.body;
    let attempt = null;
    if (attempt_id) {
      try {
        attempt = await ExamAttempt.findByPk(attempt_id);
      } catch (e) { /* ignore */ }
    }
    
    if (attempt && attempt.user_id === req.user.id) {
      attempt.status = 'completed';
      attempt.score = score;
      attempt.submitted_at = new Date();
      await attempt.save();
      return res.json({ success: true, passed: score >= 80, final_score: score, status: attempt.status });
    }

    res.json({ success: true, passed: score >= 80, final_score: score, status: 'completed' });
  } catch (err) {
    console.error('Error submitting exam:', err);
    res.status(500).json({ error: 'Failed to submit exam' });
  }
});

// Record security events
router.post('/:id/security-events', authenticate, async (req, res) => {
  try {
    const { attempt_id, event_type, metadata } = req.body;
    
    let validAttemptId = null;
    if (attempt_id) {
      try {
        const att = await ExamAttempt.findByPk(attempt_id);
        if (att) validAttemptId = att.id;
      } catch (e) { /* ignore */ }
    }

    const event = await ExamSecurityEvent.create({
      attempt_id: validAttemptId,
      user_id: req.user.id,
      event_type: event_type || 'SECURITY_FLAG',
      metadata: metadata ? JSON.stringify(metadata) : null
    });

    res.json({ success: true, event });
  } catch (err) {
    console.error('Error recording security event:', err);
    res.status(500).json({ error: 'Failed to record event' });
  }
});

export default router;
