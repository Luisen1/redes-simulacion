# Plataforma Interactiva y Simulador de Dispositivos de Interconexión
## Concentradores (Hubs), Repetidores y Pasarelas (Gateways)

Simulador educativo de hubs, repetidores y gateways para la asignatura Redes de Datos. La aplicación permite explorar los conceptos mediante animaciones, métricas calculadas y escenarios de comunicación paso a paso.

**Universidad Pedagógica y Tecnológica de Colombia (UPTC)**  
**Facultad de Ingeniería · Escuela de Ingeniería de Sistemas y Computación**  
**Asignatura: Redes de Datos · Tunja, 2026**  
**Autores:** Luis Enrique Hernández Valbuena, David Santiago Naranjo Corredor, Alejandro Forero Noguera.

---

## Inicio rápido

El proyecto es una aplicación web estática. No requiere instalación de dependencias ni proceso de compilación.

### Opción 1: abrir el archivo

Haz doble clic sobre `abrir_directo.bat` o abre `index.html` directamente en Chrome, Edge o Firefox.

### Opción 2: servidor local (recomendada)

Requiere Python 3:

```powershell
python -m http.server 8000
```

Después, abre <http://localhost:8000>. En Windows también puedes ejecutar `iniciar_servidor.bat`, que inicia el servidor y abre el navegador automáticamente.

Servir el proyecto por HTTP evita restricciones del navegador relacionadas con `file://` y ofrece el entorno más parecido a un despliegue real.

---

## Qué incluye

- **1. Fundamentos & Teoría Completa:**
  - Síntesis exhaustiva de los 12 capítulos del informe académico.
  - Diagrama interactivo del Modelo OSI (Capas 1 a 7) ubicando cada dispositivo.
  - Tabla 1 comparativa técnica estructurada con criterios funcionales.
  - Caso de Estudio Real SUPTEL (Ecuador): Integración CTI y ACD mediante Gateway H.323.
  - Parámetros de Consultoría (Capítulo 7): Capacidad, Cobertura y Procesamiento.

- **2. Simulador de Hub & Colisiones (CSMA/CD):**
  - Animación en tiempo real de topología en estrella física / bus lógico compartido.
  - Transmisión unicast y demostración del fenómeno de *flooding* indiscriminado a todos los puertos.
  - Generador de colisiones simultáneas en medio compartido half-duplex.
  - Protocolo CSMA/CD: emisión de señal JAM (32 bits), temporizador de backoff exponencial y retransmisión.
  - Modo Promiscuo (Sniffer) demostrando la vulnerabilidad de seguridad del hub.
  - Modo comparativo Switch L2 (conmutación por dirección MAC y microsegmentación sin colisiones).

- **3.  Simulador de Repetidor & Osciloscopio Digital (Proceso 3R):**
  - Osciloscopio digital interactivo en Canvas con 3 canales de visualización en tiempo real.
  - Selector de medio físico: Cobre UTP Cat6, Coaxial 10BASE2, Fibra Óptica Monomodo y Enlace Wi-Fi.
  - Sliders interactivos de distancia y ruido electromagnético (EMI/RFI).
  - Demostración de las 3 etapas internas del repetidor: Reamplificación, Filtrado y Reclocking (PLL).
  - Cálculo en vivo de Atenuación (dB), SNR, Bit Error Rate (BER), Jitter y Throughput efectivo.
  - Modo Extensor Wi-Fi: Demostración visual de la penalización del 50% por half-duplex en canal compartido.

