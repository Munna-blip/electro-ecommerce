<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $today = now()->toDateString();
        $monthStart = now()->startOfMonth();

        $totalSales = Order::where("payment_status", "paid")->sum("total");
        $todaySales = Order::where("payment_status", "paid")->whereDate("created_at", $today)->sum("total");
        $monthSales = Order::where("payment_status", "paid")->where("created_at", ">=", $monthStart)->sum("total");

        $totalOrders = Order::count();
        $pendingOrders = Order::where("status", "pending")->count();
        $totalProducts = Product::count();
        $totalCustomers = User::where("role", "customer")->count();
        $lowStockCount = Product::whereColumn("stock_qty", "<=", "alert_qty")->count();

        $salesLast7Days = Order::where("payment_status", "paid")
            ->where("created_at", ">=", now()->subDays(6)->startOfDay())
            ->selectRaw("DATE(created_at) as date, SUM(total) as total")
            ->groupBy("date")->orderBy("date")->get();

        $topProducts = DB::table("order_items")
            ->select("product_name", DB::raw("SUM(quantity) as total_qty"), DB::raw("SUM(subtotal) as total_revenue"))
            ->groupBy("product_name")
            ->orderByDesc("total_qty")
            ->limit(5)
            ->get();

        $recentOrders = Order::with("user")->orderBy("created_at", "desc")->limit(8)->get();

        return response()->json([
            "total_sales" => round($totalSales, 2),
            "today_sales" => round($todaySales, 2),
            "month_sales" => round($monthSales, 2),
            "total_orders" => $totalOrders,
            "pending_orders" => $pendingOrders,
            "total_products" => $totalProducts,
            "total_customers" => $totalCustomers,
            "low_stock_count" => $lowStockCount,
            "sales_last_7_days" => $salesLast7Days,
            "top_products" => $topProducts,
            "recent_orders" => $recentOrders,
        ]);
    }
}
