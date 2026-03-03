// main.js
// Asignar funciones a window para que funcionen los onclick del HTML
window.switchAuthTab = (tab) => Auth.switchAuthTab(tab);
window.registerUser = () => Auth.registerUser();
window.loginUser = () => Auth.loginUser();
window.logoutUser = () => Auth.logoutUser();
window.logoutAdmin = () => Auth.logoutAdmin();
window.eliminarMiCuenta = () => Auth.eliminarMiCuenta();

window.startCalc = () => Training.startCalc();
window.copyResults = () => Training.copyResults();
window.shareResults = () => Training.shareResults();

window.switchTab = (tab) => UI.switchTab(tab);
window.changeDailyTip = () => UI.changeDailyTip();
window.changeConsejo = () => UI.changeConsejo();
window.toggleHistorialDetalle = (el) => UI.toggleHistorialDetalle(el);
window.borrarEntradaHistorial = (i) => UI.borrarEntradaHistorial(i);
window.borrarHistorial = () => UI.borrarHistorial();

window.toggleCuestionario = () => PlanGenerator.toggleCuestionario();
window.mostrarUltimoPlanGuardado = () => PlanGenerator.mostrarUltimoPlanGuardado();
window.borrarPlanGuardado = () => PlanGenerator.borrarPlanGuardado();
window.generarCalendarioEntreno = () => PlanGenerator.generarCalendarioEntreno();
window.validarOpcionesPlan = () => PlanGenerator.validarOpcionesPlan();
window.cargarPlanDesdeHistorial = (planId) => UI.cargarPlanDesdeHistorial(planId);
window.eliminarPlanHistorial = (planId) => UI.eliminarPlanHistorial(planId);
window.cambiarTrimestre = (delta) => UI.cambiarTrimestre(delta);
window.cerrarPlan = () => UI.cerrarPlan();

window.cambiarSoporteTab = (tab) => UI.cambiarSoporteTab(tab);
window.enviarMensajeUsuario = () => UI.enviarMensajeUsuario();
window.borrarMensajeUsuario = (id) => UI.borrarMensajeUsuario(id);
window.toggleMensajeRecibido = (header, id) => UI.toggleMensajeRecibido(header, id);

// Admin
window.abrirModalUsuarios = (filtro) => Admin.abrirModalUsuarios(filtro);
window.abrirModalPendientes = () => Admin.abrirModalPendientes();
window.marcarEnterado = (uid) => Admin.marcarEnterado(uid);
window.extenderUsuario = (uid, meses) => Admin.extenderUsuario(uid, meses);
window.togglePremium = (uid) => Admin.togglePremium(uid);
window.eliminarUsuario = (uid) => Admin.eliminarUsuario(uid);
window.enviarMensajeAUsuario = (uid) => Admin.enviarMensajeAUsuario(uid);
window.exportarUsuariosCSV = () => Admin.exportarUsuariosCSV();
window.renovarExpirados = () => Admin.renovarExpirados();
window.enviarMensajeAdmin = () => Admin.enviarMensajeAdmin();
window.borrarMensajeAdmin = (key, id) => Storage.borrarMensaje(key, id);
window.switchAdminTab = (tab) => {
  document.querySelectorAll('#adminPage .tab-button').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#adminPage .tab-content').forEach(c => c.classList.remove('active'));

  if (tab === 'usuarios') {
    document.querySelectorAll('#adminPage .tab-button')[0].classList.add('active');
    document.getElementById('admin-tab-usuarios').classList.add('active');
  } else {
    document.querySelectorAll('#adminPage .tab-button')[1].classList.add('active');
    document.getElementById('admin-tab-soporte').classList.add('active');
    Admin.cargarSelectorUsuarios();
  }
};
window.cambiarAdminSoporteTab = (tab) => Admin.cambiarSoporteTab(tab);
window.toggleUsuario = (el) => el.classList.toggle('abierto');

// PWA
window.instalarPWA = () => PWA.instalarPWA();
window.cerrarBannerPWA = () => PWA.cerrarBannerPWA();

// Tema
window.toggleTheme = () => ThemeManager.toggle();

// Password toggle
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

// Premium
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

