// training.js
const Training = {
  async startCalc() {
    UI.validarTodo();
    if (document.getElementById("calcBtn").disabled) return;

    if (!AppState.isPremium) {
      const puedeCalcular = await AppState.incrementarCalculo();
      if (!puedeCalcular) return;
    }

    setTimeout(() => {
      this.calculate();
      Utils.showToast("✓ CALCULADO", 'success');
      document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
      Utils.vibrate(50);
      Utils.playSound('success');
    }, 300);
  },

  calculate() {
    const username = AppState.currentUserData?.username || '';
    const age = parseInt(document.getElementById("age").value);
    const time = Utils.parseTime(document.getElementById("time").value);

    if (!username || !age || isNaN(time)) {
      Utils.showToast("> COMPLETA TODOS LOS CAMPOS CORRECTAMENTE_", 'error');
      return;
    }

    const ritmoBase = time / 6;
    const fcMax = 220 - age;
    const ul = Math.round(fcMax * 0.92 * 1.03);

    const pred = [
      { dist: 2, color: "var(--accent-blue)", ritmo: ritmoBase * 0.98 },
      { dist: 6, color: "var(--accent-green)", ritmo: ritmoBase },
      { dist: 10, color: "var(--accent-yellow)", ritmo: ritmoBase * 1.05 },
      { dist: 21, color: "var(--accent-red)", ritmo: ritmoBase * 1.12 },
      { dist: 42, color: "var(--accent-purple)", ritmo: ritmoBase * 1.20 }
    ];

    const zones = [
      ["Z1", "RECUPERACIÓN", 0.75, 0.80, 1.35, "z1",
        "<p><strong>🎯 Ritmo:</strong> " + Utils.formatR(ritmoBase * 1.35) + " min/km</p>" +
        "<p><strong>📍 Objetivo:</strong> Recuperación activa después de esfuerzos intensos.</p>" +
        "<p><strong>✅ Beneficios:</strong></p><ul>" +
        "<li>Mejora la circulación sanguínea</li>" +
        "<li>Elimina toxinas (ácido láctico)</li>" +
        "<li>Prepara el cuerpo para próximas sesiones</li></ul>" +
        "<p><strong>😌 Sensación:</strong> Muy fácil, puedes mantener una conversación sin esfuerzo</p>"
      ],
      ["Z2", "BASE", 0.80, 0.90, 1.25, "z2",
        "<p><strong>🎯 Ritmo:</strong> " + Utils.formatR(ritmoBase * 1.25) + " min/km</p>" +
        "<p><strong>📍 Objetivo:</strong> Desarrollar resistencia aeróbica fundamental.</p>" +
        "<p><strong>✅ Beneficios:</strong></p><ul>" +
        "<li>Optimiza la quema de grasas</li>" +
        "<li>Fortalece el corazón</li>" +
        "<li>Mejora la eficiencia metabólica</li></ul>" +
        "<p><strong>😌 Sensación:</strong> Cómodo y controlado, puedes hablar con frases completas</p>"
      ],
      ["Z3", "TEMPO", 0.90, 0.95, 1.15, "z3",
        "<p><strong>🎯 Ritmo:</strong> " + Utils.formatR(ritmoBase * 1.15) + " min/km</p>" +
        "<p><strong>📍 Objetivo:</strong> Elevar el umbral de lactato.</p>" +
        "<p><strong>✅ Beneficios:</strong></p><ul>" +
        "<li>Permite correr más rápido durante más tiempo</li>" +
        "<li>Retrasa la aparición de la fatiga</li>" +
        "<li>Mejora la resistencia a ritmos exigentes</li></ul>" +
        "<p><strong>😌 Sensación:</strong> 'Cómodamente duro', puedes hablar con frases cortas</p>"
      ],
      ["Z4", "UMBRAL", 0.95, 1.02, 1.05, "z4",
        "<p><strong>🎯 Ritmo:</strong> " + Utils.formatR(ritmoBase * 1.05) + " min/km</p>" +
        "<p><strong>📍 Objetivo:</strong> Limpiar y tolerar el lactato.</p>" +
        "<p><strong>✅ Beneficios:</strong></p><ul>" +
        "<li>Mejora la capacidad de mantener ritmos de carrera</li>" +
        "<li>Incrementa la velocidad en competición</li>" +
        "<li>Prepara para esfuerzos sostenidos</li></ul>" +
        "<p><strong>😌 Sensación:</strong> Fuerte, hablar es incómodo, solo palabras sueltas</p>"
      ],
      ["Z5", "VO₂MÁX", 1.02, 1.06, 0.95, "z5",
        "<p><strong>🎯 Ritmo:</strong> " + Utils.formatR(ritmoBase * 0.95) + " min/km</p>" +
        "<p><strong>📍 Objetivo:</strong> Potencia aeróbica máxima.</p>" +
        "<p><strong>✅ Beneficios:</strong></p><ul>" +
        "<li>Aumenta la capacidad del corazón</li>" +
        "<li>Mejora el consumo de oxígeno</li>" +
        "<li>Desarrolla la tolerancia al esfuerzo extremo</li></ul>" +
        "<p><strong>😌 Sensación:</strong> Muy intenso, apenas puedes hablar, solo para intervalos cortos</p>"
      ],
      ["Z6", "VELOCIDAD", 1.06, 1.12, 0.85, "z6",
        "<p><strong>🎯 Ritmo:</strong> " + Utils.formatR(ritmoBase * 0.85) + " min/km</p>" +
        "<p><strong>📍 Objetivo:</strong> Potencia neuromuscular y velocidad.</p>" +
        "<p><strong>✅ Beneficios:</strong></p><ul>" +
        "<li>Mejora la zancada y coordinación</li>" +
        "<li>Aumenta la potencia explosiva</li>" +
        "<li>Desarrolla velocidad punta</li></ul>" +
        "<p><strong>😌 Sensación:</strong> Esfuerzo máximo, sprints cortos con recuperación completa</p>"
      ]
    ];

    const calc = {
      name: username,
      age: age,
      fcMax: fcMax,
      ul: ul,
      zones: zones,
      pred: pred,
      ritmoBase: ritmoBase
    };

    AppState.setLastCalc(calc);
    UI.mostrarResultados(calc);
    this.guardarCalculoAutomatico(calc);
  },

  async guardarCalculoAutomatico(calc) {
    if (!AppState.currentUid) return;

    const ahora = new Date();
    let zonasResumen = calc.zones.map(z => {
      const min = Math.round(calc.ul * z[2]);
      const max = Math.round(calc.ul * z[3]);
      return { zona: z[0], min, max };
    });

    const data = {
      date: ahora.toLocaleDateString('es-ES'),
      hora: ahora.toLocaleTimeString('es-ES'),
      nombre: calc.name,
      edad: calc.age,
      fcMax: calc.fcMax,
      umbral: calc.ul,
      ritmo6k: Utils.formatR(calc.ritmoBase),
      predicciones: calc.pred.map(p => `${p.dist}km:${Utils.formatR(p.ritmo)}`).join(' '),
      resumen: `${calc.name} · ${calc.age} años · 6km: ${Utils.formatR(calc.ritmoBase)}`,
      zonasResumen
    };

    let hist = await Storage.getHistorial(AppState.currentUid);
    hist.unshift(data);
    const lim = AppState.isPremium ? 25 : 10;
    if (hist.length > lim) hist.pop();

    await Storage.saveHistorial(AppState.currentUid, hist);
    await Storage.setUltimoCalculo(AppState.currentUid, calc);

    if (document.getElementById('tab-historial').classList.contains('active')) {
      UI.cargarHistorial();
    }
  },

  copyResults() {
    if (!AppState.lastName) return Utils.showToast("> CALCULA ZONAS PRIMERO_", 'error');

    let txt = "🔹 RI5 - ZONAS DE ENTRENO 🔹\n\n";
    txt += `👤 ${AppState.lastName} · ${AppState.lastAge} años\n`;
    txt += `❤️ FC MÁX: ${AppState.lastFC} lpm · UMBRAL: ${AppState.lastUL} lpm\n`;
    txt += `⏱️ RITMO 6km: ${Utils.formatR(AppState.lastRitmoBase)} min/km\n\n`;
    txt += `📊 PREDICCIONES:\n`;
    AppState.lastPred.forEach(p => txt += `   ${p.dist} km → ${Utils.formatR(p.ritmo)} min/km\n`);
    txt += `\n🎯 ZONAS:\n`;
    AppState.lastZones.forEach(z => {
      const min = Math.round(AppState.lastUL * z[2]);
      const max = Math.round(AppState.lastUL * z[3]);
      txt += `   ${z[0]} ${z[1]}: ${min}-${max} lpm\n`;
    });

    navigator.clipboard.writeText(txt).then(() => {
      Utils.showToast("✅ COPIADO", 'success');
    }).catch(() => Utils.showToast("> NO SE PUDO COPIAR.", 'error'));
  },

  shareResults() {
    if (!AppState.lastName) return Utils.showToast("> CALCULA ZONAS PRIMERO_", 'error');

    let txt = "🏃‍♂️ MIS ZONAS DE ENTRENAMIENTO RI5 🏃‍♀️\n\n";
    txt += `👤 ${AppState.lastName} · ${AppState.lastAge} años\n`;
    txt += `❤️ FC MÁX: ${AppState.lastFC} lpm · UMBRAL: ${AppState.lastUL} lpm\n`;
    txt += `⏱️ RITMO 6km: ${Utils.formatR(AppState.lastRitmoBase)} min/km\n\n`;
    txt += `📊 PREDICCIONES:\n`;
    AppState.lastPred.forEach(p => txt += `   ${p.dist} km → ${Utils.formatR(p.ritmo)} min/km\n`);

    if (navigator.share) {
      navigator.share({
        title: 'Mis zonas de entrenamiento RI5',
        text: txt,
        url: window.location.href,
      }).catch(() => {
        navigator.clipboard.writeText(txt).then(() => {
          Utils.showToast("✅ RESULTADOS COPIADOS", 'success');
        });
      });
    } else {
      navigator.clipboard.writeText(txt).then(() => {
        Utils.showToast("✅ RESULTADOS COPIADOS · AHORA PUEDES COMPARTIRLOS", 'success');
      });
    }
    Utils.vibrate(30);
  }
};