/**
 * Base de datos técnica para el Simulador de Dispositivos de Interconexión
 * UPTC - Redes de Datos 2026
 * Autores: Luis Enrique Hernández Valbuena, David Santiago Naranjo Corredor, Alejandro Forero Noguera
 */

const ACADEMIC_INFO = {
  institution: "Universidad Pedagógica y Tecnológica de Colombia (UPTC)",
  faculty: "Facultad de Ingeniería",
  school: "Escuela de Ingeniería de Sistemas y Computación",
  course: "Redes de Datos",
  city: "Tunja",
  year: 2026,
  authors: [
    "Luis Enrique Hernández Valbuena",
    "David Santiago Naranjo Corredor",
    "Alejandro Forero Noguera"
  ],
  title: "Concentradores o Hub, Repetidores o Pasarelas y Gateway"
};

const GLOSSARY_TERMS = [
  {
    term: "Ancho de banda",
    category: "Física y Transmisión",
    definition: "Capacidad máxima de un canal de comunicación para transportar información en un tiempo determinado, generalmente expresada en bits por segundo (bps o sus múltiplos Mbps, Gbps)."
  },
  {
    term: "Backbone (red troncal)",
    category: "Arquitectura",
    definition: "Segmento de red de alta capacidad que interconecta redes o segmentos de menor jerarquía dentro de una infraestructura mayor (por ejemplo, entre edificios de un campus)."
  },
  {
    term: "Buffer",
    category: "Hardware y Conmutación",
    definition: "Espacio de memoria temporal que utiliza un dispositivo de red para almacenar tramas o paquetes mientras se procesan o se libera el medio de transmisión."
  },
  {
    term: "Codificación Manchester",
    category: "Física y Transmisión",
    definition: "Técnica de codificación de línea utilizada en Ethernet clásica (10BASE-T) en la que cada bit se representa mediante una transición de voltaje a mitad del intervalo de reloj (alto a bajo para '0', bajo a alto para '1'), garantizando sincronización sin línea de reloj separada."
  },
  {
    term: "CSMA/CD",
    category: "Control de Acceso",
    definition: "Carrier Sense Multiple Access with Collision Detection: mecanismo de control de acceso al medio empleado en Ethernet compartida (hubs) para detectar y resolver colisiones mediante señales de interferencia JAM (32 bits) y algoritmo de backoff exponencial truncado."
  },
  {
    term: "Dominio de colisión",
    category: "Topología y Segmentación",
    definition: "Segmento de red en el que dos o más dispositivos pueden transmitir simultáneamente y provocar una colisión de señales eléctricas u ópticas. Los hubs forman un solo dominio de colisión entre todos sus puertos."
  },
  {
    term: "Dominio de difusión (broadcast)",
    category: "Topología y Segmentación",
    definition: "Conjunto de dispositivos de red que reciben las tramas de difusión enviadas por cualquier miembro del mismo segmento lógico. Los hubs, repetidores y switches estándar no limitan el dominio de difusión general."
  },
  {
    term: "Dúplex (half / full)",
    category: "Física y Transmisión",
    definition: "Modo de transmisión de un enlace. En half-duplex los equipos transmiten y reciben de forma alternada (hubs y Wi-Fi estándar); en full-duplex lo hacen de forma simultánea sin colisiones (switches modernos con pares trenzados separados TX/RX)."
  },
  {
    term: "Forwarding rate (tasa de reenvío)",
    category: "Rendimiento",
    definition: "Cantidad de tramas o paquetes por segundo (pps / Mpps) que un dispositivo de interconexión es capaz de procesar y reenviar sin descartarlos ante tráfico continuo."
  },
  {
    term: "Gateway predeterminado (Default Gateway)",
    category: "Capa de Red",
    definition: "Dirección IP del dispositivo (generalmente un router o pasarela) hacia el cual un host envía todo el tráfico destinado a redes distintas de la propia cuando no existe una ruta más específica configurada."
  },
  {
    term: "H.323",
    category: "Protocolos y VoIP",
    definition: "Estándar marco de la UIT-T para señalización y control de sesiones multimedia (voz y video) sobre redes de conmutación de paquetes, ampliamente usado en telefonía IP y pasarelas de integración CTI/PSTN."
  },
  {
    term: "IoT (Internet de las Cosas)",
    category: "Nuevas Tecnologías",
    definition: "Conjunto de dispositivos físicos (sensores, actuadores, equipos embebidos) capaces de conectarse e intercambiar datos a través de una red, frecuentemente requiriendo gateways para traducir protocolos como Zigbee/LoRa hacia IP."
  },
  {
    term: "Latencia",
    category: "Rendimiento",
    definition: "Tiempo que tarda un bit, trama o paquete en viajar desde el origen hasta el destino a través de una red, compuesto por retardo de propagación, transmisión, enrutamiento y procesamiento en buffers."
  },
  {
    term: "Modbus",
    category: "Protocolos Industriales",
    definition: "Protocolo de comunicación industrial abierto, de arquitectura maestro-esclavo (o cliente-servidor), muy usado en automatización, que permite el intercambio de registros entre PLCs, sensores y SCADA (variantes RTU, ASCII y TCP)."
  },
  {
    term: "NAT (Network Address Translation)",
    category: "Capa de Red",
    definition: "Técnica que permite traducir direcciones IP privadas a públicas (o viceversa) para que múltiples equipos de una red local compartan una misma dirección IP pública hacia Internet."
  },
  {
    term: "PoE (Power over Ethernet)",
    category: "Hardware y Alimentación",
    definition: "Tecnología (estándares IEEE 802.3af/at/bt) que permite transmitir energía eléctrica continua junto con los datos a través del cable Ethernet de par trenzado para alimentar APs, cámaras y teléfonos IP sin cables de corriente adicionales."
  },
  {
    term: "Protocolo",
    category: "Fundamentos",
    definition: "Conjunto formal de reglas que define la sintaxis (formato de datos), la semántica (significado de los campos de control) y la sincronización (temporización) de la comunicación entre dos o más entidades de red."
  },
  {
    term: "PSTN (Red Telefónica Pública Conmutada)",
    category: "Telefonía",
    definition: "Red de telefonía tradicional basada en conmutación de circuitos analógicos y digitales con canales dedicados de 64 kbps (DS0), utilizada para llamadas de voz convencionales."
  },
  {
    term: "Router",
    category: "Dispositivos",
    definition: "Dispositivo de interconexión que opera principalmente en la capa de red (Capa 3 OSI) y determina la mejor ruta para reenviar paquetes entre redes lógicas distintas mediante direcciones IP."
  },
  {
    term: "Switch (conmutador)",
    category: "Dispositivos",
    definition: "Dispositivo de interconexión de capa de enlace de datos (Capa 2 OSI) que aprende activamente las direcciones MAC de los equipos conectados y reenvía cada trama únicamente hacia el puerto del destinatario."
  },
  {
    term: "Throughput",
    category: "Rendimiento",
    definition: "Cantidad real y efectiva de datos útiles (payload) transferidos con éxito a través de una red o dispositivo en un intervalo de tiempo determinado, descontando sobrecargas de encabezados y colisiones."
  },
  {
    term: "Topología de red",
    category: "Topología y Segmentación",
    definition: "Forma en que se disponen física o lógicamente los dispositivos y enlaces de una red (por ejemplo, estrella física con bus lógico en hubs, estrella pura en switches conmutados, bus, anillo o malla)."
  },
  {
    term: "VLAN (Virtual LAN)",
    category: "Topología y Segmentación",
    definition: "Segmento lógico dentro de una red conmutada que agrupa dispositivos en un mismo dominio de difusión independientemente de su ubicación física, soportado por switches pero no por hubs ni repetidores."
  },
  {
    term: "VoIP (Voice over IP)",
    category: "Protocolos y VoIP",
    definition: "Tecnología que permite digitalizar, comprimir y cursar comunicaciones de voz en paquetes de datos sobre redes IP empleando protocolos como SIP, H.323 y RTP."
  }
];

