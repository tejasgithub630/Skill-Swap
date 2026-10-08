const fs = require('fs');

let content = fs.readFileSync('src/data/courseCurriculum.js', 'utf8');

const tsCourse = `
  'TypeScript': {
    title: 'TypeScript',
    domain: 'ENGINEERING',
    category: 'Language',
    instructor: 'Matt Pocock & Open Source Community',
    aiSummary: '🤖 AI Summary: Master TypeScript static typing, advanced generics, utility types, and structural subtyping for building scalable, type-safe enterprise applications.',
    modules: [
      {
        id: 'ts_mod_1',
        title: 'Basic Types & Interfaces',
        duration: '40 mins',
        completed: false,
        youtubeId: 'zQnBQ4tB3ZA',
        objectives: ['Master basic primitives and type annotations', 'Differentiate between Types and Interfaces'],
        keyPoints: ['Use interfaces for object shapes and types for unions/intersections.'],
        quiz: {
          question: 'What is the main difference between an Interface and a Type alias in TypeScript?',
          options: ['Interfaces can be merged via declaration merging', 'Types are faster to compile', 'Interfaces cannot extend other interfaces', 'Types cannot be used with classes'],
          answer: 0,
          explanation: 'Interfaces support declaration merging, allowing you to add new fields to an existing interface later in the code.'
        }
      }
    ]
  }
`;

content = content.replace(/}\s*};\s*$/, '},\n' + tsCourse + '\n};');
fs.writeFileSync('src/data/courseCurriculum.js', content);
console.log('TypeScript course added');
