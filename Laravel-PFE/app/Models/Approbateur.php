<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Approbateur extends Model
{
    protected $fillable = ['id_utilisateur', 'id_niveau'];
    use HasFactory;
    public function users()
    {
        return $this->belongsTo(User::class, 'id_utilisateur');
    }
    public function niveaux()
    {
        return $this->belongsTo(Niveau::class, 'id_niveau');
    }
    public function historiques()
    {
        return $this->hasMany(Historique::class, 'id_approbateur');
    }
}
