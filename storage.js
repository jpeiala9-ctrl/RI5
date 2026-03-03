// storage.js
const Storage = {
  // ===== USUARIOS =====
  async getUsers() {
    try {
      return (await db.ref('users').once('value')).val() || {};
    } catch(e) {
      Utils.showToast('Error al cargar usuarios', 'error');
      return {};
    }
  },

  async getUser(uid) {
    try {
      return (await db.ref('users/' + uid).once('value')).val() || null;
    } catch(e) {
      Utils.showToast('Error al cargar usuario', 'error');
      return null;
    }
  },

  async saveUser(uid, userData) {
    try {
      await db.ref('users/' + uid).set(userData);
    } catch(e) {
      Utils.showToast('Error al guardar usuario', 'error');
      throw e;
    }
  },

  async updateUser(uid, updates) {
    try {
      await db.ref('users/' + uid).update(updates);
    } catch(e) {
      Utils.showToast('Error al actualizar usuario', 'error');
      throw e;
    }
  },

  async deleteUser(uid) {
    try {
      await db.ref('users/' + uid).remove();
    } catch(e) {
      Utils.showToast('Error al eliminar usuario', 'error');
      throw e;
    }
  },

  // ===== HISTORIAL =====
  async getHistorial(uid) {
    try {
      return (await db.ref('historial/' + uid).once('value')).val() || [];
    } catch(e) {
      Utils.showToast('Error al cargar historial', 'error');
      return [];
    }
  },

  async saveHistorial(uid, historial) {
    try {
      await db.ref('historial/' + uid).set(historial);
    } catch(e) {
      Utils.showToast('Error al guardar historial', 'error');
      throw e;
    }
  },

  // ===== PLANES =====
  async getHistorialPlanes(uid) {
    try {
      return (await db.ref('planesCompletos/' + uid + '/historial').once('value')).val() || [];
    } catch(e) {
      Utils.showToast('Error al cargar historial de planes', 'error');
      return [];
    }
  },

  async saveHistorialPlanes(uid, historial) {
    try {
      await db.ref('planesCompletos/' + uid + '/historial').set(historial);
    } catch(e) {
      Utils.showToast('Error al guardar historial de planes', 'error');
      throw e;
    }
  },

  async getUltimoPlan(uid) {
    try {
      return (await db.ref('planesCompletos/' + uid + '/ultimo').once('value')).val() || null;
    } catch(e) {
      Utils.showToast('Error al cargar plan', 'error');
      return null;
    }
  },

  async setUltimoPlan(uid, plan) {
    try {
      await db.ref('planesCompletos/' + uid + '/ultimo').set(plan);
    } catch(e) {
      Utils.showToast('Error al guardar plan', 'error');
      throw e;
    }
  },

  async removeUltimoPlan(uid) {
    try {
      await db.ref('planesCompletos/' + uid + '/ultimo').remove();
    } catch(e) {
      Utils.showToast('Error al eliminar plan', 'error');
      throw e;
    }
  },

  async getPlanCompleto(uid, planId) {
    try {
      return (await db.ref('planesCompletos/' + uid + '/detalles/' + planId).once('value')).val() || null;
    } catch(e) {
      Utils.showToast('Error al cargar plan completo', 'error');
      return null;
    }
  },

  async savePlanCompleto(uid, planId, planData) {
    try {
      await db.ref('planesCompletos/' + uid + '/detalles/' + planId).set(planData);
    } catch(e) {
      Utils.showToast('Error al guardar plan completo', 'error');
      throw e;
    }
  },

  async deletePlanCompleto(uid, planId) {
    try {
      await db.ref('planesCompletos/' + uid + '/detalles/' + planId).remove();
    } catch(e) {
      Utils.showToast('Error al eliminar plan completo', 'error');
      throw e;
    }
  },

  async marcarSesionRealizada(uid, planId, diaIndex, realizado) {
    try {
      await db.ref('sesionesRealizadas/' + uid + '/' + planId + '/' + diaIndex).set(realizado);
    } catch(e) {
      Utils.showToast('Error al guardar estado de sesión', 'error');
      throw e;
    }
  },

  async getSesionesRealizadas(uid, planId) {
    try {
      return (await db.ref('sesionesRealizadas/' + uid + '/' + planId).once('value')).val() || {};
    } catch(e) {
      Utils.showToast('Error al cargar sesiones realizadas', 'error');
      return {};
    }
  },

  async getUltimoCalculo(uid) {
    try {
      return (await db.ref('historial/' + uid + '/ultimoCalculo').once('value')).val() || null;
    } catch(e) {
      Utils.showToast('Error al cargar cálculo', 'error');
      return null;
    }
  },

  async setUltimoCalculo(uid, calculo) {
    try {
      await db.ref('historial/' + uid + '/ultimoCalculo').set(calculo);
    } catch(e) {
      Utils.showToast('Error al guardar cálculo', 'error');
      throw e;
    }
  },

  // ===== MENSAJES =====
  async getMensajes() {
    try {
      return (await db.ref('mensajes').once('value')).val() || {};
    } catch(e) {
      Utils.showToast('Error al cargar mensajes', 'error');
      return {};
    }
  },

  async saveMensajes(mensajes) {
    try {
      await db.ref('mensajes').set(mensajes);
    } catch(e) {
      Utils.showToast('Error al guardar mensajes', 'error');
      throw e;
    }
  },

  // Para usuarios: obtener mensajes del admin
  listenMensajesUsuario(uid, callback) {
    const ref = db.ref('mensajes/admin_' + uid);
    const listener = ref.on('value', (snapshot) => {
      callback(snapshot.val() || []);
    }, (error) => {
      Utils.showToast('Error en tiempo real', 'error');
    });
    return () => ref.off('value', listener);
  },

  // Para usuarios: obtener mensajes enviados al admin
  listenMensajesEnviadosUsuario(uid, callback) {
    const ref = db.ref('mensajes/' + uid);
    const listener = ref.on('value', (snapshot) => {
      callback(snapshot.val() || []);
    }, (error) => {
      Utils.showToast('Error en tiempo real', 'error');
    });
    return () => ref.off('value', listener);
  },

  // Para admin: recibir mensajes de usuarios
  listenMensajesAdminRecibidos(callback) {
    const ref = db.ref('mensajes');
    const listener = ref.on('value', (snapshot) => {
      const todos = snapshot.val() || {};
      const recibidos = [];
      Object.keys(todos).forEach(k => {
        if (k.startsWith('admin_')) {
          const uid = k.replace('admin_', '');
          todos[k].forEach((msg, idx) => {
            recibidos.push({
              usuarioUid: uid,
              mensaje: msg,
              idx,
              key: k
            });
          });
        }
      });
      callback(recibidos);
    }, (error) => {
      Utils.showToast('Error en tiempo real', 'error');
    });
    return () => ref.off('value', listener);
  },

  // Para admin: mensajes enviados a usuarios
  listenMensajesAdminEnviados(callback) {
    const ref = db.ref('mensajes');
    const listener = ref.on('value', (snapshot) => {
      const todos = snapshot.val() || {};
      const enviados = [];
      Object.keys(todos).forEach(k => {
        if (!k.startsWith('admin_')) {
          todos[k].forEach((msg, idx) => {
            if (msg.esAdmin) {
              enviados.push({
                usuarioUid: k,
                mensaje: msg,
                idx,
                key: k
              });
            }
          });
        }
      });
      callback(enviados);
    }, (error) => {
      Utils.showToast('Error en tiempo real', 'error');
    });
    return () => ref.off('value', listener);
  },

  async enviarMensajeUsuario(uid, texto) {
    const mensajes = await this.getMensajes();
    const key = "admin_" + uid;
    if (!mensajes[key]) mensajes[key] = [];
    mensajes[key].push({
      id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      fecha: new Date().toLocaleString(),
      texto: texto,
      leido: false,
      esUsuario: true
    });
    await this.saveMensajes(mensajes);
  },

  async enviarMensajeAdminAUsuario(uid, texto) {
    const mensajes = await this.getMensajes();
    if (!mensajes[uid]) mensajes[uid] = [];
    mensajes[uid].push({
      id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      fecha: new Date().toLocaleString(),
      texto: texto,
      leido: false,
      esAdmin: true
    });
    await this.saveMensajes(mensajes);
  },

  async marcarLeido(uid, idx) {
    const mensajes = await this.getMensajes();
    if (mensajes[uid] && mensajes[uid][idx]) {
      mensajes[uid][idx].leido = true;
      await this.saveMensajes(mensajes);
    }
  },

  async borrarMensaje(key, id) {
    const mensajes = await this.getMensajes();
    if (mensajes[key]) {
      mensajes[key] = mensajes[key].filter(msg => msg.id !== id);
      if (mensajes[key].length === 0) delete mensajes[key];
      await this.saveMensajes(mensajes);
    }
  }
};