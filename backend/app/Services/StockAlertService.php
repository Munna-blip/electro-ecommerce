<?php
namespace App\Services;

use App\Mail\LowStockAlertMail;
use App\Models\Product;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class StockAlertService
{
    // Called right after any stock decrease (sale, POS, adjustment)
    public function checkAndNotify(): void
    {
        $lowStockProducts = Product::whereColumn("stock_qty", "<=", "alert_qty")
            ->where("status", "active")
            ->get();

        if ($lowStockProducts->isEmpty()) {
            return;
        }

        // Avoid spamming: only send once every 6 hours regardless of how many
        // sales trigger this check in that window.
        $cacheKey = "low_stock_alert_sent_at";
        if (Cache::has($cacheKey)) {
            return;
        }

        try {
            Mail::to(env("ADMIN_ALERT_EMAIL", "admin@electro.test"))
                ->send(new LowStockAlertMail($lowStockProducts));
            Cache::put($cacheKey, now(), now()->addHours(6));
        } catch (\Throwable $e) {
            Log::error("Low stock alert email failed: " . $e->getMessage());
        }
    }
}