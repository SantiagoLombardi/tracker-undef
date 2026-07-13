export type CarreraId = "gestion-publica" | "ciberdefensa";

export interface Materia {
  id: string;
  name: string;
  year: number;
  semester: number;
  prerequisites: string[]; // array de IDs de materias
  description?: string;
}

export interface Carrera {
  id: CarreraId;
  name: string;
  materias: Materia[];
}

const gestionPublicaMaterias: Materia[] = [
  // 1º Año - 1º Cuatrimestre
  { id: "gp-1", name: "Introducción a la Administración Pública", year: 1, semester: 1, prerequisites: [] },
  { id: "gp-2", name: "Introducción a la Economía", year: 1, semester: 1, prerequisites: [] },
  { id: "gp-3", name: "Teoría del Estado", year: 1, semester: 1, prerequisites: [] },
  { id: "gp-4", name: "Derecho Constitucional e Instituciones de Derecho Público", year: 1, semester: 1, prerequisites: [] },
  // 1º Año - 2º Cuatrimestre
  { id: "gp-5", name: "Políticas Públicas I", year: 1, semester: 2, prerequisites: [] },
  { id: "gp-6", name: "Filosofía", year: 1, semester: 2, prerequisites: [] },
  { id: "gp-7", name: "Sociología General", year: 1, semester: 2, prerequisites: [] },
  { id: "gp-8", name: "Historia Social Argentina", year: 1, semester: 2, prerequisites: [] },
  
  // 2º Año - 1º Cuatrimestre
  { id: "gp-9", name: "Sistemas de Información Aplicados a la Gestión Pública", year: 2, semester: 1, prerequisites: [] },
  { id: "gp-10", name: "Economía Política", year: 2, semester: 1, prerequisites: ["gp-2"] },
  { id: "gp-11", name: "Derecho Administrativo", year: 2, semester: 1, prerequisites: ["gp-4"] },
  { id: "gp-12", name: "Administración Financiera y Técnicas Presupuestarias", year: 2, semester: 1, prerequisites: ["gp-2"] },
  // 2º Año - 2º Cuatrimestre
  { id: "gp-13", name: "Teoría de las Organizaciones I", year: 2, semester: 2, prerequisites: ["gp-1"] },
  { id: "gp-14", name: "Políticas Públicas II", year: 2, semester: 2, prerequisites: ["gp-5"] },
  { id: "gp-15", name: "Ética de la Función Pública", year: 2, semester: 2, prerequisites: ["gp-6"] },
  
  // 3º Año - 1º Cuatrimestre
  { id: "gp-16", name: "Estadística e Indicadores para la gestión", year: 3, semester: 1, prerequisites: ["gp-7"] },
  { id: "gp-17", name: "Planeamiento a Mediano y Largo Plazo", year: 3, semester: 1, prerequisites: ["gp-14"] },
  { id: "gp-18", name: "Taller de Diseño y Formulación de Proyectos", year: 3, semester: 1, prerequisites: ["gp-1", "gp-2", "gp-3", "gp-4", "gp-5", "gp-6", "gp-7", "gp-8", "gp-9", "gp-10", "gp-11", "gp-12", "gp-13", "gp-14", "gp-15"] }, // Asumimos segundo año aprobado como todos los previos
  
  // 3º Año - 2º Cuatrimestre
  { id: "gp-19", name: "Teoría de las Organizaciones II", year: 3, semester: 2, prerequisites: ["gp-13", "gp-1", "gp-2", "gp-3", "gp-4", "gp-5", "gp-6", "gp-7", "gp-8"] }, // 13 + primer año
  { id: "gp-20", name: "Dirección General y Liderazgo", year: 3, semester: 2, prerequisites: ["gp-1", "gp-2", "gp-3", "gp-4", "gp-5", "gp-6", "gp-7", "gp-8", "gp-9", "gp-10", "gp-11", "gp-12", "gp-13", "gp-14", "gp-15"] },
  { id: "gp-21", name: "Compras, Contrataciones y Licitaciones", year: 3, semester: 2, prerequisites: ["gp-12", "gp-1", "gp-2", "gp-3", "gp-4", "gp-5", "gp-6", "gp-7", "gp-8"] },
  { id: "gp-22", name: "Derecho Laboral y Régimen del Empleo Público", year: 3, semester: 2, prerequisites: ["gp-11", "gp-1", "gp-2", "gp-3", "gp-4", "gp-5", "gp-6", "gp-7", "gp-8"] },
  
  // 4º Año - 1º Cuatrimestre
  { id: "gp-23", name: "Comunicación Institucional", year: 4, semester: 1, prerequisites: ["gp-19"] },
  { id: "gp-24", name: "Electiva 1", year: 4, semester: 1, prerequisites: [] },
  { id: "gp-25", name: "Electiva 2", year: 4, semester: 1, prerequisites: [] },
  { id: "gp-26", name: "Finanzas Públicas y Federalismo Fiscal", year: 4, semester: 1, prerequisites: ["gp-21"] },
  { id: "gp-27", name: "Gestión y Desarrollo de Recursos Humanos", year: 4, semester: 1, prerequisites: ["gp-16", "gp-17", "gp-18", "gp-19", "gp-20", "gp-21", "gp-22"] },
  
  // 4º Año - 2º Cuatrimestre
  { id: "gp-28", name: "Sistemas de Gestión y Administración", year: 4, semester: 2, prerequisites: [] },
  { id: "gp-29", name: "Sostenibilidad Social y Ambiente", year: 4, semester: 2, prerequisites: [] },
  { id: "gp-30", name: "Auditoría, Control y Gestión de Calidad", year: 4, semester: 2, prerequisites: [] },
  { id: "gp-31", name: "Taller de Evaluación de Proyectos", year: 4, semester: 2, prerequisites: ["gp-16", "gp-17", "gp-18", "gp-19", "gp-20", "gp-21", "gp-22"] },
];

