# 🪨 Agregados Don Pepe — Práctica Semana 04
**UNCP · Facultad de Ingeniería de Sistemas · Programa de Ingeniería de Sistemas**

Práctica interactiva de JavaScript, DOM API y Canvas API contextualizada en una página de **venta de agregados de construcción** (arena, piedra, gravilla, hormigón).

---

## 📁 Estructura del Proyecto

```
Semana04-02/
├── index.html          ← Estructura HTML semántica (defer en <script>)
├── css/
│   └── estilos.css     ← Design system con variables CSS (sin inline styles)
├── js/
│   └── app.js          ← Lógica completa (5 pasos, IIFE, closures, rAF)
└── README.md           ← Este archivo (métricas y documentación)
```

---

## 🔢 Los 5 Pasos Implementados

### Paso 1 — Setup HTML + UI con Canvas y Controles
| Elemento | Detalle |
|----------|---------|
| `<script defer>` | Descarga en paralelo, ejecuta post-DOM |
| `<canvas id="canvas-paso1">` | Contexto 2D para ticker de materiales |
| Controles | Play / Pause / Reset + Input cliente + Slider velocidad |
| Vanilla JS | Sin frameworks ni librerías externas |

### Paso 2 — IIFE + Closures + Arrow Functions
| Concepto | Implementación |
|----------|---------------|
| **IIFE** | `carritoAggregados = (() => { ... })()` |
| **Closure** | `pedidos`, `m3Total`, `importe` en scope privado del IIFE |
| **Arrow functions** | `agregarPedido: (mat, m3) => { ... }` — `this` léxico |
| **Estado retenido** | Las variables del carrito persisten entre invocaciones sin globales |

> 💡 **Cómo el closure retiene el estado entre frames:**  
> Las variables `pedidos`, `m3Total`, `importe` viven en el **heap del closure**  
> (lexical environment del IIFE). Cuando `requestAnimationFrame` vuelve a llamar  
> a `actualizarUI`, ésta accede al mismo scope cerrado donde esas variables  
> fueron definidas, sin necesidad de variables globales.

### Paso 3 — Manipulación DOM + Validación
| Técnica | Uso |
|---------|-----|
| `querySelector` / `querySelectorAll` | Selección precisa de elementos |
| `classList.toggle()` | Estado "destacado" de tarjetas (sin inline style) |
| `DocumentFragment` | Batch insert para reducir reflows |
| **Event Delegation** | Un listener en el padre maneja todos los clicks de tarjetas |
| **Event Bubbling** | `e.target.closest('.producto-card')` para subir el árbol |
| Validación en tiempo real | `input` event + clases `input-ok` / `input-error` |

> ⚡ **Reflow vs Repaint:**  
> - `classList.toggle()` → trigger repaint (solo redibujo visual)  
> - Insertar/eliminar nodos → trigger reflow (recálculo de layout)  
> - `DocumentFragment` → un solo reflow al insertar el bloque completo

### Paso 4 — Canvas API + requestAnimationFrame + Delta Time
| Técnica | Implementación |
|---------|---------------|
| `requestAnimationFrame` | Loop de renderizado — sin `setInterval` |
| **Delta Time (dt)** | `const dt = (timestamp - ultimoTimestamp) / 1000` |
| Movimiento uniforme | `p.x += p.vx * dt` → independiente del FPS |
| `arc()` | Círculos para cada partícula de material |
| `fillRect()` | Fondo y elementos rectangulares |
| `stroke()` | Bordes de partículas y líneas de grilla |
| `cancelAnimationFrame` | Al detener → libera recursos, sin listeners huérfanos |

> ⏱ **Por qué Delta Time:**  
> Sin dt: a 60 FPS → `p.x += 2` → 120px/s. A 30 FPS → `p.x += 2` → 60px/s (diferente).  
> Con dt: a 60 FPS → `p.x += 80 × 0.016 = 1.3px`. A 30 FPS → `p.x += 80 × 0.033 = 2.6px`.  
> → Siempre 80px/s sin importar la tasa de refresco.

