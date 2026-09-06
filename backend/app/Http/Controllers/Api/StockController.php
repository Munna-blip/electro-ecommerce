<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\StockAlertService;

class StockController extends Controller
{
    // Current stock levels for all products
    public function index(Request $request)
    {
        $query = Product::select("id", "name", "sku", "barcode", "stock_qty", "alert_qty", "unit");
        if ($request->boolean("low_stock")) {
            $query->whereColumn("stock_qty", "<=", "alert_qty");
        }
        if ($request->filled("q")) $query->search($request->q);
        return response()->json($query->orderBy("stock_qty", "asc")->paginate($request->get("per_page", 20)));
    }

    public function movements(Request $request, Product $product)
    {
        return response()->json(
            $product->stockMovements()->orderBy("created_at", "desc")->paginate(20)
        );
    }

    // Manual stock adjustment (damage, correction, recount, etc.)
    public function adjust(Request $request)
    {
        $data = $request->validate([
            "product_id" => "required|exists:products,id",
            "quantity" => "required|integer",
            "note" => "nullable|string",
        ]);

        $movement = DB::transaction(function () use ($data) {
            $product = Product::findOrFail($data["product_id"]);
            $product->increment("stock_qty", $data["quantity"]);
            return StockMovement::create([
                "product_id" => $product->id,
                "type" => "adjustment",
                "quantity" => $data["quantity"],
                "balance_after" => $product->fresh()->stock_qty,
                "note" => $data["note"] ?? "Manual adjustment",
            ]);
        });

        try {
            app(StockAlertService::class)->checkAndNotify();
        } catch (\Throwable $e) {
            \Log::error("Low stock check failed: " . $e->getMessage());
        }

        return response()->json(["message" => "Stock adjusted", "movement" => $movement]);
    }
}
