/**
 * Simulador Avanzado de Pasarelas (Gateways) y Dinámica Real de Redes
 * Asignatura: Redes de Datos - Universidad Pedagógica y Tecnológica de Colombia (UPTC)
 * 
 * Modela el comportamiento real de redes IP e industriales:
 * - Distinción fundamental: Default Gateway (Capa 3) vs Protocol Gateway (Capas 3-7)
 * - Flujos reales: Wi-Fi 802.11, DHCP (DORA), ARP, DNS, TCP 3-Way Handshake, Routing, NAT (PAT), Modbus RTU/TCP, IoT
 * - Topología interactiva con inspección de dispositivos, tablas ARP/Routing/NAT y analizador de tramas
 * - Motor de inyección y diagnóstico de fallas reales de red
 */

const GW_SCENARIOS = {
  laptop_wifi: {
    id: "laptop_wifi",
    name: "Portátil -> Wi-Fi -> AP -> Switch -> Router/Gateway (NAT) -> Internet -> Servidor Web",
    shortName: "Portátil Wi-Fi a Servidor Web (Infraestructura Completa)",
    badge: "Red IP Corporativa / Campus",
    desc: "Recorrido real desde la asociación inalámbrica, asignación DHCP y resolución ARP hasta el enrutamiento con NAT y la conexión TCP HTTPS.",
    devices: [
      {
        id: "laptop",
        name: "Portátil Cliente",
        type: "host",
        icon: "laptop",
        x: 80,
        y: 170,
        ip: "192.168.1.50",
        mask: "255.255.255.0",
        gateway: "192.168.1.1",
        dns: "8.8.8.8",
        mac: "00:2A:43:A1:B2:C3",
        medium: "Wi-Fi 802.11ax (Canal 6, 2.4 GHz)",
        status: "Online",
        arpTable: [
          { ip: "192.168.1.1", mac: "00:2A:43:01:02:03", iface: "wlan0", type: "Dinámico" }
        ],
        sockets: [
          { proto: "TCP", local: "192.168.1.50:52341", remote: "142.250.190.46:443", state: "ESTABLISHED" }
        ]
      },
      {
        id: "ap",
        name: "Access Point Wi-Fi",
        type: "ap",
        icon: "ap",
        x: 230,
        y: 170,
        ip: "192.168.1.2",
        mask: "255.255.255.0",
        gateway: "192.168.1.1",
        dns: "8.8.8.8",
        mac: "00:2A:43:E0:11:01",
        medium: "Puente 802.11 <-> Ethernet 802.3",
        status: "Activo (BSSID: UPTC-CAMPUS)",
        arpTable: [
          { ip: "192.168.1.1", mac: "00:2A:43:01:02:03", iface: "eth0", type: "Dinámico" }
        ],
        sockets: []
      },
      {
        id: "switch",
        name: "Switch de Acceso L2",
        type: "switch",
        icon: "switch",
        x: 390,
        y: 170,
        ip: "192.168.1.3 (Gestión)",
        mask: "255.255.255.0",
        gateway: "192.168.1.1",
        dns: "8.8.8.8",
        mac: "00:2A:43:AA:00:01",
        medium: "Cobre Cat6 Gigabit Ethernet",
        status: "VLAN 10 (Tráfico Local)",
        camTable: [
          { port: "Fa0/1", mac: "00:2A:43:E0:11:01", vlan: 10 },
          { port: "Fa0/24", mac: "00:2A:43:01:02:03", vlan: 10 }
        ],
        sockets: []
      },
      {
        id: "gateway",
        name: "Router / Default Gateway",
        type: "gateway",
        icon: "router",
        x: 560,
        y: 170,
        ip: "LAN: 192.168.1.1 / WAN: 200.24.15.2",
        mask: "255.255.255.0 / 255.255.255.252",
        gateway: "200.24.15.1 (ISP Next-Hop)",
        dns: "8.8.8.8",
        mac: "LAN: 00:2A:43:01:02:03 | WAN: 00:2A:43:FF:EE:DD",
        medium: "Enlace WAN Fibra ISP",
        status: "Routing + NAT (PAT) Activo",
        arpTable: [
          { ip: "192.168.1.50", mac: "00:2A:43:A1:B2:C3", iface: "Gig0/0 (LAN)", type: "Dinámico" },
          { ip: "200.24.15.1", mac: "00:0C:29:11:22:33", iface: "Gig0/1 (WAN)", type: "Dinámico" }
        ],
        routingTable: [
          { dest: "192.168.1.0/24", nextHop: "Directamente conectado", iface: "Gig0/0 (LAN)", metric: 0 },
          { dest: "200.24.15.0/30", nextHop: "Directamente conectado", iface: "Gig0/1 (WAN)", metric: 0 },
          { dest: "0.0.0.0/0", nextHop: "200.24.15.1 (Default Gateway ISP)", iface: "Gig0/1 (WAN)", metric: 1 }
        ],
        natTable: [
          { insideIp: "192.168.1.50", insidePort: "52341", outsideIp: "200.24.15.2", outsidePort: "45001", destIp: "142.250.190.46", destPort: "443" }
        ],
        sockets: [
          { proto: "UDP", local: "192.168.1.1:67", remote: "0.0.0.0:*", state: "LISTEN (DHCP Server)" }
        ]
      },
      {
        id: "server",
        name: "Servidor Web HTTPS",
        type: "server",
        icon: "server",
        x: 740,
        y: 170,
        ip: "142.250.190.46",
        mask: "255.255.255.0",
        gateway: "142.250.190.1",
        dns: "8.8.8.8",
        mac: "00:2A:43:99:88:77",
        medium: "Datacenter Core Ethernet",
        status: "NGINX / TLS 1.3 Puerto 443",
        arpTable: [
          { ip: "142.250.190.1", mac: "00:50:56:80:12:00", iface: "eth0", type: "Dinámico" }
        ],
        sockets: [
          { proto: "TCP", local: "142.250.190.46:443", remote: "200.24.15.2:45001", state: "ESTABLISHED" }
        ]
      }
    ],
    links: [
      { from: "laptop", to: "ap", type: "wifi", label: "Wi-Fi 802.11ax" },
      { from: "ap", to: "switch", type: "ethernet", label: "Cat6 Gigabit" },
      { from: "switch", to: "gateway", type: "ethernet", label: "Troncal L2" },
      { from: "gateway", to: "server", type: "wan", label: "Internet WAN (Fibra)" }
    ],
    steps: [
      {
        id: 1,
        title: "Paso 1: Búsqueda y Asociación Wi-Fi 802.11",
        summary: "El portátil escanea canales y se asocia al Access Point",
        explanation: "La tarjeta inalámbrica del portátil envía Probe Requests y escucha Beacons del AP (SSID: UPTC-CAMPUS). Al autenticarse mediante WPA3, se establece la asociación en Capa 1/2. El dispositivo aún no tiene dirección IP para comunicarse en Capa 3.",
        fromDevice: "laptop",
        toDevice: "ap",
        packet: {
          type: "802.11 Association Request",
          layer2: { type: "IEEE 802.11 Wireless Frame", srcMac: "00:2A:43:A1:B2:C3", dstMac: "00:2A:43:E0:11:01", etherType: "0x888E (802.1X/EAPOL)" },
          layer3: { proto: "None (Sin IP aún)", srcIp: "0.0.0.0", dstIp: "0.0.0.0", ttl: "-" },
          layer4: { proto: "None", srcPort: "-", dstPort: "-", flags: "AUTH_REQ" },
          payload: "SSID: UPTC-CAMPUS, Auth: WPA3-Personal, Supported Rates: 54 Mbps / HE-MCS 11",
          humanNote: "El portátil establece el enlace de radiofrecuencia con el Access Point. No hay tráfico IP todavía."
        }
      },
      {
        id: 2,
        title: "Paso 2: DHCP Discover (Solicitud de Configuración IP)",
        summary: "El cliente solicita una IP por difusión general (Broadcast)",
        explanation: "El portátil no conoce la topología ni tiene dirección IP. Emite un paquete DHCP Discover por difusión a la dirección 255.255.255.255 (puerto UDP 67). El AP puentea la trama hacia el Switch, y este la entrega al Router/Gateway.",
        fromDevice: "laptop",
        toDevice: "gateway",
        packet: {
          type: "DHCP Discover",
          layer2: { type: "Ethernet II (Broadcast)", srcMac: "00:2A:43:A1:B2:C3", dstMac: "FF:FF:FF:FF:FF:FF", etherType: "0x0800 (IPv4)" },
          layer3: { proto: "UDP (17)", srcIp: "0.0.0.0", dstIp: "255.255.255.255", ttl: 128 },
          layer4: { proto: "UDP", srcPort: "68 (BOOTPC)", dstPort: "67 (BOOTPS)", flags: "BROADCAST" },
          payload: "DHCP Message Type: Discover, Client MAC: 00:2A:43:A1:B2:C3, Requested Options: Subnet Mask, Router, DNS",
          humanNote: "El host grita a toda la red: ¡Hola! Soy una máquina nueva, ¿alguien puede darme una dirección IP y decirme quién es el Gateway?"
        }
      },
      {
        id: 3,
        title: "Paso 3: DHCP Offer (Oferta del Router)",
        summary: "El servidor DHCP del Router propone IP, Máscara, Gateway y DNS",
        explanation: "El servicio DHCP en el Router consulta su grupo de direcciones disponibles y envía un DHCP Offer reservando la IP 192.168.1.50 para la MAC del portátil, indicando además su propia IP (192.168.1.1) como Default Gateway.",
        fromDevice: "gateway",
        toDevice: "laptop",
        packet: {
          type: "DHCP Offer",
          layer2: { type: "Ethernet II", srcMac: "00:2A:43:01:02:03", dstMac: "00:2A:43:A1:B2:C3", etherType: "0x0800 (IPv4)" },
          layer3: { proto: "UDP (17)", srcIp: "192.168.1.1", dstIp: "192.168.1.50", ttl: 64 },
          layer4: { proto: "UDP", srcPort: "67 (BOOTPS)", dstPort: "68 (BOOTPC)", flags: "UNICAST" },
          payload: "Offered IP: 192.168.1.50, Subnet: 255.255.255.0, Gateway: 192.168.1.1, DNS: 8.8.8.8, Lease: 86400s",
          humanNote: "El router le dice al portátil: Te ofrezco la IP 192.168.1.50. Tu puerta de enlace para salir a Internet soy yo (192.168.1.1)."
        }
      },
      {
        id: 4,
        title: "Paso 4: DHCP Request & DHCP ACK",
        summary: "El cliente acepta la oferta y el Router confirma la concesión",
        explanation: "El portátil envía DHCP Request aceptando la configuración y el Router responde con DHCP ACK. Ahora el portátil configura formalmente su interfaz con IP 192.168.1.50, máscara /24, gateway 192.168.1.1 y servidor DNS 8.8.8.8.",
        fromDevice: "laptop",
        toDevice: "gateway",
        packet: {
          type: "DHCP Request & ACK",
          layer2: { type: "Ethernet II", srcMac: "00:2A:43:A1:B2:C3", dstMac: "00:2A:43:01:02:03", etherType: "0x0800 (IPv4)" },
          layer3: { proto: "UDP (17)", srcIp: "0.0.0.0", dstIp: "255.255.255.255", ttl: 128 },
          layer4: { proto: "UDP", srcPort: "68", dstPort: "67", flags: "ACK" },
          payload: "DHCP ACK: Concesión confirmada. IP asignada: 192.168.1.50 activa en interfaz wlan0.",
          humanNote: "La pila TCP/IP del portátil queda completamente configurada con su IP y la dirección de su Puerta de Enlace Predeterminada."
        }
      },
      {
        id: 5,
        title: "Paso 5: Petición de Usuario y Comprobación de Subred",
        summary: "El usuario introduce www.ejemplo.edu.co; el host evalúa la ruta",
        explanation: "El usuario abre el navegador y escribe 'www.ejemplo.edu.co'. La aplicación necesita primero la IP del servidor mediante una consulta DNS a 8.8.8.8. El host aplica la máscara: (8.8.8.8 AND 255.255.255.0) != 192.168.1.0. Conclusión: ¡El destino es foráneo! El paquete debe viajar obligatoriamente al Default Gateway (192.168.1.1).",
        fromDevice: "laptop",
        toDevice: "laptop",
        packet: {
          type: "Evaluación Lógica de Subred",
          layer2: { type: "Interno en Host", srcMac: "00:2A:43:A1:B2:C3", dstMac: "-", etherType: "IPv4" },
          layer3: { proto: "Cálculo de Máscara", srcIp: "192.168.1.50", dstIp: "8.8.8.8", ttl: "-" },
          layer4: { proto: "UDP", srcPort: "53531", dstPort: "53 (DNS)", flags: "-" },
          payload: "Decisión de enrutamiento local: Destino 8.8.8.8 fuera de subred local. Reenviar hacia Default Gateway 192.168.1.1.",
          humanNote: "El sistema operativo del portátil descubre que no puede entregar el paquete directamente; debe pasárselo a su gateway predeterminado."
        }
      },
      {
        id: 6,
        title: "Paso 6: Resolución ARP (Búsqueda de MAC del Gateway)",
        summary: "El portátil emite un ARP Request para descubrir la MAC del Router",
        explanation: "El portátil sabe que la IP del gateway es 192.168.1.1, pero la tarjeta de red solo transmite tramas Ethernet con direcciones MAC de Capa 2. Como la tabla ARP está vacía, emite un ARP Request en broadcast: '¿Quién tiene 192.168.1.1? Dígale a 192.168.1.50'.",
        fromDevice: "laptop",
        toDevice: "gateway",
        packet: {
          type: "ARP Request (Broadcast)",
          layer2: { type: "Ethernet II (Broadcast)", srcMac: "00:2A:43:A1:B2:C3", dstMac: "FF:FF:FF:FF:FF:FF", etherType: "0x0806 (ARP)" },
          layer3: { proto: "ARP (Opcode 1: Request)", srcIp: "192.168.1.50", dstIp: "192.168.1.1", ttl: "-" },
          layer4: { proto: "None", srcPort: "-", dstPort: "-", flags: "ARP_REQ" },
          payload: "Who has 192.168.1.1? Tell 192.168.1.50 (Target MAC: 00:00:00:00:00:00)",
          humanNote: "El portátil necesita saber a qué dirección física de hardware debe dirigir la trama en el cable para que el Gateway la reciba."
        }
      },
      {
        id: 7,
        title: "Paso 7: ARP Reply y Actualización de Tablas",
        summary: "El Router responde con su MAC y el portátil actualiza su tabla ARP",
        explanation: "El Router reconoce su propia IP (192.168.1.1) y responde con un ARP Reply unicast: '192.168.1.1 tiene la MAC 00:2A:43:01:02:03'. El portátil guarda esta entrada en su caché ARP y el Switch registra el puerto en su tabla CAM.",
        fromDevice: "gateway",
        toDevice: "laptop",
        packet: {
          type: "ARP Reply (Unicast)",
          layer2: { type: "Ethernet II", srcMac: "00:2A:43:01:02:03", dstMac: "00:2A:43:A1:B2:C3", etherType: "0x0806 (ARP)" },
          layer3: { proto: "ARP (Opcode 2: Reply)", srcIp: "192.168.1.1", dstIp: "192.168.1.50", ttl: "-" },
          layer4: { proto: "None", srcPort: "-", dstPort: "-", flags: "ARP_REP" },
          payload: "192.168.1.1 is at 00:2A:43:01:02:03. Tabla ARP local actualizada con éxito.",
          humanNote: "Ahora el portátil ya puede encapsular paquetes IP con destino remoto dentro de tramas Ethernet cuya MAC de destino es el Router."
        }
      },
      {
        id: 8,
        title: "Paso 8: Consulta DNS al Gateway hacia Internet",
        summary: "El host envía la consulta DNS (UDP 53) encapsulada hacia el Gateway",
        explanation: "El portátil emite el paquete DNS Query hacia 8.8.8.8. En Capa 3 la IP destino es 8.8.8.8, pero en Capa 2 la MAC destino es la del Router (00:2A:43:01:02:03). El Switch conmuta la trama por puerto Fa0/24 y el Router la recibe.",
        fromDevice: "laptop",
        toDevice: "gateway",
        packet: {
          type: "DNS Query (UDP 53)",
          layer2: { type: "Ethernet II", srcMac: "00:2A:43:A1:B2:C3", dstMac: "00:2A:43:01:02:03", etherType: "0x0800 (IPv4)" },
          layer3: { proto: "UDP (17)", srcIp: "192.168.1.50", dstIp: "8.8.8.8", ttl: 64 },
          layer4: { proto: "UDP", srcPort: "58210", dstPort: "53 (DNS)", flags: "QUERY" },
          payload: "DNS Query: www.ejemplo.edu.co (A Record)",
          humanNote: "Nótese el principio clave: La IP destino final es 8.8.8.8, pero en el segmento local la trama viaja con la dirección física MAC del Gateway."
        }
      },
      {
        id: 9,
        title: "Paso 9: Enrutamiento y NAT de la Consulta DNS",
        summary: "El Gateway traduce la IP privada a pública y reenvía por la WAN",
        explanation: "El Router consulta su tabla de rutas: la red 8.8.8.8 se alcanza por la ruta por defecto (0.0.0.0/0 vía WAN). Aplica NAT (PAT): reemplaza la IP origen 192.168.1.50 por su IP pública WAN 200.24.15.2, reescribe las cabeceras MAC para el ISP y reenvía.",
        fromDevice: "gateway",
        toDevice: "server",
        packet: {
          type: "DNS Query NATed",
          layer2: { type: "Enlace WAN ISP", srcMac: "00:2A:43:FF:EE:DD", dstMac: "00:0C:29:11:22:33", etherType: "0x0800 (IPv4)" },
          layer3: { proto: "UDP (17)", srcIp: "200.24.15.2 (Pública)", dstIp: "8.8.8.8", ttl: 63 },
          layer4: { proto: "UDP", srcPort: "46102 (Puerto NAT)", dstPort: "53", flags: "QUERY" },
          payload: "DNS Query: www.ejemplo.edu.co -> Resuelto: IP 142.250.190.46",
          humanNote: "El gateway realizó la función NAT: Oculta la IP privada del portátil y usa su dirección IP pública para viajar por la Internet."
        }
      },
      {
        id: 10,
        title: "Paso 10: Respuesta DNS y Entrega al Cliente",
        summary: "El servidor DNS devuelve la IP destino: 142.250.190.46",
        explanation: "Llega la respuesta DNS. El Gateway consulta su tabla de traducción NAT, convierte la IP pública de vuelta a 192.168.1.50 y entrega la trama al portátil. El navegador ahora sabe que 'www.ejemplo.edu.co' reside en la IP pública 142.250.190.46.",
        fromDevice: "gateway",
        toDevice: "laptop",
        packet: {
          type: "DNS Response",
          layer2: { type: "Ethernet II", srcMac: "00:2A:43:01:02:03", dstMac: "00:2A:43:A1:B2:C3", etherType: "0x0800 (IPv4)" },
          layer3: { proto: "UDP (17)", srcIp: "8.8.8.8", dstIp: "192.168.1.50", ttl: 58 },
          layer4: { proto: "UDP", srcPort: "53", dstPort: "58210", flags: "RESPONSE" },
          payload: "DNS Answer: www.ejemplo.edu.co -> IP 142.250.190.46 (TTL: 300s)",
          humanNote: "¡Nombre resuelto con éxito! Ahora el portátil puede iniciar la conexión de transporte TCP con el servidor web."
        }
      },
      {
        id: 11,
        title: "Paso 11: TCP Handshake - SYN (Cliente -> Servidor)",
        summary: "El portátil envía segmento TCP SYN para iniciar conexión HTTPS",
        explanation: "El portátil genera un segmento TCP con la bandera SYN (Sequence Number = 1000) hacia el puerto 443 del servidor web. La trama sale con MAC destino del Default Gateway (192.168.1.1).",
        fromDevice: "laptop",
        toDevice: "gateway",
        packet: {
          type: "TCP [SYN]",
          layer2: { type: "Ethernet II", srcMac: "00:2A:43:A1:B2:C3", dstMac: "00:2A:43:01:02:03", etherType: "0x0800 (IPv4)" },
          layer3: { proto: "TCP (6)", srcIp: "192.168.1.50", dstIp: "142.250.190.46", ttl: 64 },
          layer4: { proto: "TCP", srcPort: "52341", dstPort: "443 (HTTPS)", flags: "SYN (Seq=1000, Ack=0, Win=64240)" },
          payload: "TCP Connection Request (SYN) con opciones MSS=1460, SACK Permitted",
          humanNote: "El portátil está intentando establecer una conexión TCP con el servidor HTTPS. Por eso envía un segmento con la bandera SYN."
        }
      },
      {
        id: 12,
        title: "Paso 12: Reenvío del SYN a través del Gateway con NAT",
        summary: "El Router reescribe cabeceras y envía el SYN a Internet",
        explanation: "El Gateway decrementa el TTL de 64 a 63. Registra en su tabla NAT: 192.168.1.50:52341 <-> 200.24.15.2:45001. Cambia la IP origen por 200.24.15.2, reescribe la MAC L2 hacia el router del ISP y retransmite hacia el servidor.",
        fromDevice: "gateway",
        toDevice: "server",
        packet: {
          type: "TCP [SYN] Enrutado + NAT",
          layer2: { type: "WAN Enlace ISP", srcMac: "00:2A:43:FF:EE:DD", dstMac: "00:0C:29:11:22:33", etherType: "0x0800 (IPv4)" },
          layer3: { proto: "TCP (6)", srcIp: "200.24.15.2 (WAN NAT)", dstIp: "142.250.190.46", ttl: 63 },
          layer4: { proto: "TCP", srcPort: "45001 (Puerto Traducido)", dstPort: "443", flags: "SYN (Seq=1000)" },
          payload: "Entrada creada en Tabla NAT: [192.168.1.50:52341 -> 200.24.15.2:45001 -> 142.250.190.46:443]",
          humanNote: "El Gateway ejerce aquí su doble función de red IP: enruta a través de la mejor interfaz y traduce el socket privado a público."
        }
      },
      {
        id: 13,
        title: "Paso 13: TCP Handshake - SYN-ACK (Servidor -> Cliente)",
        summary: "El servidor acepta la conexión y responde con SYN-ACK",
        explanation: "El servidor web recibe el SYN en el puerto 443. Al tener el servicio HTTPS escuchando (LISTEN), responde con SYN-ACK (Sequence Number=5000, Acknowledgment Number=1001, confirmando el SYN del cliente).",
        fromDevice: "server",
        toDevice: "gateway",
        packet: {
          type: "TCP [SYN, ACK]",
          layer2: { type: "WAN Enlace ISP", srcMac: "00:2A:43:99:88:77", dstMac: "00:2A:43:FF:EE:DD", etherType: "0x0800 (IPv4)" },
          layer3: { proto: "TCP (6)", srcIp: "142.250.190.46", dstIp: "200.24.15.2", ttl: 55 },
          layer4: { proto: "TCP", srcPort: "443", dstPort: "45001", flags: "SYN, ACK (Seq=5000, Ack=1001)" },
          payload: "Respuesta del Servidor Web: Acepto tu solicitud de conexión segura (SYN-ACK).",
          humanNote: "El servidor acepta abrir el canal de comunicación y le envía su propio número de secuencia para sincronizar."
        }
      },
      {
        id: 14,
        title: "Paso 14: Gateway des-traduce NAT y entrega SYN-ACK",
        summary: "El Router consulta la tabla NAT y entrega el SYN-ACK al portátil",
        explanation: "El Gateway recibe el paquete en su interfaz WAN (puerto 45001). Busca en la tabla NAT y encuentra que corresponde al portátil local 192.168.1.50:52341. Reescribe la IP destino por la privada, encapsula en trama local y el Switch la conmuta.",
        fromDevice: "gateway",
        toDevice: "laptop",
        packet: {
          type: "TCP [SYN, ACK] De-NATed",
          layer2: { type: "Ethernet II", srcMac: "00:2A:43:01:02:03", dstMac: "00:2A:43:A1:B2:C3", etherType: "0x0800 (IPv4)" },
          layer3: { proto: "TCP (6)", srcIp: "142.250.190.46", dstIp: "192.168.1.50", ttl: 54 },
          layer4: { proto: "TCP", srcPort: "443", dstPort: "52341", flags: "SYN, ACK (Seq=5000, Ack=1001)" },
          payload: "Entrega local del SYN-ACK. Estado del socket en portátil: SYN_RECEIVED.",
          humanNote: "El Gateway realiza la traducción inversa para que el host dentro de la red privada reciba la respuesta de Internet sin saber que hubo NAT."
        }
      },
      {
        id: 15,
        title: "Paso 15: TCP Handshake - ACK (Conexión Establecida)",
        summary: "El portátil envía ACK confirmando el SYN-ACK",
        explanation: "El portátil envía el último paquete del apretón de tres vías: un segmento con bandera ACK (Seq=1001, Ack=5001). Al llegar al servidor, el estado del socket en ambos extremos pasa a ESTABLISHED. ¡El canal bidireccional de transporte está listo!",
        fromDevice: "laptop",
        toDevice: "gateway",
        packet: {
          type: "TCP [ACK]",
          layer2: { type: "Ethernet II", srcMac: "00:2A:43:A1:B2:C3", dstMac: "00:2A:43:01:02:03", etherType: "0x0800 (IPv4)" },
          layer3: { proto: "TCP (6)", srcIp: "192.168.1.50", dstIp: "142.250.190.46", ttl: 64 },
          layer4: { proto: "TCP", srcPort: "52341", dstPort: "443", flags: "ACK (Seq=1001, Ack=5001)" },
          payload: "Three-Way Handshake Finalizado. Estado: ESTABLISHED.",
          humanNote: "Ahora la conexión TCP está formalmente establecida. Ya pueden transmitirse datos de aplicación (HTTP/HTTPS) con control de flujo y retransmisión garantizada."
        }
      },
      {
        id: 16,
        title: "Paso 16: Petición de Aplicación HTTP GET / (Datos Cifrados TLS)",
        summary: "El navegador solicita la página web al servidor",
        explanation: "El portátil envía la petición de Capa 7 (HTTP GET /index.html sobre TLS 1.3). El paquete fluye a través del Switch y el Gateway hacia el servidor web.",
        fromDevice: "laptop",
        toDevice: "server",
        packet: {
          type: "HTTPS Application Data",
          layer2: { type: "Ethernet II -> WAN", srcMac: "00:2A:43:A1:B2:C3", dstMac: "00:2A:43:01:02:03", etherType: "0x0800 (IPv4)" },
          layer3: { proto: "TCP (6)", srcIp: "192.168.1.50", dstIp: "142.250.190.46", ttl: 64 },
          layer4: { proto: "TCP", srcPort: "52341", dstPort: "443", flags: "PSH, ACK (Seq=1001, Ack=5001, Len=517)" },
          payload: "TLSv1.3 Encrypted Application Data: GET /index.html HTTP/1.1 (Host: www.ejemplo.edu.co)",
          humanNote: "El portátil envía la solicitud formal de la página web solicitada por el usuario."
        }
      },
      {
        id: 17,
        title: "Paso 17: Procesamiento en Servidor Web y Respuesta 200 OK",
        summary: "El servidor genera el código HTML y lo transmite de vuelta",
        explanation: "El servidor web procesa la petición en Capa 7, localiza el recurso 'index.html', genera la respuesta HTTP 200 OK (cifrada con la clave de sesión simétrica AES-GCM) y transmite los paquetes TCP de vuelta hacia la IP pública del Gateway.",
        fromDevice: "server",
        toDevice: "gateway",
        packet: {
          type: "HTTP/1.1 200 OK (TLS)",
          layer2: { type: "WAN Enlace ISP", srcMac: "00:2A:43:99:88:77", dstMac: "00:2A:43:FF:EE:DD", etherType: "0x0800 (IPv4)" },
          layer3: { proto: "TCP (6)", srcIp: "142.250.190.46", dstIp: "200.24.15.2", ttl: 55 },
          layer4: { proto: "TCP", srcPort: "443", dstPort: "45001", flags: "PSH, ACK (Seq=5001, Ack=1518, Len=1420)" },
          payload: "HTTP/1.1 200 OK, Content-Type: text/html; charset=UTF-8, Content-Length: 4820 bytes",
          humanNote: "El servidor web envía los datos solicitados hacia la IP pública del Gateway."
        }
      },
      {
        id: 18,
        title: "Paso 18: Llegada al Portátil y Renderizado de la Página",
        summary: "El portátil recibe los paquetes, desencapsula y muestra la página",
        explanation: "El Gateway traduce el paquete, el Switch conmuta y el AP transmite los paquetes por RF. La tarjeta Wi-Fi del portátil desencapsula la trama 802.11 -> IPv4 -> TCP -> TLS. El navegador descifra los datos, interpreta el HTML/CSS y renderiza la página web para el usuario.",
        fromDevice: "gateway",
        toDevice: "laptop",
        packet: {
          type: "Datos Web Entregados",
          layer2: { type: "Ethernet II -> 802.11", srcMac: "00:2A:43:01:02:03", dstMac: "00:2A:43:A1:B2:C3", etherType: "0x0800 (IPv4)" },
          layer3: { proto: "TCP (6)", srcIp: "142.250.190.46", dstIp: "192.168.1.50", ttl: 54 },
          layer4: { proto: "TCP", srcPort: "443", dstPort: "52341", flags: "ACK (Seq=5001, Ack=1518)" },
          payload: "HTML recibido: <!DOCTYPE html><html><title>Portal Universitario UPTC</title>...</html>",
          humanNote: "¡Proceso de red completado exitosamente! El estudiante visualiza el contenido web en su pantalla gracias a la interoperabilidad de todas las capas y al Gateway."
        }
      }
    ]
  },


  smartphone_wifi: {
    id: "smartphone_wifi",
    name: "Teléfono Móvil -> Wi-Fi -> Router/Gateway -> Internet -> Servidor Web",
    shortName: "Teléfono Móvil en Red Residencial Wi-Fi",
    badge: "Red Hogar / Móvil",
    desc: "Muestra cómo un smartphone en red doméstica navega a Internet a través de un router multifunción (AP + Switch + Router + NAT Gateway integrados).",
    devices: [
      {
        id: "phone",
        name: "Teléfono Inteligente",
        type: "phone",
        icon: "phone",
        x: 120,
        y: 170,
        ip: "192.168.1.105",
        mask: "255.255.255.0",
        gateway: "192.168.1.1",
        dns: "1.1.1.1",
        mac: "3C:5A:B4:77:88:99",
        medium: "Wi-Fi 5 GHz 802.11ac",
        status: "Asociado (Canal 36)",
        arpTable: [
          { ip: "192.168.1.1", mac: "00:1E:58:AA:BB:CC", iface: "wlan0", type: "Dinámico" }
        ],
        sockets: [
          { proto: "TCP", local: "192.168.1.105:49152", remote: "172.217.16.206:443", state: "ESTABLISHED" }
        ]
      },
      {
        id: "router_home",
        name: "Router / Gateway Residencial",
        type: "gateway",
        icon: "router",
        x: 450,
        y: 170,
        ip: "LAN: 192.168.1.1 / WAN: 181.49.20.14",
        mask: "255.255.255.0 / 255.255.252.0",
        gateway: "181.49.20.1 (ISP GPON)",
        dns: "1.1.1.1",
        mac: "LAN: 00:1E:58:AA:BB:CC | WAN: 00:1E:58:FF:99:00",
        medium: "Fibra Óptica GPON FTTH",
        status: "NAT + DHCP + Wi-Fi AP Integrado",
        arpTable: [
          { ip: "192.168.1.105", mac: "3C:5A:B4:77:88:99", iface: "br-lan", type: "Dinámico" }
        ],
        routingTable: [
          { dest: "192.168.1.0/24", nextHop: "Directamente conectado", iface: "br-lan", metric: 0 },
          { dest: "0.0.0.0/0", nextHop: "181.49.20.1", iface: "pppoe-wan", metric: 1 }
        ],
        natTable: [
          { insideIp: "192.168.1.105", insidePort: "49152", outsideIp: "181.49.20.14", outsidePort: "38920", destIp: "172.217.16.206", destPort: "443" }
        ],
        sockets: []
      },
      {
        id: "web_server",
        name: "Servidor Web Cloud",
        type: "server",
        icon: "server",
        x: 750,
        y: 170,
        ip: "172.217.16.206",
        mask: "255.255.255.0",
        gateway: "172.217.16.1",
        dns: "8.8.8.8",
        mac: "E4:D3:F2:11:22:33",
        medium: "Enlace Cloud BGP",
        status: "HTTPS Puerto 443 Activo",
        arpTable: [],
        sockets: []
      }
    ],
    links: [
      { from: "phone", to: "router_home", type: "wifi", label: "Wi-Fi 5 GHz" },
      { from: "router_home", to: "web_server", type: "wan", label: "Internet WAN (Fibra GPON)" }
    ],
    steps: [
      {
        id: 1,
        title: "Paso 1: Apertura de App Móvil y Verificación de Ruta",
        summary: "El smartphone detecta que el destino está en Internet",
        explanation: "El usuario abre una aplicación en su teléfono. La app requiere conectarse al servidor 172.217.16.206. La pila de red del teléfono verifica su máscara de red (/24) y constata que el servidor está fuera de la red local. Prepara el paquete para enviarlo a su Puerta de Enlace Predeterminada (192.168.1.1).",
        fromDevice: "phone",
        toDevice: "phone",
        packet: {
          type: "Consulta de Ruta Local",
          layer2: { type: "Interno", srcMac: "3C:5A:B4:77:88:99", dstMac: "-", etherType: "IPv4" },
          layer3: { proto: "IP", srcIp: "192.168.1.105", dstIp: "172.217.16.206", ttl: "-" },
          layer4: { proto: "TCP", srcPort: "49152", dstPort: "443", flags: "READY" },
          payload: "Decisión: Reenviar al Default Gateway 192.168.1.1.",
          humanNote: "El teléfono sabe que todo lo que no pertenezca a su red 192.168.1.0/24 debe ser entregado al router doméstico."
        }
      },
      {
        id: 2,
        title: "Paso 2: Transmisión Inalámbrica 802.11 del TCP SYN",
        summary: "El teléfono emite la trama Wi-Fi hacia la MAC del Gateway",
        explanation: "El teléfono encapsula el segmento TCP SYN en una trama Wi-Fi 802.11. La MAC de destino es la del router doméstico (00:1E:58:AA:BB:CC). La antena del router demodula las ondas electromagnéticas de 5 GHz.",
        fromDevice: "phone",
        toDevice: "router_home",
        packet: {
          type: "Wi-Fi 802.11 -> TCP [SYN]",
          layer2: { type: "802.11 Wireless Data Frame", srcMac: "3C:5A:B4:77:88:99", dstMac: "00:1E:58:AA:BB:CC", etherType: "0x0800 (IPv4)" },
          layer3: { proto: "TCP (6)", srcIp: "192.168.1.105", dstIp: "172.217.16.206", ttl: 64 },
          layer4: { proto: "TCP", srcPort: "49152", dstPort: "443", flags: "SYN (Seq=3000)" },
          payload: "TCP Handshake SYN desde Smartphone.",
          humanNote: "El teléfono envía el primer paso de la conexión TCP a través del aire mediante Wi-Fi hacia el gateway."
        }
      },
      {
        id: 3,
        title: "Paso 3: Traducción NAT y Reenvío WAN por Fibra",
        summary: "El router traduce la IP privada a su IP pública y reenvía por la WAN",
        explanation: "El router doméstico actúa como Gateway IP y NAT: modifica la IP origen 192.168.1.105 por su IP WAN pública 181.49.20.14, asigna el puerto 38920, decrementa el TTL a 63 y modula la trama óptica hacia el ISP.",
        fromDevice: "router_home",
        toDevice: "web_server",
        packet: {
          type: "TCP [SYN] Enrutado + NAT",
          layer2: { type: "WAN GPON / PPPoE", srcMac: "00:1E:58:FF:99:00", dstMac: "00:11:22:33:44:55", etherType: "0x0800 (IPv4)" },
          layer3: { proto: "TCP (6)", srcIp: "181.49.20.14 (IP Pública)", dstIp: "172.217.16.206", ttl: 63 },
          layer4: { proto: "TCP", srcPort: "38920", dstPort: "443", flags: "SYN" },
          payload: "Tabla NAT: [192.168.1.105:49152 -> 181.49.20.14:38920].",
          humanNote: "El gateway permite que miles de hogares compartan una misma dirección pública de Internet mediante NAT (Port Address Translation)."
        }
      },
      {
        id: 4,
        title: "Paso 4: Servidor Responde con SYN-ACK y Gateway Des-traduce NAT",
        summary: "El servidor acepta y el Gateway entrega la respuesta al móvil",
        explanation: "El servidor responde con SYN-ACK. El Gateway residencial busca en su memoria NAT, reescribe la IP destino con 192.168.1.105 y emite la trama Wi-Fi hacia el teléfono móvil.",
        fromDevice: "web_server",
        toDevice: "phone",
        packet: {
          type: "TCP [SYN, ACK]",
          layer2: { type: "802.11 Wireless Frame", srcMac: "00:1E:58:AA:BB:CC", dstMac: "3C:5A:B4:77:88:99", etherType: "0x0800 (IPv4)" },
          layer3: { proto: "TCP (6)", srcIp: "172.217.16.206", dstIp: "192.168.1.105", ttl: 54 },
          layer4: { proto: "TCP", srcPort: "443", dstPort: "49152", flags: "SYN, ACK (Seq=8000, Ack=3001)" },
          payload: "Conexión aceptada por el servidor.",
          humanNote: "El gateway predeterminado completa el retorno de la conexión sin que el servidor de Internet conozca la red interna privada."
        }
      }
    ]
  },

  laptop_to_plc: {
    id: "laptop_to_plc",
    name: "Portátil -> Router -> Gateway Industrial -> PLC (Doble Rol de Gateway)",
    shortName: "Portátil a PLC (Default Gateway + Protocol Gateway)",
    badge: "Convergencia IT / OT",
    desc: "Escenario crucial: El Router actúa como Default Gateway (Capa 3) y el Gateway Industrial actúa como Traductor de Protocolos (Modbus TCP a Modbus RTU serial).",
    devices: [
      {
        id: "eng_laptop",
        name: "Portátil del Ingeniero",
        type: "laptop",
        icon: "laptop",
        x: 80,
        y: 170,
        ip: "192.168.20.15",
        mask: "255.255.255.0",
        gateway: "192.168.20.1",
        dns: "192.168.20.1",
        mac: "00:15:5D:AA:BB:10",
        medium: "Ethernet Corporativo",
        status: "Software SCADA / Modbus Poll",
        arpTable: [
          { ip: "192.168.20.1", mac: "00:15:5D:01:01:01", iface: "eth0", type: "Dinámico" }
        ],
        sockets: [
          { proto: "TCP", local: "192.168.20.15:51230", remote: "192.168.10.50:502", state: "ESTABLISHED" }
        ]
      },
      {
        id: "router_it",
        name: "Router de Planta (Default Gateway)",
        type: "gateway",
        icon: "router",
        x: 300,
        y: 170,
        ip: "LAN1: 192.168.20.1 / LAN2: 192.168.10.1",
        mask: "255.255.255.0 / 255.255.255.0",
        gateway: "Enrutador Inter-VLAN",
        dns: "8.8.8.8",
        mac: "LAN1: 00:15:5D:01:01:01 | LAN2: 00:15:5D:02:02:02",
        medium: "Enlace Inter-VLAN 802.1Q",
        status: "Enrutador de Redes IP (Capa 3)",
        routingTable: [
          { dest: "192.168.20.0/24", nextHop: "Directamente conectado", iface: "VLAN 20 (Oficinas)", metric: 0 },
          { dest: "192.168.10.0/24", nextHop: "Directamente conectado", iface: "VLAN 10 (Planta)", metric: 0 }
        ],
        arpTable: [
          { ip: "192.168.20.15", mac: "00:15:5D:AA:BB:10", iface: "VLAN 20", type: "Dinámico" },
          { ip: "192.168.10.50", mac: "00:0B:AB:33:44:55", iface: "VLAN 10", type: "Dinámico" }
        ],
        sockets: []
      },
      {
        id: "proto_gw",
        name: "Gateway Industrial (Protocol Gateway)",
        type: "proto_gateway",
        icon: "gateway",
        x: 540,
        y: 170,
        ip: "192.168.10.50 (Puerto Ethernet)",
        mask: "255.255.255.0",
        gateway: "192.168.10.1",
        dns: "192.168.10.1",
        mac: "00:0B:AB:33:44:55",
        medium: "Ethernet TCP/IP ↔ Serial RS-485",
        status: "Traductor Modbus TCP ↔ RTU",
        arpTable: [
          { ip: "192.168.10.1", mac: "00:15:5D:02:02:02", iface: "eth0", type: "Dinámico" }
        ],
        sockets: [
          { proto: "TCP", local: "192.168.10.50:502", remote: "0.0.0.0:*", state: "LISTEN" }
        ]
      },
      {
        id: "plc_device",
        name: "PLC Industrial Siemens",
        type: "plc",
        icon: "plc",
        x: 770,
        y: 170,
        ip: "No tiene IP (Dispositivo Serial Puro)",
        mask: "N/A",
        gateway: "N/A",
        dns: "N/A",
        mac: "N/A (Capa de enlace asíncrona)",
        medium: "Bus Serie RS-485 Bipolar (9600 bps)",
        status: "Esclavo Modbus RTU (Slave ID: 1)",
        registers: [
          { reg: "40001 (Hold Reg 1)", name: "Temperatura Tanque", val: "75.4 °C (0x02F2)" },
          { reg: "40002 (Hold Reg 2)", name: "Presión Caldera", val: "4.2 bar (0x002A)" }
        ]
      }
    ],
    links: [
      { from: "eng_laptop", to: "router_it", type: "ethernet", label: "VLAN 20 (Oficinas)" },
      { from: "router_it", to: "proto_gw", type: "ethernet", label: "VLAN 10 (Planta)" },
      { from: "proto_gw", to: "plc_device", type: "serial", label: "Bus RS-485 Serial (Modbus RTU)" }
    ],
    steps: [
      {
        id: 1,
        title: "Paso 1: Petición Modbus TCP desde el Portátil",
        summary: "El portátil envía solicitud al Gateway Industrial (192.168.10.50)",
        explanation: "El ingeniero ejecuta una lectura de registros de temperatura. El portátil genera una trama Modbus TCP con cabecera MBAP dirigida a la IP 192.168.10.50 (puerto 502). Como la IP destino está en otra subred (VLAN 10), el portátil entrega la trama a su Default Gateway (192.168.20.1).",
        fromDevice: "eng_laptop",
        toDevice: "router_it",
        packet: {
          type: "Modbus TCP Read Request",
          layer2: { type: "Ethernet II", srcMac: "00:15:5D:AA:BB:10", dstMac: "00:15:5D:01:01:01", etherType: "0x0800 (IPv4)" },
          layer3: { proto: "TCP (6)", srcIp: "192.168.20.15", dstIp: "192.168.10.50", ttl: 64 },
          layer4: { proto: "TCP", srcPort: "51230", dstPort: "502 (Modbus)", flags: "PSH, ACK" },
          payload: "MBAP [TransID: 0x0001, UnitID: 1] + PDU [Func: 0x03, StartReg: 0x0000, Count: 2]",
          humanNote: "Primer rol de Gateway en acción: El Router actúa como Default Gateway de Capa 3 para cruzar entre subredes IP diferentes."
        }
      },
      {
        id: 2,
        title: "Paso 2: Enrutamiento Inter-VLAN hacia el Gateway de Protocolo",
        summary: "El Router reenvía el paquete IP hacia la subred de planta",
        explanation: "El Router de planta conmuta el paquete desde la VLAN 20 a la VLAN 10. Decrementa el TTL (64 -> 63) y reescribe la MAC de destino para la interfaz Ethernet del Gateway Industrial (00:0B:AB:33:44:55).",
        fromDevice: "router_it",
        toDevice: "proto_gw",
        packet: {
          type: "Modbus TCP Enrutado",
          layer2: { type: "Ethernet II (VLAN 10)", srcMac: "00:15:5D:02:02:02", dstMac: "00:0B:AB:33:44:55", etherType: "0x0800 (IPv4)" },
          layer3: { proto: "TCP (6)", srcIp: "192.168.20.15", dstIp: "192.168.10.50", ttl: 63 },
          layer4: { proto: "TCP", srcPort: "51230", dstPort: "502", flags: "PSH, ACK" },
          payload: "Modbus TCP entregado a la interfaz de red del Gateway de protocolos.",
          humanNote: "El paquete IP llega intacto a su destino de red: el Gateway Industrial."
        }
      },
      {
        id: 3,
        title: "Paso 3: Traducción de Protocolos en el Gateway Industrial",
        summary: "El Gateway desensambla TCP/IP y convierte a trama serial Modbus RTU",
        explanation: "¡Segundo rol de Gateway en acción!: El Gateway Industrial NO es solo un router. Desempaca las capas Ethernet, IP y TCP. Retira la cabecera MBAP. Toma la PDU de aplicación Modbus (Función 03, Dirección esclavo 1), calcula un nuevo código de redundancia cíclica CRC16 de 16 bits y prepara los bytes para el puerto serie.",
        fromDevice: "proto_gw",
        toDevice: "proto_gw",
        packet: {
          type: "Traducción de Protocolos",
          layer2: { type: "Conversión de Pila", srcMac: "-", dstMac: "-", etherType: "-" },
          layer3: { proto: "Desensamblado TCP/IP", srcIp: "-", dstIp: "-", ttl: "-" },
          layer4: { proto: "Extracción PDU", srcPort: "502", dstPort: "-", flags: "TRANSLATE" },
          payload: "Trama Serial Resultante: [01 03 00 00 00 02 C4 0B]. Se retiró IP/TCP y se añadió CRC16.",
          humanNote: "Aquí opera el Protocol Gateway: traduce la semántica y sintaxis entre dos protocolos totalmente distintos."
        }
      },
      {
        id: 4,
        title: "Paso 4: Transmisión Física Serial RS-485 hacia el PLC",
        summary: "Los pulsos eléctricos viajan por el bus diferencial RS-485",
        explanation: "El transceptor RS-485 del Gateway modula los bits en tensiones diferenciales (+5V / -5V) a 9600 baudios por el cable de dos hilos. El PLC Siemens esclavo escucha la trama en su puerto serial y valida el CRC16.",
        fromDevice: "proto_gw",
        toDevice: "plc_device",
        packet: {
          type: "Modbus RTU Serial (RS-485)",
          layer2: { type: "Bus Diferencial Serial RS-485", srcMac: "N/A", dstMac: "Slave ID: 1", etherType: "Serial" },
          layer3: { proto: "None (Sin IP)", srcIp: "N/A", dstIp: "N/A", ttl: "-" },
          layer4: { proto: "None (Orientado a bytes)", srcPort: "-", dstPort: "-", flags: "-" },
          payload: "Bytes en Bus RS-485: [01 03 00 00 00 02 C4 0B]. Baudrate: 9600 8-N-1.",
          humanNote: "La información viaja como señal física analógica por un medio donde no existen IPs ni paquetes de conmutación."
        }
      },
      {
        id: 5,
        title: "Paso 5: Lectura en PLC y Respuesta Modbus RTU",
        summary: "El PLC lee sus registros y devuelve los datos por RS-485",
        explanation: "El PLC lee sus registros internos de memoria: Registro 40001 = 0x02F2 (75.4 °C). Ensambla la respuesta Modbus RTU con su propio CRC16 (0xC40B) y la transmite de vuelta por el bus hacia el Gateway.",
        fromDevice: "plc_device",
        toDevice: "proto_gw",
        packet: {
          type: "Modbus RTU Response (Serial)",
          layer2: { type: "RS-485 Serial", srcMac: "Slave ID: 1", dstMac: "Master Gateway", etherType: "Serial" },
          layer3: { proto: "None", srcIp: "N/A", dstIp: "N/A", ttl: "-" },
          layer4: { proto: "None", srcPort: "-", dstPort: "-", flags: "-" },
          payload: "Respuesta Serial PLC: [01 03 02 02 F2 C4 0B]. Valor: 75.4 °C.",
          humanNote: "El PLC responde con la telemetría en formato binario industrial."
        }
      },
      {
        id: 6,
        title: "Paso 6: Gateway traduce Modbus RTU a TCP y entrega al Portátil",
        summary: "El Gateway reencapsula en TCP/IP y el Router entrega los datos",
        explanation: "El Gateway Industrial valida el CRC16, retira el checksum serial, añade la cabecera MBAP (Transaction ID 0x0001, Unit ID 1), empaqueta en segmento TCP puerto 51230 y reenvía por Ethernet hacia el Router. El Router entrega la trama al portátil del ingeniero, donde el software visualiza la temperatura de 75.4 °C.",
        fromDevice: "proto_gw",
        toDevice: "eng_laptop",
        packet: {
          type: "Modbus TCP Response",
          layer2: { type: "Ethernet II", srcMac: "00:0B:AB:33:44:55", dstMac: "00:15:5D:AA:BB:10", etherType: "0x0800 (IPv4)" },
          layer3: { proto: "TCP (6)", srcIp: "192.168.10.50", dstIp: "192.168.20.15", ttl: 63 },
          layer4: { proto: "TCP", srcPort: "502", dstPort: "51230", flags: "PSH, ACK" },
          payload: "MBAP + PDU: [00 01 00 00 00 05 01 03 02 02 F2]. Telemetría: 75.4 °C.",
          humanNote: "¡Misión cumplida! Se apreciaron claramente los dos tipos de Gateway: el Router como Default Gateway IP y la Pasarela Industrial como Traductor de Protocolos."
        }
      }
    ]
  },


  industrial_modbus: {
    id: "industrial_modbus",
    name: "PLC -> Modbus RTU (RS-485) -> Gateway Industrial -> Modbus TCP -> SCADA",
    shortName: "Entorno Industrial Puro (16 Pasos Reales)",
    badge: "Automatización Industrial SCADA",
    desc: "Representa el flujo real de telemetría entre un PLC de campo y un servidor SCADA corporativo a través de un Gateway Advantech EKI-1221.",
    devices: [
      {
        id: "plc_field",
        name: "PLC / Sensor de Campo",
        type: "plc",
        icon: "plc",
        x: 120,
        y: 170,
        ip: "Dispositivo Serial Puro (Sin IP)",
        mask: "N/A",
        gateway: "N/A",
        dns: "N/A",
        mac: "N/A",
        medium: "Bus Serie RS-485 Bipolar",
        status: "Esclavo Modbus ID: 1",
        registers: [
          { reg: "40001", name: "Temperatura Reactor", val: "75.4 °C (0x02F2)" }
        ]
      },
      {
        id: "advantech_gw",
        name: "Gateway Industrial Advantech",
        type: "proto_gateway",
        icon: "gateway",
        x: 450,
        y: 170,
        ip: "192.168.10.50",
        mask: "255.255.255.0",
        gateway: "192.168.10.1",
        dns: "192.168.10.1",
        mac: "00:0B:AB:78:90:12",
        medium: "RS-485 ↔ 100BASE-TX Ethernet",
        status: "Traducción Activa Modbus RTU ↔ TCP",
        arpTable: [
          { ip: "192.168.10.100", mac: "00:0B:AB:EE:FF:11", iface: "eth0", type: "Dinámico" }
        ],
        sockets: [
          { proto: "TCP", local: "192.168.10.50:502", remote: "0.0.0.0:*", state: "LISTEN" }
        ]
      },
      {
        id: "scada_server",
        name: "Servidor SCADA Corporativo",
        type: "server",
        icon: "server",
        x: 750,
        y: 170,
        ip: "192.168.10.100",
        mask: "255.255.255.0",
        gateway: "192.168.10.1",
        dns: "192.168.10.1",
        mac: "00:0B:AB:EE:FF:11",
        medium: "Red LAN Ethernet Industrial",
        status: "Software SCADA Wonderware / Ignition",
        arpTable: [
          { ip: "192.168.10.50", mac: "00:0B:AB:78:90:12", iface: "eth0", type: "Dinámico" }
        ],
        sockets: [
          { proto: "TCP", local: "192.168.10.100:49200", remote: "192.168.10.50:502", state: "ESTABLISHED" }
        ]
      }
    ],
    links: [
      { from: "plc_field", to: "advantech_gw", type: "serial", label: "Bus Serial RS-485 Modbus RTU" },
      { from: "advantech_gw", to: "scada_server", type: "ethernet", label: "Ethernet LAN Modbus TCP (Puerto 502)" }
    ],
    steps: [
      {
        id: 1,
        title: "Paso 1: El PLC genera una solicitud Modbus RTU",
        summary: "El PLC empaqueta la lectura de registro en formato binario RTU",
        explanation: "El sensor toma la lectura analógica de la caldera (75.4 °C) y prepara la respuesta Modbus RTU: Dirección esclavo (0x01), Código de función (0x03 Read Holding Registers), Contador de bytes (0x02), y valor (0x02F2).",
        fromDevice: "plc_field",
        toDevice: "plc_field",
        packet: {
          type: "Modbus RTU PDU",
          layer2: { type: "Serial Asíncrono", srcMac: "Slave ID: 1", dstMac: "Master", etherType: "N/A" },
          layer3: { proto: "N/A", srcIp: "N/A", dstIp: "N/A", ttl: "-" },
          layer4: { proto: "N/A", srcPort: "-", dstPort: "-", flags: "-" },
          payload: "PDU: [01 03 02 02 F2 C4 0B]. Código CRC16 calculado por hardware en el PLC.",
          humanNote: "El PLC genera la trama sin saber nada sobre IP ni Ethernet."
        }
      },
      {
        id: 2,
        title: "Paso 2: La trama viaja por el bus físico RS-485",
        summary: "Pulsos de voltaje diferencial sobre par trenzado A/B",
        explanation: "La trama serial se propaga a 9600 baudios como señales eléctricas bipolares diferenciales (Línea A - Línea B) resistentes a interferencias de motores de la planta.",
        fromDevice: "plc_field",
        toDevice: "advantech_gw",
        packet: {
          type: "Voltaje Diferencial RS-485",
          layer2: { type: "Bus Serie Físico", srcMac: "N/A", dstMac: "N/A", etherType: "N/A" },
          layer3: { proto: "N/A", srcIp: "N/A", dstIp: "N/A", ttl: "-" },
          layer4: { proto: "N/A", srcPort: "-", dstPort: "-", flags: "-" },
          payload: "Señal física: +5V / -5V en par trenzado de instrumentación.",
          humanNote: "Los bits viajan por el medio físico serial hacia el puerto del gateway."
        }
      },
      {
        id: 3,
        title: "Paso 3: El Gateway industrial recibe la trama",
        summary: "La UART del Gateway almacena los bytes en su buffer interno",
        explanation: "El chip UART del Gateway Advantech EKI-1221 captura la secuencia de bytes en su memoria temporal de recepción.",
        fromDevice: "advantech_gw",
        toDevice: "advantech_gw",
        packet: {
          type: "Bytes en Buffer UART",
          layer2: { type: "Recepción Serie", srcMac: "Slave 1", dstMac: "Gateway", etherType: "Serial" },
          layer3: { proto: "N/A", srcIp: "N/A", dstIp: "N/A", ttl: "-" },
          layer4: { proto: "N/A", srcPort: "-", dstPort: "-", flags: "BUFFER_READY" },
          payload: "Buffer RX: [01 03 02 02 F2 C4 0B] (7 bytes leídos con éxito).",
          humanNote: "El gateway recibe la trama física y la prepara para inspección lógica."
        }
      },
      {
        id: 4,
        title: "Paso 4: El Gateway interpreta Modbus RTU",
        summary: "Valida la integridad de la trama mediante verificación CRC16",
        explanation: "El procesador del Gateway calcula el algoritmo CRC16 sobre los datos recibidos y constata que coincide con 0xC40B. La trama no contiene errores de ruido electromagnético.",
        fromDevice: "advantech_gw",
        toDevice: "advantech_gw",
        packet: {
          type: "Validación CRC16",
          layer2: { type: "Chequeo de Integridad", srcMac: "-", dstMac: "-", etherType: "-" },
          layer3: { proto: "N/A", srcIp: "N/A", dstIp: "N/A", ttl: "-" },
          layer4: { proto: "N/A", srcPort: "-", dstPort: "-", flags: "CRC_OK" },
          payload: "CRC16 calculado: 0xC40B == CRC recibido: 0xC40B. Trama válida.",
          humanNote: "El gateway verifica que los datos seriales llegaron íntegros sin alteración."
        }
      },
      {
        id: 5,
        title: "Paso 5: Extrae la información relevante",
        summary: "Separa la carga útil (Payload PDU): Unidad, Función y Datos",
        explanation: "El Gateway extrae el ID de unidad (1), el código de función (03) y los dos bytes del registro térmico (0x02, 0xF2 = 75.4 °C).",
        fromDevice: "advantech_gw",
        toDevice: "advantech_gw",
        packet: {
          type: "Extracción PDU",
          layer2: { type: "Desencapsulado Serial", srcMac: "-", dstMac: "-", etherType: "-" },
          layer3: { proto: "N/A", srcIp: "N/A", dstIp: "N/A", ttl: "-" },
          layer4: { proto: "N/A", srcPort: "-", dstPort: "-", flags: "-" },
          payload: "PDU aislada: [03 02 02 F2]. Se descarta el CRC16 ya que TCP/IP usará sus propios checksums.",
          humanNote: "El gateway retira los encabezados del protocolo antiguo y se queda con los datos puros."
        }
      },
      {
        id: 6,
        title: "Paso 6: Traduce la operación a Modbus TCP",
        summary: "Convierte la semántica de trama serial a protocolo de red",
        explanation: "El motor de traducción de la pasarela prepara la conversión hacia la especificación Modbus TCP (IEC 61158).",
        fromDevice: "advantech_gw",
        toDevice: "advantech_gw",
        packet: {
          type: "Mapeo Semántico",
          layer2: { type: "Conversión de Arquitectura", srcMac: "-", dstMac: "-", etherType: "-" },
          layer3: { proto: "Preparación IP", srcIp: "-", dstIp: "-", ttl: "-" },
          layer4: { proto: "TCP", srcPort: "502", dstPort: "49200", flags: "-" },
          payload: "Mapeo: Modbus RTU Slave 1 -> Modbus TCP Unit ID 1.",
          humanNote: "El gateway hace de traductor universal entre el mundo de automatización y el mundo IT."
        }
      },
      {
        id: 7,
        title: "Paso 7: Construye una nueva comunicación TCP",
        summary: "Asigna el socket TCP en el puerto estándar 502",
        explanation: "El Gateway abre el segmento TCP de transporte con puerto de origen 502 y destino 49200 (servidor SCADA), gestionando el número de secuencia.",
        fromDevice: "advantech_gw",
        toDevice: "advantech_gw",
        packet: {
          type: "Segmento TCP Creado",
          layer2: { type: "Preparación L4", srcMac: "-", dstMac: "-", etherType: "-" },
          layer3: { proto: "TCP (6)", srcIp: "192.168.10.50", dstIp: "192.168.10.100", ttl: 64 },
          layer4: { proto: "TCP", srcPort: "502", dstPort: "49200", flags: "PSH, ACK" },
          payload: "Socket TCP establecido en puerto 502.",
          humanNote: "Se crea la estructura de transporte confiable TCP."
        }
      },
      {
        id: 8,
        title: "Paso 8: Agrega la cabecera MBAP",
        summary: "Inserta cabecera Modbus Application Protocol (7 bytes)",
        explanation: "Añade: Transaction ID (0x0001), Protocol ID (0x0000 = Modbus), Length (0x0005) y Unit ID (0x01).",
        fromDevice: "advantech_gw",
        toDevice: "advantech_gw",
        packet: {
          type: "Cabecera MBAP Ensamblada",
          layer2: { type: "-", srcMac: "-", dstMac: "-", etherType: "-" },
          layer3: { proto: "TCP (6)", srcIp: "-", dstIp: "-", ttl: "-" },
          layer4: { proto: "TCP", srcPort: "502", dstPort: "49200", flags: "-" },
          payload: "MBAP Header: [00 01 00 00 00 05 01] + PDU [03 02 02 F2].",
          humanNote: "La cabecera MBAP reemplaza la dirección de esclavo y el CRC de la versión serial."
        }
      },
      {
        id: 9,
        title: "Paso 9: Construye el paquete IP",
        summary: "Añade encabezado IPv4 con direcciones de capa de red",
        explanation: "Inserta cabecera IPv4: IP origen 192.168.10.50 (Gateway), IP destino 192.168.10.100 (Servidor SCADA), TTL 64, Protocolo 6 (TCP).",
        fromDevice: "advantech_gw",
        toDevice: "advantech_gw",
        packet: {
          type: "Paquete IPv4 Ensamblado",
          layer2: { type: "-", srcMac: "-", dstMac: "-", etherType: "-" },
          layer3: { proto: "TCP (6)", srcIp: "192.168.10.50", dstIp: "192.168.10.100", ttl: 64 },
          layer4: { proto: "TCP", srcPort: "502", dstPort: "49200", flags: "PSH, ACK" },
          payload: "Paquete IP de 47 bytes listo.",
          humanNote: "Se coloca la dirección lógica para que los routers y switches puedan encaminar la información."
        }
      },
      {
        id: 10,
        title: "Paso 10: Construye la trama Ethernet",
        summary: "Agrega cabecera MAC Ethernet II y calcula FCS CRC32",
        explanation: "Añade MAC origen (00:0B:AB:78:90:12), MAC destino (00:0B:AB:EE:FF:11), EtherType 0x0800 y calcula el Frame Check Sequence de 32 bits.",
        fromDevice: "advantech_gw",
        toDevice: "advantech_gw",
        packet: {
          type: "Trama Ethernet II Lista",
          layer2: { type: "Ethernet II", srcMac: "00:0B:AB:78:90:12", dstMac: "00:0B:AB:EE:FF:11", etherType: "0x0800 (IPv4)" },
          layer3: { proto: "TCP (6)", srcIp: "192.168.10.50", dstIp: "192.168.10.100", ttl: 64 },
          layer4: { proto: "TCP", srcPort: "502", dstPort: "49200", flags: "PSH, ACK" },
          payload: "Trama Ethernet completa de 61 bytes con FCS válido.",
          humanNote: "La trama está lista para ser inyectada al medio físico Ethernet."
        }
      },
      {
        id: 11,
        title: "Paso 11: Envía la información al servidor SCADA",
        summary: "Transmisión por cable Ethernet 100BASE-TX hacia el servidor",
        explanation: "La trama viaja a 100 Mbps Full-Duplex por la red local hacia la tarjeta de red del servidor SCADA.",
        fromDevice: "advantech_gw",
        toDevice: "scada_server",
        packet: {
          type: "Modbus TCP en Tránsito",
          layer2: { type: "Ethernet II", srcMac: "00:0B:AB:78:90:12", dstMac: "00:0B:AB:EE:FF:11", etherType: "0x0800 (IPv4)" },
          layer3: { proto: "TCP (6)", srcIp: "192.168.10.50", dstIp: "192.168.10.100", ttl: 64 },
          layer4: { proto: "TCP", srcPort: "502", dstPort: "49200", flags: "PSH, ACK" },
          payload: "Modbus TCP Packet transmitido con éxito.",
          humanNote: "La trama viaja por la red LAN corporativa."
        }
      },
      {
        id: 12,
        title: "Paso 12: El servidor procesa la solicitud",
        summary: "El SCADA decodifica la telemetría térmica: 75.4 °C",
        explanation: "El servidor SCADA recibe la trama, valida el CRC32, desencapsula IP y TCP, lee la cabecera MBAP y extrae el valor 75.4 °C, actualizando la pantalla HMI del operador.",
        fromDevice: "scada_server",
        toDevice: "scada_server",
        packet: {
          type: "Procesamiento SCADA",
          layer2: { type: "Ethernet II", srcMac: "-", dstMac: "-", etherType: "-" },
          layer3: { proto: "TCP", srcIp: "192.168.10.50", dstIp: "192.168.10.100", ttl: "-" },
          layer4: { proto: "TCP", srcPort: "502", dstPort: "49200", flags: "PROCESSED" },
          payload: "HMI Dashboard actualizado: Caldera #1 = 75.4 °C (Normal).",
          humanNote: "El servidor de supervisión ya tiene el dato en tiempo real."
        }
      },
      {
        id: 13,
        title: "Paso 13: Genera una respuesta",
        summary: "El SCADA emite confirmación de recepción TCP ACK",
        explanation: "La pila TCP del servidor genera un ACK para confirmar la entrega del paquete de datos al Gateway.",
        fromDevice: "scada_server",
        toDevice: "advantech_gw",
        packet: {
          type: "TCP [ACK]",
          layer2: { type: "Ethernet II", srcMac: "00:0B:AB:EE:FF:11", dstMac: "00:0B:AB:78:90:12", etherType: "0x0800 (IPv4)" },
          layer3: { proto: "TCP (6)", srcIp: "192.168.10.100", dstIp: "192.168.10.50", ttl: 64 },
          layer4: { proto: "TCP", srcPort: "49200", dstPort: "502", flags: "ACK" },
          payload: "TCP Acknowledgment confirmado.",
          humanNote: "El servidor confirma al Gateway que recibió la telemetría."
        }
      },
      {
        id: 14,
        title: "Paso 14: La respuesta vuelve al Gateway",
        summary: "El paquete llega a la interfaz Ethernet del Gateway industrial",
        explanation: "El Gateway recibe el ACK y finaliza la transacción TCP abierta con el servidor SCADA.",
        fromDevice: "scada_server",
        toDevice: "advantech_gw",
        packet: {
          type: "ACK Recibido en Gateway",
          layer2: { type: "Ethernet II", srcMac: "00:0B:AB:EE:FF:11", dstMac: "00:0B:AB:78:90:12", etherType: "0x0800" },
          layer3: { proto: "TCP (6)", srcIp: "192.168.10.100", dstIp: "192.168.10.50", ttl: 64 },
          layer4: { proto: "TCP", srcPort: "49200", dstPort: "502", flags: "ACK" },
          payload: "Transacción Modbus TCP #0001 completada exitosamente.",
          humanNote: "El ciclo de red Ethernet concluye con éxito."
        }
      },
      {
        id: 15,
        title: "Paso 15: El Gateway traduce Modbus TCP -> Modbus RTU",
        summary: "Convierte el resultado hacia el formato serial del PLC",
        explanation: "Para cerrar el ciclo de control o enviar una nueva consigna, el Gateway desensambla la trama TCP/IP, retira la cabecera MBAP y calcula un nuevo CRC16 serial.",
        fromDevice: "advantech_gw",
        toDevice: "advantech_gw",
        packet: {
          type: "Traducción Inversa",
          layer2: { type: "Conversión de Pila", srcMac: "-", dstMac: "-", etherType: "-" },
          layer3: { proto: "Desensamblado IP", srcIp: "-", dstIp: "-", ttl: "-" },
          layer4: { proto: "Extracción PDU", srcPort: "-", dstPort: "-", flags: "CRC_CALC" },
          payload: "Trama RTU lista para el bus serial: [01 03 00 00 00 02 C4 0B].",
          humanNote: "El gateway vuelve a convertir el mundo IP al mundo serial."
        }
      },
      {
        id: 16,
        title: "Paso 16: El PLC recibe la confirmación",
        summary: "Los pulsos seriales llegan al PLC cerrando el ciclo completo",
        explanation: "El PLC recibe los bytes por RS-485, valida el CRC y queda a la espera del siguiente ciclo de sondeo. ¡Se completaron con éxito los 16 pasos de la comunicación industrial!",
        fromDevice: "advantech_gw",
        toDevice: "plc_field",
        packet: {
          type: "Ciclo Modbus Completado",
          layer2: { type: "Bus Serie RS-485", srcMac: "Master", dstMac: "Slave ID: 1", etherType: "Serial" },
          layer3: { proto: "N/A", srcIp: "N/A", dstIp: "N/A", ttl: "-" },
          layer4: { proto: "N/A", srcPort: "-", dstPort: "-", flags: "CYCLE_DONE" },
          payload: "Estado de instrumentación: Sincronizado 100%.",
          humanNote: "El ciclo industrial culmina sin errores gracias al trabajo de la pasarela de traducción de protocolos."
        }
      }
    ]
  },


  iot_cloud: {
    id: "iot_cloud",
    name: "Sensor IoT (ESP32) -> Gateway IoT (MQTT) -> WAN Fibra -> Broker Cloud (AWS IoT)",
    shortName: "Internet de las Cosas (IoT) a la Nube",
    badge: "IoT Industrial & Domótica",
    desc: "Demuestra cómo dispositivos de baja potencia y protocolos ligeros (MQTT) se conectan al Cloud mediante un Gateway IoT que realiza traducción a TLS y transporte WAN.",
    devices: [
      {
        id: "sensor_iot",
        name: "Sensor Temperatura ESP32",
        type: "iot",
        icon: "iot",
        x: 100,
        y: 170,
        ip: "10.0.5.21 (Subred Sensores)",
        mask: "255.255.255.0",
        gateway: "10.0.5.1",
        dns: "N/A (IP Estática)",
        mac: "44:17:93:11:22:33",
        medium: "Wi-Fi 802.11 b/g/n / MQTT Ligero",
        status: "Online (Sensor DHT22 Activo)",
        arpTable: [
          { ip: "10.0.5.1", mac: "00:0B:AB:44:55:66", iface: "wlan0", type: "Dinámico" }
        ],
        sockets: [
          { proto: "TCP", local: "10.0.5.21:49210", remote: "10.0.5.1:1883", state: "ESTABLISHED" }
        ]
      },
      {
        id: "gateway_iot",
        name: "Gateway IoT Multiprotocolo",
        type: "gateway",
        icon: "gateway",
        x: 450,
        y: 170,
        ip: "LAN: 10.0.5.1 / WAN: 190.85.40.12",
        mask: "255.255.255.0 / 255.255.255.248",
        gateway: "190.85.40.9 (ISP Fibra)",
        dns: "8.8.8.8",
        mac: "00:0B:AB:44:55:66",
        medium: "Wi-Fi AP Local ↔ WAN Gigabit Fibra",
        status: "Broker Local / Forwarder a Cloud Activo",
        arpTable: [
          { ip: "10.0.5.21", mac: "44:17:93:11:22:33", iface: "wlan0", type: "Dinámico" },
          { ip: "190.85.40.9", mac: "CC:46:D6:77:88:99", iface: "wan0", type: "Dinámico" }
        ],
        routingTable: [
          { dest: "10.0.5.0/24", gw: "0.0.0.0", iface: "wlan0", metric: 0 },
          { dest: "0.0.0.0/0", gw: "190.85.40.9", iface: "wan0", metric: 10 }
        ],
        natTable: [
          { insideLocal: "10.0.5.21:49210", insideGlobal: "190.85.40.12:61005", outsideGlobal: "3.220.14.88:8883", proto: "TCP" }
        ],
        sockets: [
          { proto: "TCP", local: "10.0.5.1:1883", remote: "0.0.0.0:*", state: "LISTEN" },
          { proto: "TCP", local: "190.85.40.12:61005", remote: "3.220.14.88:8883", state: "ESTABLISHED" }
        ]
      },
      {
        id: "broker_cloud",
        name: "Broker Cloud (AWS IoT)",
        type: "server",
        icon: "server",
        x: 800,
        y: 170,
        ip: "3.220.14.88",
        mask: "255.255.255.0",
        gateway: "3.220.14.1",
        dns: "Amazon Route 53",
        mac: "0A:24:D1:FE:DC:BA",
        medium: "Nube Pública AWS / Datacenter",
        status: "Online · Cluster Mosquitto/AWS IoT Activo",
        sockets: [
          { proto: "TCP (TLS)", local: "3.220.14.88:8883", remote: "190.85.40.12:61005", state: "ESTABLISHED" }
        ]
      }
    ],
    steps: [
      {
        id: 1,
        title: "Paso 1: Muestreo del Sensor y Creación de Mensaje MQTT",
        summary: "El microcontrolador ESP32 lee la temperatura ambiental y empaqueta en MQTT",
        explanation: "El sensor toma una lectura física (24.8 °C). El firmware genera un paquete MQTT PUBLISH dirigido al tópico 'planta/sector1/temperatura' con payload JSON: {\"temp\": 24.8, \"unit\": \"C\"}.",
        fromDevice: "sensor_iot",
        toDevice: "sensor_iot",
        packet: {
          type: "MQTT PUBLISH (Payload JSON)",
          layer2: { type: "802.11 Wi-Fi MAC", srcMac: "44:17:93:11:22:33", dstMac: "-", etherType: "-" },
          layer3: { proto: "IPv4", srcIp: "10.0.5.21", dstIp: "10.0.5.1", ttl: 64 },
          layer4: { proto: "TCP", srcPort: "49210", dstPort: "1883", flags: "PSH, ACK" },
          payload: "MQTT PUBLISH topic='planta/sector1/temp' qos=1 payload='{\"temp\":24.8}'",
          humanNote: "El sensor utiliza MQTT por su mínima sobrecarga (overhead de cabecera de solo 2 bytes)."
        }
      },
      {
        id: 2,
        title: "Paso 2: Transmisión Inalámbrica hacia el Gateway IoT Edge",
        summary: "Envío por RF Wi-Fi local hacia la antena del Gateway",
        explanation: "La trama 802.11 viaja por el aire en banda ISM 2.4 GHz hacia la interfaz Wi-Fi del Gateway Edge ubicado en el tablero de control del edificio.",
        fromDevice: "sensor_iot",
        toDevice: "gateway_iot",
        packet: {
          type: "Trama 802.11 Inalámbrica",
          layer2: { type: "IEEE 802.11 QoS Data", srcMac: "44:17:93:11:22:33", dstMac: "00:0B:AB:44:55:66", etherType: "0x0800" },
          layer3: { proto: "TCP (6)", srcIp: "10.0.5.21", dstIp: "10.0.5.1", ttl: 64 },
          layer4: { proto: "TCP", srcPort: "49210", dstPort: "1883", flags: "PSH, ACK" },
          payload: "Mensaje MQTT en tránsito.",
          humanNote: "El medio físico de enlace es radiofrecuencia modulada OFDM."
        }
      },
      {
        id: 3,
        title: "Paso 3: Procesamiento en el Gateway IoT (Edge Computing)",
        summary: "El Gateway recibe el paquete, valida el mensaje y aplica traducción/seguridad",
        explanation: "El Gateway IoT extrae el payload MQTT local (puerto 1883). Realiza agregación local de datos, cifra la carga útil utilizando TLS 1.3 con certificados X.509 y prepara la conexión hacia el broker en la nube (puerto seguro MQTTS 8883).",
        fromDevice: "gateway_iot",
        toDevice: "gateway_iot",
        packet: {
          type: "Conversión de Seguridad & NAT",
          layer2: { type: "Enrutamiento Interno", srcMac: "-", dstMac: "-", etherType: "-" },
          layer3: { proto: "NAT/PAT", srcIp: "10.0.5.21 -> 190.85.40.12", dstIp: "3.220.14.88", ttl: 64 },
          layer4: { proto: "TCP / TLS 1.3", srcPort: "61005", dstPort: "8883", flags: "SECURE_WRAP" },
          payload: "Encapsulado en canal seguro TLS (Transport Layer Security) con cifrado AES-256-GCM.",
          humanNote: "La pasarela IoT protege los sensores de campo que no tienen poder de cómputo para cifrar TLS."
        }
      },
      {
        id: 4,
        title: "Paso 4: Envío por Enlace WAN hacia el Broker Cloud",
        summary: "La telemetría cifrada sale a Internet hacia el clúster de AWS IoT",
        explanation: "El Gateway enruta el paquete por su interfaz WAN de fibra óptica hacia el router del ISP, atravesando múltiples sistemas autónomos en Internet hasta llegar al centro de datos de la nube.",
        fromDevice: "gateway_iot",
        toDevice: "broker_cloud",
        packet: {
          type: "MQTTS sobre WAN Pública",
          layer2: { type: "Ethernet Fibra", srcMac: "00:0B:AB:44:55:66", dstMac: "CC:46:D6:77:88:99", etherType: "0x0800" },
          layer3: { proto: "TCP (6)", srcIp: "190.85.40.12", dstIp: "3.220.14.88", ttl: 53 },
          layer4: { proto: "TCP / TLS", srcPort: "61005", dstPort: "8883", flags: "PSH, ACK" },
          payload: "TLS Encrypted Application Data (MQTT Publish cifrado).",
          humanNote: "El paquete viaja seguro por Internet público gracias al túnel TLS gestionado por el Gateway."
        }
      },
      {
        id: 5,
        title: "Paso 5: Recepción y Publicación en Servidor Cloud",
        summary: "AWS IoT Core procesa el mensaje y confirma con MQTT PUBACK",
        explanation: "El servidor de la nube descifra el paquete con su llave privada, entrega la telemetría a la base de datos de series de tiempo y emite un paquete de confirmación MQTT PUBACK.",
        fromDevice: "broker_cloud",
        toDevice: "gateway_iot",
        packet: {
          type: "MQTT PUBACK (Confirmación)",
          layer2: { type: "Ethernet Fibra", srcMac: "CC:46:D6:77:88:99", dstMac: "00:0B:AB:44:55:66", etherType: "0x0800" },
          layer3: { proto: "TCP (6)", srcIp: "3.220.14.88", dstIp: "190.85.40.12", ttl: 56 },
          layer4: { proto: "TCP", srcPort: "8883", dstPort: "61005", flags: "ACK" },
          payload: "MQTT PUBACK: Message ID 0x0001 (Telemetría almacenada exitosamente).",
          humanNote: "La nube confirma la recepción garantizando entrega QOS 1."
        }
      },
      {
        id: 6,
        title: "Paso 6: Gateway confirma al Sensor IoT",
        summary: "El Gateway traduce el PUBACK y confirma al ESP32 cerrando la sesión",
        explanation: "El Gateway traduce la confirmación WAN hacia la red local de sensores. El ESP32 registra el envío exitoso y entra en modo de bajo consumo (Deep Sleep) durante 60 segundos para ahorrar energía.",
        fromDevice: "gateway_iot",
        toDevice: "sensor_iot",
        packet: {
          type: "Confirmación Local & Deep Sleep",
          layer2: { type: "802.11 Wi-Fi", srcMac: "00:0B:AB:44:55:66", dstMac: "44:17:93:11:22:33", etherType: "0x0800" },
          layer3: { proto: "TCP (6)", srcIp: "10.0.5.1", dstIp: "10.0.5.21", ttl: 64 },
          layer4: { proto: "TCP", srcPort: "1883", dstPort: "49210", flags: "ACK" },
          payload: "MQTT PUBACK entregado. Sensor entra en Deep Sleep.",
          humanNote: "Ciclo de telemetría IoT culminado exitosamente."
        }
      }
    ]
  }
};


