const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { exec, spawn } = require('child_process');
const fs = require('fs');

// Main window
let mainWindow;
let nextProcess;

// Create the main window
async function createWindow() {
  console.log('Creating main window...');
  
  // Create window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    title: 'Japan Planner'
  });
  
  // Remove menu bar
  mainWindow.setMenu(null);
  
  // Start Next.js dev server
  console.log('Starting Next.js dev server...');
  
  // Create a log directory if it doesn't exist
  if (!fs.existsSync(path.join(__dirname, 'logs'))) {
    fs.mkdirSync(path.join(__dirname, 'logs'));
  }
  
  // Create a log file with timestamp
  const date = new Date();
  const timestamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}${String(date.getSeconds()).padStart(2, '0')}`;
  const logFile = fs.createWriteStream(path.join(__dirname, 'logs', `next-${timestamp}.log`));
  
  // On Windows, we need to use spawn with shell:true
  nextProcess = spawn('npm', ['run', 'dev'], { 
    cwd: __dirname,
    shell: true
  });
  
  // Pipe process output to log file
  nextProcess.stdout.pipe(logFile);
  nextProcess.stderr.pipe(logFile);
  
  // Wait for server to start
  console.log('Waiting for Next.js server to start...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Set up loading screen while Next.js starts
  const loadingHtml = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            color: #333;
          }
          .spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-radius: 50%;
            border-top: 4px solid #e74c3c;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          h2 {
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <div class="spinner"></div>
        <h2>Loading Japan Planner...</h2>
        <p>Starting Next.js development server</p>
      </body>
    </html>
  `;
  
  // Show loading screen
  mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(loadingHtml)}`);
  
  // Try to load the app
  try {
    console.log('Attempting to load http://localhost:3000...');
    
    // Function to check if server is ready
    const checkServer = async () => {
      try {
        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), 1000);
        });
        
        // Try to fetch the page
        const fetchPromise = fetch('http://localhost:3000');
        
        // Race the fetch against the timeout
        await Promise.race([fetchPromise, timeoutPromise]);
        
        // If we get here, the server is ready
        console.log('Server is ready, loading app...');
        await mainWindow.loadURL('http://localhost:3000');
        console.log('App loaded successfully!');
      } catch (error) {
        console.log('Server not ready yet, retrying in 1 second...');
        setTimeout(checkServer, 1000);
      }
    };
    
    // Start checking
    checkServer();
  } catch (error) {
    console.error('Failed to start server or load URL:', error);
    // Show error page
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
      </html>
    `;
    
    mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHtml)}`);
  }
  
  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
  
  // Cleanup on window close
  mainWindow.on('closed', function() {
    console.log('Main window closed, cleaning up...');
    mainWindow = null;
    
    // Kill the Next.js server process
    if (nextProcess) {
      console.log('Terminating Next.js process...');
      
      if (process.platform === 'win32') {
        // On Windows, we need to kill the process tree
        exec(`taskkill /pid ${nextProcess.pid} /T /F`, (error) => {
          if (error) {
            console.error(`Error terminating process: ${error}`);
          } else {
            console.log('Process terminated successfully');
          }
        });
      } else {
        // On other platforms, we can just kill the process
        nextProcess.kill('SIGTERM');
      }
    }
  });
}

// Initialize app
app.whenReady().then(createWindow).catch(error => {
  console.error('Error during app initialization:', error);
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// On macOS, recreate window when dock icon is clicked
app.on('activate', function() {
  if (mainWindow === null) {
    createWindow();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
}); 