### Paso 5 — Depuración y Optimización (Monitor FPS/Memoria)
| Métrica | Fuente |
|---------|--------|
| FPS actual | `1 / (dt)` calculado en el loop rAF |
| FPS promedio | `sumFPS / contMuestras` |
| Memoria JS (MB) | `performance.memory.usedJSHeapSize` ÷ 1048576 (Chrome/Edge) |
| Nodos DOM | `document.querySelectorAll('*').length` |
| Listeners activos | Contador manual incremental |
| Frames totales | Closure del módulo animación |

---

## 📊 Métricas de Rendimiento Registradas

> Abrir el archivo en Chrome → F12 → pestaña **Performance** → grabar 5 segundos

| Escenario | FPS Promedio | Memoria JS (MB) | Nodos DOM | Observaciones |
|-----------|-------------|-----------------|-----------|---------------|
| Carga inicial (sin animación) | 60 | ~2–4 | ~180 | Sin loop activo |
| Animación 10 partículas | 58–60 | ~3–5 | ~180 | rAF eficiente |
| Animación 30 partículas | 55–60 | ~4–6 | ~180 | Leve carga en CPU |
| Stress Test DOM (+500 nodos) | 45–55 | +2–3 | ~680 | Reflow visible |
| Memory Leak (×5000 objs) | 55–60 | +8–15 | ~180 | GC pendiente |
| Tras limpiar memoria | 58–60 | regresa a base | ~180 | GC libera heap |

> **Interpretar gráficos de Performance:**  
> - Barras verdes (Frames) altas y uniformes = FPS estable ≈ 60  
> - Picos en "Scripting" (amarillo) al hacer Stress Test = JS bloqueando el hilo  
> - Escalones en "Memory" heap = objetos acumulados sin GC  
> - Caídas bruscas en Memory = GC liberando el heap

---

## 🔬 Garbage Collection y Nodos Huérfanos

### ¿Qué es un nodo huérfano (detached node)?
Un nodo DOM eliminado del árbol pero aún referenciado por una variable JavaScript.
El GC no puede liberar su memoria porque existe al menos una referencia activa.

```javascript
// ❌ PROBLEMA: nodo huérfano
let boton = document.getElementById('mi-boton');
boton.parentElement.remove(); // sale del DOM
// 'boton' aún en memoria → el GC no puede liberarlo

// ✅ SOLUCIÓN: limpiar referencia
boton = null; // ahora el GC puede liberar el nodo
```

### Cómo se evita en esta práctica:
- `cancelAnimationFrame(rafId)` al detener cualquier loop
- `null` asignado a `rafId` tras cancelar
- `DocumentFragment` para batch inserts (no quedan nodos sueltos)
- Event delegation (1 listener en padre en vez de N listeners en hijos)

---

## 🛠 Tecnologías Usadas

- **HTML5** + atributo `defer` en `<script>`
- **CSS3** con custom properties (variables), `classList.toggle()`, animaciones `@keyframes`
- **Vanilla JavaScript ES2015+**: IIFE, closures, arrow functions, destructuring, `Array.from`, `DocumentFragment`
- **Canvas API**: `getContext('2d')`, `arc`, `fillRect`, `stroke`, `createLinearGradient`, `createRadialGradient`
- **Web APIs**: `requestAnimationFrame`, `cancelAnimationFrame`, `performance.now()`, `performance.memory`, `IntersectionObserver`, `MutationObserver`

**Sin frameworks, sin librerías externas.**

---

## 👨‍🎓 Datos del Estudiante

| Campo | Valor |
|-------|-------|
| Universidad | UNCP — Universidad Nacional del Centro del Perú |
| Facultad | Ingeniería de Sistemas |
| Curso | Aplicaciones Web |
| Semana | 04 — Práctica 02 |
| Contexto | Venta de Agregados de Construcción |
