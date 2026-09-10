/**
 * Asesor Técnico de Selección y Calculadora de Redes
 * UPTC - Redes de Datos 2026
 * Basado en los Capítulos 7 y 8: Capacidad, Cobertura, Procesamiento y Catálogos Reales
 */

class NetworkAdvisor {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
    this.renderCatalogTables();
  }

  bindEvents() {
    const btnEvaluate = document.getElementById("btnAdvEvaluate");
    if (btnEvaluate) {
      btnEvaluate.addEventListener("click", () => this.evaluateScenario());
    }

    const btnPresetMarine = document.getElementById("presetMarine");
    if (btnPresetMarine) {
      btnPresetMarine.addEventListener("click", () => this.loadPreset("marine"));
    }

    const btnPresetIndustrial = document.getElementById("presetIndustrial");
    if (btnPresetIndustrial) {
      btnPresetIndustrial.addEventListener("click", () => this.loadPreset("industrial"));
    }

    const btnPresetCampus = document.getElementById("presetCampus");
    if (btnPresetCampus) {
      btnPresetCampus.addEventListener("click", () => this.loadPreset("campus"));
    }

    const btnCopyMemo = document.getElementById("btnCopyAdvMemo");
    if (btnCopyMemo) {
      btnCopyMemo.addEventListener("click", () => this.copyMemoToClipboard());
    }
  }

  loadPreset(type) {
    if (type === "marine") {
      document.getElementById("advEnvironment").value = "marine";
      document.getElementById("advDistance").value = "40";
      document.getElementById("advProtocols").value = "same";
      document.getElementById("advPoe").value = "no";
      document.getElementById("advTraffic").value = "telemetry";
      document.getElementById("advRedundancy").value = "single";
    } else if (type === "industrial") {
      document.getElementById("advEnvironment").value = "industrial";
      document.getElementById("advDistance").value = "80";
      document.getElementById("advProtocols").value = "hetero_modbus";
      document.getElementById("advPoe").value = "no";
      document.getElementById("advTraffic").value = "medium";
      document.getElementById("advRedundancy").value = "dual";
    } else if (type === "campus") {
      document.getElementById("advEnvironment").value = "campus";
      document.getElementById("advDistance").value = "600";
      document.getElementById("advProtocols").value = "same";
      document.getElementById("advPoe").value = "yes";
      document.getElementById("advTraffic").value = "high";
      document.getElementById("advRedundancy").value = "single";
    }
    this.evaluateScenario();
  }

  evaluateScenario() {
    const env = document.getElementById("advEnvironment").value;
    const dist = parseFloat(document.getElementById("advDistance").value) || 50;
    const proto = document.getElementById("advProtocols").value;
    const poe = document.getElementById("advPoe").value === "yes";
    const traffic = document.getElementById("advTraffic").value;
    const redundancy = document.getElementById("advRedundancy").value === "dual";

    let deviceType = "";
    let recommendedModel = null;
    let categoryKey = "";
    let capacityAnalysis = "";
    let coverageAnalysis = "";
    let processingAnalysis = "";
    let discardedOptions = [];

    // LÓGICA DE DECISIÓN DE INGENIERÍA:
    
    // Regla 1: ¿Incompatibilidad de protocolos heterogéneos?
    if (proto === "hetero_modbus") {
      deviceType = "PASARELA / GATEWAY INDUSTRIAL";
      categoryKey = "gateway";
      
      if (redundancy || traffic === "high") {
        recommendedModel = CATALOG_GATEWAYS[2]; // EKI-1224-CE (4 puertos serie, dual power)
        capacityAnalysis = "Alta densidad de conexiones concurrentes: 4 puertos RS-232/422/485 independientes y doble puerto Ethernet para arquitectura en anillo/cascada.";
      } else if (dist > 50 || redundancy) {
        recommendedModel = CATALOG_GATEWAYS[1]; // EKI-1221-CE (1 puerto serie, dual power)
        capacityAnalysis = "Capacidad media industrial: 1 puerto serie configurable y doble entrada de alimentación eléctrica 12-48 VDC.";
      } else {
        recommendedModel = CATALOG_GATEWAYS[0]; // ADAM-4572
        capacityAnalysis = "Capacidad de celda puntual: 1 puerto serie a 115.2 kbps y 1 interfaz RJ-45 10/100 Mbps.";
      }

      coverageAnalysis = `Cobertura lógica y física: El bus RS-485 cubre hasta 1200 metros en planta, y el enlace Ethernet 100BASE-TX interconecta hacia la red corporativa SCADA a través de switches.`;
      processingAnalysis = "Capa 3 a 7 (Procesamiento Intensivo): La CPU del gateway desensambla tramas serie Modbus RTU/ASCII con verificación de CRC16, traduce códigos de función y registros, y encapsula en Modbus TCP con cabecera MBAP en puerto TCP 502.";
      discardedOptions = [
        "Hub Ethernet: Descartado rotundamente por operar en Capa 1; no interpreta datos ni puede traducir señales seriales RS-485 a tramas Ethernet.",
        "Repetidor: Descartado; solo regenera bits del mismo medio y no resuelve incompatibilidad de protocolos.",
        "Switch de oficina: Descartado; carece de interfaces seriales e inteligencia de conversión de protocolos de automatización."
      ];

    } else if (proto === "hetero_voice") {
      deviceType = "PASARELA / GATEWAY DE VOZ (VoIP H.323 / SIP)";
      categoryKey = "gateway";
      recommendedModel = {
        fabricante: "Cisco / AudioCodes",
        modelo: "Gateway H.323 / SIP Multicanal (Tipo Caso SUPTEL)",
        tipo: "Gateway de Voz IP e Integración CTI",
        puertos: "Puertos E1/PRI + Fast Ethernet",
        velocidad: "100 Mbps IP / 2.048 Mbps troncales E1",
        medio: "Cable coaxial 75Ω / UTP Cat5e",
        precio: "USD 1,200.00 - USD 3,500.00",
        justificacion: "Indispensable para integrar canales telefónicos analógicos o digitales de la PSTN con la infraestructura de conmutación de paquetes del Call Center CTI."
      };
      capacityAnalysis = "Capacidad telefónica: Manejo simultáneo de múltiples canales de voz concurrentes (30 canales por cada enlace E1) con cancelación de eco hardware.";
      coverageAnalysis = "Cobertura metropolitana: Permite interconectar el bucle de abonados PSTN nacional con los servidores ACD ubicados en la sede central.";
      processingAnalysis = "Capa 7 y DSP: Codificación y compresión de audio mediante códecs G.711/G.729, traducción de señalización Q.931 analógica a H.225/RTP en red IP.";
      discardedOptions = [
        "Hub y Repetidor: Totalmente incapaces de manejar digitalización de voz analógica ni señalización de telefonía."
      ];

    // Regla 2: Mismo protocolo, pero distancia física superior al límite estándar de cobre (100 m)
    } else if (dist > 100) {
      deviceType = "REPETIDOR / EXTENSOR DE ENLACE FÍSICO";
      categoryKey = "repeater";

      if (dist > 300 || traffic === "high" || env === "campus") {
        recommendedModel = CATALOG_REPEATERS[2]; // Transition Networks S3100-4040-NA (Fibra óptica)
        capacityAnalysis = "Capacidad ultra alta: Hasta 2.5 Gbps mediante ranuras SFP ópticas, adecuado para tráfico masivo de campus, servidores y video en alta definición.";
        coverageAnalysis = `Cobertura extendida: Supera ampliamente la distancia de ${dist} metros, permitiendo alcances de hasta 10 a 40 km según el transceptor SFP óptico monomodo instalado.`;
        processingAnalysis = "Capa 1 Pura (Procesamiento 3R Óptico): Regeneración completa de pulsos de luz (Reamplification, Reshaping, Reclocking) sin añadir retardo de procesamiento de tramas.";
      } else if (poe) {
        if (dist > 180) {
          recommendedModel = CATALOG_REPEATERS[0]; // Ubiquiti UACC-LRE
          capacityAnalysis = "Capacidad Gigabit con passthrough PoE+: Soporta 10/100/1000 Mbps y permite encadenar múltiples unidades hasta 1 km.";
          coverageAnalysis = `Cobertura de ${dist} m: Resuelve el enlace de cobre superando el límite de 100m sin necesidad de cablear tomas de corriente intermedias.`;
          processingAnalysis = "Capa 1 Eléctrica: Regeneración de pulsos diferenciales Ethernet y reclocking digital sin alterar encabezados MAC ni IPs.";
        } else {
          recommendedModel = CATALOG_REPEATERS[1]; // SPT 12-POE101
          capacityAnalysis = "Capacidad Gigabit PoE individual: Extiende 100 metros adicionales para un único dispositivo terminal.";
          coverageAnalysis = `Cobertura de hasta 200 m totales desde la fuente de alimentación PoE.`;
          processingAnalysis = "Capa 1 Eléctrica: Repetidor activo con circuito de recronometrado de bits Ethernet.";
        }
      } else {
        recommendedModel = CATALOG_REPEATERS[0];
        capacityAnalysis = "Capacidad Gigabit en enlace punto a punto.";
        coverageAnalysis = `Cobertura adaptada a ${dist} metros.`;
        processingAnalysis = "Capa 1: Restauración de amplitud y reloj.";
      }

      discardedOptions = [
        "Hub: Descartado porque no está concebido para enlaces punto a punto de larga distancia y satura el medio con difusión innecesaria.",
        "Gateway: Innecesario y desproporcionado en costo/latencia, ya que los protocolos de ambos lados son idénticos."
      ];

    // Regla 3: Entorno Marino Confinado de baja tasa de telemetría (Caso Furuno)
    } else if (env === "marine") {
      deviceType = "CONCENTRADOR / HUB ETHERNET MARINIZADO";
      categoryKey = "hub";

      if (traffic === "high" || redundancy) {
        recommendedModel = CATALOG_HUBS[2]; // Furuno HUB3000
        capacityAnalysis = "Capacidad Gigabit marina certificada para Sistemas Integrados de Navegación (INS/ECDIS) bajo normativas IMO.";
      } else if (poe || dist > 60) {
        recommendedModel = CATALOG_HUBS[1]; // Furuno HUB102
        capacityAnalysis = "5 puertos Gigabit Ethernet con conectores estancos a prueba de agua y salinidad.";
      } else {
        recommendedModel = CATALOG_HUBS[0]; // Furuno HUB100
        capacityAnalysis = "8 puertos 10/100 Mbps dedicados a telemetría NMEA de baja tasa y sensores náuticos.";
      }

      coverageAnalysis = `Cobertura de cabina/puente de mando: Confinado a distancias menores a 60 metros dentro del casco de la embarcación.`;
      processingAnalysis = "Capa 1 Física: Repetidor multipuerto activo con regeneración eléctrica de pulsos, sin configuración IP ni mantenimiento de software en alta mar.";
      discardedOptions = [
        "Switch de oficina comercial: Descartado por su nula resistencia a la corrosión salina, falta de conectores herméticos y susceptibilidad a vibraciones continuas de motor.",
        "Gateway: Innecesario ya que la instrumentación marina seleccionada opera sobre el mismo bus Ethernet naval."
      ];

    // Regla 4: Caso Oficina Estándar / Producción Moderna
    } else {
      deviceType = "SWITCH CONMUTADOR DE ACCESO (Capa 2)";
      categoryKey = "switch";
      recommendedModel = {
        fabricante: "Cisco / Aruba / Ubiquiti",
        modelo: "Switch Conmutado Gigabit de Acceso L2",
        tipo: "Conmutador de Capa 2 con microsegmentación",
        puertos: "8 a 24 puertos Gigabit RJ-45",
        velocidad: "10/100/1000 Mbps Full Duplex",
        medio: "Cable UTP Cat6",
        precio: "USD 120.00 - USD 250.00",
        justificacion: "Para una oficina moderna sin problemas de distancia ni incompatibilidad de protocolos, el Hub está obsoleto. Un switch conmutado ofrece dominios de colisión separados por puerto, Full Duplex y soporte de VLANs."
      };
      capacityAnalysis = "Capacidad dedicada sin colisiones: Ancho de banda no compartido gracias al aprendizaje dinámico de tablas MAC.";
      coverageAnalysis = `Cobertura local estándar dentro de los 100 metros del cableado estructurado.`;
      processingAnalysis = "Capa 2: Filtrado y reenvío selectivo por hardware (ASIC) basado en direcciones MAC de destino.";
      discardedOptions = [
        "Hub Ethernet: Descartado por obsoleto; compartiría el ancho de banda y generaría colisiones CSMA/CD ineficientes.",
        "Repetidor: Innecesario dado que la distancia está dentro de los 100m permitidos.",
        "Gateway: Innecesario para tráfico local dentro de la misma subred."
      ];
    }

    this.renderRecommendation({
      deviceType,
      recommendedModel,
      capacityAnalysis,
      coverageAnalysis,
      processingAnalysis,
      discardedOptions,
      inputs: { env, dist, proto, poe, traffic, redundancy }
    });
  }

  renderRecommendation(data) {
    const resPanel = document.getElementById("advResultPanel");
    if (!resPanel) return;

    resPanel.innerHTML = `
      <div class="bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/40 rounded-xl p-5 shadow-2xl space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
          <div>
            <span class="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">Dictamen del Consultor de Redes (UPTC 2026)</span>
            <h3 class="text-lg font-bold text-white mt-0.5">${data.deviceType}</h3>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-bold font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/50">
            ${data.recommendedModel.fabricante} ${data.recommendedModel.modelo}
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div class="bg-slate-800/70 border border-slate-700 p-3 rounded-lg">
            <div class="text-[11px] font-mono text-cyan-400 font-bold uppercase">1. Capacidad Justificada</div>
            <p class="text-xs text-slate-300 mt-1 leading-relaxed">${data.capacityAnalysis}</p>
          </div>
          <div class="bg-slate-800/70 border border-slate-700 p-3 rounded-lg">
            <div class="text-[11px] font-mono text-emerald-400 font-bold uppercase">2. Cobertura Evaluada</div>
            <p class="text-xs text-slate-300 mt-1 leading-relaxed">${data.coverageAnalysis}</p>
          </div>
          <div class="bg-slate-800/70 border border-slate-700 p-3 rounded-lg">
            <div class="text-[11px] font-mono text-purple-400 font-bold uppercase">3. Nivel de Procesamiento</div>
            <p class="text-xs text-slate-300 mt-1 leading-relaxed">${data.processingAnalysis}</p>
          </div>
        </div>

        <!-- Ficha Técnica del Modelo Seleccionado -->
        <div class="p-4 bg-slate-950/80 border border-cyan-500/30 rounded-lg space-y-2 text-xs">
          <div class="font-bold text-slate-200 text-sm flex items-center justify-between">
            <span>Ficha del Equipo Seleccionado del Catálogo:</span>
            <span class="text-emerald-400 font-mono font-bold">${data.recommendedModel.precio}</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-slate-300 pt-1">
            <div><span class="text-slate-500">Fabricante:</span> <span class="font-semibold text-white">${data.recommendedModel.fabricante}</span></div>
            <div><span class="text-slate-500">Modelo:</span> <span class="font-semibold text-cyan-300">${data.recommendedModel.modelo}</span></div>
            <div><span class="text-slate-500">Puertos:</span> <span class="text-slate-200">${data.recommendedModel.puertos}</span></div>
            <div><span class="text-slate-500">Velocidad / Alcance:</span> <span class="text-slate-200">${data.recommendedModel.velocidad || data.recommendedModel.alcance || 'Estándar'}</span></div>
          </div>
          <p class="text-slate-300 italic pt-1 border-t border-slate-800 text-[11.5px]">
            "${data.recommendedModel.justificacion}"
          </p>
        </div>

        <!-- Opciones Técnicamente Descartadas -->
        <div class="bg-rose-950/30 border border-rose-900/50 p-3 rounded-lg text-xs space-y-1">
          <div class="font-bold text-rose-300 flex items-center gap-1.5">
            <span>Análisis de Alternativas Descartadas por el Consultor:</span>
          </div>
          <ul class="list-disc pl-5 space-y-0.5 text-rose-200/90 text-[11.5px]">
            ${data.discardedOptions.map(opt => `<li>${opt}</li>`).join("")}
          </ul>
        </div>
      </div>
    `;

    // Guardar texto del memo para copiar
    window.lastAdvisorMemo = `DICTAMEN TÉCNICO DE CONSULTORÍA EN REDES DE DATOS (UPTC 2026)
DISPOSITIVO SELECCIONADO: ${data.deviceType}
MODELO RECOMENDADO: ${data.recommendedModel.fabricante} ${data.recommendedModel.modelo} (${data.recommendedModel.precio})

1. SUSTENTACIÓN DE CAPACIDAD:
${data.capacityAnalysis}

2. SUSTENTACIÓN DE COBERTURA:
${data.coverageAnalysis}

3. SUSTENTACIÓN DE PROCESAMIENTO:
${data.processingAnalysis}

ALTERNATIVAS DESCARTADAS:
${data.discardedOptions.map(o => '- ' + o).join('\n')}
`;
  }

  copyMemoToClipboard() {
    if (!window.lastAdvisorMemo) {
      alert("Por favor realiza una evaluación primero.");
      return;
    }
    navigator.clipboard.writeText(window.lastAdvisorMemo).then(() => {
      alert("¡Dictamen técnico copiado al portapapeles con éxito!");
    }).catch(() => {
      alert("No se pudo copiar automáticamente. Puedes seleccionarlo manualmente.");
    });
  }

  renderCatalogTables() {
    const hubTable = document.getElementById("catalogHubTableBody");
    const gwTable = document.getElementById("catalogGwTableBody");
    const repTable = document.getElementById("catalogRepTableBody");

    if (hubTable) {
      hubTable.innerHTML = CATALOG_HUBS.map(h => `
        <tr class="border-b border-slate-800 hover:bg-slate-800/40 text-xs">
          <td class="py-2 px-3 font-semibold text-cyan-400">${h.modelo}</td>
          <td class="py-2 px-3 text-slate-300">${h.tipo}</td>
          <td class="py-2 px-3 font-mono text-slate-400">${h.puertos}</td>
          <td class="py-2 px-3 text-slate-400">${h.velocidad}</td>
          <td class="py-2 px-3 font-mono text-emerald-400 font-bold">${h.precio}</td>
          <td class="py-2 px-3 text-slate-400 text-[11px] leading-tight">${h.justificacion}</td>
        </tr>
      `).join("");
    }

    if (gwTable) {
      gwTable.innerHTML = CATALOG_GATEWAYS.map(g => `
        <tr class="border-b border-slate-800 hover:bg-slate-800/40 text-xs">
          <td class="py-2 px-3 font-semibold text-amber-400">${g.modelo}</td>
          <td class="py-2 px-3 text-slate-300">${g.tipo}</td>
          <td class="py-2 px-3 font-mono text-slate-400">${g.puertos}</td>
          <td class="py-2 px-3 font-mono text-slate-400">${g.puertosSeriales}</td>
          <td class="py-2 px-3 text-slate-300 text-[11px]">${g.protocolos}</td>
          <td class="py-2 px-3 font-mono text-emerald-400 font-bold">${g.precio}</td>
          <td class="py-2 px-3 text-slate-400 text-[11px] leading-tight">${g.justificacion}</td>
        </tr>
      `).join("");
    }

    if (repTable) {
      repTable.innerHTML = CATALOG_REPEATERS.map(r => `
        <tr class="border-b border-slate-800 hover:bg-slate-800/40 text-xs">
          <td class="py-2 px-3 font-semibold text-emerald-400">${r.modelo}</td>
          <td class="py-2 px-3 text-slate-300">${r.tipo}</td>
          <td class="py-2 px-3 text-slate-400">${r.medio}</td>
          <td class="py-2 px-3 font-mono text-slate-400">${r.velocidad}</td>
          <td class="py-2 px-3 text-cyan-300 font-mono">${r.alcance}</td>
          <td class="py-2 px-3 font-mono text-emerald-400 font-bold">${r.precio}</td>
          <td class="py-2 px-3 text-slate-400 text-[11px] leading-tight">${r.justificacion}</td>
        </tr>
      `).join("");
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("btnAdvEvaluate")) {
    window.advisor = new NetworkAdvisor();
    // Ejecutar evaluación inicial
    window.advisor.evaluateScenario();
  }
});
