<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Services\SslCommerzService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentGatewayController extends Controller
{
    protected SslCommerzService $sslCommerz;

    public function __construct(SslCommerzService $sslCommerz)
    {
        $this->sslCommerz = $sslCommerz;
    }

    // Called by frontend (authenticated) right after order creation
    public function initiate(Request $request, Order $order)
    {
        if ($order->user_id !== $request->user()->id) {
            return response()->json(["message" => "Forbidden"], 403);
        }

        if ($order->payment_status === "paid") {
            return response()->json(["message" => "Order is already paid"], 422);
        }

        $gatewayUrl = $this->sslCommerz->initiatePayment($order);

        if (!$gatewayUrl) {
            return response()->json(["message" => "Could not initiate payment. Please try again."], 500);
        }

        return response()->json(["gateway_url" => $gatewayUrl]);
    }

    // SSLCommerz redirects the customer's browser here (POST) after successful payment
    public function success(Request $request)
    {
        return $this->handleCallback($request, "success");
    }

    // SSLCommerz redirects here if payment failed
    public function fail(Request $request)
    {
        return $this->handleCallback($request, "fail");
    }

    // SSLCommerz redirects here if customer cancelled
    public function cancel(Request $request)
    {
        return $this->handleCallback($request, "cancel");
    }

    // Server-to-server notification (backup confirmation, no browser involved)
    public function ipn(Request $request)
    {
        $this->handleCallback($request, "ipn");
        return response()->json(["message" => "IPN received"]);
    }

    private function handleCallback(Request $request, string $type)
    {
        $frontendUrl = rtrim(env("FRONTEND_URL", "http://localhost:5173"), "/");
        $orderId = $request->input("value_a");
        $order = Order::find($orderId);

        if (!$order) {
            Log::warning("SSLCommerz callback: order not found", ["order_id" => $orderId, "type" => $type]);
            return redirect()->away("{$frontendUrl}/checkout");
        }

        if ($type === "fail" || $type === "cancel") {
            $order->payments()->latest()->first()?->update(["status" => "failed"]);
            if ($type === "ipn") {
                return null;
            }
            return redirect()->away("{$frontendUrl}/orders/{$order->id}?payment=failed");
        }

        // success or ipn: validate with SSLCommerz before trusting it
        $valId = $request->input("val_id");
        $validated = $valId ? $this->sslCommerz->validatePayment($valId) : null;

        if ($validated) {
            $order->update(["payment_status" => "paid", "status" => "processing"]);
            $order->payments()->latest()->first()?->update([
                "status" => "success",
                "transaction_id" => $validated["tran_id"] ?? $request->input("tran_id"),
            ]);
        } else {
            Log::warning("SSLCommerz validation failed", ["order_id" => $order->id]);
        }

        if ($type === "ipn") {
            return null;
        }

        return redirect()->away("{$frontendUrl}/orders/{$order->id}?payment=" . ($validated ? "success" : "failed"));
    }
}