<?php

namespace App\Http\Controllers;

use App\Models\TypeCongé;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
class TypeCongéController extends Controller
{
    public function getTypeConges()
    {
        try {
            return response()->json(TypeCongé::all(), 200);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    public function getTypeCongeById($id)
    {
        try {
            $typeCongé = TypeCongé::findOrFail($id);
            return response()->json(['message' => "Type congé", 'data' => $typeCongé, 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    public function addTypeConge(Request $request)
{
    try {
        $validator = Validator::make($request->all(), [
            'type_nom_conge' => 'required|string',
            'duree' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()], Response::HTTP_BAD_REQUEST);
        }

        $data = $validator->validated();

        $typeCongéData = TypeCongé::create([
            'type_nom_conge' => $data['type_nom_conge'],
            'duree' => $data['duree'],
        ]);

        return response()->json(['message' => "Type congé Added", 'data' =>  $typeCongéData, 'status' => 'success']);
    } catch (\Exception $e) {
        return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
    }
}


    public function updateTypeConge($id, Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'type_nom_conge' => 'string',
                'duree'=>'integer',
            ]);
            if ($validator->fails()) {
                return response()->json(['status' => 'error', 'message' => $validator->errors()], Response::HTTP_BAD_REQUEST);
            }
            $typeCongé = TypeCongé::findOrFail($id);
            $validatedData = $validator->validated();
            $typeCongé->update($validatedData);
            return response()->json(['message' => "Type congé modifie", 'data' => $typeCongé, 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    public function deleteTypeConge(Request $request, $id)
    {
        try {
            $typeCongé = TypeCongé::findOrFail($id);

            $typeCongé->delete();

            return response()->json(['message' => "Type congé supprimé avec succès", 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
}
