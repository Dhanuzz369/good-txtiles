// Static site generator for GoodBiz Apparels — v2 "Tech pack" UI.
// Usage:  SITE_URL=https://www.yourdomain.com node src/build.mjs
import { mkdirSync, writeFileSync, rmSync, cpSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE, CATEGORIES, FAMILIES, MARKETS, FAQS, LOOKS, HERO_EXTRA } from "./data.mjs";
import { GUIDES } from "./guides.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const isSet = (v) => v && !/^\{\{.*\}\}$/.test(v);
const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const abs = (p) => SITE.url.replace(/\/$/, "") + p;
const slugify = (s) => s.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const catOf = (key) => CATEGORIES.find((c) => c.key === key);
const famUrl = (f) => `/${catOf(f.cat).slug}/${f.slug}/`;
const famsOf = (key) => FAMILIES.filter((f) => f.cat === key);
const linesOf = (key) => famsOf(key).reduce((n, f) => n + f.products.length, 0);
const ALL_PRODUCTS = FAMILIES.flatMap((f) => f.products.map((p) => ({ ...p, family: f, cat: catOf(f.cat) })));
const short = (name) => { const t = name.replace(/^(Men's|Women's) /, ""); return t[0].toUpperCase() + t.slice(1); };
const pad = (n) => String(n).padStart(2, "0");
const construction = (hsn) => (hsn.startsWith("61") ? "Knitted" : "Woven");
const pageList = [];
const HERO_ORBS = (() => {
  const by = CATEGORIES.map((c) => FAMILIES.filter((f) => f.cat === c.key));
  const out = [];
  for (let i = 0; out.length < FAMILIES.length; i++) by.forEach((list) => list[i] && out.push(LOOKS[list[i].slug]));
  out.splice(3, 0, HERO_EXTRA);
  return out;
})();
const look = (f) => LOOKS[f.slug];
const cutSrc = (file) => `/assets/img/cut/${file}`;
const garment = (f, cls = "", alt = "", eager = false) => `<span class="garment ${cls}"><img src="${cutSrc(look(f).cut)}" alt="${esc(alt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async"></span>`;
const familyStage = (f) => `<div class="stage-card" style="--tone:${look(f).tone}" data-tilt>
<span class="swatch-bg"></span><span class="swatch-shadow"></span>
${garment(f, "garment-lg", `${f.name} made by ${SITE.name}`, true)}
${f.products.slice(0, 4).map((p, i) => `<span class="chip3d chip-${i}" aria-hidden="true">HSN ${p.hsn.split(" ")[0]}</span>`).join("")}
</div>`;
const fanStage = (c) => {
  const fams = famsOf(c.key).slice(0, 3);
  return `<div class="stage-card fan" style="--tone:${look(fams[1] || fams[0]).tone}" data-tilt>
<span class="swatch-bg"></span><span class="swatch-shadow"></span>
${fams.map((f, i) => garment(f, `fan-${i}`, i === 1 ? `${c.name} made by ${SITE.name}` : "", i === 1)).join("")}
</div>`;
};

// ---------------------------------------------------------------- schema
const ORG = {
  "@type": "Organization",
  "@id": abs("/#org"),
  name: SITE.name,
  url: abs("/"),
  logo: abs("/assets/favicon.svg"),
  description: "Garment manufacturer and exporter in India supplying men's, women's and kids' clothing from ready stock or made to the buyer's design, size chart and GSM.",
  ...(isSet(SITE.legalName) && { legalName: SITE.legalName }),
  ...(isSet(SITE.founded) && { foundingDate: SITE.founded }),
  address: { "@type": "PostalAddress", addressCountry: "IN", ...(isSet(SITE.city) && { addressLocality: SITE.city }), ...(isSet(SITE.address) && { streetAddress: SITE.address }) },
  ...(isSet(SITE.email) && { email: SITE.email }),
  ...((isSet(SITE.email) || isSet(SITE.phone)) && {
    contactPoint: { "@type": "ContactPoint", contactType: "sales", availableLanguage: ["English"], ...(isSet(SITE.email) && { email: SITE.email }), ...(isSet(SITE.phone) && { telephone: SITE.phone }) },
  }),
};
const breadcrumbSchema = (crumbs) => ({ "@type": "BreadcrumbList", itemListElement: crumbs.map(([name, url], i) => ({ "@type": "ListItem", position: i + 1, name, item: abs(url) })) });
const faqSchema = (faqs) => ({ "@type": "FAQPage", mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) });

// ---------------------------------------------------------------- head
function analytics() {
  if (!SITE.ga4 && !SITE.adsConversion) return "";
  const id = SITE.ga4 || SITE.adsConversion.split("/")[0];
  return `<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());${SITE.ga4 ? `gtag('config','${SITE.ga4}');` : ""}${SITE.adsConversion ? `gtag('config','${SITE.adsConversion.split("/")[0]}');` : ""}</script>`;
}
function head({ title, meta, path, noindex, schema = [], img = "hero-factory.jpg", type = "website" }) {
  return `<!doctype html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(meta)}">
<link rel="canonical" href="${abs(path)}">
<meta name="robots" content="${noindex ? "noindex, follow" : "index, follow, max-image-preview:large"}">
<meta name="theme-color" content="#F1EDE4">
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(meta)}">
<meta property="og:url" content="${abs(path)}">
<meta property="og:image" content="${abs("/assets/img/" + img)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css">
<link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/fill/style.css">
<link rel="stylesheet" href="/assets/styles.css">
<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": [ORG, ...schema] })}</script>
${analytics()}
</head>`;
}

// ---------------------------------------------------------------- header / footer
const NAV = [
  ["/ready-stock-garments/", "Ready stock"],
  ["/private-label-clothing-manufacturer/", "Made to order"],
  ["/export/", "Export markets"],
  ["/guides/", "Guides"],
];
const brand = `<a class="brand" href="/" aria-label="${SITE.name} home"><span class="brand-word">GoodBiz</span><span class="brand-sub">APPARELS</span></a>`;

function header(path, bare) {
  if (bare) {
    return `<header class="site-header"><div class="wrap">${brand}<a class="btn btn-primary btn-sm" href="#enquiry">Get a costing <i class="ph ph-arrow-down" aria-hidden="true"></i></a></div></header>`;
  }
  const cur = (h) => (path.startsWith(h) ? ' aria-current="page"' : "");
  const mega = CATEGORIES.map((c) => `<div class="mega-col"><h3 class="label"><a href="/${c.slug}/">${c.name}</a></h3><ul>${famsOf(c.key).map((f) => `<li><a href="${famUrl(f)}">${esc(short(f.name))}<span>${pad(f.products.length)}</span></a></li>`).join("")}</ul></div>`).join("");
  const mm = [
    `<li><a href="/#catalogue">Products <span class="label">${ALL_PRODUCTS.length} lines</span></a></li>`,
    ...CATEGORIES.map((c) => `<li class="mm-sub"><a href="/${c.slug}/">${c.name}</a></li>`),
    ...NAV.map(([h, l]) => `<li><a href="${h}">${l}</a></li>`),
    `<li><a href="/hsn-codes-for-garments/">HSN codes</a></li>`,
    `<li class="mm-cta"><a class="btn btn-primary" href="/contact/">Send enquiry <i class="ph ph-arrow-right" aria-hidden="true"></i></a></li>`,
  ].join("");
  return `<a class="skip-link" href="#main">Skip to content</a>
<div class="utility"><div class="wrap">
<span class="label">Garment manufacturer &amp; exporter · India → USA · UK · EU · UAE · AU</span>
<span class="utility-links label"><a href="#" data-whatsapp><i class="ph ph-whatsapp-logo" aria-hidden="true"></i> WhatsApp</a><a href="#" data-email><i class="ph ph-envelope-simple" aria-hidden="true"></i> Email</a></span>
</div></div>
<header class="site-header"><div class="wrap">
${brand}
<nav class="nav" aria-label="Main">
<button class="nav-trigger" type="button" aria-expanded="false" aria-controls="mega">Products <i class="ph ph-caret-down" aria-hidden="true"></i></button>
${NAV.map(([h, l]) => `<a href="${h}"${cur(h)}>${l}</a>`).join("")}
</nav>
<a class="btn btn-primary btn-sm header-cta" href="/contact/">Send enquiry <i class="ph ph-arrow-right" aria-hidden="true"></i></a>
<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Open menu"><span></span><span></span></button>
</div>
<div class="mega" id="mega"><div class="wrap">${mega}
<div class="mega-feature"><span class="label">Reference</span><p class="h3">Every line carries its 8 digit HSN code.</p><a class="arrow-link" style="color:#fff" href="/hsn-codes-for-garments/">See all ${ALL_PRODUCTS.length} codes <i class="ph ph-arrow-right" aria-hidden="true"></i></a></div>
</div></div>
</header>
<div class="mobile-menu" id="mobile-menu" hidden><ul>${mm}</ul></div>`;
}

