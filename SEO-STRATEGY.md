# GoodBiz Apparels: SEO, AEO and GEO strategy

Updated 2026-11-04 (v5: knits, woven and jackets; women's wear, blazers and suits removed; Africa added). Covers organic search (SEO), answer engines and featured answers (AEO), AI search citations in Google AI Overviews and AI Mode, ChatGPT, Perplexity and Gemini (GEO), and the landing pages for Google Ads and cold email.

## 1. Positioning

**Who searches:** importers, brand owners, wholesalers and retail buyers in the USA, UK, EU, UAE/GCC and Australia looking for an Indian garment manufacturer. They search by product + "manufacturer" / "exporter" / "private label" + "India", and they ask practical questions (GSM, HSN codes, tech packs, how to import).

**What makes GoodBiz different on the page:** two ways to buy (ready stock *and* made to order, mixable in one shipment) and an 8 digit HSN code on every product. Few competitor sites publish codes, which makes them a reason for buyers and AI engines to cite this site.

## 2. Site architecture (30 indexable pages)

GoodBiz makes three constructions only, so the catalogue is organised the way buyers and customs brokers think: **knits** (HS chapter 61), **woven** (HS chapter 62) and **outerwear** (cotton and polyester jackets). Men's and kids' are a filter, not separate sections. Women's wear, blazers and suits have been removed: 21 lines in total.

```
/                                         Home: hero, product circles, constructions, catalogue, enquiry
├── /products/                            Full catalogue: 21 lines with colourway photos, filters, quote basket
├── /knits/                               Construction hub (ch. 61)
│   ├── t-shirts-polos/                   Men's cotton and polyester T shirts, cotton polos
│   └── kids-t-shirts/                    Kids cotton T shirts
├── /woven/                               Construction hub (ch. 62)
│   ├── shirts/                           Men's formal, handloom, polyester, silk shirts
│   ├── trousers-jeans-shorts/            Men's trousers, jeans, polyester trousers, shorts
│   ├── baby-garments/                    Baby cotton, synthetic, other textile garments
│   └── kidswear/                         Kids shirts, boys trousers, girls dresses, kids shorts
├── /outerwear/
│   └── jackets/                          Men's cotton jackets, polyester jackets
├── /ready-stock-garments/  /private-label-clothing-manufacturer/
├── /hsn-codes-for-garments/              Reference hub (AEO + GEO magnet)
├── /export/                              usa/ uk/ europe/ uae/ africa/ australia/
├── /guides/                              garment-gsm-guide/ how-to-send-a-tech-pack/ importing-garments-from-india/
├── /about/  /contact/  /privacy/  /terms/
└── /lp/  (noindex)                       garment-manufacturer/ (ads), sourcing/ (cold email)
```

Every product line has its own anchored card (for example `/woven/shirts/#mens-silk-shirts`) with a colourway photo, and the `/products/` page lists all 21 with `ItemList` schema including image URLs. If Search Console shows demand for a single line, it can be split into its own page later.

The site has not launched, so the old women's and men's/kids' URLs need no redirects. If any of them were ever shared publicly, add 301s from `/mens-clothing-manufacturer/*` and `/kids-clothing-manufacturer/*` to the new paths.

## 3. Keyword map

| Page | Primary target | Supporting | Intent |
|---|---|---|---|
| / | garment manufacturer and exporter in India | clothing manufacturer India for export | Commercial |
| /products/ | garment export catalogue India | knits woven outerwear manufacturer, apparel manufacturing India bulk | Commercial |
| /knits/ | knitted garments manufacturer India | knitwear exporter India, hosiery garments exporter | Commercial |
| /knits/t-shirts-polos/ | t shirt manufacturer India | polo shirt manufacturer India, private label t shirts | Commercial |
| /knits/kids-t-shirts/ | kids t shirt manufacturer India | children's t shirts exporter | Commercial |
| /woven/ | woven garments manufacturer India | woven apparel exporter India | Commercial |
| /woven/shirts/ | shirt manufacturer India export | cotton shirt exporter, handloom shirts exporter, silk shirt manufacturer | Commercial |
| /woven/trousers-jeans-shorts/ | jeans manufacturer India | chino trousers manufacturer, men's shorts exporter | Commercial |
| /woven/baby-garments/ | baby clothes manufacturer India | babywear exporter India | Commercial |
| /woven/kidswear/ | kidswear manufacturer India | kids clothing exporter India, girls dresses manufacturer | Commercial |
| /outerwear/ | jacket manufacturer India | outerwear manufacturer India export | Commercial |
| /outerwear/jackets/ | bomber jacket manufacturer India | utility jacket manufacturer, windcheater manufacturer | Commercial |
| /private-label-clothing-manufacturer/ | private label clothing manufacturer India | custom clothing manufacturer, OEM garment manufacturer | Commercial |
| /ready-stock-garments/ | ready stock garments India | stock lot garments export, wholesale garments India export | Commercial |
| /hsn-codes-for-garments/ | hsn code for garments | hsn code for t shirt, hsn code for cotton shirt, hsn code for jeans | Informational |
| /guides/* | t shirt gsm guide; tech pack for clothing manufacturer; import clothing from India | | Informational |
| /export/* | garment exporter India to USA / UK / Europe / UAE / Africa / Australia | clothing supplier India to South Africa, Kenya, Nigeria | Commercial |

## 4. On page and technical (built in)

- Every page is static HTML. Products, codes and FAQs are in the source, not drawn by JavaScript, so Google, Bing and AI crawlers read everything.
- Unique title (≤ 60 to 70 chars), meta description, one H1, canonical, Open Graph, and breadcrumbs on every page.
- JSON-LD: `Organization` site wide; `WebSite` (home); `BreadcrumbList` (all inner pages); `ItemList` (category and family pages); `Service` (pillars); `Article` (guides); `FAQPage` (pages with FAQs); `AboutPage`, `ContactPage`.
  - No `Product` schema: without price/offers/reviews it produces Search Console warnings and no rich result. Add it later only if you publish prices.
  - Google stopped showing FAQ rich results for most sites, but FAQPage markup still structures question and answer content for AI engines. It costs nothing.
- `sitemap.xml` (30 URLs, lastmod), `robots.txt` (allows GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot, Google-Extended; blocks `/lp/`), `llms.txt` (a site summary for AI engines).
- Internal linking: footer link hub on every page; family pages link to siblings, category, GSM guide and markets; guides link to HSN hub and pillars; home links to every pillar and family.
- Images compressed to ≤ 1200 px (2.2 MB total); lazy loading below the fold; hero image `fetchpriority="high"`.
- Mobile checked at 390 px with no sideways scrolling.

## 5. AEO / GEO playbook

1. **Answer first paragraphs.** Every page opens with a 2 to 3 sentence answer that can be quoted as is ("We manufacture men's woven shirts for export in four fabric groups…").
2. **Tables for facts.** HSN codes, GSM ranges, documents and spec options are in HTML tables, which AI engines quote reliably.
3. **Entity consistency.** Use the same company name, city, IEC and description everywhere: site, Google Business Profile, LinkedIn, IndiaMART, Alibaba, Kompass, Europages, trade fair listings. AI engines check claims against these sources.
4. **Fill the E-E-A-T gaps.** Fill the About page placeholders with the real factory, capacity, people, certifications and audits. Add real photos of your floor and products. These matter more for B2B trust than anything else on this list.
5. **Freshness.** Update `SITE.updated` and rebuild when content changes. The date shows on guides and in the sitemap.

## 6. Paid ads: `/lp/garment-manufacturer/`

- Not indexed, no navigation (one action only), form right after the first screen, the same promise as the ad.
- Campaign tags (`utm_*`, `gclid`) are captured and printed into every enquiry, so you can see which campaign produced which lead without a backend.
- Set `ga4` and `adsConversion` in `src/data.mjs` to fire `generate_lead` and the Ads conversion when the form opens email or WhatsApp.
- Starting keyword themes (phrase or exact match): *garment manufacturer India*, *private label clothing manufacturer India*, *t shirt manufacturer India*, *knitted garments exporter India*, *woven shirts manufacturer*, *clothing supplier India wholesale*. Target the export countries only.
- Negative keywords from day one: *jobs, vacancy, salary, course, pdf, list of, near me, retail, buy online, amazon, myntra, small quantity, single piece*.
- Final URL example: `https://YOURDOMAIN/lp/garment-manufacturer/?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_term={keyword}`

## 7. Cold email: `/lp/sourcing/`

- Personalised by URL: `/lp/sourcing/?name=Lena&company=Nordtex%20Handel&utm_source=email&utm_campaign=eu-q1`. The page greets the buyer and pre-fills the form.
- Not indexed. Link to it once per email, as plain text with a clear URL, not a tracking redirect, which helps deliverability.
- Send email from a separate subdomain or domain with SPF, DKIM and DMARC set up, warm it up, and keep volumes low per inbox. This protects the main domain's reputation.

## 8. Launch checklist

1. Choose the domain and build with `SITE_URL=https://www.yourdomain.com node src/build.mjs`.
2. Replace every `{{…}}` in `src/data.mjs` and the About, Privacy and Terms copy.
3. **Check two HSN codes with your customs agent before publishing** (see section 10).
4. Deploy `public/` to any static host (Cloudflare Pages, Netlify or Vercel are free and fast). Serve `404.html` for unknown URLs.
5. Verify in Google Search Console and Bing Webmaster Tools; submit `sitemap.xml`. Bing also feeds ChatGPT search.
6. Create or claim the Google Business Profile with the same name, address and phone (NAP).
7. Add GA4 and the Google Ads conversion IDs.
8. Replace stock photos with real product and factory photos as they become available.

## 9. Roadmap and KPIs

No baseline data exists yet (new domain), so the targets below are milestones rather than traffic forecasts.

| Phase | When | Work | Milestone |
|---|---|---|---|
| 1. Foundation | Weeks 1 to 4 | Launch checklist, directory listings, GBP, LinkedIn page | All 30 URLs indexed in GSC; first impressions on HSN and guide queries |
| 2. Expansion | Weeks 5 to 12 | 2 guides a month (ideas below); real photos; first case study | Product family pages receiving impressions for "<product> manufacturer India" |
| 3. Scale | Months 4 to 6 | Split out single products that show demand in GSC; add more market pages (Canada, Saudi Arabia) only with distinct content | First organic enquiries; site cited in at least one AI engine for HSN or GSM questions |
| 4. Authority | Months 7 to 12 | Trade press, export council and fair listings; buyer testimonials (real only) | Steady organic enquiries; branded search growth |

**Track monthly:** indexed pages, impressions and clicks by page group (families, guides, HSN, markets), enquiries by `form:` source and `utm_campaign` (printed in each enquiry), and AI citations (check ChatGPT, Perplexity and Google AI Mode for your target questions).

**Next guides to write:** cotton vs polyester for uniforms; denim weights explained; private label vs white label; how sampling works and what it costs; carton packing and ratio packing explained; garment inspection AQL explained; Incoterms for garment buyers in detail.

## 10. Data points to check before launch

- **Baby garments, 6209.** Heading 6209 is babies' garments *not knitted*. Bodysuits and rompers in jersey or interlock are usually knitted, which is heading **6111**. Keep 6209 for woven babywear and check with your agent whether knitted baby lines need 6111.

- **Men's cotton polo shirts, 61091000.** Internationally, knitted shirts with a collar and buttoned placket (polos) are usually classified under heading **6105** (men's knitted shirts), not 6109 (T shirts). Cotton polos are commonly 61051010 or 61051090 in India.

The site shows the codes exactly as supplied. Confirm both with your customs agent and edit `src/data.mjs` if they change.

## 11. Not done (needs data or access)

- Competitor and SERP analysis with real search volumes. This needs a keyword tool (DataForSEO, Ahrefs or Semrush) or Search Console data after launch.
- Backlink building, directory submissions and the Google Business Profile, which need the business's own accounts.
