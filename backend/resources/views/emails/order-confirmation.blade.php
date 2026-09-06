<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f4f6f9; padding: 24px; margin: 0;">
  <div style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 10px; overflow: hidden;">
    <div style="background: #0d6efd; color: #fff; padding: 24px; text-align: center;">
      <h1 style="margin: 0; font-size: 22px;">ELECTRO</h1>
      <p style="margin: 4px 0 0; opacity: 0.9;">Order Confirmed</p>
    </div>
    <div style="padding: 24px;">
      <p>Hi {{ $order->shipping_name ?? 'there' }},</p>
      <p>Thank you for your order! We've received it and it's being processed.</p>

      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 6px 0; color: #666;">Order No</td><td style="text-align: right; font-weight: bold;">{{ $order->order_no }}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Total</td><td style="text-align: right; font-weight: bold;">৳{{ number_format($order->total, 2) }}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Payment Method</td><td style="text-align: right; text-transform: capitalize;">{{ $order->payment_status }}</td></tr>
      </table>

      <h3 style="border-bottom: 1px solid #eee; padding-bottom: 8px;">Items</h3>
      @foreach ($order->items as $item)
        <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px;">
          <span>{{ $item->product_name }} x{{ $item->quantity }}</span>
          <span>৳{{ number_format($item->subtotal, 2) }}</span>
        </div>
      @endforeach

      <p style="margin-top: 24px; color: #666; font-size: 13px;">
        Delivery Address: {{ $order->shipping_address }}<br>
        Contact: {{ $order->shipping_phone }}
      </p>

      <p style="margin-top: 24px;">Thank you for shopping with Electro!</p>
    </div>
  </div>
</body>
</html>