function footer(bare) {
  const col = (title, items) => `<div><span class="label">${title}</span><ul>${items.map(([h, l]) => `<li><a href="${h}">${esc(l)}</a></li>`).join("")}</ul></div>`;
  const hub = bare ? "" : `<div class="foot-hub">
${CATEGORIES.map((c) => col(c.name, [[`/${c.slug}/`, `All ${c.name.toLowerCase()}`], ...famsOf(c.key).map((f) => [famUrl(f), f.name])])).join("")}
${col("How to buy", [["/ready-stock-garments/", "Ready stock garments"], ["/private-label-clothing-manufacturer/", "Made to order and private label"], ["/hsn-codes-for-garments/", "HSN codes for garments"], ["/contact/", "Send an enquiry"]])}
${col("Export markets", [["/export/", "All markets"], ...MARKETS.map((m) => [`/export/${m.slug}/`, m.name])])}
${col("Guides", [["/guides/", "All guides"], ...GUIDES.map((g) => [`/guides/${g.slug}/`, g.h1]), ["/about/", "About us"]])}
</div>`;
  return `<footer class="footer"><div class="wrap">
${hub}
<p class="foot-word" aria-hidden="true">GoodBiz</p>
<div class="foot-base"><span>${esc(SITE.address)}</span><span>Photography: Unsplash License · Updated ${SITE.updated}</span>
<ul><li><a href="/privacy/">Privacy</a></li><li><a href="/terms/">Terms</a></li><li><a href="/sitemap.xml">Sitemap</a></li></ul></div>
</div></footer>`;
}

const configScript = () => `<script>window.GB_CONFIG=${JSON.stringify({ whatsapp: SITE.whatsapp, email: SITE.email, ads: SITE.adsConversion })}</script><script src="/assets/app.js" defer></script>`;
const basket = `<a class="basket" id="basket" href="/contact/" hidden><span class="count" id="basket-count">0</span><span>in your enquiry</span></a>`;

// ---------------------------------------------------------------- components
const crumbsHtml = (crumbs) => `<nav class="crumbs label" aria-label="Breadcrumb"><ol>${crumbs.map(([n, u], i) => (i === crumbs.length - 1 ? `<li aria-current="page">${esc(n)}</li>` : `<li><a href="${u}">${esc(n)}</a></li>`)).join("")}</ol></nav>`;
const addBtn = (p) => `<button class="add" type="button" data-name="${esc(p.name)}" data-hsn="${esc(p.hsn)}" aria-pressed="false" aria-label="Add ${esc(p.name)} to enquiry"><i class="ph ph-plus" aria-hidden="true"></i><span class="button-xsm">Add</span></button>`;

const secHead = (idx, label, title, aside = "") => `<div class="sec-head reveal"><div class="sec-index"><span class="label">${idx}</span><span class="label muted">${label}</span></div><div class="sec-title"><h2 class="h2">${title}</h2>${aside ? `<p class="small">${aside}</p>` : ""}</div></div>`;

function familyCard(f) {
  return `<article class="family" style="--tone:${look(f).tone}">
<a class="swatch" href="${famUrl(f)}" tabindex="-1" aria-hidden="true" data-tilt><span class="swatch-bg"></span><span class="swatch-shadow"></span>${garment(f)}<span class="family-count label">${pad(f.products.length)} lines</span></a>
<div class="family-body">
<h3 class="h3"><a href="${famUrl(f)}">${esc(f.name)}</a></h3>
<ul class="items">${f.products.map((p) => `<li data-search="${esc((p.name + " " + p.hsn).toLowerCase())}"><div><span class="item-name">${esc(p.name)}</span><span class="item-hsn">HSN ${p.hsn} · ${construction(p.hsn)}</span></div>${addBtn(p)}</li>`).join("")}</ul>
<a class="arrow-link" href="${famUrl(f)}">Fabrics, GSM and details <i class="ph ph-arrow-right" aria-hidden="true"></i></a>
</div></article>`;
}

function faqHtml(faqs, title = "Questions buyers ask", idx = "FAQ") {
  return `<section class="section bg-2" id="faq" aria-labelledby="faq-title"><div class="wrap">
<div class="faq">
<div class="reveal"><div class="sec-index"><span class="label">${idx}</span><span class="label muted">${faqs.length} answers</span></div>
<h2 class="h2" id="faq-title" style="margin-top:var(--s4)">${title}</h2>
<p class="small" style="margin-top:var(--s4)">Anything else? <a class="link" href="/contact/">Send us your question</a>.</p></div>
<div class="faq-list reveal">${faqs.map(([q, a]) => `<details><summary>${esc(q)}<i class="ph ph-plus" aria-hidden="true"></i></summary><p class="body">${esc(a)}</p></details>`).join("")}</div>
</div></div></section>`;
}

function ctaBand(text = "Send your spec or ask what is in stock. We reply with availability or a production costing.") {
  return `<section class="section-tight"><div class="wrap"><div class="cta reveal">
<div><span class="label" style="color:#AEB9E6">Next step</span><h2 class="h2" style="margin-top:var(--s3)">Ready to <em style="color:#fff">source?</em></h2><p class="body">${text}</p></div>
<a class="btn btn-light" href="/contact/">Send your enquiry <i class="ph ph-arrow-right" aria-hidden="true"></i></a>
</div></div></section>`;
}

