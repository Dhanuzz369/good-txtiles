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
      b.innerHTML = on
        ? '<i class="ph ph-check" aria-hidden="true"></i><span class="button-xsm">Added</span>'
        : '<i class="ph ph-plus" aria-hidden="true"></i><span class="button-xsm">Add</span>';
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
})();
