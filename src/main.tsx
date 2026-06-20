import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/hooks/ThemeProvider';
import App from './App';
import './globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <HashRouter>
        <Toaster position="top-right" richColors />
        <App />
      </HashRouter>
    </ThemeProvider>
  </React.StrictMode>
);