function enquiryForm({ heading = "Tell us what you <em>want to source.</em>", source = "website", tag = "h2" } = {}) {
  return `<section class="section" id="enquiry" aria-labelledby="enq-title"><div class="wrap enq">
<div class="enq-intro reveal">
<div class="sec-index"><span class="label">Enquiry</span><span class="label muted">Reply with stock or a costing</span></div>
<${tag} class="h2" id="enq-title">${heading}</${tag}>
<p class="body">Fill in what you know. Missing details are fine; we confirm everything in writing before a sample or dispatch.</p>
<div class="contact-list">
<a href="#" data-whatsapp><i class="ph-fill ph-whatsapp-logo" aria-hidden="true"></i><span><strong>WhatsApp</strong><span class="small">${esc(SITE.whatsapp)}</span></span><i class="ph ph-arrow-up-right" aria-hidden="true"></i></a>
<a href="#" data-email><i class="ph ph-envelope-simple" aria-hidden="true"></i><span><strong>Email</strong><span class="small">${esc(SITE.email)}</span></span><i class="ph ph-arrow-up-right" aria-hidden="true"></i></a>
</div></div>
<form class="enq-form reveal" novalidate data-source="${source}">
<div class="form-head"><span class="label">Sourcing enquiry</span><span class="label">Form GB-01</span></div>
<div class="form-body">
<div class="field-row">
<div class="field"><label class="label" for="f-name">Your name</label><input id="f-name" name="name" required autocomplete="name" data-personal="name"><p class="error" data-err="name"></p></div>
<div class="field"><label class="label" for="f-company">Company</label><input id="f-company" name="company" required autocomplete="organization" data-personal="company"><p class="error" data-err="company"></p></div>
</div>
<div class="field-row">
<div class="field"><label class="label" for="f-email">Work email</label><input id="f-email" name="email" type="email" required autocomplete="email"><p class="error" data-err="email"></p></div>
<div class="field"><label class="label" for="f-country">Destination country and port</label><input id="f-country" name="country" required placeholder="Hamburg, Germany"><p class="error" data-err="country"></p></div>
</div>
<fieldset class="field"><legend class="label">How do you want to buy?</legend>
<div class="choice-row">${["Ready stock", "Made to order", "Both"].map((v) => `<label class="choice"><input type="radio" name="path" value="${v}"><span>${v}</span></label>`).join("")}</div>
<p class="error" data-err="path"></p></fieldset>
<div class="field"><p class="label">Products</p><div class="selected" data-selected></div></div>
<div class="field"><label class="label" for="f-details">Quantities and spec</label>
<textarea id="f-details" name="details" rows="5" placeholder="3,000 pcs cotton tee, 180 GSM single jersey, S to XXL, navy and white, our woven label, 12 pcs per polybag carton."></textarea>
<p class="error" data-err="details"></p></div>
<p class="small muted">Have a tech pack or size chart? Attach it to the email that opens next. <a class="link" href="/guides/how-to-send-a-tech-pack/">What to include</a></p>
<div class="form-actions">
<button class="btn btn-primary" type="submit">Send enquiry by email <i class="ph ph-paper-plane-tilt" aria-hidden="true"></i></button>
<button class="btn btn-ghost" type="button" data-send-whatsapp><i class="ph ph-whatsapp-logo" aria-hidden="true"></i> Send on WhatsApp</button>
</div>
<p class="form-status" role="status"></p>
</div></form></div></section>`;
}

