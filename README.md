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

- **4. Simulador de Gateway & Pila OSI Multi-Capa:**
  - Desglose visual de las 7 capas OSI en origen y destino con la pasarela en el centro.
  - **Escenario 1 (Industrial):** Sensor/PLC con Modbus RTU serial (RS-485) ↔ Gateway Advantech EKI-1221 ↔ Servidor SCADA Ethernet (Modbus TCP en puerto 502).
  - **Escenario 2 (Telecomunicaciones):** Teléfono analógico PSTN ↔ Gateway H.323 (Caso SUPTEL) ↔ Red IP Call Center CTI/ACD con códec G.711.
  - Máquina de estados paso a paso (Decapsulación de cabeceras, traducción semántica, reempaquetado).
  - Inspector de paquetes estilo analizador de protocolos (Hex Dump y decodificación de campos).

- **5. Asesor de Selección & Catálogos Reales:**
  - Calculadora de ingeniería basada en los capítulos 7 y 8.
  - Formulario de requerimientos con presets rápidos (Barco Pesquero, Planta Industrial, Campus 600m).
  - Generador de Dictamen Técnico de Consultoría profesional con sustentación de Capacidad, Cobertura, Procesamiento y análisis de descarte.
  - Catálogos interactivos con fichas técnicas y precios de referencia:
    - Furuno HUB100, HUB102, HUB3000 (Hubs navales).
    - Advantech ADAM-4572, EKI-1221-CE, EKI-1224-CE (Gateways Modbus seriales).
    - Ubiquiti UACC-LRE, SPT 12-POE101, Transition Networks S3100-4040-NA (Repetidores de campus y fibra).

- **6. Glosario Técnico Interactivo:**
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
