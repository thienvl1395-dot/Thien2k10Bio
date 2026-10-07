"use strict";

if (window.lucide) {
  lucide.createIcons();
} else {

  window.addEventListener("load", () => {
    if (window.lucide) lucide.createIcons();
  });
}


/* ===== Theme toggle (light / dark) ===== */
(function () {
  var KEY = "thn_theme";
  function current() {
    try { return localStorage.getItem(KEY) || "dark"; } catch (_e) { return "dark"; }
  }
  function apply(t) {
    document.body.classList.toggle("light", t === "light");
    document.documentElement.classList.remove("light-boot");
    var meta = document.getElementById("meta-theme");
    if (meta) meta.setAttribute("content", t === "light" ? "#f3f4f6" : "#0b0d0e");
    var btn = document.getElementById("theme-btn");
    if (btn) {
      btn.innerHTML = '<i data-lucide="' + (t === "light" ? "moon" : "sun") + '"></i>';
      btn.setAttribute("aria-label", t === "light" ? "Switch to dark theme" : "Switch to light theme");
      if (window.lucide) lucide.createIcons();
    }
  }
  function toggle(e) {
    var next = current() === "light" ? "dark" : "light";
    var btn = document.getElementById("theme-btn");
    if (btn) {
      btn.classList.add("theme-switching");
      setTimeout(function () { btn.classList.remove("theme-switching"); }, 450);
    }

    var isReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || isReduced) {
      try { localStorage.setItem(KEY, next); } catch (_e) {}
      apply(next);
      return;
    }

    var rect = btn ? btn.getBoundingClientRect() : null;
    var x = e && typeof e.clientX === "number" && e.clientX > 0 ? e.clientX : (rect ? rect.left + rect.width / 2 : window.innerWidth - 30);
    var y = e && typeof e.clientY === "number" && e.clientY > 0 ? e.clientY : (rect ? rect.top + rect.height / 2 : 30);
    var endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    document.documentElement.classList.add("theme-transition");
    var transition = document.startViewTransition(function () {
      try { localStorage.setItem(KEY, next); } catch (_e) {}
      apply(next);
    });

    transition.ready.then(function () {
      document.documentElement.animate(
        {
          clipPath: [
            "circle(0px at " + x + "px " + y + "px)",
            "circle(" + endRadius + "px at " + x + "px " + y + "px)"
          ]
        },
        {
          duration: 480,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          pseudoElement: "::view-transition-new(root)"
        }
      );
    });

    transition.finished.finally(function () {
      document.documentElement.classList.remove("theme-transition");
    });
  }
  function init() {
    apply(current());
    var btn = document.getElementById("theme-btn");
    if (btn) btn.addEventListener("click", toggle);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();

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
  try { renderRpcCard(d); } catch (_e) {}
}


/* ===== Discord RPC activity card (Spotify / game với ảnh lớn) ===== */
var __rpcState = null;
var __rpcTimer = null;

function resolveAssetUrl(appId, asset) {
  if (!asset) return null;
  if (asset.indexOf("mp:") === 0) return "https://media.discordapp.net/" + asset.slice(3);
  if (asset.indexOf("spotify:") === 0) return null;
  if (appId) return "https://cdn.discordapp.com/app-assets/" + appId + "/" + asset + ".png";
  return null;
}

function fmtDur(ms) {
  if (!isFinite(ms) || ms < 0) ms = 0;
  var s = Math.floor(ms / 1000);
  var m = Math.floor(s / 60);
  var h = Math.floor(m / 60);
  m = m % 60;
  var secStr = ("0" + (s % 60)).slice(-2);
  if (h > 0) {
    return h + ":" + ("0" + m).slice(-2) + ":" + secStr;
  }
  return m + ":" + secStr;
}

function updateRpcTime() {
  var info = __rpcState;
  var slot = document.getElementById("rpc-slot");
  if (!info || !slot || !slot.firstChild) return;
  var el = slot.querySelector(".rpc-elapsed");
  var tot = slot.querySelector(".rpc-total");
  if (!el || !info.start) return;
  var now = Date.now();
  var elapsed = now - info.start;
  if (info.end && info.end > info.start) {
    el.textContent = fmtDur(elapsed);
    if (tot) tot.textContent = fmtDur(info.end - info.start);
  } else {
    el.textContent = fmtDur(elapsed) + " elapsed";
    if (tot) tot.textContent = "";
  }
}

function renderRpcCard(d) {
  var slot = document.getElementById("rpc-slot");
  if (!slot) return;
  var info = null;

  if (d && d.listening_to_spotify && d.spotify && d.spotify.song) {
    var ts = d.spotify.timestamps || {};
    info = {
      kind: "spotify",
      label: "Listening to Spotify",
      icon: "music",
      art: d.spotify.album_art_url || null,
      title: d.spotify.song,
      sub: (d.spotify.artist || "").replace(/; /g, ", ") + (d.spotify.album ? " · " + d.spotify.album : ""),
      start: ts.start || null,
      end: ts.end || null,
    };
  } else {
    var acts = (d && d.activities) || [];
    for (var i = 0; i < acts.length; i++) {
      var a = acts[i];
      if (!a || a.type === 4 || !a.name || a.name === "Spotify") continue;
      var art = a.assets ? resolveAssetUrl(a.application_id, a.assets.large_image) : null;
      var verb = a.type === 0 ? "Playing" : a.type === 2 ? "Listening to" : a.type === 3 ? "Watching" : "Using";
      info = {
        kind: "activity",
        label: verb,
        icon: a.type === 0 ? "gamepad-2" : a.type === 3 ? "tv" : "app-window",
        art: art,
        title: a.name,
        sub: [a.details, a.state].filter(Boolean).join(" · "),
        start: a.timestamps && a.timestamps.start ? a.timestamps.start : null,
        end: a.timestamps && a.timestamps.end ? a.timestamps.end : null,
      };
      break;
    }
  }

  if (!info) {
    __rpcState = null;
    if (__rpcTimer) { clearInterval(__rpcTimer); __rpcTimer = null; }
    slot.innerHTML = "";
    return;
  }

  var same = __rpcState && __rpcState.title === info.title && __rpcState.kind === info.kind && __rpcState.sub === info.sub && __rpcState.start === info.start;
  if (same && slot.firstChild) {
    updateRpcTime();
    return;
  }
  __rpcState = info;

  slot.innerHTML = "";
  var card = document.createElement("div");
  card.className = "rpc-card";

  var art = document.createElement("div");
  art.className = "rpc-art" + (info.kind === "spotify" ? " is-spotify" : "");
  if (info.art) {
    var img = document.createElement("img");
    img.src = info.art;
    img.alt = "";
    img.loading = "lazy";
    art.appendChild(img);
  } else {
    var ic = document.createElement("i");
    ic.setAttribute("data-lucide", info.icon);
    art.appendChild(ic);
  }

  var wrap = document.createElement("div");
  wrap.className = "rpc-info";
  var label = document.createElement("span");
  label.className = "rpc-label";
  label.innerHTML = '<i data-lucide="' + info.icon + '"></i>';
  var labelText = document.createElement("span");
  labelText.textContent = info.label;
  label.appendChild(labelText);
  var title = document.createElement("p");
  title.className = "rpc-title";
  title.textContent = info.title;
  wrap.appendChild(label);
  wrap.appendChild(title);
  if (info.sub) {
    var sub = document.createElement("p");
    sub.className = "rpc-sub";
    sub.textContent = info.sub;
    wrap.appendChild(sub);
  }
  if (info.start) {
    var time = document.createElement("div");
    time.className = "rpc-time";
    time.innerHTML = '<span class="rpc-elapsed"></span><span class="rpc-total"></span>';
    wrap.appendChild(time);
  }

  card.appendChild(art);
  card.appendChild(wrap);
  slot.appendChild(card);
  if (window.lucide) lucide.createIcons();
  updateRpcTime();

  if (info.start && !__rpcTimer) {
    __rpcTimer = setInterval(updateRpcTime, 1000);
  } else if (!info.start && __rpcTimer) {
    clearInterval(__rpcTimer);
    __rpcTimer = null;
  }
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

// Avatar tilt on mousemove removed to eliminate lag and cursor tracking

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

  const ROUTES = ["home", "music", "guestbook"];
  function getRouteFromURL() {
    const h = (location.hash || "").toLowerCase();
    for (const r of ROUTES) if (h.includes(r)) return r;
    const p = (location.pathname || "").toLowerCase().replace(/\\/g, "/");
    const clean = p.replace(/\/index\.html?$/, "/").replace(/\/+$/, "");
    const last = clean.split("/").pop();
    if (ROUTES.indexOf(last) !== -1) return last;
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

  const guestbookView = document.getElementById("view-guestbook");
  const VIEWS = { home: homeView, music: musicView, guestbook: guestbookView };
  let currentActiveRoute = null;

  function showRoute(route, opts) {
    opts = opts || {};
    const r = ROUTES.indexOf(route) !== -1 ? route : "home";
    const prevRoute = currentActiveRoute;
    currentActiveRoute = r;

    const oldIdx = ROUTES.indexOf(prevRoute);
    const newIdx = ROUTES.indexOf(r);
    const dir = newIdx >= oldIdx ? "forward" : "back";

    const updateDOM = () => {
      Object.keys(VIEWS).forEach(function (k) { if (VIEWS[k]) VIEWS[k].hidden = k !== r; });
      const incoming = VIEWS[r];
      if (!REDUCE_MOTION && incoming) {
        incoming.classList.remove("view-enter-fwd", "view-enter-back", "view-enter-l", "view-enter-r");
        void incoming.offsetWidth;
        incoming.classList.add(dir === "forward" ? "view-enter-fwd" : "view-enter-back");
      }
      setActive(r);
      if (!opts.keepScroll) window.scrollTo({ top: 0, behavior: "smooth" });
      if (incoming) revealIn(incoming);
      try { document.dispatchEvent(new CustomEvent("route-change", { detail: r })); } catch (_e) {}
    };

    if (document.startViewTransition && !REDUCE_MOTION && prevRoute && prevRoute !== r) {
      document.startViewTransition(updateDOM);
    } else {
      updateDOM();
    }
    const want = r;
    if (isHttp()) {
      const base = location.pathname.replace(/(\/home\/?|\/music\/?|\/guestbook\/?|\/index\.html?|\/)$/, "/");
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
      const route = a.dataset.route || "home";
      const href = a.getAttribute("href");
      if (
        href === "home" ||
        href === "music" ||
        href === "guestbook" ||
        href === "/home" ||
        href === "/music" ||
        href === "/guestbook" ||
        (href && href.startsWith("#"))
      )
        e.preventDefault();
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
    bg.addEventListener("ended", () => {
      try {
        bg.currentTime = 0;
      } catch (_e) {}
      tryPlay();
    });
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

  function readLocal() {
    try {
      const raw = localStorage.getItem(KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.filter(Boolean) : [];
    } catch {
      return [];
    }
  }

  let list = readLocal();

  function load() {
    return list;
  }

  function save(next) {
    if (Array.isArray(next)) list = next;
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch {}
  }

  function cleanItem(t) {
    if (!t || typeof t !== "object") return null;
    const id = typeof t.id === "string" ? t.id.trim() : "";
    if (!/^[A-Za-z0-9_-]{6,}$/.test(id)) return null;
    const item = {
      id,
      url:
        typeof t.url === "string" && /^https?:\/\/.+/i.test(t.url)
          ? t.url.slice(0, 500)
          : "https://www.youtube.com/watch?v=" + id,
      title: (
        typeof t.title === "string" && t.title.trim()
          ? t.title.trim()
          : "YouTube • " + id
      ).slice(0, 80),
      at: typeof t.at === "number" ? t.at : Date.now(),
    };
    if (
      typeof t.cover === "string" &&
      /^https?:\/\/.+/i.test(t.cover.trim())
    ) {
      item.cover = t.cover.trim().slice(0, 500);
    }
    return item;
  }

  function fetchShared() {
    const urls = ["music.json", "./music.json", "/music.json"];
    let i = 0;
    function next() {
      if (i >= urls.length) return Promise.resolve(null);
      const u = urls[i++];
      return fetch(u, { cache: "no-store" }).then(
        (res) => {
          if (!res.ok) return next();
          return res.json().then(
            (arr) => {
              if (!Array.isArray(arr)) return next();
              return arr.map(cleanItem).filter(Boolean);
            },
            () => next()
          );
        },
        () => next()
      );
    }
    return next();
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
    var modal = document.getElementById("yt-embed");
    var frame = document.getElementById("yt-embed-frame");
    var title = document.getElementById("yt-embed-title");
    if (!modal || !frame) {
      try { window.open(item.url, "_blank", "noopener"); } catch (_e) { location.href = item.url; }
      return;
    }
    frame.src = "https://www.youtube-nocookie.com/embed/" + item.id + "?autoplay=1&rel=0";
    if (title) title.textContent = item.title || item.id;
    modal.hidden = false;
    if (window.lucide) lucide.createIcons();
  }
  (function () {
    var modal = document.getElementById("yt-embed");
    var frame = document.getElementById("yt-embed-frame");
    var closeBtn = document.getElementById("yt-embed-close");
    if (!modal || !frame) return;
    function close() {
      modal.hidden = true;
      try { frame.src = ""; } catch (_e) {}
    }
    if (closeBtn) closeBtn.addEventListener("click", close);
    modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !modal.hidden) close();
    });
  })();

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

  form.addEventListener("submit", async (e) => {
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
    let custom = (titleInput.value || "").trim().slice(0, 80);
    if (!custom) {
      try {
        const r = await fetch("https://noembed.com/embed?url=" + encodeURIComponent("https://www.youtube.com/watch?v=" + id));
        const meta = await r.json();
        if (meta && meta.title) {
          custom = String(meta.title).slice(0, 80);
          titleInput.value = custom;
        }
      } catch (_e) {}
    }
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
  fetchShared().then((shared) => {
    if (!shared || !shared.length) return;
    const seen = new Set(list.map((x) => x && x.id));
    let added = false;
    shared.forEach((item) => {
      if (item && !seen.has(item.id)) {
        list.push(item);
        seen.add(item.id);
        added = true;
      }
    });
    if (added) {
      save(list);
      render();
    }
  });
  try {
    window.__exportMusicJSON = function () {
      return JSON.stringify(load(), null, 2);
    };
  } catch (_e) {}
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
  var copyBtn = document.getElementById("admin-copy-json");
  var dlBtn = document.getElementById("admin-dl-json");
  var exportHint = document.getElementById("admin-export-hint");
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
    setExportHint("");
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

  function setExportHint(msg, isErr) {
    if (!exportHint) return;
    exportHint.textContent = msg;
    exportHint.classList.toggle("error", !!isErr);
  }

  function getExportJSON() {
    try {
      if (typeof window.__exportMusicJSON === "function") {
        return window.__exportMusicJSON();
      }
    } catch (_e) {}
    return "[]";
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var json = getExportJSON();
      function done(ok) {
        setExportHint(
          ok
            ? "Copied! Paste it into music.json and redeploy."
            : "Copy failed — use Download instead.",
          !ok
        );
        refreshIcons();
      }
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(json).then(
            function () {
              done(true);
            },
            function () {
              done(false);
            }
          );
        } else {
          var ta = document.createElement("textarea");
          ta.value = json;
          document.body.appendChild(ta);
          ta.select();
          var ok = false;
          try {
            ok = document.execCommand("copy");
          } catch (_e) {
            ok = false;
          }
          ta.remove();
          done(ok);
        }
      } catch (_e) {
        done(false);
      }
    });
  }

  if (dlBtn) {
    dlBtn.addEventListener("click", function () {
      try {
        var blob = new Blob([getExportJSON()], { type: "application/json" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "music.json";
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
          try {
            URL.revokeObjectURL(a.href);
            a.remove();
          } catch (_e) {}
        }, 500);
        setExportHint(
          "Downloaded. Replace music.json in the project and redeploy.",
          false
        );
      } catch (_e) {
        setExportHint("Download failed.", true);
      }
      refreshIcons();
    });
  }
})();

