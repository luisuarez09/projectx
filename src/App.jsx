// src/App.jsx
import { useState } from 'react'
import { Routes, Route } from "react-router-dom"
import './index.css'
import NavigationMenuHeader from "./components/ui/NavigationMenu";
import CalculadoraSaren from './pages/CalculadoraSaren';
import CalculadoraReconversion from './pages/CalcuadoraReconversion';
import Clients from './pages/clients/clients';
import EstimateNew from './pages/estimates-new';

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className={`min-h-screen bg-background text-foreground`}>
      <NavigationMenuHeader onToggleTheme={toggleTheme} isDark={theme === "dark"} />
      <main className="p-4">
        <Routes>
          <Route path="/" element={<CalculadoraSaren />} />
          <Route path="/calculadora-saren" element={<CalculadoraSaren />} />
          <Route path="/calculadora-reconversion" element={<CalculadoraReconversion />} />
          
          {/* ✅ nueva ruta de Clientes */}
          <Route path="/clients" element={<Clients />} />
          <Route path="/estimates/new" element={<EstimateNew />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