- **4. Simulador de Gateway & Dinámica Real de Redes:**
  - **Topologías con dispositivos reales:** Portátil, Teléfono inteligente, Access Point, Switch, Router / Default Gateway, Pasarela de Protocolos (Industrial e IoT), Servidor Web, Servidor SCADA, PLC y Sensores IoT.
  - **Diferenciación conceptual clave:** Default Gateway (salto L3, enrutamiento y NAT/PAT) frente a Protocol Gateway (traducción semántica y de formatos en capas 3 a 7).
  - **5 Escenarios de red completos:**
    1. *Portátil Wi-Fi a Servidor Web (18 pasos reales):* Asociación 802.11, DHCP DORA, ARP Request/Reply, DNS UDP 53, TCP 3-Way Handshake, traducción NAT (PAT) en Gateway, petición HTTPS GET y entrega de página HTML.
    2. *Teléfono Móvil en Red Residencial:* Conexión Wi-Fi a router multifunción hogareño (AP + Switch + Router + NAT) y acceso a Internet.
    3. *Portátil a PLC vía Gateway Industrial:* Demostración simultánea del Default Gateway (Router L3) y del Protocol Gateway (traductor Modbus TCP a Modbus RTU serial).
    4. *Entorno Industrial SCADA (16 pasos reales):* Flujo bidireccional exhaustivo entre PLC en bus RS-485 y servidor SCADA corporativo.
    5. *Internet de las Cosas (IoT) a la Nube:* Sensor ESP32 emitiendo MQTT, recepción en Gateway IoT Edge, encapsulado seguro TLS 1.3 y publicación en broker cloud (AWS IoT).
  - **Lienzo de Topología Dinámica (Canvas):** Animación fluida de tramas con diferenciación de medios (Ethernet cyan, Wi-Fi RF amarillo, Bus RS-485 naranja, WAN/Internet púrpura).
  - **Inspector de Dispositivos:** Ventana modal que expone en vivo configuración IP, máscara, MAC, tablas ARP, tablas de enrutamiento, tablas NAT y sockets activos (`netstat`).
  - **Analizador de Tramas y Paquetes (L2-L7):** Desglose detallado de cabeceras de enlace (MAC, EtherType), red (IP, TTL), transporte (puertos, banderas TCP) y payload de aplicación, acompañado de explicación en lenguaje cotidiano.
  - **Motor de Inyección y Diagnóstico de Fallas:** Simulación de 8 fallas reales (Gateway caído, cable desconectado, Wi-Fi apagado, DNS timeout, DHCP/APIPA 169.254.x.x, error de gateway, puerto cerrado con RST, ruta inexistente) con diagnóstico paso a paso (qué, por qué, cómo se detecta y cómo se soluciona).
  - **Matriz Interactiva de 5 Roles:** Comparativa profunda entre Switch (L2), Router (L3), Default Gateway, Protocol Gateway y Access Point.

- **5. Glosario Técnico Interactivo:**
  - 24 términos técnicos oficiales con buscador en vivo y filtros por categoría.

## Arquitectura del proyecto

```text
.
├── index.html              # Interfaz, contenido académico y controles
├── css/
│   └── styles.css          # Estilos propios y ajustes visuales
├── js/
│   ├── data.js             # Datos académicos, glosario y catálogos
│   ├── main.js             # Pestañas, modales y componentes generales
│   ├── sim-hub.js          # Hub, flooding, colisiones y CSMA/CD
│   ├── sim-repeater.js     # Señal, atenuación, ruido y métricas 3R
│   ├── sim-gateway.js      # Traducción de protocolos y máquina de estados
│   └── advisor.js          # Asesor técnico y evaluación de escenarios
├── assets/                 # Recursos visuales del proyecto
├── abrir_directo.bat       # Apertura directa en Windows
└── iniciar_servidor.bat    # Servidor local de desarrollo
```

La aplicación se organiza en módulos JavaScript independientes que se cargan desde `index.html`. Cada simulador administra sus controles, estado y renderizado; `main.js` coordina la navegación general y `data.js` centraliza la información reutilizable.

## Flujo de uso

1. Abre la aplicación y selecciona una pestaña: fundamentos, hub, repetidor, gateway, asesor o glosario.
2. Configura los parámetros disponibles en el panel seleccionado.
3. Ejecuta la simulación o avanza por los pasos del escenario.
4. Observa la animación, las métricas y las explicaciones técnicas.
5. Usa el glosario y la tabla comparativa para relacionar los resultados con los conceptos de redes.

## Desarrollo y validación

No hay dependencias de npm. Para revisar cambios de JavaScript, puedes ejecutar:

```powershell
Get-ChildItem js -Filter *.js | ForEach-Object { node --check $_.FullName }
```

Para validar manualmente la interfaz, inicia el servidor local y comprueba las pestañas, los botones de simulación, los sliders y el diseño responsive en el navegador.

### Flujo de cambios

Para mantener el historial claro, agrupa cada cambio por propósito y usa mensajes de commit imperativos, por ejemplo:

```powershell
git status
git add README.md
git commit -m "docs: documentar el flujo de desarrollo"
```

Antes de abrir una contribución, ejecuta la comprobación de sintaxis y revisa el estado del repositorio:

```powershell
Get-ChildItem js -Filter *.js | ForEach-Object { node --check $_.FullName }
git diff --check
```

## Consideraciones

- Tailwind CSS se carga desde su CDN, por lo que la interfaz necesita conexión a internet para conservar el estilo completo.
- Los precios y fichas técnicas del asesor son datos de referencia con finalidad académica; deben verificarse con el fabricante antes de una compra o diseño real.
- El modelo de los simuladores es didáctico y no sustituye mediciones de campo ni herramientas profesionales de diagnóstico.
