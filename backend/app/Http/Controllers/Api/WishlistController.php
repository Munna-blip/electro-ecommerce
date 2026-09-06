<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            Wishlist::with("product.images")->where("user_id", $request->user()->id)->get()
        );
    }

    public function toggle(Request $request)
    {
        $data = $request->validate(["product_id" => "required|exists:products,id"]);
        $existing = Wishlist::where("user_id", $request->user()->id)
            ->where("product_id", $data["product_id"])->first();

        if ($existing) {
            $existing->delete();
            return response()->json(["message" => "Removed from wishlist", "wishlisted" => false]);
        }

        Wishlist::create(["user_id" => $request->user()->id, "product_id" => $data["product_id"]]);
        return response()->json(["message" => "Added to wishlist", "wishlisted" => true]);
    }
}