const GW_ERROR_MODES = {
  none: {
    id: "none",
    name: "Operación Normal (Sin Fallas)",
    badge: "Estado Óptimo",
    color: "emerald"
  },
  err_gw_down: {
    id: "err_gw_down",
    name: "Falla 1: Gateway Predeterminado Apagado / Caído",
    badge: "Falla de Infraestructura",
    device: "gateway",
    whatHappened: "El host intenta comunicarse con una dirección fuera de su subred local (ej. 142.250.190.46), pero el Default Gateway (192.168.1.1) está apagado o sin enlace.",
    whyHappened: "Al enviar la consulta ARP en difusión ('Who has 192.168.1.1?'), ningún dispositivo responde. La tabla ARP no puede resolver la MAC del gateway.",
    detectedAt: "El sistema operativo del host agota el temporizador de resolución ARP (ARP Timeout) tras 3 reintentos.",
    diagnosticMsg: "Destination Host Unreachable / Transmit failed. General failure.",
    solution: "1. Verificar alimentación y luces de estado del Router/Gateway. 2. Comprobar que la IP del gateway sea correcta. 3. Probar conectividad con 'ping 192.168.1.1'."
  },
  err_cable: {
    id: "err_cable",
    name: "Falla 2: Cable de Red Desconectado (Falla Capa 1 Física)",
    badge: "Falla Capa Física L1",
    device: "laptop",
    whatHappened: "El cable Ethernet UTP está desconectado o cortado entre el host y el switch/router.",
    whyHappened: "La tarjeta de red (NIC) no detecta portadora eléctrica ni pulsos de enlace (Link Pulses / Fast Link Pulses).",
    detectedAt: "El controlador de red informa de inmediato el estado 'NO CARRIER' / 'Media Disconnected'.",
    diagnosticMsg: "Estado del adaptador: Cable de red desconectado (Link Down). No se pueden emitir tramas.",
    solution: "1. Verificar la conexión física RJ-45 en ambos extremos. 2. Comprobar que el LED del puerto encienda en verde/ámbar. 3. Reemplazar el cable de red si está dañado."
  },
  err_wifi: {
    id: "err_wifi",
    name: "Falla 3: Wi-Fi Desactivado / Fuera de Cobertura 802.11",
    badge: "Falla Inalámbrica RF",
    device: "laptop",
    whatHappened: "El dispositivo no puede asociarse con el Access Point debido a radio apagada o señal atenuada por debajo de la sensibilidad (-90 dBm).",
    whyHappened: "La tarjeta no recibe Beacons ni respuestas a los Probe Requests en los canales 2.4/5 GHz.",
    detectedAt: "Fallo en la fase de escaneo 802.11. El adaptador permanece en estado 'Desconectado'.",
    diagnosticMsg: "Wi-Fi: No hay redes disponibles / Error de asociación 802.11 (WLAN_STATUS_UNSPECIFIED_FAILURE).",
    solution: "1. Encender el interruptor Wi-Fi del portátil. 2. Acercarse al Access Point para mejorar la relación SNR. 3. Verificar que el SSID no esté oculto."
  },
  err_dns: {
    id: "err_dns",
    name: "Falla 4: Servidor DNS Caído / No Responde (UDP 53 Timeout)",
    badge: "Falla Capa Aplicación L7",
    device: "gateway",
    whatHappened: "El host tiene conectividad IP local y llega al Gateway, pero al consultar el nombre 'www.ejemplo.edu.co' a 8.8.8.8, no recibe respuesta.",
    whyHappened: "El servidor DNS configurado está caído, o el cortafuegos del Gateway bloquea el puerto UDP 53 hacia el exterior.",
    detectedAt: "El resolver DNS del sistema operativo genera un timeout tras no recibir respuesta en 2 segundos.",
    diagnosticMsg: "Error del navegador: DNS_PROBE_FINISHED_NXDOMAIN o DNS_PROBE_FINISHED_BAD_CONFIG. El ping a la IP funciona, pero por nombre no.",
    solution: "1. Cambiar el servidor DNS en las propiedades de red a uno funcional (ej. 1.1.1.1 o 8.8.8.8). 2. Probar con 'nslookup www.ejemplo.edu.co'. 3. Limpiar caché con 'ipconfig /flushdns'."
  },
  err_dhcp: {
    id: "err_dhcp",
    name: "Falla 5: Servidor DHCP No Responde (Asignación APIPA 169.254.x.x)",
    badge: "Falla de Configuración Dinámica",
    device: "gateway",
    whatHappened: "El host emite DHCP Discover pero el servicio DHCP en el Router está detenido o agotó su pool de direcciones IP.",
    whyHappened: "Al no recibir DHCP Offer en el tiempo límite, el cliente recurre al protocolo de autoasignación de enlace local APIPA.",
    detectedAt: "El host queda con una IP del rango 169.254.0.1 a 169.254.255.254 con máscara 255.255.0.0 y sin Gateway predeterminado.",
    diagnosticMsg: "Conectividad limitada o nula. Dirección IPv4 de configuración automática: 169.254.120.45. Puerta de enlace predeterminada: (en blanco).",
    solution: "1. Reiniciar el servicio DHCP en el Router. 2. Ampliar el rango de direcciones IP del pool. 3. O asignar una IP estática válida en el rango 192.168.1.0/24 con gateway 192.168.1.1."
  },
  err_wrong_gw: {
    id: "err_wrong_gw",
    name: "Falla 6: Gateway Predeterminado Incorrecto Configurado",
    badge: "Falla de Enrutamiento en Host",
    device: "laptop",
    whatHappened: "El host tiene configurada la IP 192.168.1.254 como gateway, pero esa dirección no existe en la red local (el router real es 192.168.1.1).",
    whyHappened: "Al intentar navegar a Internet, el host emite un ARP Request para 192.168.1.254. Como nadie responde, el tráfico hacia redes foráneas se descarta.",
    detectedAt: "El host puede hacer ping a los equipos de su misma red local (192.168.1.x), pero no puede salir a ninguna red exterior.",
    diagnosticMsg: "Fallo de enrutamiento: La red local responde, pero todo el tráfico externo da 'Request timed out' o 'Host unreachable'.",
    solution: "1. Ejecutar 'ipconfig' o 'route print' y verificar la puerta de enlace predeterminada. 2. Corregir el gateway en la configuración TCP/IPv4 colocando la IP real del router: 192.168.1.1."
  },
  err_port_closed: {
    id: "err_port_closed",
    name: "Falla 7: Puerto TCP Cerrado en Servidor (Rechazo con Bandera RST)",
    badge: "Falla de Servicio / Transporte L4",
    device: "server",
    whatHappened: "El host envía un segmento TCP SYN al puerto 443 del servidor, pero el servidor web tiene el servicio detenido.",
    whyHappened: "El kernel del servidor recibe el paquete en un puerto donde ningún socket está escuchando (LISTEN). Según el estándar RFC 793, responde con bandera RST-ACK.",
    detectedAt: "El cliente recibe el segmento TCP RST y aborta de inmediato la conexión.",
    diagnosticMsg: "Error: Conexión rechazada (Connection Refused / ERR_CONNECTION_REFUSED). El servidor está encendido pero el servicio web está apagado.",
    solution: "1. Iniciar el servicio web en el servidor ('systemctl start nginx'). 2. Verificar que el cortafuegos del servidor permita tráfico entrante en el puerto 443."
  },
  err_no_route: {
    id: "err_no_route",
    name: "Falla 8: Ruta Inexistente en Router (ICMP Network Unreachable)",
    badge: "Falla de Tabla de Enrutamiento L3",
    device: "gateway",
    whatHappened: "El router recibe un paquete para una red desconocida y no tiene configurada una ruta por defecto (default route 0.0.0.0/0).",
    whyHappened: "La tabla de enrutamiento del router carece de ruta hacia el destino y no sabe por cuál interfaz reenviar el paquete.",
    detectedAt: "El router descarta el paquete y devuelve al host emisor un mensaje ICMP Tipo 3 Código 0 (Destination Network Unreachable).",
    diagnosticMsg: "Respuesta desde 192.168.1.1: Red de destino inaccesible (ICMP Destination Network Unreachable).",
    solution: "1. Configurar en el router la ruta estática por defecto: 'ip route 0.0.0.0 0.0.0.0 [IP_ISP]'. 2. Verificar los protocolos de enrutamiento dinámico (OSPF/BGP)."
  }
};


