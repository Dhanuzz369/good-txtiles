/**
 * GoodBiz Apparels — website enquiry form → Google Sheet (+ email alert)
 *
 * HOW TO INSTALL
 * 1. Open the Google Sheet that should collect enquiries.
 * 2. Extensions → Apps Script. Delete what is there, paste this whole file, click Save.
 * 3. Pick "setup" in the function menu at the top and click Run. Approve the permissions
 *    (it needs your Sheet, and Gmail to send you the alert). This creates the "Enquiries" tab.
 * 4. Deploy → New deployment → gear icon → Web app.
 *      Description: GoodBiz enquiries
 *      Execute as: Me
 *      Who has access: Anyone
 *    Click Deploy and copy the "Web app URL" (it ends in /exec).
 * 5. Send that URL to be added to the website (SITE.formEndpoint in src/data.mjs).
 *
 * If you edit this script later: Deploy → Manage deployments → pencil → Version: New version → Deploy.
 * The URL stays the same.
 */

const CONFIG = {
  SHEET_NAME: "Enquiries",
  NOTIFY_EMAIL: "agro@goodbizglobal.com", // gets an email for every new enquiry; "" switches alerts off
  BRAND: "GoodBiz Apparels",
  STATUSES: ["New", "Replied", "Costing sent", "Sample", "Won", "Lost"],
};

// [form field, column heading]
const COLUMNS = [
  ["received", "Received"],
  ["status", "Status"],
  ["name", "Name"],
  ["company", "Company"],
  ["email", "Email"],
  ["whatsapp", "WhatsApp"],
  ["products", "Products (HSN)"],
  ["productOther", "Other product"],
  ["route", "Buying route"],
  ["fabric", "Fabric and GSM"],
  ["sizes", "Sizes and colours"],
  ["techpack", "Tech pack"],
  ["quantity", "Quantity"],
  ["country", "Country"],
  ["port", "Port"],
  ["incoterm", "Price basis"],
  ["message", "Notes"],
  ["page", "Page"],
  ["source", "Form"],
  ["utm_source", "utm_source"],
  ["utm_medium", "utm_medium"],
  ["utm_campaign", "utm_campaign"],
  ["utm_term", "utm_term"],
  ["utm_content", "utm_content"],
  ["gclid", "gclid"],
];

/** Run once from the editor: creates and formats the Enquiries tab. */
function setup() {
  const sh = sheet_();
  const header = COLUMNS.map(function (c) { return c[1]; });
  sh.getRange(1, 1, 1, header.length).setValues([header])
    .setFontWeight("bold").setBackground("#1F2B5C").setFontColor("#FFFFFF");
  sh.setFrozenRows(1);
  sh.setColumnWidth(1, 150);
  sh.setColumnWidths(3, 4, 180);
  sh.setColumnWidth(7, 320);
  sh.setColumnWidth(17, 320);
  const status = SpreadsheetApp.newDataValidation().requireValueInList(CONFIG.STATUSES, true).setAllowInvalid(false).build();
  sh.getRange(2, 2, sh.getMaxRows() - 1, 1).setDataValidation(status);
  sh.getRange(2, 1, sh.getMaxRows() - 1, 1).setNumberFormat("dd mmm yyyy, hh:mm");
  SpreadsheetApp.getActive().toast("Enquiries tab is ready. Now deploy as a web app.", CONFIG.BRAND, 8);
}

/** The website posts each finished enquiry here. */
function doPost(e) {
  const p = (e && e.parameter) || {};

  // Spam trap: the form has a hidden "website" field that people never see. Bots fill it in.
  if (p.website) return json_({ ok: true });

  // Minimum the form always sends: a name, a company and a way to reply.
  if (!p.name || !p.company || !(p.email || p.whatsapp)) return json_({ ok: false, error: "missing contact details" });

  const lock = LockService.getScriptLock();
  lock.waitLock(20000); // two enquiries at the same moment never overwrite each other
  try {
    const sh = sheet_();
    if (sh.getLastRow() === 0) setup();
    const row = COLUMNS.map(function (c) {
      if (c[0] === "received") return new Date();
      if (c[0] === "status") return "New";
      return clean_(p[c[0]]);
    });
    sh.appendRow(row);
  } finally {
    lock.releaseLock();
  }

  try { notify_(p); } catch (err) { console.error("Alert email failed: " + err); }
  return json_({ ok: true });
}

/** Opening the web app URL in a browser shows this, so you can check it is live. */
function doGet() {
  return ContentService.createTextOutput(CONFIG.BRAND + " enquiry endpoint is running.");
}

/** Optional: run from the editor to add a test row and send yourself a test alert. */
function testEnquiry() {
  const res = doPost({ parameter: {
    name: "Test Buyer", company: "Test Imports Ltd", email: "test@example.com", whatsapp: "+44 7700 900123",
    products: "Men's cotton T shirts (HSN 61091000); Men's polyester jackets (HSN 62033300)",
    route: "Made to order", fabric: "Cotton single jersey, 180 GSM", sizes: "S to XXL", techpack: "Reference garment",
    quantity: "1,000 to 5,000 pieces", country: "United Kingdom", port: "Felixstowe", incoterm: "FOB",
    message: "Test from the Apps Script editor. Delete this row.", page: "/contact/", source: "test",
  } });
  console.log(res.getContent());
}

// ------------------------------------------------------------------ helpers
function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(CONFIG.SHEET_NAME) || ss.insertSheet(CONFIG.SHEET_NAME);
}

// Trim, cap length, and stop text that starts with = + - @ being run as a spreadsheet formula.
function clean_(v) {
  v = String(v == null ? "" : v).trim().slice(0, 2000);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function esc_(v) {
  return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function notify_(p) {
  if (!CONFIG.NOTIFY_EMAIL) return;
  const rows = COLUMNS.filter(function (c) { return c[0] !== "received" && c[0] !== "status" && p[c[0]]; });
  const html = '<h2 style="font-family:Arial,sans-serif;color:#1F2B5C">New enquiry from ' + esc_(p.company) + "</h2>" +
    '<table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">' +
    rows.map(function (c) {
      return '<tr><td style="padding:6px 14px 6px 0;color:#5C584F;vertical-align:top;white-space:nowrap">' + esc_(c[1]) +
        '</td><td style="padding:6px 0">' + esc_(p[c[0]]).replace(/; /g, "<br>").replace(/\n/g, "<br>") + "</td></tr>";
    }).join("") + "</table>" +
    '<p style="font-family:Arial,sans-serif;font-size:13px;color:#5C584F">Saved in the "' + CONFIG.SHEET_NAME + '" tab of ' +
    '<a href="' + SpreadsheetApp.getActiveSpreadsheet().getUrl() + '">your enquiry sheet</a>.</p>';
  const text = rows.map(function (c) { return c[1] + ": " + p[c[0]]; }).join("\n");
  const mail = {
    to: CONFIG.NOTIFY_EMAIL,
    subject: "New enquiry: " + (p.company || p.name) + (p.route ? " (" + p.route + ")" : ""),
    body: text,
    htmlBody: html,
    name: CONFIG.BRAND + " website",
  };
  if (p.email && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(p.email)) mail.replyTo = p.email; // press Reply to answer the buyer
  MailApp.sendEmail(mail);
}
