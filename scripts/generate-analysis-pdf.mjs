import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const outputDir = path.resolve("public/documents");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const FONT_R = "C:\\Windows\\Fonts\\arial.ttf";
const FONT_B = "C:\\Windows\\Fonts\\arialbd.ttf";

const doc = new PDFDocument({ size: "A4", margin: 0 });
const out = fs.createWriteStream(path.join(outputDir, "ornek-analiz-raporu.pdf"));
doc.pipe(out);

doc.registerFont("R", FONT_R);
doc.registerFont("B", FONT_B);

const HONEY = "#C57930";
const DARK  = "#1a1a1a";
const GRAY  = "#666666";
const LGRAY = "#f2f2f2";
const GREEN = "#1a7a3c";
const PW    = 595;   // page width
const L     = 45;    // left margin
const CW    = PW - L * 2; // content width = 505

// ── HEADER (h=82) ──────────────────────────────────────────
doc.rect(0, 0, PW, 82).fill(HONEY);
doc.fillColor("white").font("B").fontSize(17)
   .text("BİNBOĞA KOOPERATİF BALI", L, 16, { width: CW });
doc.font("R").fontSize(9.5)
   .text("745 Sayılı Kozan Bal Tarım Satış Kooperatifi", L, 40, { width: CW });
doc.fontSize(8.5)
   .text("Analiz Laboratuvarı  |  Akredite Test Merkezi", L, 56, { width: CW });

// ── RAPOR BAŞLIĞI (y=88) ────────────────────────────────────
doc.fillColor(DARK).font("B").fontSize(13)
   .text("BAL KALİTE ANALİZ RAPORU", L, 92, { align: "center", width: CW });
doc.moveTo(L, 112).lineTo(PW - L, 112).lineWidth(1).strokeColor(HONEY).stroke();

// ── ÜRÜN BİLGİLERİ (y=118) ─────────────────────────────────
doc.font("B").fontSize(9.5).fillColor(HONEY)
   .text("ÜRÜN BİLGİLERİ", L, 118);

const ROW_H = 16;
let iy = 132;
const c1 = L, c2 = L + 140, c3 = L + 272, c4 = L + 400;

function infoRow(l1, v1, l2, v2) {
  doc.font("B").fontSize(8).fillColor(GRAY).text(l1, c1, iy).text(l2 || "", c3, iy);
  doc.font("R").fillColor(DARK).text(v1, c2, iy).text(v2 || "", c4, iy);
  iy += ROW_H;
}

infoRow("Ürün Adı",        "Çiçek Balı",              "Lot No",           "BB-2025-0347");
infoRow("Üretim Yeri",     "Toroslar / Adana",         "Üretim Tarihi",    "Mayıs 2025");
infoRow("Arıcı Kodu",      "AKZ-112",                  "Analiz Tarihi",    "12.06.2025");
infoRow("Numune No",       "LAB-2025-1841",            "Rapor Tarihi",     "15.06.2025");
infoRow("Standart",        "TS 3036 / AB 2001/110/EC", "Numune Miktarı",   "250 g");
// iy ≈ 212

doc.moveTo(L, iy + 4).lineTo(PW - L, iy + 4)
   .lineWidth(0.4).strokeColor("#dddddd").stroke();

// ── ANALİZ TABLOSU ─────────────────────────────────────────
const TB_TOP = iy + 14;  // ~226
doc.font("B").fontSize(9.5).fillColor(HONEY)
   .text("ANALİZ SONUÇLARI", L, TB_TOP);

const TR    = 16;          // table row height
const tY    = TB_TOP + 15; // ~241
const tC    = [L, L+168, L+278, L+388];
const tW    = [168, 110, 110, 117];

// Başlık
doc.rect(L, tY, CW, TR).fill(HONEY);
["Parametre", "Yöntem", "Limit (TS 3036)", "Sonuç"].forEach((h, i) => {
  doc.fillColor("white").font("B").fontSize(8)
     .text(h, tC[i] + 3, tY + 4, { width: tW[i] - 4 });
});

