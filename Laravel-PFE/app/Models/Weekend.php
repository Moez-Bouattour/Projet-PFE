<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Weekend extends Model
{
    use HasFactory;
    protected $fillable = ['include_lundi','include_mardi','include_mercredi','include_jeudi','include_vendredi',
    'include_samedi','include_dimanche'
];
}

