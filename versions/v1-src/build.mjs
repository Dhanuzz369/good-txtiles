// Static site generator for GoodBiz Apparels.
// Usage:  SITE_URL=https://www.yourdomain.com node src/build.mjs
import { mkdirSync, writeFileSync, rmSync, existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE, CATEGORIES, FAMILIES, MARKETS, FAQS } from "./data.mjs";
import { GUIDES } from "./guides.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const isSet = (v) => v && !/^\{\{.*\}\}$/.test(v);
const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const abs = (p) => SITE.url.replace(/\/$/, "") + p;
const catOf = (key) => CATEGORIES.find((c) => c.key === key);
const famUrl = (f) => `/${catOf(f.cat).slug}/${f.slug}/`;
const ALL_PRODUCTS = FAMILIES.flatMap((f) => f.products.map((p) => ({ ...p, family: f, cat: catOf(f.cat) })));
const pageList = []; // for sitemap

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
const breadcrumbSchema = (crumbs) => ({
  "@type": "BreadcrumbList",
  itemListElement: crumbs.map(([name, url], i) => ({ "@type": "ListItem", position: i + 1, name, item: abs(url) })),
});
const faqSchema = (faqs) => ({
  "@type": "FAQPage",
  mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
});

// ---------------------------------------------------------------- partials
const NAV = [
  ["/#catalogue", "Products", "/products"],
  ["/ready-stock-garments/", "Ready stock"],
  ["/private-label-clothing-manufacturer/", "Made to order"],
  ["/export/", "Export markets"],
  ["/guides/", "Guides"],
];

function analytics() {
  if (!SITE.ga4 && !SITE.adsConversion) return "";
  const id = SITE.ga4 || SITE.adsConversion.split("/")[0];
  return `<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());${SITE.ga4 ? `gtag('config','${SITE.ga4}');` : ""}${SITE.adsConversion ? `gtag('config','${SITE.adsConversion.split("/")[0]}');` : ""}</script>`;
}

function head({ title, meta, path, noindex, schema = [], img = "hero-factory.jpg", type = "website" }) {
  const graph = { "@context": "https://schema.org", "@graph": [ORG, ...schema] };
  return `<!doctype html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(meta)}">
<link rel="canonical" href="${abs(path)}">
<meta name="robots" content="${noindex ? "noindex, follow" : "index, follow, max-image-preview:large"}">
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
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css">
<link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/fill/style.css">
<link rel="stylesheet" href="/assets/styles.css">
<script type="application/ld+json">${JSON.stringify(graph)}</script>
${analytics()}
</head>`;
}

function header(path, bare) {
  if (bare) {
    return `<header class="nav-wrap"><nav class="nav nav-bare" aria-label="Main">
<a class="nav-brand" href="/" aria-label="${SITE.name} home"><img src="/assets/favicon.svg" alt="" width="24" height="24"><span class="title-3">${SITE.name}</span></a>
<a class="btn btn-dark button-sm" href="#enquiry">Get a costing</a></nav></header>`;
  }
  const cur = (href) => (href !== "/#catalogue" && path.startsWith(href) ? ' aria-current="page"' : "");
  const links = NAV.map(([h, l]) => `<li><a class="title-4" href="${h}"${cur(h)}>${l}</a></li>`).join("");
  const mlinks = NAV.map(([h, l]) => `<li><a class="heading-5" href="${h}">${l}</a></li>`).join("");
  return `<a class="skip-link" href="#main">Skip to content</a>
<header class="nav-wrap"><nav class="nav" aria-label="Main">
<a class="nav-brand" href="/" aria-label="${SITE.name} home"><img src="/assets/favicon.svg" alt="" width="24" height="24"><span class="title-3">${SITE.name}</span></a>
<ul class="nav-links">${links}</ul>
<a class="btn btn-dark button-sm nav-cta" href="/contact/">Send enquiry</a>
<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Open menu"><span></span><span></span></button>
</nav></header>
<div class="mobile-menu" id="mobile-menu" hidden><ul>${mlinks}<li><a class="btn btn-dark button-md" href="/contact/">Send enquiry</a></li></ul></div>`;
}

function footer(bare) {
  const col = (title, items) => `<div><p class="caption-3 footer-h">${title}</p><ul>${items.map(([h, l]) => `<li><a class="caption-2" href="${h}">${esc(l)}</a></li>`).join("")}</ul></div>`;
  const hub = bare ? "" : `<div class="link-hub">
${CATEGORIES.map((c) => col(c.name, [[`/${c.slug}/`, `All ${c.name.toLowerCase()}`], ...FAMILIES.filter((f) => f.cat === c.key).map((f) => [famUrl(f), f.name])])).join("")}
${col("How to buy", [["/ready-stock-garments/", "Ready stock garments"], ["/private-label-clothing-manufacturer/", "Made to order and private label"], ["/hsn-codes-for-garments/", "HSN codes for garments"], ["/contact/", "Send an enquiry"]])}
${col("Export markets", [["/export/", "All markets"], ...MARKETS.map((m) => [`/export/${m.slug}/`, m.name])])}
${col("Guides", [["/guides/", "All guides"], ...GUIDES.map((g) => [`/guides/${g.slug}/`, g.h1]), ["/about/", "About us"]])}
</div>`;
  return `<footer class="footer"><div class="container">
${hub}
<div class="footer-grid">
<div><a class="nav-brand" href="/"><img src="/assets/favicon.svg" alt="" width="24" height="24"><span class="title-3">${SITE.name}</span></a>
<p class="caption-5 muted footer-addr">${esc(SITE.address)}</p></div>
<ul class="footer-links caption-2"><li><a href="/privacy/">Privacy policy</a></li><li><a href="/terms/">Terms</a></li><li><a href="/sitemap.xml">Sitemap</a></li></ul>
<p class="caption-5 muted footer-credit">Photography from Unsplash, used under the Unsplash License. Last updated ${SITE.updated}.</p>
</div></div></footer>`;
}

function configScript() {
  const pub = { whatsapp: SITE.whatsapp, email: SITE.email, ads: SITE.adsConversion };
  return `<script>window.GB_CONFIG=${JSON.stringify(pub)}</script><script src="/assets/app.js" defer></script>`;
}

const crumbsHtml = (crumbs) => `<nav class="breadcrumbs caption-4" aria-label="Breadcrumb"><ol>${crumbs
  .map(([n, u], i) => (i === crumbs.length - 1 ? `<li aria-current="page">${esc(n)}</li>` : `<li><a href="${u}">${esc(n)}</a></li>`))
  .join("")}</ol></nav>`;

const addBtn = (p) => `<button class="add caption-3" type="button" data-name="${esc(p.name)}" data-hsn="${esc(p.hsn)}" aria-pressed="false" aria-label="Add ${esc(p.name)} to enquiry"><i class="ph ph-plus" aria-hidden="true"></i><span class="button-xsm">Add</span></button>`;

