const { app, BrowserWindow } = require('electron');
const { exec } = require('child_process');
const path = require('path');

let mainWindow;
let backendProcess;  // To store the backend process
let reactProcess;    // To store the frontend React process in development mode

// Function to create the Electron window
function createWindow() {

  nativeTheme.themeSource = 'dark';
  
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,      // Allows using Node.js modules in frontend
      contextIsolation: false      // Adjust according to your security needs
    }
  });

  // Always load React frontend from the development server (http://localhost:3000)
  const reactDevURL = 'http://localhost:3000';
  mainWindow.loadURL(reactDevURL);
  

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

// Function to start the React frontend development server
function startFrontend() {
  console.log('Starting React frontend in development mode...');
  
  const frontendPath = path.join(__dirname, '.');  // Assuming frontend code is at root
  reactProcess = exec(`npm start --prefix "${frontendPath}"`, { shell: true }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error starting React frontend: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`React frontend stderr: ${stderr}`);
    }
    console.log(`React frontend stdout: ${stdout}`);
  });
}

// App initialization
app.whenReady().then(() => {
  startBackend();  // Start the backend server
  startFrontend(); // Start the React frontend development server
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
  if (reactProcess) {
    reactProcess.kill();  // Kill React dev server if in development mode
  }
});
