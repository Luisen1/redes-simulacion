/**
 * Simulador de Concentrador (Hub) y Protocolo CSMA/CD
 * UPTC - Redes de Datos 2026
 */

class HubSimulator {
  constructor() {
    this.canvas = document.getElementById("hubCanvas");
    this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
    this.animationId = null;
    
    // Estado de simulación
    this.state = "IDLE"; // IDLE, TRANSMITTING, FLOODING, COLLISION, JAMMING, BACKOFF
    this.speed = 1.0;
    this.promiscuousNode = null; // Nodo en modo sniffer (ej. 'C')
    this.isSwitchMode = false; // Modo comparativo con Switch Capa 2
    
    // Métricas
    this.stats = {
      framesSent: 0,
      collisions: 0,
      framesDelivered: 0,
      sniffedPackets: 0
    };

    // Nodos en la red
    this.nodes = {
      A: { id: 'A', name: 'Host A', ip: '192.168.1.10', mac: '00:1A:2B:3C:4D:01', x: 120, y: 100, port: 1, state: 'idle', backoff: 0, collisions: 0 },
      B: { id: 'B', name: 'Host B', ip: '192.168.1.20', mac: '00:1A:2B:3C:4D:02', x: 480, y: 100, port: 2, state: 'idle', backoff: 0, collisions: 0 },
      C: { id: 'C', name: 'Host C (Sniffer)', ip: '192.168.1.30', mac: '00:1A:2B:3C:4D:03', x: 120, y: 340, port: 3, state: 'idle', backoff: 0, collisions: 0 },
      D: { id: 'D', name: 'Host D', ip: '192.168.1.40', mac: '00:1A:2B:3C:4D:04', x: 480, y: 340, port: 4, state: 'idle', backoff: 0, collisions: 0 }
    };

    // Coordenadas del Hub Central
    this.hub = {
      x: 300,
      y: 220,
      width: 140,
      height: 70,
      state: 'idle',
      collisionEffect: 0,
      jamTimer: 0
    };

    // Paquetes en tránsito
    this.packets = [];
    this.logMessages = [];
    
    this.init();
  }

  init() {
    this.log("Simulador de Concentrador Ethernet inicializado (IEEE 802.3 10BASE-T).", "info");
    this.bindEvents();
    this.startLoop();
    this.updateUI();
  }

  bindEvents() {
    const btnSend = document.getElementById("btnHubSend");
    if (btnSend) {
      btnSend.addEventListener("click", () => {
        const src = document.getElementById("hubSource").value;
        const dst = document.getElementById("hubDest").value;
        if (src === dst) {
          this.log(`Error: El host de origen ${src} no puede ser igual al destino.`, "error");
          return;
        }
        this.sendUnicast(src, dst);
      });
    }

    const btnCollision = document.getElementById("btnHubCollision");
    if (btnCollision) {
      btnCollision.addEventListener("click", () => {
        this.triggerSimultaneousCollision();
      });
    }

    const toggleSniffer = document.getElementById("chkHubSniffer");
    if (toggleSniffer) {
      toggleSniffer.addEventListener("change", (e) => {
        this.promiscuousNode = e.target.checked ? 'C' : null;
        this.log(e.target.checked 
          ? "Modo Promiscuo activado en Host C. Ahora capturará todo el tráfico del bus compartido." 
          : "Modo Promiscuo desactivado.", "warning");
        this.updateUI();
      });
    }

    const toggleSwitchMode = document.getElementById("chkSwitchMode");
    if (toggleSwitchMode) {
      toggleSwitchMode.addEventListener("change", (e) => {
        this.isSwitchMode = e.target.checked;
        const titleEl = document.getElementById("hubModeTitle");
        if (titleEl) {
          titleEl.textContent = this.isSwitchMode ? "MODO SWITCH (Capa 2 - Conmutación MAC)" : "MODO CONCENTRADOR / HUB (Capa 1 - Repetidor Multipuerto)";
        }
        this.log(this.isSwitchMode 
          ? "Cambiado a Modo Switch: La tabla de direcciones MAC filtra tramas unicast al puerto exacto. Sin colisiones entre puertos distintos."
          : "Cambiado a Modo Hub: Todo tráfico es difundido a todos los puertos. Medio compartido half-duplex.", "info");
        this.resetSimulation();
      });
    }

    const btnReset = document.getElementById("btnHubReset");
    if (btnReset) {
      btnReset.addEventListener("click", () => this.resetSimulation());
    }

    const speedSelect = document.getElementById("hubSpeed");
    if (speedSelect) {
      speedSelect.addEventListener("change", (e) => {
        this.speed = parseFloat(e.target.value) || 1.0;
      });
    }
  }

