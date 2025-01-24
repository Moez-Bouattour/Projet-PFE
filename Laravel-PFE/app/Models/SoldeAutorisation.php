<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SoldeAutorisation extends Model
{
    use HasFactory;
    protected $fillable = ['id_user', 'annee','mois', 'solde','autorisation_pris','duree'];

    public function Users()
    {
        return $this->hasMany(User::class, 'id_user');
    }

}
