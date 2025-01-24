@component('mail::message')
# Demande de changement de mot de passe

Cliquez sur le bouton ci-dessous pour changer votre mot de passe :

@component('mail::button', ['url' => 'http://localhost:4200/changePassword?token='.$token])
Réinitialiser le mot de passe
@endcomponent

Merci,<br>
{{ config('app.name') }}
@endcomponent

