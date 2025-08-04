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
  console.log('\nThe GitHub Actions workflow will automatically:');
  console.log('- Build the app for Windows, macOS, and Linux');
  console.log('- Create a new release on GitHub');
  console.log('- Upload the installers');
  console.log('\nUsers will receive automatic updates when they restart the app.');

} catch (error) {
  console.error('\n❌ Release failed:', error.message);
  process.exit(1);
} 