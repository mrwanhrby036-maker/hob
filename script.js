/* =====================================================
   قلوب — المنطق الكامل (Firebase Auth + Realtime DB)
   ===================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, sendPasswordResetEmail,
  GoogleAuthProvider, signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getDatabase, ref, set, get, update, remove, push,
  onValue, onChildAdded, onDisconnect, serverTimestamp,
  query, limitToLast, increment
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/* ---------- إعدادات فايربيز ---------- */
const firebaseConfig = {
  apiKey: "AIzaSyAizTqPH80zahbMOiLUi_-VlNMxwaA4Lc8",
  authDomain: "chatapp-11788.firebaseapp.com",
  databaseURL: "https://chatapp-11788-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "chatapp-11788",
  storageBucket: "chatapp-11788.firebasestorage.app",
  messagingSenderId: "473709663173",
  appId: "1:473709663173:web:bf45b194889fd4999431ac"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const googleProvider = new GoogleAuthProvider();

/* ---------- ثوابت ---------- */
const AVATARS = [
  { id: 'm1', g: 'male' }, { id: 'm2', g: 'male' }, { id: 'm3', g: 'male' }, { id: 'm4', g: 'male' },
  { id: 'f1', g: 'female' }, { id: 'f2', g: 'female' }, { id: 'f3', g: 'female' }, { id: 'f4', g: 'female' }
];
const CITIES = ['القاهرة','الجيزة','الإسكندرية','الدقهلية','الغربية','المنوفية','القليوبية','الشرقية','بورسعيد','السويس','الإسماعيلية','دمياط','البحيرة','كفر الشيخ','الفيوم','بني سويف','المنيا','أسيوط','سوهاج','قنا','الأقصر','أسوان','البحر الأحمر','مطروح','شمال سيناء','أخرى'];

/* ---------- أيقونات SVG (من غير أي إيموجي) ---------- */
const ICONS = {
  heart: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
  heartO: 'M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z',
  user: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  chat: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z',
  mail: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z',
  search: 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
  pin: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'
};
function icon(name, cls = '') {
  return `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[name]}"/></svg>`;
}

/* ---------- روابط الصور المرفوعة (بدل الفولدر المحلي) ---------- */
const IMG_BASE = {
  m1: 'https://i.ibb.co/GDXbyVc/m1.png',
  m2: 'https://i.ibb.co/gMynTmV3/m2.png',
  m3: 'https://i.ibb.co/xS21S31R/m3.png',
  m4: 'https://i.ibb.co/WWzpwbbb/m4.png',
  f1: 'https://i.ibb.co/21x09Qz7/f1.png',
  f2: 'https://i.ibb.co/M5KcBZVY/f2.png',
  f3: 'https://i.ibb.co/0pJ2vdfS/f3.png',
  f4: 'https://i.ibb.co/8gpxf7P0/f4.png',
  heart: 'https://i.ibb.co/Pskh7h3h/heart.png',
  hero: 'https://i.ibb.co/0pg24CPJ/hero.png'
};

/* ---------- الحالة العامة ---------- */
const state = {
  user: null,
  users: {},            // uid -> بيانات العضو
  likesGiven: {},       // uid -> ts  (أنا عامل لايك)
  likesReceived: {},    // uid -> ts  (عملي لايك)
  userChats: {},        // chatId -> meta
  activeChat: null,     // { chatId, withUid }
  memberFilter: 'all',
  searchText: '',
  regAvatar: 'm1',
  profileAvatar: 'm1',
  likesListenerReady: false,
};
const unsubs = [];           // دوال إلغاء المستمعين
let chatMsgsUnsub = null;    // مستمع رسائل المحادثة المفتوحة

/* ---------- اختصارات ---------- */
const $ = (id) => document.getElementById(id);
const me = () => state.user?.uid;

function escapeHtml(str = '') {
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function fmtTime(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
}

function timeAgo(ts) {
  if (!ts) return '';
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'الآن';
  const m = Math.floor(s / 60);
  if (m < 60) return `من ${m} د`;
  const h = Math.floor(m / 60);
  if (h < 24) return `من ${h} س`;
  const d = Math.floor(h / 24);
  if (d < 7) return `من ${d} يوم`;
  return new Date(ts).toLocaleDateString('ar-EG');
}

function genderLabel(g) { return g === 'female' ? 'بنت' : 'ولد'; }
function userOf(uid) { return state.users[uid]; }

function avatarSrc(u) {
  const v = u && u.avatar;
  if (typeof v === 'string' && /^https?:\/\//.test(v)) return v;
  return IMG_BASE[/^[mf][1-4]$/.test(v) ? v : (u && u.gender === 'female' ? 'f1' : 'm1')];
}

function avatarHTML(u, size = '') {
  const g = u && u.gender === 'female' ? 'female' : 'male';
  return `<div class="avatar ${size} ${g}"><img src="${avatarSrc(u)}" alt="" loading="lazy"><i class="dot ${u && u.online ? 'on' : ''}"></i></div>`;
}

function lastSeenText(u) {
  if (!u) return '';
  if (u.online) return 'متصل الآن';
  if (u.lastSeen) return `آخر ظهور ${timeAgo(u.lastSeen)}`;
  return 'غير متصل';
}

/* ---------- التنبيهات ---------- */
function toast(msg, type = '') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  $('toastContainer').appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 300);
  }, 3600);
}

