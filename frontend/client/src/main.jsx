import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

const rootElement = document.getElementById('root')
console.log('main.jsx loaded, rootElement=', rootElement)

if (rootElement) {
  createRoot(rootElement).render(
    <BrowserRouter>
      <StrictMode>
        <App />
      </StrictMode>
    </BrowserRouter>,
  )
} else {
  console.error('React root element not found')
}