(function () {
  var GB_CONFIG = {
    SUPABASE_URL: "https://rwdkkxaqcifuccsxojzf.supabase.co",
    SUPABASE_ANON_KEY: "sb_publishable_ifa-YskPqGY2o50uC-5cAA_S3EqvPGS",
    TABLE: "guestbook",
  };

  var form = document.getElementById("gb-form");
  var nameEl = document.getElementById("gb-name");
  var msgEl = document.getElementById("gb-msg");
  var listEl = document.getElementById("gb-list");
  var emptyEl = document.getElementById("gb-empty");
  var countEl = document.getElementById("gb-count");
  var hintEl = document.getElementById("gb-hint");
  if (!form || !msgEl || !listEl) return;

  function hasSupabase() {
    return Boolean(
      GB_CONFIG.SUPABASE_URL &&
        GB_CONFIG.SUPABASE_ANON_KEY &&
        GB_CONFIG.SUPABASE_URL.indexOf("http") === 0 &&
        GB_CONFIG.SUPABASE_ANON_KEY.length > 20
    );
  }

  function formatTime(iso) {
    try {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    } catch (_e) {
      return "";
    }
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderList(items) {
    listEl.innerHTML = "";
    if (countEl) countEl.textContent = items.length ? "(" + items.length + ")" : "";
    if (emptyEl) emptyEl.hidden = items.length > 0;
    items.forEach(function (row) {
      var card = document.createElement("div");
      card.className = "gb-item";
      var time = formatTime(row.created_at);
      card.innerHTML =
        '<div class="gb-head"><span class="gb-author"></span><span class="gb-time"></span></div><p class="gb-body"></p>';
      card.querySelector(".gb-author").textContent = row.name && row.name.trim() ? row.name.trim() : "Anonymous";
      card.querySelector(".gb-time").textContent = time;
      card.querySelector(".gb-body").textContent = row.message || "";
      listEl.appendChild(card);
    });
  }

  function loadLocal() {
    try {
      var raw = localStorage.getItem("thn_gb_messages");
      return raw ? JSON.parse(raw) : [];
    } catch (_e) {
      return [];
    }
  }

  function saveLocal(list) {
    try {
      localStorage.setItem("thn_gb_messages", JSON.stringify(list));
    } catch (_e) {}
  }

  async function fetchRemote() {
    var url =
      GB_CONFIG.SUPABASE_URL.replace(/\/+$/, "") +
      "/rest/v1/" +
      GB_CONFIG.TABLE +
      "?select=name,message,created_at&order=created_at.desc&limit=50";
    var res = await fetch(url, {
      headers: {
        apikey: GB_CONFIG.SUPABASE_ANON_KEY,
        Authorization: "Bearer " + GB_CONFIG.SUPABASE_ANON_KEY,
      },
    });
    if (!res.ok) throw new Error("Supabase fetch failed: " + res.status);
    return res.json();
  }

  async function insertRemote(name, message) {
    var url = GB_CONFIG.SUPABASE_URL.replace(/\/+$/, "") + "/rest/v1/" + GB_CONFIG.TABLE;
    var res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: GB_CONFIG.SUPABASE_ANON_KEY,
        Authorization: "Bearer " + GB_CONFIG.SUPABASE_ANON_KEY,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        name: name || "Anonymous",
        message: message,
      }),
    });
    if (!res.ok) {
      var errText = await res.text();
      throw new Error(errText || "Insert failed");
    }
    return res.json();
  }

  function updateHint() {
    if (!hintEl) return;
    if (hasSupabase()) {
      hintEl.textContent = "Be kind — messages are public.";
    } else {
      hintEl.textContent =
        "Local mode: messages are only saved in this browser. (Connect Supabase to share them.)";
    }
  }

  async function refresh() {
    updateHint();
    if (hasSupabase()) {
      try {
        var data = await fetchRemote();
        renderList(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Guestbook remote load error:", err);
        renderList(loadLocal());
      }
    } else {
      renderList(loadLocal());
    }
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    var msg = (msgEl.value || "").trim();
    if (!msg) return;
    var name = (nameEl.value || "").trim() || "Anonymous";
    var btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;

    if (hasSupabase()) {
      try {
        await insertRemote(name, msg);
        msgEl.value = "";
        await refresh();
      } catch (err) {
        console.error("Guestbook submit error:", err);
        alert("Could not send message to Supabase. Check RLS policies or API keys.");
      } finally {
        if (btn) btn.disabled = false;
      }
    } else {
      var list = loadLocal();
      list.unshift({ name: name, message: msg, created_at: new Date().toISOString() });
      saveLocal(list);
      msgEl.value = "";
      renderList(list);
      if (btn) btn.disabled = false;
    }
  });

  refresh();
})();

