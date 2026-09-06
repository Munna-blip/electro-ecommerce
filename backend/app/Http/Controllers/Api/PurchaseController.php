<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PurchaseController extends Controller
{
    public function index(Request $request)
    {
        $query = Purchase::with(["supplier", "items"]);
        if ($request->filled("status")) $query->where("status", $request->status);
        if ($request->filled("supplier_id")) $query->where("supplier_id", $request->supplier_id);
        return response()->json($query->orderBy("created_at", "desc")->paginate($request->get("per_page", 15)));
    }

    public function show(Purchase $purchase)
    {
        return response()->json($purchase->load(["supplier", "items.product", "user"]));
    }

    // Creating a purchase (received) increases stock -- Purchase -> Stock link
    public function store(Request $request)
    {
        $data = $request->validate([
            "supplier_id" => "required|exists:suppliers,id",
            "purchase_date" => "required|date",
            "status" => "required|in:pending,received,cancelled",
            "note" => "nullable|string",
            "items" => "required|array|min:1",
            "items.*.product_id" => "required|exists:products,id",
            "items.*.quantity" => "required|integer|min:1",
            "items.*.unit_cost" => "required|numeric|min:0",
        ]);

        $purchase = DB::transaction(function () use ($data, $request) {
            $total = collect($data["items"])->sum(fn ($i) => $i["quantity"] * $i["unit_cost"]);

            $purchase = Purchase::create([
                "reference_no" => "PUR-" . strtoupper(Str::random(8)),
                "supplier_id" => $data["supplier_id"],
                "user_id" => $request->user()->id,
                "total_amount" => $total,
                "paid_amount" => 0,
                "status" => $data["status"],
                "purchase_date" => $data["purchase_date"],
                "note" => $data["note"] ?? null,
            ]);

            foreach ($data["items"] as $item) {
                PurchaseItem::create([
                    "purchase_id" => $purchase->id,
                    "product_id" => $item["product_id"],
                    "quantity" => $item["quantity"],
                    "unit_cost" => $item["unit_cost"],
                    "subtotal" => $item["quantity"] * $item["unit_cost"],
                ]);

                if ($data["status"] === "received") {
                    $product = Product::find($item["product_id"]);
                    $product->increment("stock_qty", $item["quantity"]);
                    $product->update(["cost_price" => $item["unit_cost"]]);
                    StockMovement::create([
                        "product_id" => $product->id,
                        "type" => "purchase",
                        "quantity" => $item["quantity"],
                        "balance_after" => $product->fresh()->stock_qty,
                        "reference_type" => "purchase",
                        "reference_id" => $purchase->id,
                    ]);
                }
            }

            return $purchase;
        });

        return response()->json(["message" => "Purchase recorded", "purchase" => $purchase->load("items")], 201);
    }

    // Mark a pending purchase as received -> pushes stock in
    public function markReceived(Purchase $purchase)
    {
        if ($purchase->status === "received") {
            return response()->json(["message" => "Purchase already received"], 422);
        }

        DB::transaction(function () use ($purchase) {
            foreach ($purchase->items as $item) {
                $product = $item->product;
                $product->increment("stock_qty", $item->quantity);
                $product->update(["cost_price" => $item->unit_cost]);
                StockMovement::create([
                    "product_id" => $product->id,
                    "type" => "purchase",
                    "quantity" => $item->quantity,
                    "balance_after" => $product->fresh()->stock_qty,
                    "reference_type" => "purchase",
                    "reference_id" => $purchase->id,
                ]);
            }
            $purchase->update(["status" => "received"]);
        });

        return response()->json(["message" => "Purchase marked as received", "purchase" => $purchase->load("items")]);
    }
}
