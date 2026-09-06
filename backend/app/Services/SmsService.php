<?php
namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    public function send(string $phone, string $message): bool
    {
        if (!env("BULKSMSBD_ENABLED", false)) {
            Log::info("SMS skipped (disabled): {$phone} - {$message}");
            return false;
        }

        $phone = $this->normalizePhone($phone);

        try {
            $response = Http::get("http://bulksmsbd.net/api/smsapi", [
                "api_key" => env("BULKSMSBD_API_KEY"),
                "type" => "text",
                "number" => $phone,
                "senderid" => env("BULKSMSBD_SENDER_ID"),
                "message" => $message,
            ]);

            Log::info("SMS sent to {$phone}", ["response" => $response->body()]);
            return $response->successful();
        } catch (\Throwable $e) {
            Log::error("SMS sending failed: " . $e->getMessage());
            return false;
        }
    }

    private function normalizePhone(string $phone): string
    {
        $phone = preg_replace("/[^0-9]/", "", $phone);
        if (str_starts_with($phone, "0")) {
            $phone = "88" . $phone;
        } elseif (!str_starts_with($phone, "88")) {
            $phone = "88" . $phone;
        }
        return $phone;
    }
}