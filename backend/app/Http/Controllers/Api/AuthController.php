<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            "name" => "required|string|max:255",
            "email" => "required|string|email|max:255|unique:users",
            "phone" => "nullable|string|max:20",
            "address" => "nullable|string|max:255",
            "password" => "required|string|min:6|confirmed",
        ]);

        if ($validator->fails()) {
            return response()->json(["message" => "Validation failed", "errors" => $validator->errors()], 422);
        }

        $user = User::create([
            "name" => $request->name,
            "email" => $request->email,
            "phone" => $request->phone,
            "address" => $request->address,
            "password" => Hash::make($request->password),
            "role" => "customer",
        ]);

        Auth::login($user);
        $request->session()->regenerate();

        return response()->json(["message" => "Registered successfully", "user" => $user], 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            "email" => "required|email",
            "password" => "required",
        ]);

        if ($validator->fails()) {
            return response()->json(["message" => "Validation failed", "errors" => $validator->errors()], 422);
        }

        if (!Auth::attempt($request->only("email", "password"))) {
            return response()->json(["message" => "Invalid credentials"], 401);
        }

        $user = Auth::user();

        if (!$user->is_active) {
            Auth::logout();
            return response()->json(["message" => "Your account has been disabled"], 403);
        }

        $request->session()->regenerate();

        return response()->json(["message" => "Login successful", "user" => $user]);
    }

    public function logout(Request $request)
    {
        Auth::guard("web")->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(["message" => "Logged out successfully"]);
    }

    public function profile(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            "name" => "sometimes|string|max:255",
            "phone" => "nullable|string|max:20",
            "address" => "nullable|string|max:255",
            "password" => "nullable|string|min:6|confirmed",
        ]);

        if (!empty($data["password"])) {
            $data["password"] = Hash::make($data["password"]);
        } else {
            unset($data["password"]);
        }

        $user->update($data);
        return response()->json(["message" => "Profile updated", "user" => $user]);
    }
}