function showSetupWarning() { $('setupWarning').classList.remove('hidden'); }
$('setupClose').addEventListener('click', () => $('setupWarning').classList.add('hidden'));

function handleError(err) {
  console.error(err);
  const code = err?.code || '';
  const map = {
    'auth/invalid-email': 'الإيميل ده مش صحيح',
    'auth/user-not-found': 'مفيش حساب بالإيميل ده — اعمل حساب جديد',
    'auth/wrong-password': 'كلمة المرور غلط، حاول تاني',
    'auth/invalid-credential': 'بيانات الدخول غير صحيحة',
    'auth/email-already-in-use': 'الإيميل ده مسجل قبل كده — سجل دخولك',
    'auth/weak-password': 'كلمة المرور لازم تكون 6 حروف على الأقل',
    'auth/too-many-requests': 'محاولات كتيرة — استنى شوية وحاول تاني',
    'auth/network-request-failed': 'مشكلة في الاتصال بالإنترنت',
    'auth/user-disabled': 'الحساب ده متوقف',
    'auth/popup-closed-by-user': 'قفلت نافذة جوجل قبل إتمام الدخول',
    'auth/popup-blocked': 'المتصفح منع النافذة المنبثقة — اسمح بالنوافذ وجرب تاني',
    'auth/account-exists-with-different-credential': 'الإيميل ده مسجل بطريقة تانية — سجل دخولك بالإيميل وكلمة المرور',
  };
  if (code === 'auth/cancelled-popup-request') return;
  if (code === 'auth/unauthorized-domain') {
    showSetupWarning();
    toast(`الدومين "${location.hostname}" مش مصرح بيه في Firebase — ضيفه من Authentication ثم Settings ثم Authorized domains`, 'error');
    return;
  }
  if (code === 'auth/operation-not-allowed' || code === 'PERMISSION_DENIED' || code === 'auth/configuration-not-found') {
    showSetupWarning();
    toast('محتاج تكمّل إعدادات Firebase الأول', 'error');
    return;
  }
  if (String(err?.message || '').includes('PERMISSION_DENIED')) {
    showSetupWarning();
    toast('قاعدة البيانات رافضة الكتابة — عدّل القواعد (Rules)', 'error');
    return;
  }
  toast(map[code] || `حدث خطأ: ${code || err?.message || 'غير معروف'}`, 'error');
}

/* =====================================================
   خلفية القلوب الطايرة
   ===================================================== */
(function floatingHearts() {
  const bg = $('heartsBg');
  for (let i = 0; i < 12; i++) {
    const s = document.createElement('img');
    s.src = IMG_BASE.heart;
    s.alt = '';
    s.className = 'float-heart';
    s.style.right = Math.random() * 100 + '%';
    s.style.width = (20 + Math.random() * 36) + 'px';
    s.style.animationDuration = (9 + Math.random() * 12) + 's';
    s.style.animationDelay = (Math.random() * 12) + 's';
    bg.appendChild(s);
  }
})();

/* =====================================================
   ملء القوائم (مدن + صور رمزية)
   ===================================================== */
function fillCities(selectEl) {
  selectEl.innerHTML = CITIES.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
}

