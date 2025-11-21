# Desain dan Arsitektur Teknis Platform Marketplace (OLX-like)

Dokumen ini merinci desain teknis, arsitektur, dan rancangan antarmuka untuk platform marketplace jual-beli barang bekas/baru dengan integrasi WhatsApp.

## 1. Rekomendasi Teknologi (Tech Stack)

Untuk memenuhi persyaratan performa tinggi, SEO (penting untuk marketplace), dan pengembangan yang efisien, berikut adalah rekomendasi teknologi:

### Frontend (Aplikasi Web)
*   **Framework:** **Next.js (React)**.
    *   *Alasan:* Mendukung Server-Side Rendering (SSR) dan Incremental Static Regeneration (ISR). Ini sangat penting agar listing produk mudah diindeks oleh Google (SEO) dan loading halaman pertama sangat cepat.
*   **Styling:** **Tailwind CSS**.
    *   *Alasan:* Mempercepat pembuatan UI yang responsif (Mobile-First) dan konsisten tanpa menulis CSS manual yang berat.
*   **State Management:** **Zustand** atau **React Context**.
    *   *Alasan:* Ringan dan cukup untuk mengelola status user (login) dan filter pencarian.

### Backend (API & Server)
*   **Option A (Terintegrasi):** **Next.js API Routes**.
    *   Jika tim pengembang kecil, backend bisa disatukan dalam Next.js.
*   **Option B (Terpisah - Recommended):** **Node.js dengan Express.js** atau **NestJS**.
    *   *Alasan:* Skalabilitas lebih baik untuk logika bisnis yang kompleks (validasi iklan, manajemen user, cron jobs).

### Database & Storage
*   **Database Relasional:** **PostgreSQL**.
    *   *Alasan:* Sangat kuat untuk relasi data yang terstruktur (User -> Products -> Categories) dan mendukung pencarian teks (Full-Text Search) yang cukup baik untuk tahap awal.
*   **Image Storage:** **AWS S3** atau **Supabase Storage** (via CDN).
    *   *Alasan:* Jangan simpan gambar di database atau disk server aplikasi. Gunakan Object Storage agar murah dan cepat diakses via CDN.

### Infrastruktur
*   **Deployment:** Vercel (Frontend) + Railway/AWS (Backend/DB).

---

## 2. Struktur Database

Berikut adalah skema database relasional dasar untuk mendukung fitur yang diminta.

### Tabel: `users`
Menyimpan data pengguna dan admin.
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | UUID / INT | Primary Key |
| `name` | VARCHAR | Nama lengkap |
| `email` | VARCHAR | Email (Unique), untuk login |
| `password_hash` | VARCHAR | Password terenkripsi |
| `phone_number` | VARCHAR | Nomor WA (format: 628xxx) |
| `role` | ENUM | 'USER', 'ADMIN' |
| `is_active` | BOOLEAN | Status akun (blokir/aktif) |
| `created_at` | TIMESTAMP | Waktu pendaftaran |

### Tabel: `categories`
Struktur kategori produk.
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | INT | Primary Key |
| `name` | VARCHAR | Nama Kategori (mis: Elektronik) |
| `slug` | VARCHAR | URL friendly (mis: elektronik) |
| `icon_url` | VARCHAR | URL ikon kategori |

### Tabel: `products` (Iklan/Listing)
Data utama barang yang dijual.
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `user_id` | UUID | Foreign Key ke `users` |
| `category_id` | INT | Foreign Key ke `categories` |
| `title` | VARCHAR | Judul Iklan |
| `description` | TEXT | Deskripsi rinci |
| `price` | DECIMAL | Harga barang |
| `condition` | ENUM | 'BARU', 'BEKAS' |
| `province` | VARCHAR | Lokasi Provinsi |
| `city` | VARCHAR | Lokasi Kota/Kabupaten |
| `status` | ENUM | 'PENDING', 'ACTIVE', 'REJECTED', 'SOLD' |
| `views` | INT | Counter jumlah dilihat |
| `created_at` | TIMESTAMP | Waktu posting |

### Tabel: `product_images`
Galeri gambar untuk setiap produk (One-to-many).
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | INT | Primary Key |
| `product_id` | UUID | Foreign Key ke `products` |
| `image_url` | VARCHAR | Link gambar (S3/CDN) |
| `is_primary` | BOOLEAN | Apakah ini gambar sampul? |

---

## 3. Alur Pengguna (User Flows)

