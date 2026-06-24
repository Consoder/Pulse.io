import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ErrorBoundary } from 'react-error-boundary';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE";

function ErrorFallback({error}) {
  return (
    <div role="alert" style={{color: 'red', padding: '20px', backgroundColor: 'black', height: '100vh'}}>
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
      <p>If you are using Brave Browser, please turn Shields DOWN.</p>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <GoogleOAuthProvider clientId={CLIENT_ID}>
                <App />
            </GoogleOAuthProvider>
        </ErrorBoundary>
    </React.StrictMode>,
)