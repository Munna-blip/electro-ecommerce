<?php
namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class SslCommerzService
{
    public function initiatePayment(Order $order): ?string
    {
        $frontendUrl = rtrim(env("FRONTEND_URL", "http://localhost:5173"), "/");
        $backendUrl = rtrim(config("app.url"), "/");

        $transactionId = $order->order_no . "-" . Str::random(6);

        $postData = [
            "store_id" => config("sslcommerz.store_id"),
            "store_passwd" => config("sslcommerz.store_password"),
            "total_amount" => number_format((float) $order->total, 2, ".", ""),
            "currency" => "BDT",
            "tran_id" => $transactionId,

            "success_url" => "{$backendUrl}/api/payments/sslcommerz/success",
            "fail_url" => "{$backendUrl}/api/payments/sslcommerz/fail",
            "cancel_url" => "{$backendUrl}/api/payments/sslcommerz/cancel",
            "ipn_url" => "{$backendUrl}/api/payments/sslcommerz/ipn",

            "cus_name" => $order->shipping_name ?? $order->user?->name ?? "Customer",
            "cus_email" => $order->user?->email ?? "customer@electro.test",
            "cus_add1" => $order->shipping_address ?? "N/A",
            "cus_city" => "Dhaka",
            "cus_postcode" => "1000",
            "cus_country" => "Bangladesh",
            "cus_phone" => $order->shipping_phone ?? "01700000000",

            "shipping_method" => "NO",
            "product_name" => "Electro Order #" . $order->order_no,
            "product_category" => "Electronics",
            "product_profile" => "general",

            "value_a" => $order->id, // custom field to identify order on callback
        ];

        $response = Http::asForm()->post(config("sslcommerz.api_url"), $postData);
        $result = $response->json();

        if (($result["status"] ?? null) === "SUCCESS") {
            // Save the transaction id on the order's pending payment record
            $order->payments()->latest()->first()?->update(["transaction_id" => $transactionId]);
            return $result["GatewayPageURL"];
        }

        return null;
    }

    public function validatePayment(string $valId): ?array
    {
        $response = Http::get(config("sslcommerz.validation_url"), [
            "val_id" => $valId,
            "store_id" => config("sslcommerz.store_id"),
            "store_passwd" => config("sslcommerz.store_password"),
            "format" => "json",
        ]);

        $result = $response->json();

        if (in_array($result["status"] ?? null, ["VALID", "VALIDATED"])) {
            return $result;
        }

        return null;
    }
}