const ciberdefensaMaterias: Materia[] = [
  // 1º Año - 1º Cuatrimestre
  { id: "cd-1", name: "Análisis Matemático I", year: 1, semester: 1, prerequisites: [] },
  { id: "cd-2", name: "Álgebra I", year: 1, semester: 1, prerequisites: [] },
  { id: "cd-3", name: "Gestión de Servicios de Información", year: 1, semester: 1, prerequisites: [] },
  { id: "cd-4", name: "Inglés I", year: 1, semester: 1, prerequisites: [] },
  { id: "cd-5", name: "Sistemas Operativos I", year: 1, semester: 1, prerequisites: [] },
  // 1º Año - 2º Cuatrimestre
  { id: "cd-6", name: "Sistemas de Tratamiento de Datos", year: 1, semester: 2, prerequisites: ["cd-3"] },
  { id: "cd-7", name: "Infraestructura de Telecomunicaciones", year: 1, semester: 2, prerequisites: ["cd-3"] },
  { id: "cd-8", name: "Sociedad y Estado", year: 1, semester: 2, prerequisites: [] },
  { id: "cd-9", name: "Sistemas Operativos II", year: 1, semester: 2, prerequisites: ["cd-5"] },
  { id: "cd-10", name: "Lenguajes de Programación", year: 1, semester: 2, prerequisites: [] },
  
  // 2º Año - 1º Cuatrimestre
  { id: "cd-11", name: "Análisis Matemático II", year: 2, semester: 1, prerequisites: ["cd-1"] },
  { id: "cd-12", name: "Álgebra II", year: 2, semester: 1, prerequisites: ["cd-2"] },
  { id: "cd-13", name: "Probabilidad y Estadística", year: 2, semester: 1, prerequisites: [] },
  { id: "cd-14", name: "Inglés II", year: 2, semester: 1, prerequisites: ["cd-4"] },
  { id: "cd-15", name: "Tecnología Operativa", year: 2, semester: 1, prerequisites: [] },
  // 2º Año - 2º Cuatrimestre
  { id: "cd-16", name: "Programación Segura", year: 2, semester: 2, prerequisites: ["cd-6", "cd-7", "cd-10"] },
  { id: "cd-17", name: "Ciberseguridad aplicada", year: 2, semester: 2, prerequisites: [] },
  { id: "cd-18", name: "Dispositivos Remotos e Internet de las Cosas", year: 2, semester: 2, prerequisites: [] },
  { id: "cd-19", name: "Ética Profesional", year: 2, semester: 2, prerequisites: [] },
  
  // 3º Año - 1º Cuatrimestre
  { id: "cd-20", name: "Sistema de Gestión de Seguridad de la Información", year: 3, semester: 1, prerequisites: ["cd-3", "cd-6", "cd-7", "cd-17"] },
  { id: "cd-21", name: "Protección de Infraestructuras Críticas", year: 3, semester: 1, prerequisites: ["cd-3", "cd-8", "cd-17"] },
  { id: "cd-22", name: "Metodologías de Análisis de Riesgos de TIC", year: 3, semester: 1, prerequisites: [] },
  { id: "cd-23", name: "Análisis de Escenarios y Capacidades", year: 3, semester: 1, prerequisites: [] },
  
  // 3º Año - 2º Cuatrimestre
  { id: "cd-24", name: "Gobierno y Políticas Públicas", year: 3, semester: 2, prerequisites: ["cd-8"] },
  { id: "cd-25", name: "Informática Forense", year: 3, semester: 2, prerequisites: ["cd-5", "cd-16", "cd-20"] },
  { id: "cd-26", name: "Relaciones Internacionales", year: 3, semester: 2, prerequisites: [] },
  { id: "cd-27", name: "Inteligencia Artificial y Aprendizaje de Máquina", year: 3, semester: 2, prerequisites: ["cd-10"] },
  { id: "cd-28", name: "Geopolítica", year: 3, semester: 2, prerequisites: [] },
  
  // 4º Año - 1º Cuatrimestre
  { id: "cd-29", name: "Derecho Aplicado a la Defensa Nacional", year: 4, semester: 1, prerequisites: ["cd-8"] },
  { id: "cd-30", name: "Sistema de Inteligencia Nacional", year: 4, semester: 1, prerequisites: [] },
  { id: "cd-31", name: "Investigación Operativa", year: 4, semester: 1, prerequisites: [] },
  { id: "cd-32", name: "Criptografía Aplicada", year: 4, semester: 1, prerequisites: ["cd-21"] },
  
  // 4º Año - 2º Cuatrimestre
  { id: "cd-33", name: "Gestión de Proyectos", year: 4, semester: 2, prerequisites: [] },
  { id: "cd-34", name: "Instrumento Militar y su Sistema de Armas", year: 4, semester: 2, prerequisites: ["cd-30"] },
  { id: "cd-35", name: "Modelos y Simulación", year: 4, semester: 2, prerequisites: ["cd-31"] },
  { id: "cd-36", name: "Prospectiva Estratégica y Táctica", year: 4, semester: 2, prerequisites: ["cd-35"] },
  { id: "cd-37", name: "Actores en el Quinto Dominio", year: 4, semester: 2, prerequisites: [] },
];

export const carrerasMap: Record<CarreraId, Carrera> = {
  "gestion-publica": {
    id: "gestion-publica",
    name: "Lic. en Gestión Pública",
    materias: gestionPublicaMaterias,
  },
  "ciberdefensa": {
    id: "ciberdefensa",
    name: "Lic. en Ciberdefensa",
    materias: ciberdefensaMaterias,
  },
};
