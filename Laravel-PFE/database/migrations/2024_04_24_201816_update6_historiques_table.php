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
        Schema::table('historiques', function (Blueprint $table) {
            $table->unsignedBigInteger('conge_id')->nullable();
            $table->foreign('conge_id')
                ->references('id')
                ->on('congés')
                ->onDelete('cascade');

            $table->unsignedBigInteger('autorisation_id')->nullable();
            $table->foreign('autorisation_id')
                ->references('id')
                ->on('autorisations')
                ->onDelete('cascade');

            $table->unsignedBigInteger('ordre_de_mission_id')->nullable();
            $table->foreign('ordre_de_mission_id')
                ->references('id')
                ->on('ordre_de_missions')
                ->onDelete('cascade');
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
