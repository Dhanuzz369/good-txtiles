// ------------------------------------------------------------------
// GoodBiz Apparels — site content model
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
};

// ------------------------------------------------------------------
// Catalogue: 3 categories → 12 product families → 38 lines
// ------------------------------------------------------------------
export const CATEGORIES = [
  {
    key: "men",
    slug: "mens-clothing-manufacturer",
    name: "Men's clothing",
    h1: "Men's clothing manufacturer and exporter in India",
    title: "Men's Clothing Manufacturer & Exporter India | GoodBiz",
    meta: "Shirts, T shirts, polos, trousers, jeans, jackets, blazers and suits for importers. Ready stock or made to your design, size chart and GSM. HSN codes listed.",
    img: "m-shirts.jpg",
    alt: "Folded cotton shirts in white, navy and plum on a wooden board",
    intro: "GoodBiz Apparels manufactures and exports men's woven and knitted garments from India: shirts, T shirts, polos, trousers, jeans, shorts, jackets, blazers and suits. Buyers order from ready stock or send a design, size chart and fabric GSM for production.",
    body: [
      "Men's lines are the core of most export orders we quote. Importers usually start with a shirt or T shirt programme, then add bottoms and outerwear once the first shipment has cleared and sold through.",
      "Every line below carries the 8 digit HSN code we print on the commercial invoice, so your customs broker can check the tariff before you place the order rather than after the goods land.",
    ],
  },
  {
    key: "women",
    slug: "womens-clothing-manufacturer",
    name: "Women's clothing",
    h1: "Women's clothing manufacturer and exporter in India",
    title: "Women's Clothing Manufacturer & Exporter India | GoodBiz",
    meta: "Blouses, dresses, skirts, trousers, jeans, leggings, kurta sets, jackets and blazers. Ready stock or made to your spec. 8 digit HSN codes for every line.",
    img: "w-blouses.jpg",
    alt: "Printed blouses hanging on wooden hangers on a rail",
    intro: "GoodBiz Apparels manufactures and exports women's garments from India: blouses, dresses, skirts, trousers, jeans, shorts, leggings, kurta sets, jackets and blazers, in cotton, polyester and silk. Order from ready stock or have us produce your own design.",
    body: [
      "Women's wear is where buyers most often bring their own prints and fits. We work from your tech pack, your print files or a reference garment, and confirm fabric, GSM and measurements in writing before the sample.",
      "Indian ethnic lines such as cotton kurta sets sit alongside western wear, so a single supplier can cover both for retailers serving diaspora and mainstream customers.",
    ],
  },
  {
    key: "kids",
    slug: "kids-clothing-manufacturer",
    name: "Kids and baby clothing",
    h1: "Kids and baby clothing manufacturer and exporter in India",
    title: "Kids & Baby Clothing Manufacturer India | GoodBiz",
    meta: "Baby garments, kids T shirts, shirts, girls' dresses, boys' trousers and shorts for importers. Ready stock or made to order. HSN codes listed.",
    img: "k-kids.jpg",
    alt: "Children's T shirts and tops displayed on a wall rack",
    intro: "GoodBiz Apparels manufactures and exports babywear and kidswear from India: baby garments in cotton and synthetic fabrics, kids T shirts and shirts, girls' dresses, boys' trousers and shorts. Buyers order from stock or to their own size chart.",
    body: [
      "Children's clothing carries extra compliance work in most markets, from tracking labels to chemical limits. Tell us the destination market in your enquiry and we plan labelling and testing around it from the start.",
      "Customs treats babies' garments as their own heading. Under the Harmonized System notes, they are garments for young children of a body height not exceeding 86 cm, which is why baby lines below use HSN 6209 while larger kids' sizes use the regular headings.",
    ],
  },
];

