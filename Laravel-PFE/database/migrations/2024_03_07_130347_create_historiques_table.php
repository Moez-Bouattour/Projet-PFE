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
        Schema::create('historiques', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_type_document')->nullable();
            $table->foreign('id_type_document')->references('id')->on('type_documents')->onDelete('cascade');
            $table->unsignedBigInteger('id_niveau')->nullable();
            $table->foreign('id_niveau')->references('id')->on('niveaux')->onDelete('cascade');
            $table->unsignedBigInteger('id_etat')->nullable();
            $table->foreign('id_etat')->references('id')->on('etats')->onDelete('cascade');
            $table->unsignedBigInteger('id_approbateur')->nullable();
            $table->foreign('id_approbateur')->references('id')->on('approbateurs')->onDelete('cascade');
            $table->string('note');
            $table->date('date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('historiques');
    }
};
