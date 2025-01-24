<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Solde extends Model
{
    use HasFactory;
    protected $fillable = ['id_user', 'annee','id_type_conge', 'solde', 'solde_initiale','duree','cloture','conge_pris'];

    public function Users()
    {
        return $this->hasMany(User::class, 'id_user');
    }

    public function TypeConge()
    {
        return $this->belongsTo(TypeCongé::class, 'id_type_conge');
    }


}
