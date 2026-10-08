const fs = require('fs');

let content = fs.readFileSync('src/data/courseCurriculum.js', 'utf8');

// Find every module block and its duration
let currentIndex = 0;
while (true) {
  const durationIndex = content.indexOf("duration: '", currentIndex);
  if (durationIndex === -1) break;
  
  const endDuration = content.indexOf(" mins'", durationIndex);
  if (endDuration === -1) {
    currentIndex = durationIndex + 10;
    continue;
  }
  
  const durationStr = content.substring(durationIndex + 11, endDuration);
  const totalMinutes = parseInt(durationStr, 10);
  
  if (isNaN(totalMinutes)) {
    currentIndex = endDuration + 6;
    continue;
  }
  
  // Find timestamps array
  const timestampsStart = content.indexOf('timestamps: [', durationIndex);
  if (timestampsStart === -1 || timestampsStart > durationIndex + 2000) {
    currentIndex = endDuration + 6;
    continue;
  }
  
  const timestampsEnd = content.indexOf(']', timestampsStart);
  let timestampsBlock = content.substring(timestampsStart, timestampsEnd + 1);
  
  // Regex to find { time: 'XX:YY', label: '...' }
  const timeRegex = /time:\s*'(\d+):(\d+)'/g;
  const matches = [...timestampsBlock.matchAll(timeRegex)];
  
  if (matches.length > 0) {
    // Generate new times based on percentages
    // 1st is always 00:00
    // The rest are evenly distributed up to 90% of the video length
    const interval = (totalMinutes * 0.9) / Math.max(1, matches.length - 1);
    
    let newBlock = timestampsBlock;
    
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const fullMatch = match[0];
      
      let newMins = 0;
      let newSecs = 0;
      
      if (i > 0) {
        const floatMins = i * interval;
        newMins = Math.floor(floatMins);
        newSecs = Math.floor((floatMins - newMins) * 60);
      }
      
      const newMinsStr = newMins.toString().padStart(2, '0');
      const newSecsStr = newSecs.toString().padStart(2, '0');
      
      // We replace specifically this match in the block
      newBlock = newBlock.replace(fullMatch, `time: '${newMinsStr}:${newSecsStr}'`);
    }
    
    content = content.substring(0, timestampsStart) + newBlock + content.substring(timestampsEnd + 1);
    currentIndex = timestampsStart + newBlock.length;
  } else {
    currentIndex = timestampsEnd + 1;
  }
}

fs.writeFileSync('src/data/courseCurriculum.js', content);
console.log('Fixed all timestamps to perfectly fit within the video durations!');
