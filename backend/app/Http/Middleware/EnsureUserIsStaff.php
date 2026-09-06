<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureUserIsStaff
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user() || !$request->user()->isStaff()) {
            return response()->json(["message" => "Forbidden. Staff access required."], 403);
        }
        return $next($request);
    }
}
