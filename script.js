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
  activeRoom: null,     // { roomId, meta }
  rooms: {},            // roomId -> meta
  memberFilter: 'all',
  searchText: '',
  regAvatar: 'm1',
  profileAvatar: 'm1',
  likesListenerReady: false,
};
const unsubs = [];           // دوال إلغاء المستمعين
let chatMsgsUnsub = null;    // مستمع رسائل المحادثة المفتوحة
let roomMsgsUnsub = null;    // مستمع رسائل الغرفة المفتوحة
let roomOnlineUnsub = null;  // مستمع المتصلين في الغرفة المفتوحة

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

/* الوضع ده للمطوّر بس (أول ما الموقع بيفتح من الجهاز) — عشان نشوف تفاصيل الإعدادات.
   أي زائر عادي عمره ما يشوف أكواد فايربيز ولا القواعد. */
const IS_DEV = /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(location.hostname)
  || location.protocol === 'file:';

/* تنضيف أي رسالة قبل ما نوصلها للمستخدم:
   نمنع ظهور أكواد فايربيز ولا أسماء القواعد ولا تفاصيل سيرفر */
function sanitize(raw) {
  let s = String(raw || '');
  s = s.replace(/\b[a-z]+\/[a-z0-9-]+\b/gi, '');   // auth/xxx أو database/xxx
  s = s.replace(/\s+/g, ' ').trim();
  if (!s || /[{}";=<]/.test(s) || s.length < 4 || s.length > 110) return '';
  // أي كلام تقني داخلي (أخطاء جافاسكريبت، روابط، مسارات قواعد) ما يظهرش أبدًا
  if (/undefined|null\b|TypeError|ReferenceError|Cannot read|at position|Error:|https?:|\.(json|js)\b/i.test(s)) return '';
  return s;
}

/* هل الخطأ ده سببه إعدادات/قواعد فايربيز؟ */
function isSetupIssue(code, raw) {
  return code === 'PERMISSION_DENIED' ||
    code === 'permission-denied' ||
    code === 'auth/unauthorized-domain' ||
    code === 'auth/operation-not-allowed' ||
    code === 'auth/configuration-not-found' ||
    code === 'auth/admin-restricted-operation' ||
    /permission[_ -]denied|\.write rule|\.read rule/i.test(code + ' ' + raw);
}

const ERR_MSG = {
  /* —— تسجيل الدخول —— */
  'auth/invalid-email': 'الإيميل اللي كتبته مش صحيح — تأكد منه وحاول تاني',
  'auth/user-disabled': 'الحساب ده متوقف — كلّم إدارة الموقع',
  'auth/user-not-found': 'الإيميل أو كلمة المرور غير صحيحة',
  'auth/wrong-password': 'الإيميل أو كلمة المرور غير صحيحة',
  'auth/invalid-credential': 'الإيميل أو كلمة المرور غير صحيحة',
  'auth/too-many-requests': 'محاولات كتيرة ورا بعض — استنى شوية وحاول تاني',
  'auth/network-request-failed': 'مشكلة في الاتصال بالإنترنت — جرب تاني',
  /* —— إنشاء حساب —— */
  'auth/email-already-in-use': 'الإيميل ده مسجّل قبل كده — سجّل دخولك أو استعد كلمة المرور',
  'auth/weak-password': 'كلمة المرور ضعيفة — خليها 6 حروف على الأقل',
  'auth/missing-password': 'اكتب كلمة المرور الأول',
  /* —— جوجل —— */
  'auth/popup-closed-by-user': 'قفلت نافذة جوجل قبل ما تخلص الدخول',
  'auth/popup-blocked': 'المتصفح منع النافذة المنبثقة — اسمح بالنوافذ من إعدادات المتصفح وجرب تاني',
  'auth/cancelled-popup-request': '',
  'auth/account-exists-with-different-credential': 'الإيميل ده مسجّل بطريقة تانية — سجّل دخولك بالإيميل وكلمة المرور',
  /* —— استعادة كلمة المرور —— */
  'auth/missing-email': 'اكتب إيميلك الأول',
  'auth/quota-exceeded': 'عدد المحاولات خلص — استنى شوية وحاول تاني',
  'auth/invalid-action-code': 'اللينك ده منتهي أو مستخدم قبل كده — اطلب لينك جديد',
  'auth/expired-action-code': 'اللينك ده منتهي — اطلب لينك جديد'
};

/* رسالة واحدة ثابتة لكل حاجة مش متوقعة — مفيش أي تفاصيل تقنية بتظهر للزائر */
const GENERIC_ERROR = 'حصل خطأ غير متوقع — حاول تاني بعد شوية';

/* أي خطأ لازم يمر من هنا: التفاصيل الكاملة في الـ console للمطوّر بس */
function handleError(err, opts = {}) {
  const code = String(err?.code || err?.name || '');
  const raw = String(err?.message || '');
  if (IS_DEV) console.warn('[qolob]', code, raw, err);

  // حاجة مقصودة من المستخدم (قفل نافذة جوجل مثلاً) — نسكت خالص
  if (code === 'auth/cancelled-popup-request') return;

  // مشكلة إعدادات (طرق الدخول مش متفعّلة / الدومين مش مصرح بيه / قواعد الداتابيز)
  // الفحص ده قبل أي حاجة تانية عشان ميتلخبطش مع رسالة عامة
  if (isSetupIssue(code, raw)) {
    if (IS_DEV) {
      showSetupWarning();
      toast('في إعدادات ناقصة في Firebase — شوف صندوق التحذير فوق', 'error');
    } else {
      toast('فيه مشكلة تقنية في الموقع دلوقتي — جرب تاني بعد شوية', 'error');
    }
    return;
  }

  // الأخطاء المعروفة برسائل جاهزة وآمنة
  const msg = ERR_MSG[code];
  if (msg) { toast(msg, 'error'); return; }

  // مشكلة شبكة
  if (code === 'auth/network-request-failed' || (typeof navigator !== 'undefined' && navigator.onLine === false)) {
    toast('اتصال الإنترنت ضعيف — اتأكد من الشبكة وحاول تاني', 'error');
    return;
  }

  const fallback = opts.fallback || sanitize(raw);
  toast(fallback || GENERIC_ERROR, 'error');
}

/* =====================================================
   الوضع الليلي / النهاري
   ===================================================== */
const THEME_KEY = 'qolob_theme';

function readStoredTheme() {
  try { return localStorage.getItem(THEME_KEY) || 'auto'; } catch (_) { return 'auto'; }
}

function applyTheme(mode) {
  const systemDark = !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const dark = mode === 'dark' || (mode !== 'light' && systemDark);
  const html = document.documentElement;
  html.setAttribute('data-theme', dark ? 'dark' : 'light');
  html.style.colorScheme = dark ? 'dark' : 'light';
  // لون شريط المتصفح على الموبايل يمشي مع الثيم
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', dark ? '#150910' : '#ff5c8a');
  const label = dark ? 'التحويل للوضع النهاري' : 'التحويل للوضع الليلي';
  document.querySelectorAll('.theme-toggle, .theme-fab').forEach(btn => {
    btn.setAttribute('title', label);
    btn.setAttribute('aria-label', label);
    btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
  });
}

function toggleTheme() {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  const next = dark ? 'light' : 'dark';
  try { localStorage.setItem(THEME_KEY, next); } catch (_) {}
  applyTheme(next);
}

applyTheme(readStoredTheme());
['themeBtn', 'authThemeBtn', 'fabTheme'].forEach(id => {
  const b = $(id);
  if (b) b.addEventListener('click', toggleTheme);
});
// لو المستخدم غيّر ثيم نظامه وإحنا على "auto"
if (window.matchMedia) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const onSys = () => applyTheme(readStoredTheme());
  if (mq.addEventListener) mq.addEventListener('change', onSys);
  else if (mq.addListener) mq.addListener(onSys);
}

/* =====================================================
   شاشة التحميل
   ===================================================== */
function hideLoader() {
  const l = $('loader');
  if (l) l.classList.add('gone');
}
function showLoadFail() {
  const l = $('loader');
  if (!l) return;
  l.querySelector('p:not(.loader-fail)')?.classList.add('hidden');
  l.querySelector('.loader-fail')?.classList.remove('hidden');
}
// لو الشبكة قطعت أو السكربت مقدرش يتحمّل، نقول للمستخدم بدل شاشة فاضية
setTimeout(() => {
  if (!$('authScreen').classList.contains('hidden')) showLoadFail();
}, 12000);

/* =====================================================
   كيبورد الموبايل: نرفع القايمة السفلية فوق الكيبورد
   عشان مربع الكتابة ما يختفيش وإنت بتكتب
   ===================================================== */
if (window.visualViewport) {
  const onVp = () => {
    const kb = Math.max(0, Math.round(window.innerHeight - window.visualViewport.height));
    document.documentElement.style.setProperty('--kbd', kb > 60 ? kb + 'px' : '0px');
  };
  window.visualViewport.addEventListener('resize', onVp);
  window.visualViewport.addEventListener('scroll', onVp);
  window.addEventListener('orientationchange', onVp);
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
  const email = $('loginEmail').value.trim();
  const pass = $('loginPassword').value;
  if (!validEmail(email)) return toast('اكتب إيميل صحيح الأول (مثال: name@mail.com)', 'error');
  if (!pass) return toast('اكتب كلمة المرور', 'error');
  const btn = $('loginBtn');
  btn.disabled = true; btn.textContent = 'جاري الدخول...';
  try {
    await signInWithEmailAndPassword(auth, email, pass);
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
  if (!validEmail(email)) return toast('اكتب إيميل صحيح (مثال: name@mail.com)', 'error');
  if (!pass || pass.length < 6) return toast('كلمة المرور لازم تكون 6 حروف على الأقل', 'error');
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

/* =====================================================
   نسيت كلمة المرور — بيبعت لينك استعادة على الإيميل
   ===================================================== */
const FORGET_COOLDOWN_KEY = 'qolob_forgot_ts';

function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }

function openForgot() {
  const prefill = $('loginEmail').value.trim();
  $('forgotEmail').value = prefill;
  $('forgotModal').classList.remove('hidden');
  if (prefill) $('forgotSendBtn').focus(); else $('forgotEmail').focus();
}
function closeForgot() { $('forgotModal').classList.add('hidden'); }

$('forgotBtn').addEventListener('click', openForgot);
$('forgotClose').addEventListener('click', closeForgot);
$('forgotCancelBtn').addEventListener('click', closeForgot);
$('forgotModal').addEventListener('click', (e) => { if (e.target === $('forgotModal')) closeForgot(); });

$('forgotForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = $('forgotEmail').value.trim();
  if (!validEmail(email)) return toast('اكتب إيميل صحيح الأول (مثال: name@mail.com)', 'error');

  // منع السبام: طلب واحد كل 60 ثانية من نفس الجهاز
  let last = 0;
  try { last = parseInt(localStorage.getItem(FORGET_COOLDOWN_KEY) || '0', 10) || 0; } catch (_) {}
  const wait = Math.ceil((60000 - (Date.now() - last)) / 1000);
  if (wait > 0) return toast(`استنى ${wait} ثانية وبعدين اطلب تاني`, 'error');

  const btn = $('forgotSendBtn');
  btn.disabled = true;
  const old = btn.textContent;
  btn.textContent = 'جاري الإرسال...';
  try {
    await sendPasswordResetEmail(auth, email);
    try { localStorage.setItem(FORGET_COOLDOWN_KEY, String(Date.now())); } catch (_) {}
    // نفس الرسالة سواء الإيميل موجود أو لأ — عشان محدش يقدر يكتشف حسابات الناس
    toast('لو فيه حساب مسجل بالإيميل ده، هيوصلك لينك تغيير كلمة المرور خلال دقايق', 'success');
    closeForgot();
  } catch (err) {
    handleError(err, { fallback: 'مقدرناش نبعت اللينك دلوقتي — حاول تاني بعد شوية' });
  } finally {
    btn.disabled = false;
    btn.textContent = old;
  }
});

/* =====================================================
   إظهار / إخفاء كلمة المرور (مهم على الموبايل)
   ===================================================== */
document.querySelectorAll('.pass-eye').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = $(btn.dataset.target);
    if (!input) return;
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.classList.toggle('on', show);
    btn.setAttribute('aria-label', show ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور');
  });
});

