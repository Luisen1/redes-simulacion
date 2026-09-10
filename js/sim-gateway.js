/**
 * Simulador de Pasarela (Gateway) y Traducción de Protocolos Multi-Capa
 * UPTC - Redes de Datos 2026
 * Escenarios:
 *   1. Gateway Industrial Modbus (Serial RTU <-> TCP Ethernet SCADA)
 *   2. Caso de Estudio SUPTEL Ecuador (PSTN Analógica <-> VoIP H.323 CTI/ACD)
 */

class GatewaySimulator {
  constructor() {
    this.scenario = "modbus"; // "modbus" o "suptel"
    this.currentStep = 0;
    this.isPlaying = false;
    this.playTimer = null;
    this.speed = 1.0;

    // Pasos de la máquina de estados
    this.steps = [
      { id: 0, key: "IDLE", label: "En reposo (Esperando solicitud)", desc: "El enlace está listo para iniciar la comunicación entre redes heterogéneas." },
      { id: 1, key: "SRC_APP", label: "1. Capa de Aplicación Origen", desc: "El dispositivo emisor genera la PDU de datos según su protocolo nativo." },
      { id: 2, key: "SRC_ENCAP", label: "2. Encapsulamiento en Origen", desc: "Los datos descienden por la pila de protocolos del medio emisor." },
      { id: 3, key: "WIRE_INGRESS", label: "3. Tránsito hacia el Gateway", desc: "La señal física viaja por el medio original (RS-485 serial o Par telefónico PSTN)." },
      { id: 4, key: "GW_INGRESS", label: "4. Recepción en el Gateway", desc: "La pasarela recibe la señal en su interfaz física de entrada y verifica integridad." },
      { id: 5, key: "GW_DECAP", label: "5. Desensamblado de Capas (Decapsulation)", desc: "El Gateway retira encabezados L1/L2 y extrae el Payload en sus capas superiores." },
      { id: 6, key: "GW_TRANSLATE", label: "6. Motor de Traducción de Protocolo", desc: "¡Núcleo de la Pasarela! Convierte formatos, sintaxis, direccionamiento y señalización." },
      { id: 7, key: "GW_ENCAP", label: "7. Reensamblado en Nueva Pila", desc: "El Gateway empaqueta los datos convertidos en la pila de protocolos de destino." },
      { id: 8, key: "WIRE_EGRESS", label: "8. Tránsito hacia Destino", desc: "La nueva trama viaja sobre la red de conmutación de paquetes (Ethernet IP)." },
      { id: 9, key: "DST_RECEIVE", label: "9. Recepción en Servidor Destino", desc: "El host receptor procesa la solicitud en su protocolo nativo y confirma la operación." }
    ];

    this.init();
  }

  init() {
    this.bindEvents();
    this.updateScenarioView();
    this.renderStep();
  }

