const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec, execSync } = require('child_process');
const http = require('http');
const { createServer } = require('http');
const { parse } = require('url');
const { readFileSync, existsSync } = require('fs');

console.log('Starting Japan Planner desktop app...');

// Main window
let mainWindow;
let server;

// Check if we need to build the app first
function checkAndBuildApp() {
  try {
    console.log('Checking if app needs to be built...');
    // Check if the out directory exists with index.html
    if (!existsSync(path.join(__dirname, 'out', 'index.html'))) {
      console.log('Building Next.js app for static export...');
      // Run the Next.js build and export
      execSync('npm run build && npx next export', { cwd: __dirname, stdio: 'inherit' });
      console.log('Build completed successfully');
    } else {
      console.log('Build already exists, skipping build step');
    }
    return true;
  } catch (error) {
    console.error('Error building app:', error);
    return false;
  }
}

// Start a simple static server
function startStaticServer() {
  console.log('Starting static file server...');
  
  const outDir = path.join(__dirname, 'out');

  // Create a simple HTTP server to serve the static files
  server = createServer((req, res) => {
    try {
      // Parse the URL
      const parsedUrl = parse(req.url, true);
      let pathname = parsedUrl.pathname;
      
      console.log(`Request for: ${pathname}`);

      // Serve index.html for root route
      if (pathname === '/') {
        pathname = '/index.html';
      }

      // Remove leading slash and resolve to the out directory
      const filePath = path.join(outDir, pathname.substring(1));
      
      // Check if file exists
      if (existsSync(filePath)) {
        // Determine content type based on file extension
        const ext = path.extname(filePath).toLowerCase();
        const contentType = {
          '.html': 'text/html',
          '.js': 'text/javascript',
          '.css': 'text/css',
          '.json': 'application/json',
          '.png': 'image/png',
          '.jpg': 'image/jpg',
          '.jpeg': 'image/jpeg',
          '.gif': 'image/gif',
          '.svg': 'image/svg+xml'
        }[ext] || 'application/octet-stream';
        
        // Read and serve the file
        const content = readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      } else {
        // Serve index.html for client-side routing
        console.log(`File not found: ${filePath}, serving index.html instead for client routing`);
        const content = readFileSync(path.join(outDir, 'index.html'));
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content, 'utf-8');
      }
    } catch (error) {
      console.error('Error serving file:', error);
      res.writeHead(500);
      res.end('Server Error');
    }
  });

  // Listen on port 3000
  server.listen(3000, () => {
    console.log('Static server running on http://localhost:3000');
  });
  
  return server;
}

// Create the main window
async function createWindow() {
  console.log('Creating main window...');
  
  // Build the app if needed
  const buildSuccess = checkAndBuildApp();
  if (!buildSuccess) {
    console.error('Failed to build the app. Exiting...');
    app.quit();
    return;
  }
  
  // Start static server
  startStaticServer();
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, 'public', 'favicon.ico')
  });
  console.log('Main window created successfully');

  // Remove menu bar
  mainWindow.setMenu(null);
  console.log('Menu bar removed');

  // Wait for server to start
  console.log('Waiting for server to start...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Wait complete, attempting to load URL');

  try {
    // Load the app
    console.log('Loading http://localhost:3000...');
    await mainWindow.loadURL('http://localhost:3000');
    console.log('URL loaded successfully');
    
    // Enable DevTools in development
    // mainWindow.webContents.openDevTools();
  } catch (error) {
    console.error('Failed to load URL:', error);
    
    // Try showing an error page if the main URL fails
    try {
      const errorHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Error Starting Japan Planner</h2>
          <p>There was a problem loading the application:</p>
          <pre style="background: #f1f1f1; padding: 10px;">${error.message}</pre>
          <p>Please check that:</p>
          <ul>
            <li>Port 3000 is not in use by another application</li>
            <li>Your firewall isn't blocking the connection</li>
          </ul>
        </body>
      </html>`;
      
      await mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(errorHtml));
      console.log('Error page displayed');
    } catch (err) {
      console.error('Failed to display error page:', err);
    }
  }

  // Open links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    console.log(`Opening external URL: ${url}`);
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Clean up when window is closed
  mainWindow.on('closed', function() {
    console.log('Main window closed');
    mainWindow = null;
    
    // Close the server when window is closed
    if (server) {
      console.log('Closing static server');
      server.close(() => {
        console.log('Static server closed');
      });
    }
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