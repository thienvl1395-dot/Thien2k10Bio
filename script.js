"use strict";

if (window.lucide) {
  lucide.createIcons();
} else {

  window.addEventListener("load", () => {
    if (window.lucide) lucide.createIcons();
  });
}

function finishPresenceLoading() {
  const wrap = document.getElementById("avatar-wrap");
  if (wrap) wrap.classList.remove("is-loading");
  const desc = document.getElementById("kv-desc");
  if (desc) desc.classList.remove("is-loading");

  const line = document.getElementById("now-line");
  if (line && line.classList.contains("is-loading")) {
    line.classList.remove("is-loading");
    setNowLine("moon", "Currently not doing anything");
  }
}

function setAvatar(src) {
  const avatar = document.querySelector(".avatar");
  const wrap = document.getElementById("avatar-wrap");
  if (!avatar) {
    if (wrap) wrap.classList.remove("is-loading");
    return;
  }
  if (!src) {

    avatar.removeAttribute("src");
    avatar.classList.remove("is-ready");
    return;
  }
  if (avatar.getAttribute("src") === src) {
    avatar.classList.add("is-ready");
    if (wrap) wrap.classList.remove("is-loading");
    return;
  }
  avatar.classList.remove("is-ready");
  avatar.onload = () => {
    avatar.classList.add("is-ready");
    if (wrap) wrap.classList.remove("is-loading");
  };
  avatar.onerror = () => {

    avatar.removeAttribute("src");
    avatar.classList.remove("is-ready");
    if (wrap) wrap.classList.remove("is-loading");
  };
  avatar.src = src;
}

function setAvatarDecor(src) {
  let decor = document.querySelector(".avatar-decor");
  const wrap = document.getElementById("avatar-wrap");
  if (!src) {
    if (decor) decor.remove();
    return;
  }
  if (!decor && wrap) {
    decor = document.createElement("img");
    decor.className = "avatar-decor";
    decor.alt = "";
    decor.setAttribute("aria-hidden", "true");
    wrap.appendChild(decor);
  }
  if (decor && decor.getAttribute("src") !== src) decor.src = src;
}

function setDescription(text) {
  const desc = document.getElementById("kv-desc");
  if (!desc) return;
  desc.classList.remove("is-loading");
  desc.textContent = text && text.trim() ? text.trim() : "No status set";
}

const DISCORD_USER_ID = "1102948425126920242";

const PRESENCE_COLORS = {
  online: "#3ba55d",
  dnd: "#ed4245",
  idle: "#faa61a",
  offline: "#747f8d",
};

const PRESENCE_TEXT = {
  online: "Online",
  dnd: "Do Not Disturb",
  idle: "Idle",
  offline: "Offline",
};

function getStatusSVG(status) {
  const id = "thn_status_" + status;
  if (status === "online") {
    return '<svg viewBox="0 0 32 32" shape-rendering="geometricPrecision"><circle cx="16" cy="16" r="14" fill="#23a55a"/></svg>';
  }
  if (status === "idle") {
    return '<svg viewBox="0 0 32 32" shape-rendering="geometricPrecision"><mask id="' + id + '"><rect width="32" height="32" fill="white"/><circle cx="10" cy="10" r="7.5" fill="black"/></mask><circle cx="16" cy="16" r="14" fill="#f0b232" mask="url(#' + id + ')"/></svg>';
  }
  if (status === "dnd") {
    return '<svg viewBox="0 0 32 32" shape-rendering="geometricPrecision"><mask id="' + id + '"><rect width="32" height="32" fill="white"/><rect x="8" y="13.2" width="16" height="5.6" rx="2.8" fill="black"/></mask><circle cx="16" cy="16" r="14" fill="#f23f43" mask="url(#' + id + ')"/></svg>';
  }
  return '<svg viewBox="0 0 32 32" shape-rendering="geometricPrecision"><mask id="' + id + '"><rect width="32" height="32" fill="white"/><circle cx="16" cy="16" r="8" fill="black"/></mask><circle cx="16" cy="16" r="14" fill="#80848e" mask="url(#' + id + ')"/></svg>';
}

function setAvatarStatus(status) {
  const el = document.getElementById("avatar-status");
  if (!el) return;
  const safe = status in PRESENCE_COLORS ? status : "offline";
  el.setAttribute("title", PRESENCE_TEXT[safe]);
  el.innerHTML = getStatusSVG(safe);
}