  log(msg, type = "info") {
    const timestamp = new Date().toLocaleTimeString();
    this.logMessages.unshift({ time: timestamp, msg, type });
    if (this.logMessages.length > 25) this.logMessages.pop();
    this.renderLog();
  }

  renderLog() {
    const logBox = document.getElementById("hubLogBox");
    if (!logBox) return;
    logBox.innerHTML = this.logMessages.map(item => {
      let colorClass = "text-slate-300";
      let icon = "[INFO]";
      if (item.type === "error" || item.type === "collision") {
        colorClass = "text-rose-400 font-semibold";
        icon = "[COLISIÓN]";
      } else if (item.type === "warning") {
        colorClass = "text-amber-400";
        icon = "[ALERTA]";
      } else if (item.type === "success") {
        colorClass = "text-emerald-400";
        icon = "[ÉXITO]";
      } else if (item.type === "sniffer") {
        colorClass = "text-purple-400";
        icon = "[SNIFFER]";
      }
      return `<div class="py-1 border-b border-slate-700/40 text-xs font-mono flex items-start gap-1.5">
        <span class="text-slate-500 shrink-0">[${item.time}]</span>
        <span class="shrink-0">${icon}</span>
        <span class="${colorClass}">${item.msg}</span>
      </div>`;
    }).join("");
  }

  sendUnicast(srcId, dstId) {
    if (this.state === "COLLISION" || this.state === "JAMMING") {
      this.log("El medio está saturado por señal JAM. Esperando backoff...", "warning");
      return;
    }

    const src = this.nodes[srcId];
    const dst = this.nodes[dstId];
    src.state = "transmitting";
    this.stats.framesSent++;

    this.log(`[Host ${srcId}] Envía trama Ethernet a [Host ${dstId}]. Dest MAC: ${dst.mac}, Tamaño: 64 Bytes.`, "info");

    // Paquete desde el host hacia el Hub
    this.packets.push({
      id: Math.random(),
      srcId,
      dstId,
      type: "DATA",
      startX: src.x,
      startY: src.y,
      targetX: this.hub.x,
      targetY: this.hub.y,
      currentX: src.x,
      currentY: src.y,
      progress: 0,
      phase: "TO_HUB",
      color: "#06b6d4",
      size: 64,
      payload: `PING ${dst.ip}: seq=1 ttl=64`
    });

    this.state = "TRANSMITTING";
    this.updateUI();
  }

  triggerSimultaneousCollision() {
    this.log(">>> GENERANDO COLISIÓN SIMULTÁNEA: Host A transmite a Host B y Host C transmite a Host D al mismo tiempo.", "warning");
    this.sendUnicast('A', 'B');
    // Generar la colisión casi instantánea
    setTimeout(() => {
      this.sendUnicast('C', 'D');
    }, 150);
  }

  resetSimulation() {
    this.packets = [];
    this.state = "IDLE";
    this.hub.state = "idle";
    this.hub.collisionEffect = 0;
    this.hub.jamTimer = 0;
    Object.values(this.nodes).forEach(n => {
      n.state = "idle";
      n.backoff = 0;
      n.collisions = 0;
    });
    this.log("Simulación reiniciada a estado IDLE.", "info");
    this.updateUI();
  }

  startLoop() {
    const loop = () => {
      this.update();
      this.render();
      this.animationId = requestAnimationFrame(loop);
    };
    this.animationId = requestAnimationFrame(loop);
  }

