<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Historique extends Model
{
    use HasFactory;
    protected $fillable = ['id_etat', 'id_niveau', 'id_approbateur', 'note', 'date','document_type','conge_id','autorisation_id','ordre_de_mission_id'];

    public function etats()
    {
        return $this->belongsTo(Etat::class, 'id_etat');
    }
    public function niveaux()
    {
        return $this->belongsTo(Niveau::class, 'id_niveau');
    }
    public function approbateurs()
    {
        return $this->belongsTo(Approbateur::class, 'id_approbateur');
    }
    public function document()
    {
        return $this->morphTo();
    }
    public function conge()
    {
        return $this->belongsTo(Congé::class);
    }
    public function autorisation()
    {
        return $this->belongsTo(Autorisation::class);
    }
    public function ordre()
    {
        return $this->belongsTo(Ordre_de_mission::class);
    }

}
