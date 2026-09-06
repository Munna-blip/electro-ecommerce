<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create("products", function (Blueprint $table) {
            $table->id();
            $table->string("name");
            $table->string("slug")->unique();
            $table->string("sku")->unique();
            $table->string("barcode")->nullable()->unique();
            $table->foreignId("category_id")->constrained("categories")->cascadeOnDelete();
            $table->foreignId("brand_id")->nullable()->constrained("brands")->nullOnDelete();
            $table->text("description")->nullable();
            $table->text("specification")->nullable();
            $table->decimal("cost_price", 12, 2)->default(0);
            $table->decimal("price", 12, 2);
            $table->decimal("discount_price", 12, 2)->nullable();
            $table->decimal("tax_rate", 5, 2)->default(0);
            $table->integer("stock_qty")->default(0);
            $table->integer("alert_qty")->default(5);
            $table->string("unit")->default("pcs");
            $table->string("thumbnail")->nullable();
            $table->boolean("is_featured")->default(false);
            $table->enum("status", ["active", "inactive"])->default("active");
            $table->timestamps();
            $table->fullText(["name", "description"]);
        });
    }
    public function down(): void { Schema::dropIfExists("products"); }
};
