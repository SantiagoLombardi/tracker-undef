import React, { useState, memo, useMemo, useEffect } from "react";
import { useTrackerStore, useProgresoCarrera, useIsMateriaBloqueada } from "../store/useTrackerStore";
import { carrerasMap, type CarreraId, type Materia } from "../data/curriculum";
import { Onboarding } from "./Onboarding";
import { SubjectDrawer } from "./SubjectDrawer";
import { ContactDrawer } from "./ContactDrawer";
import { StrategicKPIs } from "./StrategicKPIs";
import { Pie, PieChart, Label, Cell } from "recharts";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Info } from "lucide-react";

// ─── Componentes de UI ────────────────────────────────────────────────────────

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme-preference");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = storedTheme === "dark" || (!storedTheme && systemDark);
    
    setTheme(isDark ? "dark" : "light");

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("theme-preference")) {
        const newTheme = e.matches ? "dark" : "light";
        if (e.matches) document.documentElement.classList.add("dark");
        else document.documentElement.classList.remove("dark");
        setTheme(newTheme);
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains("dark");
    if (isDark) {
      document.documentElement.classList.remove("dark");
      setTheme("light");
      localStorage.setItem("theme-preference", "light");
    } else {
      document.documentElement.classList.add("dark");
      setTheme("dark");
      localStorage.setItem("theme-preference", "dark");
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className="rounded-full text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-transform duration-500 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-transform duration-500 dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}



const EstadoBadge: React.FC<{ estado: string }> = ({ estado }) => {
  const config = {
    pendiente: { label: "Pendiente", cls: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400" },
    cursando: { label: "Cursando", cls: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" },
    regular: { label: "Regular", cls: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" },
    libre: { label: "Libre", cls: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" },
    aprobada: { label: "Aprobada", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" },
  };
  const { label, cls } = config[estado as keyof typeof config] ?? config.pendiente;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase ${cls}`}>
      {label}
    </span>
  );
};

const AboutModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <>
    <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 duration-200">
      <div className="p-8">
        <h3 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-4">Sobre el proyecto</h3>
        <p className="text-zinc-600 dark:text-zinc-400 text-[13px] leading-relaxed mb-4">
          Ésta es una herramienta no oficial, desarrollada para los estudiantes de la UNDEF (Ciberdefensa y Gestión Publica), que permite llevar seguimiento de tus notas, situacion en materias, y cuestiones normativas que establece el reglamento academico.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 text-[13px] leading-relaxed mb-4">
          Los datos se almacenan localmente para garantizar la seguridad y privacidad de cada estudiante que use esta herramienta.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 text-[13px] leading-relaxed mb-8">
          podes revisar el repositorio (y contribuir) de este proyecto <a href="https://github.com/SantiagoLombardi/tracker-undef" target="_blank" rel="noopener noreferrer" className="text-zinc-900 dark:text-zinc-100 font-medium underline underline-offset-2 hover:text-zinc-500 dark:hover:text-zinc-300 transition-colors">acá</a>.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-medium py-3 rounded-xl hover:scale-[0.98] transition-transform"
        >
          Entendido
        </button>
      </div>
    </div>
  </>
);

const MateriaRow: React.FC<{
  materia: Materia;
  onClick: (m: Materia) => void;
}> = memo(({ materia, onClick }) => {
  const estado = useTrackerStore((s) => s.enrollments[materia.id]?.estado ?? "pendiente");
  const isBlocked = useIsMateriaBloqueada(materia.prerequisites);
  const [showBlockedPrereqs, setShowBlockedPrereqs] = useState(false);

  const handleInteraction = () => {
    if (isBlocked) {
      setShowBlockedPrereqs((prev) => !prev);
    } else {
      onClick(materia);
    }
  };

  const getMissingPrereqsNames = () => {
    const state = useTrackerStore.getState();
    const enrollments = state.enrollments;
    const carrera = carrerasMap[state.carreraActiva];
    
    return materia.prerequisites
      .filter((preId) => {
        const est = enrollments[preId]?.estado;
        return est !== "regular" && est !== "aprobada";
      })
      .map((preId) => carrera.materias.find((m) => m.id === preId)?.name ?? preId);
  };

  return (
    <div className="flex flex-col">
      <div
        className={`
          relative flex items-center gap-4 py-4 px-2 transition-all duration-300 ease-out group border-b border-zinc-100 dark:border-zinc-800/50 last:border-0
          ${isBlocked ? "opacity-50 hover:opacity-80 cursor-pointer" : "cursor-pointer hover:bg-zinc-50 dark:hover:bg-white/5 rounded-xl"}
        `}
        onClick={handleInteraction}
      >
        <div className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-sm font-bold text-zinc-500 dark:text-zinc-400 shrink-0">
          {materia.id.split('-')[1]}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-[16px] font-medium tracking-tight truncate transition-colors ${isBlocked ? "text-zinc-600 dark:text-zinc-500" : "text-zinc-900 dark:text-white"}`}>
            {materia.name}
          </p>
          {materia.prerequisites.length > 0 && (
            <p className="text-[13px] text-zinc-500 dark:text-zinc-500 truncate mt-0.5">
              Correlativas: {materia.prerequisites.length}
            </p>
          )}
        </div>

        <EstadoBadge estado={estado} />
      </div>

      {showBlockedPrereqs && isBlocked && (
        <div className="mx-2 mb-4 mt-2 p-4 bg-orange-50 dark:bg-orange-950/30 rounded-xl text-orange-800 dark:text-orange-300 animate-fade-in-up">
          <p className="text-sm font-semibold mb-2">Para cursar necesitas aprobar o regularizar:</p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            {getMissingPrereqsNames().map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
})
MateriaRow.displayName = "MateriaRow";

// ─── Dashboard principal ──────────────────────────────────────────────────────

const chartConfig = {
  progress: { label: "Avance", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

const Dashboard: React.FC = () => {
  const { user, carreraActiva, setCarreraActiva, periodoActual } = useTrackerStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const carrera = carrerasMap[carreraActiva];
  const materiaIds = useMemo(() => carrera.materias.map((m) => m.id), [carreraActiva]);
  const progreso = useProgresoCarrera(materiaIds);

  const años = useMemo(() => [...new Set(carrera.materias.map((m) => m.year))].sort(), [carreraActiva]);
  const [añoExpanded, setAñoExpanded] = useState<number | null>(1);
  const [selectedMateria, setSelectedMateria] = useState<Materia | null>(null);
  const [showContactDrawer, setShowContactDrawer] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  if (!mounted) return null;
  if (!user) return <Onboarding />;

  const chartData = [
    { name: "Aprobadas", value: progreso.aprobadas },
    { name: "Restantes", value: progreso.total - progreso.aprobadas }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white font-sans transition-colors duration-500">
      <div className="p-6 md:p-14 max-w-7xl mx-auto animate-fade-in-up">
        
        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 className="text-5xl md:text-6xl font-semibold tracking-tighter text-zinc-900 dark:text-white">
              Hola, {user.name.split(" ")[0]}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {user.selectedCareers.length > 1 && (
              <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-full">
                {user.selectedCareers.map((id) => (
                  <button
                    key={id}
                    onClick={() => setCarreraActiva(id)}
                    className={`
                      px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300
                      ${carreraActiva === id
                        ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"}
                    `}
                  >
                    {id === "gestion-publica" ? "Gestión Pública" : "Ciberdefensa"}
                  </button>
                ))}
              </div>
            )}
            <ThemeToggle />
          </div>
        </header>

        {/* ── KPI Row (Desktop) ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-16 items-start">
          
          {/* Avance Total */}
          <section className="xl:col-span-4 h-full">
            <div className="bg-zinc-50 dark:bg-zinc-900/40 rounded-3xl p-8 h-full flex flex-col justify-center transition-colors">
              <h2 className="text-lg font-medium tracking-tight text-zinc-900 dark:text-zinc-100 mb-8">
                Avance Total
              </h2>
              
              <div className="flex items-center gap-6">
                <div className="w-[120px] h-[120px] shrink-0">
                  <ChartContainer config={chartConfig} className="w-full h-full">
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={45}
                        outerRadius={58}
                        startAngle={90}
                        endAngle={-270}
                        strokeWidth={0}
                      >
                        <Cell key="aprobadas" className="fill-zinc-900 dark:fill-white transition-colors duration-500" />
                        <Cell key="restantes" className="fill-zinc-200 dark:fill-zinc-800 transition-colors duration-500" />
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                  <tspan x={viewBox.cx} y={viewBox.cy} className="fill-zinc-900 dark:fill-white text-2xl font-semibold tracking-tighter">
                                    {progreso.porcentaje}%
                                  </tspan>
                                </text>
                              )
                            }
                          }}
                        />
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                </div>
                
                <div className="flex flex-col">
                  <p className="text-4xl font-semibold tracking-tighter text-zinc-900 dark:text-white">
                    {progreso.aprobadas} <span className="text-2xl text-zinc-400 dark:text-zinc-500 font-medium">/ {progreso.total}</span>
                  </p>
                  <p className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                    Materias<br/>aprobadas
                  </p>
                </div>
              </div>

              {progreso.aprobadas >= 2 && (
                <div className="mt-8 pt-5 border-t border-zinc-200/60 dark:border-zinc-800/50 flex justify-between items-center animate-in fade-in duration-500">
                  <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Promedio general</span>
                  <span className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">{progreso.promedioGeneral}</span>
                </div>
              )}
            </div>
          </section>

          {/* Métricas Reglamentarias y Enlaces */}
          <section className="xl:col-span-8 flex flex-col gap-8">
            <StrategicKPIs materiaIds={materiaIds} />
            
            {/* Enlaces de Interés */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 md:px-2 pt-2">
              <a href="https://campus.fadena.undef.edu.ar/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors group">
                <img src="/UNDEF.png" alt="Campus UNDEF" className="w-4 h-4 object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300" />
                <span className="underline-offset-4 group-hover:underline">Campus Virtual</span>
              </a>
              
              <span className="text-zinc-300 dark:text-zinc-700">·</span>
              
              <a href="https://autogestion.fadena.undef.edu.ar/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors group">
                <img src="/siu.png" alt="SIU Guaraní" className="w-4 h-4 object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300" />
                <span className="underline-offset-4 group-hover:underline">SIU Guaraní</span>
              </a>
              
              <span className="text-zinc-300 dark:text-zinc-700">·</span>
              
              <button 
                onClick={() => setShowContactDrawer(true)}
                className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors group"
              >
                <Info className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                <span className="underline-offset-4 group-hover:underline">Contacto e Info</span>
              </button>
            </div>
          </section>
        </div>

        {/* ── Plan de estudios por año (Cardless) ────────────────────────────── */}
        <section className="w-full mt-8">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-8">
            Plan de Estudios
          </h2>

          <div className="space-y-4">
            {años.map((año) => {
              const materiasDeAño = carrera.materias.filter((m) => m.year === año);
              const aprobAño = materiasDeAño.filter(
                (m) => useTrackerStore.getState().enrollments[m.id]?.estado === "aprobada"
              ).length;
              const isOpen = añoExpanded === año;

              return (
                <div key={año} className="border-b border-zinc-200 dark:border-zinc-800 last:border-0 pb-4">
                  <button
                    className="w-full flex items-center justify-between py-4 group"
                    onClick={() => setAñoExpanded(isOpen ? null : año)}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-medium tracking-tight text-zinc-900 dark:text-white">
                        {año}° Año
                      </span>
                      <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-full">
                        {materiasDeAño.length} materias
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-[15px] font-medium text-zinc-400">
                        {aprobAño}/{materiasDeAño.length}
                      </span>
                      <svg
                        className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ease-out ${isOpen ? "-rotate-180" : ""}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="pt-4 pb-8 animate-fade-in-up">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
                        {[1, 2].map((sem) => {
                          const materiasSem = materiasDeAño.filter((m) => m.semester === sem);
                          if (materiasSem.length === 0) return <div key={sem} />;
                          return (
                            <div key={sem} className="flex flex-col">
                              <p className="text-[13px] text-zinc-500 font-semibold tracking-wide uppercase mb-4 ml-2">
                                {sem}° Cuatrimestre
                              </p>
                              <div className="flex flex-col">
                                {materiasSem.map((m) => (
                                  <MateriaRow
                                    key={m.id}
                                    materia={m}
                                    onClick={setSelectedMateria}
                                  />
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <footer className="mt-20 pb-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-100 dark:border-zinc-800/50 pt-8">
          <a
            href="https://santiagolombardi.com.ar"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 font-sans group hover:opacity-80 transition-opacity"
          >
            <img src="/logo-black.svg" alt="Logo" className="h-6 w-auto dark:invert opacity-90 group-hover:opacity-100 transition-opacity" />
            <p className="text-zinc-500 dark:text-zinc-400 text-sm" style={{ fontFamily: "'Epilogue', sans-serif" }}>
              Desarrollado por{" "}
              <span className="font-semibold text-zinc-800 dark:text-zinc-200" style={{ fontFamily: "'Epilogue', sans-serif" }}>Santiago Lombardi</span>
            </p>
          </a>
          
          <button 
            onClick={() => setShowAboutModal(true)}
            className="text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors underline-offset-4 hover:underline"
          >
            Sobre el proyecto
          </button>
        </footer>
      </div>

      {selectedMateria && (
        <SubjectDrawer 
          materia={selectedMateria} 
          carreraId={carreraActiva} 
          onClose={() => setSelectedMateria(null)} 
        />
      )}

      {showContactDrawer && (
        <ContactDrawer onClose={() => setShowContactDrawer(false)} />
      )}

      {showAboutModal && (
        <AboutModal onClose={() => setShowAboutModal(false)} />
      )}
    </div>
  );
};

export default Dashboard;
