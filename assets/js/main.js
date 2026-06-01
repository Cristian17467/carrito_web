// --- CONFIGURACIÓN DE TUS APIS ---
const API_URL = "http://192.168.1.105:5000/api/movimiento/registro";
const WS_URL = "ws://192.168.1.105:5001/";

// --- 1. LÓGICA DE NAVEGACIÓN SIDECAR (matching screenshots) ---
const navControl = document.getElementById("nav-control");
const navMonitoreo = document.getElementById("nav-monitoreo");
const viewControl = document.getElementById("view-control");
const viewMonitoreo = document.getElementById("view-monitoreo");

function cambiarPanel(panelAMostrar, btnAactivar) {
    // 1. Ocultar todos los paneles
    viewControl.classList.add("d-none");
    viewMonitoreo.classList.add("d-none");

    // 2. Desactivar todos los botones de la navegación
    navControl.classList.remove("active");
    navControl.classList.add("text-white");
    navMonitoreo.classList.remove("active");
    navMonitoreo.classList.add("text-white");

    // 3. Mostrar el panel deseado y activar su botón
    panelAMostrar.classList.remove("d-none");
    btnAactivar.classList.add("active");
    btnAactivar.classList.remove("text-white");
}

navControl.addEventListener("click", () => cambiarPanel(viewControl, navControl));
navMonitoreo.addEventListener("click", () => cambiarPanel(viewMonitoreo, navMonitoreo));


// --- 2. LÓGICA DE HISTORIAL PARA LA PESTAÑA MONITOREO ---
let historialRegistros = []; // Arreglo en memoria para los últimos 5 eventos

function actualizarTabla(movimiento, obstaculo) {
    const ahora = new Date();
    const horaStr = ahora.toLocaleTimeString();

    // Insertar al inicio de la lista
    historialRegistros.unshift({
        hora: horaStr,
        mov: movimiento,
        obs: obstaculo ? "DETECTADO" : "Libre"
    });

    // Mantener solo los últimos 5
    if (historialRegistros.length > 5) {
        historialRegistros.pop();
    }

    // Dibujar la tabla
    const tbody = document.getElementById("tabla-historial");
    tbody.innerHTML = ""; // Limpiar tabla

    historialRegistros.forEach((reg, index) => {
        let fila = document.createElement("tr");
        
        // Colores según el estado
        let colorObs = reg.obs === "DETECTADO" ? "text-danger fw-bold" : "text-success";
        let colorMov = reg.mov === "detenido" ? "text-warning" : "text-white";

        fila.innerHTML = `
            <td>${index + 1}</td>
            <td class="text-muted">${reg.hora}</td>
            <td class="${colorMov}">${reg.mov.toUpperCase()}</td>
            <td class="${colorObs}">${reg.obs}</td>
        `;
        tbody.appendChild(fila);
    });
}

// --- 3. FUNCIÓN PARA MANDAR MOVIMIENTOS AL FLASK ---
function mover(id_movimiento) {
    // NUEVO: Reiniciar la pantalla a "CAMINO LIBRE" al presionar un botón de movimiento 
    const monitorObs = document.getElementById("monitor-obstaculo");
    const radarObsBig = document.getElementById("monitoreo-obstaculo-big");
    const panelObs = document.getElementById("panel-obstaculo");
    const cardSensorBig = document.getElementById("card-sensor-big");

    if (monitorObs) {
        monitorObs.textContent = "CAMINO LIBRE";
        monitorObs.className = "text-success";
        if (panelObs) panelObs.classList.replace("border-danger", "border-secondary");
    }
    if (radarObsBig) {
        radarObsBig.textContent = "VÍA LIBRE";
        radarObsBig.className = "display-4 fw-bold text-success";
        if (cardSensorBig) cardSensorBig.classList.replace("border-danger", "border-warning");
    }
    //  FIN DE NUEVO 

    if (grabando) secuenciaDemo.push(id_movimiento);
    const payload = {
        id_movimiento: id_movimiento,
        id_dispositivo: 1,
        id_telemetria: 1,
        origen: "Web Dashboard"
    };

    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return response.json();
    })
    .then(data => {
        logTerminal(`[MANDO] -> Enviado mov. ID: ${id_movimiento}`);
    })
    .catch(error => {
        logTerminal(`[ERROR] Fallo en la API: ${error.message}`, true);
    });
}

// --- 4. WEBSOCKETS (Recepción en Tiempo Real) ---
const ws = new WebSocket(WS_URL);
const wsBadge = document.getElementById("ws-badge");

