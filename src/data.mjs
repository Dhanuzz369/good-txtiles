// ------------------------------------------------------------------
// GoodBiz Apparels: site content model (v6: knits · woven · outerwear)
// Every {{...}} value is a fact only the business can supply; it stays
// hidden on the site until it is filled in.
// ------------------------------------------------------------------

export const SITE = {
  // Canonical domain. Set explicitly: Vercel's VERCEL_PROJECT_PRODUCTION_URL can pick the bare
  // domain, which only redirects to www. Override with SITE_URL for another domain.
  url: (process.env.SITE_URL || "https://www.gbizclothing.com").replace(/\/$/, ""),
  name: "GoodBiz Apparels",
  legalName: "{{legal company name}}",
  parent: { name: "GoodBiz Global", url: "https://goodbizglobal.com/" }, // group company
  city: "Bengaluru",
  country: "India",
  whatsapp: "918884799369",          // digits only, with country code
  email: "clothing@goodbizglobal.com", // apparel inbox; also NOTIFY_EMAIL in tools/enquiry-sheet.gs
  phone: "+91 88847 99369",
  phoneHref: "+918884799369",
  phoneIntl: "+91-88847-99369",      // schema.org format
  region: "Karnataka",
  formEndpoint: process.env.FORM_ENDPOINT || "https://script.google.com/macros/s/AKfycby6os0UmMWnCKps_XyuDVEjMWdqcU1Dfw_0YMdcAJLhnjx1AzjxJZTUsYQ9Zi6mWT4IQg/exec", // "Apparels leads" Google Sheet web app (tools/enquiry-sheet.gs); empty = send by email / WhatsApp
  replyTime: "We reply within 24 hours, Monday to Saturday.",
  iec: "{{IEC number}}",
  gstin: "{{GSTIN}}",
  rcmc: "{{AEPC RCMC number}}",
  certifications: "{{certifications}}",
  moq: "{{MOQ per style}}",
  incoterms: "{{shipping terms, for example FOB or CIF}}",
  payment: "{{payment terms}}",
  address: "Bengaluru, Karnataka, India",
  founded: "{{year founded}}",
  ga4: "",               // e.g. G-XXXXXXX  (leave empty to disable)
  adsConversion: "",     // e.g. AW-123456789/AbCdEf (leave empty to disable)
  googleVerification: "", // Search Console HTML-tag token (content="..."), optional if verified by DNS
  bingVerification: "",   // Bing Webmaster Tools msvalidate.01 token, optional
  published: "2026-11-04",
  updated: "2026-11-08",
  hsnChecked: "8 November 2026",
  tagline: "Knits, woven garments and jackets for men and kids, made in India through our partner factories and exported to the USA, UK, Europe, the Gulf, Africa and Australia.",
};

