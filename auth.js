// auth.js
const Auth = {
  switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    
    if (tab === 'login') {
      document.querySelector('.auth-tab').classList.add('active');
      document.getElementById('loginForm').classList.add('active');
    } else {
      document.querySelectorAll('.auth-tab')[1].classList.add('active');
      document.getElementById('registerForm').classList.add('active');
    }
  },

  async registerUser() {
    console.log('➡️ registerUser iniciado');
    
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const err = document.getElementById('registerError');
    const btn = document.getElementById('registerBtn');

    // Validaciones básicas
    if (!username || !email || !password) {
      err.innerText = "> COMPLETA TODOS LOS CAMPOS_";
      err.classList.add('visible');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'REGISTRANDO...';

    try {
      // Crear usuario en Firebase Auth
      console.log('Creando usuario en Auth...');
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      console.log('✅ Usuario creado en Auth:', user.uid);

      // Guardar datos adicionales
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + 1);
      const ahora = new Date();
      const mesActual = `${ahora.getFullYear()}-${ahora.getMonth() + 1}`;

      await db.ref('users/' + user.uid).set({
        username: username,
        email: email,
        created: new Date().toISOString(),
        expires: expiry.toISOString(),
        premium: true,
        calculosMes: 0,
        mesActual: mesActual,
        welcomeSeen: false,
        isAdmin: false,
        adminNotified: false
      });
      console.log('✅ Datos guardados en Realtime Database');

      alert('✅ Registro exitoso. Ahora inicia sesión.');
      
      // Limpiar formulario
      document.getElementById('regUsername').value = '';
      document.getElementById('regEmail').value = '';
      document.getElementById('regPassword').value = '';
      
      // Cambiar a login
      this.switchAuthTab('login');

    } catch (error) {
      console.error('❌ Error en registro:', error);
      let mensaje = 'Error en el registro';
      if (error.code === 'auth/email-already-in-use') {
        mensaje = 'El correo ya está registrado';
      } else if (error.code === 'auth/weak-password') {
        mensaje = 'Contraseña muy débil (mínimo 6 caracteres)';
      } else {
        mensaje = error.message;
      }
      err.innerText = "> " + mensaje;
      err.classList.add('visible');
    } finally {
      btn.disabled = false;
      btn.textContent = '[ REGISTRARSE ]';
    }
  },

  async loginUser() {
    console.log('➡️ loginUser iniciado');
    
    const usernameOrEmail = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const err = document.getElementById('loginError');

    if (!usernameOrEmail || !password) {
      err.innerText = "> INTRODUCE USUARIO O EMAIL Y CONTRASEÑA_";
      err.classList.add('visible');
      return;
    }

    try {
      let email = usernameOrEmail;

      // Si no es email, buscar por username
      if (!usernameOrEmail.includes('@')) {
        console.log('Buscando usuario por nombre:', usernameOrEmail);
        const users = await db.ref('users').once('value');
        const usersData = users.val() || {};
        
        let foundUid = null;
        let foundEmail = null;
        
        Object.entries(usersData).forEach(([uid, data]) => {
          if (data.username === usernameOrEmail) {
            foundUid = uid;
            foundEmail = data.email;
          }
        });
        
        if (!foundEmail) {
          throw new Error('Usuario no encontrado');
        }
        email = foundEmail;
        console.log('Email encontrado:', email);
      }

      // Login
      console.log('Intentando login con email:', email);
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      console.log('✅ Login exitoso:', userCredential.user.uid);
      
      alert('✅ Login exitoso');
      
    } catch (error) {
      console.error('❌ Error en login:', error);
      err.innerText = "> " + error.message;
      err.classList.add('visible');
    }
  }
};