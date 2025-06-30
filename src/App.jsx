import { useState } from 'react'
import './index.css'
import NavigationMenuHeader from "./components/ui/NavigationMenu";
import CalculadoraSaren from './pages/CalculadoraSaren';



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
        <CalculadoraSaren />
      </main>
    </div>
  )
}

export default App