function pageHero({ crumbs, eyebrow, h1, intro, img, alt, actions = true, facts, stage }) {
  const side = stage
    ? `<div class="stage-wrap reveal">${stage}</div>`
    : img
    ? `<figure class="reveal"><img src="/assets/img/${img}" alt="${esc(alt)}" width="1200" height="900" fetchpriority="high">${facts ? "" : ""}</figure>`
    : facts
    ? `<dl class="quick-facts reveal">${facts.map(([k, v]) => `<div><dt class="label muted">${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>`
    : "";
  return `<section class="page-hero"><div class="wrap">
${crumbsHtml(crumbs)}
<div class="page-hero-grid${img || stage ? "" : " solo"}">
<div class="reveal">
<span class="label eyebrow">${eyebrow}</span>
<h1 class="h1">${esc(h1)}</h1>
<p class="lead">${esc(intro)}</p>
${actions ? `<div class="hero-actions"><a class="btn btn-primary" href="/contact/">Send your enquiry <i class="ph ph-arrow-right" aria-hidden="true"></i></a><a class="btn btn-ghost" href="#products">Products and HSN codes</a></div>` : ""}
</div>
${side}
</div></div></section>`;
}

const tile = (href, img, title, sub, cta = "Explore") => `<a class="tile reveal${img ? "" : " tile-text"}" href="${href}">${img ? `<img src="/assets/img/${img}" alt="" loading="lazy" width="1200" height="750">` : ""}<span class="label muted">${sub}</span><h3>${esc(title)}</h3><span class="arrow-link">${cta} <i class="ph ph-arrow-right" aria-hidden="true"></i></span></a>`;

// ---------------------------------------------------------------- page writer
function page({ path, title, meta, body, schema = [], noindex = false, bare = false, img, type, sitemap = true }) {
  const html = `${head({ title, meta, path, noindex, schema, img, type })}
<body${bare ? ' class="lp"' : ""}>
${header(path, bare)}
<main id="main">
${body}
</main>
${bare ? "" : basket}
${footer(bare)}
${configScript()}
</body>
</html>
`;
  const file = path.endsWith(".html") ? join(ROOT, path) : join(ROOT, path, "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  if (!noindex && sitemap) pageList.push(path);
}

rmSync(ROOT, { recursive: true, force: true });
mkdirSync(ROOT, { recursive: true });

// ================================================================ HOME
{
  const tabs = CATEGORIES.map((c, i) => `<button class="tab" role="tab" aria-selected="${i === 0}" aria-controls="panel-${c.key}" id="tab-${c.key}" data-cat="${c.key}">${c.name.replace(" clothing", "")}<span>${pad(linesOf(c.key))}</span></button>`).join("");
  const panels = CATEGORIES.map((c, i) => `<div class="families" role="tabpanel" id="panel-${c.key}" aria-labelledby="tab-${c.key}"${i ? " hidden" : ""}>${famsOf(c.key).map(familyCard).join("")}</div>`).join("");
  const tick = `<ul>${ALL_PRODUCTS.map((p) => `<li>${esc(p.name)}<span>${p.hsn}</span></li>`).join("")}</ul>`;
  page({
    path: "/",
    title: "Garment Manufacturer & Exporter in India | GoodBiz Apparels",
    meta: "Men's, women's and kids' clothing manufactured and exported from India. Order ready stock or send your design, size chart and GSM. 38 lines with HSN codes.",
    schema: [{ "@type": "WebSite", "@id": abs("/#website"), url: abs("/"), name: SITE.name, publisher: { "@id": abs("/#org") } }, faqSchema(FAQS)],
    body: `
<section class="hero3d" id="top" data-hero aria-labelledby="hero-title">
<div class="hero3d-sticky">
<div class="blobs" aria-hidden="true"><span></span><span></span><span></span></div>
<div class="scene" data-scene>
${HERO_ORBS.map((g, i) => `<figure class="orb${i >= 9 ? " orb-desk" : ""}" data-orb style="--tone:${g.tone};--i:${i}"><img src="${cutSrc(g.cut)}" alt=""${i < 5 ? ' fetchpriority="high"' : ""} decoding="async"></figure>`).join("")}
<div class="hero3d-copy">
<p class="hero-kicker label"><span class="dot" aria-hidden="true"></span> Garment manufacturer &amp; exporter · India</p>
<h1 class="display hero3d-title" id="hero-title"><span class="phase phase-a" data-ph="0">Made to <em>your spec.</em></span> <span class="phase phase-b" data-ph="1">Or shipped <em>from stock.</em></span></h1>
<p class="display phase phase-c" data-ph="2" aria-hidden="true">${ALL_PRODUCTS.length} lines. <em>Pick yours.</em></p>
</div>
</div>
<div class="hero3d-foot">
<p class="lead">Men's, women's and kids' clothing manufactured and exported from India. Made to your design, size chart and GSM, or shipped from finished stock.</p>
<div class="hero-actions"><a class="btn btn-primary" href="#enquiry">Send your enquiry <i class="ph ph-arrow-right" aria-hidden="true"></i></a><a class="btn btn-ghost" href="#catalogue">Browse the catalogue</a></div>
</div>
<div class="meter" aria-hidden="true"><span class="label" data-step="0">01 · Your spec</span><span class="label" data-step="1">02 · Our stock</span><span class="label" data-step="2">03 · The range</span><span class="meter-bar"><i data-meter></i></span></div>
<p class="scroll-cue label" aria-hidden="true" data-cue><span></span>Scroll to unfold</p>
</div>
</section>

<div class="ticker" aria-label="Product lines"><div class="ticker-track">${tick}<ul aria-hidden="true">${ALL_PRODUCTS.map((p) => `<li>${esc(p.name)}<span>${p.hsn}</span></li>`).join("")}</ul></div></div>

<section class="section-tight shop" aria-labelledby="shop-title"><div class="wrap">
<div class="shop-head reveal"><h2 class="h2" id="shop-title">Shop by <em>product.</em></h2><a class="arrow-link" href="/hsn-codes-for-garments/">All ${ALL_PRODUCTS.length} lines with HSN codes <i class="ph ph-arrow-right" aria-hidden="true"></i></a></div>
<ul class="bubbles">${FAMILIES.map((f, i) => `<li class="reveal" style="--i:${i}"><a class="bubble-link" href="${famUrl(f)}" style="--tone:${look(f).tone}"><span class="bubble"><span class="disc"></span><span class="pop"><img src="${cutSrc(look(f).cut)}" alt="" loading="lazy" decoding="async"></span></span><span class="bubble-name">${esc(short(f.name))}</span><span class="label muted">${catOf(f.cat).name.split(" ")[0]} · ${pad(f.products.length)} lines</span></a></li>`).join("")}</ul>
</div></section>

<section class="section" id="buy"><div class="wrap">
${secHead("01", "Two ways to buy", "Pick from stock, or bring <em>your tech pack.</em>", "Use one route or both. Stock and made to order lines can travel in the same shipment.")}
<div class="ways">
<article class="way way-stock reveal">
<div class="way-media"><img src="/assets/img/stock-racks.jpg" alt="Finished garments in neutral tones hanging on a rail" loading="lazy" width="1200" height="1800"><span class="way-tag"><i class="ph ph-package" aria-hidden="true"></i> Ready stock</span></div>
<div class="way-body"><h3 class="h3">Finished garments, ready to dispatch.</h3>
<ol class="way-steps"><li>Tell us products, sizes and quantities</li><li>Get availability with photos of the actual lot</li><li>Add your labels if you want them</li><li>Pay and ship with full export documents</li></ol>
<a class="btn btn-ghost" href="/ready-stock-garments/">How ready stock works <i class="ph ph-arrow-right" aria-hidden="true"></i></a></div>
</article>
<article class="way way-made reveal">
<div class="way-media"><img src="/assets/img/custom-sewing.jpg" alt="Operator guiding fabric through an industrial sewing machine" loading="lazy" width="1200" height="1800"><span class="way-tag"><i class="ph ph-ruler" aria-hidden="true"></i> Made to order</span></div>
<div class="way-body"><h3 class="h3">Your design, sizes, quality and GSM.</h3>
<ol class="way-steps"><li>Send a tech pack or reference garment</li><li>We source fabric to the GSM you set</li><li>Approve a physical sample in writing</li><li>Bulk production, inspection and shipment</li></ol>
<a class="btn btn-light" href="/private-label-clothing-manufacturer/">How made to order works <i class="ph ph-arrow-right" aria-hidden="true"></i></a></div>
</article>
</div>
</div></section>

<section class="tagline" aria-label="What we do"><div class="wrap"><p class="tagline-text" id="tagline">You send the design, the size chart and the GSM. We send it back stitched, packed and ready for customs.</p></div></section>

<section class="section bg-2" id="catalogue"><div class="wrap">
${secHead("02", "Export catalogue", `${ALL_PRODUCTS.length} lines, each with <em>its HSN code.</em>`, "Add the lines you want. They go straight into your enquiry, codes included.")}
<div class="cat-layout">
<div class="cat-side reveal">
<div class="tabs" role="tablist" aria-label="Product category">${tabs}</div>
<label class="search"><i class="ph ph-magnifying-glass" aria-hidden="true"></i><span class="sr-only">Search by product or HSN code</span><input type="search" id="cat-search" placeholder="Search product or HSN code" autocomplete="off"></label>
<p class="small">Need every code in one table? See <a class="link" href="/hsn-codes-for-garments/">HSN codes for garments</a>.</p>
</div>
<div>
${panels}
<div class="cat-empty" id="cat-empty" hidden><i class="ph ph-magnifying-glass" aria-hidden="true"></i><p class="h4">No product matches that search</p><p class="small">Try polo, kurta or blazer, or an HSN code such as 6205. Sourcing something not listed? Describe it in the enquiry.</p></div>
<p class="small muted photo-note">Photos show the product type. Your order follows your spec or the actual stock lot.</p>
</div>
</div>
</div></section>

<section class="section"><div class="wrap">
${secHead("03", "What you can specify", "Every detail that decides <em>how it sells.</em>", "Have only a reference garment? We write the spec with you and confirm it before the sample.")}
<ul class="spec-sheet reveal">
${[["ph-scales", "Fabric and GSM", "Cotton, polyester, silk, blends and handloom, weighed to the GSM you set."], ["ph-ruler", "Size chart and fit", "Graded to your measurements for your market, from baby sizes up."], ["ph-palette", "Colours and prints", "Matched to Pantone references or a physical swatch."], ["ph-tag", "Labels and trims", "Your brand, care and fibre labels, hang tags, buttons and zips."], ["ph-package", "Packing", "Folding, polybags, ratio packing per carton and carton marks."], ["ph-file-text", "Export documents", "Invoice and packing list with the HSN code for each line."]]
  .map(([i, h, t], n) => `<li><span class="label">SPEC ${pad(n + 1)}<i class="ph ${i}" aria-hidden="true"></i></span><h3>${h}</h3><p class="small">${t}</p></li>`).join("")}
</ul>
<p class="small" style="margin-top:var(--s5)">New to GSM? Read the <a class="link" href="/guides/garment-gsm-guide/">fabric GSM guide</a> or the <a class="link" href="/guides/how-to-send-a-tech-pack/">tech pack checklist</a>.</p>
</div></section>

<section class="section bg-indigo" id="process"><div class="wrap">
${secHead("04", "How an order runs", "From enquiry to <em style=\"color:#AEB9E6\">your port.</em>")}
<div class="ruler" aria-hidden="true"></div>
<ol class="steps">
<li class="step reveal"><span class="label">Step 01</span><h3>Send the enquiry</h3><p class="body">Products, quantities, spec or tech pack, and destination. We reply with stock availability or a costing.</p></li>
<li class="step reveal"><span class="label">Step 02</span><h3>Approve photos or sample</h3><p class="body">For stock you see the actual lot. For custom orders you approve a physical sample before bulk starts.</p></li>
<li class="step reveal"><span class="label">Step 03</span><h3>Produce, pack, ship</h3><p class="body">Goods are checked, packed to your carton plan and shipped with invoice, packing list and HSN codes.</p></li>
</ol>
<div class="ship">
<img class="reveal" src="/assets/img/shipping.jpg" alt="Container vessel being loaded under gantry cranes at a port" loading="lazy" width="1200" height="800">
<div class="reveal"><span class="label" style="color:#AEB9E6">We ship to</span><nav class="markets" aria-label="Export markets" style="margin-top:var(--s3)">${MARKETS.map((m) => `<a href="/export/${m.slug}/">${m.name}<i class="ph ph-arrow-right" aria-hidden="true"></i></a>`).join("")}</nav></div>
</div>
</div></section>

<section class="section"><div class="wrap">
${secHead("05", "Export credentials", "The paperwork buyers <em>ask for first.</em>")}
<dl class="creds reveal">
<div><dt class="label muted">Importer Exporter Code</dt><dd>${esc(SITE.iec)}</dd></div>
<div><dt class="label muted">GSTIN</dt><dd>${esc(SITE.gstin)}</dd></div>
<div><dt class="label muted">Certifications</dt><dd>${esc(SITE.certifications)}</dd></div>
<div><dt class="label muted">Minimum order</dt><dd>${esc(SITE.moq)}</dd></div>
</dl>
</div></section>

${faqHtml(FAQS, "Before you send the <em>enquiry.</em>", "06")}
${enquiryForm({ source: "home" })}`,
  });
}

// ================================================================ PILLARS
const pillar = ({ path, eyebrow, title, meta, h1, intro, img, alt, prose, facts, faqs, service }) => {
  const crumbs = [["Home", "/"], [eyebrow, path]];
  page({
    path, title, meta, img,
    schema: [breadcrumbSchema(crumbs), faqSchema(faqs), { "@type": "Service", name: h1, serviceType: service, provider: { "@id": abs("/#org") }, areaServed: ["US", "GB", "EU", "AE", "AU"], description: intro }],
    body: `${pageHero({ crumbs, eyebrow, h1, intro, img, alt })}
<section class="section"><div class="wrap prose-grid"><div class="prose reveal">${prose}</div>
<aside class="aside reveal"><div class="aside-block"><span class="label">At a glance</span><dl>${facts.map(([k, v]) => `<div><dt class="label muted">${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl></div></aside></div></section>
<section class="section bg-2" id="products"><div class="wrap">
${secHead("Range", "Product families", "Choose a category for <em>fabrics, GSM and codes.</em>")}
<div class="tiles">${CATEGORIES.map((c) => tile(`/${c.slug}/`, c.img, c.name, `${pad(linesOf(c.key))} lines`)).join("")}</div>
</div></section>
${faqHtml(faqs)}
${ctaBand()}`,
  });
};

pillar({
  path: "/ready-stock-garments/", eyebrow: "Ready stock", service: "Wholesale ready stock garments for export",
  title: "Ready Stock Garments for Export from India | Wholesale | GoodBiz",
  meta: "Buy ready stock men's, women's and kids' garments from India for fast dispatch. Photos of the actual lot, your labels on request, export documents with HSN codes.",
  h1: "Ready stock garments for export from India",
  intro: "Ready stock garments are finished pieces already made and packed, so they can ship without waiting for a production run. GoodBiz Apparels holds ready stock across men's, women's and kids' lines and ships it to importers with full export documents.",
  img: "stock-racks.jpg", alt: "Finished garments in neutral tones hanging on a rail",
  prose: `<h2>How buying ready stock works</h2>
<ol><li><strong>Tell us what you need.</strong> Products, sizes, colours and quantities, plus your destination port.</li><li><strong>We confirm availability.</strong> You get quantities by size and colour with photos of the actual lot.</li><li><strong>Labels and packing.</strong> Add your own brand labels and hang tags if you want them, and confirm the carton plan.</li><li><strong>Proforma, payment and dispatch.</strong> We ship with the commercial invoice, packing list and HSN codes.</li></ol>
<h2>When ready stock is the right choice</h2>
<ul><li>You need goods for a season that starts soon.</li><li>You want to test a product in your market before a production order.</li><li>You are replenishing a line that sold through.</li></ul>
<h2>Mixing stock with made to order</h2>
<p>You can combine ready stock lines with <a href="/private-label-clothing-manufacturer/">made to order styles</a> in one shipment. Stock lines wait until production lines are ready, or ship ahead if you prefer.</p>`,
  facts: [["Lead time", "Ships once availability, payment and documents are confirmed"], ["Quantities", "Depends on the lot. Tell us what you need"], ["Your labels", "Available on request"], ["Documents", "Invoice and packing list with HSN codes"]],
  faqs: [["What is ready stock in garments?", "Ready stock garments are finished, packed pieces already produced, so they can ship without a new production run."], ["Can I see the stock before paying?", "Yes. We send photos of the actual lot, with quantities by size and colour, before you pay."], ["Can you add my brand labels to ready stock?", "Yes. Send your labels or artwork and we attach them before packing."]],
});

pillar({
  path: "/private-label-clothing-manufacturer/", eyebrow: "Made to order", service: "Private label and custom clothing manufacturing",
  title: "Private Label Clothing Manufacturer India | GoodBiz",
  meta: "Private label and custom clothing manufacturer in India. We produce to your design, tech pack, size chart, fabric and GSM, with your labels. Sample before bulk.",
  h1: "Private label clothing manufacturer in India",
  intro: "GoodBiz Apparels manufactures garments to the buyer's own design, size chart, fabric and GSM, finished with the buyer's labels. This is made to order, or private label, production: the garment is yours, we make it.",
  img: "custom-sewing.jpg", alt: "Operator guiding fabric through an industrial sewing machine",
  prose: `<h2>What you send us</h2>
<p>A tech pack if you have one, or a reference garment with notes on what to change. The essentials are design, size chart, fabric and GSM, colours, labels, packing and quantities. Our <a href="/guides/how-to-send-a-tech-pack/">tech pack checklist</a> covers each item.</p>
<h2>How production runs</h2>
<ol><li><strong>Spec and costing.</strong> We confirm every detail in writing and send a costing.</li><li><strong>Fabric to your GSM.</strong> Sourced to the weight and composition you set. See the <a href="/guides/garment-gsm-guide/">GSM guide</a>.</li><li><strong>Sample.</strong> Made to your spec; you get photos, measurements and the physical piece.</li><li><strong>Bulk production.</strong> Starts only after your written approval of the sample.</li><li><strong>Inspection and shipment.</strong> Checked against the approved sample, packed to your carton plan, shipped with export documents.</li></ol>
<h2>Your brand, start to finish</h2>
<p>Woven and printed labels, care and fibre labels, hang tags, branded trims and packaging are produced to your artwork. Nothing carries our name.</p>`,
  facts: [["Minimum order", SITE.moq], ["Sample", "Always before bulk"], ["Fabric", "Sourced to your GSM and composition"], ["Labels", "Yours, to your artwork"]],
  faqs: [["What is a private label clothing manufacturer?", "A manufacturer that produces garments to a buyer's design and specification and labels them with the buyer's brand. The buyer sells them as their own product."], ["Do I need a tech pack to start?", "No. A reference garment with written changes is enough. We turn it into a spec sheet for your approval."], ["Do you make a sample before bulk?", "Yes. Bulk production starts only after you approve the sample in writing."]],
});

// ================================================================ CATEGORIES
for (const c of CATEGORIES) {
  const fams = famsOf(c.key);
  const crumbs = [["Home", "/"], [c.name, `/${c.slug}/`]];
  const faqs = fams.flatMap((f) => f.faqs.slice(0, 1));
  page({
    path: `/${c.slug}/`, title: c.title, meta: c.meta, img: c.img,
    schema: [breadcrumbSchema(crumbs), faqSchema(faqs), { "@type": "ItemList", name: c.h1, itemListElement: fams.map((f, i) => ({ "@type": "ListItem", position: i + 1, name: f.name, url: abs(famUrl(f)) })) }],
    body: `${pageHero({ crumbs, eyebrow: `${c.name} · ${pad(linesOf(c.key))} lines`, h1: c.h1, intro: c.intro, stage: fanStage(c) })}
<section class="section bg-2" id="products"><div class="wrap">
${secHead("Range", `${fams.length} families`, `${esc(c.name)} with <em>HSN codes.</em>`)}
<div class="families">${fams.map(familyCard).join("")}</div>
</div></section>
<section class="section"><div class="wrap prose-grid"><div class="prose reveal">${c.body.map((p) => `<p>${esc(p)}</p>`).join("")}
<p>Buying for a specific market? See <a href="/export/">export markets</a>. Need every code in one table? See <a href="/hsn-codes-for-garments/">HSN codes for garments</a>.</p></div>
<aside class="aside reveal"><div class="aside-block"><span class="label">Two ways to buy</span><dl><div><dt><a href="/ready-stock-garments/">Ready stock</a></dt><dd>Finished pieces, faster dispatch</dd></div><div><dt><a href="/private-label-clothing-manufacturer/">Made to order</a></dt><dd>Your design, size chart and GSM</dd></div></dl></div></aside></div></section>
${faqHtml(faqs)}
${ctaBand()}`,
  });
}

// ================================================================ FAMILIES
for (const f of FAMILIES) {
  const c = catOf(f.cat);
  const url = famUrl(f);
  const crumbs = [["Home", "/"], [c.name, `/${c.slug}/`], [f.name, url]];
  page({
    path: url, title: f.title, meta: f.meta, img: f.img,
    schema: [breadcrumbSchema(crumbs), faqSchema(f.faqs), { "@type": "ItemList", name: f.h1, itemListElement: f.products.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: `${p.name} (HSN ${p.hsn})`, url: abs(url + "#" + slugify(p.name)) })) }],
    body: `${pageHero({ crumbs, eyebrow: c.name, h1: f.h1, intro: f.intro, stage: familyStage(f) })}
<section class="section bg-2" id="products"><div class="wrap">
${secHead("Lines", `${pad(f.products.length)} products`, "Products and <em>HSN codes.</em>", "Every line is available from ready stock or made to your spec.")}
<div class="product-grid" style="--tone:${look(f).tone}">${f.products.map((p) => `<article class="tagcard reveal" id="${slugify(p.name)}">
<span class="hsn">HSN ${p.hsn} · ${construction(p.hsn)}</span>
<h3>${esc(p.name)}</h3>
<p class="small">${esc(p.desc)}</p>
${addBtn(p)}
<p class="ways-row"><span><i class="ph ph-package" aria-hidden="true"></i> Ready stock</span><span><i class="ph ph-ruler" aria-hidden="true"></i> Made to order</span></p>
</article>`).join("")}</div>
</div></section>
<section class="section"><div class="wrap prose-grid">
<div class="prose reveal"><h2>About this range</h2>${f.body.map((p) => `<p>${esc(p)}</p>`).join("")}
<h2>Specification options</h2>
<table><tbody>${f.specs.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</tbody></table>
<p class="updated">Fabric weights are typical industry ranges. We produce to the GSM you specify. <a href="/guides/garment-gsm-guide/">How to choose GSM</a>.</p></div>
<aside class="aside reveal">
<div class="aside-block"><span class="label">More ${esc(c.name.toLowerCase())}</span><ul>${famsOf(f.cat).filter((x) => x !== f).map((r) => `<li><a href="${famUrl(r)}">${esc(r.name)}<i class="ph ph-arrow-right" aria-hidden="true"></i></a></li>`).join("")}<li><a href="/${c.slug}/">All ${esc(c.name.toLowerCase())}<i class="ph ph-arrow-right" aria-hidden="true"></i></a></li></ul></div>
<div class="aside-block"><span class="label">Exporting to</span><ul>${MARKETS.map((m) => `<li><a href="/export/${m.slug}/">${m.name}<i class="ph ph-arrow-right" aria-hidden="true"></i></a></li>`).join("")}</ul></div>
</aside></div></section>
${faqHtml(f.faqs)}
${ctaBand("Add the lines you need from this range to your enquiry and we reply with stock availability or a costing.")}`,
  });
}

