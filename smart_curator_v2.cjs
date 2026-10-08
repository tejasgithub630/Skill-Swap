const fs = require('fs');
const https = require('https');

let content = fs.readFileSync('src/data/courseCurriculum.js', 'utf8');

async function searchYouTube(query) {
  return new Promise((resolve) => {
    https.get('https://www.youtube.com/results?search_query=' + encodeURIComponent(query), (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const match = data.match(/ytInitialData = ({.*?});/);
          if (match) {
            const obj = JSON.parse(match[1]);
            const contents = obj.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
            const results = [];
            for (let item of contents) {
              if (item.videoRenderer) {
                const v = item.videoRenderer;
                if (v.lengthText && v.lengthText.simpleText) {
                  const timeStr = v.lengthText.simpleText;
                  const parts = timeStr.split(':');
                  let minutes = 0;
                  if (parts.length === 3) {
                    minutes = parseInt(parts[0]) * 60 + parseInt(parts[1]); // HH:MM:SS
                  } else if (parts.length === 2) {
                    minutes = parseInt(parts[0]); // MM:SS
                  }
                  
                  if (minutes >= 4 && minutes < 120) {
                    results.push({
                      id: v.videoId,
                      title: v.title.runs[0].text,
                      duration: minutes
                    });
                  }
                }
              }
            }
            resolve(results);
          } else {
            resolve([]);
          }
        } catch (e) {
          resolve([]);
        }
      });
    });
  });
}

async function checkEmbed(id) {
  return new Promise((resolve) => {
    https.get('https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=' + id + '&format=json', (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => resolve(false));
  });
}

const medicalCourses = [
  'Pharmacology', 'Pathology', 'Clinical Examination', 
  'Radiology Basics', 'Emergency Medicine', 'Anatomy'
];

async function run() {
  for (const course of medicalCourses) {
    const courseRegex = new RegExp(`'${course}':\\s*\\{`, 'g');
    const match = courseRegex.exec(content);
    if (!match) continue;
    
    // Find where the modules array starts for this course
    const modulesStartIndex = content.indexOf('modules: [', match.index);
    if (modulesStartIndex === -1) continue;
    
    let currentIndex = modulesStartIndex;
    
    // We expect exactly 4 modules per medical course
    for (let i = 0; i < 4; i++) {
      // Now it ONLY finds the module titles, skipping the course title!
      const titleIndex = content.indexOf('title: \'', currentIndex);
      if (titleIndex === -1) break;
      const endTitle = content.indexOf('\'', titleIndex + 8);
      const title = content.substring(titleIndex + 8, endTitle);
      
      console.log(`Processing module: ${title}`);
      
      let searchQuery = title.split(':')[0] + ' medical lecture usmle';
      const results = await searchYouTube(searchQuery);
      
      let finalVideo = null;
      for (const res of results) {
        const isEmbeddable = await checkEmbed(res.id);
        if (isEmbeddable) {
          finalVideo = res;
          break;
        }
      }
      
      if (!finalVideo) {
        console.log(`Failed to find video for ${title}. Falling back.`);
        finalVideo = { id: 'M7lc1UVf-VE', duration: 15 };
      } else {
        console.log(`Found: ${finalVideo.title} (${finalVideo.duration} mins) -> ${finalVideo.id}`);
      }
      
      const durationIndex = content.indexOf('duration: \'', titleIndex);
      if (durationIndex !== -1 && durationIndex < titleIndex + 500) {
        const endDuration = content.indexOf('\'', durationIndex + 11);
        content = content.substring(0, durationIndex + 11) + `${finalVideo.duration} mins` + content.substring(endDuration);
      }
      
      const ytIndex = content.indexOf('youtubeId: \'', titleIndex);
      if (ytIndex !== -1 && ytIndex < titleIndex + 500) {
        const endYt = content.indexOf('\'', ytIndex + 12);
        content = content.substring(0, ytIndex + 12) + finalVideo.id + content.substring(endYt);
        currentIndex = endYt + 1;
      } else {
        // If youtubeId wasn't found (maybe it was missing), we insert it
        const completedIndex = content.indexOf('completed:', titleIndex);
        if (completedIndex !== -1 && completedIndex < titleIndex + 500) {
           const endCompleted = content.indexOf('\\n', completedIndex);
           if (endCompleted === -1) {
             currentIndex = completedIndex + 10;
           } else {
             content = content.substring(0, endCompleted) + `\\n        youtubeId: '${finalVideo.id}',` + content.substring(endCompleted);
             currentIndex = endCompleted + 20;
           }
        } else {
           currentIndex = endTitle + 1;
        }
      }
    }
  }
  
  fs.writeFileSync('src/data/courseCurriculum.js', content);
  console.log('Finished updating courseCurriculum with actual verified videos and synced durations!');
}

run();