// ------------------------------------------------------------------
// Three constructions → 7 product families → 21 lines
// `img` on a category is its representative lineup photo (assets/img/line)
// `fan` lists the cut-outs (assets/img/cut) shown in its 3D hero stage
// HSN codes: India's 8 digit ITC-HS lines, checked on SITE.hsnChecked.
// ------------------------------------------------------------------
export const CATEGORIES = [
  {
    key: "knits",
    slug: "knits",
    name: "Knits",
    chapter: "HS chapter 61 · Knitted",
    h1: "Knitted garments made in India for export",
    title: "Knitted Garments Manufacturing India | T Shirts, Polos",
    meta: "Cotton and polyester T shirts, cotton polo shirts and kids tees knitted in India through partner factories, to your GSM, print and size chart.",
    img: "mens-cotton-t-shirts",
    fan: ["men-tees.webp", "polo.webp", "tee-heather.webp"],
    tone: "#F2D3C2",
    short: "Single jersey and pique: T shirts, polos and kids tees, knitted to the GSM you set.",
    intro: "Knits are garments cut and sewn from knitted fabric, which stretches and recovers. GoodBiz Apparels supplies cotton and polyester T shirts, cotton polo shirts and kids cotton T shirts for export, made through partner knitting and garment units in India, from ready stock or to the buyer's GSM, colour and size chart.",
    body: [
      "Knitted garments are classified in HS chapter 61. T shirts sit under heading 6109: 61091000 for cotton and 61099010 for synthetic fibres such as polyester. Polo shirts have a knitted collar and a buttoned placket, so they are knit shirts under heading 6105, which is 61051020 for cotton.",
      "Single jersey is the standard T shirt fabric, pique is the classic polo fabric and polyester jersey is used for performance tees with quick dry finishes. GSM decides how a knit feels and what it costs. Tell us the GSM you sell today, or send a garment and we measure it, then match it on the sample.",
      "Knit production runs in a fixed order: the fabric is knitted and dyed to the GSM and shade you approve, then cut, sewn, printed or embroidered and finished. GSM, shade and measurements are checked on the sample, then again on bulk before packing.",
    ],
  },
  {
    key: "woven",
    slug: "woven",
    name: "Woven",
    chapter: "HS chapter 62 · Woven",
    h1: "Woven garments made in India for export",
    title: "Woven Garments Manufacturing India | Shirts, Jeans",
    meta: "Woven shirts, trousers, jeans, shorts, babywear and kidswear made in India through partner factories. Ready stock or to your fabric, GSM and sizes.",
    img: "mens-cotton-formal-shirts",
    fan: ["men-shirts.webp", "men-bottoms.webp", "kids-dresses.webp"],
    tone: "#CFDDF2",
    short: "Poplin, oxford, handloom, twill and denim: shirts, bottoms, babywear and kidswear.",
    intro: "Woven garments are made from fabric woven on a loom, which holds its shape and does not stretch unless elastane is added. GoodBiz Apparels supplies men's shirts, trousers, jeans and shorts, babywear and kidswear in woven cotton, handloom, polyester and silk, made through partner factories in India.",
    body: [
      "Woven garments are classified in HS chapter 62. Shirting is usually poplin, oxford, twill or dobby; bottoms are twill, canvas or denim. Handloom cotton is hand woven and carries a natural slub that buyers use for premium casual ranges.",
      "Woven programmes cover four families: men's shirts in four fabric groups, men's chinos, jeans and shorts, woven babywear for children up to 86 cm tall, and kidswear for ages 2 to 14. Each family page lists its lines with fabric, GSM range and HSN code.",
      "Because woven fabric does not stretch, fit decides whether a programme sells. Send a fit sample or your measurement chart and it is graded across your size range before cutting. Woven cotton can shrink in washing, so shrinkage and wash tests are confirmed on the sample, and pre-shrunk or sanforised fabric is specified where your spec needs it.",
    ],
  },
  {
    key: "outerwear",
    slug: "outerwear",
    name: "Outerwear",
    chapter: "Jackets and outer layers",
    h1: "Men's jackets made in India: cotton and polyester",
    title: "Jacket Manufacturing India | Cotton, Polyester | GoodBiz",
    meta: "Cotton field and utility jackets and polyester bombers, windcheaters and padded jackets made in India through partner factories, to your pattern.",
    img: "mens-polyester-jackets",
    fan: ["jacket-olive.webp", "extra-bomber.webp", "bomber-navy.webp"],
    tone: "#D5E2CF",
    short: "Field, utility, bomber and padded jackets, lined or unlined, to your pattern.",
    intro: "Outerwear is the top layer. GoodBiz Apparels supplies men's cotton and polyester jackets for export: field and utility jackets, bombers, windcheaters and padded jackets, made through partner factories in India to the buyer's pattern, lining, closure and size chart, or from ready stock.",
    body: [
      "Jackets carry more construction than any other line: pockets, linings, padding, zips and closures all change the costing. Tell us the shell fabric, lining, fill and trims you want, or send a reference jacket.",
      "Anorak, windcheater and bomber style jackets are classified under heading 6201, which covers men's and boys' coats and jackets other than suit-type jackets: 62013090 for cotton and 62014090 for man-made fibres such as polyester. Tailored suit-type jackets and blazers fall under heading 6203 instead.",
      "Outerwear is usually bought for a season, so plan it early: shell fabric, lining and padding are sourced separately, and a fit sample and a pre-production sample are approved before bulk cutting.",
    ],
  },
];

