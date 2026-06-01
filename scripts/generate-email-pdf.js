const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const FONT_NORMAL = 'C:\\Windows\\Fonts\\arial.ttf';
const FONT_BOLD   = 'C:\\Windows\\Fonts\\arialbd.ttf';

const OUT = path.join(__dirname, '..', 'email-tasarim-dokumani.pdf');
const doc = new PDFDocument({ size: 'A4', margins: { top: 0, bottom: 0, left: 0, right: 0 } });
doc.registerFont('Normal', FONT_NORMAL);
doc.registerFont('Bold',   FONT_BOLD);
const stream = fs.createWriteStream(OUT);
doc.pipe(stream);

const W = doc.page.width;   // 595
const H = doc.page.height;  // 842
const ML = 48, MR = 48;
const CW = W - ML - MR;     // 499

function rgb(hex) {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
}

const C = {
  honey:     '#F9B10B',
  honeyDark: '#C57930',
  cream:     '#FFF8E7',
  dark:      '#1A1A1A',
  mid:       '#555555',
  light:     '#999999',
  border:    '#E8E8E8',
  bg:        '#FAFAFA',
  white:     '#FFFFFF',
  red:       '#E53E3E',
  blue:      '#3182CE',
  green:     '#38A169',
  purple:    '#805AD5',
  yellow:    '#D69E2E',
  gray2:     '#718096',
};

// ─── HELPERS ────────────────────────────────────────────────────────────────

function pageHeader(sectionLabel) {
  // Üst bant
  doc.rect(0, 0, W, 52).fill(rgb(C.dark));
  doc.fillColor('white').fontSize(11).font('Bold')
    .text('Binboğa Kooperatif Balı', ML, 14);
  doc.fillColor(rgb(C.honey)).fontSize(9).font('Normal')
    .text(sectionLabel, ML, 30);
  // sağda sayfa etiketi
  doc.fillColor(rgb(C.light)).fontSize(8)
    .text('E-Posta Şablon Tasarım Rehberi', 0, 20, { align: 'right', width: W - MR });
  doc.y = 72;
}

function sectionBadge(text, y) {
  doc.rect(ML, y, CW, 26).fill(rgb(C.cream));
  doc.fillColor(rgb(C.honeyDark)).fontSize(10).font('Bold')
    .text(text, ML + 12, y + 7);
  return y + 36;
}

function row(label, value, y, valueColor) {
  doc.fillColor(rgb(C.light)).fontSize(8).font('Bold')
    .text(label.toUpperCase(), ML + 12, y, { width: 130 });
  doc.fillColor(valueColor ? rgb(valueColor) : rgb(C.dark)).fontSize(8.5).font('Normal')
    .text(value, ML + 148, y, { width: CW - 148 - 12 });
  return y + 16;
}

function separator(y) {
  doc.moveTo(ML, y).lineTo(W - MR, y).strokeColor(rgb(C.border)).lineWidth(0.5).stroke();
  return y + 12;
}

function colorSwatch(hex, label, x, y, w = 22, h = 14) {
  doc.rect(x, y, w, h).fill(rgb(hex)).stroke();
  doc.fillColor(rgb(C.dark)).fontSize(7.5).font('Normal')
    .text(label, x + w + 6, y + 2, { width: 120 });
  doc.fillColor(rgb(C.light)).fontSize(7)
    .text(hex, x + w + 6, y + 10 -(14-h)/2 + 2);
}

function templateHeader(no, name, tag, y) {
  // sol renkli şerit
  doc.rect(ML, y, 4, 60).fill(rgb(C.honey));
  // numara dairesi
  doc.circle(ML + 18, y + 12, 9).fill(rgb(C.honey));
  doc.fillColor('white').fontSize(9).font('Bold')
    .text(no, ML + 14, y + 7, { width: 10, align: 'center' });
  // isim
  doc.fillColor(rgb(C.dark)).fontSize(13).font('Bold')
    .text(name, ML + 32, y + 6);
  // tag pill
  const tagW = doc.widthOfString(tag, { fontSize: 7 }) + 14;
  doc.rect(ML + 32, y + 24, tagW, 14).fill(rgb(C.cream));
  doc.fillColor(rgb(C.honeyDark)).fontSize(7).font('Bold')
    .text(tag, ML + 39, y + 28);
  return y + 46;
}

