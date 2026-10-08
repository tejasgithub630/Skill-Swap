import sequelize from './config/database.js';
import crypto from 'crypto';
import { 
  User, 
  Profile, 
  Domain, 
  Skill, 
  SkillAlias, 
  SkillRequest, 
  SkillRelationship, 
  Assessment, 
  AssessmentQuestion, 
  Certification, 
  UserSkill 
} from './models/index.js';
import { hashPassword } from './utils/auth.js';
import { slugify, normalizeSkillName } from './services/skillNormalization.js';

const seed = async () => {
  await sequelize.sync({ force: true });
  console.log('Database synced (force: true) for Dynamic Skill Taxonomy & Certifications');

  // Domains
  const engineeringDomain = await Domain.create({
    name: 'Engineering',
    description: 'Software Engineering, Cloud Infrastructure, Distributed Systems & Modern Languages'
  });

  const medicalDomain = await Domain.create({
    name: 'Medical',
    description: 'Clinical Medicine, Cardiology, Pharmacology, Diagnostic Radiology, and Surgery'
  });

  // Admin Account
  const password_hash = await hashPassword('password123');
  const adminUser = await User.create({
    name: 'Platform Administrator',
    email: 'admin@skillswap.com',
    password_hash,
    role: 'admin',
    is_admin: true
  });
  await Profile.create({
    user_id: adminUser.id,
    bio: 'SkillSwap Taxonomy Administrator and Lead Certification Proctor.',
    location: 'Headquarters'
  });

  // Helper to create canonical skill + aliases + assessment
  const createCanonicalSkill = async ({
    canonical_name,
    category,
    domain,
    description,
    aliases = [],
    questions = []
  }) => {
    const slug = slugify(canonical_name);
    const domain_id = domain === 'ENGINEERING' ? engineeringDomain.id : medicalDomain.id;

    const skill = await Skill.create({
      canonical_name,
      slug,
      description,
      category,
      domain,
      domain_id,
      normalized_name: normalizeSkillName(canonical_name),
      status: 'ACTIVE'
    });

    // Aliases
    for (const a of aliases) {
      await SkillAlias.create({
        skill_id: skill.id,
        alias: a,
        normalized_alias: normalizeSkillName(a)
      });
    }

    // Assessment
    const assessment = await Assessment.create({
      skill_id: skill.id,
      title: `${canonical_name} Official Certification Assessment`,
      description: `Comprehensive evaluation of core theory, practical implementation, and production scenarios in ${canonical_name}.`,
      domain,
      passing_percentage: 80,
      duration_minutes: 25,
      max_attempts: 3,
      cooldown_hours: 24,
      validity_months: 24, // 2 year expiration
      status: 'ACTIVE'
    });

    // Questions
    for (const q of questions) {
      await AssessmentQuestion.create({
        assessment_id: assessment.id,
        skill_id: skill.id,
        question_type: q.type || 'MCQ',
        question_text: q.text,
        difficulty: q.difficulty || 'INTERMEDIATE',
        options: JSON.stringify(q.options),
        correct_answer: q.correct_answer,
        explanation: q.explanation || 'Verification of core competence and real-world application.',
        marks: q.marks || 1,
        starter_code: q.starter_code || null,
        test_cases: q.test_cases ? JSON.stringify(q.test_cases) : null
      });
    }

    return { skill, assessment };
  };

  // ===================== CANONICAL SKILLS SETUP =====================

  // 1. React
  const { skill: reactSkill, assessment: reactAssessment } = await createCanonicalSkill({
    canonical_name: 'React',
    category: 'Frontend Framework',
    domain: 'ENGINEERING',
    description: 'Declarative component-based UI library for web and native interfaces.',
    aliases: ['React.js', 'ReactJS', 'react js'],
    questions: [
      {
        type: 'MCQ',
        difficulty: 'BEGINNER',
        text: 'What is the primary benefit of the React Virtual DOM?',
        options: [
          'It batches and minimizes direct DOM manipulation by computing minimal diffs',
          'It eliminates the need for JavaScript execution entirely',
          'It connects directly to the client SQL database',
          'It converts JSX into compiled C++ binary machine code'
        ],
        correct_answer: 'It batches and minimizes direct DOM manipulation by computing minimal diffs',
        explanation: 'The Virtual DOM keeps a lightweight representation in memory and reconciles changes efficiently.'
      },
      {
        type: 'MCQ',
        difficulty: 'INTERMEDIATE',
        text: 'In React 18+, when should you utilize the `useMemo` hook?',
        options: [
          'To cache expensive calculation results across re-renders when dependencies change',
          'To replace every single function declaration inside components',
          'To execute side-effects like window resize listeners',
          'To persist global state across browser refreshes'
        ],
        correct_answer: 'To cache expensive calculation results across re-renders when dependencies change',
        explanation: 'useMemo memoizes values to prevent re-computation during renders unless dependencies have changed.'
      },
      {
        type: 'CODING',
        difficulty: 'ADVANCED',
        text: 'What rule must be strictly followed when writing custom React hooks?',
        options: [
          'Hooks must only be called at the top level and not inside loops, conditions, or nested functions',
          'Hooks must always return an array with exactly two elements',
          'Hooks can only be declared inside classical class components',
          'Hooks must run asynchronously and return a Promise'
        ],
        correct_answer: 'Hooks must only be called at the top level and not inside loops, conditions, or nested functions',
        explanation: 'The top-level rule guarantees that React preserves hook state correctly between renders.'
      }
    ]
  });

  // 2. JavaScript
  const { skill: jsSkill } = await createCanonicalSkill({
    canonical_name: 'JavaScript',
    category: 'Programming Language',
    domain: 'ENGINEERING',
    description: 'Dynamic scripting language powering the modern web and Node.js runtimes.',
    aliases: ['JS', 'Java Script', 'ECMAScript', 'ES6'],
    questions: [
      {
        type: 'MCQ',
        difficulty: 'BEGINNER',
        text: 'Which statement accurately describes JavaScript event loop architecture?',
        options: [
          'It continuously polls the call stack and executes microtasks before macrotasks',
          'It spawns a new OS kernel thread for each event listener callback',
          'It pauses program execution until network requests return',
          'It executes callbacks in random chronological order'
        ],
        correct_answer: 'It continuously polls the call stack and executes microtasks before macrotasks',
        explanation: 'The event loop processes microtasks (Promises) before moving to the next macrotask in the queue.'
      },
      {
        type: 'MCQ',
        difficulty: 'INTERMEDIATE',
        text: 'What is the key functional difference between `==` and `===` in JavaScript?',
        options: [
          '`===` checks both value and type without performing implicit type coercion',
          '`==` checks memory addresses while `===` checks primitive values',
          '`==` works exclusively on numbers',
          'There is no functional difference in modern ES6+'
        ],
        correct_answer: '`===` checks both value and type without performing implicit type coercion',
        explanation: 'Strict equality (===) does not perform type conversion before comparison.'
      }
    ]
  });

  // 3. TypeScript
  const { skill: tsSkill } = await createCanonicalSkill({
    canonical_name: 'TypeScript',
    category: 'Programming Language',
    domain: 'ENGINEERING',
    description: 'Typed superset of JavaScript that compiles to plain JavaScript.',
    aliases: ['TS', 'Type Script'],
    questions: [
      {
        type: 'MCQ',
        difficulty: 'INTERMEDIATE',
        text: 'What does the TypeScript `readonly` modifier enforce on interface properties?',
        options: [
          'Properties cannot be reassigned after the object is initialized',
          'Properties are automatically encrypted in browser memory',
          'Properties are hidden from JSON.stringify output',
          'Properties can only contain numerical values'
        ],
        correct_answer: 'Properties cannot be reassigned after the object is initialized',
        explanation: 'Readonly prevents mutating property values after initial creation.'
      }
    ]
  });

  // 4. Docker
  const { skill: dockerSkill, assessment: dockerAssessment } = await createCanonicalSkill({
    canonical_name: 'Docker',
    category: 'DevOps & Containers',
    domain: 'ENGINEERING',
    description: 'Platform for developing, shipping, and running containerized applications.',
    aliases: ['Docker Engine', 'Containerization'],
    questions: [
      {
        type: 'MCQ',
        difficulty: 'BEGINNER',
        text: 'What is the architectural difference between a Docker container and a Virtual Machine?',
        options: [
          'Containers share the host OS kernel and are much more lightweight than VMs with guest OSs',
          'Containers require hardware virtualization (VT-x) extensions enabled in BIOS',
          'VMs cannot run Linux distributions',
          'Containers emulate physical BIOS firmware directly'
        ],
        correct_answer: 'Containers share the host OS kernel and are much more lightweight than VMs with guest OSs',
        explanation: 'Containers virtualize at the operating system level, sharing kernel namespaces and cgroups.'
      },
      {
        type: 'MCQ',
        difficulty: 'ADVANCED',
        text: 'Why are multi-stage builds recommended in production Dockerfiles?',
        options: [
          'To separate build tools from runtime dependencies, drastically reducing final image size and attack surface',
          'To allow running Windows and Linux binaries simultaneously in one container',
          'To bypass Docker daemon security restrictions',
          'To automatically compile GPU drivers into the image'
        ],
        correct_answer: 'To separate build tools from runtime dependencies, drastically reducing final image size and attack surface',
        explanation: 'Multi-stage builds leave compiler SDKs and build caches behind in discarded intermediate layers.'
      }
    ]
  });

  // 5. Kubernetes
  const { skill: k8sSkill } = await createCanonicalSkill({
    canonical_name: 'Kubernetes',
    category: 'Cloud Infrastructure',
    domain: 'ENGINEERING',
    description: 'Automated container orchestration system for deployment, scaling, and management.',
    aliases: ['K8s', 'Kube'],
    questions: [
      {
        type: 'MCQ',
        difficulty: 'INTERMEDIATE',
        text: 'What is the smallest deployable computing unit that can be created in Kubernetes?',
        options: [
          'Pod',
          'Deployment',
          'ReplicaSet',
          'Namespace'
        ],
        correct_answer: 'Pod',
        explanation: 'A Pod encapsulates one or more co-located containers that share network and storage.'
      }
    ]
  });

  // 6. Go
  const { skill: goSkill } = await createCanonicalSkill({
    canonical_name: 'Go',
    category: 'Programming Language',
    domain: 'ENGINEERING',
    description: 'Fast, statically typed, compiled language engineered at Google for scalable systems.',
    aliases: ['Golang', 'Go Language'],
    questions: [
      {
        type: 'MCQ',
        difficulty: 'INTERMEDIATE',
        text: 'How does Go achieve lightweight concurrency compared to traditional OS threads?',
        options: [
          'Through goroutines managed by the Go runtime M:N scheduler in user space',
          'By running an internal Node.js event loop',
          'By disallowing memory sharing between processes',
          'Through single-threaded asynchronous promises'
        ],
        correct_answer: 'Through goroutines managed by the Go runtime M:N scheduler in user space',
        explanation: 'Goroutines have minimal stack overhead (~2KB) and are multiplexed across OS threads by the Go runtime.'
      }
    ]
  });

  // 7. System Design
  const { skill: sdSkill, assessment: sdAssessment } = await createCanonicalSkill({
    canonical_name: 'System Design',
    category: 'Software Architecture',
    domain: 'ENGINEERING',
    description: 'Architecting scalable, fault-tolerant, high-concurrency distributed systems.',
    aliases: ['Distributed Systems', 'Software Architecture', 'Scalability'],
    questions: [
      {
        type: 'MCQ',
        difficulty: 'ADVANCED',
        text: 'According to the CAP theorem, what trade-off must a distributed database make during network partitioning (P)?',
        options: [
          'It must choose between Consistency (C) and Availability (A)',
          'It must sacrifice Partition tolerance immediately',
          'It cannot support horizontal scaling',
          'It is forced to use single-node SQLite'
        ],
        correct_answer: 'It must choose between Consistency (C) and Availability (A)',
        explanation: 'In the presence of network partitions, a system can either return stale data (Availability) or error/block (Consistency).'
      },
      {
        type: 'SCENARIO',
        difficulty: 'ADVANCED',
        text: 'You need to prevent thundering herd cache stampedes on an e-commerce flash sale endpoint. What is the best pattern?',
        options: [
          'Use mutual exclusion locks (mutex) or probabilistic early expiration (XFetch)',
          'Delete the cache key every 5 seconds to force reloads',
          'Increase the HTTP keep-alive timeout to 24 hours',
          'Disable caching entirely and let all requests hit PostgreSQL'
        ],
        correct_answer: 'Use mutual exclusion locks (mutex) or probabilistic early expiration (XFetch)',
        explanation: 'Locking ensures only one worker rebuilds the cache while others wait or serve the slightly stale value.'
      }
    ]
  });

  // 8. Python
  const { skill: pythonSkill } = await createCanonicalSkill({
    canonical_name: 'Python',
    category: 'Programming Language',
    domain: 'ENGINEERING',
    description: 'High-level language known for readability, data analysis, and AI/ML libraries.',
    aliases: ['Py', 'Python 3'],
    questions: [
      {
        type: 'MCQ',
        difficulty: 'BEGINNER',
        text: 'What mechanism in CPython enforces that only one thread executes Python bytecode at once?',
        options: [
          'The Global Interpreter Lock (GIL)',
          'The Bytecode Synchronizer',
          'The Garbage Collector Lock',
          'The JIT Compiler Thread'
        ],
        correct_answer: 'The Global Interpreter Lock (GIL)',
        explanation: 'The GIL prevents multithreaded CPython from executing bytecode concurrently across CPU cores.'
      }
    ]
  });

  // 9. Java
  const { skill: javaSkill } = await createCanonicalSkill({
    canonical_name: 'Java',
    category: 'Programming Language',
    domain: 'ENGINEERING',
    description: 'Object-oriented, class-based programming language running on the JVM.',
    aliases: ['Java 17', 'Java 21', 'Core Java'],
    questions: [
      {
        type: 'MCQ',
        difficulty: 'INTERMEDIATE',
        text: 'What memory management generation in JVM handles short-lived object allocations?',
        options: [
          'Young Generation (Eden Space)',
          'Tenured/Old Generation',
          'Metaspace',
          'Code Cache'
        ],
        correct_answer: 'Young Generation (Eden Space)',
        explanation: 'New objects are allocated in Eden and cleared rapidly by minor garbage collection.'
      }
    ]
  });

  // ===================== MEDICAL CANONICAL SKILLS =====================

  // 10. Pharmacology
  const { skill: pharmSkill, assessment: pharmAssessment } = await createCanonicalSkill({
    canonical_name: 'Pharmacology',
    category: 'Clinical Therapeutics',
    domain: 'MEDICAL',
    description: 'Science of drugs, mechanisms of action, pharmacokinetics, and therapeutic applications.',
    aliases: ['Clinical Pharmacology', 'Drug Mechanisms'],
    questions: [
      {
        type: 'MCQ',
        difficulty: 'INTERMEDIATE',
        text: 'Which pharmacokinetic parameter represents the apparent volume into which a drug distributes relative to plasma concentration?',
        options: [
          'Volume of Distribution (Vd)',
          'Clearance (CL)',
          'Bioavailability (F)',
          'Elimination Half-Life (t1/2)'
        ],
        correct_answer: 'Volume of Distribution (Vd)',
        explanation: 'Vd quantifies the distribution of drug throughout body fluids and tissues.'
      },
      {
        type: 'SCENARIO',
        difficulty: 'ADVANCED',
        text: 'A patient on chronic warfarin therapy is started on amiodarone for atrial fibrillation. What clinical intervention is required?',
        options: [
          'Anticipate cytochrome P450 inhibition: reduce warfarin dose by 30-50% and closely monitor INR',
          'Double the warfarin dose immediately',
          'Discontinue all anticoagulation permanently',
          'No change is necessary as these medications have zero metabolic overlap'
        ],
        correct_answer: 'Anticipate cytochrome P450 inhibition: reduce warfarin dose by 30-50% and closely monitor INR',
        explanation: 'Amiodarone inhibits CYP2C9 and CYP3A4, significantly potentiating warfarin anticoagulant effects.'
      }
    ]
  });

  // 11. Cardiology
  const { skill: cardioSkill, assessment: cardioAssessment } = await createCanonicalSkill({
    canonical_name: 'Cardiology',
    category: 'Clinical Speciality',
    domain: 'MEDICAL',
    description: 'Diagnosis and management of cardiovascular disorders and hemodynamics.',
    aliases: ['Heart Health', 'Cardiac Medicine'],
    questions: [
      {
        type: 'MCQ',
        difficulty: 'INTERMEDIATE',
        text: 'ST-segment elevation in ECG leads II, III, and aVF indicates infarction in which myocardial region?',
        options: [
          'Inferior wall (Right Coronary Artery territory)',
          'Anterior wall (Left Anterior Descending artery)',
          'Lateral wall (Circumflex artery)',
          'Posterior wall'
        ],
        correct_answer: 'Inferior wall (Right Coronary Artery territory)',
        explanation: 'Leads II, III, and aVF look at the inferior anatomical surface of the left ventricle.'
      }
    ]
  });

  // 12. Radiology
  const { skill: radioSkill } = await createCanonicalSkill({
    canonical_name: 'Radiology',
    category: 'Diagnostic Imaging',
    domain: 'MEDICAL',
    description: 'Medical imaging modalities including X-ray, CT, MRI, and ultrasound.',
    aliases: ['Medical Imaging', 'Diagnostic Radiology', 'MRI', 'CT Scan'],
    questions: [
      {
        type: 'MCQ',
        difficulty: 'INTERMEDIATE',
        text: 'Which imaging modality is the gold standard for acute non-contrast evaluation of intracranial hemorrhage?',
        options: [
          'Non-contrast Head CT',
          'Abdominal Ultrasound',
          'Standing Chest Radiograph',
          'Fluoroscopic Swallow Study'
        ],
        correct_answer: 'Non-contrast Head CT',
        explanation: 'Non-contrast CT is rapid, widely available, and highly sensitive for acute hyperdense intracranial blood.'
      }
    ]
  });

  // 13. Pathology
  const { skill: pathSkill, assessment: pathAssessment } = await createCanonicalSkill({
    canonical_name: 'Pathology',
    category: 'Laboratory Medicine',
    domain: 'MEDICAL',
    description: 'Study of disease etiology, cellular changes, histology, and pathophysiology.',
    aliases: ['Histopathology', 'Cellular Pathology'],
    questions: [
      {
        type: 'MCQ',
        difficulty: 'INTERMEDIATE',
        text: 'What type of necrosis is characteristic of ischemic infarction in solid organs except the brain?',
        options: [
          'Coagulative necrosis',
          'Liquefactive necrosis',
          'Caseous necrosis',
          'Fat necrosis'
        ],
        correct_answer: 'Coagulative necrosis',
        explanation: 'Coagulative necrosis preserves cellular outlines for several days as proteins denature.'
      }
    ]
  });

  // 14. Emergency Medicine
  const { skill: erSkill } = await createCanonicalSkill({
    canonical_name: 'Emergency Medicine',
    category: 'Acute Care',
    domain: 'MEDICAL',
    description: 'Rapid diagnostic and resuscitation care for acute illness and trauma.',
    aliases: ['ER', 'Trauma Care', 'Resuscitation'],
    questions: [
      {
        type: 'SCENARIO',
        difficulty: 'ADVANCED',
        text: 'In tension pneumothorax, what immediate clinical decompression procedure is life-saving before radiologic imaging?',
        options: [
          'Immediate needle thoracostomy followed by tube thoracostomy',
          'Waiting for portable chest X-ray confirmation',
          'Endotracheal intubation with high positive end-expiratory pressure',
          'Administering IV loop diuretics'
        ],
        correct_answer: 'Immediate needle thoracostomy followed by tube thoracostomy',
        explanation: 'Tension pneumothorax is a clinical diagnosis requiring immediate decompression to restore venous return.'
      }
    ]
  });

  // 15. Anatomy
  const { skill: anatSkill } = await createCanonicalSkill({
    canonical_name: 'Anatomy',
    category: 'Basic Science',
    domain: 'MEDICAL',
    description: 'Gross and microscopic anatomical structures of the human body.',
    aliases: ['Human Anatomy', 'Gross Anatomy'],
    questions: [
      {
        type: 'MCQ',
        difficulty: 'BEGINNER',
        text: 'Which cranial nerve is primarily responsible for sensory innervation to the face and motor innervation to muscles of mastication?',
        options: [
          'Trigeminal Nerve (CN V)',
          'Facial Nerve (CN VII)',
          'Glossopharyngeal Nerve (CN IX)',
          'Vagus Nerve (CN X)'
        ],
        correct_answer: 'Trigeminal Nerve (CN V)',
        explanation: 'Cranial nerve V supplies facial sensation through V1, V2, V3 and controls chewing muscles.'
      }
    ]
  });

  // ===================== SKILL RELATIONSHIPS =====================
  await SkillRelationship.bulkCreate([
    { skill_id: jsSkill.id, related_skill_id: reactSkill.id, relationship_type: 'RELATED', relationship_strength: 0.9 },
    { skill_id: tsSkill.id, related_skill_id: reactSkill.id, relationship_type: 'COMPLEMENTARY', relationship_strength: 0.95 },
    { skill_id: dockerSkill.id, related_skill_id: k8sSkill.id, relationship_type: 'COMPLEMENTARY', relationship_strength: 0.95 },
    { skill_id: sdSkill.id, related_skill_id: goSkill.id, relationship_type: 'RELATED', relationship_strength: 0.8 },
    { skill_id: sdSkill.id, related_skill_id: k8sSkill.id, relationship_type: 'RELATED', relationship_strength: 0.8 },
    { skill_id: cardioSkill.id, related_skill_id: pharmSkill.id, relationship_type: 'RELATED', relationship_strength: 0.85 },
    { skill_id: anatSkill.id, related_skill_id: erSkill.id, relationship_type: 'RELATED', relationship_strength: 0.85 },
    { skill_id: radioSkill.id, related_skill_id: cardioSkill.id, relationship_type: 'COMPLEMENTARY', relationship_strength: 0.85 }
  ]);

  // ===================== USER PROFILES & CERTIFICATIONS =====================

  // 1. Alex Chen (Engineering)
  const u1 = await User.create({ name: 'Alex Chen', email: 'alex@example.com', password_hash, role: 'engineering' });
  await Profile.create({
    user_id: u1.id,
    bio: 'Staff Engineer focused on scalable distributed systems.',
    career_goal: 'Engineering Leadership',
    location: 'San Francisco, CA',
    interests: JSON.stringify(['Distributed Systems', 'Cloud Architecture', 'High Concurrency'])
  });

  // Pre-issue Certification for React & System Design for Alex
  const cert1 = await Certification.create({
    user_id: u1.id,
    skill_id: reactSkill.id,
    assessment_id: reactAssessment.id,
    score: 88,
    proficiency_level: 'ADVANCED',
    certificate_number: 'SKILLSWAP-REACT-2026-100241',
    verification_token: crypto.randomUUID(),
    issued_at: new Date('2026-02-15'),
    expires_at: new Date('2028-02-15'),
    verification_status: 'VERIFIED'
  });

  const cert2 = await Certification.create({
    user_id: u1.id,
    skill_id: sdSkill.id,
    assessment_id: sdAssessment.id,
    score: 94,
    proficiency_level: 'EXPERT',
    certificate_number: 'SKILLSWAP-SYSTEM-DESIGN-2026-100242',
    verification_token: crypto.randomUUID(),
    issued_at: new Date('2026-03-01'),
    expires_at: new Date('2028-03-01'),
    verification_status: 'VERIFIED'
  });

  // UserSkills for Alex: React (Verified), System Design (Verified), Go (Self-Declared), Wants Docker & Java
  await UserSkill.bulkCreate([
    {
      user_id: u1.id,
      skill_id: reactSkill.id,
      proficiency_level: 'ADVANCED',
      verification_status: 'VERIFIED',
      certification_id: cert1.id,
      score: 88,
      verified_at: cert1.issued_at,
      expires_at: cert1.expires_at,
      is_teaching: true,
      is_wanting: false
    },
    {
      user_id: u1.id,
      skill_id: sdSkill.id,
      proficiency_level: 'EXPERT',
      verification_status: 'VERIFIED',
      certification_id: cert2.id,
      score: 94,
      verified_at: cert2.issued_at,
      expires_at: cert2.expires_at,
      is_teaching: true,
      is_wanting: false
    },
    {
      user_id: u1.id,
      skill_id: goSkill.id,
      proficiency_level: 'INTERMEDIATE',
      verification_status: 'SELF_DECLARED',
      is_teaching: true,
      is_wanting: false
    },
    {
      user_id: u1.id,
      skill_id: dockerSkill.id,
      proficiency_level: 'BEGINNER',
      verification_status: 'SELF_DECLARED',
      is_teaching: false,
      is_wanting: true
    },
    {
      user_id: u1.id,
      skill_id: javaSkill.id,
      proficiency_level: 'BEGINNER',
      verification_status: 'SELF_DECLARED',
      is_teaching: false,
      is_wanting: true
    }
  ]);

  // 2. Sarah Jenkins (Engineering)
  const u2 = await User.create({ name: 'Sarah Jenkins', email: 'sarah@example.com', password_hash, role: 'engineering' });
  await Profile.create({
    user_id: u2.id,
    bio: 'DevOps & Cloud architect passionate about containerization.',
    career_goal: 'DevOps Mastery',
    location: 'Seattle, WA',
    interests: JSON.stringify(['DevOps Automation', 'Cloud Native', 'Microservices'])
  });

  const cert3 = await Certification.create({
    user_id: u2.id,
    skill_id: dockerSkill.id,
    assessment_id: dockerAssessment.id,
    score: 96,
    proficiency_level: 'EXPERT',
    certificate_number: 'SKILLSWAP-DOCKER-2026-100310',
    verification_token: crypto.randomUUID(),
    issued_at: new Date('2026-01-20'),
    expires_at: new Date('2028-01-20'),
    verification_status: 'VERIFIED'
  });

  await UserSkill.bulkCreate([
    {
      user_id: u2.id,
      skill_id: dockerSkill.id,
      proficiency_level: 'EXPERT',
      verification_status: 'VERIFIED',
      certification_id: cert3.id,
      score: 96,
      verified_at: cert3.issued_at,
      expires_at: cert3.expires_at,
      is_teaching: true,
      is_wanting: false
    },
    {
      user_id: u2.id,
      skill_id: k8sSkill.id,
      proficiency_level: 'ADVANCED',
      verification_status: 'SELF_DECLARED',
      is_teaching: true,
      is_wanting: false
    },
    {
      user_id: u2.id,
      skill_id: reactSkill.id,
      proficiency_level: 'BEGINNER',
      verification_status: 'SELF_DECLARED',
      is_teaching: false,
      is_wanting: true
    }
  ]);

  // 3. Dr. Emily Rose (Medical)
  const u3 = await User.create({ name: 'Dr. Emily Rose', email: 'emily@example.com', password_hash, role: 'medical' });
  await Profile.create({
    user_id: u3.id,
    bio: 'Clinical Pharmacologist & cardiology specialist.',
    career_goal: 'Specialized Consultant',
    location: 'Philadelphia, PA',
    interests: JSON.stringify(['Cardiology Research', 'Clinical Pharmacology', 'Pharmacogenomics'])
  });

  const cert4 = await Certification.create({
    user_id: u3.id,
    skill_id: pharmSkill.id,
    assessment_id: pharmAssessment.id,
    score: 92,
    proficiency_level: 'EXPERT',
    certificate_number: 'SKILLSWAP-PHARMACOLOGY-2026-200101',
    verification_token: crypto.randomUUID(),
    issued_at: new Date('2026-02-10'),
    expires_at: new Date('2028-02-10'),
    verification_status: 'VERIFIED'
  });

  await UserSkill.bulkCreate([
    {
      user_id: u3.id,
      skill_id: pharmSkill.id,
      proficiency_level: 'EXPERT',
      verification_status: 'VERIFIED',
      certification_id: cert4.id,
      score: 92,
      verified_at: cert4.issued_at,
      expires_at: cert4.expires_at,
      is_teaching: true,
      is_wanting: false
    },
    {
      user_id: u3.id,
      skill_id: cardioSkill.id,
      proficiency_level: 'ADVANCED',
      verification_status: 'SELF_DECLARED',
      is_teaching: true,
      is_wanting: false
    },
    {
      user_id: u3.id,
      skill_id: pathSkill.id,
      proficiency_level: 'BEGINNER',
      verification_status: 'SELF_DECLARED',
      is_teaching: false,
      is_wanting: true
    }
  ]);

  // 4. Dr. James Wilson (Medical)
  const u4 = await User.create({ name: 'James Wilson', email: 'james@example.com', password_hash, role: 'medical' });
  await Profile.create({
    user_id: u4.id,
    bio: 'Resident physician sharing real clinical case studies.',
    career_goal: 'Chief Medical Resident',
    location: 'Baltimore, MD',
    interests: JSON.stringify(['Internal Medicine', 'Patient Safety', 'Clinical Diagnostics'])
  });

  const cert5 = await Certification.create({
    user_id: u4.id,
    skill_id: pathSkill.id,
    assessment_id: pathAssessment.id,
    score: 86,
    proficiency_level: 'ADVANCED',
    certificate_number: 'SKILLSWAP-PATHOLOGY-2026-200103',
    verification_token: crypto.randomUUID(),
    issued_at: new Date('2026-03-05'),
    expires_at: new Date('2028-03-05'),
    verification_status: 'VERIFIED'
  });

  await UserSkill.bulkCreate([
    {
      user_id: u4.id,
      skill_id: pathSkill.id,
      proficiency_level: 'ADVANCED',
      verification_status: 'VERIFIED',
      certification_id: cert5.id,
      score: 86,
      verified_at: cert5.issued_at,
      expires_at: cert5.expires_at,
      is_teaching: true,
      is_wanting: false
    },
    {
      user_id: u4.id,
      skill_id: pharmSkill.id,
      proficiency_level: 'BEGINNER',
      verification_status: 'SELF_DECLARED',
      is_teaching: false,
      is_wanting: true
    }
  ]);

  // 5. Elena Rostova with an active Skill Request
  const u5 = await User.create({ name: 'Elena Rostova', email: 'elena@example.com', password_hash, role: 'engineering' });
  await Profile.create({
    user_id: u5.id,
    bio: 'Systems programmer working on low-latency engines.',
    location: 'Boston, MA',
    interests: JSON.stringify(['Systems Programming', 'Low Latency', 'Compilers'])
  });

  // Seed sample pending skill request for admin review dashboard
  await SkillRequest.create({
    user_id: u5.id,
    requested_name: 'Rust',
    category: 'Systems Language',
    domain: 'ENGINEERING',
    description: 'Empowering everyone to build reliable and efficient software with memory safety without garbage collection.',
    justification: 'Widely adopted in webassembly, linux kernel development, and high-performance distributed systems.',
    reference_url: 'https://www.rust-lang.org',
    status: 'REQUESTED'
  });

  // 6. Python Expert for Test Case
  const u6 = await User.create({ name: 'Python Expert', email: 'python@example.com', password_hash, role: 'engineering' });
  await Profile.create({
    user_id: u6.id,
    bio: 'Senior Data Scientist and Python Architect.',
    location: 'New York, NY',
    sessions_conducted: 15,
    reliability_score: 0.98,
    rating_avg: 4.9,
    rating_count: 20
  });

  await UserSkill.bulkCreate([
    {
      user_id: u6.id,
      skill_id: pythonSkill.id,
      proficiency_level: 'EXPERT',
      verification_status: 'VERIFIED',
      is_teaching: true,
      is_wanting: false
    },
    {
      user_id: u6.id,
      skill_id: javaSkill.id,
      proficiency_level: 'BEGINNER',
      verification_status: 'SELF_DECLARED',
      is_teaching: false,
      is_wanting: true
    }
  ]);

  // 7. Java Expert for Test Case
  const u7 = await User.create({ name: 'Java Expert', email: 'java@example.com', password_hash, role: 'engineering' });
  await Profile.create({
    user_id: u7.id,
    bio: 'Principal Backend Engineer building high-scale Java services.',
    location: 'Austin, TX',
    sessions_conducted: 40,
    reliability_score: 1.0,
    rating_avg: 5.0,
    rating_count: 55
  });

  await UserSkill.bulkCreate([
    {
      user_id: u7.id,
      skill_id: javaSkill.id,
      proficiency_level: 'EXPERT',
      verification_status: 'VERIFIED',
      is_teaching: true,
      is_wanting: false
    },
    {
      user_id: u7.id,
      skill_id: pythonSkill.id,
      proficiency_level: 'BEGINNER',
      verification_status: 'SELF_DECLARED',
      is_teaching: false,
      is_wanting: true
    }
  ]);

  console.log('Seed completed successfully with Canonical Skills, Aliases, Assessments, and Pre-Certified Users!');
};

seed().catch(err => {
  console.error('Seed failed:', err);
});