function familyCard(f, { link = true } = {}) {
  const search = [f.name, ...f.products.flatMap((p) => [p.name, p.hsn])].join(" ").toLowerCase();
  return `<article class="family" data-search="${esc(search)}">
<a class="family-media" href="${famUrl(f)}" tabindex="-1" aria-hidden="true"><img src="/assets/img/${f.img}" alt="" loading="lazy" width="1400" height="1050"></a>
<div class="family-body">
<div class="family-head"><h3 class="title-2"><a href="${famUrl(f)}">${esc(f.name)}</a></h3><span class="caption-4 muted">${f.products.length} lines</span></div>
<ul class="items">${f.products.map((p) => `<li data-search="${esc((p.name + " " + p.hsn).toLowerCase())}"><div><span class="item-name body-5">${esc(p.name)}</span><span class="item-hsn caption-5">HSN ${p.hsn}</span></div>${addBtn(p)}</li>`).join("")}</ul>
${link ? `<a class="family-link caption-3" href="${famUrl(f)}">Fabrics, GSM and details <i class="ph ph-arrow-right" aria-hidden="true"></i></a>` : ""}
</div></article>`;
}

function faqHtml(faqs, title = "Questions buyers ask") {
  return `<section class="section section-alt" id="faq" aria-labelledby="faq-title"><div class="container faq-grid">
<div class="reveal"><p class="eyebrow caption-3">FAQ</p><h2 class="heading-3" id="faq-title">${title}</h2><p class="body-6 muted">Anything else? <a class="text-link" href="/contact/">Send us your question</a>.</p></div>
<div class="faq-list reveal">${faqs.map(([q, a]) => `<details><summary class="title-3">${esc(q)}<i class="ph ph-plus" aria-hidden="true"></i></summary><p class="body-6 muted">${esc(a)}</p></details>`).join("")}</div>
</div></section>`;
}

function ctaBand(text = "Send your spec or ask what is in stock. We reply with availability or a production costing.") {
  return `<section class="section"><div class="container"><div class="cta-band reveal">
<div><h2 class="heading-4">Ready to source?</h2><p class="body-6">${text}</p></div>
<a class="btn btn-light button-md" href="/contact/">Send your enquiry <i class="ph ph-arrow-right" aria-hidden="true"></i></a>
</div></div></section>`;
}

function enquiryForm({ heading = "Tell us what you<br> want to source.", source = "website", tag = "h2" } = {}) {
  return `<section class="section" id="enquiry" aria-labelledby="enq-title"><div class="container enq-grid">
<div class="enq-intro reveal">
<p class="eyebrow caption-3">Send your enquiry</p>
<${tag} class="heading-2" id="enq-title">${heading}</${tag}>
<p class="body-6 muted">We reply with stock availability or a production costing. Prefer to talk first? Use WhatsApp or email.</p>
<div class="contact-cards">
<a class="contact-card" href="#" data-whatsapp><i class="ph-fill ph-whatsapp-logo" aria-hidden="true"></i><span><span class="title-4">WhatsApp</span><span class="caption-5 muted">${esc(SITE.whatsapp)}</span></span></a>
<a class="contact-card" href="#" data-email><i class="ph ph-envelope-simple" aria-hidden="true"></i><span><span class="title-4">Email</span><span class="caption-5 muted">${esc(SITE.email)}</span></span></a>
</div></div>
<form class="enq-form reveal" novalidate data-source="${source}">
<div class="field-row">
<div class="field"><label class="title-4" for="f-name">Your name</label><input class="body-6" id="f-name" name="name" required autocomplete="name" data-personal="name"><p class="error caption-5" data-err="name"></p></div>
<div class="field"><label class="title-4" for="f-company">Company</label><input class="body-6" id="f-company" name="company" required autocomplete="organization" data-personal="company"><p class="error caption-5" data-err="company"></p></div>
</div>
<div class="field-row">
<div class="field"><label class="title-4" for="f-email">Work email</label><input class="body-6" id="f-email" name="email" type="email" required autocomplete="email"><p class="error caption-5" data-err="email"></p></div>
<div class="field"><label class="title-4" for="f-country">Destination country and port</label><input class="body-6" id="f-country" name="country" required placeholder="Hamburg, Germany"><p class="error caption-5" data-err="country"></p></div>
</div>
<fieldset class="field"><legend class="title-4">How do you want to buy?</legend>
<div class="choice-row">${["Ready stock", "Made to order", "Both"].map((v) => `<label class="choice"><input type="radio" name="path" value="${v}"><span class="body-5">${v}</span></label>`).join("")}</div>
<p class="error caption-5" data-err="path"></p></fieldset>
<div class="field"><p class="title-4">Products</p><div class="selected" data-selected></div></div>
<div class="field"><label class="title-4" for="f-details">Quantities and spec</label>
<textarea class="body-6" id="f-details" name="details" rows="5" placeholder="For example: 3,000 pcs cotton polo, 220 GSM pique, sizes S to XXL, navy and white, our woven label, 12 pcs per polybag carton."></textarea>
<p class="error caption-5" data-err="details"></p></div>
<p class="caption-5 muted">Have a tech pack or size chart? Attach it to the email that opens next. <a class="text-link" href="/guides/how-to-send-a-tech-pack/">What to include</a></p>
<div class="form-actions">
<button class="btn btn-dark button-md" type="submit">Send enquiry by email <i class="ph ph-paper-plane-tilt" aria-hidden="true"></i></button>
<button class="btn btn-light button-md" type="button" data-send-whatsapp><i class="ph-fill ph-whatsapp-logo" aria-hidden="true"></i> Send on WhatsApp</button>
</div>
<p class="form-status body-5" role="status"></p>
</form></div></section>`;
}

const basket = `<a class="basket" id="basket" href="/contact/" hidden><i class="ph ph-list-checks" aria-hidden="true"></i><span class="button-sm"><span id="basket-count">0</span> in enquiry</span></a>`;

function page({ path, title, meta, body, schema = [], noindex = false, bare = false, img, type, sitemap = true, priority = "0.6" }) {
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
  if (!noindex && sitemap) pageList.push({ path, priority });
}

const pageHero = ({ crumbs, eyebrow, h1, intro, img, alt, actions = true }) => `<section class="page-hero"><div class="container">
${crumbsHtml(crumbs)}
<div class="page-hero-grid">
<div class="reveal">
<p class="eyebrow caption-3">${eyebrow}</p>
<h1 class="heading-2 hero-title">${esc(h1)}</h1>
<p class="body-3 hero-sub answer">${esc(intro)}</p>
${actions ? `<div class="hero-actions"><a class="btn btn-dark button-md" href="/contact/">Send your enquiry <i class="ph ph-arrow-right" aria-hidden="true"></i></a><a class="text-link body-5" href="#products">See products and HSN codes</a></div>` : ""}
</div>
${img ? `<figure class="hero-media reveal"><img src="/assets/img/${img}" alt="${esc(alt)}" width="1400" height="1050" fetchpriority="high"></figure>` : ""}
</div></div></section>`;