function spec(label, value, y, full) {
  doc.fillColor(rgb(C.light)).fontSize(7.5).font('Bold')
    .text(label, ML + 12, y, { width: full ? CW - 24 : 118 });
  doc.fillColor(rgb(C.dark)).fontSize(8).font('Normal')
    .text(value, full ? ML + 12 : ML + 132, full ? y + 10 : y, { width: full ? CW - 24 : CW - 144 });
  return y + (full ? 20 : 14);
}

// ════════════════════════════════════════════════════════════════════════════
// KAPAK
// ════════════════════════════════════════════════════════════════════════════
doc.rect(0, 0, W, H).fill(rgb(C.dark));

// balya deseni (dekoratif daireler)
doc.circle(W - 60, 80, 120).fillOpacity(0.05).fill(rgb(C.honey)).fillOpacity(1);
doc.circle(60, H - 100, 90).fillOpacity(0.05).fill(rgb(C.honey)).fillOpacity(1);

// honey şerit
doc.rect(0, H/2 - 60, W, 120).fill(rgb(C.honey));

doc.fillColor(rgb(C.dark)).fontSize(38).font('Bold')
  .text('E-Posta', ML, H/2 - 48, { lineGap: 2 });
doc.fontSize(38).text('Şablon Rehberi', ML, H/2 - 8);

doc.fillColor('white').fontSize(13).font('Normal')
  .text('Binboğa Kooperatif Balı', ML, H/2 + 72);
doc.fillColor(rgb(C.light)).fontSize(9)
  .text('Tüm e-posta şablonlarının görsel tasarım ölçüleri, renkleri ve gönderim adımları', ML, H/2 + 94, { width: CW });

doc.fillColor(rgb(C.light)).fontSize(8)
  .text(new Date().toLocaleDateString('tr-TR', { year:'numeric', month:'long', day:'numeric' }), ML, H - 48);

doc.addPage();

// ════════════════════════════════════════════════════════════════════════════
// SAYFA 2 — TASARIM SİSTEMİ
// ════════════════════════════════════════════════════════════════════════════
pageHeader('Tasarım Sistemi');

// ── Genel Yapı ───────────────────────────────────────────────────────────────
let y = sectionBadge('Genel E-Posta Yapısı', doc.y);

// Wireframe çizimi
const wfX = ML + 12, wfW = 200, wfY = y;
// kapsayıcı
doc.rect(wfX, wfY, wfW, 180).strokeColor(rgb(C.border)).lineWidth(1).stroke();
// header
doc.rect(wfX, wfY, wfW, 36).fill(rgb(C.honey));
doc.fillColor('white').fontSize(7).font('Bold').text('HEADER BANDI', wfX + 4, wfY + 14, { width: wfW - 8, align: 'center' });
// body
doc.rect(wfX, wfY + 36, wfW, 114).fill(rgb(C.white));
doc.fillColor(rgb(C.light)).fontSize(6.5).font('Normal').text('BODY', wfX + 4, wfY + 90, { width: wfW - 8, align: 'center' });
// footer (opsiyonel)
doc.rect(wfX, wfY + 150, wfW, 30).fill(rgb(C.bg));
doc.fillColor(rgb(C.light)).fontSize(6).text('FOOTER (opsiyonel)', wfX + 4, wfY + 162, { width: wfW - 8, align: 'center' });
// ölçü okları
doc.fillColor(rgb(C.mid)).fontSize(6.5).font('Normal')
  .text('600px max-width', wfX + wfW + 8, wfY + 85, { width: 80 })
  .text('36px', wfX + wfW + 8, wfY + 18)
  .text('114px+', wfX + wfW + 8, wfY + 90)
  .text('30px', wfX + wfW + 8, wfY + 162);

