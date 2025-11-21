# Vehicle Marketplace (Jubeli)

Platform marketplace jual-beli kendaraan (mobil & motor) dengan integrasi WhatsApp, dibangun menggunakan **Next.js 14 (App Router)** dan **PostgreSQL**.

## Fitur Utama
*   **Listing Kendaraan:** Pencarian dan filter berdasarkan merk, tahun, harga, dll.
*   **Detail Kendaraan:** Informasi lengkap, spesifikasi, dan galeri foto.
*   **Integrasi WhatsApp:** Tombol "Hubungi Penjual" yang langsung mengarah ke chat WA dengan pesan pre-filled.
*   **Admin Dashboard:** Manajemen listing (Approve/Reject).
*   **Postingan Iklan:** Form untuk pengguna menjual kendaraan.

## Persyaratan (Prerequisites)
Sebelum menjalankan aplikasi, pastikan Anda telah menginstal:
*   **Node.js** (v18 atau lebih baru)
*   **PostgreSQL** (Database server harus berjalan)

## Cara Menjalankan di Lokal (How to Run Locally)

### 1. Clone Repository & Install Dependencies
```bash
git clone <repository_url>
cd vehicle-marketplace
npm install
```

### 2. Konfigurasi Environment Variable
Buat file `.env` di root folder proyek dan sesuaikan dengan kredensial database lokal Anda:

```env
# Ganti user, password, dan db_name sesuai setup PostgreSQL Anda
DATABASE_URL="postgresql://user:password@localhost:5432/vehicle_marketplace_db?schema=public"

# (Opsional) URL dasar aplikasi
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### 3. Setup Database (Prisma)
Jalankan perintah berikut untuk membuat tabel di database dan mengisi data awal (seeding):

```bash
# Generate Prisma Client
npx prisma generate

# Push schema ke database (Membuat tabel)
npx prisma db push

# Isi data awal (User Admin, User Biasa, Kategori Mobil/Motor)
npx prisma db seed
```
*Catatan: Script seed akan membuat user default `user@example.com` (ID: 2) yang digunakan secara hardcoded dalam form posting iklan untuk tujuan demo.*

### 4. Jalankan Aplikasi
```bash
npm run dev
```
Akses aplikasi di browser melalui: [http://localhost:3000](http://localhost:3000)

## Halaman Penting
*   **Homepage/Search:** [http://localhost:3000/search](http://localhost:3000/search)
*   **Detail Kendaraan (Contoh):** [http://localhost:3000/vehicle/1](http://localhost:3000/vehicle/1)
*   **Pasang Iklan:** Import komponen `VehicleListingForm` ke halaman yang diinginkan (saat ini belum ada route khusus di `/app`, bisa ditambahkan manual).
*   **Admin Dashboard:** Import komponen `AdminDashboard` (saat ini belum ada route khusus di `/app`).

## Struktur Folder
*   `/app`: Halaman dan API Routes (Next.js App Router).
*   `/components`: Komponen React (UI, Vehicle Cards, Forms).
*   `/lib`: Utility functions (Prisma client, WhatsApp helper).
*   `/prisma`: Skema database dan seed script.