function buildAvatarPicker(container, getSelected, onSelect) {
  container.innerHTML = '';
  const current = getSelected();
  const makeBtn = (id, src) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'avatar-btn' + (current === id ? ' selected' : '');
    btn.innerHTML = `<img src="${src}" alt="">`;
    btn.addEventListener('click', () => {
      onSelect(id);
      container.querySelectorAll('.avatar-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
    container.appendChild(btn);
  };
  // لو المستخدم مستخدم صورة جوجل، نعرضها كأول اختيار
  if (typeof current === 'string' && /^https?:\/\//.test(current)) {
    makeBtn(current, current);
  }
  AVATARS.forEach(a => makeBtn(a.id, IMG_BASE[a.id]));
}

fillCities($('regCity'));
fillCities($('profileCity'));
fillCities($('cpCity'));
buildAvatarPicker($('regAvatars'), () => state.regAvatar, a => state.regAvatar = a);

// لو النوع اتغيّر والشخصية المختارة مش مناسبة، رجّع الافتراضية المناسبة
document.querySelectorAll('input[name="gender"]').forEach(r => {
  r.addEventListener('change', () => {
    const g = document.querySelector('input[name="gender"]:checked')?.value;
    const cur = AVATARS.find(a => a.id === state.regAvatar);
    if (g && cur && cur.g !== g) {
      state.regAvatar = g === 'female' ? 'f1' : 'm1';
      buildAvatarPicker($('regAvatars'), () => state.regAvatar, a => state.regAvatar = a);
    }
  });
});

/* =====================================================
   شاشة الدخول — التبديل والمنطق
   ===================================================== */
$('showLogin').addEventListener('click', () => {
  $('showLogin').classList.add('active');
  $('showRegister').classList.remove('active');
  $('loginForm').classList.remove('hidden');
  $('registerForm').classList.add('hidden');
});
$('showRegister').addEventListener('click', () => {
  $('showRegister').classList.add('active');
  $('showLogin').classList.remove('active');
  $('registerForm').classList.remove('hidden');
  $('loginForm').classList.add('hidden');
});

$('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = $('loginBtn');
  btn.disabled = true; btn.textContent = 'جاري الدخول...';
  try {
    await signInWithEmailAndPassword(auth, $('loginEmail').value.trim(), $('loginPassword').value);
  } catch (err) {
    handleError(err);
  } finally {
    btn.disabled = false; btn.textContent = 'دخول';
  }
});

$('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = $('regName').value.trim();
  const email = $('regEmail').value.trim();
  const pass = $('regPassword').value;
  const age = parseInt($('regAge').value, 10);
  const city = $('regCity').value;
  const gender = document.querySelector('input[name="gender"]:checked')?.value;

  if (name.length < 2) return toast('اكتب اسم صحيح (حرفين على الأقل)', 'error');
  if (!age || age < 18 || age > 99) return toast('السن لازم يكون بين 18 و 99', 'error');
  if (!gender) return toast('اختار النوع: ولد أو بنت', 'error');

  const btn = $('registerBtn');
  btn.disabled = true; btn.textContent = 'جاري إنشاء الحساب...';
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await set(ref(db, 'users/' + cred.user.uid), {
      name, age, city, gender,
      avatar: state.regAvatar,
      bio: '',
      email,
      online: true,
      createdAt: Date.now()
    });
    toast(`أهلاً بيك في قلوب يا ${name}`, 'match');
  } catch (err) {
    handleError(err);
  } finally {
    btn.disabled = false; btn.textContent = 'إنشاء الحساب';
  }
});

$('forgotBtn').addEventListener('click', async () => {
  const email = $('loginEmail').value.trim();
  if (!email) return toast('اكتب إيميلك الأول وبعدها اضغط "نسيت كلمة المرور"', 'error');
  try {
    await sendPasswordResetEmail(auth, email);
    toast('بعنالك رابط إعادة تعيين كلمة المرور على إيميلك', 'success');
  } catch (err) { handleError(err); }
});

$('logoutBtn').addEventListener('click', async () => {
  try { await signOut(auth); } catch (err) { handleError(err); }
});

// الدخول بحساب جوجل
$('googleBtn').addEventListener('click', async () => {
  const btn = $('googleBtn');
  btn.disabled = true;
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (err) {
    handleError(err);
  } finally {
    btn.disabled = false;
  }
});

/* =====================================================
   مراقبة حالة الدخول
   ===================================================== */
onAuthStateChanged(auth, async (user) => {
  if (user) {
    state.user = user;
    const profileReady = await ensureProfile(user);
    if (!profileReady) {
      // أول مرة يدخل (غالبًا بحساب جوجل) — لازم يكمّل بياناته
      openCompleteProfile(user);
      return;
    }
    setupPresence();
    subscribeAll();
    showApp();
  } else {
    cleanupAll();
    showAuth();
  }
});

async function ensureProfile(user) {
  try {
    let snap = await get(ref(db, 'users/' + user.uid));
    if (!snap.exists()) {
      // احتمال أن التسجيل لسه بيكتب — استنى لحظة وتأكد تاني
      await new Promise(r => setTimeout(r, 2000));
      snap = await get(ref(db, 'users/' + user.uid));
    }
    return snap.exists();
  } catch (err) { handleError(err); return true; }
}

function showApp() {
  $('authScreen').classList.add('hidden');
  $('appScreen').classList.remove('hidden');
}
function showAuth() {
  $('appScreen').classList.add('hidden');
  $('authScreen').classList.remove('hidden');
}

/* =====================================================
   إكمال الملف الشخصي بعد أول دخول بجوجل
   ===================================================== */