// Elementos Pestaña Control
const monitorMovimiento = document.getElementById("monitor-movimiento");
const monitorObstaculo = document.getElementById("monitor-obstaculo");
const panelObstaculo = document.getElementById("panel-obstaculo");

// Elementos Pestaña Monitoreo
const monitoreoMovimientoBig = document.getElementById("monitoreo-movimiento-big");
const monitoreoObstaculoBig = document.getElementById("monitoreo-obstaculo-big");
const cardSensorBig = document.getElementById("card-sensor-big");

ws.onopen = () => {
    wsBadge.textContent = "Conectado";
    wsBadge.classList.replace("bg-danger", "bg-success");
    logTerminal("[WS] Conexión establecida.");
};

ws.onclose = () => {
    wsBadge.textContent = "Desconectado";
    wsBadge.classList.replace("bg-success", "bg-danger");
    logTerminal("[WS] Conexión perdida.", true);
};

ws.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);
        
        let nombreMov = data.nombre_movimiento || "DESCONOCIDO";
        let hayObstaculo = data.obstaculo_detectado === true;

        // 1. Actualizar textos en AMBAS pestañas
        if (monitorMovimiento) monitorMovimiento.textContent = nombreMov.toUpperCase();
        if (monitoreoMovimientoBig) monitoreoMovimientoBig.textContent = nombreMov.toUpperCase();

        // 2. Lógica Visual de Obstáculos (Aplicando colores Bootstrap)
        if (hayObstaculo) {
            // Pestaña Control
            if (monitorObstaculo) {
                monitorObstaculo.textContent = "¡ALERTA! DETENIDO";
                monitorObstaculo.className = "text-danger fw-bold"; // Fuerza color rojo
            }
            if (panelObstaculo) {
                panelObstaculo.classList.replace("border-secondary", "border-danger");
            }
            
            // Pestaña Monitoreo
            if (monitoreoObstaculoBig) {
                monitoreoObstaculoBig.textContent = "¡OBSTÁCULO!";
                monitoreoObstaculoBig.className = "display-4 fw-bold text-danger"; // Fuerza color rojo
            }
            if (cardSensorBig) {
                cardSensorBig.classList.replace("border-warning", "border-danger");
            }
        } else {
            // Restaurar a la normalidad si llega un mensaje indicando que no hay obstáculo
            if (monitorObstaculo) {
                monitorObstaculo.textContent = "CAMINO LIBRE";
                monitorObstaculo.className = "text-success"; // Fuerza color verde
            }
            if (panelObstaculo) {
                panelObstaculo.classList.replace("border-danger", "border-secondary");
            }
            
            if (monitoreoObstaculoBig) {
                monitoreoObstaculoBig.textContent = "VÍA LIBRE";
                monitoreoObstaculoBig.className = "display-4 fw-bold text-success"; // Fuerza color verde
            }
            if (cardSensorBig) {
                cardSensorBig.classList.replace("border-danger", "border-warning");
            }
        }

        // 3. Alimentar la tabla del historial (Pestaña Monitoreo)
        actualizarTabla(nombreMov, hayObstaculo);

        logTerminal(`[CARRO] Ejecutando: ${nombreMov}`);

    } catch (e) {
        console.error("Error leyendo WS:", e);
    }
};

// --- 5. UTILIDADES ---
function logTerminal(mensaje, esError = false) {
    const terminal = document.getElementById("terminal");
    if (!terminal) return;
    const timestamp = new Date().toLocaleTimeString();
    const color = esError ? "color: red;" : "color: #00ff00;";
    terminal.innerHTML += `<div style="${color}">[${timestamp}] ${mensaje}</div>`;
    terminal.scrollTop = terminal.scrollHeight; // Auto-scroll
}

// --- FUNCIONALIDAD DE VELOCIDAD ---
function cambiarVelocidad(valor) {
    // 1. Cambia el texto visual en la pantalla
    let txtVel = document.getElementById('textoVelocidad');
    if (txtVel) txtVel.innerText = valor + '%';
    console.log("Nueva velocidad enviada: " + valor);

    const API_URL_PARAMETRO = "http://localhost:5000/api/parametros"; 
    
    fetch(API_URL_PARAMETRO, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            clave: "velocidad",    
            valor: parseInt(valor)  
        }) 
    })
    .then(response => response.json())
    .then(data => console.log('Respuesta de velocidad:', data))
    .catch(error => console.error('Error enviando velocidad:', error));
}

// --- FUNCIONALIDAD DEL MODO DEMO ---
let grabando = false;
let secuenciaDemo = [];
let enBucle = false;
let intervaloBucle = null;

