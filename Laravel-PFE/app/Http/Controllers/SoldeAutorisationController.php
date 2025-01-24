<?php

namespace App\Http\Controllers;

use App\Models\SoldeAutorisation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;
class SoldeAutorisationController extends Controller
{


    public function getSoldesAutorisation()
    {
        try {
            return response()->json(SoldeAutorisation::all(), 200);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    public function addSoldeAutorisation(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'id_user' => 'required|integer',
                'solde'=>'required|integer',
                'mois'=>'integer',
                'autorisation_pris'=>'integer'
            ]);

            if ($validator->fails()) {
                return response()->json(['status' => 'error', 'message' => $validator->errors()], Response::HTTP_BAD_REQUEST);
            }

            $data = $validator->validated();

                $soldeData = SoldeAutorisation::create([
                    'annee' => date('Y'),
                    'id_user' => $data['id_user'],
                    'mois' =>$data['mois'],
                    'solde' => $data['solde'],
                    'autorisation_pris'=>$data['autorisation_pris'],
                    'duree'=> 7*60,
                ]);
                return response()->json(['message' => "solde autorisation ajoutée", 'data' => $soldeData, 'status' => 'success']);



        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
}
