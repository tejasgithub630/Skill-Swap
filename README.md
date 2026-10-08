# SkillSwap — Production Full-Stack Platform

SkillSwap is an intelligent peer-to-peer knowledge exchange platform built for engineers and medical professionals. This upgrade transitions the system from a prototype into a production-grade full-stack web application featuring an ORM-backed relational database, a multi-factor semantic skill matching engine, strict profile security controls, and a proctored assessment environment.

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: React 19, Vite, React Router, Lucide Icons, Vanilla CSS Design System with dark/light theming.
- **Backend**: Node.js, Express.js (ESM), Sequelize ORM, JWT Authentication, bcryptjs password hashing.
- **Database**: Relational SQL Engine (SQLite with foreign-key constraints enabled via Sequelize; compatible with MySQL 8+ / PostgreSQL via Sequelize dialect config).
- **Proctoring**: HTML5 Fullscreen API, DOM event shielding, and real-time backend audit logging.

```
skillswap/
├── server/                    # Node.js + Express backend
│   ├── database/              # SQLite SQL database storage
│   ├── src/
│   │   ├── config/            # Sequelize database connection
│   │   ├── matching/          # Semantic skill matching engine
│   │   ├── middleware/        # JWT authentication middleware
│   │   ├── models/            # Relational models & associations
│   │   ├── routes/            # REST API endpoints (auth, profile, matches, exams)
│   │   ├── index.js           # Express server entry point (port 5000)
│   │   └── seed.js            # Initial dataset seeder
│   └── package.json
├── src/                       # React 19 Vite application
│   ├── components/            # UI components (Navbar, AssessmentPopup, ChatRoom, etc.)
│   ├── pages/                 # EngineeringDashboard, MedicalDashboard, Profile, Auth
│   ├── data/                  # Curated question banks and course structures
│   └── vite.config.js         # Vite configuration with /api reverse proxy
└── package.json
```

---

## 🗄️ Relational Database Schema

The database architecture is designed with strict relational integrity:

1. **`users`**: Primary accounts (`id` [UUID], `name`, `email` [UNIQUE], `password_hash`, `role`, `is_active`, timestamps).
2. **`profiles`**: User metadata (`id`, `user_id` [FK], `bio`, `phone`, `location`, `education`, `experience_years`, `career_goal`, `availability`, `profile_picture`).
3. **`domains`**: Skill categories (`id`, `name`, `description`).
4. **`skills`**: Normalized skills repository (`id`, `domain_id` [FK], `name`, `normalized_name`, `parent_skill_id` [Self-referencing FK]).
5. **`skill_relationships`**: Semantic taxonomy links (`id`, `skill_id` [FK], `related_skill_id` [FK], `relationship_type` [PARENT/CHILD/RELATED/SPECIALIZATION/COMPLEMENTARY], `relationship_strength` [0.0 - 1.0]).
6. **`user_skills`**: Skills users can teach (`id`, `user_id` [FK], `skill_id` [FK], `proficiency_level`, `years_experience`, `is_primary`).
7. **`user_wanted_skills`**: Skills users want to learn (`id`, `user_id` [FK], `skill_id` [FK], `priority`).
8. **`matches`**: Recorded match history and scoring breakdowns (`id`, `user_id` [FK], `matched_user_id` [FK], `match_score`, `match_explanation`, timestamps).
9. **`exams`**: Certification exam definitions (`id`, `domain_id` [FK], `title`, `duration_minutes`, `passing_percentage`).
10. **`exam_questions`**: Question bank items (`id`, `exam_id` [FK], `question`, options A-D, `correct_option`, `difficulty`).
11. **`exam_attempts`**: Individual exam sessions (`id`, `exam_id` [FK], `user_id` [FK], `score`, `status`, timestamps).
12. **`exam_security_events`**: Proctoring audit trail (`id`, `attempt_id` [FK], `user_id` [FK], `event_type`, `metadata`, `created_at`).

---

## 🧠 Semantic Skill Matching Engine

Unlike naive exact-string matching or fake percentages, the SkillSwap matching engine (`server/src/matching/engine.js`) evaluates genuine compatibility across two users:

