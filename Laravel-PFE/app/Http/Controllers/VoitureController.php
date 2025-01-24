<?php

namespace App\Http\Controllers;

use App\Models\Voiture;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VoitureController extends Controller
{
    public function getVoitures()
    {
        try {
            return response()->json(Voiture::all(), 200);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    public function getVoitureById($id)
    {
        try {
            $voiture = Voiture::findOrFail($id);
            return response()->json(['message' => "voiture", 'data' => $voiture, 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    public function addVoiture(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'nom_voiture' => 'required|string',
                'compteur_initiale' => 'required|integer',
                'immatricule'=>'required|string',
                'compteur_finale'=>'required|integer',
            ]);
            if ($validator->fails()) {
                return response()->json(['status' => 'error', 'message' => $validator->errors()], Response::HTTP_BAD_REQUEST);
            }

            $data = $validator->validated();
            $voitureData = Voiture::create([
                'nom_voiture' => $data['nom_voiture'],
                'compteur_initiale' => $data['compteur_initiale'],
                'immatricule' => $data['immatricule'],
                'compteur_finale' => $data['compteur_finale'],
            ]);


            return response()->json(['message' => "voiture Added", 'data' => $voitureData, 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    public function updateVoiture($id, Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'nom_voiture' => 'string',
                'compteur_initiale'=>'integer',
                'immatricule'=>'string',
                'compteur_finale'=>'integer'
            ]);
            if ($validator->fails()) {
                return response()->json(['status' => 'error', 'message' => $validator->errors()], Response::HTTP_BAD_REQUEST);
            }
            $voiture = Voiture::findOrFail($id);
            $validatedData = $validator->validated();
            $voiture->update($validatedData);
            return response()->json(['message' => "voiture modifie", 'data' => $voiture, 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    public function deleteVoiture(Request $request, $id)
    {
        try {
            $voiture = Voiture::findOrFail($id);

            $voiture->delete();

            return response()->json(['message' => "Voiture supprimé avec succès", 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

}
