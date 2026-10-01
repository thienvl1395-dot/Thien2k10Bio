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
  const links = Array.from(document.querySelectorAll('.nav-link[data-route], .navbar-logo[data-route]'));
  const navLinks = Array.from(document.querySelectorAll('.nav-link[data-route]'));
  const homeView = document.getElementById("view-home");
  const musicView = document.getElementById("view-music");
  if (!homeView || !musicView) return;

  function getRouteFromURL() {
    const h = (location.hash || "").toLowerCase();
    if (h.includes("music")) return "music";
    if (h.includes("home")) return "home";
    const p = (location.pathname || "").toLowerCase().replace(/\\/g, "/");
    const clean = p.replace(/\/index\.html?$/, "/").replace(/\/+$/, "");
    const last = clean.split("/").pop();
    if (last === "music") return "music";
    if (last === "home") return "home";
    return "home";
  }

  function isHttp() {
    return location.protocol === "http:" || location.protocol === "https:";
  }

  function setActive(route) {
    navLinks.forEach((a) => a.classList.toggle("active", a.dataset.route === route));
  }

  function revealIn(view) {
    view.querySelectorAll(".reveal:not(.in)").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight + 100) el.classList.add("in");
    });
    if (window.lucide) lucide.createIcons();
  }

  function showRoute(route, opts) {
    opts = opts || {};
    const r = route === "music" ? "music" : "home";
    homeView.hidden = r !== "home";
    musicView.hidden = r !== "music";
    setActive(r);
    if (!opts.keepScroll) window.scrollTo({ top: 0, behavior: "auto" });
    revealIn(r === "home" ? homeView : musicView);
    const want = r;
    if (isHttp()) {
      const base = location.pathname.replace(/(\/home\/?|\/music\/?|\/index\.html?|\/)$/, "/");
      const target = base + want;
      if (opts.replace || location.pathname.replace(/\/+$/, "") !== target.replace(/\/+$/, "")) {
        try {
          if (opts.replace) history.replaceState({ route: r }, "", target);
          else history.pushState({ route: r }, "", target);
        } catch {}
      }
    } else if ((location.hash || "") !== "#/" + want) {
      if (opts.replace) {
        try { history.replaceState({ route: r }, "", "#/" + want); }
        catch { location.hash = "#/" + want; }
      } else {
        location.hash = "#/" + want;
      }
    }
  }

  links.forEach((a) => {
    a.addEventListener("click", (e) => {
      const route = a.dataset.route === "music" ? "music" : "home";
      const href = a.getAttribute("href");
      if (href === "home" || href === "music" || (href && href.startsWith("#"))) e.preventDefault();
      showRoute(route);
    });
  });

  window.addEventListener("popstate", () => showRoute(getRouteFromURL(), { keepScroll: false }));
  window.addEventListener("hashchange", () => {
    if (!isHttp()) showRoute(getRouteFromURL(), { keepScroll: false });
  });

  const initial = getRouteFromURL();
  showRoute(initial, { replace: true, keepScroll: true });
  window.__showRoute = showRoute;
})();