  update() {
    const dt = 0.016 * this.speed;

    // Actualizar paquetes en tránsito
    for (let i = this.packets.length - 1; i >= 0; i--) {
      const pkt = this.packets[i];
      pkt.progress += 0.012 * this.speed;

      if (pkt.phase === "TO_HUB") {
        pkt.currentX = pkt.startX + (pkt.targetX - pkt.startX) * pkt.progress;
        pkt.currentY = pkt.startY + (pkt.targetY - pkt.startY) * pkt.progress;

        // Comprobar colisión en el camino hacia el Hub si hay más de un paquete
        if (this.packets.length > 1 && !this.isSwitchMode) {
          for (let j = 0; j < this.packets.length; j++) {
            if (i !== j && this.packets[j].phase === "TO_HUB") {
              const dx = pkt.currentX - this.packets[j].currentX;
              const dy = pkt.currentY - this.packets[j].currentY;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 45 || pkt.progress > 0.85) {
                this.handleCollision();
                return;
              }
            }
          }
        }

        if (pkt.progress >= 1.0) {
          // Llegó al Hub/Switch
          this.packets.splice(i, 1);
          this.handleArrivalAtHub(pkt);
        }
      } else if (pkt.phase === "FROM_HUB") {
        pkt.currentX = pkt.startX + (pkt.targetX - pkt.startX) * pkt.progress;
        pkt.currentY = pkt.startY + (pkt.targetY - pkt.startY) * pkt.progress;

        if (pkt.progress >= 1.0) {
          this.packets.splice(i, 1);
          this.handleArrivalAtNode(pkt);
        }
      }
    }

    // Efecto visual de colisión
    if (this.hub.collisionEffect > 0) {
      this.hub.collisionEffect -= dt * 2;
    }

    // Temporizadores de Backoff
    Object.values(this.nodes).forEach(node => {
      if (node.state === "backoff" && node.backoff > 0) {
        node.backoff -= dt;
        if (node.backoff <= 0) {
          node.state = "idle";
          node.backoff = 0;
          this.log(`[Host ${node.id}] Temporizador de Backoff finalizado. Reintentando transmisión...`, "info");
          // Reintentar si era el emisor
          if (node.id === 'A') this.sendUnicast('A', 'B');
          else if (node.id === 'C') this.sendUnicast('C', 'D');
        }
      }
    });

