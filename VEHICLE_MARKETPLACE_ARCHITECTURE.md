# Arsitektur Teknis Marketplace Kendaraan (Draft)

Dokumen ini berisi rancangan arsitektur teknis untuk platform marketplace khusus kendaraan (mobil dan motor), menggunakan **Next.js** sebagai kerangka kerja Full-Stack (Frontend & Backend) dan **PostgreSQL** sebagai database.

## 1. Arsitektur Next.js & Struktur Proyek

### Peran Next.js
Dalam arsitektur ini, Next.js bertindak sebagai solusi "Monolith Modular":
*   **Front-End (FE):** Menggunakan **React** untuk merender antarmuka pengguna. Halaman listing dan detail kendaraan akan menggunakan **Server-Side Rendering (SSR)** untuk SEO yang optimal (penting agar iklan kendaraan muncul di Google). Halaman admin atau interaksi user (form filter) akan menggunakan **Client-Side Rendering (CSR)** atau **Server Components**.
*   **Back-End (BE):** Menggunakan **API Routes** (atau Route Handlers di App Router) untuk menangani logika bisnis, validasi data, dan komunikasi ke Database PostgreSQL. Tidak perlu server Express terpisah.

### Struktur Folder Proyek (Rekomendasi App Router)

```text
/my-vehicle-marketplace
├── /app
│   ├── /api                  # --- BACKEND (API Routes) ---
│   │   ├── /auth             # Endpoint otentikasi
│   │   │   └── /route.ts
│   │   ├── /vehicles         # Endpoint CRUD kendaraan
│   │   │   ├── /route.ts     # GET (list), POST (create)
│   │   │   └── /[id]
│   │   │       └── /route.ts # GET (detail), PUT (update), DELETE
│   │   └── /admin            # Endpoint khusus admin
│   ├── /(public)             # --- FRONTEND (Public Pages) ---
│   │   ├── /page.tsx         # Homepage
│   │   ├── /search           # Halaman Pencarian & Filter
│   │   │   └── /page.tsx
│   │   └── /vehicle
│   │       └── /[id]         # Halaman Detail Kendaraan
│   │           └── /page.tsx
│   ├── /(admin)              # --- FRONTEND (Protected Admin Pages) ---
│   │   └── /dashboard
│   │       └── /page.tsx
│   └── /layout.tsx           # Layout utama (Navbar, Footer)
├── /components               # Reusable React Components
│   ├── /ui                   # Button, Input, Card (Atomic)
│   ├── /vehicle              # VehicleCard, VehicleForm, VehicleDetails
│   └── /admin                # AdminTables, DashboardStats
├── /lib                      # Logic & Utilities
│   ├── prisma.ts             # Koneksi Database (Prisma Client)
│   ├── utils.ts              # Helper functions (format currency, date)
│   └── whatsapp.ts           # Logic generator link WA
├── /middleware.ts            # Middleware untuk proteksi route admin
└── /public                   # Static assets
```

---

## 2. Draft Front-End (React)

### Komponen Utama

1.  **`VehicleCard.jsx` (Client Component)**
    *   **Fungsi:** Menampilkan ringkasan singkat di hasil pencarian.
    *   **Props:** `image`, `title` (Merk + Model), `price`, `year`, `transmission`, `location`.
    *   **UI:** Gambar thumbnail, Harga (Bold), Badge (Tahun, Transmisi), Lokasi.

2.  **`VehicleDetails.jsx` (Server Component)**
    *   **Fungsi:** Menampilkan informasi lengkap kendaraan.
    *   **Data Fetching:** Mengambil data langsung dari DB di server (untuk SEO).
    *   **Fitur:** Galeri foto (carousel), Spesifikasi lengkap (Tabel), Deskripsi penjual, dan **Tombol WhatsApp**.

3.  **`VehicleListingForm.jsx` (Client Component)**
    *   **Fungsi:** Form untuk user/admin memposting iklan.
    *   **Input Fields:** Upload Gambar, Dropdown Merk, Input Model, Dropdown Tahun (1990-2024), Dropdown Transmisi (AT/MT), Input KM, Input Harga, Lokasi.
    *   **Validasi:** Menggunakan library seperti `react-hook-form` + `zod`.

4.  **`AdminDashboard.jsx`**
    *   **Fungsi:** Panel kontrol untuk admin.
    *   **Fitur:** Tabel daftar semua iklan dengan status (Pending/Active), tombol Approve/Reject/Delete.

### State Filter Pencarian (React State)
State ini akan dikelola di halaman `/search` (misalnya menggunakan URL Search Params agar bisa di-share link-nya).

