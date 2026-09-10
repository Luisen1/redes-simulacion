/**
 * Simulador de Repetidor Digital y Osciloscopio de Señal
 * UPTC - Redes de Datos 2026
 * Modelado físico de atenuación, filtrado, amplificación y reclocking (3R)
 */

class RepeaterSimulator {
  constructor() {
    this.canvas = document.getElementById("repeaterCanvas");
    this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
    this.animationId = null;

    // Parámetros físicos configurables
    this.medium = "cobre"; // "cobre", "coaxial", "fibra", "wifi"
    this.distance = 180; // Metros
    this.noiseLevel = 25; // Porcentaje 0 - 100
    this.isRepeaterEnabled = true;
    this.isWifiExtenderMode = false;
    this.timeOffset = 0;

    // Métricas calculadas
    this.metrics = {
      attenuationDb: 0,
      receivedAmplitude: 1.0,
      snr: 0,
      ber: 0, // Bit Error Rate
      jitter: 0,
      throughputMbps: 100
    };

    this.init();
  }

  init() {
    this.bindEvents();
    this.startOscilloscope();
    this.updateCalculations();
  }

  bindEvents() {
    const mediumSelect = document.getElementById("repMedium");
    if (mediumSelect) {
      mediumSelect.addEventListener("change", (e) => {
        this.medium = e.target.value;
        this.updateDistanceLimits();
        this.updateCalculations();
      });
    }

    const distSlider = document.getElementById("repDistance");
    const distVal = document.getElementById("repDistanceVal");
    if (distSlider) {
      distSlider.addEventListener("input", (e) => {
        this.distance = parseFloat(e.target.value);
        if (distVal) distVal.textContent = `${this.distance} m`;
        this.updateCalculations();
      });
    }

    const noiseSlider = document.getElementById("repNoise");
    const noiseVal = document.getElementById("repNoiseVal");
    if (noiseSlider) {
      noiseSlider.addEventListener("input", (e) => {
        this.noiseLevel = parseFloat(e.target.value);
        if (noiseVal) noiseVal.textContent = `${this.noiseLevel}%`;
        this.updateCalculations();
      });
    }

    const chkRepeater = document.getElementById("chkEnableRepeater");
    if (chkRepeater) {
      chkRepeater.addEventListener("change", (e) => {
        this.isRepeaterEnabled = e.target.checked;
        this.updateCalculations();
      });
    }

    const chkWifiMode = document.getElementById("chkWifiMode");
    if (chkWifiMode) {
      chkWifiMode.addEventListener("change", (e) => {
        this.isWifiExtenderMode = e.target.checked;
        const wifiPanel = document.getElementById("wifiPenaltyPanel");
        if (wifiPanel) {
          wifiPanel.classList.toggle("hidden", !this.isWifiExtenderMode);
        }
        this.updateCalculations();
      });
    }
  }

  updateDistanceLimits() {
    const distSlider = document.getElementById("repDistance");
    const distVal = document.getElementById("repDistanceVal");
    if (!distSlider) return;

    if (this.medium === "fibra") {
      distSlider.max = 3000;
      distSlider.value = 1500;
      this.distance = 1500;
    } else if (this.medium === "wifi") {
      distSlider.max = 200;
      distSlider.value = 75;
      this.distance = 75;
    } else {
      distSlider.max = 400;
      distSlider.value = 180;
      this.distance = 180;
    }
    if (distVal) distVal.textContent = `${this.distance} m`;
  }

  updateCalculations() {
    // Coeficiente de atenuación según medio
    let alpha = 0.012; // dB por metro en cable UTP Cat6
    let maxStandardDist = 100;

    if (this.medium === "cobre") {
      alpha = 0.018;
      maxStandardDist = 100;
    } else if (this.medium === "coaxial") {
      alpha = 0.010;
      maxStandardDist = 185;
    } else if (this.medium === "fibra") {
      alpha = 0.0003; // ~0.3 dB por km
      maxStandardDist = 2000;
    } else if (this.medium === "wifi") {
      alpha = 0.08;
      maxStandardDist = 45;
    }

    // Si el repetidor está activado, la distancia efectiva se evalúa en dos segmentos de d/2
    let effDist = this.distance;
    if (this.isRepeaterEnabled) {
      effDist = this.distance / 2; // El repetidor regenera a la mitad
    }

    // Atenuación en decibelios: A(dB) = alpha * d
    this.metrics.attenuationDb = (alpha * effDist).toFixed(1);

    // Amplitud recibida: factor entre 0.05 y 1.0
    // V = V0 * 10^(-A/20)
    let lossFactor = Math.pow(10, -(alpha * effDist) / 20);
    this.metrics.receivedAmplitude = Math.max(0.04, Math.min(1.0, lossFactor));

    // SNR estimado
    const noiseFactor = (this.noiseLevel / 100) * 0.4 + 0.02;
    this.metrics.snr = (20 * Math.log10(this.metrics.receivedAmplitude / noiseFactor)).toFixed(1);

    // Tasa de error de bit (BER)
    if (effDist > maxStandardDist * 1.5 && !this.isRepeaterEnabled) {
      this.metrics.ber = "10⁻¹ (Crítico - Enlace Caído)";
      this.metrics.jitter = "Alto (> 35 ns)";
    } else if (effDist > maxStandardDist && !this.isRepeaterEnabled) {
      this.metrics.ber = "10⁻³ (Degradación Severa)";
      this.metrics.jitter = "Medio (~18 ns)";
    } else {
      this.metrics.ber = "< 10⁻¹² (Enlace Saludable)";
      this.metrics.jitter = "< 1.2 ns (Restablecido)";
    }

    // Throughput
    let baseTp = 100; // Mbps
    if (this.medium === "fibra") baseTp = 1000;
    if (this.isRepeaterEnabled && this.isWifiExtenderMode) {
      // Penalización Half-Duplex en repetidor Wi-Fi: divide throughput al 50%
      this.metrics.throughputMbps = (baseTp * 0.48 * (1 - (this.distance / 250) * 0.3)).toFixed(1);
    } else if (effDist > maxStandardDist * 1.4 && !this.isRepeaterEnabled) {
      this.metrics.throughputMbps = (baseTp * 0.1).toFixed(1);
    } else {
      this.metrics.throughputMbps = baseTp.toFixed(0);
    }

    this.updateUI();
  }