const rows = [
  ["Rutubet Oranı",            "Refraktometre",        "Maks. %20,0",      "%17,4  ✓"],
  ["HMF Değeri",               "HPLC / Fotometrik",    "Maks. 40 mg/kg",   "12,3 mg/kg  ✓"],
  ["Diastaz Aktivitesi",       "Schade (Göthe Sk.)",   "Min. 8 (ND<15)",   "12,7  ✓"],
  ["Früktoz + Glükoz",         "HPLC",                 "Min. %60",         "%73,8  ✓"],
  ["Sakaroz",                  "HPLC",                 "Maks. %5",         "%0,9  ✓"],
  ["Elektriksel İletkenlik",   "Konduktometre",        "Maks. 0,8 mS/cm",  "0,31 mS/cm  ✓"],
  ["pH Değeri",                "pH Metre",             "3,4 – 6,1",        "4,2  ✓"],
  ["Su İçermeyen Mad. Or.",    "Gravimetrik",          "Min. %80",         "%82,6  ✓"],
  ["Renk (Pfund Skalası)",     "Spektrofotometre",     "35–50 mm Pfund",   "38 mm (Açık Amber)  ✓"],
  ["Toplam Asitlik",           "Titrimetrik",          "Maks. 50 meq/kg",  "22,4 meq/kg  ✓"],
  ["Prolin İçeriği",           "Küpcü Yöntemi",        "Min. 180 mg/kg",   "386 mg/kg  ✓"],
  ["Polen Analizi",            "Mikroskopik",          "Dominant Polen",   "Trifolium spp. (%54)"],
];

rows.forEach((row, i) => {
  const ry = tY + TR + i * TR;
  doc.rect(L, ry, CW, TR).fill(i % 2 === 0 ? LGRAY : "white");
  row.forEach((cell, j) => {
    const isRes = j === 3;
    doc.font(isRes ? "B" : "R")
       .fillColor(isRes ? GREEN : DARK)
       .fontSize(8)
       .text(cell, tC[j] + 3, ry + 4, { width: tW[j] - 4 });
  });
});

const TB_BOT = tY + TR + rows.length * TR; // ~241 + 16 + 192 = 449
doc.rect(L, tY, CW, TB_BOT - tY).lineWidth(0.4).strokeColor("#cccccc").stroke();

// ── SONUÇ BEYANI ────────────────────────────────────────────
const CON_Y = TB_BOT + 12; // ~461
const CON_H = 52;
doc.rect(L, CON_Y, CW, CON_H).fill("#f0faf4");
doc.rect(L, CON_Y, 4, CON_H).fill(GREEN);
doc.font("B").fontSize(9).fillColor(GREEN)
   .text("SONUÇ VE UYGUNLUK BEYANI", L + 10, CON_Y + 7);
doc.font("R").fontSize(8).fillColor(DARK)
   .text(
     "Yukarıda belirtilen analiz parametrelerinin tamamı TS 3036 Bal Standardı ve 2001/110/EC sayılı AB Bal Direktifi " +
     "sınır değerleri içinde kalmaktadır. Söz konusu bal numunesi insan tüketimine uygun olup gıda güvenliği açısından " +
     "herhangi bir risk taşımamaktadır.",
     L + 10, CON_Y + 22, { width: CW - 16 }
   );
// CON_Y + CON_H ≈ 513

// ── İMZA ────────────────────────────────────────────────────
const SIG_Y = CON_Y + CON_H + 18; // ~531
const sigs = [
  { title: "Analist",             name: "Dr. Ayşe Kaya"  },
  { title: "Laboratuvar Müdürü",  name: "Murat Demir"    },
  { title: "Kalite Kontrol Müd.", name: "Zeynep Arslan"  },
];
sigs.forEach((s, i) => {
  const sx = L + i * 170;
  doc.moveTo(sx, SIG_Y + 22).lineTo(sx + 155, SIG_Y + 22)
     .lineWidth(0.4).strokeColor("#aaaaaa").stroke();
  doc.font("B").fontSize(8).fillColor(DARK).text(s.title, sx, SIG_Y + 26);
  doc.font("R").fontSize(7.5).fillColor(GRAY)
     .text(s.name, sx, SIG_Y + 37)
     .text("Tarih: 15.06.2025", sx, SIG_Y + 48);
});
// SIG_Y + 48 + 10 ≈ 607  → footer 760'tan başlıyor, bolca alan var

// ── FOOTER (y=762, h=50 → ends at 812 < 841) ───────────────
doc.rect(0, 762, PW, 50).fill(HONEY);
doc.fillColor("white").font("R").fontSize(7)
   .text("Bu rapor yalnızca test edilen numune için geçerlidir. İzinsiz çoğaltılamaz.", L, 770, { align: "center", width: CW })
   .text("745 Sayılı Kozan Bal Tarım Satış Kooperatifi  |  Kozan, Adana  |  www.binbogabali.com.tr", L, 782, { align: "center", width: CW })
   .text("Rapor No: LAB-2025-1841  |  Sayfa 1 / 1", L, 794, { align: "center", width: CW });

doc.end();
out.on("finish", () => console.log("PDF oluşturuldu: public/documents/ornek-analiz-raporu.pdf"));
