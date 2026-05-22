const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, 'frontend/src/pages/admin');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove inline font classes
    content = content.replace(/font-\['Inter'\]/g, 'font-sans');
    // For adminInstruction which uses font-body-md
    // content = content.replace(/font-body-md/g, 'font-sans text-sm'); // Not strictly necessary if we just remove the font-family override
    
    // Remove style definitions for Inter
    content = content.replace(/font-family:\s*'Inter',\s*sans-serif;/g, '');
    
    // Remove import for Inter
    content = content.replace(/@import url\("https:\/\/fonts\.googleapis\.com\/css2\?family=Inter[^"]+"\);/g, '');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Processed', filePath);
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            processFile(fullPath);
        }
    }
}

walk(adminDir);
console.log('Done!');
