const { app, BrowserWindow } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const express = require('express'); // Import Express

let mainWindow;
let backendProcess;
let expressServer;  // To store the Express server

// Function to create the Electron window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    icon: path.join(__dirname, 'logo.ico'),
    webPreferences: {
      nodeIntegration: true,      // Allows using Node.js modules in frontend
      contextIsolation: false      // Adjust according to your security needs
    }
  });

  // Load React frontend served by Express on localhost:3000
  mainWindow.loadURL('http://localhost:3000');  // Load the local server URL

  // Handle window close event
  mainWindow.on('closed', () => {
    mainWindow = null; 
  });
}

// Function to start the backend server
function startBackend() {
  console.log('Starting backend server...');

  const backendPath = path.join(__dirname, 'backend');  // Path to backend code
  backendProcess = exec(`npm start --prefix "${backendPath}"`, { shell: true }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error starting backend: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Backend stderr: ${stderr}`);
    }
    console.log(`Backend stdout: ${stdout}`);
  });
}

// Function to start Express server to serve the React build
function startExpressServer() {
  console.log('Starting Express server to serve React build...');

  const app = express();
  const buildPath = path.join(__dirname, 'build');

  // Serve the build folder as static files
  app.use(express.static(buildPath));

  // Serve index.html on any route
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });

  // Start Express server on port 3000
  expressServer = app.listen(3000, () => {
    console.log('Express server started on http://localhost:3000');
  });
}

// App initialization
app.whenReady().then(() => {
  startBackend();  // Start the backend server
  startExpressServer();  // Start the Express server to serve React build
  createWindow();  // Create the Electron window
});

// Handle all windows being closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();  // On macOS, keep app running until user quits explicitly
  }
});

// Handle app activation (macOS specific behavior)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Ensure backend and frontend processes are terminated before quitting the app
app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill();  // Kill backend process when quitting
  }
  if (expressServer) {
    expressServer.close();  // Close the Express server when quitting
  }
});
