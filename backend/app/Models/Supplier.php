<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    use HasFactory;
    protected $fillable = ["name", "company", "email", "phone", "address", "is_active"];
    protected $casts = ["is_active" => "boolean"];

    public function purchases() { return $this->hasMany(Purchase::class); }
}