// boyut tablosu yanına
const tx = wfX + wfW + 90;
doc.fillColor(rgb(C.mid)).fontSize(8).font('Bold').text('Boyutlar', tx, wfY + 4);
let tr = wfY + 18;
const dims = [
  ['max-width', '600 px'],
  ['margin', '0 auto (ortalı)'],
  ['header padding', '24px üst/alt, 32px sol/sağ'],
  ['body padding', '32px (tüm kenarlar)'],
  ['footer padding', '16px üst/alt, 32px sol/sağ'],
];
for (const [l, v] of dims) {
  doc.fillColor(rgb(C.light)).fontSize(7.5).font('Bold').text(l, tx, tr);
  doc.fillColor(rgb(C.dark)).fontSize(7.5).font('Normal').text(v, tx + 90, tr);
  tr += 14;
}

y = wfY + 196;
y = separator(y);

// ── Tipografi ────────────────────────────────────────────────────────────────
y = sectionBadge('Tipografi', y);
const typo = [
  ['Font ailesi', 'sans-serif (sistem fontu — Helvetica, Arial, vb.)'],
  ['Marka başlık (header)', '24 px, Bold, Beyaz (#FFFFFF)'],
  ['Sayfa başlığı (h2)', '~22 px, Bold, Koyu (#1A1A1A)'],
  ['Paragraf gövde', '14–15 px, Normal, Gri (#555555), satır yüksekliği 1.6'],
  ['Küçük not / footer', '12–13 px, Normal, Açık gri (#999999)'],
  ['Tablo hücre', '14 px (ürün adı) / 12 px (varyant, gri)'],
  ['Kupon kodu', '28 px, Bold, letter-spacing: 4 px, HoneyDark (#C57930)'],
];
for (const [l, v] of typo) { y = row(l, v, y); }
y += 4;
y = separator(y);

// ── Renk Paleti ─────────────────────────────────────────────────────────────
y = sectionBadge('Renk Paleti', y);
const col1 = [
  [C.honey,     'Honey — Ana Renk (header, buton)'],
  [C.honeyDark, 'HoneyDark — İkincil vurgu, buton'],
  [C.cream,     'Cream — Açık arka plan, tablo başlığı'],
  [C.dark,      'Koyu — Başlıklar, önemli metin'],
  [C.mid,       'Gri — Paragraf gövde'],
  [C.light,     'Açık Gri — Notlar, alt bilgi'],
];
const col2 = [
  [C.blue,      'Onaylandı durumu'],
  [C.yellow,    'Hazırlanıyor durumu'],
  [C.purple,    'Kargoya Verildi durumu'],
  [C.green,     'Teslim Edildi / İndirim fiyatı'],
  [C.red,       'İptal / Uyarı / Son tarih'],
  [C.gray2,     'İade Edildi durumu'],
];
let sy = y + 4;
for (let i = 0; i < col1.length; i++) {
  colorSwatch(col1[i][0], col1[i][1], ML + 12, sy);
  colorSwatch(col2[i][0], col2[i][1], ML + 12 + 160, sy);
  sy += 20;
}
y = sy + 8;
y = separator(y);

// ── CTA Buton ────────────────────────────────────────────────────────────────
y = sectionBadge('CTA Buton', y);
// Büyük buton çizimi
const btns = [
  { label: 'Büyük Buton', pad: '14px  32px', r: 8, fs: 16, bg: C.honey, w: 140, h: 34 },
  { label: 'Orta Buton',  pad: '12px  28px', r: 8, fs: 14, bg: C.honey, w: 120, h: 30 },
  { label: 'Küçük Buton', pad: '8px   18px', r: 6, fs: 13, bg: C.honey, w: 100, h: 26 },
];
let bx = ML + 12;
for (const b of btns) {
  doc.roundedRect(bx, y + 4, b.w, b.h, b.r).fill(rgb(b.bg));
  doc.fillColor('white').fontSize(b.fs * 0.55).font('Bold')
    .text(b.label, bx, y + 4 + (b.h - b.fs*0.55) / 2, { width: b.w, align: 'center' });
  doc.fillColor(rgb(C.light)).fontSize(7)
    .text('padding: ' + b.pad, bx, y + b.h + 10, { width: b.w + 4, align: 'center' })
    .text('radius: ' + b.r + 'px  |  ' + b.fs + 'px bold', bx, y + b.h + 20, { width: b.w + 4, align: 'center' });
  bx += b.w + 28;
}
y += 60;

