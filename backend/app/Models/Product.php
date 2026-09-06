<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        "name", "slug", "sku", "barcode", "category_id", "brand_id", "description",
        "specification", "key_specs", "cost_price", "price", "discount_price", "tax_rate",
    ];
    protected $casts = [
        "is_featured" => "boolean",
        "price" => "decimal:2",
        "cost_price" => "decimal:2",
        "discount_price" => "decimal:2",
        "tax_rate" => "decimal:2",
    ];
    protected $appends = ["final_price", "in_stock"];

    public function category() { return $this->belongsTo(Category::class); }
    public function brand() { return $this->belongsTo(Brand::class); }
    public function images() { return $this->hasMany(ProductImage::class); }
    public function specifications() { return $this->hasMany(ProductSpecification::class)->orderBy("sort_order"); }
    public function stockMovements() { return $this->hasMany(StockMovement::class); }

    public function getFinalPriceAttribute()
    {
        return $this->discount_price && $this->discount_price > 0 ? $this->discount_price : $this->price;
    }

    public function getInStockAttribute(): bool
    {
        return $this->stock_qty > 0;
    }

    public function scopeSearch($query, $term)
    {
        if (!$term) return $query;
        return $query->where(function ($q) use ($term) {
            $q->where("name", "like", "%{$term}%")
              ->orWhere("sku", "like", "%{$term}%")
              ->orWhere("barcode", "like", "%{$term}%");
        });
    }
}
