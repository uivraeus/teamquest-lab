import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { AppContextProvider } from './components/AppContext'
import { BrowserRouter } from 'react-router-dom'
import ErrorFallback from './components/ErrorFallback'
import { errorTracking } from './services/sentry'

errorTracking.init();

ReactDOM.render(
  <React.StrictMode>
    <errorTracking.ErrorBoundary fallback={<ErrorFallback/>}>
      <BrowserRouter>
        <AppContextProvider>
          <App />
        </AppContextProvider>
      </BrowserRouter>
    </errorTracking.ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root')
);
