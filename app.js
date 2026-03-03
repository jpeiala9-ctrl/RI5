// ============================================
// CONFIGURACIÓN FIREBASE
// ============================================
const firebaseConfig = {
  apiKey: "AIzaSyBw4VYLEeFeG4Z2qJC56iPzzuAzlIkmErc",
  authDomain: "ri5-5b642.firebaseapp.com",
  databaseURL: "https://ri5-5b642-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ri5-5b642",
  storageBucket: "ri5-5b642.firebasestorage.app",
  messagingSenderId: "889154598385",
  appId: "1:889154598385:web:1d4e7dad605a42c1c60050"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

// ============================================
// UTILS
// ============================================
const Utils = {
  parseTime(t) { t = t.trim(); if(!t) return NaN; const m = t.match(/^(\d{1,3}):?(\d{0,2})$/); if(!m) return NaN; const min = parseInt(m[1]), seg = m[2]?parseInt(m[2]):0; if(seg>59||min>120||min<10) return NaN; return min + seg/60; },
  formatR(r) { if(!isFinite(r)||r<=0) return "--:--"; let m = Math.floor(r), s = Math.round((r-m)*60); if(s===60){ m++; s=0; } return m+":"+(s<10?'0':'')+s; },
  showToast(m,t,i=3000) { const c=document.getElementById('toast-container'), o=document.createElement('div'); o.className=`toast ${t}`; o.textContent=m; o.onclick=()=>o.remove(); c.appendChild(o); setTimeout(()=>o.remove(),i); },
  confirm(t,m) { return new Promise(r=>{ const o=document.getElementById('confirmOverlay'), d=document.getElementById('confirmModal'), y=document.getElementById('confirmYes'), n=document.getElementById('confirmNo'); document.getElementById('confirmTitle').textContent=t; document.getElementById('confirmMessage').textContent=m; o.classList.add('active'); d.classList.add('active'); const onYes=()=>{ o.classList.remove('active'); d.classList.remove('active'); y.removeEventListener('click',onYes); n.removeEventListener('click',onNo); r(true); }; const onNo=()=>{ o.classList.remove('active'); d.classList.remove('active'); y.removeEventListener('click',onYes); n.removeEventListener('click',onNo); r(false); }; y.addEventListener('click',onYes); n.addEventListener('click',onNo); }); },
  isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); },
  vibrate(p) { if(window.navigator?.vibrate) window.navigator.vibrate(p); },
  playSound(t) { if(!window.audioEnabled) return; if(!window.audioContext) try{ window.audioContext=new(window.AudioContext||window.webkitAudioContext)(); }catch(e){return;} const o=window.audioContext.createOscillator(), g=window.audioContext.createGain(); o.type='sine'; o.frequency.value=t==='success'?800:400; g.gain.value=0.1; g.gain.exponentialRampToValueAtTime(0.00001,window.audioContext.currentTime+0.5); o.connect(g); g.connect(window.audioContext.destination); o.start(); o.stop(window.audioContext.currentTime+0.2); }
};

// ============================================
// STORAGE
// ============================================
const Storage = {
  async getUsers() { try { return (await db.ref('users').once('value')).val()||{}; } catch(e){ return {}; } },
  async getUser(u) { try { return (await db.ref('users/'+u).once('value')).val()||null; } catch(e){ return null; } },
  async saveUser(u,d) { try { await db.ref('users/'+u).set(d); } catch(e){ throw e; } },
  async updateUser(u,d) { try { await db.ref('users/'+u).update(d); } catch(e){ throw e; } },
  async deleteUser(u) { try { await db.ref('users/'+u).remove(); } catch(e){ throw e; } },
  async getHistorial(u) { try { return (await db.ref('historial/'+u).once('value')).val()||[]; } catch(e){ return []; } },
  async saveHistorial(u,h) { try { await db.ref('historial/'+u).set(h); } catch(e){ throw e; } },
  async getUltimoCalculo(u) { try { return (await db.ref('historial/'+u+'/ultimoCalculo').once('value')).val()||null; } catch(e){ return null; } },
  async setUltimoCalculo(u,c) { try { await db.ref('historial/'+u+'/ultimoCalculo').set(c); } catch(e){ throw e; } },
  async getHistorialPlanes(u) { try { return (await db.ref('planesCompletos/'+u+'/historial').once('value')).val()||[]; } catch(e){ return []; } },
  async saveHistorialPlanes(u,p) { try { await db.ref('planesCompletos/'+u+'/historial').set(p); } catch(e){ throw e; } },
  async getUltimoPlan(u) { try { return (await db.ref('planesCompletos/'+u+'/ultimo').once('value')).val()||null; } catch(e){ return null; } },
  async setUltimoPlan(u,p) { try { await db.ref('planesCompletos/'+u+'/ultimo').set(p); } catch(e){ throw e; } },
  async removeUltimoPlan(u) { try { await db.ref('planesCompletos/'+u+'/ultimo').remove(); } catch(e){ throw e; } },
  async getPlanCompleto(u,i) { try { return (await db.ref('planesCompletos/'+u+'/detalles/'+i).once('value')).val()||null; } catch(e){ return null; } },
  async savePlanCompleto(u,i,d) { try { await db.ref('planesCompletos/'+u+'/detalles/'+i).set(d); } catch(e){ throw e; } },
  async deletePlanCompleto(u,i) { try { await db.ref('planesCompletos/'+u+'/detalles/'+i).remove(); } catch(e){ throw e; } },
  async marcarSesionRealizada(u,p,d,r) { try { await db.ref('sesionesRealizadas/'+u+'/'+p+'/'+d).set(r); } catch(e){ throw e; } },
  async getSesionesRealizadas(u,p) { try { return (await db.ref('sesionesRealizadas/'+u+'/'+p).once('value')).val()||{}; } catch(e){ return {}; } },
  async getMensajes() { try { return (await db.ref('mensajes').once('value')).val()||{}; } catch(e){ return {}; } },
  async saveMensajes(m) { try { await db.ref('mensajes').set(m); } catch(e){ throw e; } },
  listenMensajesUsuario(u,c) { const r=db.ref('mensajes/admin_'+u); const l=r.on('value',s=>c(s.val()||[])); return ()=>r.off('value',l); },
  listenMensajesEnviadosUsuario(u,c) { const r=db.ref('mensajes/'+u); const l=r.on('value',s=>c(s.val()||[])); return ()=>r.off('value',l); },
  listenMensajesAdminRecibidos(c) { const r=db.ref('mensajes'); const l=r.on('value',s=>{ const t=s.val()||{},a=[]; Object.keys(t).forEach(k=>{ if(k.startsWith('admin_')){ const u=k.replace('admin_',''); t[k].forEach((m,i)=>a.push({usuarioUid:u,mensaje:m,idx:i,key:k})); } }); c(a); }); return ()=>r.off('value',l); },
  listenMensajesAdminEnviados(c) { const r=db.ref('mensajes'); const l=r.on('value',s=>{ const t=s.val()||{},a=[]; Object.keys(t).forEach(k=>{ if(!k.startsWith('admin_')){ t[k].forEach((m,i)=>{ if(m.esAdmin) a.push({usuarioUid:k,mensaje:m,idx:i,key:k}); }); } }); c(a); }); return ()=>r.off('value',l); },
  async enviarMensajeUsuario(u,t) { const m=await this.getMensajes(); const k='admin_'+u; if(!m[k]) m[k]=[]; m[k].push({id:Date.now()+'-'+Math.random().toString(36).substr(2,9),fecha:new Date().toLocaleString(),texto:t,leido:false,esUsuario:true}); await this.saveMensajes(m); },
  async enviarMensajeAdminAUsuario(u,t) { const m=await this.getMensajes(); if(!m[u]) m[u]=[]; m[u].push({id:Date.now()+'-'+Math.random().toString(36).substr(2,9),fecha:new Date().toLocaleString(),texto:t,leido:false,esAdmin:true}); await this.saveMensajes(m); },
  async marcarLeido(u,i) { const m=await this.getMensajes(); if(m[u]&&m[u][i]){ m[u][i].leido=true; await this.saveMensajes(m); } },
  async borrarMensaje(k,i) { const m=await this.getMensajes(); if(m[k]){ m[k]=m[k].filter(msg=>msg.id!==i); if(m[k].length===0) delete m[k]; await this.saveMensajes(m); } }
};

// ============================================
// APPSTATE
// ============================================
const AppState = {
  currentUid: null, currentUserData: null, zonasCalculadas: false, lastName: "", lastAge: 0, lastFC: 0, lastUL: 0,
  lastZones: [], lastPred: [], lastRitmoBase: 0, ultimoPlanParams: null, planGeneradoActual: null, planActualId: null,
  sesionesRealizadas: {}, camposTocados: { name: false, age: false, time: false }, mensajesNoLeidos: 0,
  mensajesNoLeidosAdmin: 0, mensajeListeners: [], trimestreActual: 0,
  setCurrentUser(u,d) { this.currentUid=u; this.currentUserData=d; u?localStorage.setItem('ri5_current_uid',u):localStorage.removeItem('ri5_current_uid'); const t=document.getElementById('ri5Title'); if(t&&d?.premium) t.classList.add('premium'); if(u){ const n=document.getElementById('name'); if(n) n.value=d?.username||''; } this.actualizarInterfazPremium(); this.verificarExpiracionPremium(); },
  get isPremium() { return this.currentUserData?.premium||false; },
  get premiumExpiryDate() { return this.currentUserData?.expires||null; },
  get calculosMes() { return this.currentUserData?.calculosMes||0; },
  get mesActual() { return this.currentUserData?.mesActual||''; },
  async incrementarCalculo() { if(!this.currentUid) return false; if(this.isPremium) return true; const a=new Date(), m=`${a.getFullYear()}-${a.getMonth()+1}`; if(this.mesActual!==m){ this.currentUserData.calculosMes=0; this.currentUserData.mesActual=m; } if(this.calculosMes>=2){ Utils.showToast('❌ Límite de 2 cálculos mensuales. Hazte premium.','error'); return false; } this.currentUserData.calculosMes++; await Storage.updateUser(this.currentUid,{calculosMes:this.calculosMes,mesActual:this.mesActual}); this.actualizarInterfazPremium(); return true; },
  actualizarInterfazPremium() { const b=['nuevoPlanBtn','cargarPlanBtn','borrarPlanBtn','generarPlanBtn']; if(!this.isPremium){ b.forEach(i=>{ const btn=document.getElementById(i); if(btn) btn.disabled=true; }); const c=document.getElementById('calculoCounter'); if(c){ c.style.display='block'; c.innerHTML=`📊 Cálculos este mes: ${this.calculosMes}/2`; } } else { b.forEach(i=>{ const btn=document.getElementById(i); if(btn) btn.disabled=false; }); const c=document.getElementById('calculoCounter'); if(c) c.style.display='none'; } },
  verificarExpiracionPremium() { const b=document.getElementById('premium-expiry-banner'), m=document.getElementById('expiry-message'); if(!this.isPremium||!this.premiumExpiryDate){ if(b) b.style.display='none'; return; } const a=new Date(), e=new Date(this.premiumExpiryDate), d=Math.ceil((e-a)/(1000*60*60*24)); if(d<=7&&d>0){ b.style.display='block'; m.innerText=`⚠️ Tu premium expira en ${d} día${d!==1?'s':''}.`; } else if(d<=0){ b.style.display='block'; m.innerText='⚠️ Tu premium ha expirado.'; } else b.style.display='none'; },
  setLastCalc(c) { this.lastName=c.name; this.lastAge=c.age; this.lastFC=c.fcMax; this.lastUL=c.ul; this.lastZones=c.zones; this.lastPred=c.pred; this.lastRitmoBase=c.ritmoBase; this.zonasCalculadas=true; },
  clearLastCalc() { this.zonasCalculadas=false; this.lastName=""; this.lastAge=0; this.lastFC=0; this.lastUL=0; this.lastZones=[]; this.lastPred=[]; this.lastRitmoBase=0; }
};

// ============================================
// AUTH
// ============================================
const Auth = {
  switchAuthTab(t) { document.querySelectorAll('.auth-tab').forEach(b=>b.classList.remove('active')); document.querySelectorAll('.auth-form').forEach(f=>f.classList.remove('active')); if(t==='login'){ document.querySelector('.auth-tab').classList.add('active'); document.getElementById('loginForm').classList.add('active'); }else{ document.querySelectorAll('.auth-tab')[1].classList.add('active'); document.getElementById('registerForm').classList.add('active'); } },
  async registerUser() { const u=document.getElementById('regUsername').value.trim(), e=document.getElementById('regEmail').value.trim(), p=document.getElementById('regPassword').value.trim(), err=document.getElementById('registerError'), btn=document.getElementById('registerBtn'); if(!u||!e||!p){ err.innerText="> COMPLETA TODOS LOS CAMPOS_"; err.classList.add('visible'); return; } if(u.length<3||!/^[a-zA-Z0-9_]+$/.test(u)){ err.innerText="> USUARIO INVÁLIDO_"; err.classList.add('visible'); return; } if(p.length<4){ err.innerText="> MÍNIMO 4 CARACTERES_"; err.classList.add('visible'); return; } if(!Utils.isValidEmail(e)){ err.innerText="> CORREO NO VÁLIDO_"; err.classList.add('visible'); return; } btn.disabled=true; btn.textContent='REGISTRANDO...'; try{ const uc=await auth.createUserWithEmailAndPassword(e,p); const us=uc.user; const users=await Storage.getUsers(); if(Object.values(users).some(u=>u.username===u)){ err.innerText="> EL USUARIO YA EXISTE_"; err.classList.add('visible'); btn.disabled=false; btn.textContent='[ REGISTRARSE ]'; return; } const exp=new Date(); exp.setMonth(exp.getMonth()+1); const a=new Date(), m=`${a.getFullYear()}-${a.getMonth()+1}`; await Storage.saveUser(us.uid,{username:u,email:e,created:new Date().toISOString(),expires:exp.toISOString(),premium:true,calculosMes:0,mesActual:m,welcomeSeen:false,isAdmin:false,adminNotified:false}); await Storage.enviarMensajeAdminAUsuario(us.uid,"¡Bienvenido a RI5! Disfruta de 1 mes premium."); Utils.showToast('✅ Registro exitoso','success'); document.getElementById('registerForm').classList.remove('active'); document.getElementById('loginForm').classList.add('active'); document.querySelectorAll('.auth-tab')[0].classList.add('active'); document.querySelectorAll('.auth-tab')[1].classList.remove('active'); }catch(error){ let msg='Error en el registro'; if(error.code==='auth/email-already-in-use') msg='El correo ya está registrado'; else msg=error.message; err.innerText="> "+msg; err.classList.add('visible'); }finally{ btn.disabled=false; btn.textContent='[ REGISTRARSE ]'; } },
  async loginUser() { const u=document.getElementById('loginUsername').value.trim(), p=document.getElementById('loginPassword').value.trim(), err=document.getElementById('loginError'); if(!u||!p){ err.innerText="> INTRODUCE USUARIO O EMAIL Y CONTRASEÑA_"; err.classList.add('visible'); return; } if(u==='admin'&&p==='091118110485120385'){ Auth.mostrarAdminPanel(); return; } try{ let email=u; if(!u.includes('@')){ const users=await Storage.getUsers(); const entry=Object.entries(users).find(([uid,data])=>data.username===u); if(!entry) throw new Error('Usuario no encontrado'); email=entry[1].email; } const uc=await auth.signInWithEmailAndPassword(email,p); const us=uc.user; const userData=await Storage.getUser(us.uid); if(!userData) throw new Error('Datos de usuario no encontrados'); const now=new Date(), exp=new Date(userData.expires); if(now>exp&&!userData.premium){ Utils.showToast('Tu período ha expirado.','error'); return; } const a=new Date(), m=`${a.getFullYear()}-${a.getMonth()+1}`; let cm=userData.calculosMes||0, mu=userData.mesActual||''; if(mu!==m){ cm=0; mu=m; await Storage.updateUser(us.uid,{calculosMes:0,mesActual:m}); } AppState.setCurrentUser(us.uid,userData); Utils.showToast(`✅ Bienvenido, ${userData.username}`,'success'); document.getElementById("loginPage").style.opacity="0"; setTimeout(()=>{ document.getElementById("loginPage").style.display="none"; document.getElementById("mainContent").style.display="flex"; document.getElementById("userWelcome").innerText=`> BIENVENIDO, ${userData.username.toUpperCase()} (${userData.email}) · ${userData.premium?'PREMIUM':'ACCESO'} HASTA ${new Date(userData.expires).toLocaleDateString()}`; UI.changeDailyTip(); UI.startConsejoAutoChange(); Storage.getUltimoCalculo(us.uid).then(c=>{ if(c){ AppState.setLastCalc(c); UI.mostrarResultadosGuardados(c); } }); if(!userData.welcomeSeen) UI.mostrarWelcomeModal(us.uid); UI.restaurarEstado(); },300); }catch(error){ let msg='Usuario o contraseña incorrectos'; if(error.code==='auth/user-not-found') msg='Usuario no encontrado'; else if(error.code==='auth/wrong-password') msg='Contraseña incorrecta'; else msg=error.message; err.innerText="> "+msg; err.classList.add('visible'); } },
  async logoutUser() { const ok=await Utils.confirm('CERRAR SESIÓN','> ¿CERRAR SESIÓN?_'); if(!ok) return; try{ await auth.signOut(); }catch(e){} AppState.mensajeListeners.forEach(u=>u()); AppState.mensajeListeners=[]; AppState.setCurrentUser(null,null); document.getElementById("mainContent").style.display="none"; document.getElementById("loginPage").style.display="flex"; document.getElementById("loginUsername").value=''; document.getElementById("loginPassword").value=''; document.getElementById("results").innerHTML=''; document.getElementById("calendarioEntreno").style.display="none"; AppState.clearLastCalc(); sessionStorage.removeItem('ri5_estado'); },
  logoutAdmin() { document.getElementById("adminPage").style.display="none"; document.getElementById("loginPage").style.display="flex"; auth.signOut(); },
  mostrarAdminPanel() { document.getElementById("loginPage").style.display="none"; document.getElementById("mainContent").style.display="none"; document.getElementById("adminPage").style.display="flex"; Admin.actualizarAdminPanel(); },
  async checkSavedSession() { const us=auth.currentUser; if(!us) return false; const ud=await Storage.getUser(us.uid); if(!ud){ await auth.signOut(); return false; } const now=new Date(), exp=new Date(ud.expires); if(now>exp&&!ud.premium){ await auth.signOut(); return false; } const a=new Date(), m=`${a.getFullYear()}-${a.getMonth()+1}`; let cm=ud.calculosMes||0, mu=ud.mesActual||''; if(mu!==m){ cm=0; mu=m; await Storage.updateUser(us.uid,{calculosMes:0,mesActual:m}); ud.calculosMes=0; ud.mesActual=m; } AppState.setCurrentUser(us.uid,ud); document.getElementById("loginPage").style.display="none"; document.getElementById("mainContent").style.display="flex"; document.getElementById("userWelcome").innerText=`> BIENVENIDO, ${ud.username.toUpperCase()} (${ud.email}) · ${ud.premium?'PREMIUM':'ACCESO'} HASTA ${exp.toLocaleDateString()}`; const nf=document.getElementById('name'); if(nf) nf.value=ud.username; UI.changeDailyTip(); UI.startConsejoAutoChange(); AppState.actualizarInterfazPremium(); AppState.verificarExpiracionPremium(); const c=await Storage.getUltimoCalculo(us.uid); if(c){ AppState.setLastCalc(c); UI.mostrarResultadosGuardados(c); } UI.setupMensajesListeners(us.uid); setTimeout(()=>UI.restaurarEstado(),500); return true; }
};

// ============================================
// TRAINING
// ============================================
const Training = {
  async startCalc() { UI.validarTodo(); if(document.getElementById("calcBtn").disabled) return; if(!AppState.isPremium){ const p=await AppState.incrementarCalculo(); if(!p) return; } setTimeout(()=>{ this.calculate(); Utils.showToast("✓ CALCULADO",'success'); document.getElementById('results').scrollIntoView({behavior:'smooth'}); Utils.vibrate(50); Utils.playSound('success'); },300); },
  calculate() { const n=AppState.currentUserData?.username||'', a=parseInt(document.getElementById("age").value), t=Utils.parseTime(document.getElementById("time").value); if(!n||!a||isNaN(t)){ Utils.showToast("> COMPLETA TODOS LOS CAMPOS CORRECTAMENTE_",'error'); return; } const r=t/6, fc=220-a, ul=Math.round(fc*0.92*1.03); const pred=[{dist:2,color:"var(--accent-blue)",ritmo:r*0.98},{dist:6,color:"var(--accent-green)",ritmo:r},{dist:10,color:"var(--accent-yellow)",ritmo:r*1.05},{dist:21,color:"var(--accent-red)",ritmo:r*1.12},{dist:42,color:"var(--accent-purple)",ritmo:r*1.20}]; const zones=[["Z1","RECUPERACIÓN",0.75,0.80,1.35,"z1","<p><strong>🎯 Ritmo:</strong> "+Utils.formatR(r*1.35)+" min/km</p><p><strong>📍 Objetivo:</strong> Recuperación activa.</p>"],["Z2","BASE",0.80,0.90,1.25,"z2","<p><strong>🎯 Ritmo:</strong> "+Utils.formatR(r*1.25)+" min/km</p><p><strong>📍 Objetivo:</strong> Resistencia aeróbica.</p>"],["Z3","TEMPO",0.90,0.95,1.15,"z3","<p><strong>🎯 Ritmo:</strong> "+Utils.formatR(r*1.15)+" min/km</p><p><strong>📍 Objetivo:</strong> Elevar umbral.</p>"],["Z4","UMBRAL",0.95,1.02,1.05,"z4","<p><strong>🎯 Ritmo:</strong> "+Utils.formatR(r*1.05)+" min/km</p><p><strong>📍 Objetivo:</strong> Tolerar lactato.</p>"],["Z5","VO₂MÁX",1.02,1.06,0.95,"z5","<p><strong>🎯 Ritmo:</strong> "+Utils.formatR(r*0.95)+" min/km</p><p><strong>📍 Objetivo:</strong> Potencia aeróbica.</p>"],["Z6","VELOCIDAD",1.06,1.12,0.85,"z6","<p><strong>🎯 Ritmo:</strong> "+Utils.formatR(r*0.85)+" min/km</p><p><strong>📍 Objetivo:</strong> Velocidad.</p>"]]; const calc={name:n,age:a,fcMax:fc,ul:ul,zones:zones,pred:pred,ritmoBase:r}; AppState.setLastCalc(calc); UI.mostrarResultados(calc); this.guardarCalculoAutomatico(calc); },
  async guardarCalculoAutomatico(c) { if(!AppState.currentUid) return; const a=new Date(); let zr=c.zones.map(z=>{ const mn=Math.round(c.ul*z[2]), mx=Math.round(c.ul*z[3]); return {zona:z[0],min:mn,max:mx}; }); const d={date:a.toLocaleDateString('es-ES'),hora:a.toLocaleTimeString('es-ES'),nombre:c.name,edad:c.age,fcMax:c.fcMax,umbral:c.ul,ritmo6k:Utils.formatR(c.ritmoBase),predicciones:c.pred.map(p=>`${p.dist}km:${Utils.formatR(p.ritmo)}`).join(' '),resumen:`${c.name} · ${c.age} años · 6km: ${Utils.formatR(c.ritmoBase)}`,zonasResumen:zr}; let h=await Storage.getHistorial(AppState.currentUid); h.unshift(d); const lim=AppState.isPremium?25:10; if(h.length>lim) h.pop(); await Storage.saveHistorial(AppState.currentUid,h); await Storage.setUltimoCalculo(AppState.currentUid,c); if(document.getElementById('tab-historial').classList.contains('active')) UI.cargarHistorial(); },
  copyResults() { if(!AppState.lastName) return Utils.showToast("> CALCULA ZONAS PRIMERO_",'error'); let t="🔹 RI5 - ZONAS DE ENTRENO 🔹\n\n"; t+=`👤 ${AppState.lastName} · ${AppState.lastAge} años\n❤️ FC MÁX: ${AppState.lastFC} lpm · UMBRAL: ${AppState.lastUL} lpm\n⏱️ RITMO 6km: ${Utils.formatR(AppState.lastRitmoBase)} min/km\n\n📊 PREDICCIONES:\n`; AppState.lastPred.forEach(p=>t+=`   ${p.dist} km → ${Utils.formatR(p.ritmo)} min/km\n`); t+=`\n🎯 ZONAS:\n`; AppState.lastZones.forEach(z=>{ const mn=Math.round(AppState.lastUL*z[2]), mx=Math.round(AppState.lastUL*z[3]); t+=`   ${z[0]} ${z[1]}: ${mn}-${mx} lpm\n`; }); navigator.clipboard.writeText(t).then(()=>Utils.showToast("✅ COPIADO",'success')).catch(()=>Utils.showToast("> NO SE PUDO COPIAR.",'error')); },
  shareResults() { if(!AppState.lastName) return Utils.showToast("> CALCULA ZONAS PRIMERO_",'error'); let t="🏃‍♂️ MIS ZONAS DE ENTRENAMIENTO RI5 🏃‍♀️\n\n"; t+=`👤 ${AppState.lastName} · ${AppState.lastAge} años\n❤️ FC MÁX: ${AppState.lastFC} lpm · UMBRAL: ${AppState.lastUL} lpm\n⏱️ RITMO 6km: ${Utils.formatR(AppState.lastRitmoBase)} min/km\n\n📊 PREDICCIONES:\n`; AppState.lastPred.forEach(p=>t+=`   ${p.dist} km → ${Utils.formatR(p.ritmo)} min/km\n`); if(navigator.share){ navigator.share({title:'Mis zonas de entrenamiento RI5',text:t}).catch(()=>{ navigator.clipboard.writeText(t).then(()=>Utils.showToast("✅ COPIADO",'success')); }); }else{ navigator.clipboard.writeText(t).then(()=>Utils.showToast("✅ COPIADO",'success')); } Utils.vibrate(30); }
};

