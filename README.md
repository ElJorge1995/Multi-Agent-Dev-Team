# 🤖 Multi-Agent Dev Team (Next.js & Vercel AI SDK)

Sistema autónomo y colaborativo de **3 agentes de Inteligencia Artificial** que trabajan juntos en bucle cerrado (closed-loop) para planificar, programar y validar software en tiempo real.

Proyecto desarrollado como solución para la prueba técnica de desarrollo Full-Stack & Inteligencia Artificial.

---

## 📋 Requisitos de la Prueba y Cumplimiento

| Requisito | Estado | Implementación |
| :--- | :---: | :--- |
| **Equipo de 3 agentes** (Orquestador, Develop, Testing) | ✅ | Máquina de estados con roles segregados y bucle de feedback continuo. |
| **Hecho en Next.js** | ✅ | Next.js (App Router), React 19, TypeScript y Tailwind CSS. |
| **Programado con Claude Code / Codex / CLI** | ✅ | Asistencia integral en modelado, arquitectura y generación estructurada. |
| **Base de datos gratuita** | ✅ | Prisma ORM compatible con **Neon Postgres** y **Supabase** (con fallback local). |
| **Publicado en Vercel** | ✅ | Preparado para despliegue serverless continuo en 1 clic. |
| **Visualización en tiempo real** | ✅ | Streaming de pensamientos vía **Server-Sent Events (SSE)**, Kanban y visor de código. |
| **Sin coste & Sin claves en repo** | ✅ | Modo autónomo sin coste + `.gitignore` estricto para `.env`. |

---

## 🏛️ Arquitectura del Sistema

```mermaid
flowchart TD
    User([Usuario]) -->|1. Petición en lenguaje natural| Orch[Agente 1: Orquestador]
    
    subgraph MultiAgentLoop [Equipo de Agentes Autónomos]
        Orch -->|2. Desglose en tareas atómicas y criterios| Pipeline[Task Pipeline]
        Pipeline -->|3. Asignación de tarea| Dev[Agente 2: Develop]
        Dev -->|4. Código y artefactos TSX/API| Test[Agente 3: Testing]
        
        Test -->|5. Falla caso borde / Feedback correctivo| Dev
        Test -->|6. 100% Tests superados| Pass[Tarea Aprobada]
    end

    Pass -->|Siguiente tarea o finalización| DB[(PostgreSQL: Neon / Supabase)]
    MultiAgentLoop -.->|Streaming en tiempo real SSE| UI[Dashboard Next.js en Vivo]
```

### 1. Orquestador
Recibe el requerimiento del usuario (ej: *"Añade una página de contacto a esta web con validación"*), analiza la arquitectura necesaria y desglosa el objetivo en tareas atómicas secuenciales con criterios de aceptación explícitos para Testing.

### 2. Develop
Construye la solución técnica en Next.js, TypeScript y Tailwind CSS. Si recibe un reporte de fallo de Testing, analiza el stack trace y las recomendaciones para producir una versión corregida.

### 3. Testing
Evalúa el código entregado frente a los criterios de aceptación y casos borde (validaciones de input, estados de carga, accesibilidad, tipado estricto). Si detecta un defecto, **devuelve la tarea a Develop con feedback detallado hasta que todo pase al 100%**.

---

## 🚀 Despliegue en Vercel (1 Clic)