/* =====================================================
   إغلاق النوافذ بزر الرجوع في الكيبورد
   ===================================================== */
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (!$('forgotModal').classList.contains('hidden')) return closeForgot();
  if (!$('profileModal').classList.contains('hidden')) return closeModal();
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
  hideLoader();
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

  // 5) الغرف
  unsubs.push(onValue(ref(db, 'rooms'), (snap) => {
    state.rooms = snap.val() || {};
    renderRooms();
  }, handleError));
}

function cleanupAll() {
  unsubs.forEach(u => { try { u(); } catch (_) {} });
  unsubs.length = 0;
  if (chatMsgsUnsub) { try { chatMsgsUnsub(); } catch (_) {} chatMsgsUnsub = null; }
  if (roomMsgsUnsub) { try { roomMsgsUnsub(); } catch (_) {} roomMsgsUnsub = null; }
  if (roomOnlineUnsub) { try { roomOnlineUnsub(); } catch (_) {} roomOnlineUnsub = null; }
  Object.assign(state, {
    user: null, users: {}, likesGiven: {}, likesReceived: {},
    userChats: {}, activeChat: null, activeRoom: null, rooms: {}, likesListenerReady: false
  });
  $('roomsGrid').innerHTML = '';
  $('roomMessages').innerHTML = '';
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
  if (tab === 'home') renderRooms();
  if (tab === 'members') renderMembers();
  if (tab === 'likes') renderLikes();
  if (tab === 'chats') { renderChatsList(); }
  if (tab === 'profile') fillProfileForm();
}

