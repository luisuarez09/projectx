import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, BookOpenText, Building2, Lock, Mail, ShieldCheck } from "lucide-react";

import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

const trustPoints = [
  {
    icon: ShieldCheck,
    title: "Control y trazabilidad",
    description: "Centraliza tareas, obligaciones y documentos con un flujo claro para el equipo.",
  },
  {
    icon: BookOpenText,
    title: "Gestión profesional",
    description: "Organiza clientes, empresas y procesos sin convertir la operación en un ERP pesado.",
  },
  {
    icon: BadgeCheck,
    title: "Experiencia premium",
    description: "Comparte avances con claridad y transmite una imagen moderna y confiable.",
  },
];

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24">
      <path
        d="M21.81 12.227c0-.776-.069-1.518-.198-2.227H12v4.214h5.498a4.7 4.7 0 0 1-2.04 3.085v2.56h3.302c1.932-1.779 3.05-4.4 3.05-7.632Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.754 0 5.06-.913 6.747-2.475l-3.302-2.56c-.913.612-2.08.975-3.445.975-2.65 0-4.894-1.79-5.694-4.197H2.892v2.641A9.998 9.998 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.306 13.743A5.996 5.996 0 0 1 6 12c0-.606.104-1.196.306-1.743V7.616H2.892A9.999 9.999 0 0 0 2 12c0 1.613.386 3.139 1.07 4.384l3.236-2.641Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.06c1.498 0 2.842.516 3.9 1.528l2.925-2.925C17.055 3.02 14.75 2 12 2a9.998 9.998 0 0 0-9.108 5.616l3.414 2.641C7.106 7.85 9.35 6.06 12 6.06Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Login intentado con:", email);
  };

  const handleGoogleSignIn = () => {
    console.log("Inicio de sesion con Google solicitado");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f7f4ee_0%,#ffffff_45%,#f6f7f8_100%)] text-slate-950">
      <div className="absolute inset-0">
        <div className="absolute left-[-10rem] top-[-8rem] size-[28rem] rounded-full bg-amber-200/45 blur-3xl" />
        <div className="absolute bottom-[-12rem] right-[-8rem] size-[30rem] rounded-full bg-emerald-200/35 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.04),transparent_38%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_30px_120px_rgba(15,23,42,0.12)] backdrop-blur xl:grid-cols-[1.1fr_0.9fr]">
          <section className="relative hidden overflow-hidden border-r border-slate-200/70 bg-slate-950 px-8 py-10 text-white xl:flex xl:flex-col xl:justify-between">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_32%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(30,41,59,0.9))]" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

            <div className="relative space-y-8">
              <div className="inline-flex w-fit items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-slate-200 backdrop-blur">
                <span className="flex size-9 items-center justify-center rounded-full bg-white text-slate-950">
                  <Building2 className="size-4" />
                </span>
                <div>
                  <p className="font-medium">Project X</p>
                  <p className="text-xs text-slate-300">Operación interna para firmas profesionales</p>
                </div>
              </div>

              <div className="max-w-xl space-y-5">
                <span className="inline-flex rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-300">
                  Plataforma interna
                </span>
                <h1 className="text-4xl font-semibold tracking-tight text-balance">
                  Ordena la gestión contable, legal y fiscal desde una sola vista.
                </h1>
                <p className="text-base leading-7 text-slate-300">
                  Project X concentra clientes, empresas, tareas y respaldo documental con una experiencia clara,
                  moderna y lista para el trabajo diario de la firma.
                </p>
              </div>

              <div className="grid gap-4">
                {trustPoints.map(({ icon: Icon, title, description }) => (
                  <div
                    key={title}
                    className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                  >
                    <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
                      <Icon className="size-4" />
                    </span>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-white">{title}</p>
                      <p className="text-sm leading-6 text-slate-300">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-300 backdrop-blur-sm">
              <div>
                <p className="font-medium text-white">Acceso seguro para tu equipo</p>
                <p>Diseñado para operación diaria y seguimiento ordenado de procesos.</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold text-white">24/7</p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Disponibilidad</p>
              </div>
            </div>
          </section>

          <section className="flex items-center justify-center px-4 py-8 sm:px-8 sm:py-10 lg:px-12">
            <div className="w-full max-w-md space-y-6">
              <div className="space-y-4 xl:hidden">
                <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm">
                  <span className="flex size-9 items-center justify-center rounded-full bg-slate-950 text-white">
                    <Building2 className="size-4" />
                  </span>
                  <div>
                    <p className="font-medium">Project X</p>
                    <p className="text-xs text-slate-500">Sistema operativo interno para la firma</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Bienvenido de nuevo</h1>
                  <p className="text-sm leading-6 text-slate-600">
                    Inicia sesión para continuar con la gestión de clientes, obligaciones y documentos.
                  </p>
                </div>
              </div>

              <div className="hidden space-y-2 xl:block">
                <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Iniciar sesión</h2>
                <p className="text-sm leading-6 text-slate-600">
                  Accede a tu espacio de trabajo y retoma el control de los procesos de la firma.
                </p>
              </div>

              <Card className="border-slate-200/80 bg-white/90 py-0 shadow-none ring-0">
                <CardContent className="space-y-6 px-0 py-0">
                  <div className="space-y-3 px-6 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={handleGoogleSignIn}
                      className="h-11 w-full justify-center gap-3 rounded-xl border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <GoogleIcon />
                      Continuar con Google
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-200" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white px-3 text-xs uppercase tracking-[0.22em] text-slate-400">
                          O con tu correo
                        </span>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5 px-6 pb-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                        Correo electrónico
                      </Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="nombre@firma.com"
                          className="h-11 rounded-xl border-slate-300 bg-slate-50 pl-10 text-slate-900 placeholder:text-slate-400 focus-visible:bg-white"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                          Contraseña
                        </Label>
                        <Link to="#" className="text-sm font-medium text-slate-600 transition hover:text-slate-950">
                          ¿Olvidaste tu contraseña?
                        </Link>
                      </div>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="Ingresa tu contraseña"
                          className="h-11 rounded-xl border-slate-300 bg-slate-50 pl-10 text-slate-900 placeholder:text-slate-400 focus-visible:bg-white"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <label htmlFor="remember" className="flex items-center gap-3 text-sm text-slate-600">
                        <Checkbox id="remember" className="border-slate-300 data-[state=checked]:bg-slate-950 data-[state=checked]:text-white" />
                        Mantener sesión iniciada
                      </label>
                      <span className="text-xs uppercase tracking-[0.18em] text-slate-400">Seguro</span>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="h-11 w-full rounded-xl bg-slate-950 text-white hover:bg-slate-800"
                    >
                      Entrar al sistema
                      <ArrowRight className="size-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-3 text-center">
                <p className="text-sm text-slate-600">
                  ¿Tu empresa aún no tiene acceso?{" "}
                  <Link to="#" className="font-medium text-slate-950 underline-offset-4 hover:underline">
                    Solicitar activación
                  </Link>
                </p>
                <p className="text-xs text-slate-400">
                  Al continuar aceptas las políticas internas de acceso y protección documental.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
