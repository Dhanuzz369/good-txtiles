// Static site generator for GoodBiz Apparels (v6: knits · woven · outerwear).
// Usage:  node src/build.mjs            (SITE_URL=https://other.domain to override the canonical domain)
import { mkdirSync, writeFileSync, readFileSync, rmSync, cpSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE, CATEGORIES, FAMILIES, FAQS, LOOKS, HERO_ORBS } from "./data.mjs";
import * as MK from "./markets.mjs";
import { GUIDES } from "./guides.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "public");
const ASSETS = join(HERE, "assets");
const MARKETS = MK.MARKETS;
const MARKETS_REVIEWED = MK.MARKETS_REVIEWED || SITE.updated;

const isSet = (v) => v && !/^\{\{.*\}\}$/.test(v);
const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const abs = (p) => SITE.url + p;
const slugify = (s) => s.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const catOf = (key) => CATEGORIES.find((c) => c.key === key);
const famUrl = (f) => `/${catOf(f.cat).slug}/${f.slug}/`;
const famsOf = (key) => FAMILIES.filter((f) => f.cat === key);
const ALL_PRODUCTS = FAMILIES.flatMap((f) => f.products.map((p) => ({ ...p, family: f, cat: catOf(f.cat), slug: slugify(p.name) })));
const prodsOf = (key) => ALL_PRODUCTS.filter((p) => p.cat.key === key);
const linesOf = (key) => prodsOf(key).length;
const N = ALL_PRODUCTS.length;
const short = (name) => { const t = name.replace(/^Men's /, ""); return t[0].toUpperCase() + t.slice(1); };
const pad = (n) => String(n).padStart(2, "0");
const construction = (hsn) => (hsn.startsWith("61") ? "Knitted" : "Woven");
const prodUrl = (p) => `${famUrl(p.family)}#${p.slug}`;
const look = (f) => LOOKS[f.slug];
const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const waLink = (text = "") => `https://wa.me/${SITE.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
const pageList = [];

// ---------------------------------------------------------------- images
// Intrinsic WebP size, read from the file header, so every <img> carries width/height.
const SIZES = {};
function webpSize(rel) {
  if (SIZES[rel]) return SIZES[rel];
  const b = readFileSync(join(ASSETS, rel.replace(/^\/assets\//, "")));
  const cc = b.toString("ascii", 12, 16);
  let wh;
  if (cc === "VP8X") wh = [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  else if (cc === "VP8L") { const n = b.readUInt32LE(21); wh = [1 + (n & 0x3fff), 1 + ((n >>> 14) & 0x3fff)]; }
  else if (cc === "VP8 ") wh = [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  else throw new Error(`Not a WebP file: ${rel}`);
  return (SIZES[rel] = wh);
}
const imgAttrs = ({ alt = "", sizes, high = false, lazy = true }) => `${sizes ? ` sizes="${sizes}"` : ""} alt="${esc(alt)}"${high ? ' fetchpriority="high"' : ""}${lazy && !high ? ' loading="lazy"' : ""} decoding="async"`;
// garment cut-outs (transparent): 200w and 400w copies in cut/xs and cut/s
const cutPic = (file, o = {}) => {
  const src = `/assets/img/cut/${file}`, [w, h] = webpSize(src);
  return `<img src="${src}" srcset="/assets/img/cut/xs/${file} 200w, /assets/img/cut/s/${file} 400w, ${src} ${w}w" width="${w}" height="${h}"${imgAttrs({ sizes: "200px", ...o })}>`;
};
// colourway lineups: 400w and 700w copies in line/s and line/m
const linePic = (slug, o = {}) => {
  const src = `/assets/img/line/${slug}.webp`, [w, h] = webpSize(src);
  return `<img src="${src}" srcset="/assets/img/line/s/${slug}.webp 400w, /assets/img/line/m/${slug}.webp 700w, ${src} ${w}w" width="${w}" height="${h}"${imgAttrs({ sizes: "(max-width: 760px) 100vw, 400px", ...o })}>`;
};
// photographs (representative stock photography): 700w copy in img/s
const photoPic = (name, o = {}) => {
  const src = `/assets/img/${name}.webp`, [w, h] = webpSize(src);
  return `<img src="${src}" srcset="/assets/img/s/${name}.webp 700w, ${src} ${w}w" width="${w}" height="${h}"${imgAttrs({ sizes: "(max-width: 760px) 100vw, 560px", ...o })}>`;
};
// share images are 1200x630 JPEGs cut from the same photos
const ogLine = (slug) => `/assets/img/og/${slug}.jpg`;
const ogPhoto = (name) => `/assets/img/og/${name}.jpg`;
const photoName = (path) => path.replace(/^.*\//, "").replace(/\.\w+$/, "");

// ---------------------------------------------------------------- versioned CSS / JS
const minCss = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").replace(/\s*([{};])\s*/g, "$1").trim();
const CSS = minCss(readFileSync(join(ASSETS, "styles.css"), "utf8"));
const JS = readFileSync(join(ASSETS, "app.js"), "utf8");
const fp = (s) => createHash("sha256").update(s).digest("hex").slice(0, 10);
const CSS_URL = `/assets/v/styles.${fp(CSS)}.css`;
const JS_URL = `/assets/v/app.${fp(JS)}.js`;

// ---------------------------------------------------------------- inline scripts + CSP
// The hero's final layout is chosen before first paint, so switching to the animated
// layout never shifts content after it has rendered.
const MOTION_JS = `(function(d){try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches&&"IntersectionObserver" in window)d.classList.add("motion")}catch(e){}})(document.documentElement)`;
const CONFIG_JS = `window.GB_CONFIG=${JSON.stringify({ whatsapp: SITE.whatsapp, email: SITE.email, ads: SITE.adsConversion, endpoint: SITE.formEndpoint, products: ALL_PRODUCTS.map((p) => ({ name: p.name, hsn: p.hsn, family: p.family.name, url: prodUrl(p) })) }).replace(/</g, "\\u003c")}`;
const GA_ID = SITE.ga4 || (SITE.adsConversion ? SITE.adsConversion.split("/")[0] : "");
// Consent Mode v2: no analytics cookies for visitors in the EU/EEA, UK and Switzerland (Google sends
// cookieless pings there); analytics cookies elsewhere. Ads storage stays off unless an Ads conversion is set.
const CONSENT_REGIONS = ["AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "IS", "LI", "NO", "GB", "CH"];
const ADS = SITE.adsConversion ? "granted" : "denied";
const GA_JS = GA_ID ? `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',region:${JSON.stringify(CONSENT_REGIONS)}});gtag('consent','default',{ad_storage:'${ADS}',ad_user_data:'${ADS}',ad_personalization:'denied',analytics_storage:'granted'});gtag('js',new Date());${SITE.ga4 ? `gtag('config','${SITE.ga4}');` : ""}${SITE.adsConversion ? `gtag('config','${SITE.adsConversion.split("/")[0]}');` : ""}` : "";
const sha = (s) => `'sha256-${createHash("sha256").update(s).digest("base64")}'`;
const CSP = [
  "default-src 'self'",
  `script-src 'self' ${sha(MOTION_JS)} ${sha(CONFIG_JS)}${GA_JS ? ` ${sha(GA_JS)} https://*.googletagmanager.com` : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data:${GA_JS ? " https://*.google-analytics.com https://*.googletagmanager.com https://*.g.doubleclick.net https://*.google.com" : ""}`,
  "font-src 'self'",
  `connect-src 'self' https://script.google.com https://script.googleusercontent.com${GA_JS ? " https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.g.doubleclick.net https://*.google.com" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

// ---------------------------------------------------------------- schema
const AREA = [
  { "@type": "Country", name: "United States" }, { "@type": "Country", name: "United Kingdom" },
  { "@type": "Place", name: "European Union" }, { "@type": "Country", name: "United Arab Emirates" },
  { "@type": "Country", name: "Saudi Arabia" }, { "@type": "Continent", name: "Africa" }, { "@type": "Country", name: "Australia" },
];
const ORG = {
  "@type": "Organization",
  "@id": abs("/#org"),
  name: SITE.name,
  url: abs("/"),
  logo: { "@type": "ImageObject", "@id": abs("/#logo"), url: abs("/assets/logo-512.png"), contentUrl: abs("/assets/logo-512.png"), width: 512, height: 512, caption: SITE.name },
  image: { "@id": abs("/#logo") },
  description: "Garment sourcing and export company in Bengaluru, India. Supplies knits, woven garments and jackets for men and kids, made through partner factories in India, from ready stock or to the buyer's design, size chart and GSM.",
  ...(isSet(SITE.legalName) && { legalName: SITE.legalName }),
  ...(isSet(SITE.founded) && { foundingDate: SITE.founded }),
  ...(isSet(SITE.gstin) && { taxID: SITE.gstin }),
  ...(isSet(SITE.iec) && { identifier: { "@type": "PropertyValue", propertyID: "IEC", value: SITE.iec } }),
  address: { "@type": "PostalAddress", addressLocality: SITE.city, addressRegion: SITE.region, addressCountry: "IN" },
  telephone: SITE.phoneIntl,
  email: SITE.email,
  contactPoint: { "@type": "ContactPoint", contactType: "sales", email: SITE.email, telephone: SITE.phoneIntl, availableLanguage: ["English"], areaServed: ["US", "GB", "EU", "AE", "SA", "ZA", "KE", "NG", "AU"] },
  areaServed: AREA,
  parentOrganization: { "@type": "Organization", name: SITE.parent.name, url: SITE.parent.url },
  knowsAbout: ["Garment manufacturing", "Knitted garments", "Woven garments", "Private label clothing", "HSN codes for garments", "Garment export from India"],
};
const WEBSITE = { "@type": "WebSite", "@id": abs("/#website"), url: abs("/"), name: SITE.name, description: SITE.tagline, inLanguage: "en", publisher: { "@id": abs("/#org") } };
const breadcrumbSchema = (crumbs) => ({ "@type": "BreadcrumbList", "@id": abs(crumbs[crumbs.length - 1][1]) + "#breadcrumb", itemListElement: crumbs.map(([name, url], i) => ({ "@type": "ListItem", position: i + 1, name, item: abs(url) })) });
const faqSchema = (faqs, path) => ({ "@type": "FAQPage", "@id": abs(path) + "#faq", mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) });
const itemList = (path, name, prods) => ({ "@type": "ItemList", "@id": abs(path) + "#list", name, url: abs(path), numberOfItems: prods.length, itemListElement: prods.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: `${p.name} (HSN ${p.hsn})`, url: abs(prodUrl(p)), image: abs(`/assets/img/line/${p.slug}.webp`) })) });
const linkList = (path, name, links) => ({ "@type": "ItemList", "@id": abs(path) + "#list", name, url: abs(path), numberOfItems: links.length, itemListElement: links.map(([u, t], i) => ({ "@type": "ListItem", position: i + 1, name: t, url: abs(u) })) });
const serviceSchema = (path, name, type, description) => ({ "@type": "Service", "@id": abs(path) + "#service", name, serviceType: type, url: abs(path), description, provider: { "@id": abs("/#org") }, areaServed: AREA });

// ---------------------------------------------------------------- head
function head({ title, meta, path, noindex, graph, og, ogAlt, type }) {
  return `<!doctype html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<script>${MOTION_JS}</script>
<title>${esc(title)}</title>
<meta name="description" content="${esc(meta)}">
${noindex ? "" : `<link rel="canonical" href="${abs(path)}">\n`}<meta name="robots" content="${noindex ? "noindex, follow" : "index, follow, max-image-preview:large"}">
${SITE.googleVerification ? `<meta name="google-site-verification" content="${esc(SITE.googleVerification)}">\n` : ""}${SITE.bingVerification ? `<meta name="msvalidate.01" content="${esc(SITE.bingVerification)}">\n` : ""}<meta name="theme-color" content="#F1EDE4">
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(meta)}">
<meta property="og:url" content="${abs(path)}">
<meta property="og:image" content="${abs(og)}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(ogAlt || title)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/cabinet-grotesk-800.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/switzer-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${CSS_URL}">
<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c")}</script>
${GA_JS ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>\n<script>${GA_JS}</script>` : ""}
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
const waA = (inner, cls = "") => `<a${cls ? ` class="${cls}"` : ""} href="${waLink()}" data-whatsapp rel="noopener">${inner}</a>`;
const mailA = (inner, cls = "") => `<a${cls ? ` class="${cls}"` : ""} href="mailto:${esc(SITE.email)}" data-email>${inner}</a>`;

function header(path, bare, enq) {
  if (bare) return `<header class="site-header"><div class="wrap">${brand}<a class="btn btn-primary btn-sm" href="#enquiry">Get a costing <i class="ph ph-arrow-down" aria-hidden="true"></i></a></div></header>`;
  const cur = (h) => (path.startsWith(h) ? ' aria-current="page"' : "");
  const mega = CATEGORIES.map((c) => `<div class="mega-col"><p class="label mega-title"><a href="/${c.slug}/">${c.name}</a></p><ul>${famsOf(c.key).map((f) => `<li><a href="${famUrl(f)}">${esc(short(f.name))}<span>${f.audience === "Kids" ? "KIDS" : "MEN"} · ${pad(f.products.length)}</span></a></li>`).join("")}</ul></div>`).join("");
  const mm = [
    `<li><a href="/products/">All products <span class="label">${N} lines</span></a></li>`,
    ...CATEGORIES.map((c) => `<li class="mm-sub"><a href="/${c.slug}/">${c.name}</a></li>`),
    ...NAV.map(([h, l]) => `<li><a href="${h}">${l}</a></li>`),
    `<li><a href="/hsn-codes-for-garments/">HSN codes</a></li>`,
    `<li class="mm-contact">${waA(`<i class="ph ph-whatsapp-logo" aria-hidden="true"></i> WhatsApp`)}${mailA(`<i class="ph ph-envelope-simple" aria-hidden="true"></i> Email`)}</li>`,
    `<li class="mm-cta"><a class="btn btn-primary" href="${enq}">Send enquiry <i class="ph ph-arrow-right" aria-hidden="true"></i></a></li>`,
  ].join("");
  return `<a class="skip-link" href="#main">Skip to content</a>
<aside class="utility" aria-label="Quick contact"><div class="wrap">
<span class="label">Knits · Woven · Jackets · Made in India → USA · UK · EU · Gulf · Africa · Australia</span>
<span class="utility-links label">${waA(`<i class="ph ph-whatsapp-logo" aria-hidden="true"></i> WhatsApp`)}${mailA(`<i class="ph ph-envelope-simple" aria-hidden="true"></i> Email`)}</span>
</div></aside>
<header class="site-header"><div class="wrap">
${brand}
<nav class="nav" aria-label="Main">
<button class="nav-trigger" type="button" aria-expanded="false" aria-controls="mega"${path.startsWith("/products") || CATEGORIES.some((c) => path.startsWith(`/${c.slug}/`)) ? ' data-current=""' : ""}>Products <i class="ph ph-caret-down" aria-hidden="true"></i></button>
${NAV.map(([h, l]) => `<a href="${h}"${cur(h)}>${l}</a>`).join("")}
</nav>
<a class="btn btn-primary btn-sm header-cta" href="${enq}"><span class="hc-long">Send enquiry</span><span class="hc-short">Enquire</span> <i class="ph ph-arrow-right" aria-hidden="true"></i></a>
<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Open menu"><span></span><span></span></button>
</div>
<div class="mega" id="mega"><div class="wrap">${mega}
<div class="mega-feature"><span class="label">Catalogue</span><p class="h3">Every product, with photos and HSN codes.</p><a class="arrow-link" style="color:#fff" href="/products/">See all ${N} products <i class="ph ph-arrow-right" aria-hidden="true"></i></a></div>
</div></div>
</header>
<div class="mobile-menu" id="mobile-menu" hidden><ul>${mm}</ul></div>`;
}

function footer(bare) {
  const col = (title, items) => `<div><span class="label">${title}</span><ul>${items.map(([h, l]) => `<li><a href="${h}">${esc(l)}</a></li>`).join("")}</ul></div>`;
  const hub = bare ? "" : `<div class="foot-hub">
${CATEGORIES.map((c) => col(c.name, [[`/${c.slug}/`, `All ${c.name.toLowerCase()}`], ...famsOf(c.key).map((f) => [famUrl(f), f.name])])).join("")}
${col("How to buy", [["/products/", "All products"], ["/ready-stock-garments/", "Ready stock garments"], ["/private-label-clothing-manufacturer/", "Made to order and private label"], ["/hsn-codes-for-garments/", "HSN codes for garments"], ["/contact/", "Send an enquiry"]])}
${col("Export markets", [["/export/", "All markets"], ...MARKETS.map((m) => [`/export/${m.slug}/`, m.name])])}
${col("Guides", [["/guides/", "All guides"], ...GUIDES.map((g) => [`/guides/${g.slug}/`, g.h1]), ["/about/", "About us"]])}
</div>`;
  return `<footer class="footer"><div class="wrap">
${hub}
<p class="foot-word" aria-hidden="true">GoodBiz</p>
<div class="foot-base"><span>${esc(SITE.address)} · <a href="tel:${esc(SITE.phoneHref)}">${esc(SITE.phone)}</a> · ${waA("WhatsApp")} · ${mailA(esc(SITE.email))}<br>${esc(SITE.replyTime)} Part of the GoodBiz group: <a href="${SITE.parent.url}" rel="noopener">${SITE.parent.name}</a>.</span><span>Photography: representative images, Unsplash License · Updated ${SITE.updated}</span>
<ul><li><a href="/privacy/">Privacy</a></li><li><a href="/terms/">Terms</a></li><li><a href="/sitemap.xml">Sitemap</a></li></ul></div>
</div></footer>`;
}

const configScript = () => `<script>${CONFIG_JS}</script><script src="${JS_URL}" defer></script>`;
const basket = `<aside aria-label="Your enquiry"><a class="basket" id="basket" href="/contact/#enquiry" hidden><span class="count" id="basket-count">0</span><span>in your enquiry</span></a></aside>`;

// ---------------------------------------------------------------- components
const crumbsHtml = (crumbs) => `<nav class="crumbs label" aria-label="Breadcrumb"><ol>${crumbs.map(([n, u], i) => (i === crumbs.length - 1 ? `<li aria-current="page">${esc(n)}</li>` : `<li><a href="${u}">${esc(n)}</a></li>`)).join("")}</ol></nav>`;
const addBtn = (p) => `<button class="add" type="button" data-name="${esc(p.name)}" data-hsn="${esc(p.hsn)}" aria-pressed="false" aria-label="Add ${esc(p.name)} to enquiry"><i class="ph ph-plus" aria-hidden="true"></i><span>Add</span></button>`;
const quoteBtn = (p) => `<button class="add add-quote" type="button" data-name="${esc(p.name)}" data-hsn="${esc(p.hsn)}" data-off="Add to quote" data-on="In your quote" aria-pressed="false"><i class="ph ph-plus" aria-hidden="true"></i><span>Add to quote</span></button>`;
const secHead = (idx, label, title, aside = "", id = "") => `<div class="sec-head reveal"><div class="sec-index"><span class="label">${idx}</span><span class="label muted">${label}</span></div><div class="sec-title"><h2 class="h2"${id ? ` id="${id}"` : ""}>${title}</h2>${aside ? `<p class="small">${aside}</p>` : ""}</div></div>`;

const garment = (file, cls = "", alt = "", high = false, sizes = "(max-width: 760px) 60vw, 360px") => `<span class="garment ${cls}">${cutPic(file, { alt, high, sizes, lazy: !high })}</span>`;
const familyStage = (f) => `<div class="stage-card" style="--tone:${look(f).tone}" data-tilt>
<span class="swatch-bg"></span><span class="swatch-shadow"></span>
${garment(look(f).cut, "garment-lg", `${f.name}: example garment`, true, "(max-width: 760px) 75vw, 420px")}
${f.products.slice(0, 4).map((p, i) => `<span class="chip3d chip-${i}" aria-hidden="true">HSN ${p.hsn.split(" ")[0]}</span>`).join("")}
</div>`;
const fanStage = (c) => `<div class="stage-card fan" style="--tone:${c.tone}" data-tilt>
<span class="swatch-bg"></span><span class="swatch-shadow"></span>
${c.fan.map((file, i) => garment(file, `fan-${i}`, i === 1 ? `${c.name}: example garments` : "", i === 1, "(max-width: 760px) 45vw, 300px")).join("")}
</div>`;

function familyCard(f, hTag = "h3") {
  return `<article class="family" style="--tone:${look(f).tone}">
<a class="swatch" href="${famUrl(f)}" tabindex="-1" aria-hidden="true" data-tilt><span class="swatch-bg"></span><span class="swatch-shadow"></span>${garment(look(f).cut, "", "", false, "(max-width: 760px) 80vw, 260px")}<span class="family-count label">${f.audience} · ${pad(f.products.length)} lines</span></a>
<div class="family-body">
<${hTag} class="h3"><a href="${famUrl(f)}">${esc(f.name)}</a></${hTag}>
<ul class="items">${f.products.map((p) => `<li data-search="${esc((p.name + " " + p.hsn).toLowerCase())}"><div><span class="item-name">${esc(p.name)}</span><span class="item-hsn">HSN ${p.hsn} · ${construction(p.hsn)}</span></div>${addBtn(p)}</li>`).join("")}</ul>
<a class="arrow-link" href="${famUrl(f)}">Photos, fabrics and GSM <i class="ph ph-arrow-right" aria-hidden="true"></i></a>
</div></article>`;
}

// product card with colourway lineup photo
function pcard(p, { tag = "h3", high = false } = {}) {
  const aud = p.family.audience === "Kids" ? "kids" : "men";
  return `<article class="pcard" id="${p.slug}" data-aud="${aud}" data-search="${esc(`${p.name} ${p.hsn} ${p.spec} ${p.cat.name}`.toLowerCase())}">
<a class="pcard-media" href="${prodUrl(p)}" tabindex="-1">${linePic(p.slug, { alt: `${p.name} shown in example colourways`, high, sizes: "(max-width: 760px) calc(100vw - 34px), (max-width: 1100px) 45vw, 380px" })}<span class="pcard-hsn">HSN ${p.hsn}</span></a>
<div class="pcard-body">
<p class="pcard-meta label"><span class="aud aud-${aud}">${p.family.audience === "Kids" ? "Kids" : "Men's"}</span><span>${p.cat.key === "outerwear" ? "Outerwear" : construction(p.hsn)}</span><span>${esc(p.family.name.replace(/^Men's /, ""))}</span></p>
<${tag} class="pcard-title"><a href="${prodUrl(p)}">${esc(p.name)}</a></${tag}>
<p class="pcard-spec">${esc(p.spec)}</p>
<p class="pcard-desc small">${esc(p.desc)}</p>
<div class="pcard-actions"><a class="btn btn-ghost btn-sm" href="${prodUrl(p)}">View details</a>${quoteBtn(p)}</div>
</div></article>`;
}

function faqHtml(faqs, title = "Questions buyers ask", idx = "FAQ", ask = "/contact/") {
  return `<section class="section bg-2" id="faq" aria-labelledby="faq-title"><div class="wrap">
<div class="faq">
<div class="reveal"><div class="sec-index"><span class="label">${idx}</span><span class="label muted">${plural(faqs.length, "answer")}</span></div>
<h2 class="h2" id="faq-title" style="margin-top:var(--s4)">${title}</h2>
<p class="small" style="margin-top:var(--s4)">Anything else? <a class="link link-pad" href="${ask}">Send us your question</a>.</p></div>
<div class="faq-list reveal">${faqs.map(([q, a]) => `<details><summary>${esc(q)}<i class="ph ph-plus" aria-hidden="true"></i></summary><p class="body">${esc(a)}</p></details>`).join("")}</div>
</div></div></section>`;
}

function ctaBand(text = "Send your spec or ask what is in stock. We reply with availability or a production costing.") {
  return `<section class="section-tight"><div class="wrap"><div class="cta reveal">
<div><span class="label" style="color:#AEB9E6">Next step</span><h2 class="h2" style="margin-top:var(--s3)">Ready to <em style="color:#fff">source?</em></h2><p class="body">${text} ${esc(SITE.replyTime)}</p></div>
<a class="btn btn-light" href="/contact/">Send your enquiry <i class="ph ph-arrow-right" aria-hidden="true"></i></a>
</div></div></section>`;
}

const COUNTRIES = ["United States", "Canada", "United Kingdom", "Ireland", "Germany", "France", "Netherlands", "Belgium", "Italy", "Spain", "Portugal", "Poland", "Sweden", "Denmark", "United Arab Emirates", "Saudi Arabia", "Qatar", "Oman", "Kuwait", "Bahrain", "South Africa", "Kenya", "Nigeria", "Ghana", "Tanzania", "Uganda", "Ethiopia", "Mauritius", "Egypt", "Morocco", "Senegal", "Côte d'Ivoire", "Australia", "New Zealand"];

// Seven step enquiry. Contact details come last, once the buyer has described the order.
function enquiryForm({ heading = "Tell us what you <em>want to source.</em>", source = "website", tag = "h2" } = {}) {
  const uid = source; // keeps ids unique per page
  const field = (id, label, input, hint = "") => `<div class="field"><label class="label" for="${uid}-${id}">${label}</label>${input}${hint ? `<p class="field-hint">${hint}</p>` : ""}<p class="error" data-err="${id}"></p></div>`;
  const step = (key, n, q, hint, body) => `<fieldset class="wiz-step" data-step="${key}"${n > 1 ? " hidden" : ""}>
<legend class="wiz-q" tabindex="-1">${q}</legend>${hint ? `<p class="wiz-hint">${hint}</p>` : ""}
${body}
</fieldset>`;
  const radioCards = (name, items, cls = "pick-card") => `<div class="pick-grid pick-${name}">${items.map(([v, t, d]) => `<label class="pick"><input type="radio" name="${name}" value="${esc(v)}"><span class="${cls}"><span class="pick-title">${t}</span>${d ? `<span class="pick-desc">${d}</span>` : ""}</span></label>`).join("")}</div><p class="error" data-err="${name}"></p>`;
  const products = CATEGORIES.map((c) => `<div class="pick-group"><p class="label pick-group-title">${c.name} <span class="muted">· ${c.chapter}</span></p><div class="pick-grid pick-products">${prodsOf(c.key).map((p) => `<label class="pick"><input type="checkbox" name="products" value="${esc(p.name)}" data-hsn="${esc(p.hsn)}"><span class="pick-card"><span class="pick-check" aria-hidden="true"><i class="ph ph-check"></i></span><span class="pick-title">${esc(p.name)}</span><span class="pick-desc mono">HSN ${p.hsn}</span></span></label>`).join("")}</div></div>`).join("");
  const sendRow = isSet(SITE.formEndpoint)
    ? `<button class="btn btn-primary" type="submit" data-send="sheet">Send enquiry <i class="ph ph-paper-plane-tilt" aria-hidden="true"></i></button><button class="btn btn-ghost" type="button" data-send="whatsapp"><i class="ph ph-whatsapp-logo" aria-hidden="true"></i> Send on WhatsApp</button>`
    : `<button class="btn btn-primary" type="submit" data-send="email">Send by email <i class="ph ph-envelope-simple" aria-hidden="true"></i></button><button class="btn btn-ghost" type="button" data-send="whatsapp"><i class="ph ph-whatsapp-logo" aria-hidden="true"></i> Send on WhatsApp</button>`;
  return `<section class="section" id="enquiry" aria-labelledby="${uid}-enq-title"><div class="wrap enq">
<div class="enq-intro reveal">
<div class="sec-index"><span class="label">Enquiry</span><span class="label muted">7 short steps</span></div>
<${tag} class="h2" id="${uid}-enq-title">${heading}</${tag}>
<p class="body">One question at a time. Skip anything you are not sure of; we confirm every detail in writing before a sample or dispatch.</p>
<p class="enq-reply"><i class="ph ph-check-circle" aria-hidden="true"></i> ${esc(SITE.replyTime)}</p>
<div class="contact-list">
<p class="label">Prefer to talk directly?</p>
${waA(`<i class="ph-fill ph-whatsapp-logo" aria-hidden="true"></i><span><strong>Chat on WhatsApp</strong><span class="small">${esc(SITE.phone)}</span></span><i class="ph ph-arrow-up-right" aria-hidden="true"></i>`)}
${mailA(`<i class="ph ph-envelope-simple" aria-hidden="true"></i><span><strong>Email</strong><span class="small">${esc(SITE.email)}</span></span><i class="ph ph-arrow-up-right" aria-hidden="true"></i>`)}
<a href="tel:${esc(SITE.phoneHref)}"><i class="ph ph-phone" aria-hidden="true"></i><span><strong>Call</strong><span class="small">${esc(SITE.phone)}</span></span><i class="ph ph-arrow-up-right" aria-hidden="true"></i></a>
<div class="contact-office"><i class="ph ph-map-pin" aria-hidden="true"></i><span><strong>Office</strong><span class="small">${esc(SITE.address)}</span></span></div>
</div></div>
<form class="wiz reveal" data-wizard data-source="${source}" novalidate aria-labelledby="${uid}-enq-title">
<div class="wiz-head">
<p class="wiz-count label" aria-live="polite"><span data-wiz-count>Step 1 of 7</span><span data-wiz-name>Products</span></p>
<div class="wiz-bar" aria-hidden="true"><i data-wiz-bar></i></div>
</div>
<div class="wiz-body">
${step("products", 1, "Which products do you need?", "Pick as many as you like. Lines you added from the catalogue are already ticked.", `${products}
<div class="field pick-other">${field("productOther", "Something else? <span class=\"muted\">(optional)</span>", `<input id="${uid}-productOther" name="productOther" placeholder="For example: cotton hoodies, 320 GSM">`)}</div>
<p class="error" data-err="products"></p>`)}
${step("route", 2, "How do you want to buy?", "", radioCards("route", [["Ready stock", "Ready stock", "Finished garments, faster dispatch. We send photos of the actual lot."], ["Made to order", "Made to order", "Your design, size chart, fabric and GSM. Sample before bulk."], ["Both", "Both", "Some lines from stock, others made to your spec, in one shipment."]]))}
${step("spec", 3, "Tell us the spec you have", "<span data-spec-hint>All optional. Skip anything you are not sure of.</span>", `<div class="field-row">${field("fabric", "Fabric and GSM", `<input id="${uid}-fabric" name="fabric" placeholder="Cotton single jersey, 180 GSM">`)}${field("sizes", "Sizes and colours", `<input id="${uid}-sizes" name="sizes" placeholder="S to XXL · navy, white, olive">`)}</div>
<div class="field" data-techpack><p class="label">Do you have a tech pack?</p>${radioCards("techpack", [["Yes, I will attach it", "Yes, I'll attach it", "Attach it to the email that follows"], ["Reference garment", "I have a reference garment", "We write the spec from it"], ["Not yet", "Not yet", "We help you put one together"]], "pick-chip")}</div>`)}
${step("quantity", 4, "How many pieces do you need?", "Roughly, across all the products you picked.", `${radioCards("quantity", [["Samples or a trial order", "Samples or a trial order"], ["Under 1,000 pieces", "Under 1,000 pieces"], ["1,000 to 5,000 pieces", "1,000 to 5,000 pieces"], ["5,000 to 20,000 pieces", "5,000 to 20,000 pieces"], ["Over 20,000 pieces", "Over 20,000 pieces"], ["Another amount", "Another amount"]], "pick-chip")}
<div class="field" data-quantity-other hidden>${field("quantityOther", "Your quantity", `<input id="${uid}-quantityOther" name="quantityOther" placeholder="For example: 3,000 pieces per colour">`)}</div>`)}
${step("destination", 5, "Where is it going, and how should we price it?", "", `<div class="field-row">${field("country", "Destination country", `<input id="${uid}-country" name="country" list="${uid}-countries" autocomplete="country-name" required><datalist id="${uid}-countries">${COUNTRIES.map((c) => `<option value="${esc(c)}">`).join("")}</datalist>`)}${field("port", "Destination port <span class=\"muted\">(optional)</span>", `<input id="${uid}-port" name="port" placeholder="Hamburg, Jebel Ali, Mombasa">`)}</div>
<div class="field"><p class="label">Price basis</p>${radioCards("incoterm", [["FOB", "FOB", "You book the ship from the Indian port"], ["CFR", "CFR", "We ship to your port, you insure"], ["CIF", "CIF", "We ship and insure to your port"], ["Not sure", "Not sure", "We suggest the best option"]])}</div>`)}
${step("contact", 6, "Last step: where should we send your costing?", `Email or WhatsApp is enough. ${esc(SITE.replyTime)}`, `<div class="field-row">${field("name", "Your name", `<input id="${uid}-name" name="name" autocomplete="name" data-personal="name" required>`)}${field("company", "Company", `<input id="${uid}-company" name="company" autocomplete="organization" data-personal="company" required>`)}</div>
<div class="field-row">${field("email", "Work email", `<input id="${uid}-email" name="email" type="email" autocomplete="email" inputmode="email">`)}${field("whatsapp", "WhatsApp number <span class=\"muted\">(optional)</span>", `<input id="${uid}-whatsapp" name="whatsapp" type="tel" autocomplete="tel" inputmode="tel" placeholder="+49 151 2345 6789">`)}</div>
<p class="error" data-err="contact"></p>
<div class="hp" aria-hidden="true"><label for="${uid}-website">Leave this empty</label><input id="${uid}-website" name="website" tabindex="-1" autocomplete="off"></div>`)}
${step("review", 7, "Anything else, then send", "Check your enquiry below. You can go back to change anything.", `${field("message", "Notes <span class=\"muted\">(optional)</span>", `<textarea id="${uid}-message" name="message" rows="4" placeholder="Labels, packing, target delivery month, anything else."></textarea>`)}
<dl class="wiz-summary" data-summary></dl>
<p class="small muted wiz-privacy">We use these details only to reply to your enquiry. See our <a class="link" href="/privacy/">privacy policy</a>.</p>`)}
<div class="wiz-done" data-done hidden tabindex="-1"><i class="ph ph-check-circle" aria-hidden="true"></i><p class="h3" data-done-title>Thank you.</p><p class="body" data-done-text></p><div class="wiz-done-actions" data-done-actions></div></div>
</div>
<div class="wiz-nav">
<button class="btn btn-ghost" type="button" data-wiz-back hidden><i class="ph ph-arrow-left" aria-hidden="true"></i> Back</button>
<button class="btn btn-primary" type="button" data-wiz-next>Next <i class="ph ph-arrow-right" aria-hidden="true"></i></button>
<div class="wiz-send" data-wiz-send hidden>${sendRow}</div>
</div>
<p class="form-status" role="status" data-status></p>
</form></div></section>`;
}

function pageHero({ crumbs, eyebrow, h1, intro, photo, alt, actions = true, facts, stage, enq = "/contact/" }) {
  const side = stage
    ? `<div class="stage-wrap reveal">${stage}</div>`
    : photo
    ? `<figure class="reveal">${photoPic(photo, { alt, high: true })}</figure>`
    : facts
    ? `<dl class="quick-facts reveal">${facts.map(([k, v]) => `<div><dt class="label muted">${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>`
    : "";
  return `<section class="page-hero"><div class="wrap">
${crumbsHtml(crumbs)}
<div class="page-hero-grid${photo || stage ? "" : " solo"}">
<div class="reveal">
<span class="label eyebrow">${eyebrow}</span>
<h1 class="h1">${esc(h1)}</h1>
<p class="lead">${esc(intro)}</p>
${actions ? `<div class="hero-actions"><a class="btn btn-primary" href="${enq}">Send your enquiry <i class="ph ph-arrow-right" aria-hidden="true"></i></a><a class="btn btn-ghost" href="#products">Products and HSN codes</a></div>` : ""}
</div>
${side}
</div></div></section>`;
}

const tile = (href, slug, title, sub, cta = "Explore") => `<a class="tile reveal${slug ? "" : " tile-text"}" href="${href}">${slug ? linePic(slug, { sizes: "(max-width: 760px) calc(100vw - 32px), 380px" }) : ""}<span class="label muted">${sub}</span><h3>${esc(title)}</h3><span class="arrow-link">${cta} <i class="ph ph-arrow-right" aria-hidden="true"></i></span></a>`;
const catTiles = () => `<div class="tiles">${CATEGORIES.map((c) => tile(`/${c.slug}/`, c.img, c.name, `${pad(linesOf(c.key))} lines · ${c.chapter}`)).join("")}</div>`;

const CREDS = [["Importer Exporter Code", SITE.iec], ["GSTIN", SITE.gstin], ["AEPC RCMC", SITE.rcmc], ["Certifications", SITE.certifications], ["Minimum order", SITE.moq]].filter(([, v]) => isSet(v));
const credsSection = () => (CREDS.length ? `<section class="section"><div class="wrap">
${secHead("06", "Export credentials", "The paperwork buyers <em>ask for first.</em>")}
<dl class="creds reveal">${CREDS.map(([k, v]) => `<div><dt class="label muted">${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
</div></section>` : "");
const sourcesHtml = (sources = []) => (sources.length ? `<h2 id="sources">Sources and official links</h2><ul class="sources">${sources.map(([l, u]) => `<li><a href="${esc(u)}" rel="noopener">${esc(l)}</a></li>`).join("")}</ul>` : "");

// ---------------------------------------------------------------- page writer
function page({ path, title, meta, body, schema = [], noindex = false, bare = false, og = ogPhoto("hero-factory"), ogAlt, type = "website", sitemap = true, crumbs, pageType = "WebPage", mainEntity, hasForm = false }) {
  const webpage = {
    "@type": pageType, "@id": abs(path) + "#webpage", url: abs(path), name: title, description: meta, inLanguage: "en",
    isPartOf: { "@id": abs("/#website") },
    primaryImageOfPage: { "@type": "ImageObject", url: abs(og), width: 1200, height: 630 },
    dateModified: SITE.updated,
    ...(crumbs && { breadcrumb: { "@id": abs(path) + "#breadcrumb" } }),
    ...(["AboutPage", "ContactPage"].includes(pageType) && { about: { "@id": abs("/#org") } }),
    ...(mainEntity && { mainEntity }),
  };
  const graph = [ORG, WEBSITE, webpage, ...(crumbs ? [breadcrumbSchema(crumbs)] : []), ...schema];
  const enq = hasForm ? "#enquiry" : "/contact/";
  const html = `${head({ title, meta, path, noindex, graph, og, ogAlt, type })}
<body${bare ? ' class="lp"' : ""}>
${header(path, bare, enq)}
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
  const tabs = CATEGORIES.map((c, i) => `<button class="tab" role="tab" aria-selected="${i === 0}" aria-controls="panel-${c.key}" id="tab-${c.key}" data-cat="${c.key}">${c.name}<span>${pad(linesOf(c.key))}</span></button>`).join("");
  const panels = CATEGORIES.map((c, i) => `<div class="families" role="tabpanel" id="panel-${c.key}" aria-labelledby="tab-${c.key}"${i ? " hidden" : ""}>${famsOf(c.key).map((f) => familyCard(f)).join("")}</div>`).join("");
  const tick = (hidden) => `<ul${hidden ? ' aria-hidden="true"' : ""}>${ALL_PRODUCTS.map((p) => `<li>${esc(p.name)}<span>${p.hsn}</span></li>`).join("")}</ul>`;
  page({
    path: "/",
    title: "Garment Manufacturing & Export from India | GoodBiz",
    meta: `Knits, woven garments and jackets for men and kids, made in India through partner factories. Ready stock or made to your design, size chart and GSM.`,
    hasForm: true,
    schema: [faqSchema(FAQS, "/")],
    body: `
<section class="hero3d" id="top" data-hero aria-labelledby="hero-title">
<div class="hero3d-sticky">
<div class="blobs" aria-hidden="true"><span></span><span></span><span></span></div>
<div class="hero3d-copy">
<h1 class="display hero3d-title" id="hero-title"><span class="hero-kicker label"><span class="dot" aria-hidden="true"></span>Garment manufacturing and export from India</span> <span class="phase phase-a" data-ph="0">Made to <em>your spec.</em></span> <span class="phase phase-b" data-ph="1">Or shipped <em>from stock.</em></span></h1>
<p class="display phase phase-c" data-ph="2" aria-hidden="true">${N} lines.<br><em>Pick yours.</em></p>
</div>
<div class="scene" data-scene>
${HERO_ORBS.map((g, i) => `<figure class="orb${i >= 9 ? " orb-desk" : ""}" data-orb style="--tone:${g.tone};--i:${i}">${cutPic(g.cut, { sizes: "(max-width: 760px) 110px, 200px", high: i === 0, lazy: i >= 9 })}</figure>`).join("")}
</div>
<div class="hero3d-foot">
<p class="lead">${esc(SITE.tagline)} Made to your design, size chart and GSM, or shipped from finished stock.</p>
<div class="hero-actions"><a class="btn btn-primary" href="/products/">See all products <i class="ph ph-arrow-right" aria-hidden="true"></i></a><a class="btn btn-ghost" href="#enquiry">Send your enquiry</a></div>
</div>
<div class="meter" aria-hidden="true"><span class="label" data-step="0">01 · Your spec</span><span class="label" data-step="1">02 · Our stock</span><span class="label" data-step="2">03 · The range</span><span class="meter-bar"><i data-meter></i></span></div>
<p class="scroll-cue label" aria-hidden="true" data-cue><span></span>Scroll to unfold</p>
</div>
</section>

<div class="ticker" role="marquee" aria-label="Product lines"><div class="ticker-track">${tick(false)}${tick(true)}</div></div>

<section class="section-tight shop" aria-labelledby="shop-title"><div class="wrap">
<div class="shop-head reveal"><h2 class="h2" id="shop-title">Shop by <em>product.</em></h2><a class="arrow-link" href="/products/">All ${N} products with photos <i class="ph ph-arrow-right" aria-hidden="true"></i></a></div>
<ul class="bubbles bubbles-7">${FAMILIES.map((f, i) => `<li class="reveal" style="--i:${i}"><a class="bubble-link" href="${famUrl(f)}" style="--tone:${look(f).tone}"><span class="bubble"><span class="disc"></span><span class="pop">${cutPic(look(f).cut, { sizes: "(max-width: 760px) 64px, 120px" })}</span></span><span class="bubble-name">${esc(short(f.name))}</span><span class="label muted">${f.audience === "Kids" ? "Kids" : "Men"} · ${catOf(f.cat).name}</span></a></li>`).join("")}</ul>
</div></section>

<section class="section-tight constructs" aria-labelledby="cons-title"><div class="wrap">
${secHead("01", "What we supply", `Three constructions. <em>One supplier.</em>`, "Everything we export is a knit, a woven or an outerwear piece, for men and kids, made through partner factories in India.", "cons-title")}
<div class="cons-grid">${CATEGORIES.map((c, i) => `<a class="cons reveal" href="/${c.slug}/" style="--tone:${c.tone}"><span class="cons-media">${linePic(c.img, { alt: `${c.name}: example garments in colourways`, sizes: "(max-width: 760px) calc(100vw - 32px), 400px" })}</span><span class="cons-body"><span class="label">${pad(i + 1)} · ${c.chapter}</span><span class="cons-name">${c.name}</span><span class="small">${esc(c.short)}</span><span class="cons-foot"><span class="label">${pad(linesOf(c.key))} lines</span><i class="ph ph-arrow-right" aria-hidden="true"></i></span></span></a>`).join("")}</div>
</div></section>

<section class="section" id="buy"><div class="wrap">
${secHead("02", "Two ways to buy", "Pick from stock, or bring <em>your tech pack.</em>", "Use one route or both. Stock and made to order lines can travel in the same shipment.")}
<div class="ways">
<article class="way way-stock reveal">
<div class="way-media">${photoPic("stock-racks", { alt: "Finished garments in neutral tones hanging on a rail (representative photo)", sizes: "(max-width: 760px) calc(100vw - 32px), 360px" })}<span class="way-tag"><i class="ph ph-package" aria-hidden="true"></i> Ready stock</span></div>
<div class="way-body"><h3 class="h3">Finished garments, ready to dispatch.</h3>
<ol class="way-steps"><li>Ask for today's dated stock list</li><li>Get photos of the actual lot, sizes and pieces</li><li>Add your labels if you want them</li><li>Pay and ship with full export documents</li></ol>
<a class="btn btn-ghost" href="/ready-stock-garments/">How ready stock works <i class="ph ph-arrow-right" aria-hidden="true"></i></a></div>
</article>
<article class="way way-made reveal">
<div class="way-media">${photoPic("custom-sewing", { alt: "Operator guiding fabric through an industrial sewing machine (representative photo)", sizes: "(max-width: 760px) calc(100vw - 32px), 360px" })}<span class="way-tag"><i class="ph ph-ruler" aria-hidden="true"></i> Made to order</span></div>
<div class="way-body"><h3 class="h3">Your design, sizes, quality and GSM.</h3>
<ol class="way-steps"><li>Send a tech pack or reference garment</li><li>Fabric is sourced to the GSM you set</li><li>Approve a physical sample in writing</li><li>Bulk production, inspection and shipment</li></ol>
<a class="btn btn-light" href="/private-label-clothing-manufacturer/">How made to order works <i class="ph ph-arrow-right" aria-hidden="true"></i></a></div>
</article>
</div>
</div></section>

<section class="tagline" aria-label="What we do"><div class="wrap"><p class="tagline-text" id="tagline">You send the design, the size chart and the GSM. We send it back stitched, packed and ready for customs.</p></div></section>

<section class="section bg-2" id="catalogue"><div class="wrap">
${secHead("03", "Export catalogue", `${N} lines, each with <em>its HSN code.</em>`, "Add the lines you want. They go straight into your enquiry, codes included.")}
<div class="cat-layout">
<div class="cat-side reveal">
<div class="tabs" role="tablist" aria-label="Construction">${tabs}</div>
<label class="search"><i class="ph ph-magnifying-glass" aria-hidden="true"></i><span class="sr-only">Search by product or HSN code</span><input type="search" id="cat-search" placeholder="Search product or HSN code" autocomplete="off"></label>
<p class="small"><a class="link link-pad" href="/products/">See every product with photos</a> or the <a class="link link-pad" href="/hsn-codes-for-garments/">HSN code table</a>.</p>
</div>
<div>
${panels}
<div class="cat-empty" id="cat-empty" hidden><i class="ph ph-magnifying-glass" aria-hidden="true"></i><p class="h4">No product matches that search</p><p class="small">Try polo, jeans or jacket, or an HSN code such as 6205. Sourcing something not listed? Describe it in the enquiry.</p></div>
</div>
</div>
</div></section>

<section class="section"><div class="wrap">
${secHead("04", "What you can specify", "Every detail that decides <em>how it sells.</em>", "Have only a reference garment? We write the spec with you and confirm it before the sample.")}
<ul class="spec-sheet reveal">
${[["ph-scales", "Fabric and GSM", "Cotton, polyester, silk, blends and handloom, weighed to the GSM you set."], ["ph-ruler", "Size chart and fit", "Graded to your measurements for your market, from baby sizes up."], ["ph-palette", "Colours and prints", "Matched to Pantone references or a physical swatch."], ["ph-tag", "Labels and trims", "Your brand, care and fibre labels, hang tags, buttons and zips."], ["ph-package", "Packing", "Folding, polybags, ratio packing per carton and carton marks."], ["ph-file-text", "Export documents", "Invoice and packing list with the HSN code for each line."]]
  .map(([i, h, t], n) => `<li><span class="label">SPEC ${pad(n + 1)}<i class="ph ${i}" aria-hidden="true"></i></span><h3>${h}</h3><p class="small">${t}</p></li>`).join("")}
</ul>
<p class="small" style="margin-top:var(--s5)">New to GSM? Read the <a class="link link-pad" href="/guides/garment-gsm-guide/">fabric GSM guide</a> or the <a class="link link-pad" href="/guides/how-to-send-a-tech-pack/">tech pack checklist</a>.</p>
</div></section>

<section class="section bg-indigo" id="process"><div class="wrap">
${secHead("05", "How an order runs", "From enquiry to <em style=\"color:#AEB9E6\">your port.</em>")}
<div class="ruler" aria-hidden="true"></div>
<ol class="steps">
<li class="step reveal"><span class="label">Step 01</span><h3>Send the enquiry</h3><p class="body">Products, quantities, spec or tech pack, and destination. We reply within 24 hours, Monday to Saturday, with stock availability or a costing.</p></li>
<li class="step reveal"><span class="label">Step 02</span><h3>Approve photos or sample</h3><p class="body">For stock you see the actual lot. For custom orders you approve a physical sample from the partner factory before bulk starts.</p></li>
<li class="step reveal"><span class="label">Step 03</span><h3>Produce, pack, ship</h3><p class="body">Goods are checked against the approved sample, packed to your carton plan and shipped with invoice, packing list and HSN codes.</p></li>
</ol>
<div class="ship">
${photoPic("shipping", { alt: "Container vessel being loaded under gantry cranes at a port (representative photo)", sizes: "(max-width: 760px) calc(100vw - 32px), 560px" }).replace("<img ", '<img class="reveal" ')}
<div class="reveal"><span class="label" style="color:#AEB9E6">We ship to</span><nav class="markets" aria-label="Export markets" style="margin-top:var(--s3)">${MARKETS.map((m) => `<a href="/export/${m.slug}/">${m.name}<i class="ph ph-arrow-right" aria-hidden="true"></i></a>`).join("")}</nav></div>
</div>
</div></section>

${credsSection()}

${faqHtml(FAQS, "Before you send the <em>enquiry.</em>", "07", "#enquiry")}
${enquiryForm({ source: "home" })}`,
  });
}

// ================================================================ PRODUCTS (catalogue page)
{
  const crumbs = [["Home", "/"], ["Products", "/products/"]];
  const faqs = [
    ["Which garments does GoodBiz Apparels supply?", `${N} export lines in three constructions: knits (T shirts, polos and kids tees), woven (shirts, trousers, jeans, shorts, babywear and kidswear) and outerwear (cotton and polyester jackets), for men and kids, made through partner factories in India.`],
    ["What is the difference between knitted and woven garments?", "Knitted garments are made from looped yarn that stretches, such as T shirts and polos, and are classified in HS chapter 61. Woven garments are made from interlaced yarn on a loom, such as shirts, trousers and jeans, and are classified in HS chapter 62."],
    ["Can I order men's and kids' products in one shipment?", "Yes. Lines from any construction and audience can be combined in one order and one shipment, from ready stock, made to order, or both."],
    ["Do the product photos show the exact garment I will receive?", "No. Photos show the product type in example colourways. Made to order garments follow your spec and approved sample; ready stock lines are shown with photos of the actual lot before you pay."],
    ["How do I get a quote for several products?", "Use Add to quote on each product you want. They collect in your enquiry with their HSN codes, then send it from the enquiry form. We reply within 24 hours, Monday to Saturday."],
  ];
  const notes = [
    ["ph-package", "Mix ready stock and made to order lines in one shipment.", "/ready-stock-garments/", "How ready stock works"],
    ["ph-tag", "Private label ready: your woven labels, care labels and hang tags on every line.", "/private-label-clothing-manufacturer/", "Made to order and private label"],
    ["ph-file-text", "Export documents carry the 8 digit HSN code for every line you order.", "/hsn-codes-for-garments/", "See the HSN code table"],
  ];
  const index = CATEGORIES.map((c, i) => `<details class="cindex-cat" open data-cat="${c.key}"><summary><span><span class="label">${pad(i + 1)}</span> ${c.name}</span><span class="count label">${pad(linesOf(c.key))}</span></summary><ul>${prodsOf(c.key).map((p) => `<li data-for="${p.slug}"><a href="#${p.slug}">${esc(short(p.name))}</a></li>`).join("")}</ul></details>`).join("");
  const blocks = CATEGORIES.map((c, i) => `<section class="cblock" id="${c.slug}" data-cat="${c.key}" aria-labelledby="h-${c.slug}">
<header class="cblock-head reveal"><div><span class="label">${pad(i + 1)} · ${c.chapter}</span><h2 class="h2" id="h-${c.slug}">${c.name}</h2></div><div><p class="small">${esc(c.short)}</p><a class="arrow-link" href="/${c.slug}/">About ${c.name.toLowerCase()} <i class="ph ph-arrow-right" aria-hidden="true"></i></a></div></header>
<div class="pgrid">${prodsOf(c.key).map((p, k) => pcard(p, { high: i === 0 && k === 0 })).join("")}</div>
</section>
<div class="cnote reveal" role="note"><i class="ph ${notes[i][0]}" aria-hidden="true"></i><p>${notes[i][1]}</p><a class="arrow-link" href="${notes[i][2]}">${notes[i][3]} <i class="ph ph-arrow-right" aria-hidden="true"></i></a></div>`).join("");
  page({
    path: "/products/", crumbs, pageType: "CollectionPage", mainEntity: { "@id": abs("/products/#list") },
    title: `Garment Export Catalogue: Knits, Woven, Outerwear`,
    meta: `Every product GoodBiz Apparels exports: ${N} lines of knits, woven garments and outerwear for men and kids, with photos, fabric, GSM and HSN codes.`,
    og: ogLine("mens-cotton-t-shirts"),
    schema: [itemList("/products/", "GoodBiz Apparels export catalogue", ALL_PRODUCTS), faqSchema(faqs, "/products/")],
    body: `<section class="page-hero products-hero"><div class="wrap">
${crumbsHtml(crumbs)}
<div class="page-hero-grid">
<div class="reveal">
<span class="label eyebrow">Export catalogue · ${N} lines</span>
<h1 class="h1">Knits, woven and outerwear, <em>made for export.</em></h1>
<p class="lead">Every garment we supply falls into one of three constructions. Browse each line with its photo, fabric and HSN code, then add the ones you want to a single quote.</p>
<ul class="chips"><li><i class="ph ph-stack" aria-hidden="true"></i> Bulk production</li><li><i class="ph ph-package" aria-hidden="true"></i> Ready stock</li><li><i class="ph ph-tag" aria-hidden="true"></i> Private label ready</li><li><i class="ph ph-barcode" aria-hidden="true"></i> HSN on every line</li></ul>
</div>
<nav class="contents reveal" aria-label="Constructions">${CATEGORIES.map((c, i) => `<a href="#${c.slug}" style="--tone:${c.tone}"><span class="label">${pad(i + 1)} · ${c.chapter}</span><span class="contents-name">${c.name}</span><span class="contents-count">${pad(linesOf(c.key))}<i class="ph ph-arrow-down" aria-hidden="true"></i></span></a>`).join("")}</nav>
</div></div></section>

<section class="section catalog" id="products"><div class="wrap catalog-grid">
<nav class="cindex" aria-label="Product index"><div class="cindex-box">
<p class="label cindex-title">All products <span class="muted" data-pf-count>${N} shown</span></p>
<div class="aud-filter" role="group" aria-label="Show products for"><button type="button" aria-pressed="true" data-aud="all">All</button><button type="button" aria-pressed="false" data-aud="men">Men's</button><button type="button" aria-pressed="false" data-aud="kids">Kids</button></div>
<label class="search"><i class="ph ph-magnifying-glass" aria-hidden="true"></i><span class="sr-only">Search products</span><input type="search" id="pf-search" placeholder="Search product, fabric or HSN" autocomplete="off"></label>
${index}
</div></nav>
<div class="catalog-main">
${blocks}
<div class="cat-empty" id="pf-empty" hidden><i class="ph ph-magnifying-glass" aria-hidden="true"></i><p class="h4">No product matches</p><p class="small">Try another word or HSN code, or clear the filter. Sourcing something not listed? <a class="link" href="/contact/">Describe it in an enquiry</a>.</p></div>
<p class="small muted photo-note">Photos show the product type in example colourways. Your order follows your spec or the actual stock lot.</p>
</div>
</div></section>

<section class="section-tight"><div class="wrap"><div class="organised reveal">
<div><span class="label">How this catalogue is organised</span><h2 class="h3">By construction first, then by product.</h2></div>
<p class="body">Knits sit in HS chapter 61 and woven garments in chapter 62, so grouping by construction mirrors how your customs broker classifies them. Outerwear is listed on its own because tailoring, lining and closures drive its costing. Each product links to its family page with fabrics, GSM ranges, specification options and FAQs.</p>
</div></div></section>
${faqHtml(faqs, "About the <em>catalogue.</em>")}
${ctaBand("Added products travel with your enquiry, HSN codes included. Send it and we reply with stock availability or a production costing.")}`,
  });
}

// ================================================================ PILLARS (service pages, with the enquiry form)
const pillar = ({ path, eyebrow, title, meta, h1, intro, photo, alt, prose, facts, faqs, service, source }) => {
  const crumbs = [["Home", "/"], [eyebrow, path]];
  page({
    path, title, meta, og: ogPhoto(photo), crumbs, hasForm: true, mainEntity: { "@id": abs(path) + "#service" },
    schema: [serviceSchema(path, h1, service, intro), faqSchema(faqs, path)],
    body: `${pageHero({ crumbs, eyebrow, h1, intro, photo, alt, enq: "#enquiry" })}
<section class="section"><div class="wrap prose-grid"><div class="prose reveal">${prose}</div>
<div class="aside reveal"><div class="aside-block"><span class="label">At a glance</span><dl>${facts.map(([k, v]) => `<div><dt class="label muted">${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl></div></div></div></section>
<section class="section bg-2" id="products"><div class="wrap">
${secHead("Range", "Constructions", "Knits, woven and <em>outerwear.</em>")}
${catTiles()}
</div></section>
${faqHtml(faqs, undefined, undefined, "#enquiry")}
${enquiryForm({ source })}`,
  });
};

pillar({
  path: "/ready-stock-garments/", eyebrow: "Ready stock", service: "Wholesale ready stock garments for export", source: "stock",
  title: "Ready Stock Garments for Export from India | GoodBiz",
  meta: "Ready stock knits, woven garments and jackets from India for fast dispatch. Ask for today's dated stock list with photos, sizes, pieces and prices.",
  h1: "Ready stock garments for export from India",
  intro: "Ready stock garments are finished pieces already made and packed, so they ship without waiting for a production run. GoodBiz Apparels offers ready stock knits, woven garments and jackets for men and kids, and sends a dated stock list with photos of the actual lots before you pay.",
  photo: "stock-racks", alt: "Finished garments in neutral tones hanging on a rail (representative photo)",
  prose: `<h2>Get today's stock list</h2>
<p>Stock changes every week, so we send the list on request instead of publishing prices that go out of date. Each lot on the list shows:</p>
<ul><li>photos of the actual garments, not catalogue images</li><li>sizes and the number of pieces available in each</li><li>fabric, composition and GSM</li><li>the price per piece on your chosen Incoterm</li><li>how soon it can be packed and shipped</li></ul>
<p class="stock-cta"><a class="btn btn-primary" href="${waLink("Hello GoodBiz Apparels, please send me today's ready stock list.")}" rel="noopener"><i class="ph ph-whatsapp-logo" aria-hidden="true"></i> Get the stock list on WhatsApp</a> <a class="btn btn-ghost" href="mailto:${esc(SITE.email)}?subject=${encodeURIComponent("Ready stock list request")}">Ask by email</a></p>
<h2>How buying ready stock works</h2>
<ol><li><strong>Tell us what you need.</strong> Products, sizes, colours and quantities, plus your destination port.</li><li><strong>We confirm availability.</strong> You get quantities by size and colour with photos of the actual lot.</li><li><strong>Labels and packing.</strong> Add your own brand labels and hang tags if you want them, and confirm the carton plan.</li><li><strong>Proforma, payment and dispatch.</strong> We ship with the commercial invoice, packing list and HSN codes.</li></ol>
<h2>When ready stock is the right choice</h2>
<ul><li>You need goods for a season that starts soon.</li><li>You want to test a product in your market before a production order.</li><li>You are replenishing a line that sold through.</li><li>You are filling a mixed container with many styles in small quantities.</li></ul>
<h2>What you can change on stock</h2>
<p>Fabric, colour and fit are fixed, because the garments are already made. What you can still choose is the branding and the packing: your woven or printed labels, hang tags, size stickers, polybags, folding and carton marks. If a line needs a different fabric or fit, it moves to <a href="/private-label-clothing-manufacturer/">made to order</a>.</p>
<h2>Checking a lot before you pay</h2>
<p>Before you pay, you can ask for more photos, measurements of sample pieces from each size, or a video call over the lot. For larger lots you can appoint an inspection agency of your choice to check quantity and workmanship before dispatch.</p>
<h2>Mixing stock with made to order</h2>
<p>You can combine ready stock lines with made to order styles in one shipment. Stock lines wait until production lines are ready, or ship ahead if you prefer. Browse <a href="/products/">all products</a> to see every line with its HSN code.</p>`,
  facts: [["Stock list", "Dated, sent on request"], ["Photos", "Of the actual lot"], ["Your labels", "Available on request"], ["Documents", "Invoice and packing list with HSN codes"], ["Reply", "Within 24 hours, Mon to Sat"]],
  faqs: [["What is ready stock in garments?", "Ready stock garments are finished, packed pieces already produced, so they can ship without a new production run."], ["Why is there no price list on the website?", "Ready stock changes every week. We send a dated stock list with photos, sizes, pieces and prices on request, so the prices you see are current."], ["Can I see the stock before paying?", "Yes. We send photos of the actual lot, with quantities by size and colour, before you pay, and you can appoint an inspection agency for larger lots."], ["Can you add my brand labels to ready stock?", "Yes. Send your labels or artwork and we attach them before packing. Fabric, colour and fit stay as made."]],
});

pillar({
  path: "/private-label-clothing-manufacturer/", eyebrow: "Made to order", service: "Private label and custom clothing manufacturing", source: "private-label",
  title: "Private Label Clothing Manufacturing India | GoodBiz",
  meta: "Private label knits, woven garments and jackets made in India through partner factories, to your design, size chart, fabric and GSM. Sample before bulk.",
  h1: "Private label clothing manufacturing in India",
  intro: "Private label clothing is made to your design and specification and carries only your brand. GoodBiz Apparels runs private label programmes for knits, woven garments and jackets through partner factories in India: we manage the spec, fabric, sampling, quality checks, labels and export, and you approve each stage in writing.",
  photo: "custom-sewing", alt: "Operator guiding fabric through an industrial sewing machine (representative photo)",
  prose: `<h2>What you send us</h2>
<p>A tech pack if you have one, or a reference garment with notes on what to change. The essentials are design, size chart, fabric and GSM, colours, labels, packing and quantities. Our <a href="/guides/how-to-send-a-tech-pack/">tech pack checklist</a> covers each item.</p>
<h2>How production runs</h2>
<ol><li><strong>Spec and costing.</strong> We confirm every detail in writing and send a costing with a dated timeline.</li><li><strong>Fabric to your GSM.</strong> Sourced to the weight and composition you set, with a lab dip or fabric swatch for approval. See the <a href="/guides/garment-gsm-guide/">GSM guide</a>.</li><li><strong>Sample.</strong> Made to your spec by the partner factory; you get photos, measurements and the physical piece.</li><li><strong>Bulk production.</strong> Starts only after your written approval of the sample.</li><li><strong>Inspection.</strong> Checked against the approved sample for measurements, workmanship and packing.</li><li><strong>Shipment.</strong> Packed to your carton plan and shipped with the invoice, packing list and HSN codes.</li></ol>
<h2>Partner factories and quality checks</h2>
<p>We do not run our own sewing floor. Each programme goes to a partner factory in India that specialises in that product: knit units for T shirts and polos, shirt and bottoms units for woven garments, and outerwear units for jackets. GoodBiz Apparels stays responsible for the order: fabric GSM and shade are checked before cutting, production is checked while it runs, and the finished goods are inspected against your approved sample before packing. You can also appoint a third party inspection agency of your choice.</p>
<h2>How minimums work</h2>
<p>Minimums are set by the fabric, not by us. Fabric is knitted or woven and then dyed in lots, so each colour needs enough garments to use a dye lot. That is why the minimum applies per colour and is confirmed in your costing. Ask for a costing at two quantities if you want to compare.</p>
<h2>Timelines</h2>
<p>Every costing comes with a dated timeline for sampling, bulk production and shipment, based on your fabric and quantity. The <a href="/guides/importing-garments-from-india/">guide to importing garments from India</a> explains the typical stages and what affects each one.</p>
<h2>Your brand, start to finish</h2>
<p>Woven and printed labels, care and fibre labels, hang tags, branded trims and packaging are produced to your artwork. Nothing carries our name. Browse <a href="/products/">all products</a> or see the <a href="/hsn-codes-for-garments/">HSN codes</a> for each line.</p>`,
  facts: [["Minimum order", isSet(SITE.moq) ? SITE.moq : "Per colour, set by the fabric dye lot; confirmed in your costing"], ["Sample", "Always before bulk"], ["Production", "Partner factories in India, managed by GoodBiz"], ["Fabric", "Sourced to your GSM and composition"], ["Labels", "Yours, to your artwork"]],
  faqs: [["What is private label clothing manufacturing?", "Garments produced to a buyer's design and specification and labelled with the buyer's brand. The buyer sells them as their own product."], ["Do you own the factory?", "No. Production runs in partner factories in India that specialise in each product type. GoodBiz Apparels manages the spec, sampling, quality checks, labelling and export, and is your single point of contact."], ["Do I need a tech pack to start?", "No. A reference garment with written changes is enough. We turn it into a spec sheet for your approval."], ["Do you make a sample before bulk?", "Yes. Bulk production starts only after you approve the sample in writing."]],
});

// ================================================================ CONSTRUCTION HUBS
for (const c of CATEGORIES) {
  const fams = famsOf(c.key);
  const path = `/${c.slug}/`;
  const crumbs = [["Home", "/"], ["Products", "/products/"], [c.name, path]];
  const faqs = fams.flatMap((f) => f.faqs.slice(0, f.faqs.length > 2 ? 2 : 1));
  page({
    path, title: c.title, meta: c.meta, og: ogLine(c.img), crumbs, pageType: "CollectionPage", mainEntity: { "@id": abs(path) + "#list" },
    schema: [itemList(path, c.h1, prodsOf(c.key)), faqSchema(faqs, path)],
    body: `${pageHero({ crumbs, eyebrow: `${c.chapter} · ${pad(linesOf(c.key))} lines`, h1: c.h1, intro: c.intro, stage: fanStage(c) })}
<section class="section bg-2" id="products"><div class="wrap">
${secHead("Lines", `${pad(linesOf(c.key))} products`, `${esc(c.name)} with <em>photos and HSN codes.</em>`, "Every line is available from ready stock or made to your spec.")}
<div class="pgrid pgrid-3">${prodsOf(c.key).map((p) => pcard(p)).join("")}</div>
</div></section>
<section class="section"><div class="wrap">
${secHead("Families", plural(fams.length, "family", "families"), `Fabrics, GSM and <em>specification.</em>`)}
<div class="families families-hub">${fams.map((f) => familyCard(f)).join("")}</div>
</div></section>
<section class="section"><div class="wrap prose-grid"><div class="prose reveal"><h2>About ${esc(c.name.toLowerCase())}</h2>${c.body.map((p) => `<p>${esc(p)}</p>`).join("")}
<p>Buying for a specific market? See <a href="/export/">export markets</a>. Need every code in one table? See <a href="/hsn-codes-for-garments/">HSN codes for garments</a>.</p></div>
<div class="aside reveal"><div class="aside-block"><span class="label">Other constructions</span><ul>${CATEGORIES.filter((x) => x !== c).map((x) => `<li><a href="/${x.slug}/">${x.name}<i class="ph ph-arrow-right" aria-hidden="true"></i></a></li>`).join("")}<li><a href="/products/">All products<i class="ph ph-arrow-right" aria-hidden="true"></i></a></li></ul></div></div></div></section>
${faqHtml(faqs)}
${ctaBand()}`,
  });
}

// ================================================================ FAMILIES (with the enquiry form)
for (const f of FAMILIES) {
  const c = catOf(f.cat);
  const url = famUrl(f);
  const crumbs = [["Home", "/"], [c.name, `/${c.slug}/`], [f.name, url]];
  const prods = ALL_PRODUCTS.filter((p) => p.family === f);
  page({
    path: url, title: f.title, meta: f.meta, og: ogLine(prods[0].slug), crumbs, pageType: "CollectionPage", mainEntity: { "@id": abs(url) + "#list" }, hasForm: true,
    schema: [itemList(url, f.h1, prods), faqSchema(f.faqs, url)],
    body: `${pageHero({ crumbs, eyebrow: `${c.name} · ${f.audience}`, h1: f.h1, intro: f.intro, stage: familyStage(f), enq: "#enquiry" })}
<section class="section bg-2" id="products"><div class="wrap">
${secHead("Lines", `${pad(prods.length)} products`, "Products and <em>HSN codes.</em>", "Every line is available from ready stock or made to your spec.")}
<div class="pgrid pgrid-3">${prods.map((p) => pcard(p)).join("")}</div>
<p class="small muted photo-note">Photos show the product type in example colourways. Your order follows your spec or the actual stock lot.</p>
</div></section>
<section class="section"><div class="wrap prose-grid">
<div class="prose reveal"><h2>About this range</h2>${f.body.map((p) => `<p>${esc(p)}</p>`).join("")}
<h2>Specification options</h2>
<table><tbody>${f.specs.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</tbody></table>
<p class="updated">Fabric weights are typical industry ranges. Garments are produced to the GSM you specify. <a href="/guides/garment-gsm-guide/">How to choose GSM</a>.</p></div>
<div class="aside reveal">
<div class="aside-block"><span class="label">More ${esc(c.name.toLowerCase())}</span><ul>${famsOf(f.cat).filter((x) => x !== f).map((r) => `<li><a href="${famUrl(r)}">${esc(r.name)}<i class="ph ph-arrow-right" aria-hidden="true"></i></a></li>`).join("")}<li><a href="/${c.slug}/">All ${esc(c.name.toLowerCase())}<i class="ph ph-arrow-right" aria-hidden="true"></i></a></li><li><a href="/products/">All products<i class="ph ph-arrow-right" aria-hidden="true"></i></a></li></ul></div>
<div class="aside-block"><span class="label">Exporting to</span><ul>${MARKETS.map((m) => `<li><a href="/export/${m.slug}/">${m.name}<i class="ph ph-arrow-right" aria-hidden="true"></i></a></li>`).join("")}</ul></div>
</div></div></section>
${faqHtml(f.faqs, undefined, undefined, "#enquiry")}
${enquiryForm({ source: `family-${f.slug}`, heading: `Get a costing for <em>${esc(f.name.charAt(0).toLowerCase() + f.name.slice(1))}.</em>` })}`,
  });
}

// ================================================================ HSN HUB
{
  const path = "/hsn-codes-for-garments/";
  const crumbs = [["Home", "/"], ["HSN codes for garments", path]];
  const faqs = [
    ["What is an HSN code for garments?", "HSN (Harmonized System of Nomenclature) codes classify goods for customs and tax. Garments fall in chapter 61 if knitted and chapter 62 if woven. India uses 8 digit codes; the first 6 digits are shared internationally."],
    ["What is the HSN code for cotton T shirts?", "Cotton T shirts, for men and kids, are invoiced under 61091000. Polyester T shirts take 61099010, the line for synthetic fibres."],
    ["What is the HSN code for a cotton polo shirt?", "Cotton polo shirts are knit shirts under heading 6105, not T shirts, because they have a collar and buttoned placket. We invoice them under 61051020."],
    ["Which HSN code applies to jackets and windcheaters?", "Anoraks, windcheaters, bombers and similar jackets are classified under heading 6201: 62013090 for cotton and 62014090 for man-made fibres. Tailored blazers and suit-type jackets fall under heading 6203."],
    ["What HSN code applies to babies' garments?", "Woven babies' garments use heading 6209: 62092090 for cotton, 62093000 for synthetic fibres and 62099090 for other textiles. They are for children of a body height not exceeding 86 cm. Knitted babywear falls under heading 6111."],
    ["What GST applies to garments in India?", "Since 22 September 2025, garments in chapters 61 and 62 with a sale value up to ₹2,500 per piece attract 5% GST and those above ₹2,500 per piece attract 18%. Exports are zero rated: goods ship under a Letter of Undertaking without IGST, or IGST is paid and refunded."],
  ];
  const rows = CATEGORIES.map((c) => `<tbody><tr class="group"><th colspan="3" scope="colgroup">${c.name}</th></tr>${prodsOf(c.key).map((p) => `<tr data-search="${esc(`${p.name} ${p.hsn} ${c.name}`.toLowerCase())}"><td><a href="${prodUrl(p)}">${esc(p.name)}</a></td><td class="hsn">${p.hsn}</td><td>${construction(p.hsn)} (heading ${p.hsn.slice(0, 4)})</td></tr>`).join("")}</tbody>`).join("");
  page({
    path, type: "article", crumbs, mainEntity: { "@id": abs(path) + "#article" },
    title: "HSN Codes for Garments: T Shirts, Shirts, Jeans, Jackets",
    meta: `8 digit HSN codes for ${N} garment lines: T shirts, polos, shirts, trousers, jeans, shorts, jackets, babywear and kidswear, with GST rates for garments.`,
    og: ogPhoto("m-shirts"),
    schema: [{ "@type": "Article", "@id": abs(path) + "#article", headline: "HSN codes for garments", description: `The 8 digit HSN codes GoodBiz Apparels uses for ${N} garment lines, with GST rates.`, image: [abs(ogPhoto("m-shirts"))], datePublished: SITE.published, dateModified: SITE.updated, author: { "@id": abs("/#org") }, publisher: { "@id": abs("/#org") }, mainEntityOfPage: { "@id": abs(path) + "#webpage" }, inLanguage: "en" }, faqSchema(faqs, path)],
    body: `${pageHero({ crumbs, eyebrow: "Reference", h1: "HSN codes for garments", intro: `These are the 8 digit HSN codes GoodBiz Apparels uses on export invoices for ${N} garment lines, checked against India's ITC-HS tariff on ${SITE.hsnChecked}. Knitted garments fall in chapter 61 and woven garments in chapter 62. Your country's import tariff code is confirmed by your customs broker.`, actions: false, facts: [["Lines", String(N)], ["Chapter 61", "Knitted garments"], ["Chapter 62", "Woven garments and outerwear"], ["Codes checked", SITE.hsnChecked]] })}
<section class="section"><div class="wrap"><div class="prose reveal" style="max-width:960px">
<h2>HSN code table</h2>
<label class="search hsn-search"><i class="ph ph-magnifying-glass" aria-hidden="true"></i><span class="sr-only">Search the HSN code table</span><input type="search" id="hsn-search" placeholder="Search product or code, e.g. polo or 6205" autocomplete="off"></label>
<table class="hsn-table"><thead><tr><th scope="col">Product</th><th scope="col">HSN code</th><th scope="col">Construction</th></tr></thead>${rows}</table>
<p class="small muted" id="hsn-empty" hidden>No line matches that search. Describe the garment in an <a href="/contact/">enquiry</a> and we confirm its code.</p>
<h2>GST on garments in India</h2>
<p>GST is charged on garments sold inside India, and it follows the sale value per piece. Since 22 September 2025, garments in chapters 61 and 62 attract:</p>
<table><thead><tr><th scope="col">Sale value per piece</th><th scope="col">GST rate</th></tr></thead><tbody><tr><td>Up to ₹2,500</td><td>5%</td></tr><tr><td>Above ₹2,500</td><td>18%</td></tr><tr><td>Exports</td><td>Zero rated (under a Letter of Undertaking, or IGST paid and refunded)</td></tr></tbody></table>
<p>Our export invoices are zero rated, so overseas buyers do not pay Indian GST. Check current rates on the <a href="https://cbic-gst.gov.in/gst-goods-services-rates.html" rel="noopener">CBIC GST rate finder</a>.</p>
<h2>How to read a garment HSN code</h2>
<p>Take 62052090. <strong>62</strong> is the chapter (woven apparel). <strong>6205</strong> is the heading (men's or boys' shirts). <strong>620520</strong> is the internationally shared subheading (of cotton). The last two digits, <strong>90</strong>, are India's national split; here it means "other", as opposed to 10 for handloom.</p>
<p>Because the first six digits are shared by most customs systems, they give your broker a reliable starting point. The final import code and duty rate come from your own country's tariff. See also <a href="/guides/importing-garments-from-india/">how to import garments from India</a> and <a href="/products/">all products with photos</a>.</p>
<h2>Codes that are often confused</h2>
<ul><li><strong>Polo shirts are not T shirts.</strong> A collar and buttoned placket move a knitted top from heading 6109 to heading 6105.</li><li><strong>Windcheaters are not blazers.</strong> Anoraks, windcheaters and bombers sit under heading 6201; tailored jackets and blazers under heading 6203.</li><li><strong>Knitted and woven babywear differ.</strong> Woven babies' garments are heading 6209; knitted ones are heading 6111.</li><li><strong>Girls' shirts are a separate heading.</strong> Men's and boys' shirts are heading 6205; women's and girls' shirts and blouses are heading 6206.</li></ul>
<p class="updated">Codes checked against India's ITC-HS tariff on ${SITE.hsnChecked}. Classification depends on the exact garment, so confirm each code with your customs broker before shipping.</p>
</div></div></section>
${faqHtml(faqs)}
${ctaBand()}`,
  });
}

// ================================================================ EXPORT
{
  const crumbs = [["Home", "/"], ["Export markets", "/export/"]];
  const links = MARKETS.map((m) => [`/export/${m.slug}/`, m.h1]);
  page({
    path: "/export/", crumbs, pageType: "CollectionPage", mainEntity: { "@id": abs("/export/#list") },
    title: "Garment Export Markets: USA, UK, EU, UAE, Africa",
    meta: "GoodBiz Apparels exports knits, woven garments and jackets from India to the USA, UK, EU, UAE, Africa and Australia. Labelling, trade rules, documents.",
    og: ogPhoto("shipping"),
    schema: [linkList("/export/", "Export markets", links)],
    body: `${pageHero({ crumbs, eyebrow: "Export markets", h1: "Where we export garments from India", intro: "GoodBiz Apparels ships ready stock and made to order knits, woven garments and outerwear from India to importers in the United States, United Kingdom, European Union, UAE and GCC, Africa and Australia. Each market has its own labelling rules, product safety rules and trade terms.", actions: false, photo: "shipping", alt: "Container vessel being loaded at a port (representative photo)" })}
<section class="section"><div class="wrap">
${secHead("Markets", plural(MARKETS.length, "market"), "Rules, labels and documents <em>by market.</em>", "Each guide covers how duty is worked out, labelling, children's safety rules, trade agreements and what to send us.")}
<div class="tiles">${MARKETS.map((m, i) => tile(`/export/${m.slug}/`, null, m.name, `Market ${pad(i + 1)}`, "Labelling, tariffs and documents")).join("")}</div></div></section>
${ctaBand()}`,
  });
  for (const m of MARKETS) {
    const path = `/export/${m.slug}/`;
    const cr = [...crumbs, [m.name, path]];
    const shortName = m.short || m.name;
    const faqs = m.faqs || [];
    page({
      path, title: m.title, meta: m.meta, og: ogPhoto("shipping"), crumbs: cr, hasForm: true,
      schema: faqs.length ? [faqSchema(faqs, path)] : [],
      body: `${pageHero({ crumbs: cr, eyebrow: "Export market", h1: m.h1, intro: m.intro, photo: "shipping", alt: "Container vessel being loaded at a port (representative photo)", enq: "#enquiry" })}
<section class="section"><div class="wrap prose-grid"><div class="prose reveal">
${m.points.map(([h, t]) => `<h2>${esc(h)}</h2>${/^\s*</.test(t) ? t : `<p>${esc(t)}</p>`}`).join("\n")}
${sourcesHtml(m.sources)}
<p class="updated">Reviewed ${MARKETS_REVIEWED}. General guidance, not legal or customs advice. Rules change; confirm current requirements with your customs broker.</p></div>
<div class="aside reveal">
<div class="aside-block"><span class="label">Product families</span><ul>${FAMILIES.map((f) => `<li><a href="${famUrl(f)}">${esc(f.name)}<i class="ph ph-arrow-right" aria-hidden="true"></i></a></li>`).join("")}</ul></div>
<div class="aside-block"><span class="label">Other markets</span><ul>${MARKETS.filter((x) => x !== m).map((x) => `<li><a href="/export/${x.slug}/">${x.name}<i class="ph ph-arrow-right" aria-hidden="true"></i></a></li>`).join("")}</ul></div>
</div></div></section>
<section class="section bg-2" id="products"><div class="wrap">
${secHead("Range", "Constructions", `What we ship to <em>${esc(shortName)}.</em>`)}
${catTiles()}</div></section>
${faqs.length ? faqHtml(faqs, undefined, undefined, "#enquiry") : ""}
${enquiryForm({ source: `export-${m.slug}`, heading: `Sourcing for <em>${esc(shortName)}?</em>` })}`,
    });
  }
}

// ================================================================ GUIDES
{
  const crumbs = [["Home", "/"], ["Guides", "/guides/"]];
  const links = [...GUIDES.map((g) => [`/guides/${g.slug}/`, g.h1]), ["/hsn-codes-for-garments/", "HSN codes for garments"]];
  page({
    path: "/guides/", crumbs, pageType: "CollectionPage", mainEntity: { "@id": abs("/guides/#list") },
    title: "Garment Sourcing Guides for Importers | GSM, Tech Packs",
    meta: "Practical guides for buyers sourcing clothing from India: fabric GSM, writing a tech pack, importing step by step, Incoterms and HSN codes for garments.",
    og: ogPhoto("custom-sewing"),
    schema: [linkList("/guides/", "Garment sourcing guides", links)],
    body: `${pageHero({ crumbs, eyebrow: "Guides", h1: "Garment sourcing guides for importers", intro: "Plain answers to the questions buyers ask before placing a garment order in India: fabric weight, tech packs, import steps, Incoterms, payment terms and customs codes.", actions: false, facts: [["Guides", String(links.length)], ["Updated", SITE.updated]] })}
<section class="section"><div class="wrap">
${secHead("Library", plural(links.length, "guide"), "Read before you <em>place an order.</em>")}
<div class="tiles">
${links.map(([u, t], i) => tile(u, null, t, i < GUIDES.length ? `Guide ${pad(i + 1)}` : "Reference", "Read")).join("")}
</div></div></section>${ctaBand()}`,
  });
  for (const g of GUIDES) {
    const path = `/guides/${g.slug}/`;
    const cr = [...crumbs, [g.h1, path]];
    const og = ogPhoto(photoName(g.image || "/assets/img/custom-sewing.jpg"));
    const published = g.published || SITE.published, updated = g.updated || SITE.updated;
    page({
      path, title: g.title, meta: g.meta, type: "article", og, ogAlt: g.h1, crumbs: cr, mainEntity: { "@id": abs(path) + "#article" },
      schema: [faqSchema(g.faqs, path), { "@type": "Article", "@id": abs(path) + "#article", headline: g.h1, description: g.meta, image: [abs(og)], datePublished: published, dateModified: updated, author: { "@id": abs("/#org") }, publisher: { "@id": abs("/#org") }, mainEntityOfPage: { "@id": abs(path) + "#webpage" }, isPartOf: { "@id": abs("/#website") }, inLanguage: "en", ...(g.sources?.length && { citation: g.sources.map(([, u]) => u) }) }],
      body: `${pageHero({ crumbs: cr, eyebrow: "Guide", h1: g.h1, intro: g.lead, actions: false, facts: [["Published", published], ["Updated", updated], ["By", `${SITE.name} sourcing team`], ["Sections", String(g.sections.length)]] })}
<section class="section"><div class="wrap prose-grid"><article class="prose reveal">
${g.sections.map(([h, html]) => `<h2 id="${slugify(h)}">${h}</h2>${html}`).join("\n")}
${sourcesHtml(g.sources)}
</article>
<div class="aside reveal"><div class="aside-block"><span class="label">In this guide</span><ul>${g.sections.map(([h]) => `<li><a href="#${slugify(h)}">${h}<i class="ph ph-arrow-down" aria-hidden="true"></i></a></li>`).join("")}</ul></div>
<div class="aside-block"><span class="label">More guides</span><ul>${GUIDES.filter((x) => x !== g).map((x) => `<li><a href="/guides/${x.slug}/">${x.h1}<i class="ph ph-arrow-right" aria-hidden="true"></i></a></li>`).join("")}<li><a href="/hsn-codes-for-garments/">HSN codes for garments<i class="ph ph-arrow-right" aria-hidden="true"></i></a></li></ul></div></div>
</div></section>
${faqHtml(g.faqs)}
${ctaBand()}`,
    });
  }
}

// ================================================================ ABOUT / CONTACT
{
  const crumbs = [["Home", "/"], ["About", "/about/"]];
  page({
    path: "/about/", crumbs, pageType: "AboutPage", mainEntity: { "@id": abs("/#org") },
    title: "About GoodBiz Apparels | Garment Export from India",
    meta: "GoodBiz Apparels, part of the GoodBiz group in Bengaluru, supplies knits, woven garments and jackets made in India through partner factories.",
    og: ogPhoto("hero-factory"),
    body: `${pageHero({ crumbs, eyebrow: "About", h1: "About GoodBiz Apparels", intro: "GoodBiz Apparels is a garment sourcing and export company in Bengaluru, India. We supply importers, brands and retailers with knits, woven garments and jackets for men and kids, made through partner factories in India, from ready stock or to their own design, size chart and GSM.", photo: "hero-factory", alt: "Garment stitching floor with operators at sewing machines (representative photo)", actions: false })}
<section class="section"><div class="wrap prose-grid"><div class="prose reveal">
<h2>Who we are</h2><p>GoodBiz Apparels is the garment export business of GoodBiz, a Bengaluru export group (<a href="${SITE.parent.url}" rel="noopener">${SITE.parent.name}</a>) that also exports agro commodities as <a href="https://goodbizagro.com/" rel="noopener">GoodBiz Agri</a>. We work with importers, brands and wholesalers who want one accountable contact for knits, woven garments and jackets made in India.</p>
<h2>How we produce</h2><p>We do not run our own sewing floor. Each programme is placed with a partner garment factory in India that specialises in that product: knit units for T shirts and polos, shirt and bottoms units for woven garments, and outerwear units for jackets.</p><p>GoodBiz Apparels stays responsible for the order from enquiry to shipment. We write and confirm the specification, source fabric to your GSM, manage sampling, check quality during and after production, attach your labels, prepare the export documents and book the shipment.</p>
<h2>What you can expect from us</h2><ul><li>A reply within 24 hours, Monday to Saturday.</li><li>Every specification detail confirmed in writing before a sample is cut.</li><li>A physical sample to approve before bulk production starts.</li><li>Photos of the actual lot before you pay for ready stock.</li><li>The 8 digit HSN code on every invoice and packing list line.</li><li>Registration details, such as IEC and GSTIN, shared with buyers on request.</li></ul>
<h2>What we supply</h2><p>Knits (T shirts, polos and kids tees), woven garments (shirts, trousers, jeans, shorts, babywear and kidswear) and outerwear (cotton and polyester jackets) for men and kids. See <a href="/products/">all products</a> and the <a href="/hsn-codes-for-garments/">HSN codes</a> for each line.</p>
<h2>Where we ship</h2><p>The USA, the UK, the European Union, the UAE and wider GCC, Africa and Australia. Each <a href="/export/">export market guide</a> covers labelling, product safety rules and trade agreements for that market.</p>
<p class="small muted">Photos on this site are representative images used under the Unsplash License, not photos of our partner factories.</p>
</div><div class="aside reveal"><div class="aside-block"><span class="label">Company details</span><dl>
${[["Office", SITE.address], ["Email", SITE.email], ["Phone and WhatsApp", SITE.phone], ["Reply time", "Within 24 hours, Mon to Sat"], ["Group", SITE.parent.name], ["Legal name", SITE.legalName], ["IEC", SITE.iec], ["GSTIN", SITE.gstin], ["AEPC RCMC", SITE.rcmc], ["Founded", SITE.founded]].filter(([, v]) => isSet(v)).map(([k, v]) => `<div><dt class="label muted">${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl></div></div></div></section>
${ctaBand()}`,
  });
  const cc = [["Home", "/"], ["Contact", "/contact/"]];
  page({
    path: "/contact/", crumbs: cc, pageType: "ContactPage", mainEntity: { "@id": abs("/#org") }, hasForm: true,
    title: "Contact GoodBiz Apparels | Garment Export Enquiry",
    meta: "Send a sourcing enquiry for knits, woven garments or jackets to GoodBiz Apparels. Ready stock or made to order. We reply within 24 hours, Mon to Sat.",
    body: `<div class="wrap" style="padding-top:var(--s6)">${crumbsHtml(cc)}</div>
${enquiryForm({ heading: "Send your garment <em>sourcing enquiry.</em>", source: "contact", tag: "h1" })}
${faqHtml(FAQS.slice(0, 6), undefined, undefined, "#enquiry")}`,
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
<ul class="lp-checks">${["Ready stock or made to your design, size chart and GSM", "Sample approval before bulk production", "Your labels, and HSN codes on every invoice line", `Knits, woven and outerwear for men and kids, ${N} lines`, "A reply within 24 hours, Monday to Saturday"].map((t) => `<li><i class="ph ph-check-circle" aria-hidden="true"></i>${t}</li>`).join("")}</ul>
<a class="btn btn-primary" href="#enquiry">Get a costing <i class="ph ph-arrow-down" aria-hidden="true"></i></a>
</div>
<div class="hero-visual">${photoPic("hero-factory", { alt: "Garment stitching floor with operators at sewing machines (representative photo)", high: true, sizes: "(max-width: 760px) 100vw, 50vw" })}</div>
</div></section>
<section class="section bg-2"><div class="wrap">
${secHead("Range", `${N} lines`, "What we <em>supply.</em>")}
<div class="tiles">${CATEGORIES.map((c) => `<div class="tile">${linePic(c.img, { sizes: "(max-width: 760px) calc(100vw - 32px), 380px" })}<span class="label muted">${pad(linesOf(c.key))} lines · ${c.chapter}</span><h3>${c.name}</h3><p class="small">${famsOf(c.key).map((f) => f.name).join(", ")}</p></div>`).join("")}</div>
</div></section>
${enquiryForm({ source })}
${faqHtml(FAQS.slice(0, 6), undefined, undefined, "#enquiry")}`;
}
page({
  path: "/lp/garment-manufacturer/", noindex: true, bare: true, sitemap: false, hasForm: true,
  title: "Garment Manufacturing in India | Get a Costing | GoodBiz",
  meta: "Knits, woven and outerwear made to your spec in India or shipped from ready stock. Send your enquiry for a costing.",
  body: lpBody({ eyebrow: "Knits · Woven · Outerwear · Made in India", h1: "Your garments, made to <em>spec</em> or shipped from stock.", sub: "Send your design, size chart and GSM, or ask what is in stock. We reply with availability or a production costing.", source: "ads" }),
});
page({
  path: "/lp/sourcing/", noindex: true, bare: true, sitemap: false, hasForm: true,
  title: "Garment Sourcing from India | GoodBiz Apparels",
  meta: "A short introduction to GoodBiz Apparels for buyers we have contacted by email.",
  body: lpBody({ eyebrow: "Following up on our email", h1: "A second supplier for your range, <em>in India.</em>", sub: "Send one style you source today, with its spec or a photo. We come back with a costing, or with matching ready stock if we hold it.", source: "email", personal: true }),
});

// ================================================================ LEGAL + 404
const simple = (path, h1, title, meta, html, noindex = false) =>
  page({ path, noindex, sitemap: !noindex, title, meta, crumbs: noindex ? undefined : [["Home", "/"], [h1, path]], body: `<section class="page-simple"><div class="wrap"><div class="prose"><h1 class="h1">${h1}</h1>${html}<p><a class="btn btn-primary" href="/">Back to the home page</a></p></div></div></section>` });
simple("/privacy/", "Privacy policy", "Privacy Policy | GoodBiz Apparels", "How GoodBiz Apparels collects, uses and keeps the details buyers send through the enquiry form, email and WhatsApp, and how to exercise your rights.", `<p class="updated">Last updated ${SITE.updated}</p>
<p>This policy covers this website, run by ${SITE.name}, a garment export business in ${esc(SITE.address)} ("we", "us"). Questions or requests: <a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a> or ${esc(SITE.phone)}.</p>
<h2>What we collect</h2>
<p><strong>When you send an enquiry.</strong> The enquiry form asks for the products, buying route, specification, quantity, destination country and port, price basis and any notes, then your name, company, email and WhatsApp number. ${isSet(SITE.formEndpoint) ? "When you press Send, these details are stored in our enquiry sheet (Google Sheets) and we receive an email alert." : "When you press Send, the form opens your own email app or WhatsApp with the message written out; nothing reaches us until you send it there."} The page you sent it from and any campaign tags in the link are added so we know how you found us.</p>
<p><strong>When you write, call or message us.</strong> We receive whatever you send by email, phone or WhatsApp.</p>
<p><strong>In your browser.</strong> Products you add to an enquiry and your unfinished form answers are kept in your own browser storage so they survive a page change. They never leave your device unless you send the enquiry.</p>
${SITE.ga4 ? "<p><strong>When you browse.</strong> We use Google Analytics to understand which pages buyers find useful. It records the pages you open, the site that sent you, your device and approximate location, and actions such as sending an enquiry. Visitors in the EU, EEA, UK and Switzerland are measured without analytics cookies; elsewhere Google Analytics sets first party cookies (names starting with _ga). We do not use advertising or personalisation cookies.</p>" : "<p><strong>When you browse.</strong> This site sets no tracking cookies and runs no analytics.</p>"}
<p>We do not ask for payment details, identity documents or any sensitive personal data.</p>
<h2>Why we use it, and our legal basis</h2>
<ul><li>To answer your enquiry, prepare a costing and, if you go ahead, handle the order. This is necessary to take steps at your request before entering a contract.</li><li>To keep the business records that Indian tax, customs and export rules require. This is a legal obligation.</li></ul>
<p>We do not sell your data and we do not use it for advertising.</p>
<h2>Who processes it</h2>
<p>Enquiries are stored in Google Workspace (Google Sheets and Gmail)${SITE.ga4 ? ", site usage is measured with Google Analytics" : ""}, and WhatsApp messages are handled by WhatsApp. These providers may store data outside India and your country. We share order details with the partner factory, freight forwarder and customs broker handling your order only as far as the order needs.</p>
<h2>How long we keep it</h2>
<p>Enquiries that do not become orders are deleted when they are no longer useful, and in any case within three years. Order records are kept for as long as Indian tax and export law requires.</p>
<h2>Your rights</h2>
<p>You can ask us to show, correct or delete the personal data we hold about you, or object to how we use it, by writing to <a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a>. We reply within 30 days.</p>
<p><strong>If you are in India,</strong> the Digital Personal Data Protection Act, 2023 gives you the right to access, correct and erase your personal data, to nominate someone to exercise these rights, and to have grievances addressed by us first.</p>
<p><strong>If you are in the European Union or the United Kingdom,</strong> the GDPR and UK GDPR give you the rights of access, rectification, erasure, restriction, portability and objection, and the right to complain to your data protection authority.</p>
<p>Clearing your browser storage removes anything kept on your device.</p>`);
simple("/terms/", "Terms of trade and website use", "Terms of Trade and Website Use | GoodBiz Apparels", "Terms for using the GoodBiz Apparels website and for quotations: HSN codes, specifications, sample approval, Incoterms and the binding proforma invoice.", `<p class="updated">Last updated ${SITE.updated}</p>
<h2>About this website</h2>
<p>This website describes the garments ${SITE.name} supplies for export, made through partner factories in India. Product photos show the product type in example colourways; they are not the exact garment you will receive.</p>
<h2>Enquiries and quotations</h2>
<p>Information on this site, including HSN codes and typical fabric weights, is for guidance. Prices, quantities, specifications, delivery dates, Incoterms and payment terms are binding only when confirmed in a proforma invoice or written contract. Made to order production starts only after written sample approval.</p>
<h2>Customs and compliance</h2>
<p>We provide the Indian 8 digit HSN code for each line. The import classification, duty and compliance requirements in your country are confirmed by your customs broker or importer of record.</p>
<h2>Content</h2>
<p>Text and design on this site belong to ${SITE.name}. Photography is representative and used under the Unsplash License. Do not reuse our content without permission.</p>
<h2>Contact</h2>
<p>${esc(SITE.address)} · <a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a> · ${esc(SITE.phone)}</p>`);
simple("/404.html", "This page is not on the rack", "Page not found | GoodBiz Apparels", "The page you asked for is not on this site.", `<p>The link may be old or mistyped. Try <a href="/products/">all products</a> or the <a href="/guides/">guides</a>.</p>`, true);

// ================================================================ sitemap, robots, llms.txt
writeFileSync(join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pageList.map((p) => `  <url><loc>${abs(p)}</loc><lastmod>${SITE.updated}</lastmod></url>`).join("\n")}
</urlset>
`);
writeFileSync(join(ROOT, "robots.txt"), `User-agent: *
Content-Signal: search=yes, ai-input=yes, ai-train=yes
Allow: /

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
const SUMMARY = `Garment sourcing and export company in Bengaluru, India, part of the GoodBiz group. Supplies knits, woven garments and jackets for men and kids, made through partner factories in India, either from ready stock or to the buyer's design, size chart, fabric and GSM. ${N} product lines, each with an 8 digit HSN code. Replies within 24 hours, Monday to Saturday.`;
writeFileSync(join(ROOT, "llms.txt"), `# ${SITE.name}

> ${SUMMARY}

Contact: ${SITE.email} · ${SITE.phone} (phone and WhatsApp) · ${abs("/contact/")}

## How to buy
- [All products](${abs("/products/")}): every line with photo, fabric and HSN code
- [Ready stock garments](${abs("/ready-stock-garments/")}): finished pieces, dated stock list on request
- [Made to order / private label](${abs("/private-label-clothing-manufacturer/")}): your design, size chart and GSM, sample before bulk
- [Send an enquiry](${abs("/contact/")})

## Products
${CATEGORIES.map((c) => `- [${c.name}](${abs("/" + c.slug + "/")}) (${c.chapter})\n${famsOf(c.key).map((f) => `  - [${f.name}](${abs(famUrl(f))}): ${f.products.map((p) => `${p.name} (HSN ${p.hsn})`).join("; ")}`).join("\n")}`).join("\n")}

## Reference
- [HSN codes for garments](${abs("/hsn-codes-for-garments/")}): codes checked ${SITE.hsnChecked}, with GST rates
${GUIDES.map((g) => `- [${g.h1}](${abs("/guides/" + g.slug + "/")})`).join("\n")}

## Export markets
${MARKETS.map((m) => `- [${m.name}](${abs("/export/" + m.slug + "/")})`).join("\n")}

## Optional
- [Full text for language models](${abs("/llms-full.txt")})
- [About](${abs("/about/")})
`);
// llms-full.txt: the site's facts as plain Markdown
const text = (html) => String(html).replace(/<li>/g, "\n- ").replace(/<\/(p|tr|h3|ul|ol|table)>/g, "\n").replace(/<t[dh][^>]*>/g, " | ").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/[ \t]+/g, " ").replace(/\n\s*\n\s*\n+/g, "\n\n").trim();
writeFileSync(join(ROOT, "llms-full.txt"), `# ${SITE.name}: full reference

> ${SUMMARY}

Source: ${abs("/")} · Updated ${SITE.updated}

## Company
${SITE.name} is the garment export business of GoodBiz (${SITE.parent.name}, ${SITE.parent.url}), Bengaluru, Karnataka, India. Production runs in partner garment factories in India; GoodBiz Apparels manages the specification, sampling, quality checks, labelling, export documents and shipping. Contact: ${SITE.email}, ${SITE.phone} (phone and WhatsApp).

## Products and HSN codes (checked ${SITE.hsnChecked})
${CATEGORIES.map((c) => `### ${c.name} (${c.chapter})\n${c.intro}\n\n${famsOf(c.key).map((f) => `#### ${f.name}\n${f.intro}\n\n${f.products.map((p) => `- ${p.name}: HSN ${p.hsn}. ${p.spec}. ${p.desc}`).join("\n")}\n\n${f.specs.map(([k, v]) => `- ${k}: ${v}`).join("\n")}`).join("\n\n")}`).join("\n\n")}

## Frequently asked questions
${FAQS.map(([q, a]) => `**${q}** ${a}`).join("\n\n")}

## Export markets
${MARKETS.map((m) => `### ${m.name}\n${m.intro}\n\n${m.points.map(([h, t]) => `**${h}.** ${text(t)}`).join("\n\n")}`).join("\n\n")}

## Guides
${GUIDES.map((g) => `### ${g.h1}\n${g.lead}\n\n${g.sections.map(([h, t]) => `#### ${h}\n${text(t)}`).join("\n\n")}`).join("\n\n")}
`);

// ================================================================ assets
cpSync(ASSETS, join(ROOT, "assets"), { recursive: true });
rmSync(join(ROOT, "assets", "styles.css"));
rmSync(join(ROOT, "assets", "app.js"));
mkdirSync(join(ROOT, "assets", "v"), { recursive: true });
writeFileSync(join(ROOT, CSS_URL), CSS);
writeFileSync(join(ROOT, JS_URL), JS);
console.log(`Built ${pageList.length} indexable pages + landing pages into public/ (v6)`);
