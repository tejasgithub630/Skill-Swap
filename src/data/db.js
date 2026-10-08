import { 
  engineeringGroups, 
  medicalGroups, 
  engineeringRecommendations, 
  medicalRecommendations, 
  engineeringProgress, 
  medicalProgress
} from './mockData';
import { courseCurriculum } from './courseCurriculum';

const DB_KEY = 'skillswap_db';

const initializeDB = () => {
  if (!localStorage.getItem(DB_KEY)) {
    const initialData = {
      users: [
        { id: 'u1', name: 'Alex Chen', role: 'engineering', mySkills: ['Go', 'System Design', 'React'], wantSkills: ['Java', 'Docker'], avatar: 'AC', rating: 4.9, bio: 'Staff Engineer focused on scalable distributed systems.' },
        { id: 'u2', name: 'Sarah Jenkins', role: 'engineering', mySkills: ['Kubernetes', 'Docker', 'AWS'], wantSkills: ['Node.js', 'React'], avatar: 'SJ', rating: 4.8, bio: 'DevOps & Cloud architect passionate about containerization.' },
        { id: 'u3', name: 'David Kim', role: 'engineering', mySkills: ['Python', 'Data Structures', 'Algorithms'], wantSkills: ['System Design', 'Go'], avatar: 'DK', rating: 4.9, bio: 'Algorithm specialist & FAANG interview mentor.' },
        { id: 'u4', name: 'Priya Sharma', role: 'engineering', mySkills: ['TypeScript', 'Next.js', 'GraphQL', 'JavaScript'], wantSkills: ['Rust', 'Docker'], avatar: 'PS', rating: 5.0, bio: 'Frontend architect and design systems advocate.' },
        { id: 'u5', name: 'Marcus Vance', role: 'engineering', mySkills: ['Java', 'SQL', 'Node.js'], wantSkills: ['Kubernetes', 'Python'], avatar: 'MV', rating: 4.7, bio: 'Backend engineer passionate about high-throughput APIs.' },
        { id: 'u6', name: 'Elena Rostova', role: 'engineering', mySkills: ['C++', 'Rust', 'C'], wantSkills: ['Python', 'System Design'], avatar: 'ER', rating: 4.9, bio: 'Systems programmer working on low-latency engines.' },
        
        { id: 'u7', name: 'Dr. Emily Rose', role: 'medical', mySkills: ['Pharmacology', 'Cardiology', 'Anatomy'], wantSkills: ['Pathology', 'Radiology'], avatar: 'ER', rating: 4.9, bio: 'Clinical Pharmacologist & cardiology specialist.' },
        { id: 'u8', name: 'James Wilson', role: 'medical', mySkills: ['Diagnostics', 'Patient Care', 'Pathology'], wantSkills: ['Pharmacology', 'Clinical Examination'], avatar: 'JW', rating: 4.8, bio: 'Resident physician sharing real clinical case studies.' },
        { id: 'u9', name: 'Dr. Mia Patel', role: 'medical', mySkills: ['Cardiology', 'Radiology Basics', 'Physiology'], wantSkills: ['Surgery', 'Emergency Medicine'], avatar: 'MP', rating: 5.0, bio: 'Cardiologist trained in advanced imaging and ECG interpretation.' },
        { id: 'u10', name: 'Dr. Robert Hayes', role: 'medical', mySkills: ['Emergency Medicine', 'Clinical Examination', 'Surgery'], wantSkills: ['Radiology Basics', 'Pathology'], avatar: 'RH', rating: 4.9, bio: 'Emergency Medicine attending with trauma surgery experience.' },
        { id: 'u11', name: 'Dr. Sophia Martinez', role: 'medical', mySkills: ['Anatomy', 'Pediatrics', 'Biochemistry'], wantSkills: ['Cardiology', 'Diagnostics'], avatar: 'SM', rating: 4.8, bio: 'Anatomy professor & pediatrician dedicated to medical education.' },
      ],
      engineeringGroups,
      medicalGroups,
      engineeringRecommendations,
      medicalRecommendations,
      engineeringProgress,
      medicalProgress
    };
    localStorage.setItem(DB_KEY, JSON.stringify(initialData));
  }
};

const getDB = () => {
  initializeDB();
  return JSON.parse(localStorage.getItem(DB_KEY));
};

const saveDB = (data) => {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
};

