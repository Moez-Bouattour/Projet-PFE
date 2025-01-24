<?php

namespace App\Http\Controllers;

use App\Models\Repas;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
class RepasController extends Controller
{
    public function modifierParametreRepas(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'heure_debut' => 'required|date_format:H:i',
                'heure_fin' => 'required|date_format:H:i',
            ]);

            $heureDebut = Carbon::createFromFormat('H:i', $validatedData['heure_debut']);
            $heureFin = Carbon::createFromFormat('H:i', $validatedData['heure_fin']);

            Repas::updateOrCreate([], [
                'heure_debut' => $heureDebut,
                'heure_fin' =>  $heureFin,
            ]);

            return response()->json(['message' => 'Paramètres du repas mis à jour avec succès'], 200);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getRepasById($id)
    {
        try {
            $repas= Repas::findOrFail($id);
            return response()->json(['message' => "Weekend", 'data' => $repas, 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
}
