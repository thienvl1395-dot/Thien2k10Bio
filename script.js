document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
document.addEventListener('selectstart', function (e) { e.preventDefault(); });
['copy', 'cut', 'paste'].forEach(function (evt) {
  document.addEventListener(evt, function (e) { e.preventDefault(); });
});
document.addEventListener('keydown', function (e) {
  const key = e.key.toLowerCase();
  const isCtrlU = e.ctrlKey && !e.shiftKey && !e.altKey && key === 'u';
  const isCtrlShiftI = e.ctrlKey && e.shiftKey && key === 'i';
  if (isCtrlU || isCtrlShiftI) {
    e.preventDefault();
    window.location.href = 'https://youtu.be/nTCWLQCWbOc?si=qDF2-LWB948rNwQS';
    return false;
  }
  if (
    e.key === 'F12' ||
    (e.ctrlKey && e.shiftKey && ['j', 'c'].includes(key)) ||
    (e.ctrlKey && ['s'].includes(key))
  ) {
    e.preventDefault();
    return false;
  }
});

const fullTitle = "Bio Link - Thien 💤💤";
let charIndex = 0;
let isDeleting = false;
function animateTitle() {
  if (!isDeleting) {
    document.title = fullTitle.substring(0, charIndex + 1);
    charIndex++;
    if (charIndex === fullTitle.length) {
      isDeleting = true;
      setTimeout(animateTitle, 2000);
      return;
    }
  } else {
    document.title = fullTitle.substring(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      isDeleting = false;
      setTimeout(animateTitle, 800);
      return;
    }
  }
  setTimeout(animateTitle, isDeleting ? 100 : 160);
}
animateTitle();

(function () {
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  let w, h;
  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();
  const PARTICLE_COUNT = 34;
  function makeParticle() {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.8 + 0.6,
      speedY: Math.random() * 0.5 + 0.2,
      speedX: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.2
    };
  }
  const particles = Array.from({ length: PARTICLE_COUNT }, makeParticle);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function animateParticles() {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
      ctx.fill();
      if (!reduceMotion) {
        p.y += p.speedY;
        p.x += p.speedX;
        if (p.y > h + 5) { p.y = -5; p.x = Math.random() * w; }
        if (p.x > w + 5) p.x = -5;
        if (p.x < -5) p.x = w + 5;
      }
    }
    requestAnimationFrame(animateParticles);
  }
  animateParticles();
})();