const COMPARISON_DATA = [
  {
    criterio: "Función principal",
    hub: "Centralizar cableado físico y retransmitir indiscriminadamente la señal eléctrica a todos los puertos.",
    repetidor: "Recibir una señal degradada, amplificarla, filtrarla y recronometrarla para extender el alcance físico.",
    gateway: "Traducir protocolos, formatos y arquitecturas disímiles para permitir la interoperabilidad entre redes heterogéneas."
  },
  {
    criterio: "Capa del Modelo OSI",
    hub: "Capa 1 (Física)",
    repetidor: "Capa 1 (Física)",
    gateway: "Opera desde Capa 3 hasta Capa 7 (incluso en las 5 capas de TCP/IP según la aplicación)."
  },
  {
    criterio: "Tipo de procesamiento",
    hub: "Ninguno a nivel de datos; solo repetición y regeneración eléctrica de bits.",
    repetidor: "Ninguno sobre encabezados o tramas; realiza amplificación analógica, filtrado y reclocking de bits.",
    gateway: "Muy complejo: desensamblado de tramas y paquetes, conversión semántica, traducción de sintaxis, recálculo de sumas de verificación (checksum/CRC) y reempaquetado."
  },
  {
    criterio: "¿Amplía el alcance de la red?",
    hub: "Sí, de forma limitada al permitir conectar varios cables en topología en estrella física.",
    repetidor: "Sí, es su objetivo primordial: supera la atenuación del medio uniendo tramos de cable, fibra o radio.",
    gateway: "No es su propósito directo de capa física, aunque comunica redes separadas geográfica y lógicamente."
  },
  {
    criterio: "¿Conecta redes diferentes?",
    hub: "No; todos los equipos conectados pertenecen obligatoriamente al mismo segmento físico y lógico.",
    repetidor: "No; une dos tramos del mismo medio o extiende el mismo segmento lógico.",
    gateway: "Sí; es su razón de ser esencial (ej. PSTN con VoIP, Modbus RTU con Modbus TCP, LAN con Internet)."
  },
  {
    criterio: "Manejo de protocolos",
    hub: "No distingue ni interpreta protocolos; transporta bits ciegamente.",
    repetidor: "No distingue ni interpreta protocolos; es totalmente transparente a las capas superiores.",
    gateway: "Interpreta y traduce activamente entre protocolos disímiles en múltiples capas de la pila."
  },
  {
    criterio: "Dominio de Colisión",
    hub: "Un único dominio de colisión compartido por todos los puertos (genera interferencias).",
    repetidor: "Extiende el mismo dominio de colisión a ambos lados del dispositivo.",
    gateway: "Separa completamente los dominios de colisión y de difusión entre las redes interconectadas."
  },
  {
    criterio: "Usos actuales",
    hub: "Prácticamente obsoleto en redes de oficina/corporativas; uso residual en laboratorios educativos y nichos marinos/industriales específicos.",
    repetidor: "Muy vigente en troncales de fibra óptica submarina/terrestre, extensores Wi-Fi domésticos y enlaces PoE de campus.",
    gateway: "Crucial y en constante auge: routers residenciales con NAT, pasarelas IoT, gateways industriales SCADA, telefonía VoIP y SASE/Cloud."
  },
  {
    criterio: "Principales ventajas",
    hub: "Bajo costo histórico, simplicidad plug-and-play absoluta, cero configuración lógica requerida.",
    repetidor: "Económico, permite superar límites de distancia sin cambiar el cableado ni configurar IPs o tablas de enrutamiento.",
    gateway: "Permite la interoperabilidad entre arquitecturas incompatibles sin tener que reemplazar equipos legados existentes."
  },
  {
    criterio: "Principales limitaciones",
    hub: "Colisiones masivas con alto tráfico, ancho de banda compartido dividido entre todos los hosts, grave falla de seguridad por difusión general.",
    repetidor: "No filtra tráfico ni errores; puede propagar ruido; en Wi-Fi reduce a la mitad el rendimiento (half-duplex).",
    gateway: "Alto costo de hardware/software, latencia introducida por procesamiento profundo, alta complejidad de configuración y punto único de fallo potencial si no hay redundancia."
  }
];

