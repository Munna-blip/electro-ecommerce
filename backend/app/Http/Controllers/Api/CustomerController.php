<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = User::where("role", "customer")->withCount("orders");
        if ($request->filled("q")) {
            $query->where(function ($q) use ($request) {
                $q->where("name", "like", "%{$request->q}%")
                  ->orWhere("email", "like", "%{$request->q}%");
            });
        }
        return response()->json($query->orderBy("created_at", "desc")->paginate($request->get("per_page", 15)));
    }

    public function show(User $customer)
    {
        $customer->load(["orders" => fn ($q) => $q->latest()->limit(20)]);
        return response()->json($customer);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            "name" => "required|string|max:255",
            "email" => "required|email|unique:users,email",
            "phone" => "nullable|string|max:20",
            "address" => "nullable|string|max:255",
            "password" => "required|string|min:6",
        ]);
        $data["password"] = Hash::make($data["password"]);
        $data["role"] = "customer";
        $customer = User::create($data);
        return response()->json(["message" => "Customer created", "customer" => $customer], 201);
    }

    public function update(Request $request, User $customer)
    {
        $data = $request->validate([
            "name" => "sometimes|string|max:255",
            "phone" => "nullable|string|max:20",
            "address" => "nullable|string|max:255",
            "is_active" => "nullable|boolean",
        ]);
        $customer->update($data);
        return response()->json(["message" => "Customer updated", "customer" => $customer]);
    }

    public function destroy(User $customer)
    {
        $customer->delete();
        return response()->json(["message" => "Customer deleted"]);
    }
}