function openCompleteProfile(user) {
  $('authScreen').classList.add('hidden');
  $('appScreen').classList.add('hidden');
  state.cpUser = user;
  state.cpAvatar = user.photoURL || '';
  $('cpName').value = user.displayName || (user.email || 'عضو').split('@')[0];
  updateCpPreview();
  $('cpNote').textContent = state.cpAvatar
    ? 'اتحطت صورة حسابك في جوجل تلقائيًا — تقدر تغيرها أي وقت من صفحة حسابي'
    : 'اختار النوع وهنحطلك شخصية مناسبة — تقدر تغيرها بعدين من حسابي';
  $('completeModal').classList.remove('hidden');
}

function updateCpPreview() {
  const g = document.querySelector('input[name="cpGender"]:checked')?.value || 'male';
  const src = state.cpAvatar || IMG_BASE[g === 'female' ? 'f1' : 'm1'];
  $('cpAvatarPreview').innerHTML = `<div class="avatar ${g}"><img src="${src}" alt=""></div>`;
}

document.querySelectorAll('input[name="cpGender"]').forEach(r => r.addEventListener('change', updateCpPreview));

$('completeForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const user = state.cpUser;
  if (!user) return;
  const name = $('cpName').value.trim();
  const age = parseInt($('cpAge').value, 10);
  const gender = document.querySelector('input[name="cpGender"]:checked')?.value;
  if (name.length < 2) return toast('اكتب اسم صحيح (حرفين على الأقل)', 'error');
  if (!age || age < 18 || age > 99) return toast('السن لازم يكون بين 18 و 99', 'error');
  if (!gender) return toast('اختار النوع: ولد أو بنت', 'error');
  const btn = $('cpBtn');
  btn.disabled = true; btn.textContent = 'جاري الحفظ...';
  try {
    await set(ref(db, 'users/' + user.uid), {
      name, age, gender,
      city: $('cpCity').value,
      avatar: state.cpAvatar || (gender === 'female' ? 'f1' : 'm1'),
      bio: '',
      email: user.email || '',
      online: true,
      createdAt: Date.now()
    });
    $('completeModal').classList.add('hidden');
    state.cpUser = null;
    toast(`أهلاً بيك في قلوب يا ${name}`, 'match');
    setupPresence();
    subscribeAll();
    showApp();
  } catch (err) { handleError(err); }
  finally { btn.disabled = false; btn.textContent = 'ابدأ الآن'; }
});

/* =====================================================
   الحضور (متصل الآن / آخر ظهور)
   ===================================================== */
function setupPresence() {
  const uid = me();
  const connRef = ref(db, '.info/connected');
  onValue(connRef, (snap) => {
    if (snap.val() === true) {
      const onlineRef = ref(db, `users/${uid}/online`);
      onDisconnect(onlineRef).set(false);
      onDisconnect(ref(db, `users/${uid}/lastSeen`)).set(serverTimestamp());
      set(onlineRef, true).catch(() => {});
    }
  });
}

/* =====================================================
   الاشتراكات (Listeners)
   ===================================================== */
function subscribeAll() {
  const uid = me();

  // 1) كل الأعضاء
  unsubs.push(onValue(ref(db, 'users'), (snap) => {
    state.users = snap.val() || {};
    renderMembers();
    renderLikes();
    renderChatsList();
    updateHeader();
    updateConvHeader();
  }, handleError));

  // 2) اللايكات اللي أنا عاملها
  unsubs.push(onValue(ref(db, `likesGiven/${uid}`), (snap) => {
    state.likesGiven = snap.val() || {};
    renderMembers();
    renderLikes();
  }, handleError));

  // 3) اللايكات اللي اتعملتلي
  unsubs.push(onValue(ref(db, `likesReceived/${uid}`), (snap) => {
    state.likesReceived = snap.val() || {};
    renderMembers();
    renderLikes();
    state.likesListenerReady = true;
  }, handleError));

  // تنبيه عند لايك جديد (بعد أول تحميل فقط)
  unsubs.push(onChildAdded(ref(db, `likesReceived/${uid}`), (snap) => {
    if (!state.likesListenerReady) return;
    const liker = userOf(snap.key);
    const name = liker ? liker.name : 'حد';
    if (state.likesGiven[snap.key]) {
      toast(`مبروك! ماتش جديد — إنت و ${name} متبادلين الإعجاب`, 'match');
    } else {
      toast(`${name} عملك إعجاب`, 'success');
    }
  }));

  // 4) قايمة محادثاتي الخاصة
  unsubs.push(onValue(ref(db, `userChats/${uid}`), (snap) => {
    state.userChats = snap.val() || {};
    renderChatsList();
  }, handleError));

  // 5) الشات العام
  $('publicMessages').innerHTML = '';
  const publicQ = query(ref(db, 'publicMessages'), limitToLast(150));
  unsubs.push(onChildAdded(publicQ, (snap) => {
    appendPublicMessage(snap.val());
  }, handleError));
}

