import React, { useState, useEffect } from "react";
import { RotateCcw, Trash2, AlertTriangle, X } from "lucide-react";
import { useTrackerStore, useEnrollment } from "../store/useTrackerStore";
import type { Materia, CarreraId } from "../data/curriculum";
import { Badge } from "@/components/ui/badge";

interface SubjectDrawerProps {
  materia: Materia;
  carreraId: CarreraId;
  onClose: () => void;
}

const NotaInput = ({ value, onChange, className, placeholder, autoFocus }: any) => {
  const [localVal, setLocalVal] = useState(value === null || value === undefined || value === "" ? "" : String(value));

  useEffect(() => {
    // Solo sincronizar si el valor externo cambió realmente para no interrumpir el typing (ej: "8.")
    const extStr = value === null || value === undefined || value === "" ? "" : String(value);
    if (extStr !== localVal && !localVal.endsWith('.')) {
      setLocalVal(extStr);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(',', '.');
    
    if (val === "") {
      setLocalVal("");
      onChange("");
      return;
    }
    
    if (!/^\d*\.?\d{0,2}$/.test(val)) return;
    
    const num = parseFloat(val);
    if (!isNaN(num) && (num < 0 || num > 10)) return;

    setLocalVal(val);
    
    if (!val.endsWith('.')) {
      onChange(val);
    }
  };

  const handleBlur = () => {
    if (localVal.endsWith('.')) {
      const clean = localVal.slice(0, -1);
      setLocalVal(clean);
      onChange(clean);
    }
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={localVal}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
      placeholder={placeholder}
      autoFocus={autoFocus}
    />
  );
};

export const SubjectDrawer: React.FC<SubjectDrawerProps> = ({
  materia,
  carreraId,
  onClose,
}) => {
  const enrollment = useEnrollment(materia.id);
  const estado = enrollment?.estado ?? "pendiente";
  
  const {
    iniciarCursada,
    actualizarParcial,
    agregarRecuperatorio,
    registrarExamenFinal,
    cerrarCursada,
    resetMateria,
    cambiarEstado,
  } = useTrackerStore();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const [addingParcial, setAddingParcial] = useState(false);
  const [newParcialNum, setNewParcialNum] = useState<number>(1);
  const [newParcialNota, setNewParcialNota] = useState<string>("");

  const [notaFinal, setNotaFinal] = useState<string>("");
  const [instanciaFinal, setInstanciaFinal] = useState<"ordinario" | "libre">("ordinario");

  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmReopen, setConfirmReopen] = useState(false);
  const [confirmCloseCourse, setConfirmCloseCourse] = useState(false);

  const handleStartCourse = () => iniciarCursada(materia.id, carreraId);

  const handleParcialChange = (numero: 1 | 2 | 3, value: string) => {
    const nota = value === "" ? null : Number(value);
    actualizarParcial(materia.id, { numero, nota, instancia: "ordinario" });
  };

  const handleRecuperatorioChange = (numero: 1 | 2 | 3, value: string) => {
    const nota = value === "" ? null : Number(value);
    agregarRecuperatorio(materia.id, { numero, nota });
  };

  const handleAddParcialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParcialNota) return;
    actualizarParcial(materia.id, {
      numero: newParcialNum as 1 | 2 | 3,
      nota: Number(newParcialNota),
      instancia: "ordinario"
    });
    setAddingParcial(false);
    setNewParcialNota("");
    setNewParcialNum(prev => prev + 1);
  };

  const submitFinal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notaFinal) return;
    registrarExamenFinal(materia.id, {
      nota: Number(notaFinal),
      instancia: estado === "libre" ? "libre" : instanciaFinal,
      fecha: new Date().toISOString()
    });
    setNotaFinal("");
  };

  const handleReset = () => {
    if (confirmReset) {
      resetMateria(materia.id);
      onClose();
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
    }
  };

  const handleReopen = () => {
    if (confirmReopen) {
      cambiarEstado(materia.id, "cursando");
      setConfirmReopen(false);
    } else {
      setConfirmReopen(true);
      setTimeout(() => setConfirmReopen(false), 3000);
    }
  };

  const handleCloseCourse = () => {
    if (confirmCloseCourse) {
      cerrarCursada(materia.id);
      setConfirmCloseCourse(false);
    } else {
      setConfirmCloseCourse(true);
      setTimeout(() => setConfirmCloseCourse(false), 3000);
    }
  };

  const getNotaParcial = (numero: number) => enrollment?.parciales.find((p) => p.numero === numero)?.nota ?? "";
  const getNotaRecu = (numero: number) => enrollment?.recuperatorios.find((r) => r.numero === numero)?.nota ?? "";

  const failedPartialsCount = (enrollment?.parciales ?? [])
    .filter(p => p.nota !== null && p.nota < 4)
    .length;
  const isRecuperatorioAllowed = failedPartialsCount < 2;

  return (
    <>
      <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 overflow-y-auto flex flex-col font-sans animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-zinc-100 dark:border-zinc-900 sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl z-10 flex justify-between items-start">
          <div>
            <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-widest mb-2">
              {materia.id} · Año {materia.year}
            </div>
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 tracking-tight">{materia.name}</h2>
            <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300">
              Estado: <span className="ml-1 uppercase text-zinc-900 dark:text-zinc-100 font-semibold">{estado}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button onClick={onClose} className="p-2 -mr-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
              <X className="w-5 h-5" />
            </button>
            
            {estado !== "pendiente" && (
              <div className="flex flex-col items-end gap-1 mt-2 -mr-2">
                {(estado === "aprobada" || estado === "libre" || estado === "regular") && (
                  <button 
                    onClick={handleReopen}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      confirmReopen 
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' 
                        : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    {confirmReopen ? <AlertTriangle className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
                    <span>{confirmReopen ? "¿Seguro?" : "Reanudar cursada"}</span>
                  </button>
                )}
                
                <button 
                  onClick={handleReset}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    confirmReset 
                      ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' 
                      : 'text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:text-zinc-400 dark:hover:text-red-400 dark:hover:bg-red-500/10'
                  }`}
                >
                  {confirmReset ? <AlertTriangle className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>{confirmReset ? "Confirmar borrado" : "Limpiar datos"}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 flex-1 flex flex-col">
          {materia.description && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8">
              {materia.description}
            </p>
          )}

          {estado === "pendiente" && (
            <div className="flex-1 flex flex-col justify-center items-center text-center py-12">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Materia sin iniciar</h3>
              <p className="text-sm text-zinc-500 mb-8 max-w-[240px]">
                Inscribite a esta materia para comenzar a registrar tus calificaciones.
              </p>
              <button
                onClick={handleStartCourse}
                className="w-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-medium py-3.5 px-4 rounded-xl hover:scale-[0.98] transition-transform"
              >
                Inscribirse a Cursada
              </button>
            </div>
          )}

          {estado === "cursando" && (
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-end mb-4">
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Calificaciones</h3>
                  {(() => {
                    const notas = (enrollment?.parciales ?? []).map(p => p.nota).filter(n => n !== null);
                    const recus = (enrollment?.recuperatorios ?? []).map(r => r.nota).filter(n => n !== null);
                    const hasAplazoOrRecu = notas.some(n => (n as number) < 7) || recus.length > 0;
                    const isPosible = !hasAplazoOrRecu;
                    return (
                      <Badge variant="outline" className={`font-normal text-xs px-2 py-0.5 border-transparent ${isPosible ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400'}`}>
                        {isPosible ? "Promoción Posible" : "Requiere Final"}
                      </Badge>
                    );
                  })()}
                </div>

                <div className="divide-y divide-zinc-100 dark:divide-zinc-900 border-y border-zinc-100 dark:border-zinc-900">
                  {enrollment?.parciales.map((p) => (
                    <div key={p.numero} className="py-4 flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Parcial {p.numero}</label>
                        <NotaInput 
                          value={getNotaParcial(p.numero)}
                          onChange={(val: string) => handleParcialChange(p.numero as 1|2|3, val)}
                          className="w-16 bg-transparent text-right font-semibold text-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-b-2 border-zinc-900 dark:border-white transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                          placeholder="-"
                        />
                      </div>
                      {getNotaParcial(p.numero) !== "" && Number(getNotaParcial(p.numero)) < 4 && (
                        isRecuperatorioAllowed && (
                          <div className="flex justify-between items-center text-orange-600 dark:text-orange-500 pl-4 mt-1">
                            <label className="text-[11px] font-semibold uppercase tracking-wider">Recuperatorio</label>
                            <NotaInput 
                              value={getNotaRecu(p.numero)}
                              onChange={(val: string) => handleRecuperatorioChange(p.numero as 1|2|3, val)}
                              className="w-16 bg-transparent text-right font-semibold text-base focus:outline-none focus:border-b-2 border-orange-500 transition-all placeholder:text-orange-200 dark:placeholder:text-orange-900/50"
                              placeholder="-"
                            />
                          </div>
                        )
                      )}
                    </div>
                  ))}
                </div>

                {!isRecuperatorioAllowed && (
                  <div className="mt-6 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-center">
                    <span className="text-xs font-medium text-red-600 dark:text-red-400">
                      Límite de aplazos excedido. La materia quedará libre.
                    </span>
                  </div>
                )}
              </div>

              {!addingParcial ? (
                <button
                  onClick={() => {
                    const nextNum = (enrollment?.parciales.length ?? 0) + 1;
                    setNewParcialNum(nextNum);
                    setAddingParcial(true);
                  }}
                  className="w-full py-3 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all border border-dashed border-zinc-200 dark:border-zinc-800"
                >
                  + Añadir calificación
                </button>
              ) : (
                <form onSubmit={handleAddParcialSubmit} className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-5 space-y-4 shadow-sm border border-zinc-100 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <p className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">Instancia</p>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 py-2">
                        Parcial {newParcialNum}
                      </p>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">Nota</label>
                      <NotaInput 
                        autoFocus
                        value={newParcialNota}
                        onChange={(val: string) => setNewParcialNota(val)}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all text-center placeholder:font-normal placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                        placeholder="-"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setAddingParcial(false)} className="flex-1 py-2.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">Cancelar</button>
                    <button type="submit" className="flex-1 py-2.5 text-sm font-medium bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:scale-[0.98] rounded-lg transition-transform shadow-sm">Guardar</button>
                  </div>
                </form>
              )}

              <div className="pt-4">
                <button
                  onClick={handleCloseCourse}
                  className={`w-full font-medium py-3.5 rounded-xl transition-all ${
                    confirmCloseCourse 
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 scale-[0.98]" 
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {confirmCloseCourse ? "¿Confirmar cierre de cursada?" : "Cerrar Cursada"}
                </button>
                <p className="text-xs text-zinc-500 text-center mt-3 leading-relaxed">
                  Calcularemos tu estado (Regular, Libre o Aprobada) basándonos en las calificaciones ingresadas.
                </p>
              </div>
            </div>
          )}

          {(estado === "regular" || estado === "libre") && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Examen Final</h3>
                <span className={`text-xs font-medium ${enrollment?.final_turns_left === 1 ? 'text-red-600 dark:text-red-400' : 'text-zinc-500'}`}>
                  Turnos restantes: {enrollment?.final_turns_left ?? 3}/3
                </span>
              </div>
              <form onSubmit={submitFinal} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Instancia</label>
                  <select 
                    value={estado === "libre" ? "libre" : instanciaFinal}
                    onChange={(e) => setInstanciaFinal(e.target.value as any)}
                    disabled={estado === "libre"}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-xl px-4 py-3.5 text-sm text-zinc-900 dark:text-zinc-100 outline-none ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all appearance-none disabled:opacity-50"
                  >
                    <option value="ordinario">Ordinario (Regular)</option>
                    <option value="libre">Libre</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Calificación Definitiva</label>
                  <NotaInput 
                    value={notaFinal}
                    onChange={(val: string) => setNotaFinal(val)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-xl px-4 py-3.5 text-lg font-semibold text-zinc-900 dark:text-zinc-100 outline-none ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all placeholder:text-zinc-400 placeholder:font-normal"
                    placeholder="Ej: 8"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-medium py-3.5 rounded-xl hover:scale-[0.98] transition-transform mt-4"
                >
                  Registrar Calificación
                </button>
              </form>
            </div>
          )}

          {(estado === "aprobada" || estado === "libre") && enrollment?.examenFinal && (
            <div className={`p-8 rounded-2xl flex flex-col items-center justify-center text-center ${estado === "aprobada" ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-red-50 dark:bg-red-500/10"}`}>
              <h3 className={`text-base font-semibold uppercase tracking-widest mb-1 ${estado === "aprobada" ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>
                Materia {estado}
              </h3>
              <p className={`text-sm mb-6 ${estado === "aprobada" ? "text-emerald-600/80 dark:text-emerald-400/80" : "text-red-600/80 dark:text-red-400/80"}`}>
                Calificación del examen final
              </p>
              <div className={`text-7xl font-bold tracking-tighter mb-4 ${estado === "aprobada" ? "text-emerald-800 dark:text-emerald-300" : "text-red-800 dark:text-red-300"}`}>
                {enrollment.examenFinal.nota}
              </div>
              <div className={`text-xs font-medium px-3 py-1 rounded-full ${estado === "aprobada" ? "bg-emerald-200/50 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200" : "bg-red-200/50 text-red-800 dark:bg-red-900/50 dark:text-red-200"}`}>
                Instancia: {enrollment.examenFinal.instancia}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};
