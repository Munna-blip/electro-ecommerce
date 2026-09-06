<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Services\StockAlertService;

use App\Mail\OrderConfirmationMail;
use App\Mail\OrderStatusUpdatedMail;
use App\Services\SmsService;
use Illuminate\Support\Facades\Mail;

class OrderController extends Controller
{
    // Customer: checkout from their cart
    public function store(Request $request)
    {
        $request->validate([
            "shipping_name" => "required|string|max:255",
            "shipping_phone" => "required|string|max:20",
            "shipping_address" => "required|string|max:255",
            "payment_method" => "required|in:cash,card,mobile_banking,bank_transfer",
            "note" => "nullable|string",
        ]);

        $user = $request->user();
        $cartItems = Cart::with("product")->where("user_id", $user->id)->get();

        if ($cartItems->isEmpty()) {
            return response()->json(["message" => "Your cart is empty"], 422);
        }

        foreach ($cartItems as $item) {
            if ($item->product->stock_qty < $item->quantity) {
                return response()->json(["message" => "\"{$item->product->name}\" has insufficient stock"], 422);
            }
        }

        $order = DB::transaction(function () use ($cartItems, $request, $user) {
            $subtotal = $cartItems->sum(fn($i) => $i->product->final_price * $i->quantity);
            $tax = $cartItems->sum(fn($i) => ($i->product->final_price * $i->quantity) * ($i->product->tax_rate / 100));
            $shippingFee = $subtotal > 5000 ? 0 : 60;
            $total = $subtotal + $tax + $shippingFee;

            $order = Order::create([
                "order_no" => "ORD-" . strtoupper(Str::random(8)),
                "user_id" => $user->id,
                "channel" => "online",
                "subtotal" => $subtotal,
                "discount" => 0,
                "tax" => $tax,
                "shipping_fee" => $shippingFee,
                "total" => $total,
                "status" => "pending",
                "payment_status" => "unpaid",
                "shipping_name" => $request->shipping_name,
                "shipping_phone" => $request->shipping_phone,
                "shipping_address" => $request->shipping_address,
                "note" => $request->note,
            ]);

            foreach ($cartItems as $item) {
                OrderItem::create([
                    "order_id" => $order->id,
                    "product_id" => $item->product_id,
                    "product_name" => $item->product->name,
                    "quantity" => $item->quantity,
                    "unit_price" => $item->product->final_price,
                    "subtotal" => $item->product->final_price * $item->quantity,
                ]);

                $product = $item->product;
                $product->decrement("stock_qty", $item->quantity);
                StockMovement::create([
                    "product_id" => $product->id,
                    "type" => "sale",
                    "quantity" => -$item->quantity,
                    "balance_after" => $product->fresh()->stock_qty,
                    "reference_type" => "order",
                    "reference_id" => $order->id,
                ]);
            }

            Payment::create([
                "order_id" => $order->id,
                "method" => $request->payment_method,
                "amount" => $total,
                "status" => "pending",
            ]);

            Invoice::create([
                "order_id" => $order->id,
                "invoice_no" => "INV-" . strtoupper(Str::random(8)),
            ]);

            Cart::where("user_id", $user->id)->delete();

            return $order;
        });

        // Send confirmation email + SMS (failures here should never block order placement)
        try {
            Mail::to($order->user->email)->send(new OrderConfirmationMail($order));
        } catch (\Throwable $e) {
            \Log::error("Order confirmation email failed: " . $e->getMessage());
        }

        try {
            app(SmsService::class)->send(
                $order->shipping_phone,
                "Electro: Your order {$order->order_no} has been placed. Total: ৳" . number_format($order->total, 2) . ". Thank you!"
            );
        } catch (\Throwable $e) {
            \Log::error("Order confirmation SMS failed: " . $e->getMessage());
        }
        // Check stock levels after this sale and alert admin if anything is running low
        try {
            app(StockAlertService::class)->checkAndNotify();
        } catch (\Throwable $e) {
            \Log::error("Low stock check failed: " . $e->getMessage());
        }

        return response()->json([
            "message" => "Order placed successfully",
            "order" => $order->load(["items", "payments", "invoice"]),
        ], 201);
    }

    // Customer order history
    public function myOrders(Request $request)
    {
        $orders = Order::with(["items", "invoice"])
            ->where("user_id", $request->user()->id)
            ->orderBy("created_at", "desc")
            ->paginate(10);
        return response()->json($orders);
    }

    public function show(Request $request, Order $order)
    {
        if ($order->user_id !== $request->user()->id && !$request->user()->isStaff()) {
            return response()->json(["message" => "Forbidden"], 403);
        }
        return response()->json($order->load(["items.product", "payments", "invoice", "user"]));
    }

    // Admin: list all orders
    public function adminIndex(Request $request)
    {
        $query = Order::with(["user", "items"]);
        if ($request->filled("status")) $query->where("status", $request->status);
        if ($request->filled("payment_status")) $query->where("payment_status", $request->payment_status);
        if ($request->filled("channel")) $query->where("channel", $request->channel);
        if ($request->filled("q")) $query->where("order_no", "like", "%{$request->q}%");
        return response()->json($query->orderBy("created_at", "desc")->paginate($request->get("per_page", 15)));
    }

    // Admin: update order/payment status
    public function updateStatus(Request $request, Order $order)
    {
        $data = $request->validate([
            "status" => "nullable|in:pending,processing,shipped,completed,cancelled",
            "payment_status" => "nullable|in:unpaid,paid,partial,refunded",
        ]);

        if (($data["status"] ?? null) === "cancelled" && $order->status !== "cancelled") {
            DB::transaction(function () use ($order) {
                foreach ($order->items as $item) {
                    $product = Product::find($item->product_id);
                    if ($product) {
                        $product->increment("stock_qty", $item->quantity);
                        StockMovement::create([
                            "product_id" => $product->id,
                            "type" => "return",
                            "quantity" => $item->quantity,
                            "balance_after" => $product->fresh()->stock_qty,
                            "reference_type" => "order_cancel",
                            "reference_id" => $order->id,
                        ]);
                    }
                }
            });
        }

        $order->update(array_filter($data, fn($v) => $v !== null));

        // Notify customer of status change (only if status field was actually part of the update)
        if (isset($data["status"]) && $order->user?->email) {
            try {
                Mail::to($order->user->email)->send(new OrderStatusUpdatedMail($order));
            } catch (\Throwable $e) {
                \Log::error("Order status email failed: " . $e->getMessage());
            }
        }

        return response()->json(["message" => "Order updated", "order" => $order]);
    }
}
