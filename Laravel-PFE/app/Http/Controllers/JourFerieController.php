<?php

namespace App\Http\Controllers;

use App\Models\JourFerie;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;
class JourFerieController extends Controller
{
    public function getJoursFeries()
    {
        try {
            return response()->json(JourFerie::all(), 200);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    public function getJourFerieById($id)
    {
        try {
            $jourFerie = JourFerie::findOrFail($id);
            return response()->json(['message' => "jour Ferie", 'data' => $jourFerie, 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    public function addJourFerie(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'date' => 'required|date',
                'evenement' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json(['status' => 'error', 'message' => $validator->errors()], Response::HTTP_BAD_REQUEST);
            }

            $data = $validator->validated();
            $date = Carbon::parse($data['date']);
            $dateMySQL = $date->toDateString();
            $evenement = $data['evenement'];

            $jourFerieData = JourFerie::create([
                'date' => $dateMySQL,
                'evenement' => $evenement,
            ]);

            return response()->json(['message' => "jour Ferie Added", 'data' => $jourFerieData, 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    public function updateJourFerie($id, Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'date' => 'date',
                'evenement'=>'string',
            ]);
            if ($validator->fails()) {
                return response()->json(['status' => 'error', 'message' => $validator->errors()], Response::HTTP_BAD_REQUEST);
            }
            $jourFerie = JourFerie::findOrFail($id);
            $date = Carbon::parse($request->input('date'));
            $currentDate = Carbon::now();
            $validatedData = $validator->validated();
            $jourFerie->update($validatedData);
            return response()->json(['message' => "jour Ferie modifie", 'data' => $jourFerie, 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    public function deleteJourFerie(Request $request, $id)
    {
        try {
            $jourFerie = JourFerie::findOrFail($id);

            $jourFerie->delete();

            return response()->json(['message' => "jour Ferie supprimé avec succès", 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
}