export const getPeersForSkill = (skillName, currentUser) => {
  const db = getDB();
  const users = db.users || [];
  const query = (skillName || '').toLowerCase().trim();
  const currentRole = currentUser?.role || 'engineering';

  const matchingPeers = users.filter(u => {
    if (u.name === currentUser?.name || u.email === currentUser?.email) return false;
    if (u.role && u.role !== currentRole) return false;
    return u.mySkills?.some(s => s.toLowerCase().includes(query) || query.includes(s.toLowerCase()));
  });

  if (matchingPeers.length === 0) {
    return [];
  }

  return matchingPeers.map(u => ({
    ...u,
    user: u.name,
    mySkill: u.mySkills?.find(s => s.toLowerCase().includes(query) || query.includes(s.toLowerCase())) || u.mySkills?.[0] || skillName,
    wantSkill: u.wantSkills?.[0] || (currentUser?.mySkills?.[0] || 'General'),
    matchScore: (currentUser?.mySkills?.some(s => u.wantSkills?.includes(s))) ? 90 : 75,
    rating: u.rating || 4.9,
    reviewsCount: 14,
    bio: u.bio || `Active peer specializing in ${skillName}. Ready to exchange skills!`
  }));
};

export const getMatches = (currentUser) => {
  const db = getDB();
  const users = db.users || [];
  const role = currentUser?.role || 'engineering';
  const otherUsers = users.filter(u => u.role === role && u.name !== currentUser?.name);
  
  const matches = [];
  otherUsers.forEach(otherUser => {
    // Advanced semantic matching (mocked for frontend fallback)
    const calculateOverlap = (arr1, arr2) => {
      if (!arr1 || !arr2) return 0;
      const lower1 = arr1.map(s => s.toLowerCase());
      const lower2 = arr2.map(s => s.toLowerCase());
      const intersection = lower1.filter(x => lower2.includes(x));
      return intersection.length;
    };

    const wantMatchCount = calculateOverlap(currentUser?.wantSkills, otherUser?.mySkills);
    const offerMatchCount = calculateOverlap(currentUser?.mySkills, otherUser?.wantSkills);
    
    if (wantMatchCount > 0 || offerMatchCount > 0) {
      // Dynamic scoring model based on reciprocal exchange strength rather than static 98/85/75
      const baseScore = 60;
      const wantBonus = wantMatchCount * 15;
      const offerBonus = offerMatchCount * 15;
      const reciprocalBonus = (wantMatchCount > 0 && offerMatchCount > 0) ? 10 : 0;
      const matchScore = Math.min(99, baseScore + wantBonus + offerBonus + reciprocalBonus);

      matches.push({
        id: otherUser.id,
        user: otherUser.name,
        avatar: otherUser.avatar,
        mySkill: currentUser?.mySkills?.find(skill => otherUser.wantSkills?.includes(skill)) || (currentUser?.mySkills && currentUser.mySkills[0]) || (role === 'engineering' ? 'React' : 'Anatomy'),
        wantSkill: currentUser?.wantSkills?.find(skill => otherUser.mySkills?.includes(skill)) || (currentUser?.wantSkills && currentUser.wantSkills[0]) || (role === 'engineering' ? 'Go' : 'Pharmacology'),
        matchScore
      });
    }
  });

  return matches.sort((a, b) => b.matchScore - a.matchScore);
};

export const getRecommendations = (role) => {
  const db = getDB();
  return (role === 'engineering' ? db.engineeringRecommendations : db.medicalRecommendations) || [];
};

export const syncUser = (user) => {
  const db = getDB();
  db.users = db.users || [];
  const existingIndex = db.users.findIndex(u => u.email === user.email);
  if (existingIndex >= 0) {
    db.users[existingIndex] = { ...db.users[existingIndex], ...user };
  } else {
    db.users.push({ ...user, id: `u${Date.now()}`, avatar: user.name.slice(0, 2).toUpperCase() });
  }
  saveDB(db);
};

export const getProgress = (role, user) => {
  const db = getDB();
  const defaultData = (role === 'engineering' ? db.engineeringProgress : db.medicalProgress) || [];
  
  // Use user-specific progress if available, else initialize with 0s
  db.userProgress = db.userProgress || {};
  if (user && user.email) {
    if (!db.userProgress[user.email]) {
      db.userProgress[user.email] = defaultData.map(item => ({ ...item, progress: 0 }));
      saveDB(db);
    }
    return db.userProgress[user.email];
  }
  
  return defaultData;
};

