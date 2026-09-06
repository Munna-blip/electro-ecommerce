<?php
namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin & demo users
        User::create([
            "name" => "Admin User", "email" => "admin@electro.test",
            "password" => Hash::make("password"), "role" => "admin", "phone" => "01700000000",
        ]);
        User::create([
            "name" => "Staff User", "email" => "staff@electro.test",
            "password" => Hash::make("password"), "role" => "staff", "phone" => "01700000001",
        ]);
        User::create([
            "name" => "John Customer", "email" => "customer@electro.test",
            "password" => Hash::make("password"), "role" => "customer", "phone" => "01700000002",
            "address" => "House 12, Road 5, Dhaka",
        ]);

        // Categories
        $categories = ["Laptops", "Desktop PCs", "Monitors", "Components", "Networking", "Mobile Phones", "Accessories", "Cameras"];
        $categoryModels = collect($categories)->map(fn ($name) => Category::create([
            "name" => $name, "slug" => Str::slug($name), "is_active" => true,
        ]));

        // Brands
        $brands = ["Asus", "Dell", "HP", "Lenovo", "Apple", "Samsung", "Logitech", "Corsair", "MSI", "Xiaomi"];
        $brandModels = collect($brands)->map(fn ($name) => Brand::create([
            "name" => $name, "slug" => Str::slug($name), "is_active" => true,
        ]));

        // Suppliers
        collect(["Global Tech Distributors", "Dhaka Electronics BD", "Micro Trade Ltd", "Smart Import House"])
            ->each(fn ($name) => Supplier::create([
                "name" => $name, "company" => $name, "email" => Str::slug($name) . "@supplier.test",
                "phone" => "01800000000", "address" => "Dhaka, Bangladesh", "is_active" => true,
            ]));

        // Sample products
        $sampleProducts = [
            ["name" => "ASUS ROG Strix G16 Gaming Laptop", "cat" => "Laptops", "brand" => "Asus", "price" => 185000, "cost" => 160000],
            ["name" => "Dell XPS 13 Ultrabook", "cat" => "Laptops", "brand" => "Dell", "price" => 145000, "cost" => 125000],
            ["name" => "HP Pavilion 15 Business Laptop", "cat" => "Laptops", "brand" => "HP", "price" => 78000, "cost" => 65000],
            ["name" => "Lenovo ThinkPad E14", "cat" => "Laptops", "brand" => "Lenovo", "price" => 92000, "cost" => 79000],
            ["name" => "Apple MacBook Air M3", "cat" => "Laptops", "brand" => "Apple", "price" => 152000, "cost" => 135000],
            ["name" => "Dell OptiPlex Desktop Tower", "cat" => "Desktop PCs", "brand" => "Dell", "price" => 65000, "cost" => 54000],
            ["name" => "MSI Aegis Gaming Desktop", "cat" => "Desktop PCs", "brand" => "MSI", "price" => 210000, "cost" => 185000],
            ["name" => "Samsung 27\" 4K UHD Monitor", "cat" => "Monitors", "brand" => "Samsung", "price" => 42000, "cost" => 34000],
            ["name" => "ASUS TUF 24\" 165Hz Gaming Monitor", "cat" => "Monitors", "brand" => "Asus", "price" => 28000, "cost" => 22000],
            ["name" => "Corsair Vengeance 16GB DDR5 RAM", "cat" => "Components", "brand" => "Corsair", "price" => 8500, "cost" => 6800],
            ["name" => "MSI RTX 4070 Graphics Card", "cat" => "Components", "brand" => "MSI", "price" => 98000, "cost" => 86000],
            ["name" => "TP-Link AX3000 WiFi Router", "cat" => "Networking", "brand" => "Asus", "price" => 7200, "cost" => 5600],
            ["name" => "Xiaomi Redmi Note 13 Pro", "cat" => "Mobile Phones", "brand" => "Xiaomi", "price" => 32000, "cost" => 27000],
            ["name" => "Samsung Galaxy A55", "cat" => "Mobile Phones", "brand" => "Samsung", "price" => 45000, "cost" => 38000],
            ["name" => "Logitech MX Master 3S Mouse", "cat" => "Accessories", "brand" => "Logitech", "price" => 9500, "cost" => 7200],
            ["name" => "Logitech G Pro X Mechanical Keyboard", "cat" => "Accessories", "brand" => "Logitech", "price" => 12500, "cost" => 9800],
            ["name" => "Canon EOS M50 Mirrorless Camera", "cat" => "Cameras", "brand" => "Apple", "price" => 68000, "cost" => 58000],
            ["name" => "Corsair RM750 Power Supply", "cat" => "Components", "brand" => "Corsair", "price" => 11500, "cost" => 9200],
        ];

        foreach ($sampleProducts as $i => $p) {
            $category = $categoryModels->firstWhere("name", $p["cat"]);
            $brand = $brandModels->firstWhere("name", $p["brand"]);
            Product::create([
                "name" => $p["name"],
                "slug" => Str::slug($p["name"]) . "-" . Str::random(5),
                "sku" => "SKU-" . str_pad($i + 1, 5, "0", STR_PAD_LEFT),
                "barcode" => "880" . str_pad($i + 1, 10, "0", STR_PAD_LEFT),
                "category_id" => $category->id,
                "brand_id" => $brand->id,
                "description" => "High quality {$p["name"]} with manufacturer warranty. Ideal for professional and personal use.",
                "specification" => "Please contact support for full technical specification sheet.",
                "cost_price" => $p["cost"],
                "price" => $p["price"],
                "discount_price" => $i % 4 === 0 ? round($p["price"] * 0.92) : null,
                "tax_rate" => 5,
                "stock_qty" => rand(5, 60),
                "alert_qty" => 10,
                "unit" => "pcs",
                "is_featured" => $i % 3 === 0,
                "status" => "active",
            ]);
        }
    }
}
