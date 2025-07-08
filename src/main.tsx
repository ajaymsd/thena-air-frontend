import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './App.css'
import { Provider } from 'react-redux'
import store from './store'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
      <Toaster position="top-right" toastOptions={{
        style: { fontSize: '1rem', fontFamily: 'inherit' },
        success: { style: { background: '#e0f2fe', color: '#2563eb' } },
        error: { style: { background: '#fee2e2', color: '#b91c1c' } },
      }} />
    </Provider>
  </React.StrictMode>
)
