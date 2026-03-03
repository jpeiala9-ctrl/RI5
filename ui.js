// ui.js
const UI = {
  // Validación de campos
  marcarCampoTocado(campo) {
    console.log('Campo tocado:', campo);
  },

  validarCampo(campo) {
    return true;
  },

  validarTodo() {
    const ageOk = true;
    const timeOk = true;
    document.getElementById("calcBtn").disabled = !(ageOk && timeOk);
  },

  // Pestañas
  switchTab(tab) {
    console.log('Cambiando a pestaña:', tab);
    
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    const btns = document.querySelectorAll('.tab-button');
    for (let b of btns) {
      if (b.textContent.includes(tab === 'entreno' ? 'ENTRENO' : 
                                 tab === 'plan' ? 'PLAN' : 
                                 tab === 'historial' ? 'HISTORIAL' : 'SOPORTE')) {
        b.classList.add('active');
        break;
      }
    }

    document.getElementById(`tab-${tab}`).classList.add('active');
  },

  // Consejos
  changeDailyTip() {
    const e = document.getElementById("dailyTip");
    if (e) {
      e.innerHTML = '<span>> CONSEJO DEL DÍA_</span><small>// pulsa para nuevo consejo</small>';
    }
  },

  changeConsejo() {
    const e = document.getElementById("curiosity");
    if (e) {
      e.innerHTML = '<span>> CONSEJO_</span><small>// pulsa para nuevo consejo</small>';
    }
  },

  startConsejoAutoChange() {
    console.log('Consejos automáticos iniciados');
  },

  // Historial (funciones vacías por ahora)
  cargarHistorial() {},
  borrarEntradaHistorial() {},
  borrarHistorial() {},
  
  // Planes
  cargarHistorialPlanes() {},
  guardarPlanEnHistorial() {},
  
  // Mensajes
  setupMensajesListeners() {},
  renderMensajesRecibidos() {},
  renderMensajesEnviados() {},
  actualizarBadgeMensajes() {},
  
  // Estado
  guardarEstado() {},
  restaurarEstado() {},
  
  // Inicialización
  initDiasCheckboxes() {
    const container = document.getElementById('diasSemanaContainer');
    if (container) {
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
    }
  },

  setFechaActual() {
    const fechaInput = document.getElementById('fechaInicio');
    if (fechaInput) {
      const hoy = new Date();
      const año = hoy.getFullYear();
      const mes = String(hoy.getMonth() + 1).padStart(2, '0');
      const dia = String(hoy.getDate()).padStart(2, '0');
      fechaInput.value = `${año}-${mes}-${dia}`;
    }
  }
};

// Asignar a window
window.switchTab = (tab) => UI.switchTab(tab);
window.changeDailyTip = () => UI.changeDailyTip();
window.changeConsejo = () => UI.changeConsejo();
window.toggleHistorialDetalle = () => {};
window.borrarEntradaHistorial = () => {};
window.borrarHistorial = () => {};
window.cargarHistorial = () => {};

console.log('✅ UI.js cargado');