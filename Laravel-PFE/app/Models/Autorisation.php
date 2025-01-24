<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Autorisation extends Model
{
    use HasFactory;
    protected $fillable = ['id_user', 'Date_sortie', 'Heure_debut', 'Heure_fin', 'Duree','id_type_document', 'raison'];
    public function Users()
    {
        return $this->belongsTo(User::class, 'id_user');
    }

    public function historiques()
    {
        return $this->hasMany(Historique::class, 'autorisation_id');
    }

    public function TypeDocuments()
    {
        return $this->belongsTo(TypeDocument::class, 'id_type_document');
    }

}