function toggleGrabacion() {
    let btn = document.getElementById('btn-grabar');
    let estado = document.getElementById('estado-demo');
    
    if (!btn || !estado) return;

    if (!grabando) {
        // Iniciar grabación
        grabando = true;
        secuenciaDemo = []; // Borramos secuencia anterior
        btn.innerHTML = "⏹ Detener Grabación";
        btn.classList.replace('btn-danger', 'btn-outline-danger');
        estado.innerText = "🔴 GRABANDO... (Usa las flechas)";
        estado.classList.replace('text-warning', 'text-danger');
    } else {
        // Detener grabación
        grabando = false;
        btn.innerHTML = "🔴 Iniciar Grabación";
        btn.classList.replace('btn-outline-danger', 'btn-danger');
        estado.innerText = `✅ Guardado (${secuenciaDemo.length} pasos)`;
        estado.classList.replace('text-danger', 'text-success');
    }
}

function ejecutarSecuencia() {
    if (secuenciaDemo.length === 0) {
        alert("¡No hay nada grabado! Inicia la grabación y mueve el vehículo primero.");
        return;
    }
    
    let estado = document.getElementById('estado-demo');
    if(estado) {
        estado.innerText = "▶ EJECUTANDO SECUENCIA...";
        estado.classList.replace('text-success', 'text-info');
    }
    
    let pasoActual = 0;
    // Ejecuta un movimiento cada 1 segundo (1000 milisegundos)
    let intervalo = setInterval(() => {
        if (pasoActual < secuenciaDemo.length) {
            mover(secuenciaDemo[pasoActual]); // Envía el movimiento a tu función
            pasoActual++;
        } else {
            clearInterval(intervalo);
            if (!enBucle && estado) {
                estado.innerText = "✅ Secuencia finalizada";
                estado.classList.replace('text-info', 'text-success');
                mover(3); // Envía ID de detener al final
            }
        }
    }, 1000);
}

function toggleBucle() {
    let btn = document.getElementById('btn-bucle');
    let estado = document.getElementById('estado-demo');
    
    if (!btn || !estado) return;

    enBucle = !enBucle;
    
    if (enBucle) {
        btn.classList.replace('btn-primary', 'btn-info');
        btn.innerHTML = "🔄 Detener Bucle";
        if (secuenciaDemo.length > 0) {
            ejecutarSecuencia();
            // Calcula cuánto tarda la secuencia entera para volver a lanzarla
            let tiempoTotalSecuencia = secuenciaDemo.length * 1000;
            intervaloBucle = setInterval(ejecutarSecuencia, tiempoTotalSecuencia + 500);
        }
    } else {
        btn.classList.replace('btn-info', 'btn-primary');
        btn.innerHTML = "🔁 Repetir en Bucle";
        clearInterval(intervaloBucle);
        estado.innerText = "⏹ Bucle cancelado";
        estado.classList.replace('text-info', 'text-warning');
        mover(3); // Envía comando de detener
    }
}
/* =========================================
   MEJORAS PREMIUM: TECLADO, GAMEPAD, AUDIO Y GRÁFICAS
   ========================================= */

// --- 1. SINTETIZADOR DE AUDIO UI (Beeps y Clics) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function reproducirSonido(tipo) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (tipo === 'clic') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    } else if (tipo === 'alerta') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.setValueAtTime(600, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    }
}

// Inyectar sonido a los botones de movimiento (sobrescribiendo sutilmente la función mover actual si quieres, 
// o simplemente lo añadimos al evento click de los botones de la clase btn-control)
document.querySelectorAll('.btn-control, .btn-stop').forEach(btn => {
    btn.addEventListener('click', () => reproducirSonido('clic'));
});


// --- 2. CONTROLES POR TECLADO (WASD / Flechas) ---
let teclaPresionada = false;
document.addEventListener('keydown', (e) => {
    if (teclaPresionada || document.activeElement.tagName === 'INPUT') return;
    
    switch(e.key.toLowerCase()) {
        case 'w': case 'arrowup': mover(1); reproducirSonido('clic'); teclaPresionada = true; break;
        case 's': case 'arrowdown': mover(2); reproducirSonido('clic'); teclaPresionada = true; break;
        case 'a': case 'arrowleft': mover(9); reproducirSonido('clic'); teclaPresionada = true; break;
        case 'd': case 'arrowright': mover(8); reproducirSonido('clic'); teclaPresionada = true; break;
        case 'q': mover(11); reproducirSonido('clic'); teclaPresionada = true; break; // Eje Izq
        case 'e': mover(10); reproducirSonido('clic'); teclaPresionada = true; break; // Eje Der
    }
});

