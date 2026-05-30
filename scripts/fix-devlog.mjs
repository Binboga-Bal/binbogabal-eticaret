import fs from "fs";

let html = fs.readFileSync("DEVLOG.html", "utf8");

// 1. Yanlış eklenen SESSION bloğunu sil
html = html.replace(/\n\s*<!-- SESSION 2026-05-30 -->[\s\S]*?<\/section>\n/g, "");

// 2. Sidebar nav'a 30 Mayıs bölümünü ekle (son nav-section-label'dan sonra değil, </nav> kapanmadan önce)
const sidebarInsert = `
      <div class="nav-section-label">30 Mayıs 2026 — Ürün Detay</div>
      <a href="#step65" class="nav-link"><span class="dot"></span>65 — Özellik Kartları</a>
      <a href="#step66" class="nav-link"><span class="dot"></span>66 — Ürün Hikayesi Bölümü</a>
      <a href="#step67" class="nav-link"><span class="dot"></span>67 — Tat Profili &amp; Kullanım Önerileri</a>
      <a href="#step68" class="nav-link"><span class="dot"></span>68 — Analiz Raporu PDF</a>
      <a href="#step69" class="nav-link"><span class="dot"></span>69 — Müşteri Yorumları + Pagination</a>
      <a href="#step70" class="nav-link"><span class="dot"></span>70 — Güven Bandı SVG</a>
      <a href="#step71" class="nav-link"><span class="dot"></span>71 — Admin PDF Yönetimi</a>
`;

// Referans bölümü div'inden önce ekle
html = html.replace(
  `      <div class="nav-section-label">Referans</div>`,
  sidebarInsert + `      <div class="nav-section-label">Referans</div>`
);

