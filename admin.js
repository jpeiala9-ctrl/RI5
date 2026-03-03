// admin.js
const Admin = {
  mensajesRecibidosUnsub: null,
  mensajesEnviadosUnsub: null,

  async actualizarAdminPanel() {
    const users = await Storage.getUsers();
    const ahora = new Date();

    const total = Object.keys(users).length;
    const activos = Object.values(users).filter(u => new Date(u.expires) > ahora).length;
    const expirados = total - activos;
    const pendientes = Object.values(users).filter(u => u.adminNotified === false).length;

    document.getElementById("adminStats").innerHTML = `
      <span class="stat-badge" onclick="window.abrirModalUsuarios('total')">📊 TOTAL <span class="number">${total}</span></span>
      <span class="stat-badge" onclick="window.abrirModalUsuarios('activos')">✅ ACTIVOS <span class="number">${activos}</span></span>
      <span class="stat-badge" onclick="window.abrirModalUsuarios('expirados')">⏳ EXPIRADOS <span class="number">${expirados}</span></span>
      <span class="stat-badge pending" onclick="window.abrirModalPendientes()">🆕 PENDIENTES <span class="number">${pendientes}</span></span>
    `;

    document.getElementById("adminWelcome").innerText = `> ADMIN · ${ahora.toLocaleString()}`;
    this.setupMensajesListeners();
    this.cargarSelectorUsuarios();
  },

  async abrirModalPendientes() {
    const users = await Storage.getUsers();
    const pendientes = Object.entries(users).filter(([uid, d]) => d.adminNotified === false);

    const lista = document.getElementById('listaPendientes');
    let html = '';

    pendientes.forEach(([uid, d]) => {
      const creado = new Date(d.created).toLocaleDateString();
      const expiry = new Date(d.expires).toLocaleDateString();
      html += `
        <div class="usuario-pendiente" data-usuario="${uid}">
          <div class="usuario-header" onclick="this.parentNode.classList.toggle('abierto')">
            <span>${d.username || uid}</span>
            <span class="flecha">▼</span>
          </div>
          <div class="usuario-detalle">
            <div class="user-details">
              <span>📅 Creado: ${creado}</span>
              <span>⏳ Expira: ${expiry}</span>
              <span>📧 Email: ${d.email || 'No registrado'}</span>
            </div>
            <div class="modal-user-actions">
              <button class="btn-enterado" onclick="window.marcarEnterado('${uid}')">✓ ENTERADO</button>
            </div>
          </div>
        </div>
      `;
    });

    lista.innerHTML = html || '<p style="text-align:center; padding:20px;">📭 NO HAY USUARIOS PENDIENTES</p>';
    document.getElementById('modalPendientes').classList.add('active');
  },

  async marcarEnterado(uid) {
    const users = await Storage.getUsers();
    if (users[uid]) {
      users[uid].adminNotified = true;
      await Storage.saveUsers(users);
      this.actualizarAdminPanel();

      const pendientes = Object.entries(users).filter(([u, d]) => d.adminNotified === false);
      if (pendientes.length === 0) {
        document.getElementById('modalPendientes').classList.remove('active');
      } else {
        this.abrirModalPendientes();
      }
      Utils.showToast(`✅ Usuario ${users[uid].username || uid} marcado como enterado`, 'success');
    }
  },

  setupMensajesListeners() {
    if (this.mensajesRecibidosUnsub) this.mensajesRecibidosUnsub();
    if (this.mensajesEnviadosUnsub) this.mensajesEnviadosUnsub();

    this.mensajesRecibidosUnsub = Storage.listenMensajesAdminRecibidos((recibidos) => {
      this.renderMensajesRecibidos(recibidos);
    });

    this.mensajesEnviadosUnsub = Storage.listenMensajesAdminEnviados((enviados) => {
      this.renderMensajesEnviados(enviados);
    });
  },

  renderMensajesRecibidos(recibidos) {
    let htmlRec = '';
    let noLeidosRecibidos = 0;

    recibidos.forEach(item => {
      if (!item.mensaje.leido) noLeidosRecibidos++;

      htmlRec += `<div class="mensaje-item">
        <div class="mensaje-header" onclick="this.parentNode.classList.toggle('abierto')">
          <span>📨 ${item.mensaje.fecha} · ${item.usuarioUid}</span>
          <span class="flecha">▼</span>
          <button class="delete-mensaje" onclick="event.stopPropagation(); window.borrarMensajeAdmin('${item.key}','${item.mensaje.id}')">🗑️</button>
        </div>
        <div class="mensaje-contenido">${item.mensaje.texto}</div>
      </div>`;
    });

    document.getElementById('listaMensajesRecibidosAdmin').innerHTML = htmlRec || '<p>📭 NO HAY MENSAJES</p>';
    AppState.mensajesNoLeidosAdmin = noLeidosRecibidos;
    this.actualizarBadgeAdminSoporte();
  },

  renderMensajesEnviados(enviados) {
    let htmlEnv = '';

    enviados.forEach(item => {
      const claseNoLeido = !item.mensaje.leido ? 'no-leido-usuario' : '';
      htmlEnv += `<div class="mensaje-item ${claseNoLeido}">
        <div class="mensaje-header" onclick="this.parentNode.classList.toggle('abierto')">
          <span>📤 ${item.mensaje.fecha} · <strong style="color:var(--accent-green);">👤 ${item.usuarioUid}</strong></span>
          <span class="flecha">▼</span>
          <button class="delete-mensaje" onclick="event.stopPropagation(); window.borrarMensajeAdmin('${item.key}','${item.mensaje.id}')">🗑️</button>
        </div>
        <div class="mensaje-contenido">
          <div style="margin-bottom:8px;color:var(--accent-green);"><strong>Para: ${item.usuarioUid}</strong></div>
          ${item.mensaje.texto}
        </div>
      </div>`;
    });

    document.getElementById('listaMensajesEnviadosAdmin').innerHTML = htmlEnv || '<p>📭 NO HAS ENVIADO MENSAJES</p>';
  },

  actualizarBadgeAdminSoporte() {
    const t = document.getElementById('adminSoporteTab');
    if (AppState.mensajesNoLeidosAdmin > 0) {
      t.classList.add('soporte-unread');
    } else {
      t.classList.remove('soporte-unread');
    }
  },

  async abrirModalUsuarios(filtro = 'total') {
    const users = await Storage.getUsers();
    const modal = document.getElementById('modalUsuarios');
    const listEl = document.getElementById('modalUserList');
    const titulo = document.getElementById('modalUsuariosTitulo');

    let tituloTexto = '👥 TODOS LOS USUARIOS';
    if (filtro === 'activos') tituloTexto = '✅ USUARIOS ACTIVOS';
    if (filtro === 'expirados') tituloTexto = '⏳ USUARIOS EXPIRADOS';
    if (filtro === 'premium') tituloTexto = '👑 USUARIOS PREMIUM';

    titulo.innerText = tituloTexto;
    this.renderizarListaUsuarios(users, listEl, '', filtro);
    modal.classList.add('active');

    document.getElementById('modalBuscarUsuario').oninput = (e) =>
      this.filtrarUsuariosModal(e.target.value, filtro);
  },

  renderizarListaUsuarios(users, container, filtro = '', tipoFiltro = 'total') {
    const ahora = new Date();

    const items = Object.entries(users)
      .filter(([uid, d]) => (d.username || uid).toLowerCase().includes(filtro.toLowerCase()))
      .filter(([uid, d]) => {
        if (tipoFiltro === 'activos') return new Date(d.expires) > ahora;
        if (tipoFiltro === 'expirados') return new Date(d.expires) <= ahora;
        if (tipoFiltro === 'premium') return d.premium === true;
        return true;
      })
      .map(([uid, d]) => {
        const creado = new Date(d.created).toLocaleDateString();
        const expiry = new Date(d.expires).toLocaleDateString();
        const premium = d.premium ? '✅ PREMIUM' : '❌ NO PREMIUM';
        const estado = new Date(d.expires) > ahora ? '🟢 ACTIVO' : '🔴 EXPIRADO';
        const calculos = d.calculosMes || 0;
        const pendiente = d.adminNotified === false ? ' (🆕 Pendiente)' : '';

        return `
          <div class="usuario-item" onclick="window.toggleUsuario(this)">
            <div class="usuario-header">
              <span>${d.username || uid}${pendiente}</span>
              <span class="flecha">▼</span>
            </div>
            <div class="usuario-detalle">
              <div class="user-details">
                <span>📅 Creado: ${creado}</span>
                <span>⏳ Expira: ${expiry}</span>
                <span>${premium}</span>
                <span>${estado}</span>
                <span>📊 Cálculos mes: ${calculos}/2</span>
                <span>📧 Email: ${d.email || 'No registrado'}</span>
              </div>
              <div class="modal-user-actions">
                <button onclick="event.stopPropagation(); window.extenderUsuario('${uid}',1)">+1 MES</button>
                <button onclick="event.stopPropagation(); window.extenderUsuario('${uid}',3)">+3 MESES</button>
                <button onclick="event.stopPropagation(); window.togglePremium('${uid}')">👑 PREMIUM</button>
                <button onclick="event.stopPropagation(); window.enviarMensajeAUsuario('${uid}')">📨 MENSAJE</button>
                <button onclick="event.stopPropagation(); window.eliminarUsuario('${uid}')">ELIMINAR</button>
              </div>
            </div>
          </div>
        `;
      }).join('');

    container.innerHTML = items || '<p style="text-align:center; padding:20px;">📭 NO HAY USUARIOS</p>';
  },

  filtrarUsuariosModal(filtro, tipoFiltro) {
    Storage.getUsers().then(u => {
      const l = document.getElementById('modalUserList');
      this.renderizarListaUsuarios(u, l, filtro, tipoFiltro);
    });
  },

  async extenderUsuario(uid, meses) {
    const users = await Storage.getUsers();
    if (users[uid]) {
      const e = new Date(users[uid].expires);
      e.setMonth(e.getMonth() + meses);
      users[uid].expires = e.toISOString();
      await Storage.saveUsers(users);
      this.actualizarAdminPanel();
      Utils.showToast(`✅ ${users[uid].username || uid} extendido ${meses} mes`, 'success');
      this.abrirModalUsuarios();
    }
  },

  async togglePremium(uid) {
    const users = await Storage.getUsers();
    if (users[uid]) {
      users[uid].premium = !users[uid].premium;
      await Storage.saveUsers(users);
      this.actualizarAdminPanel();
      Utils.showToast(`✅ Premium de ${users[uid].username || uid} cambiado`, 'success');
      this.abrirModalUsuarios();
    }
  },

  async eliminarUsuario(uid) {
    const confirmed = await Utils.confirm('ELIMINAR USUARIO', `> ¿ELIMINAR "${uid}"?`);
    if (!confirmed) return;

    const users = await Storage.getUsers();
    delete users[uid];
    await Storage.saveUsers(users);

    if (AppState.currentUid === uid) {
      AppState.setCurrentUser(null, null);
    }

    this.actualizarAdminPanel();
    Utils.showToast(`✅ ${uid} eliminado`, 'success');
    this.abrirModalUsuarios();
  },

  exportarUsuariosCSV() {
    Storage.getUsers().then(users => {
      let csv = "UID,Usuario,Creado,Expira,Premium,Estado,Cálculos Mes,Email,AdminNotified\n";
      Object.entries(users).forEach(([uid, d]) => {
        csv += `${uid},${d.username || ''},${new Date(d.created).toLocaleDateString()},${new Date(d.expires).toLocaleDateString()},${d.premium ? 'SI' : 'NO'},${new Date() <= new Date(d.expires) ? 'ACTIVO' : 'EXPIRADO'},${d.calculosMes || 0},${d.email || ''},${d.adminNotified ? 'SI' : 'NO'}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    });
  },

  async renovarExpirados() {
    const confirmed = await Utils.confirm('RENOVAR EXPIRADOS', "> ¿RENOVAR TODOS LOS EXPIRADOS POR 1 MES?");
    if (!confirmed) return;

    const users = await Storage.getUsers();
    const ahora = new Date();

    Object.entries(users).forEach(([uid, d]) => {
      if (new Date(d.expires) <= ahora) {
        const e = new Date(d.expires);
        e.setMonth(e.getMonth() + 1);
        users[uid].expires = e.toISOString();
      }
    });

    await Storage.saveUsers(users);
    this.actualizarAdminPanel();
    Utils.showToast("✅ EXPIRADOS RENOVADOS", 'success');
  },

  async enviarMensajeAUsuario(uid) {
    const txt = prompt(`> MENSAJE PARA ${uid}:`);
    if (!txt) return;

    await Storage.enviarMensajeAdminAUsuario(uid, txt);
    Utils.showToast("✅ ENVIADO", 'success');
  },

  async cargarSelectorUsuarios() {
    const users = await Storage.getUsers();
    const select = document.getElementById('adminSelectorUsuarios');

    let options = '<option value="todos">📢 TODOS LOS USUARIOS</option>';
    Object.keys(users).sort().forEach(uid => {
      options += `<option value="${uid}">${users[uid].username || uid}</option>`;
    });

    select.innerHTML = options;
  },

  async enviarMensajeAdmin() {
    const select = document.getElementById('adminSelectorUsuarios');
    const destino = select.value;
    const texto = document.getElementById('adminMensaje').value.trim();

    if (!texto) return Utils.showToast('> ESCRIBE UN MENSAJE', 'error');

    if (destino === 'todos') {
      const users = await Storage.getUsers();
      for (let uid of Object.keys(users)) {
        await Storage.enviarMensajeAdminAUsuario(uid, texto);
      }
      Utils.showToast('✅ MENSAJE ENVIADO A TODOS LOS USUARIOS', 'success');
    } else {
      await Storage.enviarMensajeAdminAUsuario(destino, texto);
      Utils.showToast(`✅ MENSAJE ENVIADO A ${destino}`, 'success');
    }

    document.getElementById('adminMensaje').value = '';
  },

  cambiarSoporteTab(tab) {
    document.querySelectorAll('#admin-tab-soporte .soporte-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('#admin-tab-soporte .soporte-panel').forEach(p => p.classList.remove('active'));

    if (tab === 'recibidos') {
      document.querySelectorAll('#admin-tab-soporte .soporte-tab')[0].classList.add('active');
      document.getElementById('admin-soporte-recibidos').classList.add('active');
    } else {
      document.querySelectorAll('#admin-tab-soporte .soporte-tab')[1].classList.add('active');
      document.getElementById('admin-soporte-enviados').classList.add('active');
    }
  }
};