const { spawn } = require('child_process');
const { execSync } = require('child_process');
const path = require('path');

// First, copy splash screen
try {
  execSync('npm run copy-splash', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to copy splash screen:', error);
}

// Start TypeScript compiler in watch mode
const tscProcess = spawn('npx', ['tsc', '-p', 'tsconfig.main.json', '--watch'], {
  stdio: 'inherit',
  shell: true
});

// Wait a bit for initial compilation, then start Electron
setTimeout(() => {
  const electronProcess = spawn('npx', ['electron', '.'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NODE_ENV: 'development' }
  });

  electronProcess.on('close', (code) => {
    console.log(`Electron process exited with code ${code}`);
    tscProcess.kill();
    process.exit(code);
  });

  electronProcess.on('error', (error) => {
    console.error('Failed to start Electron:', error);
    tscProcess.kill();
    process.exit(1);
  });
}, 2000);

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down...');
  tscProcess.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down...');
  tscProcess.kill();
  process.exit(0);
});