// 3. Footer'dan önce yeni adımları ekle
const newSteps = `
    <!-- ═══════════════════════════════ 30 MAYIS 2026 — ÜRÜN DETAY -->

    <section class="section" id="step65">
      <div class="section-title">
        <div class="step-num">65</div>
        <h2>Özellik Kartları — Ürün Açıklamasından Önce</h2>
      </div>
      <div class="card">
        <h3>Değişiklik</h3>
        <p>Ürün detay sayfasında ürün açıklamasının üstüne 3 özellik kartı eklendi: <strong>Kooperatif Üretimi</strong> (1972'ten beri), <strong>Güvenli Paketleme</strong>, <strong>Müşteri Memnuniyeti</strong> (%100 garanti). Lucide-react ikonları (ThumbsUp, Package, Heart), krem arka plan <code>#F8F3EE</code>, border + rounded-2xl kart düzeni.</p>
      </div>
      <div class="card">
        <h3>Etkilenen Dosyalar</h3>
        <div class="file-tree">
          <span class="file mod">app/(shop)/urunlerimiz/[slug]/page.tsx</span> — 3 kart grid'i eklendi
        </div>
      </div>
    </section>

    <section class="section" id="step66">
      <div class="section-title">
        <div class="step-num">66</div>
        <h2>Ürün Hikayesi Bölümü</h2>
      </div>
      <div class="card">
        <h3>Değişiklik</h3>
        <p>Tab view'dan sonra, her ürün sayfasında sabit görünen "Ürün Hikayesi" bölümü eklendi. Sol: başlık + 3 paragraf metin. Sağ: <code>about-us.webp</code> görseli üzerinde altın altıgen rozet ("1700 Kooperatif Ailesi"). Arka plan <code>#FFF8EE</code>, <code>clipPath</code> ile altıgen şekli.</p>
      </div>
      <div class="card">
        <h3>Etkilenen Dosyalar</h3>
        <div class="file-tree">
          <span class="file mod">app/(shop)/urunlerimiz/[slug]/page.tsx</span> — Ürün Hikayesi section
        </div>
      </div>
    </section>

    <section class="section" id="step67">
      <div class="section-title">
        <div class="step-num">67</div>
        <h2>ProductTasteProfile — Tat Profili &amp; Kullanım Önerileri</h2>
      </div>
      <div class="card">
        <h3>Değişiklik</h3>
        <p>Yeni bileşen oluşturuldu. Sol: başlık + bullet tat notları + kullanım kartları (ikon + etiket). Sağ: görsel. Ürüne özel veri yoksa 3 varsayılan tat notu ve <code>["kahvalti","cay","tatli"]</code> gösterilir.</p>
        <ul>
          <li>6 kullanım etiketi: <code>kahvalti</code>, <code>cay</code>, <code>tatli</code>, <code>smoothie</code>, <code>pisen</code>, <code>atistirmalik</code></li>
          <li>Schema: <code>tasteNotes Json?</code>, <code>usageSuggestions Json?</code> eklendi</li>
          <li>Admin formuna dinamik liste + tag seçimi kartı eklendi</li>
          <li>PUT/POST API'larına alanlar eklendi</li>
        </ul>
      </div>
      <div class="card">
        <h3>Etkilenen Dosyalar</h3>
        <div class="file-tree">
          <span class="file new">components/shop/product/ProductTasteProfile.tsx</span> — yeni bileşen<br>
          <span class="file mod">prisma/schema.prisma</span> — tasteNotes, usageSuggestions<br>
          <span class="file mod">lib/utils/serialize.ts</span> — SerializedProduct tip güncellemesi<br>
          <span class="file mod">components/admin/ProductEditForm.tsx</span> — Tat Profili kartı<br>
          <span class="file mod">app/api/admin/products/[id]/route.ts</span><br>
          <span class="file mod">app/api/admin/products/route.ts</span>
        </div>
      </div>
    </section>

    <section class="section" id="step68">
      <div class="section-title">
        <div class="step-num">68</div>
        <h2>Analiz Raporu PDF — PDFKit Üretim &amp; Modal Viewer</h2>
      </div>
      <div class="card">
        <h3>PDF Üretimi</h3>
        <p>PDFKit ile profesyonel bal kalite analiz raporu üretildi. Arial TTF gömülerek Türkçe karakter desteği sağlandı. Tek sayfa A4, tam layout hesabı (footer 762–812pt, sayfa sınırı 841pt). 12 analiz parametresi: rutubet, HMF, diastaz, früktoz/glükoz/sakaroz, elektriksel iletkenlik, pH, su içermeyen madde, renk (Pfund), toplam asitlik, prolin, polen.</p>
      </div>
      <div class="card">
        <h3>PdfViewerOverlay Bileşeni</h3>
        <p>Modal dialog stili PDF viewer: <code>max-w-4xl h-[90vh]</code>, beyaz kart, köşe yuvarlak. Başlık çubuğu: İndir + Yeni Sekmede Aç butonları, ESC ile kapatma, backdrop tıklamayla kapatma. ProductTabs'a "Analiz Raporu" sekmesi eklendi.</p>
      </div>
      <div class="card">
        <h3>Etkilenen Dosyalar</h3>
        <div class="file-tree">
          <span class="file new">scripts/generate-analysis-pdf.mjs</span> — PDF üretim scripti<br>
          <span class="file new">public/documents/ornek-analiz-raporu.pdf</span> — örnek rapor<br>
          <span class="file new">components/shop/product/PdfViewerOverlay.tsx</span> — modal viewer<br>
          <span class="file mod">components/shop/product/ProductTabs.tsx</span> — Analiz Raporu sekmesi
        </div>
      </div>
    </section>

    <section class="section" id="step69">
      <div class="section-title">
        <div class="step-num">69</div>
        <h2>Müşteri Yorumları Sekmesi + 4'erli Pagination + Seed</h2>
      </div>
      <div class="card">
        <h3>Değişiklik</h3>
        <p>"Hangi Balcıdan" sekmesi kaldırıldı. Yıldız puanlı Müşteri Yorumları sekmesi eklendi. Özet kart: büyük ortalama puan + 5→1 yıldız bar chart. Her yorum: avatar (ilk harf dairesi), isim, tarih, yıldız satırı, yorum metni. Sayfa başına 4 yorum, Önceki/Sonraki + sayfa numarası butonları. Sekme başlığında yorum sayısı: <code>Müşteri Yorumları (7)</code>.</p>
      </div>
      <div class="card">
        <h3>Seed</h3>
        <p>31 aktif ürüne toplam 217 örnek yorum eklendi (ürün başına 7). 4–5 yıldız, son 180 gün içine dağıtılmış tarihler, gerçekçi Türkçe metinler.</p>
      </div>
      <div class="card">
        <h3>Etkilenen Dosyalar</h3>
        <div class="file-tree">
          <span class="file mod">components/shop/product/ProductTabs.tsx</span> — yorum sekmesi + pagination<br>
          <span class="file mod">app/(shop)/urunlerimiz/[slug]/page.tsx</span> — reviews prop geçişi<br>
          <span class="file new">scripts/seed-reviews.mjs</span> — örnek yorum seed scripti
        </div>
      </div>
    </section>

    <section class="section" id="step70">
      <div class="section-title">
        <div class="step-num">70</div>
        <h2>Güven Bandı — Custom SVG İkonlar &amp; SVG Arı Ayırıcı</h2>
      </div>
      <div class="card">
        <h3>Değişiklik</h3>
        <p>Emoji tabanlı güven bandı tamamen custom SVG çizgi ikonlarına taşındı. Referans tasarımla birebir eşleştirildi.</p>
        <ul>
          <li>Sol: iç içe altıgen (honeycomb) SVG + bold "KOOPERATİF GÜCÜ / HEPİMİZ İÇİN DEĞER ÜRETİR." + dikey ayırıcı</li>
          <li>Arıcı: siperlikli şapka, peçe çizgisi (dashed), kollar, gövde — custom SVG</li>
          <li>Kalkan + tik, kullanıcı silüeti, yaprak — custom SVG</li>
          <li>İkonlar arası "+" ayırıcılar, içerik <code>justify-center</code> ile ortalandı</li>
          <li>Alt ayırıcı: çizgiler arasında SVG arı (kanatlar, şeritler, antenler, iğne)</li>
          <li>İkon boyutları: <code>w-12 h-12</code></li>
        </ul>
      </div>
      <div class="card">
        <h3>Etkilenen Dosyalar</h3>
        <div class="file-tree">
          <span class="file mod">app/(shop)/urunlerimiz/[slug]/page.tsx</span> — güven bandı yeniden yazıldı
        </div>
      </div>
    </section>

    <section class="section" id="step71">
      <div class="section-title">
        <div class="step-num">71</div>
        <h2>Admin — Analiz Raporu PDF Yönetimi</h2>
      </div>
      <div class="card">
        <h3>Değişiklik</h3>
        <p>Admin ürün düzenleme sayfasına Analiz Raporu (PDF) kartı eklendi. PDF yükleme (<code>/api/admin/upload</code> → <code>documents/</code> klasörü), mevcut dosyayı önizleme linki ile gösterme, X ile kaldırma, "Değiştir" ile yenisini seçme. Kaydedilince <code>analysisReportUrl</code> DB'ye yazılır; ürün detay sayfası önce DB URL'ini, yoksa örnek raporu kullanır.</p>
      </div>
      <div class="card">
        <h3>Etkilenen Dosyalar</h3>
        <div class="file-tree">
          <span class="file mod">prisma/schema.prisma</span> — analysisReportUrl String?<br>
          <span class="file mod">lib/utils/serialize.ts</span> — SerializedProduct tip güncellemesi<br>
          <span class="file mod">components/admin/ProductEditForm.tsx</span> — PDF upload kartı<br>
          <span class="file mod">app/api/admin/products/[id]/route.ts</span><br>
          <span class="file mod">app/api/admin/products/route.ts</span>
        </div>
      </div>
    </section>

`;

// Footer div'inden hemen önce ekle
html = html.replace(
  `    <!-- FOOTER -->`,
  newSteps + `    <!-- FOOTER -->`
);

// Footer tarihini güncelle
html = html.replace(
  "Son güncelleme: 26 Mayıs 2026 — Adım 64 · Claude tarafından yazıldı",
  "Son güncelleme: 30 Mayıs 2026 — Adım 71 · Claude tarafından yazıldı"
);

fs.writeFileSync("DEVLOG.html", html, "utf8");
console.log("Done. Length:", html.length);