function applyPresence(d) {
  const status =
    d.discord_status in PRESENCE_COLORS ? d.discord_status : "offline";

  const dot = document.getElementById("presence-dot");
  if (dot) {
    dot.dataset.status = status;
    dot.style.background = PRESENCE_COLORS[status];
    dot.dataset.tip = PRESENCE_TEXT[status];
  }

  const text = document.getElementById("presence-text");
  if (text) text.textContent = PRESENCE_TEXT[status];

  setAvatarStatus(status);

  const user = d.discord_user;
  if (user && user.avatar) {
    setAvatar(
      "https://cdn.discordapp.com/avatars/" +
        user.id +
        "/" +
        user.avatar +
        ".png?size=128"
    );
  } else {
    setAvatar(null);
  }

  if (
    user &&
    user.avatar_decoration_data &&
    user.avatar_decoration_data.asset
  ) {
    setAvatarDecor(
      "https://cdn.discordapp.com/avatar-decoration-presets/" +
        user.avatar_decoration_data.asset +
        ".png"
    );
  } else {
    setAvatarDecor(null);
  }

  if (d.kv && d.kv.desc) {
    setDescription(d.kv.desc);
  } else {
    setDescription("");
  }

  renderNow(d);
}

const NOW_GRACE_MS = 5 * 60 * 1000;
let lastNow = null;

function pickNow(d) {
  if (d && d.listening_to_spotify && d.spotify && d.spotify.song) {
    const artist = d.spotify.artist
      ? " — " + d.spotify.artist.replace(/; /g, ", ")
      : "";
    return { icon: "music", text: "Listening to " + d.spotify.song + artist };
  }
  const acts = (d && d.activities) || [];
  for (const a of acts) {
    if (!a || a.type === 4) continue;
    if (!a.name || a.name === "Spotify") continue;
    return { icon: "gamepad-2", text: "Playing " + a.name };
  }
  return null;
}

function setNowLine(icon, text) {
  const line = document.getElementById("now-line");
  if (!line) return;
  if (line.dataset.key === icon + "|" + text) return;
  line.dataset.key = icon + "|" + text;
  line.innerHTML = "";
  const i = document.createElement("i");
  i.setAttribute("data-lucide", icon);
  i.className = "now-icon";
  const s = document.createElement("span");
  s.textContent = text;
  line.appendChild(i);
  line.appendChild(s);
  if (window.lucide) lucide.createIcons();
}

function renderNow(d) {
  const line = document.getElementById("now-line");
  if (!line) return;
  line.classList.remove("is-loading");

  const now = Date.now();
  const fresh = pickNow(d);
  if (fresh) lastNow = { data: fresh, at: now };

  const current =
    fresh || (lastNow && now - lastNow.at < NOW_GRACE_MS ? lastNow.data : null);

  if (!current) {
    setNowLine("moon", "Currently not doing anything");
    return;
  }

  setNowLine(current.icon, current.text);
}

const localTimeFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Ho_Chi_Minh",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
});

function updateLocalTime() {
  const el = document.getElementById("local-time-text");
  if (el) el.textContent = localTimeFormat.format(new Date());
}

updateLocalTime();
setInterval(updateLocalTime, 1000);

setAvatarStatus("offline");

function setOffline() {
  applyPresence({ discord_status: "offline", activities: [] });
}

const PRESENCE_CACHE_KEY = "thn_presence_v1";