### A. Flow Posting Iklan (Seller)
1.  **Start:** User login dan klik tombol "Jual" (Floating Action Button di Mobile / Header Button di Desktop).
2.  **Input Form:**
    *   User memilih Kategori.
    *   User mengisi Judul dan Deskripsi.
    *   User mengisi Harga.
    *   User mengunggah foto (Maksimal 5-10 foto). Sistem mengompres gambar di client-side sebelum upload.
    *   User mengonfirmasi Lokasi (Bisa auto-detect atau manual select Provinsi/Kota).
    *   User memverifikasi nomor WhatsApp (default ambil dari profil, bisa diedit per iklan).
3.  **Review:** User melihat preview tampilan iklan.
4.  **Submit:** Data dikirim ke server.
5.  **Post-Processing:** Status iklan menjadi `PENDING`.
6.  **Approval (Admin):** Admin mendapat notifikasi/melihat di dashboard. Jika disetujui, status berubah menjadi `ACTIVE` dan muncul di pencarian.

### B. Flow Transaksi via WhatsApp (Buyer)
1.  **Search/Browse:** Buyer mencari barang di Homepage atau Kategori.
2.  **View Detail:** Buyer membuka halaman detail produk.
3.  **Action:** Buyer tertarik dan menekan tombol besar **"Hubungi Penjual via WhatsApp"**.
4.  **System Action:**
    *   Frontend membuat link dinamis: `https://wa.me/<NO_HP_PENJUAL>?text=<PESAN_ENCODED>`
    *   Template pesan: *"Halo, saya tertarik dengan [Judul Produk] yang dijual di [Nama Platform] seharga [Harga]. Apakah masih ada?"*
5.  **Redirection:**
    *   **Mobile:** Membuka aplikasi WhatsApp.
    *   **Desktop:** Membuka WhatsApp Web di tab baru.
6.  **Conversation:** Chat berlanjut secara pribadi di WhatsApp tanpa campur tangan platform.

---

## 4. Rancangan Wireframe (Frontend & Admin)

### A. Homepage (Frontend)
*   **Header (Sticky):**
    *   Logo Brand (Kiri).
    *   **Search Bar (Tengah - Dominan):** Input text "Cari barang..." dengan dropdown filter "Lokasi" di sebelahnya.
    *   Login/Register & Tombol "JUAL" (Kanan - Menonjol).
*   **Hero Section:**
    *   Banner promo atau kategori populer.
*   **Category Grid:**
    *   Icon bulat + Label teks untuk kategori utama (Mobil, Motor, Properti, HP, dll).
*   **Section "Rekomendasi Baru":**
    *   Grid Card Produk (Infinite Scroll atau Pagination).
    *   **Isi Card:** Gambar (Thumbnail), Harga (Bold, warna aksen), Judul (Truncated), Lokasi & Waktu (Abu-abu kecil di bawah).
*   **Bottom Navigation (Mobile Only):**
    *   Home, Kategori, Favorit, Akun. Tombol "JUAL" melayang di tengah (FAB).

### B. Halaman Listing Produk (Detail)
*   **Layout Desktop:** 2 Kolom (Kiri 60%, Kanan 40%). **Layout Mobile:** 1 Kolom Stack.
*   **Area Gambar (Kiri/Atas):**
    *   Gambar Utama Besar.
    *   Thumbnail gallery di bawahnya (bisa di-swipe).
*   **Info Utama (Kanan/Bawah Gambar):**
    *   **Harga:** Font sangat besar & tebal.
    *   **Judul:** Jelas di bawah harga.
    *   **Lokasi & Tanggal posting.**
*   **Informasi Penjual (Card Box):**
    *   Avatar User.
    *   Nama User.
    *   Badge "Member sejak..."
*   **Call to Action (Sticky di Mobile Bottom):**
    *   Tombol **"Chat via WhatsApp"** (Warna Hijau WA, Icon WA).
    *   Tombol "Share".
*   **Deskripsi & Spesifikasi:**
    *   Tabulasi atau List detail kondisi barang.

### C. Admin Panel (Dashboard)
*   **Sidebar Kiri:**
    *   Dashboard (Stats).
    *   Manajemen Iklan (Submenu: Perlu Review, Aktif, Ditolak).
    *   Manajemen User.
    *   Master Kategori.
    *   Logout.
*   **Halaman "Manajemen Iklan" (Tabel):**
    *   **Filter:** Status (Pending/Active), Search Judul.
    *   **Tabel Kolom:** Gambar Kecil, Judul, Penjual, Tanggal, Status.
    *   **Aksi:** Tombol "Approve", "Reject" (dengan alasan), "Delete".
    *   **Bulk Action:** Checkbox untuk approve banyak sekaligus.
*   **Halaman "Review Iklan" (Detail):**
    *   Tampilan mirip halaman detail produk tapi dengan panel kontrol Admin di samping untuk Menyetujui atau Menolak.