export const startLearning = (role, recommendation) => {
  const db = getDB();
  const newProgress = {
    skill: recommendation.title,
    progress: 0,
    target: 100,
    category: 'New Learning'
  };
  
  if (role === 'engineering') {
    db.engineeringProgress = db.engineeringProgress || [];
    db.engineeringRecommendations = db.engineeringRecommendations || [];
    db.engineeringProgress.push(newProgress);
    db.engineeringRecommendations = db.engineeringRecommendations.filter(r => r.title !== recommendation.title);
  } else {
    db.medicalProgress = db.medicalProgress || [];
    db.medicalRecommendations = db.medicalRecommendations || [];
    db.medicalProgress.push(newProgress);
    db.medicalRecommendations = db.medicalRecommendations.filter(r => r.title !== recommendation.title);
  }
  
  saveDB(db);
};

export const getGroups = (role) => {
  const db = getDB();
  return (role === 'engineering' ? db.engineeringGroups : db.medicalGroups) || [];
};

export const joinGroup = (role, groupId) => {
  const db = getDB();
  const groups = (role === 'engineering' ? db.engineeringGroups : db.medicalGroups) || [];
  const group = groups.find(g => g.id === groupId);
  if (group) {
    group.joined = true;
  }
  saveDB(db);
};

export const leaveGroup = (role, groupId) => {
  const db = getDB();
  const groups = (role === 'engineering' ? db.engineeringGroups : db.medicalGroups) || [];
  const group = groups.find(g => g.id === groupId);
  if (group) {
    group.joined = false;
  }
  saveDB(db);
};

export const getCourseDetails = (courseName) => {
  const defaultModules = [
    { title: 'Introduction & Core Concepts', duration: '45 mins', completed: true },
    { title: 'Intermediate Techniques & Patterns', duration: '1h 15m', completed: false },
    { title: 'Advanced Application & Case Studies', duration: '2h 30m', completed: false },
    { title: 'Final Assessment & Project', duration: '1h 00m', completed: false }
  ];

  const aiSummaries = {
    'Data Structures & Algorithms': "🤖 AI Summary: This course breaks down how to efficiently store and manipulate data. You'll learn about arrays, trees, and graphs, making it much easier to write fast, optimized code for technical interviews and real-world systems.",
    'React.js & Ecosystem': "🤖 AI Summary: Master the most popular frontend library. This course covers everything from basic components to advanced hooks and state management, empowering you to build interactive, fast web applications.",
    'System Design': "🤖 AI Summary: Learn how to architect large-scale applications. We'll cover load balancing, caching, database sharding, and microservices so you can design systems that handle millions of users.",
    'Node.js & REST APIs': "🤖 AI Summary: Dive into backend development using JavaScript. You'll learn how to build secure, scalable APIs, handle authentication, and connect to databases seamlessly.",
    'Docker & DevOps': "🤖 AI Summary: Simplify deployment by containerizing your apps. This course explains how Docker works and how to automate your workflow, ensuring your code runs exactly the same everywhere.",
    'TypeScript': "🤖 AI Summary: Add super-powers to your JavaScript with strong typing. You'll catch bugs before they happen and write more maintainable, reliable code for enterprise applications.",
    
    // Medical
    'Anatomy': "🤖 AI Summary: A comprehensive deep-dive into the human body structure. You'll explore muscular, skeletal, and organ systems with high-yield clinical correlations for immediate application.",
    'Pharmacology': "🤖 AI Summary: Understand how drugs interact with the human body. This course simplifies complex drug mechanisms, side effects, and interactions, making it easy to remember for clinical practice.",
    'Pathology': "🤖 AI Summary: Explore the causes and effects of diseases. We break down cellular adaptations, inflammation, and neoplasia, connecting textbook theory to real-world patient diagnoses.",
    'Clinical Examination': "🤖 AI Summary: Master the art of the physical exam. Step-by-step video guides will teach you how to accurately assess patients, interpret signs, and formulate a clinical diagnosis.",
    'Radiology Basics': "🤖 AI Summary: Learn to read X-rays, CTs, and MRIs like a pro. This visual-heavy course trains your eye to spot abnormalities quickly and accurately in emergency and routine settings.",
    'Emergency Medicine': "🤖 AI Summary: Fast-paced critical care training. Learn the exact protocols for stabilizing patients, managing trauma, and making rapid decisions in high-stakes environments."
  };

  const defaultSummary = `🤖 AI Summary: A comprehensive guide to mastering ${courseName}. This course breaks down complex topics into easy-to-understand modules, providing practical examples and hands-on exercises to accelerate your learning journey.`;

  // Pull domain and richer data from courseCurriculum if present
  const curriculumEntry = courseCurriculum[courseName];

  return {
    title: courseName,
    domain: curriculumEntry?.domain,
    aiSummary: curriculumEntry?.aiSummary || aiSummaries[courseName] || defaultSummary,
    modules: curriculumEntry?.modules || defaultModules,
    instructor: curriculumEntry?.instructor || 'SkillSwap Expert Community'
  };
};

