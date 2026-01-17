const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { spawn } = require('child_process');

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

function waitForServer(url, callback) {
  const checkServer = () => {
    http.get(url, (res) => {
      if (res.statusCode === 200) {
        callback();
      } else {
        setTimeout(checkServer, 500);
      }
    }).on('error', () => {
      setTimeout(checkServer, 500);
    });
  };
  checkServer();
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
  });

  const url = 'http://localhost:3000';

  if (isDev) {
    mainWindow.loadURL(url);
    mainWindow.webContents.openDevTools();
  } else {
    waitForServer(url, () => {
      mainWindow.loadURL(url);
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startNextServer(dbUrl) {
  if (isDev) return;

  // In production, we run 'next start'
  const nextPath = path.join(__dirname, '../node_modules/.bin/next');
  
  nextProcess = spawn(nextPath, ['start'], {
    cwd: path.join(__dirname, '../'),
    env: {
      ...process.env,
      NODE_ENV: 'production',
      DATABASE_URL: dbUrl
    }
  });

  nextProcess.stdout.on('data', (data) => {
    console.log(`Next.js: ${data}`);
  });

  nextProcess.stderr.on('data', (data) => {
    console.error(`Next.js Error: ${data}`);
  });
}

async function runMigrations(dbUrl) {
  return new Promise((resolve, reject) => {
    const prismaPath = path.join(__dirname, '../node_modules/.bin/prisma');
    const migrationProcess = spawn(prismaPath, ['migrate', 'deploy'], {
      cwd: path.join(__dirname, '../'),
      env: {
        ...process.env,
        DATABASE_URL: dbUrl
      }
    });

    migrationProcess.stdout.on('data', (data) => {
      console.log(`Prisma: ${data}`);
    });

    migrationProcess.stderr.on('data', (data) => {
      console.error(`Prisma Error: ${data}`);
    });

    migrationProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Prisma migration failed with code ${code}`));
      }
    });
  });
}

app.on('ready', async () => {
  // Set database path for Prisma
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'dev.db');
  const dbUrl = `file:${dbPath}`;
  
  try {
    if (!isDev) {
      process.env.DATABASE_URL = dbUrl;
      console.log('Running migrations...');
      await runMigrations(dbUrl);
      startNextServer(dbUrl);
    }
    
    createMenu();
    createWindow();
  } catch (error) {
    console.error('Failed to start app:', error);
    app.quit();
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