// ============================================
// UI
// ============================================
const UI = {
  consejos:["La constancia es la clave.","El descanso es entrenamiento.","Confía en el proceso.","La Z2 es tu mejor amiga."], consejoIndex:0, dailyInterval:null, consejoInterval:null,
  changeDailyTip() { const e=document.getElementById("dailyTip"); if(e){ e.innerHTML='<span>> '+this.consejos[this.consejoIndex]+'</span><small>// pulsa para otro</small>'; this.consejoIndex=(this.consejoIndex+1)%this.consejos.length; } },
  changeConsejo() { const e=document.getElementById("curiosity"); if(e){ e.innerHTML='<span>'+this.consejos[this.consejoIndex]+'</span><small>// pulsa para otro</small>'; this.consejoIndex=(this.consejoIndex+1)%this.consejos.length; } },
  startConsejoAutoChange() { if(this.dailyInterval) clearInterval(this.dailyInterval); if(this.consejoInterval) clearInterval(this.consejoInterval); this.dailyInterval=setInterval(()=>{ if(document.getElementById("loginPage").style.display!=="none") this.changeDailyTip(); },8000); this.consejoInterval=setInterval(()=>{ if(document.getElementById("mainContent").style.display!=="none") this.changeConsejo(); },8000); },
  marcarCampoTocado(c) { AppState.camposTocados[c]=true; this.validarCampo(c); this.validarTodo(); },
  validarCampo(c) { const el=document.getElementById(c), err=document.getElementById(c+'Error'); if(c==='name') return true; if(!AppState.camposTocados[c]){ err?.classList.remove('visible'); el?.classList.remove('error'); return true; } let ok=true; if(c==='age'){ const a=parseInt(el.value); ok=!isNaN(a)&&a>=14&&a<=85; }else if(c==='time'){ const t=Utils.parseTime(el.value); ok=!isNaN(t)&&t>=12&&t<=90; } if(!ok){ err.innerText=c==='age'?'> EDAD 14-85_':'> FORMATO MM:SS (12-90 MIN)_'; err.classList.add('visible'); el.classList.add('error'); }else{ err.classList.remove('visible'); el.classList.remove('error'); } return ok; },
  validarTodo() { const a=this.validarCampo('age'), t=this.validarCampo('time'); document.getElementById("calcBtn").disabled=!(a&&t); },
  mostrarResultados(d) { let h=`<h2>> MÉTRICAS_</h2><div style="text-align:center; margin:20px 0;">${d.name} · ${d.age} años<br>FC MÁX: ${d.fcMax} lpm · UMBRAL: ${d.ul} lpm<br>RITMO 6km: ${Utils.formatR(d.ritmoBase)} min/km</div><h2>> PREDICCIONES_</h2>`; d.pred.forEach(p=>h+=`<div class="pred-bar" style="border-color:${p.color}; color:${p.color};">${p.dist} km → ${Utils.formatR(p.ritmo)} min/km</div>`); h+=`<h2>> ZONAS_</h2>`; d.zones.forEach(z=>{ const mn=Math.round(d.ul*z[2]), mx=Math.round(d.ul*z[3]); h+=`<div class="zone-card ${z[5]}" onclick="this.classList.toggle('active')"><strong>${z[0]} – ${z[1]}</strong><br>FC: ${mn}-${mx} lpm<div class="long">${z[6]}</div></div>`; }); h+=`<button class="action-button btn-copy" onclick="copyResults()">📋 COPIAR</button><button class="action-button btn-share" onclick="shareResults()">📱 COMPARTIR</button>`; document.getElementById("results").innerHTML=h; document.getElementById("footer").innerText=`${d.name} · ${new Date().toLocaleDateString('es-ES')} · RI5`; },
  mostrarResultadosGuardados(d) { this.mostrarResultados(d); },
  switchTab(t) { document.querySelectorAll('.tab-button').forEach(b=>b.classList.remove('active')); document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active')); const m={'entreno':'ENTRENO','plan':'PLAN','historial':'HISTORIAL','soporte':'SOPORTE'}; document.querySelectorAll('.tab-button').forEach(b=>{ if(b.textContent.includes(m[t])) b.classList.add('active'); }); document.getElementById(`tab-${t}`).classList.add('active'); if(t==='historial') this.cargarHistorial(); if(t==='plan') this.cargarHistorialPlanes(); if(t==='soporte'){ this.cargarMensajesRecibidos(); this.cargarMensajesEnviados(); } this.guardarEstado(); },
  async cargarHistorial() { const c=document.getElementById("historialContainer"); if(!AppState.currentUid){ c.innerHTML='<p style="text-align:center; padding:20px;">📭 SIN USUARIO</p>'; return; } let h=await Storage.getHistorial(AppState.currentUid); const l=parseInt(document.getElementById('historialLimit').value); if(h.length>l) h=h.slice(0,l); if(!h.length){ c.innerHTML='<p style="text-align:center; padding:20px;">📭 SIN HISTORIAL</p>'; return; } let html='<div class="historial-list">'; h.forEach((it,i)=>{ html+=`<div class="historial-item" onclick="toggleHistorialDetalle(this)"><div class="fecha">📅 ${it.date}</div><div class="resumen">${it.resumen}</div><button class="delete-icon" onclick="event.stopPropagation(); borrarEntradaHistorial(${i})">🗑️</button><div class="detalle">${it.hora?`<div>🕒 ${it.hora}</div>`:''}${it.predicciones?`<div>📊 ${it.predicciones}</div>`:''}</div></div>`; }); html+='</div>'; c.innerHTML=html; },
  toggleHistorialDetalle(e) { e.classList.toggle('abierto'); },
  async borrarEntradaHistorial(i) { if(!AppState.currentUid) return; if(!await Utils.confirm('ELIMINAR','¿Eliminar?')) return; let h=await Storage.getHistorial(AppState.currentUid); h.splice(i,1); await Storage.saveHistorial(AppState.currentUid,h); this.cargarHistorial(); Utils.showToast("✅ ELIMINADA",'success'); },
  async borrarHistorial() { if(!AppState.currentUid) return; if(!await Utils.confirm('LIMPIAR','¿Eliminar todo?')) return; await Storage.saveHistorial(AppState.currentUid,[]); this.cargarHistorial(); Utils.showToast("✅ LIMPIO",'success'); },
  async cargarHistorialPlanes() { const c=document.getElementById('planesHistorialContainer'), s=document.getElementById('planesHistorial'); if(!AppState.currentUid||!AppState.isPremium){ s.style.display='none'; return; } const p=await Storage.getHistorialPlanes(AppState.currentUid); if(p.length===0){ s.style.display='none'; return; } s.style.display='block'; let h=''; p.slice(0,3).forEach(pl=>{ const f=new Date(pl.fecha).toLocaleDateString(); h+=`<div class="plan-card" data-plan-id="${pl.id}"><div class="plan-info" onclick="cargarPlanDesdeHistorial('${pl.id}')"><div class="plan-fecha">📅 ${f}</div><div class="plan-resumen">${pl.resumen}</div><div class="plan-detalle">${pl.detalle}</div></div><button class="delete-plan" onclick="event.stopPropagation(); eliminarPlanHistorial('${pl.id}')">🗑️</button></div>`; }); c.innerHTML=h; },
  async guardarPlanEnHistorial(p,c) { if(!AppState.currentUid||!AppState.isPremium) return; const a=new Date(), id=a.getTime().toString(), md={"2k":"2 km","5k":"5 km","10k":"10 km","medio":"MEDIA","maraton":"MARATÓN"}, res=`${md[p.distancia]} · ${p.diasPorSemana} días · ${p.nivel}`, det=`${p.modalidad==='runner'?'Asfalto':'Montaña'} · ${p.objetivo} · Inicio: ${new Date(p.fechaInicio).toLocaleDateString()}`; const np={id:id,fecha:a.toISOString(),resumen:res,detalle:det,params:p}; let h=await Storage.getHistorialPlanes(AppState.currentUid); h.unshift(np); if(h.length>3){ const e=h.pop(); if(e&&e.id) await Storage.deletePlanCompleto(AppState.currentUid,e.id); } await Storage.saveHistorialPlanes(AppState.currentUid,h); await Storage.savePlanCompleto(AppState.currentUid,id,c); this.cargarHistorialPlanes(); },
  async cargarPlanDesdeHistorial(id) { if(!AppState.currentUid) return; try{ const pc=await Storage.getPlanCompleto(AppState.currentUid,id); if(!pc){ Utils.showToast('No se pudo cargar el plan','error'); return; } AppState.planGeneradoActual=pc.params; AppState.planActualId=id; AppState.sesionesRealizadas=pc.realizadas||{}; AppState.trimestreActual=0; document.getElementById("calendarioEntreno").style.display="block"; document.getElementById("cuestionarioEntreno").style.display="none"; this.mostrarCalendario(pc.sesiones); document.getElementById("resumenObjetivo").innerText=pc.resumen; this.guardarEstado(); }catch(e){ Utils.showToast('Error al cargar el plan','error'); } },
  mostrarCalendario(s) { const g=document.getElementById("calendarioGrid"); g.innerHTML=""; const ea=s.length>7*12, i=ea?AppState.trimestreActual*7*12:0, f=ea?Math.min(i+7*12,s.length):s.length, sv=s.slice(i,f); const frag=document.createDocumentFragment(); sv.forEach((se,idx)=>{ const d=i+idx; const div=document.createElement("div"); div.className=`calendario-dia ${se.color}`; if(AppState.sesionesRealizadas[d]) div.classList.add('realizado'); if(se.detalle) div.dataset.detalle=JSON.stringify(se.detalle); div.innerHTML=`<div style="font-size:10px;">S${se.semana}</div><strong>${se.breve}</strong>${se.detalle?`<div style="font-size:8px;">${se.detalle.duracion}${se.detalle.unidad}</div>`:''}`; div.dataset.letra=se.breve; div.dataset.semana=se.semana; div.dataset.colorClass=se.color; div.dataset.diaIndex=d; div.onclick=function(){ UI.mostrarDetalleSesion(this); }; frag.appendChild(div); }); g.appendChild(frag); const n=document.getElementById('calendarioNavegacion'); if(ea){ n.style.display='flex'; document.getElementById('calendarioPagina').innerText=`TRIMESTRE ${AppState.trimestreActual+1}/4`; document.getElementById('calendarioAnterior').disabled=AppState.trimestreActual===0; document.getElementById('calendarioSiguiente').disabled=AppState.trimestreActual===3; }else n.style.display='none'; },
  cambiarTrimestre(d) { AppState.trimestreActual+=d; if(AppState.planActualId){ Storage.getPlanCompleto(AppState.currentUid,AppState.planActualId).then(p=>{ if(p) this.mostrarCalendario(p.sesiones); }); } this.guardarEstado(); },
  mostrarDetalleSesion(c) { const m=document.getElementById("detalleSesion"), o=document.getElementById("modalOverlay"), w=document.getElementById("modalColorWrapper"); w.className="modal-content"; w.classList.add(c.dataset.colorClass); const d=c.dataset.detalle?JSON.parse(c.dataset.detalle):null, di=c.dataset.diaIndex; let tit="", cont=""; if(c.dataset.letra==="D"){ tit="DÍA DE DESCANSO"; cont="<strong>OBJETIVO:</strong> Recuperación completa"; document.getElementById('sesionCheckboxContainer').style.display='none'; }else if(d){ tit=d.nombre||`${c.dataset.letra} · Semana ${c.dataset.semana}`; const rit=PlanGenerator.getRitmoPorZona(d.zona); cont=`<strong>🏃 ${d.nombre}</strong><br><br><strong>⏱️ DURACIÓN:</strong> ${d.duracion} ${d.unidad}<br><strong>📊 ZONA:</strong> ${d.zona}<br><strong>⚡ RITMO:</strong> ${rit}<br><br><strong>📋 ESTRUCTURA:</strong><br>${d.estructura}<br><br><strong>💬 DESCRIPCIÓN:</strong><br>${d.desc}`; document.getElementById('sesionCheckboxContainer').style.display='flex'; const cb=document.getElementById('sesionRealizada'); cb.checked=AppState.sesionesRealizadas[di]||false; cb.onchange=()=>{ const r=cb.checked; AppState.sesionesRealizadas[di]=r; if(AppState.planActualId&&AppState.currentUid) Storage.marcarSesionRealizada(AppState.currentUid,AppState.planActualId,di,r); if(r) c.classList.add('realizado'); else c.classList.remove('realizado'); }; }else{ cont="> SELECCIONA UN DÍA PARA VER DETALLES_"; document.getElementById('sesionCheckboxContainer').style.display='none'; } document.getElementById("tituloSesion").innerText=tit; document.getElementById("descripcionSesion").innerHTML=cont; m.classList.add("visible"); o.classList.add("visible"); },
  cerrarModalSesion() { document.getElementById("detalleSesion").classList.remove("visible"); document.getElementById("modalOverlay").classList.remove("visible"); },
  setupMensajesListeners(u) { if(!u) return; AppState.mensajeListeners.forEach(u=>u()); AppState.mensajeListeners=[]; const ur=Storage.listenMensajesUsuario(u,(m)=>{ AppState.mensajesNoLeidos=m.filter(m=>!m.leido).length; this.renderMensajesRecibidos(m); }); AppState.mensajeListeners.push(ur); const ue=Storage.listenMensajesEnviadosUsuario(u,(m)=>{ this.renderMensajesEnviados(m); }); AppState.mensajeListeners.push(ue); },
  renderMensajesRecibidos(m) { let h=''; m.forEach((msg,i)=>{ const n=!msg.leido?'nuevo':''; h+=`<div class="mensaje-item ${n}" data-id="${msg.id}"><div class="mensaje-header" onclick="toggleMensajeRecibido(this,'${msg.id}')"><span>📨 ${msg.fecha} · Admin</span><span class="flecha">▼</span><button class="delete-mensaje" onclick="event.stopPropagation(); borrarMensajeUsuario('${msg.id}')">🗑️</button></div><div class="mensaje-contenido">${msg.texto}</div></div>`; }); document.getElementById('listaMensajesRecibidos').innerHTML=h||'<p>📭 NO HAY MENSAJES</p>'; this.actualizarBadgeMensajes(); },
  renderMensajesEnviados(m) { let h=''; m.forEach(msg=>{ h+=`<div class="mensaje-item"><div class="mensaje-header" onclick="this.parentNode.classList.toggle('abierto')"><span>📤 ${msg.fecha} · Tú</span><span class="flecha">▼</span></div><div class="mensaje-contenido">${msg.texto}</div></div>`; }); document.getElementById('listaMensajesEnviados').innerHTML=h||'<p>📭 NO HAS ENVIADO MENSAJES</p>'; },
  async borrarMensajeUsuario(id) { if(!AppState.currentUid) return; if(!await Utils.confirm('ELIMINAR',"¿Eliminar?")) return; await Storage.borrarMensaje('admin_'+AppState.currentUid,id); Utils.showToast("✅ ELIMINADO",'success'); },
  async enviarMensajeUsuario() { if(!AppState.currentUid) return; const t=document.getElementById('mensajeUsuario').value.trim(); if(!t) return Utils.showToast('> ESCRIBE UN MENSAJE_','error'); await Storage.enviarMensajeUsuario(AppState.currentUid,t); document.getElementById('mensajeUsuario').value=''; Utils.showToast('✅ ENVIADO','success'); },
  async toggleMensajeRecibido(h,id) { const i=h.closest('.mensaje-item'); i.classList.toggle('abierto'); if(i.classList.contains('nuevo')&&i.classList.contains('abierto')){ i.classList.remove('nuevo'); if(AppState.currentUid){ const m=await Storage.getMensajes(), k='admin_'+AppState.currentUid; if(m[k]){ const idx=m[k].findIndex(msg=>msg.id===id); if(idx!==-1) await Storage.marcarLeido('admin_'+AppState.currentUid,idx); } const ma=await Storage.getMensajes(), mu=ma['admin_'+AppState.currentUid]||[]; AppState.mensajesNoLeidos=mu.filter(m=>!m.leido).length; this.actualizarBadgeMensajes(); } } },
  cambiarSoporteTab(t) { document.querySelectorAll('#tab-soporte .soporte-tab').forEach(t=>t.classList.remove('active')); document.querySelectorAll('#tab-soporte .soporte-panel').forEach(p=>p.classList.remove('active')); if(t==='recibidos'){ document.querySelectorAll('#tab-soporte .soporte-tab')[0].classList.add('active'); document.getElementById('soporte-recibidos').classList.add('active'); }else{ document.querySelectorAll('#tab-soporte .soporte-tab')[1].classList.add('active'); document.getElementById('soporte-enviados').classList.add('active'); } },
  actualizarBadgeMensajes() { const t=document.getElementById('soporteTabButton'); if(AppState.mensajesNoLeidos>0) t.classList.add('soporte-unread'); else t.classList.remove('soporte-unread'); },
  async mostrarWelcomeModal(u) { document.getElementById('welcomeOverlay').style.display='block'; document.getElementById('welcomeModal').style.display='block'; },
  initDiasCheckboxes() { const c=document.getElementById('diasSemanaContainer'), d=['L','M','X','J','V','S','D']; let h=''; for(let i=0;i<7;i++){ const n=i+1; h+=`<div class="dia-checkbox"><input type="checkbox" id="dia${n}" value="${n}"><label for="dia${n}">${d[i]}</label></div>`; } c.innerHTML=h; },
  setFechaActual() { const f=document.getElementById('fechaInicio'); if(f){ const h=new Date(), a=h.getFullYear(), m=String(h.getMonth()+1).padStart(2,'0'), d=String(h.getDate()).padStart(2,'0'); f.value=`${a}-${m}-${d}`; f.min=`${a}-${m}-${d}`; f.max=`${a+1}-${m}-${d}`; } },
  guardarEstado() { if(!AppState.currentUid) return; const e={activeTab:document.querySelector('.tab-button.active')?.textContent.toLowerCase()||'entreno',planVisible:document.getElementById('calendarioEntreno').style.display==='block',planId:AppState.planActualId,trimestre:AppState.trimestreActual}; sessionStorage.setItem('ri5_estado',JSON.stringify(e)); },
  restaurarEstado() { const e=sessionStorage.getItem('ri5_estado'); if(!e) return; try{ const es=JSON.parse(e); if(es.activeTab){ const m={'entreno':'entreno','plan':'plan','historial':'historial','soporte':'soporte'}, t=m[es.activeTab]||'entreno'; this.switchTab(t); } if(es.planVisible&&es.planId){ AppState.trimestreActual=es.trimestre||0; this.cargarPlanDesdeHistorial(es.planId); } }catch(e){ console.warn('Error restaurando estado',e); } },
  cerrarPlan() { document.getElementById("calendarioEntreno").style.display="none"; AppState.planGeneradoActual=null; AppState.planActualId=null; AppState.sesionesRealizadas={}; document.getElementById("cuestionarioEntreno").style.display="block"; this.guardarEstado(); }
};

// ============================================
// PLAN GENERATOR (simplificado, añade tu matriz aquí)
// ============================================
const PlanGenerator = {
  ENTRENAMIENTOS_DB: {
    runner: {
      "2k": {
        principiante: {
          rodaje: [
            { nombre: "Rodaje suave", duracion: 25, unidad: "min", desc: "Sesión muy suave para activación.", estructura: "10' calentamiento + 15' Z2", sensacion: "Muy cómodo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Fondo aeróbico", duracion: 30, unidad: "min", desc: "Mantén ritmo constante aeróbico.", estructura: "5' calentamiento + 20' Z2 + 5' enfriamiento", sensacion: "Cómodo pero constante", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje progresivo", duracion: 30, unidad: "min", desc: "Últimos 10' aumenta ritmo.", estructura: "10' Z2 suave + 10' Z2 medio + 10' Z2 alto", sensacion: "Acabar con ganas", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de recuperación", duracion: 20, unidad: "min", desc: "Sesión muy suave para activar la circulación.", estructura: "20' Z1", sensacion: "Muy fácil", tipo: "rodaje", zona: "Z1" },
            { nombre: "Rodaje matinal", duracion: 30, unidad: "min", desc: "Despertar suave.", estructura: "30' Z2", sensacion: "Refrescante", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje con cambios de ritmo", duracion: 35, unidad: "min", desc: "Introduce 4 cambios de ritmo de 1'", estructura: "10' calentamiento + 4x(1' rápido + 2' suave) + 10' enfriamiento", sensacion: "Dinámico", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de base", duracion: 40, unidad: "min", desc: "Fondo aeróbico para construir resistencia.", estructura: "40' Z2 continuo", sensacion: "Cómodo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje regenerativo", duracion: 25, unidad: "min", desc: "Después de sesión dura.", estructura: "25' Z1-Z2", sensacion: "Muy suave", tipo: "rodaje", zona: "Z1" }
          ],
          series: [
            { nombre: "Series 200m", duracion: 35, unidad: "min", desc: "8x200m con recuperación completa.", estructura: "15' calentamiento + 8x200m (rec 1') + 10' enfriamiento", sensacion: "Rápidas", tipo: "series", zona: "Z4" },
            { nombre: "Fartlek principiante", duracion: 30, unidad: "min", desc: "Juega con ritmos: 2' rápido + 2' suave.", estructura: "10' calentamiento + 10' fartlek + 10' enfriamiento", sensacion: "Divertido", tipo: "series", zona: "Z4" },
            { nombre: "Series 150m", duracion: 30, unidad: "min", desc: "10x150m con recuperación 45''.", estructura: "15' calentamiento + 10x150m + 5' enfriamiento", sensacion: "Explosivas", tipo: "series", zona: "Z5" },
            { nombre: "Series 300m", duracion: 35, unidad: "min", desc: "8x300m con recuperación 1'30.", estructura: "15' calentamiento + 8x300m + 10' enfriamiento", sensacion: "Velocidad", tipo: "series", zona: "Z5" },
            { nombre: "Series 500m", duracion: 40, unidad: "min", desc: "5x500m con recuperación 2'.", estructura: "15' calentamiento + 5x500m + 10' enfriamiento", sensacion: "Fuerte", tipo: "series", zona: "Z4" },
            { nombre: "Series 700m", duracion: 45, unidad: "min", desc: "4x700m con recuperación 2'30.", estructura: "15' calentamiento + 4x700m + 10' enfriamiento", sensacion: "Exigente", tipo: "series", zona: "Z4" },
            { nombre: "Series 1000m", duracion: 50, unidad: "min", desc: "3x1000m con recuperación 3'.", estructura: "15' calentamiento + 3x1000m + 10' enfriamiento", sensacion: "Muy intenso", tipo: "series", zona: "Z5" }
          ],
          tempo: [
            { nombre: "Tempo corto", duracion: 30, unidad: "min", desc: "Ritmo constante en tempo.", estructura: "10' calentamiento + 15' Z3 + 5' enfriamiento", sensacion: "Controlado", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo progresivo", duracion: 35, unidad: "min", desc: "Aumenta ritmo cada 5'.", estructura: "10' calentamiento + 5' Z3 + 5' Z4 + 5' Z3 + 5' Z4 + 5' enfriamiento", sensacion: "Exigente", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo umbral", duracion: 35, unidad: "min", desc: "20' a ritmo umbral.", estructura: "10' calentamiento + 20' Z4 + 5' enfriamiento", sensacion: "Fuerte", tipo: "tempo", zona: "Z4" },
            { nombre: "Tempo largo", duracion: 40, unidad: "min", desc: "25' a ritmo umbral.", estructura: "10' calentamiento + 25' Z4 + 5' enfriamiento", sensacion: "Umbral", tipo: "tempo", zona: "Z4" },
            { nombre: "Tempo variable", duracion: 45, unidad: "min", desc: "Alterna 5' Z3 / 3' Z4.", estructura: "10' calentamiento + 4x(5' Z3 + 3' Z4) + 5' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo progresivo largo", duracion: 50, unidad: "min", desc: "Aumenta ritmo cada 10'.", estructura: "10' calentamiento + 10' Z3 + 10' Z4 + 10' Z3 + 10' enfriamiento", sensacion: "Progresivo", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo umbral largo", duracion: 55, unidad: "min", desc: "35' a ritmo umbral.", estructura: "10' calentamiento + 35' Z4 + 10' enfriamiento", sensacion: "Exigente", tipo: "tempo", zona: "Z4" }
          ],
          largo: [
            { nombre: "Largo base", duracion: 45, unidad: "min", desc: "Primera toma de contacto con volumen.", estructura: "10' calentamiento + 30' Z2 + 5' enfriamiento", sensacion: "Con energía", tipo: "largo", zona: "Z2" },
            { nombre: "Largo con cambios", duracion: 50, unidad: "min", desc: "Últimos 15' a ritmo tempo.", estructura: "25' Z2 + 15' Z3 + 10' enfriamiento", sensacion: "Terminar fuerte", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo resistencia", duracion: 55, unidad: "min", desc: "Trabajo de fondo.", estructura: "55' Z2 continuo", sensacion: "Resistencia", tipo: "largo", zona: "Z2" },
            { nombre: "Largo progresivo", duracion: 60, unidad: "min", desc: "Aumenta ritmo cada 20'.", estructura: "40' Z2 + 20' Z3", sensacion: "Fuerte", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo específico", duracion: 70, unidad: "min", desc: "Incluye cambios de ritmo.", estructura: "45' Z2 + 4x3' Z4 + 15' enfriamiento", sensacion: "Preparación", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo fondo", duracion: 65, unidad: "min", desc: "Fondo largo continuo.", estructura: "65' Z2", sensacion: "Resistencia", tipo: "largo", zona: "Z2" }
          ]
        },
        intermedio: {
          rodaje: [
            { nombre: "Rodaje activo", duracion: 35, unidad: "min", desc: "Ritmo vivo dentro de Z2.", estructura: "10' calentamiento + 20' Z2 vivo + 5' enfriamiento", sensacion: "Sostenible", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje calidad", duracion: 40, unidad: "min", desc: "Ritmo sostenido en Z2 alto.", estructura: "40' Z2 continuo", sensacion: "Exigente", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje aeróbico", duracion: 45, unidad: "min", desc: "Fondo aeróbico.", estructura: "45' Z2 constante", sensacion: "Fluido", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de mantenimiento", duracion: 30, unidad: "min", desc: "Sesión para mantener forma.", estructura: "30' Z2", sensacion: "Cómodo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje con estímulos", duracion: 40, unidad: "min", desc: "Introduce 3 cambios de ritmo.", estructura: "10' calentamiento + 3x(2' rápido + 3' suave) + 10' enfriamiento", sensacion: "Estimulante", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de recuperación activa", duracion: 25, unidad: "min", desc: "Después de sesión intensa.", estructura: "25' Z1-Z2", sensacion: "Muy suave", tipo: "rodaje", zona: "Z1" },
            { nombre: "Rodaje de base", duracion: 50, unidad: "min", desc: "Fondo para construir resistencia.", estructura: "50' Z2", sensacion: "Resistencia", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje progresivo", duracion: 45, unidad: "min", desc: "Aumenta ritmo cada 15'.", estructura: "15' Z2 + 15' Z2 medio + 15' Z2 alto", sensacion: "Progresivo", tipo: "rodaje", zona: "Z2" }
          ],
          series: [
            { nombre: "Series 400m", duracion: 40, unidad: "min", desc: "6x400m con recuperación 2'.", estructura: "15' calentamiento + 6x400m + 10' enfriamiento", sensacion: "Exigente", tipo: "series", zona: "Z4" },
            { nombre: "Series 600m", duracion: 45, unidad: "min", desc: "5x600m con recuperación 2'30.", estructura: "15' calentamiento + 5x600m + 10' enfriamiento", sensacion: "Intenso", tipo: "series", zona: "Z4" },
            { nombre: "Pirámide", duracion: 45, unidad: "min", desc: "200-400-600-400-200m.", estructura: "15' calentamiento + pirámide + 10' enfriamiento", sensacion: "Completo", tipo: "series", zona: "Z4-Z5" },
            { nombre: "Series 800m", duracion: 50, unidad: "min", desc: "4x800m con recuperación 3'.", estructura: "15' calentamiento + 4x800m + 10' enfriamiento", sensacion: "Muy exigente", tipo: "series", zona: "Z4" },
            { nombre: "Series 1000m", duracion: 55, unidad: "min", desc: "3x1000m con recuperación 3'.", estructura: "15' calentamiento + 3x1000m + 10' enfriamiento", sensacion: "Fuerte", tipo: "series", zona: "Z5" },
            { nombre: "Fartlek avanzado", duracion: 40, unidad: "min", desc: "Juega con ritmos variables.", estructura: "10' calentamiento + 15' fartlek + 15' enfriamiento", sensacion: "Divertido", tipo: "series", zona: "Z4" },
            { nombre: "Series 200m rápidas", duracion: 35, unidad: "min", desc: "10x200m con recuperación 1'.", estructura: "15' calentamiento + 10x200m + 5' enfriamiento", sensacion: "Explosivas", tipo: "series", zona: "Z5" }
          ],
          tempo: [
            { nombre: "Tempo sostenido", duracion: 35, unidad: "min", desc: "20' a ritmo de tempo.", estructura: "10' calentamiento + 20' tempo + 5' enfriamiento", sensacion: "Continuo", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo umbral", duracion: 40, unidad: "min", desc: "25' a ritmo umbral.", estructura: "10' calentamiento + 25' Z4 + 5' enfriamiento", sensacion: "Exigente", tipo: "tempo", zona: "Z4" },
            { nombre: "Tempo variable", duracion: 40, unidad: "min", desc: "Alterna 5' Z3 / 3' Z4.", estructura: "10' calentamiento + 4x(5' Z3 + 3' Z4) + 5' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo largo", duracion: 45, unidad: "min", desc: "30' a ritmo tempo.", estructura: "10' calentamiento + 30' Z3 + 5' enfriamiento", sensacion: "Resistencia", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo progresivo", duracion: 45, unidad: "min", desc: "Aumenta ritmo cada 10'.", estructura: "10' calentamiento + 10' Z3 + 10' Z4 + 10' Z3 + 5' enfriamiento", sensacion: "Progresivo", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo umbral largo", duracion: 50, unidad: "min", desc: "35' a ritmo umbral.", estructura: "10' calentamiento + 35' Z4 + 5' enfriamiento", sensacion: "Muy exigente", tipo: "tempo", zona: "Z4" },
            { nombre: "Tempo con cambios", duracion: 40, unidad: "min", desc: "Introduce 4 cambios de ritmo.", estructura: "10' calentamiento + 20' tempo con cambios + 10' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" }
          ],
          largo: [
            { nombre: "Largo con cambios", duracion: 50, unidad: "min", desc: "Últimos 15' a ritmo tempo.", estructura: "25' Z2 + 15' Z3 + 10' enfriamiento", sensacion: "Fuerte", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo progresivo", duracion: 55, unidad: "min", desc: "De Z2 a Z4 progresivamente.", estructura: "20' Z2 + 20' Z3 + 15' Z4", sensacion: "Simulación", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo fondo", duracion: 60, unidad: "min", desc: "Fondo largo.", estructura: "60' Z2 continuo", sensacion: "Resistencia", tipo: "largo", zona: "Z2" },
            { nombre: "Largo calidad", duracion: 65, unidad: "min", desc: "Incluye cambios de ritmo.", estructura: "40' Z2 + 4x3' Z4 + 13' enfriamiento", sensacion: "Exigente", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo específico", duracion: 70, unidad: "min", desc: "Preparación para competición.", estructura: "45' Z2 + 5x3' Z4 + 10' enfriamiento", sensacion: "Preparación", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo resistencia", duracion: 75, unidad: "min", desc: "Fondo largo continuo.", estructura: "75' Z2", sensacion: "Resistencia", tipo: "largo", zona: "Z2" },
            { nombre: "Largo con series", duracion: 80, unidad: "min", desc: "Incluye series cortas.", estructura: "50' Z2 + 3x1000m Z4 + 15' enfriamiento", sensacion: "Exigente", tipo: "largo", zona: "Z2-Z4" }
          ]
        },
        avanzado: {
          rodaje: [
            { nombre: "Rodaje calidad", duracion: 40, unidad: "min", desc: "Ritmo sostenido en Z2 alto.", estructura: "40' Z2 continuo", sensacion: "Exigente", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje activo", duracion: 45, unidad: "min", desc: "Ritmo vivo exigente.", estructura: "45' Z2 vivo", sensacion: "Sostenible", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje técnico", duracion: 50, unidad: "min", desc: "Enfoque en cadencia.", estructura: "50' Z2 con cadencia alta", sensacion: "Eficiente", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de mantenimiento", duracion: 35, unidad: "min", desc: "Sesión para mantener forma.", estructura: "35' Z2", sensacion: "Cómodo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje con estímulos", duracion: 45, unidad: "min", desc: "Introduce 4 cambios de ritmo.", estructura: "10' calentamiento + 4x(2' rápido + 3' suave) + 10' enfriamiento", sensacion: "Estimulante", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de recuperación", duracion: 30, unidad: "min", desc: "Después de sesión intensa.", estructura: "30' Z1-Z2", sensacion: "Muy suave", tipo: "rodaje", zona: "Z1" },
            { nombre: "Rodaje de base", duracion: 55, unidad: "min", desc: "Fondo para construir resistencia.", estructura: "55' Z2", sensacion: "Resistencia", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje progresivo", duracion: 50, unidad: "min", desc: "Aumenta ritmo cada 10'.", estructura: "10' Z2 + 20' Z2 medio + 20' Z2 alto", sensacion: "Progresivo", tipo: "rodaje", zona: "Z2" }
          ],
          series: [
            { nombre: "Series 800m", duracion: 45, unidad: "min", desc: "5x800m con recuperación 3'.", estructura: "15' calentamiento + 5x800m + 10' enfriamiento", sensacion: "Intenso", tipo: "series", zona: "Z5" },
            { nombre: "Series 1000m", duracion: 50, unidad: "min", desc: "4x1000m con recuperación 3'.", estructura: "15' calentamiento + 4x1000m + 10' enfriamiento", sensacion: "Muy intenso", tipo: "series", zona: "Z5" },
            { nombre: "Series 1200m", duracion: 55, unidad: "min", desc: "3x1200m con recuperación 3'30.", estructura: "15' calentamiento + 3x1200m + 10' enfriamiento", sensacion: "Exigente", tipo: "series", zona: "Z5" },
            { nombre: "Series 1600m", duracion: 60, unidad: "min", desc: "3x1600m con recuperación 4'.", estructura: "15' calentamiento + 3x1600m + 10' enfriamiento", sensacion: "Máximo", tipo: "series", zona: "Z5" },
            { nombre: "Pirámide larga", duracion: 55, unidad: "min", desc: "200-400-800-1200-800-400-200m.", estructura: "15' calentamiento + pirámide + 10' enfriamiento", sensacion: "Completo", tipo: "series", zona: "Z5" },
            { nombre: "Fartlek avanzado", duracion: 45, unidad: "min", desc: "Juega con ritmos intensos.", estructura: "10' calentamiento + 20' fartlek + 15' enfriamiento", sensacion: "Divertido", tipo: "series", zona: "Z5" },
            { nombre: "Series 600m", duracion: 50, unidad: "min", desc: "6x600m con recuperación 2'.", estructura: "15' calentamiento + 6x600m + 10' enfriamiento", sensacion: "Intenso", tipo: "series", zona: "Z5" }
          ],
          tempo: [
            { nombre: "Tempo largo", duracion: 40, unidad: "min", desc: "25' a ritmo umbral.", estructura: "10' calentamiento + 25' Z4 + 5' enfriamiento", sensacion: "Umbral", tipo: "tempo", zona: "Z4" },
            { nombre: "Tempo umbral", duracion: 45, unidad: "min", desc: "30' a ritmo umbral.", estructura: "10' calentamiento + 30' Z4 + 5' enfriamiento", sensacion: "Exigente", tipo: "tempo", zona: "Z4" },
            { nombre: "Tempo variable", duracion: 45, unidad: "min", desc: "Alterna 3' Z3 / 3' Z4.", estructura: "10' calentamiento + 5x(3' Z3 + 3' Z4) + 5' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo competición", duracion: 50, unidad: "min", desc: "35' a ritmo competición.", estructura: "10' calentamiento + 35' Z4 + 5' enfriamiento", sensacion: "Ritmo carrera", tipo: "tempo", zona: "Z4" },
            { nombre: "Tempo progresivo", duracion: 50, unidad: "min", desc: "Aumenta ritmo cada 8'.", estructura: "10' calentamiento + 8' Z3 + 8' Z4 + 8' Z3 + 8' Z4 + 8' enfriamiento", sensacion: "Progresivo", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo umbral largo", duracion: 55, unidad: "min", desc: "40' a ritmo umbral.", estructura: "10' calentamiento + 40' Z4 + 5' enfriamiento", sensacion: "Muy exigente", tipo: "tempo", zona: "Z4" },
            { nombre: "Tempo con cambios", duracion: 45, unidad: "min", desc: "Introduce 5 cambios de ritmo.", estructura: "10' calentamiento + 25' tempo con cambios + 10' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3-Z4" }
          ],
          largo: [
            { nombre: "Largo progresivo", duracion: 55, unidad: "min", desc: "De Z2 a Z4 progresivamente.", estructura: "20' Z2 + 20' Z3 + 15' Z4", sensacion: "Simulación", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo específico", duracion: 60, unidad: "min", desc: "Incluye cambios de ritmo.", estructura: "40' Z2 + 4x3' Z4 + 8' enfriamiento", sensacion: "Preparación", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo calidad", duracion: 65, unidad: "min", desc: "Progresión constante.", estructura: "30' Z2 + 20' Z3 + 15' Z4", sensacion: "Exigente", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo fondo", duracion: 70, unidad: "min", desc: "Fondo largo continuo.", estructura: "70' Z2", sensacion: "Resistencia", tipo: "largo", zona: "Z2" },
            { nombre: "Largo con series", duracion: 75, unidad: "min", desc: "Incluye series largas.", estructura: "45' Z2 + 3x1000m Z4 + 15' enfriamiento", sensacion: "Exigente", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo resistencia", duracion: 80, unidad: "min", desc: "Fondo largo con cambios.", estructura: "60' Z2 + 20' Z3", sensacion: "Resistencia", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo ultradistancia", duracion: 90, unidad: "min", desc: "Preparación para maratón.", estructura: "70' Z2 + 20' Z3", sensacion: "Preparación", tipo: "largo", zona: "Z2-Z3" }
          ]
        }
      },
      "5k": {
        principiante: {
          rodaje: [
            { nombre: "Rodaje 5k suave", duracion: 35, unidad: "min", desc: "Rodaje suave para 5k.", estructura: "10' calentamiento + 20' Z2 + 5' enfriamiento", sensacion: "Cómodo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Fondo 5k", duracion: 40, unidad: "min", desc: "Fondo aeróbico.", estructura: "40' Z2 continuo", sensacion: "Constante", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje progresivo 5k", duracion: 40, unidad: "min", desc: "Aumenta ritmo cada 10'.", estructura: "10' calentamiento + 20' progresivo + 10' enfriamiento", sensacion: "Progresivo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de recuperación 5k", duracion: 30, unidad: "min", desc: "Sesión muy suave.", estructura: "30' Z1-Z2", sensacion: "Muy fácil", tipo: "rodaje", zona: "Z1" },
            { nombre: "Rodaje matinal 5k", duracion: 35, unidad: "min", desc: "Despertar suave.", estructura: "35' Z2", sensacion: "Refrescante", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje con cambios 5k", duracion: 40, unidad: "min", desc: "Introduce cambios de ritmo.", estructura: "10' calentamiento + 20' con cambios + 10' enfriamiento", sensacion: "Dinámico", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje base 5k", duracion: 45, unidad: "min", desc: "Fondo para construir resistencia.", estructura: "45' Z2", sensacion: "Resistencia", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje regenerativo 5k", duracion: 30, unidad: "min", desc: "Después de sesión dura.", estructura: "30' Z1", sensacion: "Muy suave", tipo: "rodaje", zona: "Z1" }
          ],
          series: [
            { nombre: "Series 300m", duracion: 40, unidad: "min", desc: "8x300m con recuperación.", estructura: "15' calentamiento + 8x300m + 10' enfriamiento", sensacion: "Velocidad", tipo: "series", zona: "Z4" },
            { nombre: "Fartlek 5k", duracion: 35, unidad: "min", desc: "1' rápido + 2' suave.", estructura: "10' calentamiento + 8 repeticiones + 5' enfriamiento", sensacion: "Dinámico", tipo: "series", zona: "Z4" },
            { nombre: "Series 200m", duracion: 35, unidad: "min", desc: "10x200m con recuperación 1'.", estructura: "15' calentamiento + 10x200m + 5' enfriamiento", sensacion: "Rápidas", tipo: "series", zona: "Z5" },
            { nombre: "Series 400m", duracion: 40, unidad: "min", desc: "6x400m con recuperación 2'.", estructura: "15' calentamiento + 6x400m + 10' enfriamiento", sensacion: "Fuerte", tipo: "series", zona: "Z4" },
            { nombre: "Series 600m", duracion: 45, unidad: "min", desc: "4x600m con recuperación 2'30.", estructura: "15' calentamiento + 4x600m + 10' enfriamiento", sensacion: "Exigente", tipo: "series", zona: "Z4" },
            { nombre: "Pirámide 5k", duracion: 45, unidad: "min", desc: "200-400-600-400-200m.", estructura: "15' calentamiento + pirámide + 10' enfriamiento", sensacion: "Completo", tipo: "series", zona: "Z4-Z5" },
            { nombre: "Series 800m", duracion: 50, unidad: "min", desc: "3x800m con recuperación 3'.", estructura: "15' calentamiento + 3x800m + 10' enfriamiento", sensacion: "Muy exigente", tipo: "series", zona: "Z5" }
          ],
          tempo: [
            { nombre: "Tempo 5k", duracion: 35, unidad: "min", desc: "15' a ritmo tempo.", estructura: "10' calentamiento + 15' Z3 + 10' enfriamiento", sensacion: "Constante", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo corto", duracion: 30, unidad: "min", desc: "12' a ritmo tempo.", estructura: "10' calentamiento + 12' Z3 + 8' enfriamiento", sensacion: "Controlado", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo progresivo", duracion: 40, unidad: "min", desc: "Aumenta ritmo cada 5'.", estructura: "10' calentamiento + 5' Z2 + 5' Z3 + 5' Z4 + 5' Z3 + 10' enfriamiento", sensacion: "Exigente", tipo: "tempo", zona: "Z2-Z4" },
            { nombre: "Tempo umbral", duracion: 40, unidad: "min", desc: "20' a ritmo umbral.", estructura: "10' calentamiento + 20' Z4 + 10' enfriamiento", sensacion: "Fuerte", tipo: "tempo", zona: "Z4" },
            { nombre: "Tempo largo", duracion: 45, unidad: "min", desc: "25' a ritmo tempo.", estructura: "10' calentamiento + 25' Z3 + 10' enfriamiento", sensacion: "Resistencia", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo variable", duracion: 40, unidad: "min", desc: "Alterna 3' Z3 / 2' Z4.", estructura: "10' calentamiento + 6x(3' Z3 + 2' Z4) + 5' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo con cambios", duracion: 45, unidad: "min", desc: "Introduce 5 cambios.", estructura: "10' calentamiento + 25' tempo con cambios + 10' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" }
          ],
          largo: [
            { nombre: "Largo 5k", duracion: 50, unidad: "min", desc: "Rodaje largo resistencia.", estructura: "50' Z2 continuo", sensacion: "Base", tipo: "largo", zona: "Z2" },
            { nombre: "Largo con cambios", duracion: 55, unidad: "min", desc: "Últimos 15' más rápido.", estructura: "40' Z2 + 15' Z3", sensacion: "Fuerte", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo fondo", duracion: 60, unidad: "min", desc: "Fondo largo.", estructura: "60' Z2 continuo", sensacion: "Resistencia", tipo: "largo", zona: "Z2" },
            { nombre: "Largo progresivo", duracion: 55, unidad: "min", desc: "Aumenta ritmo cada 15'.", estructura: "40' Z2 + 15' Z3", sensacion: "Fuerte", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo específico", duracion: 65, unidad: "min", desc: "Incluye cambios.", estructura: "45' Z2 + 4x3' Z4 + 8' enfriamiento", sensacion: "Preparación", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo calidad", duracion: 60, unidad: "min", desc: "Progresión constante.", estructura: "40' Z2 + 20' Z3", sensacion: "Exigente", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo resistencia", duracion: 70, unidad: "min", desc: "Fondo largo.", estructura: "70' Z2", sensacion: "Resistencia", tipo: "largo", zona: "Z2" }
          ]
        },
        intermedio: {
          rodaje: [
            { nombre: "Rodaje activo 5k", duracion: 40, unidad: "min", desc: "Ritmo vivo controlado.", estructura: "40' Z2 vivo", sensacion: "Eficiente", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje calidad", duracion: 45, unidad: "min", desc: "Ritmo exigente.", estructura: "45' Z2 alto", sensacion: "Exigente", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje aeróbico", duracion: 50, unidad: "min", desc: "Fondo aeróbico.", estructura: "50' Z2 constante", sensacion: "Resistencia", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de mantenimiento", duracion: 35, unidad: "min", desc: "Sesión para mantener forma.", estructura: "35' Z2", sensacion: "Cómodo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje con estímulos", duracion: 45, unidad: "min", desc: "Introduce 4 cambios.", estructura: "10' calentamiento + 4x(2' rápido + 3' suave) + 10' enfriamiento", sensacion: "Estimulante", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de recuperación", duracion: 30, unidad: "min", desc: "Después de sesión intensa.", estructura: "30' Z1-Z2", sensacion: "Muy suave", tipo: "rodaje", zona: "Z1" },
            { nombre: "Rodaje de base", duracion: 55, unidad: "min", desc: "Fondo para construir resistencia.", estructura: "55' Z2", sensacion: "Resistencia", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje progresivo", duracion: 50, unidad: "min", desc: "Aumenta ritmo cada 15'.", estructura: "15' Z2 + 20' Z2 medio + 15' Z2 alto", sensacion: "Progresivo", tipo: "rodaje", zona: "Z2" }
          ],
          series: [
            { nombre: "Series 600m", duracion: 45, unidad: "min", desc: "6x600m con recuperación.", estructura: "15' calentamiento + 6x600m + 10' enfriamiento", sensacion: "Intensidad", tipo: "series", zona: "Z4" },
            { nombre: "Series 800m", duracion: 50, unidad: "min", desc: "5x800m con recuperación 2'30.", estructura: "15' calentamiento + 5x800m + 10' enfriamiento", sensacion: "Exigente", tipo: "series", zona: "Z4" },
            { nombre: "Pirámide 5k", duracion: 50, unidad: "min", desc: "200-400-600-800-600-400-200m.", estructura: "15' calentamiento + pirámide + 10' enfriamiento", sensacion: "Completo", tipo: "series", zona: "Z4-Z5" },
            { nombre: "Series 1000m", duracion: 55, unidad: "min", desc: "4x1000m con recuperación 3'.", estructura: "15' calentamiento + 4x1000m + 10' enfriamiento", sensacion: "Fuerte", tipo: "series", zona: "Z5" },
            { nombre: "Series 400m", duracion: 45, unidad: "min", desc: "8x400m con recuperación 1'30.", estructura: "15' calentamiento + 8x400m + 10' enfriamiento", sensacion: "Intenso", tipo: "series", zona: "Z4" },
            { nombre: "Fartlek avanzado", duracion: 45, unidad: "min", desc: "Juega con ritmos.", estructura: "10' calentamiento + 20' fartlek + 15' enfriamiento", sensacion: "Divertido", tipo: "series", zona: "Z4" },
            { nombre: "Series 200m rápidas", duracion: 40, unidad: "min", desc: "12x200m con recuperación 1'.", estructura: "15' calentamiento + 12x200m + 5' enfriamiento", sensacion: "Explosivas", tipo: "series", zona: "Z5" }
          ],
          tempo: [
            { nombre: "Tempo umbral", duracion: 40, unidad: "min", desc: "20' a ritmo umbral.", estructura: "10' calentamiento + 20' umbral + 10' enfriamiento", sensacion: "Sostenido", tipo: "tempo", zona: "Z4" },
            { nombre: "Tempo 5k", duracion: 45, unidad: "min", desc: "25' a ritmo umbral.", estructura: "10' calentamiento + 25' Z4 + 10' enfriamiento", sensacion: "Exigente", tipo: "tempo", zona: "Z4" },
            { nombre: "Tempo variable", duracion: 45, unidad: "min", desc: "Alterna 5' Z3 / 3' Z4.", estructura: "10' calentamiento + 3x(5' Z3 + 3' Z4) + 2' Z3 + 10' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo largo", duracion: 50, unidad: "min", desc: "30' a ritmo tempo.", estructura: "10' calentamiento + 30' Z3 + 10' enfriamiento", sensacion: "Resistencia", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo progresivo", duracion: 50, unidad: "min", desc: "Aumenta cada 8'.", estructura: "10' calentamiento + 8' Z3 + 8' Z4 + 8' Z3 + 8' Z4 + 8' enfriamiento", sensacion: "Progresivo", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo con cambios", duracion: 45, unidad: "min", desc: "Introduce 5 cambios.", estructura: "10' calentamiento + 25' tempo con cambios + 10' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo umbral largo", duracion: 55, unidad: "min", desc: "35' a ritmo umbral.", estructura: "10' calentamiento + 35' Z4 + 10' enfriamiento", sensacion: "Muy exigente", tipo: "tempo", zona: "Z4" }
          ],
          largo: [
            { nombre: "Largo calidad", duracion: 60, unidad: "min", desc: "Progresión últimos 20'.", estructura: "40' Z2 + 20' Z3", sensacion: "Fuerte", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo con cambios", duracion: 65, unidad: "min", desc: "Incluye series cortas.", estructura: "45' Z2 + 4x3' Z4 + 8' enfriamiento", sensacion: "Exigente", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo progresivo", duracion: 70, unidad: "min", desc: "Aumenta ritmo cada 20'.", estructura: "30' Z2 + 20' Z3 + 20' Z2", sensacion: "Controlado", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo específico", duracion: 75, unidad: "min", desc: "Incluye cambios.", estructura: "45' Z2 + 5x3' Z4 + 15' enfriamiento", sensacion: "Preparación", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo fondo", duracion: 80, unidad: "min", desc: "Fondo largo continuo.", estructura: "80' Z2", sensacion: "Resistencia", tipo: "largo", zona: "Z2" },
            { nombre: "Largo resistencia", duracion: 85, unidad: "min", desc: "Fondo largo con cambios.", estructura: "60' Z2 + 25' Z3", sensacion: "Resistencia", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo con series", duracion: 90, unidad: "min", desc: "Incluye series largas.", estructura: "60' Z2 + 4x800m Z4 + 15' enfriamiento", sensacion: "Exigente", tipo: "largo", zona: "Z2-Z4" }
          ]
        },
        avanzado: {
          rodaje: [
            { nombre: "Rodaje alto", duracion: 45, unidad: "min", desc: "Ritmo exigente Z2.", estructura: "45' Z2 alto", sensacion: "Exigente", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje activo", duracion: 50, unidad: "min", desc: "Ritmo vivo.", estructura: "50' Z2 vivo", sensacion: "Sostenible", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje técnico", duracion: 55, unidad: "min", desc: "Enfoque en cadencia.", estructura: "55' Z2 cadencia alta", sensacion: "Eficiente", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de mantenimiento", duracion: 40, unidad: "min", desc: "Sesión para mantener forma.", estructura: "40' Z2", sensacion: "Cómodo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje con estímulos", duracion: 50, unidad: "min", desc: "Introduce 5 cambios.", estructura: "10' calentamiento + 5x(2' rápido + 3' suave) + 10' enfriamiento", sensacion: "Estimulante", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de recuperación", duracion: 35, unidad: "min", desc: "Después de sesión intensa.", estructura: "35' Z1-Z2", sensacion: "Muy suave", tipo: "rodaje", zona: "Z1" },
            { nombre: "Rodaje de base", duracion: 60, unidad: "min", desc: "Fondo para construir resistencia.", estructura: "60' Z2", sensacion: "Resistencia", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje progresivo", duracion: 55, unidad: "min", desc: "Aumenta ritmo cada 15'.", estructura: "15' Z2 + 20' Z2 medio + 20' Z2 alto", sensacion: "Progresivo", tipo: "rodaje", zona: "Z2" }
          ],
          series: [
            { nombre: "Series 1000m", duracion: 50, unidad: "min", desc: "5x1000m con recuperación.", estructura: "15' calentamiento + 5x1000m + 10' enfriamiento", sensacion: "Muy intenso", tipo: "series", zona: "Z5" },
            { nombre: "Series 1200m", duracion: 55, unidad: "min", desc: "4x1200m con recuperación 3'30.", estructura: "15' calentamiento + 4x1200m + 10' enfriamiento", sensacion: "Exigente", tipo: "series", zona: "Z5" },
            { nombre: "Series 1600m", duracion: 60, unidad: "min", desc: "3x1600m con recuperación 4'.", estructura: "15' calentamiento + 3x1600m + 10' enfriamiento", sensacion: "Máximo", tipo: "series", zona: "Z5" },
            { nombre: "Series 800m", duracion: 50, unidad: "min", desc: "6x800m con recuperación 2'.", estructura: "15' calentamiento + 6x800m + 10' enfriamiento", sensacion: "Intenso", tipo: "series", zona: "Z5" },
            { nombre: "Pirámide larga", duracion: 60, unidad: "min", desc: "400-800-1200-1600-1200-800-400m.", estructura: "15' calentamiento + pirámide + 10' enfriamiento", sensacion: "Completo", tipo: "series", zona: "Z5" },
            { nombre: "Fartlek avanzado", duracion: 50, unidad: "min", desc: "Juega con ritmos intensos.", estructura: "10' calentamiento + 25' fartlek + 15' enfriamiento", sensacion: "Divertido", tipo: "series", zona: "Z5" },
            { nombre: "Series 600m", duracion: 55, unidad: "min", desc: "8x600m con recuperación 1'30.", estructura: "15' calentamiento + 8x600m + 10' enfriamiento", sensacion: "Intenso", tipo: "series", zona: "Z5" }
          ],
          tempo: [
            { nombre: "Tempo competición", duracion: 45, unidad: "min", desc: "30' a ritmo 5k.", estructura: "10' calentamiento + 30' Z4 + 5' enfriamiento", sensacion: "Ritmo carrera", tipo: "tempo", zona: "Z4" },
            { nombre: "Tempo umbral", duracion: 50, unidad: "min", desc: "35' a ritmo umbral.", estructura: "10' calentamiento + 35' Z4 + 5' enfriamiento", sensacion: "Exigente", tipo: "tempo", zona: "Z4" },
            { nombre: "Tempo variable", duracion: 50, unidad: "min", desc: "Alterna 4' Z3 / 3' Z4.", estructura: "10' calentamiento + 5x(4' Z3 + 3' Z4) + 5' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo largo", duracion: 55, unidad: "min", desc: "40' a ritmo tempo.", estructura: "10' calentamiento + 40' Z3 + 5' enfriamiento", sensacion: "Resistencia", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo progresivo", duracion: 55, unidad: "min", desc: "Aumenta cada 7'.", estructura: "10' calentamiento + 7' Z3 + 7' Z4 + 7' Z3 + 7' Z4 + 7' enfriamiento", sensacion: "Progresivo", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo con cambios", duracion: 50, unidad: "min", desc: "Introduce 6 cambios.", estructura: "10' calentamiento + 30' tempo con cambios + 10' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo umbral largo", duracion: 60, unidad: "min", desc: "45' a ritmo umbral.", estructura: "10' calentamiento + 45' Z4 + 5' enfriamiento", sensacion: "Muy exigente", tipo: "tempo", zona: "Z4" }
          ],
          largo: [
            { nombre: "Largo específico", duracion: 70, unidad: "min", desc: "Cambios a ritmo 5k.", estructura: "40' Z2 + 4x5' Z4 + 10' enfriamiento", sensacion: "Preparación", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo calidad", duracion: 75, unidad: "min", desc: "Progresión constante.", estructura: "45' Z2 + 30' Z3", sensacion: "Fuerte", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo con series", duracion: 80, unidad: "min", desc: "Incluye series largas.", estructura: "50' Z2 + 3x1000m Z4 + 15' enfriamiento", sensacion: "Exigente", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo progresivo", duracion: 85, unidad: "min", desc: "Aumenta ritmo cada 25'.", estructura: "35' Z2 + 25' Z3 + 25' Z2", sensacion: "Controlado", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo fondo", duracion: 90, unidad: "min", desc: "Fondo largo continuo.", estructura: "90' Z2", sensacion: "Resistencia", tipo: "largo", zona: "Z2" },
            { nombre: "Largo resistencia", duracion: 95, unidad: "min", desc: "Fondo largo con cambios.", estructura: "65' Z2 + 30' Z3", sensacion: "Resistencia", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo ultradistancia", duracion: 100, unidad: "min", desc: "Preparación para 5k.", estructura: "70' Z2 + 30' Z3", sensacion: "Preparación", tipo: "largo", zona: "Z2-Z3" }
          ]
        }
      },
      "10k": {
        principiante: {
          rodaje: [
            { nombre: "Rodaje 10k", duracion: 40, unidad: "min", desc: "Rodaje suave 10k.", estructura: "10' calentamiento + 25' Z2 + 5' enfriamiento", sensacion: "Cómodo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Fondo 10k", duracion: 45, unidad: "min", desc: "Fondo aeróbico.", estructura: "45' Z2 continuo", sensacion: "Constante", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje progresivo", duracion: 45, unidad: "min", desc: "Aumenta ritmo cada 15'.", estructura: "10' calentamiento + 25' progresivo + 10' enfriamiento", sensacion: "Progresivo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de recuperación", duracion: 35, unidad: "min", desc: "Sesión muy suave.", estructura: "35' Z1-Z2", sensacion: "Muy fácil", tipo: "rodaje", zona: "Z1" },
            { nombre: "Rodaje matinal", duracion: 40, unidad: "min", desc: "Despertar suave.", estructura: "40' Z2", sensacion: "Refrescante", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje con cambios", duracion: 45, unidad: "min", desc: "Introduce cambios de ritmo.", estructura: "10' calentamiento + 25' con cambios + 10' enfriamiento", sensacion: "Dinámico", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje base", duracion: 50, unidad: "min", desc: "Fondo para construir resistencia.", estructura: "50' Z2", sensacion: "Resistencia", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje regenerativo", duracion: 35, unidad: "min", desc: "Después de sesión dura.", estructura: "35' Z1", sensacion: "Muy suave", tipo: "rodaje", zona: "Z1" }
          ],
          series: [
            { nombre: "Series 400m", duracion: 40, unidad: "min", desc: "8x400m con recuperación.", estructura: "15' calentamiento + 8x400m + 10' enfriamiento", sensacion: "Controladas", tipo: "series", zona: "Z4" },
            { nombre: "Fartlek 10k", duracion: 40, unidad: "min", desc: "2' rápido + 2' suave.", estructura: "10' calentamiento + 7 repeticiones + 5' enfriamiento", sensacion: "Dinámico", tipo: "series", zona: "Z4" },
            { nombre: "Series 300m", duracion: 35, unidad: "min", desc: "10x300m con recuperación 1'.", estructura: "15' calentamiento + 10x300m + 5' enfriamiento", sensacion: "Rápidas", tipo: "series", zona: "Z5" },
            { nombre: "Series 500m", duracion: 45, unidad: "min", desc: "6x500m con recuperación 2'.", estructura: "15' calentamiento + 6x500m + 10' enfriamiento", sensacion: "Fuerte", tipo: "series", zona: "Z4" },
            { nombre: "Series 600m", duracion: 50, unidad: "min", desc: "5x600m con recuperación 2'30.", estructura: "15' calentamiento + 5x600m + 10' enfriamiento", sensacion: "Exigente", tipo: "series", zona: "Z4" },
            { nombre: "Pirámide 10k", duracion: 45, unidad: "min", desc: "400-600-800-600-400m.", estructura: "15' calentamiento + pirámide + 10' enfriamiento", sensacion: "Completo", tipo: "series", zona: "Z4-Z5" },
            { nombre: "Series 800m", duracion: 55, unidad: "min", desc: "4x800m con recuperación 3'.", estructura: "15' calentamiento + 4x800m + 10' enfriamiento", sensacion: "Muy exigente", tipo: "series", zona: "Z5" }
          ],
          tempo: [
            { nombre: "Tempo 10k", duracion: 40, unidad: "min", desc: "20' a ritmo tempo.", estructura: "10' calentamiento + 20' Z3 + 10' enfriamiento", sensacion: "Constante", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo corto", duracion: 35, unidad: "min", desc: "15' a ritmo tempo.", estructura: "10' calentamiento + 15' Z3 + 10' enfriamiento", sensacion: "Controlado", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo progresivo", duracion: 45, unidad: "min", desc: "Aumenta cada 7'30.", estructura: "10' calentamiento + 7'30 Z3 + 7'30 Z4 + 7'30 Z3 + 10' enfriamiento", sensacion: "Exigente", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo umbral", duracion: 45, unidad: "min", desc: "25' a ritmo umbral.", estructura: "10' calentamiento + 25' Z4 + 10' enfriamiento", sensacion: "Fuerte", tipo: "tempo", zona: "Z4" },
            { nombre: "Tempo largo", duracion: 50, unidad: "min", desc: "30' a ritmo tempo.", estructura: "10' calentamiento + 30' Z3 + 10' enfriamiento", sensacion: "Resistencia", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo variable", duracion: 45, unidad: "min", desc: "Alterna 4' Z3 / 2' Z4.", estructura: "10' calentamiento + 5x(4' Z3 + 2' Z4) + 10' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo con cambios", duracion: 50, unidad: "min", desc: "Introduce 5 cambios.", estructura: "10' calentamiento + 30' tempo con cambios + 10' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" }
          ],
          largo: [
            { nombre: "Largo 10k", duracion: 60, unidad: "min", desc: "Rodaje largo.", estructura: "60' Z2 continuo", sensacion: "Resistencia", tipo: "largo", zona: "Z2" },
            { nombre: "Largo con cambios", duracion: 65, unidad: "min", desc: "Últimos 20' más rápido.", estructura: "45' Z2 + 20' Z3", sensacion: "Fuerte", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo fondo", duracion: 70, unidad: "min", desc: "Fondo largo.", estructura: "70' Z2 continuo", sensacion: "Resistencia", tipo: "largo", zona: "Z2" },
            { nombre: "Largo progresivo", duracion: 65, unidad: "min", desc: "Aumenta ritmo cada 20'.", estructura: "45' Z2 + 20' Z3", sensacion: "Fuerte", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo específico", duracion: 75, unidad: "min", desc: "Incluye cambios.", estructura: "50' Z2 + 4x3' Z4 + 10' enfriamiento", sensacion: "Preparación", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo calidad", duracion: 80, unidad: "min", desc: "Progresión constante.", estructura: "50' Z2 + 30' Z3", sensacion: "Exigente", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo resistencia", duracion: 85, unidad: "min", desc: "Fondo largo.", estructura: "85' Z2", sensacion: "Resistencia", tipo: "largo", zona: "Z2" }
          ]
        },
        intermedio: {
          rodaje: [
            { nombre: "Rodaje activo 10k", duracion: 45, unidad: "min", desc: "Ritmo vivo Z2.", estructura: "45' Z2 vivo", sensacion: "Eficiente", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje calidad", duracion: 50, unidad: "min", desc: "Ritmo exigente.", estructura: "50' Z2 alto", sensacion: "Exigente", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje aeróbico", duracion: 55, unidad: "min", desc: "Fondo aeróbico.", estructura: "55' Z2 constante", sensacion: "Resistencia", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de mantenimiento", duracion: 40, unidad: "min", desc: "Sesión para mantener forma.", estructura: "40' Z2", sensacion: "Cómodo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje con estímulos", duracion: 50, unidad: "min", desc: "Introduce 4 cambios.", estructura: "10' calentamiento + 4x(2' rápido + 3' suave) + 10' enfriamiento", sensacion: "Estimulante", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de recuperación", duracion: 35, unidad: "min", desc: "Después de sesión intensa.", estructura: "35' Z1-Z2", sensacion: "Muy suave", tipo: "rodaje", zona: "Z1" },
            { nombre: "Rodaje de base", duracion: 60, unidad: "min", desc: "Fondo para construir resistencia.", estructura: "60' Z2", sensacion: "Resistencia", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje progresivo", duracion: 55, unidad: "min", desc: "Aumenta ritmo cada 15'.", estructura: "15' Z2 + 20' Z2 medio + 20' Z2 alto", sensacion: "Progresivo", tipo: "rodaje", zona: "Z2" }
          ],
          series: [
            { nombre: "Series 800m", duracion: 50, unidad: "min", desc: "6x800m con recuperación.", estructura: "15' calentamiento + 6x800m + 10' enfriamiento", sensacion: "Intensidad", tipo: "series", zona: "Z4" },
            { nombre: "Series 1000m", duracion: 55, unidad: "min", desc: "5x1000m con recuperación 2'30.", estructura: "15' calentamiento + 5x1000m + 10' enfriamiento", sensacion: "Exigente", tipo: "series", zona: "Z4" },
            { nombre: "Pirámide 10k", duracion: 55, unidad: "min", desc: "400-800-1200-800-400m.", estructura: "15' calentamiento + pirámide + 10' enfriamiento", sensacion: "Completo", tipo: "series", zona: "Z4-Z5" },
            { nombre: "Series 1200m", duracion: 60, unidad: "min", desc: "4x1200m con recuperación 3'.", estructura: "15' calentamiento + 4x1200m + 10' enfriamiento", sensacion: "Fuerte", tipo: "series", zona: "Z5" },
            { nombre: "Series 600m", duracion: 50, unidad: "min", desc: "8x600m con recuperación 1'30.", estructura: "15' calentamiento + 8x600m + 10' enfriamiento", sensacion: "Intenso", tipo: "series", zona: "Z4" },
            { nombre: "Fartlek avanzado", duracion: 50, unidad: "min", desc: "Juega con ritmos.", estructura: "10' calentamiento + 25' fartlek + 15' enfriamiento", sensacion: "Divertido", tipo: "series", zona: "Z4" },
            { nombre: "Series 400m", duracion: 55, unidad: "min", desc: "10x400m con recuperación 1'30.", estructura: "15' calentamiento + 10x400m + 10' enfriamiento", sensacion: "Intenso", tipo: "series", zona: "Z4" }
          ],
          tempo: [
            { nombre: "Tempo umbral", duracion: 45, unidad: "min", desc: "25' a ritmo umbral.", estructura: "10' calentamiento + 25' umbral + 10' enfriamiento", sensacion: "Exigente", tipo: "tempo", zona: "Z4" },
            { nombre: "Tempo 10k", duracion: 50, unidad: "min", desc: "30' a ritmo umbral.", estructura: "10' calentamiento + 30' Z4 + 10' enfriamiento", sensacion: "Sostenido", tipo: "tempo", zona: "Z4" },
            { nombre: "Tempo variable", duracion: 50, unidad: "min", desc: "Alterna 6' Z3 / 3' Z4.", estructura: "10' calentamiento + 4x(6' Z3 + 3' Z4) + 5' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo largo", duracion: 55, unidad: "min", desc: "35' a ritmo tempo.", estructura: "10' calentamiento + 35' Z3 + 10' enfriamiento", sensacion: "Resistencia", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo progresivo", duracion: 55, unidad: "min", desc: "Aumenta cada 8'.", estructura: "10' calentamiento + 8' Z3 + 8' Z4 + 8' Z3 + 8' Z4 + 8' enfriamiento", sensacion: "Progresivo", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo con cambios", duracion: 50, unidad: "min", desc: "Introduce 5 cambios.", estructura: "10' calentamiento + 30' tempo con cambios + 10' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo umbral largo", duracion: 60, unidad: "min", desc: "40' a ritmo umbral.", estructura: "10' calentamiento + 40' Z4 + 10' enfriamiento", sensacion: "Muy exigente", tipo: "tempo", zona: "Z4" }
          ],
          largo: [
            { nombre: "Largo calidad", duracion: 75, unidad: "min", desc: "Progresión últimos 25'.", estructura: "50' Z2 + 25' Z3", sensacion: "Fuerte", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo con cambios", duracion: 80, unidad: "min", desc: "Incluye series.", estructura: "55' Z2 + 5x3' Z4 + 10' enfriamiento", sensacion: "Exigente", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo progresivo", duracion: 85, unidad: "min", desc: "Aumenta ritmo cada 25'.", estructura: "35' Z2 + 25' Z3 + 25' Z2", sensacion: "Controlado", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo específico", duracion: 90, unidad: "min", desc: "Incluye cambios.", estructura: "60' Z2 + 6x3' Z4 + 12' enfriamiento", sensacion: "Preparación", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo fondo", duracion: 95, unidad: "min", desc: "Fondo largo continuo.", estructura: "95' Z2", sensacion: "Resistencia", tipo: "largo", zona: "Z2" },
            { nombre: "Largo resistencia", duracion: 100, unidad: "min", desc: "Fondo largo con cambios.", estructura: "70' Z2 + 30' Z3", sensacion: "Resistencia", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo con series", duracion: 105, unidad: "min", desc: "Incluye series largas.", estructura: "70' Z2 + 5x800m Z4 + 15' enfriamiento", sensacion: "Exigente", tipo: "largo", zona: "Z2-Z4" }
          ]
        },
        avanzado: {
          rodaje: [
            { nombre: "Rodaje alto", duracion: 50, unidad: "min", desc: "Ritmo exigente Z2.", estructura: "50' Z2 alto", sensacion: "Exigente", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje activo", duracion: 55, unidad: "min", desc: "Ritmo vivo.", estructura: "55' Z2 vivo", sensacion: "Sostenible", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje técnico", duracion: 60, unidad: "min", desc: "Enfoque técnico.", estructura: "60' Z2 cadencia alta", sensacion: "Eficiente", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de mantenimiento", duracion: 45, unidad: "min", desc: "Sesión para mantener forma.", estructura: "45' Z2", sensacion: "Cómodo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje con estímulos", duracion: 55, unidad: "min", desc: "Introduce 5 cambios.", estructura: "10' calentamiento + 5x(2' rápido + 3' suave) + 10' enfriamiento", sensacion: "Estimulante", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de recuperación", duracion: 40, unidad: "min", desc: "Después de sesión intensa.", estructura: "40' Z1-Z2", sensacion: "Muy suave", tipo: "rodaje", zona: "Z1" },
            { nombre: "Rodaje de base", duracion: 65, unidad: "min", desc: "Fondo para construir resistencia.", estructura: "65' Z2", sensacion: "Resistencia", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje progresivo", duracion: 60, unidad: "min", desc: "Aumenta ritmo cada 15'.", estructura: "15' Z2 + 20' Z2 medio + 25' Z2 alto", sensacion: "Progresivo", tipo: "rodaje", zona: "Z2" }
          ],
          series: [
            { nombre: "Series 1600m", duracion: 55, unidad: "min", desc: "4x1600m con recuperación.", estructura: "15' calentamiento + 4x1600m + 10' enfriamiento", sensacion: "Muy intenso", tipo: "series", zona: "Z5" },
            { nombre: "Series 2000m", duracion: 60, unidad: "min", desc: "3x2000m con recuperación 4'.", estructura: "15' calentamiento + 3x2000m + 10' enfriamiento", sensacion: "Exigente", tipo: "series", zona: "Z5" },
            { nombre: "Series 3000m", duracion: 65, unidad: "min", desc: "2x3000m con recuperación 5'.", estructura: "15' calentamiento + 2x3000m + 10' enfriamiento", sensacion: "Máximo", tipo: "series", zona: "Z5" },
            { nombre: "Series 1000m", duracion: 55, unidad: "min", desc: "5x1000m con recuperación 2'.", estructura: "15' calentamiento + 5x1000m + 10' enfriamiento", sensacion: "Intenso", tipo: "series", zona: "Z5" },
            { nombre: "Pirámide larga", duracion: 65, unidad: "min", desc: "800-1600-2400-1600-800m.", estructura: "15' calentamiento + pirámide + 10' enfriamiento", sensacion: "Completo", tipo: "series", zona: "Z5" },
            { nombre: "Fartlek avanzado", duracion: 55, unidad: "min", desc: "Juega con ritmos intensos.", estructura: "10' calentamiento + 30' fartlek + 15' enfriamiento", sensacion: "Divertido", tipo: "series", zona: "Z5" },
            { nombre: "Series 800m", duracion: 60, unidad: "min", desc: "8x800m con recuperación 1'30.", estructura: "15' calentamiento + 8x800m + 10' enfriamiento", sensacion: "Intenso", tipo: "series", zona: "Z5" }
          ],
          tempo: [
            { nombre: "Tempo 10k", duracion: 50, unidad: "min", desc: "35' a ritmo 10k.", estructura: "10' calentamiento + 35' Z4 + 5' enfriamiento", sensacion: "Ritmo carrera", tipo: "tempo", zona: "Z4" },
            { nombre: "Tempo umbral", duracion: 55, unidad: "min", desc: "40' a ritmo umbral.", estructura: "10' calentamiento + 40' Z4 + 5' enfriamiento", sensacion: "Exigente", tipo: "tempo", zona: "Z4" },
            { nombre: "Tempo variable", duracion: 55, unidad: "min", desc: "Alterna 5' Z3 / 3' Z4.", estructura: "10' calentamiento + 5x(5' Z3 + 3' Z4) + 5' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo largo", duracion: 60, unidad: "min", desc: "45' a ritmo tempo.", estructura: "10' calentamiento + 45' Z3 + 5' enfriamiento", sensacion: "Resistencia", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo progresivo", duracion: 60, unidad: "min", desc: "Aumenta cada 6'.", estructura: "10' calentamiento + 6' Z3 + 6' Z4 + 6' Z3 + 6' Z4 + 6' enfriamiento", sensacion: "Progresivo", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo con cambios", duracion: 55, unidad: "min", desc: "Introduce 6 cambios.", estructura: "10' calentamiento + 35' tempo con cambios + 10' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo umbral largo", duracion: 65, unidad: "min", desc: "50' a ritmo umbral.", estructura: "10' calentamiento + 50' Z4 + 5' enfriamiento", sensacion: "Muy exigente", tipo: "tempo", zona: "Z4" }
          ],
          largo: [
            { nombre: "Largo específico", duracion: 85, unidad: "min", desc: "Cambios a ritmo 10k.", estructura: "45' Z2 + 5x5' Z4 + 15' enfriamiento", sensacion: "Preparación", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo calidad", duracion: 90, unidad: "min", desc: "Progresión constante.", estructura: "50' Z2 + 40' Z3", sensacion: "Fuerte", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo con series", duracion: 95, unidad: "min", desc: "Series largas.", estructura: "55' Z2 + 4x1000m Z4 + 20' enfriamiento", sensacion: "Exigente", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo progresivo", duracion: 100, unidad: "min", desc: "Aumenta ritmo cada 30'.", estructura: "40' Z2 + 30' Z3 + 30' Z2", sensacion: "Controlado", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo fondo", duracion: 105, unidad: "min", desc: "Fondo largo continuo.", estructura: "105' Z2", sensacion: "Resistencia", tipo: "largo", zona: "Z2" },
            { nombre: "Largo resistencia", duracion: 110, unidad: "min", desc: "Fondo largo con cambios.", estructura: "70' Z2 + 40' Z3", sensacion: "Resistencia", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo ultradistancia", duracion: 115, unidad: "min", desc: "Preparación para 10k.", estructura: "75' Z2 + 40' Z3", sensacion: "Preparación", tipo: "largo", zona: "Z2-Z3" }
          ]
        }
      },
      "medio": {
        principiante: {
          rodaje: [
            { nombre: "Rodaje media", duracion: 45, unidad: "min", desc: "Rodaje suave media.", estructura: "10' calentamiento + 30' Z2 + 5' enfriamiento", sensacion: "Cómodo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Fondo media", duracion: 50, unidad: "min", desc: "Fondo aeróbico.", estructura: "50' Z2 continuo", sensacion: "Constante", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje progresivo", duracion: 50, unidad: "min", desc: "Aumenta cada 15'.", estructura: "10' calentamiento + 30' progresivo + 10' enfriamiento", sensacion: "Progresivo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de recuperación", duracion: 40, unidad: "min", desc: "Sesión muy suave.", estructura: "40' Z1-Z2", sensacion: "Muy fácil", tipo: "rodaje", zona: "Z1" },
            { nombre: "Rodaje matinal", duracion: 45, unidad: "min", desc: "Despertar suave.", estructura: "45' Z2", sensacion: "Refrescante", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje con cambios", duracion: 50, unidad: "min", desc: "Introduce cambios de ritmo.", estructura: "10' calentamiento + 30' con cambios + 10' enfriamiento", sensacion: "Dinámico", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje base", duracion: 55, unidad: "min", desc: "Fondo para construir resistencia.", estructura: "55' Z2", sensacion: "Resistencia", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje regenerativo", duracion: 40, unidad: "min", desc: "Después de sesión dura.", estructura: "40' Z1", sensacion: "Muy suave", tipo: "rodaje", zona: "Z1" }
          ],
          series: [
            { nombre: "Series 500m", duracion: 45, unidad: "min", desc: "8x500m con recuperación.", estructura: "15' calentamiento + 8x500m + 10' enfriamiento", sensacion: "Controladas", tipo: "series", zona: "Z4" },
            { nombre: "Fartlek media", duracion: 45, unidad: "min", desc: "2' rápido + 2' suave.", estructura: "10' calentamiento + 8 repeticiones + 7' enfriamiento", sensacion: "Dinámico", tipo: "series", zona: "Z4" },
            { nombre: "Series 400m", duracion: 40, unidad: "min", desc: "10x400m con recuperación 1'15.", estructura: "15' calentamiento + 10x400m + 5' enfriamiento", sensacion: "Rápidas", tipo: "series", zona: "Z5" },
            { nombre: "Series 600m", duracion: 50, unidad: "min", desc: "6x600m con recuperación 2'.", estructura: "15' calentamiento + 6x600m + 10' enfriamiento", sensacion: "Fuerte", tipo: "series", zona: "Z4" },
            { nombre: "Series 800m", duracion: 55, unidad: "min", desc: "5x800m con recuperación 2'30.", estructura: "15' calentamiento + 5x800m + 10' enfriamiento", sensacion: "Exigente", tipo: "series", zona: "Z4" },
            { nombre: "Pirámide media", duracion: 50, unidad: "min", desc: "400-600-800-600-400m.", estructura: "15' calentamiento + pirámide + 10' enfriamiento", sensacion: "Completo", tipo: "series", zona: "Z4-Z5" },
            { nombre: "Series 1000m", duracion: 60, unidad: "min", desc: "4x1000m con recuperación 3'.", estructura: "15' calentamiento + 4x1000m + 10' enfriamiento", sensacion: "Muy exigente", tipo: "series", zona: "Z5" }
          ],
          tempo: [
            { nombre: "Tempo media", duracion: 45, unidad: "min", desc: "25' a ritmo tempo.", estructura: "10' calentamiento + 25' Z3 + 10' enfriamiento", sensacion: "Constante", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo progresivo", duracion: 50, unidad: "min", desc: "Aumenta cada 8'.", estructura: "10' calentamiento + 8' Z3 + 8' Z4 + 8' Z3 + 6' enfriamiento", sensacion: "Exigente", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo corto", duracion: 40, unidad: "min", desc: "20' a ritmo tempo.", estructura: "10' calentamiento + 20' Z3 + 10' enfriamiento", sensacion: "Controlado", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo umbral", duracion: 50, unidad: "min", desc: "30' a ritmo umbral.", estructura: "10' calentamiento + 30' Z4 + 10' enfriamiento", sensacion: "Fuerte", tipo: "tempo", zona: "Z4" },
            { nombre: "Tempo largo", duracion: 55, unidad: "min", desc: "35' a ritmo tempo.", estructura: "10' calentamiento + 35' Z3 + 10' enfriamiento", sensacion: "Resistencia", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo variable", duracion: 50, unidad: "min", desc: "Alterna 5' Z3 / 2' Z4.", estructura: "10' calentamiento + 5x(5' Z3 + 2' Z4) + 10' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo con cambios", duracion: 55, unidad: "min", desc: "Introduce 5 cambios.", estructura: "10' calentamiento + 35' tempo con cambios + 10' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" }
          ],
          largo: [
            { nombre: "Largo media", duracion: 75, unidad: "min", desc: "Rodaje largo.", estructura: "75' Z2 continuo", sensacion: "Resistencia", tipo: "largo", zona: "Z2" },
            { nombre: "Largo con cambios", duracion: 80, unidad: "min", desc: "Últimos 25' más rápido.", estructura: "55' Z2 + 25' Z3", sensacion: "Fuerte", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo fondo", duracion: 85, unidad: "min", desc: "Fondo largo.", estructura: "85' Z2 continuo", sensacion: "Resistencia", tipo: "largo", zona: "Z2" },
            { nombre: "Largo progresivo", duracion: 80, unidad: "min", desc: "Aumenta ritmo cada 20'.", estructura: "60' Z2 + 20' Z3", sensacion: "Fuerte", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo específico", duracion: 90, unidad: "min", desc: "Incluye cambios.", estructura: "60' Z2 + 5x3' Z4 + 15' enfriamiento", sensacion: "Preparación", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo calidad", duracion: 95, unidad: "min", desc: "Progresión constante.", estructura: "60' Z2 + 35' Z3", sensacion: "Exigente", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo resistencia", duracion: 100, unidad: "min", desc: "Fondo largo.", estructura: "100' Z2", sensacion: "Resistencia", tipo: "largo", zona: "Z2" }
          ]
        },
        intermedio: {
          rodaje: [
            { nombre: "Rodaje activo media", duracion: 50, unidad: "min", desc: "Ritmo vivo Z2.", estructura: "50' Z2 vivo", sensacion: "Eficiente", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje calidad", duracion: 55, unidad: "min", desc: "Ritmo exigente.", estructura: "55' Z2 alto", sensacion: "Exigente", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje aeróbico", duracion: 60, unidad: "min", desc: "Fondo aeróbico.", estructura: "60' Z2 constante", sensacion: "Resistencia", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de mantenimiento", duracion: 45, unidad: "min", desc: "Sesión para mantener forma.", estructura: "45' Z2", sensacion: "Cómodo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje con estímulos", duracion: 55, unidad: "min", desc: "Introduce 4 cambios.", estructura: "10' calentamiento + 4x(2' rápido + 3' suave) + 10' enfriamiento", sensacion: "Estimulante", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de recuperación", duracion: 40, unidad: "min", desc: "Después de sesión intensa.", estructura: "40' Z1-Z2", sensacion: "Muy suave", tipo: "rodaje", zona: "Z1" },
            { nombre: "Rodaje de base", duracion: 65, unidad: "min", desc: "Fondo para construir resistencia.", estructura: "65' Z2", sensacion: "Resistencia", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje progresivo", duracion: 60, unidad: "min", desc: "Aumenta ritmo cada 15'.", estructura: "15' Z2 + 20' Z2 medio + 25' Z2 alto", sensacion: "Progresivo", tipo: "rodaje", zona: "Z2" }
          ],
          series: [
            { nombre: "Series 1000m", duracion: 55, unidad: "min", desc: "6x1000m con recuperación.", estructura: "15' calentamiento + 6x1000m + 10' enfriamiento", sensacion: "Intensidad", tipo: "series", zona: "Z4" },
            { nombre: "Series 1200m", duracion: 60, unidad: "min", desc: "5x1200m con recuperación 3'.", estructura: "15' calentamiento + 5x1200m + 10' enfriamiento", sensacion: "Exigente", tipo: "series", zona: "Z4" },
            { nombre: "Pirámide media", duracion: 60, unidad: "min", desc: "400-800-1200-1600-1200-800-400m.", estructura: "15' calentamiento + pirámide + 10' enfriamiento", sensacion: "Completo", tipo: "series", zona: "Z4-Z5" },
            { nombre: "Series 800m", duracion: 55, unidad: "min", desc: "8x800m con recuperación 2'.", estructura: "15' calentamiento + 8x800m + 10' enfriamiento", sensacion: "Intenso", tipo: "series", zona: "Z4" },
            { nombre: "Series 1600m", duracion: 65, unidad: "min", desc: "4x1600m con recuperación 3'30.", estructura: "15' calentamiento + 4x1600m + 10' enfriamiento", sensacion: "Fuerte", tipo: "series", zona: "Z5" },
            { nombre: "Fartlek avanzado", duracion: 55, unidad: "min", desc: "Juega con ritmos.", estructura: "10' calentamiento + 30' fartlek + 15' enfriamiento", sensacion: "Divertido", tipo: "series", zona: "Z4" },
            { nombre: "Series 600m", duracion: 60, unidad: "min", desc: "10x600m con recuperación 1'30.", estructura: "15' calentamiento + 10x600m + 10' enfriamiento", sensacion: "Intenso", tipo: "series", zona: "Z4" }
          ],
          tempo: [
            { nombre: "Tempo umbral media", duracion: 50, unidad: "min", desc: "30' a ritmo umbral.", estructura: "10' calentamiento + 30' umbral + 10' enfriamiento", sensacion: "Exigente", tipo: "tempo", zona: "Z4" },
            { nombre: "Tempo media", duracion: 55, unidad: "min", desc: "35' a ritmo umbral.", estructura: "10' calentamiento + 35' Z4 + 10' enfriamiento", sensacion: "Sostenido", tipo: "tempo", zona: "Z4" },
            { nombre: "Tempo variable", duracion: 55, unidad: "min", desc: "Alterna 7' Z3 / 3' Z4.", estructura: "10' calentamiento + 4x(7' Z3 + 3' Z4) + 5' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo largo", duracion: 60, unidad: "min", desc: "40' a ritmo tempo.", estructura: "10' calentamiento + 40' Z3 + 10' enfriamiento", sensacion: "Resistencia", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo progresivo", duracion: 60, unidad: "min", desc: "Aumenta cada 7'.", estructura: "10' calentamiento + 7' Z3 + 7' Z4 + 7' Z3 + 7' Z4 + 7' enfriamiento", sensacion: "Progresivo", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo con cambios", duracion: 55, unidad: "min", desc: "Introduce 5 cambios.", estructura: "10' calentamiento + 35' tempo con cambios + 10' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo umbral largo", duracion: 65, unidad: "min", desc: "45' a ritmo umbral.", estructura: "10' calentamiento + 45' Z4 + 10' enfriamiento", sensacion: "Muy exigente", tipo: "tempo", zona: "Z4" }
          ],
          largo: [
            { nombre: "Largo calidad media", duracion: 90, unidad: "min", desc: "Progresión últimos 30'.", estructura: "60' Z2 + 30' Z3", sensacion: "Fuerte", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo con cambios", duracion: 95, unidad: "min", desc: "Incluye series.", estructura: "65' Z2 + 6x3' Z4 + 12' enfriamiento", sensacion: "Exigente", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo progresivo", duracion: 100, unidad: "min", desc: "Aumenta ritmo cada 30'.", estructura: "40' Z2 + 30' Z3 + 30' Z2", sensacion: "Controlado", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo específico", duracion: 105, unidad: "min", desc: "Incluye cambios.", estructura: "70' Z2 + 6x3' Z4 + 15' enfriamiento", sensacion: "Preparación", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo fondo", duracion: 110, unidad: "min", desc: "Fondo largo continuo.", estructura: "110' Z2", sensacion: "Resistencia", tipo: "largo", zona: "Z2" },
            { nombre: "Largo resistencia", duracion: 115, unidad: "min", desc: "Fondo largo con cambios.", estructura: "80' Z2 + 35' Z3", sensacion: "Resistencia", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo con series", duracion: 120, unidad: "min", desc: "Incluye series largas.", estructura: "80' Z2 + 6x800m Z4 + 15' enfriamiento", sensacion: "Exigente", tipo: "largo", zona: "Z2-Z4" }
          ]
        },
        avanzado: {
          rodaje: [
            { nombre: "Rodaje alto media", duracion: 55, unidad: "min", desc: "Ritmo exigente Z2.", estructura: "55' Z2 alto", sensacion: "Exigente", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje activo", duracion: 60, unidad: "min", desc: "Ritmo vivo.", estructura: "60' Z2 vivo", sensacion: "Sostenible", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje técnico", duracion: 65, unidad: "min", desc: "Enfoque técnico.", estructura: "65' Z2 cadencia alta", sensacion: "Eficiente", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de mantenimiento", duracion: 50, unidad: "min", desc: "Sesión para mantener forma.", estructura: "50' Z2", sensacion: "Cómodo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje con estímulos", duracion: 60, unidad: "min", desc: "Introduce 5 cambios.", estructura: "10' calentamiento + 5x(2' rápido + 3' suave) + 10' enfriamiento", sensacion: "Estimulante", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de recuperación", duracion: 45, unidad: "min", desc: "Después de sesión intensa.", estructura: "45' Z1-Z2", sensacion: "Muy suave", tipo: "rodaje", zona: "Z1" },
            { nombre: "Rodaje de base", duracion: 70, unidad: "min", desc: "Fondo para construir resistencia.", estructura: "70' Z2", sensacion: "Resistencia", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje progresivo", duracion: 65, unidad: "min", desc: "Aumenta ritmo cada 15'.", estructura: "15' Z2 + 20' Z2 medio + 30' Z2 alto", sensacion: "Progresivo", tipo: "rodaje", zona: "Z2" }
          ],
          series: [
            { nombre: "Series 2000m", duracion: 60, unidad: "min", desc: "4x2000m con recuperación.", estructura: "15' calentamiento + 4x2000m + 10' enfriamiento", sensacion: "Muy intenso", tipo: "series", zona: "Z5" },
            { nombre: "Series 3000m", duracion: 65, unidad: "min", desc: "3x3000m con recuperación 4'30.", estructura: "15' calentamiento + 3x3000m + 10' enfriamiento", sensacion: "Exigente", tipo: "series", zona: "Z5" },
            { nombre: "Series 5000m", duracion: 70, unidad: "min", desc: "2x5000m con recuperación 5'.", estructura: "15' calentamiento + 2x5000m + 10' enfriamiento", sensacion: "Máximo", tipo: "series", zona: "Z5" },
            { nombre: "Series 1000m", duracion: 60, unidad: "min", desc: "6x1000m con recuperación 2'.", estructura: "15' calentamiento + 6x1000m + 10' enfriamiento", sensacion: "Intenso", tipo: "series", zona: "Z5" },
            { nombre: "Pirámide larga", duracion: 70, unidad: "min", desc: "1000-2000-3000-2000-1000m.", estructura: "15' calentamiento + pirámide + 10' enfriamiento", sensacion: "Completo", tipo: "series", zona: "Z5" },
            { nombre: "Fartlek avanzado", duracion: 60, unidad: "min", desc: "Juega con ritmos intensos.", estructura: "10' calentamiento + 35' fartlek + 15' enfriamiento", sensacion: "Divertido", tipo: "series", zona: "Z5" },
            { nombre: "Series 800m", duracion: 65, unidad: "min", desc: "10x800m con recuperación 1'30.", estructura: "15' calentamiento + 10x800m + 10' enfriamiento", sensacion: "Intenso", tipo: "series", zona: "Z5" }
          ],
          tempo: [
            { nombre: "Tempo media avanzado", duracion: 55, unidad: "min", desc: "40' a ritmo media.", estructura: "10' calentamiento + 40' Z4 + 5' enfriamiento", sensacion: "Ritmo carrera", tipo: "tempo", zona: "Z4" },
            { nombre: "Tempo umbral", duracion: 60, unidad: "min", desc: "45' a ritmo umbral.", estructura: "10' calentamiento + 45' Z4 + 5' enfriamiento", sensacion: "Exigente", tipo: "tempo", zona: "Z4" },
            { nombre: "Tempo variable", duracion: 60, unidad: "min", desc: "Alterna 6' Z3 / 3' Z4.", estructura: "10' calentamiento + 5x(6' Z3 + 3' Z4) + 5' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo largo", duracion: 65, unidad: "min", desc: "50' a ritmo tempo.", estructura: "10' calentamiento + 50' Z3 + 5' enfriamiento", sensacion: "Resistencia", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo progresivo", duracion: 65, unidad: "min", desc: "Aumenta cada 5'.", estructura: "10' calentamiento + 5' Z3 + 5' Z4 + 5' Z3 + 5' Z4 + 5' enfriamiento", sensacion: "Progresivo", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo con cambios", duracion: 60, unidad: "min", desc: "Introduce 6 cambios.", estructura: "10' calentamiento + 40' tempo con cambios + 10' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo umbral largo", duracion: 70, unidad: "min", desc: "55' a ritmo umbral.", estructura: "10' calentamiento + 55' Z4 + 5' enfriamiento", sensacion: "Muy exigente", tipo: "tempo", zona: "Z4" }
          ],
          largo: [
            { nombre: "Largo específico media", duracion: 105, unidad: "min", desc: "Cambios a ritmo media.", estructura: "60' Z2 + 6x5' Z4 + 15' enfriamiento", sensacion: "Preparación", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo calidad", duracion: 110, unidad: "min", desc: "Progresión constante.", estructura: "70' Z2 + 40' Z3", sensacion: "Fuerte", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo con series", duracion: 115, unidad: "min", desc: "Series largas.", estructura: "75' Z2 + 5x1000m Z4 + 20' enfriamiento", sensacion: "Exigente", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo progresivo", duracion: 120, unidad: "min", desc: "Aumenta ritmo cada 30'.", estructura: "50' Z2 + 35' Z3 + 35' Z2", sensacion: "Controlado", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo fondo", duracion: 125, unidad: "min", desc: "Fondo largo continuo.", estructura: "125' Z2", sensacion: "Resistencia", tipo: "largo", zona: "Z2" },
            { nombre: "Largo resistencia", duracion: 130, unidad: "min", desc: "Fondo largo con cambios.", estructura: "85' Z2 + 45' Z3", sensacion: "Resistencia", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo ultradistancia", duracion: 135, unidad: "min", desc: "Preparación para media.", estructura: "90' Z2 + 45' Z3", sensacion: "Preparación", tipo: "largo", zona: "Z2-Z3" }
          ]
        }
      },
      "maraton": {
        principiante: {
          rodaje: [
            { nombre: "Rodaje maratón", duracion: 50, unidad: "min", desc: "Rodaje suave maratón.", estructura: "10' calentamiento + 35' Z2 + 5' enfriamiento", sensacion: "Cómodo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Fondo maratón", duracion: 55, unidad: "min", desc: "Fondo aeróbico.", estructura: "55' Z2 continuo", sensacion: "Constante", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje progresivo", duracion: 55, unidad: "min", desc: "Aumenta cada 15'.", estructura: "10' calentamiento + 35' progresivo + 10' enfriamiento", sensacion: "Progresivo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de recuperación", duracion: 45, unidad: "min", desc: "Sesión muy suave.", estructura: "45' Z1-Z2", sensacion: "Muy fácil", tipo: "rodaje", zona: "Z1" },
            { nombre: "Rodaje matinal", duracion: 50, unidad: "min", desc: "Despertar suave.", estructura: "50' Z2", sensacion: "Refrescante", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje con cambios", duracion: 55, unidad: "min", desc: "Introduce cambios de ritmo.", estructura: "10' calentamiento + 35' con cambios + 10' enfriamiento", sensacion: "Dinámico", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje base", duracion: 60, unidad: "min", desc: "Fondo para construir resistencia.", estructura: "60' Z2", sensacion: "Resistencia", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje regenerativo", duracion: 45, unidad: "min", desc: "Después de sesión dura.", estructura: "45' Z1", sensacion: "Muy suave", tipo: "rodaje", zona: "Z1" }
          ],
          series: [
            { nombre: "Series 800m", duracion: 50, unidad: "min", desc: "6x800m con recuperación.", estructura: "15' calentamiento + 6x800m + 10' enfriamiento", sensacion: "Controladas", tipo: "series", zona: "Z4" },
            { nombre: "Fartlek maratón", duracion: 50, unidad: "min", desc: "3' rápido + 3' suave.", estructura: "10' calentamiento + 6 repeticiones + 8' enfriamiento", sensacion: "Dinámico", tipo: "series", zona: "Z4" },
            { nombre: "Series 1000m", duracion: 55, unidad: "min", desc: "5x1000m con recuperación 2'.", estructura: "15' calentamiento + 5x1000m + 10' enfriamiento", sensacion: "Exigente", tipo: "series", zona: "Z4" },
            { nombre: "Series 1200m", duracion: 60, unidad: "min", desc: "4x1200m con recuperación 2'30.", estructura: "15' calentamiento + 4x1200m + 10' enfriamiento", sensacion: "Fuerte", tipo: "series", zona: "Z4" },
            { nombre: "Series 1500m", duracion: 65, unidad: "min", desc: "3x1500m con recuperación 3'.", estructura: "15' calentamiento + 3x1500m + 10' enfriamiento", sensacion: "Exigente", tipo: "series", zona: "Z5" },
            { nombre: "Pirámide maratón", duracion: 60, unidad: "min", desc: "800-1200-1600-1200-800m.", estructura: "15' calentamiento + pirámide + 10' enfriamiento", sensacion: "Completo", tipo: "series", zona: "Z4-Z5" },
            { nombre: "Series 2000m", duracion: 70, unidad: "min", desc: "3x2000m con recuperación 3'30.", estructura: "15' calentamiento + 3x2000m + 10' enfriamiento", sensacion: "Muy exigente", tipo: "series", zona: "Z5" }
          ],
          tempo: [
            { nombre: "Tempo maratón", duracion: 50, unidad: "min", desc: "30' a ritmo tempo.", estructura: "10' calentamiento + 30' Z3 + 10' enfriamiento", sensacion: "Constante", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo progresivo", duracion: 55, unidad: "min", desc: "Aumenta cada 10'.", estructura: "10' calentamiento + 10' Z3 + 10' Z4 + 10' Z3 + 15' enfriamiento", sensacion: "Exigente", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo largo", duracion: 60, unidad: "min", desc: "35' a ritmo tempo.", estructura: "10' calentamiento + 35' Z3 + 15' enfriamiento", sensacion: "Sostenido", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo umbral", duracion: 55, unidad: "min", desc: "30' a ritmo umbral.", estructura: "10' calentamiento + 30' Z4 + 15' enfriamiento", sensacion: "Fuerte", tipo: "tempo", zona: "Z4" },
            { nombre: "Tempo variable", duracion: 60, unidad: "min", desc: "Alterna 5' Z3 / 3' Z4.", estructura: "10' calentamiento + 5x(5' Z3 + 3' Z4) + 10' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo con cambios", duracion: 60, unidad: "min", desc: "Introduce 5 cambios.", estructura: "10' calentamiento + 40' tempo con cambios + 10' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo largo umbral", duracion: 65, unidad: "min", desc: "40' a ritmo umbral.", estructura: "10' calentamiento + 40' Z4 + 15' enfriamiento", sensacion: "Muy exigente", tipo: "tempo", zona: "Z4" }
          ],
          largo: [
            { nombre: "Largo maratón", duracion: 90, unidad: "min", desc: "Rodaje largo.", estructura: "90' Z2 continuo", sensacion: "Resistencia", tipo: "largo", zona: "Z2" },
            { nombre: "Largo con cambios", duracion: 100, unidad: "min", desc: "Últimos 30' más rápido.", estructura: "70' Z2 + 30' Z3", sensacion: "Fuerte", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo fondo", duracion: 110, unidad: "min", desc: "Fondo largo.", estructura: "110' Z2 continuo", sensacion: "Resistencia", tipo: "largo", zona: "Z2" },
            { nombre: "Largo progresivo", duracion: 100, unidad: "min", desc: "Aumenta ritmo cada 25'.", estructura: "75' Z2 + 25' Z3", sensacion: "Fuerte", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo específico", duracion: 115, unidad: "min", desc: "Incluye cambios.", estructura: "80' Z2 + 5x3' Z4 + 20' enfriamiento", sensacion: "Preparación", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo calidad", duracion: 120, unidad: "min", desc: "Progresión constante.", estructura: "80' Z2 + 40' Z3", sensacion: "Exigente", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo resistencia", duracion: 125, unidad: "min", desc: "Fondo largo.", estructura: "125' Z2", sensacion: "Resistencia", tipo: "largo", zona: "Z2" }
          ]
        },
        intermedio: {
          rodaje: [
            { nombre: "Rodaje activo maratón", duracion: 55, unidad: "min", desc: "Ritmo vivo Z2.", estructura: "55' Z2 vivo", sensacion: "Eficiente", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje calidad", duracion: 60, unidad: "min", desc: "Ritmo exigente.", estructura: "60' Z2 alto", sensacion: "Exigente", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje aeróbico", duracion: 65, unidad: "min", desc: "Fondo aeróbico.", estructura: "65' Z2 constante", sensacion: "Resistencia", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de mantenimiento", duracion: 50, unidad: "min", desc: "Sesión para mantener forma.", estructura: "50' Z2", sensacion: "Cómodo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje con estímulos", duracion: 60, unidad: "min", desc: "Introduce 4 cambios.", estructura: "10' calentamiento + 4x(2' rápido + 3' suave) + 10' enfriamiento", sensacion: "Estimulante", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de recuperación", duracion: 45, unidad: "min", desc: "Después de sesión intensa.", estructura: "45' Z1-Z2", sensacion: "Muy suave", tipo: "rodaje", zona: "Z1" },
            { nombre: "Rodaje de base", duracion: 70, unidad: "min", desc: "Fondo para construir resistencia.", estructura: "70' Z2", sensacion: "Resistencia", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje progresivo", duracion: 65, unidad: "min", desc: "Aumenta ritmo cada 15'.", estructura: "15' Z2 + 20' Z2 medio + 30' Z2 alto", sensacion: "Progresivo", tipo: "rodaje", zona: "Z2" }
          ],
          series: [
            { nombre: "Series 1600m", duracion: 60, unidad: "min", desc: "5x1600m con recuperación.", estructura: "15' calentamiento + 5x1600m + 10' enfriamiento", sensacion: "Intensidad", tipo: "series", zona: "Z4" },
            { nombre: "Series 2000m", duracion: 65, unidad: "min", desc: "4x2000m con recuperación 3'30.", estructura: "15' calentamiento + 4x2000m + 10' enfriamiento", sensacion: "Exigente", tipo: "series", zona: "Z4" },
            { nombre: "Pirámide maratón", duracion: 70, unidad: "min", desc: "800-1600-2400-3200-2400-1600-800m.", estructura: "15' calentamiento + pirámide + 10' enfriamiento", sensacion: "Completo", tipo: "series", zona: "Z4-Z5" },
            { nombre: "Series 3000m", duracion: 75, unidad: "min", desc: "3x3000m con recuperación 4'.", estructura: "15' calentamiento + 3x3000m + 10' enfriamiento", sensacion: "Fuerte", tipo: "series", zona: "Z5" },
            { nombre: "Series 1000m", duracion: 65, unidad: "min", desc: "8x1000m con recuperación 2'.", estructura: "15' calentamiento + 8x1000m + 10' enfriamiento", sensacion: "Intenso", tipo: "series", zona: "Z4" },
            { nombre: "Fartlek avanzado", duracion: 60, unidad: "min", desc: "Juega con ritmos.", estructura: "10' calentamiento + 35' fartlek + 15' enfriamiento", sensacion: "Divertido", tipo: "series", zona: "Z4" },
            { nombre: "Series 800m", duracion: 70, unidad: "min", desc: "12x800m con recuperación 1'30.", estructura: "15' calentamiento + 12x800m + 10' enfriamiento", sensacion: "Intenso", tipo: "series", zona: "Z4" }
          ],
          tempo: [
            { nombre: "Tempo umbral maratón", duracion: 55, unidad: "min", desc: "35' a ritmo umbral.", estructura: "10' calentamiento + 35' umbral + 10' enfriamiento", sensacion: "Exigente", tipo: "tempo", zona: "Z4" },
            { nombre: "Tempo maratón", duracion: 60, unidad: "min", desc: "40' a ritmo umbral.", estructura: "10' calentamiento + 40' Z4 + 10' enfriamiento", sensacion: "Sostenido", tipo: "tempo", zona: "Z4" },
            { nombre: "Tempo variable", duracion: 60, unidad: "min", desc: "Alterna 8' Z3 / 3' Z4.", estructura: "10' calentamiento + 4x(8' Z3 + 3' Z4) + 5' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo largo", duracion: 65, unidad: "min", desc: "45' a ritmo tempo.", estructura: "10' calentamiento + 45' Z3 + 10' enfriamiento", sensacion: "Resistencia", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo progresivo", duracion: 65, unidad: "min", desc: "Aumenta cada 6'.", estructura: "10' calentamiento + 6' Z3 + 6' Z4 + 6' Z3 + 6' Z4 + 6' enfriamiento", sensacion: "Progresivo", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo con cambios", duracion: 60, unidad: "min", desc: "Introduce 5 cambios.", estructura: "10' calentamiento + 40' tempo con cambios + 10' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo umbral largo", duracion: 70, unidad: "min", desc: "50' a ritmo umbral.", estructura: "10' calentamiento + 50' Z4 + 10' enfriamiento", sensacion: "Muy exigente", tipo: "tempo", zona: "Z4" }
          ],
          largo: [
            { nombre: "Largo calidad maratón", duracion: 120, unidad: "min", desc: "Progresión últimos 40'.", estructura: "80' Z2 + 40' Z3", sensacion: "Fuerte", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo con cambios", duracion: 130, unidad: "min", desc: "Incluye series.", estructura: "90' Z2 + 8x3' Z4 + 16' enfriamiento", sensacion: "Exigente", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo progresivo", duracion: 140, unidad: "min", desc: "Aumenta ritmo cada 40'.", estructura: "60' Z2 + 40' Z3 + 40' Z2", sensacion: "Controlado", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo específico", duracion: 150, unidad: "min", desc: "Incluye cambios.", estructura: "100' Z2 + 8x3' Z4 + 20' enfriamiento", sensacion: "Preparación", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo fondo", duracion: 160, unidad: "min", desc: "Fondo largo continuo.", estructura: "160' Z2", sensacion: "Resistencia", tipo: "largo", zona: "Z2" },
            { nombre: "Largo resistencia", duracion: 170, unidad: "min", desc: "Fondo largo con cambios.", estructura: "120' Z2 + 50' Z3", sensacion: "Resistencia", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo con series", duracion: 180, unidad: "min", desc: "Incluye series largas.", estructura: "120' Z2 + 8x1000m Z4 + 20' enfriamiento", sensacion: "Exigente", tipo: "largo", zona: "Z2-Z4" }
          ]
        },
        avanzado: {
          rodaje: [
            { nombre: "Rodaje alto maratón", duracion: 60, unidad: "min", desc: "Ritmo exigente Z2.", estructura: "60' Z2 alto", sensacion: "Exigente", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje activo", duracion: 65, unidad: "min", desc: "Ritmo vivo.", estructura: "65' Z2 vivo", sensacion: "Sostenible", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje técnico", duracion: 70, unidad: "min", desc: "Enfoque técnico.", estructura: "70' Z2 cadencia alta", sensacion: "Eficiente", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de mantenimiento", duracion: 55, unidad: "min", desc: "Sesión para mantener forma.", estructura: "55' Z2", sensacion: "Cómodo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje con estímulos", duracion: 65, unidad: "min", desc: "Introduce 5 cambios.", estructura: "10' calentamiento + 5x(2' rápido + 3' suave) + 10' enfriamiento", sensacion: "Estimulante", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de recuperación", duracion: 50, unidad: "min", desc: "Después de sesión intensa.", estructura: "50' Z1-Z2", sensacion: "Muy suave", tipo: "rodaje", zona: "Z1" },
            { nombre: "Rodaje de base", duracion: 75, unidad: "min", desc: "Fondo para construir resistencia.", estructura: "75' Z2", sensacion: "Resistencia", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje progresivo", duracion: 70, unidad: "min", desc: "Aumenta ritmo cada 15'.", estructura: "15' Z2 + 20' Z2 medio + 35' Z2 alto", sensacion: "Progresivo", tipo: "rodaje", zona: "Z2" }
          ],
          series: [
            { nombre: "Series 3000m", duracion: 70, unidad: "min", desc: "4x3000m con recuperación.", estructura: "15' calentamiento + 4x3000m + 10' enfriamiento", sensacion: "Muy intenso", tipo: "series", zona: "Z5" },
            { nombre: "Series 5000m", duracion: 75, unidad: "min", desc: "3x5000m con recuperación 5'.", estructura: "15' calentamiento + 3x5000m + 10' enfriamiento", sensacion: "Exigente", tipo: "series", zona: "Z5" },
            { nombre: "Series 10000m", duracion: 80, unidad: "min", desc: "2x10000m con recuperación 6'.", estructura: "15' calentamiento + 2x10000m + 10' enfriamiento", sensacion: "Máximo", tipo: "series", zona: "Z5" },
            { nombre: "Series 2000m", duracion: 70, unidad: "min", desc: "6x2000m con recuperación 2'30.", estructura: "15' calentamiento + 6x2000m + 10' enfriamiento", sensacion: "Intenso", tipo: "series", zona: "Z5" },
            { nombre: "Pirámide larga", duracion: 80, unidad: "min", desc: "2000-3000-5000-3000-2000m.", estructura: "15' calentamiento + pirámide + 10' enfriamiento", sensacion: "Completo", tipo: "series", zona: "Z5" },
            { nombre: "Fartlek avanzado", duracion: 70, unidad: "min", desc: "Juega con ritmos intensos.", estructura: "10' calentamiento + 45' fartlek + 15' enfriamiento", sensacion: "Divertido", tipo: "series", zona: "Z5" },
            { nombre: "Series 1600m", duracion: 75, unidad: "min", desc: "10x1600m con recuperación 2'.", estructura: "15' calentamiento + 10x1600m + 10' enfriamiento", sensacion: "Intenso", tipo: "series", zona: "Z5" }
          ],
          tempo: [
            { nombre: "Tempo maratón avanzado", duracion: 60, unidad: "min", desc: "45' a ritmo maratón.", estructura: "10' calentamiento + 45' Z4 + 5' enfriamiento", sensacion: "Ritmo carrera", tipo: "tempo", zona: "Z4" },
            { nombre: "Tempo umbral", duracion: 65, unidad: "min", desc: "50' a ritmo umbral.", estructura: "10' calentamiento + 50' Z4 + 5' enfriamiento", sensacion: "Exigente", tipo: "tempo", zona: "Z4" },
            { nombre: "Tempo variable", duracion: 65, unidad: "min", desc: "Alterna 7' Z3 / 3' Z4.", estructura: "10' calentamiento + 5x(7' Z3 + 3' Z4) + 5' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo largo", duracion: 70, unidad: "min", desc: "55' a ritmo tempo.", estructura: "10' calentamiento + 55' Z3 + 5' enfriamiento", sensacion: "Resistencia", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo progresivo", duracion: 70, unidad: "min", desc: "Aumenta cada 5'.", estructura: "10' calentamiento + 5' Z3 + 5' Z4 + 5' Z3 + 5' Z4 + 5' enfriamiento", sensacion: "Progresivo", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo con cambios", duracion: 65, unidad: "min", desc: "Introduce 6 cambios.", estructura: "10' calentamiento + 45' tempo con cambios + 10' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo umbral largo", duracion: 75, unidad: "min", desc: "60' a ritmo umbral.", estructura: "10' calentamiento + 60' Z4 + 5' enfriamiento", sensacion: "Muy exigente", tipo: "tempo", zona: "Z4" }
          ],
          largo: [
            { nombre: "Largo específico maratón", duracion: 150, unidad: "min", desc: "Cambios a ritmo maratón.", estructura: "90' Z2 + 8x5' Z4 + 20' enfriamiento", sensacion: "Preparación", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo calidad", duracion: 160, unidad: "min", desc: "Progresión constante.", estructura: "100' Z2 + 60' Z3", sensacion: "Fuerte", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo con series", duracion: 170, unidad: "min", desc: "Series largas.", estructura: "110' Z2 + 6x1000m Z4 + 20' enfriamiento", sensacion: "Exigente", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo progresivo", duracion: 180, unidad: "min", desc: "Aumenta ritmo cada 40'.", estructura: "80' Z2 + 50' Z3 + 50' Z2", sensacion: "Controlado", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo fondo", duracion: 190, unidad: "min", desc: "Fondo largo continuo.", estructura: "190' Z2", sensacion: "Resistencia", tipo: "largo", zona: "Z2" },
            { nombre: "Largo resistencia", duracion: 200, unidad: "min", desc: "Fondo largo con cambios.", estructura: "140' Z2 + 60' Z3", sensacion: "Resistencia", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo ultradistancia", duracion: 210, unidad: "min", desc: "Preparación para maratón.", estructura: "150' Z2 + 60' Z3", sensacion: "Preparación", tipo: "largo", zona: "Z2-Z3" }
          ]
        }
      }
    },
    trail: {
      "2k": {
        principiante: {
          rodaje: [
            { nombre: "Rodaje sendero", duracion: 30, unidad: "min", desc: "Terreno irregular suave.", estructura: "10' calentamiento + 15' Z2 + 5' enfriamiento", sensacion: "Adaptación", tipo: "rodaje", zona: "Z2" },
            { nombre: "Sendero suave", duracion: 35, unidad: "min", desc: "Terreno variado suave.", estructura: "35' sendero continuo", sensacion: "Cómodo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Sendero progresivo", duracion: 35, unidad: "min", desc: "Aumenta ritmo en llano.", estructura: "10' calentamiento + 20' progresivo + 5' enfriamiento", sensacion: "Progresivo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Sendero de recuperación", duracion: 25, unidad: "min", desc: "Sesión muy suave en sendero.", estructura: "25' Z1-Z2", sensacion: "Muy fácil", tipo: "rodaje", zona: "Z1" },
            { nombre: "Sendero matinal", duracion: 30, unidad: "min", desc: "Despertar suave en sendero.", estructura: "30' Z2", sensacion: "Refrescante", tipo: "rodaje", zona: "Z2" },
            { nombre: "Sendero con cambios", duracion: 35, unidad: "min", desc: "Introduce cambios de ritmo.", estructura: "10' calentamiento + 20' con cambios + 5' enfriamiento", sensacion: "Dinámico", tipo: "rodaje", zona: "Z2" },
            { nombre: "Sendero base", duracion: 40, unidad: "min", desc: "Fondo para construir resistencia.", estructura: "40' Z2", sensacion: "Resistencia", tipo: "rodaje", zona: "Z2" },
            { nombre: "Sendero regenerativo", duracion: 25, unidad: "min", desc: "Después de sesión dura.", estructura: "25' Z1", sensacion: "Muy suave", tipo: "rodaje", zona: "Z1" }
          ],
          series: [
            { nombre: "Cuestas suaves", duracion: 35, unidad: "min", desc: "4x60m cuesta suave.", estructura: "15' calentamiento + 4 cuestas + 10' enfriamiento", sensacion: "Potencia", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas cortas", duracion: 30, unidad: "min", desc: "5x50m cuesta suave.", estructura: "15' calentamiento + 5 cuestas + 5' enfriamiento", sensacion: "Explosivas", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas medias", duracion: 40, unidad: "min", desc: "4x80m cuesta media.", estructura: "15' calentamiento + 4 cuestas + 10' enfriamiento", sensacion: "Exigente", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas largas", duracion: 45, unidad: "min", desc: "3x100m cuesta media.", estructura: "15' calentamiento + 3 cuestas + 10' enfriamiento", sensacion: "Fuerte", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas repetidas", duracion: 40, unidad: "min", desc: "6x50m cuesta suave.", estructura: "15' calentamiento + 6 cuestas + 10' enfriamiento", sensacion: "Intenso", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas variadas", duracion: 45, unidad: "min", desc: "4x(50m + 70m) cuesta media.", estructura: "15' calentamiento + 4 series + 10' enfriamiento", sensacion: "Completo", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas explosivas", duracion: 35, unidad: "min", desc: "8x40m cuesta suave.", estructura: "15' calentamiento + 8 cuestas + 5' enfriamiento", sensacion: "Explosivas", tipo: "series", zona: "Z5" }
          ],
          tempo: [
            { nombre: "Tempo sendero", duracion: 35, unidad: "min", desc: "Ritmo sostenido sendero.", estructura: "10' calentamiento + 15' Z3 + 10' enfriamiento", sensacion: "Controlado", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo desnivel suave", duracion: 40, unidad: "min", desc: "Con desnivel suave.", estructura: "10' calentamiento + 20' Z3 + 10' enfriamiento", sensacion: "Exigente", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo progresivo", duracion: 40, unidad: "min", desc: "Aumenta en llano.", estructura: "10' calentamiento + 20' progresivo + 10' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo sendero largo", duracion: 45, unidad: "min", desc: "Ritmo sostenido en sendero.", estructura: "10' calentamiento + 25' Z3 + 10' enfriamiento", sensacion: "Resistencia", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo variable", duracion: 40, unidad: "min", desc: "Alterna llano y cuestas.", estructura: "10' calentamiento + 20' con cambios + 10' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo con cambios", duracion: 45, unidad: "min", desc: "Introduce 4 cambios.", estructura: "10' calentamiento + 25' tempo con cambios + 10' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo sendero umbral", duracion: 50, unidad: "min", desc: "Ritmo cerca del umbral.", estructura: "10' calentamiento + 30' Z3-Z4 + 10' enfriamiento", sensacion: "Exigente", tipo: "tempo", zona: "Z3-Z4" }
          ],
          largo: [
            { nombre: "Largo sendero", duracion: 50, unidad: "min", desc: "Toma contacto trail.", estructura: "50' Z2 sendero", sensacion: "Adaptación", tipo: "largo", zona: "Z2" },
            { nombre: "Largo montaña suave", duracion: 55, unidad: "min", desc: "Sendero continuo.", estructura: "55' sendero", sensacion: "Resistencia", tipo: "largo", zona: "Z2" },
            { nombre: "Largo con desnivel", duracion: 60, unidad: "min", desc: "Incluye subidas suaves.", estructura: "60' sendero con desnivel", sensacion: "Exigente", tipo: "largo", zona: "Z2" },
            { nombre: "Largo progresivo", duracion: 55, unidad: "min", desc: "Aumenta ritmo en llano.", estructura: "40' Z2 + 15' Z3", sensacion: "Fuerte", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo específico", duracion: 65, unidad: "min", desc: "Incluye cambios.", estructura: "45' Z2 + 4x3' Z4 + 8' enfriamiento", sensacion: "Preparación", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo calidad", duracion: 60, unidad: "min", desc: "Progresión constante.", estructura: "40' Z2 + 20' Z3", sensacion: "Exigente", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo resistencia", duracion: 70, unidad: "min", desc: "Fondo largo en sendero.", estructura: "70' Z2", sensacion: "Resistencia", tipo: "largo", zona: "Z2" }
          ]
        },
        intermedio: {
          rodaje: [
            { nombre: "Rodaje técnico", duracion: 40, unidad: "min", desc: "Técnica en sendero.", estructura: "40' Z2 técnico", sensacion: "Coordinación", tipo: "rodaje", zona: "Z2" },
            { nombre: "Sendero técnico", duracion: 45, unidad: "min", desc: "Técnica avanzada.", estructura: "45' técnico", sensacion: "Maestría", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje montaña", duracion: 50, unidad: "min", desc: "Terreno variado.", estructura: "50' sendero variado", sensacion: "Resistencia", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de mantenimiento", duracion: 35, unidad: "min", desc: "Sesión para mantener forma.", estructura: "35' Z2", sensacion: "Cómodo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje con estímulos", duracion: 45, unidad: "min", desc: "Introduce 4 cambios.", estructura: "10' calentamiento + 4x(2' rápido + 3' suave) + 10' enfriamiento", sensacion: "Estimulante", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de recuperación", duracion: 30, unidad: "min", desc: "Después de sesión intensa.", estructura: "30' Z1-Z2", sensacion: "Muy suave", tipo: "rodaje", zona: "Z1" },
            { nombre: "Rodaje de base", duracion: 55, unidad: "min", desc: "Fondo para construir resistencia.", estructura: "55' Z2", sensacion: "Resistencia", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje progresivo", duracion: 50, unidad: "min", desc: "Aumenta ritmo cada 15'.", estructura: "15' Z2 + 20' Z2 medio + 15' Z2 alto", sensacion: "Progresivo", tipo: "rodaje", zona: "Z2" }
          ],
          series: [
            { nombre: "Cuestas medias", duracion: 40, unidad: "min", desc: "6x80m cuesta media.", estructura: "15' calentamiento + 6 cuestas + 10' enfriamiento", sensacion: "Potencia", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas largas", duracion: 45, unidad: "min", desc: "5x100m cuesta media.", estructura: "15' calentamiento + 5 cuestas + 10' enfriamiento", sensacion: "Exigente", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas variables", duracion: 45, unidad: "min", desc: "4x(60m + 80m + 100m)", estructura: "15' calentamiento + 4 series + 10' enfriamiento", sensacion: "Completo", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas repetidas", duracion: 50, unidad: "min", desc: "8x80m cuesta media.", estructura: "15' calentamiento + 8 cuestas + 10' enfriamiento", sensacion: "Intenso", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas largas medias", duracion: 55, unidad: "min", desc: "4x120m cuesta media.", estructura: "15' calentamiento + 4 cuestas + 10' enfriamiento", sensacion: "Fuerte", tipo: "series", zona: "Z5" },
            { nombre: "Cuestas variadas intensas", duracion: 50, unidad: "min", desc: "5x(80m + 100m) cuesta media.", estructura: "15' calentamiento + 5 series + 10' enfriamiento", sensacion: "Completo", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas explosivas", duracion: 45, unidad: "min", desc: "10x60m cuesta media.", estructura: "15' calentamiento + 10 cuestas + 5' enfriamiento", sensacion: "Explosivas", tipo: "series", zona: "Z5" }
          ],
          tempo: [
            { nombre: "Tempo desnivel", duracion: 40, unidad: "min", desc: "Incluye subidas.", estructura: "40' con desnivel", sensacion: "Exigente", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo montaña", duracion: 45, unidad: "min", desc: "Ritmo fuerte.", estructura: "45' desnivel continuo", sensacion: "Muy exigente", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo variable", duracion: 45, unidad: "min", desc: "Alterna llano y cuestas.", estructura: "45' con cambios", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo sendero largo", duracion: 50, unidad: "min", desc: "Ritmo sostenido en sendero.", estructura: "10' calentamiento + 30' Z3 + 10' enfriamiento", sensacion: "Resistencia", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo progresivo", duracion: 50, unidad: "min", desc: "Aumenta ritmo cada 10'.", estructura: "10' calentamiento + 10' Z3 + 10' Z4 + 10' Z3 + 10' enfriamiento", sensacion: "Progresivo", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo con cambios", duracion: 45, unidad: "min", desc: "Introduce 5 cambios.", estructura: "10' calentamiento + 25' tempo con cambios + 10' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo umbral sendero", duracion: 55, unidad: "min", desc: "Ritmo cerca del umbral.", estructura: "10' calentamiento + 35' Z3-Z4 + 10' enfriamiento", sensacion: "Exigente", tipo: "tempo", zona: "Z3-Z4" }
          ],
          largo: [
            { nombre: "Largo montaña", duracion: 70, unidad: "min", desc: "Mixto subidas/bajadas.", estructura: "70' trail", sensacion: "Resistencia", tipo: "largo", zona: "Z2" },
            { nombre: "Largo técnico", duracion: 75, unidad: "min", desc: "Alta dificultad técnica.", estructura: "75' trail técnico", sensacion: "Exigente", tipo: "largo", zona: "Z2" },
            { nombre: "Largo con desnivel", duracion: 80, unidad: "min", desc: "Acumulación desnivel.", estructura: "80' trail con desnivel", sensacion: "Preparación", tipo: "largo", zona: "Z2" },
            { nombre: "Largo progresivo", duracion: 75, unidad: "min", desc: "Aumenta ritmo en llano.", estructura: "50' Z2 + 25' Z3", sensacion: "Fuerte", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo específico", duracion: 85, unidad: "min", desc: "Incluye cambios.", estructura: "55' Z2 + 5x3' Z4 + 15' enfriamiento", sensacion: "Preparación", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo calidad", duracion: 90, unidad: "min", desc: "Progresión constante.", estructura: "60' Z2 + 30' Z3", sensacion: "Exigente", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo resistencia", duracion: 95, unidad: "min", desc: "Fondo largo en sendero.", estructura: "95' Z2", sensacion: "Resistencia", tipo: "largo", zona: "Z2" }
          ]
        },
        avanzado: {
          rodaje: [
            { nombre: "Rodaje montaña", duracion: 45, unidad: "min", desc: "Alta dificultad técnica.", estructura: "45' Z2 técnico", sensacion: "Maestría", tipo: "rodaje", zona: "Z2" },
            { nombre: "Sendero avanzado", duracion: 50, unidad: "min", desc: "Máxima técnica.", estructura: "50' técnico", sensacion: "Dominio", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje desnivel", duracion: 55, unidad: "min", desc: "Acumulación desnivel.", estructura: "55' con desnivel", sensacion: "Exigente", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de mantenimiento", duracion: 40, unidad: "min", desc: "Sesión para mantener forma.", estructura: "40' Z2", sensacion: "Cómodo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje con estímulos", duracion: 50, unidad: "min", desc: "Introduce 5 cambios.", estructura: "10' calentamiento + 5x(2' rápido + 3' suave) + 10' enfriamiento", sensacion: "Estimulante", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de recuperación", duracion: 35, unidad: "min", desc: "Después de sesión intensa.", estructura: "35' Z1-Z2", sensacion: "Muy suave", tipo: "rodaje", zona: "Z1" },
            { nombre: "Rodaje de base", duracion: 60, unidad: "min", desc: "Fondo para construir resistencia.", estructura: "60' Z2", sensacion: "Resistencia", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje progresivo", duracion: 55, unidad: "min", desc: "Aumenta ritmo cada 15'.", estructura: "15' Z2 + 20' Z2 medio + 20' Z2 alto", sensacion: "Progresivo", tipo: "rodaje", zona: "Z2" }
          ],
          series: [
            { nombre: "Cuestas fuertes", duracion: 45, unidad: "min", desc: "8x100m cuesta fuerte.", estructura: "15' calentamiento + 8 cuestas + 10' enfriamiento", sensacion: "Máxima potencia", tipo: "series", zona: "Z5" },
            { nombre: "Cuestas muy fuertes", duracion: 50, unidad: "min", desc: "6x120m cuesta fuerte.", estructura: "15' calentamiento + 6 cuestas + 10' enfriamiento", sensacion: "Exigente", tipo: "series", zona: "Z5" },
            { nombre: "Cuestas largas fuertes", duracion: 55, unidad: "min", desc: "5x150m cuesta fuerte.", estructura: "15' calentamiento + 5 cuestas + 10' enfriamiento", sensacion: "Máximo", tipo: "series", zona: "Z5" },
            { nombre: "Cuestas explosivas", duracion: 50, unidad: "min", desc: "10x80m cuesta fuerte.", estructura: "15' calentamiento + 10 cuestas + 5' enfriamiento", sensacion: "Explosivas", tipo: "series", zona: "Z5" },
            { nombre: "Cuestas variadas fuertes", duracion: 55, unidad: "min", desc: "6x(80m + 100m) cuesta fuerte.", estructura: "15' calentamiento + 6 series + 10' enfriamiento", sensacion: "Completo", tipo: "series", zona: "Z5" },
            { nombre: "Cuestas en escalera", duracion: 60, unidad: "min", desc: "4x(60m + 80m + 100m + 120m)", estructura: "15' calentamiento + 4 series + 10' enfriamiento", sensacion: "Muy exigente", tipo: "series", zona: "Z5" },
            { nombre: "Cuestas máximas", duracion: 65, unidad: "min", desc: "3x200m cuesta fuerte.", estructura: "15' calentamiento + 3 cuestas + 10' enfriamiento", sensacion: "Máximo", tipo: "series", zona: "Z5" }
          ],
          tempo: [
            { nombre: "Tempo montaña", duracion: 45, unidad: "min", desc: "Ritmo fuerte desnivel.", estructura: "45' desnivel continuo", sensacion: "Exigente", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo fuerte", duracion: 50, unidad: "min", desc: "Máxima intensidad.", estructura: "50' desnivel intenso", sensacion: "Muy exigente", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo variable", duracion: 50, unidad: "min", desc: "Alterna ritmos.", estructura: "50' cambios de ritmo", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo sendero largo", duracion: 55, unidad: "min", desc: "Ritmo sostenido en sendero.", estructura: "10' calentamiento + 35' Z3 + 10' enfriamiento", sensacion: "Resistencia", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo progresivo", duracion: 55, unidad: "min", desc: "Aumenta ritmo cada 10'.", estructura: "10' calentamiento + 10' Z3 + 10' Z4 + 10' Z3 + 10' enfriamiento", sensacion: "Progresivo", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo con cambios", duracion: 50, unidad: "min", desc: "Introduce 6 cambios.", estructura: "10' calentamiento + 30' tempo con cambios + 10' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo umbral sendero", duracion: 60, unidad: "min", desc: "Ritmo cerca del umbral.", estructura: "10' calentamiento + 40' Z3-Z4 + 10' enfriamiento", sensacion: "Exigente", tipo: "tempo", zona: "Z3-Z4" }
          ],
          largo: [
            { nombre: "Largo trail", duracion: 90, unidad: "min", desc: "Simulación competición.", estructura: "90' trail cambios", sensacion: "Preparación", tipo: "largo", zona: "Z2" },
            { nombre: "Largo avanzado", duracion: 100, unidad: "min", desc: "Alto volumen técnico.", estructura: "100' trail técnico", sensacion: "Exigente", tipo: "largo", zona: "Z2" },
            { nombre: "Largo ultra", duracion: 110, unidad: "min", desc: "Preparación ultra.", estructura: "110' trail", sensacion: "Resistencia", tipo: "largo", zona: "Z2" },
            { nombre: "Largo progresivo", duracion: 95, unidad: "min", desc: "Aumenta ritmo en llano.", estructura: "65' Z2 + 30' Z3", sensacion: "Fuerte", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo específico", duracion: 105, unidad: "min", desc: "Incluye cambios.", estructura: "70' Z2 + 6x3' Z4 + 15' enfriamiento", sensacion: "Preparación", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo calidad", duracion: 115, unidad: "min", desc: "Progresión constante.", estructura: "75' Z2 + 40' Z3", sensacion: "Exigente", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo resistencia", duracion: 120, unidad: "min", desc: "Fondo largo en sendero.", estructura: "120' Z2", sensacion: "Resistencia", tipo: "largo", zona: "Z2" }
          ]
        }
      },
      "5k": {
        principiante: {
          rodaje: [
            { nombre: "Rodaje 5k trail", duracion: 35, unidad: "min", desc: "Terreno irregular.", estructura: "35' Z2 sendero", sensacion: "Adaptación", tipo: "rodaje", zona: "Z2" },
            { nombre: "Sendero 5k", duracion: 40, unidad: "min", desc: "Sendero continuo.", estructura: "40' sendero", sensacion: "Cómodo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Sendero progresivo", duracion: 40, unidad: "min", desc: "Aumenta ritmo.", estructura: "40' progresivo", sensacion: "Progresivo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Sendero de recuperación", duracion: 30, unidad: "min", desc: "Sesión muy suave en sendero.", estructura: "30' Z1-Z2", sensacion: "Muy fácil", tipo: "rodaje", zona: "Z1" },
            { nombre: "Sendero matinal", duracion: 35, unidad: "min", desc: "Despertar suave en sendero.", estructura: "35' Z2", sensacion: "Refrescante", tipo: "rodaje", zona: "Z2" },
            { nombre: "Sendero con cambios", duracion: 40, unidad: "min", desc: "Introduce cambios de ritmo.", estructura: "10' calentamiento + 25' con cambios + 5' enfriamiento", sensacion: "Dinámico", tipo: "rodaje", zona: "Z2" },
            { nombre: "Sendero base", duracion: 45, unidad: "min", desc: "Fondo para construir resistencia.", estructura: "45' Z2", sensacion: "Resistencia", tipo: "rodaje", zona: "Z2" },
            { nombre: "Sendero regenerativo", duracion: 30, unidad: "min", desc: "Después de sesión dura.", estructura: "30' Z1", sensacion: "Muy suave", tipo: "rodaje", zona: "Z1" }
          ],
          series: [
            { nombre: "Cuestas 5k", duracion: 40, unidad: "min", desc: "5x80m cuesta suave.", estructura: "15' calentamiento + 5 cuestas + 10' enfriamiento", sensacion: "Potencia", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas cortas", duracion: 35, unidad: "min", desc: "6x60m cuesta suave.", estructura: "15' calentamiento + 6 cuestas + 5' enfriamiento", sensacion: "Rápidas", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas medias", duracion: 45, unidad: "min", desc: "5x100m cuesta media.", estructura: "15' calentamiento + 5 cuestas + 10' enfriamiento", sensacion: "Exigente", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas largas", duracion: 50, unidad: "min", desc: "4x120m cuesta media.", estructura: "15' calentamiento + 4 cuestas + 10' enfriamiento", sensacion: "Fuerte", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas repetidas", duracion: 45, unidad: "min", desc: "8x70m cuesta suave.", estructura: "15' calentamiento + 8 cuestas + 5' enfriamiento", sensacion: "Intenso", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas variadas", duracion: 50, unidad: "min", desc: "5x(60m + 80m) cuesta media.", estructura: "15' calentamiento + 5 series + 10' enfriamiento", sensacion: "Completo", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas explosivas", duracion: 40, unidad: "min", desc: "10x50m cuesta suave.", estructura: "15' calentamiento + 10 cuestas + 5' enfriamiento", sensacion: "Explosivas", tipo: "series", zona: "Z5" }
          ],
          tempo: [
            { nombre: "Tempo sendero", duracion: 40, unidad: "min", desc: "Ritmo sostenido.", estructura: "40' Z3 sendero", sensacion: "Control", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo desnivel", duracion: 45, unidad: "min", desc: "Con desnivel suave.", estructura: "45' Z3 con desnivel", sensacion: "Exigente", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo progresivo", duracion: 45, unidad: "min", desc: "Aumenta ritmo.", estructura: "45' progresivo", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo sendero largo", duracion: 50, unidad: "min", desc: "Ritmo sostenido en sendero.", estructura: "10' calentamiento + 30' Z3 + 10' enfriamiento", sensacion: "Resistencia", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo variable", duracion: 45, unidad: "min", desc: "Alterna llano y cuestas.", estructura: "10' calentamiento + 25' con cambios + 10' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo con cambios", duracion: 50, unidad: "min", desc: "Introduce 4 cambios.", estructura: "10' calentamiento + 30' tempo con cambios + 10' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo sendero umbral", duracion: 55, unidad: "min", desc: "Ritmo cerca del umbral.", estructura: "10' calentamiento + 35' Z3-Z4 + 10' enfriamiento", sensacion: "Exigente", tipo: "tempo", zona: "Z3-Z4" }
          ],
          largo: [
            { nombre: "Largo sendero", duracion: 60, unidad: "min", desc: "Resistencia sendero.", estructura: "60' Z2 sendero", sensacion: "Base", tipo: "largo", zona: "Z2" },
            { nombre: "Largo montaña suave", duracion: 65, unidad: "min", desc: "Sendero continuo.", estructura: "65' sendero", sensacion: "Resistencia", tipo: "largo", zona: "Z2" },
            { nombre: "Largo con desnivel", duracion: 70, unidad: "min", desc: "Incluye desnivel.", estructura: "70' con desnivel", sensacion: "Exigente", tipo: "largo", zona: "Z2" },
            { nombre: "Largo progresivo", duracion: 65, unidad: "min", desc: "Aumenta ritmo en llano.", estructura: "45' Z2 + 20' Z3", sensacion: "Fuerte", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo específico", duracion: 75, unidad: "min", desc: "Incluye cambios.", estructura: "50' Z2 + 4x3' Z4 + 10' enfriamiento", sensacion: "Preparación", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo calidad", duracion: 80, unidad: "min", desc: "Progresión constante.", estructura: "50' Z2 + 30' Z3", sensacion: "Exigente", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo resistencia", duracion: 85, unidad: "min", desc: "Fondo largo en sendero.", estructura: "85' Z2", sensacion: "Resistencia", tipo: "largo", zona: "Z2" }
          ]
        },
        intermedio: {
          rodaje: [
            { nombre: "Rodaje técnico", duracion: 40, unidad: "min", desc: "Técnica continua.", estructura: "40' técnico", sensacion: "Coordinación", tipo: "rodaje", zona: "Z2" },
            { nombre: "Sendero técnico", duracion: 45, unidad: "min", desc: "Técnica avanzada.", estructura: "45' técnico", sensacion: "Maestría", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje montaña", duracion: 50, unidad: "min", desc: "Terreno variado.", estructura: "50' sendero variado", sensacion: "Resistencia", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de mantenimiento", duracion: 35, unidad: "min", desc: "Sesión para mantener forma.", estructura: "35' Z2", sensacion: "Cómodo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje con estímulos", duracion: 45, unidad: "min", desc: "Introduce 4 cambios.", estructura: "10' calentamiento + 4x(2' rápido + 3' suave) + 10' enfriamiento", sensacion: "Estimulante", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de recuperación", duracion: 30, unidad: "min", desc: "Después de sesión intensa.", estructura: "30' Z1-Z2", sensacion: "Muy suave", tipo: "rodaje", zona: "Z1" },
            { nombre: "Rodaje de base", duracion: 55, unidad: "min", desc: "Fondo para construir resistencia.", estructura: "55' Z2", sensacion: "Resistencia", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje progresivo", duracion: 50, unidad: "min", desc: "Aumenta ritmo cada 15'.", estructura: "15' Z2 + 20' Z2 medio + 15' Z2 alto", sensacion: "Progresivo", tipo: "rodaje", zona: "Z2" }
          ],
          series: [
            { nombre: "Cuestas medias", duracion: 45, unidad: "min", desc: "7x100m cuesta media.", estructura: "15' calentamiento + 7 cuestas + 10' enfriamiento", sensacion: "Potencia", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas largas", duracion: 50, unidad: "min", desc: "6x120m cuesta media.", estructura: "15' calentamiento + 6 cuestas + 10' enfriamiento", sensacion: "Exigente", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas variables", duracion: 50, unidad: "min", desc: "5x(80m + 100m + 120m)", estructura: "15' calentamiento + 5 series + 10' enfriamiento", sensacion: "Completo", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas repetidas", duracion: 55, unidad: "min", desc: "10x80m cuesta media.", estructura: "15' calentamiento + 10 cuestas + 5' enfriamiento", sensacion: "Intenso", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas largas medias", duracion: 60, unidad: "min", desc: "5x150m cuesta media.", estructura: "15' calentamiento + 5 cuestas + 10' enfriamiento", sensacion: "Fuerte", tipo: "series", zona: "Z5" },
            { nombre: "Cuestas variadas intensas", duracion: 55, unidad: "min", desc: "6x(80m + 100m) cuesta media.", estructura: "15' calentamiento + 6 series + 10' enfriamiento", sensacion: "Completo", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas explosivas", duracion: 50, unidad: "min", desc: "12x70m cuesta media.", estructura: "15' calentamiento + 12 cuestas + 5' enfriamiento", sensacion: "Explosivas", tipo: "series", zona: "Z5" }
          ],
          tempo: [
            { nombre: "Tempo desnivel", duracion: 45, unidad: "min", desc: "Desnivel continuo.", estructura: "45' con desnivel", sensacion: "Exigente", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo montaña", duracion: 50, unidad: "min", desc: "Ritmo fuerte.", estructura: "50' desnivel", sensacion: "Muy exigente", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo variable", duracion: 50, unidad: "min", desc: "Alterna ritmos.", estructura: "50' cambios", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo sendero largo", duracion: 55, unidad: "min", desc: "Ritmo sostenido en sendero.", estructura: "10' calentamiento + 35' Z3 + 10' enfriamiento", sensacion: "Resistencia", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo progresivo", duracion: 55, unidad: "min", desc: "Aumenta ritmo cada 10'.", estructura: "10' calentamiento + 10' Z3 + 10' Z4 + 10' Z3 + 10' enfriamiento", sensacion: "Progresivo", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo con cambios", duracion: 50, unidad: "min", desc: "Introduce 5 cambios.", estructura: "10' calentamiento + 30' tempo con cambios + 10' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo umbral sendero", duracion: 60, unidad: "min", desc: "Ritmo cerca del umbral.", estructura: "10' calentamiento + 40' Z3-Z4 + 10' enfriamiento", sensacion: "Exigente", tipo: "tempo", zona: "Z3-Z4" }
          ],
          largo: [
            { nombre: "Largo montaña", duracion: 75, unidad: "min", desc: "Mixto con cambios.", estructura: "75' trail", sensacion: "Resistencia", tipo: "largo", zona: "Z2" },
            { nombre: "Largo técnico", duracion: 80, unidad: "min", desc: "Alta técnica.", estructura: "80' trail técnico", sensacion: "Exigente", tipo: "largo", zona: "Z2" },
            { nombre: "Largo con desnivel", duracion: 85, unidad: "min", desc: "Acumulación.", estructura: "85' con desnivel", sensacion: "Preparación", tipo: "largo", zona: "Z2" },
            { nombre: "Largo progresivo", duracion: 80, unidad: "min", desc: "Aumenta ritmo en llano.", estructura: "55' Z2 + 25' Z3", sensacion: "Fuerte", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo específico", duracion: 90, unidad: "min", desc: "Incluye cambios.", estructura: "60' Z2 + 5x3' Z4 + 15' enfriamiento", sensacion: "Preparación", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo calidad", duracion: 95, unidad: "min", desc: "Progresión constante.", estructura: "65' Z2 + 30' Z3", sensacion: "Exigente", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo resistencia", duracion: 100, unidad: "min", desc: "Fondo largo en sendero.", estructura: "100' Z2", sensacion: "Resistencia", tipo: "largo", zona: "Z2" }
          ]
        },
        avanzado: {
          rodaje: [
            { nombre: "Rodaje técnico", duracion: 45, unidad: "min", desc: "Alta técnica.", estructura: "45' técnico", sensacion: "Maestría", tipo: "rodaje", zona: "Z2" },
            { nombre: "Sendero avanzado", duracion: 50, unidad: "min", desc: "Máxima técnica.", estructura: "50' técnico", sensacion: "Dominio", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje desnivel", duracion: 55, unidad: "min", desc: "Acumulación.", estructura: "55' con desnivel", sensacion: "Exigente", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de mantenimiento", duracion: 40, unidad: "min", desc: "Sesión para mantener forma.", estructura: "40' Z2", sensacion: "Cómodo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje con estímulos", duracion: 50, unidad: "min", desc: "Introduce 5 cambios.", estructura: "10' calentamiento + 5x(2' rápido + 3' suave) + 10' enfriamiento", sensacion: "Estimulante", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de recuperación", duracion: 35, unidad: "min", desc: "Después de sesión intensa.", estructura: "35' Z1-Z2", sensacion: "Muy suave", tipo: "rodaje", zona: "Z1" },
            { nombre: "Rodaje de base", duracion: 60, unidad: "min", desc: "Fondo para construir resistencia.", estructura: "60' Z2", sensacion: "Resistencia", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje progresivo", duracion: 55, unidad: "min", desc: "Aumenta ritmo cada 15'.", estructura: "15' Z2 + 20' Z2 medio + 20' Z2 alto", sensacion: "Progresivo", tipo: "rodaje", zona: "Z2" }
          ],
          series: [
            { nombre: "Cuestas fuertes", duracion: 50, unidad: "min", desc: "9x120m cuesta fuerte.", estructura: "15' calentamiento + 9 cuestas + 10' enfriamiento", sensacion: "Máxima potencia", tipo: "series", zona: "Z5" },
            { nombre: "Cuestas muy fuertes", duracion: 55, unidad: "min", desc: "7x150m cuesta fuerte.", estructura: "15' calentamiento + 7 cuestas + 10' enfriamiento", sensacion: "Exigente", tipo: "series", zona: "Z5" },
            { nombre: "Cuestas largas fuertes", duracion: 60, unidad: "min", desc: "6x180m cuesta fuerte.", estructura: "15' calentamiento + 6 cuestas + 10' enfriamiento", sensacion: "Máximo", tipo: "series", zona: "Z5" },
            { nombre: "Cuestas explosivas", duracion: 55, unidad: "min", desc: "12x100m cuesta fuerte.", estructura: "15' calentamiento + 12 cuestas + 5' enfriamiento", sensacion: "Explosivas", tipo: "series", zona: "Z5" },
            { nombre: "Cuestas variadas fuertes", duracion: 60, unidad: "min", desc: "8x(100m + 120m) cuesta fuerte.", estructura: "15' calentamiento + 8 series + 10' enfriamiento", sensacion: "Completo", tipo: "series", zona: "Z5" },
            { nombre: "Cuestas en escalera", duracion: 65, unidad: "min", desc: "5x(80m + 100m + 120m + 150m)", estructura: "15' calentamiento + 5 series + 10' enfriamiento", sensacion: "Muy exigente", tipo: "series", zona: "Z5" },
            { nombre: "Cuestas máximas", duracion: 70, unidad: "min", desc: "4x250m cuesta fuerte.", estructura: "15' calentamiento + 4 cuestas + 10' enfriamiento", sensacion: "Máximo", tipo: "series", zona: "Z5" }
          ],
          tempo: [
            { nombre: "Tempo montaña", duracion: 50, unidad: "min", desc: "Ritmo fuerte.", estructura: "50' desnivel intenso", sensacion: "Exigente", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo fuerte", duracion: 55, unidad: "min", desc: "Máxima intensidad.", estructura: "55' desnivel intenso", sensacion: "Muy exigente", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo variable", duracion: 55, unidad: "min", desc: "Cambios constantes.", estructura: "55' cambios", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo sendero largo", duracion: 60, unidad: "min", desc: "Ritmo sostenido en sendero.", estructura: "10' calentamiento + 40' Z3 + 10' enfriamiento", sensacion: "Resistencia", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo progresivo", duracion: 60, unidad: "min", desc: "Aumenta ritmo cada 8'.", estructura: "10' calentamiento + 8' Z3 + 8' Z4 + 8' Z3 + 8' Z4 + 8' enfriamiento", sensacion: "Progresivo", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo con cambios", duracion: 55, unidad: "min", desc: "Introduce 6 cambios.", estructura: "10' calentamiento + 35' tempo con cambios + 10' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo umbral sendero", duracion: 65, unidad: "min", desc: "Ritmo cerca del umbral.", estructura: "10' calentamiento + 45' Z3-Z4 + 10' enfriamiento", sensacion: "Exigente", tipo: "tempo", zona: "Z3-Z4" }
          ],
          largo: [
            { nombre: "Largo trail", duracion: 100, unidad: "min", desc: "Simulación carrera.", estructura: "100' trail", sensacion: "Preparación", tipo: "largo", zona: "Z2" },
            { nombre: "Largo avanzado", duracion: 110, unidad: "min", desc: "Alto volumen.", estructura: "110' trail técnico", sensacion: "Exigente", tipo: "largo", zona: "Z2" },
            { nombre: "Largo ultra", duracion: 120, unidad: "min", desc: "Preparación ultra.", estructura: "120' trail", sensacion: "Resistencia", tipo: "largo", zona: "Z2" },
            { nombre: "Largo progresivo", duracion: 105, unidad: "min", desc: "Aumenta ritmo en llano.", estructura: "75' Z2 + 30' Z3", sensacion: "Fuerte", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo específico", duracion: 115, unidad: "min", desc: "Incluye cambios.", estructura: "80' Z2 + 6x3' Z4 + 15' enfriamiento", sensacion: "Preparación", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo calidad", duracion: 125, unidad: "min", desc: "Progresión constante.", estructura: "85' Z2 + 40' Z3", sensacion: "Exigente", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo resistencia", duracion: 130, unidad: "min", desc: "Fondo largo en sendero.", estructura: "130' Z2", sensacion: "Resistencia", tipo: "largo", zona: "Z2" }
          ]
        }
      },
      "10k": {
        principiante: {
          rodaje: [
            { nombre: "Rodaje 10k trail", duracion: 40, unidad: "min", desc: "Terreno irregular.", estructura: "40' Z2 sendero", sensacion: "Adaptación", tipo: "rodaje", zona: "Z2" },
            { nombre: "Sendero 10k", duracion: 45, unidad: "min", desc: "Sendero continuo.", estructura: "45' sendero", sensacion: "Cómodo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Sendero progresivo", duracion: 45, unidad: "min", desc: "Aumenta ritmo.", estructura: "45' progresivo", sensacion: "Progresivo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Sendero de recuperación", duracion: 35, unidad: "min", desc: "Sesión muy suave en sendero.", estructura: "35' Z1-Z2", sensacion: "Muy fácil", tipo: "rodaje", zona: "Z1" },
            { nombre: "Sendero matinal", duracion: 40, unidad: "min", desc: "Despertar suave en sendero.", estructura: "40' Z2", sensacion: "Refrescante", tipo: "rodaje", zona: "Z2" },
            { nombre: "Sendero con cambios", duracion: 45, unidad: "min", desc: "Introduce cambios de ritmo.", estructura: "10' calentamiento + 30' con cambios + 5' enfriamiento", sensacion: "Dinámico", tipo: "rodaje", zona: "Z2" },
            { nombre: "Sendero base", duracion: 50, unidad: "min", desc: "Fondo para construir resistencia.", estructura: "50' Z2", sensacion: "Resistencia", tipo: "rodaje", zona: "Z2" },
            { nombre: "Sendero regenerativo", duracion: 35, unidad: "min", desc: "Después de sesión dura.", estructura: "35' Z1", sensacion: "Muy suave", tipo: "rodaje", zona: "Z1" }
          ],
          series: [
            { nombre: "Cuestas 10k", duracion: 45, unidad: "min", desc: "6x80m cuesta suave.", estructura: "15' calentamiento + 6 cuestas + 10' enfriamiento", sensacion: "Potencia", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas cortas", duracion: 40, unidad: "min", desc: "7x60m cuesta suave.", estructura: "15' calentamiento + 7 cuestas + 5' enfriamiento", sensacion: "Rápidas", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas medias", duracion: 50, unidad: "min", desc: "6x100m cuesta media.", estructura: "15' calentamiento + 6 cuestas + 10' enfriamiento", sensacion: "Exigente", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas largas", duracion: 55, unidad: "min", desc: "5x120m cuesta media.", estructura: "15' calentamiento + 5 cuestas + 10' enfriamiento", sensacion: "Fuerte", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas repetidas", duracion: 50, unidad: "min", desc: "9x80m cuesta suave.", estructura: "15' calentamiento + 9 cuestas + 5' enfriamiento", sensacion: "Intenso", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas variadas", duracion: 55, unidad: "min", desc: "6x(70m + 90m) cuesta media.", estructura: "15' calentamiento + 6 series + 10' enfriamiento", sensacion: "Completo", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas explosivas", duracion: 45, unidad: "min", desc: "12x60m cuesta suave.", estructura: "15' calentamiento + 12 cuestas + 5' enfriamiento", sensacion: "Explosivas", tipo: "series", zona: "Z5" }
          ],
          tempo: [
            { nombre: "Tempo sendero", duracion: 45, unidad: "min", desc: "Ritmo sostenido.", estructura: "45' Z3 sendero", sensacion: "Control", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo desnivel", duracion: 50, unidad: "min", desc: "Con desnivel suave.", estructura: "50' Z3 con desnivel", sensacion: "Exigente", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo progresivo", duracion: 50, unidad: "min", desc: "Aumenta ritmo.", estructura: "50' progresivo", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo sendero largo", duracion: 55, unidad: "min", desc: "Ritmo sostenido en sendero.", estructura: "10' calentamiento + 35' Z3 + 10' enfriamiento", sensacion: "Resistencia", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo variable", duracion: 50, unidad: "min", desc: "Alterna llano y cuestas.", estructura: "10' calentamiento + 30' con cambios + 10' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo con cambios", duracion: 55, unidad: "min", desc: "Introduce 4 cambios.", estructura: "10' calentamiento + 35' tempo con cambios + 10' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo sendero umbral", duracion: 60, unidad: "min", desc: "Ritmo cerca del umbral.", estructura: "10' calentamiento + 40' Z3-Z4 + 10' enfriamiento", sensacion: "Exigente", tipo: "tempo", zona: "Z3-Z4" }
          ],
          largo: [
            { nombre: "Largo sendero", duracion: 70, unidad: "min", desc: "Resistencia.", estructura: "70' Z2 sendero", sensacion: "Base", tipo: "largo", zona: "Z2" },
            { nombre: "Largo montaña suave", duracion: 75, unidad: "min", desc: "Sendero continuo.", estructura: "75' sendero", sensacion: "Resistencia", tipo: "largo", zona: "Z2" },
            { nombre: "Largo con desnivel", duracion: 80, unidad: "min", desc: "Incluye desnivel.", estructura: "80' con desnivel", sensacion: "Exigente", tipo: "largo", zona: "Z2" },
            { nombre: "Largo progresivo", duracion: 75, unidad: "min", desc: "Aumenta ritmo en llano.", estructura: "50' Z2 + 25' Z3", sensacion: "Fuerte", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo específico", duracion: 85, unidad: "min", desc: "Incluye cambios.", estructura: "55' Z2 + 5x3' Z4 + 10' enfriamiento", sensacion: "Preparación", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo calidad", duracion: 90, unidad: "min", desc: "Progresión constante.", estructura: "60' Z2 + 30' Z3", sensacion: "Exigente", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo resistencia", duracion: 95, unidad: "min", desc: "Fondo largo en sendero.", estructura: "95' Z2", sensacion: "Resistencia", tipo: "largo", zona: "Z2" }
          ]
        },
        intermedio: {
          rodaje: [
            { nombre: "Rodaje técnico", duracion: 45, unidad: "min", desc: "Técnica sendero.", estructura: "45' técnico", sensacion: "Coordinación", tipo: "rodaje", zona: "Z2" },
            { nombre: "Sendero técnico", duracion: 50, unidad: "min", desc: "Técnica avanzada.", estructura: "50' técnico", sensacion: "Maestría", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje montaña", duracion: 55, unidad: "min", desc: "Terreno variado.", estructura: "55' sendero variado", sensacion: "Resistencia", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de mantenimiento", duracion: 40, unidad: "min", desc: "Sesión para mantener forma.", estructura: "40' Z2", sensacion: "Cómodo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje con estímulos", duracion: 50, unidad: "min", desc: "Introduce 4 cambios.", estructura: "10' calentamiento + 4x(2' rápido + 3' suave) + 10' enfriamiento", sensacion: "Estimulante", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de recuperación", duracion: 35, unidad: "min", desc: "Después de sesión intensa.", estructura: "35' Z1-Z2", sensacion: "Muy suave", tipo: "rodaje", zona: "Z1" },
            { nombre: "Rodaje de base", duracion: 60, unidad: "min", desc: "Fondo para construir resistencia.", estructura: "60' Z2", sensacion: "Resistencia", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje progresivo", duracion: 55, unidad: "min", desc: "Aumenta ritmo cada 15'.", estructura: "15' Z2 + 20' Z2 medio + 20' Z2 alto", sensacion: "Progresivo", tipo: "rodaje", zona: "Z2" }
          ],
          series: [
            { nombre: "Cuestas medias", duracion: 50, unidad: "min", desc: "8x100m cuesta media.", estructura: "15' calentamiento + 8 cuestas + 10' enfriamiento", sensacion: "Potencia", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas largas", duracion: 55, unidad: "min", desc: "7x120m cuesta media.", estructura: "15' calentamiento + 7 cuestas + 10' enfriamiento", sensacion: "Exigente", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas variables", duracion: 55, unidad: "min", desc: "6x(80m + 100m + 120m)", estructura: "15' calentamiento + 6 series + 10' enfriamiento", sensacion: "Completo", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas repetidas", duracion: 60, unidad: "min", desc: "12x80m cuesta media.", estructura: "15' calentamiento + 12 cuestas + 5' enfriamiento", sensacion: "Intenso", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas largas medias", duracion: 65, unidad: "min", desc: "6x150m cuesta media.", estructura: "15' calentamiento + 6 cuestas + 10' enfriamiento", sensacion: "Fuerte", tipo: "series", zona: "Z5" },
            { nombre: "Cuestas variadas intensas", duracion: 60, unidad: "min", desc: "7x(90m + 110m) cuesta media.", estructura: "15' calentamiento + 7 series + 10' enfriamiento", sensacion: "Completo", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas explosivas", duracion: 55, unidad: "min", desc: "14x70m cuesta media.", estructura: "15' calentamiento + 14 cuestas + 5' enfriamiento", sensacion: "Explosivas", tipo: "series", zona: "Z5" }
          ],
          tempo: [
            { nombre: "Tempo desnivel", duracion: 50, unidad: "min", desc: "Desnivel continuo.", estructura: "50' con desnivel", sensacion: "Exigente", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo montaña", duracion: 55, unidad: "min", desc: "Ritmo fuerte.", estructura: "55' desnivel", sensacion: "Muy exigente", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo variable", duracion: 55, unidad: "min", desc: "Alterna ritmos.", estructura: "55' cambios", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo sendero largo", duracion: 60, unidad: "min", desc: "Ritmo sostenido en sendero.", estructura: "10' calentamiento + 40' Z3 + 10' enfriamiento", sensacion: "Resistencia", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo progresivo", duracion: 60, unidad: "min", desc: "Aumenta ritmo cada 8'.", estructura: "10' calentamiento + 8' Z3 + 8' Z4 + 8' Z3 + 8' Z4 + 8' enfriamiento", sensacion: "Progresivo", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo con cambios", duracion: 55, unidad: "min", desc: "Introduce 5 cambios.", estructura: "10' calentamiento + 35' tempo con cambios + 10' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo umbral sendero", duracion: 65, unidad: "min", desc: "Ritmo cerca del umbral.", estructura: "10' calentamiento + 45' Z3-Z4 + 10' enfriamiento", sensacion: "Exigente", tipo: "tempo", zona: "Z3-Z4" }
          ],
          largo: [
            { nombre: "Largo montaña", duracion: 90, unidad: "min", desc: "Mixto trail.", estructura: "90' trail técnico", sensacion: "Resistencia", tipo: "largo", zona: "Z2" },
            { nombre: "Largo técnico", duracion: 95, unidad: "min", desc: "Alta técnica.", estructura: "95' trail técnico", sensacion: "Exigente", tipo: "largo", zona: "Z2" },
            { nombre: "Largo con desnivel", duracion: 100, unidad: "min", desc: "Acumulación.", estructura: "100' con desnivel", sensacion: "Preparación", tipo: "largo", zona: "Z2" },
            { nombre: "Largo progresivo", duracion: 95, unidad: "min", desc: "Aumenta ritmo en llano.", estructura: "65' Z2 + 30' Z3", sensacion: "Fuerte", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo específico", duracion: 105, unidad: "min", desc: "Incluye cambios.", estructura: "70' Z2 + 6x3' Z4 + 15' enfriamiento", sensacion: "Preparación", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo calidad", duracion: 110, unidad: "min", desc: "Progresión constante.", estructura: "75' Z2 + 35' Z3", sensacion: "Exigente", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo resistencia", duracion: 115, unidad: "min", desc: "Fondo largo en sendero.", estructura: "115' Z2", sensacion: "Resistencia", tipo: "largo", zona: "Z2" }
          ]
        },
        avanzado: {
          rodaje: [
            { nombre: "Rodaje técnico", duracion: 50, unidad: "min", desc: "Máxima técnica.", estructura: "50' técnico", sensacion: "Maestría", tipo: "rodaje", zona: "Z2" },
            { nombre: "Sendero avanzado", duracion: 55, unidad: "min", desc: "Técnica superior.", estructura: "55' técnico", sensacion: "Dominio", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje desnivel", duracion: 60, unidad: "min", desc: "Acumulación.", estructura: "60' con desnivel", sensacion: "Exigente", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de mantenimiento", duracion: 45, unidad: "min", desc: "Sesión para mantener forma.", estructura: "45' Z2", sensacion: "Cómodo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje con estímulos", duracion: 55, unidad: "min", desc: "Introduce 5 cambios.", estructura: "10' calentamiento + 5x(2' rápido + 3' suave) + 10' enfriamiento", sensacion: "Estimulante", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de recuperación", duracion: 40, unidad: "min", desc: "Después de sesión intensa.", estructura: "40' Z1-Z2", sensacion: "Muy suave", tipo: "rodaje", zona: "Z1" },
            { nombre: "Rodaje de base", duracion: 65, unidad: "min", desc: "Fondo para construir resistencia.", estructura: "65' Z2", sensacion: "Resistencia", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje progresivo", duracion: 60, unidad: "min", desc: "Aumenta ritmo cada 15'.", estructura: "15' Z2 + 20' Z2 medio + 25' Z2 alto", sensacion: "Progresivo", tipo: "rodaje", zona: "Z2" }
          ],
          series: [
            { nombre: "Cuestas fuertes", duracion: 55, unidad: "min", desc: "10x120m cuesta fuerte.", estructura: "15' calentamiento + 10 cuestas + 10' enfriamiento", sensacion: "Máxima potencia", tipo: "series", zona: "Z5" },
            { nombre: "Cuestas muy fuertes", duracion: 60, unidad: "min", desc: "8x150m cuesta fuerte.", estructura: "15' calentamiento + 8 cuestas + 10' enfriamiento", sensacion: "Exigente", tipo: "series", zona: "Z5" },
            { nombre: "Cuestas largas fuertes", duracion: 65, unidad: "min", desc: "7x200m cuesta fuerte.", estructura: "15' calentamiento + 7 cuestas + 10' enfriamiento", sensacion: "Máximo", tipo: "series", zona: "Z5" },
            { nombre: "Cuestas explosivas", duracion: 60, unidad: "min", desc: "14x100m cuesta fuerte.", estructura: "15' calentamiento + 14 cuestas + 5' enfriamiento", sensacion: "Explosivas", tipo: "series", zona: "Z5" },
            { nombre: "Cuestas variadas fuertes", duracion: 65, unidad: "min", desc: "9x(110m + 130m) cuesta fuerte.", estructura: "15' calentamiento + 9 series + 10' enfriamiento", sensacion: "Completo", tipo: "series", zona: "Z5" },
            { nombre: "Cuestas en escalera", duracion: 70, unidad: "min", desc: "6x(100m + 120m + 140m + 160m)", estructura: "15' calentamiento + 6 series + 10' enfriamiento", sensacion: "Muy exigente", tipo: "series", zona: "Z5" },
            { nombre: "Cuestas máximas", duracion: 75, unidad: "min", desc: "5x300m cuesta fuerte.", estructura: "15' calentamiento + 5 cuestas + 10' enfriamiento", sensacion: "Máximo", tipo: "series", zona: "Z5" }
          ],
          tempo: [
            { nombre: "Tempo montaña", duracion: 55, unidad: "min", desc: "Ritmo fuerte.", estructura: "55' desnivel intenso", sensacion: "Exigente", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo fuerte", duracion: 60, unidad: "min", desc: "Máxima intensidad.", estructura: "60' desnivel intenso", sensacion: "Muy exigente", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo variable", duracion: 60, unidad: "min", desc: "Cambios constantes.", estructura: "60' cambios", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo sendero largo", duracion: 65, unidad: "min", desc: "Ritmo sostenido en sendero.", estructura: "10' calentamiento + 45' Z3 + 10' enfriamiento", sensacion: "Resistencia", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo progresivo", duracion: 65, unidad: "min", desc: "Aumenta ritmo cada 6'.", estructura: "10' calentamiento + 6' Z3 + 6' Z4 + 6' Z3 + 6' Z4 + 6' enfriamiento", sensacion: "Progresivo", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo con cambios", duracion: 60, unidad: "min", desc: "Introduce 6 cambios.", estructura: "10' calentamiento + 40' tempo con cambios + 10' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo umbral sendero", duracion: 70, unidad: "min", desc: "Ritmo cerca del umbral.", estructura: "10' calentamiento + 50' Z3-Z4 + 10' enfriamiento", sensacion: "Exigente", tipo: "tempo", zona: "Z3-Z4" }
          ],
          largo: [
            { nombre: "Largo trail", duracion: 120, unidad: "min", desc: "Simulación.", estructura: "120' trail", sensacion: "Preparación", tipo: "largo", zona: "Z2" },
            { nombre: "Largo avanzado", duracion: 130, unidad: "min", desc: "Alto volumen.", estructura: "130' trail técnico", sensacion: "Exigente", tipo: "largo", zona: "Z2" },
            { nombre: "Largo ultra", duracion: 140, unidad: "min", desc: "Preparación.", estructura: "140' trail", sensacion: "Resistencia", tipo: "largo", zona: "Z2" },
            { nombre: "Largo progresivo", duracion: 125, unidad: "min", desc: "Aumenta ritmo en llano.", estructura: "85' Z2 + 40' Z3", sensacion: "Fuerte", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo específico", duracion: 135, unidad: "min", desc: "Incluye cambios.", estructura: "90' Z2 + 7x3' Z4 + 20' enfriamiento", sensacion: "Preparación", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo calidad", duracion: 145, unidad: "min", desc: "Progresión constante.", estructura: "95' Z2 + 50' Z3", sensacion: "Exigente", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo resistencia", duracion: 150, unidad: "min", desc: "Fondo largo en sendero.", estructura: "150' Z2", sensacion: "Resistencia", tipo: "largo", zona: "Z2" }
          ]
        }
      },
      "medio": {
        principiante: {
          rodaje: [
            { nombre: "Rodaje media trail", duracion: 45, unidad: "min", desc: "Terreno irregular.", estructura: "45' Z2 sendero", sensacion: "Adaptación", tipo: "rodaje", zona: "Z2" },
            { nombre: "Sendero media", duracion: 50, unidad: "min", desc: "Sendero continuo.", estructura: "50' sendero", sensacion: "Cómodo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Sendero progresivo", duracion: 50, unidad: "min", desc: "Aumenta ritmo.", estructura: "50' progresivo", sensacion: "Progresivo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Sendero de recuperación", duracion: 40, unidad: "min", desc: "Sesión muy suave en sendero.", estructura: "40' Z1-Z2", sensacion: "Muy fácil", tipo: "rodaje", zona: "Z1" },
            { nombre: "Sendero matinal", duracion: 45, unidad: "min", desc: "Despertar suave en sendero.", estructura: "45' Z2", sensacion: "Refrescante", tipo: "rodaje", zona: "Z2" },
            { nombre: "Sendero con cambios", duracion: 50, unidad: "min", desc: "Introduce cambios de ritmo.", estructura: "10' calentamiento + 35' con cambios + 5' enfriamiento", sensacion: "Dinámico", tipo: "rodaje", zona: "Z2" },
            { nombre: "Sendero base", duracion: 55, unidad: "min", desc: "Fondo para construir resistencia.", estructura: "55' Z2", sensacion: "Resistencia", tipo: "rodaje", zona: "Z2" },
            { nombre: "Sendero regenerativo", duracion: 40, unidad: "min", desc: "Después de sesión dura.", estructura: "40' Z1", sensacion: "Muy suave", tipo: "rodaje", zona: "Z1" }
          ],
          series: [
            { nombre: "Cuestas media", duracion: 50, unidad: "min", desc: "7x100m cuesta suave.", estructura: "15' calentamiento + 7 cuestas + 10' enfriamiento", sensacion: "Potencia", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas cortas", duracion: 45, unidad: "min", desc: "8x70m cuesta suave.", estructura: "15' calentamiento + 8 cuestas + 5' enfriamiento", sensacion: "Rápidas", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas medias", duracion: 55, unidad: "min", desc: "6x120m cuesta media.", estructura: "15' calentamiento + 6 cuestas + 10' enfriamiento", sensacion: "Exigente", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas largas", duracion: 60, unidad: "min", desc: "5x150m cuesta media.", estructura: "15' calentamiento + 5 cuestas + 10' enfriamiento", sensacion: "Fuerte", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas repetidas", duracion: 55, unidad: "min", desc: "10x90m cuesta suave.", estructura: "15' calentamiento + 10 cuestas + 5' enfriamiento", sensacion: "Intenso", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas variadas", duracion: 60, unidad: "min", desc: "7x(80m + 100m) cuesta media.", estructura: "15' calentamiento + 7 series + 10' enfriamiento", sensacion: "Completo", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas explosivas", duracion: 50, unidad: "min", desc: "14x70m cuesta suave.", estructura: "15' calentamiento + 14 cuestas + 5' enfriamiento", sensacion: "Explosivas", tipo: "series", zona: "Z5" }
          ],
          tempo: [
            { nombre: "Tempo sendero", duracion: 50, unidad: "min", desc: "Ritmo sostenido.", estructura: "50' Z3 sendero", sensacion: "Control", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo desnivel", duracion: 55, unidad: "min", desc: "Con desnivel suave.", estructura: "55' Z3 con desnivel", sensacion: "Exigente", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo progresivo", duracion: 55, unidad: "min", desc: "Aumenta ritmo.", estructura: "55' progresivo", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo sendero largo", duracion: 60, unidad: "min", desc: "Ritmo sostenido en sendero.", estructura: "10' calentamiento + 40' Z3 + 10' enfriamiento", sensacion: "Resistencia", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo variable", duracion: 55, unidad: "min", desc: "Alterna llano y cuestas.", estructura: "10' calentamiento + 35' con cambios + 10' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo con cambios", duracion: 60, unidad: "min", desc: "Introduce 4 cambios.", estructura: "10' calentamiento + 40' tempo con cambios + 10' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo sendero umbral", duracion: 65, unidad: "min", desc: "Ritmo cerca del umbral.", estructura: "10' calentamiento + 45' Z3-Z4 + 10' enfriamiento", sensacion: "Exigente", tipo: "tempo", zona: "Z3-Z4" }
          ],
          largo: [
            { nombre: "Largo sendero", duracion: 85, unidad: "min", desc: "Resistencia.", estructura: "85' Z2 sendero", sensacion: "Base", tipo: "largo", zona: "Z2" },
            { nombre: "Largo montaña suave", duracion: 90, unidad: "min", desc: "Sendero continuo.", estructura: "90' sendero", sensacion: "Resistencia", tipo: "largo", zona: "Z2" },
            { nombre: "Largo con desnivel", duracion: 95, unidad: "min", desc: "Incluye desnivel.", estructura: "95' con desnivel", sensacion: "Exigente", tipo: "largo", zona: "Z2" },
            { nombre: "Largo progresivo", duracion: 90, unidad: "min", desc: "Aumenta ritmo en llano.", estructura: "60' Z2 + 30' Z3", sensacion: "Fuerte", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo específico", duracion: 100, unidad: "min", desc: "Incluye cambios.", estructura: "65' Z2 + 6x3' Z4 + 15' enfriamiento", sensacion: "Preparación", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo calidad", duracion: 105, unidad: "min", desc: "Progresión constante.", estructura: "70' Z2 + 35' Z3", sensacion: "Exigente", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo resistencia", duracion: 110, unidad: "min", desc: "Fondo largo en sendero.", estructura: "110' Z2", sensacion: "Resistencia", tipo: "largo", zona: "Z2" }
          ]
        },
        intermedio: {
          rodaje: [
            { nombre: "Rodaje técnico", duracion: 50, unidad: "min", desc: "Técnica avanzada.", estructura: "50' técnico", sensacion: "Coordinación", tipo: "rodaje", zona: "Z2" },
            { nombre: "Sendero técnico", duracion: 55, unidad: "min", desc: "Técnica superior.", estructura: "55' técnico", sensacion: "Maestría", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje montaña", duracion: 60, unidad: "min", desc: "Terreno variado.", estructura: "60' sendero variado", sensacion: "Resistencia", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de mantenimiento", duracion: 45, unidad: "min", desc: "Sesión para mantener forma.", estructura: "45' Z2", sensacion: "Cómodo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje con estímulos", duracion: 55, unidad: "min", desc: "Introduce 4 cambios.", estructura: "10' calentamiento + 4x(2' rápido + 3' suave) + 10' enfriamiento", sensacion: "Estimulante", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de recuperación", duracion: 40, unidad: "min", desc: "Después de sesión intensa.", estructura: "40' Z1-Z2", sensacion: "Muy suave", tipo: "rodaje", zona: "Z1" },
            { nombre: "Rodaje de base", duracion: 65, unidad: "min", desc: "Fondo para construir resistencia.", estructura: "65' Z2", sensacion: "Resistencia", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje progresivo", duracion: 60, unidad: "min", desc: "Aumenta ritmo cada 15'.", estructura: "15' Z2 + 20' Z2 medio + 25' Z2 alto", sensacion: "Progresivo", tipo: "rodaje", zona: "Z2" }
          ],
          series: [
            { nombre: "Cuestas medias", duracion: 55, unidad: "min", desc: "9x120m cuesta media.", estructura: "15' calentamiento + 9 cuestas + 10' enfriamiento", sensacion: "Potencia", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas largas", duracion: 60, unidad: "min", desc: "8x150m cuesta media.", estructura: "15' calentamiento + 8 cuestas + 10' enfriamiento", sensacion: "Exigente", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas variables", duracion: 60, unidad: "min", desc: "7x(100m + 120m + 150m)", estructura: "15' calentamiento + 7 series + 10' enfriamiento", sensacion: "Completo", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas repetidas", duracion: 65, unidad: "min", desc: "14x90m cuesta media.", estructura: "15' calentamiento + 14 cuestas + 5' enfriamiento", sensacion: "Intenso", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas largas medias", duracion: 70, unidad: "min", desc: "7x180m cuesta media.", estructura: "15' calentamiento + 7 cuestas + 10' enfriamiento", sensacion: "Fuerte", tipo: "series", zona: "Z5" },
            { nombre: "Cuestas variadas intensas", duracion: 65, unidad: "min", desc: "8x(110m + 130m) cuesta media.", estructura: "15' calentamiento + 8 series + 10' enfriamiento", sensacion: "Completo", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas explosivas", duracion: 60, unidad: "min", desc: "16x80m cuesta media.", estructura: "15' calentamiento + 16 cuestas + 5' enfriamiento", sensacion: "Explosivas", tipo: "series", zona: "Z5" }
          ],
          tempo: [
            { nombre: "Tempo desnivel", duracion: 55, unidad: "min", desc: "Desnivel continuo.", estructura: "55' con desnivel", sensacion: "Exigente", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo montaña", duracion: 60, unidad: "min", desc: "Ritmo fuerte.", estructura: "60' desnivel", sensacion: "Muy exigente", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo variable", duracion: 60, unidad: "min", desc: "Alterna ritmos.", estructura: "60' cambios", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo sendero largo", duracion: 65, unidad: "min", desc: "Ritmo sostenido en sendero.", estructura: "10' calentamiento + 45' Z3 + 10' enfriamiento", sensacion: "Resistencia", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo progresivo", duracion: 65, unidad: "min", desc: "Aumenta ritmo cada 7'.", estructura: "10' calentamiento + 7' Z3 + 7' Z4 + 7' Z3 + 7' Z4 + 7' enfriamiento", sensacion: "Progresivo", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo con cambios", duracion: 60, unidad: "min", desc: "Introduce 5 cambios.", estructura: "10' calentamiento + 40' tempo con cambios + 10' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo umbral sendero", duracion: 70, unidad: "min", desc: "Ritmo cerca del umbral.", estructura: "10' calentamiento + 50' Z3-Z4 + 10' enfriamiento", sensacion: "Exigente", tipo: "tempo", zona: "Z3-Z4" }
          ],
          largo: [
            { nombre: "Largo montaña", duracion: 105, unidad: "min", desc: "Mixto exigente.", estructura: "105' trail técnico", sensacion: "Resistencia", tipo: "largo", zona: "Z2" },
            { nombre: "Largo técnico", duracion: 110, unidad: "min", desc: "Alta técnica.", estructura: "110' trail técnico", sensacion: "Exigente", tipo: "largo", zona: "Z2" },
            { nombre: "Largo con desnivel", duracion: 115, unidad: "min", desc: "Acumulación.", estructura: "115' con desnivel", sensacion: "Preparación", tipo: "largo", zona: "Z2" },
            { nombre: "Largo progresivo", duracion: 110, unidad: "min", desc: "Aumenta ritmo en llano.", estructura: "75' Z2 + 35' Z3", sensacion: "Fuerte", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo específico", duracion: 120, unidad: "min", desc: "Incluye cambios.", estructura: "80' Z2 + 7x3' Z4 + 15' enfriamiento", sensacion: "Preparación", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo calidad", duracion: 125, unidad: "min", desc: "Progresión constante.", estructura: "85' Z2 + 40' Z3", sensacion: "Exigente", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo resistencia", duracion: 130, unidad: "min", desc: "Fondo largo en sendero.", estructura: "130' Z2", sensacion: "Resistencia", tipo: "largo", zona: "Z2" }
          ]
        },
        avanzado: {
          rodaje: [
            { nombre: "Rodaje técnico", duracion: 55, unidad: "min", desc: "Máxima técnica.", estructura: "55' técnico", sensacion: "Maestría", tipo: "rodaje", zona: "Z2" },
            { nombre: "Sendero avanzado", duracion: 60, unidad: "min", desc: "Técnica elite.", estructura: "60' técnico", sensacion: "Dominio", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje desnivel", duracion: 65, unidad: "min", desc: "Acumulación.", estructura: "65' con desnivel", sensacion: "Exigente", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de mantenimiento", duracion: 50, unidad: "min", desc: "Sesión para mantener forma.", estructura: "50' Z2", sensacion: "Cómodo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje con estímulos", duracion: 60, unidad: "min", desc: "Introduce 5 cambios.", estructura: "10' calentamiento + 5x(2' rápido + 3' suave) + 10' enfriamiento", sensacion: "Estimulante", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de recuperación", duracion: 45, unidad: "min", desc: "Después de sesión intensa.", estructura: "45' Z1-Z2", sensacion: "Muy suave", tipo: "rodaje", zona: "Z1" },
            { nombre: "Rodaje de base", duracion: 70, unidad: "min", desc: "Fondo para construir resistencia.", estructura: "70' Z2", sensacion: "Resistencia", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje progresivo", duracion: 65, unidad: "min", desc: "Aumenta ritmo cada 15'.", estructura: "15' Z2 + 20' Z2 medio + 30' Z2 alto", sensacion: "Progresivo", tipo: "rodaje", zona: "Z2" }
          ],
          series: [
            { nombre: "Cuestas fuertes", duracion: 60, unidad: "min", desc: "12x150m cuesta fuerte.", estructura: "15' calentamiento + 12 cuestas + 10' enfriamiento", sensacion: "Máxima potencia", tipo: "series", zona: "Z5" },
            { nombre: "Cuestas muy fuertes", duracion: 65, unidad: "min", desc: "10x200m cuesta fuerte.", estructura: "15' calentamiento + 10 cuestas + 10' enfriamiento", sensacion: "Exigente", tipo: "series", zona: "Z5" },
            { nombre: "Cuestas largas fuertes", duracion: 70, unidad: "min", desc: "8x250m cuesta fuerte.", estructura: "15' calentamiento + 8 cuestas + 10' enfriamiento", sensacion: "Máximo", tipo: "series", zona: "Z5" },
            { nombre: "Cuestas explosivas", duracion: 65, unidad: "min", desc: "16x120m cuesta fuerte.", estructura: "15' calentamiento + 16 cuestas + 5' enfriamiento", sensacion: "Explosivas", tipo: "series", zona: "Z5" },
            { nombre: "Cuestas variadas fuertes", duracion: 70, unidad: "min", desc: "10x(130m + 150m) cuesta fuerte.", estructura: "15' calentamiento + 10 series + 10' enfriamiento", sensacion: "Completo", tipo: "series", zona: "Z5" },
            { nombre: "Cuestas en escalera", duracion: 75, unidad: "min", desc: "7x(120m + 150m + 180m + 200m)", estructura: "15' calentamiento + 7 series + 10' enfriamiento", sensacion: "Muy exigente", tipo: "series", zona: "Z5" },
            { nombre: "Cuestas máximas", duracion: 80, unidad: "min", desc: "6x350m cuesta fuerte.", estructura: "15' calentamiento + 6 cuestas + 10' enfriamiento", sensacion: "Máximo", tipo: "series", zona: "Z5" }
          ],
          tempo: [
            { nombre: "Tempo montaña", duracion: 60, unidad: "min", desc: "Ritmo fuerte.", estructura: "60' desnivel intenso", sensacion: "Exigente", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo fuerte", duracion: 65, unidad: "min", desc: "Máxima intensidad.", estructura: "65' desnivel intenso", sensacion: "Muy exigente", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo variable", duracion: 65, unidad: "min", desc: "Cambios constantes.", estructura: "65' cambios", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo sendero largo", duracion: 70, unidad: "min", desc: "Ritmo sostenido en sendero.", estructura: "10' calentamiento + 50' Z3 + 10' enfriamiento", sensacion: "Resistencia", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo progresivo", duracion: 70, unidad: "min", desc: "Aumenta ritmo cada 5'.", estructura: "10' calentamiento + 5' Z3 + 5' Z4 + 5' Z3 + 5' Z4 + 5' enfriamiento", sensacion: "Progresivo", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo con cambios", duracion: 65, unidad: "min", desc: "Introduce 6 cambios.", estructura: "10' calentamiento + 45' tempo con cambios + 10' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo umbral sendero", duracion: 75, unidad: "min", desc: "Ritmo cerca del umbral.", estructura: "10' calentamiento + 55' Z3-Z4 + 10' enfriamiento", sensacion: "Exigente", tipo: "tempo", zona: "Z3-Z4" }
          ],
          largo: [
            { nombre: "Largo trail", duracion: 135, unidad: "min", desc: "Simulación.", estructura: "135' trail", sensacion: "Preparación", tipo: "largo", zona: "Z2" },
            { nombre: "Largo avanzado", duracion: 145, unidad: "min", desc: "Alto volumen.", estructura: "145' trail técnico", sensacion: "Exigente", tipo: "largo", zona: "Z2" },
            { nombre: "Largo ultra", duracion: 155, unidad: "min", desc: "Preparación ultra.", estructura: "155' trail", sensacion: "Resistencia", tipo: "largo", zona: "Z2" },
            { nombre: "Largo progresivo", duracion: 140, unidad: "min", desc: "Aumenta ritmo en llano.", estructura: "95' Z2 + 45' Z3", sensacion: "Fuerte", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo específico", duracion: 150, unidad: "min", desc: "Incluye cambios.", estructura: "100' Z2 + 8x3' Z4 + 20' enfriamiento", sensacion: "Preparación", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo calidad", duracion: 160, unidad: "min", desc: "Progresión constante.", estructura: "105' Z2 + 55' Z3", sensacion: "Exigente", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo resistencia", duracion: 165, unidad: "min", desc: "Fondo largo en sendero.", estructura: "165' Z2", sensacion: "Resistencia", tipo: "largo", zona: "Z2" }
          ]
        }
      },
      "maraton": {
        principiante: {
          rodaje: [
            { nombre: "Rodaje maratón trail", duracion: 50, unidad: "min", desc: "Terreno irregular.", estructura: "50' Z2 sendero", sensacion: "Adaptación", tipo: "rodaje", zona: "Z2" },
            { nombre: "Sendero maratón", duracion: 55, unidad: "min", desc: "Sendero continuo.", estructura: "55' sendero", sensacion: "Cómodo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Sendero progresivo", duracion: 55, unidad: "min", desc: "Aumenta ritmo.", estructura: "55' progresivo", sensacion: "Progresivo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Sendero de recuperación", duracion: 45, unidad: "min", desc: "Sesión muy suave en sendero.", estructura: "45' Z1-Z2", sensacion: "Muy fácil", tipo: "rodaje", zona: "Z1" },
            { nombre: "Sendero matinal", duracion: 50, unidad: "min", desc: "Despertar suave en sendero.", estructura: "50' Z2", sensacion: "Refrescante", tipo: "rodaje", zona: "Z2" },
            { nombre: "Sendero con cambios", duracion: 55, unidad: "min", desc: "Introduce cambios de ritmo.", estructura: "10' calentamiento + 40' con cambios + 5' enfriamiento", sensacion: "Dinámico", tipo: "rodaje", zona: "Z2" },
            { nombre: "Sendero base", duracion: 60, unidad: "min", desc: "Fondo para construir resistencia.", estructura: "60' Z2", sensacion: "Resistencia", tipo: "rodaje", zona: "Z2" },
            { nombre: "Sendero regenerativo", duracion: 45, unidad: "min", desc: "Después de sesión dura.", estructura: "45' Z1", sensacion: "Muy suave", tipo: "rodaje", zona: "Z1" }
          ],
          series: [
            { nombre: "Cuestas maratón", duracion: 55, unidad: "min", desc: "8x100m cuesta suave.", estructura: "15' calentamiento + 8 cuestas + 10' enfriamiento", sensacion: "Potencia", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas cortas", duracion: 50, unidad: "min", desc: "9x80m cuesta suave.", estructura: "15' calentamiento + 9 cuestas + 5' enfriamiento", sensacion: "Rápidas", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas medias", duracion: 60, unidad: "min", desc: "7x120m cuesta media.", estructura: "15' calentamiento + 7 cuestas + 10' enfriamiento", sensacion: "Exigente", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas largas", duracion: 65, unidad: "min", desc: "6x150m cuesta media.", estructura: "15' calentamiento + 6 cuestas + 10' enfriamiento", sensacion: "Fuerte", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas repetidas", duracion: 60, unidad: "min", desc: "12x100m cuesta suave.", estructura: "15' calentamiento + 12 cuestas + 5' enfriamiento", sensacion: "Intenso", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas variadas", duracion: 65, unidad: "min", desc: "8x(90m + 110m) cuesta media.", estructura: "15' calentamiento + 8 series + 10' enfriamiento", sensacion: "Completo", tipo: "series", zona: "Z4" },
            { nombre: "Cuestas explosivas", duracion: 55, unidad: "min", desc: "16x80m cuesta suave.", estructura: "15' calentamiento + 16 cuestas + 5' enfriamiento", sensacion: "Explosivas", tipo: "series", zona: "Z5" }
          ],
          tempo: [
            { nombre: "Tempo sendero", duracion: 55, unidad: "min", desc: "Ritmo sostenido.", estructura: "55' Z3 sendero", sensacion: "Control", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo desnivel", duracion: 60, unidad: "min", desc: "Con desnivel suave.", estructura: "60' Z3 con desnivel", sensacion: "Exigente", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo progresivo", duracion: 60, unidad: "min", desc: "Aumenta ritmo.", estructura: "60' progresivo", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo sendero largo", duracion: 65, unidad: "min", desc: "Ritmo sostenido en sendero.", estructura: "10' calentamiento + 45' Z3 + 10' enfriamiento", sensacion: "Resistencia", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo variable", duracion: 60, unidad: "min", desc: "Alterna llano y cuestas.", estructura: "10' calentamiento + 40' con cambios + 10' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo con cambios", duracion: 65, unidad: "min", desc: "Introduce 4 cambios.", estructura: "10' calentamiento + 45' tempo con cambios + 10' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo sendero umbral", duracion: 70, unidad: "min", desc: "Ritmo cerca del umbral.", estructura: "10' calentamiento + 50' Z3-Z4 + 10' enfriamiento", sensacion: "Exigente", tipo: "tempo", zona: "Z3-Z4" }
          ],
          largo: [
            { nombre: "Largo sendero", duracion: 100, unidad: "min", desc: "Resistencia.", estructura: "100' Z2 sendero", sensacion: "Base", tipo: "largo", zona: "Z2" },
            { nombre: "Largo montaña suave", duracion: 105, unidad: "min", desc: "Sendero continuo.", estructura: "105' sendero", sensacion: "Resistencia", tipo: "largo", zona: "Z2" },
            { nombre: "Largo con desnivel", duracion: 110, unidad: "min", desc: "Incluye desnivel.", estructura: "110' con desnivel", sensacion: "Exigente", tipo: "largo", zona: "Z2" },
            { nombre: "Largo progresivo", duracion: 105, unidad: "min", desc: "Aumenta ritmo en llano.", estructura: "70' Z2 + 35' Z3", sensacion: "Fuerte", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo específico", duracion: 115, unidad: "min", desc: "Incluye cambios.", estructura: "75' Z2 + 6x3' Z4 + 15' enfriamiento", sensacion: "Preparación", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo calidad", duracion: 120, unidad: "min", desc: "Progresión constante.", estructura: "80' Z2 + 40' Z3", sensacion: "Exigente", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo resistencia", duracion: 125, unidad: "min", desc: "Fondo largo en sendero.", estructura: "125' Z2", sensacion: "Resistencia", tipo: "largo", zona: "Z2" }
          ]
        },
        intermedio: {
          rodaje: [
            { nombre: "Rodaje técnico", duracion: 55, unidad: "min", desc: "Técnica avanzada.", estructura: "55' técnico", sensacion: "Coordinación", tipo: "rodaje", zona: "Z2" },
            { nombre: "Sendero técnico", duracion: 60, unidad: "min", desc: "Técnica superior.", estructura: "60' técnico", sensacion: "Maestría", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje montaña", duracion: 65, unidad: "min", desc: "Terreno variado.", estructura: "65' sendero variado", sensacion: "Resistencia", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de mantenimiento", duracion: 50, unidad: "min", desc: "Sesión para mantener forma.", estructura: "50' Z2", sensacion: "Cómodo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje con estímulos", duracion: 60, unidad: "min", desc: "Introduce 4 cambios.", estructura: "10' calentamiento + 4x(2' rápido + 3' suave) + 10' enfriamiento", sensacion: "Estimulante", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de recuperación", duracion: 45, unidad: "min", desc: "Después de sesión intensa.", estructura: "45' Z1-Z2", sensacion: "Muy suave", tipo: "rodaje", zona: "Z1" },
            { nombre: "Rodaje de base", duracion: 70, unidad: "min", desc: "Fondo para construir resistencia.", estructura: "70' Z2", sensacion: "Resistencia", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje progresivo", duracion: 65, unidad: "min", desc: "Aumenta ritmo cada 15'.", estructura: "15' Z2 + 20' Z2 medio + 30' Z2 alto", sensacion: "Progresivo", tipo: "rodaje", zona: "Z2" }
          ],
          series: [
            { nombre: "Series 1600m", duracion: 60, unidad: "min", desc: "5x1600m con recuperación.", estructura: "15' calentamiento + 5x1600m + 10' enfriamiento", sensacion: "Intensidad", tipo: "series", zona: "Z4" },
            { nombre: "Series 2000m", duracion: 65, unidad: "min", desc: "4x2000m con recuperación 3'30.", estructura: "15' calentamiento + 4x2000m + 10' enfriamiento", sensacion: "Exigente", tipo: "series", zona: "Z4" },
            { nombre: "Pirámide maratón", duracion: 70, unidad: "min", desc: "800-1600-2400-3200-2400-1600-800m.", estructura: "15' calentamiento + pirámide + 10' enfriamiento", sensacion: "Completo", tipo: "series", zona: "Z4-Z5" },
            { nombre: "Series 3000m", duracion: 75, unidad: "min", desc: "3x3000m con recuperación 4'.", estructura: "15' calentamiento + 3x3000m + 10' enfriamiento", sensacion: "Fuerte", tipo: "series", zona: "Z5" },
            { nombre: "Series 1000m", duracion: 65, unidad: "min", desc: "8x1000m con recuperación 2'.", estructura: "15' calentamiento + 8x1000m + 10' enfriamiento", sensacion: "Intenso", tipo: "series", zona: "Z4" },
            { nombre: "Fartlek avanzado", duracion: 60, unidad: "min", desc: "Juega con ritmos.", estructura: "10' calentamiento + 35' fartlek + 15' enfriamiento", sensacion: "Divertido", tipo: "series", zona: "Z4" },
            { nombre: "Series 800m", duracion: 70, unidad: "min", desc: "12x800m con recuperación 1'30.", estructura: "15' calentamiento + 12x800m + 10' enfriamiento", sensacion: "Intenso", tipo: "series", zona: "Z4" }
          ],
          tempo: [
            { nombre: "Tempo umbral maratón", duracion: 55, unidad: "min", desc: "35' a ritmo umbral.", estructura: "10' calentamiento + 35' umbral + 10' enfriamiento", sensacion: "Exigente", tipo: "tempo", zona: "Z4" },
            { nombre: "Tempo maratón", duracion: 60, unidad: "min", desc: "40' a ritmo umbral.", estructura: "10' calentamiento + 40' Z4 + 10' enfriamiento", sensacion: "Sostenido", tipo: "tempo", zona: "Z4" },
            { nombre: "Tempo variable", duracion: 60, unidad: "min", desc: "Alterna 8' Z3 / 3' Z4.", estructura: "10' calentamiento + 4x(8' Z3 + 3' Z4) + 5' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo largo", duracion: 65, unidad: "min", desc: "45' a ritmo tempo.", estructura: "10' calentamiento + 45' Z3 + 10' enfriamiento", sensacion: "Resistencia", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo progresivo", duracion: 65, unidad: "min", desc: "Aumenta cada 6'.", estructura: "10' calentamiento + 6' Z3 + 6' Z4 + 6' Z3 + 6' Z4 + 6' enfriamiento", sensacion: "Progresivo", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo con cambios", duracion: 60, unidad: "min", desc: "Introduce 5 cambios.", estructura: "10' calentamiento + 40' tempo con cambios + 10' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo umbral largo", duracion: 70, unidad: "min", desc: "50' a ritmo umbral.", estructura: "10' calentamiento + 50' Z4 + 10' enfriamiento", sensacion: "Muy exigente", tipo: "tempo", zona: "Z4" }
          ],
          largo: [
            { nombre: "Largo calidad maratón", duracion: 120, unidad: "min", desc: "Progresión últimos 40'.", estructura: "80' Z2 + 40' Z3", sensacion: "Fuerte", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo con cambios", duracion: 130, unidad: "min", desc: "Incluye series.", estructura: "90' Z2 + 8x3' Z4 + 16' enfriamiento", sensacion: "Exigente", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo progresivo", duracion: 140, unidad: "min", desc: "Aumenta ritmo cada 40'.", estructura: "60' Z2 + 40' Z3 + 40' Z2", sensacion: "Controlado", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo específico", duracion: 150, unidad: "min", desc: "Incluye cambios.", estructura: "100' Z2 + 8x3' Z4 + 20' enfriamiento", sensacion: "Preparación", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo fondo", duracion: 160, unidad: "min", desc: "Fondo largo continuo.", estructura: "160' Z2", sensacion: "Resistencia", tipo: "largo", zona: "Z2" },
            { nombre: "Largo resistencia", duracion: 170, unidad: "min", desc: "Fondo largo con cambios.", estructura: "120' Z2 + 50' Z3", sensacion: "Resistencia", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo con series", duracion: 180, unidad: "min", desc: "Incluye series largas.", estructura: "120' Z2 + 8x1000m Z4 + 20' enfriamiento", sensacion: "Exigente", tipo: "largo", zona: "Z2-Z4" }
          ]
        },
        avanzado: {
          rodaje: [
            { nombre: "Rodaje alto maratón", duracion: 60, unidad: "min", desc: "Ritmo exigente Z2.", estructura: "60' Z2 alto", sensacion: "Exigente", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje activo", duracion: 65, unidad: "min", desc: "Ritmo vivo.", estructura: "65' Z2 vivo", sensacion: "Sostenible", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje técnico", duracion: 70, unidad: "min", desc: "Enfoque técnico.", estructura: "70' Z2 cadencia alta", sensacion: "Eficiente", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de mantenimiento", duracion: 55, unidad: "min", desc: "Sesión para mantener forma.", estructura: "55' Z2", sensacion: "Cómodo", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje con estímulos", duracion: 65, unidad: "min", desc: "Introduce 5 cambios.", estructura: "10' calentamiento + 5x(2' rápido + 3' suave) + 10' enfriamiento", sensacion: "Estimulante", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje de recuperación", duracion: 50, unidad: "min", desc: "Después de sesión intensa.", estructura: "50' Z1-Z2", sensacion: "Muy suave", tipo: "rodaje", zona: "Z1" },
            { nombre: "Rodaje de base", duracion: 75, unidad: "min", desc: "Fondo para construir resistencia.", estructura: "75' Z2", sensacion: "Resistencia", tipo: "rodaje", zona: "Z2" },
            { nombre: "Rodaje progresivo", duracion: 70, unidad: "min", desc: "Aumenta ritmo cada 15'.", estructura: "15' Z2 + 20' Z2 medio + 35' Z2 alto", sensacion: "Progresivo", tipo: "rodaje", zona: "Z2" }
          ],
          series: [
            { nombre: "Series 3000m", duracion: 70, unidad: "min", desc: "4x3000m con recuperación.", estructura: "15' calentamiento + 4x3000m + 10' enfriamiento", sensacion: "Muy intenso", tipo: "series", zona: "Z5" },
            { nombre: "Series 5000m", duracion: 75, unidad: "min", desc: "3x5000m con recuperación 5'.", estructura: "15' calentamiento + 3x5000m + 10' enfriamiento", sensacion: "Exigente", tipo: "series", zona: "Z5" },
            { nombre: "Series 10000m", duracion: 80, unidad: "min", desc: "2x10000m con recuperación 6'.", estructura: "15' calentamiento + 2x10000m + 10' enfriamiento", sensacion: "Máximo", tipo: "series", zona: "Z5" },
            { nombre: "Series 2000m", duracion: 70, unidad: "min", desc: "6x2000m con recuperación 2'30.", estructura: "15' calentamiento + 6x2000m + 10' enfriamiento", sensacion: "Intenso", tipo: "series", zona: "Z5" },
            { nombre: "Pirámide larga", duracion: 80, unidad: "min", desc: "2000-3000-5000-3000-2000m.", estructura: "15' calentamiento + pirámide + 10' enfriamiento", sensacion: "Completo", tipo: "series", zona: "Z5" },
            { nombre: "Fartlek avanzado", duracion: 70, unidad: "min", desc: "Juega con ritmos intensos.", estructura: "10' calentamiento + 45' fartlek + 15' enfriamiento", sensacion: "Divertido", tipo: "series", zona: "Z5" },
            { nombre: "Series 1600m", duracion: 75, unidad: "min", desc: "10x1600m con recuperación 2'.", estructura: "15' calentamiento + 10x1600m + 10' enfriamiento", sensacion: "Intenso", tipo: "series", zona: "Z5" }
          ],
          tempo: [
            { nombre: "Tempo maratón avanzado", duracion: 60, unidad: "min", desc: "45' a ritmo maratón.", estructura: "10' calentamiento + 45' Z4 + 5' enfriamiento", sensacion: "Ritmo carrera", tipo: "tempo", zona: "Z4" },
            { nombre: "Tempo umbral", duracion: 65, unidad: "min", desc: "50' a ritmo umbral.", estructura: "10' calentamiento + 50' Z4 + 5' enfriamiento", sensacion: "Exigente", tipo: "tempo", zona: "Z4" },
            { nombre: "Tempo variable", duracion: 65, unidad: "min", desc: "Alterna 7' Z3 / 3' Z4.", estructura: "10' calentamiento + 5x(7' Z3 + 3' Z4) + 5' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo largo", duracion: 70, unidad: "min", desc: "55' a ritmo tempo.", estructura: "10' calentamiento + 55' Z3 + 5' enfriamiento", sensacion: "Resistencia", tipo: "tempo", zona: "Z3" },
            { nombre: "Tempo progresivo", duracion: 70, unidad: "min", desc: "Aumenta cada 5'.", estructura: "10' calentamiento + 5' Z3 + 5' Z4 + 5' Z3 + 5' Z4 + 5' enfriamiento", sensacion: "Progresivo", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo con cambios", duracion: 65, unidad: "min", desc: "Introduce 6 cambios.", estructura: "10' calentamiento + 45' tempo con cambios + 10' enfriamiento", sensacion: "Dinámico", tipo: "tempo", zona: "Z3-Z4" },
            { nombre: "Tempo umbral largo", duracion: 75, unidad: "min", desc: "60' a ritmo umbral.", estructura: "10' calentamiento + 60' Z4 + 5' enfriamiento", sensacion: "Muy exigente", tipo: "tempo", zona: "Z4" }
          ],
          largo: [
            { nombre: "Largo específico maratón", duracion: 150, unidad: "min", desc: "Cambios a ritmo maratón.", estructura: "90' Z2 + 8x5' Z4 + 20' enfriamiento", sensacion: "Preparación", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo calidad", duracion: 160, unidad: "min", desc: "Progresión constante.", estructura: "100' Z2 + 60' Z3", sensacion: "Fuerte", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo con series", duracion: 170, unidad: "min", desc: "Series largas.", estructura: "110' Z2 + 6x1000m Z4 + 20' enfriamiento", sensacion: "Exigente", tipo: "largo", zona: "Z2-Z4" },
            { nombre: "Largo progresivo", duracion: 180, unidad: "min", desc: "Aumenta ritmo cada 40'.", estructura: "80' Z2 + 50' Z3 + 50' Z2", sensacion: "Controlado", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo fondo", duracion: 190, unidad: "min", desc: "Fondo largo continuo.", estructura: "190' Z2", sensacion: "Resistencia", tipo: "largo", zona: "Z2" },
            { nombre: "Largo resistencia", duracion: 200, unidad: "min", desc: "Fondo largo con cambios.", estructura: "140' Z2 + 60' Z3", sensacion: "Resistencia", tipo: "largo", zona: "Z2-Z3" },
            { nombre: "Largo ultradistancia", duracion: 210, unidad: "min", desc: "Preparación para maratón.", estructura: "150' Z2 + 60' Z3", sensacion: "Preparación", tipo: "largo", zona: "Z2-Z3" }
          ]
        }
      }
    }
  },

  toggleCuestionario() {
    if (!AppState.zonasCalculadas) {
      Utils.showToast("> CALCULA ZONAS PRIMERO_", 'error');
      return;
    }
    if (!AppState.isPremium) {
      Utils.showToast("> SOLO USUARIOS PREMIUM PUEDEN CREAR PLANES_", 'error');
      return;
    }

    const q = document.getElementById("cuestionarioEntreno");
    q.style.display = q.style.display === "block" ? "none" : "block";

    if (q.style.display === "block") {
      setTimeout(() => q.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  },

  async guardarPlanActual() {
    if (!AppState.currentUid || !AppState.planGeneradoActual) return;
    await Storage.setUltimoPlan(AppState.currentUid, AppState.planGeneradoActual);
  },

  async mostrarUltimoPlanGuardado() {
    if (!AppState.currentUid) {
      Utils.showToast("> NO HAY USUARIO_", 'error');
      return;
    }
    if (!AppState.isPremium) {
      Utils.showToast("> SOLO USUARIOS PREMIUM PUEDEN VER PLANES_", 'error');
      return;
    }

    const stored = await Storage.getUltimoPlan(AppState.currentUid);
    if (!stored) {
      Utils.showToast("> NO HAY PLAN GUARDADO_", 'error');
      return;
    }

    AppState.ultimoPlanParams = stored;

    document.getElementById("modalidad").value = stored.modalidad;
    document.getElementById("distObjetivo").value = stored.distancia;
    document.getElementById("duracionPlan").value = stored.macrociclo / 4;

    const diasGuardados = stored.diasEntreno || [4, 6];
    for (let i = 1; i <= 7; i++) {
      const cb = document.getElementById(`dia${i}`);
      if (cb) cb.checked = diasGuardados.includes(i);
    }

    document.getElementById("nivel").value = stored.nivel;
    document.getElementById("experienciaDistancia").value = stored.experiencia || "no";
    document.getElementById("objetivoPrincipal").value = stored.objetivo || "mejorar";
    document.getElementById("diaLargo").value = stored.diaLargo;
    document.getElementById("fechaInicio").value = stored.fechaInicio || new Date().toISOString().split('T')[0];

    document.getElementById("cuestionarioEntreno").style.display = "none";
    document.getElementById("calendarioEntreno").style.display = "block";
    this.generarCalendarioEntreno();
  },

  async borrarPlanGuardado() {
    if (!AppState.currentUid) return;

    const confirmed = await Utils.confirm('ELIMINAR PLAN', "> ¿ELIMINAR PLAN GUARDADO?_");
    if (!confirmed) return;

    await Storage.removeUltimoPlan(AppState.currentUid);
    document.getElementById("calendarioEntreno").style.display = "none";
    document.getElementById("cuestionarioEntreno").style.display = "block";
    AppState.planGeneradoActual = null;
    AppState.planActualId = null;
    AppState.sesionesRealizadas = {};

    Utils.showToast("✅ PLAN ELIMINADO", 'success');
    UI.guardarEstado();
  },

  getRitmoPorZona(z) {
    if (!AppState.lastRitmoBase) return "Calcula zonas primero";

    const f = { 'Z1': 1.35, 'Z2': 1.25, 'Z3': 1.15, 'Z4': 1.05, 'Z5': 0.95, 'Z6': 0.85 };

    if (z.includes('-')) {
      const [a, b] = z.split('-');
      return `${Utils.formatR(AppState.lastRitmoBase * (f[a] || 1.15))} – ${Utils.formatR(AppState.lastRitmoBase * (f[b] || 1.05))} min/km`;
    }

    return Utils.formatR(AppState.lastRitmoBase * (f[z] || 1.15)) + " min/km";
  },

  validarOpcionesPlan() {
    const duracion = document.getElementById('duracionPlan').value;
    const experiencia = document.getElementById('experienciaDistancia').value;
    const distSelect = document.getElementById('distObjetivo');
    const opciones = distSelect.options;
    const infoDiv = document.getElementById('info-mensaje-distancia');
    const generarBtn = document.getElementById('generarPlanBtn');

    let mostrarMensaje = false;
    let habilitarBtn = true;

    for (let i = 0; i < opciones.length; i++) {
      if (opciones[i].value === 'medio' || opciones[i].value === 'maraton') {
        if (duracion === '3' && experiencia === 'si') {
          opciones[i].disabled = false;
        } else {
          opciones[i].disabled = true;
          if (distSelect.value === opciones[i].value) {
            distSelect.value = '10k';
          }
          mostrarMensaje = true;
          habilitarBtn = false;
        }
      } else {
        opciones[i].disabled = false;
      }
    }

    infoDiv.style.display = mostrarMensaje ? 'block' : 'none';
    generarBtn.disabled = !habilitarBtn;
  },

  generarCalendarioEntreno() {
    if (!AppState.zonasCalculadas) {
      Utils.showToast("> PRIMERO CALCULA TUS ZONAS_", 'error');
      return;
    }
    if (!AppState.isPremium) {
      Utils.showToast("> SOLO USUARIOS PREMIUM PUEDEN GENERAR PLANES_", 'error');
      return;
    }

    const distancia = document.getElementById("distObjetivo").value;
    const duracion = parseInt(document.getElementById("duracionPlan").value);
    const experiencia = document.getElementById("experienciaDistancia").value;

    if (distancia === 'medio' || distancia === 'maraton') {
      if (!(duracion === 3 && experiencia === 'si')) {
        Utils.showToast("❌ Los planes de Media Maratón y Maratón solo están disponibles con 3 meses de duración y experiencia previa en la distancia.", 'error');
        return;
      }
    }

    setTimeout(() => {
      try {
        const modalidad = document.getElementById("modalidad").value;
        const meses = duracion;
        const nivel = document.getElementById("nivel").value;
        const exp = experiencia;
        const obj = document.getElementById("objetivoPrincipal").value;
        const diaLargo = parseInt(document.getElementById("diaLargo").value);
        const fechaInicio = document.getElementById("fechaInicio").value;

        if (!fechaInicio) {
          Utils.showToast("> SELECCIONA UNA FECHA DE INICIO_", 'error');
          return;
        }

        const diasEntreno = [];
        for (let i = 1; i <= 7; i++) {
          const cb = document.getElementById(`dia${i}`);
          if (cb && cb.checked) diasEntreno.push(i);
        }

        if (diasEntreno.length === 0) {
          Utils.showToast("> SELECCIONA AL MENOS UN DÍA DE ENTRENO_", 'error');
          return;
        }

        if (!diasEntreno.includes(diaLargo)) {
          if (confirm("> El día de tirada larga no está seleccionado. ¿Añadirlo automáticamente?")) {
            diasEntreno.push(diaLargo);
            document.getElementById(`dia${diaLargo}`).checked = true;
          } else {
            return;
          }
        }

        diasEntreno.sort((a, b) => a - b);

        const fecha = new Date(fechaInicio + "T00:00:00");
        const macrociclo = meses * 4;
        const mapa = { "2k": "2 km", "5k": "5 km", "10k": "10 km", "medio": "MEDIA", "maraton": "MARATÓN" };
        const diaNombre = ["", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"][diaLargo];

        document.getElementById("resumenObjetivo").innerText =
          `${mapa[distancia]} · ${diasEntreno.length} DÍAS/SEM · ${nivel.toUpperCase()} · ${exp === 'si' ? 'CON EXPERIENCIA' : 'PRIMERA VEZ'} · ${obj === 'acabar' ? 'OBJ: TERMINAR' : obj === 'mejorar' ? 'OBJ: MEJORAR' : 'OBJ: COMPETIR'} · LARGO: ${diaNombre} · ${modalidad === 'runner' ? 'ASFALTO' : 'MONTAÑA'} · ${meses} MES(ES) · INICIO: ${fecha.toLocaleDateString()}`;

        const totalDias = macrociclo * 7;
        const sesiones = [];

        const esAnual = meses === 12;
        const fases = esAnual ? ['base', 'construccion', 'pico', 'descanso'] : ['unica'];

        for (let dia = 1; dia <= totalDias; dia++) {
          const semana = Math.floor((dia - 1) / 7);
          const diaSem = (dia - 1) % 7 + 1;
          let color = "sesion-descanso", breve = "D", detalle = null;

          if (diasEntreno.includes(diaSem)) {
            let fase = 'unica';
            if (esAnual) {
              const semanasTotales = totalDias / 7;
              const semanaRelativa = semana;
              if (semanaRelativa < semanasTotales / 4) fase = 'base';
              else if (semanaRelativa < semanasTotales / 2) fase = 'construccion';
              else if (semanaRelativa < 3 * semanasTotales / 4) fase = 'pico';
              else fase = 'descanso';
            }

            let tipo = 'rodaje';
            if (diaSem === diaLargo) {
              tipo = 'largo';
            } else {
              const indice = diasEntreno.indexOf(diaSem);
              if (fase === 'base') {
                if (indice % 2 === 0) tipo = 'rodaje';
                else tipo = 'tempo';
              } else if (fase === 'construccion') {
                if (indice % 3 === 0) tipo = 'series';
                else if (indice % 3 === 1) tipo = 'tempo';
                else tipo = 'rodaje';
              } else if (fase === 'pico') {
                if (indice % 2 === 0) tipo = 'series';
                else tipo = 'tempo';
              } else if (fase === 'descanso') {
                tipo = 'rodaje';
              }
            }

            if (obj === 'competir') {
              if (tipo === 'rodaje' && Math.random() > 0.7) tipo = 'series';
            } else if (obj === 'acabar') {
              if (tipo !== 'rodaje' && Math.random() > 0.7) tipo = 'rodaje';
            }

            const esDescarga = (semana + 1) % 4 === 0;
            let factorPersonal = 1.0;
            if (AppState.lastRitmoBase) {
              const ritmoRef = 5.0;
              factorPersonal = Math.min(1.2, Math.max(0.8, ritmoRef / AppState.lastRitmoBase));
            }
            if (esDescarga) factorPersonal *= 0.8;

            let opts = [];
            if (tipo === 'largo') opts = this.ENTRENAMIENTOS_DB[modalidad]?.[distancia]?.[nivel]?.largo || [];
            else if (tipo === 'series') opts = this.ENTRENAMIENTOS_DB[modalidad]?.[distancia]?.[nivel]?.series || [];
            else if (tipo === 'tempo') opts = this.ENTRENAMIENTOS_DB[modalidad]?.[distancia]?.[nivel]?.tempo || [];
            else opts = this.ENTRENAMIENTOS_DB[modalidad]?.[distancia]?.[nivel]?.rodaje || [];

            if (opts.length) {
              const idxAleatorio = Math.floor(Math.random() * opts.length);
              const optOriginal = opts[idxAleatorio];
              detalle = { ...optOriginal, tipo };
              detalle.duracion = Math.round(detalle.duracion * factorPersonal);

              if (tipo === 'largo') { color = "sesion-largo"; breve = "L"; }
              else if (tipo === 'series') { color = "sesion-series"; breve = "S"; }
              else if (tipo === 'tempo') { color = "sesion-tempo"; breve = "T"; }
              else { color = "sesion-rodaje"; breve = "R"; }
            }
          }

          sesiones.push({ color, breve, detalle, semana: semana + 1 });
        }

        const planId = Date.now().toString();
        const planCompleto = {
          params: {
            modalidad, distancia, macrociclo,
            diasPorSemana: diasEntreno.length,
            nivel, experiencia: exp, objetivo: obj,
            diaLargo, fechaInicio, diasEntreno
          },
          sesiones: sesiones,
          resumen: document.getElementById("resumenObjetivo").innerText,
          realizadas: {}
        };

        AppState.planGeneradoActual = planCompleto.params;
        AppState.planActualId = planId;
        AppState.sesionesRealizadas = {};
        AppState.trimestreActual = 0;

        document.getElementById("calendarioEntreno").style.display = "block";
        document.getElementById("cuestionarioEntreno").style.display = "none";
        UI.mostrarCalendario(sesiones);

        this.guardarPlanActual();
        UI.guardarPlanEnHistorial(planCompleto.params, planCompleto);
        UI.guardarEstado();

        Utils.vibrate(50);
        Utils.playSound('success');
        Utils.showToast('✅ Plan generado', 'success');

      } catch (e) {
        console.error(e);
        Utils.showToast("> ERROR GENERANDO PLAN_", 'error');
      }
    }, 300);
  }
}; // AÑADE TU MATRIZ AQUÍ
  toggleCuestionario() { if(!AppState.zonasCalculadas){ Utils.showToast("> CALCULA ZONAS PRIMERO_",'error'); return; } if(!AppState.isPremium){ Utils.showToast("> SOLO PREMIUM PUEDEN CREAR PLANES_",'error'); return; } const q=document.getElementById("cuestionarioEntreno"); q.style.display=q.style.display==="block"?"none":"block"; if(q.style.display==="block") setTimeout(()=>q.scrollIntoView({behavior:'smooth',block:'start'}),100); },
  async guardarPlanActual() { if(!AppState.currentUid||!AppState.planGeneradoActual) return; await Storage.setUltimoPlan(AppState.currentUid,AppState.planGeneradoActual); },
  async mostrarUltimoPlanGuardado() { if(!AppState.currentUid){ Utils.showToast("> NO HAY USUARIO_",'error'); return; } if(!AppState.isPremium){ Utils.showToast("> SOLO PREMIUM PUEDEN VER PLANES_",'error'); return; } const s=await Storage.getUltimoPlan(AppState.currentUid); if(!s){ Utils.showToast("> NO HAY PLAN GUARDADO_",'error'); return; } AppState.ultimoPlanParams=s; document.getElementById("modalidad").value=s.modalidad; document.getElementById("distObjetivo").value=s.distancia; document.getElementById("duracionPlan").value=s.macrociclo/4; const dg=s.diasEntreno||[4,6]; for(let i=1;i<=7;i++){ const cb=document.getElementById(`dia${i}`); if(cb) cb.checked=dg.includes(i); } document.getElementById("nivel").value=s.nivel; document.getElementById("experienciaDistancia").value=s.experiencia||"no"; document.getElementById("objetivoPrincipal").value=s.objetivo||"mejorar"; document.getElementById("diaLargo").value=s.diaLargo; document.getElementById("fechaInicio").value=s.fechaInicio||new Date().toISOString().split('T')[0]; document.getElementById("cuestionarioEntreno").style.display="none"; document.getElementById("calendarioEntreno").style.display="block"; this.generarCalendarioEntreno(); },
  async borrarPlanGuardado() { if(!AppState.currentUid) return; if(!await Utils.confirm('ELIMINAR',"¿Eliminar plan?")) return; await Storage.removeUltimoPlan(AppState.currentUid); document.getElementById("calendarioEntreno").style.display="none"; document.getElementById("cuestionarioEntreno").style.display="block"; AppState.planGeneradoActual=null; AppState.planActualId=null; AppState.sesionesRealizadas={}; Utils.showToast("✅ PLAN ELIMINADO",'success'); UI.guardarEstado(); },
  getRitmoPorZona(z) { if(!AppState.lastRitmoBase) return "Calcula zonas primero"; const f={'Z1':1.35,'Z2':1.25,'Z3':1.15,'Z4':1.05,'Z5':0.95,'Z6':0.85}; if(z.includes('-')){ const [a,b]=z.split('-'); return `${Utils.formatR(AppState.lastRitmoBase*(f[a]||1.15))} – ${Utils.formatR(AppState.lastRitmoBase*(f[b]||1.05))} min/km`; } return Utils.formatR(AppState.lastRitmoBase*(f[z]||1.15))+" min/km"; },
  validarOpcionesPlan() { const d=document.getElementById('duracionPlan').value, e=document.getElementById('experienciaDistancia').value, ds=document.getElementById('distObjetivo'), op=ds.options, id=document.getElementById('info-mensaje-distancia'), g=document.getElementById('generarPlanBtn'); let m=false, h=true; for(let i=0;i<op.length;i++){ if(op[i].value==='medio'||op[i].value==='maraton'){ if(d==='12'){ op[i].disabled=false; }else if(d==='3'&&e==='si'){ op[i].disabled=false; }else{ op[i].disabled=true; if(ds.value===op[i].value) ds.value='10k'; m=true; h=false; } }else op[i].disabled=false; } id.style.display=m?'block':'none'; g.disabled=!h; },
  generarCalendarioEntreno() { if(!AppState.zonasCalculadas){ Utils.showToast("> PRIMERO CALCULA TUS ZONAS_",'error'); return; } if(!AppState.isPremium){ Utils.showToast("> SOLO PREMIUM PUEDEN GENERAR PLANES_",'error'); return; } const dist=document.getElementById("distObjetivo").value, dur=parseInt(document.getElementById("duracionPlan").value), exp=document.getElementById("experienciaDistancia").value; if(dist==='medio'||dist==='maraton'){ if(!(dur===12||(dur===3&&exp==='si'))){ Utils.showToast("❌ Media/Maratón: 12 meses o 3 meses con experiencia.",'error'); return; } } setTimeout(()=>{ try{ const mod=document.getElementById("modalidad").value, meses=dur, nivel=document.getElementById("nivel").value, obj=document.getElementById("objetivoPrincipal").value, dl=parseInt(document.getElementById("diaLargo").value), fi=document.getElementById("fechaInicio").value; if(!fi){ Utils.showToast("> SELECCIONA FECHA_",'error'); return; } const de=[]; for(let i=1;i<=7;i++){ const cb=document.getElementById(`dia${i}`); if(cb&&cb.checked) de.push(i); } if(de.length===0){ Utils.showToast("> SELECCIONA DÍAS_",'error'); return; } if(!de.includes(dl)){ if(confirm("¿Añadir día de tirada larga?")){ de.push(dl); document.getElementById(`dia${dl}`).checked=true; }else return; } de.sort((a,b)=>a-b); const fe=new Date(fi+"T00:00:00"), mc=meses*4, md={"2k":"2 km","5k":"5 km","10k":"10 km","medio":"MEDIA","maraton":"MARATÓN"}, dn=["","LUN","MAR","MIÉ","JUE","VIE","SÁB","DOM"][dl]; document.getElementById("resumenObjetivo").innerText=`${md[dist]} · ${de.length} DÍAS/SEM · ${nivel.toUpperCase()} · ${exp==='si'?'CON EXPERIENCIA':'PRIMERA VEZ'} · OBJ:${obj==='acabar'?'TERMINAR':obj==='mejorar'?'MEJORAR':'COMPETIR'} · LARGO:${dn} · ${mod==='runner'?'ASFALTO':'MONTAÑA'} · ${meses} MES(ES) · INICIO:${fe.toLocaleDateString()}`; const td=mc*7, sesiones=[]; const ea=meses===12; for(let d=1;d<=td;d++){ const s=Math.floor((d-1)/7), ds=(d-1)%7+1; let c="sesion-descanso", b="D", det=null; if(de.includes(ds)){ let fase='unica'; if(ea){ const st=td/7; if(s<st/4) fase='base'; else if(s<st/2) fase='construccion'; else if(s<3*st/4) fase='pico'; else fase='descanso'; } let tipo='rodaje'; if(ds===dl){ tipo='largo'; }else{ const idx=de.indexOf(ds); if(fase==='base') tipo=idx%2===0?'rodaje':'tempo'; else if(fase==='construccion'){ if(idx%3===0) tipo='series'; else if(idx%3===1) tipo='tempo'; else tipo='rodaje'; }else if(fase==='pico') tipo=idx%2===0?'series':'tempo'; else tipo='rodaje'; } if(obj==='competir'&&tipo==='rodaje'&&Math.random()>0.7) tipo='series'; else if(obj==='acabar'&&tipo!=='rodaje'&&Math.random()>0.7) tipo='rodaje'; const esDesc=(s+1)%4===0; let fp=1.0; if(AppState.lastRitmoBase){ const rr=5.0; fp=Math.min(1.2,Math.max(0.8,rr/AppState.lastRitmoBase)); } if(esDesc) fp*=0.8; let opts=[]; if(tipo==='largo') opts=this.ENTRENAMIENTOS_DB[mod]?.[dist]?.[nivel]?.largo||[]; else if(tipo==='series') opts=this.ENTRENAMIENTOS_DB[mod]?.[dist]?.[nivel]?.series||[]; else if(tipo==='tempo') opts=this.ENTRENAMIENTOS_DB[mod]?.[dist]?.[nivel]?.tempo||[]; else opts=this.ENTRENAMIENTOS_DB[mod]?.[dist]?.[nivel]?.rodaje||[]; if(opts.length){ const ia=Math.floor(Math.random()*opts.length), oo=opts[ia]; det={...oo,tipo}; det.duracion=Math.round(det.duracion*fp); if(tipo==='largo'){ c="sesion-largo"; b="L"; }else if(tipo==='series'){ c="sesion-series"; b="S"; }else if(tipo==='tempo'){ c="sesion-tempo"; b="T"; }else{ c="sesion-rodaje"; b="R"; } } } sesiones.push({color:c,breve:b,detalle:det,semana:s+1}); } const pid=Date.now().toString(), pc={params:{modalidad:mod,distancia:dist,macrociclo:mc,diasPorSemana:de.length,nivel:nivel,experiencia:exp,objetivo:obj,diaLargo:dl,fechaInicio:fi,diasEntreno:de},sesiones:sesiones,resumen:document.getElementById("resumenObjetivo").innerText,realizadas:{}}; AppState.planGeneradoActual=pc.params; AppState.planActualId=pid; AppState.sesionesRealizadas={}; AppState.trimestreActual=0; document.getElementById("calendarioEntreno").style.display="block"; document.getElementById("cuestionarioEntreno").style.display="none"; UI.mostrarCalendario(sesiones); this.guardarPlanActual(); UI.guardarPlanEnHistorial(pc.params,pc); UI.guardarEstado(); Utils.vibrate(50); Utils.playSound('success'); Utils.showToast('✅ Plan generado','success'); }catch(e){ console.error(e); Utils.showToast("> ERROR GENERANDO PLAN_",'error'); } },300); }
};

// ============================================
// ADMIN
// ============================================
const Admin = {
  mensajesRecibidosUnsub:null, mensajesEnviadosUnsub:null,
  async actualizarAdminPanel() { const u=await Storage.getUsers(), a=new Date(), t=Object.keys(u).length, ac=Object.values(u).filter(u=>new Date(u.expires)>a).length, ex=t-ac, pe=Object.values(u).filter(u=>u.adminNotified===false).length; document.getElementById("adminStats").innerHTML=`<span class="stat-badge" onclick="abrirModalUsuarios('total')">📊 TOTAL <span class="number">${t}</span></span><span class="stat-badge" onclick="abrirModalUsuarios('activos')">✅ ACTIVOS <span class="number">${ac}</span></span><span class="stat-badge" onclick="abrirModalUsuarios('expirados')">⏳ EXPIRADOS <span class="number">${ex}</span></span><span class="stat-badge pending" onclick="abrirModalPendientes()">🆕 PENDIENTES <span class="number">${pe}</span></span>`; document.getElementById("adminWelcome").innerText=`> ADMIN · ${a.toLocaleString()}`; this.setupMensajesListeners(); this.cargarSelectorUsuarios(); },
  async abrirModalPendientes() { const u=await Storage.getUsers(), p=Object.entries(u).filter(([uid,d])=>d.adminNotified===false), l=document.getElementById('listaPendientes'); let h=''; p.forEach(([uid,d])=>{ const c=new Date(d.created).toLocaleDateString(), e=new Date(d.expires).toLocaleDateString(); h+=`<div class="usuario-pendiente" data-usuario="${uid}"><div class="usuario-header" onclick="this.parentNode.classList.toggle('abierto')"><span>${d.username||uid}</span><span class="flecha">▼</span></div><div class="usuario-detalle"><div class="user-details"><span>📅 Creado: ${c}</span><span>⏳ Expira: ${e}</span><span>📧 Email: ${d.email||'No'}</span></div><div class="modal-user-actions"><button class="btn-enterado" onclick="event.stopPropagation(); marcarEnterado('${uid}')">✓ ENTERADO</button></div></div></div>`; }); l.innerHTML=h||'<p style="text-align:center; padding:20px;">📭 NO HAY PENDIENTES</p>'; document.getElementById('modalPendientes').classList.add('active'); },
  async marcarEnterado(uid) { const u=await Storage.getUsers(); if(u[uid]){ u[uid].adminNotified=true; await Storage.saveUsers(u); this.actualizarAdminPanel(); const p=Object.entries(u).filter(([u,d])=>d.adminNotified===false); if(p.length===0) document.getElementById('modalPendientes').classList.remove('active'); else this.abrirModalPendientes(); Utils.showToast(`✅ ${u[uid].username||uid} marcado`,'success'); } },
  setupMensajesListeners() { if(this.mensajesRecibidosUnsub) this.mensajesRecibidosUnsub(); if(this.mensajesEnviadosUnsub) this.mensajesEnviadosUnsub(); this.mensajesRecibidosUnsub=Storage.listenMensajesAdminRecibidos((r)=>this.renderMensajesRecibidos(r)); this.mensajesEnviadosUnsub=Storage.listenMensajesAdminEnviados((e)=>this.renderMensajesEnviados(e)); },
  renderMensajesRecibidos(r) { let h='', nl=0; r.forEach(i=>{ if(!i.mensaje.leido) nl++; h+=`<div class="mensaje-item"><div class="mensaje-header" onclick="this.parentNode.classList.toggle('abierto')"><span>📨 ${i.mensaje.fecha} · ${i.usuarioUid}</span><span class="flecha">▼</span><button class="delete-mensaje" onclick="event.stopPropagation(); borrarMensajeAdmin('${i.key}','${i.mensaje.id}')">🗑️</button></div><div class="mensaje-contenido">${i.mensaje.texto}</div></div>`; }); document.getElementById('listaMensajesRecibidosAdmin').innerHTML=h||'<p>📭 NO HAY MENSAJES</p>'; AppState.mensajesNoLeidosAdmin=nl; this.actualizarBadgeAdminSoporte(); },
  renderMensajesEnviados(e) { let h=''; e.forEach(i=>{ const cnl=!i.mensaje.leido?'no-leido-usuario':''; h+=`<div class="mensaje-item ${cnl}"><div class="mensaje-header" onclick="this.parentNode.classList.toggle('abierto')"><span>📤 ${i.mensaje.fecha} · <strong style="color:var(--accent-green);">👤 ${i.usuarioUid}</strong></span><span class="flecha">▼</span><button class="delete-mensaje" onclick="event.stopPropagation(); borrarMensajeAdmin('${i.key}','${i.mensaje.id}')">🗑️</button></div><div class="mensaje-contenido"><div style="margin-bottom:8px;color:var(--accent-green);"><strong>Para: ${i.usuarioUid}</strong></div>${i.mensaje.texto}</div></div>`; }); document.getElementById('listaMensajesEnviadosAdmin').innerHTML=h||'<p>📭 NO HAS ENVIADO MENSAJES</p>'; },
  actualizarBadgeAdminSoporte() { const t=document.getElementById('adminSoporteTab'); if(AppState.mensajesNoLeidosAdmin>0) t.classList.add('soporte-unread'); else t.classList.remove('soporte-unread'); },
  async abrirModalUsuarios(f='total') { const u=await Storage.getUsers(), m=document.getElementById('modalUsuarios'), l=document.getElementById('modalUserList'), t=document.getElementById('modalUsuariosTitulo'); let tt='👥 TODOS LOS USUARIOS'; if(f==='activos') tt='✅ ACTIVOS'; if(f==='expirados') tt='⏳ EXPIRADOS'; if(f==='premium') tt='👑 PREMIUM'; t.innerText=tt; this.renderizarListaUsuarios(u,l,'',f); m.classList.add('active'); document.getElementById('modalBuscarUsuario').oninput=(e)=>this.filtrarUsuariosModal(e.target.value,f); },
  renderizarListaUsuarios(u,c,fi='',tf='total') { const a=new Date(); const i=Object.entries(u).filter(([uid,d])=>(d.username||uid).toLowerCase().includes(fi.toLowerCase())).filter(([uid,d])=>{ if(tf==='activos') return new Date(d.expires)>a; if(tf==='expirados') return new Date(d.expires)<=a; if(tf==='premium') return d.premium===true; return true; }).map(([uid,d])=>{ const cr=new Date(d.created).toLocaleDateString(), ex=new Date(d.expires).toLocaleDateString(), pr=d.premium?'✅ PREMIUM':'❌ NO PREMIUM', es=new Date(d.expires)>a?'🟢 ACTIVO':'🔴 EXPIRADO', cal=d.calculosMes||0, pe=d.adminNotified===false?' (🆕 Pendiente)':''; return `<div class="usuario-item" onclick="toggleUsuario(this)"><div class="usuario-header"><span>${d.username||uid}${pe}</span><span class="flecha">▼</span></div><div class="usuario-detalle"><div class="user-details"><span>📅 Creado: ${cr}</span><span>⏳ Expira: ${ex}</span><span>${pr}</span><span>${es}</span><span>📊 Cálculos: ${cal}/2</span><span>📧 Email: ${d.email||'No'}</span></div><div class="modal-user-actions"><button onclick="event.stopPropagation(); extenderUsuario('${uid}',1)">+1 MES</button><button onclick="event.stopPropagation(); extenderUsuario('${uid}',3)">+3 MESES</button><button onclick="event.stopPropagation(); togglePremium('${uid}')">👑 PREMIUM</button><button onclick="event.stopPropagation(); enviarMensajeAUsuario('${uid}')">📨 MENSAJE</button><button onclick="event.stopPropagation(); eliminarUsuario('${uid}')">ELIMINAR</button></div></div></div>`; }).join(''); c.innerHTML=i||'<p style="text-align:center; padding:20px;">📭 NO HAY USUARIOS</p>'; },
  filtrarUsuariosModal(f,tf) { Storage.getUsers().then(u=>{ const l=document.getElementById('modalUserList'); this.renderizarListaUsuarios(u,l,f,tf); }); },
  async extenderUsuario(uid,m) { const u=await Storage.getUsers(); if(u[uid]){ const e=new Date(u[uid].expires); e.setMonth(e.getMonth()+m); u[uid].expires=e.toISOString(); await Storage.saveUsers(u); this.actualizarAdminPanel(); Utils.showToast(`✅ ${u[uid].username||uid} +${m} mes`,'success'); this.abrirModalUsuarios(); } },
  async togglePremium(uid) { const u=await Storage.getUsers(); if(u[uid]){ u[uid].premium=!u[uid].premium; await Storage.saveUsers(u); this.actualizarAdminPanel(); Utils.showToast(`✅ Premium de ${u[uid].username||uid} cambiado`,'success'); this.abrirModalUsuarios(); } },
  async eliminarUsuario(uid) { if(!await Utils.confirm('ELIMINAR',`¿Eliminar "${uid}"?`)) return; const u=await Storage.getUsers(); delete u[uid]; await Storage.saveUsers(u); if(AppState.currentUid===uid) AppState.setCurrentUser(null,null); this.actualizarAdminPanel(); Utils.showToast(`✅ ${uid} eliminado`,'success'); this.abrirModalUsuarios(); },
  exportarUsuariosCSV() { Storage.getUsers().then(u=>{ let c="UID,Usuario,Creado,Expira,Premium,Estado,Cálculos Mes,Email,AdminNotified\n"; Object.entries(u).forEach(([uid,d])=>c+=`${uid},${d.username||''},${new Date(d.created).toLocaleDateString()},${new Date(d.expires).toLocaleDateString()},${d.premium?'SI':'NO'},${new Date()<=new Date(d.expires)?'ACTIVO':'EXPIRADO'},${d.calculosMes||0},${d.email||''},${d.adminNotified?'SI':'NO'}\n`); const b=new Blob([c],{type:'text/csv'}), a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=`usuarios_${new Date().toISOString().split('T')[0]}.csv`; a.click(); URL.revokeObjectURL(a.href); }); },
  async renovarExpirados() { if(!await Utils.confirm('RENOVAR',"¿Renovar todos los expirados por 1 mes?")) return; const u=await Storage.getUsers(), a=new Date(); Object.entries(u).forEach(([uid,d])=>{ if(new Date(d.expires)<=a){ const e=new Date(d.expires); e.setMonth(e.getMonth()+1); u[uid].expires=e.toISOString(); } }); await Storage.saveUsers(u); this.actualizarAdminPanel(); Utils.showToast("✅ EXPIRADOS RENOVADOS",'success'); },
  async enviarMensajeAUsuario(uid) { const t=prompt(`> MENSAJE PARA ${uid}:`); if(!t) return; await Storage.enviarMensajeAdminAUsuario(uid,t); Utils.showToast("✅ ENVIADO",'success'); },
  async cargarSelectorUsuarios() { const u=await Storage.getUsers(), s=document.getElementById('adminSelectorUsuarios'); let o='<option value="todos">📢 TODOS LOS USUARIOS</option>'; Object.keys(u).sort().forEach(uid=>o+=`<option value="${uid}">${u[uid].username||uid}</option>`); s.innerHTML=o; },
  async enviarMensajeAdmin() { const s=document.getElementById('adminSelectorUsuarios'), d=s.value, t=document.getElementById('adminMensaje').value.trim(); if(!t) return Utils.showToast('> ESCRIBE UN MENSAJE','error'); if(d==='todos'){ const u=await Storage.getUsers(); for(let uid of Object.keys(u)) await Storage.enviarMensajeAdminAUsuario(uid,t); Utils.showToast('✅ ENVIADO A TODOS','success'); }else{ await Storage.enviarMensajeAdminAUsuario(d,t); Utils.showToast(`✅ ENVIADO A ${d}`,'success'); } document.getElementById('adminMensaje').value=''; },
  cambiarSoporteTab(t) { document.querySelectorAll('#admin-tab-soporte .soporte-tab').forEach(t=>t.classList.remove('active')); document.querySelectorAll('#admin-tab-soporte .soporte-panel').forEach(p=>p.classList.remove('active')); if(t==='recibidos'){ document.querySelectorAll('#admin-tab-soporte .soporte-tab')[0].classList.add('active'); document.getElementById('admin-soporte-recibidos').classList.add('active'); }else{ document.querySelectorAll('#admin-tab-soporte .soporte-tab')[1].classList.add('active'); document.getElementById('admin-soporte-enviados').classList.add('active'); } }
};

// ============================================
// THEME
// ============================================
const ThemeManager = {
  init() { const s=localStorage.getItem('ri5_theme'); if(s==='light'||s==='dark') document.body.classList.add(`manual-${s}`); this.updateButton(); },
  toggle() { if(document.body.classList.contains('manual-light')){ document.body.classList.remove('manual-light'); document.body.classList.add('manual-dark'); localStorage.setItem('ri5_theme','dark'); }else if(document.body.classList.contains('manual-dark')){ document.body.classList.remove('manual-dark'); localStorage.setItem('ri5_theme','light'); }else{ const d=window.matchMedia('(prefers-color-scheme: dark)').matches; if(d){ document.body.classList.add('manual-light'); localStorage.setItem('ri5_theme','light'); }else{ document.body.classList.add('manual-dark'); localStorage.setItem('ri5_theme','dark'); } } this.updateButton(); },
  updateButton() { document.querySelectorAll('.theme-toggle').forEach(b=>{ if(document.body.classList.contains('manual-light')) b.innerText='🌙'; else if(document.body.classList.contains('manual-dark')) b.innerText='☀️'; else b.innerText='🌓'; }); }
};

// ============================================
// PWA
// ============================================
const PWA = {
  dp:null,
  init() { window.addEventListener('beforeinstallprompt',e=>{ e.preventDefault(); this.dp=e; if(localStorage.getItem('pwa_installed')!=='true') document.getElementById('pwa-banner').style.display='flex'; }); window.addEventListener('appinstalled',()=>{ document.getElementById('pwa-banner').style.display='none'; this.dp=null; localStorage.setItem('pwa_installed','true'); }); },
  instalarPWA() { if(!this.dp){ Utils.showToast('Para instalar: menú del navegador → "Añadir a pantalla de inicio"','info'); return; } this.dp.prompt(); this.dp.userChoice.then(c=>{ if(c.outcome==='accepted') localStorage.setItem('pwa_installed','true'); this.dp=null; document.getElementById('pwa-banner').style.display='none'; }); },
  cerrarBannerPWA() { document.getElementById('pwa-banner').style.display='none'; },
  registerServiceWorker() { if('serviceWorker'in navigator){ const sw=`const C='ri5-cache-v1';const u=['.','https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js'];self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(u))));self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.map(k=>k!==C?caches.delete(k):null)))));`; const b=new Blob([sw],{type:'application/javascript'}); navigator.serviceWorker.register(URL.createObjectURL(b)).catch(console.log); } }
};

// ============================================
// ASIGNACIONES GLOBALES
// ============================================
window.switchAuthTab=(t)=>Auth.switchAuthTab(t);
window.registerUser=()=>Auth.registerUser();
window.loginUser=()=>Auth.loginUser();
window.logoutUser=()=>Auth.logoutUser();
window.logoutAdmin=()=>Auth.logoutAdmin();
window.eliminarMiCuenta=()=>Auth.eliminarMiCuenta();
window.startCalc=()=>Training.startCalc();
window.copyResults=()=>Training.copyResults();
window.shareResults=()=>Training.shareResults();
window.switchTab=(t)=>UI.switchTab(t);
window.changeDailyTip=()=>UI.changeDailyTip();
window.changeConsejo=()=>UI.changeConsejo();
window.toggleHistorialDetalle=(e)=>UI.toggleHistorialDetalle(e);
window.borrarEntradaHistorial=(i)=>UI.borrarEntradaHistorial(i);
window.borrarHistorial=()=>UI.borrarHistorial();
window.toggleCuestionario=()=>PlanGenerator.toggleCuestionario();
window.mostrarUltimoPlanGuardado=()=>PlanGenerator.mostrarUltimoPlanGuardado();
window.borrarPlanGuardado=()=>PlanGenerator.borrarPlanGuardado();
window.generarCalendarioEntreno=()=>PlanGenerator.generarCalendarioEntreno();
window.validarOpcionesPlan=()=>PlanGenerator.validarOpcionesPlan();
window.cargarPlanDesdeHistorial=(id)=>UI.cargarPlanDesdeHistorial(id);
window.eliminarPlanHistorial=(id)=>UI.eliminarPlanHistorial(id);
window.cambiarTrimestre=(d)=>UI.cambiarTrimestre(d);
window.cerrarPlan=()=>UI.cerrarPlan();
window.cambiarSoporteTab=(t)=>UI.cambiarSoporteTab(t);
window.enviarMensajeUsuario=()=>UI.enviarMensajeUsuario();
window.borrarMensajeUsuario=(id)=>UI.borrarMensajeUsuario(id);
window.toggleMensajeRecibido=(h,id)=>UI.toggleMensajeRecibido(h,id);
window.abrirModalUsuarios=(f)=>Admin.abrirModalUsuarios(f);
window.abrirModalPendientes=()=>Admin.abrirModalPendientes();
window.marcarEnterado=(uid)=>Admin.marcarEnterado(uid);
window.extenderUsuario=(uid,m)=>Admin.extenderUsuario(uid,m);
window.togglePremium=(uid)=>Admin.togglePremium(uid);
window.eliminarUsuario=(uid)=>Admin.eliminarUsuario(uid);
window.enviarMensajeAUsuario=(uid)=>Admin.enviarMensajeAUsuario(uid);
window.exportarUsuariosCSV=()=>Admin.exportarUsuariosCSV();
window.renovarExpirados=()=>Admin.renovarExpirados();
window.enviarMensajeAdmin=()=>Admin.enviarMensajeAdmin();
window.borrarMensajeAdmin=(k,i)=>Storage.borrarMensaje(k,i);
window.switchAdminTab=(t)=>{ document.querySelectorAll('#adminPage .tab-button').forEach(b=>b.classList.remove('active')); document.querySelectorAll('#adminPage .tab-content').forEach(c=>c.classList.remove('active')); if(t==='usuarios'){ document.querySelectorAll('#adminPage .tab-button')[0].classList.add('active'); document.getElementById('admin-tab-usuarios').classList.add('active'); }else{ document.querySelectorAll('#adminPage .tab-button')[1].classList.add('active'); document.getElementById('admin-tab-soporte').classList.add('active'); Admin.cargarSelectorUsuarios(); } };
window.cambiarAdminSoporteTab=(t)=>Admin.cambiarSoporteTab(t);
window.toggleUsuario=(e)=>e.classList.toggle('abierto');
window.instalarPWA=()=>PWA.instalarPWA();
window.cerrarBannerPWA=()=>PWA.cerrarBannerPWA();
window.toggleTheme=()=>ThemeManager.toggle();
window.showPremiumBenefits=()=>{ document.getElementById('premiumOverlay').classList.add('active'); document.getElementById('premiumModal').classList.add('active'); };
window.cerrarPremiumModal=()=>{ document.getElementById('premiumOverlay').classList.remove('active'); document.getElementById('premiumModal').classList.remove('active'); };
window.contactarAdmin=()=>window.open('https://www.instagram.com/navegacionpro','_blank');
window.abrirResetModal=()=>{ document.getElementById('resetOverlay').style.display='block'; document.getElementById('resetModal').style.display='block'; document.getElementById('resetUsername').value=''; document.getElementById('resetEmail').value=''; document.getElementById('resetError').classList.remove('visible'); };
window.cerrarResetModal=()=>{ document.getElementById('resetOverlay').style.display='none'; document.getElementById('resetModal').style.display='none'; };
window.enviarResetPassword=async()=>{ const u=document.getElementById('resetUsername').value.trim(), e=document.getElementById('resetEmail').value.trim(), err=document.getElementById('resetError'); if(!u||!e){ err.innerText="> COMPLETA AMBOS CAMPOS_"; err.classList.add('visible'); return; } if(!Utils.isValidEmail(e)){ err.innerText="> CORREO NO VÁLIDO_"; err.classList.add('visible'); return; } const us=await Storage.getUsers(), en=Object.entries(us).find(([uid,d])=>d.username===u); if(!en||en[1].email!==e){ Utils.showToast('Si los datos son correctos, recibirás un enlace','info'); window.cerrarResetModal(); return; } try{ await auth.sendPasswordResetEmail(e); Utils.showToast('✅ Revisa tu correo','success'); window.cerrarResetModal(); }catch(error){ Utils.showToast('❌ No se pudo enviar','error'); } };
window.cerrarWelcomeModal=async()=>{ document.getElementById('welcomeOverlay').style.display='none'; document.getElementById('welcomeModal').style.display='none'; if(AppState.currentUid&&AppState.currentUserData){ await Storage.updateUser(AppState.currentUid,{welcomeSeen:true}); AppState.currentUserData.welcomeSeen=true; } };
window.mostrarModalActualizarEmail=(u,p)=>{ document.getElementById('emailUpdateOverlay').style.display='block'; document.getElementById('emailUpdateModal').style.display='block'; document.getElementById('emailUpdateInput').value=''; document.getElementById('emailUpdateError').classList.remove('visible'); window.guardarEmailActualizacion=async()=>{ const e=document.getElementById('emailUpdateInput').value.trim(), err=document.getElementById('emailUpdateError'); if(!e){ err.innerText="> INTRODUCE UN CORREO_"; err.classList.add('visible'); return; } if(!Utils.isValidEmail(e)){ err.innerText="> CORREO NO VÁLIDO_"; err.classList.add('visible'); return; } try{ const uc=await auth.createUserWithEmailAndPassword(e,p), us=await Storage.getUsers(), en=Object.entries(us).find(([uid,d])=>d.username===u); if(en) en[1].email=e; await Storage.saveUsers(us); Utils.showToast('✅ Correo guardado','success'); window.cerrarEmailUpdateModal(); await auth.signInWithEmailAndPassword(e,p); window.location.reload(); }catch(error){ if(error.code==='auth/email-already-in-use') err.innerText="> ESTE CORREO YA ESTÁ REGISTRADO_"; else err.innerText="> ERROR AL GUARDAR: "+error.message; err.classList.add('visible'); } }; };
window.cerrarEmailUpdateModal=()=>{ document.getElementById('emailUpdateOverlay').style.display='none'; document.getElementById('emailUpdateModal').style.display='none'; };
window.togglePassword=(i,e)=>{ const inp=document.getElementById(i); if(inp.type==='password'){ inp.type='text'; e.textContent='ocultar'; }else{ inp.type='password'; e.textContent='ver'; } };
window.cerrarModalSesion=()=>UI.cerrarModalSesion();

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener("DOMContentLoaded",async()=>{
  document.getElementById("age").addEventListener("blur",()=>UI.marcarCampoTocado('age'));
  document.getElementById("time").addEventListener("blur",()=>UI.marcarCampoTocado('time'));
  document.getElementById("age").addEventListener("input",()=>{ if(AppState.camposTocados.age) UI.validarCampo('age'); UI.validarTodo(); });
  document.getElementById("time").addEventListener("input",()=>{ if(AppState.camposTocados.time) UI.validarCampo('time'); UI.validarTodo(); });
  UI.validarTodo();
  UI.initDiasCheckboxes();
  UI.setFechaActual();
  document.getElementById('duracionPlan').addEventListener('change',PlanGenerator.validarOpcionesPlan);
  document.getElementById('experienciaDistancia').addEventListener('change',PlanGenerator.validarOpcionesPlan);
  PlanGenerator.validarOpcionesPlan();
  if(!await Auth.checkSavedSession()) document.getElementById("loginPage").style.display="flex";
  if(localStorage.getItem('pwa_installed')==='true') document.getElementById('pwa-banner').style.display='none';
  PWA.init();
  PWA.registerServiceWorker();
  setTimeout(()=>{ if(PWA.dp&&localStorage.getItem('pwa_installed')!=='true') document.getElementById('pwa-banner').style.display='flex'; },3000);
  ThemeManager.init();
  document.addEventListener('click',function enableAudio(){ window.audioEnabled=true; document.removeEventListener('click',enableAudio); },{once:true});
});