(function () {
  const loader = document.getElementById("loader");
  if (!loader) {
    document.body.classList.remove("locked");
    return;
  }
  let gone = false;
  function isMusicRoute() {
    try {
      const mv = document.getElementById("view-music");
      if (mv && !mv.hidden) return true;
      const h = (location.hash || "").toLowerCase();
      if (h.includes("music")) return true;
      const p = (location.pathname || "").toLowerCase();
      if (p.replace(/\/+$/, "").endsWith("/music")) return true;
    } catch (_e) {}
    return false;
  }
  function dismiss() {
    if (gone) return;
    gone = true;
    const gate = document.getElementById("enter");
    if (isMusicRoute()) {
      try { if (gate) gate.remove(); } catch (_e) {}
      document.body.classList.remove("locked");
    } else {
      if (!gate || gate.classList.contains("done")) document.body.classList.remove("locked");
      if (gate && !gate.classList.contains("done")) setTimeout(() => gate.classList.add("show"), 350);
    }
    loader.classList.add("done");
    setTimeout(() => loader.remove(), 600);
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
  var DEFAULT_TRACKS = [
    { src: "nhac1.mp3", name: "Save the World" }
  ];
  var TRACKS_KEY = "thn_local_tracks_v1";
  function readTracks() {
    try {
      var raw = localStorage.getItem(TRACKS_KEY);
      if (!raw) return DEFAULT_TRACKS.slice();
      var arr = JSON.parse(raw);
      if (!Array.isArray(arr) || !arr.length) return DEFAULT_TRACKS.slice();
      var clean = arr
        .filter(function (t) { return t && typeof t.src === "string" && t.src && t.src.indexOf("blob:") !== 0; })
        .map(function (t) { return { src: t.src, name: (t.name || t.src || "Track").toString().slice(0, 80) }; });
      return clean.length ? clean : DEFAULT_TRACKS.slice();
    } catch (_e) {
      return DEFAULT_TRACKS.slice();
    }
  }
  function writeTracks(list) {
    try { localStorage.setItem(TRACKS_KEY, JSON.stringify(list)); } catch (_e) {}
  }
  var playlist = readTracks();
  var current = 0;
  var listEl = document.getElementById("local-track-list");
  function renderPublicList() {
    if (!listEl) return;
    listEl.innerHTML = "";
    if (!playlist.length) return;
    playlist.forEach(function (t, idx) {
      var row = document.createElement("button");
      row.type = "button";
      row.className = "music-admin-row music-public-row" + (idx === current ? " is-active" : "");
      row.setAttribute("aria-label", "Play " + (t.name || t.src));
      var num = document.createElement("span");
      num.className = "music-admin-num";
      num.textContent = String(idx + 1).padStart(2, "0");
      var name = document.createElement("span");
      name.className = "music-admin-name";
      name.textContent = t.name || t.src;
      name.title = t.name || t.src;
      var st = document.createElement("span");
      st.className = "music-public-state";
      st.innerHTML = idx === current
        ? '<span class="eq eq-mini"><span></span><span></span><span></span></span>'
        : '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
      row.appendChild(num);
      row.appendChild(name);
      row.appendChild(st);
      row.addEventListener("click", function () { load(idx); });
      listEl.appendChild(row);
    });
  }
  function updateNavButtons() {
    var multi = playlist.length > 1;
    if (prev) prev.style.display = multi ? "" : "none";
    if (next) next.style.display = multi ? "" : "none";
    try { audio.loop = !multi; } catch (_e) {}
  }
  updateNavButtons();
  function load(i, autoplay) {
    if (autoplay === undefined) autoplay = true;
    if (!playlist.length) return;
    current = ((i % playlist.length) + playlist.length) % playlist.length;
    var item = playlist[current];
    try {
      var curSrc = audio.getAttribute("src") || audio.currentSrc || "";
      if (curSrc !== item.src && audio.src !== item.src) audio.setAttribute("src", item.src);
    } catch (_e) {
      try { audio.setAttribute("src", item.src); } catch (_e2) {}
    }
    if (titleEl) titleEl.textContent = item.name;
    renderPublicList();
    if (autoplay) {
      var q = audio.play();
      if (q && q.catch) q.catch(function () { sync(); });
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
  if (prev) prev.addEventListener("click", () => {
    if (playlist.length > 1) load(current - 1);
    else restart();
  });
  if (next) next.addEventListener("click", () => {
    if (playlist.length > 1) load(current + 1);
    else restart();
  });
  audio.addEventListener("play", sync);
  audio.addEventListener("pause", sync);
  audio.addEventListener("ended", () => {
    if (playlist.length > 1) load(current + 1);
    else restart();
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
  load(0, false);
  sync();
  try {
    window.__musicAdmin = {
      getTracks: function () { return readTracks(); },
      setTracks: function (list) {
        writeTracks(list);
        playlist = readTracks();
        if (current >= playlist.length) current = 0;
        updateNavButtons();
        load(current, false);
        renderPublicList();
      },
      resetTracks: function () {
        writeTracks(DEFAULT_TRACKS);
        playlist = readTracks();
        current = 0;
        updateNavButtons();
        load(0, false);
        renderPublicList();
      },
      playAt: function (i) { load(i, true); },
      getCurrent: function () { return current; },
    };
  } catch (_e) {}
})();
(function () {
  const gate = document.getElementById("enter");
  const bg = document.getElementById("bg-audio");
  const btn = document.getElementById("bg-music-btn");
  let entered = false;

  function refreshBtnIcon() {
    if (!btn) return;
    const playing = bg && !bg.paused && !bg.ended;
    btn.querySelectorAll("svg").forEach((n) => n.remove());
    const old = btn.querySelector("i[data-lucide]");
    if (old) old.remove();
    const i = document.createElement("i");
    i.setAttribute("data-lucide", playing ? "volume-2" : "volume-x");
    btn.appendChild(i);
    btn.hidden = false;
    if (window.lucide) lucide.createIcons();
  }

  function tryPlay() {
    if (!bg) return;
    try {
      const p = bg.play();
      if (p && p.catch) p.catch(() => refreshBtnIcon());
    } catch (_e) {}
  }

  if (bg) {
    try { bg.loop = true; bg.volume = 0.9; } catch (_e) {}
    bg.addEventListener("play", refreshBtnIcon);
    bg.addEventListener("pause", refreshBtnIcon);
  }
  if (btn && bg) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (bg.paused) tryPlay();
      else try { bg.pause(); } catch (_e) {}
      refreshBtnIcon();
    });
    refreshBtnIcon();
    btn.hidden = true;
  }

  function isMusicRoute() {
    try {
      const mv = document.getElementById("view-music");
      if (mv && !mv.hidden) return true;
    } catch (_e) {}
    return false;
  }

  let out = false;
  function go(auto) {
    if (out) return;
    out = true;
    entered = true;
    if (gate) {
      gate.classList.add("done");
      document.body.classList.remove("locked");
      setTimeout(() => { try { gate.remove(); } catch (_e) {} }, 600);
    } else {
      document.body.classList.remove("locked");
    }
    if (btn) btn.hidden = false;
    if (!auto) tryPlay();
    else tryPlay();
    try { window.__enteredSite = true; } catch (_e) {}
  }

  function maybeAutoForMusic() {
    if (!isMusicRoute()) return;
    if (!gate && entered) { tryPlay(); return; }
    if (gate && !out) {
      out = true;
      entered = true;
      try { gate.remove(); } catch (_e) {}
      document.body.classList.remove("locked");
      if (btn) btn.hidden = false;
      tryPlay();
      const once = () => { tryPlay(); };
      window.addEventListener("pointerdown", once, { once: true });
      window.addEventListener("keydown", once, { once: true });
      try { window.__enteredSite = true; } catch (_e) {}
    } else if (out || entered) {
      tryPlay();
    }
  }

  try {
    const prevShow = window.__showRoute;
    if (typeof prevShow === "function") {
      window.__showRoute = function (route, opts) {
        const r = prevShow(route, opts);
        if (route === "music") maybeAutoForMusic();
        return r;
      };
    }
  } catch (_e) {}
  window.addEventListener("popstate", () => setTimeout(maybeAutoForMusic, 50));
  window.addEventListener("hashchange", () => setTimeout(maybeAutoForMusic, 50));
  document.addEventListener("click", (e) => {
    const a = e.target && e.target.closest ? e.target.closest('[data-route="music"]') : null;
    if (a) setTimeout(maybeAutoForMusic, 50);
  });

  if (!gate) return;
  if (isMusicRoute()) {
    maybeAutoForMusic();
    return;
  }
  gate.addEventListener("click", () => go(false));
  gate.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      go(false);
    }
  });
})();