  bindEvents() {
    const scnSelect = document.getElementById("gwScenarioSelect");
    if (scnSelect) {
      scnSelect.addEventListener("change", (e) => {
        this.scenario = e.target.value;
        this.resetSimulation();
        this.updateScenarioView();
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

    const btnInspectIn = document.getElementById("btnGwInspectIn");
    if (btnInspectIn) {
      btnInspectIn.addEventListener("click", () => this.showPacketInspector("in"));
    }

    const btnInspectOut = document.getElementById("btnGwInspectOut");
    if (btnInspectOut) {
      btnInspectOut.addEventListener("click", () => this.showPacketInspector("out"));
    }

    const modalClose = document.getElementById("closeGwModal");
    if (modalClose) {
      modalClose.addEventListener("click", () => {
        const modal = document.getElementById("gwPacketModal");
        if (modal) modal.classList.add("hidden");
      });
    }
  }

  updateScenarioView() {
    const isModbus = (this.scenario === "modbus");

    // Textos de dispositivos
    const srcTitle = document.getElementById("gwSrcTitle");
    const srcSub = document.getElementById("gwSrcSub");
    const gwTitle = document.getElementById("gwDeviceTitle");
    const gwSub = document.getElementById("gwDeviceSub");
    const dstTitle = document.getElementById("gwDstTitle");
    const dstSub = document.getElementById("gwDstSub");

    if (isModbus) {
      if (srcTitle) srcTitle.textContent = "PLC / Sensor Térmico (Esclavo #1)";
      if (srcSub) srcSub.textContent = "Bus Serie RS-485 · Modbus RTU · 9600 bps";
      if (gwTitle) gwTitle.textContent = "Gateway Industrial Advantech EKI-1221";
      if (gwSub) gwSub.textContent = "Traductor Modbus RTU (Serial) ↔ Modbus TCP (Ethernet)";
      if (dstTitle) dstTitle.textContent = "Servidor SCADA Corporativo";
      if (dstSub) dstSub.textContent = "Red LAN Ethernet · Modbus TCP · IP: 192.168.10.50";
    } else {
      if (srcTitle) srcTitle.textContent = "Usuario Teléfono PSTN (SUPTEL)";
      if (srcSub) srcSub.textContent = "Red Telefónica Conmutada · Línea Analógica · Par Cobre";
      if (gwTitle) gwTitle.textContent = "Gateway de Voz IP H.323 (SUPTEL)";
      if (gwSub) gwSub.textContent = "Pasarela PSTN/ISDN ↔ VoIP H.323 / RTP / CTI";
      if (dstTitle) dstTitle.textContent = "Servidor ACD / Call Center CTI";
      if (dstSub) dstSub.textContent = "Plataforma de Atención al Ciudadano · Red IP";
    }

    this.renderProtocolsList();
  }

  renderProtocolsList() {
    const isModbus = (this.scenario === "modbus");
    const leftStack = document.getElementById("gwLeftStack");
    const rightStack = document.getElementById("gwRightStack");

    if (isModbus) {
      if (leftStack) {
        leftStack.innerHTML = `
          <div class="osi-layer" data-layer="7"><span>Capa 7:</span> <strong>Modbus RTU PDU (Func 03)</strong></div>
          <div class="osi-layer" data-layer="4"><span>Capa 4:</span> <em>No aplica (Orientado a tramas)</em></div>
          <div class="osi-layer" data-layer="3"><span>Capa 3:</span> <em>No aplica (Dirección esclavo 1 Byte)</em></div>
          <div class="osi-layer" data-layer="2"><span>Capa 2:</span> <strong>Trama Asíncrona Serial + CRC16</strong></div>
          <div class="osi-layer" data-layer="1"><span>Capa 1:</span> <strong>Física RS-485 (Bipolar Diferencial)</strong></div>
        `;
      }
      if (rightStack) {
        rightStack.innerHTML = `
          <div class="osi-layer" data-layer="7"><span>Capa 7:</span> <strong>Modbus TCP + Cabecera MBAP</strong></div>
          <div class="osi-layer" data-layer="4"><span>Capa 4:</span> <strong>TCP (Puerto destino 502)</strong></div>
          <div class="osi-layer" data-layer="3"><span>Capa 3:</span> <strong>IPv4 (192.168.10.50)</strong></div>
          <div class="osi-layer" data-layer="2"><span>Capa 2:</span> <strong>Ethernet II (MACs 48 bits)</strong></div>
          <div class="osi-layer" data-layer="1"><span>Capa 1:</span> <strong>100BASE-TX (Cobre Cat5e/6)</strong></div>
        `;
      }
    } else {
      if (leftStack) {
        leftStack.innerHTML = `
          <div class="osi-layer" data-layer="7"><span>Capa 7:</span> <strong>Voz Humana Analógica (Banda Base)</strong></div>
          <div class="osi-layer" data-layer="4"><span>Capa 4:</span> <em>No aplica (Circuito Conmutado DS0)</em></div>
          <div class="osi-layer" data-layer="3"><span>Capa 3:</span> <strong>Señalización PSTN (Tonos DTMF / R2)</strong></div>
          <div class="osi-layer" data-layer="2"><span>Capa 2:</span> <strong>Troncal E1 / Bucle de Abonado</strong></div>
          <div class="osi-layer" data-layer="1"><span>Capa 1:</span> <strong>Voltaje Analógico / Par de Cobre</strong></div>
        `;
      }
      if (rightStack) {
        rightStack.innerHTML = `
          <div class="osi-layer" data-layer="7"><span>Capa 7:</span> <strong>H.323 (H.225 Q.931 / H.245) + G.711</strong></div>
          <div class="osi-layer" data-layer="4"><span>Capa 4:</span> <strong>RTP / UDP (Voz) + TCP (Control)</strong></div>
          <div class="osi-layer" data-layer="3"><span>Capa 3:</span> <strong>IPv4 (Subred Call Center SUPTEL)</strong></div>
          <div class="osi-layer" data-layer="2"><span>Capa 2:</span> <strong>Ethernet 802.3 Conmutado</strong></div>
          <div class="osi-layer" data-layer="1"><span>Capa 1:</span> <strong>Gigabit Ethernet UTP/Fibra</strong></div>
        `;
      }
    }
  }

  toggleAutoPlay() {
    this.isPlaying = !this.isPlaying;
    const btn = document.getElementById("btnGwStart");
    if (btn) {
      btn.innerHTML = this.isPlaying ? "Pausar Simulación" : "Iniciar Animación Automática";
      btn.className = this.isPlaying 
        ? "px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded font-medium text-sm transition"
        : "px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-medium text-sm transition";
    }

    if (this.isPlaying) {
      this.runAutoPlay();
    } else {
      clearTimeout(this.playTimer);
    }
  }

  runAutoPlay() {
    if (!this.isPlaying) return;
    if (this.currentStep < this.steps.length - 1) {
      this.nextStep();
      this.playTimer = setTimeout(() => this.runAutoPlay(), 2200 / this.speed);
    } else {
      this.isPlaying = false;
      const btn = document.getElementById("btnGwStart");
      if (btn) btn.innerHTML = "Repetir Animación";
    }
  }

  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.renderStep();
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.renderStep();
    }
  }

  resetSimulation() {
    this.isPlaying = false;
    clearTimeout(this.playTimer);
    this.currentStep = 0;
    const btn = document.getElementById("btnGwStart");
    if (btn) btn.innerHTML = "Iniciar Animación Automática";
    this.renderStep();
  }

  renderStep() {
    const stepObj = this.steps[this.currentStep];
    const badge = document.getElementById("gwStepBadge");
    const label = document.getElementById("gwStepLabel");
    const desc = document.getElementById("gwStepDesc");

    if (badge) badge.textContent = `Paso ${this.currentStep} de 9`;
    if (label) label.textContent = stepObj.label;
    if (desc) desc.textContent = stepObj.desc;

    // Resaltar elementos visuales según el paso
    this.highlightActiveComponents(stepObj.key);
    this.updateLiveExplanation(stepObj.key);
  }

  highlightActiveComponents(stepKey) {
    const srcBox = document.getElementById("gwBoxSrc");
    const gwBox = document.getElementById("gwBoxGw");
    const dstBox = document.getElementById("gwBoxDst");
    const wireIn = document.getElementById("gwWireIn");
    const wireOut = document.getElementById("gwWireOut");

    // Limpiar clases
    [srcBox, gwBox, dstBox].forEach(el => {
      if (el) el.classList.remove("ring-2", "ring-cyan-400", "ring-amber-400", "ring-emerald-400", "scale-[1.02]");
    });
    if (wireIn) wireIn.className = "h-1.5 flex-1 bg-slate-700 relative overflow-hidden";
    if (wireOut) wireOut.className = "h-1.5 flex-1 bg-slate-700 relative overflow-hidden";

    // Resaltar capas OSI
    document.querySelectorAll(".osi-layer").forEach(el => el.classList.remove("bg-cyan-900/60", "text-cyan-200", "font-bold", "border-cyan-400"));

    if (stepKey === "SRC_APP" || stepKey === "SRC_ENCAP") {
      if (srcBox) srcBox.classList.add("ring-2", "ring-cyan-400", "scale-[1.02]");
      if (stepKey === "SRC_APP") this.highlightOsiLayer("left", 7);
      if (stepKey === "SRC_ENCAP") this.highlightOsiLayer("left", 2);
    } else if (stepKey === "WIRE_INGRESS") {
      if (wireIn) wireIn.className = "h-1.5 flex-1 bg-amber-500 shadow-lg shadow-amber-500/50 animate-pulse";
      this.highlightOsiLayer("left", 1);
    } else if (stepKey === "GW_INGRESS" || stepKey === "GW_DECAP" || stepKey === "GW_TRANSLATE" || stepKey === "GW_ENCAP") {
      if (gwBox) gwBox.classList.add("ring-2", "ring-amber-400", "scale-[1.02]");
      if (stepKey === "GW_DECAP") this.highlightOsiLayer("left", 7);
      if (stepKey === "GW_TRANSLATE") {
        this.highlightOsiLayer("left", 7);
        this.highlightOsiLayer("right", 7);
      }
      if (stepKey === "GW_ENCAP") this.highlightOsiLayer("right", 3);
    } else if (stepKey === "WIRE_EGRESS") {
      if (wireOut) wireOut.className = "h-1.5 flex-1 bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse";
      this.highlightOsiLayer("right", 1);
    } else if (stepKey === "DST_RECEIVE") {
      if (dstBox) dstBox.classList.add("ring-2", "ring-emerald-400", "scale-[1.02]");
      this.highlightOsiLayer("right", 7);
    }
  }

  highlightOsiLayer(side, layerNum) {
    const parent = side === "left" ? document.getElementById("gwLeftStack") : document.getElementById("gwRightStack");
    if (!parent) return;
    const el = parent.querySelector(`[data-layer="${layerNum}"]`);
    if (el) {
      el.className = "osi-layer bg-cyan-900/70 border border-cyan-400 text-cyan-100 font-bold px-2 py-1 rounded shadow";
    }
  }

  updateLiveExplanation(stepKey) {
    const box = document.getElementById("gwExplanationBox");
    if (!box) return;

    const isModbus = (this.scenario === "modbus");

    const explanations = {
      modbus: {
        IDLE: "El sensor de temperatura industrial mantiene su registro analógico listo. El servidor SCADA de supervisión está a la espera de telemetría a través de la red TCP/IP corporativa.",
        SRC_APP: "El sensor toma la lectura de temperatura de la caldera (ej. 75.4 °C) y prepara una respuesta Modbus RTU: Función 03 (Read Holding Registers), registro de 16 bits = 0x02F2.",
        SRC_ENCAP: "El controlador agrega la dirección del esclavo (0x01) y calcula el CRC16 de paridad cíclica (2 bytes: 0xC4, 0x0B). Trama serial de 7 bytes lista.",
        WIRE_INGRESS: "La trama serial se transmite como pulsos de voltaje diferencial sobre el bus RS-485 a 9600 baudios (8 bits, sin paridad, 1 stop).",
        GW_INGRESS: "El Gateway Advantech EKI-1221 recibe la señal en su puerto serie DB9/RS-485. Su UART almacena los bytes en su buffer de memoria interno.",
        GW_DECAP: "¡Proceso de desensamblado!: La CPU del Gateway desempaca la trama serial, computa el CRC16 recibido y verifica que no hubo ruido en la línea RS-485. Extrae el Payload Modbus original.",
        GW_TRANSLATE: "¡Transformación semántica!: El Gateway elimina el CRC16 serial (innecesario en Ethernet). Genera la cabecera MBAP (Modbus Application Protocol): Transaction ID=0x0001, Protocol ID=0x0000, Length=0x0006, Unit ID=0x01.",
        GW_ENCAP: "El Gateway encapsula la nueva PDU en un socket TCP (puerto estándar 502), agrega la cabecera IPv4 (origen Gateway, destino SCADA 192.168.10.50) y crea la trama Ethernet II con su FCS CRC32.",
        WIRE_EGRESS: "El nuevo paquete Ethernet es emitido por el puerto RJ45 a 100 Mbps full-duplex hacia el switch corporativo.",
        DST_RECEIVE: "El Servidor SCADA recibe el paquete TCP/IP en el puerto 502, decodifica el valor 75.4 °C y actualiza el gráfico de la planta en tiempo real."
      },
      suptel: {
        IDLE: "El sistema telefónico nacional PSTN y el Call Center CTI de la SUPTEL están operativos esperando reclamos de los ciudadanos ecuatorianos.",
        SRC_APP: "Un ciudadano marca el número de atención de la SUPTEL desde su teléfono fijo convencional. La voz analógica se propaga por vibración acústica.",
        SRC_ENCAP: "La central telefónica pública conmutada (PSTN) asigna un canal dedicado DS0 de 64 kbps y modula los tonos multifrecuencia (DTMF) para la señalización del abonado.",
        WIRE_INGRESS: "La señal analógica/E1 viaja por la red telefónica conmutada de circuitos hasta acometer en las instalaciones de la SUPTEL.",
        GW_INGRESS: "El Gateway H.323 de voz de la SUPTEL recibe la llamada a través de su interfaz telefónica (E1 / PRI / FXO) y detecta la solicitud de conexión entrante.",
        GW_DECAP: "El DSP (Digital Signal Processor) del Gateway demodula la señal analógica, interpreta la señalización telefónica de circuitos (R2 / Q.931 analógico) y captura las muestras PCM de audio.",
        GW_TRANSLATE: "¡Conversión de Arquitecturas!: El Gateway traduce la señalización telefónica a mensajes H.225 / Q.931 sobre TCP/IP (Setup, Call Proceeding), negocia el códec mediante H.245, y digitaliza la voz continua a 64 kbps con códec G.711.",
        GW_ENCAP: "El Gateway fragmenta los 64 kbps en paquetes RTP (Real-Time Transport Protocol) de 20 ms de voz con timestamps, encapsulados en UDP/IP hacia el servidor ACD.",
        WIRE_EGRESS: "Los paquetes IP de voz y señalización viajan por la red de área local conmutada de la SUPTEL sin interferir con las bases de datos corporativas.",
        DST_RECEIVE: "El Servidor ACD asigna la llamada al agente de atención disponible. El softphone en el computador del funcionario reproduce la voz en su diadema USB y abre automáticamente la ficha de reclamo en pantalla."
      }
    };

    box.innerHTML = `
      <div class="p-3 bg-slate-800/80 border border-cyan-500/30 rounded-lg text-xs leading-relaxed text-slate-200">
        <div class="font-bold text-cyan-400 mb-1 flex items-center gap-1.5">
          <span>Análisis Técnico de la Pasarela:</span>
        </div>
        <p>${explanations[this.scenario][stepKey]}</p>
      </div>
    `;
  }

  showPacketInspector(direction) {
    const modal = document.getElementById("gwPacketModal");
    const modalTitle = document.getElementById("gwModalTitle");
    const modalContent = document.getElementById("gwModalContent");
    if (!modal) return;

    modal.classList.remove("hidden");
    const isModbus = (this.scenario === "modbus");

    if (direction === "in") {
      if (isModbus) {
        modalTitle.textContent = "Inspección de Trama de Entrada: Modbus RTU Serial (RS-485)";
        modalContent.innerHTML = `
          <div class="space-y-3 font-mono text-xs">
            <div class="p-2 bg-slate-900 rounded border border-slate-700">
              <span class="text-slate-400">Dump Hexadecimal:</span>
              <div class="text-amber-400 font-bold mt-1 tracking-widest">01 03 02 02 F2 C4 0B</div>
            </div>
            <table class="w-full text-left border-collapse text-slate-300">
              <thead>
                <tr class="border-b border-slate-700 text-slate-400 text-[11px]">
                  <th class="py-1">Campo</th>
                  <th>Bytes</th>
                  <th>Valor Hex</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800">
                <tr>
                  <td class="py-1 text-cyan-400">Slave Address</td>
                  <td>1 Byte</td>
                  <td>0x01</td>
                  <td>Dirección del esclavo RTU (PLC #1)</td>
                </tr>
                <tr>
                  <td class="py-1 text-cyan-400">Function Code</td>
                  <td>1 Byte</td>
                  <td>0x03</td>
                  <td>Read Holding Registers (Lectura de registros)</td>
                </tr>
                <tr>
                  <td class="py-1 text-cyan-400">Byte Count</td>
                  <td>1 Byte</td>
                  <td>0x02</td>
                  <td>2 bytes de datos devueltos</td>
                </tr>
                <tr>
                  <td class="py-1 text-emerald-400">Register Data</td>
                  <td>2 Bytes</td>
                  <td>0x02 F2</td>
                  <td>Lectura: 754 décimas = 75.4 °C</td>
                </tr>
                <tr>
                  <td class="py-1 text-rose-400">Checksum CRC16</td>
                  <td>2 Bytes</td>
                  <td>0xC4 0x0B</td>
                  <td>Verificación de redundancia cíclica serial</td>
                </tr>
              </tbody>
            </table>
            <div class="p-2 bg-blue-950/60 border border-blue-800 rounded text-blue-200">
              <strong>Nota Técnica:</strong> Esta trama se transmite como señal eléctrica diferencial continua sin direccionamiento IP ni número de puerto.
            </div>
          </div>
        `;
      } else {
        modalTitle.textContent = "Inspección de Canal de Entrada: Línea Telefónica Analógica PSTN";
        modalContent.innerHTML = `
          <div class="space-y-3 text-xs font-mono">
            <div class="p-2 bg-slate-900 rounded border border-slate-700">
              <span class="text-slate-400">Tipo de Enlace:</span>
              <div class="text-amber-400 font-bold mt-1">Línea Analógica PSTN / Troncal E1 Conmutada por Circuitos (DS0)</div>
            </div>
            <ul class="list-disc pl-5 space-y-1 text-slate-300">
              <li><strong>Ancho de Banda de Voz:</strong> 300 Hz a 3400 Hz (telefonía de voz tradicional).</li>
              <li><strong>Digitalización en Central:</strong> Modulación por Impulsos Codificados (PCM) a 8000 muestras/seg x 8 bits = 64 kbps.</li>
              <li><strong>Señalización:</strong> Tonos multifrecuencia DTMF para marcado de abonado y señales de colgado/descolgado (voltaje de bucle -48V DC / señal de ring 90V AC).</li>
              <li><strong>Limitación:</strong> Circuito físico o temporal reservado en exclusiva durante toda la llamada, impidiendo el uso compartido del canal.</li>
            </ul>
          </div>
        `;
      }
    } else {
      if (isModbus) {
        modalTitle.textContent = "Inspección de Trama de Salida: Modbus TCP Encapsulado sobre Ethernet/IP";
        modalContent.innerHTML = `
          <div class="space-y-3 font-mono text-xs">
            <div class="p-2 bg-slate-900 rounded border border-slate-700">
              <span class="text-slate-400">Dump Hexadecimal (PDU + MBAP):</span>
              <div class="text-emerald-400 font-bold mt-1 tracking-widest">00 01 00 00 00 05 01 03 02 02 F2</div>
            </div>
            <table class="w-full text-left border-collapse text-slate-300">
              <thead>
                <tr class="border-b border-slate-700 text-slate-400 text-[11px]">
                  <th class="py-1">Capa / Campo</th>
                  <th>Bytes</th>
                  <th>Valor Hex</th>
                  <th>Función Técnica</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800">
                <tr class="bg-indigo-950/40">
                  <td class="py-1 text-indigo-300">MBAP: Trans. ID</td>
                  <td>2 Bytes</td>
                  <td>0x00 01</td>
                  <td>Identificador de transacción para coincidencia de petición/respuesta</td>
                </tr>
                <tr class="bg-indigo-950/40">
                  <td class="py-1 text-indigo-300">MBAP: Protocol ID</td>
                  <td>2 Bytes</td>
                  <td>0x00 00</td>
                  <td>0 = Protocolo Modbus</td>
                </tr>
                <tr class="bg-indigo-950/40">
                  <td class="py-1 text-indigo-300">MBAP: Length</td>
                  <td>2 Bytes</td>
                  <td>0x00 05</td>
                  <td>5 bytes restantes en el paquete</td>
                </tr>
                <tr class="bg-indigo-950/40">
                  <td class="py-1 text-indigo-300">MBAP: Unit ID</td>
                  <td>1 Byte</td>
                  <td>0x01</td>
                  <td>Mapeo del esclavo serial original (PLC #1)</td>
                </tr>
                <tr>
                  <td class="py-1 text-cyan-400">Modbus PDU</td>
                  <td>3 Bytes</td>
                  <td>0x03 02 02F2</td>
                  <td>Función 03, 2 bytes de datos (75.4 °C)</td>
                </tr>
                <tr class="bg-emerald-950/40">
                  <td class="py-1 text-emerald-300">TCP Header</td>
                  <td>20 Bytes</td>
                  <td>Dst: 502</td>
                  <td>Socket TCP en puerto Modbus 502</td>
                </tr>
                <tr class="bg-emerald-950/40">
                  <td class="py-1 text-emerald-300">IP Header</td>
                  <td>20 Bytes</td>
                  <td>Dst: 192.168.10.50</td>
                  <td>Encaminamiento de capa 3 hacia SCADA</td>
                </tr>
              </tbody>
            </table>
            <div class="p-2 bg-emerald-950/60 border border-emerald-800 rounded text-emerald-200">
              <strong>Transformación Clave:</strong> Se removió el CRC16 serial y se generó la cabecera MBAP. La integridad ahora la aseguran los checksums de Ethernet y TCP.
            </div>
          </div>
        `;
      } else {
        modalTitle.textContent = "Inspección de Paquete VoIP: H.323 / RTP sobre Red IP SUPTEL";
        modalContent.innerHTML = `
          <div class="space-y-3 text-xs font-mono">
            <div class="p-2 bg-slate-900 rounded border border-slate-700">
              <span class="text-slate-400">Protocolos Integrados:</span>
              <div class="text-emerald-400 font-bold mt-1">RTP (Audio) + UDP + IPv4 + H.225 / Q.931 (Control de Sesión)</div>
            </div>
            <table class="w-full text-left border-collapse text-slate-300">
              <thead>
                <tr class="border-b border-slate-700 text-slate-400 text-[11px]">
                  <th class="py-1">Elemento</th>
                  <th>Detalle Técnico</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800">
                <tr>
                  <td class="py-1 text-cyan-300">Códec de Audio</td>
                  <td>ITU-T G.711 A-law / mu-law (64 kbps, paquetes de 160 bytes por cada 20 ms)</td>
                </tr>
                <tr>
                  <td class="py-1 text-cyan-300">Cabecera RTP</td>
                  <td>Payload Type 0 (PCMU), Sequence Number secuencial, Timestamp síncrono</td>
                </tr>
                <tr>
                  <td class="py-1 text-cyan-300">Señalización H.323</td>
                  <td>H.225.0 / Q.931 para setup de llamada; H.245 para apertura de canales de audio</td>
                </tr>
                <tr>
                  <td class="py-1 text-emerald-300">Destino IP</td>
                  <td>Servidor ACD (Automatic Call Distributor) de la SUPTEL (IP: 10.20.0.15:1720)</td>
                </tr>
              </tbody>
            </table>
            <div class="p-2 bg-emerald-950/60 border border-emerald-800 rounded text-emerald-200">
              <strong>Solución al Problema SUPTEL:</strong> Gracias a este empaquetamiento IP, 398 reclamos diarios pueden ser distribuidos equitativamente a colas automáticas de operadores sin colapsar las líneas físicas.
            </div>
          </div>
        `;
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("gwScenarioSelect")) {
    window.gwSim = new GatewaySimulator();
  }
});