doc.addPage();

// ════════════════════════════════════════════════════════════════════════════
// SAYFA 3–x — ŞABLON KARTLARI
// ════════════════════════════════════════════════════════════════════════════

const templates = [
  {
    no: '1', name: 'E-posta Doğrulama', tag: 'Hesap Oluşturma',
    konu: '"[Marka] — E-postanızı Doğrulayın"',
    gonderim: 'Kullanıcı kayıt formunu gönderdikten hemen sonra',
    layout: 'Header + Body + Buton (ortalı) + Küçük not',
    btn: { label: 'E-postamı Doğrula', color: C.honey, pad: '14px 32px', r: '8px', fs: '16px' },
    specs: [
      ['Geçerlilik süresi notu', '13px, #999999, italik değil — body alt kısım'],
      ['Buton margin', '32px üst ve alt'],
    ],
  },
  {
    no: '2', name: 'Hoş Geldiniz', tag: 'Hesap Oluşturma',
    konu: '"[Marka]\'ne Hoş Geldiniz!"',
    gonderim: 'Kayıt tamamlandıktan sonra (doğrulama mailine ek olarak)',
    layout: 'Header + Body + Buton (ortalı)',
    btn: { label: 'Ürünleri Keşfet', color: C.honey, pad: '14px 32px', r: '8px', fs: '16px' },
    specs: [
      ['Karşılama mesajı', 'Emoji içerir: "Hoş geldiniz, [İsim]! 🍯"'],
      ['Buton margin', '32px üst ve alt'],
    ],
  },
  {
    no: '3', name: 'Şifre Sıfırlama', tag: 'Hesap & Güvenlik',
    konu: '"[Marka] — Şifre Sıfırlama"',
    gonderim: '"Şifremi Unuttum" formundan e-posta gönderildiğinde',
    layout: 'Header + Body + Buton (ortalı) + Güvenlik notu',
    btn: { label: 'Şifremi Sıfırla', color: C.honeyDark, pad: '14px 32px', r: '8px', fs: '16px' },
    specs: [
      ['Buton rengi', 'HoneyDark (#C57930) — ana honey rengi değil'],
      ['Geçerlilik notu', '"Bu bağlantı 1 saat geçerlidir" — bold vurgu'],
      ['Alt güvenlik notu', '13px, #999999'],
      ['Buton margin', '32px üst ve alt'],
    ],
  },
  {
    no: '4', name: 'Şifre Değiştirildi', tag: 'Hesap & Güvenlik',
    konu: '"[Marka] — Şifreniz Değiştirildi"',
    gonderim: 'Kullanıcı şifresini başarıyla değiştirdiğinde',
    layout: 'Header + Body (sadece metin, buton yok)',
    btn: null,
    specs: [
      ['Uyarı metni', '"Bu işlemi siz yapmadıysanız..." — #E53E3E (kırmızı)'],
      ['Bilgi metni', 'Normal gri (#555555)'],
      ['Buton', 'Bu şablonda CTA butonu yoktur'],
    ],
  },
  {
    no: '5', name: 'Sipariş Onaylandı', tag: 'Sipariş',
    konu: '"[Marka] — Siparişiniz Alındı: #[SİPARİŞNO]"',
    gonderim: 'Ödeme başarıyla tamamlandığında',
    layout: 'Header + Body + Ürün tablosu + Toplam + Buton',
    btn: { label: 'Siparişimi Görüntüle', color: C.honey, pad: '12px 28px', r: '8px', fs: '14px' },
    specs: [
      ['Tablo başlık satırı', 'background: #FFF8E7 (cream), padding: 8px 12px, 13px gri'],
      ['Tablo hücre padding', '10px 12px, alt çizgi: 1px solid #F0F0F0'],
      ['Ürün adı', '14px, #1A1A1A | Varyant bilgisi: 12px, #999999'],
      ['Adet sütunu', '14px, sağa hizalı'],
      ['Tutar sütunu', '14px, bold, sağa hizalı'],
      ['Toplam satırı', '16px, bold, #F9B10B (honey renkli), sağa hizalı'],
      ['Buton', 'Tablodan sonra ortalı'],
    ],
  },
  {
    no: '6', name: 'Sipariş Durumu', tag: 'Sipariş',
    konu: '"[Marka] — Sipariş Durumu Güncellendi: #[SİPARİŞNO]"',
    gonderim: 'Siparişin durumu her değiştiğinde (admin veya sistem)',
    layout: 'Header + Body + Durum kutusu (renkli) + Kargo bilgisi (koşullu) + Buton',
    btn: { label: 'Siparişimi Görüntüle', color: C.honey, pad: '12px 28px', r: '8px', fs: '14px' },
    specs: [
      ['Durum kutusu', 'background: #F8F8F8, border-radius: 8px, padding: 16px 24px, metin ortalı, 18px bold'],
      ['Onaylandı rengi', '#3182CE (mavi)'],
      ['Hazırlanıyor rengi', '#D69E2E (sarı)'],
      ['Kargoya Verildi rengi', '#805AD5 (mor)'],
      ['Teslim Edildi rengi', '#38A169 (yeşil)'],
      ['İptal Edildi rengi', '#E53E3E (kırmızı)'],
      ['İade Edildi rengi', '#718096 (gri)'],
      ['Kargo bilgi kutusu', 'Sadece "Kargoya Verildi" durumunda — background: #F0F4FF, border-radius: 8px, padding: 16px 24px, 14px'],
      ['Kargo alanları', 'Kargo Firması + Takip Numarası — bold etiket, normal değer'],
    ],
  },
];