export const FAMILIES = [
  // ---------------- MEN ----------------
  {
    cat: "men", slug: "shirts", name: "Men's shirts",
    h1: "Men's shirts manufacturer: cotton, handloom, polyester and silk",
    title: "Men's Shirts Manufacturer India: Cotton, Silk, Handloom",
    meta: "Men's formal, handloom, polyester and silk shirts from India. Ready stock or made to your fabric, GSM and size chart. HSN 62052090, 62052010, 62053090, 62059010.",
    img: "m-shirts.jpg", alt: "Folded cotton shirts in white, navy and plum on a wooden board",
    intro: "We manufacture men's woven shirts for export in four fabric groups: cotton formal, cotton handloom, polyester and silk. Shirts are supplied from ready stock or produced to the buyer's fabric, GSM, collar, cuff and size chart.",
    body: [
      "Woven shirts fall under HSN heading 6205. The fourth to eighth digits change with the fibre: cotton shirts take 620520, handloom cotton has its own line, man made fibres take 620530 and silk sits under 620590.",
      "For formal shirts most buyers specify poplin, oxford, twill or dobby weaves. Handloom shirting has a natural slub and is hand woven, which suits resort and premium casual ranges. Polyester shirting is chosen for uniforms and easy care lines; silk for occasion wear.",
    ],
    specs: [["Construction", "Woven"], ["Typical fabric weight", "Silk about 50 to 90 GSM; cotton and polyester shirting about 90 to 160 GSM"], ["Collar options", "Spread, button down, cutaway, mandarin, or as per your tech pack"], ["Sizes", "Graded to your size chart"], ["Labels and packing", "Your brand label, folded with collar support, polybag per piece"]],
    products: [
      { name: "Men's cotton formal shirts", hsn: "62052090", desc: "Poplin, oxford, twill and dobby shirts for office and formal ranges. Solids, stripes and checks, with or without wrinkle resistant finish." },
      { name: "Men's cotton handloom shirts", hsn: "62052010", desc: "Shirts cut from hand woven Indian cotton with a natural slub texture. Suited to resort, linen look and premium casual collections." },
      { name: "Men's polyester shirts", hsn: "62053090", desc: "Easy care shirting in polyester for uniforms, hospitality and value retail, where shape retention and quick drying matter." },
      { name: "Men's silk shirts", hsn: "62059010", desc: "Lightweight silk shirts for occasion and festive wear. Supplied in plain, printed or jacquard silk to your reference." },
    ],
    faqs: [
      ["What HSN code is used for men's cotton shirts?", "We invoice men's woven cotton shirts under HSN 62052090 and hand woven cotton shirts under 62052010. Your import tariff code is confirmed by your customs broker in your country."],
      ["Can you match a shirt fabric I send you?", "Yes. Send a swatch or a reference shirt and we source shirting to the same weave, composition and GSM, then confirm it on a sample before bulk."],
    ],
  },
  {
    cat: "men", slug: "t-shirts-polos", name: "Men's T shirts and polos",
    h1: "Men's T shirts and polo shirts manufacturer for export",
    title: "Men's T Shirt & Polo Manufacturer India | Export",
    meta: "Cotton and polyester T shirts and cotton polo shirts made in India for importers and private labels. Your GSM, print and sizes. HSN 61091000, 61099010.",
    img: "m-tees.jpg", alt: "Folded crew neck T shirts in red, black, white, navy and yellow",
    intro: "We knit, cut and sew men's T shirts in cotton and polyester, and cotton polo shirts, for export and private label programmes. Buyers set the GSM, neck, fit, print and size chart, or pick from ready stock blanks.",
    body: [
      "T shirts are knitted garments under HSN chapter 61. Single jersey is the standard T shirt fabric; polo shirts are usually knitted in pique. Polyester T shirts are typically performance or sports fabrics with moisture management finishes.",
      "GSM is the number most buyers lead with. A lighter tee feels softer and costs less; a heavier tee hangs better and reads as premium. Tell us the GSM you sell today and we match it, or we suggest one for your price point.",
    ],
    specs: [["Construction", "Knitted: single jersey, pique, interlock"], ["Typical fabric weight", "T shirts about 140 to 220 GSM; polos about 180 to 240 GSM"], ["Decoration", "Screen print, DTF, embroidery, or blank"], ["Fits", "Regular, slim, oversized, or your own block"], ["Packing", "Folded, size sticker, polybag, ratio packed cartons"]],
    products: [
      { name: "Men's cotton T shirts", hsn: "61091000", desc: "Crew and V neck tees in combed or carded cotton single jersey. Blanks or printed to your artwork." },
      { name: "Men's polyester T shirts", hsn: "61099010", desc: "Quick dry polyester tees for sportswear, events and uniforms, with sublimation printing available on light colours." },
      { name: "Men's cotton polo shirts", hsn: "61091000", desc: "Pique polo shirts with knitted collar and buttoned placket, plain or with embroidered logo, for retail and corporate wear." },
    ],
    faqs: [
      ["What GSM should I choose for a cotton T shirt?", "Most retail T shirts sit between 160 and 200 GSM. Below 150 GSM feels light and summery; 200 GSM and above reads as heavyweight or premium. We can send fabric swatches at two or three weights before you decide."],
      ["Do you print or embroider logos on T shirts and polos?", "Yes. Screen printing, DTF and embroidery are available. Send your artwork with Pantone references and placement measurements."],
    ],
  },
  {
    cat: "men", slug: "trousers-jeans-shorts", name: "Men's trousers, jeans and shorts",
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
      { name: "Men's cotton trousers", hsn: "62034290", desc: "Chinos and casual trousers in cotton twill and canvas, regular, slim or tapered, with or without stretch." },
      { name: "Men's cotton jeans", hsn: "62034290", desc: "Five pocket denim jeans in rigid or stretch denim, finished to your wash standard." },
      { name: "Men's polyester trousers", hsn: "62034300", desc: "Formal and uniform trousers in polyester suiting that keep their crease and resist wrinkles." },
      { name: "Men's cotton shorts", hsn: "62034290", desc: "Chino, cargo and denim shorts for summer ranges, cut from the same fabrics as our trousers." },
    ],
    faqs: [
      ["Can you produce jeans to my wash standard?", "Yes. Send a physical wash standard or a reference pair and we match it on the sample. Approved wash standards are kept for bulk comparison."],
      ["Are jeans and cotton trousers the same HSN code?", "On our invoices, men's cotton trousers, jeans and shorts are all declared under 62034290, because the code follows the garment type and fibre rather than the weave."],
    ],
  },
  {
    cat: "men", slug: "jackets-blazers-suits", name: "Men's jackets, blazers and suits",
    h1: "Men's jackets, blazers and suits manufacturer for export",
    title: "Men's Jackets, Blazers & Suits Manufacturer India | Export",
    meta: "Cotton and polyester jackets, cotton blazers and cotton suits made in India for importers. Your pattern, fabric and size chart. HSN 62033200, 62033300, 62031200.",
    img: "m-suit.jpg", alt: "Navy tailored blazer over a light blue shirt",
    intro: "We tailor men's outerwear for export: cotton and polyester jackets, cotton blazers and cotton suits. Garments are made to the buyer's pattern, canvas or fusing construction, lining and size chart.",
    body: [
      "Tailored garments are the most construction heavy lines in the catalogue. Tell us whether you want unstructured or structured shoulders, half or full lining, and functional or decorative cuff buttons, and we price accordingly.",
      "Jackets and blazers fall under HSN 6203 by fibre: cotton jackets and blazers under 62033200 and synthetic fibre jackets under 62033300.",
    ],
    specs: [["Construction", "Woven, fused or half canvas, lined or unlined"], ["Fabrics", "Cotton twill, cotton canvas, cotton suiting, polyester and blends"], ["Sizes", "Chest and drop sizing or S to XXL, to your chart"], ["Trims", "Horn, corozo or plastic buttons, branded linings and labels"], ["Packing", "Hanger packed with garment cover, or folded flat"]],
    products: [
      { name: "Men's cotton jackets", hsn: "62033200", desc: "Chore, field, trucker and casual jackets in cotton twill, canvas and denim." },
      { name: "Men's polyester jackets", hsn: "62033300", desc: "Windcheaters, bombers and padded jackets in polyester shell fabrics." },
      { name: "Men's cotton blazers", hsn: "62033200", desc: "Unstructured and structured blazers in cotton twill and cotton suiting for smart casual ranges." },
      { name: "Men's cotton suits", hsn: "62031200", desc: "Two piece suits in cotton suiting, jacket and matching trousers made to your block." },
    ],
    faqs: [
      ["Do you make fully lined blazers?", "Yes. Blazers can be unlined, half lined or fully lined. Tell us the lining fabric or send a reference and we include it in the costing."],
      ["What is the difference between a blazer and a suit jacket for customs?", "A suit is a jacket and trousers of the same fabric sold together, classified under HSN 6203.1x. A separate blazer or jacket is declared under 6203.3x by fibre."],
    ],
  },
  // ---------------- WOMEN ----------------
  {
    cat: "women", slug: "blouses", name: "Women's blouses",
    h1: "Women's blouses manufacturer: cotton, polyester and silk",
    title: "Women's Blouses Manufacturer & Exporter India | Cotton, Silk",
    meta: "Cotton, polyester and silk blouses and tops made in India for importers. Your prints, fits and size chart, or ready stock. HSN 62063090, 62064000, 62061010.",
    img: "w-blouses.jpg", alt: "Printed blouses hanging on wooden hangers on a rail",
    intro: "We manufacture women's woven blouses and tops for export in cotton, polyester and silk. Buyers send their prints, necklines and size chart, or choose from ready stock styles.",
    body: [
      "Blouses are woven garments under HSN heading 6206, split by fibre: silk under 620610, cotton under 620630 and man made fibres under 620640.",
      "Prints are where most blouse programmes win or lose. We print to your files with strike offs for colour approval, and we can block print or screen print cotton for a hand made finish.",
    ],
    specs: [["Construction", "Woven: voile, cambric, poplin, georgette, crepe, satin"], ["Typical fabric weight", "Cotton about 70 to 130 GSM; polyester georgette and crepe about 60 to 120 GSM"], ["Prints", "Digital, rotary, screen or block print to your artwork"], ["Details", "Embroidery, pintucks, lace and smocking on request"], ["Packing", "Folded or hanger packed, polybag, ratio packed"]],
    products: [
      { name: "Women's cotton blouses", hsn: "62063090", desc: "Breathable tops and shirts in cotton voile, cambric and poplin, plain, printed or embroidered." },
      { name: "Women's polyester blouses", hsn: "62064000", desc: "Fluid blouses in polyester georgette, crepe and satin for workwear and occasion ranges." },
      { name: "Women's silk blouses", hsn: "62061010", desc: "Silk shirts and tops in crepe de chine, satin and Indian silks for premium collections." },
    ],
    faqs: [
      ["Can you print my own designs on blouses?", "Yes. Send print files with colour references. We produce strike offs for approval, then a sample garment, before bulk printing."],
      ["Which HSN code applies to women's cotton blouses?", "We invoice women's woven cotton blouses under HSN 62063090. Your import tariff code is confirmed by your customs broker."],
    ],
  },
  {
    cat: "women", slug: "dresses-skirts", name: "Women's dresses and skirts",
    h1: "Women's dresses and skirts manufacturer for export",
    title: "Women's Dresses & Skirts Manufacturer India | Cotton, Polyester",
    meta: "Cotton and polyester dresses and cotton skirts made in India to your design, print and size chart. Ready stock available. HSN 62044290, 62044390, 62045200.",
    img: "w-dress.jpg", alt: "Yellow tiered cotton dress with an embroidered neckline on a form",
    intro: "We manufacture women's dresses in cotton and polyester, and cotton skirts, for export and private label. Styles are produced to the buyer's pattern, print and size chart, or supplied from ready stock.",
    body: [
      "Dresses are classified under HSN 6204.4x by fibre and skirts under 6204.5x. Cotton dresses take 62044290, synthetic fibre dresses 62044390 and cotton skirts 62045200 on our invoices.",
      "Tiered, smocked and embroidered cotton dresses are a strength of Indian production. Send your reference and we suggest construction that holds the look at your target price.",
    ],
    specs: [["Construction", "Woven: cambric, voile, poplin, georgette, crepe"], ["Details", "Tiers, smocking, embroidery, lace and lining as specified"], ["Lengths", "Mini, midi and maxi to your measurements"], ["Sizes", "XS to XXL or numeric, graded to your chart"], ["Packing", "Hanger or folded, polybag, ratio packed"]],
    products: [
      { name: "Women's cotton dresses", hsn: "62044290", desc: "Day, summer and resort dresses in cotton cambric, voile and poplin, printed or embroidered." },
      { name: "Women's polyester dresses", hsn: "62044390", desc: "Occasion and workwear dresses in polyester georgette and crepe with lining where needed." },
      { name: "Women's cotton skirts", hsn: "62045200", desc: "A line, tiered, wrap and pencil skirts in cotton, plain, printed or denim." },
    ],
    faqs: [
      ["Can a dress style be lined?", "Yes. Dresses in sheer fabrics such as voile or georgette are usually half or fully lined. We include lining in the costing once you confirm it."],
      ["Do you make matching skirts and tops from the same print?", "Yes. Coordinated sets are cut from the same fabric lot so the colour matches across pieces."],
    ],
  },
  {
    cat: "women", slug: "trousers-jeans-leggings", name: "Women's trousers, jeans, shorts and leggings",
    h1: "Women's trousers, jeans, shorts and leggings manufacturer",
    title: "Women's Trousers, Jeans & Leggings Manufacturer India | Export",
    meta: "Cotton and polyester trousers, cotton jeans, shorts and cotton leggings made in India for importers. Your fit and size chart. HSN 62046290, 62046300, 61046200.",
    img: "w-trousers.jpg", alt: "Olive cotton trousers with a drawstring waist",
    intro: "We manufacture women's bottoms for export: cotton and polyester trousers, cotton jeans, cotton shorts and knitted cotton leggings. Each is produced to the buyer's fit, fabric and size chart, or supplied from ready stock.",
    body: [
      "Woven women's trousers, jeans and shorts are classified under HSN 6204.6x: cotton under 62046290 and synthetic fibre under 62046300. Leggings are knitted, so they move to chapter 61 under 61046200.",
      "For leggings, stretch recovery and opacity are what buyers test first. We knit cotton with elastane at the GSM you set and run a squat test on the sample before bulk.",
    ],
    specs: [["Construction", "Woven twill, linen look cotton, denim, suiting; knitted cotton elastane jersey for leggings"], ["Typical fabric weight", "Leggings about 180 to 260 GSM; trousers about 150 to 300 GSM"], ["Waists", "Drawstring, elasticated, button and zip, as specified"], ["Sizes", "Graded to your chart, including petite and plus ranges"], ["Packing", "Folded, size tags, polybag, ratio packed"]],
    products: [
      { name: "Women's cotton trousers", hsn: "62046290", desc: "Wide leg, straight and tapered trousers in cotton twill and linen look cotton." },
      { name: "Women's polyester trousers", hsn: "62046300", desc: "Tailored and workwear trousers in polyester suiting and crepe." },
      { name: "Women's cotton jeans", hsn: "62046290", desc: "Skinny, straight, mom and wide leg jeans in rigid or stretch denim, washed to your standard." },
      { name: "Women's cotton shorts", hsn: "62046290", desc: "Denim, chino and paperbag waist shorts for summer ranges." },
      { name: "Women's cotton leggings", hsn: "61046200", desc: "Ankle and full length leggings in cotton elastane jersey with a covered waistband." },
    ],
    faqs: [
      ["Why are leggings a different HSN chapter from trousers?", "Leggings are knitted, so they fall under chapter 61 (knitted garments) at 61046200, while woven trousers, jeans and shorts fall under chapter 62."],
      ["Can you make plus size ranges?", "Yes. Send your plus size measurement chart and we grade the pattern for it rather than scaling up the standard sizes."],
    ],
  },
  {
    cat: "women", slug: "kurta-sets-t-shirts", name: "Women's kurta sets and T shirts",
    h1: "Women's cotton kurta sets and T shirts manufacturer",
    title: "Cotton Kurta Set Manufacturer & Exporter India | Women's T Shirts",
    meta: "Women's cotton kurta sets and cotton T shirts made in India for importers and diaspora retailers. Your prints and size chart. HSN 62114290, 61091000.",
    img: "w-kurta.jpg", alt: "Printed cotton kurta with a mandarin collar",
    intro: "We manufacture women's cotton kurta sets and cotton T shirts for export. Kurta sets are produced with matching bottoms and optional dupatta in the buyer's prints and size chart.",
    body: [
      "Kurta sets are invoiced under HSN 62114290, a heading for other garments of cotton, because a set does not fit the dress, blouse or trouser headings on its own. Cotton T shirts are knitted and invoiced under 61091000.",
      "Indian block prints, hand embroidery and mirror work are typical finishes for kurta sets. We advise which finishes hold up to retail washing and which are best kept for premium lines.",
    ],
    specs: [["Construction", "Woven cotton cambric, voile and slub for kurta sets; knitted jersey for T shirts"], ["Set components", "Kurta, pants or palazzo, optional dupatta"], ["Finishes", "Block print, screen print, embroidery, mirror work"], ["Sizes", "XS to XXL or to your chart"], ["Packing", "Set packed in one polybag with a size tag on each piece"]],
    products: [
      { name: "Women's cotton kurta sets", hsn: "62114290", desc: "Kurta with matching pants or palazzo, with or without dupatta, in printed or embroidered cotton." },
      { name: "Women's cotton T shirts", hsn: "61091000", desc: "Fitted, regular and boxy tees in cotton single jersey, blank or printed to your artwork." },
    ],
    faqs: [
      ["Can kurta sets be supplied without the dupatta?", "Yes. Two piece and three piece sets are both available. Tell us the components in your enquiry."],
      ["Which HSN code is used for cotton kurta sets?", "We invoice women's cotton kurta sets under HSN 62114290. Your customs broker confirms the tariff code in your country."],
    ],
  },
  {
    cat: "women", slug: "jackets-blazers", name: "Women's jackets and blazers",
    h1: "Women's cotton jackets and blazers manufacturer",
    title: "Women's Jackets & Blazers Manufacturer India | Cotton | Export",
    meta: "Women's cotton jackets and blazers made in India to your pattern, lining and size chart for importers and private labels. HSN 62043200.",
    img: "w-blazer.jpg", alt: "Houndstooth blazer layered over a printed blouse",
    intro: "We tailor women's cotton jackets and blazers for export, made to the buyer's pattern, lining, closure and size chart.",
    body: [
      "Women's cotton jackets and blazers are both invoiced under HSN 62043200. Cotton twill, canvas, denim and textured weaves like houndstooth are the most requested fabrics.",
      "Shoulder shape and sleeve pitch define how a blazer reads on the shop floor. We fit the sample on a form to your block and share photos front, side and back for comments.",
    ],
    specs: [["Construction", "Woven, fused, lined or unlined"], ["Fabrics", "Cotton twill, canvas, denim, textured cotton weaves"], ["Closures", "Single or double breasted, open front, zip"], ["Sizes", "Graded to your chart"], ["Packing", "Hanger packed with cover, or folded flat"]],
    products: [
      { name: "Women's cotton jackets", hsn: "62043200", desc: "Utility, denim, cropped and shacket styles in cotton twill and canvas." },
      { name: "Women's cotton blazers", hsn: "62043200", desc: "Single and double breasted blazers in cotton suiting and textured weaves, lined or unlined." },
    ],
    faqs: [
      ["Can you match a blazer fit from another brand?", "Send the reference garment and your size chart. We take measurements from it, adjust to your chart and fit the sample on a form before bulk."],
    ],
  },
  // ---------------- KIDS ----------------
  {
    cat: "kids", slug: "baby-clothes", name: "Baby clothes",
    h1: "Baby clothes manufacturer and exporter in India",
    title: "Baby Clothes Manufacturer & Exporter India | Cotton Babywear",
    meta: "Cotton, synthetic and other textile baby garments made in India for importers. Bodysuits, rompers, sets. Your size chart. HSN 62092000, 62093000, 62099090.",
    img: "k-baby.jpg", alt: "Folded cotton baby garments in a woven basket",
    intro: "We manufacture baby garments for export in cotton, synthetic fibres and other textiles, including bodysuits, rompers, sleepsuits, tops and sets. Garments are made to the buyer's size chart, from newborn upward.",
    body: [
      "Babies' garments have their own HSN heading, 6209, defined in the Harmonized System as garments for young children of a body height not exceeding 86 cm. Cotton babywear is invoiced under 62092000, synthetic fibres under 62093000 and other textile materials under 62099090.",
      "Babywear buyers ask first about softness, snaps and chemical safety. We use nickel free snaps on request, soft binding at necklines and can arrange third party testing to your market's requirements.",
    ],
    specs: [["Fabrics", "Cotton interlock, rib, muslin and jersey; polyester fleece; other textiles on request"], ["Typical fabric weight", "Cotton interlock and rib about 160 to 220 GSM; muslin about 60 to 100 GSM"], ["Closures", "Nickel free snaps, envelope necks, zips"], ["Sizes", "Newborn to 24 months or to your chart"], ["Packing", "Multipacks or single polybag, as specified"]],
    products: [
      { name: "Baby cotton garments", hsn: "62092000", desc: "Bodysuits, rompers, sleepsuits, jhablas and sets in soft cotton, plain or printed." },
      { name: "Baby synthetic garments", hsn: "62093000", desc: "Fleece and polyester babywear such as pram suits, jackets and winter sets." },
      { name: "Baby other textile garments", hsn: "62099090", desc: "Babywear in textiles other than cotton and synthetic fibres, made to your fabric choice." },
    ],
    faqs: [
      ["What counts as a babies' garment for customs?", "Under the Harmonized System, babies' garments are for young children of a body height not exceeding 86 cm. Larger sizes are classified as children's garments under the regular men's, boys', women's or girls' headings."],
      ["Can you arrange product safety testing for babywear?", "Yes. Tell us the destination market and the tests your buyer requires and we arrange testing with a third party laboratory before shipment."],
    ],
  },
  {
    cat: "kids", slug: "kids-t-shirts-shirts", name: "Kids T shirts and shirts",
    h1: "Kids T shirts and shirts manufacturer for export",
    title: "Kids T Shirts & Shirts Manufacturer India | Cotton | Export",
    meta: "Kids cotton T shirts and cotton shirts made in India for importers. Prints, sizes and labels to your spec, or ready stock. HSN 61091000, 62052090.",
    img: "k-kids.jpg", alt: "Children's T shirts and tops displayed on a wall rack",
    intro: "We manufacture kids cotton T shirts and cotton shirts for export, printed or plain, to the buyer's age sizing and artwork.",
    body: [
      "Kids cotton T shirts are knitted and invoiced under HSN 61091000. Boys' woven cotton shirts are invoiced under 62052090.",
      "Kidswear prints need to survive repeated washing. We test print adhesion and colour fastness on the sample and recommend inks suited to children's products.",
    ],
    specs: [["Construction", "Knitted single jersey for tees; woven poplin and oxford for shirts"], ["Typical fabric weight", "T shirts about 140 to 180 GSM"], ["Decoration", "Screen print, puff print, DTF, embroidery, appliqué"], ["Sizes", "2 years to 14 years or to your chart"], ["Packing", "Single or multipack, size stickers, polybag"]],
    products: [
      { name: "Kids cotton T shirts", hsn: "61091000", desc: "Graphic and plain tees in soft cotton jersey for boys and girls." },
      { name: "Kids cotton shirts", hsn: "62052090", desc: "Casual and occasion shirts in cotton poplin, oxford and checks." },
    ],
    faqs: [
      ["What age sizes do you produce for kids T shirts?", "Typically 2 to 14 years, but we grade to your own size chart if your market uses height based or other sizing."],
    ],
  },
  {
    cat: "kids", slug: "girls-dresses-kids-bottoms", name: "Girls' dresses and kids bottoms",
    h1: "Girls' dresses, boys' trousers and kids shorts manufacturer",
    title: "Girls' Dresses & Kids Trousers Manufacturer India | Export",
    meta: "Girls' cotton dresses, boys' cotton trousers and kids cotton shorts made in India to your size chart. HSN 62044290, 62034290, 62046290.",
    img: "k-dresses.jpg", alt: "Girls' printed cotton dresses on hangers",
    intro: "We manufacture girls' cotton dresses, boys' cotton trousers and kids cotton shorts for export, to the buyer's design, print and age sizing.",
    body: [
      "Girls' cotton dresses are invoiced under HSN 62044290 and boys' cotton trousers under 62034290. Kids cotton shorts take 62034290 for boys' styles and 62046290 for girls' styles, which is why both codes appear on that line.",
      "Children's dresses often carry trims such as bows, buttons and lace. We secure small parts to pass pull tests your market may require and can replace loose trims with printed or embroidered details.",
    ],
    specs: [["Construction", "Woven cotton cambric, poplin, twill and denim"], ["Details", "Smocking, frills, embroidery, elastic waists"], ["Sizes", "2 years to 14 years or to your chart"], ["Trims", "Secured buttons and bows, tested on the sample"], ["Packing", "Single or multipack, polybag, ratio packed"]],
    products: [
      { name: "Girls cotton dresses", hsn: "62044290", desc: "Printed, smocked and tiered cotton dresses for everyday and occasion wear." },
      { name: "Boys cotton trousers", hsn: "62034290", desc: "Chinos, joggers in woven cotton and denim trousers with adjustable waists." },
      { name: "Kids cotton shorts", hsn: "62034290 / 62046290", desc: "Twill, denim and pull on shorts for boys (62034290) and girls (62046290)." },
    ],
    faqs: [
      ["Why does kids shorts show two HSN codes?", "Boys' shorts are classified with men's and boys' trousers (62034290) and girls' shorts with women's and girls' trousers (62046290). The invoice lists each by style."],
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
    meta: "Import clothing from India to the USA. Ready stock or made to order shirts, tees, bottoms, dresses and kidswear, labelled for US requirements. HSN codes listed.",
    intro: "GoodBiz Apparels supplies US importers, brands and retailers with garments made in India, from ready stock or produced to the buyer's spec, labelled and documented for US entry.",
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
    meta: "Import clothing from India to the UK. Ready stock or made to order menswear, womenswear and kidswear, labelled for UK fibre rules. HSN codes listed.",
    intro: "GoodBiz Apparels supplies UK importers, brands and retailers with garments made in India, from ready stock or to the buyer's spec, labelled for the UK market.",
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
    meta: "Import clothing from India to Germany, France, the Netherlands and the wider EU. Ready stock or made to order, labelled for EU textile rules. HSN codes listed.",
    intro: "GoodBiz Apparels supplies importers and brands across the European Union with garments made in India, from ready stock or produced to the buyer's spec.",
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
    meta: "Import clothing from India to Dubai, the UAE and GCC markets. Ready stock or made to order garments and kurta sets, with HSN codes on every line.",
    intro: "GoodBiz Apparels supplies importers, wholesalers and retailers in the UAE and wider GCC with garments made in India, including western wear and Indian ethnic lines such as kurta sets.",
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
    meta: "Import clothing from India to Australia. Ready stock or made to order garments with care labels for Australian requirements. HSN codes on every line.",
    intro: "GoodBiz Apparels supplies Australian importers, brands and retailers with garments made in India, from ready stock or produced to the buyer's spec.",
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
  ["Can I mix ready stock and made to order items in one shipment?", "Yes. Many buyers take some lines from ready stock and have others manufactured to their spec. We consolidate both into one shipment where the timelines allow."],
  ["What do I need to send for a made to order enquiry?", "A design or tech pack, your size chart, fabric and GSM, colours, quantity per size and colour, labelling and packing needs, and the destination port. A reference garment works if you have no tech pack."],
  ["What is the minimum order quantity?", `${"{{MOQ per style}}"} for made to order styles. Ready stock depends on the lot, so tell us the quantity you need and we confirm what is available.`],
  ["Do you make a sample before bulk production?", "Yes. For custom orders we make a sample to your spec and start bulk production only after you approve it in writing."],
  ["Can you put our brand labels and tags on the garments?", "Yes, on both made to order and ready stock lines. Send your label artwork or the physical labels and we attach them before packing."],
  ["Are the HSN codes in the catalogue final for customs?", "They are the 8 digit codes we use on our export invoices for each product. Your import tariff code can differ by country, so your customs broker confirms the code on your side."],
  ["Which shipping terms do you work on?", `${"{{shipping terms, for example FOB or CIF}}"}. Tell us your destination port in the enquiry and we quote on that basis.`],
  ["How do I pay?", `${"{{payment terms}}"}. Terms are confirmed in the proforma invoice before production or dispatch.`],
];
