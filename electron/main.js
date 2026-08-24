const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

// IPC handler: fetch live stock price from PSX
ipcMain.handle('psx:get-price', async (_event, symbol) => {
  try {
    const { data: html } = await axios.get(
      `https://dps.psx.com.pk/company/${encodeURIComponent(symbol)}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
        timeout: 10000,
      }
    );

    const $ = cheerio.load(html);

    const close = $('.quote__close').first().text().trim();
    const name = $('.quote__name').first().text().trim();

    if (!close) {
      return { success: false, message: `Price not found for ${symbol}` };
    }

    // Parse "Rs.182.77" → 182.77
    const price = parseFloat(close.replace(/Rs\.\s*/i, '').replace(/,/g, ''));

    if (isNaN(price)) {
      return { success: false, message: `Invalid price format for ${symbol}` };
    }

    return {
      success: true,
      symbol: symbol.toUpperCase(),
      name: name || null,
      price,
    };
  } catch (error) {
    console.error(`PSX scraping error for ${symbol}:`, error.message);
    return { success: false, message: error.message };
  }
});

// IPC handler: fetch multiple stock prices from PSX
ipcMain.handle('psx:get-prices', async (_event, symbols) => {
  const results = await Promise.allSettled(
    symbols.map(async (symbol) => {
      try {
        const { data: html } = await axios.get(
          `https://dps.psx.com.pk/company/${encodeURIComponent(symbol)}`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            },
            timeout: 10000,
          }
        );

        const $ = cheerio.load(html);
        const close = $('.quote__close').first().text().trim();
        const name = $('.quote__name').first().text().trim();

        if (!close) return { symbol, success: false, message: 'Price not found' };

        const price = parseFloat(close.replace(/Rs\.\s*/i, '').replace(/,/g, ''));
        if (isNaN(price)) return { symbol, success: false, message: 'Invalid format' };

        return { symbol: symbol.toUpperCase(), name: name || null, price, success: true };
      } catch (error) {
        return { symbol, success: false, message: error.message };
      }
    })
  );

  return results.map((r) => (r.status === 'fulfilled' ? r.value : { symbol: 'unknown', success: false, message: 'Request failed' }));
});

// Check if we're in development or production
const isDev = !app.isPackaged;

let mainWindow;

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

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 12, y: 14 },
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    title: "Portfolio Tracker",
    show: false
  });

  // Load the Vite dev server URL or the built files
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
    mainWindow.show();
  } else {
    // Load the built index.html from the dist folder
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    mainWindow.show();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', () => {
  createMenu();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
