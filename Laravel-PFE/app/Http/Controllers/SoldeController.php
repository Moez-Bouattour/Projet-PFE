<?php

namespace App\Http\Controllers;

use App\Models\Solde;
use App\Models\TypeCongé;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;
class SoldeController extends Controller
{
    public function getSoldes()
    {
        try {
            return response()->json(Solde::all(), 200);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    public function addSolde(Request $request)
{
    try {
        $validator = Validator::make($request->all(), [
            'annee' => 'required|integer',
            'id_user' => 'required|integer',
            'cloture'=>'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()], Response::HTTP_BAD_REQUEST);
        }

        $data = $validator->validated();
        $user = User::findOrFail($data['id_user']);
        $typeConges = TypeCongé::where('type_nom_conge', 'annuel')
                    ->orWhere('type_nom_conge', 'maladie');
        if ($user->sexe === 'femme' && $user->situation === 'mariée') {
                $typeConges->orWhere('type_nom_conge', 'maternité');

        } elseif ($user->sexe === 'homme' && $user->situation === 'marié') {
            $typeConges->orWhere('type_nom_conge', 'paternité');

        }
        $typeConges = $typeConges->get();
        foreach ($typeConges as $typeConge) {
            $soldePrecedent = Solde::where('id_user', $data['id_user'])
            ->where('annee', $data['annee'] - 1)
            ->where('id_type_conge', $typeConge->id)
            ->first();
            $soldeInitial = ($soldePrecedent) ? $soldePrecedent->solde : 0;
            if ($typeConge->type_nom_conge === 'paternité' || $typeConge->type_nom_conge === 'maternité') {
                $soldeInitial = 0;
            }
            $soldeData = Solde::create([
                'annee' => $data['annee'],
                'id_user' => $data['id_user'],
                'id_type_conge' => $typeConge->id,
                'solde' => $soldeInitial + $typeConge->duree,
                'solde_initiale'=> $soldeInitial,
                'duree'=> $typeConge->duree,
                'cloture' => $data['cloture'],
            ]);

        }

        return response()->json(['message' => "Année ajoutée", 'data' => $soldeData, 'status' => 'success']);
    } catch (\Exception $e) {
        return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
    }
}
public function updateAnnee(Request $request)
{
    try {
        $validator = Validator::make($request->all(), [
            'id_user' => 'required|integer',
            'annee' => 'required|integer',
            'cloture' => 'required|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()], Response::HTTP_BAD_REQUEST);
        }

        $data = $validator->validated();
        $user = User::findOrFail($data['id_user']);
        $typeConges = TypeCongé::where('type_nom_conge', 'annuel')
                    ->orWhere('type_nom_conge', 'maladie');
        if ($user->sexe === 'femme' && $user->situation === 'mariée') {
            $typeConges->orWhere('type_nom_conge', 'maternité');
        } elseif ($user->sexe === 'homme' && $user->situation === 'marié') {
            $typeConges->orWhere('type_nom_conge', 'paternité');
        }
        $typeConges = $typeConges->get();

        foreach ($typeConges as $typeConge) {
            if ($data['cloture']) {
                $soldePrecedent = Solde::where('id_user', $data['id_user'])
                    ->where('annee', $data['annee'])
                    ->where('id_type_conge', $typeConge->id)
                    ->first();
                    $congePris = 0;
                    $nouveauSolde = new Solde();
                    $nouveauSolde->id_user = $data['id_user'];
                    $nouveauSolde->annee =  $data['annee']+1;
                    $nouveauSolde->id_type_conge = $typeConge->id;
                    $nouveauSolde->solde = $soldePrecedent->solde + $typeConge->duree;
                    $nouveauSolde->solde_initiale = $soldePrecedent->solde;
                    $nouveauSolde->conge_pris = $congePris;
                    $nouveauSolde->duree = $typeConge->duree;
                    $nouveauSolde->cloture = 0;
                    $nouveauSolde->save();

            }
        }

        $soldes = Solde::where('id_user', $data['id_user'])
                        ->where('annee', $data['annee'])
                        ->get();

        foreach ($soldes as $solde) {
            $solde->cloture = $data['cloture'];
            $solde->save();
        }

        return response()->json(['message' => "Clôture mise à jour avec succès pour l'année spécifiée", 'data' => $soldes, 'status' => 'success']);
    } catch (\Exception $e) {
        return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
    }
}

public function addType(Request $request)
{
    try {
        $validator = Validator::make($request->all(), [
            'annee' => 'integer',
            'id_user' => 'integer',
            'id_type_conge'=>'integer',
            'solde'=>'integer',
            'solde_initiale'=>'integer',
            'conge_requis'=>'integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()], Response::HTTP_BAD_REQUEST);
        }

        $data = $validator->validated();
        $existingSolde = Solde::where('id_user', $data['id_user'])
            ->where('annee', $data['annee'])
            ->where('id_type_conge', $data['id_type_conge'])
            ->exists();

        if ($existingSolde) {
            return response()->json(['status' => 'error', 'message' => 'Ce type de congé existe déjà pour cet utilisateur et cette année.'], Response::HTTP_BAD_REQUEST);
        }
        $typeConge = TypeCongé::where('id',$data['id_type_conge'])->first();
        $soldePrecedent = Solde::where('id_user', $data['id_user'])
        ->where('annee', $data['annee'])
        ->first();
        $soldeData = Solde::create([
            'annee' => $data['annee'],
            'id_user' => $data['id_user'],
            'id_type_conge' => $data['id_type_conge'],
            'solde' => $data['solde'],
            'solde_initiale'=> $data['solde_initiale'],
            'duree'=> $typeConge->duree,
            'cloture' => $soldePrecedent->cloture,
            'conge_requis'=>$data['conge_requis']
            ]);

        return response()->json(['message' => "Type ajouté", 'data' => $soldeData, 'status' => 'success']);
    } catch (\Exception $e) {
        return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
    }
}
public function updateSolde($id, Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'solde' => 'integer',
                'solde_initiale' => 'integer',
                'conge_pris' => 'integer',
                'duree' => 'integer'
            ]);

            if ($validator->fails()) {
                return response()->json(['status' => 'error', 'message' => $validator->errors()], Response::HTTP_BAD_REQUEST);
            }
            $data = $validator->validated();
            $solde = Solde::findOrFail($id);
            $solde->update($data);

            return response()->json(['message' => "ordre_de_mission modifiee", 'data' => $solde, 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }


}
