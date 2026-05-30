import fs from "fs";

const old = fs.readFileSync("DEVLOG_old.html", "utf8");

const newSession = `
    <!-- SESSION 2026-05-30 -->
    <section class="day-section" id="2026-05-30">
      <div class="day-header">
        <span class="day-date">30 Mayis 2026</span>
        <span class="day-label">Urun Detay Sayfasi — Kapsamli Gelistirmeler</span>
      </div>

      <div class="commit-block">
        <div class="commit-meta">
          <span class="commit-hash">0969f66</span>
          <span class="commit-time">~10:00</span>
          <span class="tag feat">feat</span>
        </div>
        <div class="commit-title">Ozellik Kartlari — Urun Aciklamasindan Once</div>
        <div class="commit-body">
          <p>Urun detay sayfasinda aciklamanin ustune 3 kart: <strong>Kooperatif Uretimi</strong>, <strong>Guvenli Paketleme</strong>, <strong>Musteri Memnuniyeti</strong>. Lucide ikonlari, krem arka plan.</p>
          <div class="files"><span class="file">app/(shop)/urunlerimiz/[slug]/page.tsx</span></div>
        </div>
      </div>

      <div class="commit-block">
        <div class="commit-meta">
          <span class="commit-hash">0969f66</span>
          <span class="commit-time">~10:20</span>
          <span class="tag feat">feat</span>
        </div>
        <div class="commit-title">Urun Hikayesi Bolumu</div>
        <div class="commit-body">
          <p>Tab view'dan sonra sabit gorunen bolum. Sol metin + sag gorsel + altin altigen rozet (1700 Kooperatif Ailesi). Arka plan #FFF8EE.</p>
          <div class="files"><span class="file">app/(shop)/urunlerimiz/[slug]/page.tsx</span></div>
        </div>
      </div>

      <div class="commit-block">
        <div class="commit-meta">
          <span class="commit-hash">0969f66</span>
          <span class="commit-time">~10:45</span>
          <span class="tag feat">feat</span>
          <span class="tag schema">schema</span>
        </div>
        <div class="commit-title">ProductTasteProfile — Tat Profili ve Kullanim Onerileri</div>
        <div class="commit-body">
          <p>Yeni bilesen: bullet tat notlari + 6 kullanim etiketi (kahvalti, cay, tatli, smoothie, pisen, atistirmalik). Veri yoksa varsayilan icerik gosterilir.</p>
          <p>Schema: tasteNotes Json?, usageSuggestions Json?. Admin formuna Tat Profili karti eklendi.</p>
          <div class="files">
            <span class="file">components/shop/product/ProductTasteProfile.tsx</span>
            <span class="file">prisma/schema.prisma</span>
            <span class="file">components/admin/ProductEditForm.tsx</span>
            <span class="file">lib/utils/serialize.ts</span>
          </div>
        </div>
      </div>

      <div class="commit-block">
        <div class="commit-meta">
          <span class="commit-hash">0969f66</span>
          <span class="commit-time">~11:15</span>
          <span class="tag feat">feat</span>
        </div>
        <div class="commit-title">Analiz Raporu PDF — PDFKit Uretim ve Modal Viewer</div>
        <div class="commit-body">
          <p>Arial TTF gomulu, tek sayfa A4 PDF. 12 parametre: rutubet, HMF, diastaz, seker, pH, renk (Pfund), prolin, polen vb. Modal dialog stili PdfViewerOverlay (ESC, indir, yeni sekme). ProductTabs'a Analiz Raporu sekmesi eklendi.</p>
          <div class="files">
            <span class="file">public/documents/ornek-analiz-raporu.pdf</span>
            <span class="file">scripts/generate-analysis-pdf.mjs</span>
            <span class="file">components/shop/product/PdfViewerOverlay.tsx</span>
            <span class="file">components/shop/product/ProductTabs.tsx</span>
          </div>
        </div>
      </div>

      <div class="commit-block">
        <div class="commit-meta">
          <span class="commit-hash">0969f66</span>
          <span class="commit-time">~11:50</span>
          <span class="tag feat">feat</span>
          <span class="tag data">data</span>
        </div>
        <div class="commit-title">Musteri Yorumlari Sekmesi + 4'erli Pagination + Seed</div>
        <div class="commit-body">
          <p>Hangi Balcidan kaldiridi. Yildiz puanli yorumlar sekmesi eklendi: ortalama puan + bar chart ozeti, 4'erli pagination (Onceki/Sonraki + sayfa numarasi). 31 urune 217 ornek yorum seed edildi.</p>
          <div class="files">
            <span class="file">components/shop/product/ProductTabs.tsx</span>
            <span class="file">scripts/seed-reviews.mjs</span>
          </div>
        </div>
      </div>

      <div class="commit-block">
        <div class="commit-meta">
          <span class="commit-hash">0969f66</span>
          <span class="commit-time">~12:45</span>
          <span class="tag style">style</span>
          <span class="tag schema">schema</span>
        </div>
        <div class="commit-title">Guven Bandi SVG + Admin PDF Yonetimi</div>
        <div class="commit-body">
          <p>Guven bandi emojiden custom SVG ikonlara tasindi: siperlkli arici, kalkan+tik, kullanici, yaprak. Alt ayirici SVG ari (kanatlar, seritler, antenler, igne). Admin formuna analiz raporu PDF yukleme karti eklendi; analysisReportUrl String? schema'ya eklendi.</p>
          <div class="files">
            <span class="file">app/(shop)/urunlerimiz/[slug]/page.tsx</span>
            <span class="file">components/admin/ProductEditForm.tsx</span>
            <span class="file">app/api/admin/products/[id]/route.ts</span>
            <span class="file">app/api/admin/products/route.ts</span>
            <span class="file">prisma/schema.prisma</span>
          </div>
        </div>
      </div>

    </section>
`;

const insertPoint = old.lastIndexOf("</main>");
if (insertPoint === -1) {
  console.error("</main> not found!");
  process.exit(1);
}

const merged = old.slice(0, insertPoint) + newSession + "\n  " + old.slice(insertPoint);
fs.writeFileSync("DEVLOG.html", merged, "utf8");
fs.unlinkSync("DEVLOG_old.html");
console.log("Done. DEVLOG.html updated, length:", merged.length);
