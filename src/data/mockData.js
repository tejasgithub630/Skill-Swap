export const engineeringMatches = [
  { id: 1, mySkill: 'Java', wantSkill: 'DSA', user: 'Alex Chen', matchScore: 95, avatar: 'AC' },
  { id: 2, mySkill: 'React', wantSkill: 'Node.js', user: 'Sarah Jenkins', matchScore: 88, avatar: 'SJ' },
  { id: 3, mySkill: 'Python', wantSkill: 'System Design', user: 'David Kim', matchScore: 82, avatar: 'DK' },
  { id: 4, mySkill: 'TypeScript', wantSkill: 'Docker', user: 'Priya Sharma', matchScore: 79, avatar: 'PS' },
];

export const medicalMatches = [
  { id: 1, mySkill: 'Anatomy', wantSkill: 'Pharmacology', user: 'Dr. Emily Rose', matchScore: 92, avatar: 'ER' },
  { id: 2, mySkill: 'Pathology', wantSkill: 'Clinical Skills', user: 'James Wilson', matchScore: 85, avatar: 'JW' },
  { id: 3, mySkill: 'Cardiology', wantSkill: 'Radiology', user: 'Dr. Mia Patel', matchScore: 78, avatar: 'MP' },
];

export const engineeringGroups = [
  { id: 1, name: 'Web Dev Mastery', members: 1240, joined: true, description: 'HTML, CSS, JS & modern frameworks', icon: '💻', posts: 34 },
  { id: 2, name: 'DSA Interview Prep', members: 3420, joined: false, description: 'Crack FAANG with structured DSA practice', icon: '🧩', posts: 120 },
  { id: 3, name: 'AI/ML Enthusiasts', members: 890, joined: true, description: 'Machine learning papers & projects', icon: '🤖', posts: 58 },
  { id: 4, name: 'System Design Hub', members: 2100, joined: false, description: 'Scalable architecture & system design', icon: '🏗️', posts: 76 },
  { id: 5, name: 'Open Source Collab', members: 670, joined: false, description: 'Contribute to real-world OSS projects', icon: '🌐', posts: 22 },
  { id: 6, name: 'Cloud & DevOps', members: 1500, joined: false, description: 'AWS, GCP, Docker, Kubernetes', icon: '☁️', posts: 45 },
];

export const medicalGroups = [
  { id: 1, name: 'USMLE Step 1 Prep', members: 2100, joined: true, description: 'High-yield study strategies for Step 1', icon: '📖', posts: 89 },
  { id: 2, name: 'Clinical Case Discussions', members: 1560, joined: true, description: 'Real patient cases for bedside learning', icon: '🏥', posts: 43 },
  { id: 3, name: 'Surgical Skills', members: 420, joined: false, description: 'Suturing, laparoscopy & OR prep', icon: '🔬', posts: 18 },
  { id: 4, name: 'Pharmacology Deep Dive', members: 980, joined: false, description: 'Drug mechanisms, interactions & mnemonics', icon: '💊', posts: 37 },
  { id: 5, name: 'Radiology Reads', members: 530, joined: false, description: 'X-rays, CT scans & MRI interpretation', icon: '🩻', posts: 29 },
  { id: 6, name: 'Research & Publications', members: 310, joined: false, description: 'Medical writing, journals & grants', icon: '📝', posts: 12 },
];

export const engineeringRecommendations = [
  { title: 'Frontend Architecture', level: 'Intermediate', duration: '4 weeks', tag: 'Hot 🔥' },
  { title: 'Backend Scaling with Node.js', level: 'Advanced', duration: '6 weeks', tag: 'Trending' },
  { title: 'System Design Patterns', level: 'Advanced', duration: '8 weeks', tag: 'Must-learn' },
  { title: 'Docker & Kubernetes', level: 'Intermediate', duration: '3 weeks', tag: 'New' },
  { title: 'GraphQL APIs', level: 'Beginner', duration: '2 weeks', tag: 'Popular' },
];

export const medicalRecommendations = [
  { title: 'Basic Physiology Revision', level: 'Beginner', duration: '2 weeks', tag: 'Foundation' },
  { title: 'Intermediate Pathology', level: 'Intermediate', duration: '4 weeks', tag: 'Hot 🔥' },
  { title: 'Advanced Diagnostics', level: 'Advanced', duration: '6 weeks', tag: 'Must-learn' },
  { title: 'Clinical Pharmacology', level: 'Intermediate', duration: '3 weeks', tag: 'Trending' },
  { title: 'ECG Interpretation', level: 'Beginner', duration: '1 week', tag: 'Quick Win' },
];

export const engineeringProgress = [
  { skill: 'Data Structures & Algorithms', progress: 75, target: 100, category: 'Core CS' },
  { skill: 'React.js & Ecosystem', progress: 90, target: 100, category: 'Frontend' },
  { skill: 'System Design', progress: 40, target: 100, category: 'Architecture' },
  { skill: 'Node.js & REST APIs', progress: 65, target: 100, category: 'Backend' },
  { skill: 'Docker & DevOps', progress: 20, target: 100, category: 'Infrastructure' },
  { skill: 'TypeScript', progress: 55, target: 100, category: 'Language' },
];

export const medicalProgress = [
  { skill: 'Anatomy', progress: 85, target: 100, category: 'Preclinical' },
  { skill: 'Pharmacology', progress: 60, target: 100, category: 'Preclinical' },
  { skill: 'Pathology', progress: 30, target: 100, category: 'Preclinical' },
  { skill: 'Clinical Examination', progress: 70, target: 100, category: 'Clinical' },
  { skill: 'Radiology Basics', progress: 45, target: 100, category: 'Clinical' },
  { skill: 'Emergency Medicine', progress: 25, target: 100, category: 'Clinical' },
];
