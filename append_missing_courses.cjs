const fs = require('fs');

let content = fs.readFileSync('src/data/courseCurriculum.js', 'utf8');

const missingCourses = `
  'Frontend Architecture': {
    title: 'Frontend Architecture',
    domain: 'ENGINEERING',
    category: 'Software Engineering',
    instructor: 'Engineering Team',
    aiSummary: '🤖 AI Summary: Master scalable frontend architecture.',
    modules: [{
      id: 'fa_mod_1',
      title: 'Microfrontends & Monorepos',
      duration: '40 mins',
      completed: false,
      youtubeId: 'M7lc1UVf-VE',
      objectives: ['Learn module federation'],
      keyPoints: ['Use Turborepo for fast builds']
    }]
  },
  'Backend Scaling with Node.js': {
    title: 'Backend Scaling with Node.js',
    domain: 'ENGINEERING',
    category: 'Backend',
    instructor: 'Engineering Team',
    aiSummary: '🤖 AI Summary: Master backend performance.',
    modules: [{
      id: 'bs_mod_1',
      title: 'Clustering & PM2',
      duration: '45 mins',
      completed: false,
      youtubeId: 'M7lc1UVf-VE',
      objectives: ['Implement clustering'],
      keyPoints: ['PM2 ensures zero downtime']
    }]
  },
  'System Design Patterns': {
    title: 'System Design Patterns',
    domain: 'ENGINEERING',
    category: 'Architecture',
    instructor: 'Architecture Team',
    aiSummary: '🤖 AI Summary: Master enterprise patterns.',
    modules: [{
      id: 'sdp_mod_1',
      title: 'CQRS & Event Sourcing',
      duration: '50 mins',
      completed: false,
      youtubeId: 'M7lc1UVf-VE',
      objectives: ['Separate reads from writes'],
      keyPoints: ['Event sourcing stores state as series of events']
    }]
  },
  'GraphQL APIs': {
    title: 'GraphQL APIs',
    domain: 'ENGINEERING',
    category: 'Backend',
    instructor: 'API Team',
    aiSummary: '🤖 AI Summary: Master GraphQL schemas and resolvers.',
    modules: [{
      id: 'gql_mod_1',
      title: 'Schema Design & Resolvers',
      duration: '35 mins',
      completed: false,
      youtubeId: 'M7lc1UVf-VE',
      objectives: ['Build robust schemas'],
      keyPoints: ['Avoid the N+1 problem with DataLoader']
    }]
  },
  'Basic Physiology Revision': {
    title: 'Basic Physiology Revision',
    domain: 'MEDICAL',
    category: 'Preclinical',
    instructor: 'Medical Faculty',
    aiSummary: '🤖 AI Summary: Review core physiology concepts.',
    modules: [{
      id: 'physio_mod_1',
      title: 'Cellular Physiology',
      duration: '30 mins',
      completed: false,
      youtubeId: 'M7lc1UVf-VE',
      objectives: ['Understand membrane potentials'],
      keyPoints: ['Na/K pump maintains resting potential']
    }]
  },
  'Advanced Diagnostics': {
    title: 'Advanced Diagnostics',
    domain: 'MEDICAL',
    category: 'Clinical',
    instructor: 'Diagnostic Team',
    aiSummary: '🤖 AI Summary: Master complex diagnostic algorithms.',
    modules: [{
      id: 'diag_mod_1',
      title: 'Differential Diagnosis',
      duration: '45 mins',
      completed: false,
      youtubeId: 'M7lc1UVf-VE',
      objectives: ['Formulate a strong differential'],
      keyPoints: ['VINDICATE mnemonic']
    }]
  },
  'Clinical Pharmacology': {
    title: 'Clinical Pharmacology',
    domain: 'MEDICAL',
    category: 'Clinical',
    instructor: 'Pharmacy Team',
    aiSummary: '🤖 AI Summary: Deep dive into clinical drug applications.',
    modules: [{
      id: 'cpharm_mod_1',
      title: 'Drug-Drug Interactions',
      duration: '40 mins',
      completed: false,
      youtubeId: 'M7lc1UVf-VE',
      objectives: ['Identify CYP450 inducers and inhibitors'],
      keyPoints: ['Grapefruit juice inhibits CYP3A4']
    }]
  },
  'ECG Interpretation': {
    title: 'ECG Interpretation',
    domain: 'MEDICAL',
    category: 'Clinical',
    instructor: 'Cardiology Team',
    aiSummary: '🤖 AI Summary: Master the 12-lead ECG.',
    modules: [{
      id: 'ecg_mod_1',
      title: 'Rate, Rhythm & Axis',
      duration: '30 mins',
      completed: false,
      youtubeId: 'M7lc1UVf-VE',
      objectives: ['Calculate rate and determine axis'],
      keyPoints: ['Normal axis is between -30 and +90 degrees']
    }]
  }
`;

content = content.replace(/}\s*};\s*$/, '},\n' + missingCourses + '\n};');
fs.writeFileSync('src/data/courseCurriculum.js', content);
console.log('Missing courses appended.');
