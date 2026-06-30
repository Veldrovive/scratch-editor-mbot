const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const demosDir = path.join(rootDir, 'demos');
const outputPath = path.join(rootDir, 'packages', 'scratch-gui', 'src', 'lib', 'demos.json');

// Check if demos directory exists
if (!fs.existsSync(demosDir)) {
    console.log(`[generate_demos_list.js] Directory ${demosDir} does not exist. Creating empty demos.json.`);
    fs.writeFileSync(outputPath, JSON.stringify([]));
    process.exit(0);
}

// Read all files in the demos directory
const files = fs.readdirSync(demosDir);

// Filter for .sb3 files and create the json structure
const demosList = files
    .filter(file => file.endsWith('.sb3'))
    .map(file => {
        // Create a human readable name from the filename
        const name = file
            .replace('.sb3', '')
            .split(/[-_]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        
        return {
            name: name,
            filename: file,
            path: `static/demos/${file}`
        };
    });

fs.writeFileSync(outputPath, JSON.stringify(demosList, null, 4));
console.log(`[generate_demos_list.js] Successfully generated demos.json with ${demosList.length} items.`);
