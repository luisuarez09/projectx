import { useState } from 'react'
import './index.css'
import CalculadoraSaren from './pages/CalculadoraSaren';

function App() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex h-screen">
      {/* Overlay for mobile when menu is open */}
      <div
        onClick={() => setMenuOpen(false)}
        className={`${menuOpen ? 'block' : 'hidden'} fixed inset-0 z-30 bg-black/50 md:hidden`}
      />
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-md transform transition-transform md:translate-x-0 md:static md:shadow-none ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <nav className="p-4 space-y-2">
          <a href="#" className="block px-4 py-2 rounded hover:bg-gray-100">
            Inicio
          </a>
          <a href="#" className="block px-4 py-2 rounded hover:bg-gray-100">
            Clientes
          </a>
          <a href="#" className="block px-4 py-2 rounded hover:bg-gray-100">
            Calculo de aranceles
          </a>
          <a href="#" className="block px-4 py-2 rounded hover:bg-gray-100">
            Retenciones de impuesto
          </a>
        </nav>
      </aside>
      {/* Content */}
      <div className="flex flex-col flex-1 ml-0 md:ml-64">

        <CalculadoraSaren />
        
      </div>
    </div>
  )
}

export default App
