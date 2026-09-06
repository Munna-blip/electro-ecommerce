<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BrandController extends Controller
{
    public function index(Request $request)
    {
        $query = Brand::withCount("products");
        if ($request->boolean("active_only")) $query->where("is_active", true);
        return response()->json($query->orderBy("name")->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            "name" => "required|string|max:255|unique:brands,name",
            "is_active" => "nullable|boolean",
            "logo" => "nullable|image|max:2048",
        ]);
        $data["slug"] = Str::slug($data["name"]);
        if ($request->hasFile("logo")) {
            $data["logo"] = $request->file("logo")->store("brands", "public");
        }
        $brand = Brand::create($data);
        return response()->json(["message" => "Brand created", "brand" => $brand], 201);
    }

    public function update(Request $request, Brand $brand)
    {
        $data = $request->validate([
            "name" => "sometimes|string|max:255|unique:brands,name," . $brand->id,
            "is_active" => "nullable|boolean",
            "logo" => "nullable|image|max:2048",
        ]);
        if ($request->hasFile("logo")) {
            $data["logo"] = $request->file("logo")->store("brands", "public");
        }
        $brand->update($data);
        return response()->json(["message" => "Brand updated", "brand" => $brand]);
    }

    public function destroy(Brand $brand)
    {
        $brand->delete();
        return response()->json(["message" => "Brand deleted"]);
    }
}