const GW_ROLE_COMPARISON = {
  switch: {
    id: "switch",
    title: "Conmutador (Switch Capa 2)",
    badge: "Conmutador de Tramas MAC",
    color: "cyan",
    osiLayer: "Capa 2 (Enlace de Datos / Data Link)",
    addressing: "Direcciones MAC fisicas (48 bits / IEEE 802.3)",
    decisionUnit: "Tramas Ethernet (Frames)",
    modifiesData: "No altera la carga util. Recalcula el FCS (Frame Check Sequence) al conmutar.",
    collisionDomain: "Separa dominios de colision por cada puerto fisico (Microsegmentacion Full-Duplex).",
    broadcastDomain: "NO separa dominios de difusion. Una trama broadcast (FF:FF:FF:FF:FF:FF) se inunda a todos los puertos activos.",
    realHardware: "Cisco Catalyst 2960 / 9200, TP-Link JetStream, HP Aruba CX.",
    keyFunction: "Conecta dispositivos dentro de la MISMA subred local o VLAN. Construye dinamicamente su tabla CAM (MAC -> Puerto) inspeccionando la MAC origen de las tramas entrantes."
  },
  router: {
    id: "router",
    title: "Enrutador (Router Capa 3)",
    badge: "Enrutador Logico IP",
    color: "blue",
    osiLayer: "Capa 3 (Red / Network)",
    addressing: "Direcciones IP logicas (IPv4 / IPv6)",
    decisionUnit: "Paquetes IP (Packets)",
    modifiesData: "Reescribe encabezados L2 (nueva MAC origen y destino en cada salto) y decrementa el campo TTL en L3.",
    collisionDomain: "Separa dominios de colision en cada interfaz de red fisica.",
    broadcastDomain: "SI separa dominios de difusion. Bloquea el paso de paquetes broadcast de L2 y L3 de forma predeterminada.",
    realHardware: "Cisco ISR 4331, MikroTik RouterBOARD RB4011, Juniper MX Series.",
    keyFunction: "Interconecta DIFERENTES redes y subredes IP. Determina la mejor ruta hacia el destino consultando su tabla de enrutamiento (estatica o dinamica via OSPF/BGP)."
  },
  default_gateway: {
    id: "default_gateway",
    title: "Puerta de Enlace Predeterminada (Default Gateway IP)",
    badge: "Salto de Salida Perimetral",
    color: "purple",
    osiLayer: "Capa 3 / Capa 4 (Enrutamiento IP + NAT/PAT de Transporte)",
    addressing: "Direccion IP de la interfaz local del router (ej. 192.168.1.1)",
    decisionUnit: "Paquetes y Flujos de Transporte (Conexiones TCP/UDP)",
    modifiesData: "Reescribe MACs en L2 y traduce IPs y puertos de capa 3-4 al ejecutar NAT/PAT (Network Address Port Translation).",
    collisionDomain: "Aislado por interfaz de red.",
    broadcastDomain: "Actua como limite del dominio de difusion; los broadcasts de la LAN no salen de este punto.",
    realHardware: "Router perimetral corporativo, Firewall FortiGate, Gateway residencial GPON/CPE.",
    keyFunction: "Es la direccion IP configurada en los hosts locales como proximo salto obligado para enviar cualquier paquete destinado a una red foranea o a Internet."
  },
  protocol_gateway: {
    id: "protocol_gateway",
    title: "Pasarela de Protocolos (Protocol Gateway Capas 3 a 7)",
    badge: "Traductor de Arquitecturas",
    color: "amber",
    osiLayer: "Capas 3 a 7 (Red, Transporte, Sesion, Presentacion y Aplicacion)",
    addressing: "Mapeo de identificadores heterogeneos (Esclavos Seriales <-> Sockets IP; Telefonos E.164 <-> URIs SIP)",
    decisionUnit: "Mensajes de aplicacion, datagramas, registros industriales y tramas seriales",
    modifiesData: "SI. Desensambla la PDU, extrae la semantica, recodifica y vuelve a empaquetar en una pila de protocolos totalmente distinta.",
    collisionDomain: "Opera en medios fisicos completamente disimiles (RS-485 vs 100BASE-TX Ethernet).",
    broadcastDomain: "Aisla radicalmente las redes que interconecta; no existe propagacion de difusiones.",
    realHardware: "Advantech EKI-1221, Moxa MGate MB3180, Pasarelas VoIP Cisco VG Series.",
    keyFunction: "Permite la comunicacion entre sistemas que hablan idiomas y arquitecturas incompatibles, como enlazar buses industriales Modbus RTU seriales con sistemas SCADA Ethernet TCP/IP."
  },
  access_point: {
    id: "access_point",
    title: "Punto de Acceso Inalambrico (Access Point Capa 2 RF)",
    badge: "Puente RF 802.11 <-> 802.3",
    color: "emerald",
    osiLayer: "Capa 2 (Enlace de Datos) y Capa 1 (Radiofrecuencia)",
    addressing: "Direcciones MAC (Conversion de tramas 802.11 Wi-Fi a tramas 802.3 Ethernet cableado)",
    decisionUnit: "Tramas Inalambricas y Tramas Ethernet",
    modifiesData: "Traduce la encapsulacion de trama de radio a trama cableada sin modificar el paquete IP ni su carga util.",
    collisionDomain: "El medio aereo es un medio compartido semi-duplex (Half-Duplex) gobernado por CSMA/CA.",
    broadcastDomain: "NO separa dominios de difusion. Transmite los paquetes broadcast entre el medio aereo y el medio cableado.",
    realHardware: "Ubiquiti UniFi U6-Pro, Cisco Catalyst 9100 AP, Aruba AP-555.",
    keyFunction: "Puente transparente que interconecta clientes moviles inalambricos (laptops, smartphones) a la infraestructura de red cableada local."
  }
};

