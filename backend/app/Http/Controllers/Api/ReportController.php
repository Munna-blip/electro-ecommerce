<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function sales(Request $request)
    {
        $from = $request->get("from", now()->subDays(30)->toDateString());
        $to = $request->get("to", now()->toDateString());

        $orders = Order::whereBetween("created_at", ["{$from} 00:00:00", "{$to} 23:59:59"])
            ->where("payment_status", "paid");

        $summary = [
            "total_orders" => (clone $orders)->count(),
            "total_revenue" => round((clone $orders)->sum("total"), 2),
            "total_tax" => round((clone $orders)->sum("tax"), 2),
            "total_discount" => round((clone $orders)->sum("discount"), 2),
            "online_orders" => (clone $orders)->where("channel", "online")->count(),
            "pos_orders" => (clone $orders)->where("channel", "pos")->count(),
        ];

        $daily = (clone $orders)
            ->selectRaw("DATE(created_at) as date, COUNT(*) as orders, SUM(total) as revenue")
            ->groupBy("date")->orderBy("date")->get();

        return response()->json(["summary" => $summary, "daily" => $daily]);
    }

    public function stock(Request $request)
    {
        $products = Product::select("id", "name", "sku", "stock_qty", "alert_qty", "cost_price", "price")
            ->orderBy("stock_qty", "asc")
            ->get();

        $valuation = $products->sum(fn ($p) => $p->stock_qty * $p->cost_price);

        return response()->json([
            "products" => $products,
            "total_stock_value" => round($valuation, 2),
            "low_stock_items" => $products->filter(fn ($p) => $p->stock_qty <= $p->alert_qty)->values(),
        ]);
    }
}