```javascript
// Contoh struktur state untuk filter
const [filters, setFilters] = useState({
  category: 'mobil', // atau 'motor'
  brand: '',         // e.g., 'Toyota'
  model: '',         // e.g., 'Avanza'
  minPrice: 0,
  maxPrice: 1000000000,
  yearStart: 2015,
  yearEnd: 2024,
  transmission: '',  // 'Manual', 'Automatic'
  location: ''       // Province/City
});
```

### Integrasi WhatsApp (di `VehicleDetails.jsx`)
Logika untuk membuat link WhatsApp dinamis.

```javascript
// Helper function
const generateWALink = (phone, vehicleTitle, vehiclePrice) => {
  // Pastikan format nomor 628xxx
  const formattedPhone = phone.startsWith('0') ? '62' + phone.slice(1) : phone;
  const message = `Halo, saya tertarik dengan mobil ${vehicleTitle} seharga ${vehiclePrice} yang ada di marketplace Anda. Apakah masih tersedia?`;
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
};

// Penggunaan di Component
const ContactButton = ({ sellerPhone, vehicleData }) => {
  const waLink = generateWALink(sellerPhone, vehicleData.title, vehicleData.price);

  return (
    <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
       Hubungi Penjual via WhatsApp
    </a>
  );
};
```

---

## 3. Draft Back-End (Next.js API Routes)

Berikut adalah definisi endpoint API yang akan dibuat di folder `/app/api`.

### 1. GET `/api/vehicles`
*   **Fungsi:** Mengambil daftar kendaraan dengan dukungan filter.
*   **Query Params:** `?page=1&limit=20&brand=Honda&year_min=2018&transmission=Automatic`
*   **Response:**
    ```json
    {
      "data": [ ... array of vehicles ... ],
      "meta": { "total": 50, "page": 1, "last_page": 3 }
    }
    ```

### 2. POST `/api/vehicles`
*   **Fungsi:** Membuat listing baru (oleh User/Seller).
*   **Body:** JSON object berisi detail kendaraan dan array URL gambar.
*   **Logic:** Validasi input, simpan ke DB dengan status `PENDING` (menunggu approval admin) atau langsung `ACTIVE`.

### 3. PUT `/api/admin/vehicles/[id]`
*   **Fungsi:** Update status kendaraan (Approval) atau edit konten oleh Admin.
*   **Middleware:** Cek session apakah user adalah Admin.
*   **Body:** `{ "status": "ACTIVE" }` atau `{ "is_featured": true }`.

### 4. POST `/api/auth/login`
*   **Fungsi:** Login untuk Admin (dan User jika ada fitur akun user).
*   **Body:** `{ "email": "...", "password": "..." }`
*   **Response:** Set HTTP-Only Cookie (JWT) atau Session ID.

---

## 4. Draft Database (PostgreSQL)

Berikut adalah skema tabel utama yang dibutuhkan.

### Tabel 1: `users`
Menyimpan data penjual dan admin.
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL, -- Nomor WA Wajib
  role VARCHAR(10) DEFAULT 'USER',   -- 'USER' atau 'ADMIN'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabel 2: `categories`
Membedakan jenis kendaraan utama.
```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL, -- 'Mobil', 'Motor', 'Truk'
  slug VARCHAR(50) UNIQUE NOT NULL
);
```

### Tabel 3: `vehicles`
Tabel inti listing kendaraan dengan kolom spesifik.
```sql
CREATE TABLE vehicles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id),

  -- Identifikasi Kendaraan Utama
  title VARCHAR(150) NOT NULL,        -- e.g. "Toyota Avanza Veloz 2020 Putih"
  brand VARCHAR(50) NOT NULL,         -- e.g. "Toyota", "Honda"
  model VARCHAR(50) NOT NULL,         -- e.g. "Avanza", "Civic"
  year INTEGER NOT NULL,              -- e.g. 2020

  -- Spesifikasi Teknis
  transmission VARCHAR(20) NOT NULL,  -- 'Manual', 'Automatic', 'CVT'
  fuel_type VARCHAR(20),              -- 'Bensin', 'Diesel', 'Listrik', 'Hybrid'
  engine_size INTEGER,                -- Dalam cc (e.g., 1500)
  mileage INTEGER NOT NULL,           -- Jarak tempuh dalam KM
  color VARCHAR(30),

  -- Detail Penjualan
  price DECIMAL(15, 2) NOT NULL,
  description TEXT,
  location_province VARCHAR(100) NOT NULL,
  location_city VARCHAR(100) NOT NULL,

  -- Status & Admin
  is_sold BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'ACTIVE', 'REJECTED'

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
*Catatan: Gambar disimpan di tabel terpisah `vehicle_images` (One-to-Many) yang me-refer ke `vehicles.id`.*
