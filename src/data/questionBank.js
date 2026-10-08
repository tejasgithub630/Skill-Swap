// src/data/questionBank.js
// Comprehensive, authentic question bank system for SkillSwap
// Ensures related questions for related courses (No mixing!) and supports all current and new skills.

import { engineeringBanks } from './questionBanks/engineering.js';
import { engineeringPart2Banks } from './questionBanks/engineeringPart2.js';
import { medicalBanks } from './questionBanks/medical.js';
import { medicalPart2Banks } from './questionBanks/medicalPart2.js';
import { medicalPart3Banks } from './questionBanks/medicalPart3.js';

// Combine all domain banks
export const allQuestionBanks = {
  ...engineeringBanks,
  ...engineeringPart2Banks,
  ...medicalBanks,
  ...medicalPart2Banks,
  ...medicalPart3Banks,
};

// Helper to sort questions by difficulty: Easy -> Medium -> Hard
const sortAndTag = (questions) => {
  const difficultyWeight = { 'Easy': 1, 'BEGINNER': 1, 'Medium': 2, 'INTERMEDIATE': 2, 'Hard': 3, 'ADVANCED': 3 };
  return [...questions].sort((a, b) => {
    const wA = difficultyWeight[a.level || a.difficulty] || 2;
    const wB = difficultyWeight[b.level || b.difficulty] || 2;
    return wA - wB;
  });
};

// Curated Alias Map to prevent any cross-topic mixing (e.g. Java vs JavaScript)
const ALIAS_MAP = {
  // Programming & Engineering
  'java': 'Java',
  'core java': 'Java',
  'java programming': 'Java',
  'javascript': 'JavaScript',
  'js': 'JavaScript',
  'react': 'React',
  'react.js': 'React',
  'reactjs': 'React',
  'react.js & ecosystem': 'React',
  'frontend architecture': 'React',
  'node': 'Node.js',
  'nodejs': 'Node.js',
  'node.js': 'Node.js',
  'express': 'Node.js',
  'node.js & rest apis': 'Node.js',
  'backend scaling with node.js': 'Node.js',
  'typescript': 'TypeScript',
  'ts': 'TypeScript',
  'python': 'Python',
  'py': 'Python',
  'docker': 'Docker',
  'docker & devops': 'Docker',
  'k8s': 'Kubernetes',
  'kubernetes': 'Kubernetes',
  'system design': 'System Design',
  'system design patterns': 'System Design',
  'sql': 'SQL',
  'postgresql': 'SQL',
  'postgres': 'SQL',
  'database': 'SQL',
  'relational database': 'SQL',
  'c++': 'C++',
  'cpp': 'C++',
  'golang': 'Go',
  'go': 'Go',
  'algorithms': 'Algorithms',
  'data structures': 'Algorithms',
  'data structures & algorithms': 'Algorithms',
  'dsa': 'Algorithms',

  // Medical Tracks
  'anatomy': 'Anatomy',
  'pharmacology': 'Pharmacology',
  'clinical pharmacology': 'Pharmacology',
  'cardiology': 'Cardiology',
  'ecg': 'Cardiology',
  'ecg interpretation': 'Cardiology',
  'pathology': 'Pathology',
  'radiology': 'Radiology',
  'radiology basics': 'Radiology',
  'emergency medicine': 'Emergency Medicine',
  'emergency': 'Emergency Medicine',
  'clinical examination': 'Clinical Examination',
  'advanced diagnostics': 'Clinical Examination',
  'neurology': 'Neurology',
  'internal medicine': 'Internal Medicine',
  'basic physiology revision': 'Internal Medicine',
  'surgery': 'Surgery',
};

