<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create("product_specifications", function (Blueprint $table) {
            $table->id();
            $table->foreignId("product_id")->constrained()->cascadeOnDelete();
            $table->string("label");   // e.g. "RAM", "Processor", "Storage"
            $table->string("value");   // e.g. "16GB DDR5", "Intel Core i7", "512GB SSD"
            $table->integer("sort_order")->default(0);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists("product_specifications"); }
};