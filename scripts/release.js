#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Read package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const currentVersion = packageJson.version;

console.log(`Current version: ${currentVersion}`);

// Get new version from command line argument
const newVersion = process.argv[2];

if (!newVersion) {
  console.error('Usage: node scripts/release.js <new-version>');
  console.error('Example: node scripts/release.js 1.0.2');
  process.exit(1);
}

// Validate version format
if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
  console.error('Invalid version format. Use semantic versioning (e.g., 1.0.2)');
  process.exit(1);
}

console.log(`\n🚀 Preparing release v${newVersion}...\n`);

try {
  // Update package.json version
  packageJson.version = newVersion;
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2) + '\n');
  console.log('✅ Updated package.json version');

  // Build the application
  console.log('\n🔨 Building application...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed');

  // Build release files
  console.log('\n📦 Building release files...');
  execSync('npm run dist:win:no-publish', { stdio: 'inherit' });
  console.log('✅ Release files built');

  // Generate latest.yml manually
  console.log('\n📄 Generating latest.yml...');
  execSync('npm run generate-latest-yml', { stdio: 'inherit' });
  console.log('✅ latest.yml generated');

  // Check if release files exist
  const releaseDir = 'release';
  const latestYmlPath = path.join(releaseDir, 'latest.yml');
  const setupExePath = path.join(releaseDir, 'BtwBuddy-Setup.exe');

  if (!fs.existsSync(latestYmlPath)) {
    console.error('❌ latest.yml not found in release directory');
    process.exit(1);
  }

  if (!fs.existsSync(setupExePath)) {
    console.error('❌ BtwBuddy-Setup.exe not found in release directory');
    process.exit(1);
  }

  console.log('✅ Release files verified');

  // Create git tag
  console.log('\n🏷️  Creating git tag...');
  execSync(`git add .`, { stdio: 'inherit' });
  execSync(`git commit -m "Release v${newVersion}"`, { stdio: 'inherit' });
  execSync(`git tag v${newVersion}`, { stdio: 'inherit' });
  console.log('✅ Git tag created');

  // Push changes and tag
  console.log('\n📤 Pushing to GitHub...');
  execSync('git push origin main', { stdio: 'inherit' });
  execSync(`git push origin v${newVersion}`, { stdio: 'inherit' });
  console.log('✅ Changes pushed to GitHub');

  console.log(`\n🎉 Release v${newVersion} is ready!`);
  console.log('\n📋 IMPORTANT: Manual Steps Required:');
  console.log('1. Go to https://github.com/QVDW/BtwBuddy/releases');
  console.log('2. Click "Edit" on the v' + newVersion + ' release');
  console.log('3. Upload these files from the release/ directory:');
  console.log('   - latest.yml');
  console.log('   - BtwBuddy-Setup.exe');
  console.log('4. Click "Update release"');
  console.log('\n✅ After uploading, users will receive automatic updates!');

  // Show file sizes
  const latestYmlStats = fs.statSync(latestYmlPath);
  const setupExeStats = fs.statSync(setupExePath);
  
  console.log('\n📊 Release Files:');
  console.log(`   latest.yml: ${(latestYmlStats.size / 1024).toFixed(2)} KB`);
  console.log(`   BtwBuddy-Setup.exe: ${(setupExeStats.size / 1024 / 1024).toFixed(2)} MB`);

} catch (error) {
  console.error('\n❌ Release failed:', error.message);
  process.exit(1);
} 