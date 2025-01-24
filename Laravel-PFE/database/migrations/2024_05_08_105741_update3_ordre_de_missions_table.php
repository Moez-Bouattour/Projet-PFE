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
        Schema::table('ordre_de_missions', function (Blueprint $table) {
            $table->unsignedBigInteger('id_ville')->nullable();
            $table->foreign('id_ville')->references('id')->on('villes')->onDelete('cascade');
            $table->unsignedBigInteger('id_ville_destination')->nullable();
            $table->foreign('id_ville_destination')->references('id')->on('villes')->onDelete('cascade');
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
