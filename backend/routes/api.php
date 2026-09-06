<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\POSController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\PurchaseController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\StockController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\WishlistController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PaymentGatewayController;

/*
|--------------------------------------------------------------------------
| Public routes
|--------------------------------------------------------------------------
*/

Route::post("/auth/register", [AuthController::class, "register"]);
Route::post("/auth/login", [AuthController::class, "login"]);

// optional.auth lets logged-in users get is_wishlisted flags, but guests can still browse
Route::middleware("optional.auth")->get("/products", [ProductController::class, "index"]);
Route::middleware("optional.auth")->get("/products/{slug}", [ProductController::class, "show"]);

Route::get("/categories", [CategoryController::class, "index"]);
Route::get("/brands", [BrandController::class, "index"]);

/*
|--------------------------------------------------------------------------
| Authenticated (any logged-in user)
|--------------------------------------------------------------------------
*/
Route::middleware("auth:sanctum")->group(function () {
    Route::post("/auth/logout", [AuthController::class, "logout"]);
    Route::get("/auth/profile", [AuthController::class, "profile"]);
    Route::put("/auth/profile", [AuthController::class, "updateProfile"]);

    // Cart
    Route::get("/cart", [CartController::class, "index"]);
    Route::post("/cart", [CartController::class, "store"]);
    Route::put("/cart/{cart}", [CartController::class, "update"]);
    Route::delete("/cart/{cart}", [CartController::class, "destroy"]);
    Route::delete("/cart", [CartController::class, "clear"]);

    // Wishlist
    Route::get("/wishlist", [WishlistController::class, "index"]);
    Route::post("/wishlist/toggle", [WishlistController::class, "toggle"]);

    // Orders (customer)
    Route::post("/orders", [OrderController::class, "store"]);
    Route::get("/orders/my", [OrderController::class, "myOrders"]);
    Route::get("/orders/{order}", [OrderController::class, "show"]);

    //SSLCommerz Payment Gateway
    Route::post("/payments/sslcommerz/initiate/{order}", [PaymentGatewayController::class, "initiate"]);
});

/*
|--------------------------------------------------------------------------
| Staff (admin + staff) — inventory, purchases, POS, order management
|--------------------------------------------------------------------------
*/
Route::middleware(["auth:sanctum", "staff"])->prefix("admin")->group(function () {
    // Products
    Route::get("/products/next-codes", [ProductController::class, "nextCodes"]);
    Route::get("/products", [ProductController::class, "adminIndex"]);
    Route::post("/products", [ProductController::class, "store"]);
    Route::post("/products/{product}", [ProductController::class, "update"]); // POST for multipart + method override
    Route::delete("/products/{product}", [ProductController::class, "destroy"]);

    // Categories
    Route::post("/categories", [CategoryController::class, "store"]);
    Route::post("/categories/{category}", [CategoryController::class, "update"]);
    Route::delete("/categories/{category}", [CategoryController::class, "destroy"]);

    // Brands
    Route::post("/brands", [BrandController::class, "store"]);
    Route::post("/brands/{brand}", [BrandController::class, "update"]);
    Route::delete("/brands/{brand}", [BrandController::class, "destroy"]);

    // Suppliers
    Route::apiResource("suppliers", SupplierController::class)->except(["show"]);

    // Customers
    Route::get("/customers", [CustomerController::class, "index"]);
    Route::get("/customers/{customer}", [CustomerController::class, "show"]);
    Route::post("/customers", [CustomerController::class, "store"]);
    Route::put("/customers/{customer}", [CustomerController::class, "update"]);
    Route::delete("/customers/{customer}", [CustomerController::class, "destroy"]);

    // Purchases
    Route::get("/purchases", [PurchaseController::class, "index"]);
    Route::get("/purchases/{purchase}", [PurchaseController::class, "show"]);
    Route::post("/purchases", [PurchaseController::class, "store"]);
    Route::post("/purchases/{purchase}/receive", [PurchaseController::class, "markReceived"]);

    // Stock
    Route::get("/stock", [StockController::class, "index"]);
    Route::get("/stock/{product}/movements", [StockController::class, "movements"]);
    Route::post("/stock/adjust", [StockController::class, "adjust"]);

    // POS
    Route::get("/pos/search", [POSController::class, "search"]);
    Route::get("/pos/scan", [POSController::class, "scanBarcode"]);
    Route::post("/pos/checkout", [POSController::class, "checkout"]);

    // Orders (admin view of ALL orders + status updates)
    Route::get("/orders", [OrderController::class, "adminIndex"]);
    Route::put("/orders/{order}/status", [OrderController::class, "updateStatus"]);

    // Dashboard & Reports
    Route::get("/dashboard/stats", [DashboardController::class, "stats"]);
    Route::get("/reports/sales", [ReportController::class, "sales"]);
    Route::get("/reports/stock", [ReportController::class, "stock"]);

    
});

// SSLCommerz callbacks — public, no auth (SSLCommerz's server calls these directly)
Route::post("/payments/sslcommerz/success", [PaymentGatewayController::class, "success"]);
Route::post("/payments/sslcommerz/fail", [PaymentGatewayController::class, "fail"]);
Route::post("/payments/sslcommerz/cancel", [PaymentGatewayController::class, "cancel"]);
Route::post("/payments/sslcommerz/ipn", [PaymentGatewayController::class, "ipn"]);