1. Sube este repositorio a tu cuenta de **GitHub**.
2. Entra en [Vercel](https://vercel.com) e importa el repositorio.
3. *(Opcional)* En **Environment Variables**, añade:
   - `DATABASE_URL`: Tu cadena de conexión de Neon o Supabase.
   - `OPENAI_API_KEY` o `GOOGLE_GENERATIVE_AI_API_KEY`: Si deseas usar llamadas a LLM en vivo (la app cuenta además con un Modo Autónomo inteligente sin coste).
4. Haz clic en **Deploy**. ¡Listo para abrir!

---

## 💻 Ejecución en Local

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd ai-dev-team

# 2. Instalar dependencias
npm install

# 3. (Opcional) Vincular base de datos PostgreSQL
# Copia .env.example a .env y define DATABASE_URL
cp .env.example .env
npx prisma db push

# 4. Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🛠️ Cómo se utilizaron las herramientas de IA (Claude Code / Codex / CLI)

Durante el ciclo de desarrollo de esta prueba se utilizaron asistentes de codificación agentic en terminal para:
1. **Scaffolding y Arquitectura**: Configuración del proyecto Next.js, TypeScript estricto y configuración del pipeline de compilación.
2. **Modelado Relacional en Prisma**: Diseño de las entidades `Project`, `Task`, `AgentLog` y `Artifact` optimizadas para PostgreSQL serverless.
3. **Ingeniería de Prompts y Schemas Zod**: Creación de contratos de datos estrictos para garantizar que la comunicación entre agentes fuera predecible y libre de alucinaciones sintácticas.
4. **Streaming Reactivo con Server-Sent Events**: Implementación del stream bidireccional entre el runtime de Next.js y los componentes de UI reactivos.

---

## 📝 Respuestas a las 4 Preguntas de la Entrevista

### 1. ¿Qué integraciones con servicios externos has hecho (pagos, CRM, WhatsApp, Google...)? Cuéntanos una que te costara y cómo la resolviste.
> **Respuesta:**
> He trabajado con un amplio abanico de integraciones complejas en proyectos reales de producción:
> - **Pagos y Logística (en *EFL - Elite Fight League*):** Integración de Stripe (PaymentIntent embebido, checkout y webhooks asíncronos con firma criptográfica `stripe-signature` e idempotencia) y la API de Packlink PRO para cálculo de tarifas de envío en tiempo real y generación de borradores de etiquetas vía Vercel Crons.
> - **Redes Sociales y OAuth (en *BotRedesSociales*):** Meta Graph API (Facebook Pages e Instagram Business Login directo con ciclo de refresco de tokens de 60 días), TikTok Content Posting API (Direct Post), YouTube Data API v3 (Google Cloud OAuth2 con `access_type=offline`), Twitter/X API (Pay-Per-Use) y workflows automatizados con n8n.
> - **Bases de datos y mensajería:** Supabase (PostgreSQL, Auth y Storage con RLS activo) y nodemailer SMTP para comunicaciones transaccionales.
>
> **La integración que más me costó y cómo la resolví:**
> La **API de TikTok (Content Posting API - Direct Post)**. Fue un reto mayúsculo que requirió superar **3 rechazos de auditoría** antes de conseguir la aprobación oficial para publicar en vivo:
> 1. *Rechazo por modelo de negocio:* TikTok no aprueba apps para "uso personal/interno"; tuve que reestructurar la plataforma y la documentación técnica para certificarla como multi-cliente (los clientes conectan sus propias cuentas vía OAuth).
> 2. *Rechazo por coherencia de marca:* Exigieron coherencia total en todos los puntos de contacto: nombre de app = título de pestaña = dominio verificado (`redes.regladoconsultores.com`) = favicon, junto con páginas públicas de Términos y Privacidad sin requerir login.
> 3. *Rechazo por vídeo demo y Direct Post:* Exigían un vídeo demostrativo continuo sin cortes con la barra de navegación visible mostrando la publicación efectiva en TikTok. Además, la auditoría de *Direct Post* era un trámite independiente al App Review inicial, requiriendo verificación de dominio previa para `PULL_FROM_URL` en fotos y carga binaria `FILE_UPLOAD` para vídeos.
> Resolví cada requerimiento punto por punto hasta lograr la certificación completa en producción.

---

### 2. ¿Has publicado apps en App Store o Google Play? ¿Cuáles y qué parte hiciste tú?
> **Respuesta:**
> Mi trayectoria principal está enfocada en el desarrollo **Full-Stack Web (Next.js, Laravel, Supabase, PostgreSQL) y aplicaciones web progresivas (PWAs)** responsivas de alto rendimiento optimizadas para dispositivos móviles.
>
> Aunque no he publicado apps móviles nativas individuales directamente en App Store o Google Play, domino con solvencia los estándares de seguridad, privacidad y verificación de permisos que exigen las grandes plataformas (como demuestran las auditorías aprobadas en Meta App Review y TikTok Direct Post, cuyos criterios de revisión, gestión de scopes OAuth y políticas de datos son idénticos a los de Google Play Console y App Store Connect). Además, cuento con base sólida en React y TypeScript que me permite adaptarme de inmediato a React Native o Expo cuando el proyecto lo requiere.

---

### 3. ¿Has montado sistemas de agentes de IA (varios agentes que se reparten el trabajo)? ¿Con qué herramientas y para qué?
> **Respuesta:**
> Sí. He diseñado sistemas multi-agente utilizando **Vercel AI SDK**, modelos LLM con validación estructurada (Zod / *Structured Outputs*) y orquestación visual en **n8n**:
> 1. **Equipo Autónomo de Desarrollo (este proyecto):** Una tríada colaborativa en bucle cerrado (closed-loop) donde el *Orquestador* analiza y desglosa requerimientos, *Develop* programa los ficheros técnicos y *Testing* ejecuta pruebas automáticas, devolviendo feedback de corrección a Develop hasta que el código queda 100% aprobado.
> 2. **Workflows Multi-Agente en n8n:** Nodos y agentes especializados que ingieren contenidos de múltiples fuentes, sintetizan y adaptan el tono de redacción para cada red social con LLMs, y coordinan la publicación automatizada mediante APIs REST.

---

### 4. Un cliente te pide algo que no entra en lo contratado. ¿Cómo se lo dices?
> **Respuesta:**
> Lo abordo con **asertividad, empatía y orientación comercial constructiva**, cuidando la relación con el cliente sin comprometer los plazos ni el alcance pactado.
>
> **El enfoque que utilizo consta de 3 pasos:**
> 1. **Validar la propuesta:** *«Me parece una propuesta excelente y entiendo perfectamente el valor que añade al producto final.»*
> 2. **Contextualizar con el acuerdo actual:** *«Revisando la planificación y el alcance firmado para esta entrega, esta funcionalidad es un requerimiento nuevo que no estaba contemplado.»*
> 3. **Brindar dos alternativas de solución inmediata:**
>    - **Alternativa A (Fase 2 / Addendum):** *«Podemos estimar el esfuerzo y presupuestarlo como una mejora o fase 2 para implementarlo inmediatamente después del lanzamiento actual, evitando demoras en la fecha pactada.»*
>    - **Alternativa B (Intercambio de alcance):** *«O bien, si esta función es prioritaria para el lanzamiento, podemos sustituir alguna de las tareas previstas de peso similar para no alterar ni el presupuesto ni la fecha de entrega.»*
