/**
 * =============================================================
 * app.js — Agregados Salazar (Integración de Práctica)
 * =============================================================
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

    /* ============================================================
       ■ PASO 1: Setup HTML + UI con Canvas (Ticker)
    ============================================================ */
    const canvasTicker = document.getElementById('canvas-ticker');
    if (canvasTicker) {
        const ctxTicker = canvasTicker.getContext('2d');
        let tickerPos = 0;
        
        function drawTicker() {
            const w = canvasTicker.width;
            const h = canvasTicker.height;
            
            ctxTicker.clearRect(0, 0, w, h);
            ctxTicker.fillStyle = 'rgba(0,0,0,0.5)';
            ctxTicker.fillRect(0, 0, w, h);
            
            const texto = "🔥 OFERTA: Arena Fina S/.45/m³ | Piedra Chancada S/.65/m³ | Envíos a todo Huancayo y Jauja 🔥";
            ctxTicker.font = '16px Poppins, sans-serif';
            ctxTicker.fillStyle = '#ff6b35';
            
            const textWidth = ctxTicker.measureText(texto).width;
            ctxTicker.fillText(texto, tickerPos, 32);
            
            tickerPos -= 1.5;
            if (tickerPos < -textWidth) tickerPos = w;
            
            requestAnimationFrame(drawTicker);
        }
        drawTicker();
    }

    /* ============================================================
       ■ PASO 2: IIFE + Closures (Carrito de Pedidos)
    ============================================================ */
    const carritoController = (() => {
        let items = 0;
        let m3Total = 0;
        let total = 0;

        const updateUI = () => {
            document.getElementById('cl-items').textContent = items;
            document.getElementById('cl-m3').textContent = m3Total.toFixed(1);
            document.getElementById('cl-total').textContent = `S/. ${total.toFixed(2)}`;
        };

        return {
            agregar: (precio, m3) => {
                items++;
                m3Total += parseFloat(m3);
                total += (precio * parseFloat(m3));
                updateUI();
            },
            vaciar: () => {
                items = 0; m3Total = 0; total = 0;
                updateUI();
            }
        };
    })();

    document.querySelectorAll('.btn-pedir').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.agregado-card');
            const precio = parseFloat(card.dataset.precio);
            const inputM3 = card.querySelector('.m3-input');
            const m3 = inputM3.value;
            
            if (m3 > 0) {
                carritoController.agregar(precio, m3);
                btn.textContent = "¡Añadido!";
                btn.style.background = "#22c55e";
                setTimeout(() => {
                    btn.textContent = "Añadir al Carrito";
                    btn.style.background = "";
                }, 1000);
            }
        });
    });

    const btnVaciar = document.getElementById('btn-vaciar');
    if (btnVaciar) {
        btnVaciar.addEventListener('click', () => {
            carritoController.vaciar();
        });
    }


    /* ============================================================
       ■ PASO 3: Manipulación DOM + Validación
    ============================================================ */
    const reglasValidacion = {
        'val-nombre': { msgEl: 'msg-nombre', val: (v) => v.trim().length >= 5, msgOk: '✓ Válido', msgErr: '✗ Mínimo 5 letras' },
        'val-dni':    { msgEl: 'msg-dni', val: (v) => /^\d{8}$/.test(v), msgOk: '✓ Válido', msgErr: '✗ Debe ser de 8 números' },
        'val-tel':    { msgEl: 'msg-tel', val: (v) => /^9\d{8}$/.test(v), msgOk: '✓ Válido', msgErr: '✗ Debe empezar con 9 (9 dígitos)' }
    };

    Object.entries(reglasValidacion).forEach(([id, regla]) => {
        const input = document.getElementById(id);
        if(input){
            input.addEventListener('input', (e) => {
                const val = e.target.value;
                const ok = regla.val(val);
                const msgEl = document.getElementById(regla.msgEl);
                
                input.classList.toggle('input-ok', ok);
                input.classList.toggle('input-error', !ok && val.length > 0);
                
                msgEl.textContent = val.length === 0 ? '' : (ok ? regla.msgOk : regla.msgErr);
                msgEl.className = `val-msg ${val.length === 0 ? '' : (ok ? 'ok' : 'error')}`;
            });
        }
    });

    const formCotiz = document.getElementById('form-cotizacion');
    if(formCotiz) {
        formCotiz.addEventListener('submit', (e) => {
            e.preventDefault();
            alert("Cotización validada y enviada a Agregados Salazar.");
            formCotiz.reset();
            document.querySelectorAll('.val-msg').forEach(el => el.textContent = "");
            document.querySelectorAll('input').forEach(el => { el.classList.remove('input-ok'); el.classList.remove('input-error'); });
        });
    }


    /* ============================================================
       ■ PASO 4: Canvas API + rAF
    ============================================================ */
    const canvasAnim = document.getElementById('canvas-animacion');
    if (canvasAnim) {
        const ctxAnim = canvasAnim.getContext('2d');
        let rafId = null;
        let particulas = [];
        
        for(let i=0; i<30; i++) {
            particulas.push({
                x: Math.random() * canvasAnim.width,
                y: Math.random() * canvasAnim.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                radio: 2 + Math.random() * 5,
                color: ['#d4a853', '#6b7280', '#9ca3af'][Math.floor(Math.random()*3)]
            });
        }

        function animar() {
            ctxAnim.clearRect(0,0, canvasAnim.width, canvasAnim.height);
            particulas.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                if(p.x < 0 || p.x > canvasAnim.width) p.vx *= -1;
                if(p.y < 0 || p.y > canvasAnim.height) p.vy *= -1;
                
                ctxAnim.beginPath();
                ctxAnim.arc(p.x, p.y, p.radio, 0, Math.PI*2);
                ctxAnim.fillStyle = p.color;
                ctxAnim.fill();
            });
            rafId = requestAnimationFrame(animar);
        }

        document.getElementById('btn-anim-play').addEventListener('click', () => {
            if(!rafId) animar();
        });
        document.getElementById('btn-anim-pause').addEventListener('click', () => {
            cancelAnimationFrame(rafId);
            rafId = null;
        });
    }

    /* ============================================================
       ■ PASO 5: Monitor de Rendimiento
    ============================================================ */
    let lastTime = performance.now();
    let frames = 0;
    
    function monitorLoop() {
        if(document.getElementById('monitor-panel').style.display !== 'none') {
            const now = performance.now();
            frames++;
            if (now >= lastTime + 1000) {
                document.getElementById('mon-fps').textContent = frames;
                frames = 0;
                lastTime = now;
                
                if (performance.memory) {
                    document.getElementById('mon-mem').textContent = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
                } else {
                    document.getElementById('mon-mem').textContent = "N/A";
                }
                
                document.getElementById('mon-nodes').textContent = document.querySelectorAll('*').length;
            }
        }
        requestAnimationFrame(monitorLoop);
    }
    monitorLoop();

});