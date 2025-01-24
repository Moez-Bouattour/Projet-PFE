<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Congé extends Model
{
    use HasFactory;
    protected $fillable = ['id_user', 'date_debut_conge', 'date_fin_conge', 'id_type_conge', 'duree','id_type_document','justification_medicale'];
    public function TypeConges()
    {
        return $this->belongsTo(TypeCongé::class, 'id_type_conge');
    }

    public function Users()
    {
        return $this->belongsTo(User::class, 'id_user');
    }

    public function historiques()
    {
        return $this->hasMany(Historique::class, 'conge_id');
    }

    public function TypeDocuments()
    {
        return $this->belongsTo(TypeDocument::class, 'id_type_document');
    }

}