// Generates 20 authentic, relevant questions for newly created or unmapped skills
const generateAdaptiveCourseQuestions = (topic, domain = 'ENGINEERING') => {
  const isMed = domain === 'MEDICAL' || /med|clin|surg|cardio|path|pharm|anat|ped|neuro|radio/i.test(topic);

  if (isMed) {
    return sortAndTag([
      // Easy (1-7)
      { level: 'Easy', q: `In clinical patient evaluation of ${topic}, what constitutes the initial baseline evaluation?`, options: [`Comprehensive clinical history, physical examination, and vital sign assessment relevant to ${topic}`, `Immediate invasive exploratory surgery without workup`, `Empiric administration of high-dose sedatives`, `Discharging patient without documentation`], a: `Comprehensive clinical history, physical examination, and vital sign assessment relevant to ${topic}` },
      { level: 'Easy', q: `What physiological regulatory principle underlies normal organ homeostasis in ${topic}?`, options: [`Negative feedback mechanisms maintaining physiological equilibrium`, `Random unbuffered hormonal fluctuations`, `Permanent metabolic uncoupling`, `Unchecked cellular proliferation`], a: `Negative feedback mechanisms maintaining physiological equilibrium` },
      { level: 'Easy', q: `What is considered the gold standard laboratory or diagnostic screening study in ${topic}?`, options: [`Targeted objective biomarker assay or high-resolution clinical imaging`, `Subjective patient intuition alone`, `Non-calibrated pulse palpation`, `Random urine dipstick test`], a: `Targeted objective biomarker assay or high-resolution clinical imaging` },
      { level: 'Easy', q: `Which standard precaution is essential to prevent nosocomial pathogen transmission in ${topic}?`, options: [`Strict hand hygiene, sterile barrier precautions, and aseptic technique`, `Reusing disposable syringes`, `Bypassing personal protective equipment (PPE)`, `Recapping needles manually`], a: `Strict hand hygiene, sterile barrier precautions, and aseptic technique` },
      { level: 'Easy', q: `What clinical parameter is continuously monitored to detect acute hemodynamic decompensation in ${topic}?`, options: [`Blood pressure, heart rate, oxygen saturation, and urine output`, `Hair tensile strength`, `Fasting lipid profile every 15 minutes`, `Skin color pigmentation index`], a: `Blood pressure, heart rate, oxygen saturation, and urine output` },
      { level: 'Easy', q: `What ethical principle dictates obtaining informed consent from competent patients before interventions in ${topic}?`, options: [`Patient Autonomy and informed decision-making`, `Physician Paternalism exclusively`, `Utilitarian speed mandates`, `Institutional financial priority`], a: `Patient Autonomy and informed decision-making` },
      { level: 'Easy', q: `What is the first step in resuscitation when managing an unstable patient presenting in ${topic}?`, options: [`Assessment and stabilization of Airway, Breathing, and Circulation (ABCs)`, `Ordering outpatient magnetic resonance imaging`, `Obtaining a comprehensive family genealogy`, `Scheduling elective physical therapy`], a: `Assessment and stabilization of Airway, Breathing, and Circulation (ABCs)` },

      // Medium (8-14)
      { level: 'Medium', q: `What is the primary pathophysiological mechanism causing organ dysfunction in ${topic}?`, options: [`Microvascular endothelial injury, tissue ischemia, and dysregulated inflammation`, `Benign physiological adaptation without consequence`, `Immediate spontaneous tissue regeneration`, `Excessive dietary hydration`], a: `Microvascular endothelial injury, tissue ischemia, and dysregulated inflammation` },
      { level: 'Medium', q: `In evidence-based clinical guidelines for ${topic}, what defines first-line pharmacotherapy?`, options: [`Guideline-directed medical therapy proven to reduce morbidity and mortality in randomized trials`, `High-dose experimental compounds without safety data`, `Homeopathic remedies exclusively`, `Surgical ablation in all non-emergency presentations`], a: `Guideline-directed medical therapy proven to reduce morbidity and mortality in randomized trials` },
      { level: 'Medium', q: `What diagnostic imaging or functional test provides the highest specificity for assessing acute complications in ${topic}?`, options: [`Protocolized cross-sectional CT or MRI with contrast enhancement when renal function permits`, `Plain film radiography without collimation`, `Diagnostic laparotomy empirically`, `Single-lead rhythm strip`], a: `Protocolized cross-sectional CT or MRI with contrast enhancement when renal function permits` },
      { level: 'Medium', q: `How should drug dosing regimens be modified in patients with co-morbid renal failure requiring therapy in ${topic}?`, options: [`Dose reduction or interval prolongation calculated from estimated Glomerular Filtration Rate (eGFR)`, `Administering double the standard dose to force filtration`, `Withholding all medical interventions permanently`, `Administering medication with meals only`], a: `Dose reduction or interval prolongation calculated from estimated Glomerular Filtration Rate (eGFR)` },
      { level: 'Medium', q: `What clinical decision rule or risk score is standardized to stratify disease severity in ${topic}?`, options: [`Validated multi-parameter risk scores calibrated against 30-day clinical outcomes`, `Subjective physician intuition alone`, `Number of days since previous clinic visit`, `Patient body mass index exclusively`], a: `Validated multi-parameter risk scores calibrated against 30-day clinical outcomes` },
      { level: 'Medium', q: `What electrolyte derangement is most critically associated with lethal cardiac conduction failure in ${topic}?`, options: [`Severe Hyperkalemia or Hypokalemia inducing fatal arrhythmias`, `Mild isolated hyperphosphatemia`, `Trace zinc deficiency`, `Subclinical asymptomatic hyperuricemia`], a: `Severe Hyperkalemia or Hypokalemia inducing fatal arrhythmias` },
      { level: 'Medium', q: `What infection control protocol is indicated when a patient with suspected contagious airborne disease presents in ${topic}?`, options: [`Airborne isolation in a Negative-Pressure Room with N95 respiratory protection`, `Standard droplet precautions in an open bay`, `Placing patient in positive pressure hallway`, `Immediate transfer without mask`], a: `Airborne isolation in a Negative-Pressure Room with N95 respiratory protection` },

      // Hard (15-20)
      { level: 'Hard', q: `What molecular biomarker or immunohistochemical profile confirms refractory or malignant progression in ${topic}?`, options: [`Targeted genomic sequencing identifying driver mutations and high microvascular density`, `Routine complete blood count with normal differential`, `Negative blood culture after 24 hours`, `Normal urinalysis`], a: `Targeted genomic sequencing identifying driver mutations and high microvascular density` },
      { level: 'Hard', q: 'What is the recommended management when a patient develops refractory shock unresponsive to initial fluid resuscitation?', options: ['Initiation of titrated vasopressors (e.g. Norepinephrine) with continuous arterial line hemodynamic monitoring', 'Administering continuous hypotonic 5% dextrose boluses', 'Discontinuing all monitoring lines', 'Sedation without circulatory support'], a: 'Initiation of titrated vasopressors (e.g. Norepinephrine) with continuous arterial line monitoring' },
      { level: 'Hard', q: `What acute complication represents the primary cause of ICU mortality in decompensated ${topic}?`, options: [`Multiple Organ Dysfunction Syndrome (MODS) triggered by systemic inflammatory response (SIRS)`, `Mild superficial thrombophlebitis`, `Isolated drug-induced urticaria`, `Transient benign sinus tachycardia`], a: `Multiple Organ Dysfunction Syndrome (MODS) triggered by systemic inflammatory response (SIRS)` },
      { level: 'Hard', q: `What pharmacokinetic challenge occurs with highly protein-bound therapeutic agents in ${topic} when hypoalbuminemia is present?`, options: [`Increased free (active) drug fraction leading to unexpected clinical toxicity despite normal total drug levels`, `Zero bioavailability in the GI tract`, `Immediate hepatic clearance without receptor binding`, `Conversion of drug into an inactive precipitate`], a: `Increased free (active) drug fraction leading to unexpected clinical toxicity despite normal total drug levels` },
      { level: 'Hard', q: `What cellular signaling cascade is chronically activated during pathological tissue remodeling and fibrosis in ${topic}?`, options: [`TGF-beta / Smad pathway driving myofibroblast differentiation and extracellular matrix deposition`, `Insulin receptor substrate dephosphorylation exclusively`, `Complete inhibition of vascular endothelial growth`, `Apoptotic caspase-3 permanent silence`], a: `TGF-beta / Smad pathway driving myofibroblast differentiation and extracellular matrix deposition` },
      { level: 'Hard', q: `What constitutes guideline-directed secondary prevention to mitigate recurrent clinical events in ${topic}?`, options: [`Structured multi-drug neurohormonal blockade, lifestyle optimization, and scheduled surveillance monitoring`, `Single-dose antibiotic prophylaxis at discharge`, `Complete cessation of medical follow-up once symptoms resolve`, `Bed rest for six consecutive months`], a: `Structured multi-drug neurohormonal blockade, lifestyle optimization, and scheduled surveillance monitoring` },
    ]);
  }

  // Engineering & Technology Skills
  return sortAndTag([
    // Easy (1-7)
    { level: 'Easy', q: `What is the core architectural purpose of ${topic} in modern software engineering?`, options: [`Providing structured, maintainable, and scalable implementation standards for ${topic}`, `Replacing the need for underlying computer hardware`, `Eliminating all software testing requirements`, `Forcing synchronous single-threaded bottlenecks`], a: `Providing structured, maintainable, and scalable implementation standards for ${topic}` },
    { level: 'Easy', q: `Which tool or command is conventionally used to initialize a new project workspace in ${topic}?`, options: [`Official package manager CLI initialization (e.g. init / create commands)`, `Manually typing raw binary opcodes`, `Recompiling the operating system kernel`, `Copying unformatted code snippets`], a: `Official package manager CLI initialization (e.g. init / create commands)` },
    { level: 'Easy', q: `Why is automated unit testing critical when developing applications with ${topic}?`, options: [`Verifies deterministic behavior, catches regression bugs early, and documents API contracts`, `Increases runtime CPU usage in production`, `Eliminates the need for source code version control`, `Prevents code from running in containers`], a: `Verifies deterministic behavior, catches regression bugs early, and documents API contracts` },
    { level: 'Easy', q: `What is the standard convention for managing environment configuration secrets in ${topic}?`, options: [`Externalized environment variables (.env files) excluded from version control`, `Hardcoding passwords directly in public Git repositories`, `Embedding API tokens in client-side HTML tags`, `Sending cleartext credentials via URL query parameters`], a: `Externalized environment variables (.env files) excluded from version control` },
    { level: 'Easy', q: `What role does Version Control (Git) play in the lifecycle of ${topic} codebases?`, options: [`Tracks historical revisions, facilitates concurrent team collaboration, and supports branch isolation`, `Compiles source code into assembly binaries`, `Serves web pages to end users`, `Replaces persistent SQL databases`], a: `Tracks historical revisions, facilitates concurrent team collaboration, and supports branch isolation` },
    { level: 'Easy', q: `What data exchange format is standard for HTTP REST APIs interfacing with ${topic}?`, options: ['JSON (JavaScript Object Notation)', 'Raw compiled bytecode', 'Uncompressed BMP binary stream', 'Proprietary assembly instructions'], a: 'JSON (JavaScript Object Notation)' },
    { level: 'Easy', q: `What does Continuous Integration (CI) automate in ${topic} development workflows?`, options: ['Automated building, linting, and running test suites upon every code commit/pull request', 'Manual client billing invoicing', 'Writing application business logic automatically', 'Disabling server firewall rules'], a: 'Automated building, linting, and running test suites upon every code commit/pull request' },

    // Medium (8-14)
    { level: 'Medium', q: `How does ${topic} optimize resource allocation during heavy concurrent request processing?`, options: [`Non-blocking asynchronous I/O and connection pooling mechanisms`, `Spawning unbounded OS threads for every incoming byte`, `Hardcoding fixed 10-second sleeps between requests`, `Bypassing memory buffers entirely`], a: `Non-blocking asynchronous I/O and connection pooling mechanisms` },
    { level: 'Medium', q: `What design pattern is recommended in ${topic} to decouple business logic from infrastructure?`, options: [`Dependency Injection and Hexagonal / Clean Architecture boundaries`, `God Object monolithic anti-pattern`, `Direct global variable mutations across packages`, `Hardcoded static network sockets`], a: `Dependency Injection and Hexagonal / Clean Architecture boundaries` },
    { level: 'Medium', q: `How does caching in ${topic} accelerate data retrieval and minimize latency?`, options: ['Stores frequently requested data in fast in-memory key-value stores (e.g. Redis)', 'Duplicates all database tables on client local storage', 'Reroutes requests through international VPN tunnels', 'Compresses memory into cold magnetic tape archives'], a: 'Stores frequently requested data in fast in-memory key-value stores (e.g. Redis)' },
    { level: 'Medium', q: `What security defense mitigates Injection and Cross-Site Scripting (XSS) risks in ${topic}?`, options: ['Strict input sanitization, parameterized queries, and output encoding', 'Disabling all HTTPS SSL certificates', 'Allowing unrestricted raw HTML execution', 'Storing user passwords in plaintext'], a: 'Strict input sanitization, parameterized queries, and output encoding' },
    { level: 'Medium', q: `How are long-running asynchronous tasks handled scalably in ${topic}?`, options: ['Offloaded to background worker queues (e.g. BullMQ, Celery) via message brokers', 'Executed synchronously on the main UI request thread', 'Terminated after 500 milliseconds automatically', 'Written to local browser cookies'], a: 'Offloaded to background worker queues (e.g. BullMQ, Celery) via message brokers' },
    { level: 'Medium', q: `What monitoring metrics provide primary insight into service health in ${topic}?`, options: ['The Four Golden Signals: Latency, Traffic (RPS), Errors, and Saturation (CPU/RAM)', 'Total lines of code written per month', 'Screen pixel resolution of developer monitors', 'Number of files in the root folder'], a: 'The Four Golden Signals: Latency, Traffic (RPS), Errors, and Saturation (CPU/RAM)' },
    { level: 'Medium', q: `What is the purpose of database migrations in ${topic} deployments?`, options: ['Declarative, version-controlled schema transformations applied safely across environments', 'Exporting table data to Excel sheets manually', 'Deleting the entire database upon every release', 'Converting relational tables into flat text files'], a: 'Declarative, version-controlled schema transformations applied safely across environments' },

    // Hard (15-20)
    { level: 'Hard', q: `What concurrency hazard occurs when two processes in ${topic} concurrently read-modify-write shared state?`, options: ['Race Condition leading to data corruption; mitigated via mutexes or optimistic locking', 'Memory compaction failure', 'Network interface card hardware failure', 'Automatic compiler optimization fault'], a: 'Race Condition leading to data corruption; mitigated via mutexes or optimistic locking' },
    { level: 'Hard', q: `How does the Circuit Breaker pattern enhance system resilience in ${topic} distributed architectures?`, options: ['Detects failing downstream dependencies and trips open to fast-fail requests, preventing cascading collapse', 'Shuts down server power during memory spikes', 'Reroutes network packets through tor nodes', 'Encrypts database connections with two-factor authentication'], a: 'Detects failing dependencies and trips open to fast-fail requests, preventing cascading collapse' },
    { level: 'Hard', q: `Under extreme traffic, how does Rate Limiting with a Token Bucket algorithm protect ${topic} services?`, options: ['Allows controlled bursts while enforcing an average rate limit, returning HTTP 429 when depleted', 'Drops all incoming network connections unconditionally', 'Reboots the load balancer when capacity reaches 80%', 'Blocks user IP addresses permanently after 5 requests'], a: 'Allows controlled bursts while enforcing an average rate limit, returning HTTP 429 when depleted' },
    { level: 'Hard', q: `What strategy is employed in ${topic} to achieve zero-downtime deployments?`, options: ['Blue-Green Deployments or Canary Releases with automated rollback on error threshold breach', 'Taking the production server offline for 2 hours during peak hours', 'Directly editing production code via SSH', 'Deleting old container images before building new ones'], a: 'Blue-Green Deployments or Canary Releases with automated rollback on error threshold breach' },
    { level: 'Hard', q: `How do distributed tracing tools (e.g. OpenTelemetry) trace requests across ${topic} microservices?`, options: ['Injecting and propagating unique Trace and Span IDs across HTTP/gRPC communication headers', 'Parsing system syslog timestamps after server crashes', 'Recording video of the server terminal output', 'Querying database row locks sequentially'], a: 'Injecting and propagating unique Trace and Span IDs across HTTP/gRPC communication headers' },
    { level: 'Hard', q: `What memory management pitfall in ${topic} causes gradual Out-Of-Memory (OOM) crashes in long-running processes?`, options: ['Unintentional memory retention via dangling event listeners, unclosed streams, or global closures', 'Stack overflow during standard iteration', 'Excessive compile-time optimization flags', 'Hardware CPU cache invalidation'], a: 'Unintentional memory retention via dangling event listeners, unclosed streams, or global closures' },
  ]);
};

