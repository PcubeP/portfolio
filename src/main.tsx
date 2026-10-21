import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ExperienceProvider } from '@/context/ExperienceContext'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ExperienceProvider>
      <App />
    </ExperienceProvider>
  </StrictMode>
)
