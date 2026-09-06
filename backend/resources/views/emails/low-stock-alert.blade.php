<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f4f6f9; padding: 24px; margin: 0;">
  <div style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 10px; overflow: hidden;">
    <div style="background: #dc3545; color: #fff; padding: 24px; text-align: center;">
      <h1 style="margin: 0; font-size: 22px;">ELECTRO</h1>
      <p style="margin: 4px 0 0; opacity: 0.9;">⚠️ Low Stock Alert</p>
    </div>
    <div style="padding: 24px;">
      <p>The following {{ $products->count() }} product(s) are running low on stock:</p>

      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr style="border-bottom: 2px solid #eee; text-align: left; font-size: 13px; color: #666;">
          <th style="padding: 8px 0;">Product</th>
          <th style="padding: 8px 0;">SKU</th>
          <th style="padding: 8px 0; text-align: right;">Stock Left</th>
        </tr>
        @foreach ($products as $p)
          <tr style="border-bottom: 1px solid #f0f0f0; font-size: 14px;">
            <td style="padding: 8px 0;">{{ $p->name }}</td>
            <td style="padding: 8px 0; color: #666;">{{ $p->sku }}</td>
            <td style="padding: 8px 0; text-align: right; color: #dc3545; font-weight: bold;">{{ $p->stock_qty }}</td>
          </tr>
        @endforeach
      </table>

      <p style="margin-top: 24px; color: #666; font-size: 13px;">Please restock these items soon via the Admin Panel → Purchases.</p>
    </div>
  </div>
</body>
</html>