// ================================================================ HSN HUB
{
  const crumbs = [["Home", "/"], ["HSN codes for garments", "/hsn-codes-for-garments/"]];
  const faqs = [
    ["What is an HSN code for garments?", "HSN (Harmonized System of Nomenclature) codes classify goods for customs and tax. Garments fall in chapter 61 if knitted and chapter 62 if woven. India uses 8 digit codes; the first 6 digits are shared internationally."],
    ["What is the difference between chapter 61 and chapter 62?", "Chapter 61 covers knitted or crocheted garments such as T shirts and leggings. Chapter 62 covers woven garments such as shirts, trousers, jeans, dresses and blazers."],
    ["What is the HSN code for cotton T shirts?", "Cotton T shirts are invoiced under 61091000 in our catalogue, for men, women and kids."],
    ["What HSN code applies to babies' garments?", "Babies' garments use heading 6209: 62092000 for cotton, 62093000 for synthetic fibres and 62099090 for other textiles. Babies' garments are for children of a body height not exceeding 86 cm."],
  ];
  const rows = CATEGORIES.map((c) => `<tbody><tr class="group"><th colspan="3" scope="colgroup">${c.name}</th></tr>${ALL_PRODUCTS.filter((p) => p.cat === c).map((p) => `<tr><td><a href="${famUrl(p.family)}#${slugify(p.name)}">${esc(p.name)}</a></td><td class="hsn">${p.hsn}</td><td>${construction(p.hsn)} (ch. ${p.hsn.slice(0, 2)})</td></tr>`).join("")}</tbody>`).join("");
  page({
    path: "/hsn-codes-for-garments/", type: "article",
    title: "HSN Codes for Garments: Shirts, T Shirts, Jeans, Dresses, Babywear",
    meta: "8 digit HSN codes for 38 garment lines: shirts, T shirts, polos, jeans, trousers, jackets, blouses, dresses, kurta sets, leggings, babywear and kidswear.",
    schema: [breadcrumbSchema(crumbs), faqSchema(faqs)],
    body: `${pageHero({ crumbs, eyebrow: "Reference", h1: "HSN codes for garments", intro: "These are the 8 digit HSN codes GoodBiz Apparels uses on export invoices for 38 garment lines. Knitted garments fall in chapter 61 and woven garments in chapter 62. Your country's import tariff code is confirmed by your customs broker.", actions: false, facts: [["Lines", String(ALL_PRODUCTS.length)], ["Chapter 61", "Knitted garments"], ["Chapter 62", "Woven garments"], ["Updated", SITE.updated]] })}
<section class="section"><div class="wrap"><div class="prose reveal" style="max-width:960px">
<table class="hsn-table"><thead><tr><th>Product</th><th>HSN code</th><th>Construction</th></tr></thead>${rows}</table>
<h2>How to read a garment HSN code</h2>
<p>Take 62052090. <strong>62</strong> is the chapter (woven apparel). <strong>6205</strong> is the heading (men's or boys' shirts). <strong>620520</strong> is the internationally shared subheading (of cotton). The last two digits, <strong>90</strong>, are India's national split.</p>
<p>Because the first six digits are shared by most customs systems, they give your broker a reliable starting point. The final import code and duty rate come from your own country's tariff. See also <a href="/guides/importing-garments-from-india/">how to import garments from India</a>.</p>
</div></div></section>
${faqHtml(faqs)}
${ctaBand()}`,
  });
}

