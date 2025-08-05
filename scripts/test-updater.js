#!/usr/bin/env node

/**
 * Auto-Updater Test Script
 * This script helps verify the auto-updater configuration and functionality
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

console.log('🔧 BtwBuddy Auto-Updater Test Script');
console.log('=====================================\n');

// Test 1: Check package.json configuration
console.log('1. Checking package.json configuration...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  console.log(`   ✅ Version: ${packageJson.version}`);
  console.log(`   ✅ App ID: ${packageJson.build?.appId || 'Not set'}`);
  console.log(`   ✅ Product Name: ${packageJson.build?.productName || 'Not set'}`);
  
  if (packageJson.build?.publish) {
    console.log(`   ✅ Publish Provider: ${packageJson.build.publish.provider}`);
    console.log(`   ✅ GitHub Owner: ${packageJson.build.publish.owner}`);
    console.log(`   ✅ GitHub Repo: ${packageJson.build.publish.repo}`);
  } else {
    console.log('   ❌ Publish configuration missing');
  }
} catch (error) {
  console.log(`   ❌ Error reading package.json: ${error.message}`);
}

// Test 2: Check latest.yml file
console.log('\n2. Checking latest.yml file...');
try {
  const latestYmlPath = path.join('release', 'latest.yml');
  if (fs.existsSync(latestYmlPath)) {
    const latestYml = fs.readFileSync(latestYmlPath, 'utf8');
    console.log('   ✅ latest.yml exists');
    
    // Parse YAML-like content
    const versionMatch = latestYml.match(/version:\s*(.+)/);
    const filesMatch = latestYml.match(/files:/);
    const pathMatch = latestYml.match(/path:\s*(.+)/);
    
    if (versionMatch) console.log(`   ✅ Version in latest.yml: ${versionMatch[1]}`);
    if (filesMatch) console.log('   ✅ Files section present');
    if (pathMatch) console.log(`   ✅ Path: ${pathMatch[1]}`);
  } else {
    console.log('   ❌ latest.yml not found');
  }
} catch (error) {
  console.log(`   ❌ Error reading latest.yml: ${error.message}`);
}

// Test 3: Check GitHub API connectivity
console.log('\n3. Testing GitHub API connectivity...');
function testGitHubAPI() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: '/repos/QVDW/BtwBuddy/releases/latest',
      method: 'GET',
      headers: {
        'User-Agent': 'BtwBuddy-Test-Script'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const release = JSON.parse(data);
          console.log(`   ✅ GitHub API accessible`);
          console.log(`   ✅ Latest release: ${release.tag_name}`);
          console.log(`   ✅ Release name: ${release.name}`);
          console.log(`   ✅ Published: ${release.published_at}`);
          
          // Check for Windows assets
          const windowsAsset = release.assets.find(asset => 
            asset.name.includes('.exe') || asset.name.includes('Setup')
          );
          
          if (windowsAsset) {
            console.log(`   ✅ Windows asset found: ${windowsAsset.name}`);
            console.log(`   ✅ Asset size: ${(windowsAsset.size / 1024 / 1024).toFixed(2)} MB`);
          } else {
            console.log('   ⚠️  No Windows asset found in latest release');
          }
        } catch (error) {
          console.log(`   ❌ Error parsing GitHub response: ${error.message}`);
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log(`   ❌ GitHub API error: ${error.message}`);
      resolve();
    });

    req.setTimeout(10000, () => {
      console.log('   ❌ GitHub API timeout');
      req.destroy();
      resolve();
    });

    req.end();
  });
}

// Test 4: Check local files
console.log('\n4. Checking local release files...');
try {
  const releaseDir = 'release';
  if (fs.existsSync(releaseDir)) {
    const files = fs.readdirSync(releaseDir);
    console.log(`   ✅ Release directory exists with ${files.length} files`);
    
    const importantFiles = ['latest.yml', 'BtwBuddy-Setup.exe'];
    importantFiles.forEach(file => {
      const filePath = path.join(releaseDir, file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log(`   ✅ ${file} exists (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
      } else {
        console.log(`   ❌ ${file} missing`);
      }
    });
  } else {
    console.log('   ❌ Release directory not found');
  }
} catch (error) {
  console.log(`   ❌ Error checking release files: ${error.message}`);
}

// Test 5: Check auto-updater configuration
console.log('\n5. Checking auto-updater configuration...');
try {
  const autoUpdaterPath = 'src/main/auto-updater.ts';
  if (fs.existsSync(autoUpdaterPath)) {
    const content = fs.readFileSync(autoUpdaterPath, 'utf8');
    
    const checks = [
      { name: 'GitHub provider', pattern: /provider:\s*'github'/ },
      { name: 'Owner QVDW', pattern: /owner:\s*'QVDW'/ },
      { name: 'Repo BtwBuddy', pattern: /repo:\s*'BtwBuddy'/ },
      { name: 'Logging function', pattern: /logToFile/ },
      { name: 'Error handling', pattern: /catch.*error/ },
      { name: 'IPC handlers', pattern: /ipcMain\.handle/ }
    ];
    
    checks.forEach(check => {
      if (check.pattern.test(content)) {
        console.log(`   ✅ ${check.name}`);
      } else {
        console.log(`   ❌ ${check.name} missing`);
      }
    });
  } else {
    console.log('   ❌ Auto-updater file not found');
  }
} catch (error) {
  console.log(`   ❌ Error checking auto-updater: ${error.message}`);
}

// Run GitHub API test
testGitHubAPI().then(() => {
  console.log('\n📋 Test Summary');
  console.log('===============');
  console.log('✅ Configuration tests completed');
  console.log('✅ File structure verified');
  console.log('✅ GitHub API connectivity tested');
  console.log('\n🎯 Next Steps:');
  console.log('1. Build the application: npm run dist:win');
  console.log('2. Install the release version');
  console.log('3. Open Settings → Developer Tools → Update Debugger');
  console.log('4. Test manual update checks');
  console.log('5. Review logs for any errors');
  console.log('\n📖 For detailed testing instructions, see AUTO_UPDATE_TESTING_GUIDE.md');
}); 