for (const t of templates) {
  pageHeader(t.tag + ' Şablonları');
  let y = templateHeader(t.no, t.name, t.tag, doc.y);
  y += 4;

  // ── Gönderim zamanı
  doc.rect(ML + 12, y, CW - 24, 22).fill(rgb(C.bg));
  doc.fillColor(rgb(C.honeyDark)).fontSize(7.5).font('Bold')
    .text('GÖNDERİM ZAMANI', ML + 20, y + 3);
  doc.fillColor(rgb(C.dark)).fontSize(8.5).font('Normal')
    .text(t.gonderim, ML + 20, y + 13, { width: CW - 40 });
  y += 30;

  // ── Konu satırı
  y = row('KONU SATIRI', t.konu, y);
  y += 4;

  // ── Layout diyagramı
  doc.fillColor(rgb(C.light)).fontSize(7.5).font('Bold').text('LAYOUT', ML + 12, y);
  y += 10;
  const parts = t.layout.split(' + ');
  let px = ML + 12;
  for (let i = 0; i < parts.length; i++) {
    const pw = (CW - 24 - (parts.length - 1) * 4) / parts.length;
    doc.rect(px, y, pw, 22).fill(i === 0 ? rgb(C.honey) : rgb(C.bg));
    doc.fillColor(i === 0 ? 'white' : rgb(C.mid)).fontSize(6.5).font('Bold')
      .text(parts[i], px + 2, y + 7, { width: pw - 4, align: 'center' });
    px += pw + 4;
  }
  y += 30;

  // ── Buton
  if (t.btn) {
    doc.fillColor(rgb(C.light)).fontSize(7.5).font('Bold').text('CTA BUTON', ML + 12, y);
    y += 10;
    const bw = 160, bh = 28;
    doc.roundedRect(ML + 12, y, bw, bh, parseInt(t.btn.r)).fill(rgb(t.btn.color));
    doc.fillColor('white').fontSize(9).font('Bold')
      .text(t.btn.label, ML + 12, y + (bh - 9) / 2, { width: bw, align: 'center' });
    doc.fillColor(rgb(C.light)).fontSize(7.5).font('Normal')
      .text(`padding: ${t.btn.pad}   |   border-radius: ${t.btn.r}   |   font: ${t.btn.fs} bold   |   renk: ${t.btn.color.toUpperCase()}`, ML + 12, y + bh + 6, { width: CW - 24 });
    y += bh + 22;
  }

  // ── Detay specs
  if (t.specs.length) {
    y = separator(y);
    doc.fillColor(rgb(C.light)).fontSize(7.5).font('Bold').text('DETAY ÖLÇÜLERİ', ML + 12, y);
    y += 12;
    for (const [l, v] of t.specs) {
      doc.rect(ML + 12, y - 1, 8, 8).fill(rgb(C.honey));
      doc.fillColor(rgb(C.mid)).fontSize(7.5).font('Bold')
        .text(l, ML + 26, y, { width: 130, continued: false });
      doc.fillColor(rgb(C.dark)).fontSize(7.5).font('Normal')
        .text(v, ML + 162, y, { width: CW - 162 - 12 });
      y += 14;
    }
  }
  doc.addPage();
}

