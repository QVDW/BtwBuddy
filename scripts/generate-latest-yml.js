#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('📄 Generating latest.yml file...');

// Read package.json for version info
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = packageJson.version;

// Check if BtwBuddy-Setup.exe exists
const setupExePath = path.join('release', 'BtwBuddy-Setup.exe');
if (!fs.existsSync(setupExePath)) {
  console.error('❌ BtwBuddy-Setup.exe not found in release directory');
  console.error('💡 Run: npm run dist:win:no-publish first');
  process.exit(1);
}

// Get file stats
const stats = fs.statSync(setupExePath);
const fileSize = stats.size;

// Calculate SHA512 hash
const fileBuffer = fs.readFileSync(setupExePath);
const hash = crypto.createHash('sha512').update(fileBuffer).digest('base64');

// Create latest.yml content
const latestYml = `version: ${version}
files:
  - url: BtwBuddy-Setup.exe
    sha512: ${hash}
    size: ${fileSize}
path: BtwBuddy-Setup.exe
sha512: ${hash}
releaseDate: '${new Date().toISOString()}'`;

// Write latest.yml file
const latestYmlPath = path.join('release', 'latest.yml');
fs.writeFileSync(latestYmlPath, latestYml);

console.log('✅ latest.yml generated successfully');
console.log(`📁 File: ${latestYmlPath}`);
console.log(`📊 Size: ${(fs.statSync(latestYmlPath).size / 1024).toFixed(2)} KB`);
console.log(`🔗 URL: BtwBuddy-Setup.exe`);
console.log(`🔐 SHA512: ${hash}`);
console.log(`📏 Size: ${fileSize} bytes`);
console.log(`📅 Release Date: ${new Date().toISOString()}`); 