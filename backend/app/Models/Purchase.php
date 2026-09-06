<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Purchase extends Model
{
    protected $fillable = ["reference_no", "supplier_id", "user_id", "total_amount", "paid_amount", "status", "purchase_date", "note"];

    public function supplier() { return $this->belongsTo(Supplier::class); }
    public function items() { return $this->hasMany(PurchaseItem::class); }
    public function user() { return $this->belongsTo(User::class); }
}
