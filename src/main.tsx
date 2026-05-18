import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { LocaleProvider } from './lib/LocaleProvider'
import { ThemeProvider } from './lib/ThemeProvider'
import { startVersionCheck } from './lib/versionCheck'

if (import.meta.env.PROD) {
  startVersionCheck()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <LocaleProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </LocaleProvider>
    </ThemeProvider>
  </StrictMode>,
)
