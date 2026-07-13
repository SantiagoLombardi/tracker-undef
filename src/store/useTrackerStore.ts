// ─────────────────────────────────────────────────────────────────────────────
// Zustand Store – Tracker UNDEF
// src/store/useTrackerStore.ts
// Persistencia exclusivamente en localStorage (sin backend).
// ─────────────────────────────────────────────────────────────────────────────
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import type { CarreraId } from "../data/curriculum";

// ─── Tipos de dominio ────────────────────────────────────────────────────────

export type EstadoMateria =
  | "pendiente"   // Sin iniciar
  | "cursando"    // En curso este cuatrimestre
  | "regular"     // Cursada aprobada, examen final pendiente
  | "aprobada"    // Final aprobado
  | "libre"       // Perdió la regularidad
  | "ausente";    // Desaprobó el final por inasistencia

export interface Parcial {
  numero: 1 | 2 | 3;
  nota: number | null;         // null = no rendido
  fecha?: string;              // ISO date string
  instancia: "ordinario" | "recuperatorio";
}

export interface ExamenFinal {
  nota: number | null;
  fecha?: string;
  instancia: "ordinario" | "libre";
  aprobado: boolean;
}

export interface Enrollment {
  materiaId: string;
  carreraId: CarreraId;
  estado: EstadoMateria;
  anioInscripcion?: number;
  cuatrimestreInscripcion?: 1 | 2;
  parciales: Parcial[];
  recuperatorios: Parcial[];
  examenFinal?: ExamenFinal;
  notaConcepto?: number;       // Nota de cursada promediada
  observaciones?: string;
  updatedAt: string;           // ISO timestamp de última modificación
  final_turns_left?: number;
  failed_exams?: number;
  fechaAprobacion?: string;    // Para rastrear promociones y finales en el año actual
  used_free_exam?: boolean;    // Para rastrear si alguna vez usó cupo libre
}

// ─── Estado del store ────────────────────────────────────────────────────────

export interface TrackerState {
  /** Datos del usuario. Si es null, requiere onboarding */
  user: {
    name: string;
    selectedCareers: CarreraId[];
  } | null;

  /** Carrera activa en la UI */
  carreraActiva: CarreraId;

  /** Enrollments indexados por materiaId */
  enrollments: Record<string, Enrollment>;

  /** Año y cuatrimestre que el usuario considera "actual" */
  periodoActual: {
    anio: number;
    cuatrimestre: 1 | 2;
  };
}

// ─── Acciones del store ───────────────────────────────────────────────────────

export interface TrackerActions {
  // ── Configuración y Perfil ─────────────────────────────────────────────────
  setUser: (name: string, selectedCareers: CarreraId[]) => void;
  setCarreraActiva: (carreraId: CarreraId) => void;
  setPeriodoActual: (anio: number, cuatrimestre: 1 | 2) => void;

  // ── Enrollments ────────────────────────────────────────────────────────────
  iniciarCursada: (
    materiaId: string,
    carreraId: CarreraId,
    anio?: number,
    cuatrimestre?: 1 | 2
  ) => void;
  cambiarEstado: (materiaId: string, estado: EstadoMateria) => void;
  cerrarCursada: (materiaId: string) => void;

  // ── Parciales ──────────────────────────────────────────────────────────────
  actualizarParcial: (
    materiaId: string,
    parcial: Omit<Parcial, "instancia"> & { instancia?: Parcial["instancia"] }
  ) => void;

  // ── Recuperatorios ─────────────────────────────────────────────────────────
  agregarRecuperatorio: (
    materiaId: string,
    recuperatorio: Omit<Parcial, "instancia">
  ) => void;

  // ── Examen Final ───────────────────────────────────────────────────────────
  registrarExamenFinal: (
    materiaId: string,
    examen: Omit<ExamenFinal, "aprobado">
  ) => void;

  // ── Notas y observaciones ──────────────────────────────────────────────────
  actualizarObservaciones: (materiaId: string, texto: string) => void;

  // ── Reset ──────────────────────────────────────────────────────────────────
  resetMateria: (materiaId: string) => void;
  resetTodo: () => void;
}

// ─── Estado inicial ───────────────────────────────────────────────────────────

const now = new Date();
const INITIAL_STATE: TrackerState = {
  user: null,
  carreraActiva: "gestion-publica",
  enrollments: {},
  periodoActual: {
    anio: now.getFullYear(),
    cuatrimestre: now.getMonth() < 6 ? 1 : 2,
  },
};

// ─── Helpers internos ─────────────────────────────────────────────────────────

function getOrCreateEnrollment(
  state: TrackerState,
  materiaId: string,
  carreraId?: CarreraId
): Enrollment {
  return (
    state.enrollments[materiaId] ?? {
      materiaId,
      carreraId: carreraId ?? state.carreraActiva,
      estado: "pendiente",
      parciales: [],
      recuperatorios: [],
      updatedAt: new Date().toISOString(),
    }
  );
}

