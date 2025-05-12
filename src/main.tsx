import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Flashcard from './components/Flashcard.tsx'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter basename={'/kanji-agent-front/'}>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/flashcards" element={<Flashcard />} />
    </Routes>
  </BrowserRouter>
)
