/* GoodBiz Apparels — progressive enhancement. Every page works without JS;
   this adds the enquiry basket, catalogue filter, form handling and motion. */
(() => {
  document.documentElement.classList.remove("no-js");
  const CFG = window.GB_CONFIG || {};
  const isSet = (v) => v && !/^\{\{.*\}\}$/.test(v);
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
    sget(k, d) { try { return JSON.parse(sessionStorage.getItem(k)) ?? d; } catch { return d; } },
    sset(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };

  /* ---------- campaign attribution (ads + cold email) ---------- */
  const params = new URLSearchParams(location.search);
  const utm = store.sget("gb_utm", {});
  ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid"].forEach((k) => { if (params.get(k)) utm[k] = params.get(k); });
  store.sset("gb_utm", utm);

  /* ---------- personalisation for the cold email page (?name=&company=) ---------- */
  const pName = params.get("name"), pCompany = params.get("company");
  const greet = $("[data-greet]");
  if (greet && (pName || pCompany)) {
    greet.textContent = `Hi ${pName || "there"}${pCompany ? `, thanks for looking at this for ${pCompany}` : ""}.`;
    greet.hidden = false;
  }
  $$('[data-personal="name"]').forEach((i) => { if (pName) i.value = pName; });
  $$('[data-personal="company"]').forEach((i) => { if (pCompany) i.value = pCompany; });

  /* ---------- enquiry basket (kept across pages in this browser) ---------- */
  let basket = store.get("gb_enquiry", []);
  const has = (name) => basket.some((p) => p.name === name);

  function syncButtons() {
    $$(".add[data-name]").forEach((b) => {
      const on = has(b.dataset.name);
      b.setAttribute("aria-pressed", on);
      const label = on ? (b.dataset.on || "Added") : (b.dataset.off || "Add");
      b.innerHTML = `<i class="ph ${on ? "ph-check" : "ph-plus"}" aria-hidden="true"></i><span>${label}</span>`;
    });
  }
  function renderSelected() {
    $$("[data-selected]").forEach((box) => {
      box.replaceChildren();
      if (!basket.length) {
        box.innerHTML = '<p class="selected-empty body-6 muted"><i class="ph ph-list-plus" aria-hidden="true"></i> No products added yet. <a class="text-link" href="/#catalogue">Add them from the catalogue</a> or describe them below.</p>';
        return;
      }
      basket.forEach((p) => {
        const chip = document.createElement("span");
        chip.className = "chip caption-4";
        const label = document.createElement("span");
        label.textContent = `${p.name} · HSN ${p.hsn}`;
        const x = document.createElement("button");
        x.type = "button";
        x.setAttribute("aria-label", `Remove ${p.name}`);
        x.innerHTML = '<i class="ph ph-x" aria-hidden="true"></i>';
        x.addEventListener("click", () => toggle(p));
        chip.append(label, x);
        box.appendChild(chip);
      });
    });
    const b = $("#basket");
    if (b) {
      $("#basket-count").textContent = basket.length;
      b.hidden = !basket.length;
      b.classList.add("bump");
      setTimeout(() => b.classList.remove("bump"), 300);
    }
  }
  function toggle(p) {
    basket = has(p.name) ? basket.filter((x) => x.name !== p.name) : [...basket, { name: p.name, hsn: p.hsn }];
    store.set("gb_enquiry", basket);
    syncButtons();
    renderSelected();
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".add[data-name]");
    if (b) toggle({ name: b.dataset.name, hsn: b.dataset.hsn });
  });
  syncButtons();
  renderSelected();

  /* ---------- home catalogue: tabs + search over server rendered cards ---------- */
  const tabs = $$(".tab[data-cat]");
  const search = $("#cat-search");
  let cat = tabs[0]?.dataset.cat;
  function applyCatalogue() {
    const q = (search?.value || "").trim().toLowerCase().replace(/\s+/g, " ");
    const qn = q.replace(/\s/g, "");
    let shown = 0;
    $$('[role="tabpanel"].families').forEach((panel) => {
      const isCat = panel.id === `panel-${cat}`;
      if (!q) {
        panel.hidden = !isCat;
        $$(".family, .items li", panel).forEach((el) => (el.hidden = false));
        if (isCat) shown++;
        return;
      }
      let any = false;
      $$(".family", panel).forEach((f) => {
        const famHit = f.querySelector("h3").textContent.toLowerCase().includes(q);
        let n = 0;
        $$(".items li", f).forEach((li) => {
          const hit = famHit || li.dataset.search.includes(q) || li.dataset.search.replace(/\s/g, "").includes(qn);
          li.hidden = !hit; if (hit) n++;
        });
        f.hidden = !n; if (n) any = true;
      });
      panel.hidden = !any; if (any) shown++;
    });
    tabs.forEach((t) => t.setAttribute("aria-selected", !q && t.dataset.cat === cat));
    const empty = $("#cat-empty"); if (empty) empty.hidden = !!shown;
  }
  tabs.forEach((t) => t.addEventListener("click", () => { cat = t.dataset.cat; if (search) search.value = ""; applyCatalogue(); }));
  $(".tabs")?.addEventListener("keydown", (e) => {
    if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
    const i = tabs.findIndex((t) => t.dataset.cat === cat);
    const n = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    n.focus(); n.click();
  });
  let st; search?.addEventListener("input", () => { clearTimeout(st); st = setTimeout(applyCatalogue, 120); });

  /* ---------- enquiry forms ---------- */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  $$(".enq-form").forEach((form) => {
    const status = $(".form-status", form);
    const setError = (name, msg) => {
      const e = $(`[data-err="${name}"]`, form); if (!e) return;
      e.textContent = msg || ""; e.closest(".field").classList.toggle("invalid", !!msg);
    };
    const show = (msg, err) => { status.textContent = msg; status.classList.toggle("is-error", !!err); };
    function validate() {
      const d = Object.fromEntries(new FormData(form));
      let ok = true;
      for (const [k, m] of Object.entries({ name: "Enter your name.", company: "Enter your company name.", country: "Enter the destination country and port." })) {
        const bad = !d[k]?.trim(); setError(k, bad ? m : ""); if (bad) ok = false;
      }
      if (!d.email?.trim()) { setError("email", "Enter your work email."); ok = false; }
      else if (!EMAIL_RE.test(d.email.trim())) { setError("email", "That email address looks incomplete. Check it has an @ and a domain."); ok = false; }
      else setError("email", "");
      if (!d.path) { setError("path", "Choose ready stock, made to order or both."); ok = false; } else setError("path", "");
      if (!d.details?.trim() && !basket.length) { setError("details", "Add products from the catalogue or describe what you need."); ok = false; } else setError("details", "");
      if (!ok) $(".field.invalid input, .field.invalid textarea", form)?.focus();
      return ok ? d : null;
    }
    function compose(d) {
      const lines = [`Enquiry from ${d.name}, ${d.company}`, `Email: ${d.email}`, `Destination: ${d.country}`, `Buying: ${d.path}`, ""];
      if (basket.length) { lines.push("Products:"); basket.forEach((p) => lines.push(`• ${p.name} (HSN ${p.hsn})`)); lines.push(""); }
      if (d.details?.trim()) lines.push("Quantities and spec:", d.details.trim(), "");
      const src = [`page: ${location.pathname}`, `form: ${form.dataset.source}`, ...Object.entries(utm).map(([k, v]) => `${k}: ${v}`)];
      lines.push(`[${src.join(" | ")}]`);
      return lines.join("\n");
    }
    function track(channel) {
      if (typeof window.gtag !== "function") return;
      gtag("event", "generate_lead", { method: channel, form_source: form.dataset.source });
      if (CFG.ads) gtag("event", "conversion", { send_to: CFG.ads });
    }
    form.addEventListener("input", (e) => { if (e.target.closest(".field")?.classList.contains("invalid")) setError(e.target.name, ""); });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const d = validate(); if (!d) return show("");
      if (!isSet(CFG.email)) return show("The export email address is not set up yet. Use WhatsApp, or add it in src/data.mjs.", true);
      track("email");
      location.href = `mailto:${CFG.email}?subject=${encodeURIComponent(`Export enquiry: ${d.company} (${d.path})`)}&body=${encodeURIComponent(compose(d))}`;
      show(`Your email app has the enquiry ready to send to ${CFG.email}. Attach your tech pack or size chart before sending.`);
    });
    $("[data-send-whatsapp]", form)?.addEventListener("click", () => {
      const d = validate(); if (!d) return show("");
      if (!isSet(CFG.whatsapp)) return show("The WhatsApp number is not set up yet. Add it in src/data.mjs.", true);
      track("whatsapp");
      window.open(`https://wa.me/${CFG.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(compose(d))}`, "_blank", "noopener");
      show("WhatsApp opened in a new tab with your enquiry filled in.");
    });
  });
  $$("[data-whatsapp]").forEach((a) => {
    if (isSet(CFG.whatsapp)) { a.href = `https://wa.me/${CFG.whatsapp.replace(/\D/g, "")}`; a.target = "_blank"; a.rel = "noopener"; }
    else a.href = "#enquiry";
  });
  $$("[data-email]").forEach((a) => { a.href = isSet(CFG.email) ? `mailto:${CFG.email}` : "#enquiry"; });

  /* ---------- products page: audience filter, search, index highlight ---------- */
  const pfSearch = $("#pf-search");
  if (pfSearch) {
    const cards = $$(".catalog .pcard");
    const blocks = $$(".catalog .cblock");
    const notes = $$(".catalog .cnote");
    const audBtns = $$(".aud-filter [data-aud]");
    const countEl = $("[data-pf-count]");
    let aud = "all";
    const apply = () => {
      const q = pfSearch.value.trim().toLowerCase();
      const qn = q.replace(/\s/g, "");
      let total = 0;
      cards.forEach((c) => {
        const s = c.dataset.search;
        const show = (aud === "all" || c.dataset.aud === aud) && (!q || s.includes(q) || s.replace(/\s/g, "").includes(qn));
        c.hidden = !show;
        const li = $(`.cindex li[data-for="${c.id}"]`);
        if (li) li.hidden = !show;
        if (show) total++;
      });
      blocks.forEach((b, i) => {
        const any = $$(".pcard", b).some((c) => !c.hidden);
        b.hidden = !any;
        if (notes[i]) notes[i].hidden = !any || !!q || aud !== "all";
        const det = $(`.cindex-cat[data-cat="${b.dataset.cat}"]`);
        if (det) det.hidden = !any;
      });
      $("#pf-empty").hidden = total > 0;
      if (countEl) countEl.textContent = `${total} shown`;
    };
    audBtns.forEach((b) => b.addEventListener("click", () => {
      aud = b.dataset.aud;
      audBtns.forEach((x) => x.setAttribute("aria-pressed", x === b));
      apply();
    }));
    let pt; pfSearch.addEventListener("input", () => { clearTimeout(pt); pt = setTimeout(apply, 120); });

    const links = $$(".cindex li a");
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((a) => a.setAttribute("aria-current", a.getAttribute("href") === `#${en.target.id}` ? "true" : "false"));
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    cards.forEach((c) => spy.observe(c));
  }

  /* ---------- products mega menu ---------- */
  const trigger = $(".nav-trigger"), mega = $("#mega");
  if (trigger && mega) {
    const setMega = (open) => { trigger.setAttribute("aria-expanded", open); mega.classList.toggle("open", open); };
    trigger.addEventListener("click", (e) => { e.stopPropagation(); setMega(trigger.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("click", (e) => { if (!mega.contains(e.target)) setMega(false); });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && mega.classList.contains("open")) { setMega(false); trigger.focus(); } });
    mega.addEventListener("focusout", (e) => { if (!mega.contains(e.relatedTarget) && e.relatedTarget !== trigger) setMega(false); });
  }

  /* ---------- mobile menu ---------- */
  const toggleBtn = $(".menu-toggle"), menu = $("#mobile-menu");
  if (toggleBtn && menu) {
    const setMenu = (open) => {
      toggleBtn.setAttribute("aria-expanded", open);
      toggleBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.body.style.overflow = open ? "hidden" : "";
      if (open) {
        menu.hidden = false;
        $$("li", menu).forEach((li, i) => { li.style.transitionDelay = `${Math.min(i * 60, 400)}ms`; });
        requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add("open")));
      } else { menu.classList.remove("open"); menu.hidden = true; }
    };
    toggleBtn.addEventListener("click", () => setMenu(toggleBtn.getAttribute("aria-expanded") !== "true"));
    $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
    addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) { setMenu(false); toggleBtn.focus(); } });
  }

  /* ---------- scroll reveals ---------- */
  const ro = new IntersectionObserver((es, o) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); o.unobserve(en.target); } }), { threshold: 0.12 });
  $$(".reveal").forEach((el) => ro.observe(el));

  /* ---------- tagline word reveal ---------- */
  const tag = $("#tagline");
  if (tag && !reduceMotion) {
    tag.innerHTML = tag.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(" ");
    const spans = $$(".w", tag);
    let ticking = false;
    const update = () => {
      ticking = false;
      const r = tag.getBoundingClientRect(), start = innerHeight * 0.85, end = innerHeight * 0.35;
      const p = Math.min(1, Math.max(0, (start - r.top) / (start - end + r.height * 0.5)));
      const n = Math.round(p * spans.length);
      spans.forEach((s, i) => { if (i < n) s.classList.add("on"); });
    };
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* ---------- 3D tilt on swatch cards and product stages ---------- */
  if (matchMedia("(hover: hover) and (pointer: fine)").matches && !reduceMotion) {
    $$("[data-tilt]").forEach((el) => {
      const max = el.classList.contains("stage-card") ? 10 : 12;
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.dataset.active = "";
        el.style.setProperty("--ry", `${(x * max).toFixed(2)}deg`);
        el.style.setProperty("--rx", `${(-y * max * 0.8).toFixed(2)}deg`);
        el.style.setProperty("--mx", x.toFixed(3));
      });
      el.addEventListener("pointerleave", () => {
        delete el.dataset.active;
        ["--rx", "--ry", "--mx"].forEach((p) => el.style.removeProperty(p));
      });
    });
  }

  /* ---------- hero: pinned 3D orbit driven by scroll ---------- */
  const hero = $("[data-hero]");
  if (hero && !reduceMotion && "IntersectionObserver" in window) {
    hero.classList.add("live");
    const sticky = $(".hero3d-sticky", hero);
    const scene = $("[data-scene]", hero);
    const allOrbs = $$("[data-orb]", hero);
    const phases = $$("[data-ph]", hero).sort((a, b) => a.dataset.ph - b.dataset.ph);
    const steps = $$("[data-step]", hero);
    const meter = $("[data-meter]", hero);
    const cue = $("[data-cue]", hero);
    const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    let orbs = [], W = 0, H = 0, mobile = false, ow = 160;
    let target = 0, cur = 0, vel = 0, spin = 0, last = performance.now();
    let mx = 0, my = 0, cmx = 0, cmy = 0, running = false;

    const layout = () => {
      W = innerWidth; H = sticky.clientHeight; mobile = W < 760;
      orbs = allOrbs.filter((o) => getComputedStyle(o).display !== "none");
      ow = orbs[0]?.offsetWidth || 160;
    };
    const measure = () => {
      const r = hero.getBoundingClientRect();
      const len = r.height - sticky.clientHeight;
      target = Math.min(1, Math.max(0, (sticky.getBoundingClientRect().top - r.top) / Math.max(1, len)));
    };
    if (matchMedia("(pointer: fine)").matches) {
      hero.addEventListener("pointermove", (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });
    }

    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const prev = cur;
      cur += (target - cur) * Math.min(1, dt * 4.5); // eased scroll: soothing inertia
      vel += ((cur - prev) / Math.max(dt, 0.001) - vel) * 0.12;
      const settle = ss(0.64, 0.9, cur);
      spin += dt * (0.14 + Math.min(2.6, Math.abs(vel) * 3.2)) * (1 - settle * 0.85); // spins faster while scrolling
      cmx += (mx - cmx) * 0.05; cmy += (my - cmy) * 0.05;

      const p = cur, n = orbs.length;
      const Rx = Math.min(W * (mobile ? 0.42 : 0.4), 640) * (1 + 0.22 * ss(0.28, 0.58, p));
      const Rz = Rx * (mobile ? 0.55 : 0.62);
      const tilt = 0.22 + 0.14 * ss(0.22, 0.56, p) - 0.1 * settle;
      const cols = mobile ? Math.ceil(n / 2) : n;
      const cell = Math.min((W * (mobile ? 0.94 : 0.9)) / cols, mobile ? 92 : 132);
      const rowScale = Math.min(1, (cell * 0.96) / ow);
      const rowY = H * (mobile ? -0.04 : 0.22);

      for (let i = 0; i < n; i++) {
        const th = spin + p * Math.PI * 2.4 + (i * Math.PI * 2) / n;
        let x = Math.sin(th) * Rx;
        let z = Math.cos(th) * Rz;
        let y = Math.cos(th) * Rx * tilt + Math.sin(th * 2 + i) * 10 - Rx * 0.04;
        let ry = Math.sin(th) * 30;
        const c = i % cols, r = Math.floor(i / cols);
        const tx = (c - (cols - 1) / 2) * cell, ty = rowY + r * cell * 1.25;
        x += (tx - x) * settle; y += (ty - y) * settle; z += (0 - z) * settle; ry *= 1 - settle;
        const s = 1 + (rowScale - 1) * settle;
        const depth = (Math.cos(th) + 1) / 2;
        orbs[i].style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${z.toFixed(1)}px) rotateY(${ry.toFixed(1)}deg) scale(${s.toFixed(3)})`;
        orbs[i].style.opacity = ((0.38 + 0.62 * depth) * (1 - settle) + settle).toFixed(3);
      }
      scene.style.transform = `rotateX(${(-cmy * 7).toFixed(2)}deg) rotateY(${(cmx * 9).toFixed(2)}deg)`;

      const ina = ss(0.22, 0.32, p), inb = ss(0.27, 0.37, p), outb = ss(0.55, 0.65, p), inc = ss(0.62, 0.74, p);
      [[1 - ina, -ina], [inb * (1 - outb), (1 - inb) - outb], [inc, 1 - inc]].forEach(([o, off], k) => {
        if (!phases[k]) return;
        phases[k].style.opacity = o.toFixed(3);
        phases[k].style.transform = `translateY(${(off * 70).toFixed(1)}px)`;
        phases[k].style.filter = o < 0.98 ? `blur(${((1 - o) * 8).toFixed(1)}px)` : "none";
      });
      if (meter) meter.style.transform = `scaleX(${p.toFixed(4)})`;
      const step = p < 0.3 ? 0 : p < 0.62 ? 1 : 2;
      steps.forEach((s, k) => s.classList.toggle("on", k <= step));
      if (cue) cue.style.opacity = (1 - ss(0.02, 0.08, p)).toFixed(3);

      if (running) requestAnimationFrame(frame);
    };

    layout(); measure(); cur = target;
    addEventListener("scroll", measure, { passive: true });
    addEventListener("resize", () => { layout(); measure(); });
    new IntersectionObserver(([en]) => {
      if (en.isIntersecting && !running) { running = true; last = performance.now(); requestAnimationFrame(frame); }
      else if (!en.isIntersecting) running = false;
    }).observe(hero);
  }
})();
