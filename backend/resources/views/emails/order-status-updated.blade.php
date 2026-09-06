<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f4f6f9; padding: 24px; margin: 0;">
  <div style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 10px; overflow: hidden;">
    <div style="background: #198754; color: #fff; padding: 24px; text-align: center;">
      <h1 style="margin: 0; font-size: 22px;">ELECTRO</h1>
      <p style="margin: 4px 0 0; opacity: 0.9;">Order Status Updated</p>
    </div>
    <div style="padding: 24px;">
      <p>Hi {{ $order->shipping_name ?? 'there' }},</p>
      <p>Your order <strong>{{ $order->order_no }}</strong> status has been updated to:</p>

      <div style="text-align: center; margin: 20px 0;">
        <span style="display: inline-block; background: #e7f5ec; color: #198754; padding: 10px 24px; border-radius: 999px; font-weight: bold; text-transform: capitalize;">
          {{ $order->status }}
        </span>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 6px 0; color: #666;">Payment Status</td><td style="text-align: right; text-transform: capitalize;">{{ $order->payment_status }}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Total</td><td style="text-align: right; font-weight: bold;">৳{{ number_format($order->total, 2) }}</td></tr>
      </table>

      <p style="margin-top: 24px;">Thank you for shopping with Electro!</p>
    </div>
  </div>
</body>
</html>