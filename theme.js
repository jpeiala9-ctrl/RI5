// theme.js
const ThemeManager = {
  init() {
    const savedTheme = localStorage.getItem('ri5_theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      document.body.classList.add(`manual-${savedTheme}`);
    }
    this.updateButton();
  },

  toggle() {
    if (document.body.classList.contains('manual-light')) {
      document.body.classList.remove('manual-light');
      document.body.classList.add('manual-dark');
      localStorage.setItem('ri5_theme', 'dark');
    } else if (document.body.classList.contains('manual-dark')) {
      document.body.classList.remove('manual-dark');
      localStorage.setItem('ri5_theme', 'light');
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        document.body.classList.add('manual-light');
        localStorage.setItem('ri5_theme', 'light');
      } else {
        document.body.classList.add('manual-dark');
        localStorage.setItem('ri5_theme', 'dark');
      }
    }
    this.updateButton();
  },

  updateButton() {
    const btns = document.querySelectorAll('.theme-toggle');
    btns.forEach(btn => {
      if (document.body.classList.contains('manual-light')) {
        btn.innerText = '🌙';
      } else if (document.body.classList.contains('manual-dark')) {
        btn.innerText = '☀️';
      } else {
        btn.innerText = '🌓';
      }
    });
  }
};