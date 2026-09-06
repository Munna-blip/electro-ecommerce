<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $query = Supplier::query();
        if ($request->filled("q")) {
            $query->where("name", "like", "%{$request->q}%");
        }
        return response()->json($query->orderBy("name")->paginate($request->get("per_page", 15)));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            "name" => "required|string|max:255",
            "company" => "nullable|string|max:255",
            "email" => "nullable|email",
            "phone" => "nullable|string|max:20",
            "address" => "nullable|string|max:255",
            "is_active" => "nullable|boolean",
        ]);
        $supplier = Supplier::create($data);
        return response()->json(["message" => "Supplier created", "supplier" => $supplier], 201);
    }

    public function update(Request $request, Supplier $supplier)
    {
        $data = $request->validate([
            "name" => "sometimes|string|max:255",
            "company" => "nullable|string|max:255",
            "email" => "nullable|email",
            "phone" => "nullable|string|max:20",
            "address" => "nullable|string|max:255",
            "is_active" => "nullable|boolean",
        ]);
        $supplier->update($data);
        return response()->json(["message" => "Supplier updated", "supplier" => $supplier]);
    }

    public function destroy(Supplier $supplier)
    {
        $supplier->delete();
        return response()->json(["message" => "Supplier deleted"]);
    }
}
