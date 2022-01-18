import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { AppContextProvider } from './components/AppContext'
import { BrowserRouter } from 'react-router-dom'
import ErrorFallback from './components/ErrorFallback'
import { errorTracking } from './services/sentry'
//import reportWebVitals from './reportWebVitals';

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

//https://create-react-app.dev/docs/measuring-performance/
//reportWebVitals(console.log);