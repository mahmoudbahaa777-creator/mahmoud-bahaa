import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './tokens.css'
import './index.css'

const root = document.getElementById('root')
const app = <React.StrictMode><App /></React.StrictMode>

// The built page arrives pre-rendered: attach to that HTML instead of redrawing it.
if (root.hasChildNodes()) ReactDOM.hydrateRoot(root, app)
else ReactDOM.createRoot(root).render(app)
