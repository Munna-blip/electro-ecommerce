<?php

return [
    "store_id" => env("SSLCOMMERZ_STORE_ID"),
    "store_password" => env("SSLCOMMERZ_STORE_PASSWORD"),
    "sandbox" => env("SSLCOMMERZ_SANDBOX", true),

    "api_url" => env("SSLCOMMERZ_SANDBOX", true)
        ? "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
        : "https://securepay.sslcommerz.com/gwprocess/v4/api.php",

    "validation_url" => env("SSLCOMMERZ_SANDBOX", true)
        ? "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php"
        : "https://securepay.sslcommerz.com/validator/api/validationserverAPI.php",
];