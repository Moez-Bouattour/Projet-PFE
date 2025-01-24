<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\ChangePasswordRequest;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class ChangePasswordController extends Controller
{
    public function process(ChangePasswordRequest $request)
    {
        return $this->getPasswordResetTableRow($request)->count() > 0 ? $this->changePassword($request) : $this->tokenNotFoundResponse();
    }

    private function getPasswordResetTableRow($request)
    {
        return DB::table('password_reset_tokens')->where(['email' => $request->email,'token'=>$request->resetToken]);
    }

    private function tokenNotFoundResponse()
    {
        return response()->json(['message' => "le jeton ou l'email est incorrect"], Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    private function changePassword($request)
    {
        $user = User::whereEmail($request->email)->first();
        $user->update(['password'=>bcrypt($request->password)]);
        $this->getPasswordResetTableRow($request)->delete();
        return response()->json(['data'=>'Mot de passe modifié avec succès'],Response::HTTP_CREATED);
    }
}