// ================================================================ PAGES
rmSync(ROOT, { recursive: true, force: true, filter: undefined });
mkdirSync(ROOT, { recursive: true });

// ---------------------------------------------------------------- HOME
{
  const tabs = CATEGORIES.map((c, i) => `<button class="tab title-4" role="tab" aria-selected="${i === 0}" aria-controls="panel-${c.key}" id="tab-${c.key}" data-cat="${c.key}">${c.name.replace(" clothing", "")}</button>`).join("");
  const panels = CATEGORIES.map((c, i) => `<div class="families" role="tabpanel" id="panel-${c.key}" aria-labelledby="tab-${c.key}" data-count="${FAMILIES.filter((f) => f.cat === c.key).length}"${i ? " hidden" : ""}>
${FAMILIES.filter((f) => f.cat === c.key).map((f) => familyCard(f)).join("")}
</div>`).join("");
  page({
    path: "/",
    priority: "1.0",
    title: "Garment Manufacturer & Exporter in India | GoodBiz Apparels",
    meta: "Men's, women's and kids' clothing manufactured and exported from India. Order ready stock or send your design, size chart and GSM. 38 lines with HSN codes.",
    schema: [{ "@type": "WebSite", "@id": abs("/#website"), url: abs("/"), name: SITE.name, publisher: { "@id": abs("/#org") } }, faqSchema(FAQS)],
    body: `
<section class="hero" id="top"><div class="container hero-grid">
<div class="hero-copy reveal">
<p class="eyebrow caption-3"><i class="ph ph-globe-hemisphere-east" aria-hidden="true"></i> Garment manufacturer and exporter, India</p>
<h1 class="heading-1 hero-title">Garments made to your spec,<br> or shipped from ready stock.</h1>
<p class="body-3 hero-sub answer">GoodBiz Apparels manufactures and exports men's, women's and kids' clothing from India. Send us your design, size chart, fabric and GSM and we produce it, or pick from finished stock and ship sooner.</p>
<div class="hero-actions"><a class="btn btn-dark button-md" href="#enquiry">Send your enquiry <i class="ph ph-arrow-right" aria-hidden="true"></i></a><a class="text-link body-5" href="#catalogue">Browse 38 product lines</a></div>
<ul class="hero-proof caption-1"><li><i class="ph ph-barcode" aria-hidden="true"></i> 8 digit HSN code on every line</li><li><i class="ph ph-t-shirt" aria-hidden="true"></i> Men, women, kids and baby</li></ul>
</div>
<figure class="hero-media reveal"><img src="/assets/img/hero-factory.jpg" alt="Stitching floor with operators at sewing machines and stacks of finished garments" width="1400" height="933" fetchpriority="high">
<figcaption class="hero-chip caption-4"><span class="dot" aria-hidden="true"></span> Stock and custom orders, one shipment</figcaption></figure>
</div></section>

<section class="section" id="buy" aria-labelledby="buy-title"><div class="container">
<div class="section-head reveal"><p class="eyebrow caption-3">Two ways to buy</p><h2 class="heading-2" id="buy-title">Pick from stock,<br> or bring us your tech pack.</h2></div>
<div class="paths">
<article class="path-card reveal"><div class="path-media"><img src="/assets/img/stock-racks.jpg" alt="Finished garments in neutral tones hanging on a rail" loading="lazy" width="1000" height="1500"></div>
<div class="path-body"><span class="tag caption-3"><i class="ph ph-package" aria-hidden="true"></i> Ready stock</span><h3 class="heading-4">Finished garments, ready to dispatch</h3>
<p class="body-6 muted">Tell us the products, sizes and quantities you need. We confirm what is available, send photos and the packing list, and ship.</p>
<ul class="checks body-6"><li><i class="ph ph-check" aria-hidden="true"></i> Faster dispatch than a production run</li><li><i class="ph ph-check" aria-hidden="true"></i> Your own labels and tags on request</li><li><i class="ph ph-check" aria-hidden="true"></i> Photos of the actual lot before you pay</li></ul>
<a class="btn btn-light button-sm" href="/ready-stock-garments/">How ready stock works</a></div></article>
<article class="path-card reveal"><div class="path-media"><img src="/assets/img/custom-sewing.jpg" alt="Operator guiding fabric through an industrial sewing machine" loading="lazy" width="1000" height="1500"></div>
<div class="path-body"><span class="tag caption-3"><i class="ph ph-ruler" aria-hidden="true"></i> Made to order</span><h3 class="heading-4">Your design, sizes, quality and GSM</h3>
<p class="body-6 muted">Send your tech pack or a reference garment. We source the fabric to your GSM, make a sample for approval, then run production.</p>
<ul class="checks body-6"><li><i class="ph ph-check" aria-hidden="true"></i> Fabric matched to the GSM you specify</li><li><i class="ph ph-check" aria-hidden="true"></i> Graded to your size chart</li><li><i class="ph ph-check" aria-hidden="true"></i> Sample approval before bulk production</li></ul>
<a class="btn btn-light button-sm" href="/private-label-clothing-manufacturer/">How made to order works</a></div></article>
</div></div></section>

<section class="tagline" aria-label="What we do"><div class="container">
<p class="heading-2 tagline-text" id="tagline">You send the design, the size chart and the GSM. We send it back stitched, packed and ready for customs.</p>
</div></section>

<section class="section section-alt" id="catalogue" aria-labelledby="cat-title"><div class="container">
<div class="section-head section-head-row reveal"><div><p class="eyebrow caption-3">Export product catalogue</p><h2 class="heading-2" id="cat-title">38 lines, each with<br> its HSN code.</h2></div>
<p class="body-6 muted head-note">Add the lines you want to source. They go straight into your enquiry, codes included. Full list on the <a class="text-link" href="/hsn-codes-for-garments/">HSN codes page</a>.</p></div>
<div class="cat-toolbar reveal"><div class="tabs" role="tablist" aria-label="Product category">${tabs}</div>
<label class="search"><i class="ph ph-magnifying-glass" aria-hidden="true"></i><span class="sr-only">Search by product or HSN code</span><input type="search" id="cat-search" class="body-6" placeholder="Search product or HSN code" autocomplete="off"></label></div>
${panels}
<div class="cat-empty" id="cat-empty" hidden><i class="ph ph-magnifying-glass" aria-hidden="true"></i><p class="title-3">No product matches that search</p><p class="body-6 muted">Try polo, kurta or blazer, or an HSN code such as 6205. Sourcing something not listed? Describe it in the enquiry.</p></div>
<p class="caption-5 muted photo-note">Photos show the product type. Your order follows your spec or the actual stock lot.</p>
</div></section>

<section class="section" aria-labelledby="spec-title"><div class="container spec-grid">
<div class="reveal"><p class="eyebrow caption-3">What you can specify</p><h2 class="heading-3" id="spec-title">Every detail that decides<br> how the garment sells.</h2>
<p class="body-6 muted spec-lead">Give us as much or as little as you have. If you only have a reference garment, we work out the spec with you and confirm it in writing before the sample. Read our <a class="text-link" href="/guides/garment-gsm-guide/">GSM guide</a>.</p></div>
<ul class="spec-list reveal">
<li><i class="ph ph-scales" aria-hidden="true"></i><div><p class="title-3">Fabric and GSM</p><p class="body-6 muted">Cotton, polyester, silk, blends and handloom, weighed to the GSM you set.</p></div></li>
<li><i class="ph ph-ruler" aria-hidden="true"></i><div><p class="title-3">Size chart and fit</p><p class="body-6 muted">Graded to your measurements for your market, from baby sizes up.</p></div></li>
<li><i class="ph ph-palette" aria-hidden="true"></i><div><p class="title-3">Colours and prints</p><p class="body-6 muted">Matched to your Pantone references or a physical swatch.</p></div></li>
<li><i class="ph ph-tag" aria-hidden="true"></i><div><p class="title-3">Labels and trims</p><p class="body-6 muted">Your brand labels, care labels, hang tags, buttons and zips.</p></div></li>
<li><i class="ph ph-package" aria-hidden="true"></i><div><p class="title-3">Packing</p><p class="body-6 muted">Polybag, folding, ratio packing per carton and carton markings.</p></div></li>
<li><i class="ph ph-file-text" aria-hidden="true"></i><div><p class="title-3">Export documents</p><p class="body-6 muted">Invoice and packing list with the HSN code for each line.</p></div></li>
</ul></div></section>

<section class="section section-dark" id="process" aria-labelledby="process-title"><div class="container">
<div class="section-head reveal"><p class="eyebrow caption-3">How an order runs</p><h2 class="heading-2" id="process-title">From enquiry to your port<br> in three steps.</h2></div>
<ol class="steps">
<li class="step reveal"><span class="step-num caption-3">01</span><h3 class="heading-6">Send the enquiry</h3><p class="body-6">Products, quantities, spec or tech pack, and destination. We reply with stock availability or a costing for production.</p></li>
<li class="step reveal"><span class="step-num caption-3">02</span><h3 class="heading-6">Approve stock photos or the sample</h3><p class="body-6">For stock you see the actual lot. For custom orders you approve a physical sample before bulk production starts.</p></li>
<li class="step reveal"><span class="step-num caption-3">03</span><h3 class="heading-6">Production, packing and shipment</h3><p class="body-6">Goods are checked, packed to your carton plan and shipped with the invoice, packing list and HSN codes in order.</p></li>
</ol>
<div class="markets-strip reveal"><p class="caption-3">WE SHIP TO</p><ul>${MARKETS.map((m) => `<li><a class="body-5" href="/export/${m.slug}/">${m.name}</a></li>`).join("")}</ul></div>
<figure class="ship-media reveal"><img src="/assets/img/shipping.jpg" alt="Container vessel being loaded under gantry cranes at a port" loading="lazy" width="1400" height="934"></figure>
</div></section>

<section class="section" aria-labelledby="cred-title"><div class="container">
<div class="section-head reveal"><p class="eyebrow caption-3">Export credentials</p><h2 class="heading-3" id="cred-title">The paperwork buyers ask for first.</h2></div>
<dl class="creds reveal">
<div><dt class="caption-4 muted">Importer Exporter Code (IEC)</dt><dd class="title-2">${esc(SITE.iec)}</dd></div>
<div><dt class="caption-4 muted">GSTIN</dt><dd class="title-2">${esc(SITE.gstin)}</dd></div>
<div><dt class="caption-4 muted">Certifications</dt><dd class="title-2">${esc(SITE.certifications)}</dd></div>
<div><dt class="caption-4 muted">Minimum order</dt><dd class="title-2">${esc(SITE.moq)}</dd></div>
</dl></div></section>

${faqHtml(FAQS, "Before you send<br> the enquiry.")}
${enquiryForm({ source: "home" })}`,
  });
}

