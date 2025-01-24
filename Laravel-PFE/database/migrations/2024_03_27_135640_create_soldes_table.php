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
        Schema::create('soldes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_user')->nullable();
            $table->foreign('id_user')->references('id')->on('users')->onDelete('cascade');
            $table->year('annee');
            $table->unsignedBigInteger('id_type_conge')->nullable();
            $table->foreign('id_type_conge')->references('id')->on('type_congés')->onDelete('cascade');
            $table->integer('solde');
            $table->integer('solde_initiale');
            $table->integer('somme_solde');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('soldes');
    }
};
