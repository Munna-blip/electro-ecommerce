# Electro — Setup Guide (Windows PowerShell)

This package contains a **backend overlay** (Laravel API logic: models, controllers,
migrations, seeders, routes) and a **complete, ready-to-run frontend** (React + Vite).

Because Laravel's own installer needs to download its skeleton + dependencies from
Packagist, you'll create a fresh Laravel project locally with `composer create-project`,
then copy this overlay's files on top of it. This is the standard, correct way to
apply custom Laravel code — do not skip the `composer create-project` step.

Everything below is PowerShell only — no `sudo`, `./`, or Unix syntax.

---

## 0. Prerequisites

Install these first if you don't have them:
- **PHP 8.2+** with the `pdo_mysql`, `mbstring`, `fileinfo`, `openssl` extensions enabled
- **Composer** (https://getcomposer.org)
- **Node.js 18+** and npm
- **MySQL 8** (or MariaDB) running locally, with a client like MySQL Workbench or HeidiSQL (optional)

Verify installs:

```powershell
php -v
composer -V
node -v
npm -v
mysql --version
```

---

## 1. Create the Laravel backend project

```powershell
cd C:\Projects
composer create-project laravel/laravel electro-backend
cd electro-backend
composer require laravel/sanctum
```

---

## 2. Copy the overlay files into the new Laravel project

Assuming you extracted this package to `C:\Projects\electro-overlay\backend`,
run (adjust paths as needed):

```powershell
# From C:\Projects\electro-backend
Copy-Item "C:\Projects\electro-overlay\backend\app\Models\*" -Destination ".\app\Models\" -Force
Copy-Item "C:\Projects\electro-overlay\backend\app\Http\Controllers\Api" -Destination ".\app\Http\Controllers\" -Recurse -Force
Copy-Item "C:\Projects\electro-overlay\backend\app\Http\Middleware\*" -Destination ".\app\Http\Middleware\" -Force
Copy-Item "C:\Projects\electro-overlay\backend\database\migrations\*" -Destination ".\database\migrations\" -Force
Copy-Item "C:\Projects\electro-overlay\backend\database\seeders\DatabaseSeeder.php" -Destination ".\database\seeders\" -Force
Copy-Item "C:\Projects\electro-overlay\backend\routes\api.php" -Destination ".\routes\api.php" -Force
Copy-Item "C:\Projects\electro-overlay\backend\bootstrap\app.php" -Destination ".\bootstrap\app.php" -Force
Copy-Item "C:\Projects\electro-overlay\backend\config\cors.php" -Destination ".\config\cors.php" -Force
Copy-Item "C:\Projects\electro-overlay\backend\config\sanctum.php" -Destination ".\config\sanctum.php" -Force
```

> If `laravel/laravel` already generated a default `app\Http\Controllers\Api` folder,
> just let the overlay files overwrite/merge into it — `-Force` handles overwrite.

---

## 3. Configure environment

`laravel/laravel` already created a `.env` file for you during step 1.
Open it in a text editor and update these values (reference values are in
`electro-overlay\backend\.env.example`):

```
APP_NAME=Electro
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=electro
DB_USERNAME=root
DB_PASSWORD=your_mysql_password

SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DOMAIN=localhost
FRONTEND_URL=http://localhost:5173
FILESYSTEM_DISK=public
```

Generate the app key:

```powershell
php artisan key:generate
```

---

## 4. Create the database

Using the MySQL CLI:

```powershell
mysql -u root -p -e "CREATE DATABASE electro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

(Or create it in MySQL Workbench / HeidiSQL if you prefer a GUI.)

---

## 5. Run migrations and seed demo data

```powershell
php artisan migrate
php artisan db:seed
php artisan storage:link
```

This creates all 16 tables and seeds:
- **Admin** login: `admin@electro.test` / `password`
- **Staff** login: `staff@electro.test` / `password`
- **Customer** login: `customer@electro.test` / `password`
- 8 categories, 10 brands, 4 suppliers, 18 sample products

---

## 6. Start the Laravel API server

```powershell
php artisan serve
```

The API is now running at **http://localhost:8000**. Test it:

```powershell
curl http://localhost:8000/api/products
```

---

## 7. Set up and run the frontend

The frontend in this package is **already scaffolded and verified to build**.

```powershell
cd C:\Projects\electro-overlay\frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

`.env` should contain:
```
VITE_API_URL=http://localhost:8000/api
VITE_STORAGE_URL=http://localhost:8000/storage
```

---

## 8. Building for production

**Frontend:**
```powershell
cd C:\Projects\electro-overlay\frontend
npm run build
```
Output goes to `dist\` — deploy this to any static host (Netlify, Vercel, S3, IIS, etc.)

**Backend:**
```powershell
cd C:\Projects\electro-backend
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
```
Point your production web server (IIS / Nginx / Apache) at the `public\` folder.

---

## What's included vs. what to extend

**Fully implemented (backend logic + working frontend UI wired to it):**
- Auth (register/login/logout/profile) via Sanctum tokens
- Product catalog: search, filter (category/brand/price), sort, pagination, related products
- Cart (add/update/remove/clear) and Wishlist
- Checkout → Order → Payment → Invoice, with stock auto-decrementing
- Admin: Product/Category/Brand/Supplier/Customer CRUD (with image upload)
- Purchases (creates stock-in movements) → Stock/Inventory view with low-stock alerts and manual adjustments
- POS terminal: barcode/name search, cart, discount, tax, payment method, checkout, printable invoice
- Order management (status + payment status updates, with automatic stock restore on cancel)
- Admin dashboard (sales stats, 7-day chart, top products, recent orders)
- Sales & stock reports with date filtering

**Recommended next steps as you extend this:**
- Add refresh-token rotation / token expiry policy for Sanctum in production
- Add server-side rate limiting on auth & checkout routes (`throttle` middleware)
- Add real payment gateway integration (SSLCommerz/Stripe) instead of the manual payment record
- Add product multi-image gallery management UI in the admin Products form (the `product_images`
  table and relation already exist — only the upload UI needs wiring)
- Add PDF invoice generation (e.g. via `barryvdh/laravel-dompdf`) — currently POS/Order invoices
  are printed via the browser's print dialog
- Add automated tests (`php artisan test`, and a frontend testing setup like Vitest)
- Code-split the frontend bundle (`npm run build` currently warns about a ~875 KB main chunk) —
  use `React.lazy()` for the admin route tree since customers never load that code
