<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = ["name", "email", "phone", "address", "password", "role", "avatar", "is_active"];
    protected $hidden = ["password", "remember_token"];
    protected $casts = ["email_verified_at" => "datetime", "password" => "hashed", "is_active" => "boolean"];

    public function isAdmin(): bool { return $this->role === "admin"; }
    public function isStaff(): bool { return in_array($this->role, ["admin", "staff"]); }

    public function orders() { return $this->hasMany(Order::class); }
    public function cartItems() { return $this->hasMany(Cart::class); }
    public function wishlist() { return $this->hasMany(Wishlist::class); }
}
