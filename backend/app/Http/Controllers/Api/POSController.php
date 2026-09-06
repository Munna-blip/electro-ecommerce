<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Services\SmsService;
use App\Services\StockAlertService;

class POSController extends Controller
{
    // Fast product search by name/sku/barcode for the POS screen
    public function search(Request $request)
    {
        $term = $request->get("q", "");
        $products = Product::where("status", "active")
            ->where(function ($q) use ($term) {
                $q->where("name", "like", "%{$term}%")
                    ->orWhere("sku", "like", "%{$term}%")
                    ->orWhere("barcode", $term);
            })
            ->limit(20)
            ->get(["id", "name", "sku", "barcode", "price", "discount_price", "tax_rate", "stock_qty", "thumbnail"]);

        return response()->json($products);
    }

    public function scanBarcode(Request $request)
    {
        $product = Product::where("barcode", $request->get("barcode"))->first();
        if (!$product) {
            return response()->json(["message" => "Product not found"], 404);
        }
        return response()->json($product);
    }

    // POS sale: creates order (channel=pos), decrements stock, records payment + invoice
    public function checkout(Request $request)
    {
        $data = $request->validate([
            "items" => "required|array|min:1",
            "items.*.product_id" => "required|exists:products,id",
            "items.*.quantity" => "required|integer|min:1",
            "discount" => "nullable|numeric|min:0",
            "payment_method" => "required|in:cash,card,mobile_banking,bank_transfer",
            "customer_id" => "nullable|exists:users,id",
            "paid_amount" => "nullable|numeric|min:0",
        ]);

        foreach ($data["items"] as $item) {
            $product = Product::find($item["product_id"]);
            if ($product->stock_qty < $item["quantity"]) {
                return response()->json(["message" => "\"{$product->name}\" has insufficient stock"], 422);
            }
        }

        $order = DB::transaction(function () use ($data, $request) {
            $subtotal = 0;
            $tax = 0;
            $lines = [];

            foreach ($data["items"] as $item) {
                $product = Product::find($item["product_id"]);
                $unitPrice = $product->final_price;
                $lineSubtotal = $unitPrice * $item["quantity"];
                $lineTax = $lineSubtotal * ($product->tax_rate / 100);
                $subtotal += $lineSubtotal;
                $tax += $lineTax;
                $lines[] = ["product" => $product, "qty" => $item["quantity"], "unit_price" => $unitPrice, "subtotal" => $lineSubtotal];
            }

            $discount = $data["discount"] ?? 0;
            $total = max($subtotal + $tax - $discount, 0);

            $order = Order::create([
                "order_no" => "POS-" . strtoupper(Str::random(8)),
                "user_id" => $data["customer_id"] ?? null,
                "channel" => "pos",
                "subtotal" => $subtotal,
                "discount" => $discount,
                "tax" => $tax,
                "shipping_fee" => 0,
                "total" => $total,
                "status" => "completed",
                "payment_status" => "paid",
            ]);

            foreach ($lines as $line) {
                OrderItem::create([
                    "order_id" => $order->id,
                    "product_id" => $line["product"]->id,
                    "product_name" => $line["product"]->name,
                    "quantity" => $line["qty"],
                    "unit_price" => $line["unit_price"],
                    "subtotal" => $line["subtotal"],
                ]);

                $line["product"]->decrement("stock_qty", $line["qty"]);
                StockMovement::create([
                    "product_id" => $line["product"]->id,
                    "type" => "sale",
                    "quantity" => -$line["qty"],
                    "balance_after" => $line["product"]->fresh()->stock_qty,
                    "reference_type" => "pos_order",
                    "reference_id" => $order->id,
                ]);
            }

            Payment::create([
                "order_id" => $order->id,
                "method" => $data["payment_method"],
                "amount" => $data["paid_amount"] ?? $total,
                "status" => "success",
            ]);

            Invoice::create([
                "order_id" => $order->id,
                "invoice_no" => "INV-" . strtoupper(Str::random(8)),
            ]);

            return $order;
        });

        $order->load(["items", "payments", "invoice", "user"]);

        if ($order->user?->phone) {
            try {
                app(SmsService::class)->send(
                    $order->user->phone,
                    "Electro: Your purchase {$order->order_no} of ৳" . number_format($order->total, 2) . " is complete. Thank you!"
                );
            } catch (\Throwable $e) {
                \Log::error("POS SMS failed: " . $e->getMessage());
            }
            try {
                app(StockAlertService::class)->checkAndNotify();
            } catch (\Throwable $e) {
                \Log::error("Low stock check failed: " . $e->getMessage());
            }
        }

        $change = ($data["paid_amount"] ?? $order->total) - $order->total;

        return response()->json([
            "message" => "Sale completed",
            "order" => $order,
            "change_due" => round(max($change, 0), 2),
        ], 201);
    }
}