// ---------------------------------------------------------------- PILLARS
const pillar = ({ path, eyebrow, title, meta, h1, intro, img, alt, blocks, faqs, service }) => {
  const crumbs = [["Home", "/"], [eyebrow, path]];
  page({
    path, title, meta, img, priority: "0.9",
    schema: [breadcrumbSchema(crumbs), faqSchema(faqs), { "@type": "Service", name: h1, serviceType: service, provider: { "@id": abs("/#org") }, areaServed: ["US", "GB", "EU", "AE", "AU"], description: intro }],
    body: `${pageHero({ crumbs, eyebrow, h1, intro, img, alt })}
<section class="section"><div class="container prose-grid">${blocks}</div></section>
<section class="section section-alt" id="products"><div class="container">
<div class="section-head reveal"><p class="eyebrow caption-3">Product families</p><h2 class="heading-3">Choose a category to see fabrics, GSM and HSN codes.</h2></div>
<div class="cat-links reveal">${CATEGORIES.map((c) => `<a class="cat-link" href="/${c.slug}/"><img src="/assets/img/${c.img}" alt="" loading="lazy"><span class="title-2">${c.name}</span><span class="caption-5 muted">${FAMILIES.filter((f) => f.cat === c.key).reduce((n, f) => n + f.products.length, 0)} lines</span></a>`).join("")}</div>
</div></section>
${faqHtml(faqs)}
${ctaBand()}`,
  });
};

