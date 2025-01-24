<?php

namespace App\Http\Controllers;

use App\Models\Ville;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
class VilleController extends Controller
{
    public function getVilles()
    {
        try {
            return response()->json(Ville::all(), 200);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    public function getVilleById($id)
    {
        try {
            $ville = ville::findOrFail($id);
            return response()->json(['message' => "ville", 'data' => $ville, 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    public function addVille(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'nom_ville' => 'required|string',
                'codePostal' =>'required|integer'
            ]);
            if ($validator->fails()) {
                return response()->json(['status' => 'error', 'message' => $validator->errors()], Response::HTTP_BAD_REQUEST);
            }

            $data = $validator->validated();
            $villeData = Ville::create([
                'nom_ville' => $data['nom_ville'],
                'codePostal' => $data['codePostal']
            ]);

            return response()->json(['message' => "ville Added", 'data' => $villeData, 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    public function updateVille($id, Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'nom_ville' => 'string',
                'codePostal'=>'integer'
            ]);
            if ($validator->fails()) {
                return response()->json(['status' => 'error', 'message' => $validator->errors()], Response::HTTP_BAD_REQUEST);
            }
            $ville = Ville::findOrFail($id);
            $validatedData = $validator->validated();
            $ville->update($validatedData);
            return response()->json(['message' => "ville modifie", 'data' => $ville, 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    public function deleteVille(Request $request, $id)
    {
        try {
            $ville = Ville::findOrFail($id);

            $ville->delete();

            return response()->json(['message' => "Ville supprimé avec succès", 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
}
