import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Building2, Mail, Lock, ArrowRight } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica de inicio de sesión
    console.log("Login intentado con:", email);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden">
      {/* Background Gradients & Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse animation-delay-2000" />
      
      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo/Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4 transform transition-transform hover:scale-105 duration-300">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400">
            Nexus ERP
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-center text-sm font-medium">
            Gestión Multi-Empresa Inteligente
          </p>
        </div>

        {/* Login Card */}
        <Card className="backdrop-blur-xl bg-white/80 dark:bg-zinc-900/80 border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl shadow-zinc-200/50 dark:shadow-black/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-tight text-center">
              Iniciar Sesión
            </CardTitle>
            <CardDescription className="text-zinc-500 dark:text-zinc-400 text-center">
              Ingresa tus credenciales para acceder a tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="usuario@empresa.com" 
                    className="pl-9 bg-white/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 focus-visible:ring-blue-500 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <Link to="#" className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••"
                    className="pl-9 bg-white/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 focus-visible:ring-blue-500 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="remember" className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-600 dark:text-zinc-400 select-none cursor-pointer"
                >
                  Recordarme en este dispositivo
                </label>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 transition-all group mt-4">
                Entrar al Sistema
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>

            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-zinc-50 dark:bg-zinc-900 px-2 text-zinc-500">
                  O continuar con
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <Button variant="outline" className="bg-white/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                Google
              </Button>
              <Button variant="outline" className="bg-white/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path></svg>
                Microsoft
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-center space-y-2 pb-6">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              ¿No tienes una cuenta de empresa?{" "}
              <Link to="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors">
                Solicitar acceso
              </Link>
            </p>
          </CardFooter>
        </Card>
        
        {/* Footer info */}
        <div className="text-center mt-8 text-xs text-zinc-500 dark:text-zinc-400">
          <p>© {new Date().getFullYear()} Nexus ERP. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
}