/** Calcula automáticamente si el examen final fue aprobado (≥ 4) */
function calcularAprobacion(nota: number | null): boolean {
  return nota !== null && nota >= 4;
}

/** Recalcula el estado basado en la nota del final */
function resolverEstadoPostFinal(
  enrollment: Enrollment,
  nota: number | null,
  instancia: ExamenFinal["instancia"]
): EstadoMateria {
  if (nota === null) return enrollment.estado;
  if (nota >= 4) return "aprobada";
  if (instancia === "libre") return "libre"; // reprobó libre → libre
  
  // reprobó ordinario → sigue regular unless final_turns_left <= 1
  const turnsLeft = enrollment.final_turns_left !== undefined ? enrollment.final_turns_left - 1 : 2;
  if (turnsLeft <= 0) return "libre";
  return "regular";
}

// ─── Store principal ──────────────────────────────────────────────────────────

export const useTrackerStore = create<TrackerState & TrackerActions>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      // ── Configuración y Perfil ──────────────────────────────────────────────
      setUser: (name, selectedCareers) =>
        set({
          user: { name, selectedCareers },
          // Si setea carreras, hacemos que la primera sea la activa por defecto
          carreraActiva: selectedCareers[0] ?? get().carreraActiva,
        }),

      setCarreraActiva: (carreraId) =>
        set({ carreraActiva: carreraId }),

      setPeriodoActual: (anio, cuatrimestre) =>
        set({ periodoActual: { anio, cuatrimestre } }),

      // ── Iniciar cursada ────────────────────────────────────────────────────
      iniciarCursada: (materiaId, carreraId, anio, cuatrimestre) => {
        const state = get();
        const { periodoActual } = state;
        set({
          enrollments: {
            ...state.enrollments,
            [materiaId]: {
              ...getOrCreateEnrollment(state, materiaId, carreraId),
              estado: "cursando",
              anioInscripcion: anio ?? periodoActual.anio,
              cuatrimestreInscripcion: cuatrimestre ?? periodoActual.cuatrimestre,
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },

      // ── Cambiar estado manualmente ─────────────────────────────────────────
      cambiarEstado: (materiaId, estado) => {
        const state = get();
        const enrollment = getOrCreateEnrollment(state, materiaId);
        
        let final_turns_left = enrollment.final_turns_left;
        if (estado === "regular" && enrollment.estado !== "regular") {
          final_turns_left = 3;
        }

        set({
          enrollments: {
            ...state.enrollments,
            [materiaId]: {
              ...enrollment,
              estado,
              final_turns_left,
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },

      // ── Cerrar Cursada (Evaluación automática) ─────────────────────────────
      cerrarCursada: (materiaId) => {
        const state = get();
        const enrollment = getOrCreateEnrollment(state, materiaId);
        
        // Extraemos la mejor nota de cada parcial (considerando recuperatorios)
        const notasFinales = new Map<number, number>();
        
        enrollment.parciales.forEach(p => {
          if (p.nota !== null) {
            notasFinales.set(p.numero, Math.max(notasFinales.get(p.numero) || 0, p.nota));
          }
        });
        
        enrollment.recuperatorios.forEach(r => {
          if (r.nota !== null) {
            notasFinales.set(r.numero, Math.max(notasFinales.get(r.numero) || 0, r.nota));
          }
        });

        const notas = Array.from(notasFinales.values());
        
        let nuevoEstado: EstadoMateria = "libre";
        
        if (notas.length > 0) {
          const todosAprobados = notas.every(n => n >= 4);
          const promedio = notas.reduce((a, b) => a + b, 0) / notas.length;
          
          if (todosAprobados && promedio >= 7) {
            nuevoEstado = "aprobada"; // Promocionada
          } else if (todosAprobados) {
            nuevoEstado = "regular";
          }
        }

        let final_turns_left = enrollment.final_turns_left;
        let fechaAprobacion = enrollment.fechaAprobacion;
        
        if (nuevoEstado === "regular" && enrollment.estado !== "regular") {
          final_turns_left = 3;
        } else if (nuevoEstado === "aprobada" && enrollment.estado !== "aprobada") {
          fechaAprobacion = new Date().toISOString();
        }

        set({
          enrollments: {
            ...state.enrollments,
            [materiaId]: {
              ...enrollment,
              estado: nuevoEstado,
              final_turns_left,
              fechaAprobacion,
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },

      // ── Actualizar parcial ────────────────────────────────────────────────
      actualizarParcial: (materiaId, parcialData) => {
        const state = get();
        const enrollment = getOrCreateEnrollment(state, materiaId);
        const instancia = parcialData.instancia ?? "ordinario";
        const nuevoParcial: Parcial = { ...parcialData, instancia };

        // Reemplaza si ya existe el número, sino agrega
        const parciales = [...enrollment.parciales];
        const idx = parciales.findIndex(
          (p) => p.numero === nuevoParcial.numero
        );
        if (idx >= 0) {
          parciales[idx] = nuevoParcial;
        } else {
          parciales.push(nuevoParcial);
        }

        // Calcula nota de concepto: promedio de parciales aprobados
        const notasValidas = parciales
          .filter((p) => p.nota !== null && p.nota >= 4)
          .map((p) => p.nota as number);
        const notaConcepto =
          notasValidas.length > 0
            ? Math.round(
                (notasValidas.reduce((a, b) => a + b, 0) / notasValidas.length) * 10
              ) / 10
            : undefined;

        set({
          enrollments: {
            ...state.enrollments,
            [materiaId]: {
              ...enrollment,
              parciales,
              notaConcepto,
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },

      // ── Agregar recuperatorio ─────────────────────────────────────────────
      agregarRecuperatorio: (materiaId, recuperatorioData) => {
        const state = get();
        const enrollment = getOrCreateEnrollment(state, materiaId);
        const recuperatorio: Parcial = {
          ...recuperatorioData,
          instancia: "recuperatorio",
        };

        const recuperatorios = [...enrollment.recuperatorios];
        const idx = recuperatorios.findIndex(
          (r) => r.numero === recuperatorio.numero
        );
        if (idx >= 0) {
          recuperatorios[idx] = recuperatorio;
        } else {
          recuperatorios.push(recuperatorio);
        }

        set({
          enrollments: {
            ...state.enrollments,
            [materiaId]: {
              ...enrollment,
              recuperatorios,
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },

      // ── Registrar examen final ─────────────────────────────────────────────
      registrarExamenFinal: (materiaId, examenData) => {
        const state = get();
        const enrollment = getOrCreateEnrollment(state, materiaId);
        const aprobado = calcularAprobacion(examenData.nota);
        const examenFinal: ExamenFinal = { ...examenData, aprobado };
        const nuevoEstado = resolverEstadoPostFinal(
          enrollment,
          examenData.nota,
          examenData.instancia
        );

        let final_turns_left = enrollment.final_turns_left;
        let failed_exams = enrollment.failed_exams ?? 0;
        let used_free_exam = enrollment.used_free_exam || examenData.instancia === "libre";
        let fechaAprobacion = enrollment.fechaAprobacion;

        if (examenData.nota !== null && examenData.nota < 4) {
          failed_exams += 1;
          if (examenData.instancia === "ordinario") {
            final_turns_left = (final_turns_left ?? 3) - 1;
          }
        } else if (nuevoEstado === "aprobada" && enrollment.estado !== "aprobada") {
          fechaAprobacion = examenData.fecha ?? new Date().toISOString();
        }

        set({
          enrollments: {
            ...state.enrollments,
            [materiaId]: {
              ...enrollment,
              examenFinal,
              estado: nuevoEstado,
              final_turns_left,
              failed_exams,
              used_free_exam,
              fechaAprobacion,
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },

      // ── Observaciones ──────────────────────────────────────────────────────
      actualizarObservaciones: (materiaId, texto) => {
        const state = get();
        const enrollment = getOrCreateEnrollment(state, materiaId);
        set({
          enrollments: {
            ...state.enrollments,
            [materiaId]: {
              ...enrollment,
              observaciones: texto,
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },

      // ── Reset de una materia ───────────────────────────────────────────────
      resetMateria: (materiaId) => {
        const state = get();
        const { [materiaId]: _removed, ...rest } = state.enrollments;
        set({ enrollments: rest });
      },

      // ── Reset total ────────────────────────────────────────────────────────
      resetTodo: () =>
        set({
          enrollments: {},
          periodoActual: INITIAL_STATE.periodoActual,
        }),
    }),

    // ── Configuración de persistencia ─────────────────────────────────────────
    {
      name: "tracker-undef-v1",           // clave en localStorage
      storage: createJSONStorage(() => localStorage),
      version: 1,
      // Sólo persiste lo que nos interesa (excluye funciones)
      partialize: (state) => ({
        user: state.user,
        carreraActiva: state.carreraActiva,
        enrollments: state.enrollments,
        periodoActual: state.periodoActual,
      }),
      // Migración de versiones futuras
      migrate: (persistedState, version) => {
        if (version === 0) {
          // reservado para migraciones futuras
        }
        return persistedState as TrackerState & TrackerActions;
      },
    }
  )
);

// ─── Selectores derivados (hooks de conveniencia) ─────────────────────────────

/** Devuelve el enrollment de una materia o undefined si no existe */
export const useEnrollment = (materiaId: string) =>
  useTrackerStore((s) => s.enrollments[materiaId]);

/**
 * Progreso de la carrera para un conjunto de materiaIds.
 *
 * ⚠️  IMPORTANTE: usa `useShallow` para que el objeto resultado sea comparado
 * por valor superficial y no por referencia. Sin esto, `useSyncExternalStore`
 * (interno en Zustand v5) detecta un objeto "nuevo" en cada render, dispara
 * un re-render, que genera otro objeto nuevo → bucle infinito → crash.
 */
export const useProgresoCarrera = (materiaIds: string[]) =>
  useTrackerStore(
    useShallow((s) => {
      let aprobadas = 0;
      let cursando = 0;
      let regulares = 0;
      let sumaNotas = 0;
      let cantNotas = 0;

      materiaIds.forEach((id) => {
        const enr = s.enrollments[id];
        if (!enr) return;
        if (enr.estado === "aprobada") {
          aprobadas++;
          if (enr.examenFinal?.nota != null) {
            sumaNotas += enr.examenFinal.nota;
            cantNotas++;
          } else if (enr.notaConcepto != null) {
            sumaNotas += enr.notaConcepto;
            cantNotas++;
          }
        } else if (enr.estado === "cursando") {
          cursando++;
        } else if (enr.estado === "regular") {
          regulares++;
        }
      });

      return {
        total: materiaIds.length,
        aprobadas,
        cursando,
        regulares,
        pendientes: materiaIds.length - aprobadas - cursando - regulares,
        porcentaje:
          materiaIds.length > 0
            ? Math.round((aprobadas / materiaIds.length) * 100)
            : 0,
        promedioGeneral: cantNotas > 0 ? (sumaNotas / cantNotas).toFixed(2) : "0.00",
      };
    })
  );

/**
 * Verifica si una materia está bloqueada por correlativas.
 * Una correlativa se considera cumplida si su estado es 'regular' o 'aprobada'.
 */
export const useIsMateriaBloqueada = (prerequisites: string[]) =>
  useTrackerStore(
    useShallow((s) => {
      if (prerequisites.length === 0) return false;
      return prerequisites.some((preId) => {
        const estado = s.enrollments[preId]?.estado;
        return estado !== "regular" && estado !== "aprobada";
      });
    })
  );

/**
 * Indicadores estratégicos según reglamento UNDEF
 */
export const useStrategicKPIs = (materiaIds: string[]) =>
  useTrackerStore(
    useShallow((s) => {
      const totalMaterias = materiaIds.length;
      
      const currentYear = new Date().getFullYear();
      let aprobadasEsteAno = 0;
      let totalAplazos = 0;
      let totalLibres = 0;

      Object.values(s.enrollments).forEach((enr) => {
        // Solo contamos de las materias que están en materiaIds (el plan actual)
        if (!materiaIds.includes(enr.materiaId)) return;

        // 1. Regularidad anual con retrocompatibilidad
        // Si no tiene fechaAprobacion, probamos con la fecha del final o la última actualización (updatedAt)
        const fechaEfectiva = enr.fechaAprobacion || enr.examenFinal?.fecha || enr.updatedAt;
        if (enr.estado === "aprobada" && fechaEfectiva) {
          if (new Date(fechaEfectiva).getFullYear() === currentYear) {
            aprobadasEsteAno++;
          }
        }
        
        // 2. Aplazos con retrocompatibilidad
        // Si no tiene failed_exams pero su último examen fue reprobado, cuenta como mínimo 1 aplazo.
        const aplazoLegacy = (enr.examenFinal && !enr.examenFinal.aprobado && enr.examenFinal.nota !== null && enr.examenFinal.nota < 4) ? 1 : 0;
        const fallasTotales = enr.failed_exams ?? aplazoLegacy;
        if (fallasTotales > 0) {
          totalAplazos += fallasTotales;
        }

        // 3. Cupo Libre con retrocompatibilidad
        // Si la materia está en estado "libre" (la dejó libre o rindió mal libre), o el último examen fue libre
        const rindioLibre = enr.used_free_exam || enr.estado === "libre" || enr.examenFinal?.instancia === "libre";
        if (rindioLibre) {
          totalLibres++;
        }
      });

      const aplazosPermitidos = Math.floor(totalMaterias * 0.33);
      const libresPermitidos = Math.floor(totalMaterias * 0.30);

      return {
        regActual: aprobadasEsteAno,
        regRequerida: 2,
        aplazosActual: totalAplazos,
        aplazosPermitidos: Math.max(1, aplazosPermitidos),
        libresActual: totalLibres,
        libresPermitidos: Math.max(1, libresPermitidos),
      };
    })
  );

