// pwa.js
const PWA = {
  deferredPrompt: null,

  init() {
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      this.deferredPrompt = e;
      if (localStorage.getItem('pwa_installed') !== 'true') {
        document.getElementById('pwa-banner').style.display = 'flex';
      }
    });

    window.addEventListener('appinstalled', () => {
      document.getElementById('pwa-banner').style.display = 'none';
      this.deferredPrompt = null;
      localStorage.setItem('pwa_installed', 'true');
    });
  },

  instalarPWA() {
    if (!this.deferredPrompt) {
      Utils.showToast('Para instalar: menú del navegador → "Añadir a pantalla de inicio"', 'info');
      return;
    }

    this.deferredPrompt.prompt();
    this.deferredPrompt.userChoice.then(choice => {
      if (choice.outcome === 'accepted') {
        localStorage.setItem('pwa_installed', 'true');
      }
      this.deferredPrompt = null;
      document.getElementById('pwa-banner').style.display = 'none';
    });
  },

  cerrarBannerPWA() {
    document.getElementById('pwa-banner').style.display = 'none';
  },

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      const sw = `
        const CACHE = 'ri5-cache-v1';
        const urls = [
          '.',
          'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js'
        ];

        self.addEventListener('install', e => {
          e.waitUntil(
            caches.open(CACHE).then(c => c.addAll(urls))
          );
        });

        self.addEventListener('fetch', e => {
          e.respondWith(
            caches.match(e.request).then(r => r || fetch(e.request))
          );
        });

        self.addEventListener('activate', e => {
          e.waitUntil(
            caches.keys().then(keys => {
              return Promise.all(
                keys.map(k => k !== CACHE ? caches.delete(k) : null)
              );
            })
          );
        });
      `;

      const blob = new Blob([sw], { type: 'application/javascript' });
      navigator.serviceWorker.register(URL.createObjectURL(blob)).catch(console.log);
    }
  }
};