class GatewaySimulator {
  constructor() {
    this.scenarioId = "laptop_wifi";
    this.errorMode = "none";
    this.currentStep = 0;
    this.isPlaying = false;
    this.playTimer = null;
    this.speed = 1.0;
    this.selectedRole = "default_gateway";

    // Canvas & Animation
    this.canvas = document.getElementById("gwTopologyCanvas");
    this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
    this.animProgress = 0.0;
    this.animDirection = 1;
    this.animFrameId = null;
    this.devicePositions = {};
    this.hoveredDevice = null;

    this.init();
  }

  init() {
    this.setupCanvas();
    this.bindEvents();
    this.renderUI();
    this.startAnimLoop();
  }

  setupCanvas() {
    if (!this.canvas) return;
    const container = this.canvas.parentElement;
    const width = container ? Math.max(760, container.clientWidth - 16) : 900;
    const height = 300;

    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = width + "px";
    this.canvas.style.height = height + "px";

    if (this.ctx) {
      this.ctx.scale(dpr, dpr);
    }
    this.calcDevicePositions(width, height);
  }

  calcDevicePositions(width, height) {
    const scenario = GW_SCENARIOS[this.scenarioId];
    if (!scenario || !scenario.devices) return;

    this.devicePositions = {};
    const n = scenario.devices.length;
    const paddingX = Math.min(90, width / (n + 1));
    const availWidth = width - (paddingX * 2);
    const stepX = n > 1 ? availWidth / (n - 1) : availWidth / 2;
    const centerY = height / 2;

    scenario.devices.forEach((dev, idx) => {
      this.devicePositions[dev.id] = {
        x: paddingX + (stepX * idx),
        y: centerY,
        radius: 34,
        dev: dev
      };
    });
  }

