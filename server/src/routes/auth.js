import express from 'express';
import { User, Profile } from '../models/index.js';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';
import { authenticate } from '../middleware/auth.js';
import sequelize from '../config/database.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await hashPassword(password);
    
    const result = await sequelize.transaction(async (t) => {
      const user = await User.create({
        name,
        email,
        password_hash: hashedPassword,
        role
      }, { transaction: t });

      await Profile.create({
        user_id: user.id
      }, { transaction: t });

      return user;
    });

    const token = generateToken(result.id, result.role);
    res.status(201).json({ user: { id: result.id, name: result.name, email: result.email, role: result.role, is_admin: result.is_admin, name_changes_count: result.name_changes_count || 0 }, token });
  } catch (error) {
    console.error("error", error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ where: { email } });
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id, user.role);
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, is_admin: !!user.is_admin, avatar: user.name.slice(0,2).toUpperCase(), name_changes_count: user.name_changes_count }, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', authenticate, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'role', 'is_admin', 'name_changes_count']
    });
    res.json({ user: { ...user.toJSON(), is_admin: !!user.is_admin, avatar: user.name.slice(0,2).toUpperCase() } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
