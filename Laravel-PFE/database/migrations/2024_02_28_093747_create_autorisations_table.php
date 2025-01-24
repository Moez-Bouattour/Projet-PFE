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
        Schema::create('autorisations', function (Blueprint $table) {
            $table->id();
            $table->string('Nom_utilisateur');
            $table->date('Date_sortie');
            $table->time('Heure_debut');
            $table->time('Heure_fin');
            $table->integer('Duree')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('autorisations');
    }
};
