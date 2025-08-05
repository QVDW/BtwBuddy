#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 GitHub Release Fix Script');
console.log('============================\n');

// Check current version
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const currentVersion = packageJson.version;

console.log(`📋 Current version: ${currentVersion}`);

// Check if release files exist
const releaseDir = 'release';
const latestYmlPath = path.join(releaseDir, 'latest.yml');
const setupExePath = path.join(releaseDir, 'BtwBuddy-Setup.exe');

console.log('\n📁 Checking release files...');

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

console.log('\n🔧 To fix the GitHub release:');
console.log('1. Go to https://github.com/QVDW/BtwBuddy/releases');
console.log('2. Click "Edit" on the latest release');
console.log('3. Upload these files from the release/ directory:');
console.log('   - latest.yml');
console.log('   - BtwBuddy-Setup.exe');
console.log('4. Click "Update release"');

console.log('\n📋 Alternative: Use the improved release script');
console.log('Run: npm run release 1.0.3');
console.log('This will:');
console.log('  - Build the release files');
console.log('  - Create a new GitHub tag');
console.log('  - Provide upload instructions');

console.log('\n🎯 For immediate testing:');
console.log('1. Use the Version Manager in the app:');
console.log('   Settings → Ontwikkelaar Tools → Open Versie Beheer');
console.log('2. This bypasses the auto-updater completely');

console.log('\n📁 Release files location:');
console.log(`   ${path.resolve(releaseDir)}`);

console.log('\n🔍 GitHub Actions Debugging:');
console.log('If GitHub Actions fails again:');
console.log('1. Check the "List release files" step in the workflow');
console.log('2. Verify that latest.yml and BtwBuddy-Setup.exe exist');
console.log('3. Check the file permissions and paths');
console.log('4. Consider using the fallback workflow: .github/workflows/release-fallback.yml'); 