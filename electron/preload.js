const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Add any Electron APIs you need here
  platform: process.platform,
});

// Expose PSX stock price scraping API
contextBridge.exposeInMainWorld('psx', {
  getPrice: (symbol) => ipcRenderer.invoke('psx:get-price', symbol),
  getPrices: (symbols) => ipcRenderer.invoke('psx:get-prices', symbols),
});