// ── Kalan 4 şablon
const templates2 = [
  {
    no: '7', name: 'Favori Ürün İndirimi', tag: 'Pazarlama',
    konu: '"[Marka] — Favori Ürününüzde İndirim!"',
    gonderim: 'Kullanıcının favorilediği ürünlerde fiyat indirimi uygulandığında (otomatik)',
    layout: 'Header + Body + Ürün kartları listesi',
    btn: null,
    specs: [
      ['Ürün kartı', 'border: 1px solid #F0F0F0, border-radius: 8px, padding: 16px, margin: 12px 0'],
      ['Ürün adı', '14px, bold, #1A1A1A'],
      ['Eski fiyat', '14px, üstü çizili (line-through), #999999'],
      ['Yeni fiyat', '16px, bold, #38A169 (yeşil)'],
      ['Ürünü incele linki', '"Ürünü İncele →" — #F9B10B, bold, text-decoration: none'],
      ['Link margin', 'Fiyat satırından sonra 10px üst boşluk'],
    ],
  },
  {
    no: '8', name: 'Kupon Son Kullanım', tag: 'Pazarlama',
    konu: '"[Marka] — Kuponunuzun Süresi Dolmak Üzere"',
    gonderim: 'Kuponun son kullanım tarihine belirli gün kala (otomatik)',
    layout: 'Header + Body + Kupon kutusu + Buton',
    btn: { label: 'Hemen Kullan', color: C.honey, pad: '12px 28px', r: '8px', fs: '14px' },
    specs: [
      ['Kupon kutusu', 'background: #FFF8E7, border: 2px dashed #F9B10B, border-radius: 8px, padding: 20px, merkezi hizalı'],
      ['"Kupon Kodu" etiketi', '13px, #888888'],
      ['Kupon kodu', '28px, bold, letter-spacing: 4px, #C57930'],
      ['İndirim etiketi', '16px, #1A1A1A'],
      ['Son kullanım tarihi', '13px, #E53E3E (kırmızı)'],
      ['Kupon kutusu margin', '24px üst ve alt'],
    ],
  },
  {
    no: '9', name: 'Yorum İsteği', tag: 'Pazarlama',
    konu: '"[Marka] — Ürünlerimizi Değerlendirin"',
    gonderim: 'Sipariş teslim edildikten birkaç gün sonra (otomatik)',
    layout: 'Header + Body + Ürün kartları listesi (her birinde buton)',
    btn: { label: 'Yorum Yaz', color: C.honey, pad: '8px 18px', r: '6px', fs: '13px' },
    specs: [
      ['Ürün kartı', 'border: 1px solid #F0F0F0, border-radius: 8px, padding: 16px, display: flex, space-between'],
      ['Ürün adı', '14px, bold, #1A1A1A'],
      ['Varyant', '13px, #999999'],
      ['Buton', 'Kart içinde sağa yaslı, white-space: nowrap (kırılmaz)'],
    ],
  },
  {
    no: '10', name: 'Yorum Yanıtı', tag: 'Müşteri İletişim',
    konu: '"[Marka] — Yorumunuza Yanıt Geldi"',
    gonderim: 'Admin panelinden bir yoruma yanıt girilip kaydedildiğinde',
    layout: 'Header + Body + Müşteri yorum kutusu + Admin yanıt kutusu + Buton + Footer',
    btn: { label: 'Ürünü Görüntüle', color: C.honey, pad: '12px 24px', r: '8px', fs: '14px' },
    specs: [
      ['Müşteri yorum kutusu', 'background: #F9F9F9, border-left: 4px solid #DDDDDD, border-radius: 4px, padding: 12px 16px'],
      ['"Yorumunuz" etiketi', '13px, #888888'],
      ['Yorum metni', 'font-style: italic, #555555'],
      ['Admin yanıt kutusu', 'background: #FFF8E7, border-left: 4px solid #F9B10B, border-radius: 4px, padding: 12px 16px'],
      ['"Satıcı Yanıtı" etiketi', '13px, bold, #C57930'],
      ['Yanıt metni', '14px, #333333 (normal)'],
      ['Kutular arası boşluk', '16px'],
      ['FOOTER', 'Yalnızca bu şablonda footer vardır — background: #F5F5F5, 12px, #999999, merkezi'],
    ],
  },
];