$('myChip').addEventListener('click', () => switchTab('profile'));

/* =====================================================
   الغرف - الصفحة الرئيسية
   ===================================================== */
$('openCreateRoom').addEventListener('click', () => {
  $('createRoomModal').classList.remove('hidden');
  $('roomName').focus();
});
$('createRoomClose').addEventListener('click', () => $('createRoomModal').classList.add('hidden'));

$('createRoomForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = $('roomName').value.trim();
  const desc = $('roomDesc').value.trim();
  if (name.length < 2) return toast('اسم الغرفة قصير جداً', 'error');

  const btn = $('createRoomBtn');
  btn.disabled = true; btn.textContent = 'جاري الإنشاء...';
  try {
    const roomRef = push(ref(db, 'rooms'));
    const roomId = roomRef.key;
    const roomData = {
      name, desc,
      creator: me(),
      createdAt: serverTimestamp()
    };
    await set(roomRef, roomData);
    $('createRoomModal').classList.add('hidden');
    $('createRoomForm').reset();
    toast('تم إنشاء الغرفة بنجاح', 'success');
    joinRoom(roomId, roomData);
  } catch (err) { handleError(err); }
  finally { btn.disabled = false; btn.textContent = 'إنشاء الغرفة ودخول'; }
});

function renderRooms() {
  const grid = $('roomsGrid');
  const list = Object.entries(state.rooms)
    .map(([id, r]) => ({ id, ...r }))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  $('roomCount').textContent = `${list.length} غرفة`;

  if (!list.length) {
    grid.innerHTML = `<div class="empty-msg"><svg class="ic big-ic" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg><p>لسه مفيش غرف.. اعمل أول غرفة دلوقتي!</p></div>`;
    return;
  }

  grid.innerHTML = list.map(r => `
    <div class="room-card" data-roomid="${r.id}">
      <div class="room-card-head">
        <h3>${escapeHtml(r.name)}</h3>
      </div>
      <p class="room-card-desc">${escapeHtml(r.desc || 'لا يوجد وصف لهذه الغرفة')}</p>
      <div class="room-card-footer">
        <button class="primary-btn join-room-btn">دخول الغرفة</button>
      </div>
    </div>
  `).join('');
}

