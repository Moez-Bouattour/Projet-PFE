<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Voiture extends Model
{
    use HasFactory;
    protected $fillable = ['nom_voiture', 'compteur_initiale','immatricule','compteur_finale'];
    public function OrdreDeMissions()
    {
        return $this->belongsTo(Ordre_de_mission::class, 'id_voiture');
    }
}