// Reset password
window.abrirResetModal = () => {
  document.getElementById('resetOverlay').style.display = 'block';
  document.getElementById('resetModal').style.display = 'block';
  document.getElementById('resetUsername').value = '';
  document.getElementById('resetEmail').value = '';
  document.getElementById('resetError').classList.remove('visible');
};
window.cerrarResetModal = () => {
  document.getElementById('resetOverlay').style.display = 'none';
  document.getElementById('resetModal').style.display = 'none';
};
window.enviarResetPassword = async () => {
  const username = document.getElementById('resetUsername').value.trim();
  const email = document.getElementById('resetEmail').value.trim();
  const err = document.getElementById('resetError');

  if (!username || !email) {
    err.innerText = "> COMPLETA AMBOS CAMPOS_";
    err.classList.add('visible');
    return;
  }

  if (!Utils.isValidEmail(email)) {
    err.innerText = "> CORREO NO VÁLIDO_";
    err.classList.add('visible');
    return;
  }

  const users = await Storage.getUsers();
  const userEntry = Object.entries(users).find(([uid, d]) => d.username === username);

  if (!userEntry || userEntry[1].email !== email) {
    Utils.showToast('Si los datos son correctos, recibirás un enlace', 'info');
    window.cerrarResetModal();
    return;
  }

  try {
    await auth.sendPasswordResetEmail(email);
    Utils.showToast('✅ Revisa tu correo (también spam)', 'success');
    window.cerrarResetModal();
  } catch (error) {
    Utils.showToast('❌ No se pudo enviar el correo', 'error');
  }
};

// Welcome modal
window.cerrarWelcomeModal = async () => {
  document.getElementById('welcomeOverlay').style.display = 'none';
  document.getElementById('welcomeModal').style.display = 'none';

  if (AppState.currentUid && AppState.currentUserData) {
    await Storage.updateUser(AppState.currentUid, { welcomeSeen: true });
    AppState.currentUserData.welcomeSeen = true;
  }
};

// Email update
window.mostrarModalActualizarEmail = (username, password) => {
  document.getElementById('emailUpdateOverlay').style.display = 'block';
  document.getElementById('emailUpdateModal').style.display = 'block';
  document.getElementById('emailUpdateInput').value = '';
  document.getElementById('emailUpdateError').classList.remove('visible');

  window.guardarEmailActualizacion = async () => {
    const email = document.getElementById('emailUpdateInput').value.trim();
    const err = document.getElementById('emailUpdateError');

    if (!email) {
      err.innerText = "> INTRODUCE UN CORREO_";
      err.classList.add('visible');
      return;
    }

    if (!Utils.isValidEmail(email)) {
      err.innerText = "> CORREO NO VÁLIDO_";
      err.classList.add('visible');
      return;
    }

    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const users = await Storage.getUsers();
      const userEntry = Object.entries(users).find(([uid, d]) => d.username === username);

      if (userEntry) {
        userEntry[1].email = email;
        await Storage.saveUsers(users);
      }

      Utils.showToast('✅ Correo guardado. Ya puedes iniciar sesión.', 'success');
      window.cerrarEmailUpdateModal();
      await auth.signInWithEmailAndPassword(email, password);
      window.location.reload();

    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        err.innerText = "> ESTE CORREO YA ESTÁ REGISTRADO POR OTRO USUARIO_";
      } else {
        err.innerText = "> ERROR AL GUARDAR: " + error.message;
      }
      err.classList.add('visible');
    }
  };
};
window.cerrarEmailUpdateModal = () => {
  document.getElementById('emailUpdateOverlay').style.display = 'none';
  document.getElementById('emailUpdateModal').style.display = 'none';
};

// Inicialización
document.addEventListener("DOMContentLoaded", async () => {
  // Configurar validación de campos
  document.getElementById("age").addEventListener("blur", () => UI.marcarCampoTocado('age'));
  document.getElementById("time").addEventListener("blur", () => UI.marcarCampoTocado('time'));
  document.getElementById("age").addEventListener("input", () => {
    if (AppState.camposTocados.age) UI.validarCampo('age');
    UI.validarTodo();
  });
  document.getElementById("time").addEventListener("input", () => {
    if (AppState.camposTocados.time) UI.validarCampo('time');
    UI.validarTodo();
  });

  UI.validarTodo();
  UI.initDiasCheckboxes();
  UI.setFechaActual();

  document.getElementById('duracionPlan').addEventListener('change', PlanGenerator.validarOpcionesPlan);
  document.getElementById('experienciaDistancia').addEventListener('change', PlanGenerator.validarOpcionesPlan);
  PlanGenerator.validarOpcionesPlan();

  // Verificar sesión guardada
  if (!await Auth.checkSavedSession()) {
    document.getElementById("loginPage").style.display = "flex";
  }

  // PWA
  if (localStorage.getItem('pwa_installed') === 'true') {
    document.getElementById('pwa-banner').style.display = 'none';
  }
  PWA.init();
  PWA.registerServiceWorker();

  setTimeout(() => {
    if (PWA.deferredPrompt && localStorage.getItem('pwa_installed') !== 'true') {
      document.getElementById('pwa-banner').style.display = 'flex';
    }
  }, 3000);

  // Tema
  ThemeManager.init();

  // Habilitar audio al primer click
  document.addEventListener('click', function enableAudio() {
    window.audioEnabled = true;
    document.removeEventListener('click', enableAudio);
  }, { once: true });
});