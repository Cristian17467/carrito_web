# 🚗 Panel de Control IoT AWS - Vehículo Autónomo & Telemetría

![Versión](https://img.shields.io/badge/Versi%C3%B3n-2.0%20Premium-blue)
![Estado](https://img.shields.io/badge/Estado-Activo-success)
![Hardware](https://img.shields.io/badge/Hardware-ESP8266%20NodeMCU-orange)
![Frontend](https://img.shields.io/badge/Frontend-Glassmorphism%20UI-purple)

Una interfaz web moderna y ciberpunk para el control manual y monitoreo en tiempo real de un vehículo robótico basado en **NodeMCU (ESP8266)** mediante **WebSockets**. Cuenta con un sistema de telemetría avanzada, gráficos en vivo, soporte para mandos de consola y evasión automática de obstáculos.

---

## ✨ Características Principales

### 🎮 Control y Navegación
* **Control Multi-plataforma:** Maneja el vehículo usando el D-Pad táctil en pantalla, el teclado de tu computadora (WASD / Flechas) o un **Gamepad Bluetooth (Xbox/PlayStation)**.
* **Ajuste de Potencia:** Control de velocidad en tiempo real mediante un slider (señal PWM hacia los motores).
* **Control de Ejes Independientes:** Capacidad para girar sobre su propio eje (rotación tipo tanque).
* **Modo DEMO (Macro):** Graba una secuencia de movimientos, reprodúcela automáticamente y ponla en bucle (Loop).

### 📊 Telemetría y Monitoreo (Dashboard Premium)
* **Interfaz Glassmorphism:** Diseño moderno con efectos de vidrio esmerilado, luces de neón y scrollbars personalizados.
* **Gráficas en Vivo:** Integración con `Chart.js` para visualizar la curva de aceleración y comandos a lo largo del tiempo.
* **Bitácora de Eventos:** Tabla de historial con los últimos 5 movimientos y detecciones del radar frontal.
* **Exportación de Datos:** Botón para descargar toda la telemetría almacenada en un archivo `.CSV` para su análisis.
* **Feedback Auditivo:** Sintetizador de audio integrado en el navegador para emitir clics mecánicos y alarmas cuando se detecta un obstáculo.

### 🤖 Inteligencia Integrada (Hardware)
* **Radar Ultrasónico (HC-SR04):** Monitoreo constante de la distancia frontal.
* **Evasión de Obstáculos:** Si el vehículo detecta un obstáculo a menos de 20 cm mientras avanza, aborta el comando de la web de inmediato, frena y ejecuta una rutina automática de evasión para buscar una ruta despejada.

---

## 🛠️ Tecnologías Utilizadas

### Software / Web
* **HTML5 / CSS3:** Maquetación e interfaz con tema oscuro / Glassmorphism.
* **Bootstrap 5:** Sistema de grillas y componentes (Badges, Cards, Botones).
* **JavaScript (Vanilla):** Lógica del cliente, conexión WebSocket, API de Gamepad, API de Audio.
* **Chart.js:** Renderizado del gráfico de telemetría en tiempo real.

### Hardware / Firmware
* **Microcontrolador:** NodeMCU 0.9 (ESP-12 Module / ESP8266).
* **Driver de Motores:** Módulo L9110S.
* **Sensores:** Sensor Ultrasónico HC-SR04.
* **Lenguaje:** C++ (Arduino IDE).
* **Librerías principales:** `ESP8266WiFi.h`, `WebSocketsServer.h`, `ArduinoJson.h`.

---

## 📂 Estructura del Proyecto

```text
📁 Proyecto_IoT_Vehiculo/
│
├── 📁 Codigo_Arduino/
│   └── 📄 Test_L9110S_Motor_Driver_Module.ino   # Firmware para el ESP8266
│
├── 📁 assets/
│   ├── 📁 css/
│   │   └── 📄 styles.css                        # Estilos Glassmorphism y animaciones
│   ├── 📁 img/
│   │   └── 📄 favicon.png                       # Ícono de la pestaña
│   └── 📁 js/
│       └── 📄 main.js                           # Lógica de WebSockets, Gamepad, Gráficas y Control
│
└── 📄 index.html                                # Dashboard UI Principal

```
---

# ⌨️ Controles Soportados

- Acción,Teclado (PC),Mando (Gamepad),Interfaz Web
- Avanzar,W o Flecha Arriba,D-Pad Arriba,Botón ▲
- Retroceder,S o Flecha Abajo,D-Pad Abajo,Botón ▼
- Izquierda,A o Flecha Izq,D-Pad Izquierda,Botón ◀
- Derecha,D o Flecha Der,D-Pad Derecha,Botón ▶
- Giro Eje Izq,Q,-,Botón Giro Eje Izq
- Giro Eje Der,E,-,Botón Giro Eje Der
- STOP (Freno),Soltar teclas,Soltar D-Pad,Botón STOP

---

# ⚙️ Instalación y Configuración

- Firmware (Arduino):

- Abre Test_L9110S_Motor_Driver_Module.ino en Arduino IDE.
- Modifica las credenciales de tu red en las variables ssid y password.
- Sube el código a tu placa NodeMCU ESP8266.
- Abre el Monitor Serie (a 115200 baudios) para obtener la IP asignada a tu placa.
- Frontend (Web):
- Abre el archivo main.js.
- Busca la línea donde se inicializa el WebSocket: const socket = new WebSocket('ws://TÚ_IP_AQUÍ:81/');
- Reemplaza la IP por la que obtuviste en el paso anterior.
- Ejecuta el index.html en tu navegador preferido (puedes usar la extensión Live Server de VS Code).

---

# 👨‍💻 Desarrollador

- [Cristian Oliver Cortez / COC]

- GitHub: @TuUsuario

- LinkedIn: Tu Perfil

- Proyecto desarrollado como parte de la integración de sistemas embebidos, Internet de las Cosas (IoT) y diseño de interfaces web modernas.