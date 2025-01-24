<?php

namespace App\Http\Controllers;

use App\Mail\CongeAccepteMail;
use App\Mail\CongeRefuseMail;
use App\Mail\CongesChevauchesMail;
use App\Mail\SoldeInsuffisantMail;
use App\Models\Approbateur;
use App\Models\Congé;
use App\Models\Etat;
use App\Models\Historique;
use App\Models\JourFerie;
use App\Models\Niveau;
use App\Models\Solde;
use App\Models\TypeCongé;
use App\Models\TypeDocument;
use App\Models\User;
use App\Models\Weekend;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;
use Carbon\Carbon;
use DateInterval;
use DatePeriod;
use DateTime;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class CongéController extends Controller
{
    public function getCongés()
    {
        try {
            $typeDocument = TypeDocument::where('type_doc', 'congé')->firstOrFail();
            $id_type_document = $typeDocument->id;
            $type_conges = TypeCongé::all();
            $jours_feries = JourFerie::all();
            $conges = Congé::with(['Users', 'TypeConges', 'historiques.approbateurs', 'historiques', 'historiques.niveaux', 'historiques.etats'])
                ->orderBy('created_at', 'desc')
                ->get();
            $conges->load('Users.soldes');
            $conges->transform(function ($conge) {
                $historiques = $conge->historiques->map(function ($historique) {
                    $historique->Nom_Niveau = $historique->niveaux ? $historique->niveaux->Nom_Niveau : null;
                    $historique->Nom_etat = $historique->etats ? $historique->etats->Nom_etat : null;
                    $approbateur = Approbateur::find($historique->id_approbateur);
                    $historique->id_user_approbateur = $approbateur ? $approbateur->id_utilisateur : null;
                    return $historique;
                });

                $lastHistorique = $conge->historiques->sortByDesc('updated_at')->first();
                if ($lastHistorique) {
                    $lastHistorique->Nom_Niveau = $lastHistorique->niveaux ? $lastHistorique->niveaux->Nom_Niveau : null;
                    $lastHistorique->Nom_etat = $lastHistorique->etats ? $lastHistorique->etats->Nom_etat : null;
                    $approbateur = Approbateur::find($lastHistorique->id_approbateur);
                    $lastHistorique->id_user_approbateur = $approbateur ? $approbateur->id_utilisateur : null;
                }
                $conge->Users->each(function ($user) {
                    $user->soldes->transform(function ($solde) {
                        return $solde->solde;
                    });
                });

                $conge->historiques = $historiques;
                $conge->lastHistorique = $lastHistorique;

                return $conge;
            });


            $response = [
                'conges' => $conges,
                'type_conges' => $type_conges,
                'jour_feries' => $jours_feries,
                'id_type_document' => $id_type_document
            ];

            return response()->json($response, 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['status' => 'error', 'message' => 'congé non trouvé.'], Response::HTTP_NOT_FOUND);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }


    public function getCongéById($id)
    {
        try {
            $congé = Congé::with(['historiques.approbateurs', 'historiques.niveaux', 'historiques.etats'])->findOrFail($id);
            $typeDocument = TypeDocument::where('type_doc', 'congé')->firstOrFail();
            $id_type_document = $typeDocument->id;
            $niveaux = Niveau::where('id_type_document', $id_type_document)->get();
            $congé->historiques->transform(function ($historique) {
                $approbateur = Approbateur::find($historique->id_approbateur);
                if (!$approbateur) {
                    $historique->id_user_approbateur = null;
                    $historique->Nom_etats = null;
                    $historique->message = "Tu n'as pas l'approbation";
                } else {
                    $historique->id_user_approbateur = $approbateur->id_utilisateur;
                    $etats = Etat::where('id_niveau', $historique->id_niveau)->get();
                    $etatsWithNames = [];
                    foreach ($etats as $etat) {
                        $etatsWithNames[] = ['id' => $etat->id, 'nom_etat' => $etat->Nom_etat];
                    }
                    $historique->Nom_etats = $etatsWithNames;
                }
                return $historique;
            });
            $congé->historiques = $congé->historiques->sortByDesc('updated_at');
            $latestHistorique = $congé->historiques->first();
            if ($latestHistorique) {
                $congé->dernier_nom_niveau = $latestHistorique->niveaux->Nom_Niveau ?? null;
                $congé->dernier_nom_etat = $latestHistorique->etats->Nom_etat ?? null;
            }
            return response()->json([
                'message' => "Congé trouvé",
                'data' => $congé,
                'niveaux' => $niveaux,
                'status' => 'success'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['status' => 'error', 'message' => 'Congé non trouvé.'], Response::HTTP_NOT_FOUND);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }


    public function addCongé(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'id_user' => 'required',
                'date_debut_conge' => 'required|date',
                'date_fin_conge' => 'required|date|after:date_debut_conge',
                'id_type_conge' => 'required',
            ], [
                'date_fin_conge.after' => 'La date de reprise doit être ultérieure à la date de début.',
            ]);

            if ($validator->fails()) {
                return response()->json(['status' => 'error', 'message' => $validator->errors()], Response::HTTP_BAD_REQUEST);
            }

            $data = $validator->validated();

            $congéChevauchant = Congé::where('id_user', $data['id_user'])
                ->where(function ($query) use ($data) {
                    $query->whereBetween('date_debut_conge', [$data['date_debut_conge'], $data['date_fin_conge']])
                        ->orWhereBetween('date_fin_conge', [$data['date_debut_conge'], $data['date_fin_conge']]);
                })
                ->exists();

            if ($congéChevauchant) {
                return response()->json(['status' => 'error', 'message' => 'Il existe une demande de congé chevauchant avec cette demande'], Response::HTTP_BAD_REQUEST);
            }

            $dateDebut = new DateTime($data['date_debut_conge']);
            $dateFin = new DateTime($data['date_fin_conge']);

            $typeConge = TypeCongé::findOrFail($data['id_type_conge']);
            $weekend = Weekend::findOrFail(1);
            $includeDays = [
                1 => $weekend->include_lundi,
                2 => $weekend->include_mardi,
                3 => $weekend->include_mercredi,
                4 => $weekend->include_jeudi,
                5 => $weekend->include_vendredi,
                6 => $weekend->include_samedi,
                7 => $weekend->include_dimanche,
            ];

            $duree = 0;

            if ($typeConge->type_nom_conge == 'annuel') {
                $interval = new DateInterval('P1D');
                $daterange = new DatePeriod($dateDebut, $interval, $dateFin->modify('+1 day'));

                foreach ($daterange as $date) {
                    $dayOfWeek = (int) $date->format('N');
                    if (!$includeDays[$dayOfWeek]) {
                        $duree++;
                    }
                }

                $joursFeries = JourFerie::whereBetween('date', [$dateDebut->format('Y-m-d'), $dateFin->format('Y-m-d')])->get();
                foreach ($joursFeries as $jourFerie) {
                    if (is_string($jourFerie->date)) {
                        $date = new DateTime($jourFerie->date);
                    } elseif ($jourFerie->date instanceof DateTime) {
                        $date = $jourFerie->date;
                    } else {
                        throw new \Exception("Unexpected data format for date field");
                    }

                    $dayOfWeek = (int) $date->format('N');
                    if ($includeDays[$dayOfWeek]) {
                        $duree--;
                    }
                }
            } else {
                $interval = $dateDebut->diff($dateFin);
                $duree = $interval->days;
            }


            $user = User::findOrFail($data['id_user']);
            if ($typeConge->type_nom_conge !== 'maladie') {
                $imageUrl = null;
            } else {
                if ($request->hasFile('justification_medicale')) {
                    $imagePath = $request->file('justification_medicale')->store('public');
                    $imageUrl = Storage::url($imagePath);
                }
            }
            $TypeDocument = TypeDocument::where('type_doc', 'congé')->firstOrFail();

            $congéData = Congé::create([
                'id_user' => $data['id_user'],
                'date_debut_conge' => $dateDebut,
                'date_fin_conge' => $dateFin,
                'id_type_conge' => $data['id_type_conge'],
                'id_type_document' => $TypeDocument->id,
                'duree' => $duree,
                'justification_medicale' => $imageUrl
            ]);
            $conge = Congé::findOrFail($congéData->id);
            $posteUtilisateur = $user->poste;
            $niveauEmploye = Niveau::where('id_type_document', $TypeDocument->id)
                ->where('Nom_Niveau', $posteUtilisateur)
                ->firstOrFail();
            $idNiveauEmploye = $niveauEmploye->id;
            $etatEmploye = Etat::where('id_niveau', $idNiveauEmploye)->firstOrFail();
            $approbateurs = Approbateur::where('id_niveau', $idNiveauEmploye)->get();

            foreach ($approbateurs as $approbateur) {
                $historique = new Historique([
                    'conge_id' => $conge->id,
                    'document_type' => 'Congé',
                    'id_niveau' => $idNiveauEmploye,
                    'id_etat' => $etatEmploye->id,
                    'id_approbateur' => $approbateur->id,
                    'note' => 'Congé ajouté par l\'utilisateur ' . $user->name,
                    'date' => Carbon::now(),
                ]);
                $conge->historiques()->save($historique);
            }

            return response()->json(['message' => "Congé ajouté", 'data' => $congéData, 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }


    public function updateConge($id, Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'date_debut_conge' => 'sometimes|date',
                'date_fin_conge' => 'sometimes|date|after:date_debut_conge',
                'id_type_conge' => 'integer',
                'duree' => 'integer'
            ]);

            if ($validator->fails()) {
                return response()->json(['status' => 'error', 'message' => $validator->errors()], Response::HTTP_BAD_REQUEST);
            }

            $congé = Congé::findOrFail($id);
            $validatedData = $validator->validated();

            if (isset($validatedData['date_debut_conge']) && isset($validatedData['date_fin_conge'])) {
                $dateDebut = new DateTime($validatedData['date_debut_conge']);
                $dateFin = new DateTime($validatedData['date_fin_conge']);
                $duree = $dateDebut->diff($dateFin)->days;
                $validatedData['duree'] = $duree;
            }

            $congé->update($validatedData);

            return response()->json(['message' => "Congé modifié", 'data' => $congé, 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    public function updateEtatByCongé($idConge, Request $request)
    {
        try {
            $congé = Congé::findOrFail($idConge);
            $validatedData = $request->validate([
                'id_etat' => 'required',
                'id_niveau' => 'required'
            ]);

            $etat = Etat::findOrFail($validatedData['id_etat']);
            $niveau = Niveau::findOrFail($validatedData['id_niveau']);
            $approbateur = Approbateur::where('id_niveau', $validatedData['id_niveau'])->firstOrFail();
            $typeConge = TypeCongé::where('id', $congé->id_type_conge)->firstOrFail();
            $user = User::where('id', $congé->id_user)->firstOrFail();

            if ($etat->Nom_etat === 'accepté' && $niveau->Nom_Niveau === 'RH') {
                Mail::to($user->email)->send(new CongeAccepteMail($user, $congé, $typeConge));

                if ($typeConge->type_nom_conge === 'annuel' || $typeConge->type_nom_conge === 'maladie' || $typeConge->type_nom_conge === 'maternité' || $typeConge->type_nom_conge === 'paternité') {
                    Solde::where('id_user', $congé->id_user)
                        ->where('annee', date('Y'))
                        ->where('id_type_conge', $congé->id_type_conge)
                        ->decrement('solde', $congé->duree);
                }
                Solde::where('id_user', $congé->id_user)
                    ->where('annee', date('Y'))
                    ->where('id_type_conge', $congé->id_type_conge)
                    ->increment('conge_pris', $congé->duree);
            } else if ($etat->Nom_etat === 'refusé' && $niveau->Nom_Niveau === 'RH') {

                $solde = Solde::where('id_user', $congé->id_user)
                    ->where('annee', date('Y'))
                    ->where('id_type_conge', $congé->id_type_conge)
                    ->first();

                if ($solde->solde < 0) {
                    Mail::to($user->email)->send(new SoldeInsuffisantMail($user, $congé, $typeConge));
                }
                $congesChevauches = Congé::where('id', '<>', $congé->id)
                    ->where('id_user', '<>', $congé->id_user)
                    ->whereHas('Users', function ($query) use ($user) {
                        $query->where('departement', $user->departement);
                    })
                    ->where(function ($query) use ($congé) {
                        $query->where('date_debut_conge', '<=', $congé->date_fin_conge)
                            ->where('date_fin_conge', '>=', $congé->date_debut_conge);
                    })
                    ->count();

                if ($congesChevauches >= 2) {
                    Mail::to($user->email)->send(new CongesChevauchesMail($user));
                }
            }


            Historique::create([
                'document_type' => 'Congé',
                'conge_id' => $congé->id,
                'id_niveau' => $niveau->id,
                'id_etat' => $etat->id,
                'id_approbateur' => $approbateur->id,
                'note' => 'Votre demande de congé a été mis à jour à ' . $etat->Nom_etat,
                'date' => now(),
            ]);
            $notificationDetails = $this->getNotificationDetails($user->id);
            return response()->json(['message' => "Congé modifié", 'data' => $congé, 'notification_details' => $notificationDetails, 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 400);
        }
    }

    public function getNotificationDetails($userId)
{
    try {
        $aujourdhui = now()->toDateString();
        $user = User::findOrFail($userId);
        $conges = $user->congés()
            ->with(['historiques' => function ($query) {
                $query->latest();
            }, 'Users'])
            ->get();

        $notificationDetails = [];

        foreach ($conges as $conge) {
            $aujourdhui = now()->toDateString();
            $hier = now()->subDay()->toDateString();
            $historique = $conge->historiques
            ->first();
            $user1 = $conge->user;

            if ($historique) {
                if ($historique->id_utilisateur !== $userId ) {
                    if ($historique->etat = 'en attente') {
                        $notification = [
                            'notification' => 'Congé',
                            'note' => $historique->note,
                            'conge_id' => $historique->conge_id,
                            'departement'=>$user1,
                            'created_at' => [
                                'date' => $historique->created_at->format('d/m/Y'),
                                'time' => $historique->created_at->format('H:i:s'),
                            ],
                            'lu' => false,
                        ];

                        if ($notification['conge_id'] !== null && !$this->isNotificationExists($notificationDetails, $notification['conge_id'])) {
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
        ->where('note', 'like', '%Congé ajouté par l\'utilisateur%')
        ->get();

        foreach ($approverHistoriques as $historique) {
            $conge = Congé::findOrFail($historique->conge_id);
            $user = User::findOrFail($conge->id_user);
            $approverRequestNotification = [
                'notification' => 'Congé',
                'note' => $historique->note,
                'conge_id' => $historique->conge_id,
                'departement' => $user->departement,
                'created_at' => [
                    'date' => $historique->created_at->format('d/m/Y'),
                    'time' => $historique->created_at->format('H:i:s'),
                ],
                'lu' => false,
            ];

            if ($approverRequestNotification['conge_id'] !== null && $this->isNotificationExists($notificationDetails, $approverRequestNotification['conge_id'])) {
                $notificationDetails[] = $approverRequestNotification;
            }
        }

        $notificationDetails = array_filter($notificationDetails, function ($notification) {
            return $notification['conge_id'] !== null;
        });

        $notificationDetails = array_values($notificationDetails);
        foreach ($notificationDetails as &$notification) {
            if (is_numeric($notification['conge_id'])) {
                $conge = Congé::findOrFail($notification['conge_id']);
                $notification['conge_id'] = [
                    'date_debut_conge' => $conge->date_debut_conge,
                    'date_fin_conge' => $conge->date_fin_conge,
                    'type_conge' => $conge->TypeConges()->first(),
                    'duree' => $conge->duree,
                    'id_user' => $conge->id_user,
                    'id_type_document' => $conge->id_type_document,
                    'lu' => false,
                ];
            }
        }

        $lueNotificationIds = Cache::get('lue_notifications_' . $userId, []);

        foreach ($notificationDetails as &$notification) {
            $notification['lu'] = in_array($notification['conge_id'], $lueNotificationIds);
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
        if ($notification['conge_id'] === $congeId) {
            return true;
        }
    }
    return false;
}


    public function markNotificationAsRead(Request $request, $userId)
    {
        try {
            $notifications = $this->getNotificationDetails($userId);
            foreach ($notifications as &$notification) {
                $notification['lu'] = true;
            }
            $lueNotificationIds = collect($notifications)->pluck('conge_id')->toArray();
            Cache::put('lue_notifications_' . $userId, $lueNotificationIds);
            return response()->json(['status' => 'success', 'notifications' => $notifications], 200);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 400);
        }
    }
    public function getNotificationDetailsCombined($id)
    {
        $congeDetails = app(CongéController::class)->getNotificationDetails($id);
        $autorisationDetails = app(AutorisationController::class)->getNotificationAutorisationDetails($id);
        $ordreDeMissionDetails = app(OrdreDeMissionController::class)->getNotificationsDetails($id);

        $combinedDetails = [
            'conge' => $congeDetails,
            'autorisation' => $autorisationDetails,
            'ordre_de_mission' => $ordreDeMissionDetails,
        ];

        return response()->json($combinedDetails);
    }
    public function markNotificationsAsRead(Request $request, $userId)
{
    try {
        $congeDetails = app(CongéController::class)->getNotificationDetails($userId);
        $autorisationDetails = app(AutorisationController::class)->getNotificationAutorisationDetails($userId);
        $ordreDeMissionDetails = app(OrdreDeMissionController::class)->getNotificationsDetails($userId);

        foreach ($congeDetails as &$notification) {
            $notification['lu'] = true;
        }

        foreach ($autorisationDetails as &$notification) {
            $notification['lu'] = true;
        }

        foreach ($ordreDeMissionDetails as &$notification) {
            $notification['lu'] = true;
        }
        $lueNotificationIds = array_merge(
            collect($congeDetails)->pluck('conge_id')->toArray(),
            collect($autorisationDetails)->pluck('autorisation_id')->toArray(),
            collect($ordreDeMissionDetails)->pluck('ordre_de_mission_id')->toArray()
        );

        Cache::put('lue_notifications_' . $userId, $lueNotificationIds);

        return response()->json([
            'status' => 'success',
            'notifications' => [
                'conge' => $congeDetails,
                'autorisation' => $autorisationDetails,
                'ordre_de_mission' => $ordreDeMissionDetails
            ]
        ], 200);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage()
        ], 400);
    }
}


}