function cleanupAll() {
  unsubs.forEach(u => { try { u(); } catch (_) {} });
  unsubs.length = 0;
  if (chatMsgsUnsub) { try { chatMsgsUnsub(); } catch (_) {} chatMsgsUnsub = null; }
  Object.assign(state, {
    user: null, users: {}, likesGiven: {}, likesReceived: {},
    userChats: {}, activeChat: null, likesListenerReady: false
  });
  $('publicMessages').innerHTML = '';
  $('chatsList').innerHTML = '';
  $('msgsBadge').classList.add('hidden');
  $('completeModal').classList.add('hidden');
  state.cpUser = null;
}

function updateHeader() {
  const u = userOf(me());
  if (u) {
    $('myChipAvatarImg').src = avatarSrc(u);
    $('myChipName').textContent = u.name || '';
  }
  const online = Object.values(state.users).filter(x => x.online).length;
  $('onlineCount').innerHTML = `<i class="online-dot-inline"></i> ${online} متصل`;
}

/* =====================================================
   التنقل بين التبويبات
   ===================================================== */
$('appNav').addEventListener('click', (e) => {
  const btn = e.target.closest('.nav-btn');
  if (!btn) return;
  switchTab(btn.dataset.tab);
});

function switchTab(tab) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-section').forEach(s => s.classList.toggle('active', s.id === 'tab-' + tab));
  if (tab === 'members') renderMembers();
  if (tab === 'likes') renderLikes();
  if (tab === 'chats') { renderChatsList(); }
  if (tab === 'profile') fillProfileForm();
}

$('myChip').addEventListener('click', () => switchTab('profile'));

/* =====================================================
   الشات العام
   ===================================================== */
$('publicForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = $('publicInput');
  const text = input.value.trim();
  if (!text) return;
  const u = userOf(me());
  input.value = '';
  try {
    const msgRef = push(ref(db, 'publicMessages'));
    await set(msgRef, {
      uid: me(),
      name: u?.name || 'عضو',
      gender: u?.gender || 'male',
      text,
      ts: serverTimestamp()
    });
  } catch (err) { handleError(err); }
});

function appendPublicMessage(m) {
  const box = $('publicMessages');
  const isMine = m.uid === me();
  const gender = m.gender === 'female' ? 'female' : 'male';
  const el = document.createElement('div');
  el.className = 'msg' + (isMine ? ' mine' : '');
  el.innerHTML = `
    ${!isMine ? `<div class="msg-head"><span class="clickable ${gender}-name" data-viewuid="${escapeHtml(m.uid)}">${escapeHtml(m.name)}</span></div>` : ''}
    <div class="msg-text">${escapeHtml(m.text)}</div>
    <div class="msg-time">${fmtTime(m.ts || Date.now())}</div>
  `;
  box.appendChild(el);
  // قص الرسايل القديمة من الشاشة
  while (box.children.length > 200) box.removeChild(box.firstChild);
  box.scrollTop = box.scrollHeight;
}

// الضغط على اسم عضو في الشات العام يفتح ملفه
$('publicMessages').addEventListener('click', (e) => {
  const t = e.target.closest('[data-viewuid]');
  if (t) openProfileModal(t.dataset.viewuid);
});

/* =====================================================
   الأعضاء
   ===================================================== */
$('memberFilters').addEventListener('click', (e) => {
  const btn = e.target.closest('.chip');
  if (!btn) return;
  state.memberFilter = btn.dataset.g;
  document.querySelectorAll('#memberFilters .chip').forEach(c => c.classList.toggle('active', c === btn));
  renderMembers();
});
$('memberSearch').addEventListener('input', (e) => {
  state.searchText = e.target.value.trim();
  renderMembers();
});

function memberCardHTML(uid, u) {
  const liked = !!state.likesGiven[uid];
  const matched = liked && !!state.likesReceived[uid];
  return `
    <div class="member-card" data-uid="${uid}">
      ${avatarHTML(u)}
      <h3>${escapeHtml(u.name || 'عضو')} ${matched ? `<span class="match-inline">${icon('heart')}</span>` : ''}</h3>
      <p class="meta">${u.age || '؟'} سنة • ${escapeHtml(u.city || '')}</p>
      <div class="card-actions">
        <button class="action-btn view-btn" data-action="view" title="عرض الملف">${icon('user')}</button>
        <button class="action-btn like-btn ${liked ? 'liked' : ''}" data-action="like" title="إعجاب">${icon(liked ? 'heart' : 'heartO')}</button>
        <button class="action-btn chat-btn" data-action="chat" title="محادثة خاصة">${icon('chat')}</button>
      </div>
    </div>`;
}

