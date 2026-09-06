<?php

namespace App\Http\Controllers\Api;

use App\Models\Wishlist;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    // Public storefront listing: search, filter, sort, paginate
    public function index(Request $request)
    {
        $query = Product::with(["category", "brand", "images", "specifications"])
            ->where("status", "active");

        if ($request->filled("q")) {
            $query->search($request->q);
        }
        if ($request->filled("category_id")) {
            $query->where("category_id", $request->category_id);
        }
        if ($request->filled("brand_id")) {
            $query->where("brand_id", $request->brand_id);
        }
        if ($request->filled("min_price")) {
            $query->where("price", ">=", $request->min_price);
        }
        if ($request->filled("max_price")) {
            $query->where("price", "<=", $request->max_price);
        }
        if ($request->boolean("featured")) {
            $query->where("is_featured", true);
        }
        if ($request->boolean("in_stock")) {
            $query->where("stock_qty", ">", 0);
        }

        $sort = $request->get("sort", "latest");
        match ($sort) {
            "price_asc" => $query->orderBy("price", "asc"),
            "price_desc" => $query->orderBy("price", "desc"),
            "name_asc" => $query->orderBy("name", "asc"),
            "popular" => $query->orderBy("is_featured", "desc"),
            default => $query->orderBy("created_at", "desc"),
        };

        $perPage = min((int) $request->get("per_page", 12), 50);
        $paginated = $query->paginate($perPage);

        if ($request->user()) {
            $wishlistedIds = Wishlist::where("user_id", $request->user()->id)
                ->pluck("product_id")->toArray();
            $paginated->getCollection()->transform(function ($product) use ($wishlistedIds) {
                $product->is_wishlisted = in_array($product->id, $wishlistedIds);
                return $product;
            });
        }

        return response()->json($paginated);
    }

    // Admin listing (includes inactive)
    public function adminIndex(Request $request)
    {
        $query = Product::with(["category", "brand"]);
        if ($request->filled("q")) $query->search($request->q);
        if ($request->filled("category_id")) $query->where("category_id", $request->category_id);
        if ($request->filled("status")) $query->where("status", $request->status);
        return response()->json($query->orderBy("created_at", "desc")->paginate($request->get("per_page", 15)));
    }

    public function show(Request $request, $slug)
    {
        $product = Product::with(["category", "brand", "images", "specifications"])->where("slug", $slug)->firstOrFail();
        $related = Product::with(["brand"])
            ->where("category_id", $product->category_id)
            ->where("id", "!=", $product->id)
            ->where("status", "active")
            ->limit(8)
            ->get();

        if ($request->user()) {
            $wishlistedIds = Wishlist::where("user_id", $request->user()->id)
                ->whereIn("product_id", $related->pluck("id")->push($product->id))
                ->pluck("product_id")->toArray();
            $product->is_wishlisted = in_array($product->id, $wishlistedIds);
            $related->transform(function ($p) use ($wishlistedIds) {
                $p->is_wishlisted = in_array($p->id, $wishlistedIds);
                return $p;
            });
        }

        return response()->json(["product" => $product, "related_products" => $related]);
    }

    public function nextCodes()
    {
        $lastSku = Product::orderBy("id", "desc")->value("sku");
        $nextNumber = 1;

        if ($lastSku && preg_match('/(\d+)$/', $lastSku, $matches)) {
            $nextNumber = (int) $matches[1] + 1;
        }

        do {
            $sku = "SKU-" . str_pad($nextNumber, 5, "0", STR_PAD_LEFT);
            $nextNumber++;
        } while (Product::where("sku", $sku)->exists());

        $barcodeNumber = 1;
        $lastBarcode = Product::orderBy("id", "desc")->value("barcode");
        if ($lastBarcode && preg_match('/(\d+)$/', $lastBarcode, $matches)) {
            $barcodeNumber = (int) $matches[1] + 1;
        }

        do {
            $barcode = "880" . str_pad($barcodeNumber, 10, "0", STR_PAD_LEFT);
            $barcodeNumber++;
        } while (Product::where("barcode", $barcode)->exists());

        return response()->json(["sku" => $sku, "barcode" => $barcode]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            "name" => "required|string|max:255",
            "sku" => "required|string|unique:products,sku",
            "barcode" => "nullable|string|unique:products,barcode",
            "category_id" => "required|exists:categories,id",
            "brand_id" => "nullable|exists:brands,id",
            "description" => "nullable|string",
            "specification" => "nullable|string",
            "key_specs" => "nullable|string|max:255",
            "cost_price" => "required|numeric|min:0",
            "price" => "required|numeric|min:0",
            "discount_price" => "nullable|numeric|min:0",
            "tax_rate" => "nullable|numeric|min:0",
            "stock_qty" => "required|integer|min:0",
            "alert_qty" => "nullable|integer|min:0",
            "unit" => "nullable|string",
            "is_featured" => "nullable|boolean",
            "status" => "nullable|in:active,inactive",
            "thumbnail" => "nullable|image|mimes:jpg,jpeg,png,webp,gif|max:10240",
        ]);

        if ($validator->fails()) {
            return response()->json(["message" => "Validation failed", "errors" => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data["slug"] = Str::slug($data["name"]) . "-" . Str::random(6);

        if ($request->hasFile("thumbnail")) {
            $data["thumbnail"] = $request->file("thumbnail")->store("products", "public");
        }

        $product = Product::create($data);

        if ($request->filled("specifications")) {
            $specs = json_decode($request->input("specifications"), true) ?? [];
            foreach ($specs as $i => $spec) {
                if (!empty($spec["label"]) && !empty($spec["value"])) {
                    $product->specifications()->create([
                        "label" => $spec["label"],
                        "value" => $spec["value"],
                        "sort_order" => $i,
                    ]);
                }
            }
        }

        if ($product->stock_qty > 0) {
            StockMovement::create([
                "product_id" => $product->id,
                "type" => "adjustment",
                "quantity" => $product->stock_qty,
                "balance_after" => $product->stock_qty,
                "note" => "Initial stock on product creation",
            ]);
        }

        return response()->json(["message" => "Product created", "product" => $product], 201);
    }

    public function update(Request $request, Product $product)
    {
        $validator = Validator::make($request->all(), [
            "name" => "sometimes|string|max:255",
            "sku" => "sometimes|string|unique:products,sku," . $product->id,
            "barcode" => "nullable|string|unique:products,barcode," . $product->id,
            "category_id" => "sometimes|exists:categories,id",
            "brand_id" => "nullable|exists:brands,id",
            "description" => "nullable|string",
            "specification" => "nullable|string",
            "key_specs" => "nullable|string|max:255",
            "cost_price" => "sometimes|numeric|min:0",
            "price" => "sometimes|numeric|min:0",
            "discount_price" => "nullable|numeric|min:0",
            "tax_rate" => "nullable|numeric|min:0",
            "alert_qty" => "nullable|integer|min:0",
            "unit" => "nullable|string",
            "is_featured" => "nullable|boolean",
            "status" => "nullable|in:active,inactive",
            "thumbnail" => "sometimes|nullable|image|mimes:jpg,jpeg,png,webp,gif|max:10240",
        ]);

        if ($validator->fails()) {
            return response()->json(["message" => "Validation failed", "errors" => $validator->errors()], 422);
        }

        $data = $validator->validated();

        if ($request->hasFile("thumbnail")) {
            if ($product->thumbnail) Storage::disk("public")->delete($product->thumbnail);
            $data["thumbnail"] = $request->file("thumbnail")->store("products", "public");
        }

        $product->update($data);

        if ($request->filled("specifications")) {
            $specs = json_decode($request->input("specifications"), true) ?? [];
            $product->specifications()->delete();
            foreach ($specs as $i => $spec) {
                if (!empty($spec["label"]) && !empty($spec["value"])) {
                    $product->specifications()->create([
                        "label" => $spec["label"],
                        "value" => $spec["value"],
                        "sort_order" => $i,
                    ]);
                }
            }
        }

        return response()->json(["message" => "Product updated", "product" => $product->load("specifications")]);
    }

    public function destroy(Product $product)
    {
        if ($product->thumbnail) Storage::disk("public")->delete($product->thumbnail);
        $product->delete();
        return response()->json(["message" => "Product deleted"]);
    }
}