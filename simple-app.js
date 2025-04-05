const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

console.log('Starting simple Japan Planner diagnostic app...');

// Main window
let mainWindow;

// Create the main window
function createWindow() {
  console.log('Creating main window...');
  
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  console.log('Main window created successfully');

  // Remove menu bar
  mainWindow.setMenu(null);
  console.log('Menu bar removed');

  // Create a simple HTML page
  const htmlContent = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <title>Japan Planner - Diagnostic</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f5f5f5;
          color: #333;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          height: 100vh;
          justify-content: center;
          align-items: center;
          text-align: center;
        }
        .container {
          background-color: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          max-width: 600px;
          width: 80%;
        }
        h1 {
          color: #e74c3c;
          margin-top: 0;
        }
        p {
          line-height: 1.6;
        }
        .success {
          color: #2ecc71;
          font-weight: bold;
        }
        button {
          background-color: #3498db;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          margin-top: 20px;
          transition: background-color 0.3s;
        }
        button:hover {
          background-color: #2980b9;
        }
        .info {
          margin-top: 20px;
          font-size: 14px;
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 4px;
          text-align: left;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Japan Planner Diagnostic Tool</h1>
        <p class="success">✓ Electron is working correctly</p>
        <p>This is a diagnostic page to check if the Electron app can start properly.</p>
        
        <div class="info">
          <p><strong>Electron Information:</strong></p>
          <ul>
            <li>Electron Version: ${process.versions.electron}</li>
            <li>Chrome Version: ${process.versions.chrome}</li>
            <li>Node Version: ${process.versions.node}</li>
            <li>Platform: ${process.platform}</li>
          </ul>
        </div>
        
        <p>If you're seeing this page, it means Electron is working but there might be issues with the Next.js build or static file server.</p>
        <button id="closeBtn">Close Diagnostic Tool</button>
      </div>
      
      <script>
        document.getElementById('closeBtn').addEventListener('click', () => {
          window.close();
        });
      </script>
    </body>
  </html>
  `;

  // Load HTML directly
  mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);
  console.log('HTML content loaded successfully');

  // Open DevTools in development
  // mainWindow.webContents.openDevTools();

  // Clean up when window is closed
  mainWindow.on('closed', function() {
    console.log('Main window closed');
    mainWindow = null;
  });
}

// Start the app when Electron is ready
app.whenReady().then(() => {
  console.log('Electron app ready');
  createWindow();
}).catch(error => {
  console.error('Error during app startup:', error);
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', function() {
  console.log('All windows closed');
  if (process.platform !== 'darwin') {
    console.log('Quitting app');
    app.quit();
  }
});

// On macOS, re-create window when dock icon is clicked
app.on('activate', function() {
  console.log('App activated');
  if (mainWindow === null) {
    console.log('Recreating main window');
    createWindow();
  }
});

// Log any unhandled errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

console.log('Electron script initialization complete'); 