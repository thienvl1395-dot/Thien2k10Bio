document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
document.addEventListener('dragstart', function (e) { e.preventDefault(); });
document.addEventListener('drop', function (e) { e.preventDefault(); });
document.addEventListener('selectstart', function (e) { e.preventDefault(); });
['copy', 'cut', 'paste'].forEach(function (evt) {
  document.addEventListener(evt, function (e) { e.preventDefault(); });
});
document.addEventListener('keydown', function (e) {
  const key = e.key.toLowerCase();
  if (
    e.key === 'F12' ||
    (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(key)) ||
    (e.ctrlKey && ['u', 's'].includes(key))
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

// ---------- Particle background ----------
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

// ---------- 3D tilt on mousemove (desktop only) ----------
(function () {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const bio = document.getElementById('bioContainer');
  const player = document.getElementById('musicPlayerBar');
  const maxTilt = 8;
  function applyTilt(el, rect, baseTransform) {
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    return function (e) {
      const dx = (e.clientX - centerX) / (window.innerWidth / 2);
      const dy = (e.clientY - centerY) / (window.innerHeight / 2);
      const rotateY = dx * maxTilt;
      const rotateX = -dy * maxTilt;
      el.style.transform = `${baseTransform} perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };
  }
  document.addEventListener('mousemove', (e) => {
    applyTilt(bio, bio.getBoundingClientRect(), '')(e);
    applyTilt(player, player.getBoundingClientRect(), 'translateX(-50%)')(e);
  });
  document.addEventListener('mouseleave', () => {
    bio.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
    player.style.transform = 'translateX(-50%) perspective(900px) rotateX(0deg) rotateY(0deg)';
  });
})();

/*
 * Màn hình loading phong cách gaming:
 * - Thanh loading chạy giả lập (0 -> ~90%) trong lúc chờ video nền (bg.mp4)
 *   thực sự sẵn sàng để phát (sự kiện "canplaythrough").
 * - Khi video sẵn sàng, thanh nhảy lên 100%, giữ một nhịp ngắn rồi ẩn màn
 *   loading và hiện overlay "Click to enter" như cũ (để tuân thủ chính
 *   sách autoplay có âm thanh của trình duyệt).
 * - Có timeout dự phòng: nếu video lỗi hoặc tải quá lâu, vẫn tự động cho
 *   qua sau vài giây để không kẹt người dùng ở màn loading mãi.
 */
(function () {
  const loadingOverlay = document.getElementById('loadingOverlay');
  const enterOverlay = document.getElementById('enterOverlay');
  const barFill = document.getElementById('loadingBarFill');
  const percentEl = document.getElementById('loadingPercent');
  const bgVideo = document.getElementById('bgVideo');
  const dotsEl = document.getElementById('loadingDots');

  let fakeProgress = 0;
  let videoReady = false;
  let finished = false;

  const dotFrames = ['.', '..', '...'];
  let dotIndex = 0;
  const dotsTimer = setInterval(() => {
    dotIndex = (dotIndex + 1) % dotFrames.length;
    if (dotsEl) dotsEl.textContent = dotFrames[dotIndex];
  }, 400);

  function setBar(pct) {
    const clamped = Math.max(0, Math.min(100, pct));
    barFill.style.width = clamped + '%';
    percentEl.textContent = Math.round(clamped) + '%';
  }

  const progressTimer = setInterval(() => {
    if (finished) return;
    // Chạy nhanh lúc đầu, chậm dần khi gần ngưỡng chờ video thật sự sẵn sàng.
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
    clearInterval(dotsTimer);
    setBar(100);
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

  // Dự phòng: đừng để người dùng kẹt ở màn loading quá 6 giây.
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

/*
 * FIX lượt xem:
 * - Trước đây, số lượt xem hiển thị mặc định "94" viết cứng trong HTML,
 *   chỉ được cập nhật đúng giá trị SAU KHI người dùng bấm vào overlay
 *   "Click to enter" (vì hàm setupViewsCounter() chỉ được gọi trong
 *   listener của #enterOverlay). Nếu người dùng quay lại nhiều lần,
 *   con số thật lưu trong localStorage đã lớn hơn 94 rất nhiều,
 *   nhưng màn hình vẫn chớp ra "94" trong lúc chờ người dùng click,
 *   gây cảm giác sai số / giật số.
 * - Fix: hiển thị đúng số đã lưu (localStorage) ngay khi trang vừa tải,
 *   độc lập với việc người dùng có bấm overlay hay không. Việc cộng
 *   thêm 1 lượt xem (mỗi phiên/tab tính 1 lần nhờ sessionStorage) cũng
 *   chạy ngay khi tải trang, không cần chờ click nữa.
 */
function initViewsCounter() {
  const viewsValueEl = document.getElementById('viewsValue');
  if (!viewsValueEl) return;

  const baseViews = parseInt(localStorage.getItem('profile_views') || '94', 10) || 94;
  // Hiển thị ngay số đã lưu, tránh chớp về giá trị viết cứng cũ.
  viewsValueEl.innerText = baseViews;

  const alreadyCountedThisSession = sessionStorage.getItem('counted_this_session');
  if (alreadyCountedThisSession) return;

  const updatedViews = baseViews + 1;
  localStorage.setItem('profile_views', updatedViews.toString());
  sessionStorage.setItem('counted_this_session', '1');

  let current = baseViews;
  const target = updatedViews;
  const timer = setInterval(() => {
    current += 1;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    viewsValueEl.innerText = current;
  }, 80);
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
  try {
    const response = await fetch(`https://api.lanyard.rest/v1/users/${avatarUserId}`);
    const data = await response.json();
    if (data.success && data.data) {
      const user = data.data.discord_user;
      if (user.avatar) {
        const ext = user.avatar.startsWith("a_") ? "gif" : "png";
        document.getElementById('userAvatar').src = `https://cdn.discordapp.com/avatars/${avatarUserId}/${user.avatar}.${ext}?size=256`;
      }
      if (user.avatar_decoration_data) {
        const decoHash = user.avatar_decoration_data.asset;
        const decoImg = document.getElementById('avatarDecoration');
        decoImg.src = `https://cdn.discordapp.com/avatar-decoration-presets/${decoHash}.png?size=240&passthrough=true`;
        decoImg.style.display = 'block';
      }
      const statusDot = document.getElementById('statusDot');
      const status = data.data.discord_status || 'offline';
      statusDot.className = 'status-dot ' + status;
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
  const dtDay = document.getElementById('dtDay');
  const dtDate = document.getElementById('dtDate');
  const dtTime = document.getElementById('dtTime');
  function pad(n) { return n < 10 ? '0' + n : n; }
  function updateClock() {
    const now = new Date();
    dtDay.innerText = dayNames[now.getDay()];
    dtDate.innerText = `${pad(now.getDate())}. ${monthNames[now.getMonth()]}, ${now.getFullYear()}.`;
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    dtTime.innerText = `${pad(hours)}:${pad(now.getMinutes())} ${ampm}`;
  }
  updateClock();
  setInterval(updateClock, 1000);
})();

loadTrack(0);
fetchDiscordData();
initViewsCounter();