export const getMessages = (roomId) => {
  const db = getDB();
  db.messages = db.messages || {};
  if (!db.messages[roomId]) {
    return [
      { id: 1, text: "Hey! Let's swap some skills.", sender: "System", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isMe: false },
    ];
  }
  return db.messages[roomId];
};

export const sendMessage = (roomId, message) => {
  const db = getDB();
  db.messages = db.messages || {};
  if (!db.messages[roomId]) {
    db.messages[roomId] = [
      { id: 1, text: "Hey! Let's swap some skills.", sender: "System", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isMe: false }
    ];
  }
  db.messages[roomId].push(message);
  saveDB(db);
  return db.messages[roomId];
};

export const updateCourseProgress = (courseName, progressPct, user) => {
  const db = getDB();
  db.userProgress = db.userProgress || {};
  
  if (user && user.email && db.userProgress[user.email]) {
    const userProg = db.userProgress[user.email];
    const item = userProg.find(p => p.skill === courseName);
    if (item) {
      item.progress = progressPct;
      saveDB(db);
      return;
    }
  }

  // Fallback if not tracking per-user
  const updateInList = (list) => {
    if (!list) return false;
    const item = list.find(p => p.skill === courseName);
    if (item) {
      item.progress = progressPct;
      return true;
    }
    return false;
  }

  if (!updateInList(db.engineeringProgress)) {
    updateInList(db.medicalProgress);
  }
  
  saveDB(db);
};

// ===== User Stats System =====

const USER_STATS_KEY = 'skillswap_user_stats';

const getStatsStore = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_STATS_KEY) || '{}');
  } catch {
    return {};
  }
};

const saveStatsStore = (store) => {
  localStorage.setItem(USER_STATS_KEY, JSON.stringify(store));
};

/**
 * Returns initial zeroed-out stats for a new user.
 */
const freshStats = (role) => ({
  role: role || 'engineering',
  overallProficiency: 0,         // 0–100 %
  skillsMastered: 0,             // count of verified skills
  studyStreakDays: 0,             // consecutive days
  lastActiveDate: null,          // ISO date string
  sessionsCompleted: 0,          // zoom / chat sessions
  assessmentsPassed: 0,          // assessments with >=80%
  swapsCompleted: 0,             // request-swap accepted
  tasksCompletedToday: [],       // task IDs completed today
  taskDate: null,                // YYYY-MM-DD for today's task tracking
  skillProgress: {},             // { skillName: 0-100 }
  createdAt: new Date().toISOString(),
});

/**
 * Get or create stats for a user identified by email.
 */
export const getUserStats = (user) => {
  if (!user?.email) return freshStats(user?.role);
  const store = getStatsStore();
  if (!store[user.email]) {
    store[user.email] = freshStats(user.role);
    saveStatsStore(store);
  }
  return store[user.email];
};

/**
 * Save updated stats back to localStorage.
 */
export const saveUserStats = (user, stats) => {
  if (!user?.email) return;
  const store = getStatsStore();
  store[user.email] = stats;
  saveStatsStore(store);
};

/**
 * Recalculate derived stats (proficiency) from skill progress map.
 * Call after any skill progress update.
 */
export const recalcStats = (stats) => {
  const values = Object.values(stats.skillProgress || {});
  if (values.length === 0) {
    stats.overallProficiency = 0;
  } else {
    stats.overallProficiency = Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
  }
  return stats;
};

/**
 * Update streak: increments if last active was yesterday; resets if gap > 1 day; no-op if today.
 */
