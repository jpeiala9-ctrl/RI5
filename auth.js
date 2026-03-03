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

    if (!username || !email || !password) {
      err.innerText = "> COMPLETA TODOS LOS CAMPOS_";
      err.classList.add('visible');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'REGISTRANDO...';

    try {
      console.log('Creando usuario en Auth...');
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      console.log('✅ Usuario creado en Auth:', user.uid);

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
      
      document.getElementById('regUsername').value = '';
      document.getElementById('regEmail').value = '';
      document.getElementById('regPassword').value = '';
      
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
        
        let foundEmail = null;
        let foundUid = null;
        
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
      const user = userCredential.user;
      console.log('✅ Login exitoso:', user.uid);

      // Obtener datos del usuario
      const userData = await db.ref('users/' + user.uid).once('value');
      const userDataVal = userData.val();
      
      if (!userDataVal) {
        throw new Error('Datos de usuario no encontrados');
      }

      console.log('✅ Datos de usuario cargados:', userDataVal.username);
      
      // Mostrar mensaje
      alert(`✅ Bienvenido, ${userDataVal.username}`);

      // CAMBIAR A PANTALLA PRINCIPAL (esto es lo importante)
      document.getElementById("loginPage").style.display = "none";
      document.getElementById("mainContent").style.display = "flex";
      
      // Actualizar bienvenida
      document.getElementById("userWelcome").innerText = `> BIENVENIDO, ${userDataVal.username.toUpperCase()}`;
      
      // Poner nombre en campo
      document.getElementById('name').value = userDataVal.username;

    } catch (error) {
      console.error('❌ Error en login:', error);
      let mensaje = 'Usuario o contraseña incorrectos';
      if (error.code === 'auth/user-not-found') {
        mensaje = 'Usuario no encontrado';
      } else if (error.code === 'auth/wrong-password') {
        mensaje = 'Contraseña incorrecta';
      } else if (error.code === 'auth/too-many-requests') {
        mensaje = 'Demasiados intentos. Intenta más tarde.';
      } else {
        mensaje = error.message;
      }
      err.innerText = "> " + mensaje;
      err.classList.add('visible');
    }
  },

  logoutUser() {
    document.getElementById("mainContent").style.display = "none";
    document.getElementById("loginPage").style.display = "flex";
    document.getElementById("loginUsername").value = '';
    document.getElementById("loginPassword").value = '';
    document.getElementById("results").innerHTML = '';
  },

  logoutAdmin() {
    document.getElementById("adminPage").style.display = "none";
    document.getElementById("loginPage").style.display = "flex";
  }
};