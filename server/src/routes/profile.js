import express from 'express';
import { User, Profile, UserSkill, UserWantedSkill, Skill } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: Profile, as: 'profile' },
        { model: Skill, as: 'teachingSkills', through: { attributes: ['proficiency_level', 'years_experience', 'is_primary'] } },
        { model: Skill, as: 'wantedSkills', through: { attributes: ['priority'] } }
      ]
    });
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.put('/', authenticate, async (req, res) => {
  try {
    const { name, email, ...allowedUpdates } = req.body;
    
    if (email) {
      return res.status(400).json({ error: 'Email cannot be changed' });
    }

    if (name) {
      const user = await User.findByPk(req.user.id);
      if (user && user.name !== name) {
        if (user.name_changes_count >= 1) {
          return res.status(400).json({ error: 'You have already changed your name the maximum allowed times (1).' });
        }
        await user.update({ name, name_changes_count: user.name_changes_count + 1 });
      }
    }

    const profile = await Profile.findOne({ where: { user_id: req.user.id } });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Update allowed fields
    const fieldsToUpdate = {};
    const validFields = ['bio', 'phone', 'location', 'education', 'experience_years', 'career_goal', 'availability', 'profile_picture'];
    validFields.forEach(field => {
      if (allowedUpdates[field] !== undefined) {
        fieldsToUpdate[field] = allowedUpdates[field];
      }
    });

    if (allowedUpdates.interests !== undefined) {
      fieldsToUpdate.interests = Array.isArray(allowedUpdates.interests) 
        ? JSON.stringify(allowedUpdates.interests) 
        : allowedUpdates.interests;
    }

    await profile.update(fieldsToUpdate);

    // To handle skills update, we'll probably have a separate endpoint, or handle it here if passed
    // But since the current frontend handles it simply, let's allow it in profile.
    if (allowedUpdates.teachingSkills) {
       // logic to update UserSkill
       // skip for now or implement if needed
    }

    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
