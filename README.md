# Türkiye Sinema ve Medya Vakfı — Bilgi Formu

Kurucu Mütevelli Heyeti üyelerinin fotoğraf, biyografi ve bağış takip sistemi.

## Özellikler

- **Kart/Liste görünümü** — Üyeleri fotoğraflı kartlar veya tablo olarak görüntüleme
- **Profil sistemi** — Üyeler kendi fotoğraf ve biyografilerini yükleyebilir
- **Bağış bildirimi** — Tutar + dekont (JPG/PNG/PDF) yükleme
- **Admin onay sistemi** — Tüm değişiklikler admin onayından geçer
- **Admin paneli** — Üye ekleme/düzenleme/silme, bağış düzenleme, site başlık ayarları
- **CSV export** — Tüm veriyi Excel'e aktarma
- **Vercel + GitHub** uyumlu

## Kurulum

### 1. Gereksinimler

- Node.js 18+
- npm veya yarn

### 2. Bağımlılıkları yükle

```bash
npm install
```

### 3. Geliştirme ortamında çalıştır

```bash
npm run dev
```

Tarayıcıda `http://localhost:3000` adresini aç.

### 4. Build al

```bash
npm run build
npm start
```

## GitHub'a Yükleme

```bash
git init
git add .
git commit -m "İlk commit"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADI/REPO_ADI.git
git push -u origin main
```

## Vercel'e Deploy

### Yöntem A — Vercel Web Arayüzü (Kolay)

1. [vercel.com](https://vercel.com) adresine git ve GitHub hesabınla giriş yap
2. "New Project" → GitHub repo'nu seç
3. Framework olarak **Next.js** otomatik algılanır
4. "Deploy" butonuna tıkla — 2 dakikada yayında!

### Yöntem B — Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

## Admin Şifresi Değiştirme

### Basit yöntem (ortam değişkeni)

Vercel dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_ADMIN_PASSWORD = yenisifreniz
```

### Direkt kod değişikliği

`src/lib/store.ts` dosyasında:

```ts
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'vakif2024';
```

`'vakif2024'` yerine kendi şifrenizi yazın.

## Veri Saklama

Veriler tarayıcının `localStorage`'ında saklanır. Her kullanıcı kendi tarayıcısında bağımsız veri görür.

> **Not:** Gerçek çok kullanıcılı (server-side) veri için bir veritabanı entegrasyonu (Supabase, PlanetScale, vb.) gerekir. Bu mevcut yapı tek admin + çoklu kullanıcı form gönderimi senaryosu için tasarlanmıştır.

## Klasör Yapısı

```
vakif-projesi/
├── src/
│   ├── app/
│   │   ├── globals.css       # Global stiller
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Ana sayfa
│   ├── components/
│   │   ├── App.tsx           # Ana uygulama + navigasyon
│   │   ├── Header.tsx        # Üst navigasyon
│   │   ├── PublicPage.tsx    # Genel tablo sayfası
│   │   ├── SubmitPage.tsx    # Profil & bağış form sayfası
│   │   ├── AdminPage.tsx     # Yönetim paneli
│   │   ├── LoginPage.tsx     # Admin giriş
│   │   ├── StatsRow.tsx      # İstatistik kartları
│   │   └── ui.tsx            # Paylaşılan UI bileşenleri
│   ├── lib/
│   │   ├── store.ts          # Zustand global state
│   │   └── utils.ts          # Yardımcı fonksiyonlar
│   └── types/
│       └── index.ts          # TypeScript tipleri
├── public/
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json
└── .gitignore
```

## Lisans

Özel kullanım — Türkiye Sinema ve Medya Vakfı
