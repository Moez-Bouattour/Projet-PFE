<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('weekends', function (Blueprint $table) {
            $table->boolean('include_lundi')->default(false);
            $table->boolean('include_mardi')->default(false);
            $table->boolean('include_mercredi')->default(false);
            $table->boolean('include_jeudi')->default(false);
            $table->boolean('include_vendredi')->default(false);
            $table->boolean('include_samedi')->default(false);
            $table->boolean('include_dimanche')->default(false);

            $table->dropColumn('include_saturday');
            $table->dropColumn('include_sunday');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