// ================================================================ EXPORT
{
  const crumbs = [["Home", "/"], ["Export markets", "/export/"]];
  page({
    path: "/export/",
    title: "Garment Export Markets: USA, UK, Europe, UAE, Australia | GoodBiz",
    meta: "GoodBiz Apparels exports garments from India to the USA, UK, EU, UAE and Australia. Labelling, trade agreements and documents for each market.",
    schema: [breadcrumbSchema(crumbs)],
    body: `${pageHero({ crumbs, eyebrow: "Export markets", h1: "Where we export garments from India", intro: "GoodBiz Apparels ships ready stock and made to order garments from India to importers in the United States, United Kingdom, European Union, UAE and GCC, and Australia. Each market has its own labelling rules and trade terms.", actions: false, img: "shipping.jpg", alt: "Container vessel being loaded at a port" })}
<section class="section"><div class="wrap"><div class="tiles">${MARKETS.map((m, i) => tile(`/export/${m.slug}/`, null, m.name, `Market ${pad(i + 1)}`, "Labelling, tariffs and documents")).join("")}</div></div></section>
${ctaBand()}`,
  });
  for (const m of MARKETS) {
    const cr = [...crumbs, [m.name, `/export/${m.slug}/`]];
    const short = { usa: "the USA", uk: "the UK", europe: "Europe", uae: "the UAE", australia: "Australia" }[m.slug];
    const faqs = [[`Can you ship garments from India to ${short}?`, "Yes. We ship ready stock and made to order garments with the commercial invoice, packing list and HSN codes your broker needs."], ["Who confirms the import duty?", "Your customs broker classifies the goods under your country's tariff. We provide the Indian 8 digit HSN code for each line as a starting point."]];
    page({
      path: `/export/${m.slug}/`, title: m.title, meta: m.meta,
      schema: [breadcrumbSchema(cr), faqSchema(faqs)],
      body: `${pageHero({ crumbs: cr, eyebrow: "Export market", h1: m.h1, intro: m.intro, img: "shipping.jpg", alt: "Container vessel being loaded at a port" })}
<section class="section"><div class="wrap prose-grid"><div class="prose reveal">
${m.points.map(([h, t]) => `<h2>${esc(h)}</h2><p>${esc(t)}</p>`).join("")}
<p class="updated">General guidance, not legal or customs advice. Rules change; confirm current requirements with your customs broker.</p></div>
<aside class="aside reveal">
<div class="aside-block"><span class="label">Popular lines</span><ul>${[0, 1, 2, 4, 5, 7, 9].map((i) => FAMILIES[i]).map((f) => `<li><a href="${famUrl(f)}">${esc(f.name)}<i class="ph ph-arrow-right" aria-hidden="true"></i></a></li>`).join("")}</ul></div>
<div class="aside-block"><span class="label">Other markets</span><ul>${MARKETS.filter((x) => x !== m).map((x) => `<li><a href="/export/${x.slug}/">${x.name}<i class="ph ph-arrow-right" aria-hidden="true"></i></a></li>`).join("")}</ul></div>
</aside></div></section>
<section class="section bg-2" id="products"><div class="wrap">
${secHead("Range", "Categories", `What we ship to <em>${esc(short)}.</em>`)}
<div class="tiles">${CATEGORIES.map((c) => tile(`/${c.slug}/`, c.img, c.name, `${pad(linesOf(c.key))} lines`)).join("")}</div></div></section>
${faqHtml(faqs)}
${ctaBand()}`,
    });
  }
}