for (const t of templates2) {
  pageHeader(t.tag + ' Şablonları');
  let y = templateHeader(t.no, t.name, t.tag, doc.y);
  y += 4;

  doc.rect(ML + 12, y, CW - 24, 22).fill(rgb(C.bg));
  doc.fillColor(rgb(C.honeyDark)).fontSize(7.5).font('Bold')
    .text('GÖNDERİM ZAMANI', ML + 20, y + 3);
  doc.fillColor(rgb(C.dark)).fontSize(8.5).font('Normal')
    .text(t.gonderim, ML + 20, y + 13, { width: CW - 40 });
  y += 30;

  y = row('KONU SATIRI', t.konu, y);
  y += 4;

  doc.fillColor(rgb(C.light)).fontSize(7.5).font('Bold').text('LAYOUT', ML + 12, y);
  y += 10;
  const parts = t.layout.split(' + ');
  let px = ML + 12;
  for (let i = 0; i < parts.length; i++) {
    const pw = (CW - 24 - (parts.length - 1) * 4) / parts.length;
    doc.rect(px, y, pw, 22).fill(i === 0 ? rgb(C.honey) : rgb(C.bg));
    doc.fillColor(i === 0 ? 'white' : rgb(C.mid)).fontSize(6.5).font('Bold')
      .text(parts[i], px + 2, y + 7, { width: pw - 4, align: 'center' });
    px += pw + 4;
  }
  y += 30;

  if (t.btn) {
    doc.fillColor(rgb(C.light)).fontSize(7.5).font('Bold').text('CTA BUTON', ML + 12, y);
    y += 10;
    const bw = 160, bh = 28;
    doc.roundedRect(ML + 12, y, bw, bh, parseInt(t.btn.r)).fill(rgb(t.btn.color));
    doc.fillColor('white').fontSize(9).font('Bold')
      .text(t.btn.label, ML + 12, y + (bh - 9) / 2, { width: bw, align: 'center' });
    doc.fillColor(rgb(C.light)).fontSize(7.5).font('Normal')
      .text(`padding: ${t.btn.pad}   |   border-radius: ${t.btn.r}   |   font: ${t.btn.fs} bold   |   renk: ${t.btn.color.toUpperCase()}`, ML + 12, y + bh + 6, { width: CW - 24 });
    y += bh + 22;
  }

  if (t.specs.length) {
    y = separator(y);
    doc.fillColor(rgb(C.light)).fontSize(7.5).font('Bold').text('DETAY ÖLÇÜLERİ', ML + 12, y);
    y += 12;
    for (const [l, v] of t.specs) {
      doc.rect(ML + 12, y - 1, 8, 8).fill(rgb(C.honey));
      doc.fillColor(rgb(C.mid)).fontSize(7.5).font('Bold')
        .text(l, ML + 26, y, { width: 130 });
      doc.fillColor(rgb(C.dark)).fontSize(7.5).font('Normal')
        .text(v, ML + 162, y, { width: CW - 162 - 12 });
      y += 14;
    }
  }
  doc.addPage();
}

