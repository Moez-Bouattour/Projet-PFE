<?php

namespace App\Http\Controllers;

use App\Mail\AutorisationAcceptMail;
use App\Mail\AutorisationRefuseMail;
use App\Models\Approbateur;
use App\Models\Autorisation;
use App\Models\TypeDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;
use Carbon\Carbon;
use App\Models\Niveau;
use App\Models\Etat;
use App\Models\User;
use App\Models\JourFerie;
use App\Models\Repas;
use App\Models\Historique;
use App\Models\SoldeAutorisation;
use App\Models\Weekend;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use DateTime;

class AutorisationController extends Controller
{
    public function getAutorisations()
    {
        try {

            $typeDocument = TypeDocument::where('type_doc', 'autorisation')->firstOrFail();
            $id_type_document = $typeDocument->id;
            $jours_feries = JourFerie::all();
            $autorisations = Autorisation::with(['Users', 'historiques', 'historiques.niveaux', 'historiques.etats'])
                ->orderBy('created_at', 'desc')
                ->get();

            $autorisations->load('Users.soldeAutorisations');

            $autorisations->transform(function ($autorisation) {
                $historiques = $autorisation->historiques->map(function ($historique) {
                    $historique->Nom_Niveau = $historique->niveaux ? $historique->niveaux->Nom_Niveau : null;
                    $historique->Nom_etat = $historique->etats ? $historique->etats->Nom_etat : null;
                    $approbateur = Approbateur::find($historique->id_approbateur);
                    $historique->id_user_approbateur = $approbateur ? $approbateur->id_utilisateur : null;
                    return $historique;
                });

                $lastHistorique = $autorisation->historiques->sortByDesc('updated_at')->first();
                if ($lastHistorique) {
                    $lastHistorique->Nom_Niveau = $lastHistorique->niveaux ? $lastHistorique->niveaux->Nom_Niveau : null;
                    $lastHistorique->Nom_etat = $lastHistorique->etats ? $lastHistorique->etats->Nom_etat : null;
                    $approbateur = Approbateur::find($lastHistorique->id_approbateur);
                    $lastHistorique->id_user_approbateur = $approbateur ? $approbateur->id_utilisateur : null;
                }


                $autorisation->Users->each(function ($user) {
                    $user->soldes->transform(function ($solde) {
                        return $solde->solde;
                    });
                });
                $autorisation->historiques = $historiques;
                $autorisation->lastHistorique = $lastHistorique;

                return $autorisation;
            });

            $response = [
                'autorisations' => $autorisations,
                'jour_feries' => $jours_feries,
                'id_type_document' => $id_type_document
            ];

            return response()->json($response, 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['status' => 'error', 'message' => 'Autorisation non trouvé.'], Response::HTTP_NOT_FOUND);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }



    public function getAutorisationById($id)
    {
        try {
            $autorisation = Autorisation::with(['historiques.niveaux', 'historiques.etats'])->findOrFail($id);
            $typeDocument = TypeDocument::where('type_doc', 'autorisation')->firstOrFail();
            $id_type_document = $typeDocument->id;
            $niveaux = Niveau::where('id_type_document', $id_type_document)->get();
            $autorisation->historiques->transform(function ($historique) {
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
            $autorisation->historiques = $autorisation->historiques->sortByDesc('updated_at');
            $latestHistorique = $autorisation->historiques->first();
            if ($latestHistorique) {
                $autorisation->dernier_nom_niveau = $latestHistorique->niveaux->Nom_Niveau ?? null;
                $autorisation->dernier_nom_etat = $latestHistorique->etats->Nom_etat ?? null;
            }
            return response()->json([
                'message' => "Autorisation trouvé",
                'data' => $autorisation,
                'niveaux' => $niveaux,
                'status' => 'success'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['status' => 'error', 'message' => 'Autorisation non trouvé.'], Response::HTTP_NOT_FOUND);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    public function addAutorisation(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'id_user' => 'required',
                'Date_sortie' => 'required|date',
                'Heure_debut' => 'required|date_format:H:i',
                'Heure_fin' => 'required|date_format:H:i',
                'raison' => 'required|string'
            ]);

            if ($validator->fails()) {
                return response()->json(['status' => 'error', 'message' => $validator->errors()], Response::HTTP_BAD_REQUEST);
            }

            $data = $validator->validated();
            $dateSortie = Carbon::parse($data['Date_sortie']);

            if ($dateSortie->isWeekend()) {
                return response()->json(['status' => 'error', 'message' => 'La date de sortie ne peut pas être un week-end.'], Response::HTTP_BAD_REQUEST);
            }

            $repas = Repas::findOrFail(1);
            $heureDebut = strtotime($data['Heure_debut']);
            $heureFin = strtotime($data['Heure_fin']);
            $heureDebutRepas = strtotime($repas->heure_debut);
            $heureFinRepas = strtotime($repas->heure_fin);

            if ($dateSortie->month != Carbon::now()->month) {
                return response()->json(['status' => 'error', 'message' => 'La date de sortie doit être dans le mois actuel.'], Response::HTTP_BAD_REQUEST);
            }


            $existingAutorisations = Autorisation::where('id_user', $data['id_user'])
                ->where(function ($query) use ($data) {
                    $query->where(function ($q) use ($data) {
                        $q->where('Date_sortie', $data['Date_sortie'])
                            ->where(function ($q) use ($data) {
                                $q->whereBetween('Heure_debut', [$data['Heure_debut'], $data['Heure_fin']])
                                    ->orWhereBetween('Heure_fin', [$data['Heure_debut'], $data['Heure_fin']]);
                            });
                    })->orWhere(function ($q) use ($data) {
                        $q->whereBetween('Date_sortie', [$data['Date_sortie'], $data['Date_sortie']])
                            ->where(function ($q) use ($data) {
                                $q->where('Heure_debut', '>=', $data['Heure_debut'])
                                    ->where('Heure_fin', '<=', $data['Heure_fin']);
                            });
                    });
                })->exists();

            if ($existingAutorisations) {
                return response()->json(['status' => 'error', 'message' => "Il existe une demande d'autorisation chevauchant avec cette demande."], Response::HTTP_BAD_REQUEST);
            }

            $joursFeries = JourFerie::pluck('date')->toArray();
            if (in_array($dateSortie->toDateString(), $joursFeries)) {
                return response()->json(['status' => 'error', 'message' => 'La date choisie correspond à un jour férié.'], Response::HTTP_BAD_REQUEST);
            }

            $heureDebut = Carbon::createFromFormat('H:i', $data['Heure_debut']);
            $heureFin = Carbon::createFromFormat('H:i', $data['Heure_fin']);
            $dateSortie = Carbon::parse($data['Date_sortie']);

            $timestampDebut = $heureDebut->timestamp;
            $timestampFin = $heureFin->timestamp;

            $duree = ($timestampFin - $timestampDebut) / 60;

            $duree = abs((int)$duree);
            $heureDebutRepas = Carbon::createFromTime(
                (int)substr($repas->heure_debut, 0, 2),
                (int)substr($repas->heure_debut, 3, 2)
            );

            $heureFinRepas = Carbon::createFromTime(
                (int)substr($repas->heure_fin, 0, 2),
                (int)substr($repas->heure_fin, 3, 2)
            );

            $heureDebutRepasEnMinutes = $heureDebutRepas->hour * 60 + $heureDebutRepas->minute;
            $heureFinRepasEnMinutes = $heureFinRepas->hour * 60 + $heureFinRepas->minute;

            if ($heureDebut <= $heureDebutRepas && $heureFin >= $heureFinRepas) {
                $duree -= ($heureFinRepasEnMinutes - $heureDebutRepasEnMinutes);
            } elseif ($heureDebut >= $heureDebutRepas && $heureFin <= $heureFinRepas) {
                return response()->json(['status' => 'error', 'message' => 'Les heures de début et de fin ne peuvent pas se trouver dans la période des heures de repas.'], Response::HTTP_BAD_REQUEST);
            } elseif ($heureDebut < $heureDebutRepas && $heureFin > $heureFinRepas) {
                $duree -= ($heureFinRepasEnMinutes - $heureDebutRepasEnMinutes);
            }

            if ($duree < 0 || !is_int($duree)) {
                return response()->json(['status' => 'error', 'message' => 'La durée calculée n\'est pas un entier valide.'], Response::HTTP_BAD_REQUEST);
            }

            $currentDate = Carbon::now();

            if ($heureFin->lte($heureDebut)) {
                return response()->json(['status' => 'error', 'message' => 'L\'heure de fin doit être supérieure à l\'heure de reprise.'], Response::HTTP_BAD_REQUEST);
            }
            if ($duree <= 0) {
                return response()->json(['status' => 'error', 'message' => 'La différence entre l\'heure de début et l\'heure de fin doit être supérieure à zéro.'], Response::HTTP_BAD_REQUEST);
            }

            $dateSortieMySQL = $dateSortie->format('Y-m-d');
            $user = User::findOrFail($data['id_user']);
            $TypeDocument = TypeDocument::where('type_doc', 'autorisation')->firstOrFail();
            $autorisationData = Autorisation::create([
                'id_user' => $data['id_user'],
                'Date_sortie' => $dateSortieMySQL,
                'Heure_debut' => $data['Heure_debut'],
                'Heure_fin' => $data['Heure_fin'],
                'raison' => $data['raison'],
                'Duree' => $duree,
                'id_type_document' => $TypeDocument->id
            ]);

            $autorisation = Autorisation::findOrFail($autorisationData->id);
            $posteUtilisateur = $user->poste;
            $niveauEmploye = Niveau::where('id_type_document', $TypeDocument->id)
                ->where('Nom_Niveau', $posteUtilisateur)
                ->firstOrFail();
            $idNiveauEmploye = $niveauEmploye->id;
            $etatEmploye = Etat::where('id_niveau', $idNiveauEmploye)->firstOrFail();
            $approbateurs = Approbateur::where('id_niveau', $idNiveauEmploye)->get();

            foreach ($approbateurs as $approbateur) {
                $historique = new Historique([
                    'autorisation_id' => $autorisationData->id,
                    'document_type' => 'Autorisation',
                    'id_niveau' => $idNiveauEmploye,
                    'id_etat' => $etatEmploye->id,
                    'id_approbateur' => $approbateur->id,
                    'note' => 'Autorisation ajouté par l\'utilisateur ' . $user->name,
                    'date' => Carbon::now(),
                ]);
                $autorisation->historiques()->save($historique);
            }

            return response()->json(['message' => "Autorisation Added", 'data' => $autorisationData, 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }


    public function updateAutorisation($id, Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'Date_sortie' => 'date',
                'Heure_debut' => 'date_format:H:i',
                'Heure_fin' => 'date_format:H:i',
                'Duree' => 'integer',
                'raison' => 'string'
            ]);

            if ($validator->fails()) {
                return response()->json(['status' => 'error', 'message' => $validator->errors()], Response::HTTP_BAD_REQUEST);
            }

            $autorisation = Autorisation::findOrFail($id);


            if ($request->has('Heure_debut') || $request->has('Heure_fin')) {
                $heureDebut = Carbon::createFromFormat('H:i', $request->input('Heure_debut'));
                $heureFin = Carbon::createFromFormat('H:i', $request->input('Heure_fin'));
                $duree = $heureDebut->diffInHours($heureFin);
                $dateSortie = Carbon::parse($request->input('Date_sortie'));
                $currentDate = Carbon::now();
                $duree = $heureDebut->diffInMinutes($heureFin);
                if ($heureFin->lte($heureDebut)) {
                    return response()->json(['status' => 'error', 'message' => 'L\'heure de reprise doit être supérieure à l\'heure de début.'], Response::HTTP_BAD_REQUEST);
                }
                if ($duree <= 0) {
                    return response()->json(['status' => 'error', 'message' => 'La différence entre l\'heure de début et l\'heure de fin doit être supérieure à zéro.'], Response::HTTP_BAD_REQUEST);
                }
                $autorisation->Duree = $duree;
                if ($heureFin->lte($heureDebut)) {
                    return response()->json(['status' => 'error', 'message' => 'L\'heure de reprise doit être supérieure à l\'heure de début.'], Response::HTTP_BAD_REQUEST);
                }
                if ($duree <= 0) {
                    return response()->json(['status' => 'error', 'message' => 'La différence entre l\'heure de début et l\'heure de fin doit être supérieure à zéro.'], Response::HTTP_BAD_REQUEST);
                }
            }

            $autorisation->update($request->all());

            return response()->json(['message' => "Autorisation modifiee", 'data' => $autorisation, 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    public function updateEtatByAutorisation($idAutorisation, Request $request)
    {
        try {
            $autorisation = Autorisation::findOrFail($idAutorisation);
            $validatedData = $request->validate([
                'id_etat' => 'required',
                'id_niveau' => 'required',
            ]);

            $etat = Etat::findOrFail($validatedData['id_etat']);
            $niveau = Niveau::findOrFail($validatedData['id_niveau']);
            $approbateur = Approbateur::where('id_niveau', $validatedData['id_niveau'])->firstOrFail();
            $user = User::where('id', $autorisation->id_user)->firstOrFail();
            if ($etat->Nom_etat === 'accepté' && $niveau->Nom_Niveau === 'RH') {
                Mail::to($user->email)->send(new AutorisationAcceptMail($user, $autorisation));

                SoldeAutorisation::where('id_user', $autorisation->id_user)
                    ->where('annee', date('Y'))
                    ->where('mois',  date('m'))
                    ->decrement('solde', $autorisation->Duree);
                SoldeAutorisation::where('id_user', $autorisation->id_user)
                    ->where('annee', date('Y'))
                    ->where('mois',  date('m'))
                    ->increment('autorisation_pris', $autorisation->Duree);
            } else if ($etat->Nom_etat === 'refusé' && $niveau->Nom_Niveau === 'RH') {
                $AutorisationsChevauches = Autorisation::where('id', '<>', $autorisation->id)
                    ->where('id_user', '<>', $autorisation->id_user)
                    ->whereHas('Users', function ($query) use ($user) {
                        $query->where('departement', $user->departement);
                    })
                    ->where(function ($query) use ($autorisation) {
                        $query->where('Date_sortie', '=', $autorisation->Date_sortie)
                            ->where('Heure_debut', '<=', $autorisation->Heure_debut)
                            ->where('Heure_fin', '>=', $autorisation->Heure_fin);
                    })
                    ->count();



                    Mail::to($user->email)->send(new AutorisationRefuseMail($user, $autorisation));

            }
            Historique::create([
                'document_type' => 'autorisation',
                'autorisation_id' => $autorisation->id,
                'id_niveau' => $niveau->id,
                'id_etat' => $etat->id,
                'id_approbateur' => $approbateur->id,
                'note' => 'Votre demande de sortie a été mis à jour à ' . $etat->Nom_etat,
                'date' => now(),
            ]);
            return response()->json(['message' => "Autorisation modifiée", 'data' => $autorisation, 'status' => 'success']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['status' => 'error', 'message' => 'Aucune autorisation trouvée pour cet identifiant.'], 404);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 400);
        }
    }

    public function getNotificationAutorisationDetails($userId)
    {
        try {
            $aujourdhui = now()->toDateString();
            $user = User::findOrFail($userId);
            $autorisations = $user->autorisations()
            ->with(['historiques' => function ($query) {
                $query->latest();
            }, 'Users'])
                ->get();

            $notificationDetails = [];

            foreach ($autorisations as $autorisation) {
                $aujourdhui = now()->toDateString();
                $hier = now()->subDay()->toDateString();
                $historique = $autorisation->historiques
                ->first();
                $user1 = $autorisation->user;
                if ($historique) {
                    if ($historique->id_utilisateur !== $userId) {
                        if ($historique->etat = 'en attente') {
                            $notification = [
                                'notification' => 'Autorisation',
                                'note' => $historique->note,
                                'autorisation_id' => $historique->autorisation_id,
                                'departement'=>$user1,
                                'created_at' => [
                                    'date' => $historique->created_at->format('d/m/Y'),
                                    'time' => $historique->created_at->format('H:i:s'),
                                ],
                                'lu' => false,
                            ];

                            if ($notification['autorisation_id'] !== null&& $this->isNotificationExists($notificationDetails, $notification['autorisation_id'])) {
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
                ->where('note', 'like', '%Autorisation ajouté par l\'utilisateur%')
                ->get();

            foreach ($approverHistoriques as $historique) {
                $autorisation = Autorisation::findOrFail($historique->autorisation_id);
                $user = User::findOrFail($autorisation->id_user);
                $approverRequestNotification = [
                    'notification' => 'Autorisation',
                    'note' => $historique->note,
                    'autorisation_id' => $historique->autorisation_id,
                    'departement' => $user->departement,
                    'created_at' => [
                        'date' => $historique->created_at->format('d/m/Y'),
                        'time' => $historique->created_at->format('H:i:s'),
                    ],
                    'lu' => false,
                ];

                if ($approverRequestNotification['autorisation_id'] !== null && !$this->isNotificationExists($notificationDetails, $approverRequestNotification['autorisation_id'])) {
                    $notificationDetails[] = $approverRequestNotification;
                }
            }
            $notificationDetails = array_filter($notificationDetails, function ($notification) {
                return $notification['autorisation_id'] !== null;
            });

            $notificationDetails = array_values($notificationDetails);

            foreach ($notificationDetails as &$notification) {
                if (is_numeric($notification['autorisation_id'])) {
                    $autorisation = Autorisation::findOrFail($notification['autorisation_id']);
                    $notification['autorisation_id'] = [
                        'Date_sortie' => $autorisation->Date_sortie,
                        'Heure_debut' => $autorisation->Heure_debut,
                        'Heure_fin' => $autorisation->Heure_fin,
                        'Duree' => $autorisation->Duree,
                        'id_user' => $autorisation->id_user,
                        'id_type_document' => $autorisation->id_type_document,
                        'raison' => $autorisation->raison,
                        'lu'=>false,
                    ];
                }
            }

            $lueNotificationIds = Cache::get('lue_notifications_' . $userId, []);

            foreach ($notificationDetails as &$notification) {
                $notification['lu'] = in_array($notification['autorisation_id'], $lueNotificationIds);
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
            if ($notification['autorisation_id'] === $congeId) {
                return true;
            }
        }
        return false;
    }

    public function markNotificationAsRead(Request $request, $userId)
    {
        try {
            $notifications = $this->getNotificationAutorisationDetails($userId);
            foreach ($notifications as &$notification) {
                $notification['lu'] = true;
            }
            $lueNotificationIds = collect($notifications)->pluck('autorisation_id')->toArray();
            Cache::put('lue_notifications_' . $userId, $lueNotificationIds);
            return response()->json(['status' => 'success', 'notifications' => $notifications], 200);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 400);
        }
    }
}
