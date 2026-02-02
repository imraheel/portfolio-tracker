const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

// Check if we're in development or production
const isDev = !app.isPackaged;

let mainWindow;
let nextProcess;

function createMenu() {
  const template = [
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      role: 'window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    }
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

const http = require('http');

function waitForServer(url, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const checkServer = () => {
      http.get(url, (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          setTimeout(checkServer, 500);
        }
      }).on('error', () => {
        if (Date.now() - startTime > timeout) {
          reject(new Error('Timeout waiting for server'));
        } else {
          setTimeout(checkServer, 500);
        }
      });
    };
    checkServer();
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: "Personal Stock Investment Tracker",
    show: false
  });

  const url = 'http://localhost:3000';

  if (isDev) {
    mainWindow.loadURL(url);
    mainWindow.webContents.openDevTools();
    mainWindow.show();
  } else {
    waitForServer(url)
      .then(() => {
        mainWindow.loadURL(url);
        mainWindow.show();
      })
      .catch((err) => {
        console.error('Failed to connect to server:', err);
        // Show error in window
        mainWindow.loadURL(`data:text/html,<h1>Error</h1><p>Failed to start server: ${err.message}</p>`);
        mainWindow.show();
      });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startNextServer() {
  if (isDev) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const appPath = app.getAppPath();
    
    // Try multiple possible paths for the next binary
    const possibleNextPaths = [
      path.join(appPath, 'node_modules/.bin/next'),
      path.join(appPath, '../node_modules/.bin/next'),
      path.join(process.resourcesPath, 'node_modules/.bin/next'),
      path.join(__dirname, '../node_modules/.bin/next'),
    ];
    
    let nextPath = possibleNextPaths.find(p => {
      try {
        require('fs').accessSync(p);
        return true;
      } catch {
        return false;
      }
    });

    if (!nextPath) {
      // Try using npx or node directly
      nextPath = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    }

    console.log('Starting Next.js server from:', appPath);
    console.log('Using next binary:', nextPath);

    const args = nextPath.includes('npx') ? ['next', 'start'] : ['start'];
    
    nextProcess = spawn(nextPath, args, {
      cwd: appPath,
      env: {
        ...process.env,
        NODE_ENV: 'production'
      },
      shell: true
    });

    let serverStarted = false;

    nextProcess.stdout.on('data', (data) => {
      console.log(`Next.js: ${data}`);
      if (data.toString().includes('Ready') || data.toString().includes('3000')) {
        if (!serverStarted) {
          serverStarted = true;
          resolve();
        }
      }
    });

    nextProcess.stderr.on('data', (data) => {
      console.error(`Next.js Error: ${data}`);
    });

    nextProcess.on('error', (err) => {
      console.error('Failed to start Next.js process:', err);
      reject(err);
    });

    nextProcess.on('exit', (code) => {
      console.log(`Next.js process exited with code ${code}`);
      if (!serverStarted && code !== 0) {
        reject(new Error(`Next.js server exited with code ${code}`));
      }
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      if (!serverStarted) {
        reject(new Error('Timeout starting Next.js server'));
      }
    }, 30000);
  });
}

app.on('ready', async () => {
  try {
    if (!isDev) {
      console.log('Production mode - starting Next.js server...');
      await startNextServer();
      console.log('Next.js server started successfully');
    }
    
    createMenu();
    createWindow();
  } catch (error) {
    console.error('Failed to start app:', error);
    // Create window anyway to show error
    createMenu();
    createWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
  if (nextProcess) {
    nextProcess.kill();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('quit', () => {
  if (nextProcess) {
    nextProcess.kill();
  }
});