pillar({
  path: "/ready-stock-garments/",
  eyebrow: "Ready stock",
  service: "Wholesale ready stock garments for export",
  title: "Ready Stock Garments for Export from India | Wholesale | GoodBiz",
  meta: "Buy ready stock men's, women's and kids' garments from India for fast dispatch. Photos of the actual lot, your labels on request, export documents with HSN codes.",
  h1: "Ready stock garments for export from India",
  intro: "Ready stock garments are finished pieces already made and packed, so they can ship without waiting for a production run. GoodBiz Apparels holds ready stock across men's, women's and kids' lines and ships it to importers with full export documents.",
  img: "stock-racks.jpg", alt: "Finished garments in neutral tones hanging on a rail",
  blocks: `<div class="prose reveal">
<h2 class="heading-4">How buying ready stock works</h2>
<ol><li><strong>Tell us what you need.</strong> Products, sizes, colours and quantities, plus your destination port.</li><li><strong>We confirm availability.</strong> You get the available quantities by size and colour with photos of the actual lot.</li><li><strong>Labels and packing.</strong> Add your own brand labels and hang tags if you want them, and confirm the carton plan.</li><li><strong>Proforma, payment and dispatch.</strong> We ship with the commercial invoice, packing list and HSN codes.</li></ol>
<h2 class="heading-4">When ready stock is the right choice</h2>
<ul><li>You need goods for a season that starts soon.</li><li>You want to test a product in your market before committing to a production order.</li><li>You are replenishing a line that sold through.</li></ul>
<h2 class="heading-4">Mixing stock with made to order</h2>
<p>You can combine ready stock lines with <a href="/private-label-clothing-manufacturer/">made to order styles</a> in one shipment. The stock lines wait until the production lines are ready, or ship ahead if you prefer.</p>
</div>
<aside class="prose-aside reveal"><p class="caption-3">AT A GLANCE</p><dl>
<dt>Lead time</dt><dd>Ships once availability, payment and documents are confirmed</dd>
<dt>Quantities</dt><dd>Depends on the lot. Tell us what you need</dd>
<dt>Your labels</dt><dd>Available on request</dd>
<dt>Documents</dt><dd>Invoice and packing list with HSN codes</dd></dl></aside>`,
  faqs: [
    ["What is ready stock in garments?", "Ready stock garments are finished, packed pieces already produced, so they can ship without a new production run."],
    ["Can I see the stock before paying?", "Yes. We send photos of the actual lot, with quantities by size and colour, before you pay."],
    ["Can you add my brand labels to ready stock?", "Yes. Send your labels or artwork and we attach them before packing."],
  ],
});

pillar({
  path: "/private-label-clothing-manufacturer/",
  eyebrow: "Made to order",
  service: "Private label and custom clothing manufacturing",
  title: "Private Label Clothing Manufacturer India | GoodBiz",
  meta: "Private label and custom clothing manufacturer in India. We produce to your design, tech pack, size chart, fabric and GSM, with your labels. Sample before bulk.",
  h1: "Private label clothing manufacturer in India",
  intro: "GoodBiz Apparels manufactures garments to the buyer's own design, size chart, fabric and GSM, finished with the buyer's labels. This is made to order, or private label, production: the garment is yours, we make it.",
  img: "custom-sewing.jpg", alt: "Operator guiding fabric through an industrial sewing machine",
  blocks: `<div class="prose reveal">
<h2 class="heading-4">What you send us</h2>
<p>A tech pack if you have one, or a reference garment with notes on what to change. The essentials are the design, size chart, fabric and GSM, colours, labels, packing and quantities. Our <a href="/guides/how-to-send-a-tech-pack/">tech pack checklist</a> covers each item.</p>
<h2 class="heading-4">How production runs</h2>
<ol><li><strong>Spec and costing.</strong> We confirm every detail in writing and send a costing.</li><li><strong>Fabric to your GSM.</strong> We source fabric to the weight and composition you set. See the <a href="/guides/garment-gsm-guide/">GSM guide</a>.</li><li><strong>Sample.</strong> We make a sample to your spec and send photos, measurements and the physical piece.</li><li><strong>Bulk production.</strong> Starts only after your written approval of the sample.</li><li><strong>Inspection and shipment.</strong> Goods are checked against the approved sample, packed to your carton plan and shipped with export documents.</li></ol>
<h2 class="heading-4">Your brand, start to finish</h2>
<p>Woven and printed labels, care and fibre labels, hang tags, branded trims and packaging are produced to your artwork. Nothing carries our name.</p>
</div>
<aside class="prose-aside reveal"><p class="caption-3">AT A GLANCE</p><dl>
<dt>Minimum order</dt><dd>${esc(SITE.moq)}</dd>
<dt>Sample</dt><dd>Always before bulk</dd>
<dt>Fabric</dt><dd>Sourced to your GSM and composition</dd>
<dt>Labels</dt><dd>Yours, to your artwork</dd></dl></aside>`,
  faqs: [
    ["What is a private label clothing manufacturer?", "A manufacturer that produces garments to a buyer's design and specification and labels them with the buyer's brand. The buyer sells them as their own product."],
    ["Do I need a tech pack to start?", "No. A reference garment with written changes is enough. We turn it into a spec sheet for your approval."],
    ["Do you make a sample before bulk?", "Yes. Bulk production starts only after you approve the sample in writing."],
  ],
});

// ---------------------------------------------------------------- CATEGORIES
for (const c of CATEGORIES) {
  const fams = FAMILIES.filter((f) => f.cat === c.key);
  const crumbs = [["Home", "/"], [c.name, `/${c.slug}/`]];
  const faqs = fams.flatMap((f) => f.faqs.slice(0, 1));
  page({
    path: `/${c.slug}/`, title: c.title, meta: c.meta, img: c.img, priority: "0.9",
    schema: [breadcrumbSchema(crumbs), faqSchema(faqs), { "@type": "ItemList", name: c.h1, itemListElement: fams.map((f, i) => ({ "@type": "ListItem", position: i + 1, name: f.name, url: abs(famUrl(f)) })) }],
    body: `${pageHero({ crumbs, eyebrow: c.name, h1: c.h1, intro: c.intro, img: c.img, alt: c.alt })}
<section class="section section-alt" id="products"><div class="container">
<div class="section-head reveal"><p class="eyebrow caption-3">${fams.reduce((n, f) => n + f.products.length, 0)} product lines</p><h2 class="heading-3">${c.name} with HSN codes</h2></div>
<div class="families" data-count="${fams.length}">${fams.map((f) => familyCard(f)).join("")}</div>
</div></section>
<section class="section"><div class="container prose-grid"><div class="prose reveal">${c.body.map((p) => `<p>${esc(p)}</p>`).join("")}
<p>Buying for a specific market? See <a href="/export/">export markets</a>. Need the codes in one table? See <a href="/hsn-codes-for-garments/">HSN codes for garments</a>.</p></div>
<aside class="prose-aside reveal"><p class="caption-3">TWO WAYS TO BUY</p><dl><dt><a href="/ready-stock-garments/">Ready stock</a></dt><dd>Finished pieces, faster dispatch</dd><dt><a href="/private-label-clothing-manufacturer/">Made to order</a></dt><dd>Your design, size chart and GSM</dd></dl></aside></div></section>
${faqHtml(faqs)}
${ctaBand()}`,
  });
}