// ================================================================ GUIDES
{
  const crumbs = [["Home", "/"], ["Guides", "/guides/"]];
  page({
    path: "/guides/",
    title: "Garment Sourcing Guides for Importers | GSM, Tech Packs, HSN",
    meta: "Practical guides for buyers sourcing clothing from India: fabric GSM, writing a tech pack, importing step by step and HSN codes for garments.",
    schema: [breadcrumbSchema(crumbs)],
    body: `${pageHero({ crumbs, eyebrow: "Guides", h1: "Garment sourcing guides for importers", intro: "Plain answers to the questions buyers ask before placing a garment order with an Indian manufacturer: fabric weight, tech packs, import steps and customs codes.", actions: false, facts: [["Guides", String(GUIDES.length + 1)], ["Updated", SITE.updated]] })}
<section class="section"><div class="wrap"><div class="tiles">
${[...GUIDES.map((g, i) => [`/guides/${g.slug}/`, g.h1, `Guide ${pad(i + 1)}`]), ["/hsn-codes-for-garments/", "HSN codes for garments", "Reference"]].map(([u, t, s]) => tile(u, null, t, s, "Read")).join("")}
</div></div></section>${ctaBand()}`,
  });
  for (const g of GUIDES) {
    const cr = [...crumbs, [g.h1, `/guides/${g.slug}/`]];
    page({
      path: `/guides/${g.slug}/`, title: g.title, meta: g.meta, type: "article",
      schema: [breadcrumbSchema(cr), faqSchema(g.faqs), { "@type": "Article", headline: g.h1, description: g.meta, dateModified: SITE.updated, author: { "@id": abs("/#org") }, publisher: { "@id": abs("/#org") }, mainEntityOfPage: abs(`/guides/${g.slug}/`) }],
      body: `${pageHero({ crumbs: cr, eyebrow: "Guide", h1: g.h1, intro: g.lead, actions: false, facts: [["Updated", SITE.updated], ["By", `${SITE.name} sourcing team`], ["Sections", String(g.sections.length)]] })}
<section class="section"><div class="wrap prose-grid"><article class="prose reveal">
${g.sections.map(([h, html]) => `<h2>${h}</h2>${html}`).join("\n")}
</article>
<aside class="aside reveal"><div class="aside-block"><span class="label">In this guide</span><ul>${g.sections.map(([h]) => `<li><a href="#${slugify(h)}">${h}<i class="ph ph-arrow-down" aria-hidden="true"></i></a></li>`).join("")}</ul></div>
<div class="aside-block"><span class="label">More guides</span><ul>${GUIDES.filter((x) => x !== g).map((x) => `<li><a href="/guides/${x.slug}/">${x.h1}<i class="ph ph-arrow-right" aria-hidden="true"></i></a></li>`).join("")}</ul></div></aside>
</div></section>
${faqHtml(g.faqs)}
${ctaBand()}`.replace(/<h2>([^<]+)<\/h2>/g, (m, h) => `<h2 id="${slugify(h)}">${h}</h2>`),
    });
  }
}

