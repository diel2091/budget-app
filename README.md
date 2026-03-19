# Budget Tracker App

Aplicación web de gestión de presupuesto personal construida con Next.js, Tailwind CSS y Supabase.

## Requisitos

- Node.js 20+
- npm o yarn
- Cuenta de Supabase

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/TU_USUARIO/budget-app.git
cd budget-app
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env.local
```

4. Editar `.env.local` con las credenciales de tu proyecto Supabase:
```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

5. Ejecutar el esquema de base de datos:
   - Ve al [SQL Editor de Supabase](https://supabase.com/dashboard)
   - Copia el contenido de `supabase/schema.sql`
   - Ejecuta el SQL

6. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter

## Funcionalidades

- **Dashboard**: Resumen visual de finanzas con KPIs y gráficas
- **Transacciones**: CRUD de gastos e ingresos
- **Suscripciones**: Gestión de suscripciones recurrentes
- **Reportes**: Análisis detallado por categoría y período
- **Ajustes**: Configuración de perfil y preferencias

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Auth + Postgres + RLS)
- Zustand (Estado global)
- Recharts (Gráficas)
- Zod (Validación)