### Algorithm Breakdown
1. **Direct Match Scoring**:
   - Compares User A's offered skills against User B's desired skills.
   - Evaluates User B's offered skills against User A's desired skills.
   - Exact string matches yield a base score of `1.0`.
2. **Taxonomy & Semantic Relationship Expansion**:
   - If no direct match exists, the engine queries `skill_relationships` for semantic connections (e.g. `System Design` relates to `Distributed Systems` at strength `0.85`; `Cardiology` relates to `Anatomy` at strength `0.75`).
   - Indirect relationships contribute weighted points proportional to their taxonomy strength.
3. **Reciprocal Exchange Multiplier**:
   - A swap requires mutual benefit. If both User A can help User B *and* User B can help User A, a **Reciprocal Bonus (+30%)** is applied.
   - Pure one-way offerings receive lower composite weights.
4. **Experience & Domain Alignment**:
   - Evaluates role alignment and experience compatibility.
5. **Transparent Match Reasoning**:
   - Every generated match returns a human-readable explanation (e.g., *"Strong match! You can teach React which they want. They can teach Docker which you want. Excellent reciprocal exchange!"*).
   - Displayed transparently directly on each match card.

---

## 🔒 Strict Profile Security Controls

To ensure identity integrity and prevent credential fraud:
- **Read-Only Fields**: **Full Name** and **Email Address** are permanently locked after registration.
- **Frontend Safeguards**: Displayed with clear `(Read-only)` status badges; form controls for name and email cannot be submitted.
- **Backend API Enforcement**: The `PUT /api/profile` endpoint validates incoming payloads. Any attempt to modify `name` or `email` immediately returns a `400 Bad Request` (`{ "error": "Name and email cannot be changed" }`).
- **Editable Metadata**: Users can freely update their `bio`, `phone`, `location`, `education`, `availability`, `experience_years`, and profile image.

---

## 🛡️ Proctored Assessment Security System

The browser-based examination module (`AssessmentPopup.jsx`) enforces a secure testing environment:

- **Fullscreen Lockdown**: The exam requires fullscreen mode (`requestFullscreen()`). Exiting fullscreen triggers a recorded violation warning.
- **Clipboard & Action Blocking**: Copying (`copy`), pasting (`paste`), cutting (`cut`), and right-click context menus (`contextmenu`) are intercepted and blocked via `e.preventDefault()`.
- **Keyboard Shortcut Shielding**: Developer shortcuts (such as `Ctrl+C`, `Ctrl+V`, `Ctrl+X`, `Ctrl+A`, `Cmd+C`, `Cmd+V`) are trapped and suppressed.
- **Tab & Window Switch Tracking**: Listens for the HTML5 `visibilitychange` event. If a candidate leaves the exam tab, the violation is instantly flagged.
- **Audit Logging**: Every detected violation issues an authenticated POST request to `/api/exams/:id/security-events`, appending an immutable log entry to the `exam_security_events` table for forensic analysis.
- **Passing Standard**: Requires a verified score of ≥ 80% to earn verified skill credentials.

---

## 🚀 Getting Started & Execution Instructions

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### 1. Start the Backend API Server
```bash
cd server
npm install
node src/seed.js     # Seeds initial domains, skills, relationships, and demo users
node src/index.js    # Starts the Express server on http://localhost:5000
```

### 2. Start the Frontend Application
In a separate terminal window at the project root:
```bash
npm install
npm run dev          # Starts the Vite development server (proxies /api -> http://localhost:5000)
```

Open your browser to `http://localhost:5173` (or the URL printed by Vite).

---

## 👥 Demo Credentials

The database comes pre-seeded with test accounts across both domains:

| Role | Email | Password | Primary Skills | Wanted Skills |
| :--- | :--- | :--- | :--- | :--- |
| **Engineering** | `alex@example.com` | `password123` | React, Node.js, System Design | Docker, Go |
| **Engineering** | `sarah@example.com` | `password123` | Docker, Kubernetes, AWS | React, TypeScript |
| **Medical** | `emily@example.com` | `password123` | Pharmacology, Cardiology | Radiology, Pathology |

*Note: Logging in with `alex@example.com` will immediately calculate a reciprocal 100% semantic match with `Sarah Jenkins` (React ↔ Docker).*
