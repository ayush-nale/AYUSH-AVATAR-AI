const fs = require('fs'); 
const file = fs.readFileSync('public/avatar/model.glb');
// find the JSON chunk
let jsonStr = '';
for (let i = 0; i < file.length - 4; i++) {
  if (file[i] === 0x4A && file[i+1] === 0x53 && file[i+2] === 0x4F && file[i+3] === 0x4E) {
    const chunkLength = file.readUInt32LE(i - 4);
    jsonStr = file.slice(i + 4, i + 4 + chunkLength).toString('utf8');
    break;
  }
}
const gltf = JSON.parse(jsonStr);
const targetNames = new Set();
if (gltf.meshes) {
  gltf.meshes.forEach(m => {
    if (m.extras && m.extras.targetNames) m.extras.targetNames.forEach(n => targetNames.add(n));
  });
}
console.log('Target Names:', Array.from(targetNames));