  updateUI() {
    const elAtt = document.getElementById("metricAttDb");
    if (elAtt) elAtt.textContent = `${this.metrics.attenuationDb} dB`;

    const elSnr = document.getElementById("metricSnr");
    if (elSnr) elSnr.textContent = `${this.metrics.snr} dB`;

    const elBer = document.getElementById("metricBer");
    if (elBer) {
      elBer.textContent = this.metrics.ber;
      elBer.className = "font-mono text-xs " + (this.metrics.ber.includes("Crítico") ? "text-rose-400 font-bold" : "text-emerald-400");
    }

    const elJitter = document.getElementById("metricJitter");
    if (elJitter) elJitter.textContent = this.metrics.jitter;

    const elTp = document.getElementById("metricThroughput");
    if (elTp) elTp.textContent = `${this.metrics.throughputMbps} Mbps`;

    const repBadge = document.getElementById("repStatusBadge");
    if (repBadge) {
      if (this.isRepeaterEnabled) {
        repBadge.textContent = "REPETIDOR ACTIVO (3R: Re-amp, Re-shape, Re-clock)";
        repBadge.className = "px-3 py-1 bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-semibold rounded-full";
      } else {
        repBadge.textContent = "SIN REPETIDOR (Atenuación directa)";
        repBadge.className = "px-3 py-1 bg-rose-950/80 border border-rose-500/60 text-rose-300 text-xs font-semibold rounded-full";
      }
    }
  }

  startOscilloscope() {
    const render = () => {
      this.timeOffset += 0.04;
      this.drawOscilloscope();
      this.animationId = requestAnimationFrame(render);
    };
    this.animationId = requestAnimationFrame(render);
  }

  drawOscilloscope() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Cuadrícula estilo osciloscopio digital (color verde fósforo sutil sobre fondo carbón)
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(16, 185, 129, 0.12)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Dividir en 3 canales de visualización vertical:
    // Canal 1: Señal Transmitida (TX Original)
    // Canal 2: Señal en el Medio Físico (Atenuada + Ruido + Dispersión)
    // Canal 3: Señal de Salida (Con o sin Repetidor 3R)

    const chHeight = h / 3;

    this.drawChannelLabel(ctx, 0, 18, "CANAL 1: Señal Digital Transmitida (Emisor - Forma de Onda Cuadrada Ideal)", "#38bdf8");
    this.drawSignalTX(ctx, 0, chHeight, w);

    this.drawChannelLabel(ctx, chHeight, chHeight + 18, `CANAL 2: Señal en el Cable tras ${this.distance}m (Atenuación: -${this.metrics.attenuationDb} dB + Ruido EMI)`, "#f59e0b");
    this.drawSignalDegraded(ctx, chHeight, chHeight * 2, w);

