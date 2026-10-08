import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import sequelize from './config/database.js';

import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import matchesRoutes from './routes/matches.js';
import examsRoutes from './routes/exams.js';
import recommendationsRoutes from './routes/recommendations.js';
import skillsRoutes from './routes/skills.js';
import assessmentsRoutes from './routes/assessments.js';
import certificationsRoutes from './routes/certifications.js';
import userSkillsRoutes from './routes/userSkills.js';
import adminRoutes from './routes/admin.js';

// Setup models associations
import './models/index.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // allow frontend
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/exams', examsRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/assessments', assessmentsRoutes);
app.use('/api/certifications', certificationsRoutes);
app.use('/api/users/me/skills', userSkillsRoutes);
app.use('/api/admin', adminRoutes);

// In-memory message store for real-time chat
const chatRooms = {};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    if (!chatRooms[roomId]) {
      chatRooms[roomId] = [];
    }
    // Send previous messages to the user
    socket.emit('room_history', chatRooms[roomId]);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('send_message', (data) => {
    const { roomId, message } = data;
    if (!chatRooms[roomId]) {
      chatRooms[roomId] = [];
    }
    chatRooms[roomId].push(message);
    
    // Broadcast message to everyone in the room except the sender
    socket.to(roomId).emit('receive_message', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Database Sync and Server Start
const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced with alter: true');
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to sync db:', err);
});