/* =====================================================================
   FX UPGRADE — hiệu ứng cuộn trang & di chuột
   ===================================================================== */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var root = document.documentElement;
  var all = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  root.classList.add("fx-ready");

  /* 1. Tên chia từng chữ + kích hoạt màn mở đầu sau khi vào site */
  var user = document.querySelector(".username");
  var chars = [];
  if (user) {
    var txt = user.textContent;
    user.setAttribute("aria-label", txt);
    user.textContent = "";
    txt.split("").forEach(function (c, i) {
      var s = document.createElement("span");
      s.className = "fx-ch"; s.setAttribute("aria-hidden", "true");
      s.style.setProperty("--c", i); s.textContent = c;
      user.appendChild(s); chars.push(s);
    });
  }
  var started = false;
  function go() { if (started) return; started = true; root.classList.add("fx-go"); }
  function checkGo() { if (!document.body.classList.contains("locked")) go(); }
  new MutationObserver(checkGo).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  setTimeout(go, 9000);
  checkGo();

  /* Hiệu ứng "giải mã" chữ khi rê chuột vào tên */
  if (user && fine) {
    var GLYPH = "!<>-_/[]{}=+*^?#", busy = false;
    user.addEventListener("pointerenter", function () {
      if (busy || !started) return;
      busy = true;
      var orig = chars.map(function (s) { return s.textContent; }), f = 0, total = 18;
      var t = setInterval(function () {
        f++;
        chars.forEach(function (s, i) {
          s.textContent = f > i * 1.6 + 4 ? orig[i] : GLYPH[(Math.random() * GLYPH.length) | 0];
        });
        if (f >= total) { clearInterval(t); chars.forEach(function (s, i) { s.textContent = orig[i]; }); busy = false; }
      }, 40);
    });
  }

  /* 2. Thanh tiến trình cuộn nhẹ nhàng, không tính toán chuột */
  var bar = document.createElement("div");
  bar.className = "fx-progress";
  document.body.appendChild(bar);
  var tick = false;
  function onScroll() {
    if (tick) return; tick = true;
    requestAnimationFrame(function () {
      var max = root.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ")";
      tick = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* 3. Phân mục hiện ra */
  var blocks = all(".block");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("fx-in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    blocks.forEach(function (b) { io.observe(b); });
  } else {
    blocks.forEach(function (b) { b.classList.add("fx-in"); });
  }
})();