const CATALOG_HUBS = [
  {
    fabricante: "Furuno",
    modelo: "HUB100",
    tipo: "Hub / Interswitch marino",
    puertos: "8 Ethernet RJ-45",
    velocidad: "10/100 Mbps; 20/200 Mbps full-duplex",
    medio: "Ethernet cobre 100BASE-TX / 10BASE-T",
    dimensiones: "270 x 47 x 162 mm",
    peso: "1.5 kg",
    precio: "USD 810.00",
    justificacion: "Ideal para puente de mando de embarcaciones pesqueras y comerciales pequeñas. La prioridad es la tolerancia extrema a vibraciones y ambientes salinos sobre la velocidad pura. La telemetría NMEA genera poco tráfico, por lo que el medio compartido no crea cuellos de botella."
  },
  {
    fabricante: "Furuno",
    modelo: "HUB102",
    tipo: "Hub Ethernet marino de alta resistencia",
    puertos: "5 Ethernet RJ-45",
    velocidad: "Gigabit; 10/100 Mbps half/full-duplex",
    medio: "Ethernet cobre con conectores resistentes al agua",
    dimensiones: "Compacto para mamparo marino",
    peso: "3 lb (~1.36 kg)",
    precio: "USD 395.00",
    justificacion: "Diseñado para entornos expuestos a intemperie marítima con conectores estancos. Ofrece velocidad Gigabit física para instrumentación marina moderna que intercambia mapas batimétricos y ecosondas sin necesidad de gestión lógica avanzada."
  },
  {
    fabricante: "Furuno",
    modelo: "HUB3000",
    tipo: "Hub / Interswitch inteligente marino",
    puertos: "Puertos modulares dedicados",
    velocidad: "Ethernet Gigabit (familia HUB3000)",
    medio: "Ethernet cobre blindado",
    dimensiones: "Montaje en rack / consola",
    peso: "1.5 kg",
    precio: "USD 2,850.00",
    justificacion: "Equipo de grado comercial certificado para sistemas integrados de navegación (INS/ECDIS). Añade funciones de monitoreo y diagnóstico de enlace manteniendo la robustez naval requerida por normativas IMO."
  }
];

