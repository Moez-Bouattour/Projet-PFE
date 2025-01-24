<?php



use App\Http\Controllers\CongéController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TypeDocumentController;
use App\Http\Controllers\NiveauController;
use App\Http\Controllers\EtatController;
use App\Http\Controllers\ApprobateurController;
use App\Http\Controllers\AutorisationController;
use App\Http\Controllers\ChangePasswordController;
use App\Http\Controllers\OrdreDeMissionController;
use App\Http\Controllers\TypeCongéController;
use App\Http\Controllers\VilleController;
use App\Http\Controllers\VoitureController;
use App\Http\Controllers\HistoriqueController;
use App\Http\Controllers\JourFerieController;
use App\Http\Controllers\RepasController;
use App\Http\Controllers\ResetPassword;
use App\Http\Controllers\ResetPasswordController;
use App\Http\Controllers\SoldeAutorisationController;
use App\Http\Controllers\SoldeController;
use App\Http\Controllers\WeekendController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
Route::group(['prefix' => 'typeDocument'], function () {
    Route::get('getAll', [TypeDocumentController::class, 'getTypeDocuments']);
    Route::get('getById/{id}', [TypeDocumentController::class, 'getTypeDocumentById']);
    Route::post('add', [TypeDocumentController::class, 'addTypeDocument']);
    Route::post('update/{id}', [TypeDocumentController::class, 'updateTypeDocument']);
    Route::delete('delete/{id}', [TypeDocumentController::class, 'deleteTypeDocument']);
});

Route::group(['prefix' => 'niveau'], function () {
    Route::get('getAll', [NiveauController::class, 'getNiveaux']);
    Route::get('getById/{id}', [NiveauController::class, 'getNiveauById']);
    Route::post('add', [NiveauController::class, 'addNiveau']);
    Route::post('update/{id}', [NiveauController::class, 'updateNiveau']);
    Route::delete('delete/{id}', [NiveauController::class, 'deleteNiveau']);
    Route::get('{id}/niveaux', [NiveauController::class, 'getNiveauxByTypeDocument']);
});

Route::group(['prefix' => 'etat'], function () {
    Route::get('getAll', [EtatController::class, 'getEtats']);
    Route::get('getById/{id}', [EtatController::class, 'getEtatById']);
    Route::post('add', [EtatController::class, 'addEtat']);
    Route::post('update/{id}', [EtatController::class, 'updateEtat']);
    Route::delete('delete/{id}', [EtatController::class, 'deleteEtat']);
    Route::get('{id}/etats', [EtatController::class, 'getEtatsByNiveau']);
});

Route::group(['prefix' => 'approbateur'], function () {
    Route::get('getAll', [ApprobateurController::class, 'getApprobateurs']);
    Route::get('getById/{id}', [ApprobateurController::class, 'getApprobateurById']);
    Route::post('add', [ApprobateurController::class, 'addApprobateur']);
    Route::post('update/{id}', [ApprobateurController::class, 'updateApprobateur']);
    Route::delete('delete/{id}', [ApprobateurController::class, 'deleteApprobateur']);
    Route::post('/updateUserRole/{userId}', [ApprobateurController::class, 'updateUserRole']);
    Route::get('{id}/approbateurs', [ApprobateurController::class, 'getApprobateursByNiveau']);
});

Route::group(['prefix' => 'user'], function () {
    Route::get('getAll', [UserController::class, 'getUsers']);
    Route::post('add', [UserController::class, 'register']);
    Route::post('login', [UserController::class, 'login']);
    Route::get('getUserById/{id}', [UserController::class, 'getUserById']);
    Route::post('update/{id}', [UserController::class, 'update']);
    Route::delete('delete/{id}', [UserController::class, 'delete']);
    Route::post('sendPasswordResetLink', [ResetPassword::class,'sendEmail']);
    Route::post('resetPassword', [ChangePasswordController::class,'process']);

});

Route::group(['prefix' => 'congé'], function () {
    Route::get('getAll', [CongéController::class, 'getCongés']);
    Route::get('getById/{id}', [CongéController::class, 'getCongéById']);
    Route::post('add', [CongéController::class, 'addCongé']);
    Route::post('{id}/updateEtat', [CongéController::class, 'updateEtatByCongé']);
    Route::get('getNotification/{id}', [CongéController::class, 'getNotificationDetails']);
    Route::post('markNotificationAsRead/{id}', [CongéController::class, 'markNotificationAsRead']);
    Route::post('update/{id}', [CongéController::class, 'updateConge']);
    Route::post('markNotificationsAsRead/{id}', [CongéController::class, 'markNotificationsAsRead']);
    Route::get('getNotificationDetailsCombined/{id}', [CongéController::class, 'getNotificationDetailsCombined']);

});

