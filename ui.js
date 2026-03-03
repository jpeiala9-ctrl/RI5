// ui.js
const UI = {
  consejos: [
    "La constancia es la clave.",
    "El descanso es entrenamiento.",
    "Confía en el proceso.",
    "La Z2 es tu mejor amiga.",
    "Hidratación antes de sed.",
    "El sueño construye resistencia.",
    "Escucha a tu cuerpo.",
    "La nutrición es el combustible."
  ],
  consejoIndex: 0,
  dailyInterval: null,
  consejoInterval: null,

  // ===== CONSEJOS =====
  changeDailyTip() {
    const e = document.getElementById("dailyTip");
    if (e) {
      e.innerHTML = '<span>> ' + this.consejos[this.consejoIndex] + '</span><small>// pulsa para otro</small>';
      this.consejoIndex = (this.consejoIndex + 1) % this.consejos.length;
    }
  },

  changeConsejo() {
    const e = document.getElementById("curiosity");
    if (e) {
      e.innerHTML = '<span>' + this.consejos[this.consejoIndex] + '</span><small>// pulsa para otro</small>';
      this.consejoIndex = (this.consejoIndex + 1) % this.consejos.length;
    }
  },

  startConsejoAutoChange() {
    if (this.dailyInterval) clearInterval(this.dailyInterval);
    if (this.consejoInterval) clearInterval(this.consejoInterval);
    
    this.dailyInterval = setInterval(() => {
      if (document.getElementById("loginPage").style.display !== "none") {
        this.changeDailyTip();
      }
    }, 8000);

    this.consejoInterval = setInterval(() => {
      if (document.getElementById("mainContent").style.display !== "none") {
        this.changeConsejo();
      }
    }, 8000);
  },

  // ===== VALIDACIÓN DE CAMPOS =====
  marcarCampoTocado(campo) {
    AppState.camposTocados[campo] = true;
    this.validarCampo(campo);
    this.validarTodo();
  },

  validarCampo(campo) {
    const el = document.getElementById(campo);
    const err = document.getElementById(campo + 'Error');

    if (campo === 'name') return true;

    if (!AppState.camposTocados[campo]) {
      if (err) err.classList.remove('visible');
      if (el) el.classList.remove('error');
      return true;
    }

    let ok = true;
    if (campo === 'age') {
      const a = parseInt(el.value);
      ok = !isNaN(a) && a >= 14 && a <= 85;
    } else if (campo === 'time') {
      const t = Utils.parseTime(el.value);
      ok = !isNaN(t) && t >= 12 && t <= 90;
    }

    if (!ok) {
      err.innerText = campo === 'age' ? '> EDAD 14-85_' : '> FORMATO MM:SS (12-90 MIN)_';
      err.classList.add('visible');
      el.classList.add('error');
    } else {
      err.classList.remove('visible');
      el.classList.remove('error');
    }
    return ok;
  },

  validarTodo() {
    const ageOk = this.validarCampo('age');
    const timeOk = this.validarCampo('time');
    document.getElementById("calcBtn").disabled = !(ageOk && timeOk);
  },

  // ===== RESULTADOS =====
  mostrarResultados(d) {
    let html = `<h2>> MÉTRICAS_</h2>
      <div style="text-align:center; margin:20px 0;">
        ${d.name} · ${d.age} años<br>
        FC MÁX: ${d.fcMax} lpm · UMBRAL: ${d.ul} lpm<br>
        RITMO 6km: ${Utils.formatR(d.ritmoBase)} min/km
      </div>
      <h2>> PREDICCIONES_</h2>`;

    d.pred.forEach(p => {
      html += `<div class="pred-bar" style="border-color:${p.color}; color:${p.color};">${p.dist} km → ${Utils.formatR(p.ritmo)} min/km</div>`;
    });

    html += `<h2>> ZONAS_</h2>`;

    d.zones.forEach(z => {
      const min = Math.round(d.ul * z[2]);
      const max = Math.round(d.ul * z[3]);
      html += `<div class="zone-card ${z[5]}" onclick="this.classList.toggle('active')">
        <strong>${z[0]} – ${z[1]}</strong><br>
        FC: ${min}-${max} lpm
        <div class="long">${z[6]}</div>
      </div>`;
    });

    html += `<button class="action-button btn-copy" onclick="window.copyResults()">📋 COPIAR</button>`;
    html += `<button class="action-button btn-share" onclick="window.shareResults()">📱 COMPARTIR</button>`;

    document.getElementById("results").innerHTML = html;
    document.getElementById("footer").innerText = `${d.name} · ${new Date().toLocaleDateString('es-ES')} · RI5`;
  },

  mostrarResultadosGuardados(d) {
    this.mostrarResultados(d);
  },

  // ===== PESTAÑAS =====
  switchTab(tab) {
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    const btns = document.querySelectorAll('.tab-button');
    for (let b of btns) {
      if (b.textContent.includes(tab === 'entreno' ? 'ENTRENO' : tab === 'plan' ? 'PLAN' : tab === 'historial' ? 'HISTORIAL' : 'SOPORTE')) {
        b.classList.add('active');
        break;
      }
    }

    document.getElementById(`tab-${tab}`).classList.add('active');

    if (tab === 'historial') this.cargarHistorial();
    if (tab === 'plan') this.cargarHistorialPlanes();
    if (tab === 'soporte') {
      this.cargarMensajesRecibidos();
      this.cargarMensajesEnviados();
    }

    this.guardarEstado();
  },

  // ===== HISTORIAL DE CÁLCULOS =====
  async cargarHistorial() {
    const cont = document.getElementById("historialContainer");
    if (!AppState.currentUid) {
      cont.innerHTML = '<p style="text-align:center; padding:20px; color: var(--text-secondary);">📭 SIN USUARIO</p>';
      return;
    }

    let hist = await Storage.getHistorial(AppState.currentUid);
    const lim = parseInt(document.getElementById('historialLimit').value);
    if (hist.length > lim) hist = hist.slice(0, lim);

    if (!hist.length) {
      cont.innerHTML = '<p style="text-align:center; padding:20px; color: var(--text-secondary);">📭 SIN HISTORIAL</p>';
      return;
    }

    let html = '<div class="historial-list">';
    hist.forEach((it, i) => {
      let zonas = '';
      if (it.zonasResumen && Array.isArray(it.zonasResumen)) {
        zonas = '<div class="zonas-pastillas">';
        it.zonasResumen.forEach(z => {
          zonas += `<span class="zona-pastilla ${z.zona.toLowerCase()}"><span></span> ${z.zona}: ${z.min}-${z.max}</span>`;
        });
        zonas += '</div>';
      }

      const pred = it.predicciones ? `<div class="predicciones">📊 ${it.predicciones}</div>` : '';
      const hora = it.hora ? `<div class="hora-detalle">🕒 ${it.hora}</div>` : '';

      html += `<div class="historial-item" onclick="window.toggleHistorialDetalle(this)">
        <div class="fecha">📅 ${it.date}</div>
        <div class="resumen">${it.resumen || it.nombre + ' · ' + it.edad + ' años'}</div>
        <button class="delete-icon" onclick="event.stopPropagation(); window.borrarEntradaHistorial(${i})" title="Eliminar">🗑️</button>
        <div class="detalle">${hora}${pred}${zonas}${it.fcMax ? `<div>❤️ FC Máx: ${it.fcMax} lpm</div>` : ''}${it.umbral ? `<div>⚡ Umbral: ${it.umbral} lpm</div>` : ''}</div>
      </div>`;
    });
    html += '</div>';
    cont.innerHTML = html;
  },

  toggleHistorialDetalle(el) {
    el.classList.toggle('abierto');
  },

  async borrarEntradaHistorial(i) {
    if (!AppState.currentUid) return;
    const confirmed = await Utils.confirm('ELIMINAR ENTRADA', "> ¿ELIMINAR ESTA ENTRADA?_");
    if (!confirmed) return;

    let hist = await Storage.getHistorial(AppState.currentUid);
    hist.splice(i, 1);
    await Storage.saveHistorial(AppState.currentUid, hist);
    this.cargarHistorial();
    Utils.showToast("✅ ELIMINADA", 'success');
  },

  async borrarHistorial() {
    if (!AppState.currentUid) return;
    const confirmed = await Utils.confirm('LIMPIAR HISTORIAL', "> ¿ELIMINAR TODO EL HISTORIAL?_");
    if (!confirmed) return;

    await Storage.saveHistorial(AppState.currentUid, []);
    this.cargarHistorial();
    Utils.showToast("✅ HISTORIAL LIMPIO", 'success');
  },

  // ===== HISTORIAL DE PLANES =====
  async cargarHistorialPlanes() {
    const container = document.getElementById('planesHistorialContainer');
    const section = document.getElementById('planesHistorial');

    if (!AppState.currentUid || !AppState.isPremium) {
      section.style.display = 'none';
      return;
    }

    const planes = await Storage.getHistorialPlanes(AppState.currentUid);
    if (planes.length === 0) {
      section.style.display = 'none';
      return;
    }

    section.style.display = 'block';
    let html = '';

    planes.slice(0, 3).forEach((plan) => {
      const fecha = new Date(plan.fecha).toLocaleDateString();
      html += `
        <div class="plan-card" data-plan-id="${plan.id}">
          <div class="plan-info" onclick="window.cargarPlanDesdeHistorial('${plan.id}')">
            <div class="plan-fecha">📅 ${fecha}</div>
            <div class="plan-resumen">${plan.resumen}</div>
            <div class="plan-detalle">${plan.detalle}</div>
          </div>
          <button class="delete-plan" onclick="event.stopPropagation(); window.eliminarPlanHistorial('${plan.id}')">🗑️</button>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  async guardarPlanEnHistorial(planParams, planCompleto) {
    if (!AppState.currentUid || !AppState.isPremium) return;

    const ahora = new Date();
    const planId = ahora.getTime().toString();
    const mapaDist = { "2k": "2 km", "5k": "5 km", "10k": "10 km", "medio": "MEDIA", "maraton": "MARATÓN" };
    const resumen = `${mapaDist[planParams.distancia]} · ${planParams.diasPorSemana} días · ${planParams.nivel}`;
    const detalle = `${planParams.modalidad === 'runner' ? 'Asfalto' : 'Montaña'} · ${planParams.objetivo} · Inicio: ${new Date(planParams.fechaInicio).toLocaleDateString()}`;

    const nuevoPlan = {
      id: planId,
      fecha: ahora.toISOString(),
      resumen: resumen,
      detalle: detalle,
      params: planParams
    };

    let historial = await Storage.getHistorialPlanes(AppState.currentUid);
    historial.unshift(nuevoPlan);

    if (historial.length > 3) {
      const eliminado = historial.pop();
      if (eliminado && eliminado.id) {
        await Storage.deletePlanCompleto(AppState.currentUid, eliminado.id);
      }
    }

    await Storage.saveHistorialPlanes(AppState.currentUid, historial);
    await Storage.savePlanCompleto(AppState.currentUid, planId, planCompleto);
    this.cargarHistorialPlanes();
  },

  async cargarPlanDesdeHistorial(planId) {
    if (!AppState.currentUid) return;

    try {
      const planCompleto = await Storage.getPlanCompleto(AppState.currentUid, planId);
      if (!planCompleto) {
        Utils.showToast('No se pudo cargar el plan', 'error');
        return;
      }

      AppState.planGeneradoActual = planCompleto.params;
      AppState.planActualId = planId;
      AppState.sesionesRealizadas = planCompleto.realizadas || {};
      AppState.trimestreActual = 0;

      document.getElementById("calendarioEntreno").style.display = "block";
      document.getElementById("cuestionarioEntreno").style.display = "none";
      this.mostrarCalendario(planCompleto.sesiones);
      document.getElementById("resumenObjetivo").innerText = planCompleto.resumen;
      this.guardarEstado();

    } catch (e) {
      Utils.showToast('Error al cargar el plan', 'error');
    }
  },

  async eliminarPlanHistorial(planId) {
    if (!AppState.currentUid) return;

    const confirmed = await Utils.confirm('ELIMINAR PLAN', '¿Eliminar este plan del historial?');
    if (!confirmed) return;

    let historial = await Storage.getHistorialPlanes(AppState.currentUid);
    historial = historial.filter(p => p.id !== planId);
    await Storage.saveHistorialPlanes(AppState.currentUid, historial);
    await Storage.deletePlanCompleto(AppState.currentUid, planId);
    this.cargarHistorialPlanes();
    Utils.showToast('✅ Plan eliminado', 'success');
  },

  // ===== CALENDARIO =====
  mostrarCalendario(sesiones) {
    const grid = document.getElementById("calendarioGrid");
    grid.innerHTML = "";

    const totalSemanas = sesiones.length / 7;
    const inicio = AppState.trimestreActual * 7 * 12;
    const fin = Math.min(inicio + 7 * 12, sesiones.length);
    const sesionesTrimestre = sesiones.slice(inicio, fin);

    const fragment = document.createDocumentFragment();

    sesionesTrimestre.forEach((sesion, idx) => {
      const diaGlobal = inicio + idx;
      const div = document.createElement("div");
      div.className = `calendario-dia ${sesion.color}`;

      if (AppState.sesionesRealizadas[diaGlobal]) {
        div.classList.add('realizado');
      }

      if (sesion.detalle) div.dataset.detalle = JSON.stringify(sesion.detalle);

      div.innerHTML = `<div style="font-size:10px;">S${sesion.semana}</div>
        <strong>${sesion.breve}</strong>
        ${sesion.detalle ? `<div style="font-size:8px;">${sesion.detalle.duracion}${sesion.detalle.unidad}</div>` : ''}`;

      div.dataset.letra = sesion.breve;
      div.dataset.semana = sesion.semana;
      div.dataset.colorClass = sesion.color;
      div.dataset.diaIndex = diaGlobal;
      div.onclick = function() {
        UI.mostrarDetalleSesion(this);
      };

      fragment.appendChild(div);
    });

    grid.appendChild(fragment);

    const nav = document.getElementById('calendarioNavegacion');
    if (sesiones.length > 7 * 12) {
      nav.style.display = 'flex';
      document.getElementById('calendarioPagina').innerText = `TRIMESTRE ${AppState.trimestreActual + 1}/4`;
      document.getElementById('calendarioAnterior').disabled = AppState.trimestreActual === 0;
      document.getElementById('calendarioSiguiente').disabled = AppState.trimestreActual === 3;
    } else {
      nav.style.display = 'none';
    }
  },

  cambiarTrimestre(delta) {
    AppState.trimestreActual += delta;
    if (AppState.planActualId) {
      Storage.getPlanCompleto(AppState.currentUid, AppState.planActualId).then(plan => {
        if (plan) this.mostrarCalendario(plan.sesiones);
      });
    }
    this.guardarEstado();
  },

  mostrarDetalleSesion(celda) {
    const modal = document.getElementById("detalleSesion");
    const overlay = document.getElementById("modalOverlay");
    const wrapper = document.getElementById("modalColorWrapper");

    wrapper.className = "modal-content";
    wrapper.classList.add(celda.dataset.colorClass);

    const det = celda.dataset.detalle ? JSON.parse(celda.dataset.detalle) : null;
    const diaIndex = celda.dataset.diaIndex;

    let tit = "", cont = "";

    if (celda.dataset.letra === "D") {
      tit = "DÍA DE DESCANSO";
      cont = "<strong>OBJETIVO:</strong> Recuperación completa<br><br><strong>RECOMENDADO:</strong><br>• No correr<br>• Estiramientos suaves<br>• Buena nutrición";
      document.getElementById('sesionCheckboxContainer').style.display = 'none';
    } else if (det) {
      tit = det.nombre || `${celda.dataset.letra} · Semana ${celda.dataset.semana}`;
      const ritmo = PlanGenerator.getRitmoPorZona(det.zona);

      let extras = '';
      if (det.tipo === 'rodaje') extras = '<br><br><strong>🎯 OBJETIVO:</strong> Mejorar eficiencia aeróbica. Sensación cómoda, ritmo constante.';
      else if (det.tipo === 'series') extras = '<br><br><strong>🎯 OBJETIVO:</strong> Mejorar velocidad y tolerancia al lactato. Recuperación completa entre repeticiones.';
      else if (det.tipo === 'tempo') extras = '<br><br><strong>🎯 OBJETIVO:</strong> Aumentar capacidad de mantener ritmo rápido. Sensación "cómodamente duro".';
      else if (det.tipo === 'largo') extras = '<br><br><strong>🎯 OBJETIVO:</strong> Desarrollar resistencia y confianza. Ritmo suave, prioriza el tiempo de pie.';

      cont = `<strong>🏃 ${det.nombre}</strong><br><br>
        <strong>⏱️ DURACIÓN:</strong> ${det.duracion} ${det.unidad}<br>
        <strong>📊 ZONA:</strong> ${det.zona}<br>
        <strong>⚡ RITMO:</strong> ${ritmo}<br><br>
        <strong>📋 ESTRUCTURA:</strong><br>${det.estructura}<br><br>
        <strong>💬 DESCRIPCIÓN:</strong><br>${det.desc}<br><br>
        <strong>😌 SENSACIÓN:</strong> ${det.sensacion}${extras}`;

      document.getElementById('sesionCheckboxContainer').style.display = 'flex';
      const checkbox = document.getElementById('sesionRealizada');
      checkbox.checked = AppState.sesionesRealizadas[diaIndex] || false;
      checkbox.onchange = () => {
        const realizado = checkbox.checked;
        AppState.sesionesRealizadas[diaIndex] = realizado;
        if (AppState.planActualId && AppState.currentUid) {
          Storage.marcarSesionRealizada(AppState.currentUid, AppState.planActualId, diaIndex, realizado);
        }
        if (realizado) {
          celda.classList.add('realizado');
        } else {
          celda.classList.remove('realizado');
        }
      };

    } else {
      cont = "> SELECCIONA UN DÍA PARA VER DETALLES_";
      document.getElementById('sesionCheckboxContainer').style.display = 'none';
    }

    document.getElementById("tituloSesion").innerText = tit;
    document.getElementById("descripcionSesion").innerHTML = cont;

    modal.classList.add("visible");
    overlay.classList.add("visible");
  },

  cerrarModalSesion() {
    const modal = document.getElementById("detalleSesion");
    const overlay = document.getElementById("modalOverlay");
    modal.classList.remove("visible");
    overlay.classList.remove("visible");
  },

  // ===== MENSAJES =====
  setupMensajesListeners(uid) {
    if (!uid) return;

    AppState.mensajeListeners.forEach(unsub => unsub());
    AppState.mensajeListeners = [];

    const unsubRec = Storage.listenMensajesUsuario(uid, (msgs) => {
      AppState.mensajesNoLeidos = msgs.filter(m => !m.leido).length;
      this.renderMensajesRecibidos(msgs);
    });
    AppState.mensajeListeners.push(unsubRec);

    const unsubEnv = Storage.listenMensajesEnviadosUsuario(uid, (msgs) => {
      this.renderMensajesEnviados(msgs);
    });
    AppState.mensajeListeners.push(unsubEnv);
  },

  renderMensajesRecibidos(msgs) {
    let html = '';
    msgs.forEach((m) => {
      const nuevo = !m.leido ? 'nuevo' : '';
      html += `<div class="mensaje-item ${nuevo}" data-id="${m.id}">
        <div class="mensaje-header" onclick="window.toggleMensajeRecibido(this, '${m.id}')">
          <span>📨 ${m.fecha} · Admin</span>
          <span class="flecha">▼</span>
          <button class="delete-mensaje" onclick="event.stopPropagation(); window.borrarMensajeUsuario('${m.id}')">🗑️</button>
        </div>
        <div class="mensaje-contenido">${m.texto}</div>
      </div>`;
    });
    document.getElementById('listaMensajesRecibidos').innerHTML = html || '<p>📭 NO HAY MENSAJES</p>';
    this.actualizarBadgeMensajes();
  },

  renderMensajesEnviados(msgs) {
    let html = '';
    msgs.forEach(m => {
      html += `<div class="mensaje-item">
        <div class="mensaje-header" onclick="this.parentNode.classList.toggle('abierto')">
          <span>📤 ${m.fecha} · Tú</span>
          <span class="flecha">▼</span>
        </div>
        <div class="mensaje-contenido">${m.texto}</div>
      </div>`;
    });
    document.getElementById('listaMensajesEnviados').innerHTML = html || '<p>📭 NO HAS ENVIADO MENSAJES</p>';
  },

  async borrarMensajeUsuario(id) {
    if (!AppState.currentUid) return;
    const confirmed = await Utils.confirm('ELIMINAR MENSAJE', "> ¿ELIMINAR?");
    if (!confirmed) return;

    await Storage.borrarMensaje('admin_' + AppState.currentUid, id);
    Utils.showToast("✅ ELIMINADO", 'success');
  },

  async enviarMensajeUsuario() {
    if (!AppState.currentUid) return;
    const texto = document.getElementById('mensajeUsuario').value.trim();
    if (!texto) return Utils.showToast('> ESCRIBE UN MENSAJE_', 'error');

    await Storage.enviarMensajeUsuario(AppState.currentUid, texto);
    document.getElementById('mensajeUsuario').value = '';
    Utils.showToast('✅ ENVIADO', 'success');
  },

  async toggleMensajeRecibido(header, id) {
    const item = header.closest('.mensaje-item');
    item.classList.toggle('abierto');

    if (item.classList.contains('nuevo') && item.classList.contains('abierto')) {
      item.classList.remove('nuevo');

      if (AppState.currentUid) {
        const msgs = await Storage.getMensajes();
        const key = 'admin_' + AppState.currentUid;
        if (msgs[key]) {
          const index = msgs[key].findIndex(m => m.id === id);
          if (index !== -1) {
            await Storage.marcarLeido('admin_' + AppState.currentUid, index);
          }
        }

        const mensajesActualizados = await Storage.getMensajes();
        const msgsUsuario = mensajesActualizados['admin_' + AppState.currentUid] || [];
        AppState.mensajesNoLeidos = msgsUsuario.filter(m => !m.leido).length;
        this.actualizarBadgeMensajes();
      }
    }
  },

  cambiarSoporteTab(tab) {
    document.querySelectorAll('#tab-soporte .soporte-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('#tab-soporte .soporte-panel').forEach(p => p.classList.remove('active'));

    if (tab === 'recibidos') {
      document.querySelectorAll('#tab-soporte .soporte-tab')[0].classList.add('active');
      document.getElementById('soporte-recibidos').classList.add('active');
    } else {
      document.querySelectorAll('#tab-soporte .soporte-tab')[1].classList.add('active');
      document.getElementById('soporte-enviados').classList.add('active');
    }
  },

  actualizarBadgeMensajes() {
    const t = document.getElementById('soporteTabButton');
    if (AppState.mensajesNoLeidos > 0) {
      t.classList.add('soporte-unread');
    } else {
      t.classList.remove('soporte-unread');
    }
  },

  // ===== MODALES =====
  async mostrarWelcomeModal(uid) {
    document.getElementById('welcomeOverlay').style.display = 'block';
    document.getElementById('welcomeModal').style.display = 'block';
  },

  // ===== CONFIGURACIÓN INICIAL =====
  initDiasCheckboxes() {
    const container = document.getElementById('diasSemanaContainer');
    const dias = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    let html = '';
    for (let i = 0; i < 7; i++) {
      const n = i + 1;
      html += `<div class="dia-checkbox">
        <input type="checkbox" id="dia${n}" value="${n}">
        <label for="dia${n}">${dias[i]}</label>
      </div>`;
    }
    container.innerHTML = html;
  },

  setFechaActual() {
    const fechaInput = document.getElementById('fechaInicio');
    if (fechaInput) {
      const hoy = new Date();
      const año = hoy.getFullYear();
      const mes = String(hoy.getMonth() + 1).padStart(2, '0');
      const dia = String(hoy.getDate()).padStart(2, '0');
      fechaInput.value = `${año}-${mes}-${dia}`;
      fechaInput.min = `${año}-${mes}-${dia}`;
      fechaInput.max = `${año + 1}-${mes}-${dia}`;
    }
  },

  // ===== PERSISTENCIA DE ESTADO =====
  guardarEstado() {
    if (!AppState.currentUid) return;

    const estado = {
      activeTab: document.querySelector('.tab-button.active')?.textContent.toLowerCase() || 'entreno',
      planVisible: document.getElementById('calendarioEntreno').style.display === 'block',
      planId: AppState.planActualId,
      trimestre: AppState.trimestreActual
    };

    sessionStorage.setItem('ri5_estado', JSON.stringify(estado));
  },

  restaurarEstado() {
    const estadoStr = sessionStorage.getItem('ri5_estado');
    if (!estadoStr) return;

    try {
      const estado = JSON.parse(estadoStr);

      if (estado.activeTab) {
        const tabMap = { 'entreno': 'entreno', 'plan': 'plan', 'historial': 'historial', 'soporte': 'soporte' };
        const tab = tabMap[estado.activeTab] || 'entreno';
        this.switchTab(tab);
      }

      if (estado.planVisible && estado.planId) {
        AppState.trimestreActual = estado.trimestre || 0;
        this.cargarPlanDesdeHistorial(estado.planId);
      }

    } catch (e) {
      console.warn('Error restaurando estado', e);
    }
  },

  cerrarPlan() {
    document.getElementById("calendarioEntreno").style.display = "none";
    AppState.planGeneradoActual = null;
    AppState.planActualId = null;
    AppState.sesionesRealizadas = {};
    document.getElementById("cuestionarioEntreno").style.display = "block";
    this.guardarEstado();
  },

  cargarMensajesRecibidos() {},
  cargarMensajesEnviados() {}
};