function renderMembers() {
  const grid = $('membersGrid');
  let list = Object.entries(state.users)
    .filter(([uid]) => uid !== me())
    .map(([uid, u]) => ({ uid, ...u }));

  if (state.memberFilter === 'male' || state.memberFilter === 'female') {
    list = list.filter(u => u.gender === state.memberFilter);
  } else if (state.memberFilter === 'online') {
    list = list.filter(u => u.online);
  }
  if (state.searchText) {
    const q = state.searchText;
    list = list.filter(u => (u.name || '').includes(q));
  }
  list.sort((a, b) => (b.online === true) - (a.online === true) || (a.name || '').localeCompare(b.name || '', 'ar'));

  if (!list.length) {
    grid.innerHTML = `<div class="empty-msg">${icon('search', 'big-ic')}<p>مفيش أعضاء مطابقين للبحث دلوقتي</p></div>`;
    return;
  }
  grid.innerHTML = list.map(u => memberCardHTML(u.uid, u)).join('');
}

$('membersGrid').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const uid = btn.closest('.member-card')?.dataset.uid;
  if (!uid) return;
  if (btn.dataset.action === 'view') openProfileModal(uid);
  if (btn.dataset.action === 'like') toggleLike(uid);
  if (btn.dataset.action === 'chat') openChat(uid);
});

/* =====================================================
   نظام اللايك / الماتش
   ===================================================== */
async function toggleLike(targetUid) {
  const uid = me();
  if (!uid || targetUid === uid) return;
  const already = !!state.likesGiven[targetUid];
  try {
    if (already) {
      await remove(ref(db, `likesGiven/${uid}/${targetUid}`));
      await remove(ref(db, `likesReceived/${targetUid}/${uid}`));
      toast('تم إلغاء الإعجاب');
    } else {
      await set(ref(db, `likesGiven/${uid}/${targetUid}`), Date.now());
      await set(ref(db, `likesReceived/${targetUid}/${uid}`), Date.now());
      if (state.likesReceived[targetUid]) {
        const name = userOf(targetUid)?.name || '';
        toast(`مبروك! ماتش بينك وبين ${name} — ابدأوا المحادثة`, 'match');
      } else {
        toast('تم الإعجاب', 'success');
      }
    }
  } catch (err) { handleError(err); }
}

function renderLikes() {
  const given = state.likesGiven;
  const received = state.likesReceived;

  const matches = Object.keys(given).filter(uid => received[uid] && userOf(uid));
  const likedMe = Object.keys(received).filter(uid => !given[uid] && userOf(uid));
  const myLikes = Object.keys(given).filter(uid => !received[uid] && userOf(uid));

  // الماتشات
  $('matchesRow').innerHTML = matches.length
    ? matches.map(uid => {
        const u = userOf(uid);
        return `
          <div class="match-card" data-uid="${uid}">
            <span class="match-corner">${icon('heart')}${icon('heart')}</span>
            ${avatarHTML(u)}
            <h3>${escapeHtml(u.name)}</h3>
            <p class="meta">${u.age || '؟'} سنة • ${escapeHtml(u.city || '')}</p>
            <button class="primary-btn" data-action="chat">${icon('chat')} ابدأ المحادثة</button>
          </div>`;
      }).join('')
    : `<div class="empty-msg">${icon('heart', 'big-ic')}<p>لسه مفيش ماتشات — اعمل إعجاب لحد بيعجبك، ولو عملك إعجاب هو كمان هيبقى ماتش!</p></div>`;

  // معجبين بيك
  $('likedMeGrid').innerHTML = likedMe.length
    ? likedMe.map(uid => {
        const u = userOf(uid);
        return `
          <div class="member-card" data-uid="${uid}">
            ${avatarHTML(u)}
            <h3>${escapeHtml(u.name)}</h3>
            <p class="meta">${u.age || '؟'} سنة • ${escapeHtml(u.city || '')}</p>
            <div class="mini-actions">
              <button class="mini-btn like-back" data-action="like">${icon('heart')} رد الإعجاب</button>
              <button class="mini-btn" data-action="view">${icon('user')} الملف</button>
            </div>
          </div>`;
      }).join('')
    : `<div class="empty-msg">${icon('heartO', 'big-ic')}<p>لسه محدش عملك إعجاب — كمّل ملفك وكن نشيط في الشات العام</p></div>`;

  // أنا عامل إعجاب لـ
  $('myLikesGrid').innerHTML = myLikes.length
    ? myLikes.map(uid => {
        const u = userOf(uid);
        return `
          <div class="member-card" data-uid="${uid}">
            ${avatarHTML(u)}
            <h3>${escapeHtml(u.name)}</h3>
            <p class="meta">${u.age || '؟'} سنة • ${escapeHtml(u.city || '')}</p>
            <div class="mini-actions">
              <button class="mini-btn" data-action="chat">${icon('chat')} محادثة</button>
              <button class="mini-btn remove-like" data-action="like">${icon('heartO')} إلغاء</button>
            </div>
          </div>`;
      }).join('')
    : `<div class="empty-msg">${icon('heartO', 'big-ic')}<p>لسه معملتش إعجاب لحد — روح لصفحة الأعضاء واختار اللي يعجبك</p></div>`;
}