(function () {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const bio = document.getElementById('bioContainer');
  const player = document.getElementById('musicPlayerBar');
  const social = document.getElementById('socialCosmos');
  const maxTilt = 5;
  function applyTilt(el, baseTransform) {
    return function (e) {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = (e.clientX - centerX) / (window.innerWidth / 2);
      const dy = (e.clientY - centerY) / (window.innerHeight / 2);
      const rotateY = dx * maxTilt;
      const rotateX = -dy * maxTilt;
      el.style.transform = `${baseTransform} perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };
  }
  document.addEventListener('mousemove', (e) => {
    applyTilt(bio, '')(e);
    applyTilt(player, 'translateX(-50%)')(e);
    if (social) applyTilt(social, '')(e);
  });
  document.addEventListener('mouseleave', () => {
    bio.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
    player.style.transform = 'translateX(-50%) perspective(900px) rotateX(0deg) rotateY(0deg)';
    if (social) social.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
  });
})();

(function () {
  const canvas = document.getElementById('constellationCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h;
  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COUNT = 70;
  const LINK_DIST = 130;
  const stars = Array.from({ length: COUNT }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 1.6 + 0.8,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    tw: Math.random() * Math.PI * 2
  }));
  function draw() {
    ctx.clearRect(0, 0, w, h);
    if (!reduceMotion) {
      for (const s of stars) {
        s.tw += 0.03;
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < -10) s.x = w + 10;
        if (s.x > w + 10) s.x = -10;
        if (s.y < -10) s.y = h + 10;
        if (s.y > h + 10) s.y = -10;
      }
    }
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          ctx.strokeStyle = `rgba(255,255,255,${(1 - dist / LINK_DIST) * 0.4})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(stars[i].x, stars[i].y);
          ctx.lineTo(stars[j].x, stars[j].y);
          ctx.stroke();
        }
      }
    }
    for (const s of stars) {
      const alpha = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(s.tw));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

(function () {
  const loadingOverlay = document.getElementById('loadingOverlay');
  const enterOverlay = document.getElementById('enterOverlay');
  const percentEl = document.getElementById('loadingPercent');
  const bgVideo = document.getElementById('bgVideo');

  let fakeProgress = 0;
  let videoReady = false;
  let finished = false;

  function setBar(pct) {
    const clamped = Math.max(0, Math.min(100, pct));
    percentEl.textContent = Math.round(clamped) + '%';
  }

  const progressTimer = setInterval(() => {
    if (finished) return;
    const ceiling = videoReady ? 100 : 92;
    const step = videoReady ? 6 : Math.max(0.4, (ceiling - fakeProgress) * 0.08);
    fakeProgress = Math.min(ceiling, fakeProgress + step);
    setBar(fakeProgress);
    if (videoReady && fakeProgress >= 100) finishLoading();
  }, 90);

  function finishLoading() {
    if (finished) return;
    finished = true;
    clearInterval(progressTimer);
    setBar(100);
    const welcomeEl = document.querySelector('.loading-welcome');
    if (welcomeEl) welcomeEl.innerText = 'Ready...';
    setTimeout(() => {
      loadingOverlay.classList.add('hidden');
      enterOverlay.classList.remove('hidden');
    }, 350);
  }

  function markVideoReady() {
    videoReady = true;
  }

  if (bgVideo) {
    if (bgVideo.readyState >= 3) {
      markVideoReady();
    } else {
      bgVideo.addEventListener('canplaythrough', markVideoReady, { once: true });
      bgVideo.addEventListener('error', markVideoReady, { once: true });
    }
  } else {
    markVideoReady();
  }

  setTimeout(() => {
    videoReady = true;
  }, 6000);
})();

const avatarUserId = "1102948425126920242";
const playlist = [
  { title: "Anh Là Ai", src: "nhac1.mp3" },
  { title: "Ai Đưa Em Về", src: "nhac2.mp3" }
];
let currentTrack = 0;
const audio = new Audio();
let isPlaying = false;

function initViewsCounter() {
  const viewsValueEl = document.getElementById('viewsValue');
  const deskViewsEl = document.getElementById('deskViews');
  const baseViews = 97;
  const API = 'https://countapi.mileshilliard.com/api/v1';

  function setText(n) {
    if (viewsValueEl) viewsValueEl.innerText = n;
    if (deskViewsEl) deskViewsEl.innerText = n;
  }

  setText(baseViews);

  function animate(total) {
    let current = baseViews;
    const target = Math.max(baseViews, total);
    setText(current);
    if (target <= current) return;
    const timer = setInterval(() => {
      current += 1;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      setText(current);
    }, 80);
  }

  const alreadyCounted = sessionStorage.getItem('counted_this_session');
  const url = alreadyCounted
    ? `${API}/get/bio_thn_views`
    : `${API}/hit/bio_thn_views`;

  fetch(url)
    .then(r => r.json())
    .then(data => {
      if (!alreadyCounted) sessionStorage.setItem('counted_this_session', '1');
      const apiValue = parseInt(data && data.value, 10) || 0;
      animate(baseViews + apiValue);
    })
    .catch(() => animate(baseViews));
}

function loadTrack(index) {
  currentTrack = index;
  audio.src = playlist[index].src;
  document.getElementById('songTitle').innerText = playlist[index].title;
  document.getElementById('progressFill').style.width = '0%';
  document.getElementById('currentTime').innerText = "0:00";
}
function playMusic() {
  audio.play().then(() => {
    isPlaying = true;
    document.getElementById('playBtn').className = "fa-solid fa-pause";
    document.getElementById('musicPlayerBar').classList.add('playing');
  }).catch(() => console.log("Cần click để phát nhạc"));
}
function pauseMusic() {
  audio.pause();
  isPlaying = false;
  document.getElementById('playBtn').className = "fa-solid fa-play";
  document.getElementById('musicPlayerBar').classList.remove('playing');
}

document.getElementById('enterOverlay').addEventListener('click', () => {
  document.getElementById('enterOverlay').classList.add('hidden');
  playMusic();
  const bgVideo = document.getElementById('bgVideo');
  if (bgVideo) bgVideo.play().catch(() => {});
});

document.getElementById('playBtn').addEventListener('click', () => {
  if (isPlaying) pauseMusic(); else playMusic();
});
document.getElementById('nextBtn').addEventListener('click', () => {
  currentTrack = (currentTrack + 1) % playlist.length;
  loadTrack(currentTrack);
  playMusic();
});
document.getElementById('prevBtn').addEventListener('click', () => {
  currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
  loadTrack(currentTrack);
  playMusic();
});

['prevBtn', 'playBtn', 'nextBtn'].forEach(id => {
  document.getElementById(id).addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.target.click(); }
  });
});