// ---------------------------------------------------------------- FAMILIES
for (const f of FAMILIES) {
  const c = catOf(f.cat);
  const url = famUrl(f);
  const crumbs = [["Home", "/"], [c.name, `/${c.slug}/`], [f.name, url]];
  const related = FAMILIES.filter((x) => x.cat === f.cat && x !== f);
  page({
    path: url, title: f.title, meta: f.meta, img: f.img, priority: "0.8",
    schema: [breadcrumbSchema(crumbs), faqSchema(f.faqs), { "@type": "ItemList", name: f.h1, itemListElement: f.products.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: `${p.name} (HSN ${p.hsn})`, url: abs(url + "#" + slugify(p.name)) })) }],
    body: `${pageHero({ crumbs, eyebrow: c.name, h1: f.h1, intro: f.intro, img: f.img, alt: f.alt })}
<section class="section section-alt" id="products"><div class="container">
<div class="section-head reveal"><p class="eyebrow caption-3">${f.products.length} lines</p><h2 class="heading-3">Products and HSN codes</h2></div>
<div class="product-grid">${f.products.map((p) => `<article class="product reveal" id="${slugify(p.name)}">
<div class="product-top"><h3 class="title-1">${esc(p.name)}</h3>${addBtn(p)}</div>
<p class="product-hsn caption-3">HSN ${p.hsn}</p>
<p class="body-6 muted">${esc(p.desc)}</p>
<p class="caption-4 product-ways"><span><i class="ph ph-package" aria-hidden="true"></i> Ready stock</span><span><i class="ph ph-ruler" aria-hidden="true"></i> Made to order</span></p>
</article>`).join("")}</div>
</div></section>
<section class="section"><div class="container prose-grid">
<div class="prose reveal"><h2 class="heading-4">About this range</h2>${f.body.map((p) => `<p>${esc(p)}</p>`).join("")}
<h2 class="heading-4">Specification options</h2>
<table><tbody>${f.specs.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</tbody></table>
<p class="caption-5 muted">Fabric weights are typical industry ranges. We produce to the GSM you specify. <a href="/guides/garment-gsm-guide/">How to choose GSM</a>.</p></div>
<aside class="prose-aside reveal"><p class="caption-3">MORE ${esc(c.name.toUpperCase())}</p><ul class="related">${related.map((r) => `<li><a class="body-5" href="${famUrl(r)}">${esc(r.name)}</a></li>`).join("")}<li><a class="body-5" href="/${c.slug}/">All ${esc(c.name.toLowerCase())}</a></li></ul>
<p class="caption-3" style="margin-top:var(--s-400)">EXPORTING TO</p><ul class="related">${MARKETS.map((m) => `<li><a class="body-5" href="/export/${m.slug}/">${m.name}</a></li>`).join("")}</ul></aside>
</div></section>
${faqHtml(f.faqs)}
${ctaBand(`Add the lines you need from this range to your enquiry and we reply with stock availability or a costing.`)}`,
  });
}

// ---------------------------------------------------------------- HSN HUB
{
  const crumbs = [["Home", "/"], ["HSN codes for garments", "/hsn-codes-for-garments/"]];
  const faqs = [
    ["What is an HSN code for garments?", "HSN (Harmonized System of Nomenclature) codes classify goods for customs and tax. Garments fall in chapter 61 if knitted and chapter 62 if woven. India uses 8 digit codes; the first 6 digits are shared internationally."],
    ["What is the difference between chapter 61 and chapter 62?", "Chapter 61 covers knitted or crocheted garments such as T shirts and leggings. Chapter 62 covers woven garments such as shirts, trousers, jeans, dresses and blazers."],
    ["What is the HSN code for cotton T shirts?", "Cotton T shirts are invoiced under 61091000 in our catalogue, for men, women and kids."],
    ["What HSN code applies to babies' garments?", "Babies' garments use heading 6209: 62092000 for cotton, 62093000 for synthetic fibres and 62099090 for other textiles. Babies' garments are for children of a body height not exceeding 86 cm."],
  ];
  const rows = CATEGORIES.map((c) => `<tbody><tr class="group"><th colspan="3" scope="colgroup">${c.name}</th></tr>${ALL_PRODUCTS.filter((p) => p.cat === c)
    .map((p) => `<tr><td><a href="${famUrl(p.family)}#${slugify(p.name)}">${esc(p.name)}</a></td><td class="hsn">${p.hsn}</td><td>${p.hsn.startsWith("61") ? "Knitted (ch. 61)" : "Woven (ch. 62)"}</td></tr>`).join("")}</tbody>`).join("");
  page({
    path: "/hsn-codes-for-garments/", priority: "0.8",
    title: "HSN Codes for Garments: Shirts, T Shirts, Jeans, Dresses, Babywear",
    meta: "8 digit HSN codes for 38 garment lines: shirts, T shirts, polos, jeans, trousers, jackets, blouses, dresses, kurta sets, leggings, babywear and kidswear.",
    schema: [breadcrumbSchema(crumbs), faqSchema(faqs)],
    type: "article",
    body: `${pageHero({ crumbs, eyebrow: "Reference", h1: "HSN codes for garments", intro: "These are the 8 digit HSN codes GoodBiz Apparels uses on export invoices for 38 garment lines. Knitted garments fall in chapter 61 and woven garments in chapter 62. Your country's import tariff code is confirmed by your customs broker.", actions: false })}
<section class="section"><div class="container"><div class="prose prose-wide reveal">
<table class="hsn-table"><thead><tr><th>Product</th><th>HSN code</th><th>Construction</th></tr></thead>${rows}</table>
<h2 class="heading-4">How to read a garment HSN code</h2>
<p>Take 62052090 as an example. <strong>62</strong> is the chapter (woven apparel). <strong>6205</strong> is the heading (men's or boys' shirts). <strong>620520</strong> is the internationally shared subheading (of cotton). The last two digits, <strong>90</strong>, are India's national split.</p>
<p>Because the first six digits are shared by most customs systems worldwide, they give your broker a reliable starting point. The final import code and duty rate come from your own country's tariff.</p>
<p>See also: <a href="/guides/importing-garments-from-india/">how to import garments from India</a>.</p>
</div></div></section>
${faqHtml(faqs)}
${ctaBand()}`,
  });
}