$('roomsGrid').addEventListener('click', (e) => {
  const btn = e.target.closest('.join-room-btn');
  if (!btn) return;
  const roomId = btn.closest('.room-card')?.dataset.roomid;
  if (roomId) joinRoom(roomId);
});

/* =====================================================
   شات الغرفة
   ===================================================== */
async function joinRoom(roomId, roomData = null) {
  const room = roomData || state.rooms[roomId];
  if (!room) return;
  state.activeRoom = { roomId, ...room };
  
  switchTab('room-chat');
  $('currentRoomName').textContent = room.name;
  $('currentRoomDesc').textContent = room.desc || '';
  $('roomMessages').innerHTML = '';

  // تحديث الحضور في الغرفة
  const roomOnlineRef = ref(db, `rooms/${roomId}/online/${me()}`);
  set(roomOnlineRef, true).catch(() => {});
  onDisconnect(roomOnlineRef).remove();

  // مستمع المتصلين في الغرفة
  if (roomOnlineUnsub) roomOnlineUnsub();
  roomOnlineUnsub = onValue(ref(db, `rooms/${roomId}/online`), (snap) => {
    const count = snap.exists() ? Object.keys(snap.val()).length : 0;
    $('roomOnlineCount').innerHTML = `<i class="online-dot-inline"></i> ${count}`;
  });

  // مستمع الرسائل
  if (roomMsgsUnsub) roomMsgsUnsub();
  const q = query(ref(db, `roomMessages/${roomId}`), limitToLast(150));
  roomMsgsUnsub = onChildAdded(q, (snap) => {
    appendRoomMessage(snap.val());
  }, handleError);
}

