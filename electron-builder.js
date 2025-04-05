const builder = require('electron-builder');
const path = require('path');

builder.build({
  config: {
    appId: 'com.japan-planner.desktop',
    productName: 'Japan Planner',
    files: [
      'electron/**/*',
      'out/**/*',
      'package.json'
    ],
    directories: {
      buildResources: 'resources',
      output: 'dist'
    },
    win: {
      target: 'nsis',
      icon: 'resources/icon.ico'
    },
    mac: {
      target: 'dmg',
      icon: 'resources/icon.icns'
    },
    linux: {
      target: 'AppImage',
      icon: 'resources/icon.png'
    }
  }
})
.then(() => console.log('Build completed successfully!'))
.catch(err => console.error('Error during build:', err)); 