// ---------------------------------------------------------------- EXPORT
{
  const crumbs = [["Home", "/"], ["Export markets", "/export/"]];
  page({
    path: "/export/", priority: "0.7",
    title: "Garment Export Markets: USA, UK, Europe, UAE, Australia | GoodBiz",
    meta: "GoodBiz Apparels exports garments from India to the USA, UK, EU, UAE and Australia. Labelling, trade agreements and documents for each market.",
    schema: [breadcrumbSchema(crumbs)],
    body: `${pageHero({ crumbs, eyebrow: "Export markets", h1: "Where we export garments from India", intro: "GoodBiz Apparels ships ready stock and made to order garments from India to importers in the United States, United Kingdom, European Union, UAE and GCC, and Australia. Each market has its own labelling rules and trade terms.", actions: false })}
<section class="section"><div class="container"><div class="market-grid">${MARKETS.map((m) => `<a class="market-card reveal" href="/export/${m.slug}/"><span class="title-1">${m.name}</span><span class="body-6 muted">${esc(m.intro)}</span><span class="caption-3">Labelling, tariffs and documents <i class="ph ph-arrow-right" aria-hidden="true"></i></span></a>`).join("")}</div></div></section>
${ctaBand()}`,
  });
  for (const m of MARKETS) {
    const cr = [...crumbs, [m.name, `/export/${m.slug}/`]];
    const faqs = [
      [`Can you ship garments from India to ${m.name === "UAE and GCC" ? "the UAE" : m.name === "United States" ? "the USA" : m.name === "European Union" ? "Europe" : m.name === "United Kingdom" ? "the UK" : m.name}?`, `Yes. We ship ready stock and made to order garments with the commercial invoice, packing list and HSN codes your broker needs.`],
      ["Who confirms the import duty?", "Your customs broker classifies the goods under your country's tariff. We provide the Indian 8 digit HSN code for each line as a starting point."],
    ];
    page({
      path: `/export/${m.slug}/`, title: m.title, meta: m.meta, priority: "0.7",
      schema: [breadcrumbSchema(cr), faqSchema(faqs)],
      body: `${pageHero({ crumbs: cr, eyebrow: "Export market", h1: m.h1, intro: m.intro, img: "shipping.jpg", alt: "Container vessel being loaded at a port" })}
<section class="section"><div class="container prose-grid"><div class="prose reveal">
${m.points.map(([h, t]) => `<h2 class="heading-4">${esc(h)}</h2><p>${esc(t)}</p>`).join("")}
<p class="caption-5 muted">This is general guidance, not legal or customs advice. Rules change; confirm current requirements with your customs broker.</p>
</div>
<aside class="prose-aside reveal"><p class="caption-3">POPULAR LINES FOR ${esc(m.name.toUpperCase())}</p><ul class="related">${FAMILIES.slice(0).filter((_, i) => [0, 1, 2, 4, 5, 7, 9].includes(i)).map((f) => `<li><a class="body-5" href="${famUrl(f)}">${esc(f.name)}</a></li>`).join("")}</ul>
<p class="caption-3" style="margin-top:var(--s-400)">OTHER MARKETS</p><ul class="related">${MARKETS.filter((x) => x !== m).map((x) => `<li><a class="body-5" href="/export/${x.slug}/">${x.name}</a></li>`).join("")}</ul></aside>
</div></section>
<section class="section section-alt" id="products"><div class="container">
<div class="section-head reveal"><h2 class="heading-3">Categories we ship to ${esc(m.name)}</h2></div>
<div class="cat-links reveal">${CATEGORIES.map((c) => `<a class="cat-link" href="/${c.slug}/"><img src="/assets/img/${c.img}" alt="" loading="lazy"><span class="title-2">${c.name}</span></a>`).join("")}</div></div></section>
${faqHtml(faqs)}
${ctaBand()}`,
    });
  }
}

// ---------------------------------------------------------------- GUIDES
{
  const crumbs = [["Home", "/"], ["Guides", "/guides/"]];
  page({
    path: "/guides/", priority: "0.6",
    title: "Garment Sourcing Guides for Importers | GSM, Tech Packs, HSN",
    meta: "Practical guides for buyers sourcing clothing from India: fabric GSM, writing a tech pack, importing step by step and HSN codes for garments.",
    schema: [breadcrumbSchema(crumbs)],
    body: `${pageHero({ crumbs, eyebrow: "Guides", h1: "Garment sourcing guides for importers", intro: "Plain answers to the questions buyers ask before placing a garment order with an Indian manufacturer: fabric weight, tech packs, import steps and customs codes.", actions: false })}
<section class="section"><div class="container"><div class="market-grid">
${[...GUIDES.map((g) => [`/guides/${g.slug}/`, g.h1, g.lead]), ["/hsn-codes-for-garments/", "HSN codes for garments", "The 8 digit codes for 38 garment lines, and how to read them."]].map(([u, t, d]) => `<a class="market-card reveal" href="${u}"><span class="title-1">${esc(t)}</span><span class="body-6 muted">${esc(d)}</span><span class="caption-3">Read the guide <i class="ph ph-arrow-right" aria-hidden="true"></i></span></a>`).join("")}
</div></div></section>${ctaBand()}`,
  });
  for (const g of GUIDES) {
    const cr = [...crumbs, [g.h1, `/guides/${g.slug}/`]];
    page({
      path: `/guides/${g.slug}/`, title: g.title, meta: g.meta, type: "article", priority: "0.6",
      schema: [breadcrumbSchema(cr), faqSchema(g.faqs), { "@type": "Article", headline: g.h1, description: g.meta, dateModified: SITE.updated, author: { "@id": abs("/#org") }, publisher: { "@id": abs("/#org") }, mainEntityOfPage: abs(`/guides/${g.slug}/`) }],
      body: `${pageHero({ crumbs: cr, eyebrow: "Guide", h1: g.h1, intro: g.lead, actions: false })}
<section class="section"><div class="container"><article class="prose prose-wide reveal">
<p class="caption-5 muted">Updated ${SITE.updated} by the ${SITE.name} sourcing team</p>
${g.sections.map(([h, html]) => `<h2 class="heading-4">${h}</h2>${html}`).join("\n")}
</article></div></section>
${faqHtml(g.faqs)}
${ctaBand()}`,
    });
  }
}

// ---------------------------------------------------------------- ABOUT / CONTACT
{
  const crumbs = [["Home", "/"], ["About", "/about/"]];
  page({
    path: "/about/", priority: "0.5",
    title: "About GoodBiz Apparels | Garment Manufacturer & Exporter, India",
    meta: "About GoodBiz Apparels, a garment manufacturer and exporter in India supplying importers with ready stock and made to order clothing.",
    schema: [breadcrumbSchema(crumbs), { "@type": "AboutPage", about: { "@id": abs("/#org") } }],
    body: `${pageHero({ crumbs, eyebrow: "About", h1: "About GoodBiz Apparels", intro: "GoodBiz Apparels is a garment manufacturer and exporter based in India. We supply importers, brands and retailers with men's, women's and kids' clothing, from ready stock or made to their own design, size chart and GSM.", img: "hero-factory.jpg", alt: "Stitching floor with operators at sewing machines", actions: false })}
<section class="section"><div class="container prose-grid"><div class="prose reveal">
<h2 class="heading-4">Who we are</h2><p>{{Company story: when you started, who runs it, and why buyers work with you.}}</p>
<h2 class="heading-4">Where we make garments</h2><p>{{Factory location, production capacity per month, number of machines and staff, in house versus partner processes.}}</p>
<h2 class="heading-4">Quality and compliance</h2><p>{{Inspection process, certifications held, social compliance audits.}}</p>
</div><aside class="prose-aside reveal"><p class="caption-3">COMPANY DETAILS</p><dl>
<dt>Legal name</dt><dd>${esc(SITE.legalName)}</dd><dt>IEC</dt><dd>${esc(SITE.iec)}</dd><dt>GSTIN</dt><dd>${esc(SITE.gstin)}</dd><dt>Founded</dt><dd>${esc(SITE.founded)}</dd><dt>Address</dt><dd>${esc(SITE.address)}</dd></dl></aside></div></section>
${ctaBand()}`,
  });
  const cc = [["Home", "/"], ["Contact", "/contact/"]];
  page({
    path: "/contact/", priority: "0.7",
    title: "Contact GoodBiz Apparels | Garment Export Enquiry",
    meta: "Send a garment sourcing enquiry to GoodBiz Apparels. Ready stock or made to order. Reply with availability or a production costing. WhatsApp or email.",
    schema: [breadcrumbSchema(cc), { "@type": "ContactPage", about: { "@id": abs("/#org") } }],
    body: `<div class="container contact-top">${crumbsHtml(cc)}</div>
${enquiryForm({ heading: "Send your garment<br> sourcing enquiry.", source: "contact", tag: "h1" })}
${faqHtml(FAQS.slice(0, 4))}`,
  });
}

