<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create("payments", function (Blueprint $table) {
            $table->id();
            $table->foreignId("order_id")->constrained()->cascadeOnDelete();
            $table->enum("method", ["cash", "card", "mobile_banking", "bank_transfer"])->default("cash");
            $table->decimal("amount", 12, 2);
            $table->enum("status", ["pending", "success", "failed", "refunded"])->default("success");
            $table->string("transaction_id")->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists("payments"); }
};
