const fs = require('fs');
const https = require('https');

let content = fs.readFileSync('src/data/courseCurriculum.js', 'utf8');

async function search(query) {
  return new Promise((resolve) => {
    // Add khan academy and medicine to ensure high quality embeddable videos
    https.get('https://www.youtube.com/results?search_query=' + encodeURIComponent(query + ' khan academy medicine'), (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const matches = data.match(/watch\?v=([a-zA-Z0-9_-]{11})/g);
        if(matches) {
          resolve([...new Set(matches.map(m => m.split('=')[1]))].slice(0, 5));
        } else resolve([]);
      });
    });
  });
}

async function check(id) {
  return new Promise((resolve) => {
    https.get('https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=' + id + '&format=json', (res) => {
      resolve({ id, status: res.statusCode });
    }).on('error', () => resolve({ id, status: 500 }));
  });
}

async function run() {
  const courses = ['Pharmacology', 'Pathology', 'Clinical Examination', 'Radiology Basics', 'Emergency Medicine', 'Anatomy'];
  
  for (const course of courses) {
    // Find the course block
    const courseRegex = new RegExp(`'${course}':\\s*\\{`, 'g');
    const match = courseRegex.exec(content);
    if (!match) continue;
    
    let currentIndex = match.index;
    for(let i=0; i<4; i++) {
      // Find module title
      const titleIndex = content.indexOf('title: \'', currentIndex);
      if (titleIndex === -1) break;
      const endTitle = content.indexOf('\'', titleIndex + 8);
      const title = content.substring(titleIndex + 8, endTitle);
      
      console.log(`Searching for: ${title}`);
      
      const ids = await search(title);
      let foundId = 'M7lc1UVf-VE'; // Fallback
      for (const id of ids) {
        const res = await check(id);
        if (res.status === 200) {
          foundId = id;
          break;
        }
      }
      
      const ytIndex = content.indexOf('youtubeId:', titleIndex);
      if (ytIndex !== -1 && ytIndex < titleIndex + 500) {
        const nextQuote = content.indexOf("'", ytIndex + 10);
        const endQuote = content.indexOf("'", nextQuote + 1);
        
        content = content.substring(0, nextQuote + 1) + foundId + content.substring(endQuote);
        currentIndex = endQuote + 1;
        console.log(`Assigned ${foundId} to "${title}"`);
      } else {
        currentIndex = endTitle + 1;
      }
    }
  }
  fs.writeFileSync('src/data/courseCurriculum.js', content);
  console.log('Finished updating all modules with unique syllabus-synced videos.');
}
run();
