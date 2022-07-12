import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { AppContextProvider } from './components/AppContext'
import { BrowserRouter } from 'react-router-dom'
import ErrorFallback from './components/ErrorFallback'
import { errorTracking } from './services/sentry'

errorTracking.init();

const root = createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <errorTracking.ErrorBoundary fallback={<ErrorFallback/>}>
      <BrowserRouter>
        <AppContextProvider>
          <App />
        </AppContextProvider>
      </BrowserRouter>
    </errorTracking.ErrorBoundary>
  // </React.StrictMode>
);
