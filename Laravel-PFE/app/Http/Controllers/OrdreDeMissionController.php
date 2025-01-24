<?php

namespace App\Http\Controllers;

use App\Mail\OrdreAccepteMail;
use App\Mail\OrdreRefusMail;
use App\Models\Approbateur;
use App\Models\Ordre_de_mission;
use App\Models\TypeDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;
use Carbon\Carbon;
use App\Models\Niveau;
use App\Models\Etat;
use App\Models\User;
use App\Models\Historique;
use App\Models\JourFerie;
use App\Models\Ville;
use App\Models\Voiture;
use DateTime;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;

class OrdreDeMissionController extends Controller
{
    public function getOrdreDeMissions()
    {
        try {
            $typeDocument = TypeDocument::where('type_doc', 'déplacement')->firstOrFail();
            $id_type_document = $typeDocument->id;
            $jours_feries = JourFerie::all();
            $ordres = Ordre_de_mission::with(['Users', 'historiques', 'historiques.niveaux', 'historiques.etats', 'ville', 'voiture', 'villesDestination'])
                ->orderBy('created_at', 'desc')
                ->get();

            $villes = Ville::all();
            $voitures = Voiture::all();

            $ordres->transform(function ($ordre) use ($villes, $voitures) {
                $historiques = $ordre->historiques->map(function ($historique) {
                    $historique->Nom_Niveau = $historique->niveaux ? $historique->niveaux->Nom_Niveau : null;
                    $historique->Nom_etat = $historique->etats ? $historique->etats->Nom_etat : null;
                    $approbateur = Approbateur::find($historique->id_approbateur);
                    $historique->id_user_approbateur = $approbateur ? $approbateur->id_utilisateur : null;
                    return $historique;
                });

                $lastHistorique = $ordre->historiques->sortByDesc('updated_at')->first();
                if ($lastHistorique) {
                    $lastHistorique->Nom_Niveau = $lastHistorique->niveaux ? $lastHistorique->niveaux->Nom_Niveau : null;
                    $lastHistorique->Nom_etat = $lastHistorique->etats ? $lastHistorique->etats->Nom_etat : null;
                    $approbateur = Approbateur::find($lastHistorique->id_approbateur);
                    $lastHistorique->id_user_approbateur = $approbateur ? $approbateur->id_utilisateur : null;
                }

                $ordre->historiques = $historiques;
                $ordre->lastHistorique = $lastHistorique;

                $ordre->nom_voiture = $voitures->firstWhere('id', $ordre->id_voiture)->nom_voiture ?? null;
                $ordre->nom_ville = $villes->firstWhere('id', $ordre->id_ville)->nom_ville ?? null;
                $villeDestination = null;
                if ($ordre->id_ville_destination) {
                    $villeDestination = $villes->firstWhere('id', $ordre->id_ville_destination);
                }
                $ordre->nom_ville_destination = $villeDestination ? $villeDestination->nom_ville : null;

                return $ordre;
            });


            $response = [
                'ordres' => $ordres,
                'jour_feries' => $jours_feries,
                'id_type_document' => $id_type_document,
                'villes' => $villes,
                'voitures' => $voitures,
            ];

            return response()->json($response, 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['status' => 'error', 'message' => 'Ordre de mission non trouvé.'], Response::HTTP_NOT_FOUND);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }



    public function getOrdreDeMissionById($id)
    {
        try {
            $ordre = Ordre_de_mission::with(['voiture', 'ville', 'villesDestination', 'historiques.niveaux', 'historiques.etats'])->findOrFail($id);
            $typeDocument = TypeDocument::where('type_doc', 'déplacement')->firstOrFail();
            $id_type_document = $typeDocument->id;
            $niveaux = Niveau::where('id_type_document', $id_type_document)->get();
            $ordre->historiques->transform(function ($historique) {
                $approbateur = Approbateur::findOrFail($historique->id_approbateur);
                $historique->id_user_approbateur = $approbateur->id_utilisateur;
                $etats = Etat::where('id_niveau', $historique->id_niveau)->get();
                $etatsWithNames = [];
                foreach ($etats as $etat) {
                    $etatsWithNames[] = ['id' => $etat->id, 'nom_etat' => $etat->Nom_etat];
                }
                $historique->Nom_etats = $etatsWithNames;

                return $historique;
            });
            $ordre->historiques = $ordre->historiques->sortByDesc('updated_at');
            $latestHistorique = $ordre->historiques->first();
            if ($latestHistorique) {
                $ordre->dernier_nom_niveau = $latestHistorique->niveaux->Nom_Niveau ?? null;
                $ordre->dernier_nom_etat = $latestHistorique->etats->Nom_etat ?? null;
            }
            return response()->json([
                'message' => "Ordre de mission trouvé",
                'data' => $ordre,
                'niveaux' => $niveaux,
                'status' => 'success'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['status' => 'error', 'message' => 'Ordre de mission non trouvé.'], Response::HTTP_NOT_FOUND);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    public function addOrdreDeMission(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'id_user' => 'required',
                'id_voiture' => 'required|integer',
                'Date_sortie' => 'required|date',
                'Date_retour' => 'required|date',
                'id_ville' => 'required|integer',
                'id_ville_destination' => 'required|integer',
                'compteur_finale'=>'required|integer'
            ]);

            if ($validator->fails()) {
                return response()->json(['status' => 'error', 'message' => $validator->errors()], Response::HTTP_BAD_REQUEST);
            }

            $data = $validator->validated();

            $dateSortie = Carbon::parse($data['Date_sortie']);
            $dateRetour = Carbon::parse($data['Date_retour']);

            if ($dateSortie->gt($dateRetour)) {
                return response()->json(['status' => 'error', 'message' => 'La date de retour ne peut pas être antérieure à la date de sortie .'], Response::HTTP_BAD_REQUEST);
            }
            $voiture = Voiture::where('id', $data['id_voiture'])->firstOrFail();
            $compteurFinal = $request->input('compteur_finale');
            $compteurInitiale=$voiture->compteur_initiale;
            if ($compteurFinal < $compteurInitiale) {
                return response()->json(['status' => 'error', 'message' => 'Le compteur final doit être supérieur au compteur initial de la voiture.'], Response::HTTP_BAD_REQUEST);
            }


            $OrdreChevauchant = Ordre_de_mission::where('id_user', $data['id_user'])
            ->where(function ($query) use ($data) {
                $query->whereBetween('Date_sortie', [$data['Date_sortie'], $data['Date_retour']])
                    ->orWhereBetween('Date_retour', [$data['Date_sortie'], $data['Date_retour']]);
            })
            ->exists();

            if ($OrdreChevauchant) {
                return response()->json(['status' => 'error', 'message' => 'Il existe une demande d’autorisation chevauchant avec cette demande .'], Response::HTTP_BAD_REQUEST);
            }

            $dateSortieMySQL = $dateSortie->format('Y-m-d');
            $dateRetourMySQL = $dateRetour->format('Y-m-d');
            $user = User::findOrFail($data['id_user']);
            $TypeDocument = TypeDocument::where('type_doc', 'déplacement')->firstOrFail();
            $ordreDeMissionData = Ordre_de_mission::create([
                'id_user' => $data['id_user'],
                'Date_sortie' => $dateSortieMySQL,
                'Date_retour' => $dateRetourMySQL,
                'id_voiture' => $data['id_voiture'],
                'id_ville' => $data['id_ville'],
                'id_ville_destination' => $data['id_ville_destination'],
                'id_type_document' => $TypeDocument->id,
                'compteur_initiale'=>$compteurInitiale,
                'compteur_finale'=>$data['compteur_finale']
            ]);

            $ordre = Ordre_de_mission::findOrFail($ordreDeMissionData->id);
            $posteUtilisateur = $user->poste;
            $niveauEmploye = Niveau::where('id_type_document', $TypeDocument->id)
                ->where('Nom_Niveau', $posteUtilisateur)
                ->firstOrFail();
            $idNiveauEmploye = $niveauEmploye->id;
            $etatEmploye = Etat::where('id_niveau', $idNiveauEmploye)->firstOrFail();
            $approbateurs = Approbateur::where('id_niveau', $idNiveauEmploye)->get();

            foreach ($approbateurs as $approbateur) {
                $historique = new Historique([
                    'ordre_de_mission_id' => $ordreDeMissionData->id,
                    'document_type' => 'déplacement',
                    'id_niveau' => $idNiveauEmploye,
                    'id_etat' => $etatEmploye->id,
                    'id_approbateur' => $approbateur->id,
                    'note' => 'Déplacement ajouté par l\'utilisateur ' . $user->name,
                    'date' => Carbon::now(),
                ]);
                $ordre->historiques()->save($historique);
            }



            return response()->json(['message' => "ordre De Mission Added", 'data' => $ordreDeMissionData, 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    public function updateOrdreDeMission($id, Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'Date_sortie' => 'date',
                'Date_retour' => 'date',
                'id_voiture' => 'integer',
                'id_ville' => 'integer',
                'id_ville_destination' => 'integer',

            ]);

            if ($validator->fails()) {
                return response()->json(['status' => 'error', 'message' => $validator->errors()], Response::HTTP_BAD_REQUEST);
            }
            $data = $validator->validated();

            $dateSortie = Carbon::parse($data['Date_sortie']);
            $dateRetour = Carbon::parse($data['Date_retour']);
            $currentDate = Carbon::now();

            if ($dateSortie->gte($currentDate)) {
                return response()->json(['status' => 'error', 'message' => 'La date de sortie doit être antérieure à la date actuelle.'], Response::HTTP_BAD_REQUEST);
            }

            if ($dateSortie->gte($dateRetour)) {
                return response()->json(['status' => 'error', 'message' => 'La date de sortie doit être antérieure à la date de retour.'], Response::HTTP_BAD_REQUEST);
            }


            $ordre_de_mission = Ordre_de_mission::findOrFail($id);
            $ordre_de_mission->update($request->all());

            return response()->json(['message' => "ordre_de_mission modifiee", 'data' => $ordre_de_mission, 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    public function updateEtatByOrdre($idOrdre, Request $request)
    {
        try {
            $ordre = Ordre_de_mission::findOrFail($idOrdre);
            $validatedData = $request->validate([
                'id_etat' => 'required',
                'id_niveau' => 'required'
            ]);

            $etat = Etat::findOrFail($validatedData['id_etat']);
            $niveau = Niveau::findOrFail($validatedData['id_niveau']);
            $approbateur = Approbateur::where('id_niveau', $validatedData['id_niveau'])->firstOrFail();
            $user = User::where('id', $ordre->id_user)->firstOrFail();
            $ville = Ville::where('id', $ordre->id_ville)->firstOrFail();
            $ville_destination = Ville::where('id', $ordre->id_ville_destination)->firstOrFail();
            $voiture = Voiture::where('id', $ordre->id_voiture)->firstOrFail();

            if ($etat->Nom_etat === 'accepté' && $niveau->Nom_Niveau === 'RH') {
                $voiture->update(['compteur_initiale' => $ordre->compteur_finale]);
                Mail::to($user->email)->send(new OrdreAccepteMail($user, $ordre, $ville, $ville_destination, $voiture));

            } else if ($etat->Nom_etat === 'refusé' && $niveau->Nom_Niveau === 'RH') {
                Mail::to($user->email)->send(new OrdreRefusMail($user, $ordre));

            }

            Historique::create([
                'document_type' => 'Déplacement',
                'ordre_de_mission_id' => $ordre->id,
                'id_niveau' => $niveau->id,
                'id_etat' => $etat->id,
                'id_approbateur' => $approbateur->id,
                'note' => 'Votre demande de déplacement a été mis à jour à ' . $etat->Nom_etat,
                'date' => now(),
            ]);
            return response()->json(['message' => "Déplacement modifiée", 'data' => $ordre, 'status' => 'success']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['status' => 'error', 'message' => 'Aucune déplacement trouvée pour cet identifiant.'], 404);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 400);
        }
    }
    public function getNotificationsDetails($userId)

    {
        try {
            $aujourdhui = now()->toDateString();
            $user = User::findOrFail($userId);
            $ordres = $user->ordres()
                ->with(['historiques' => function ($query) {
                    $query->latest();
                }, 'Users'])
                ->get();

            $notificationDetails = [];

            foreach ($ordres as $ordre) {
                $aujourdhui = now()->toDateString();
                $hier = now()->subDay()->toDateString();
                $historique = $ordre->historiques
                ->first();
                $user1 = $ordre->user;
                if ($historique) {
                    if ($historique->id_utilisateur !== $userId) {
                         if ($historique->etat = 'en attente') {
                            $notification = [
                                'notification' => 'Ordre de mission',
                                'note' => $historique->note,
                                'ordre_de_mission_id' => $historique->ordre_de_mission_id,
                                'departement'=>$user1,
                                'created_at' => [
                                    'date' => $historique->created_at->format('d/m/Y'),
                                    'time' => $historique->created_at->format('H:i:s'),
                                ],
                                'lu' => false,
                            ];
                            if ($notification['ordre_de_mission_id'] !== null && !$this->isNotificationExists($notificationDetails, $notification['ordre_de_mission_id'])) {
                                $notificationDetails[] = $notification;
                            }
                        }
                    }
                }
            }
            $approverIds = Approbateur::where('id_utilisateur', $userId)->pluck('id')->unique();
            $hier = now()->subDay()->toDateString();
            $approverHistoriques = Historique::whereIn('id_approbateur', $approverIds)
                ->whereDate('created_at', '>=', $hier)
                ->whereDate('created_at', '<=', $aujourdhui)
                ->whereHas('etats', function ($query) {
                    $query->where('Nom_etat', 'en attente');
                })
                ->where('note', 'like', '%Déplacement ajouté par l\'utilisateur%')
                ->get();

           foreach ($approverHistoriques as $historique) {
                $ordre = Ordre_de_mission::findOrFail($historique->ordre_de_mission_id);
                $user = User::findOrFail($ordre->id_user);
                $approverRequestNotification = [
                    'notification' => 'Ordre de mission',
                    'note' => $historique->note,
                    'ordre_de_mission_id' => $historique->ordre_de_mission_id,
                    'departement' => $user->departement,
                    'created_at' => [
                        'date' => $historique->created_at->format('d/m/Y'),
                        'time' => $historique->created_at->format('H:i:s'),
                    ],
                    'lu' => false,
                ];

                    $notificationDetails[] = $approverRequestNotification;

            }

            $notificationDetails = array_filter($notificationDetails, function ($notification) {
                return $notification['ordre_de_mission_id'] !== null;
            });

            $notificationDetails = array_values($notificationDetails);
            foreach ($notificationDetails as &$notification) {

                if (is_numeric($notification['ordre_de_mission_id'])) {
                    $ordre = Ordre_de_mission::findOrFail($notification['ordre_de_mission_id']);
                    $notification['ordre_de_mission_id'] = [
                        'Date_sortie' => $ordre->Date_sortie,
                        'Date_retour' => $ordre->Date_retour,
                        'ville' => $ordre->ville()->first(),
                        'Ville_destination' => $ordre->villesDestination()->first(),
                        'voiture' => $ordre->voiture()->first(),
                        'id_user' => $ordre->id_user,
                        'id_type_document' => $ordre->id_type_document,
                        'lu' => false,
                    ];
                }
            }


            $lueNotificationIds = Cache::get('lue_notifications_' . $userId, []);

            foreach ($notificationDetails as &$notification) {
                $notification['lu'] = in_array($notification['ordre_de_mission_id'], $lueNotificationIds);
            }
            usort($notificationDetails, function ($a, $b) {
                $dateA = DateTime::createFromFormat('d/m/Y H:i:s', $a['created_at']['date'] . ' ' . $a['created_at']['time']);
                $dateB = DateTime::createFromFormat('d/m/Y H:i:s', $b['created_at']['date'] . ' ' . $b['created_at']['time']);
                return $dateB <=> $dateA;
            });

            return $notificationDetails;
        } catch (\Exception $e) {
            error_log('Erreur lors de la récupération des détails de notification : ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 400);
        }
    }

    private function isNotificationExists($notifications, $congeId)
    {
        foreach ($notifications as $notification) {
            if ($notification['ordre_de_mission_id'] === $congeId) {
                return true;
            }
        }
        return false;
    }

    public function markNotificationAsRead(Request $request, $userId)
{
    try {
        $notifications = $this->getNotificationsDetails($userId);
        foreach ($notifications as &$notification) {
            $notification['lu'] = true;
        }

        $lueNotificationIds = collect($notifications)->pluck('ordre_de_mission_id')->toArray();
            Cache::put('lue_notifications_' . $userId, $lueNotificationIds);
        return response()->json(['status' => 'success', 'notifications' => $notifications], 200);
    } catch (\Exception $e) {
        return response()->json(['status' => 'error', 'message' => $e->getMessage()], 400);
    }
}


}