export const FAMILIES = [
  // ---------------- KNITS ----------------
  {
    cat: "knits", audience: "Men's", slug: "t-shirts-polos", name: "Men's T shirts and polos",
    h1: "Men's T shirts and polo shirts made for export",
    title: "Men's T Shirt & Polo Manufacturing India | GoodBiz",
    meta: "Cotton and polyester T shirts and cotton pique polos made in India for importers and private labels. Your GSM, print and sizes. HSN 61091000, 61051020.",
    intro: "We supply men's T shirts in cotton and polyester, and cotton polo shirts, for export and private label programmes, made through partner knitting and garment units in India. Buyers set the GSM, neck, fit, print and size chart, or pick from ready stock blanks.",
    body: [
      "T shirts are knitted garments under heading 6109: 61091000 for cotton and 61099010 for synthetic fibres such as polyester. Polo shirts have a knitted collar and buttoned placket, so customs treats them as knit shirts under heading 6105, which is 61051020 for cotton. Single jersey is the standard T shirt fabric; polos are usually knitted in pique.",
      "GSM is the number most buyers lead with. A lighter tee feels softer and costs less; a heavier tee hangs better and reads as premium. Tell us the GSM you sell today and we match it, or we suggest one for your price point. Polyester T shirts are typically performance fabrics with moisture management finishes.",
    ],
    specs: [["Construction", "Knitted: single jersey, pique, interlock"], ["Typical fabric weight", "T shirts about 140 to 220 GSM; polos about 180 to 240 GSM"], ["Decoration", "Screen print, DTF, embroidery, or blank"], ["Fits", "Regular, slim, oversized, or your own block"], ["Packing", "Folded, size sticker, polybag, ratio packed cartons"]],
    products: [
      { name: "Men's cotton T shirts", hsn: "61091000", spec: "Single jersey · 140 to 220 GSM", desc: "Crew and V neck tees in combed or carded cotton single jersey. Blanks or printed to your artwork." },
      { name: "Men's polyester T shirts", hsn: "61099010", spec: "Poly jersey · 120 to 180 GSM", desc: "Quick dry polyester tees for sportswear, events and uniforms, with sublimation printing available on light colours." },
      { name: "Men's cotton polo shirts", hsn: "61051020", spec: "Cotton pique · 180 to 240 GSM", desc: "Pique polo shirts with knitted collar and buttoned placket, plain or with embroidered logo, for retail and corporate wear." },
    ],
    faqs: [
      ["What GSM should I choose for a cotton T shirt?", "Most retail T shirts sit between 160 and 200 GSM. Below 150 GSM feels light and summery; 200 GSM and above reads as heavyweight or premium. We can send fabric swatches at two or three weights before you decide."],
      ["Why is a polo shirt not under the T shirt HSN code?", "Heading 6109 covers T shirts, singlets and vests. A polo has a collar and a buttoned placket, so it is classified as a knit shirt under heading 6105. Cotton polos go on our invoices as 61051020."],
      ["Do you print or embroider logos on T shirts and polos?", "Yes. Screen printing, DTF and embroidery are available. Send your artwork with Pantone references and placement measurements."],
    ],
  },
  {
    cat: "knits", audience: "Kids", slug: "kids-t-shirts", name: "Kids T shirts",
    h1: "Kids cotton T shirts made for export",
    title: "Kids T Shirts Manufacturing India | Cotton | GoodBiz",
    meta: "Kids cotton T shirts knitted in India through partner factories for importers. Prints, sizes and labels to your spec, or ready stock. HSN 61091000.",
    intro: "We supply kids cotton T shirts for export in soft single jersey, plain or printed, made through partner factories in India and graded to the buyer's age sizing and artwork.",
    body: [
      "Kids cotton T shirts are knitted garments invoiced under HSN 61091000, the same heading as adult cotton tees, because heading 6109 does not split T shirts by age or gender.",
      "Kidswear prints need to survive repeated washing. Print adhesion and colour fastness are checked on the sample, with inks suited to children's products, and third party laboratory testing can be arranged for your market. Tell us the destination early so labelling and testing are planned from the start.",
    ],
    specs: [["Construction", "Knitted single jersey"], ["Typical fabric weight", "About 140 to 180 GSM"], ["Decoration", "Screen print, puff print, DTF, embroidery, appliqué"], ["Sizes", "2 years to 14 years or to your chart"], ["Packing", "Single or multipack, size stickers, polybag"]],
    products: [
      { name: "Kids cotton T shirts", hsn: "61091000", spec: "Single jersey · 140 to 180 GSM", desc: "Graphic and plain tees in soft cotton jersey for boys and girls, from 2 to 14 years." },
    ],
    faqs: [
      ["What age sizes do you produce for kids T shirts?", "Typically 2 to 14 years, but we grade to your own size chart if your market uses height based or other sizing."],
      ["Can you arrange safety testing for kids T shirts?", "Yes. Tell us the destination market and the tests your buyer needs, for example CPSIA testing for the USA, and we arrange it with a third party laboratory before shipment."],
    ],
  },
  // ---------------- WOVEN ----------------
  {
    cat: "woven", audience: "Men's", slug: "shirts", name: "Men's shirts",
    h1: "Men's shirts: cotton, handloom, polyester and silk",
    title: "Men's Shirts Manufacturing India: Cotton, Silk, Handloom",
    meta: "Men's formal, handloom, polyester and silk shirts from India. Ready stock or to your fabric, GSM and size chart. HSN 62052090, 62052010, 62053090.",
    intro: "We supply men's woven shirts for export in four fabric groups: cotton formal, cotton handloom, polyester and silk, made through partner shirt factories in India. Shirts come from ready stock or are produced to the buyer's fabric, GSM, collar, cuff and size chart.",
    body: [
      "Woven shirts fall under HSN heading 6205. The digits change with the fibre: cotton shirts take 620520 (62052090, or 62052010 for handloom), man made fibres take 620530 (62053090) and silk sits under 620590, which is 62059019 on our invoices.",
      "For formal shirts most buyers specify poplin, oxford, twill or dobby weaves. Handloom shirting has a natural slub and is hand woven, which suits resort and premium casual ranges. Polyester shirting is chosen for uniforms and easy care lines; silk for occasion wear.",
    ],
    specs: [["Construction", "Woven"], ["Typical fabric weight", "Silk about 50 to 90 GSM; cotton and polyester shirting about 90 to 160 GSM"], ["Collar options", "Spread, button down, cutaway, mandarin, camp, or as per your tech pack"], ["Sizes", "Graded to your size chart"], ["Labels and packing", "Your brand label, folded with collar support, polybag per piece"]],
    products: [
      { name: "Men's cotton formal shirts", hsn: "62052090", spec: "Poplin, oxford, twill · 100 to 140 GSM", desc: "Poplin, oxford, twill and dobby shirts for office and formal ranges. Solids, stripes and checks, with or without wrinkle resistant finish." },
      { name: "Men's cotton handloom shirts", hsn: "62052010", spec: "Hand woven cotton · natural slub", desc: "Shirts cut from hand woven Indian cotton with a natural slub texture. Suited to resort, linen look and premium casual collections." },
      { name: "Men's polyester shirts", hsn: "62053090", spec: "Polyester shirting · easy care", desc: "Easy care shirting in polyester for uniforms, hospitality and value retail, where shape retention and quick drying matter." },
      { name: "Men's silk shirts", hsn: "62059019", spec: "Silk · 50 to 90 GSM", desc: "Lightweight silk shirts for occasion and festive wear. Supplied in plain, printed or jacquard silk to your reference." },
    ],
    faqs: [
      ["What HSN code is used for men's cotton shirts?", "We invoice men's woven cotton shirts under HSN 62052090 and hand woven cotton shirts under 62052010. Your import tariff code is confirmed by your customs broker in your country."],
      ["Can you match a shirt fabric I send you?", "Yes. Send a swatch or a reference shirt and we source shirting to the same weave, composition and GSM, then confirm it on a sample before bulk."],
    ],
  },
  {
    cat: "woven", audience: "Men's", slug: "trousers-jeans-shorts", name: "Men's trousers, jeans and shorts",
    h1: "Men's trousers, jeans and shorts made for export",
    title: "Men's Trousers, Jeans & Shorts Manufacturing India",
    meta: "Cotton chinos, denim jeans, polyester trousers and cotton shorts made in India to your fit, fabric and size chart. HSN 62034290 and 62034300.",
    intro: "We supply men's woven bottoms for export: cotton trousers and chinos, cotton denim jeans, polyester trousers and cotton shorts, made through partner factories in India to the buyer's fit block, fabric, wash and size chart, or from ready stock.",
    body: [
      "Men's trousers, jeans and shorts are classified together under HSN 6203 by fibre. Cotton trousers, jeans and shorts share 62034290 on our invoices; synthetic fibre trousers take 62034300.",
      "Fit is what makes or breaks a bottoms programme. Send a fit sample or your measurement chart with waist, inseam, rise, thigh and leg opening, and it is graded across your size range before cutting.",
    ],
    specs: [["Construction", "Woven: twill, canvas, denim, suiting"], ["Typical fabric weight", "Chino twill about 200 to 300 GSM; denim about 10 to 14 oz (roughly 340 to 475 GSM)"], ["Washes", "Rinse, stone, enzyme, garment dye, as specified"], ["Trims", "Your buttons, rivets, zips and leather or jacron patches"], ["Packing", "Folded or hanger packed, size tags, polybag"]],
    products: [
      { name: "Men's cotton trousers", hsn: "62034290", spec: "Cotton twill · 200 to 300 GSM", desc: "Chinos and casual trousers in cotton twill and canvas, regular, slim or tapered, with or without stretch." },
      { name: "Men's cotton jeans", hsn: "62034290", spec: "Denim · 10 to 14 oz", desc: "Five pocket denim jeans in rigid or stretch denim, finished to your wash standard." },
      { name: "Men's polyester trousers", hsn: "62034300", spec: "Polyester suiting", desc: "Formal and uniform trousers in polyester suiting that keep their crease and resist wrinkles." },
      { name: "Men's cotton shorts", hsn: "62034290", spec: "Twill, canvas, denim", desc: "Chino, cargo and denim shorts for summer ranges, cut from the same fabrics as our trousers." },
    ],
    faqs: [
      ["Can you produce jeans to my wash standard?", "Yes. Send a physical wash standard or a reference pair and we match it on the sample. Approved wash standards are kept for bulk comparison."],
      ["Are jeans and cotton trousers the same HSN code?", "On our invoices, men's cotton trousers, jeans and shorts are all declared under 62034290, because the code follows the garment type and fibre rather than the weave."],
    ],
  },
  {
    cat: "woven", audience: "Kids", slug: "baby-garments", name: "Baby garments",
    h1: "Woven baby garments made in India for export",
    title: "Baby Garments Manufacturing & Export India | Babywear",
    meta: "Woven cotton, synthetic and other textile babywear made in India for importers: jhablas, rompers, tops and sets. HSN 62092090, 62093000, 62099090.",
    intro: "We supply woven babies' garments for export in cotton, synthetic fibres and other textiles: jhablas, rompers, tops and sets in muslin, poplin and voile, made through partner factories in India to the buyer's size chart, from newborn up to 86 cm body height.",
    body: [
      "Babies' garments have their own HSN heading, 6209 for woven garments, defined in the Harmonized System as garments for young children of a body height not exceeding 86 cm. Cotton babywear is invoiced under 62092090, synthetic fibres under 62093000 and other textile materials under 62099090. Knitted babywear, such as jersey bodysuits, is classified separately under heading 6111.",
      "Babywear buyers ask first about softness, snaps and chemical safety. Nickel free snaps are used on request, necklines get soft binding, and third party testing can be arranged to your market's requirements.",
    ],
    specs: [["Fabrics", "Woven cotton muslin, poplin and voile; polyester; other textiles on request"], ["Closures", "Nickel free snaps, envelope necks, ties"], ["Sizes", "Newborn up to 86 cm body height (about 24 months), or your chart"], ["Testing", "Third party lab testing to your market on request"], ["Packing", "Multipacks or single polybag, as specified"]],
    products: [
      { name: "Baby cotton garments", hsn: "62092090", spec: "Woven cotton · up to 86 cm", desc: "Jhablas, rompers, tops and sets in soft woven cotton muslin, poplin and voile, plain or printed." },
      { name: "Baby synthetic garments", hsn: "62093000", spec: "Polyester and synthetics", desc: "Woven babywear in polyester and other synthetic fibres, such as pram suits, outer layers and winter sets." },
      { name: "Baby other textile garments", hsn: "62099090", spec: "Other textiles to your choice", desc: "Woven babywear in textiles other than cotton and synthetic fibres, made to your fabric choice." },
    ],
    faqs: [
      ["What counts as a babies' garment for customs?", "Under the Harmonized System, babies' garments are for young children of a body height not exceeding 86 cm. Larger sizes are classified as children's garments under the regular headings."],
      ["Do you supply knitted babywear such as bodysuits?", "Our babywear lines are woven, classified under heading 6209. Knitted bodysuits and sleepsuits fall under a different heading, 6111, so describe them in your enquiry and we confirm the code and costing separately."],
      ["Can you arrange product safety testing for babywear?", "Yes. Tell us the destination market and the tests your buyer requires and we arrange testing with a third party laboratory before shipment."],
    ],
  },
  {
    cat: "woven", audience: "Kids", slug: "kidswear", name: "Kids shirts, trousers, dresses and shorts",
    h1: "Kidswear: boys' shirts, trousers, dresses and shorts",
    title: "Kidswear Manufacturing India | Shirts, Dresses, Shorts",
    meta: "Boys' cotton shirts and trousers, girls' cotton dresses and kids shorts made in India to your size chart. HSN 62052090, 62034290, 62044290, 62046290.",
    intro: "We supply woven kidswear for export: boys' cotton shirts, boys' cotton trousers, girls' cotton dresses and kids cotton shorts, made through partner factories in India to the buyer's design, print and age sizing.",
    body: [
      "Boys' cotton shirts are invoiced under HSN 62052090 and boys' cotton trousers under 62034290. Girls' cotton dresses take 62044290. Kids cotton shorts take 62034290 for boys' styles and 62046290 for girls' styles, which is why both codes appear on that line. Girls' shirts and blouses are classified separately under heading 6206.",
      "Children's garments often carry trims such as buttons, bows and lace. Small parts are secured to pass the pull tests your market may require, and loose trims can be replaced with printed or embroidered details.",
    ],
    specs: [["Construction", "Woven cotton poplin, oxford, cambric, twill and denim"], ["Details", "Smocking, frills, embroidery, adjustable and elastic waists"], ["Sizes", "2 years to 14 years or to your chart"], ["Trims", "Secured buttons and bows, tested on the sample"], ["Packing", "Single or multipack, polybag, ratio packed"]],
    products: [
      { name: "Boys cotton shirts", hsn: "62052090", spec: "Poplin, oxford, checks", desc: "Casual and occasion shirts in cotton poplin, oxford and checks for boys aged 2 to 14." },
      { name: "Boys cotton trousers", hsn: "62034290", spec: "Twill, denim · adjustable waist", desc: "Chinos and woven cotton trousers with adjustable waists for everyday and school wear." },
      { name: "Girls cotton dresses", hsn: "62044290", spec: "Cambric, poplin · printed", desc: "Printed, smocked and tiered cotton dresses for everyday and occasion wear." },
      { name: "Kids cotton shorts", hsn: "62034290 / 62046290", spec: "Twill, denim, pull on", desc: "Twill, denim and pull on shorts for boys (62034290) and girls (62046290)." },
    ],
    faqs: [
      ["Why does kids shorts show two HSN codes?", "Boys' shorts are classified with boys' trousers (62034290) and girls' shorts with girls' trousers (62046290). The invoice lists each by style."],
      ["What age sizes do you make for kidswear?", "Typically 2 to 14 years, graded to your size chart."],
    ],
  },
  // ---------------- OUTERWEAR ----------------
  {
    cat: "outerwear", audience: "Men's", slug: "jackets", name: "Men's jackets",
    h1: "Men's jackets: cotton and polyester, made for export",
    title: "Men's Jackets Manufacturing India | Bombers, Utility",
    meta: "Men's cotton field and utility jackets and polyester bombers, windcheaters and padded jackets made in India for importers. HSN 62013090, 62014090.",
    intro: "We supply men's jackets for export in two fibre groups: cotton field and utility jackets, and polyester bombers, windcheaters and padded jackets. Each is made through partner factories in India to the buyer's pattern, lining and size chart, or supplied from ready stock.",
    body: [
      "Cotton jackets are cut from twill, canvas or denim and suit workwear and casual ranges. Polyester jackets use shell fabrics with optional lining, padding and water repellent finishes for active and winter ranges.",
      "These jackets fall under HSN heading 6201, which covers anoraks, windcheaters and similar jackets: 62013090 for cotton and 62014090 for polyester and other man-made fibres. Tailored suit-type jackets and blazers are classified under heading 6203.",
    ],
    specs: [["Construction", "Woven shell, lined, unlined or padded"], ["Fabrics", "Cotton twill, canvas and denim; polyester taffeta, peach and ripstop shells"], ["Closures", "Zip, snap or button front, as specified"], ["Sizes", "S to XXL or to your chart"], ["Trims and packing", "Your zips, pullers, snaps and labels; hanger packed or folded flat"]],
    products: [
      { name: "Men's cotton jackets", hsn: "62013090", spec: "Cotton twill, canvas, denim", desc: "Field, utility and work jackets in cotton twill, canvas and denim, lined or unlined." },
      { name: "Men's polyester jackets", hsn: "62014090", spec: "Polyester shell · lined or padded", desc: "Bombers, windcheaters and padded jackets in polyester shell fabrics, lined or unlined." },
    ],
    faqs: [
      ["Do you make lined and padded jackets?", "Yes. Jackets can be unlined, lined or padded. Tell us the lining fabric and fill weight, or send a reference jacket, and we include it in the costing."],
      ["Which HSN codes apply to men's jackets?", "We invoice men's cotton jackets under 62013090 and polyester jackets under 62014090, in heading 6201 for anoraks, windcheaters and similar jackets. Tailored blazers fall under heading 6203. Your broker confirms the import code."],
    ],
  },
];

