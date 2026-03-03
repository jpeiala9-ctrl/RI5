// auth.js - VERSIÓN SIMPLIFICADA
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
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

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

      alert('✅ Registro exitoso. Ahora inicia sesión.');
      
      document.getElementById('regUsername').value = '';
      document.getElementById('regEmail').value = '';
      document.getElementById('regPassword').value = '';
      
      this.switchAuthTab('login');

    } catch (error) {
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

      if (!usernameOrEmail.includes('@')) {
        const users = await db.ref('users').once('value');
        const usersData = users.val() || {};
        
        let foundEmail = null;
        
        Object.entries(usersData).forEach(([uid, data]) => {
          if (data.username === usernameOrEmail) {
            foundEmail = data.email;
          }
        });
        
        if (!foundEmail) {
          throw new Error('Usuario no encontrado');
        }
        email = foundEmail;
      }

      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      const userData = await db.ref('users/' + user.uid).once('value');
      const userDataVal = userData.val();
      
      if (!userDataVal) {
        throw new Error('Datos de usuario no encontrados');
      }

      alert(`✅ Bienvenido, ${userDataVal.username}`);

      // CAMBIAR A PANTALLA PRINCIPAL
      document.getElementById("loginPage").style.display = "none";
      document.getElementById("mainContent").style.display = "flex";
      
      document.getElementById("userWelcome").innerText = `> BIENVENIDO, ${userDataVal.username.toUpperCase()}`;
      document.getElementById('name').value = userDataVal.username;

    } catch (error) {
      let mensaje = 'Usuario o contraseña incorrectos';
      if (error.code === 'auth/user-not-found') {
        mensaje = 'Usuario no encontrado';
      } else if (error.code === 'auth/wrong-password') {
        mensaje = 'Contraseña incorrecta';
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
  }
};