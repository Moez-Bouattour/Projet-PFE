<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Etat extends Model
{
    use HasFactory;
    protected $fillable = ['Nom_etat', 'id_niveau','validation','couleur'];
    public function niveaux()
    {
        return $this->belongsTo(Niveau::class, 'id_niveau');
    }
    public function historiques()
    {
        return $this->hasMany(Historique::class, 'id_etat');
    }
    public function conges()
    {
        return $this->hasMany(Congé::class, 'id_etat');
    }
}