(function () {
  const KEY = "thn_youtube_links_v1";
  const form = document.getElementById("yt-add-form");
  const urlInput = document.getElementById("yt-url");
  const titleInput = document.getElementById("yt-title");
  const coverInput = document.getElementById("yt-cover");
  const grid = document.getElementById("yt-grid");
  const empty = document.getElementById("yt-empty");
  const hint = document.getElementById("yt-hint");
  if (!form || !urlInput || !grid) return;

  function isAdmin() {
    try { return window.__isMusicAdmin === true; } catch (_e) { return false; }
  }

  function applyAdminVisibility() {
    var admin = isAdmin();
    try { form.style.display = admin ? "" : "none"; } catch (_e) {}
  }

  function parseYouTubeId(url) {
    try {
      const u = new URL(url.trim());
      const host = u.hostname.replace(/^www\./, "").toLowerCase();
      if (host === "youtu.be") {
        const id = u.pathname.split("/").filter(Boolean)[0];
        return id && /^[A-Za-z0-9_-]{6,}$/.test(id) ? id : null;
      }
      if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
        if (u.pathname === "/watch") {
          const id = u.searchParams.get("v");
          return id && /^[A-Za-z0-9_-]{6,}$/.test(id) ? id : null;
        }
        const m = u.pathname.match(/^\/(shorts|embed|live)\/([A-Za-z0-9_-]{6,})/);
        if (m) return m[2];
      }
      return null;
    } catch {
      return null;
    }
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  function save(list) {
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch {}
  }

  function thumb(id) {
    return "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg";
  }

  function coverSrc(item) {
    if (item && typeof item.cover === "string") {
      const c = item.cover.trim();
      if (/^https?:\/\/.+/i.test(c)) return c;
    }
    return thumb(item.id);
  }

  function watchUrl(id) {
    return "https://www.youtube.com/watch?v=" + id;
  }

  function openLink(item) {
    try {
      window.open(item.url, "_blank", "noopener");
    } catch (_e) {
      location.href = item.url;
    }
  }

  function render() {
    applyAdminVisibility();
    const list = load();
    grid.innerHTML = "";
    if (empty) empty.style.display = list.length ? "none" : "flex";
    const admin = isAdmin();
    list.forEach((item, idx) => {
      const card = document.createElement("div");
      card.className = "music-card in";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "music-thumb";
      btn.setAttribute("aria-label", "Play " + (item.title || item.id));
      const img = document.createElement("img");
      img.loading = "lazy";
      img.src = coverSrc(item);
      img.alt = item.title || item.id;
      img.onerror = () => {
        const fb = thumb(item.id);
        if (img.src !== fb) img.src = fb;
        else img.style.display = "none";
      };
      const play = document.createElement("span");
      play.className = "music-play";
      play.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
      btn.appendChild(img);
      btn.appendChild(play);
      btn.addEventListener("click", () => openLink(item));
      const meta = document.createElement("div");
      meta.className = "music-meta";
      const t = document.createElement("p");
      t.className = "music-name";
      t.textContent = item.title || item.id;
      t.title = item.title || item.url;
      const row = document.createElement("div");
      row.className = "music-row";
      const open = document.createElement("a");
      open.href = item.url;
      open.target = "_blank";
      open.rel = "noopener";
      open.className = "music-open";
      open.innerHTML = '<i data-lucide="external-link"></i><span>YouTube</span>';
      open.addEventListener("click", (e) => e.stopPropagation());
      const del = document.createElement("button");
      del.type = "button";
      del.className = "music-del";
      del.setAttribute("aria-label", "Delete link");
      del.innerHTML = '<i data-lucide="trash-2"></i>';
      del.addEventListener("click", () => {
        if (!isAdmin()) return;
        const cur = load();
        cur.splice(idx, 1);
        save(cur);
        render();
      });
      row.appendChild(open);
      if (admin) {
        const edit = document.createElement("button");
        edit.type = "button";
        edit.className = "music-del";
        edit.setAttribute("aria-label", "Edit cover / name");
        edit.title = "Edit cover / name";
        edit.innerHTML = '<i data-lucide="pencil"></i>';
        edit.addEventListener("click", (e) => {
          e.stopPropagation();
          const cur = load();
          const curItem = cur[idx];
          if (!curItem) return;
          const newTitle = (window.prompt("Track name:", curItem.title || "") || "").trim().slice(0, 80);
          if (newTitle) curItem.title = newTitle;
          const newCover = (window.prompt("Custom cover image link (leave empty for the default YouTube thumbnail):", curItem.cover || "") || "").trim();
          if (!newCover) delete curItem.cover;
          else if (/^https?:\/\/.+/i.test(newCover)) curItem.cover = newCover.slice(0, 500);
          else {
            window.alert("Invalid image link — must start with http(s)://");
            return;
          }
          save(cur);
          render();
        });
        row.appendChild(edit);
        row.appendChild(del);
      }
      meta.appendChild(t);
      meta.appendChild(row);
      card.appendChild(btn);
      card.appendChild(meta);
      grid.appendChild(card);
    });
    if (window.lucide) lucide.createIcons();
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!isAdmin()) return;
    const raw = urlInput.value.trim();
    const id = parseYouTubeId(raw);
    if (!id) {
      if (hint) {
        hint.textContent = "Invalid link — try youtube.com/watch?v=… or youtu.be/…";
        hint.classList.add("error");
      }
      urlInput.focus();
      return;
    }
    const custom = (titleInput.value || "").trim().slice(0, 80);
    const coverRaw = (coverInput && coverInput.value ? coverInput.value : "").trim().slice(0, 500);
    if (coverRaw && !/^https?:\/\/.+/i.test(coverRaw)) {
      if (hint) {
        hint.textContent = "Invalid cover image link — must start with http(s)://";
        hint.classList.add("error");
      }
      if (coverInput) coverInput.focus();
      return;
    }
    const list = load();
    if (list.some((x) => x.id === id)) {
      if (hint) {
        hint.textContent = "This link is already saved.";
        hint.classList.remove("error");
      }
      return;
    }
    const item = { id, url: watchUrl(id), title: custom || ("YouTube • " + id), at: Date.now() };
    if (coverRaw) item.cover = coverRaw;
    list.unshift(item);
    save(list);
    urlInput.value = "";
    titleInput.value = "";
    if (coverInput) coverInput.value = "";
    if (hint) {
      hint.textContent = "Saved. Click a card to open YouTube.";
      hint.classList.remove("error");
    }
    render();
  });

  applyAdminVisibility();
  render();
  try {
    window.addEventListener("music-admin-auth", render);
  } catch (_e) {}
})();