$('matchesRow').addEventListener('click', handleLikeAreaClick);
$('likedMeGrid').addEventListener('click', handleLikeAreaClick);
$('myLikesGrid').addEventListener('click', handleLikeAreaClick);

function handleLikeAreaClick(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const uid = btn.closest('[data-uid]')?.dataset.uid;
  if (!uid) return;
  if (btn.dataset.action === 'chat') openChat(uid);
  if (btn.dataset.action === 'like') toggleLike(uid);
  if (btn.dataset.action === 'view') openProfileModal(uid);
}

/* =====================================================
   المحادثات الخاصة
   ===================================================== */
function chatIdWith(a, b) { return [a, b].sort().join('_'); }

function openChat(withUid) {
  if (!userOf(withUid)) return;
  state.activeChat = { chatId: chatIdWith(me(), withUid), withUid };
  switchTab('chats');
  $('chatsLayout').classList.add('conv-open');
  $('convEmpty').classList.add('hidden');
  $('convContent').classList.remove('hidden');
  updateConvHeader();
  renderChatsList();

  // استمع لرسايل المحادثة
  if (chatMsgsUnsub) { try { chatMsgsUnsub(); } catch (_) {} chatMsgsUnsub = null; }
  const q = query(ref(db, `privateChats/${state.activeChat.chatId}/messages`), limitToLast(200));
  chatMsgsUnsub = onValue(q, (snap) => {
    const msgs = [];
    snap.forEach(c => msgs.push(c.val()));
    msgs.sort((a, b) => (a.ts || 0) - (b.ts || 0));
    renderConvMessages(msgs);
  }, handleError);

  // تصفير غير المقروء
  update(ref(db, `userChats/${me()}/${state.activeChat.chatId}`), { unread: 0 }).catch(() => {});
}

function updateConvHeader() {
  const ac = state.activeChat;
  if (!ac) return;
  const u = userOf(ac.withUid);
  if (!u) return;
  $('convAvatar').innerHTML = `<img src="${avatarSrc(u)}" alt="">`;
  $('convAvatar').className = `avatar sm ${u.gender === 'female' ? 'female' : 'male'}`;
  $('convName').textContent = u.name || 'عضو';
  const st = $('convStatus');
  st.textContent = lastSeenText(u);
  st.classList.toggle('online', !!u.online);
}

function renderConvMessages(msgs) {
  const box = $('convMessages');
  box.innerHTML = msgs.map(m => `
    <div class="msg ${m.from === me() ? 'mine' : ''}">
      <div class="msg-text">${escapeHtml(m.text)}</div>
      <div class="msg-time">${fmtTime(m.ts || Date.now())}</div>
    </div>`).join('') || `<div class="empty-msg">${icon('mail', 'big-ic')}<p>ابدأوا المحادثة — قول أول كلمة</p></div>`;
  box.scrollTop = box.scrollHeight;
}

$('convForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = $('convInput');
  const text = input.value.trim();
  if (!text || !state.activeChat) return;
  const { chatId, withUid } = state.activeChat;
  input.value = '';
  try {
    const msgRef = push(ref(db, `privateChats/${chatId}/messages`));
    const updates = {};
    updates[`privateChats/${chatId}/messages/${msgRef.key}`] = { from: me(), text, ts: serverTimestamp() };
    updates[`userChats/${me()}/${chatId}`] = { with: withUid, lastText: text, lastTime: serverTimestamp(), unread: 0 };
    updates[`userChats/${withUid}/${chatId}/with`] = me();
    updates[`userChats/${withUid}/${chatId}/lastText`] = text;
    updates[`userChats/${withUid}/${chatId}/lastTime`] = serverTimestamp();
    updates[`userChats/${withUid}/${chatId}/unread`] = increment(1);
    await update(ref(db), updates);
  } catch (err) { handleError(err); }
});

$('backToList').addEventListener('click', () => {
  $('chatsLayout').classList.remove('conv-open');
});

