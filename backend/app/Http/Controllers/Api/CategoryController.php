<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Category::withCount("products")->with("children");
        if (!$request->boolean("all")) $query->whereNull("parent_id");
        if ($request->boolean("active_only")) $query->where("is_active", true);
        return response()->json($query->orderBy("name")->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            "name" => "required|string|max:255",
            "parent_id" => "nullable|exists:categories,id",
            "is_active" => "nullable|boolean",
            "image" => "nullable|image|mimes:jpg,jpeg,png,webp,gif|max:10240",
        ]);
        $data["slug"] = Str::slug($data["name"]) . "-" . Str::random(4);
        if ($request->hasFile("image")) {
            $data["image"] = $request->file("image")->store("categories", "public");
        }
        $category = Category::create($data);
        return response()->json(["message" => "Category created", "category" => $category], 201);
    }

    public function update(Request $request, Category $category)
    {
        $data = $request->validate([
            "name" => "sometimes|string|max:255",
            "parent_id" => "nullable|exists:categories,id",
            "is_active" => "nullable|boolean",
            "image" => "nullable|image|mimes:jpg,jpeg,png,webp,gif|max:10240",
        ]);
        if ($request->hasFile("image")) {
            $data["image"] = $request->file("image")->store("categories", "public");
        }
        $category->update($data);
        return response()->json(["message" => "Category updated", "category" => $category]);
    }

    public function destroy(Category $category)
    {
        $category->delete();
        return response()->json(["message" => "Category deleted"]);
    }
}