export const updateStreak = (user) => {
  if (!user?.email) return;
  const stats = getUserStats(user);
  const today = new Date().toISOString().slice(0, 10);

  if (stats.lastActiveDate === today) return stats; // already counted today

  if (stats.lastActiveDate) {
    const last = new Date(stats.lastActiveDate);
    const now = new Date(today);
    const diffDays = Math.round((now - last) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      stats.studyStreakDays = (stats.studyStreakDays || 0) + 1;
    } else if (diffDays > 1) {
      stats.studyStreakDays = 1; // streak broken, restart
    }
  } else {
    stats.studyStreakDays = 1; // first ever login
  }

  stats.lastActiveDate = today;
  saveUserStats(user, stats);
  return stats;
};

/**
 * Record a completed assessment (must have passed ≥80%).
 * Grants skill proficiency boost and increments skillsMastered if first time.
 */
export const recordAssessmentPassed = (user, skillName) => {
  if (!user?.email || !skillName) return;
  const stats = getUserStats(user);
  const prev = stats.skillProgress[skillName] || 0;
  stats.skillProgress[skillName] = Math.max(prev, 80); // at least 80%
  stats.assessmentsPassed = (stats.assessmentsPassed || 0) + 1;

  // Count as mastered if >= 80
  const masteredCount = Object.values(stats.skillProgress).filter(v => v >= 80).length;
  stats.skillsMastered = masteredCount;

  recalcStats(stats);
  saveUserStats(user, stats);
  return stats;
};

/**
 * Record a swap/session (chat opened or zoom started).
 */
export const recordSession = (user, type = 'chat', targetSkill = null) => {
  if (!user?.email) return;
  const stats = getUserStats(user);
  
  // Calculate dynamic increment based on current proficiency (diminishing returns)
  const getIncrement = (current) => Math.max(1, Math.round(5 - (current / 25)));

  if (type === 'zoom') {
    stats.sessionsCompleted = (stats.sessionsCompleted || 0) + 1;
    if (targetSkill) {
      const current = stats.skillProgress[targetSkill] || 0;
      stats.skillProgress[targetSkill] = Math.min(100, current + getIncrement(current));
    }
  } else {
    stats.swapsCompleted = (stats.swapsCompleted || 0) + 1;
    if (targetSkill) {
      const current = stats.skillProgress[targetSkill] || 0;
      stats.skillProgress[targetSkill] = Math.min(100, current + Math.max(1, getIncrement(current) - 1));
    }
  }
  const masteredCount = Object.values(stats.skillProgress).filter(v => v >= 80).length;
  stats.skillsMastered = masteredCount;
  recalcStats(stats);
  saveUserStats(user, stats);
  return stats;
};

/**
 * Complete a daily task. Tasks reset each calendar day.
 */
export const completeDailyTask = (user, taskId, targetSkill = null) => {
  if (!user?.email || !taskId) return;
  const stats = getUserStats(user);
  const today = new Date().toISOString().slice(0, 10);

  // Reset tasks if it's a new day
  if (stats.taskDate !== today) {
    stats.tasksCompletedToday = [];
    stats.taskDate = today;
  }

  if (!stats.tasksCompletedToday.includes(taskId)) {
    stats.tasksCompletedToday.push(taskId);
    
    // Completing a task boosts the practiced skill dynamically based on current level
    if (targetSkill) {
      const current = stats.skillProgress[targetSkill] || 0;
      const increment = Math.max(1, Math.round(4 - (current / 30)));
      stats.skillProgress[targetSkill] = Math.min(100, current + increment);
      recalcStats(stats);
    }
  }

  saveUserStats(user, stats);
  return stats;
};

/**
 * Update a specific skill's progress percent manually (e.g. from course modal).
 */
export const updateSkillProgress = (user, skillName, pct) => {
  if (!user?.email || !skillName) return;
  const stats = getUserStats(user);
  stats.skillProgress[skillName] = Math.max(0, Math.min(100, pct));
  const masteredCount = Object.values(stats.skillProgress).filter(v => v >= 80).length;
  stats.skillsMastered = masteredCount;
  recalcStats(stats);
  saveUserStats(user, stats);
  return stats;
};

/**
 * Get today's task completion array (resets daily).
 */
export const getTodayTasks = (user) => {
  if (!user?.email) return [];
  const stats = getUserStats(user);
  const today = new Date().toISOString().slice(0, 10);
  if (stats.taskDate !== today) return [];
  return stats.tasksCompletedToday || [];
};

