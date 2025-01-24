<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TypeCongé extends Model
{
    use HasFactory;
    protected $fillable = ['type_nom_conge','duree'];
    public function conges()
    {
        return $this->belongsTo(Congé::class, 'id_type_conge');
    }


}
