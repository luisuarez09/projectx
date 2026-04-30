// src/App.jsx
import { useState } from 'react'
import { Routes, Route } from "react-router-dom"
import './index.css'
import NavigationMenuHeader from "./components/ui/NavigationMenu";
import CalculadoraSaren from './pages/CalculadoraSaren';
import CalculadoraReconversion from './pages/CalcuadoraReconversion';
import Clients from './pages/clients/clients';
import EstimateNew from './pages/estimates-new';
import Login from './pages/login';
import UsersIndex from './pages/settings/users/index';
import UserEditor from './pages/settings/users/editor';
import UserDetail from './pages/settings/users/detail';

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
          <Route path="/login" element={<Login />} />
          <Route path="/calculadora-saren" element={<CalculadoraSaren />} />
          <Route path="/calculadora-reconversion" element={<CalculadoraReconversion />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/estimates/new" element={<EstimateNew />} />

          {/* Usuarios */}
          <Route path="/settings/users" element={<UsersIndex />} />
          <Route path="/settings/users/new" element={<UserEditor />} />
          <Route path="/settings/users/:id/edit" element={<UserEditor />} />
          <Route path="/settings/users/:id" element={<UserDetail />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
