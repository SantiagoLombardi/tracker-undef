import React from 'react';
import { useStrategicKPIs } from '../store/useTrackerStore';

interface StrategicKPIsProps {
  materiaIds: string[];
}

const KPITooltip = ({ text }: { text: string }) => (
  <div className="relative group/tooltip flex">
    <div className="w-4 h-4 rounded-full border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-400 cursor-help group-hover/tooltip:text-zinc-600 dark:group-hover/tooltip:text-zinc-300 group-hover/tooltip:border-zinc-600 dark:group-hover/tooltip:border-zinc-300 transition-colors">
      ?
    </div>
    <div className="absolute right-0 md:left-1/2 md:-translate-x-1/2 top-full mt-2 w-56 p-3 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 text-[11px] font-medium rounded-xl shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-20 pointer-events-none text-left leading-relaxed">
      {text}
      <div className="absolute -top-1 right-1.5 md:left-1/2 md:-translate-x-1/2 w-2 h-2 bg-zinc-900 dark:bg-zinc-100 rotate-45"></div>
    </div>
  </div>
);

export const StrategicKPIs: React.FC<StrategicKPIsProps> = ({ materiaIds }) => {
  const kpis = useStrategicKPIs(materiaIds);

  const regWarning = kpis.regActual < kpis.regRequerida;
  const regColor = regWarning ? 'bg-amber-500 dark:bg-amber-500' : 'bg-emerald-400 dark:bg-emerald-500';
  const regProgress = Math.min((kpis.regActual / Math.max(1, kpis.regRequerida)) * 100, 100);

  const getSeverityColor = (ratio: number) => {
    if (ratio >= 1) return 'bg-red-600 dark:bg-red-600';
    if (ratio >= 0.75) return 'bg-red-500 dark:bg-red-500';
    if (ratio >= 0.5) return 'bg-amber-500 dark:bg-amber-500';
    // Neutro en vez de verde, porque tener aplazos nunca es "bueno"
    return 'bg-zinc-800 dark:bg-zinc-200';
  };

  const getSeverityText = (ratio: number) => {
    if (ratio >= 1) return <p className="mt-2 text-[13px] text-red-600 dark:text-red-500 font-medium">Límite excedido</p>;
    if (ratio >= 0.75) return <p className="mt-2 text-[13px] text-red-500 dark:text-red-400 font-medium">Estado crítico</p>;
    if (ratio >= 0.5) return <p className="mt-2 text-[13px] text-amber-600 dark:text-amber-500 font-medium">Atención</p>;
    return null;
  };

  const aplazosRatio = kpis.aplazosActual / Math.max(1, kpis.aplazosPermitidos);
  const aplazosColor = getSeverityColor(aplazosRatio);
  const aplazosProgress = Math.min(aplazosRatio * 100, 100);

  const libresRatio = kpis.libresActual / Math.max(1, kpis.libresPermitidos);
  const libresColor = getSeverityColor(libresRatio);
  const libresProgress = Math.min(libresRatio * 100, 100);

  return (
    <div className="bg-zinc-50 dark:bg-zinc-900/40 rounded-3xl p-8 transition-colors">
      <h2 className="text-lg font-medium tracking-tight text-zinc-900 dark:text-zinc-100 mb-8">
        Métricas Reglamentarias
      </h2>
      
      <div className="flex flex-col md:flex-row md:divide-x divide-zinc-200 dark:divide-zinc-800 gap-8 md:gap-0">
        
        {/* Regularidad Anual */}
        <div className="flex-1 md:px-8 first:pl-0 last:pr-0">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Regularidad Anual</h3>
            <KPITooltip text="Según el reglamento académico de la UNDEF, es necesario aprobar al menos 2 materias por año académico para mantener la condición de alumno regular." />
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-semibold tracking-tighter text-zinc-900 dark:text-zinc-100">{kpis.regActual}</span>
            <span className="text-zinc-400 dark:text-zinc-500 font-medium">/ {kpis.regRequerida}</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-500 ${regColor}`} style={{ width: `${regProgress}%` }} />
          </div>
          {regWarning && <p className="mt-2 text-[13px] text-amber-600 dark:text-amber-500 font-medium">Atención requerida</p>}
        </div>

        {/* Margen de Aplazos */}
        <div className="flex-1 md:px-8 first:pl-0 last:pr-0 mt-6 md:mt-0">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Margen de Aplazos</h3>
            <KPITooltip text="El reglamento estipula que un alumno pierde su condición regular si acumula aplazos en más del 33% del total de las asignaturas de la carrera." />
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-semibold tracking-tighter text-zinc-900 dark:text-zinc-100">{kpis.aplazosActual}</span>
            <span className="text-zinc-400 dark:text-zinc-500 font-medium">/ {kpis.aplazosPermitidos}</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-500 ${aplazosColor}`} style={{ width: `${aplazosProgress}%` }} />
          </div>
          {getSeverityText(aplazosRatio)}
        </div>

        {/* Cupo Libre */}
        <div className="flex-1 md:px-8 first:pl-0 last:pr-0 mt-6 md:mt-0">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Cupo Libre</h3>
            <KPITooltip text="Según la normativa, el máximo de materias que se pueden aprobar en condición de Libre no puede exceder el 30% del total de las obligaciones curriculares de la carrera." />
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-semibold tracking-tighter text-zinc-900 dark:text-zinc-100">{kpis.libresActual}</span>
            <span className="text-zinc-400 dark:text-zinc-500 font-medium">/ {kpis.libresPermitidos}</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-500 ${libresColor}`} style={{ width: `${libresProgress}%` }} />
          </div>
          {getSeverityText(libresRatio)}
        </div>
      </div>
    </div>
  );
};