document.addEventListener('keyup', (e) => {
    const teclasValidas = ['w', 'a', 's', 'd', 'q', 'e', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
    if (teclasValidas.includes(e.key.toLowerCase())) {
        mover(3); // STOP
        teclaPresionada = false;
    }
});


// --- 3. SOPORTE PARA GAMEPAD (Xbox / PlayStation) ---
let gamepadEnUso = false;
window.addEventListener("gamepadconnected", (e) => {
    console.log("🎮 Gamepad conectado:", e.gamepad.id);
    document.getElementById('ws-badge').innerText = "🎮 Mando Listo";
    document.getElementById('ws-badge').classList.replace('bg-danger', 'bg-info');
    gamepadLoop();
});

function gamepadLoop() {
    const gamepads = navigator.getGamepads();
    if (gamepads[0]) {
        const gp = gamepads[0];
        // D-PAD: Arriba(12), Abajo(13), Izquierda(14), Derecha(15)
        if (gp.buttons[12].pressed && !gamepadEnUso) { mover(1); gamepadEnUso = true; }
        else if (gp.buttons[13].pressed && !gamepadEnUso) { mover(2); gamepadEnUso = true; }
        else if (gp.buttons[14].pressed && !gamepadEnUso) { mover(9); gamepadEnUso = true; }
        else if (gp.buttons[15].pressed && !gamepadEnUso) { mover(8); gamepadEnUso = true; }
        else if (!gp.buttons[12].pressed && !gp.buttons[13].pressed && !gp.buttons[14].pressed && !gp.buttons[15].pressed && gamepadEnUso) {
            mover(3); // STOP al soltar
            gamepadEnUso = false;
        }
    }
    requestAnimationFrame(gamepadLoop);
}


// --- 4. GRÁFICA EN TIEMPO REAL (Chart.js) ---
let chartTelemetria;
const maxPuntosGrafica = 15;

function inicializarGrafica() {
    const ctx = document.getElementById('graficaTelemetria').getContext('2d');
    chartTelemetria = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Velocidad (%)',
                data: [],
                borderColor: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.2)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#fff' } },
                x: { grid: { display: false }, ticks: { color: '#fff' } }
            },
            plugins: { legend: { labels: { color: '#fff' } } }
        }
    });
}
// Inicializar si estamos en la vista
document.addEventListener("DOMContentLoaded", inicializarGrafica);

// Función para llamar desde tu WebSocket cuando cambie la velocidad o se mueva
function actualizarGraficaEnVivo(velocidadAct) {
    if(!chartTelemetria) return;
    const hora = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
    
    chartTelemetria.data.labels.push(hora);
    chartTelemetria.data.datasets[0].data.push(velocidadAct);
    
    if (chartTelemetria.data.labels.length > maxPuntosGrafica) {
        chartTelemetria.data.labels.shift();
        chartTelemetria.data.datasets[0].data.shift();
    }
    chartTelemetria.update();
}

// Interceptamos tu función cambiarVelocidad actual para alimentar la gráfica
const velocidadOriginal = window.cambiarVelocidad || function(){};
window.cambiarVelocidad = function(val) {
    velocidadOriginal(val);
    actualizarGraficaEnVivo(val);
};


// --- 5. EXPORTAR BITÁCORA A CSV ---
function descargarCSV() {
    const tabla = document.getElementById("tabla-historial");
    let csv = "Numero,Hora,Accion,Estado\n";
    
    for (let i = 0; i < tabla.rows.length; i++) {
        let fila = tabla.rows[i];
        if(fila.cells.length > 1) { // Ignorar la fila de "Esperando datos..."
            let cols = fila.querySelectorAll("td, th");
            let rowData = [];
            cols.forEach(col => rowData.push('"' + col.innerText.trim() + '"'));
            csv += rowData.join(",") + "\n";
        }
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'telemetria_iot_aws.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
// --- 6. VINCULAR MOVIMIENTOS A LA GRÁFICA ---
// Interceptamos tu función mover() para que cada que des una orden, se grafique
const moverOriginal = window.mover || function(){};
window.mover = function(id) {
    // 1. Ejecuta tu código original para mover el carrito
    moverOriginal(id); 
    
    // 2. Lee a qué velocidad está el carrito actualmente
    const velocidadActual = document.getElementById('rangoVelocidad').value;
    
    // 3. Dibuja el punto en la gráfica
    if(typeof actualizarGraficaEnVivo === 'function') {
        actualizarGraficaEnVivo(velocidadActual);
    }
};