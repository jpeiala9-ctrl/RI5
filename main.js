// main.js
// ============================================
// FUNCIONES DE AUTH
// ============================================
window.switchAuthTab = (tab) => {
  if (typeof Auth !== 'undefined' && Auth.switchAuthTab) {
    Auth.switchAuthTab(tab);
  } else {
    console.error('Auth no disponible');
  }
};

window.registerUser = () => {
  if (typeof Auth !== 'undefined' && Auth.registerUser) {
    Auth.registerUser();
  } else {
    console.error('Auth.registerUser no disponible');
    alert('Error: Auth no cargado');
  }
};

window.loginUser = () => {
  if (typeof Auth !== 'undefined' && Auth.loginUser) {
    Auth.loginUser();
  } else {
    console.error('Auth.loginUser no disponible');
    alert('Error: Auth no cargado');
  }
};

window.logoutUser = () => {
  if (typeof Auth !== 'undefined' && Auth.logoutUser) {
    Auth.logoutUser();
  }
};

window.logoutAdmin = () => {
  if (typeof Auth !== 'undefined' && Auth.logoutAdmin) {
    Auth.logoutAdmin();
  }
};

// ============================================
// FUNCIONES DE TRAINING
// ============================================
window.startCalc = () => {
  console.log('Botón CALCULAR pulsado');
  if (typeof Training !== 'undefined' && Training.startCalc) {
    Training.startCalc();
  } else {
    console.error('Training no disponible');
    alert('Error: Training no cargado');
  }
};

window.copyResults = () => {
  if (typeof Training !== 'undefined' && Training.copyResults) {
    Training.copyResults();
  } else {
    alert('Función copiar no disponible');
  }
};

window.shareResults = () => {
  if (typeof Training !== 'undefined' && Training.shareResults) {
    Training.shareResults();
  } else {
    alert('Función compartir no disponible');
  }
};

// ============================================
// FUNCIONES DE UI
// ============================================
window.switchTab = (tab) => {
  console.log('Cambiando a pestaña:', tab);
  if (typeof UI !== 'undefined' && UI.switchTab) {
    UI.switchTab(tab);
  } else {
    // Fallback si UI no está disponible
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    const tabMap = {
      'entreno': 'ENTRENO',
      'plan': 'PLAN',
      'historial': 'HISTORIAL',
      'soporte': 'SOPORTE'
    };
    
    document.querySelectorAll('.tab-button').forEach(b => {
      if (b.textContent.includes(tabMap[tab])) {
        b.classList.add('active');
      }
    });
    
    document.getElementById(`tab-${tab}`).classList.add('active');
  }
};

window.changeDailyTip = () => {
  const e = document.getElementById("dailyTip");
  if (e) {
    e.innerHTML = '<span>> CONSEJO DEL DÍA_</span><small>// pulsa para nuevo consejo</small>';
  }
};

window.changeConsejo = () => {
  const e = document.getElementById("curiosity");
  if (e) {
    e.innerHTML = '<span>> CONSEJO_</span><small>// pulsa para nuevo consejo</small>';
  }
};

// ============================================
// FUNCIONES DE PLAN GENERATOR
// ============================================
window.toggleCuestionario = () => {
  console.log('Toggle cuestionario');
  const q = document.getElementById("cuestionarioEntreno");
  if (q) {
    q.style.display = q.style.display === "block" ? "none" : "block";
  }
};

window.mostrarUltimoPlanGuardado = () => {
  alert('Función "Cargar último plan" - en desarrollo');
};

window.borrarPlanGuardado = () => {
  if (confirm('¿Eliminar plan guardado?')) {
    alert('Plan eliminado');
  }
};

window.generarCalendarioEntreno = () => {
  alert('Función "Generar plan" - en desarrollo');
};

window.validarOpcionesPlan = () => {
  console.log('Validando opciones del plan');
};

window.cargarPlanDesdeHistorial = (planId) => {
  console.log('Cargar plan:', planId);
  alert('Cargar plan - en desarrollo');
};

window.eliminarPlanHistorial = (planId) => {
  if (confirm('¿Eliminar este plan?')) {
    alert('Plan eliminado');
  }
};

window.cambiarTrimestre = (delta) => {
  console.log('Cambiar trimestre:', delta);
};

