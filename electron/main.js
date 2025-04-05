// Modules to control application life and create native browser window
const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const serve = require('electron-serve');
const isDev = require('electron-is-dev');

// Load Next.js build
const loadURL = serve({ directory: 'out' });

// Keep a global reference of the window object to avoid garbage collection
let mainWindow;

async function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, 'icon.ico')
  });

  // Set application menu (can be customized further)
  mainWindow.setMenu(null);

  if (isDev) {
    // In development, load from the local server
    await mainWindow.loadURL('http://localhost:3000');
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built files
    await loadURL(mainWindow);
  }

  // Open external links in the default browser, not in the Electron window
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Emitted when the window is closed
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// On macOS, re-create window when dock icon is clicked
app.on('activate', function () {
  if (mainWindow === null) createWindow();
}); 