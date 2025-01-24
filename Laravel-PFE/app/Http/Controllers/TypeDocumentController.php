<?php

namespace App\Http\Controllers;

use App\Models\Etat;
use App\Models\Niveau;
use App\Models\TypeDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class TypeDocumentController extends Controller
{
    public function getTypeDocuments()
    {
        try {
            return response()->json(TypeDocument::all(), 200);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }

    }

    public function getTypeDocumentById($id)
    {
        try {
            $typeDocument = TypeDocument::findOrFail($id);
            return response()->json(['message' => "type document", 'data' => $typeDocument, 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    public function addTypeDocument(Request $request)
{
    try {
        $validator = Validator::make($request->all(), [
            'type_doc' => 'required|string|in:congé,autorisation,déplacement',
            'description' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()], Response::HTTP_BAD_REQUEST);
        }

        $data = $validator->validated();

        $typeDocumentData = TypeDocument::create([
            'type_doc' => $data['type_doc'],
            'description' => $data['description'],
        ]);

        $niveaux = ['Employé', 'Chef de projet', 'RH'];
        foreach ($niveaux as $niveau) {
            $niveauData = Niveau::create([
                'Nom_Niveau' => $niveau,
                'id_type_document' => $typeDocumentData->id,
            ]);
            Etat::create([
                'Nom_etat' => 'en attente',
                'id_niveau' => $niveauData->id,
                'validation'=>'0',
                'couleur' =>''
            ]);
        }

        return response()->json(['message' => "Type document Added", 'data' => $typeDocumentData, 'status' => 'success']);
    } catch (\Exception $e) {
        return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
    }
}

    public function updateTypeDocument($id, Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'type_doc' => 'string',
                'description' => 'string',
            ]);
            if ($validator->fails()) {
                return response()->json(['status' => 'error', 'message' => $validator->errors()], Response::HTTP_BAD_REQUEST);
            }
            $typeDocument = TypeDocument::findOrFail($id);
            $validatedData = $validator->validated();
            $typeDocument->update($validatedData);
            return response()->json(['message' => "type document modifie", 'data' => $typeDocument, 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    public function deleteTypeDocument($id)
    {
        try {

            $typeDocument = TypeDocument::findOrFail($id);

            $niveau = $typeDocument->niveau;
            if ($niveau) {
                $niveau->typeDocuments()->delete();
                $niveau->delete();
            }

            $typeDocument->delete();

            return response()->json(['message' => "Type document deleted successfully", 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }


}
