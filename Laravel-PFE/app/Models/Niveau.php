<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Niveau extends Model
{
    use HasFactory;
    protected $fillable = ['Nom_Niveau', 'Nom_responsable', 'id_type_document'];
    public function typeDocuments()
    {
        return $this->belongsTo(TypeDocument::class, 'id_type_document');
    }
    public function etats()
    {
        return $this->hasMany(Etat::class, 'id_niveau');
    }
    public function approbateurs()
    {
        return $this->hasMany(Approbateur::class, 'id_niveau');
    }
    public function historiques()
    {
        return $this->hasMany(Historique::class, 'id_niveau');
    }
    public function conges()
    {
        return $this->hasMany(Congé::class, 'id_niveau');
    }
}