    const ch3Title = this.isRepeaterEnabled
      ? "CANAL 3: Señal Tras Repetidor (Proceso 3R: Amplificada, Filtrada y Reclockeada)"
      : "CANAL 3: Señal en Receptor Sin Repetidor (Margen de Ruido y Jitter Degradados)";
    this.drawChannelLabel(ctx, chHeight * 2, chHeight * 2 + 18, ch3Title, this.isRepeaterEnabled ? "#10b981" : "#f43f5e");
    this.drawSignalOutput(ctx, chHeight * 2, h, w);
  }

  drawChannelLabel(ctx, topY, textY, label, color) {
    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
    ctx.fillRect(8, topY + 4, 480, 18);
    ctx.fillStyle = color;
    ctx.font = "bold 10px monospace";
    ctx.fillText(label, 12, textY);
    ctx.restore();
  }

  // Generador de bits virtuales (secuencia repetitiva: 1, 0, 1, 1, 0, 1, 0, 0)
  getBitAt(t) {
    const pattern = [1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0];
    const bitIndex = Math.floor(t) % pattern.length;
    return pattern[bitIndex >= 0 ? bitIndex : bitIndex + pattern.length];
  }

  drawSignalTX(ctx, topY, bottomY, w) {
    const midY = topY + (bottomY - topY) / 2 + 6;
    const amp = 30;

    ctx.save();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let x = 0; x < w; x++) {
      const t = (x * 0.02) - this.timeOffset;
      const bit = this.getBitAt(t);
      const targetY = midY - (bit ? amp : -amp);
      if (x === 0) ctx.moveTo(x, targetY);
      else ctx.lineTo(x, targetY);
    }
    ctx.shadowColor = "#38bdf8";
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.restore();
  }

  drawSignalDegraded(ctx, topY, bottomY, w) {
    const midY = topY + (bottomY - topY) / 2 + 6;
    const baseAmp = 30;
    const receivedAmp = baseAmp * this.metrics.receivedAmplitude;
    const noiseAmp = (this.noiseLevel / 100) * 16;
    const dispersion = Math.min(12, this.distance * 0.035);

    ctx.save();
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 1.8;
    ctx.beginPath();

    for (let x = 0; x < w; x++) {
      const t = (x * 0.02) - this.timeOffset;
      // Promedio móvil para simular redondeo capacitivo (filtro paso bajo del cable)
      let smoothedBit = 0;
      const samples = Math.floor(dispersion) + 1;
      for (let s = -samples; s <= samples; s++) {
        smoothedBit += this.getBitAt(t + s * 0.015);
      }
      smoothedBit /= (samples * 2 + 1);

      // Ruido analógico
      const noise = (Math.sin(x * 0.4 + this.timeOffset * 5) * 0.5 + (Math.random() - 0.5)) * noiseAmp;
      const sigVal = (smoothedBit - 0.5) * 2; // -1 a +1
      const currentY = midY - (sigVal * receivedAmp + noise);

      if (x === 0) ctx.moveTo(x, currentY);
      else ctx.lineTo(x, currentY);
    }
    ctx.shadowColor = "#f59e0b";
    ctx.shadowBlur = 4;
    ctx.stroke();
    ctx.restore();
  }

  drawSignalOutput(ctx, topY, bottomY, w) {
    const midY = topY + (bottomY - topY) / 2 + 6;
    const baseAmp = 30;

    ctx.save();
    if (this.isRepeaterEnabled) {
      // Con Repetidor 3R: La señal se reconstituye limpia, cuadrada y sincronizada
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let x = 0; x < w; x++) {
        const t = (x * 0.02) - this.timeOffset;
        const bit = this.getBitAt(t);
        const targetY = midY - (bit ? baseAmp : -baseAmp);
        if (x === 0) ctx.moveTo(x, targetY);
        else ctx.lineTo(x, targetY);
      }
      ctx.shadowColor = "#10b981";
      ctx.shadowBlur = 8;
      ctx.stroke();

      // Indicadores de proceso 3R
      ctx.fillStyle = "#34d399";
      ctx.font = "9px monospace";
      ctx.fillText("[1. Re-amplificación: Ganancia +18dB] [2. Filtrado: Umbral V_th=0V] [3. Reclocking: PLL Lock]", 20, bottomY - 6);
    } else {
      // Sin Repetidor: La señal se degrada aún más hasta el receptor final
      const severeLoss = Math.max(0.02, Math.pow(10, -(0.018 * this.distance) / 20));
      const receivedAmp = baseAmp * severeLoss;
      const noiseAmp = (this.noiseLevel / 100) * 22;

      ctx.strokeStyle = "#f43f5e";
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      for (let x = 0; x < w; x++) {
        const t = (x * 0.02) - this.timeOffset;
        let smoothedBit = 0;
        const samples = 8;
        for (let s = -samples; s <= samples; s++) smoothedBit += this.getBitAt(t + s * 0.02);
        smoothedBit /= (samples * 2 + 1);

        const noise = (Math.sin(x * 0.3) * 0.6 + (Math.random() - 0.5)) * noiseAmp;
        const sigVal = (smoothedBit - 0.5) * 2;
        const currentY = midY - (sigVal * receivedAmp + noise);

        if (x === 0) ctx.moveTo(x, currentY);
        else ctx.lineTo(x, currentY);
      }
      ctx.shadowColor = "#f43f5e";
      ctx.shadowBlur = 4;
      ctx.stroke();

      ctx.fillStyle = "#fb7185";
      ctx.font = "9px monospace";
      ctx.fillText(`[ALERTA] Distancia crítica excedida (${this.distance}m > 100m). Ojo digital cerrado. Paquetes descartados por CRC inválido.`, 20, bottomY - 6);
    }
    ctx.restore();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("repeaterCanvas")) {
    window.repSim = new RepeaterSimulator();
  }
});
