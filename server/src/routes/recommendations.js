import express from 'express';
import { User, Profile, Skill } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

const ENGINEERING_CATALOG = [
  {
    id: 'rec_dist_sys',
    title: 'Distributed Systems & Event-Driven Architecture',
    level: 'Advanced',
    duration: '6 weeks',
    category: 'Architecture',
    skill: 'System Design',
    matchedInterestKeywords: ['distributed', 'concurrency', 'scalable', 'microservice', 'cloud'],
    tag: '⚡ Matches Interest: Distributed Systems',
    reason: 'Personalized for your active interest in scalable distributed systems and event-driven patterns.'
  },
  {
    id: 'rec_k8s_cloud',
    title: 'Kubernetes & Multi-Cloud Infrastructure',
    level: 'Intermediate',
    duration: '5 weeks',
    category: 'Infrastructure',
    skill: 'Docker & DevOps',
    matchedInterestKeywords: ['cloud', 'devops', 'automation', 'docker', 'kubernetes', 'aws'],
    tag: '☁️ Matches Interest: Cloud Architecture',
    reason: 'Recommended based on your interest in container orchestration and cloud infrastructure.'
  },
  {
    id: 'rec_frontend_arch',
    title: 'Modern Micro-Frontends & Design Systems',
    level: 'Intermediate',
    duration: '4 weeks',
    category: 'Frontend',
    skill: 'React.js & Ecosystem',
    matchedInterestKeywords: ['frontend', 'design', 'ui', 'web', 'react', 'performance'],
    tag: '🎨 Matches Interest: Frontend Architecture',
    reason: 'Directly recommended for your passion in UI design systems and high-performance frontends.'
  },
  {
    id: 'rec_algo_opt',
    title: 'Advanced Graph Algorithms & Dynamic Programming',
    level: 'Advanced',
    duration: '6 weeks',
    category: 'Core CS',
    skill: 'Data Structures & Algorithms',
    matchedInterestKeywords: ['algo', 'competitive', 'data structures', 'problem solving'],
    tag: '🧠 Matches Interest: Algorithm Optimization',
    reason: 'Matches your interest in algorithms and performance-critical problem solving.'
  },
  {
    id: 'rec_db_internals',
    title: 'High-Throughput APIs & Distributed Caching',
    level: 'Advanced',
    duration: '5 weeks',
    category: 'Backend',
    skill: 'Node.js & REST APIs',
    matchedInterestKeywords: ['database', 'api', 'backend', 'caching', 'sql', 'postgres'],
    tag: '🗄️ Matches Interest: Database Internals',
    reason: 'Curated to match your interest in high-concurrency database and API engineering.'
  },
  {
    id: 'rec_systems_rust',
    title: 'Zero-Copy Networking & Memory Safety in Rust',
    level: 'Advanced',
    duration: '7 weeks',
    category: 'Language',
    skill: 'TypeScript',
    matchedInterestKeywords: ['systems', 'low latency', 'rust', 'c++', 'compilers'],
    tag: '🚀 Matches Interest: Low Latency',
    reason: 'Tailored for your interest in low-level systems and memory-efficient execution.'
  },
  {
    id: 'rec_ai_ml',
    title: 'Applied Machine Learning & Neural Network Pipelines',
    level: 'Intermediate',
    duration: '6 weeks',
    category: 'Core CS',
    skill: 'Data Structures & Algorithms',
    matchedInterestKeywords: ['ai', 'ml', 'machine learning', 'deep learning', 'neural'],
    tag: '🤖 Matches Interest: AI & Machine Learning',
    reason: 'Recommended based on your interest in machine learning architectures.'
  }
];