window.cerrarPlan = () => {
  document.getElementById("calendarioEntreno").style.display = "none";
};

// ============================================
// FUNCIONES DE SOPORTE/MENSAJES
// ============================================
window.cambiarSoporteTab = (tab) => {
  document.querySelectorAll('#tab-soporte .soporte-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('#tab-soporte .soporte-panel').forEach(p => p.classList.remove('active'));
  
  if (tab === 'recibidos') {
    document.querySelectorAll('#tab-soporte .soporte-tab')[0].classList.add('active');
    document.getElementById('soporte-recibidos').classList.add('active');
  } else {
    document.querySelectorAll('#tab-soporte .soporte-tab')[1].classList.add('active');
    document.getElementById('soporte-enviados').classList.add('active');
  }
};

window.enviarMensajeUsuario = () => {
  const texto = document.getElementById('mensajeUsuario')?.value.trim();
  if (!texto) {
    alert('Escribe un mensaje');
    return;
  }
  alert('Mensaje enviado (simulado)');
  document.getElementById('mensajeUsuario').value = '';
};

window.borrarMensajeUsuario = (id) => {
  if (confirm('¿Eliminar mensaje?')) {
    alert('Mensaje eliminado');
  }
};

window.toggleMensajeRecibido = (header, id) => {
  const item = header.closest('.mensaje-item');
  if (item) item.classList.toggle('abierto');
};

// ============================================
// FUNCIONES DE ADMIN
// ============================================
window.abrirModalUsuarios = (filtro) => {
  alert('Panel de admin - en desarrollo');
};

window.abrirModalPendientes = () => {
  alert('Usuarios pendientes - en desarrollo');
};

window.marcarEnterado = (uid) => {
  console.log('Marcar enterado:', uid);
};

window.extenderUsuario = (uid, meses) => {
  console.log('Extender usuario:', uid, meses);
};

window.togglePremium = (uid) => {
  console.log('Toggle premium:', uid);
};

window.eliminarUsuario = (uid) => {
  if (confirm(`¿Eliminar usuario ${uid}?`)) {
    alert('Usuario eliminado');
  }
};

window.enviarMensajeAUsuario = (uid) => {
  const msg = prompt(`Mensaje para ${uid}:`);
  if (msg) alert('Mensaje enviado');
};

window.exportarUsuariosCSV = () => {
  alert('Exportar CSV - en desarrollo');
};

window.renovarExpirados = () => {
  if (confirm('¿Renovar todos los expirados?')) {
    alert('Renovados');
  }
};

window.enviarMensajeAdmin = () => {
  const texto = document.getElementById('adminMensaje')?.value.trim();
  if (!texto) {
    alert('Escribe un mensaje');
    return;
  }
  alert('Mensaje enviado a usuarios');
  document.getElementById('adminMensaje').value = '';
};

window.borrarMensajeAdmin = (key, id) => {
  if (confirm('¿Eliminar mensaje?')) {
    alert('Mensaje eliminado');
  }
};

window.switchAdminTab = (tab) => {
  document.querySelectorAll('#adminPage .tab-button').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#adminPage .tab-content').forEach(c => c.classList.remove('active'));
  
  if (tab === 'usuarios') {
    document.querySelectorAll('#adminPage .tab-button')[0].classList.add('active');
    document.getElementById('admin-tab-usuarios').classList.add('active');
  } else {
    document.querySelectorAll('#adminPage .tab-button')[1].classList.add('active');
    document.getElementById('admin-tab-soporte').classList.add('active');
  }
};

window.cambiarAdminSoporteTab = (tab) => {
  document.querySelectorAll('#admin-tab-soporte .soporte-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('#admin-tab-soporte .soporte-panel').forEach(p => p.classList.remove('active'));
  
  if (tab === 'recibidos') {
    document.querySelectorAll('#admin-tab-soporte .soporte-tab')[0].classList.add('active');
    document.getElementById('admin-soporte-recibidos').classList.add('active');
  } else {
    document.querySelectorAll('#admin-tab-soporte .soporte-tab')[1].classList.add('active');
    document.getElementById('admin-soporte-enviados').classList.add('active');
  }
};

window.toggleUsuario = (el) => {
  el.classList.toggle('abierto');
};

// ============================================
// FUNCIONES DE PWA
// ============================================
window.instalarPWA = () => {
  alert('Para instalar: menú del navegador → "Añadir a pantalla de inicio"');
};

window.cerrarBannerPWA = () => {
  document.getElementById('pwa-banner').style.display = 'none';
};

// ============================================
// FUNCIONES DE TEMA
// ============================================
window.toggleTheme = () => {
  if (document.body.classList.contains('manual-light')) {
    document.body.classList.remove('manual-light');
    document.body.classList.add('manual-dark');
  } else if (document.body.classList.contains('manual-dark')) {
    document.body.classList.remove('manual-dark');
    document.body.classList.add('manual-light');
  } else {
    document.body.classList.add('manual-dark');
  }
  
  // Actualizar botones
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.innerText = document.body.classList.contains('manual-light') ? '🌙' : '☀️';
  });
};

