
# Documentación de Intent UI para el Proyecto (Astro + React)

## 1. Inicialización Base
Para configurar Intent UI y su tema por defecto en este proyecto, ejecuta el siguiente comando:
```bash
pnpm dlx shadcn@latest init @intentui/theme-default

```

*Nota de resolución de errores:* Si el CLI arroja un error indicando que `components.json` ya existe, simplemente vuelve a ejecutar el comando o asegúrate de que el registry esté configurado manualmente.

## 2. Configuración del Registry

Para usar los componentes de Intent UI, el archivo `components.json` en la raíz del proyecto DEBE contener esta entrada en la sección de registries:

```json
{
  "registries": {
    "@intentui": "https://intentui.com/r/{name}"
  }
}

```

*Contexto crítico (Astro):* Al inicializar shadcn, asegúrate de que los alias y rutas apunten correctamente a la estructura de Astro (ej. componentes en `src/components/ui` y utilidades en `src/lib/utils.ts`).

## 3. Instalación de Componentes

Usamos el CLI de shadcn para gestionar la instalación de componentes de Intent UI. El comando base es:

```bash
pnpm dlx shadcn@latest add @intentui/<nombre-del-componente>

```

Para la sección de KPIs/Estadísticas del dashboard, probablemente necesites inicializar los siguientes componentes base:

```bash
pnpm dlx shadcn@latest add @intentui/card @intentui/progress

```

## 4. Servidor MCP (Model Context Protocol)

Si necesitas habilitar el contexto avanzado de componentes mediante MCP para el agente, ejecuta:

```bash
gemini mcp add shadcn -- npx shadcn@latest mcp

```

