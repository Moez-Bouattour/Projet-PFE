<?php

namespace App\Models;

use App\Http\Controllers\CongéController;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TypeDocument extends Model
{
    use HasFactory;
    protected $fillable = ['type_doc','description'];
    public function niveaux()
    {
        return $this->hasMany(Niveau::class, 'id_type_document');
    }
    public function historiques()
    {
        return $this->hasMany(Historique::class, 'id_type_document');
    }
    public function congés()
    {
        return $this->hasMany(Congé::class, 'id_type_document');
    }

}
