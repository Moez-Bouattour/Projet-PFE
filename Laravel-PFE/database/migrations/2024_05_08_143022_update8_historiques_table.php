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
            $table->dropConstrainedForeignId('id_type_document');
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