  bindEvents() {
    window.addEventListener("resize", () => {
      this.setupCanvas();
    });

    const scnSelect = document.getElementById("gwScenarioSelect");
    if (scnSelect) {
      scnSelect.addEventListener("change", (e) => {
        this.changeScenario(e.target.value);
      });
    }

    const errSelect = document.getElementById("gwErrorSelect");
    if (errSelect) {
      errSelect.addEventListener("change", (e) => {
        this.changeError(e.target.value);
      });
    }

    const btnStart = document.getElementById("btnGwStart");
    if (btnStart) {
      btnStart.addEventListener("click", () => this.toggleAutoPlay());
    }

    const btnNext = document.getElementById("btnGwNext");
    if (btnNext) {
      btnNext.addEventListener("click", () => this.nextStep());
    }

    const btnPrev = document.getElementById("btnGwPrev");
    if (btnPrev) {
      btnPrev.addEventListener("click", () => this.prevStep());
    }

    const btnReset = document.getElementById("btnGwReset");
    if (btnReset) {
      btnReset.addEventListener("click", () => this.resetSimulation());
    }

    const speedSelect = document.getElementById("gwSpeedSelect");
    if (speedSelect) {
      speedSelect.addEventListener("change", (e) => {
        this.speed = parseFloat(e.target.value) || 1.0;
      });
    }

    const btnInspect = document.getElementById("btnGwInspectPacket");
    if (btnInspect) {
      btnInspect.addEventListener("click", () => this.openPacketModal());
    }

    const closePacket = document.getElementById("closeGwModal");
    if (closePacket) {
      closePacket.addEventListener("click", () => this.closePacketModal());
    }

    const closeDev = document.getElementById("closeGwDevModal");
    if (closeDev) {
      closeDev.addEventListener("click", () => this.closeDevModal());
    }

    // Modal background clicks
    const pModal = document.getElementById("gwPacketModal");
    if (pModal) {
      pModal.addEventListener("click", (e) => {
        if (e.target === pModal) this.closePacketModal();
      });
    }

    const dModal = document.getElementById("gwDevModal");
    if (dModal) {
      dModal.addEventListener("click", (e) => {
        if (e.target === dModal) this.closeDevModal();
      });
    }

    // Canvas interactivity: mousemove and click
    if (this.canvas) {
      this.canvas.addEventListener("mousemove", (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        let hit = null;
        for (const id in this.devicePositions) {
          const pos = this.devicePositions[id];
          const dist = Math.hypot(mouseX - pos.x, mouseY - pos.y);
          if (dist <= pos.radius + 6) {
            hit = pos.dev;
            break;
          }
        }

        this.hoveredDevice = hit;
        this.canvas.style.cursor = hit ? "pointer" : "default";
      });

      this.canvas.addEventListener("click", (e) => {
        if (this.hoveredDevice) {
          this.openDeviceModal(this.hoveredDevice.id);
        }
      });
    }

    // Role comparison selector buttons
    document.querySelectorAll(".gw-role-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const role = btn.getAttribute("data-role");
        this.selectRoleComparison(role);
      });
    });
  }

  changeScenario(scenarioId) {
    if (!GW_SCENARIOS[scenarioId]) return;
    this.scenarioId = scenarioId;
    this.currentStep = 0;
    this.pause();
    this.setupCanvas();
    this.renderUI();
  }

  changeError(errId) {
    this.errorMode = errId || "none";
    this.renderUI();
  }

  toggleAutoPlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    this.isPlaying = true;
    const btnStart = document.getElementById("btnGwStart");
    if (btnStart) {
      btnStart.textContent = "Pausar Animacion";
      btnStart.className = "px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded font-medium text-xs transition";
    }

    const stepDelay = Math.max(1000, 3200 / this.speed);
    if (this.playTimer) clearInterval(this.playTimer);
    this.playTimer = setInterval(() => {
      const scenario = GW_SCENARIOS[this.scenarioId];
      if (!scenario || !scenario.steps) return;
      if (this.currentStep < scenario.steps.length - 1) {
        this.nextStep();
      } else {
        this.pause();
      }
    }, stepDelay);
  }

  pause() {
    this.isPlaying = false;
    if (this.playTimer) {
      clearInterval(this.playTimer);
      this.playTimer = null;
    }
    const btnStart = document.getElementById("btnGwStart");
    if (btnStart) {
      btnStart.textContent = "Iniciar Animacion";
      btnStart.className = "px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-medium text-xs transition";
    }
  }

  nextStep() {
    const scenario = GW_SCENARIOS[this.scenarioId];
    if (!scenario || !scenario.steps) return;
    if (this.currentStep < scenario.steps.length - 1) {
      this.currentStep++;
      this.animProgress = 0.0;
      this.renderUI();
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.animProgress = 0.0;
      this.renderUI();
    }
  }

  resetSimulation() {
    this.pause();
    this.currentStep = 0;
    this.animProgress = 0.0;
    this.renderUI();
  }

  selectRoleComparison(roleKey) {
    if (!GW_ROLE_COMPARISON[roleKey]) return;
    this.selectedRole = roleKey;
    document.querySelectorAll(".gw-role-btn").forEach((btn) => {
      const isSelected = btn.getAttribute("data-role") === roleKey;
      btn.className = isSelected
        ? "gw-role-btn px-3 py-1.5 rounded text-xs font-semibold bg-purple-600 text-white shadow-md shadow-purple-900/50 transition"
        : "gw-role-btn px-3 py-1.5 rounded text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition";
    });
    this.renderRoleCard();
  }

  renderRoleCard() {
    const data = GW_ROLE_COMPARISON[this.selectedRole];
    const container = document.getElementById("gwRoleDetails");
    if (!container || !data) return;

    container.innerHTML = `
      <div class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <span class="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold">${data.badge}</span>
            <h4 class="text-sm sm:text-base font-bold text-white mt-0.5">${data.title}</h4>
          </div>
          <span class="px-2.5 py-1 rounded bg-slate-800 text-xs font-mono text-cyan-300 border border-slate-700">${data.osiLayer}</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div class="bg-slate-900/70 p-3 rounded-lg border border-slate-800/80">
            <span class="text-[10px] font-mono text-slate-400 uppercase block mb-1">Criterio de Decision</span>
            <p class="font-semibold text-slate-200">${data.addressing}</p>
          </div>
          <div class="bg-slate-900/70 p-3 rounded-lg border border-slate-800/80">
            <span class="text-[10px] font-mono text-slate-400 uppercase block mb-1">Unidad de Datos</span>
            <p class="font-semibold text-slate-200">${data.decisionUnit}</p>
          </div>
          <div class="bg-slate-900/70 p-3 rounded-lg border border-slate-800/80">
            <span class="text-[10px] font-mono text-slate-400 uppercase block mb-1">Modificacion de Datos</span>
            <p class="font-semibold text-slate-200">${data.modifiesData}</p>
          </div>
          <div class="bg-slate-900/70 p-3 rounded-lg border border-slate-800/80">
            <span class="text-[10px] font-mono text-slate-400 uppercase block mb-1">Dominio de Colision</span>
            <p class="font-semibold text-slate-200">${data.collisionDomain}</p>
          </div>
          <div class="bg-slate-900/70 p-3 rounded-lg border border-slate-800/80">
            <span class="text-[10px] font-mono text-slate-400 uppercase block mb-1">Dominio de Difusion</span>
            <p class="font-semibold text-slate-200">${data.broadcastDomain}</p>
          </div>
          <div class="bg-slate-900/70 p-3 rounded-lg border border-slate-800/80">
            <span class="text-[10px] font-mono text-slate-400 uppercase block mb-1">Ejemplos de Equipos Reales</span>
            <p class="font-semibold text-cyan-300 font-mono text-[11px]">${data.realHardware}</p>
          </div>
        </div>

        <div class="bg-purple-950/30 border border-purple-800/50 rounded-lg p-3 text-xs text-purple-200 leading-relaxed">
          <span class="font-bold text-purple-300 font-mono block mb-0.5">[FUNCION CLAVE EN RED]:</span>
          ${data.keyFunction}
        </div>
      </div>
    `;
  }

  renderUI() {
    const scenario = GW_SCENARIOS[this.scenarioId];
    if (!scenario) return;

    // Header info
    const badgeEl = document.getElementById("gwScenarioBadge");
    if (badgeEl) badgeEl.textContent = scenario.badge;
    const descEl = document.getElementById("gwScenarioDesc");
    if (descEl) descEl.textContent = scenario.desc;

    // Steps
    const totalSteps = scenario.steps.length;
    const currentStepObj = scenario.steps[this.currentStep];

    const stepBadge = document.getElementById("gwStepBadge");
    if (stepBadge) {
      stepBadge.textContent = `Paso ${this.currentStep + 1} de ${totalSteps}`;
    }

    const stepLabel = document.getElementById("gwStepLabel");
    if (stepLabel) {
      stepLabel.textContent = currentStepObj.title;
    }

    const stepDesc = document.getElementById("gwStepDesc");
    if (stepDesc) {
      stepDesc.textContent = currentStepObj.summary;
    }

    // Progress bar
    const progBar = document.getElementById("gwProgressBar");
    if (progBar) {
      const pct = totalSteps > 1 ? ((this.currentStep) / (totalSteps - 1)) * 100 : 100;
      progBar.style.width = pct + "%";
    }

    // Explanation Box
    const explBox = document.getElementById("gwExplanationBox");
    if (explBox) {
      explBox.innerHTML = `
        <div class="space-y-3">
          <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
            <div class="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <span class="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">[ANALISIS DEL PASO ACTUAL]</span>
              <span class="text-[11px] font-mono text-slate-400">Origen: <strong class="text-slate-200">${currentStepObj.fromDevice}</strong> &rarr; Destino: <strong class="text-slate-200">${currentStepObj.toDevice}</strong></span>
            </div>
            <p class="text-xs text-slate-200 leading-relaxed font-sans">${currentStepObj.explanation}</p>
          </div>

          <div class="bg-gradient-to-r from-cyan-950/40 to-slate-900/90 border-l-4 border-cyan-500 p-3.5 rounded-r-xl space-y-1">
            <span class="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">[EXPLICACIÓN SENCILLA]:</span>
            <p class="text-xs text-slate-300 italic font-sans leading-relaxed">
              "${currentStepObj.packet ? currentStepObj.packet.humanNote : currentStepObj.summary}"
            </p>
          </div>
        </div>
      `;
    }

    // Packet preview strip
    const pktBadge = document.getElementById("gwPacketSummary");
    if (pktBadge && currentStepObj.packet) {
      const pkt = currentStepObj.packet;
      pktBadge.innerHTML = `
        <span class="font-mono text-cyan-300 font-bold">[${pkt.type}]</span>
        <span class="text-slate-400 mx-1">|</span>
        <span class="font-mono text-slate-300">L2: ${pkt.layer2.type} (${pkt.layer2.srcMac} &rarr; ${pkt.layer2.dstMac})</span>
        <span class="text-slate-400 mx-1">|</span>
        <span class="font-mono text-slate-300">L3: ${pkt.layer3.proto} (${pkt.layer3.srcIp} &rarr; ${pkt.layer3.dstIp})</span>
        <span class="text-slate-400 mx-1">|</span>
        <span class="font-mono text-slate-300">L4: ${pkt.layer4.proto} (${pkt.layer4.srcPort} &rarr; ${pkt.layer4.dstPort})</span>
      `;
    }

    // Render quick devices bar
    this.renderQuickDeviceBar();

    // Render Error Banner if active
    this.renderErrorBanner();

    // Render Role comparison card
    this.renderRoleCard();
  }

  renderQuickDeviceBar() {
    const container = document.getElementById("gwQuickDevices");
    if (!container) return;
    const scenario = GW_SCENARIOS[this.scenarioId];
    if (!scenario || !scenario.devices) return;

    let html = "";
    scenario.devices.forEach((dev) => {
      const isErr = this.isDeviceFaulty(dev.id);
      const errBadge = isErr ? '<span class="ml-1 text-[9px] text-red-400 font-bold">[FALLA]</span>' : '';
      const borderClass = isErr ? 'border-red-500 bg-red-950/40 text-red-300' : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-cyan-500 hover:text-white';

      html += `
        <button onclick="window.gwSim.openDeviceModal('${dev.id}')" class="px-2.5 py-1 rounded border text-[11px] font-mono transition flex items-center gap-1.5 ${borderClass}">
          <span>[${dev.name}]</span>
          ${errBadge}
        </button>
      `;
    });
    container.innerHTML = html;
  }

  renderErrorBanner() {
    const banner = document.getElementById("gwErrorBanner");
    if (!banner) return;

    if (this.errorMode === "none") {
      banner.className = "hidden";
      banner.innerHTML = "";
      return;
    }

    const err = GW_ERROR_MODES[this.errorMode];
    if (!err) {
      banner.className = "hidden";
      return;
    }

    banner.className = "bg-red-950/50 border border-red-800/80 rounded-xl p-4 space-y-3 shadow-lg shadow-red-950/30";
    banner.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-red-800/50 pb-2">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded bg-red-900 text-red-200 text-[10px] font-mono font-bold">[DIAGNOSTICO DE FALLA ACTIVA]</span>
          <h4 class="text-xs sm:text-sm font-bold text-white">${err.name}</h4>
        </div>
        <span class="text-[10px] font-mono text-red-300 bg-red-900/60 px-2 py-0.5 rounded border border-red-700/60">${err.badge}</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div class="bg-slate-900/80 p-3 rounded-lg border border-red-900/40 space-y-1">
          <span class="text-[10px] font-mono text-red-400 font-bold block">[QUE OCURRIO]:</span>
          <p class="text-slate-300">${err.whatHappened}</p>
        </div>
        <div class="bg-slate-900/80 p-3 rounded-lg border border-red-900/40 space-y-1">
          <span class="text-[10px] font-mono text-red-400 font-bold block">[POR QUE OCURRIO]:</span>
          <p class="text-slate-300">${err.whyHappened}</p>
        </div>
        <div class="bg-slate-900/80 p-3 rounded-lg border border-red-900/40 space-y-1">
          <span class="text-[10px] font-mono text-amber-400 font-bold block">[COMO SE DETECTA]:</span>
          <p class="text-slate-300">${err.detectedAt} <br><code class="text-amber-300 font-mono text-[11px] block mt-1">${err.diagnosticMsg}</code></p>
        </div>
        <div class="bg-slate-900/80 p-3 rounded-lg border border-emerald-900/40 space-y-1">
          <span class="text-[10px] font-mono text-emerald-400 font-bold block">[COMO SE SOLUCIONA (ACCION TECNICA)]:</span>
          <p class="text-emerald-200 font-semibold">${err.solution}</p>
        </div>
      </div>
    `;
  }

  isDeviceFaulty(devId) {
    if (this.errorMode === "none") return false;
    const err = GW_ERROR_MODES[this.errorMode];
    if (!err) return false;
    if (err.device && err.device === devId) return true;
    if (this.errorMode === "err_cable" && devId.includes("laptop") || devId.includes("pc")) return true;
    if (this.errorMode === "err_wifi" && (devId.includes("laptop") || devId.includes("phone"))) return true;
    if ((this.errorMode === "err_gw_down" || this.errorMode === "err_wrong_gw") && (devId.includes("gw") || devId.includes("router"))) return true;
    if (this.errorMode === "err_port_closed" && (devId.includes("server") || devId.includes("scada"))) return true;
    return false;
  }

  openDeviceModal(deviceId) {
    const scenario = GW_SCENARIOS[this.scenarioId];
    if (!scenario || !scenario.devices) return;
    const dev = scenario.devices.find(d => d.id === deviceId);
    if (!dev) return;

    const modal = document.getElementById("gwDevModal");
    const content = document.getElementById("gwDevModalContent");
    const title = document.getElementById("gwDevModalTitle");
    if (!modal || !content) return;

    if (title) title.textContent = `[INSPECCION DE DISPOSITIVO]: ${dev.name}`;

    const isErr = this.isDeviceFaulty(dev.id);
    const statusColor = isErr ? "text-red-400 bg-red-950/60 border-red-800" : "text-emerald-400 bg-emerald-950/60 border-emerald-800";
    const statusText = isErr ? "ESTADO: ANOMALIA / FALLA INYECTADA" : `ESTADO: ${dev.status || "Operacional"}`;

    let arpRows = "";
    if (dev.arpTable && dev.arpTable.length > 0) {
      dev.arpTable.forEach(row => {
        arpRows += `
          <tr class="border-b border-slate-800/60">
            <td class="py-1.5 px-2 font-mono text-cyan-300">${row.ip}</td>
            <td class="py-1.5 px-2 font-mono text-slate-300">${row.mac}</td>
            <td class="py-1.5 px-2 font-mono text-slate-400">${row.iface || "eth0"}</td>
            <td class="py-1.5 px-2 text-slate-400">${row.type || "Dinamico"}</td>
          </tr>
        `;
      });
    } else {
      arpRows = `<tr><td colspan="4" class="py-2 text-center text-slate-500 font-mono text-[11px]">(Tabla ARP sin entradas o no aplicable)</td></tr>`;
    }

    let routeRows = "";
    if (dev.routingTable && dev.routingTable.length > 0) {
      dev.routingTable.forEach(row => {
        routeRows += `
          <tr class="border-b border-slate-800/60">
            <td class="py-1.5 px-2 font-mono text-cyan-300">${row.dest}</td>
            <td class="py-1.5 px-2 font-mono text-slate-300">${row.gw}</td>
            <td class="py-1.5 px-2 font-mono text-slate-400">${row.iface}</td>
            <td class="py-1.5 px-2 font-mono text-slate-400">${row.metric}</td>
          </tr>
        `;
      });
    } else {
      routeRows = `<tr><td colspan="4" class="py-2 text-center text-slate-500 font-mono text-[11px]">(Tabla de enrutamiento estandar de host local)</td></tr>`;
    }

    let natSection = "";
    if (dev.natTable && dev.natTable.length > 0) {
      let natRows = "";
      dev.natTable.forEach(n => {
        natRows += `
          <tr class="border-b border-slate-800/60">
            <td class="py-1.5 px-2 font-mono text-purple-300">${n.insideLocal}</td>
            <td class="py-1.5 px-2 font-mono text-cyan-300">${n.insideGlobal}</td>
            <td class="py-1.5 px-2 font-mono text-slate-300">${n.outsideGlobal}</td>
            <td class="py-1.5 px-2 font-mono text-amber-300">${n.proto}</td>
          </tr>
        `;
      });
      natSection = `
        <div class="bg-slate-900/90 rounded-xl p-3.5 border border-purple-800/50 space-y-2">
          <div class="flex items-center justify-between border-b border-purple-900/60 pb-1.5">
            <span class="text-xs font-mono font-bold text-purple-300 uppercase">[TABLA DE TRADUCCION NAT / PAT]</span>
            <span class="text-[10px] font-mono text-slate-400">Traduccion Dinamica de Puertos</span>
          </div>
          <table class="w-full text-[11px] text-left">
            <thead>
              <tr class="text-slate-400 border-b border-slate-800 font-mono">
                <th class="py-1 px-2">Inside Local (IP:Port Privada)</th>
                <th class="py-1 px-2">Inside Global (IP:Port Publica)</th>
                <th class="py-1 px-2">Outside Global (Servidor)</th>
                <th class="py-1 px-2">Protocolo</th>
              </tr>
            </thead>
            <tbody>${natRows}</tbody>
          </table>
        </div>
      `;
    }

    let socketRows = "";
    if (dev.sockets && dev.sockets.length > 0) {
      dev.sockets.forEach(s => {
        socketRows += `
          <tr class="border-b border-slate-800/60">
            <td class="py-1.5 px-2 font-mono text-amber-300">${s.proto}</td>
            <td class="py-1.5 px-2 font-mono text-slate-200">${s.local}</td>
            <td class="py-1.5 px-2 font-mono text-slate-400">${s.remote}</td>
            <td class="py-1.5 px-2 font-mono text-cyan-300 font-bold">${s.state}</td>
          </tr>
        `;
      });
    } else {
      socketRows = `<tr><td colspan="4" class="py-2 text-center text-slate-500 font-mono text-[11px]">(Sin sockets activos)</td></tr>`;
    }

    let registersSection = "";
    if (dev.registers && dev.registers.length > 0) {
      let regRows = "";
      dev.registers.forEach(r => {
        regRows += `
          <tr class="border-b border-slate-800/60">
            <td class="py-1.5 px-2 font-mono text-amber-300">${r.reg}</td>
            <td class="py-1.5 px-2 font-semibold text-slate-200">${r.name}</td>
            <td class="py-1.5 px-2 font-mono text-cyan-300 font-bold">${r.val}</td>
          </tr>
        `;
      });
      registersSection = `
        <div class="bg-slate-900/90 rounded-xl p-3.5 border border-amber-800/50 space-y-2">
          <div class="flex items-center justify-between border-b border-amber-900/60 pb-1.5">
            <span class="text-xs font-mono font-bold text-amber-300 uppercase">[REGISTROS DE MEMORIA MODBUS / INDUSTRIAL]</span>
            <span class="text-[10px] font-mono text-slate-400">Holding Registers (4xxxx)</span>
          </div>
          <table class="w-full text-[11px] text-left">
            <thead>
              <tr class="text-slate-400 border-b border-slate-800 font-mono">
                <th class="py-1 px-2">Registro</th>
                <th class="py-1 px-2">Parametro Fisico</th>
                <th class="py-1 px-2">Valor Actual</th>
              </tr>
            </thead>
            <tbody>${regRows}</tbody>
          </table>
        </div>
      `;
    }

    content.innerHTML = `
      <div class="space-y-4">
        <!-- Device Top Card -->
        <div class="flex flex-wrap items-center justify-between gap-2 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <div>
            <h3 class="text-sm sm:text-base font-bold text-white">${dev.name}</h3>
            <p class="text-xs text-slate-400 font-mono">Medio de Enlace: <span class="text-cyan-300">${dev.medium || "Ethernet"}</span></p>
          </div>
          <span class="px-2.5 py-1 rounded text-xs font-mono border ${statusColor}">${statusText}</span>
        </div>

        <!-- IP & Hardware Configuration -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div class="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono">
            <span class="text-[10px] text-slate-500 uppercase block">Direccion IP</span>
            <span class="text-cyan-400 font-bold">${dev.ip}</span>
          </div>
          <div class="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono">
            <span class="text-[10px] text-slate-500 uppercase block">Mascara de Subred</span>
            <span class="text-slate-300">${dev.mask}</span>
          </div>
          <div class="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono">
            <span class="text-[10px] text-slate-500 uppercase block">Puerta de Enlace (GW)</span>
            <span class="text-purple-300 font-semibold">${dev.gateway}</span>
          </div>
          <div class="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono">
            <span class="text-[10px] text-slate-500 uppercase block">Direccion MAC (L2)</span>
            <span class="text-slate-300">${dev.mac}</span>
          </div>
        </div>

        <!-- ARP Table -->
        <div class="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 space-y-2">
          <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span class="text-xs font-mono font-bold text-cyan-400 uppercase">[TABLA ARP (Address Resolution Protocol)]</span>
            <span class="text-[10px] font-mono text-slate-400">Resolucion IP &rarr; MAC en Capa 2</span>
          </div>
          <table class="w-full text-[11px] text-left">
            <thead>
              <tr class="text-slate-400 border-b border-slate-800 font-mono">
                <th class="py-1 px-2">Direccion IP</th>
                <th class="py-1 px-2">Direccion Fisica (MAC)</th>
                <th class="py-1 px-2">Interfaz</th>
                <th class="py-1 px-2">Tipo</th>
              </tr>
            </thead>
            <tbody>${arpRows}</tbody>
          </table>
        </div>

        ${natSection}

        <!-- Routing Table -->
        <div class="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 space-y-2">
          <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span class="text-xs font-mono font-bold text-emerald-400 uppercase">[TABLA DE ENRUTAMIENTO (IP Routing)]</span>
            <span class="text-[10px] font-mono text-slate-400">Decision de Salto en Capa 3</span>
          </div>
          <table class="w-full text-[11px] text-left">
            <thead>
              <tr class="text-slate-400 border-b border-slate-800 font-mono">
                <th class="py-1 px-2">Destino</th>
                <th class="py-1 px-2">Gateway (Salto)</th>
                <th class="py-1 px-2">Interfaz</th>
                <th class="py-1 px-2">Metrica</th>
              </tr>
            </thead>
            <tbody>${routeRows}</tbody>
          </table>
        </div>

        <!-- Sockets Table -->
        <div class="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 space-y-2">
          <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span class="text-xs font-mono font-bold text-amber-400 uppercase">[SOCKETS ACTIVOS Y PUERTOS DE TRANSPORTE (L4)]</span>
            <span class="text-[10px] font-mono text-slate-400">netstat -an</span>
          </div>
          <table class="w-full text-[11px] text-left">
            <thead>
              <tr class="text-slate-400 border-b border-slate-800 font-mono">
                <th class="py-1 px-2">Proto</th>
                <th class="py-1 px-2">Direccion Local</th>
                <th class="py-1 px-2">Direccion Remota</th>
                <th class="py-1 px-2">Estado</th>
              </tr>
            </thead>
            <tbody>${socketRows}</tbody>
          </table>
        </div>

        ${registersSection}
      </div>
    `;

    modal.classList.remove("hidden");
  }

  closeDevModal() {
    const modal = document.getElementById("gwDevModal");
    if (modal) modal.classList.add("hidden");
  }

  openPacketModal() {
    const scenario = GW_SCENARIOS[this.scenarioId];
    if (!scenario || !scenario.steps) return;
    const step = scenario.steps[this.currentStep];
    if (!step || !step.packet) return;

    const modal = document.getElementById("gwPacketModal");
    const content = document.getElementById("gwModalContent");
    const title = document.getElementById("gwModalTitle");
    if (!modal || !content) return;

    const p = step.packet;
    if (title) title.textContent = `[ANALIZADOR DE TRAMAS]: ${step.title}`;

    content.innerHTML = `
      <div class="space-y-4 text-xs font-sans">
        <!-- Human summary -->
        <div class="bg-cyan-950/40 border border-cyan-800/60 p-3 rounded-lg text-cyan-200">
          <span class="font-bold text-cyan-300 font-mono block mb-1">[SIGNIFICADO EN LA RED]:</span>
          <p class="italic leading-relaxed">${p.humanNote || step.summary}</p>
        </div>

        <!-- Layer 2 -->
        <div class="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
          <div class="flex items-center justify-between border-b border-slate-800/80 pb-1">
            <span class="font-mono font-bold text-cyan-400 uppercase">[CAPA 2 - ENLACE DE DATOS (Data Link)]</span>
            <span class="font-mono text-[10px] text-slate-400">${p.layer2.type}</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px] pt-1">
            <div><span class="text-slate-500 block text-[10px]">MAC ORIGEN:</span><span class="text-slate-200">${p.layer2.srcMac}</span></div>
            <div><span class="text-slate-500 block text-[10px]">MAC DESTINO:</span><span class="text-slate-200">${p.layer2.dstMac}</span></div>
            <div><span class="text-slate-500 block text-[10px]">ETHERTYPE / PROTO:</span><span class="text-cyan-300">${p.layer2.etherType}</span></div>
          </div>
        </div>

        <!-- Layer 3 -->
        <div class="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
          <div class="flex items-center justify-between border-b border-slate-800/80 pb-1">
            <span class="font-mono font-bold text-emerald-400 uppercase">[CAPA 3 - RED (Network)]</span>
            <span class="font-mono text-[10px] text-slate-400">Protocolo L3: ${p.layer3.proto}</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px] pt-1">
            <div><span class="text-slate-500 block text-[10px]">IP ORIGEN:</span><span class="text-slate-200">${p.layer3.srcIp}</span></div>
            <div><span class="text-slate-500 block text-[10px]">IP DESTINO:</span><span class="text-slate-200">${p.layer3.dstIp}</span></div>
            <div><span class="text-slate-500 block text-[10px]">TTL (TIME TO LIVE):</span><span class="text-emerald-300">${p.layer3.ttl}</span></div>
          </div>
        </div>

        <!-- Layer 4 -->
        <div class="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
          <div class="flex items-center justify-between border-b border-slate-800/80 pb-1">
            <span class="font-mono font-bold text-amber-400 uppercase">[CAPA 4 - TRANSPORTE (Transport)]</span>
            <span class="font-mono text-[10px] text-slate-400">${p.layer4.proto}</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px] pt-1">
            <div><span class="text-slate-500 block text-[10px]">PUERTO ORIGEN:</span><span class="text-slate-200">${p.layer4.srcPort}</span></div>
            <div><span class="text-slate-500 block text-[10px]">PUERTO DESTINO:</span><span class="text-slate-200">${p.layer4.dstPort}</span></div>
            <div><span class="text-slate-500 block text-[10px]">BANDERAS / FLAGS:</span><span class="text-amber-300 font-bold">${p.layer4.flags}</span></div>
          </div>
        </div>

        <!-- Layer 7 / Payload -->
        <div class="bg-slate-950 p-3 rounded-lg border border-purple-800/60 space-y-1.5">
          <div class="flex items-center justify-between border-b border-purple-900/80 pb-1">
            <span class="font-mono font-bold text-purple-300 uppercase">[CAPA 7 - APLICACION / CARGA UTIL (Payload)]</span>
            <span class="font-mono text-[10px] text-purple-400">Datos Puros</span>
          </div>
          <pre class="bg-slate-900 p-2 rounded text-[11px] font-mono text-purple-200 overflow-x-auto whitespace-pre-wrap">${p.payload}</pre>
        </div>
      </div>
    `;

    modal.classList.remove("hidden");
  }

  closePacketModal() {
    const modal = document.getElementById("gwPacketModal");
    if (modal) modal.classList.add("hidden");
  }

  startAnimLoop() {
    const render = () => {
      this.drawCanvas();

      // Step progression animation
      this.animProgress += 0.012 * this.speed;
      if (this.animProgress > 1.0) {
        this.animProgress = 0.0;
      }

      this.animFrameId = requestAnimationFrame(render);
    };
    this.animFrameId = requestAnimationFrame(render);
  }

  drawCanvas() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const width = parseFloat(this.canvas.style.width) || this.canvas.width;
    const height = parseFloat(this.canvas.style.height) || this.canvas.height;

    // Clear background
    ctx.fillStyle = "#030712";
    ctx.fillRect(0, 0, width, height);

    // Subtle background tech grid
    ctx.strokeStyle = "rgba(30, 41, 59, 0.35)";
    ctx.lineWidth = 1;
    const gridSize = 24;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const scenario = GW_SCENARIOS[this.scenarioId];
    if (!scenario || !scenario.devices) return;
    const devices = scenario.devices;

    // Draw Links
    for (let i = 0; i < devices.length - 1; i++) {
      const p1 = this.devicePositions[devices[i].id];
      const p2 = this.devicePositions[devices[i + 1].id];
      if (p1 && p2) {
        this.drawLink(p1, p2, devices[i], devices[i + 1]);
      }
    }

    // Draw Packet in transit
    this.drawPacket(scenario);

    // Draw Device Nodes
    devices.forEach((dev) => {
      const pos = this.devicePositions[dev.id];
      if (pos) {
        this.drawDeviceNode(dev, pos);
      }
    });
  }

  drawLink(p1, p2, dev1, dev2) {
    const ctx = this.ctx;
    ctx.save();

    const isWifi = (dev1.medium && dev1.medium.includes("Wi-Fi")) || (dev2.medium && dev2.medium.includes("Wi-Fi"));
    const isSerial = (dev1.medium && dev1.medium.includes("RS-485")) || (dev2.medium && dev2.medium.includes("RS-485"));
    const isWan = (dev1.medium && dev1.medium.includes("WAN")) || (dev2.medium && dev2.medium.includes("WAN"));

    if (isWifi && (dev1.type === "ap" || dev2.type === "ap" || dev1.id.includes("phone") || dev2.id.includes("phone") || dev1.id.includes("laptop") || dev2.id.includes("laptop"))) {
      // Wi-Fi RF link
      ctx.strokeStyle = "rgba(234, 179, 8, 0.7)";
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      // RF Wave arcs in the middle
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      ctx.strokeStyle = "rgba(234, 179, 8, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([]);
      for (let r = 8; r <= 18; r += 5) {
        ctx.beginPath();
        ctx.arc(midX, midY, r, -Math.PI / 3, Math.PI / 3);
        ctx.stroke();
      }
    } else if (isSerial) {
      // RS-485 industrial serial bus
      ctx.strokeStyle = "rgba(249, 115, 22, 0.8)";
      ctx.lineWidth = 3.5;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      // Bus taps
      const midX = (p1.x + p2.x) / 2;
      ctx.fillStyle = "#f97316";
      ctx.fillRect(midX - 18, p1.y - 8, 36, 16);
      ctx.fillStyle = "#030712";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("RS-485", midX, p1.y);
    } else if (isWan) {
      // WAN Internet link
      ctx.strokeStyle = "rgba(168, 85, 247, 0.75)";
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      const midX = (p1.x + p2.x) / 2;
      ctx.fillStyle = "rgba(88, 28, 135, 0.8)";
      ctx.strokeStyle = "rgba(168, 85, 247, 0.8)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(midX - 22, p1.y - 9, 44, 18, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#f3e8ff";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("WAN/ISP", midX, p1.y);
    } else {
      // Standard Ethernet cable
      ctx.strokeStyle = "rgba(6, 182, 212, 0.75)";
      ctx.lineWidth = 2.5;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawPacket(scenario) {
    if (!scenario || !scenario.steps) return;
    const step = scenario.steps[this.currentStep];
    if (!step) return;

    const p1 = this.devicePositions[step.fromDevice];
    const p2 = this.devicePositions[step.toDevice];
    if (!p1) return;

    const ctx = this.ctx;
    ctx.save();

    if (step.fromDevice === step.toDevice || !p2) {
      // Orbit / internal processing around device
      const angle = this.animProgress * Math.PI * 2;
      const orbX = p1.x + Math.cos(angle) * (p1.radius + 14);
      const orbY = p1.y + Math.sin(angle) * (p1.radius + 14);

      ctx.shadowColor = "#06b6d4";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#22d3ee";
      ctx.beginPath();
      ctx.arc(orbX, orbY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Pulse ring
      ctx.strokeStyle = "rgba(6, 182, 212, 0.6)";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(p1.x, p1.y, p1.radius + 14, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Linear interpolation between p1 and p2
      const t = this.animProgress;
      const curX = p1.x + (p2.x - p1.x) * t;
      const curY = p1.y + (p2.y - p1.y) * t;

      // Glow pulse
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 16;

      // Packet capsule
      const label = step.packet && step.packet.type ? step.packet.type.split(" ")[0] : "[PAQUETE]";
      ctx.font = "bold 10px monospace";
      const txtWidth = ctx.measureText(label).width;
      const boxW = Math.max(36, txtWidth + 14);
      const boxH = 20;

      ctx.fillStyle = "#0284c7";
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(curX - (boxW / 2), curY - (boxH / 2), boxW, boxH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, curX, curY);

      // Arrow in direction of movement
      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      const arrowDist = (boxW / 2) + 6;
      const arrowX = curX + Math.cos(angle) * arrowDist;
      const arrowY = curY + Math.sin(angle) * arrowDist;

      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(arrowX - 8 * Math.cos(angle - Math.PI / 6), arrowY - 8 * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(arrowX - 8 * Math.cos(angle + Math.PI / 6), arrowY - 8 * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  drawDeviceNode(dev, pos) {
    const ctx = this.ctx;
    ctx.save();

    const isHover = this.hoveredDevice && this.hoveredDevice.id === dev.id;
    const isFaulty = this.isDeviceFaulty(dev.id);
    const scenario = GW_SCENARIOS[this.scenarioId];
    const currentStepObj = scenario.steps[this.currentStep];
    const isActive = currentStepObj && (currentStepObj.fromDevice === dev.id || currentStepObj.toDevice === dev.id);

    // Glow ring if active or hover
    if (isFaulty) {
      ctx.shadowColor = "#ef4444";
      ctx.shadowBlur = 18;
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, pos.radius + 5, 0, Math.PI * 2);
      ctx.stroke();
    } else if (isActive || isHover) {
      ctx.shadowColor = "#06b6d4";
      ctx.shadowBlur = 14;
      ctx.strokeStyle = isHover ? "#38bdf8" : "rgba(6, 182, 212, 0.8)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, pos.radius + 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Node body
    ctx.shadowBlur = 0;
    ctx.fillStyle = isFaulty ? "#450a0a" : (dev.type === "gateway" || dev.type === "proto_gateway" ? "#2e1065" : "#0f172a");
    ctx.strokeStyle = isFaulty ? "#dc2626" : (dev.type === "gateway" || dev.type === "proto_gateway" ? "#9333ea" : "#334155");
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, pos.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Device vector icon
    this.drawIcon(dev.icon || dev.type, pos.x, pos.y);

    // Device Labels
    ctx.textAlign = "center";
    ctx.font = "bold 11px sans-serif";
    ctx.fillStyle = isFaulty ? "#fca5a5" : "#f1f5f9";
    ctx.fillText(dev.name, pos.x, pos.y + pos.radius + 16);

    // IP label
    ctx.font = "10px monospace";
    ctx.fillStyle = isFaulty ? "#ef4444" : "#06b6d4";
    const ipText = dev.ip ? (dev.ip.split(" ")[0]) : "";
    ctx.fillText(ipText, pos.x, pos.y + pos.radius + 29);

    // Fault badge
    if (isFaulty) {
      ctx.fillStyle = "#ef4444";
      ctx.font = "bold 9px monospace";
      ctx.fillText("[FALLA]", pos.x, pos.y - pos.radius - 8);
    }

    ctx.restore();
  }

  drawIcon(type, cx, cy) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = "#cbd5e1";
    ctx.fillStyle = "#cbd5e1";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (type === "laptop") {
      // Laptop screen & base
      ctx.strokeRect(cx - 11, cy - 10, 22, 14);
      ctx.beginPath();
      ctx.moveTo(cx - 15, cy + 6);
      ctx.lineTo(cx + 15, cy + 6);
      ctx.stroke();
    } else if (type === "phone") {
      // Smartphone outline
      ctx.beginPath();
      ctx.roundRect(cx - 7, cy - 12, 14, 24, 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy + 8, 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === "ap") {
      // Access point antenna & waves
      ctx.beginPath();
      ctx.roundRect(cx - 11, cy + 1, 22, 8, 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy + 1);
      ctx.lineTo(cx, cy - 8);
      ctx.stroke();
      // Wave arcs
      ctx.beginPath();
      ctx.arc(cx, cy - 8, 4, -Math.PI * 0.7, -Math.PI * 0.3);
      ctx.arc(cx, cy - 8, 7, -Math.PI * 0.7, -Math.PI * 0.3);
      ctx.stroke();
    } else if (type === "switch") {
      // Switch box with cross arrows
      ctx.strokeRect(cx - 13, cy - 7, 26, 14);
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy - 2);
      ctx.lineTo(cx + 8, cy - 2);
      ctx.moveTo(cx + 8, cy + 2);
      ctx.lineTo(cx - 8, cy + 2);
      ctx.stroke();
    } else if (type === "router" || type === "gateway") {
      // Gateway / Router circle with 4 directional arrows
      ctx.beginPath();
      ctx.arc(cx, cy, 11, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 7, cy);
      ctx.lineTo(cx + 7, cy);
      ctx.moveTo(cx, cy - 7);
      ctx.lineTo(cx, cy + 7);
      ctx.stroke();
    } else if (type === "proto_gateway") {
      // Protocol Gateway dual translation arrows
      ctx.beginPath();
      ctx.arc(cx, cy, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy - 4);
      ctx.lineTo(cx + 6, cy - 4);
      ctx.lineTo(cx + 2, cy - 8);
      ctx.moveTo(cx + 6, cy + 4);
      ctx.lineTo(cx - 6, cy + 4);
      ctx.lineTo(cx - 2, cy + 8);
      ctx.stroke();
    } else if (type === "server") {
      // Stacked server blades
      ctx.strokeRect(cx - 12, cy - 11, 24, 6);
      ctx.strokeRect(cx - 12, cy - 3, 24, 6);
      ctx.strokeRect(cx - 12, cy + 5, 24, 6);
      ctx.fillStyle = "#22d3ee";
      ctx.fillRect(cx + 6, cy - 9, 2, 2);
      ctx.fillRect(cx + 6, cy - 1, 2, 2);
      ctx.fillRect(cx + 6, cy + 7, 2, 2);
    } else if (type === "plc") {
      // Industrial PLC box with terminal points
      ctx.strokeRect(cx - 12, cy - 11, 24, 22);
      ctx.fillStyle = "#f97316";
      for (let x = -8; x <= 8; x += 4) {
        ctx.fillRect(cx + x - 1, cy - 13, 2, 2);
        ctx.fillRect(cx + x - 1, cy + 11, 2, 2);
      }
    } else if (type === "iot") {
      // Microchip / IoT
      ctx.strokeRect(cx - 9, cy - 9, 18, 18);
      ctx.fillStyle = "#10b981";
      for (let i = -6; i <= 6; i += 4) {
        ctx.fillRect(cx - 12, cy + i - 1, 3, 2);
        ctx.fillRect(cx + 9, cy + i - 1, 3, 2);
      }
    }

    ctx.restore();
  }
}

// Global initialization
document.addEventListener("DOMContentLoaded", () => {
  window.gwSim = new GatewaySimulator();
});
if (document.readyState === "complete" || document.readyState === "interactive") {
  if (!window.gwSim) {
    window.gwSim = new GatewaySimulator();
  }
}