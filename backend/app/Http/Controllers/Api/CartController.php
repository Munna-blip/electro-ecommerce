<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $items = Cart::with("product.images")->where("user_id", $request->user()->id)->get();
        $subtotal = $items->sum(fn ($i) => $i->product->final_price * $i->quantity);
        return response()->json(["items" => $items, "subtotal" => round($subtotal, 2)]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            "product_id" => "required|exists:products,id",
            "quantity" => "nullable|integer|min:1",
        ]);
        $product = Product::findOrFail($data["product_id"]);
        $qty = $data["quantity"] ?? 1;

        if ($product->stock_qty < $qty) {
            return response()->json(["message" => "Insufficient stock available"], 422);
        }

        $cart = Cart::firstOrNew(["user_id" => $request->user()->id, "product_id" => $product->id]);
        $cart->quantity = ($cart->exists ? $cart->quantity : 0) + $qty;
        $cart->save();

        return response()->json(["message" => "Added to cart", "item" => $cart->load("product")], 201);
    }

    public function update(Request $request, Cart $cart)
    {
        if ($cart->user_id !== $request->user()->id) {
            return response()->json(["message" => "Forbidden"], 403);
        }
        $data = $request->validate(["quantity" => "required|integer|min:1"]);
        if ($cart->product->stock_qty < $data["quantity"]) {
            return response()->json(["message" => "Insufficient stock available"], 422);
        }
        $cart->update($data);
        return response()->json(["message" => "Cart updated", "item" => $cart->load("product")]);
    }

    public function destroy(Request $request, Cart $cart)
    {
        if ($cart->user_id !== $request->user()->id) {
            return response()->json(["message" => "Forbidden"], 403);
        }
        $cart->delete();
        return response()->json(["message" => "Item removed from cart"]);
    }

    public function clear(Request $request)
    {
        Cart::where("user_id", $request->user()->id)->delete();
        return response()->json(["message" => "Cart cleared"]);
    }
}