// ------------------------------------------------------------------
// Shared FAQs (home + contact + landing pages)
// ------------------------------------------------------------------
export const FAQS = [
  ["Which garments do you supply?", "Three constructions: knits (T shirts, polos, kids tees), woven (shirts, trousers, jeans, shorts, babywear and kidswear) and outerwear (cotton and polyester jackets), for men and kids."],
  ["Who makes the garments?", "Partner garment factories in India, chosen for each product type. GoodBiz Apparels manages the specification, sampling, quality checks, labelling, export documents and shipping, and is your single point of contact."],
  ["Which countries do you export to?", "The USA, the UK, the European Union, the UAE and wider GCC, Africa (including South Africa, Kenya, Nigeria, Ghana and Tanzania) and Australia."],
  ["How fast do you reply to an enquiry?", "Within 24 hours, Monday to Saturday, with stock availability or the questions we need answered for a costing."],
  ["How is the minimum order quantity set?", "By fabric and colour. Made to order styles need enough fabric for a dye lot in each colour, so the minimum applies per colour and is confirmed in your costing. Ready stock is limited only by what the lot holds."],
  ["Can I mix ready stock and made to order items in one shipment?", "Yes. Many buyers take some lines from ready stock and have others made to their spec. We consolidate both into one shipment where the timelines allow."],
  ["What do I need to send for a made to order enquiry?", "A design or tech pack, your size chart, fabric and GSM, colours, quantity per size and colour, labelling and packing needs, and the destination port. A reference garment works if you have no tech pack."],
  ["Do you make a sample before bulk production?", "Yes. For custom orders a sample is made to your spec, and bulk production starts only after you approve it in writing."],
  ["Can you put our brand labels and tags on the garments?", "Yes, on both made to order and ready stock lines. Send your label artwork or the physical labels and they are attached before packing."],
  ["Are the HSN codes in the catalogue final for customs?", "They are the 8 digit Indian codes we use on export invoices, checked against India's tariff on 8 November 2026. Your import tariff code can differ by country, so your customs broker confirms the code on your side."],
  ["Which shipping terms can you quote?", "Choose the price basis you prefer in the enquiry, such as FOB, CFR or CIF, and add your destination port. We quote on that basis or suggest the most practical option."],
];