// ---------------------------------------------------------------- LANDING PAGES (noindex)
function lpBody({ eyebrow, h1, sub, source, personal }) {
  return `<section class="hero lp-hero"><div class="container hero-grid">
<div class="hero-copy">
<p class="eyebrow caption-3">${eyebrow}</p>
${personal ? `<p class="body-2 lp-greet" data-greet hidden></p>` : ""}
<h1 class="heading-1 hero-title">${h1}</h1>
<p class="body-3 hero-sub">${sub}</p>
<ul class="checks body-5 lp-checks"><li><i class="ph ph-check" aria-hidden="true"></i> Ready stock or made to your design, size chart and GSM</li><li><i class="ph ph-check" aria-hidden="true"></i> Sample approval before bulk production</li><li><i class="ph ph-check" aria-hidden="true"></i> Your labels, and HSN codes on every invoice line</li><li><i class="ph ph-check" aria-hidden="true"></i> Men's, women's, kids and babywear, 38 lines</li></ul>
<a class="btn btn-dark button-md" href="#enquiry">Get a costing <i class="ph ph-arrow-down" aria-hidden="true"></i></a>
</div>
<figure class="hero-media"><img src="/assets/img/hero-factory.jpg" alt="Stitching floor with operators at sewing machines" width="1400" height="933" fetchpriority="high"></figure>
</div></section>
<section class="section section-alt"><div class="container">
<div class="section-head"><h2 class="heading-3">What we make</h2></div>
<div class="cat-links">${CATEGORIES.map((c) => `<div class="cat-link"><img src="/assets/img/${c.img}" alt="" loading="lazy"><span class="title-2">${c.name}</span><span class="caption-5 muted">${FAMILIES.filter((f) => f.cat === c.key).map((f) => f.name.replace(/^(Men's|Women's) /, "")).join(", ")}</span></div>`).join("")}</div>
</div></section>
${enquiryForm({ heading: "Tell us what you<br> want to source.", source })}
${faqHtml(FAQS.slice(0, 5))}`;
}
page({
  path: "/lp/garment-manufacturer/", noindex: true, bare: true, sitemap: false,
  title: "Garment Manufacturer in India | Get a Costing | GoodBiz Apparels",
  meta: "Clothing made to your spec or shipped from ready stock. Send your enquiry for a costing.",
  body: lpBody({ eyebrow: "Garment manufacturer and exporter, India", h1: "Your garments, made to spec<br> or shipped from stock.", sub: "Send your design, size chart and GSM, or ask what is in stock. We reply with availability or a production costing.", source: "ads" }),
});
page({
  path: "/lp/sourcing/", noindex: true, bare: true, sitemap: false,
  title: "Garment Sourcing from India | GoodBiz Apparels",
  meta: "A short introduction to GoodBiz Apparels for buyers we have contacted by email.",
  body: lpBody({ eyebrow: "Following up on our email", h1: "A second supplier for your<br> garment range, in India.", sub: "Send one style you source today, with its spec or a photo. We come back with a costing, or with matching ready stock if we hold it.", source: "email", personal: true }),
});

// ---------------------------------------------------------------- LEGAL + 404
const simple = (path, h1, html, noindex = false) =>
  page({ path, noindex, sitemap: !noindex, priority: "0.2", title: `${h1} | ${SITE.name}`, meta: `${h1} for ${SITE.name}, a garment manufacturer and exporter in India supplying ready stock and made to order clothing to importers.`, body: `<section class="section page-simple"><div class="container prose prose-wide"><h1 class="heading-3">${h1}</h1>${html}<p><a class="btn btn-dark button-md" href="/">Back to the home page</a></p></div></section>` });
simple("/privacy/", "Privacy policy", `<p>{{privacy policy text}}</p><p>This site does not store enquiry details on a server. The enquiry form opens your own email app or WhatsApp with the message filled in, and nothing is sent until you send it there. Products you add to an enquiry are kept only in your own browser.</p>`);
simple("/terms/", "Terms", `<p>{{terms of use and trade terms}}</p><p>Prices, quantities and delivery dates are confirmed only in a proforma invoice.</p>`);
simple("/404.html", "This page is not on the rack", `<p>The link may be old or mistyped. Try the <a href="/#catalogue">product catalogue</a> or the <a href="/guides/">guides</a>.</p>`, true);

// ---------------------------------------------------------------- sitemap, robots, llms.txt
writeFileSync(join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pageList.map((p) => `  <url><loc>${abs(p.path)}</loc><lastmod>${SITE.updated}</lastmod></url>`).join("\n")}
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

> Garment manufacturer and exporter in India. Supplies importers, brands and retailers with men's, women's and kids' clothing, either from ready stock or made to the buyer's design, size chart, fabric and GSM. 38 product lines, each with an 8 digit HSN code.

## How to buy
- [Ready stock garments](${abs("/ready-stock-garments/")}): finished pieces, faster dispatch
- [Made to order / private label](${abs("/private-label-clothing-manufacturer/")}): your design, size chart and GSM, sample before bulk
- [Send an enquiry](${abs("/contact/")})

## Products
${CATEGORIES.map((c) => `- [${c.name}](${abs("/" + c.slug + "/")})\n${FAMILIES.filter((f) => f.cat === c.key).map((f) => `  - [${f.name}](${abs(famUrl(f))}): ${f.products.map((p) => `${p.name} (HSN ${p.hsn})`).join("; ")}`).join("\n")}`).join("\n")}

## Reference
- [HSN codes for garments](${abs("/hsn-codes-for-garments/")})
${GUIDES.map((g) => `- [${g.h1}](${abs("/guides/" + g.slug + "/")})`).join("\n")}

## Export markets
${MARKETS.map((m) => `- [${m.name}](${abs("/export/" + m.slug + "/")})`).join("\n")}
`);

function slugify(s) { return s.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

// copy static assets back (rmSync cleared them) — assets live in src/assets
import("node:fs").then(({ cpSync }) => {
  cpSync(join(ROOT, "..", "src", "assets"), join(ROOT, "assets"), { recursive: true });
  console.log(`Built ${pageList.length} indexable pages + landing pages into public/`);
});
