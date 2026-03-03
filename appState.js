// appState.js
const AppState = {
  currentUid: null,
  currentUserData: null,
  zonasCalculadas: false,
  lastName: "",
  lastAge: 0,
  lastFC: 0,
  lastUL: 0,
  lastZones: [],
  lastPred: [],
  lastRitmoBase: 0,
  ultimoPlanParams: null,
  planGeneradoActual: null,
  planActualId: null,
  sesionesRealizadas: {},
  camposTocados: { name: false, age: false, time: false },
  mensajesNoLeidos: 0,
  mensajesNoLeidosAdmin: 0,
  mensajeListeners: [],
  trimestreActual: 0,

  setCurrentUser(uid, userData) {
    this.currentUid = uid;
    this.currentUserData = userData;

    if (uid) {
      localStorage.setItem('ri5_current_uid', uid);
    } else {
      localStorage.removeItem('ri5_current_uid');
    }

    const title = document.getElementById('ri5Title');
    if (title) {
      if (userData?.premium) {
        title.classList.add('premium');
      } else {
        title.classList.remove('premium');
      }
    }

    if (uid) {
      const nameField = document.getElementById('name');
      if (nameField) nameField.value = userData?.username || '';
    }

    this.actualizarInterfazPremium();
    this.verificarExpiracionPremium();
  },

  get isPremium() {
    return this.currentUserData?.premium || false;
  },

  get premiumExpiryDate() {
    return this.currentUserData?.expires || null;
  },

  get calculosMes() {
    return this.currentUserData?.calculosMes || 0;
  },

  get mesActual() {
    return this.currentUserData?.mesActual || '';
  },

  async incrementarCalculo() {
    if (!this.currentUid) return false;
    if (this.isPremium) return true;

    const ahora = new Date();
    const mesActualKey = `${ahora.getFullYear()}-${ahora.getMonth() + 1}`;

    if (this.mesActual !== mesActualKey) {
      this.currentUserData.calculosMes = 0;
      this.currentUserData.mesActual = mesActualKey;
    }

    if (this.calculosMes >= 2) {
      Utils.showToast('❌ Has alcanzado el límite de 2 cálculos mensuales. Hazte premium para cálculos ilimitados.', 'error');
      return false;
    }

    this.currentUserData.calculosMes++;
    await Storage.updateUser(this.currentUid, {
      calculosMes: this.calculosMes,
      mesActual: this.mesActual
    });

    this.actualizarInterfazPremium();
    return true;
  },

  actualizarInterfazPremium() {
    const planBtns = ['nuevoPlanBtn', 'cargarPlanBtn', 'borrarPlanBtn', 'generarPlanBtn'];
    if (!this.isPremium) {
      planBtns.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.disabled = true;
      });
      const counterDiv = document.getElementById('calculoCounter');
      if (counterDiv) {
        counterDiv.style.display = 'block';
        counterDiv.innerHTML = `📊 Cálculos este mes: ${this.calculosMes}/2`;
      }
    } else {
      planBtns.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.disabled = false;
      });
      const counterDiv = document.getElementById('calculoCounter');
      if (counterDiv) counterDiv.style.display = 'none';
    }
  },

  verificarExpiracionPremium() {
    const banner = document.getElementById('premium-expiry-banner');
    const messageSpan = document.getElementById('expiry-message');

    if (!this.isPremium || !this.premiumExpiryDate) {
      banner.style.display = 'none';
      return;
    }

    const ahora = new Date();
    const expiry = new Date(this.premiumExpiryDate);
    const diasRestantes = Math.ceil((expiry - ahora) / (1000 * 60 * 60 * 24));

    if (diasRestantes <= 7 && diasRestantes > 0) {
      banner.style.display = 'block';
      messageSpan.innerText = `⚠️ Tu premium expira en ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}. Renueva para seguir disfrutando.`;
    } else if (diasRestantes <= 0) {
      banner.style.display = 'block';
      messageSpan.innerText = `⚠️ Tu premium ha expirado. Renueva para seguir disfrutando.`;
    } else {
      banner.style.display = 'none';
    }
  },

  setLastCalc(calc) {
    this.lastName = calc.name;
    this.lastAge = calc.age;
    this.lastFC = calc.fcMax;
    this.lastUL = calc.ul;
    this.lastZones = calc.zones;
    this.lastPred = calc.pred;
    this.lastRitmoBase = calc.ritmoBase;
    this.zonasCalculadas = true;
  },

  clearLastCalc() {
    this.zonasCalculadas = false;
    this.lastName = "";
    this.lastAge = 0;
    this.lastFC = 0;
    this.lastUL = 0;
    this.lastZones = [];
    this.lastPred = [];
    this.lastRitmoBase = 0;
  }
};