// ================================================================ ABOUT / CONTACT
{
  const crumbs = [["Home", "/"], ["About", "/about/"]];
  page({
    path: "/about/",
    title: "About GoodBiz Apparels | Garment Manufacturer & Exporter, India",
    meta: "About GoodBiz Apparels, a garment manufacturer and exporter in India supplying importers with ready stock and made to order clothing.",
    schema: [breadcrumbSchema(crumbs), { "@type": "AboutPage", about: { "@id": abs("/#org") } }],
    body: `${pageHero({ crumbs, eyebrow: "About", h1: "About GoodBiz Apparels", intro: "GoodBiz Apparels is a garment manufacturer and exporter based in India. We supply importers, brands and retailers with men's, women's and kids' clothing, from ready stock or made to their own design, size chart and GSM.", img: "hero-factory.jpg", alt: "Stitching floor with operators at sewing machines", actions: false })}
<section class="section"><div class="wrap prose-grid"><div class="prose reveal">
<h2>Who we are</h2><p>{{Company story: when you started, who runs it, and why buyers work with you.}}</p>
<h2>Where we make garments</h2><p>{{Factory location, production capacity per month, number of machines and staff, in house versus partner processes.}}</p>
<h2>Quality and compliance</h2><p>{{Inspection process, certifications held, social compliance audits.}}</p>
</div><aside class="aside reveal"><div class="aside-block"><span class="label">Company details</span><dl>
${[["Legal name", SITE.legalName], ["IEC", SITE.iec], ["GSTIN", SITE.gstin], ["Founded", SITE.founded], ["Address", SITE.address]].map(([k, v]) => `<div><dt class="label muted">${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl></div></aside></div></section>
${ctaBand()}`,
  });
  const cc = [["Home", "/"], ["Contact", "/contact/"]];
  page({
    path: "/contact/",
    title: "Contact GoodBiz Apparels | Garment Export Enquiry",
    meta: "Send a garment sourcing enquiry to GoodBiz Apparels. Ready stock or made to order. Reply with availability or a production costing. WhatsApp or email.",
    schema: [breadcrumbSchema(cc), { "@type": "ContactPage", about: { "@id": abs("/#org") } }],
    body: `<div class="wrap" style="padding-top:var(--s6)">${crumbsHtml(cc)}</div>
${enquiryForm({ heading: "Send your garment <em>sourcing enquiry.</em>", source: "contact", tag: "h1" })}
${faqHtml(FAQS.slice(0, 4))}`,
  });
}

// ================================================================ LANDING PAGES (noindex)
function lpBody({ eyebrow, h1, sub, source, personal }) {
  return `<section class="hero"><div class="wrap hero-grid">
<div class="hero-copy">
<p class="hero-kicker label"><span class="dot" aria-hidden="true"></span> ${eyebrow}</p>
${personal ? `<p class="lp-greet" data-greet hidden></p>` : ""}
<h1 class="display">${h1}</h1>
<p class="lead">${sub}</p>
<ul class="lp-checks">${["Ready stock or made to your design, size chart and GSM", "Sample approval before bulk production", "Your labels, and HSN codes on every invoice line", `Men's, women's, kids and babywear, ${ALL_PRODUCTS.length} lines`].map((t) => `<li><i class="ph ph-check-circle" aria-hidden="true"></i>${t}</li>`).join("")}</ul>
<a class="btn btn-primary" href="#enquiry">Get a costing <i class="ph ph-arrow-down" aria-hidden="true"></i></a>
</div>
<div class="hero-visual"><img src="/assets/img/hero-factory.jpg" alt="Stitching floor with operators at sewing machines" width="1200" height="800" fetchpriority="high"></div>
</div></section>
<section class="section bg-2"><div class="wrap">
${secHead("Range", `${ALL_PRODUCTS.length} lines`, "What we <em>make.</em>")}
<div class="tiles">${CATEGORIES.map((c) => `<div class="tile"><img src="/assets/img/${c.img}" alt="" loading="lazy" width="1200" height="750"><span class="label muted">${pad(linesOf(c.key))} lines</span><h3>${c.name}</h3><p class="small">${famsOf(c.key).map((f) => short(f.name)).join(", ")}</p></div>`).join("")}</div>
</div></section>
${enquiryForm({ source })}
${faqHtml(FAQS.slice(0, 5))}`;
}
page({
  path: "/lp/garment-manufacturer/", noindex: true, bare: true, sitemap: false,
  title: "Garment Manufacturer in India | Get a Costing | GoodBiz Apparels",
  meta: "Clothing made to your spec or shipped from ready stock. Send your enquiry for a costing.",
  body: lpBody({ eyebrow: "Garment manufacturer &amp; exporter · India", h1: "Your garments, made to <em>spec</em> or shipped from stock.", sub: "Send your design, size chart and GSM, or ask what is in stock. We reply with availability or a production costing.", source: "ads" }),
});
page({
  path: "/lp/sourcing/", noindex: true, bare: true, sitemap: false,
  title: "Garment Sourcing from India | GoodBiz Apparels",
  meta: "A short introduction to GoodBiz Apparels for buyers we have contacted by email.",
  body: lpBody({ eyebrow: "Following up on our email", h1: "A second supplier for your range, <em>in India.</em>", sub: "Send one style you source today, with its spec or a photo. We come back with a costing, or with matching ready stock if we hold it.", source: "email", personal: true }),
});

// ================================================================ LEGAL + 404
const simple = (path, h1, html, noindex = false) =>
  page({ path, noindex, sitemap: !noindex, title: `${h1} | ${SITE.name}`, meta: `${h1} for ${SITE.name}, a garment manufacturer and exporter in India supplying ready stock and made to order clothing to importers.`, body: `<section class="page-simple"><div class="wrap"><div class="prose"><h1 class="h1">${h1}</h1>${html}<p><a class="btn btn-primary" href="/">Back to the home page</a></p></div></div></section>` });
simple("/privacy/", "Privacy policy", `<p>{{privacy policy text}}</p><p>This site does not store enquiry details on a server. The enquiry form opens your own email app or WhatsApp with the message filled in, and nothing is sent until you send it there. Products you add to an enquiry are kept only in your own browser.</p>`);
simple("/terms/", "Terms", `<p>{{terms of use and trade terms}}</p><p>Prices, quantities and delivery dates are confirmed only in a proforma invoice.</p>`);
simple("/404.html", "This page is not on the rack", `<p>The link may be old or mistyped. Try the <a href="/#catalogue">product catalogue</a> or the <a href="/guides/">guides</a>.</p>`, true);

// ================================================================ sitemap, robots, llms.txt
writeFileSync(join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pageList.map((p) => `  <url><loc>${abs(p)}</loc><lastmod>${SITE.updated}</lastmod></url>`).join("\n")}
</urlset>
`);
writeFileSync(join(ROOT, "robots.txt"), `User-agent: *
Allow: /
Disallow: /lp/

# AI search and answer engines are welcome to read and cite this site
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Google-Extended
Allow: /

Sitemap: ${abs("/sitemap.xml")}
`);
writeFileSync(join(ROOT, "llms.txt"), `# ${SITE.name}

> Garment manufacturer and exporter in India. Supplies importers, brands and retailers with men's, women's and kids' clothing, either from ready stock or made to the buyer's design, size chart, fabric and GSM. ${ALL_PRODUCTS.length} product lines, each with an 8 digit HSN code.

## How to buy
- [Ready stock garments](${abs("/ready-stock-garments/")}): finished pieces, faster dispatch
- [Made to order / private label](${abs("/private-label-clothing-manufacturer/")}): your design, size chart and GSM, sample before bulk
- [Send an enquiry](${abs("/contact/")})

## Products
${CATEGORIES.map((c) => `- [${c.name}](${abs("/" + c.slug + "/")})\n${famsOf(c.key).map((f) => `  - [${f.name}](${abs(famUrl(f))}): ${f.products.map((p) => `${p.name} (HSN ${p.hsn})`).join("; ")}`).join("\n")}`).join("\n")}

## Reference
- [HSN codes for garments](${abs("/hsn-codes-for-garments/")})
${GUIDES.map((g) => `- [${g.h1}](${abs("/guides/" + g.slug + "/")})`).join("\n")}

## Export markets
${MARKETS.map((m) => `- [${m.name}](${abs("/export/" + m.slug + "/")})`).join("\n")}
`);

cpSync(join(ROOT, "..", "src", "assets"), join(ROOT, "assets"), { recursive: true });
console.log(`Built ${pageList.length} indexable pages + landing pages into public/ (v2)`);