// ============================================
// FUNCIONES DE PREMIUM
// ============================================
window.showPremiumBenefits = () => {
  document.getElementById('premiumOverlay').classList.add('active');
  document.getElementById('premiumModal').classList.add('active');
};

window.cerrarPremiumModal = () => {
  document.getElementById('premiumOverlay').classList.remove('active');
  document.getElementById('premiumModal').classList.remove('active');
};

window.contactarAdmin = () => {
  window.open('https://www.instagram.com/navegacionpro?igsh=Y2ZzMHpwOWUwOTRx&utm_source=qr', '_blank');
};

// ============================================
// FUNCIONES DE RECUPERACIÓN DE CONTRASEÑA
// ============================================
window.abrirResetModal = () => {
  document.getElementById('resetOverlay').style.display = 'block';
  document.getElementById('resetModal').style.display = 'block';
};

window.cerrarResetModal = () => {
  document.getElementById('resetOverlay').style.display = 'none';
  document.getElementById('resetModal').style.display = 'none';
};

window.enviarResetPassword = () => {
  alert('Función de recuperación - en desarrollo');
  window.cerrarResetModal();
};

// ============================================
// FUNCIONES DE WELCOME MODAL
// ============================================
window.cerrarWelcomeModal = () => {
  document.getElementById('welcomeOverlay').style.display = 'none';
  document.getElementById('welcomeModal').style.display = 'none';
};

// ============================================
// FUNCIONES DE EMAIL UPDATE
// ============================================
window.cerrarEmailUpdateModal = () => {
  document.getElementById('emailUpdateOverlay').style.display = 'none';
  document.getElementById('emailUpdateModal').style.display = 'none';
};

window.guardarEmailActualizacion = () => {
  alert('Función de actualización de email - en desarrollo');
  window.cerrarEmailUpdateModal();
};

// ============================================
// FUNCIÓN TOGGLE PASSWORD
// ============================================
window.togglePassword = (inputId, element) => {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    element.textContent = 'ocultar';
  } else {
    input.type = 'password';
    element.textContent = 'ver';
  }
};

// ============================================
// FUNCIONES DE HISTORIAL
// ============================================
window.cargarHistorial = () => {
  console.log('Cargar historial');
  document.getElementById('historialContainer').innerHTML = '<p style="text-align:center; padding:20px;">📭 SIN HISTORIAL</p>';
};

window.borrarEntradaHistorial = (i) => {
  if (confirm('¿Eliminar esta entrada?')) {
    alert('Entrada eliminada');
  }
};

window.borrarHistorial = () => {
  if (confirm('¿Limpiar todo el historial?')) {
    alert('Historial limpiado');
    document.getElementById('historialContainer').innerHTML = '<p style="text-align:center; padding:20px;">📭 SIN HISTORIAL</p>';
  }
};

window.toggleHistorialDetalle = (el) => {
  el.classList.toggle('abierto');
};

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  console.log('✅ main.js cargado');
  console.log('Funciones disponibles:', {
    startCalc: typeof window.startCalc,
    registerUser: typeof window.registerUser,
    loginUser: typeof window.loginUser,
    switchTab: typeof window.switchTab
  });
  
  // Inicializar checkboxes de días si existe la función en UI
  if (typeof UI !== 'undefined' && UI.initDiasCheckboxes) {
    UI.initDiasCheckboxes();
  }
  
  // Inicializar fecha si existe la función
  if (typeof UI !== 'undefined' && UI.setFechaActual) {
    UI.setFechaActual();
  }
});