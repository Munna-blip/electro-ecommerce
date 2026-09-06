<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create("purchases", function (Blueprint $table) {
            $table->id();
            $table->string("reference_no")->unique();
            $table->foreignId("supplier_id")->constrained()->cascadeOnDelete();
            $table->foreignId("user_id")->nullable()->constrained("users")->nullOnDelete();
            $table->decimal("total_amount", 12, 2)->default(0);
            $table->decimal("paid_amount", 12, 2)->default(0);
            $table->enum("status", ["pending", "received", "cancelled"])->default("pending");
            $table->date("purchase_date");
            $table->text("note")->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists("purchases"); }
};
