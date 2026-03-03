// main.js
// Asignar funciones de auth
window.switchAuthTab = (tab) => Auth.switchAuthTab(tab);
window.registerUser = () => Auth.registerUser();
window.loginUser = () => Auth.loginUser();
window.logoutUser = () => Auth.logoutUser();

// Asignar funciones de training
window.startCalc = () => Training.startCalc();
window.copyResults = () => Training.copyResults();
window.shareResults = () => Training.shareResults();

// Asignar funciones de UI
window.switchTab = (tab) => UI.switchTab(tab);
window.changeDailyTip = () => UI.changeDailyTip();
window.changeConsejo = () => UI.changeConsejo();

// Función togglePassword
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

console.log('✅ main.js cargado');
console.log('Funciones disponibles:', {
  startCalc: typeof window.startCalc,
  switchTab: typeof window.switchTab,
  registerUser: typeof window.registerUser
});