const CATALOG_GATEWAYS = [
  {
    fabricante: "Advantech",
    modelo: "ADAM-4572",
    tipo: "Gateway Modbus serial a Ethernet",
    puertos: "1 x RJ45 (10/100 Mbps)",
    puertosSeriales: "1 x RS-232/422/485",
    protocolos: "Modbus RTU, Modbus ASCII, Modbus TCP",
    alimentacion: "10 - 30 VDC",
    precio: "EUR 218.76 (sin IVA)",
    justificacion: "Solución económica y compacta para digitalizar una celda de manufactura aislada o un banco de prueba donde un único PLC o analizador de energía serial requiere reportar a un sistema SCADA corporativo mediante Modbus TCP."
  },
  {
    fabricante: "Advantech",
    modelo: "EKI-1221-CE",
    tipo: "Gateway industrial Modbus de 1 puerto con bypass",
    puertos: "2 x RJ45 (10/100 Mbps, función daisy-chain)",
    puertosSeriales: "1 x RS-232/422/485",
    protocolos: "Modbus RTU, Modbus ASCII, Modbus TCP",
    alimentacion: "12 - 48 VDC, entradas redundantes duales",
    precio: "USD 349.00",
    justificacion: "Adecuado para plantas industriales de operación continua 24/7. Cuenta con doble puerto Ethernet para conexión en cascada (daisy-chain) y doble entrada de alimentación eléctrica para tolerancia instantánea a fallas de energía."
  },
  {
    fabricante: "Advantech",
    modelo: "EKI-1224-CE",
    tipo: "Gateway industrial Modbus de alta densidad (4 puertos serie)",
    puertos: "2 x RJ45 (10/100 Mbps)",
    puertosSeriales: "4 x RS-232/422/485 independientes",
    protocolos: "Modbus RTU, Modbus ASCII, Modbus TCP",
    alimentacion: "12 - 48 VDC, entradas redundantes duales",
    precio: "USD 544.60",
    justificacion: "La mejor opción para salas de control o subestaciones con múltiples redes seriales independientes. Permite interconectar hasta 128 dispositivos seriales esclavos hacia la red SCADA Ethernet sin saturar la CPU del PLC y manteniendo baja latencia de sondeo cíclico."
  }
];

