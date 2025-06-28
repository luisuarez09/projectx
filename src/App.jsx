import { useState } from 'react'
import './index.css'

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
        <header className="flex items-center justify-between p-4 border-b">
          <button
            className="md:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 5.25h16.5m-16.5 6h16.5m-16.5 6h16.5"
              />
            </svg>
          </button>
          <h1 className="text-xl font-semibold">Panel Administrativo</h1>
        </header>
        <main className="flex-1 p-4">Bienvenido</main>
      </div>
    </div>
  )
}

export default App
