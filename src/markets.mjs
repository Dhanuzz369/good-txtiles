// Export market pages.
// `points` hold [heading, html]. The html may use <p>, <ul><li>, <strong> and
// <a href> to official sources only. `faqs` are [question, answer] in plain text.
// `sources` are [label, url] for the official pages the content relies on.
// Regulatory and trade facts were checked against official sources on the
// date in MARKETS_REVIEWED. Re-check duty, trade agreement and conformity
// rules before changing them; they move often.
// ------------------------------------------------------------------
// Export markets
// ------------------------------------------------------------------
export const MARKETS_REVIEWED = "2026-11-08";

export const MARKETS = [
  {
    slug: "usa",
    name: "United States",
    short: "the USA",
    h1: "Garment exporter from India to the USA",
    title: "Garment Exporter India to USA | GoodBiz Apparels",
    meta: "Knits, woven garments and jackets made in India for US importers. FTC labels, CPSC children's rules, UFLPA cotton records and HSN codes on every line.",
    intro: "GoodBiz Apparels supplies US importers, brands and retailers with men's and kids' knits, woven garments and jackets made in India through our partner factories. We work from ready stock or to your spec, and we label and document each order for US entry. Bulk production starts only after you approve the sample in writing.",
    points: [
      ["How US duty is built up", `<p>Duty starts with the 10-digit HTSUS code your customs broker assigns. Check the general rate on the <a href="https://hts.usitc.gov/">USITC Harmonized Tariff Schedule</a>. Additional duties on Indian goods changed several times in 2025 and 2026, so check <a href="https://www.cbp.gov/trade/programs-administration/trade-remedies">CBP's trade remedies page</a> before you price. Every invoice line carries the Indian 8-digit HSN code to help your broker classify.</p>`],
      ["Labels the FTC requires", `<p>Under the Textile Fiber Products Identification Act, each garment needs fibre content, country of origin and the name or RN of the responsible US company. The FTC issues RNs only to US businesses, so the RN must be yours. On garments with a neck, the 'Made in India' label goes inside the centre of the neck. The FTC Care Labeling Rule requires permanent care instructions. See the <a href="https://www.ftc.gov/business-guidance/resources/threading-your-way-through-labeling-requirements-under-textile-wool-acts">FTC labelling guide</a>.</p>`],
      ["Children's clothing, age 12 and under", `<ul><li>The US importer issues a <a href="https://www.cpsc.gov/Business--Manufacturing/Testing-Certification/Childrens-Product-Certificate">Children's Product Certificate</a> based on tests by a CPSC-accepted third-party lab.</li><li>Lead limits apply to paint and coatings (90 ppm) and to accessible parts such as buttons and zips (100 ppm).</li><li>Permanent tracking labels on garment and packaging show the maker or private labeler, place and date of production, and batch.</li><li>Neck or hood drawstrings on upper outerwear in sizes 2T to 12 are a substantial hazard under 16 CFR 1120.</li></ul><p>Since 8 July 2026, importers of most CPSC-regulated products must eFile certificate data with CBP.</p>`],
      ["Flammability", `<p>All clothing textiles must meet 16 CFR 1610. Plain-surface fabrics of 2.6 oz per square yard or more, and fabrics made only of fibres such as polyester, nylon, acrylic or wool, are exempt from testing.</p>`],
      ["Cotton traceability (UFLPA)", `<p>CBP presumes that goods made wholly or partly in Xinjiang, or by entities on the UFLPA Entity List, are barred from entry. Apparel and cotton are high-priority sectors. Ask at enquiry which fabric and yarn records are available for each style. See <a href="https://www.cbp.gov/trade/forced-labor/UFLPA">CBP's UFLPA page</a>.</p>`],
      ["Documents, ports and transit", `<p>Each shipment carries a commercial invoice, packing list and bill of lading or air waybill. For sea freight, your broker files the Importer Security Filing at least 24 hours before the container is loaded in India. We ship from Nhava Sheva (JNPT), Mundra or Chennai, or by air from Bengaluru (BLR). Sea transit is typically about 4 to 7 weeks, depending on the US coast and transhipment.</p>`],
      ["What to send us", `<ul><li>Label artwork with your RN or company name, fibre content and care text</li><li>The age grade of any children's style and the lab you use for CPSC testing</li><li>Your HTSUS code, if your broker has one, and importer of record details</li><li>Destination port and Incoterm</li></ul>`],
    ],
    faqs: [
      ["Can you put our RN number on the labels?", "Yes. Send your RN or company name with your label artwork and we produce labels to match. The FTC issues RNs only to US businesses, so the RN has to be yours, not ours."],
      ["Who issues the Children's Product Certificate for kids' styles?", "The US importer or domestic manufacturer issues it, based on tests by a CPSC-accepted third-party laboratory. We supply samples for that testing and print the tracking labels to your format."],
      ["What duty will we pay on T-shirts from India?", "It depends on the HTSUS code and on any additional duties in force on the entry date. Check the general rate at hts.usitc.gov and the current additional duties on CBP's trade remedies page, or ask your customs broker. We give the Indian HSN code for each line to help."],
    ],
    sources: [
      ["USITC Harmonized Tariff Schedule", "https://hts.usitc.gov/"],
      ["CBP: trade remedies and additional duties", "https://www.cbp.gov/trade/programs-administration/trade-remedies"],
      ["FTC: Threading Your Way Through the Labeling Requirements", "https://www.ftc.gov/business-guidance/resources/threading-your-way-through-labeling-requirements-under-textile-wool-acts"],
      ["CPSC: Children's Product Certificate", "https://www.cpsc.gov/Business--Manufacturing/Testing-Certification/Childrens-Product-Certificate"],
      ["CPSC: clothing FAQ (lead, tracking labels, 16 CFR 1610)", "https://www.cpsc.gov/FAQ/Clothing"],
      ["CBP: Uyghur Forced Labor Prevention Act", "https://www.cbp.gov/trade/forced-labor/UFLPA"],
    ],
  },
  {
    slug: "uk",
    name: "United Kingdom",
    short: "the UK",
    h1: "Garment exporter from India to the UK",
    title: "Garment Exporter India to UK | GoodBiz Apparels",
    meta: "Knits, woven garments and jackets made in India for UK buyers. UK-India CETA in force since July 2026, fibre labels to UK rules, HSN codes on every line.",
    intro: "GoodBiz Apparels supplies UK importers, brands and retailers with men's and kids' knits, woven garments and jackets made in India through our partner factories. Since 15 July 2026, garments that meet the UK-India trade agreement's rules of origin can enter the UK duty free. We label and document each order to UK rules.",
    points: [
      ["Duty and the UK-India CETA", `<p>The UK-India Comprehensive Economic and Trade Agreement (CETA) entered into force on 15 July 2026. On the <a href="https://www.trade-tariff.service.gov.uk/">UK Trade Tariff</a>, the garment codes we checked, such as cotton T-shirts, knitted shirts and men's trousers, show 0% for India against a 12% third-country rate. The 0% rate applies only if the goods meet the agreement's rules of origin and your importer claims it with valid proof. Import VAT is charged on top, but young children's clothing is zero-rated under <a href="https://www.gov.uk/guidance/vat-on-young-childrens-clothing-and-footwear-notice-714">VAT Notice 714</a>.</p>`],
      ["Proof of origin", `<p>The UK tariff lists three proofs for CETA claims: an origin declaration, a certificate of origin, or importer's knowledge. Tell us which one your importer will use before shipment, so the origin paperwork matches the invoice and packing list.</p>`],
      ["Labelling", `<p>Fibre content labels are compulsory under the Textile Products (Labelling and Fibre Composition) Regulations 2012, using the permitted fibre names. Where a garment has parts with different fibres, each part's content is shown. Care labels are not required by UK law, but most UK retailers ask for them. See the <a href="https://www.gov.uk/guidance/textile-labelling">GOV.UK textile labelling guidance</a>.</p>`],
      ["Product safety and children's wear", `<p>In Great Britain, the <a href="https://www.gov.uk/government/publications/general-product-safety-regulations-2005/general-product-safety-regulations-2005-great-britain">General Product Safety Regulations 2005</a> allow only safe products on the market. In Northern Ireland, the EU General Product Safety Regulation 2023/988 applies instead. For children's clothing, BS EN 14682 sets the rules for cords and drawstrings up to age 14. Tell us the age range and we check hoods, necklines and waists against it at sample stage.</p>`],
      ["Chemicals under UK REACH", `<p>UK REACH, run by the <a href="https://www.hse.gov.uk/reach/">Health and Safety Executive</a>, restricts certain substances in textiles, such as azo dyes that can release listed aromatic amines. Send us your restricted substances list and we pass it to the fabric mill and dye house. Lab testing can be arranged before shipment.</p>`],
      ["Documents, ports and transit", `<p>Your importer needs a GB EORI number. Each shipment carries a commercial invoice with the HSN code on every line, a packing list, the bill of lading or air waybill, and the proof of origin you chose. We ship from Nhava Sheva (JNPT), Mundra or Chennai to Felixstowe, Southampton or London Gateway. Sea transit is typically about 4 to 7 weeks, depending on routing. Air freight leaves from Bengaluru (BLR).</p>`],
      ["What to send us", `<ul><li>Label artwork with fibre composition, plus care text if your retailer wants it</li><li>UK importer name, address and EORI number</li><li>The UK commodity code, if you have one, and your chosen proof of origin</li><li>Age range for children's styles and your restricted substances list</li></ul>`],
    ],
    faqs: [
      ["Is there import duty on Indian garments in the UK now?", "Since 15 July 2026, garments that meet the UK-India CETA rules of origin can enter at 0% when your importer claims the preference with valid proof of origin. Without a valid claim, the third-country rate applies, which is 12% on the garment codes we checked. Confirm your code on the UK Trade Tariff."],
      ["Do garments sold in the UK need care labels?", "No. UK law requires fibre content labelling, not care labels. Most UK retailers still ask for care instructions, so send us your care text or symbols and we print them with the fibre label."],
      ["Do children's clothes pay import VAT in the UK?", "Clothing designed for young children, within HMRC's size limits, is zero-rated for VAT under VAT Notice 714. Adult sizes pay the standard rate. Your importer or accountant confirms which styles qualify."],
    ],
    sources: [
      ["UK Trade Tariff (GOV.UK)", "https://www.trade-tariff.service.gov.uk/"],
      ["GOV.UK: UK-India CETA Chapter 3, rules of origin", "https://www.gov.uk/government/publications/uk-india-ceta-chapter-3-rules-of-origin"],
      ["GOV.UK: textile labelling", "https://www.gov.uk/guidance/textile-labelling"],
      ["GOV.UK: General Product Safety Regulations 2005, Great Britain", "https://www.gov.uk/government/publications/general-product-safety-regulations-2005/general-product-safety-regulations-2005-great-britain"],
      ["HSE: UK REACH", "https://www.hse.gov.uk/reach/"],
      ["HMRC: VAT on young children's clothing (Notice 714)", "https://www.gov.uk/guidance/vat-on-young-childrens-clothing-and-footwear-notice-714"],
    ],
  },
  {
    slug: "europe",
    name: "European Union",
    short: "Europe",
    h1: "Garment exporter from India to Europe",
    title: "Garment Exporter India to Europe | GoodBiz Apparels",
    meta: "Knits, woven garments and jackets made in India for EU importers. Fibre labels in each market's language, GPSR and REACH support, HSN codes on every line.",
    intro: "GoodBiz Apparels supplies importers and brands across the European Union with men's and kids' knits, woven garments and jackets made in India through our partner factories. The EU-India free trade agreement is concluded but not yet in force, so check the current duty for each code. We label each order in the languages of your selling countries.",
    points: [
      ["How EU duty is built up", `<p>Duty depends on the CN code and origin. The garment codes we checked, such as T-shirts, shirts, trousers and jackets, carry the EU's 12% third-country duty. Indian garments can still claim the EU's GSP rate, 9.6% on those codes: India's GSP suspension for 2026 to 2028 under <a href="https://eur-lex.europa.eu/eli/reg_impl/2025/1909/oj">Commission Implementing Regulation (EU) 2025/1909</a> covers the textiles section (S-11a) but not articles of apparel and clothing accessories (S-11b). Claiming GSP needs a statement on origin from an exporter registered in the EU's REX system. GSP coverage can change, so check your code on <a href="https://trade.ec.europa.eu/access-to-markets/en/home">Access2Markets</a>. Import VAT is added at the rate of the member state.</p>`],
      ["EU-India FTA status", `<p>The EU and India concluded negotiations on a free trade agreement on 27 January 2026. In September 2026 the Commission sent its proposals for signature and conclusion to the Council. It is not in force, so no FTA rate applies yet. Track progress on the <a href="https://policy.trade.ec.europa.eu/eu-trade-relationships-country-and-region/countries-and-regions/india_en">Commission's India page</a>.</p>`],
      ["Labelling", `<p><a href="https://eur-lex.europa.eu/eli/reg/2011/1007/oj">Regulation (EU) No 1007/2011</a> sets the permitted fibre names and fibre composition labelling. The label must be in the official language or languages of the member state where the garment is sold, unless that state provides otherwise. Send one label file per market, or a multilingual label.</p>`],
      ["Product safety and the EU responsible person", `<p>The <a href="https://eur-lex.europa.eu/eli/reg/2023/988/oj">General Product Safety Regulation (EU) 2023/988</a> has applied since 13 December 2024. A product can only be placed on the EU market if an economic operator established in the EU is responsible for it. The importer's name and contact details go on the product or its packaging, with a type, batch or serial number. For children's clothing up to age 14, EN 14682 sets the rules for cords and drawstrings.</p>`],
      ["Chemicals under REACH Annex XVII", `<ul><li>Entry 43: azo dyes that can release listed aromatic amines</li><li>Entry 72: 33 CMR substances in clothing and similar textiles</li><li>Entry 79: PFHxA and related substances in clothing for the general public, from 10 October 2026 (<a href="https://eur-lex.europa.eu/eli/reg/2024/2462/oj">Regulation (EU) 2024/2462</a>)</li></ul><p>Send us your restricted substances list. Water-repellent finishes on jackets need checking against the PFHxA limit.</p>`],
      ["Documents, ports and transit", `<p>Your importer needs an EORI number. Each shipment carries a commercial invoice with the HSN code on every line, a packing list, and the bill of lading or air waybill. We ship from Nhava Sheva (JNPT), Mundra or Chennai to Rotterdam, Antwerp or Hamburg. Sea transit is typically about 4 to 7 weeks, depending on routing. Air freight leaves from Bengaluru (BLR).</p>`],
      ["What to send us", `<ul><li>Label files in the language of each selling country</li><li>The EU responsible economic operator's name, postal address and email</li><li>Your restricted substances list and CN codes, if known</li><li>Importer EORI number, and whether you plan to claim GSP</li></ul>`],
    ],
    faqs: [
      ["Which languages must the fibre label be in?", "Regulation (EU) 1007/2011 requires the official language or languages of the member state where the garment is sold to consumers, unless that state provides otherwise. Send us one file per market or a multilingual label and we print to it."],
      ["Who is the EU responsible person for garments made in India?", "Under the General Product Safety Regulation, a product can only be placed on the EU market if an economic operator established in the EU is responsible for it. That is usually you as importer, or an authorised representative. Send us the name, postal address and email to print on the label or packaging."],
      ["Does the EU PFAS restriction affect water-repellent jackets?", "Yes, it can. From 10 October 2026, REACH limits PFHxA and related substances in clothing for the general public. If a jacket needs water repellency, tell us at spec stage so the finish is chosen with the limit in mind and tested before shipment."],
    ],
    sources: [
      ["Access2Markets (European Commission)", "https://trade.ec.europa.eu/access-to-markets/en/home"],
      ["Commission Implementing Regulation (EU) 2025/1909, GSP sections suspended for 2026 to 2028", "https://eur-lex.europa.eu/eli/reg_impl/2025/1909/oj"],
      ["European Commission: EU trade relations with India", "https://policy.trade.ec.europa.eu/eu-trade-relationships-country-and-region/countries-and-regions/india_en"],
      ["Regulation (EU) No 1007/2011, textile fibre names and labelling", "https://eur-lex.europa.eu/eli/reg/2011/1007/oj"],
      ["Regulation (EU) 2023/988, General Product Safety", "https://eur-lex.europa.eu/eli/reg/2023/988/oj"],
      ["Regulation (EU) 2024/2462, PFHxA restriction under REACH", "https://eur-lex.europa.eu/eli/reg/2024/2462/oj"],
    ],
  },
  {
    slug: "uae",
    name: "UAE and GCC",
    short: "the UAE and GCC",
    h1: "Garment exporter from India to the UAE and GCC",
    title: "Garment Exporter India to UAE and GCC | GoodBiz Apparels",
    meta: "Knits, woven garments and jackets made in India for Dubai and GCC buyers. CEPA certificates of origin, ECAS and SABER support, ready stock for fast turns.",
    intro: "GoodBiz Apparels supplies importers, wholesalers and retailers in the UAE and wider GCC with men's and kids' knits, woven garments and jackets made in India through our partner factories. Under the India-UAE CEPA, in force since 1 May 2022, Indian garments can enter the UAE at preferential rates with a CEPA certificate of origin. Ready stock suits fast wholesale turns.",
    points: [
      ["UAE duty and the CEPA", `<p>The India-UAE Comprehensive Economic Partnership Agreement (CEPA) entered into force on 1 May 2022 and removed UAE duty on many Indian textile and garment lines. To claim the CEPA rate, each shipment needs a preferential certificate of origin, which Indian exporters apply for on the <a href="https://www.dgft.gov.in/CP/">DGFT</a> platform. Without a valid certificate, the UAE's normal customs duty applies. Check your 8-digit line against the UAE's CEPA tariff schedule (Annex 2B of the agreement) before you price.</p>`],
      ["UAE labelling and conformity", `<p>Textile product rules in the UAE are set at federal level. <a href="https://uaelegislation.gov.ae/en/legislations/2802">Cabinet Resolution No. 54 of 2019</a> on the UAE Scheme for the Control of Textile Products covers new ready-to-wear clothing. It sets labelling requirements and a certificate of conformity route under the Emirates Conformity Assessment Scheme (ECAS), run by the Ministry of Industry and Advanced Technology (MoIAT) through approved bodies. The application needs a UAE-licensed company, usually your importer.</p>`],
      ["Saudi Arabia and the rest of the GCC", `<p>The CEPA covers the UAE only. In Saudi Arabia, clothing falls under SASO's <a href="https://saso.gov.sa/en/Laws-And-Regulations/Technical_regulations/Documents/TR-for-Textile-Products.pdf">Technical Regulation for Textile Products</a>. Shipments clear through the <a href="https://saber.sa/">SABER</a> platform, where the importer registers product conformity certificates and gets a shipment certificate. Start SABER before booking, not on arrival. For Oman, Qatar, Kuwait and Bahrain, ask your importer for current conformity and labelling rules.</p>`],
      ["Ready stock and mixed loads", `<p>Wholesale buyers in Dubai often need quick replenishment. Ready stock lines can ship without waiting for a production run. Ready stock and made to order lines can share one container, with the HSN code for each line on the invoice and packing list.</p>`],
      ["Documents, ports and transit", `<p>Each shipment carries a commercial invoice, packing list, bill of lading or air waybill, and the CEPA certificate of origin. We ship from Nhava Sheva (JNPT) or Mundra to Jebel Ali. Sea transit is short, typically about 1 to 2 weeks port to port. Air freight leaves from Bengaluru (BLR).</p>`],
      ["What to send us", `<ul><li>The final destination country and your importer of record</li><li>Consignee details exactly as they must appear on the certificate of origin</li><li>ECAS or SABER certificate numbers, if your products already have them</li><li>Label artwork, including any Arabic text your importer needs</li></ul>`],
    ],
    faqs: [
      ["Do labelling rules differ between Dubai, Abu Dhabi and Sharjah?", "Textile product rules are set at federal level under Cabinet Resolution No. 54 of 2019, run by the Ministry of Industry and Advanced Technology. Your importer of record confirms which products need ECAS certification and what the label must show."],
      ["Does the CEPA certificate of origin help on goods going to Saudi Arabia?", "No. The CEPA is between India and the UAE only. Goods for Saudi Arabia need SASO conformity through the SABER platform, and Saudi duty rules apply. Tell us the final destination before we prepare documents."],
      ["Can ready stock and made to order lines share one container to Jebel Ali?", "Yes. Ready stock and made to order lines can be consolidated in one shipment. The invoice and packing list show the HSN code for each line, which your importer needs for the CEPA claim."],
    ],
    sources: [
      ["UAE Legislation: Cabinet Resolution No. 54 of 2019, textile products", "https://uaelegislation.gov.ae/en/legislations/2802"],
      ["DGFT: certificates of origin platform", "https://www.dgft.gov.in/CP/"],
      ["PIB: India-UAE CEPA enters into force", "https://pib.gov.in/PressReleasePage.aspx?PRID=1821785"],
      ["SASO: Technical Regulation for Textile Products", "https://saso.gov.sa/en/Laws-And-Regulations/Technical_regulations/Documents/TR-for-Textile-Products.pdf"],
      ["SABER (SASO conformity platform)", "https://saber.sa/"],
    ],
  },
  {
    slug: "africa",
    name: "Africa",
    short: "Africa",
    h1: "Garment exporter from India to Africa",
    title: "Garment Exporter India to Africa | GoodBiz Apparels",
    meta: "Knits, woven garments and jackets made in India for Kenya, Tanzania, Uganda, Nigeria and South Africa. PVoC, SONCAP and label rules planned before we ship.",
    intro: "GoodBiz Apparels supplies importers, wholesalers and retailers in East, West and Southern Africa with men's and kids' knits, woven garments and jackets made in India through our partner factories. Rules differ sharply by country. Kenya, Tanzania and Uganda inspect before shipment, Nigeria uses SONCAP and Form M, and South Africa checks clothing labels at the border.",
    points: [
      ["East Africa: inspection before shipment", `<ul><li><strong>Kenya:</strong> KEBS requires a Pre-Export Verification of Conformity (PVoC) Certificate of Conformity, issued before shipment, for consignments of regulated products. The importer requests it from a KEBS-appointed contractor.</li><li><strong>Tanzania:</strong> TBS runs its own PVoC programme, and the certificate is checked in the TBS system before clearance. See <a href="https://www.tbs.go.tz/pages/inspection">TBS import inspection</a>.</li><li><strong>Uganda:</strong> UNBS applies PVoC to products covered by compulsory Uganda standards, with applications through the Uganda Electronic Single Window.</li></ul><p>Textiles and clothing are typically in scope, but confirm your HS codes with the appointed contractor. The inspector checks the goods in India before loading, so we build inspection into the shipping date.</p>`],
      ["Nigeria: prohibition list, Form M and SONCAP", `<p>Nigeria's import prohibition list has covered textile fabrics and articles made from them, and the list has been revised. Check the current Nigeria Customs Service list for your exact HS codes before you order. For SON-regulated goods, <a href="https://son.gov.ng/soncap-faq/">SONCAP</a> applies: a Product Certificate is needed to process Form M through your bank, and a SONCAP Certificate is issued to the importer for clearance. SON's published exemptions do not list clothing.</p>`],
      ["South Africa: labels checked at the border", `<p>Under the Consumer Protection Act regulations, imported clothing must carry a trade description naming the country where it was made. It must also meet South African national standards for fibre content and care labelling. The <a href="https://thencc.org.za/import-labelling-requirements-cpa/">National Consumer Commission</a> works with SARS to stop non-compliant clothing at the border. We print 'Made in India' on every label.</p>`],
      ["Duty", `<p>India has no free trade agreement with these markets, so each country's normal tariff applies. Kenya, Tanzania and Uganda use the East African Community Common External Tariff. South Africa uses the SACU tariff, and Nigeria the ECOWAS Common External Tariff. Your clearing agent confirms the rate and any import levies for your HS code.</p>`],
      ["Mixed containers, ports and transit", `<p>Wholesale buyers often combine many styles in one container. Ready stock and made to order lines can share a shipment, with the HSN code for each line on the invoice and packing list. We ship from Nhava Sheva (JNPT), Mundra, Chennai or Tuticorin to Mombasa, Dar es Salaam, Durban or Lagos. Sea transit is typically about 2 to 4 weeks to East African ports, and longer to Durban and Lagos. Cargo for Uganda usually moves inland from Mombasa or Dar es Salaam.</p>`],
      ["What to send us", `<ul><li>The destination country and your importer's details</li><li>Kenya, Tanzania or Uganda: your PVoC request reference and contractor</li><li>Nigeria: your Form M details and confirmation that your HS codes are permitted</li><li>South Africa: your exact fibre and care label text</li><li>HS codes from your clearing agent, plus consignee and notify party</li></ul>`],
    ],
    faqs: [
      ["Who applies for the PVoC certificate for Kenya?", "The importer submits the request for certification to a KEBS-appointed PVoC contractor. The contractor inspects the goods in India before shipment. We make the goods and documents available to the inspector."],
      ["Are garments allowed into Nigeria?", "Nigeria's import prohibition list has covered textile fabrics and articles made from them, and the list changes. Check the current Nigeria Customs Service list for your HS codes before ordering. Where the goods are permitted, SONCAP and Form M apply."],
      ["What must a clothing label show for South Africa?", "The country where the garment was made, plus fibre content and care instructions that meet South African national standards. Non-compliant clothing can be stopped at the border, so send us your exact label text before production."],
    ],
    sources: [
      ["TBS Tanzania: imports and export control", "https://www.tbs.go.tz/pages/inspection"],
      ["SON: SONCAP FAQ", "https://son.gov.ng/soncap-faq/"],
      ["National Consumer Commission (South Africa): import labelling", "https://thencc.org.za/import-labelling-requirements-cpa/"],
      ["Nigeria Customs Service", "https://customs.gov.ng/"],
    ],
  },
  {
    slug: "australia",
    name: "Australia",
    short: "Australia",
    h1: "Garment exporter from India to Australia",
    title: "Garment Exporter India to Australia | GoodBiz Apparels",
    meta: "Knits, woven garments and jackets made in India for Australian buyers. AI-ECTA certificates of origin, care labels and nightwear checks before we ship.",
    intro: "GoodBiz Apparels supplies Australian importers, brands and retailers with men's and kids' knits, woven garments and jackets made in India through our partner factories. Under the Australia-India ECTA, Australia's remaining tariffs on Indian goods were phased out by 1 January 2026. Qualifying garments can enter duty free with a valid certificate of origin.",
    points: [
      ["AI-ECTA and duty", `<p>The Australia-India Economic Cooperation and Trade Agreement (AI-ECTA) entered into force on 29 December 2022. Australia's remaining tariffs on Indian goods were phased out by 1 January 2026. To claim the preference, the importer needs an AI-ECTA certificate of origin issued by an authorised body in India. It must follow the agreement's format and minimum information requirements, so its details must match the invoice. Importers in the Australian Trusted Trader programme may not need one. Confirm your line on the <a href="https://ftaportal.dfat.gov.au/">DFAT FTA Portal</a>. GST of 10% still applies at import.</p>`],
      ["Care labelling", `<p>The ACCC's <a href="https://www.productsafety.gov.au/business/search-mandatory-standards/care-labelling-for-clothing-and-textiles-mandatory-standard">care labelling mandatory standard</a>, the Consumer Goods (Care Labelling) Information Standard 2023, applies to clothing. Care instructions can be in English, in the international care symbols, or both. Send us your care text and we produce labels to match.</p>`],
      ["Children's nightwear and babywear", `<p>The <a href="https://www.productsafety.gov.au/business/search-mandatory-standards/nightwear-for-children-mandatory-standard">children's nightwear mandatory standard</a> covers nightwear in sizes 00 to 14 and some babywear, such as certain knitted all-in-ones in sizes 00 to 2. Covered garments must meet fire hazard requirements and carry a low or high fire danger label. Tell us if a babywear style could be in scope, so the fabric can be tested before bulk production.</p>`],
      ["Country of origin", `<p>Under the <a href="https://www.legislation.gov.au/F2016L01907/latest/text">Commerce (Trade Descriptions) Regulation 2016</a>, imported textile products and clothing need a trade description naming the country where they were made. We print 'Made in India' on the label.</p>`],
      ["Documents, ports and transit", `<p>Consignments over AUD 1,000 need a full import declaration. Each shipment carries a commercial invoice with the HSN code on every line, a packing list, the bill of lading or air waybill, and the AI-ECTA certificate of origin. We ship from Nhava Sheva (JNPT), Mundra or Chennai to Melbourne, Sydney, Brisbane or Fremantle. Sea transit is typically about 3 to 6 weeks, often with transhipment. Air freight leaves from Bengaluru (BLR).</p>`],
      ["What to send us", `<ul><li>Care text or symbols for each style</li><li>The size range, and whether any style is nightwear or babywear</li><li>Importer of record details, and whether you are an Australian Trusted Trader</li><li>Your Australian tariff classification, if known, and destination port</li></ul>`],
    ],
    faqs: [
      ["Is there duty on Indian clothing in Australia now?", "Australia's remaining tariffs on Indian goods under AI-ECTA were phased out by 1 January 2026. Your importer still needs a valid AI-ECTA certificate of origin to claim the preference, and 10% GST applies at import. Confirm your tariff line on the DFAT FTA Portal."],
      ["Does the nightwear standard apply to babywear?", "It can. The mandatory standard covers children's nightwear in sizes 00 to 14 and certain babies' knitted all-in-ones in sizes 00 to 2. Send us the style details and we flag any garment that may need a fire danger label."],
      ["Do Australian care labels need words or symbols?", "Either. The care labelling standard allows instructions in English, in the international care symbols, or both. Send us the wording or symbols you want and we print them."],
    ],
    sources: [
      ["DFAT: Australia-India ECTA", "https://www.dfat.gov.au/trade/agreements/in-force/australia-india-ecta"],
      ["ABF: ECTA rules of origin guide", "https://www.abf.gov.au/free-trade-agreements/files/ECTA-rules-of-origin.pdf"],
      ["DFAT FTA Portal", "https://ftaportal.dfat.gov.au/"],
      ["Product Safety Australia: care labelling mandatory standard", "https://www.productsafety.gov.au/business/search-mandatory-standards/care-labelling-for-clothing-and-textiles-mandatory-standard"],
      ["Product Safety Australia: children's nightwear mandatory standard", "https://www.productsafety.gov.au/business/search-mandatory-standards/nightwear-for-children-mandatory-standard"],
      ["Commerce (Trade Descriptions) Regulation 2016", "https://www.legislation.gov.au/F2016L01907/latest/text"],
    ],
  },
];