/**
 * Main API: Returns strictly related, authentic, high-quality questions for any given topic.
 * Guarantees NO MIXING (e.g. Java will NEVER return JavaScript).
 * Ensures all courses and new skills receive 20-22 structured questions with 80% passing cutoff.
 */
export const getQuestionsForTopic = (topic, role = 'engineering') => {
  if (!topic || typeof topic !== 'string') {
    return generateAdaptiveCourseQuestions('Core Engineering', role);
  }

  const rawTopic = topic.trim();
  const lower = rawTopic.toLowerCase();

  // 1. Direct exact key match (case-insensitive)
  for (const key of Object.keys(allQuestionBanks)) {
    if (key.toLowerCase() === lower) {
      return sortAndTag(allQuestionBanks[key]);
    }
  }

  // 2. Curated Alias Lookup (Prevents Java/JavaScript, React/Reactive, etc. collisions)
  if (ALIAS_MAP[lower] && allQuestionBanks[ALIAS_MAP[lower]]) {
    return sortAndTag(allQuestionBanks[ALIAS_MAP[lower]]);
  }

  // 3. Strict Word-Boundary Match (e.g. \bJava\b will NOT match "JavaScript")
  for (const key of Object.keys(allQuestionBanks)) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-zA-Z0-9])${escaped}([^a-zA-Z0-9]|$)`, 'i');
    if (regex.test(rawTopic)) {
      return sortAndTag(allQuestionBanks[key]);
    }
  }

  // 4. Intelligent Context-Aware Fallback for new/unmapped skills
  const domain = role === 'medical' || /med|clin|cardio|path|pharm|anat/i.test(rawTopic) 
    ? 'MEDICAL' 
    : 'ENGINEERING';

  return generateAdaptiveCourseQuestions(rawTopic, domain);
};

export default getQuestionsForTopic;
