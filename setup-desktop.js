const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Setting up Japan Planner for desktop app packaging...');

// Create necessary directories
const directories = [
  'electron',
  'resources'
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Creating ${dir} directory...`);
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Install dependencies
console.log('Installing Electron dependencies...');
try {
  execSync('npm install --save-dev electron electron-builder electron-serve electron-is-dev concurrently', { stdio: 'inherit' });
  console.log('Dependencies installed successfully.');
} catch (error) {
  console.error('Error installing dependencies:', error);
  process.exit(1);
}

// Check if main Electron files exist
const electronFiles = [
  { path: 'electron/main.js', exists: fs.existsSync('electron/main.js') },
  { path: 'electron/preload.js', exists: fs.existsSync('electron/preload.js') },
  { path: 'app.js', exists: fs.existsSync('app.js') },
  { path: 'electron-builder.js', exists: fs.existsSync('electron-builder.js') }
];

const missingFiles = electronFiles.filter(file => !file.exists);
if (missingFiles.length > 0) {
  console.log('The following required files are missing:');
  missingFiles.forEach(file => console.log(`- ${file.path}`));
  console.log('Please make sure these files exist before building the desktop app.');
} else {
  console.log('All required files are present.');
}

// Create placeholder icon files if they don't exist
const iconPlaceholder = path.join('resources', 'README.txt');
if (!fs.existsSync(iconPlaceholder)) {
  fs.writeFileSync(
    iconPlaceholder,
    'Replace these placeholder files with actual icon files before building:\n' +
    '- icon.ico for Windows\n' +
    '- icon.icns for macOS\n' +
    '- icon.png for Linux'
  );
}

console.log('\nSetup complete! You can now run the desktop app in development mode with:');
console.log('npm run electron:dev');
console.log('\nOr build the desktop app with:');
console.log('npm run electron:build');
console.log('\nMake sure to add proper icon files to the resources directory before building.'); 