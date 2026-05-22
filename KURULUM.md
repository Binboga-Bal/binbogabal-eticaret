# Binboğa Bal E-Ticaret — Kurulum Kılavuzu

## Gereksinimler

- Node.js 18+
- MySQL 8+
- npm veya yarn

## Kurulum Adımları

### 1. Bağımlılıkları Kur

```bash
npm install
```

### 2. .env Dosyasını Oluştur

```bash
cp .env.example .env
```

`.env` dosyasını düzenle ve aşağıdaki değerleri gir:

- `DATABASE_URL` → MySQL bağlantı stringi
- `NEXTAUTH_SECRET` → En az 32 karakterli rastgele bir string
- `QNB_PAY_*` → QNB Pay merchant bilgileri
- `DIA_ERP_*` → Dia ERP API bilgileri

```bash
# Güvenli secret üretmek için:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Veritabanını Oluştur

```bash
npm run db:generate    # Prisma client oluştur
npm run db:push        # Tabloları oluştur (geliştirme)
# veya
npm run db:migrate     # Production migration
npm run db:seed        # Örnek verileri yükle
```

### 4. Geliştirme Sunucusunu Başlat

```bash
npm run dev
```

### 5. Admin Paneline Giriş

- URL: `http://localhost:3000/admin`
- E-posta: `admin@binbogabal.com.tr`
- Şifre: `admin123456` ← **Üretimde mutlaka değiştirin!**

---

## Production Deploy (VPS / Web Hosting)

### Build

```bash
npm run build
```

### PM2 ile Başlat

```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Nginx Konfigürasyonu

```nginx
server {
    listen 80;
    server_name binbogabal.com.tr www.binbogabal.com.tr;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Proje Yapısı

```
binbogabal-eticaret/
├── app/
│   ├── (shop)/          → Mağaza sayfaları
│   ├── admin/           → Admin paneli
│   └── api/             → API rotları
├── components/
│   ├── ui/              → Temel UI bileşenleri
│   ├── shop/            → Mağaza bileşenleri
│   └── admin/           → Admin bileşenleri
├── lib/
│   ├── payment/         → Ödeme adaptörleri (QNB Pay, genişletilebilir)
│   ├── dia-erp/         → Dia ERP entegrasyonu
│   └── utils/           → Yardımcı fonksiyonlar
├── prisma/
│   ├── schema.prisma    → Veritabanı şeması
│   └── seed.ts          → Örnek veriler
└── store/
    └── cart.ts          → Sepet state (Zustand)
```

## Yeni Ödeme Sağlayıcısı Eklemek

1. `lib/payment/` altında yeni adapter oluştur (örn: `iyzico.ts`)
2. `PaymentAdapter` interface'ini uygula
3. `lib/payment/index.ts` içindeki `adapters` nesnesine ekle

## Dia ERP Entegrasyonu

ERP bağlantı bilgileri `.env` dosyasından alınır. Senkronizasyon için:

- Admin → ERP Senkron. sayfasına git
- "Ürünleri Senkronize Et", "Stokları Güncelle" butonlarını kullan
