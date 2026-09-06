<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create("orders", function (Blueprint $table) {
            $table->id();
            $table->string("order_no")->unique();
            $table->foreignId("user_id")->nullable()->constrained("users")->nullOnDelete();
            $table->enum("channel", ["online", "pos"])->default("online");
            $table->decimal("subtotal", 12, 2)->default(0);
            $table->decimal("discount", 12, 2)->default(0);
            $table->decimal("tax", 12, 2)->default(0);
            $table->decimal("shipping_fee", 12, 2)->default(0);
            $table->decimal("total", 12, 2)->default(0);
            $table->enum("status", ["pending", "processing", "shipped", "completed", "cancelled"])->default("pending");
            $table->enum("payment_status", ["unpaid", "paid", "partial", "refunded"])->default("unpaid");
            $table->string("shipping_name")->nullable();
            $table->string("shipping_phone")->nullable();
            $table->string("shipping_address")->nullable();
            $table->text("note")->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists("orders"); }
};