Route::group(['prefix' => 'autorisation'], function () {
    Route::get('getAll', [AutorisationController::class, 'getAutorisations']);
    Route::get('getById/{id}', [AutorisationController::class, 'getAutorisationById']);
    Route::post('add', [AutorisationController::class, 'addAutorisation']);
    Route::post('{id}/updateEtat', [AutorisationController::class, 'updateEtatByAutorisation']);
    Route::get('getNotification/{id}', [AutorisationController::class, 'getNotificationAutorisationDetails']);
    Route::post('update/{id}', [AutorisationController::class,'updateAutorisation']);
    Route::post('markNotificationAsRead/{id}', [AutorisationController::class,'markNotificationAsRead']);
});

Route::group(['prefix' => 'Ordre_de_mission'], function () {
    Route::get('getAll', [OrdreDeMissionController::class, 'getOrdreDeMissions']);
    Route::get('getById/{id}', [OrdreDeMissionController::class, 'getOrdreDeMissionById']);
    Route::post('add', [OrdreDeMissionController::class, 'addOrdreDeMission']);
    Route::post('{id}/updateEtat', [OrdreDeMissionController::class, 'updateEtatByOrdre']);
    Route::get('getNotification/{id}', [OrdreDeMissionController::class, 'getNotificationsDetails']);
    Route::post('update/{id}', [OrdreDeMissionController::class,'updateOrdreDeMission']);
    Route::post('markNotificationAsRead/{id}', [OrdreDeMissionController::class,'markNotificationAsRead']);

});

Route::group(['prefix' => 'typeConges'], function () {
    Route::get('getAll', [TypeCongéController::class, 'getTypeConges']);
    Route::get('getById/{id}', [TypeCongéController::class, 'getTypeCongeById']);
    Route::post('add', [TypeCongéController::class, 'addTypeConge']);
    Route::post('update/{id}', [TypeCongéController::class, 'updateTypeConge']);
    Route::delete('delete/{id}', [TypeCongéController::class, 'deleteTypeConge']);
});

Route::group(['prefix' => 'voitures'], function () {
    Route::get('getAll', [VoitureController::class, 'getVoitures']);
    Route::get('getById/{id}', [VoitureController::class, 'getVoitureById']);
    Route::post('add', [VoitureController::class, 'addVoiture']);
    Route::post('update/{id}', [VoitureController::class, 'updateVoiture']);
    Route::delete('delete/{id}', [VoitureController::class, 'deleteVoiture']);
});

Route::group(['prefix' => 'villes'], function () {
    Route::get('getAll', [VilleController::class, 'getVilles']);
    Route::get('getById/{id}', [VilleController::class, 'getVilleById']);
    Route::post('add', [VilleController::class, 'addVille']);
    Route::post('update/{id}', [VilleController::class, 'updateVille']);
    Route::delete('delete/{id}', [VilleController::class, 'deleteVille']);
});

Route::group(['prefix' => 'historiques'], function () {
    Route::get('getAll', [HistoriqueController::class, 'getHistoriques']);
});
Route::group(['prefix' => 'jourFerie'], function () {
    Route::get('getAll', [JourFerieController::class, 'getJoursFeries']);
    Route::get('getById/{id}', [JourFerieController::class, 'getJourFerieById']);
    Route::post('add', [JourFerieController::class, 'addJourFerie']);
    Route::post('update/{id}', [JourFerieController::class, 'updateJourFerie']);
    Route::delete('delete/{id}', [JourFerieController::class, 'deleteJourFerie']);
});

Route::group(['prefix' => 'soldes'], function () {
    Route::get('getAll', [SoldeController::class, 'getSoldes']);
    Route::post('add', [SoldeController::class, 'addSolde']);
    Route::post('update/{id}', [SoldeController::class, 'updateSolde']);
    Route::post('updateAnnee', [SoldeController::class, 'updateAnnee']);
    Route::post('addType', [SoldeController::class, 'addType']);
});

Route::group(['prefix' => 'soldeAutorisation'], function () {
    Route::get('getAll', [SoldeAutorisationController::class, 'getSoldesAutorisation']);
    Route::post('add', [SoldeAutorisationController::class, 'addSoldeAutorisation']);
});

Route::group(['prefix' => 'weekend'], function () {
    Route::post('update', [WeekendController::class, 'modifierParametreWeekend']);
    Route::get('getById/{id}', [WeekendController::class, 'getWeekendById']);
});

Route::group(['prefix' => 'repas'], function () {
    Route::post('update', [RepasController::class, 'modifierParametreRepas']);
    Route::get('getById/{id}', [RepasController::class, 'getRepasById']);
});