// ------------------------------------------------------------------
// Per family: 3D cut-out + swatch tone   (assets/img/cut)
// ------------------------------------------------------------------
export const LOOKS = {
  "t-shirts-polos":        { cut: "men-tees.webp",     tone: "#F2D3C2" },
  "kids-t-shirts":         { cut: "kids-tops.webp",    tone: "#F7E2A9" },
  "shirts":                { cut: "men-shirts.webp",   tone: "#CFDDF2" },
  "trousers-jeans-shorts": { cut: "men-bottoms.webp",  tone: "#F3E3B0" },
  "baby-garments":         { cut: "kids-baby.webp",    tone: "#CCE0F1" },
  "kidswear":              { cut: "kids-dresses.webp", tone: "#E3D7F1" },
  "jackets":               { cut: "extra-bomber.webp", tone: "#D5E2CF" },
};

// Garments orbiting in the home hero (first 9 also show on phones)
export const HERO_ORBS = [
  { cut: "men-tees.webp", tone: "#F2D3C2" },
  { cut: "men-shirts.webp", tone: "#CFDDF2" },
  { cut: "extra-bomber.webp", tone: "#F0CDB8" },
  { cut: "kids-baby.webp", tone: "#CCE0F1" },
  { cut: "men-bottoms.webp", tone: "#F3E3B0" },
  { cut: "polo.webp", tone: "#DDE7D6" },
  { cut: "bomber-navy.webp", tone: "#D5E2CF" },
  { cut: "kids-dresses.webp", tone: "#E3D7F1" },
  { cut: "tee-heather.webp", tone: "#CFDDF2" },
  { cut: "jacket-olive.webp", tone: "#E4E0C6" },
  { cut: "kids-tops.webp", tone: "#F7E2A9" },
  { cut: "trousers.webp", tone: "#E2E0DA" },
  { cut: "shirt-camp.webp", tone: "#EADCCB" },
  { cut: "polo-navy.webp", tone: "#DFE3F1" },
];
