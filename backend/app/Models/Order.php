<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        "order_no", "user_id", "channel", "subtotal", "discount", "tax", "shipping_fee",
        "total", "status", "payment_status", "shipping_name", "shipping_phone",
        "shipping_address", "note",
    ];

    public function user() { return $this->belongsTo(User::class); }
    public function items() { return $this->hasMany(OrderItem::class); }
    public function payments() { return $this->hasMany(Payment::class); }
    public function invoice() { return $this->hasOne(Invoice::class); }
}
