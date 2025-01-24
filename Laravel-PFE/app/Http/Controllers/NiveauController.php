<?php

namespace App\Http\Controllers;

use App\Models\Etat;
use App\Models\Niveau;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;
use Carbon\Carbon;
use App\Models\TypeDocument;
use App\Models\Historique;

class NiveauController extends Controller
{
    public function getNiveaux()
    {
        try {
            return response()->json(Niveau::all(), 200);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    public function getNiveauById($id)
    {
        try {
            $niveau = Niveau::findOrFail($id);
            return response()->json(['message' => "niveau", 'data' => $niveau, 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    public function addNiveau(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'Nom_Niveau' => 'required|string',
                'Nom_responsable' => 'required|string',
                'id_type_document' => 'required|integer',
            ]);

            if ($validator->fails()) {
                return response()->json(['status' => 'error', 'message' => $validator->errors()], Response::HTTP_BAD_REQUEST);
            }

            $data = $validator->validated();
            $typeDocumentData = TypeDocument::findOrFail($data['id_type_document']);

            $niveauData = Niveau::create([
                'Nom_Niveau' => $data['Nom_Niveau'],
                'Nom_responsable' => $data['Nom_responsable'],
                'id_type_document' => $data['id_type_document'],
            ]);
            $etat = Etat::create([
                'Nom_etat' => 'en attente',
                'id_niveau' => $niveauData->id,
            ]);
            

            return response()->json(['message' => "niveau Added", 'data' => $niveauData, 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    public function updateNiveau($id, Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'Nom_Niveau' => 'string',
                'Nom_responsable' => 'string',
            ]);
            if ($validator->fails()) {
                return response()->json(['status' => 'error', 'message' => $validator->errors()], Response::HTTP_BAD_REQUEST);
            }
            $niveau = Niveau::findOrFail($id);
            $validatedData = $validator->validated();
            $niveau->update($validatedData);
            return response()->json(['message' => "niveau modifie", 'data' => $niveau, 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    public function deleteNiveau(Request $request, $id)
    {
        try {
            $niveau = Niveau::findOrFail($id);

            $niveau->delete();

            return response()->json(['message' => "Niveau supprimé avec succès", 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    public function getNiveauxByTypeDocument($id)
    {
        try {
            $typeDocument = TypeDocument::findOrFail($id);
            $niveaux = $typeDocument->niveaux()->get();
            return response()->json(['message' => 'Niveaux associés au type de document', 'data' => $niveaux, 'status' => 'success']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['status' => 'error', 'message' => 'Type de document non trouvé.'], Response::HTTP_NOT_FOUND);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => 'Une erreur est survenue lors de la récupération des niveaux associés au type de document.'], Response::HTTP_BAD_REQUEST);
        }
    }
}
