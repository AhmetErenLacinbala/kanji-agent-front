import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Flashcard from './components/Flashcard.tsx'
import DebugQuestion from './components/DebugQuestion.tsx'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter basename={import.meta.env.PROD ? '/kanji-agent-front' : '/'}>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/flashcards" element={<Flashcard />} />
      <Route path="/debug" element={<DebugQuestion />} />
    </Routes>
  </BrowserRouter>
)