function readPresenceCache() {
  try {
    const raw = localStorage.getItem(PRESENCE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.data) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function writePresenceCache(data) {
  try {
    localStorage.setItem(PRESENCE_CACHE_KEY, JSON.stringify({ t: Date.now(), data }));
  } catch {}
}

try {
  const cachedPresence = readPresenceCache();
  if (cachedPresence) applyPresence(cachedPresence);
} catch {}

async function fetchPresence() {
  try {
    const res = await fetch(
      "https://api.lanyard.rest/v1/users/" + DISCORD_USER_ID
    );
    if (!res.ok) throw new Error("lanyard request failed");
    const json = await res.json();
    if (json.success && json.data) {
      applyPresence(json.data);
      writePresenceCache(json.data);
    }
    else finishPresenceLoading();
  } catch (err) {
    console.error(err);

    if (!readPresenceCache()) setOffline();
    else finishPresenceLoading();
  }
}

fetchPresence();

let ws = null;
let heartbeatTimer = null;
let reconnectTimer = null;

function openSocket() {
  if (ws && (ws.readyState === 0 || ws.readyState === 1)) return;

  ws = new WebSocket("wss://api.lanyard.rest/socket");

  ws.onopen = () => {
    ws.send(
      JSON.stringify({
        op: 2,
        d: { subscribe_to_id: DISCORD_USER_ID },
      })
    );
  };

  ws.onmessage = (event) => {
    let msg;
    try {
      msg = JSON.parse(event.data);
    } catch {
      return;
    }

    if (msg.op === 1 && msg.d && msg.d.heartbeat_interval) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = setInterval(() => {
        if (ws && ws.readyState === 1) {
          ws.send(JSON.stringify({ op: 3, d: null }));
        }
      }, msg.d.heartbeat_interval);
    }

    if (msg.op === 0 && msg.d) {
      if (msg.t === "INIT_STATE") {
        const data = msg.d[DISCORD_USER_ID] || msg.d;
        applyPresence(data);
        writePresenceCache(data);
      } else if (msg.t === "PRESENCE_UPDATE") {
        applyPresence(msg.d);
        writePresenceCache(msg.d);
      }
    }
  };

  ws.onclose = () => {
    ws = null;
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(openSocket, 5000);
  };

  ws.onerror = () => {
    try {
      ws.close();
    } catch {}
  };
}

function scheduleSocket() {
  const start = () => openSocket();
  if ("requestIdleCallback" in window) {
    requestIdleCallback(start, { timeout: 3000 });
  } else {
    window.addEventListener("load", () => setTimeout(start, 1500), { once: true });
  }
}

scheduleSocket();

const fullTitle = "Profile Link - @thn.wtf";
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

const REDUCE_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

(function () {
  const el = document.getElementById("tagline-text");
  if (!el || REDUCE_MOTION) return;
  const full = el.textContent;
  el.textContent = "";
  let i = 0;
  let deleting = false;
  (function tick() {
    if (!deleting) {
      el.textContent = full.slice(0, ++i);
      if (i >= full.length) {
        deleting = true;
        setTimeout(tick, 1800);
      } else {
        setTimeout(tick, 45);
      }
    } else {
      el.textContent = full.slice(0, --i);
      if (i <= 0) {
        deleting = false;
        setTimeout(tick, 500);
      } else {
        setTimeout(tick, 22);
      }
    }
  })();
})();

(function () {
  const wrap = document.getElementById("avatar-wrap");
  const hero = document.querySelector(".hero-top");
  if (!wrap || !hero || REDUCE_MOTION) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  wrap.style.transition = "transform 0.2s ease";
  hero.addEventListener("mousemove", (e) => {
    const r = wrap.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
    const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
    const x = Math.max(-0.5, Math.min(0.5, dx));
    const y = Math.max(-0.5, Math.min(0.5, dy));
    wrap.style.transform = "rotateY(" + (x * 14).toFixed(2) + "deg) rotateX(" + (-y * 14).toFixed(2) + "deg)";
  });
  hero.addEventListener("mouseleave", () => {
    wrap.style.transform = "";
  });
})();

(function () {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || REDUCE_MOTION) {
    els.forEach((el) => el.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
  );
  els.forEach((el) => io.observe(el));
})();

(function () {
  const links = Array.from(document.querySelectorAll(".nav-link[data-section]"));
  const sections = links
    .map((a) => document.getElementById(a.dataset.section))
    .filter(Boolean);
  if (!links.length || !sections.length) return;
  const OFFSET = 120;
  let ticking = false;

  function setActive(id) {
    links.forEach((a) => a.classList.toggle("active", a.dataset.section === id));
  }

  function update() {
    ticking = false;
    const atBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atBottom) {
      setActive(sections[sections.length - 1].id);
      return;
    }
    let current = sections[0].id;
    for (const s of sections) {
      if (s.getBoundingClientRect().top <= OFFSET) current = s.id;
    }
    setActive(current);
  }

  let lockUntil = 0;
  links.forEach((a) => {
    a.addEventListener("click", () => {
      setActive(a.dataset.section);
      lockUntil = Date.now() + 1000;
    });
  });

  window.addEventListener(
    "scroll",
    () => {
      if (Date.now() < lockUntil) return;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true }
  );
  window.addEventListener("resize", update);
  update();
})();

(function () {
  const loader = document.getElementById("loader");
  if (!loader) {
    document.body.classList.remove("locked");
    return;
  }
  let gone = false;
  function dismiss() {
    if (gone) return;
    gone = true;
    const gate = document.getElementById("enter");
    if (!gate || gate.classList.contains("done")) document.body.classList.remove("locked");
    loader.classList.add("done");
    setTimeout(() => loader.remove(), 600);
    if (gate && !gate.classList.contains("done")) setTimeout(() => gate.classList.add("show"), 350);
  }
  if (REDUCE_MOTION) {
    dismiss();
    return;
  }
  window.addEventListener("load", () => setTimeout(dismiss, 600));
  setTimeout(dismiss, 4000);
})();

