<?php

namespace App\Http\Controllers;

use App\Models\Solde;
use App\Models\TypeCongé;
use App\Models\User;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Exceptions\JWTException;
use Symfony\Component\HttpFoundation\Response;
use Carbon\Carbon;

use DateTime;

class UserController extends Controller
{
    public function getUsers()
    {
        try {
            $users = User::with(['soldes', 'soldes.TypeConge', 'soldeAutorisations'])->get();
            $type_conges = TypeCongé::all();
            $userss = User::all();
            $usersAvecSoldesParAnnee = [];
            foreach ($users as $user) {
                $soldesParAnnee = [];
                $annees = [];
                foreach ($user->soldes as $solde) {
                    if (!in_array($solde->annee, array_column($annees, 'annee'))) {
                        $annees[] = ['annee' => $solde->annee];
                        $soldesParAnnee[] = ['cloture' => $solde->cloture,'annee' => $solde->annee, 'soldes' => []];
                    }
                    foreach ($soldesParAnnee as &$anneeSolde) {
                        if ($anneeSolde['annee'] == $solde->annee) {
                            $anneeSolde['soldes'][] = $solde;
                            break;
                        }
                    }
                }


                $soldeAutorisationsParAnnee = [];
                foreach ($user->soldeAutorisations as $soldeAutorisation) {
                    if (!in_array($soldeAutorisation->annee, array_column($soldeAutorisationsParAnnee, 'annee'))) {
                        $soldeAutorisationsParAnnee[] = ['mois' => $soldeAutorisation->mois,'annee' => $soldeAutorisation->annee, 'soldes' => []];
                    }
                    foreach ($soldeAutorisationsParAnnee as &$anneeSoldeAutorisation) {

                        if ($anneeSoldeAutorisation['annee'] == $soldeAutorisation->annee) {
                            $anneeSoldeAutorisation['soldes'][] = $soldeAutorisation;
                            break;
                        }
                    }
                }

                $usersAvecSoldesParAnnee[] = [
                    'user' => $user,
                    'soldes_par_annee' => $soldesParAnnee,
                    'solde_autorisations_par_annee' => $soldeAutorisationsParAnnee,
                    'annees' => $annees
                ];
            }
            return response()->json(['users_avec_soldes_par_annee' => $usersAvecSoldesParAnnee,'type_conges'=>$type_conges,'users'=>$userss], 200);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }


    public function register(Request $request)
    {
        try {
            $user = User::where('email', $request['email'])->first();
            if ($user) {
                return response()->json(['message' => "Email Already Exists", "status" => 'error']);
            } else {
                $validator = Validator::make($request->all(), [
                    'name' => 'required|string',
                    'email' => 'required|email|unique:users',
                    'password' => 'required|string|min:6',
                    'telephone' => 'required|nullable|string|regex:/^[0-9]{8}$/',
                    'ville' => 'required|nullable|string',
                    'cin' => 'required|nullable|string|regex:/^[0-9]{8}$/',
                    'departement' => 'required|nullable|string',
                    'poste' => 'required|nullable|string|in:RH,Chef de projet,Employé',
                    'situation'=>'required|string',
                    'sexe'=>'required|string',
                    'date_embauche'=>'required|date'
                ]);

                if ($validator->fails()) {
                    return response()->json(['status' => 'error', 'message' => $validator->errors()], Response::HTTP_BAD_REQUEST);
                }
                $data = $validator->validated();
                $date_embauche = Carbon::parse($data['date_embauche']);
                $date_actuelle = Carbon::now();

                $userData = User::create([
                    'name' => $request->input('name'),
                    'email' => $request->input('email'),
                    'password' => Hash::make($request->input('password')),
                    'telephone' => $request->input('telephone'),
                    'ville' => $request->input('ville'),
                    'cin' => $request->input('cin'),
                    'departement' => $request->input('departement'),
                    'poste' => $request->input('poste'),
                    'situation' => $request->input('situation'),
                    'sexe' => $request->input('sexe'),
                    'date_embauche'=> $date_embauche,
                ]);
                $typeConges = TypeCongé::where('type_nom_conge', 'annuel')
                    ->orWhere('type_nom_conge', 'maladie');

                if ($request->input('situation') == 'marié'||$request->input('situation') == 'mariée') {
                    if ($request->input('sexe') == 'homme') {
                        $typeConges->orWhere('type_nom_conge', 'paternité');
                    } elseif ($request->input('sexe') == 'femme') {
                        $typeConges->orWhere('type_nom_conge', 'maternité');
                    }
                }

                $typeConges = $typeConges->get();
                foreach ($typeConges as $typeConge) {
                    $annee = $date_embauche->year;
                    $anneeCloturee = Solde::where('id_user', $userData->id)
                                            ->where('id_type_conge', $typeConge->id)
                                            ->where('annee', $annee)
                                            ->where('cloture', false)
                                            ->exists();

                                            if (!$anneeCloturee) {
                                                $soldeInitial = 0;
                                                $moisRestants = 12 - $date_embauche->month;
                                                if ($annee == $date_actuelle->year) {
                                                    $moisRestants = min($moisRestants, $date_actuelle->month);
                                                }


                                                if ($typeConge->type_nom_conge != 'paternité' && $typeConge->type_nom_conge != 'maternité') {
                                                    $solde = $moisRestants * ($typeConge->duree / 12);
                                                } else {
                                                    $solde = $typeConge->duree;
                                                }

                                                Solde::create([
                                                    'id_user' => $userData->id,
                                                    'id_type_conge' => $typeConge->id,
                                                    'duree' => $typeConge->duree,
                                                    'solde_initiale' => $soldeInitial,
                                                    'solde' => $solde,
                                                    'annee' => $date_embauche->year,
                                                    'cloture' => 0
                                                ]);
                                            }


                }


                return response()->json(['message' => "Utilisateur ajouté", 'data' => $userData, 'status' => 'success']);
            }
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        try {
            if (!JWTAuth::attempt($credentials)) {

                return response()->json(['status' => 'error', 'message' => 'email ou password incorrect'], Response::HTTP_BAD_REQUEST);
            }
        } catch (JWTException $e) {

            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }

        try {
            $token = JWTAuth::claims([
                'id_user' => Auth::id(),
                'email' => $request->email,
                'name' => Auth::user()->name,
                'poste' => Auth::user()->poste,
                'departement' => Auth::user()->departement,
                'situation' => Auth::user()->situation,
                'sexe' => Auth::user()->sexe,
                'role' => Auth::user()->role,
            ])->attempt($credentials);


            return response()->json(['message' => "Login successful", 'data' => $token, 'status' => 'success']);
        } catch (JWTException $e) {

            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $user = User::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'string',
                'email' => 'email|unique:users,email,' . $user->id,
                'telephone' => 'nullable|string|regex:/^[0-9]{8}$/',
                'ville' => 'nullable|string',
                'cin' => 'nullable|string|regex:/^[0-9]{8}$/',
                'departement' => 'nullable|string',
                'poste' => 'nullable|string|in:RH,Chef de projet,Employé',
                'situation'=>'string',
                'sexe'=>'string',
                'date_embauche'=>'date',
            ]);

            if ($validator->fails()) {
                return response()->json(['status' => 'error', 'message' => $validator->errors()], Response::HTTP_BAD_REQUEST);
            }
            $date_embauche = Carbon::parse($request->input('date_embauche'));
            $user->update($request->all());

            return response()->json(['message' => 'User updated successfully', 'data' => $user], 200);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }



    public function delete($id)
    {
        try {
            $user = User::findOrFail($id);
            $user->delete();
            return response()->json(['message' => 'User deleted successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    public function getUserById($id)
    {
        try {
            $user = User::findOrFail($id);
            return response()->json(['message' => "user", 'data' => $user, 'status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
}