audio.addEventListener('timeupdate', () => {
  if (audio.duration) {
    const pct = (audio.currentTime / audio.duration) * 100;
    document.getElementById('progressFill').style.width = pct + '%';
    document.getElementById('currentTime').innerText = formatTime(audio.currentTime);
    document.getElementById('durationTime').innerText = formatTime(audio.duration);
  }
});
audio.addEventListener('ended', () => {
  currentTrack = (currentTrack + 1) % playlist.length;
  loadTrack(currentTrack);
  playMusic();
});

document.getElementById('progressBarBg').addEventListener('click', (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const pos = (e.clientX - rect.left) / rect.width;
  if (audio.duration) audio.currentTime = pos * audio.duration;
});

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

async function fetchDiscordData() {
  const deskAvatar = document.getElementById('deskAvatar');
  const deskStatusAvatar = document.getElementById('deskStatusAvatar');
  const deskStatusName = document.getElementById('deskStatusName');
  const deskStatusText = document.getElementById('deskStatusText');
  const statusMap = {
    online: '🔥 ONLINE - LEGENDARY STATUS 🔥',
    idle: '🌙 IDLE - RELAXING 🌙',
    dnd: '⛔ DND - BUSY ⛔',
    offline: 'OFFLINE - SLEEPING 💤'
  };
  try {
    const response = await fetch(`https://api.lanyard.rest/v1/users/${avatarUserId}`);
    const data = await response.json();
    if (data.success && data.data) {
      const user = data.data.discord_user;
      if (user.avatar) {
        const ext = user.avatar.startsWith("a_") ? "gif" : "png";
        const url = `https://cdn.discordapp.com/avatars/${avatarUserId}/${user.avatar}.${ext}?size=256`;
        document.getElementById('userAvatar').src = url;
        if (deskAvatar) deskAvatar.src = url;
        if (deskStatusAvatar) deskStatusAvatar.src = url;
      }
      const status = data.data.discord_status || 'offline';
      if (user.avatar_decoration_data) {
        const decoHash = user.avatar_decoration_data.asset;
        const decoUrl = `https://cdn.discordapp.com/avatar-decoration-presets/${decoHash}.png?size=240&passthrough=true`;
        const decoImg = document.getElementById('avatarDecoration');
        if (decoImg) {
          decoImg.src = decoUrl;
          decoImg.style.display = 'block';
        }
        const decoImgDesk = document.getElementById('avatarDecorationDesk');
        if (decoImgDesk) {
          decoImgDesk.src = decoUrl;
          decoImgDesk.style.display = 'block';
        }
      }
      document.getElementById('statusDot').className = 'status-dot ' + status;
      if (deskStatusName) deskStatusName.innerText = user.global_name || user.username || '@thn.wtf';
      if (deskStatusText) deskStatusText.innerText = statusMap[status] || statusMap.offline;
      const activities = (data.data.activities || []).filter(a => a.type !== 4);
      const activityBadge = document.getElementById('activityBadge');
      const activityIcon = document.getElementById('activityIcon');
      const activityText = document.getElementById('activityText');
      if (activities.length > 0) {
        const act = activities[0];
        const icons = { 0: '🎮︎', 1: '🔴', 2: '🎧︎ ', 3: '📺︎', 5: '🏆︎' };
        activityIcon.innerText = icons[act.type] || '✨︎';
        activityText.innerText = act.name;
        activityBadge.style.display = 'inline-flex';
      } else {
        activityBadge.style.display = 'none';
      }
    }
  } catch (err) {
    console.log("Không lấy được dữ liệu Discord");
  }
}

(function () {
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
  const dtDayEls = document.querySelectorAll('.datetime-day');
  const dtDateEls = document.querySelectorAll('.datetime-date');
  const dtTimeEls = document.querySelectorAll('.datetime-time');
  function pad(n) { return n < 10 ? '0' + n : n; }
  function updateClock() {
    const now = new Date();
    const dayText = dayNames[now.getDay()];
    const dateText = `${pad(now.getDate())}. ${monthNames[now.getMonth()]}, ${now.getFullYear()}.`;
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    const timeText = `${pad(hours)}:${pad(now.getMinutes())} ${ampm}`;
    dtDayEls.forEach(el => el.innerText = dayText);
    dtDateEls.forEach(el => el.innerText = dateText);
    dtTimeEls.forEach(el => el.innerText = timeText);
  }
  updateClock();
  setInterval(updateClock, 1000);
})();

loadTrack(0);
fetchDiscordData();
initViewsCounter();