function renderChatsList() {
  const listEl = $('chatsList');
  const entries = Object.entries(state.userChats)
    .map(([chatId, meta]) => ({ chatId, ...meta }))
    .sort((a, b) => (b.lastTime || 0) - (a.lastTime || 0));

  let totalUnread = 0;

  if (!entries.length) {
    listEl.innerHTML = `<div class="empty-msg">${icon('mail', 'big-ic')}<p>مفيش محادثات لسه — ابدأ شات من صفحة الأعضاء</p></div>`;
  } else {
    listEl.innerHTML = entries.map(c => {
      const u = userOf(c.with);
      const unread = c.unread || 0;
      totalUnread += unread;
      const active = state.activeChat?.chatId === c.chatId;
      return `
        <div class="chat-item ${active ? 'active' : ''}" data-chatid="${c.chatId}" data-uid="${c.with}">
          ${avatarHTML(u, 'sm')}
          <div class="info">
            <div class="top"><span class="name">${escapeHtml(u?.name || 'عضو')}</span><span class="time">${timeAgo(c.lastTime)}</span></div>
            <div class="last">${escapeHtml(c.lastText || '')}</div>
          </div>
          ${unread > 0 ? `<span class="unread-dot">${unread > 99 ? '99+' : unread}</span>` : ''}
        </div>`;
    }).join('');
  }

  // شارة عدد الرسايل غير المقروءة
  const badge = $('msgsBadge');
  if (totalUnread > 0) {
    badge.textContent = totalUnread > 99 ? '99+' : totalUnread;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

$('chatsList').addEventListener('click', (e) => {
  const item = e.target.closest('.chat-item');
  if (!item) return;
  openChat(item.dataset.uid);
});

/* =====================================================
   نافذة الملف الشخصي
   ===================================================== */
function openProfileModal(uid) {
  const u = userOf(uid);
  if (!u) return;
  const liked = !!state.likesGiven[uid];
  const matched = liked && !!state.likesReceived[uid];
  $('modalBody').innerHTML = `
    <div class="profile-view">
      ${avatarHTML(u, 'xl')}
      <h2>${escapeHtml(u.name || 'عضو')} ${matched ? `<span class="match-inline">${icon('heart')}</span>` : ''}</h2>
      <div class="status-text ${u.online ? 'online' : ''}">${lastSeenText(u)}</div>
      <div class="info-chips">
        <span class="info-chip">${u.age || '؟'} سنة</span>
        <span class="info-chip blue">${icon('pin')} ${escapeHtml(u.city || 'غير محدد')}</span>
        <span class="info-chip">${genderLabel(u.gender)}</span>
        ${matched ? `<span class="info-chip match-chip">${icon('heart')} ماتش</span>` : ''}
      </div>
      ${u.bio ? `<div class="bio-box">${escapeHtml(u.bio)}</div>` : ''}
      <div class="modal-actions">
        <button class="outline-btn ${liked ? 'liked' : ''}" id="modalLikeBtn">${icon(liked ? 'heart' : 'heartO')} ${liked ? 'معجب' : 'إعجاب'}</button>
        <button class="primary-btn" id="modalChatBtn">${icon('chat')} محادثة</button>
      </div>
    </div>`;
  $('profileModal').classList.remove('hidden');
  $('modalLikeBtn').addEventListener('click', () => { toggleLike(uid); closeModal(); });
  $('modalChatBtn').addEventListener('click', () => { closeModal(); openChat(uid); });
}

function closeModal() { $('profileModal').classList.add('hidden'); }
$('modalClose').addEventListener('click', closeModal);
$('profileModal').addEventListener('click', (e) => { if (e.target === $('profileModal')) closeModal(); });

/* =====================================================
   صفحة حسابي
   ===================================================== */
function fillProfileForm() {
  const u = userOf(me());
  if (!u) return;
  $('profileEmail').textContent = u.email || state.user?.email || '';
  $('profileName').value = u.name || '';
  $('profileAge').value = u.age || 18;
  $('profileCity').value = CITIES.includes(u.city) ? u.city : 'أخرى';
  $('profileBio').value = u.bio || '';
  $('pGenderMale').checked = u.gender !== 'female';
  $('pGenderFemale').checked = u.gender === 'female';
  state.profileAvatar = (typeof u.avatar === 'string' && (/^https?:\/\//.test(u.avatar) || /^[mf][1-4]$/.test(u.avatar)))
    ? u.avatar
    : (u.gender === 'female' ? 'f1' : 'm1');
  buildAvatarPicker($('profileAvatars'), () => state.profileAvatar, a => state.profileAvatar = a);
}

$('profileForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = $('profileName').value.trim();
  const age = parseInt($('profileAge').value, 10);
  if (name.length < 2) return toast('اكتب اسم صحيح', 'error');
  if (!age || age < 18 || age > 99) return toast('السن لازم يكون بين 18 و 99', 'error');
  const btn = $('saveProfileBtn');
  btn.disabled = true; btn.textContent = 'جاري الحفظ...';
  try {
    await update(ref(db, 'users/' + me()), {
      name,
      age,
      city: $('profileCity').value,
      bio: $('profileBio').value.trim(),
      gender: $('pGenderFemale').checked ? 'female' : 'male',
      avatar: state.profileAvatar
    });
    toast('تم حفظ بياناتك بنجاح', 'success');
  } catch (err) { handleError(err); }
  finally { btn.disabled = false; btn.textContent = 'حفظ التعديلات'; }
});
