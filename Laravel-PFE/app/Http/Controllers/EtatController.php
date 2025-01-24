<?php

namespace App\Http\Controllers;

use App\Models\Etat;
use App\Models\Niveau;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;
use Carbon\Carbon;
use App\Models\Historique;

class EtatController extends Controller
{
    public function getEtats()
    {
        try {
            return response()->json(Etat::all(), 200);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    public function getEtatById($id)
    {
        try {
            $etat = Etat::findOrFail($id);
            return response()->json(['message' => "etat", 'data' => $etat, 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    public function addEtat(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'Nom_etat' => 'required|string',
                'id_niveau' => 'required|integer',
                'validation'=>'boolean',
                'couleur' =>'string',
            ]);

            if ($validator->fails()) {
                return response()->json(['status' => 'error', 'message' => $validator->errors()], Response::HTTP_BAD_REQUEST);
            }

            $data = $validator->validated();
            $etatData = Etat::create([
                'Nom_etat' => $data['Nom_etat'],
                'id_niveau' => $data['id_niveau'],
                'validation'=>$data['validation'],
                'couleur'=>$data['couleur'],
            ]);


            return response()->json(['message' => "etat Added", 'data' => $etatData, 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    public function updateEtat($id, Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'Nom_etat' => 'string',
                'validation'=>'boolean',
                'couleur' =>'string',
            ]);
            if ($validator->fails()) {
                return response()->json(['status' => 'error', 'message' => $validator->errors()], Response::HTTP_BAD_REQUEST);
            }
            $etat = Etat::findOrFail($id);
            $validatedData = $validator->validated();
            $etat->update($validatedData);
            return response()->json(['message' => "etat modifie", 'data' => $etat, 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    public function deleteEtat(Request $request, $id)
    {
        try {
            $etat = Etat::findOrFail($id);

            $etat->delete();

            return response()->json(['message' => "Etat supprimé avec succès", 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    public function getEtatsByNiveau($id)
    {
        try {
            $niveau = Niveau::findOrFail($id);
            $etats = $niveau->etats()->get();
            return response()->json(['message' => 'États associés au niveau', 'data' => $etats, 'status' => 'success']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['status' => 'error', 'message' => 'Niveau non trouvé.'], Response::HTTP_NOT_FOUND);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => 'Une erreur est survenue lors de la récupération des états associés au niveau.'], Response::HTTP_BAD_REQUEST);
        }
    }
}