$('leaveRoom').addEventListener('click', () => {
  if (state.activeRoom) {
    remove(ref(db, `rooms/${state.activeRoom.roomId}/online/${me()}`));
  }
  state.activeRoom = null;
  if (roomMsgsUnsub) roomMsgsUnsub();
  if (roomOnlineUnsub) roomOnlineUnsub();
  switchTab('home');
});

$('roomForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = $('roomInput');
  const text = input.value.trim();
  if (!text || !state.activeRoom) return;
  const u = userOf(me());
  const roomId = state.activeRoom.roomId;
  input.value = '';
  try {
    const msgRef = push(ref(db, `roomMessages/${roomId}`));
    await set(msgRef, {
      uid: me(),
      name: u?.name || 'عضو',
      gender: u?.gender || 'male',
      text,
      ts: serverTimestamp()
    });
  } catch (err) { handleError(err); }
});

function appendRoomMessage(m) {
  const box = $('roomMessages');
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
  while (box.children.length > 200) box.removeChild(box.firstChild);
  box.scrollTop = box.scrollHeight;
}

$('roomMessages').addEventListener('click', (e) => {
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

/* =====================================================
   شبكة أمان أخيرة: أي خطأ غير متوقع يظهر برسالة عامة
   (من غير ما نكشف تفاصيل تقنية للزائر)
   ===================================================== */
window.addEventListener('error', (e) => {
  if (IS_DEV) console.error('[qolob] uncaught', e.error || e.message);
});
window.addEventListener('unhandledrejection', (e) => {
  if (e.reason && (e.reason.code || e.reason.message)) return handleError(e.reason);
  if (IS_DEV) console.error('[qolob] unhandled rejection', e.reason);
});