    if (this.packets.length === 0 && this.state !== "JAMMING" && this.state !== "BACKOFF") {
      this.state = "IDLE";
      this.hub.state = "idle";
    }
  }

  handleArrivalAtHub(pkt) {
    this.hub.state = "active";

    if (this.isSwitchMode) {
      // Comportamiento de Switch L2: Reenvía SOLAMENTE al puerto de destino
      const targetNode = this.nodes[pkt.dstId];
      this.log(`[Switch Capa 2] Inspecciona trama: Dest MAC ${targetNode.mac} aprendida en Puerto ${targetNode.port}. Conmutando trama únicamente hacia ${pkt.dstId}.`, "success");
      
      this.packets.push({
        id: Math.random(),
        srcId: pkt.srcId,
        dstId: pkt.dstId,
        targetNodeId: pkt.dstId,
        type: "DATA",
        startX: this.hub.x,
        startY: this.hub.y,
        targetX: targetNode.x,
        targetY: targetNode.y,
        currentX: this.hub.x,
        currentY: this.hub.y,
        progress: 0,
        phase: "FROM_HUB",
        color: "#10b981",
        size: pkt.size,
        payload: pkt.payload
      });
      return;
    }

    // Comportamiento de Hub L1: Flooding indiscriminado a todos los puertos excepto el origen
    this.log(`[Hub Capa 1] Recibe señal en Puerto ${this.nodes[pkt.srcId].port}. Al ser repetidor multipuerto, FLOODING: replica la señal a TODOS los demás puertos!`, "warning");

    Object.keys(this.nodes).forEach(nodeId => {
      if (nodeId !== pkt.srcId) {
        const destNode = this.nodes[nodeId];
        this.packets.push({
          id: Math.random(),
          srcId: pkt.srcId,
          dstId: pkt.dstId,
          targetNodeId: nodeId,
          type: "DATA",
          startX: this.hub.x,
          startY: this.hub.y,
          targetX: destNode.x,
          targetY: destNode.y,
          currentX: this.hub.x,
          currentY: this.hub.y,
          progress: 0,
          phase: "FROM_HUB",
          color: (nodeId === pkt.dstId) ? "#06b6d4" : "#f59e0b",
          size: pkt.size,
          payload: pkt.payload
        });
      }
    });

    this.state = "FLOODING";
  }

  handleArrivalAtNode(pkt) {
    const arrivingAt = this.nodes[pkt.targetNodeId];

    if (pkt.targetNodeId === pkt.dstId) {
      // Destinatario legítimo
      arrivingAt.state = "received";
      this.stats.framesDelivered++;
      this.log(`[Host ${pkt.targetNodeId}] ¡Trama recibida con éxito! Coincidencia de MAC de destino (${arrivingAt.mac}). Payload procesado: "${pkt.payload}".`, "success");
      setTimeout(() => { if (arrivingAt.state === "received") arrivingAt.state = "idle"; }, 2000);
    } else {
      // Host no destinatario
      if (pkt.targetNodeId === this.promiscuousNode) {
        // En modo promiscuo (Sniffer)
        this.stats.sniffedPackets++;
        arrivingAt.state = "sniffing";
        this.log(`[Host ${pkt.targetNodeId} SNIFFER] [ALERTA DE SEGURIDAD]: Host ${pkt.targetNodeId} interceptó la trama confidencial entre ${pkt.srcId} y ${pkt.dstId} gracias al flooding! Contenido: "${pkt.payload}".`, "sniffer");
        setTimeout(() => { if (arrivingAt.state === "sniffing") arrivingAt.state = "idle"; }, 3000);
      } else {
        // Descarte normal
        this.log(`[Host ${pkt.targetNodeId}] Trama descartada: MAC de destino (${this.nodes[pkt.dstId].mac}) no coincide con la propia (${arrivingAt.mac}).`, "info");
      }
    }

    const srcNode = this.nodes[pkt.srcId];
    if (srcNode && srcNode.state === "transmitting") {
      srcNode.state = "idle";
    }
    this.updateUI();
  }

  handleCollision() {
    this.state = "COLLISION";
    this.hub.state = "collision";
    this.hub.collisionEffect = 1.0;
    this.stats.collisions++;
    this.packets = []; // Destruir tramas colisionadas

    this.log("[COLISIÓN] ¡Interferencia detectada en el medio compartido! Las señales eléctricas interfirieron superando el umbral de voltaje de 10BASE-T.", "collision");

    // Paso CSMA/CD 1: Emitir JAM Signal (32 bits)
    setTimeout(() => {
      this.state = "JAMMING";
      this.log("[CSMA/CD Paso 1]: Transmisores emiten SEÑAL JAM de 32 bits para asegurar que todas las estaciones reconozcan la colisión en el bus.", "warning");

      // Paso CSMA/CD 2: Backoff Exponencial Truncado
      setTimeout(() => {
        this.executeBackoff();
      }, 1200);
    }, 600);

    this.updateUI();
  }

  executeBackoff() {
    this.state = "BACKOFF";
    this.hub.state = "idle";

    // Algoritmo de backoff para Host A y Host C
    ['A', 'C'].forEach(id => {
      const node = this.nodes[id];
      node.collisions++;
      const k = Math.min(node.collisions, 10);
      const maxSlots = Math.pow(2, k) - 1;
      const r = Math.floor(Math.random() * (maxSlots + 1));
      // slotTime simulado en segundos (ej. entre 0.8s y 3.5s para visualización)
      const slotTimeSim = 0.8;
      node.backoff = (r + 1) * slotTimeSim;
      node.state = "backoff";

      this.log(`Backoff: CSMA/CD Backoff [Host ${id}]: Colisión #${node.collisions} (k=${k}, rango [0, ${maxSlots}]). Número aleatorio r=${r}. Espera: ${node.backoff.toFixed(2)} segundos.`, "info");
    });

    this.updateUI();
  }

  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Fondo técnico con cuadrícula sutil
    ctx.strokeStyle = "rgba(51, 65, 85, 0.25)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Dibujar enlaces (cables de cobre par trenzado 10BASE-T)
    Object.values(this.nodes).forEach(node => {
      ctx.beginPath();
      ctx.moveTo(node.x, node.y);
      ctx.lineTo(this.hub.x, this.hub.y);
      
      if (this.state === "COLLISION") {
        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = 3;
      } else if (this.state === "JAMMING") {
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);
      } else {
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Etiqueta de puerto en el cable
      const midX = (node.x + this.hub.x) / 2;
      const midY = (node.y + this.hub.y) / 2;
      ctx.fillStyle = "#94a3b8";
      ctx.font = "10px monospace";
      ctx.fillText(`Port ${node.port}`, midX - 15, midY - 6);
    });

    // Dibujar Hub o Switch en el centro
    this.renderHub(ctx);

    // Dibujar Nodos (Hosts)
    Object.values(this.nodes).forEach(node => {
      this.renderNode(ctx, node);
    });

    // Dibujar Paquetes en Tránsito
    this.packets.forEach(pkt => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(pkt.currentX, pkt.currentY, 7, 0, Math.PI * 2);
      ctx.fillStyle = pkt.color;
      ctx.shadowColor = pkt.color;
      ctx.shadowBlur = 10;
      ctx.fill();

      // Anillo exterior
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Etiqueta de la trama
      ctx.fillStyle = "#f8fafc";
      ctx.font = "bold 9px sans-serif";
      ctx.fillText(`[${pkt.srcId}→${pkt.dstId}]`, pkt.currentX + 10, pkt.currentY - 4);
      ctx.restore();
    });

    // Efecto visual de onda expansiva de colisión
    if (this.hub.collisionEffect > 0) {
      const radius = (1.0 - this.hub.collisionEffect) * 110 + 20;
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.hub.x, this.hub.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(244, 63, 94, ${this.hub.collisionEffect})`;
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();
    }
  }

  renderHub(ctx) {
    const h = this.hub;
    const isCol = this.state === "COLLISION";
    const isJam = this.state === "JAMMING";

    ctx.save();
    // Caja del dispositivo
    ctx.fillStyle = isCol ? "#7f1d1d" : (this.isSwitchMode ? "#0f172a" : "#1e293b");
    ctx.strokeStyle = isCol ? "#ef4444" : (this.isSwitchMode ? "#10b981" : "#38bdf8");
    ctx.lineWidth = 2;
    ctx.shadowColor = isCol ? "#ef4444" : (this.isSwitchMode ? "#10b981" : "#38bdf8");
    ctx.shadowBlur = isCol || this.state === "FLOODING" ? 16 : 6;

    const rx = h.x - h.width / 2;
    const ry = h.y - h.height / 2;
    ctx.fillRect(rx, ry, h.width, h.height);
    ctx.strokeRect(rx, ry, h.width, h.height);

    // Texto Central
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(this.isSwitchMode ? "SWITCH L2" : "ETHERNET HUB", h.x, h.y - 8);

    ctx.font = "10px monospace";
    ctx.fillStyle = isCol ? "#fca5a5" : (isJam ? "#fef08a" : "#94a3b8");
    const statusText = isCol ? "COLISIÓN" : (isJam ? "SEÑAL JAM" : (this.isSwitchMode ? "Capa 2 (MAC Table)" : "Capa 1 (Multiport)"));
    ctx.fillText(statusText, h.x, h.y + 10);

    // LEDs de Puertos 1 a 4
    for (let p = 1; p <= 4; p++) {
      const ledX = rx + 25 + (p - 1) * 28;
      const ledY = ry + h.height - 14;
      ctx.beginPath();
      ctx.arc(ledX, ledY, 4, 0, Math.PI * 2);
      ctx.fillStyle = isCol ? "#ef4444" : (this.state === "FLOODING" || this.state === "TRANSMITTING" ? "#10b981" : "#334155");
      ctx.fill();
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "#64748b";
      ctx.font = "8px monospace";
      ctx.fillText(`P${p}`, ledX, ledY + 11);
    }

    ctx.restore();
  }

  renderNode(ctx, node) {
    ctx.save();
    const isPromiscuous = (node.id === this.promiscuousNode);
    let borderColor = "#64748b";
    let bgColor = "#1e293b";

    if (node.state === "transmitting") {
      borderColor = "#06b6d4";
      bgColor = "#083344";
    } else if (node.state === "received") {
      borderColor = "#10b981";
      bgColor = "#064e3b";
    } else if (node.state === "sniffing") {
      borderColor = "#a855f7";
      bgColor = "#3b0764";
    } else if (node.state === "backoff") {
      borderColor = "#f59e0b";
      bgColor = "#451a03";
    }

    // Marco del Host (PC)
    const cardW = 100;
    const cardH = 65;
    const left = node.x - cardW / 2;
    const top = node.y - cardH / 2;

    ctx.fillStyle = bgColor;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = isPromiscuous ? 2.5 : 1.5;
    ctx.shadowColor = borderColor;
    ctx.shadowBlur = node.state !== "idle" ? 12 : 2;

    ctx.fillRect(left, top, cardW, cardH);
    ctx.strokeRect(left, top, cardW, cardH);

    // Título del Nodo
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${node.name}`, node.x, top + 15);

    // IP y MAC
    ctx.font = "9px monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(node.ip, node.x, top + 28);
    ctx.fillText(node.mac.substring(9), node.x, top + 40);

    // Estado / Backoff
    if (node.state === "backoff") {
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 9px monospace";
      ctx.fillText(`Backoff: ${node.backoff.toFixed(1)}s`, node.x, top + 55);
    } else if (node.state === "sniffing") {
      ctx.fillStyle = "#c084fc";
      ctx.font = "bold 9px sans-serif";
      ctx.fillText("SNIFFED", node.x, top + 55);
    } else if (node.state === "received") {
      ctx.fillStyle = "#34d399";
      ctx.font = "bold 9px sans-serif";
      ctx.fillText("RECIBIDO", node.x, top + 55);
    } else if (isPromiscuous) {
      ctx.fillStyle = "#a855f7";
      ctx.font = "8px sans-serif";
      ctx.fillText("Modo Promiscuo", node.x, top + 55);
    }

    ctx.restore();
  }

  updateUI() {
    const elSent = document.getElementById("statHubSent");
    if (elSent) elSent.textContent = this.stats.framesSent;

    const elColl = document.getElementById("statHubCollisions");
    if (elColl) elColl.textContent = this.stats.collisions;

    const elDeliv = document.getElementById("statHubDelivered");
    if (elDeliv) elDeliv.textContent = this.stats.framesDelivered;

    const elSniff = document.getElementById("statHubSniffed");
    if (elSniff) elSniff.textContent = this.stats.sniffedPackets;

    const elState = document.getElementById("hubStateBadge");
    if (elState) {
      elState.textContent = this.state;
      elState.className = "px-2.5 py-1 rounded text-xs font-mono font-bold uppercase " +
        (this.state === "COLLISION" ? "bg-rose-950 text-rose-300 border border-rose-600" :
         this.state === "JAMMING" ? "bg-amber-950 text-amber-300 border border-amber-600 animate-pulse" :
         this.state === "BACKOFF" ? "bg-indigo-950 text-indigo-300 border border-indigo-600" :
         this.state === "FLOODING" ? "bg-cyan-950 text-cyan-300 border border-cyan-600" :
         "bg-slate-800 text-slate-300 border border-slate-700");
    }
  }
}

// Inicializador cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("hubCanvas")) {
    window.hubSim = new HubSimulator();
  }
});