const CATALOG_REPEATERS = [
  {
    fabricante: "Ubiquiti",
    modelo: "UACC-LRE",
    tipo: "Repetidor Ethernet de largo alcance / PoE+",
    puertos: "2 x RJ-45 Gigabit (Entrada PoE+ y salida passthrough)",
    velocidad: "10/100/1000 Mbps; hasta 100 Mbps en cadena de 1 km",
    medio: "Cable Ethernet UTP/STP Cat5e/Cat6",
    alcance: "Hasta 1 km por encadenamiento de segmentos (100 m por salto)",
    precio: "USD 29.00",
    justificacion: "Ideal para videovigilancia perimetral en campus universitarios o bodegas logísticas. Permite llevar datos y alimentación PoE a cámaras IP ubicadas mucho más allá del límite estándar de 100 metros de cobre sin necesidad de tender fibra óptica ni instalar tomas eléctricas intermedias."
  },
  {
    fabricante: "SPT",
    modelo: "12-POE101",
    tipo: "Repetidor / Extensor PoE individual",
    puertos: "2 x RJ-45 Gigabit",
    velocidad: "10/100/1000 Mbps",
    medio: "Ethernet Cat6 PoE",
    alcance: "Extiende 100 m adicionales (total 200 m desde la fuente de inyección)",
    precio: "USD 36.73",
    justificacion: "Perfecto para conectar un punto de acceso Wi-Fi o control de acceso ubicado a 160 metros del switch principal. Se alimenta directamente del mismo cable PoE y regenera la señal Gigabit sin alterar el direccionamiento IP ni requerir configuración de software."
  },
  {
    fabricante: "Transition Networks",
    modelo: "S3100-4040-NA",
    tipo: "Repetidor / Transceptor fibra-a-fibra",
    puertos: "2 x ranuras SFP ópticas",
    velocidad: "Hasta 2.5 Gbit/s",
    medio: "Fibra óptica monomodo a multimodo o transceptor óptico",
    alcance: "Decenas de kilómetros (según transceptores SFP instalados)",
    precio: "USD 490.99",
    justificacion: "Esencial para backbones de campus o interconexión de sedes distantes. Proporciona regeneración completa 3R (Reamplification, Reshaping, Reclocking) de pulsos de luz para transferencias masivas de datos, videoconferencia y replicación síncrona de servidores."
  }
];

const SUPTEL_CASE_STUDY = {
  institution: "Superintendencia de Telecomunicaciones del Ecuador (SUPTEL)",
  context: "Organismo técnico estatal ecuatoriano encargado del control de los operadores de telecomunicaciones y el uso eficiente del espectro radioeléctrico.",
  problem: {
    dailyRequests: "398 solicitudes de información y reclamos diarios a nivel nacional.",
    breakdown: "El 56% se gestionaba por teléfono convencional de forma manual y el 27% de forma presencial.",
    issue: "Saturación administrativa, lentitud en la resolución y canales dispersos e inconexos (teléfono, fax, correo y web)."
  },
  solution: {
    system: "Centro de Atención al Cliente (Call Center) automático con CTI (Computer-Telephony Integration).",
    components: [
      "Distribuidor Automático de Llamadas (ACD)",
      "Servidor CTI (Integración Telefonía-Computador)",
      "Servidor IVR (Respuesta de Voz Interactiva)",
      "Gateway H.323 de Voz sobre IP"
    ],
    gatewayRole: "Servir de interfaz bidireccional entre la Red Telefónica Pública Conmutada (PSTN) analógica/digital por circuitos y la red de datos basada en paquetes IP.",
    technicalImpact: "El Gateway H.323 demodula y digitaliza señales analógicas telefónicas a tramas PCM G.711 (64 kbps), traduce la señalización de red de circuitos a protocolos de conmutación de paquetes (H.225 / Q.931 para inicio/fin de llamada y H.245 para negociación de canales), y encapsula la voz en paquetes RTP/UDP/IP dirigidos al ACD y a los agentes con diademas USB en sus PCs corporativos."
  }
};
