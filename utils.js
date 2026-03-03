// utils.js
const Utils = {
  showToast(message, type = 'info', duration = 3000) {
    // Crear toast simple si no existe el contenedor
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.position = 'fixed';
      container.style.top = '20px';
      container.style.right = '20px';
      container.style.zIndex = '1000000';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.style.background = '#333';
    toast.style.color = 'white';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '40px';
    toast.style.marginBottom = '10px';
    toast.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
    toast.style.animation = 'slideIn 0.3s ease';
    toast.textContent = message;
    
    // Añadir estilos de animación
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    toast.onclick = () => toast.remove();
    container.appendChild(toast);
    
    setTimeout(() => toast.remove(), duration);
  },

  parseTime(t) {
    t = t.trim();
    if (!t) return NaN;
    const m = t.match(/^(\d{1,3}):?(\d{0,2})$/);
    if (!m) return NaN;
    const min = parseInt(m[1]);
    const seg = m[2] ? parseInt(m[2]) : 0;
    if (seg > 59 || min > 120 || min < 10) return NaN;
    return min + seg / 60;
  },

  formatR(r) {
    if (!isFinite(r) || r <= 0) return "--:--";
    let m = Math.floor(r);
    let s = Math.round((r - m) * 60);
    if (s === 60) {
      m++;
      s = 0;
    }
    return m + ":" + (s < 10 ? '0' : '') + s;
  },

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
};

console.log('✅ Utils.js cargado');