(function () {
  var DEFAULT_PASSWORD = "12082010";
  var PW_KEY = "thn_admin_pw_v1";
  var wrap = document.getElementById("music-admin-wrap");
  var closeBtn = document.getElementById("music-admin-close");
  var loginBox = document.getElementById("admin-login");
  var loginForm = document.getElementById("admin-login-form");
  var passInput = document.getElementById("admin-pass");
  var loginHint = document.getElementById("admin-login-hint");
  var panel = document.getElementById("admin-panel");
  var lockBtn = document.getElementById("admin-lock");
  if (!wrap) return;
  var authed = false;
  try { window.__isMusicAdmin = false; } catch (_e) {}

  function notifyAuth() {
    try {
      window.__isMusicAdmin = authed;
      window.dispatchEvent(new CustomEvent("music-admin-auth"));
    } catch (_e) {
      try { window.__isMusicAdmin = authed; } catch (_e2) {}
    }
  }

  function getPassword() {
    try {
      return localStorage.getItem(PW_KEY) || DEFAULT_PASSWORD;
    } catch (_e) {
      return DEFAULT_PASSWORD;
    }
  }

  function refreshIcons() {
    if (window.lucide) lucide.createIcons();
  }

  function showLogin() {
    authed = false;
    notifyAuth();
    if (loginBox) loginBox.hidden = false;
    if (panel) panel.hidden = true;
    if (loginHint) loginHint.textContent = "";
    if (passInput) {
      passInput.value = "";
      setTimeout(function () { try { passInput.focus(); } catch (_e) {} }, 60);
    }
    refreshIcons();
  }

  function showPanel() {
    authed = true;
    notifyAuth();
    if (loginBox) loginBox.hidden = true;
    if (panel) panel.hidden = false;
    refreshIcons();
  }

  function openAdmin() {
    try {
      if (window.__showRoute) window.__showRoute("music", { keepScroll: true });
    } catch (_e) {}
    wrap.hidden = false;
    if (!authed) showLogin();
    else showPanel();
    refreshIcons();
  }

  function closeAdmin() {
    wrap.hidden = true;
  }

  document.addEventListener("keydown", function (e) {
    var isQ = e.code === "KeyQ" || (e.key && e.key.toLowerCase() === "q");
    if (e.ctrlKey && e.shiftKey && isQ) {
      e.preventDefault();
      if (wrap.hidden) openAdmin();
      else closeAdmin();
    }
    if (e.key === "Escape" && !wrap.hidden) closeAdmin();
  });

  if (closeBtn) closeBtn.addEventListener("click", closeAdmin);
  if (wrap) {
    wrap.addEventListener("click", function (e) {
      if (e.target === wrap) closeAdmin();
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = (passInput.value || "").trim();
      if (v === getPassword()) {
        showPanel();
      } else {
        if (loginHint) {
          loginHint.textContent = "Wrong password. Try again.";
          loginHint.classList.add("error");
        }
        passInput.focus();
        passInput.select();
      }
    });
  }

  if (lockBtn) {
    lockBtn.addEventListener("click", showLogin);
  }
})();
