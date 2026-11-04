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
    $$('input[name="products"]').forEach((i) => (i.checked = has(i.value))); // enquiry wizard ticks follow the basket
  }
  function renderSelected() {
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

  /* ---------- step-by-step enquiry ---------- */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const STEP_NAMES = { contact: "Contact", products: "Products", route: "Buying route", spec: "Specification", quantity: "Quantity", destination: "Destination", review: "Review and send" };
  const track = (channel, source) => {
    if (typeof window.gtag !== "function") return;
    gtag("event", "generate_lead", { method: channel, form_source: source });
    if (CFG.ads) gtag("event", "conversion", { send_to: CFG.ads });
  };
  $$("[data-wizard]").forEach((form) => {
    const steps = $$(".wiz-step", form);
    const total = steps.length;
    const countEl = $("[data-wiz-count]", form), nameEl = $("[data-wiz-name]", form), bar = $("[data-wiz-bar]", form);
    const back = $("[data-wiz-back]", form), next = $("[data-wiz-next]", form), sendRow = $("[data-wiz-send]", form);
    const nav = $(".wiz-nav", form), status = $("[data-status]", form), done = $("[data-done]", form);
    const qOther = $("[data-quantity-other]", form);
    const draftKey = `gb_wiz_${form.dataset.source}`;
    let i = 0;

    const val = (n) => { const el = form.elements.namedItem(n); return el && "value" in el ? String(el.value).trim() : ""; };
    const radio = (n) => { const r = form.querySelector(`input[name="${n}"]:checked`); return r ? r.value : ""; };
    const quantity = () => (radio("quantity") === "Another amount" ? val("quantityOther") : radio("quantity"));
    const setErr = (key, msg = "") => {
      const e = $(`[data-err="${key}"]`, form); if (!e) return;
      e.textContent = msg;
      const f = e.closest(".field"); if (f) f.classList.toggle("invalid", !!msg);
      const input = form.elements.namedItem(key);
      if (input && input.setAttribute) input.setAttribute("aria-invalid", msg ? "true" : "false");
    };
    const show = (msg = "", err = false) => { status.textContent = msg; status.classList.toggle("is-error", err); };

    // restore an unfinished enquiry from this browser session (never overwrite with empty values)
    const draft = store.sget(draftKey, null);
    if (draft && draft.v) Object.entries(draft.v).forEach(([k, v]) => {
      if (!v) return;
      form.querySelectorAll(`[name="${k}"]`).forEach((el) => { if (el.type === "radio") el.checked = el.value === v; else if (el.type !== "checkbox") el.value = v; });
    });
    if (qOther) qOther.hidden = radio("quantity") !== "Another amount";
    const saveDraft = () => {
      const v = {};
      [...form.elements].forEach((el) => {
        if (!el.name || el.name === "website" || el.type === "checkbox" || el.type === "button" || el.type === "submit") return;
        if (el.type === "radio") { if (el.checked) v[el.name] = el.value; } else v[el.name] = el.value;
      });
      store.sset(draftKey, { v });
    };

    const validators = {
      contact() {
        let ok = true;
        if (!val("name")) { setErr("name", "Enter your name."); ok = false; } else setErr("name");
        if (!val("company")) { setErr("company", "Enter your company name."); ok = false; } else setErr("company");
        const em = val("email"), wa = val("whatsapp");
        if (em && !EMAIL_RE.test(em)) { setErr("email", "That email looks incomplete. Check it has an @ and a domain."); ok = false; } else setErr("email");
        if (wa && wa.replace(/\D/g, "").length < 8) { setErr("whatsapp", "Add the full number, with country code."); ok = false; } else setErr("whatsapp");
        if (!em && !wa) { setErr("contact", "Add an email or a WhatsApp number so we can reply."); ok = false; } else setErr("contact");
        return ok;
      },
      products() { const ok = basket.length > 0 || !!val("productOther"); setErr("products", ok ? "" : "Pick at least one product, or describe what you need."); return ok; },
      route() { const ok = !!radio("route"); setErr("route", ok ? "" : "Choose one to continue."); return ok; },
      spec() { return true; },
      quantity() {
        if (!radio("quantity")) { setErr("quantity", "Choose one to continue."); return false; }
        setErr("quantity");
        if (radio("quantity") === "Another amount" && !val("quantityOther")) { setErr("quantityOther", "Tell us roughly how many pieces."); return false; }
        setErr("quantityOther"); return true;
      },
      destination() { const ok = !!val("country"); setErr("country", ok ? "" : "Enter the destination country."); return ok; },
      review() { return true; },
    };

    const adaptSpec = () => {
      const stock = radio("route") === "Ready stock";
      const tp = $("[data-techpack]", form); if (tp) tp.hidden = stock;
      const hint = $("[data-spec-hint]", form);
      if (hint) hint.textContent = stock ? "Sizes, colours and fabric you are looking for in stock. All optional." : "All optional. Skip anything you are not sure of.";
    };

    const renderSummary = () => {
      const rows = [
        ["Contact", [val("name"), val("company"), val("email"), val("whatsapp")].filter(Boolean).join(" · "), 0],
        ["Products", [...basket.map((p) => `${p.name} (HSN ${p.hsn})`), val("productOther")].filter(Boolean).join(", "), 1],
        ["Buying route", radio("route"), 2],
        ["Specification", [val("fabric"), val("sizes"), radio("techpack") && radio("route") !== "Ready stock" ? `Tech pack: ${radio("techpack")}` : ""].filter(Boolean).join(" · ") || "Not given", 3],
        ["Quantity", quantity(), 4],
        ["Destination", [val("country"), val("port"), radio("incoterm") ? `Price basis: ${radio("incoterm")}` : ""].filter(Boolean).join(" · "), 5],
      ];
      const dl = $("[data-summary]", form); dl.replaceChildren();
      rows.forEach(([k, v, s]) => {
        const row = document.createElement("div");
        const dt = document.createElement("dt"); dt.className = "label muted"; dt.textContent = k;
        const dd = document.createElement("dd"); dd.textContent = v || "Not given";
        const b = document.createElement("button"); b.type = "button"; b.className = "wiz-edit"; b.textContent = "Edit";
        b.setAttribute("aria-label", `Edit ${k.toLowerCase()}`);
        b.addEventListener("click", () => go(s));
        row.append(dt, dd, b); dl.append(row);
      });
    };

    function go(n, focus = true) {
      i = Math.max(0, Math.min(total - 1, n));
      steps.forEach((s, k) => (s.hidden = k !== i));
      const key = steps[i].dataset.step;
      countEl.textContent = `Step ${i + 1} of ${total}`;
      nameEl.textContent = STEP_NAMES[key] || "";
      bar.style.transform = `scaleX(${(i + 1) / total})`;
      back.hidden = i === 0;
      next.hidden = i === total - 1;
      sendRow.hidden = i !== total - 1;
      if (key === "spec") adaptSpec();
      if (key === "review") renderSummary();
      show();
      if (focus) {
        $(".wiz-q", steps[i]).focus({ preventScroll: true });
        const top = form.getBoundingClientRect().top;
        if (top < 60 || top > innerHeight * 0.5) form.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      }
    }
    const nextStep = () => {
      if (!validators[steps[i].dataset.step]()) {
        const bad = $(".field.invalid input, .field.invalid textarea", steps[i]) || $("input", steps[i]);
        if (bad) bad.focus();
        return;
      }
      saveDraft();
      go(i + 1);
    };
    next.addEventListener("click", nextStep);
    back.addEventListener("click", () => go(i - 1));
    form.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target.matches("input:not([type=checkbox]):not([type=radio])")) { e.preventDefault(); if (i < total - 1) nextStep(); }
    });
    form.addEventListener("input", (e) => {
      const n = e.target.name; if (!n || e.target.type === "checkbox" || e.target.type === "radio") return;
      setErr(n); if (n === "email" || n === "whatsapp") setErr("contact"); if (n === "productOther") setErr("products");
      saveDraft();
    });
    const auto = (key) => setTimeout(() => { if (steps[i].dataset.step === key) { saveDraft(); go(i + 1); } }, 320);
    form.addEventListener("change", (e) => {
      const t = e.target;
      if (t.name === "products") { if (t.checked !== has(t.value)) toggle({ name: t.value, hsn: t.dataset.hsn }); setErr("products"); return; }
      if (t.name === "route") { setErr("route"); auto("route"); }
      if (t.name === "quantity") {
        setErr("quantity"); setErr("quantityOther");
        if (qOther) qOther.hidden = t.value !== "Another amount";
        if (t.value === "Another amount") $('[name="quantityOther"]', form).focus(); else auto("quantity");
      }
      saveDraft();
    });

    // ----- sending
    const compose = () => {
      const L = [`Sourcing enquiry from ${val("name")}, ${val("company")}`];
      if (val("email")) L.push(`Email: ${val("email")}`);
      if (val("whatsapp")) L.push(`WhatsApp: ${val("whatsapp")}`);
      L.push("", "Products:");
      basket.forEach((p) => L.push(`• ${p.name} (HSN ${p.hsn})`));
      if (val("productOther")) L.push(`• ${val("productOther")}`);
      L.push("", `Buying: ${radio("route")}`);
      if (val("fabric")) L.push(`Fabric and GSM: ${val("fabric")}`);
      if (val("sizes")) L.push(`Sizes and colours: ${val("sizes")}`);
      if (radio("techpack") && radio("route") !== "Ready stock") L.push(`Tech pack: ${radio("techpack")}`);
      L.push(`Quantity: ${quantity()}`, `Destination: ${[val("country"), val("port")].filter(Boolean).join(", ")}`);
      if (radio("incoterm")) L.push(`Price basis: ${radio("incoterm")}`);
      if (val("message")) L.push("", "Notes:", val("message"));
      L.push("", `[page: ${location.pathname} | form: ${form.dataset.source}${Object.entries(utm).map(([k, v]) => ` | ${k}: ${v}`).join("")}]`);
      return L.join("\n");
    };
    const subject = () => `Sourcing enquiry: ${val("company")} (${radio("route")})`;
    const mailHref = () => `mailto:${CFG.email}?subject=${encodeURIComponent(subject())}&body=${encodeURIComponent(compose())}`;
    const waHref = () => `https://wa.me/${String(CFG.whatsapp).replace(/\D/g, "")}?text=${encodeURIComponent(compose())}`;
    const actionLink = (href, label, icon, primary = false) => {
      const a = document.createElement("a");
      a.className = `btn ${primary ? "btn-primary" : "btn-ghost"}`; a.href = href;
      if (/^https?:/.test(href)) { a.target = "_blank"; a.rel = "noopener"; }
      const ic = document.createElement("i"); ic.className = `ph ${icon}`; ic.setAttribute("aria-hidden", "true");
      a.append(ic, " ", label);
      return a;
    };
    const finish = (title, text, actions) => {
      steps.forEach((s) => (s.hidden = true));
      nav.hidden = true; show();
      $("[data-done-title]", done).textContent = title;
      $("[data-done-text]", done).textContent = text;
      $("[data-done-actions]", done).replaceChildren(...actions);
      countEl.textContent = "Enquiry ready"; nameEl.textContent = "";
      bar.style.transform = "scaleX(1)";
      done.hidden = false; done.focus();
      store.sset(draftKey, null);
    };
    async function send(mode) {
      for (let k = 0; k < total; k++) if (!validators[steps[k].dataset.step]()) { go(k); show("Please complete this step first.", true); return; }
      track(mode, form.dataset.source);
      if (mode === "sheet" && isSet(CFG.endpoint)) {
        const btn = $('[data-send="sheet"]', form), label = btn.innerHTML;
        btn.disabled = true; btn.textContent = "Sending…";
        const data = { name: val("name"), company: val("company"), email: val("email"), whatsapp: val("whatsapp"), products: basket.map((p) => `${p.name} (HSN ${p.hsn})`).join("; "), productOther: val("productOther"), route: radio("route"), fabric: val("fabric"), sizes: val("sizes"), techpack: radio("techpack"), quantity: quantity(), country: val("country"), port: val("port"), incoterm: radio("incoterm"), message: val("message"), page: location.pathname, source: form.dataset.source, website: val("website"), ...utm };
        try {
          // read the sheet's reply: only {"ok":true} counts as saved, so a sign-in wall or a
          // script error can never swallow an enquiry silently
          const res = await fetch(CFG.endpoint, { method: "POST", body: new URLSearchParams(data), redirect: "follow" });
          const out = await res.json().catch(() => ({}));
          if (!res.ok || out.ok !== true) throw new Error(out.error || `status ${res.status}`);
          finish("Thank you, we have your enquiry.", `We will reply to ${val("email") || val("whatsapp")} with stock availability or a costing. If you have a tech pack or size chart, email it to us with your company name in the subject.`, [actionLink(`mailto:${CFG.email}?subject=${encodeURIComponent(`Tech pack: ${val("company")}`)}`, "Email a tech pack", "ph-paperclip", true), actionLink(`https://wa.me/${String(CFG.whatsapp).replace(/\D/g, "")}`, "Chat on WhatsApp", "ph-whatsapp-logo")]);
        } catch {
          btn.disabled = false; btn.innerHTML = label;
          show("We could not save your enquiry just now. Your answers are kept: send it by email or WhatsApp instead, or try again.", true);
          if (!$("[data-fallback]", status)) {
            const wrap = document.createElement("span"); wrap.dataset.fallback = ""; wrap.className = "status-actions";
            wrap.append(actionLink(mailHref(), "Send by email", "ph-envelope-simple", true), actionLink(waHref(), "Send on WhatsApp", "ph-whatsapp-logo"));
            status.append(wrap);
          }
        }
        return;
      }
      if (mode === "whatsapp") {
        if (!isSet(CFG.whatsapp)) return show("WhatsApp is not set up yet. Please send by email.", true);
        window.open(waHref(), "_blank", "noopener");
        finish("WhatsApp is open with your enquiry.", "Press send in WhatsApp to reach us. Nothing is sent until you do.", [actionLink(waHref(), "Open WhatsApp again", "ph-whatsapp-logo", true), actionLink(mailHref(), "Send by email instead", "ph-envelope-simple")]);
        return;
      }
      if (!isSet(CFG.email)) return show("Email is not set up yet. Please send on WhatsApp.", true);
      location.href = mailHref();
      finish("Your email is ready to send.", `Your email app has the enquiry addressed to ${CFG.email}. Attach your tech pack or size chart if you have one, then press send.`, [actionLink(mailHref(), "Open the email again", "ph-envelope-simple", true), actionLink(waHref(), "Send on WhatsApp instead", "ph-whatsapp-logo")]);
    }
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (i !== total - 1) return nextStep();
      send((e.submitter && e.submitter.dataset.send) || (isSet(CFG.endpoint) ? "sheet" : "email"));
    });
    const wa = $('[data-send="whatsapp"]', form); if (wa) wa.addEventListener("click", () => send("whatsapp"));
    go(0, false);
  });
  // the enquiry counter links to the form, so keep it out of the way while the form is on screen
  const enq = $("#enquiry");
  if (enq && "IntersectionObserver" in window) new IntersectionObserver(([en]) => document.body.classList.toggle("enq-in-view", en.isIntersecting), { rootMargin: "0px 0px -20% 0px" }).observe(enq);
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
    const lead = $(".hero3d-foot .lead", hero);
    const actions = $(".hero3d-foot .hero-actions", hero);
    const copy = $(".hero3d-copy", hero);
    const kicker = $(".hero-kicker", copy);
    let orbs = [], W = 0, H = 0, mobile = false, ow = 160, oh = 200, slots = [];
    let target = 0, cur = 0, vel = 0, spin = 0, last = performance.now();
    let mx = 0, my = 0, cmx = 0, cmy = 0, running = false;

    // Final arrangement: a wall of garments filling the stage, leaving the
    // cells under the headline empty so the text stays readable.
    const textRect = () => {
      const box = sticky.getBoundingClientRect();
      const els = [phases[2]].filter(Boolean);
      const saved = els.map((e) => e.style.transform);
      els.forEach((e) => (e.style.transform = "none"));
      let r = null;
      els.forEach((e) => {
        const range = document.createRange(); range.selectNodeContents(e);
        const b = range.getBoundingClientRect();
        r = r ? { l: Math.min(r.l, b.left), t: Math.min(r.t, b.top), r: Math.max(r.r, b.right), b: Math.max(r.b, b.bottom) } : { l: b.left, t: b.top, r: b.right, b: b.bottom };
      });
      els.forEach((e, i) => (e.style.transform = saved[i]));
      return r && { l: r.l - box.left - 16, t: r.t - box.top - 12, r: r.r - box.left + 16, b: r.b - box.top + 12 };
    };
    const buildSlots = () => {
      const n = orbs.length, tr = textRect();
      const top = mobile ? 52 : 64;
      const bottom = H - (actions ? actions.offsetHeight : 48) - (mobile ? 28 : 40);
      const left = mobile ? 8 : 32, right = W - (mobile ? 8 : 32);
      // three bands: full rows above the headline, the headline band (garments
      // only beside the text), full rows below it
      const bandT = tr ? Math.max(top, tr.t) : (top + bottom) / 2;
      const bandB = tr ? Math.min(bottom, tr.b) : bandT;
      const hA = Math.max(0, bandT - top), hB = Math.max(0, bottom - bandB);
      const minRow = mobile ? 96 : 108, idealRow = mobile ? 150 : 200;
      const fit = (h) => (h < minRow ? 0 : Math.max(1, Math.min(Math.floor(h / minRow), Math.round(h / idealRow) || 1)));
      const sideCols = (cols, cw) => (tr && bandB - bandT > 40 ? [...Array(cols).keys()].filter((c) => { const x0 = left + c * cw; return !(x0 < tr.r && x0 + cw > tr.l); }) : []);
      // pick the fewest columns whose rows (never shorter than minRow) hold every garment;
      // works on short laptop screens as well as tall monitors
      // try every grid; keep the one that holds all garments at the largest size
      const sc = (cw, ch) => Math.min((cw * 0.9) / ow, (ch * 0.9) / oh);
      let best = null;
      for (let cols = mobile ? 3 : 4; cols <= (mobile ? 5 : 10); cols++) {
        const cw = (right - left) / cols, side = sideCols(cols, cw);
        for (let rA = 0; rA <= Math.floor(hA / minRow); rA++) for (let rB = 1; rB <= Math.max(1, Math.floor(hB / minRow)); rB++) {
          const cap = (rA + rB) * cols + side.length;
          const parts = [sc(cw, hB / rB)];
          if (rA) parts.push(sc(cw, hA / rA));
          if (side.length) parts.push(sc(cw, bandB - bandT));
          const cfg = { cols, cw, rA, rB, side, cap, score: Math.min(...parts) - (cap >= n ? 0 : 10) - (cap - n) * 0.004 };
          if (!best || cfg.score > best.score) best = cfg;
        }
      }
      let cells = [];
      const { cols, cw, rA, rB, side } = best;
      const rowsOf = (y0, h, k) => { for (let r = 0; r < k; r++) for (let c = 0; c < cols; c++) cells.push({ cx: left + c * cw + cw / 2, cy: y0 + (r + 0.5) * (h / k), cw, ch: h / k }); };
      if (rA) rowsOf(top, hA, rA);
      side.forEach((c) => cells.push({ cx: left + c * cw + cw / 2, cy: (bandT + bandB) / 2, cw, ch: bandB - bandT }));
      if (rB) rowsOf(bandB, hB, rB);
      // fill from the edges inward so the wall frames the headline
      const midX = W / 2, midY = H / 2;
      cells.sort((a, b) => Math.hypot(b.cx - midX, (b.cy - midY) * 1.4) - Math.hypot(a.cx - midX, (a.cy - midY) * 1.4));
      cells = cells.slice(0, n).sort((a, b) => a.cy - b.cy || a.cx - b.cx);
      const ox = orbs[0] ? orbs[0].offsetLeft + ow / 2 : W / 2, oy = orbs[0] ? orbs[0].offsetTop + oh / 2 : H / 2;
      slots = cells.map((c, i) => ({
        x: c.cx - ox, y: c.cy - oy,
        s: Math.min(1.35, (c.cw * 0.9) / ow, (c.ch * 0.9) / oh),
        rot: ((i * 37) % 7) - 3,
      }));
    };
    const layout = () => {
      W = innerWidth; H = sticky.clientHeight; mobile = W < 760;
      orbs = allOrbs.filter((o) => getComputedStyle(o).display !== "none");
      ow = orbs[0]?.offsetWidth || 160; oh = orbs[0]?.offsetHeight || 200;
      buildSlots();
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
      cur += (target - cur) * Math.min(1, dt * 6); // eased scroll: soothing inertia
      vel += ((cur - prev) / Math.max(dt, 0.001) - vel) * 0.12;
      // short pinned track: orbit → wider tilt → garment wall, all within ~one screen of scrolling
      const settle = ss(0.42, 0.78, cur);
      spin += dt * (0.14 + Math.min(2.6, Math.abs(vel) * 1.6)) * (1 - settle * 0.9); // spins faster while scrolling
      cmx += (mx - cmx) * 0.05; cmy += (my - cmy) * 0.05;

      const p = cur, n = orbs.length;
      const Rx = Math.min(W * (mobile ? 0.42 : 0.4), 640) * (1 + 0.22 * ss(0.15, 0.4, p));
      const Rz = Rx * (mobile ? 0.55 : 0.62);
      const tilt = 0.22 + 0.14 * ss(0.12, 0.4, p);

      for (let i = 0; i < n; i++) {
        const th = spin + p * Math.PI * 1.6 + (i * Math.PI * 2) / n;
        let x = Math.sin(th) * Rx;
        let z = Math.cos(th) * Rz;
        let y = Math.cos(th) * Rx * tilt + Math.sin(th * 2 + i) * 10 - Rx * 0.04;
        let ry = Math.sin(th) * 30;
        const t = slots[i];
        const depth = (Math.cos(th) + 1) / 2;
        let s = 1, rz = 0, op;
        if (t) {
          x += (t.x - x) * settle; y += (t.y - y) * settle; z += (0 - z) * settle; ry *= 1 - settle;
          s = 1 + (t.s - 1) * settle; rz = t.rot * settle;
          op = (0.38 + 0.62 * depth) * (1 - settle) + settle;
        } else {
          // no free cell on this screen size: fade out instead of parking behind the headline
          s = 1 - 0.4 * settle; op = (0.38 + 0.62 * depth) * (1 - settle);
        }
        orbs[i].style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${z.toFixed(1)}px) rotateY(${ry.toFixed(1)}deg) rotateZ(${rz.toFixed(2)}deg) scale(${s.toFixed(3)})`;
        orbs[i].style.opacity = op.toFixed(3);
      }
      scene.style.transform = `rotateX(${(-cmy * 7 * (1 - settle * 0.6)).toFixed(2)}deg) rotateY(${(cmx * 9 * (1 - settle * 0.6)).toFixed(2)}deg)`;
      if (lead) lead.style.opacity = (1 - ss(0.45, 0.6, p)).toFixed(3);
      if (kicker) kicker.style.opacity = (1 - ss(0.44, 0.56, p)).toFixed(3);

      const ina = ss(0.14, 0.24, p), inb = ss(0.18, 0.28, p), outb = ss(0.38, 0.48, p), inc = ss(0.46, 0.6, p);
      [[1 - ina, -ina], [inb * (1 - outb), (1 - inb) - outb], [inc, 1 - inc]].forEach(([o, off], k) => {
        if (!phases[k]) return;
        phases[k].style.opacity = o.toFixed(3);
        phases[k].style.transform = `translateY(${(off * 70).toFixed(1)}px)`;
        phases[k].style.filter = o < 0.98 ? `blur(${((1 - o) * 8).toFixed(1)}px)` : "none";
      });
      if (meter) meter.style.transform = `scaleX(${p.toFixed(4)})`;
      const step = p < 0.2 ? 0 : p < 0.46 ? 1 : 2;
      steps.forEach((s, k) => s.classList.toggle("on", k <= step));
      if (cue) cue.style.opacity = (1 - ss(0.01, 0.05, p)).toFixed(3);

      if (running) requestAnimationFrame(frame);
    };

    layout(); measure(); cur = target;
    document.fonts?.ready.then(layout); // headline size changes once the web font loads
    addEventListener("scroll", measure, { passive: true });
    addEventListener("resize", () => { layout(); measure(); });
    new IntersectionObserver(([en]) => {
      document.body.classList.toggle("hero-in-view", en.isIntersecting); // keeps the enquiry counter off the hero buttons
      if (en.isIntersecting && !running) { running = true; last = performance.now(); requestAnimationFrame(frame); }
      else if (!en.isIntersecting) running = false;
    }).observe(hero);
  }
})();
