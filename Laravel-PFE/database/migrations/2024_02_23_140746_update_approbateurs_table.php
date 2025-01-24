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
        Schema::table('approbateurs', function (Blueprint $table) {
            $table->unsignedBigInteger('id_niveau')->nullable();
            $table->foreign('id_niveau')->references('id')->on('niveaux')->onDelete('cascade');
            $table->unsignedBigInteger('id_utilisateur')->nullable();
            $table->foreign('id_utilisateur')->references('id')->on('users')->onDelete('cascade');
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
