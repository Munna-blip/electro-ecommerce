<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create("stock_movements", function (Blueprint $table) {
            $table->id();
            $table->foreignId("product_id")->constrained()->cascadeOnDelete();
            $table->enum("type", ["purchase", "sale", "adjustment", "return"]);
            $table->integer("quantity");
            $table->integer("balance_after");
            $table->string("reference_type")->nullable();
            $table->unsignedBigInteger("reference_id")->nullable();
            $table->text("note")->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists("stock_movements"); }
};
