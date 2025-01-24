<?php

namespace App\Http\Controllers;

use App\Models\Historique;
use Symfony\Component\HttpFoundation\Response;

class HistoriqueController extends Controller
{
    public function getHistoriques()
    {
    try {
        $historiques = Historique::with('niveaux', 'etats', 'approbateurs')->get();
        return response()->json($historiques, 200);
    } catch (\Exception $e) {
        return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
    }
    }

}
