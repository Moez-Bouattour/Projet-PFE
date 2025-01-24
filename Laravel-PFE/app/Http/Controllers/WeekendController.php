<?php

namespace App\Http\Controllers;

use App\Models\Weekend;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
class WeekendController extends Controller
{
    public function modifierParametreWeekend(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'includeLundi' => 'required|boolean',
                'includeMardi' => 'required|boolean',
                'includeMercredi' => 'required|boolean',
                'includeJeudi' => 'required|boolean',
                'includeVendredi' => 'required|boolean',
                'includeSamedi' => 'required|boolean',
                'includeDimanche' => 'required|boolean',
            ]);

            $parametresWeekend = [
                'include_lundi' => $validatedData['includeLundi'],
                'include_mardi' => $validatedData['includeMardi'],
                'include_mercredi' => $validatedData['includeMercredi'],
                'include_jeudi' => $validatedData['includeJeudi'],
                'include_vendredi' => $validatedData['includeVendredi'],
                'include_samedi' => $validatedData['includeSamedi'],
                'include_dimanche' => $validatedData['includeDimanche'],
            ];
            Weekend::updateOrCreate([], $parametresWeekend);

            return response()->json(['message' => 'Paramètres du week-end mis à jour avec succès'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getWeekendById($id)
    {
        try {
            $weekend= Weekend::findOrFail($id);
            return response()->json(['message' => "Weekend", 'data' => $weekend, 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
}