// ════════════════════════════════════════════════════════════════════════════
// SON SAYFA — GÖNDERİM ZAMANLARI ÖZET
// ════════════════════════════════════════════════════════════════════════════
pageHeader('Gönderim Zamanları Özeti');

const timelineItems = [
  { moment: 'Kayıt formu gönderildi',     mails: ['E-posta Doğrulama', 'Hoş Geldiniz'],     color: C.honey },
  { moment: '"Şifremi Unuttum" formu',     mails: ['Şifre Sıfırlama'],                        color: C.honeyDark },
  { moment: 'Şifre başarıyla değiştirildi', mails: ['Şifre Değiştirildi'],                    color: C.honeyDark },
  { moment: 'Ödeme tamamlandı',            mails: ['Sipariş Onaylandı'],                      color: C.honey },
  { moment: 'Sipariş durumu değişti',      mails: ['Sipariş Durumu Güncellendi'],             color: C.honey },
  { moment: 'Favorilerde fiyat düştü (otomatik)', mails: ['Favori Ürün İndirimi'],           color: C.green },
  { moment: 'Kupon son kullanıma yakın (otomatik)', mails: ['Kupon Son Kullanım Uyarısı'],   color: C.red },
  { moment: 'Sipariş tesliminden sonra (otomatik)', mails: ['Yorum İsteği'],                  color: C.blue },
  { moment: 'Admin yoruma yanıt girdi',    mails: ['Yorum Yanıtı'],                           color: C.purple },
];

let ty = doc.y + 8;
for (const item of timelineItems) {
  // sol çizgi
  doc.rect(ML + 24, ty, 2, 44).fill(rgb(item.color));
  // nokta
  doc.circle(ML + 25, ty + 4, 5).fill(rgb(item.color));

  // moment kutusu
  doc.rect(ML + 40, ty, CW - 52, 20).fill(rgb(C.bg));
  doc.fillColor(rgb(item.color)).fontSize(8.5).font('Bold')
    .text(item.moment, ML + 48, ty + 5, { width: CW - 60 });

  // mail pill'leri
  let mx = ML + 48;
  for (const m of item.mails) {
    const mw = doc.widthOfString(m, { fontSize: 7.5 }) + 16;
    doc.roundedRect(mx, ty + 26, mw, 14, 7).fill(rgb(C.cream));
    doc.fillColor(rgb(C.honeyDark)).fontSize(7.5).font('Bold')
      .text(m, mx + 8, ty + 29);
    mx += mw + 6;
  }

  ty += 52;
}

// Bildirim Tercihi notu
ty += 8;
doc.rect(ML, ty, CW, 36).fill(rgb(C.cream));
doc.rect(ML, ty, 4, 36).fill(rgb(C.honey));
doc.fillColor(rgb(C.honeyDark)).fontSize(8).font('Bold')
  .text('Bildirim Tercihi', ML + 14, ty + 6);
doc.fillColor(rgb(C.mid)).fontSize(8).font('Normal')
  .text('Pazarlama e-postaları (Favori İndirim, Kupon, Yorum İsteği) kullanıcının bildirim tercihlerine göre gönderilir ya da gönderilmez. Hesap ve sipariş e-postaları her zaman gider.', ML + 14, ty + 18, { width: CW - 28 });

doc.end();
stream.on('finish', () => console.log('PDF olusturuldu: ' + OUT));
stream.on('error', (e) => { console.error(e); process.exit(1); });

