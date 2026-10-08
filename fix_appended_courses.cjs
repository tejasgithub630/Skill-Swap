const fs = require('fs');

let content = fs.readFileSync('src/data/courseCurriculum.js', 'utf8');

const updatedMissingCourses = `
  'Frontend Architecture': {
    title: 'Frontend Architecture',
    domain: 'ENGINEERING',
    category: 'Software Engineering',
    instructor: 'Engineering Team',
    aiSummary: '🤖 AI Summary: Master scalable frontend architecture, micro-frontends, module federation, and monorepo management for enterprise applications.',
    modules: [{
      id: 'fa_mod_1',
      title: 'Microfrontends & Monorepos',
      duration: '40 mins',
      completed: false,
      youtubeId: 'M7lc1UVf-VE',
      objectives: [
        'Understand the architecture of Micro-Frontends',
        'Implement Webpack Module Federation for independent deployments',
        'Manage monorepos efficiently using Turborepo or Nx'
      ],
      keyPoints: [
        'Micro-frontends allow independent teams to scale and deploy features without blocking each other.',
        'Webpack Module Federation enables sharing code dynamically at runtime.',
        'Monorepos simplify dependency management across multiple packages and apps.'
      ],
      timestamps: [
        { time: '00:00', label: 'Introduction to Micro-Frontends' },
        { time: '10:15', label: 'Monorepo Concepts (Turborepo/Nx)' },
        { time: '20:30', label: 'Webpack Module Federation Demo' },
        { time: '35:00', label: 'Deployment & CI/CD Pipelines' }
      ],
      quiz: {
        question: 'What is the primary benefit of Webpack Module Federation in a micro-frontend architecture?',
        options: ['It minifies all CSS files automatically', 'It allows multiple independent builds to form a single application at runtime', 'It replaces the Virtual DOM', 'It enforces strict typing across all components'],
        answer: 1,
        explanation: 'Module Federation allows JavaScript applications to dynamically load code from another application at runtime, which is the cornerstone of scalable micro-frontends.'
      }
    }]
  },
  'Backend Scaling with Node.js': {
    title: 'Backend Scaling with Node.js',
    domain: 'ENGINEERING',
    category: 'Backend',
    instructor: 'Engineering Team',
    aiSummary: '🤖 AI Summary: Master backend performance tuning, Node.js clustering, worker threads, and zero-downtime deployments using PM2.',
    modules: [{
      id: 'bs_mod_1',
      title: 'Clustering & PM2',
      duration: '45 mins',
      completed: false,
      youtubeId: 'M7lc1UVf-VE',
      objectives: [
        'Understand the single-threaded nature of Node.js and its limitations',
        'Implement the Cluster module to fork multiple worker processes',
        'Use PM2 for process management and zero-downtime reloads'
      ],
      keyPoints: [
        'Node.js runs on a single thread; clustering allows it to utilize multi-core systems by spawning worker processes.',
        'PM2 acts as a daemon process manager that handles automatic restarts and load balancing.',
        'Zero-downtime deployment is achieved by reloading workers one by one.'
      ],
      timestamps: [
        { time: '00:00', label: 'Node.js Threading Model' },
        { time: '12:00', label: 'The built-in Cluster Module' },
        { time: '25:30', label: 'Introduction to PM2' },
        { time: '38:45', label: 'Zero-Downtime Reloads in Production' }
      ],
      quiz: {
        question: 'How does the Node.js Cluster module improve performance on a multi-core CPU?',
        options: ['By executing JavaScript natively on the GPU', 'By forking the main process into multiple worker processes that share the same server port', 'By rewriting synchronous code to asynchronous', 'By increasing the V8 memory limit'],
        answer: 1,
        explanation: 'The Cluster module allows you to create child processes (workers) that run simultaneously and share the same server port, effectively multiplying the throughput across CPU cores.'
      }
    }]
  },
  'System Design Patterns': {
    title: 'System Design Patterns',
    domain: 'ENGINEERING',
    category: 'Architecture',
    instructor: 'Architecture Team',
    aiSummary: '🤖 AI Summary: Master enterprise patterns like CQRS, Event Sourcing, Circuit Breakers, and Saga for building resilient distributed systems.',
    modules: [{
      id: 'sdp_mod_1',
      title: 'CQRS & Event Sourcing',
      duration: '50 mins',
      completed: false,
      youtubeId: 'M7lc1UVf-VE',
      objectives: [
        'Separate read and write models using Command Query Responsibility Segregation (CQRS)',
        'Implement Event Sourcing to store application state as a sequence of events',
        'Understand eventual consistency and materialized views'
      ],
      keyPoints: [
        'CQRS allows independent scaling of read databases (optimized for queries) and write databases (optimized for transactions).',
        'Event Sourcing ensures complete auditability because the current state is derived by replaying a ledger of events.',
        'These patterns introduce eventual consistency, meaning reads might slightly lag behind writes.'
      ],
      timestamps: [
        { time: '00:00', label: 'What is CQRS?' },
        { time: '15:20', label: 'Designing the Write & Read Models' },
        { time: '28:10', label: 'Introduction to Event Sourcing' },
        { time: '42:50', label: 'Handling Eventual Consistency' }
      ],
      quiz: {
        question: 'In an Event Sourcing system, how is the current state of an entity determined?',
        options: ['By querying a traditional relational SQL table', 'By replaying the sequence of domain events that occurred for that entity', 'By asking a caching layer like Redis', 'By using a two-phase commit protocol'],
        answer: 1,
        explanation: 'Event Sourcing stores every change to state as an event. The current state is calculated by sequentially applying these historical events.'
      }
    }]
  },
  'GraphQL APIs': {
    title: 'GraphQL APIs',
    domain: 'ENGINEERING',
    category: 'Backend',
    instructor: 'API Team',
    aiSummary: '🤖 AI Summary: Master GraphQL schemas, resolvers, mutations, and solve the N+1 query problem using DataLoader.',
    modules: [{
      id: 'gql_mod_1',
      title: 'Schema Design & Resolvers',
      duration: '35 mins',
      completed: false,
      youtubeId: 'M7lc1UVf-VE',
      objectives: [
        'Design a strongly-typed GraphQL schema using SDL',
        'Write efficient resolvers for nested data fetching',
        'Solve the N+1 query performance bottleneck using DataLoader'
      ],
      keyPoints: [
        'GraphQL eliminates over-fetching and under-fetching by allowing clients to request exactly what they need.',
        'Every field in a GraphQL query is backed by a resolver function on the server.',
        'DataLoader batches and caches database queries within a single request to prevent the N+1 problem.'
      ],
      timestamps: [
        { time: '00:00', label: 'GraphQL vs REST' },
        { time: '08:45', label: 'Defining the Schema (SDL)' },
        { time: '18:20', label: 'Writing Resolvers & Mutations' },
        { time: '27:10', label: 'Optimizing with DataLoader' }
      ],
      quiz: {
        question: 'What performance issue does DataLoader primarily solve in GraphQL servers?',
        options: ['Memory leaks in long-running processes', 'The N+1 query problem by batching and caching database requests', 'Slow HTTP handshake times', 'Inefficient JSON parsing'],
        answer: 1,
        explanation: 'Because GraphQL resolvers execute independently for nested fields, fetching a list of items and their relations can cause hundreds of separate database queries (N+1). DataLoader batches these into a single query.'
      }
    }]
  },
  'Basic Physiology Revision': {
    title: 'Basic Physiology Revision',
    domain: 'MEDICAL',
    category: 'Preclinical',
    instructor: 'Medical Faculty',
    aiSummary: '🤖 AI Summary: Review core physiology concepts, cellular transport, membrane potentials, and homeostasis mechanisms.',
    modules: [{
      id: 'physio_mod_1',
      title: 'Cellular Physiology',
      duration: '30 mins',
      completed: false,
      youtubeId: 'M7lc1UVf-VE',
      objectives: [
        'Understand active and passive cellular transport mechanisms',
        'Calculate resting membrane potential using the Nernst equation',
        'Explain the role of the Na+/K+ ATPase pump in maintaining gradients'
      ],
      keyPoints: [
        'The Na+/K+ ATPase pump uses ATP to move 3 Na+ out and 2 K+ in, maintaining the electrochemical gradient.',
        'Resting membrane potential is primarily driven by K+ leak channels.',
        'Action potentials are triggered when voltage-gated Na+ channels open upon reaching the threshold potential.'
      ],
      timestamps: [
        { time: '00:00', label: 'Cellular Transport Basics' },
        { time: '09:15', label: 'The Na+/K+ ATPase Pump' },
        { time: '18:30', label: 'Resting Membrane Potential' },
        { time: '25:40', label: 'Action Potentials & Depolarization' }
      ],
      quiz: {
        question: 'Which ion is primarily responsible for establishing the resting membrane potential of a typical neuron?',
        options: ['Sodium (Na+)', 'Calcium (Ca2+)', 'Potassium (K+)', 'Chloride (Cl-)'],
        answer: 2,
        explanation: 'The resting membrane is highly permeable to Potassium (K+) due to leak channels. The efflux of K+ down its concentration gradient establishes the negative resting potential.'
      }
    }]
  },
  'Advanced Diagnostics': {
    title: 'Advanced Diagnostics',
    domain: 'MEDICAL',
    category: 'Clinical',
    instructor: 'Diagnostic Team',
    aiSummary: '🤖 AI Summary: Master complex diagnostic algorithms, structured differential formulation, and evidence-based test selection.',
    modules: [{
      id: 'diag_mod_1',
      title: 'Differential Diagnosis',
      duration: '45 mins',
      completed: false,
      youtubeId: 'M7lc1UVf-VE',
      objectives: [
        'Formulate a broad and structured differential diagnosis',
        'Apply the VINDICATE mnemonic to categorize etiologies',
        'Utilize pre-test probability and likelihood ratios to interpret test results'
      ],
      keyPoints: [
        'VINDICATE stands for Vascular, Infectious, Neoplastic, Degenerative, Iatrogenic/Intoxication, Congenital, Autoimmune, Traumatic, Endocrine.',
        'Pre-test probability dramatically affects the positive predictive value of any diagnostic test.',
        'Always rule out life-threatening ("can\'t miss") diagnoses first.'
      ],
      timestamps: [
        { time: '00:00', label: 'Clinical Reasoning & Heuristics' },
        { time: '12:30', label: 'The VINDICATE Mnemonic' },
        { time: '24:15', label: 'Bayes Theorem in Diagnostics' },
        { time: '38:00', label: 'Case Study: Undifferentiated Chest Pain' }
      ],
      quiz: {
        question: 'What does the "V" in the VINDICATE mnemonic stand for?',
        options: ['Viral', 'Vascular', 'Visceral', 'Vestibular'],
        answer: 1,
        explanation: 'Vascular. The VINDICATE mnemonic helps systematically brainstorm etiologies: Vascular, Infectious, Neoplastic, Degenerative, Iatrogenic/Intoxication, Congenital, Autoimmune, Traumatic, Endocrine.'
      }
    }]
  },
  'Clinical Pharmacology': {
    title: 'Clinical Pharmacology',
    domain: 'MEDICAL',
    category: 'Clinical',
    instructor: 'Pharmacy Team',
    aiSummary: '🤖 AI Summary: Deep dive into clinical drug applications, polypharmacy, cytochrome P450 interactions, and therapeutic monitoring.',
    modules: [{
      id: 'cpharm_mod_1',
      title: 'Drug-Drug Interactions',
      duration: '40 mins',
      completed: false,
      youtubeId: 'M7lc1UVf-VE',
      objectives: [
        'Identify major Cytochrome P450 (CYP) inducers and inhibitors',
        'Predict clinical consequences of co-administering interacting drugs',
        'Manage polypharmacy in elderly populations'
      ],
      keyPoints: [
        'CYP inducers (e.g., Rifampin, Phenytoin) accelerate metabolism, potentially reducing drug efficacy.',
        'CYP inhibitors (e.g., Amiodarone, Grapefruit juice) slow metabolism, increasing toxicity risks.',
        'Drugs with narrow therapeutic indices (e.g., Warfarin, Lithium) require stringent monitoring when altering regimens.'
      ],
      timestamps: [
        { time: '00:00', label: 'Pharmacokinetics Review' },
        { time: '11:20', label: 'Cytochrome P450 System' },
        { time: '22:45', label: 'Major Inducers vs Inhibitors' },
        { time: '32:10', label: 'Clinical Case: Warfarin Interactions' }
      ],
      quiz: {
        question: 'If a patient on stable Warfarin therapy begins taking a strong CYP450 inhibitor, what is the expected clinical effect?',
        options: ['Decreased INR and risk of thrombosis', 'Increased INR and risk of bleeding', 'No change in coagulation profile', 'Immediate anaphylaxis'],
        answer: 1,
        explanation: 'A CYP inhibitor slows the metabolism of Warfarin, causing drug accumulation. This leads to a supra-therapeutic INR and a dangerously increased risk of hemorrhage.'
      }
    }]
  },
  'ECG Interpretation': {
    title: 'ECG Interpretation',
    domain: 'MEDICAL',
    category: 'Clinical',
    instructor: 'Cardiology Team',
    aiSummary: '🤖 AI Summary: Master the 12-lead ECG, identify life-threatening arrhythmias, conduction blocks, and signs of ischemia.',
    modules: [{
      id: 'ecg_mod_1',
      title: 'Rate, Rhythm & Axis',
      duration: '30 mins',
      completed: false,
      youtubeId: 'M7lc1UVf-VE',
      objectives: [
        'Accurately calculate heart rate using the 300-150-100 method',
        'Determine the cardiac axis using Leads I and aVF',
        'Identify sinus rhythm and basic arrhythmias'
      ],
      keyPoints: [
        'A normal QRS axis lies between -30 and +90 degrees (positive in Lead I and aVF).',
        'Normal sinus rhythm requires a P wave before every QRS complex, and a QRS after every P wave.',
        'The PR interval should be between 120-200ms (3 to 5 small squares).'
      ],
      timestamps: [
        { time: '00:00', label: 'ECG Paper & Calibration' },
        { time: '08:15', label: 'Calculating Heart Rate' },
        { time: '16:40', label: 'Determining Cardiac Axis' },
        { time: '24:50', label: 'Sinus Rhythm vs Atrial Fibrillation' }
      ],
      quiz: {
        question: 'If the QRS complex is strongly positive in Lead I but strongly negative in Lead aVF, what is the electrical axis?',
        options: ['Normal Axis', 'Right Axis Deviation (RAD)', 'Left Axis Deviation (LAD)', 'Extreme Axis Deviation'],
        answer: 2,
        explanation: 'Positive in Lead I and negative in aVF indicates Left Axis Deviation (LAD), generally considered to be between -30 and -90 degrees.'
      }
    }]
  }
`;

// Extract the first part of the file up to the appended courses
const splitToken = "'Frontend Architecture': {";
const firstPart = content.split(splitToken)[0];

const newContent = firstPart + updatedMissingCourses + '\n};\n';
fs.writeFileSync('src/data/courseCurriculum.js', newContent);
console.log('Appended courses updated with full mock data!');
