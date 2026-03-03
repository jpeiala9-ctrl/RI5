// main.js
// Asignar funciones a window
window.switchAuthTab = (tab) => Auth.switchAuthTab(tab);
window.registerUser = () => Auth.registerUser();
window.loginUser = () => Auth.loginUser();
window.logoutUser = () => Auth.logoutUser();
window.logoutAdmin = () => Auth.logoutAdmin();
window.eliminarMiCuenta = () => Auth.eliminarMiCuenta();

// Funciones auxiliares
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
console.log('registerUser disponible:', typeof window.registerUser);