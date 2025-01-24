<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ville extends Model
{
    use HasFactory;
    protected $fillable = ['nom_ville','codePostal'];
    public function OrdreDeMissions()
    {
        return $this->belongsTo(Ordre_de_mission::class, 'id_ville');
    }
    public function OrdreDeMissionsDestination()
    {
        return $this->belongsTo(Ordre_de_mission::class, 'id_ville_destination');
    }
}
