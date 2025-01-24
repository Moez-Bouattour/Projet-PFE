<?php

namespace App\Http\Controllers;

use App\Models\Niveau;
use App\Models\User;
use Illuminate\Http\Request;
use App\Models\Approbateur;
use App\Models\Historique;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class ApprobateurController extends Controller
{
    public function getApprobateurs()
    {
        try {
            return response()->json(Approbateur::all(), 200);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    public function getApprobateurById($id)
    {
        try {
            $approbateur = Approbateur::findOrFail($id);
            return response()->json(['message' => "approbateur", 'data' => $approbateur, 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    public function addApprobateur(Request $request)
{
    try {
        $validator = Validator::make($request->all(), [
            'id_niveau' => 'required|integer',
            'id_utilisateur' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()], Response::HTTP_BAD_REQUEST);
        }

        $data = $validator->validated();

        $approbateurData = Approbateur::create([
            'id_niveau' => $data['id_niveau'],
            'id_utilisateur' => $data['id_utilisateur'],
        ]);

        $this->updateUserRole($data['id_utilisateur']);

        Historique::where('id_niveau', $data['id_niveau'])
                  ->update(['id_approbateur' => $approbateurData->id]);

        return response()->json(['message' => "Approbateur Added", 'data' => $approbateurData, 'status' => 'success']);
    } catch (\Exception $e) {
        return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
    }
}

    public function updateUserRole($userId)
    {
        $user = User::findOrFail($userId);
        $user->role = 'approbateur';
        $user->save();

        return response()->json(['message' => 'Rôle mis à jour avec succès'], 200);
    }

    public function updateApprobateur($id, Request $request)
    {
        try {
            $validator = Validator::make($request->all(), []);
            if ($validator->fails()) {
                return response()->json(['status' => 'error', 'message' => $validator->errors()], Response::HTTP_BAD_REQUEST);
            }
            $approbateur = Approbateur::findOrFail($id);
            $validatedData = $validator->validated();
            $approbateur->update($validatedData);
            return response()->json(['message' => "Approbateur modifie", 'data' => $approbateur, 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    public function deleteApprobateur(Request $request, $id)
    {
        try {
            $approbateur = Approbateur::findOrFail($id);
            $user = User::where('id', $approbateur->id_utilisateur)->first();
            $historiques = Historique::where('id_approbateur', $approbateur->id)->get();

            foreach ($historiques as $historique) {
                $historique->id_approbateur = null;
                $historique->save();
            }

            $user->role = null;
            $user->save();
            $approbateur->delete();

            return response()->json(['message' => "Approbateur supprimé avec succès", 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }


    public function getApprobateursByNiveau($id)
    {
        try {
            $niveau = Niveau::findOrFail($id);
            $approbateurs = $niveau->approbateurs()->get();
            return response()->json(['message' => 'Approbateurs associés au niveau', 'data' => $approbateurs, 'status' => 'success']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['status' => 'error', 'message' => 'Niveau non trouvé.'], Response::HTTP_NOT_FOUND);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => 'Une erreur est survenue lors de la récupération des approbateurs associés au niveau.'], Response::HTTP_BAD_REQUEST);
        }
    }
}
