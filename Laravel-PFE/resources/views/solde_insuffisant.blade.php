<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Demande de congé : Statut de la demande</title>
</head>
<body>
    <p>Bonjour {{ $user->name }},</p>

    <p>Malheureusement, votre demande de congé {{ $typeCongé->type_nom_conge }} n'a pas été approuvé. Nous avons dû refuser votre demande pour les raisons suivantes : votre solde de congé est insuffisant.

        Nous vous encourageons à nous contacter si vous avez besoin de plus d'informations ou si vous souhaitez discuter de cette décision.</p>

    <p>Cordialement,</p>
    <p>Votre équipe RH</p>
</body>
</html>
