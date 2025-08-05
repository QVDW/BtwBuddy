#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 BtwBuddy Release Fix Script');
console.log('================================\n');

// Check if release files exist
const releaseDir = 'release';
const latestYmlPath = path.join(releaseDir, 'latest.yml');
const setupExePath = path.join(releaseDir, 'BtwBuddy-Setup.exe');

console.log('📋 Checking release files...');

if (!fs.existsSync(latestYmlPath)) {
  console.log('❌ latest.yml not found');
  console.log('💡 Run: npm run dist:win');
  process.exit(1);
}

if (!fs.existsSync(setupExePath)) {
  console.log('❌ BtwBuddy-Setup.exe not found');
  console.log('💡 Run: npm run dist:win');
  process.exit(1);
}

console.log('✅ Release files found');

// Read and display latest.yml content
const latestYmlContent = fs.readFileSync(latestYmlPath, 'utf8');
console.log('\n📄 latest.yml content:');
console.log('─'.repeat(50));
console.log(latestYmlContent);
console.log('─'.repeat(50));

// Get file sizes
const latestYmlStats = fs.statSync(latestYmlPath);
const setupExeStats = fs.statSync(setupExePath);

console.log('\n📊 File Information:');
console.log(`   latest.yml: ${(latestYmlStats.size / 1024).toFixed(2)} KB`);
console.log(`   BtwBuddy-Setup.exe: ${(setupExeStats.size / 1024 / 1024).toFixed(2)} MB`);

console.log('\n🔧 To fix the auto-updater issue:');
console.log('1. Go to https://github.com/QVDW/BtwBuddy/releases');
console.log('2. Click "Edit" on the latest release');
console.log('3. Upload these files from the release/ directory:');
console.log('   - latest.yml');
console.log('   - BtwBuddy-Setup.exe');
console.log('4. Click "Update release"');
console.log('\n✅ After uploading, the auto-updater will work correctly!');

console.log('\n📁 Release files location:');
console.log(`   ${path.resolve(releaseDir)}`); 