const MEDICAL_CATALOG = [
  {
    id: 'rec_cardio_hemo',
    title: 'Advanced Cardiac Hemodynamics & 12-Lead ECG',
    level: 'Advanced',
    duration: '4 weeks',
    category: 'Clinical',
    skill: 'Cardiology',
    matchedInterestKeywords: ['cardio', 'cardiac', 'ecg', 'heart', 'electrophysiology'],
    tag: '❤️ Matches Interest: Cardiology Research',
    reason: 'Specially curated for your focus on cardiology research and cardiac physiology.'
  },
  {
    id: 'rec_pharm_precision',
    title: 'Precision Pharmacogenomics & Adverse Drug Reactions',
    level: 'Intermediate',
    duration: '4 weeks',
    category: 'Preclinical',
    skill: 'Pharmacology',
    matchedInterestKeywords: ['pharm', 'drug', 'therapeutics', 'pharmacogenomics'],
    tag: '💊 Matches Interest: Clinical Pharmacology',
    reason: 'Recommended to accelerate your interest in pharmacology and targeted therapies.'
  },
  {
    id: 'rec_mri_imaging',
    title: 'Diagnostic MRI & High-Resolution CT Pattern Recognition',
    level: 'Advanced',
    duration: '6 weeks',
    category: 'Clinical',
    skill: 'Radiology Basics',
    matchedInterestKeywords: ['imaging', 'radiology', 'mri', 'ct', 'xray'],
    tag: '🩻 Matches Interest: Advanced Imaging',
    reason: 'Recommended based on your interest in advanced medical imaging modalities.'
  },
  {
    id: 'rec_trauma_resusc',
    title: 'Advanced Trauma Life Support & Rapid Response Protocols',
    level: 'Advanced',
    duration: '4 weeks',
    category: 'Clinical',
    skill: 'Emergency Medicine',
    matchedInterestKeywords: ['trauma', 'emergency', 'resuscitation', 'acute', 'surgery'],
    tag: '🚨 Matches Interest: Trauma Surgery',
    reason: 'Matches your interest in acute surgical care and emergency resuscitation.'
  },
  {
    id: 'rec_diff_diag',
    title: 'Multisystem Differential Diagnosis & Bedside Reasoning',
    level: 'Intermediate',
    duration: '5 weeks',
    category: 'Clinical',
    skill: 'Clinical Examination',
    matchedInterestKeywords: ['diagnostic', 'internal', 'safety', 'patient care', 'examination'],
    tag: '🩺 Matches Interest: Clinical Diagnostics',
    reason: 'Directly matches your interest in diagnostic accuracy and patient examination.'
  },
  {
    id: 'rec_pediatric_care',
    title: 'Pediatric Critical Care & Clinical Genetics',
    level: 'Intermediate',
    duration: '4 weeks',
    category: 'Preclinical',
    skill: 'Anatomy',
    matchedInterestKeywords: ['pediatric', 'child', 'genetics', 'biochem', 'education'],
    tag: '👶 Matches Interest: Pediatric Care',
    reason: 'Curated for your passion in pediatric development and medical education.'
  }
];

router.get('/', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: Profile, as: 'profile' },
        { model: Skill, as: 'wantedSkills' },
        { model: Skill, as: 'teachingSkills' }
      ]
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const role = user.role || 'engineering';
    const catalog = role === 'engineering' ? ENGINEERING_CATALOG : MEDICAL_CATALOG;

    // Parse interests
    let userInterests = [];
    if (user.profile?.interests && user.profile.interests !== '[]') {
      try {
        userInterests = typeof user.profile.interests === 'string'
          ? JSON.parse(user.profile.interests)
          : user.profile.interests;
      } catch {
        userInterests = user.profile.interests.split(',').map(s => s.trim());
      }
    }

    const wantedSkillNames = (user.wantedSkills || []).map(s => s.name.toLowerCase());
    const teachingSkillNames = (user.teachingSkills || []).map(s => s.name.toLowerCase());

    const isNewUser = userInterests.length === 0 && wantedSkillNames.length === 0 && teachingSkillNames.length === 0;

    if (isNewUser) {
      return res.json({
        userInterests: [],
        recommendations: []
      });
    }

    // Score catalog items based on user's interests, wanted skills, and teaching skills (certifications)
    const scored = catalog.map(item => {
      let score = 0;
      let matchedReason = null;

      // 1. Check explicit interest matches
      for (const interest of userInterests) {
        const lowerInterest = interest.toLowerCase();
        const matches = item.matchedInterestKeywords.some(kw => 
          lowerInterest.includes(kw) || kw.includes(lowerInterest)
        );
        if (matches) {
          score += 50;
          matchedReason = interest;
          break;
        }
      }

      // 2. Check wanted skills matches
      const matchesWantedSkill = wantedSkillNames.some(ws => 
        item.skill.toLowerCase().includes(ws) || ws.includes(item.skill.toLowerCase())
      );
      if (matchesWantedSkill) {
        score += 35;
        if (!matchedReason) matchedReason = `Learning Goal: ${item.skill}`;
      }

      // 3. Check teaching skills / certifications matches (complementary recommendations)
      const matchesTeaching = teachingSkillNames.some(ts => 
        item.category.toLowerCase().includes(ts) || item.skill.toLowerCase().includes(ts)
      );
      if (matchesTeaching) {
        score += 20;
        if (!matchedReason) matchedReason = `Builds on your expertise`;
      }

      return {
        ...item,
        score,
        tag: matchedReason ? `✨ Matches: ${matchedReason}` : item.tag
      };
    });

    // Only return recommendations that have a positive match score
    const relevantRecommendations = scored.filter(item => item.score > 0);
    
    // Sort by highest score
    relevantRecommendations.sort((a, b) => b.score - a.score);

    res.json({
      userInterests,
      recommendations: relevantRecommendations.slice(0, 4) // Only show the top 4 highly relevant ones
    });
  } catch (err) {
    console.error('Failed to get recommendations:', err);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

export default router;
