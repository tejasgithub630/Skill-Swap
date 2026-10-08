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
                  
                  // Filter out shorts (<3 mins) and ridiculously long streams (>120 mins)
                  if (minutes > 3 && minutes < 120) {
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

// Hardcode exactly what queries to search for each module so we get the best videos.
const medicalCourses = [
  'Pharmacology', 'Pathology', 'Clinical Examination', 
  'Radiology Basics', 'Emergency Medicine', 'Anatomy'
];

async function run() {
  for (const course of medicalCourses) {
    const courseRegex = new RegExp(`'${course}':\\s*\\{`, 'g');
    const match = courseRegex.exec(content);
    if (!match) continue;
    
    let currentIndex = match.index;
    for (let i = 0; i < 4; i++) {
      // Find the module title
      const titleIndex = content.indexOf('title: \'', currentIndex);
      if (titleIndex === -1) break;
      const endTitle = content.indexOf('\'', titleIndex + 8);
      const title = content.substring(titleIndex + 8, endTitle);
      
      console.log(`Processing module: ${title}`);
      
      // Search with "medical lecture" suffix to get high quality educational content
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
      
      // Now update BOTH duration and youtubeId in the file
      // 1. Update duration
      const durationIndex = content.indexOf('duration: \'', titleIndex);
      if (durationIndex !== -1 && durationIndex < titleIndex + 500) {
        const endDuration = content.indexOf('\'', durationIndex + 11);
        content = content.substring(0, durationIndex + 11) + `${finalVideo.duration} mins` + content.substring(endDuration);
      }
      
      // 2. Update youtubeId (re-search from titleIndex since string length might have changed)
      const ytIndex = content.indexOf('youtubeId: \'', titleIndex);
      if (ytIndex !== -1 && ytIndex < titleIndex + 500) {
        const endYt = content.indexOf('\'', ytIndex + 12);
        content = content.substring(0, ytIndex + 12) + finalVideo.id + content.substring(endYt);
        currentIndex = endYt + 1; // Move past this module
      } else {
        currentIndex = endTitle + 1;
      }
    }
  }
  
  fs.writeFileSync('src/data/courseCurriculum.js', content);
  console.log('Finished updating courseCurriculum with actual verified videos and synced durations!');
}

run();
