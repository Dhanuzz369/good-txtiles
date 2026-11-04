// ------------------------------------------------------------------
// GoodBiz Apparels — site content model (v4: knits · woven · outerwear)
// Every {{...}} value is a fact only the business can supply.
// ------------------------------------------------------------------

export const SITE = {
  url: process.env.SITE_URL || "https://www.YOUR-DOMAIN.com", // set SITE_URL when building
  name: "GoodBiz Apparels",
  legalName: "{{legal company name}}",
  city: "{{city}}",
  country: "India",
  whatsapp: "{{WhatsApp number}}",
  email: "{{export email}}",
  phone: "{{phone}}",
  iec: "{{IEC number}}",
  gstin: "{{GSTIN}}",
  certifications: "{{certifications}}",
  moq: "{{MOQ per style}}",
  incoterms: "{{shipping terms, for example FOB or CIF}}",
  payment: "{{payment terms}}",
  address: "{{registered address}}",
  founded: "{{year founded}}",
  ga4: "",          // e.g. G-XXXXXXX  (leave empty to disable)
  adsConversion: "", // e.g. AW-123456789/AbCdEf (leave empty to disable)
  updated: "2026-11-04",
  tagline: "Knits, woven and outerwear for men and kids, manufactured and exported from India.",
};

// ------------------------------------------------------------------
// Three constructions → 7 product families → 23 lines
// `img` on a category is its representative lineup photo (assets/img/line)
// `fan` lists the cut-outs (assets/img/cut) shown in its 3D hero stage
// ------------------------------------------------------------------
export const CATEGORIES = [
  {
    key: "knits",
    slug: "knits",
    name: "Knits",
    chapter: "HS chapter 61 · Knitted",
    h1: "Knitted garments manufacturer and exporter in India",
    title: "Knitted Garments Manufacturer & Exporter India | T Shirts, Polos",
    meta: "Cotton and polyester T shirts, cotton polo shirts and kids T shirts knitted and made in India for export. Your GSM, print and size chart. HSN 6109.",
    img: "mens-cotton-t-shirts",
    fan: ["men-tees.webp", "polo.webp", "tee-heather.webp"],
    tone: "#F2D3C2",
    short: "Single jersey and pique: T shirts, polos and kids tees, knitted to the GSM you set.",
    intro: "Knits are garments cut and sewn from knitted fabric, which stretches and recovers. GoodBiz Apparels makes cotton and polyester T shirts, cotton polo shirts and kids cotton T shirts for export, from ready stock or knitted to the buyer's GSM, colour and size chart.",
    body: [
      "Knitted garments are classified in HS chapter 61. Single jersey is the standard T shirt fabric, pique is the classic polo fabric and polyester jersey is used for performance tees with quick dry finishes.",
      "GSM is the figure that decides how a knit feels and what it costs. Tell us the GSM you sell today, or send a garment and we measure it, then match it on the sample.",
    ],
  },
  {
    key: "woven",
    slug: "woven",
    name: "Woven",
    chapter: "HS chapter 62 · Woven",
    h1: "Woven garments manufacturer and exporter in India",
    title: "Woven Garments Manufacturer & Exporter India | Shirts, Trousers, Jeans",
    meta: "Woven shirts, trousers, jeans, shorts, babywear and kidswear made in India for importers. Ready stock or made to your fabric, GSM and size chart.",
    img: "mens-cotton-formal-shirts",
    fan: ["men-shirts.webp", "men-bottoms.webp", "kids-dresses.webp"],
    tone: "#CFDDF2",
    short: "Poplin, oxford, handloom, twill and denim: shirts, bottoms, babywear and kidswear.",
    intro: "Woven garments are made from fabric woven on a loom, which holds its shape and does not stretch unless elastane is added. GoodBiz Apparels makes men's shirts, trousers, jeans and shorts, babywear and kidswear in woven cotton, handloom, polyester and silk.",
    body: [
      "Woven garments are classified in HS chapter 62. Shirting is usually poplin, oxford, twill or dobby; bottoms are twill, canvas or denim. Handloom cotton is hand woven and carries a natural slub that buyers use for premium casual ranges.",
      "For woven programmes, fit and fabric weight are what buyers approve first. Send a fit sample or your measurement chart and we grade it across your size range before cutting.",
    ],
  },
  {
    key: "outerwear",
    slug: "outerwear",
    name: "Outerwear",
    chapter: "Tailored and outer layers",
    h1: "Outerwear manufacturer: jackets, blazers and suits",
    title: "Outerwear Manufacturer India | Jackets, Blazers & Suits | Export",
    meta: "Cotton and polyester jackets, cotton blazers and cotton suits made in India to your pattern, lining and size chart. Ready stock or made to order.",
    img: "mens-polyester-jackets",
    fan: ["jacket-olive.webp", "men-jackets.webp", "extra-bomber.webp"],
    tone: "#D5E2CF",
    short: "Jackets, bombers, blazers and suits, lined or unlined, to your pattern.",
    intro: "Outerwear is the top layer: jackets, bombers, blazers and suits. GoodBiz Apparels tailors cotton and polyester jackets, cotton blazers and cotton suits for export, made to the buyer's pattern, lining, closure and size chart, or supplied from ready stock.",
    body: [
      "Outerwear is the most construction heavy part of the range. Tell us whether you want unstructured or structured shoulders, half or full lining, and functional or decorative cuff buttons, and we cost it accordingly.",
      "Jackets and blazers are classified under HSN 6203 by fibre: cotton jackets and blazers under 62033200 and synthetic fibre jackets under 62033300.",
    ],
  },
];

