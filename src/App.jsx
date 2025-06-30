import { useState } from 'react'
import './index.css'
import CalculadoraSaren from './pages/CalculadoraSaren';

function App() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (   
        <CalculadoraSaren />
  )
}

export default App