(function () {
  const nav = document.querySelector(".navbar");
  if (nav) {
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }
  const btn = document.getElementById("menu-btn");
  const links = document.getElementById("nav-links");
  if (!btn || !links || !nav) return;
  function setOpen(open) {
    nav.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  btn.addEventListener("click", () => {
    setOpen(!nav.classList.contains("open"));
  });
  links.addEventListener("click", (e) => {
    if (e.target.closest("a")) setOpen(false);
  });
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target)) setOpen(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
  window.matchMedia("(min-width: 641px)").addEventListener("change", (e) => {
    if (e.matches) setOpen(false);
  });
})();
(function () {
  const audio = document.getElementById("music-audio");
  const bar = document.getElementById("musicbar");
  const btn = document.getElementById("music-btn");
  const prev = document.getElementById("music-prev");
  const next = document.getElementById("music-next");
  const cur = document.getElementById("music-cur");
  const dur = document.getElementById("music-dur");
  const track = document.getElementById("music-progress");
  const fill = document.getElementById("music-fill");
  const titleEl = document.getElementById("music-title");
  if (!audio || !bar || !btn || !track || !fill) return;
  const playlist = [
    { src: "nhac1.mp3", name: "Giải cứu thế giới" },
    { src: "nhac2.mp3", name: "Thương nhau đến thế" }
  ];
  let current = 0;
  function load(i, autoplay) {
    if (autoplay === undefined) autoplay = true;
    current = (i + playlist.length) % playlist.length;
    const item = playlist[current];
    if (audio.getAttribute("src") !== item.src) audio.setAttribute("src", item.src);
    if (titleEl) titleEl.textContent = item.name;
    if (autoplay) {
      const q = audio.play();
      if (q && q.catch) q.catch(() => sync());
    } else {
      sync();
    }
  }
  function fmt(s) {
    if (!isFinite(s) || s < 0) return "0:00";
    s = Math.floor(s);
    const m = Math.floor(s / 60);
    const r = s - m * 60;
    return m + ":" + (r < 10 ? "0" + r : "" + r);
  }
  function paintIcon(name) {
    btn.querySelectorAll("svg").forEach((n) => n.remove());
    const old = btn.querySelector("i[data-lucide]");
    if (old) old.remove();
    const i = document.createElement("i");
    i.setAttribute("data-lucide", name);
    i.setAttribute("id", "music-icon");
    btn.appendChild(i);
    if (window.lucide) lucide.createIcons();
  }
  function sync() {
    const playing = !audio.paused && !audio.ended;
    bar.classList.toggle("playing", playing);
    paintIcon(playing ? "pause" : "play");
    btn.setAttribute("aria-label", playing ? "Pause" : "Play");
  }
  function restart() {
    try {
      audio.currentTime = 0;
    } catch (err) {
      return;
    }
    const p = audio.play();
    if (p && p.catch) p.catch(() => sync());
  }
  btn.addEventListener("click", () => {
    if (audio.paused) {
      const p = audio.play();
      if (p && p.catch) p.catch(() => sync());
    } else {
      audio.pause();
    }
  });
  if (prev) prev.addEventListener("click", () => load(current - 1));
  if (next) next.addEventListener("click", () => load(current + 1));
  audio.addEventListener("play", sync);
  audio.addEventListener("pause", sync);
  audio.addEventListener("ended", () => {
    load(current + 1);
  });
  audio.addEventListener("loadedmetadata", () => {
    if (dur) dur.textContent = fmt(audio.duration);
    if (cur) cur.textContent = fmt(0);
  });
  audio.addEventListener("timeupdate", () => {
    const d = audio.duration;
    const c = audio.currentTime;
    if (cur) cur.textContent = fmt(c);
    if (dur) dur.textContent = isFinite(d) ? fmt(d) : "0:00";
    if (isFinite(d) && d > 0) {
      const pct = Math.max(0, Math.min(100, (c / d) * 100));
      fill.style.width = pct.toFixed(2) + "%";
      track.setAttribute("aria-valuenow", String(Math.round(pct)));
    }
  });
  audio.addEventListener("error", () => {
    sync();
    if (cur) cur.textContent = "0:00";
    if (dur) dur.textContent = "0:00";
  });
  track.addEventListener("click", (e) => {
    const d = audio.duration;
    if (!isFinite(d) || d <= 0) return;
    const r = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    try {
      audio.currentTime = ratio * d;
    } catch (err) {
      return;
    }
  });
  track.addEventListener("keydown", (e) => {
    const d = audio.duration;
    if (!isFinite(d)) return;
    if (e.key === "ArrowRight") audio.currentTime = Math.min(d, audio.currentTime + 5);
    if (e.key === "ArrowLeft") audio.currentTime = Math.max(0, audio.currentTime - 5);
  });
  sync();
})();
(function () {
  const gate = document.getElementById("enter");
  const audio = document.getElementById("music-audio");
  if (!gate) return;
  let out = false;
  function go() {
    if (out) return;
    out = true;
    gate.classList.add("done");
    document.body.classList.remove("locked");
    setTimeout(() => gate.remove(), 600);
    if (audio) {
      const p = audio.play();
      if (p && p.catch) p.catch(() => {});
    }
  }
  gate.addEventListener("click", go);
  gate.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      go();
    }
  });
})();