export const FAMILIES = [
  // ---------------- KNITS ----------------
  {
    cat: "knits", audience: "Men's", slug: "t-shirts-polos", name: "Men's T shirts and polos",
    h1: "Men's T shirts and polo shirts manufacturer for export",
    title: "Men's T Shirt & Polo Manufacturer India | Export | GoodBiz",
    meta: "Cotton and polyester T shirts and cotton polo shirts made in India for importers and private labels. Your GSM, print and sizes. HSN 61091000, 61099010.",
    img: "m-tees.jpg", alt: "Folded crew neck T shirts in red, black, white, navy and yellow",
    intro: "We knit, cut and sew men's T shirts in cotton and polyester, and cotton polo shirts, for export and private label programmes. Buyers set the GSM, neck, fit, print and size chart, or pick from ready stock blanks.",
    body: [
      "T shirts are knitted garments under HSN chapter 61. Single jersey is the standard T shirt fabric; polo shirts are usually knitted in pique. Polyester T shirts are typically performance or sports fabrics with moisture management finishes.",
      "GSM is the number most buyers lead with. A lighter tee feels softer and costs less; a heavier tee hangs better and reads as premium. Tell us the GSM you sell today and we match it, or we suggest one for your price point.",
    ],
    specs: [["Construction", "Knitted: single jersey, pique, interlock"], ["Typical fabric weight", "T shirts about 140 to 220 GSM; polos about 180 to 240 GSM"], ["Decoration", "Screen print, DTF, embroidery, or blank"], ["Fits", "Regular, slim, oversized, or your own block"], ["Packing", "Folded, size sticker, polybag, ratio packed cartons"]],
    products: [
      { name: "Men's cotton T shirts", hsn: "61091000", spec: "Single jersey · 140 to 220 GSM", desc: "Crew and V neck tees in combed or carded cotton single jersey. Blanks or printed to your artwork." },
      { name: "Men's polyester T shirts", hsn: "61099010", spec: "Poly jersey · 120 to 180 GSM", desc: "Quick dry polyester tees for sportswear, events and uniforms, with sublimation printing available on light colours." },
      { name: "Men's cotton polo shirts", hsn: "61091000", spec: "Cotton pique · 180 to 240 GSM", desc: "Pique polo shirts with knitted collar and buttoned placket, plain or with embroidered logo, for retail and corporate wear." },
    ],
    faqs: [
      ["What GSM should I choose for a cotton T shirt?", "Most retail T shirts sit between 160 and 200 GSM. Below 150 GSM feels light and summery; 200 GSM and above reads as heavyweight or premium. We can send fabric swatches at two or three weights before you decide."],
      ["Do you print or embroider logos on T shirts and polos?", "Yes. Screen printing, DTF and embroidery are available. Send your artwork with Pantone references and placement measurements."],
    ],
  },
  {
    cat: "knits", audience: "Kids", slug: "kids-t-shirts", name: "Kids T shirts",
    h1: "Kids cotton T shirts manufacturer for export",
    title: "Kids T Shirts Manufacturer India | Cotton | Export | GoodBiz",
    meta: "Kids cotton T shirts knitted and made in India for importers. Prints, sizes and labels to your spec, or ready stock. HSN 61091000.",
    img: "k-kids.jpg", alt: "Children's T shirts and tops displayed on a wall rack",
    intro: "We make kids cotton T shirts for export in soft single jersey, plain or printed, graded to the buyer's age sizing and artwork.",
    body: [
      "Kids cotton T shirts are knitted garments invoiced under HSN 61091000, the same heading as adult cotton tees.",
      "Kidswear prints need to survive repeated washing. We test print adhesion and colour fastness on the sample and recommend inks suited to children's products. Tell us the destination market so labelling and testing are planned from the start.",
    ],
    specs: [["Construction", "Knitted single jersey"], ["Typical fabric weight", "About 140 to 180 GSM"], ["Decoration", "Screen print, puff print, DTF, embroidery, appliqué"], ["Sizes", "2 years to 14 years or to your chart"], ["Packing", "Single or multipack, size stickers, polybag"]],
    products: [
      { name: "Kids cotton T shirts", hsn: "61091000", spec: "Single jersey · 140 to 180 GSM", desc: "Graphic and plain tees in soft cotton jersey for boys and girls, from 2 to 14 years." },
    ],
    faqs: [
      ["What age sizes do you produce for kids T shirts?", "Typically 2 to 14 years, but we grade to your own size chart if your market uses height based or other sizing."],
    ],
  },
  // ---------------- WOVEN ----------------
  {
    cat: "woven", audience: "Men's", slug: "shirts", name: "Men's shirts",
    h1: "Men's shirts manufacturer: cotton, handloom, polyester and silk",
    title: "Men's Shirts Manufacturer India: Cotton, Silk, Handloom",
    meta: "Men's formal, handloom, polyester and silk shirts from India. Ready stock or made to your fabric, GSM and size chart. HSN 62052090, 62052010, 62053090, 62059010.",
    img: "m-shirts.jpg", alt: "Folded cotton shirts in white, navy and plum on a wooden board",
    intro: "We manufacture men's woven shirts for export in four fabric groups: cotton formal, cotton handloom, polyester and silk. Shirts are supplied from ready stock or produced to the buyer's fabric, GSM, collar, cuff and size chart.",
    body: [
      "Woven shirts fall under HSN heading 6205. The digits change with the fibre: cotton shirts take 620520, handloom cotton has its own line, man made fibres take 620530 and silk sits under 620590.",
      "For formal shirts most buyers specify poplin, oxford, twill or dobby weaves. Handloom shirting has a natural slub and is hand woven, which suits resort and premium casual ranges. Polyester shirting is chosen for uniforms and easy care lines; silk for occasion wear.",
    ],
    specs: [["Construction", "Woven"], ["Typical fabric weight", "Silk about 50 to 90 GSM; cotton and polyester shirting about 90 to 160 GSM"], ["Collar options", "Spread, button down, cutaway, mandarin, camp, or as per your tech pack"], ["Sizes", "Graded to your size chart"], ["Labels and packing", "Your brand label, folded with collar support, polybag per piece"]],
    products: [
      { name: "Men's cotton formal shirts", hsn: "62052090", spec: "Poplin, oxford, twill · 100 to 140 GSM", desc: "Poplin, oxford, twill and dobby shirts for office and formal ranges. Solids, stripes and checks, with or without wrinkle resistant finish." },
      { name: "Men's cotton handloom shirts", hsn: "62052010", spec: "Hand woven cotton · natural slub", desc: "Shirts cut from hand woven Indian cotton with a natural slub texture. Suited to resort, linen look and premium casual collections." },
      { name: "Men's polyester shirts", hsn: "62053090", spec: "Polyester shirting · easy care", desc: "Easy care shirting in polyester for uniforms, hospitality and value retail, where shape retention and quick drying matter." },
      { name: "Men's silk shirts", hsn: "62059010", spec: "Silk · 50 to 90 GSM", desc: "Lightweight silk shirts for occasion and festive wear. Supplied in plain, printed or jacquard silk to your reference." },
    ],
    faqs: [
      ["What HSN code is used for men's cotton shirts?", "We invoice men's woven cotton shirts under HSN 62052090 and hand woven cotton shirts under 62052010. Your import tariff code is confirmed by your customs broker in your country."],
      ["Can you match a shirt fabric I send you?", "Yes. Send a swatch or a reference shirt and we source shirting to the same weave, composition and GSM, then confirm it on a sample before bulk."],
    ],
  },
  {
    cat: "woven", audience: "Men's", slug: "trousers-jeans-shorts", name: "Men's trousers, jeans and shorts",
    h1: "Men's trousers, jeans and shorts manufacturer for export",
    title: "Men's Trousers, Jeans & Shorts Manufacturer India | Export",
    meta: "Cotton chinos, denim jeans, polyester trousers and cotton shorts made in India to your fit, fabric and size chart. HSN 62034290 and 62034300.",
    img: "m-denim.jpg", alt: "Stacks of folded denim jeans on a shelf",
    intro: "We produce men's woven bottoms for export: cotton trousers and chinos, cotton denim jeans, polyester trousers and cotton shorts. Each is made to the buyer's fit block, fabric, wash and size chart, or supplied from ready stock.",
    body: [
      "Men's trousers, jeans and shorts are classified together under HSN 6203 by fibre. Cotton trousers, jeans and shorts share 62034290 on our invoices; synthetic fibre trousers take 62034300.",
      "Fit is what makes or breaks a bottoms programme. Send a fit sample or your measurement chart with waist, inseam, rise, thigh and leg opening, and we grade it across your size range before cutting.",
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
    h1: "Baby garments manufacturer and exporter in India",
    title: "Baby Garments Manufacturer & Exporter India | Babywear",
    meta: "Cotton, synthetic and other textile baby garments made in India for importers: rompers, tops and sets to your size chart. HSN 62092000, 62093000, 62099090.",
    img: "k-baby.jpg", alt: "Folded cotton baby garments in a woven basket",
    intro: "We manufacture babies' garments for export in cotton, synthetic fibres and other textiles: rompers, sleepsuits, tops and sets, made to the buyer's size chart from newborn upward.",
    body: [
      "Babies' garments have their own HSN heading, 6209, defined in the Harmonized System as garments for young children of a body height not exceeding 86 cm. Cotton babywear is invoiced under 62092000, synthetic fibres under 62093000 and other textile materials under 62099090.",
      "Babywear buyers ask first about softness, snaps and chemical safety. We use nickel free snaps on request, soft binding at necklines and can arrange third party testing to your market's requirements.",
    ],
    specs: [["Fabrics", "Cotton muslin, poplin and voile; polyester; other textiles on request"], ["Closures", "Nickel free snaps, envelope necks, zips"], ["Sizes", "Newborn to 24 months or to your chart"], ["Testing", "Third party lab testing to your market on request"], ["Packing", "Multipacks or single polybag, as specified"]],
    products: [
      { name: "Baby cotton garments", hsn: "62092000", spec: "Cotton · newborn to 24 months", desc: "Rompers, sleepsuits, jhablas and sets in soft cotton, plain or printed." },
      { name: "Baby synthetic garments", hsn: "62093000", spec: "Polyester and synthetics", desc: "Babywear in polyester and other synthetic fibres, such as pram suits, outer layers and winter sets." },
      { name: "Baby other textile garments", hsn: "62099090", spec: "Other textiles to your choice", desc: "Babywear in textiles other than cotton and synthetic fibres, made to your fabric choice." },
    ],
    faqs: [
      ["What counts as a babies' garment for customs?", "Under the Harmonized System, babies' garments are for young children of a body height not exceeding 86 cm. Larger sizes are classified as children's garments under the regular headings."],
      ["Can you arrange product safety testing for babywear?", "Yes. Tell us the destination market and the tests your buyer requires and we arrange testing with a third party laboratory before shipment."],
    ],
  },
  {
    cat: "woven", audience: "Kids", slug: "kidswear", name: "Kids shirts, trousers, dresses and shorts",
    h1: "Kidswear manufacturer: shirts, trousers, dresses and shorts",
    title: "Kidswear Manufacturer India | Shirts, Trousers, Dresses, Shorts",
    meta: "Kids cotton shirts, boys' cotton trousers, girls' cotton dresses and kids shorts made in India to your size chart. HSN 62052090, 62034290, 62044290, 62046290.",
    img: "k-dresses.jpg", alt: "Girls' printed cotton dresses on hangers",
    intro: "We manufacture woven kidswear for export: kids cotton shirts, boys' cotton trousers, girls' cotton dresses and kids cotton shorts, to the buyer's design, print and age sizing.",
    body: [
      "Kids cotton shirts are invoiced under HSN 62052090 and boys' cotton trousers under 62034290. Girls' cotton dresses take 62044290. Kids cotton shorts take 62034290 for boys' styles and 62046290 for girls' styles, which is why both codes appear on that line.",
      "Children's garments often carry trims such as buttons, bows and lace. We secure small parts to pass the pull tests your market may require, and can replace loose trims with printed or embroidered details.",
    ],
    specs: [["Construction", "Woven cotton poplin, oxford, cambric, twill and denim"], ["Details", "Smocking, frills, embroidery, adjustable and elastic waists"], ["Sizes", "2 years to 14 years or to your chart"], ["Trims", "Secured buttons and bows, tested on the sample"], ["Packing", "Single or multipack, polybag, ratio packed"]],
    products: [
      { name: "Kids cotton shirts", hsn: "62052090", spec: "Poplin, oxford, checks", desc: "Casual and occasion shirts in cotton poplin, oxford and checks for boys." },
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
    cat: "outerwear", audience: "Men's", slug: "jackets-blazers-suits", name: "Men's jackets, blazers and suits",
    h1: "Men's jackets, blazers and suits manufacturer for export",
    title: "Men's Jackets, Blazers & Suits Manufacturer India | Export",
    meta: "Cotton and polyester jackets, cotton blazers and cotton suits made in India for importers. Your pattern, fabric and size chart. HSN 62033200, 62033300, 62031200.",
    img: "m-suit.jpg", alt: "Navy tailored blazer over a light blue shirt",
    intro: "We tailor men's outerwear for export: cotton and polyester jackets, cotton blazers and cotton suits. Garments are made to the buyer's pattern, canvas or fusing construction, lining and size chart.",
    body: [
      "Tailored garments are the most construction heavy lines in the catalogue. Tell us whether you want unstructured or structured shoulders, half or full lining, and functional or decorative cuff buttons, and we price accordingly.",
      "Jackets and blazers fall under HSN 6203 by fibre: cotton jackets and blazers under 62033200 and synthetic fibre jackets under 62033300.",
    ],
    specs: [["Construction", "Woven, fused or half canvas, lined or unlined"], ["Fabrics", "Cotton twill, cotton canvas, cotton suiting, polyester shell fabrics and blends"], ["Sizes", "Chest and drop sizing or S to XXL, to your chart"], ["Trims", "Horn, corozo or plastic buttons, zips, branded linings and labels"], ["Packing", "Hanger packed with garment cover, or folded flat"]],
    products: [
      { name: "Men's cotton jackets", hsn: "62033200", spec: "Cotton twill, canvas", desc: "Chore, field, utility and casual jackets in cotton twill and canvas." },
      { name: "Men's polyester jackets", hsn: "62033300", spec: "Polyester shell · lined or padded", desc: "Windcheaters, bombers and padded jackets in polyester shell fabrics." },
      { name: "Men's cotton blazers", hsn: "62033200", spec: "Cotton suiting · lined or unlined", desc: "Unstructured and structured blazers in cotton twill and cotton suiting for smart casual ranges." },
      { name: "Men's cotton suits", hsn: "62031200", spec: "Cotton suiting · two piece", desc: "Two piece suits in cotton suiting, jacket and matching trousers made to your block." },
    ],
    faqs: [
      ["Do you make fully lined blazers?", "Yes. Blazers can be unlined, half lined or fully lined. Tell us the lining fabric or send a reference and we include it in the costing."],
      ["What is the difference between a blazer and a suit jacket for customs?", "A suit is a jacket and trousers of the same fabric sold together, classified under HSN 6203.1x. A separate blazer or jacket is declared under 6203.3x by fibre."],
    ],
  },
];

// ------------------------------------------------------------------
// Export markets
// ------------------------------------------------------------------
export const MARKETS = [
  {
    slug: "usa", name: "United States",
    h1: "Garment exporter from India to the USA",
    title: "Garment Exporter India to USA | Clothing Manufacturer | GoodBiz",
    meta: "Import knits, woven and outerwear from India to the USA. Ready stock or made to order men's and kids' garments, labelled for US requirements.",
    intro: "GoodBiz Apparels supplies US importers, brands and retailers with knits, woven garments and outerwear made in India, from ready stock or produced to the buyer's spec, labelled and documented for US entry.",
    points: [
      ["Labelling", "US textile labelling under the Textile Fiber Products Identification Act requires fibre content, country of origin and the identity of the manufacturer or dealer, often an RN number. Care instructions follow the FTC Care Labeling Rule. Send us your label artwork or RN and we produce labels to match."],
      ["Children's products", "Children's clothing for the US falls under CPSIA requirements such as tracking labels, lead limits and third party testing, with additional flammability rules for sleepwear. Tell us when an order is for children so we plan testing early."],
      ["Tariff", "US duty is set by the HTSUS code, which your customs broker assigns. We give you the Indian 8 digit HSN code for each line so the broker can classify before you order."],
    ],
  },
  {
    slug: "uk", name: "United Kingdom",
    h1: "Garment exporter from India to the UK",
    title: "Garment Exporter India to UK | Clothing Manufacturer | GoodBiz",
    meta: "Import knits, woven and outerwear from India to the UK. Ready stock or made to order men's and kids' garments, labelled for UK fibre rules.",
    intro: "GoodBiz Apparels supplies UK importers, brands and retailers with knits, woven garments and outerwear made in India, from ready stock or to the buyer's spec, labelled for the UK market.",
    points: [
      ["Labelling", "The Textile Products (Labelling and Fibre Composition) Regulations 2012 require accurate fibre composition labels. Care symbols are not legally required in the UK but most retailers expect them. We print labels to your artwork."],
      ["Trade agreement", "India and the UK signed a Comprehensive Economic and Trade Agreement in 2025 that includes textiles and garments. Whether preferential rates apply depends on its entry into force and rules of origin at your shipment date, so confirm with your broker."],
      ["Tariff", "UK duty is set by the UK Global Tariff commodity code. We give the Indian HSN code for each line to help your broker classify."],
    ],
  },
  {
    slug: "europe", name: "European Union",
    h1: "Garment exporter from India to Europe",
    title: "Garment Exporter India to Europe | EU Clothing Manufacturer",
    meta: "Import knits, woven and outerwear from India to Germany, France, the Netherlands and the wider EU. Ready stock or made to order, labelled for EU textile rules.",
    intro: "GoodBiz Apparels supplies importers and brands across the European Union with knits, woven garments and outerwear made in India, from ready stock or produced to the buyer's spec.",
    points: [
      ["Labelling", "Regulation (EU) No 1007/2011 sets the fibre names and composition labelling for textiles sold in the EU, and labels must be in the language of the member state where the goods are sold. Send us your label files per market."],
      ["Chemicals", "REACH Annex XVII restricts certain substances in textiles, including azo dyes that release listed amines. We source dyes and trims to your restricted substances list and can arrange laboratory testing."],
      ["Tariff", "EU duty is set by the Combined Nomenclature code and TARIC. We provide the Indian HSN code per line so your broker can classify before you order."],
    ],
  },
  {
    slug: "uae", name: "UAE and GCC",
    h1: "Garment exporter from India to the UAE and GCC",
    title: "Garment Exporter India to UAE & Dubai | Clothing Manufacturer",
    meta: "Import knits, woven and outerwear from India to Dubai, the UAE and GCC markets. Ready stock or made to order, with HSN codes on every line.",
    intro: "GoodBiz Apparels supplies importers, wholesalers and retailers in the UAE and wider GCC with men's and kids' knits, woven garments and outerwear made in India.",
    points: [
      ["Trade agreement", "The India UAE Comprehensive Economic Partnership Agreement has been in force since May 2022 and offers preferential duty on many Indian goods, including garments, when a valid certificate of origin accompanies the shipment."],
      ["Ready stock for fast turns", "Wholesale buyers in Dubai often need quick replenishment. Ready stock lines can ship without waiting for a production run."],
      ["Labelling", "Labelling requirements can differ by emirate and product. Confirm requirements with your importer of record and we label to your instructions."],
    ],
  },
  {
    slug: "australia", name: "Australia",
    h1: "Garment exporter from India to Australia",
    title: "Garment Exporter India to Australia | Clothing Manufacturer",
    meta: "Import knits, woven and outerwear from India to Australia. Ready stock or made to order garments with care labels for Australian requirements.",
    intro: "GoodBiz Apparels supplies Australian importers, brands and retailers with knits, woven garments and outerwear made in India, from ready stock or produced to the buyer's spec.",
    points: [
      ["Trade agreement", "The India Australia Economic Cooperation and Trade Agreement has been in force since December 2022 and removed Australian tariffs on most Indian textile and garment lines. A certificate of origin is needed to claim the preference."],
      ["Care labelling", "Australia has a mandatory care labelling standard for clothing, enforced by the ACCC. Send us your care instructions and we produce compliant labels."],
      ["Tariff", "Your broker confirms the Australian tariff classification. We provide the Indian HSN code for each line to help."],
    ],
  },
];

// ------------------------------------------------------------------
// Shared FAQs (home + contact + landing pages)
// ------------------------------------------------------------------
export const FAQS = [
  ["Which garments do you make?", "Three constructions: knits (T shirts, polos, kids tees), woven (shirts, trousers, jeans, shorts, babywear and kidswear) and outerwear (jackets, blazers and suits), for men and kids."],
  ["Can I mix ready stock and made to order items in one shipment?", "Yes. Many buyers take some lines from ready stock and have others manufactured to their spec. We consolidate both into one shipment where the timelines allow."],
  ["What do I need to send for a made to order enquiry?", "A design or tech pack, your size chart, fabric and GSM, colours, quantity per size and colour, labelling and packing needs, and the destination port. A reference garment works if you have no tech pack."],
  ["What is the minimum order quantity?", "{{MOQ per style}} for made to order styles. Ready stock depends on the lot, so tell us the quantity you need and we confirm what is available."],
  ["Do you make a sample before bulk production?", "Yes. For custom orders we make a sample to your spec and start bulk production only after you approve it in writing."],
  ["Can you put our brand labels and tags on the garments?", "Yes, on both made to order and ready stock lines. Send your label artwork or the physical labels and we attach them before packing."],
  ["Are the HSN codes in the catalogue final for customs?", "They are the 8 digit codes we use on our export invoices for each product. Your import tariff code can differ by country, so your customs broker confirms the code on your side."],
  ["Which shipping terms do you work on?", "{{shipping terms, for example FOB or CIF}}. Tell us your destination port in the enquiry and we quote on that basis."],
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
  "jackets-blazers-suits": { cut: "men-jackets.webp",  tone: "#D5E2CF" },
};

// Garments orbiting in the home hero (first 9 also show on phones)
export const HERO_ORBS = [
  { cut: "men-tees.webp", tone: "#F2D3C2" },
  { cut: "men-shirts.webp", tone: "#CFDDF2" },
  { cut: "extra-bomber.webp", tone: "#F0CDB8" },
  { cut: "kids-baby.webp", tone: "#CCE0F1" },
  { cut: "men-bottoms.webp", tone: "#F3E3B0" },
  { cut: "polo.webp", tone: "#DDE7D6" },
  { cut: "men-jackets.webp", tone: "#D5E2CF" },
  { cut: "kids-dresses.webp", tone: "#E3D7F1" },
  { cut: "tee-heather.webp", tone: "#CFDDF2" },
  { cut: "jacket-olive.webp", tone: "#E4E0C6" },
  { cut: "kids-tops.webp", tone: "#F7E2A9" },
  { cut: "trousers.webp", tone: "#E2E0DA" },
  { cut: "shirt-camp.webp", tone: "#EADCCB" },
];
