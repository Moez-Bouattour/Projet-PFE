<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ordre_de_mission extends Model
{
    use HasFactory;
    protected $fillable = ['id_user', 'id_voiture', 'Date_sortie', 'Date_retour', 'id_ville', 'id_ville_destination', 'id_type_document','compteur_initiale','compteur_finale'];
    public function voiture()
    {
        return $this->belongsTo(Voiture::class, 'id_voiture');
    }

    public function ville()
    {
        return $this->belongsTo(Ville::class, 'id_ville');
    }


    public function villesDestination()
    {
        return $this->belongsTo(Ville::class, 'id_ville_destination');
    }
    public function Users()
    {
        return $this->belongsTo(User::class, 'id_user');
    }

    public function historiques()
    {
        return $this->hasMany(Historique::class, 'ordre_de_mission_id');
    }

    public function TypeDocuments()
    {
        return $this->belongsTo(TypeDocument::class, 'id_type_document');
    }
}
