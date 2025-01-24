<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Demande d'autorisation : Statut de la demande</title>
</head>
<body>
    <p>Bonjour {{ $user->name }},</p>

    <p>Malheureusement, votre demande d'autorisation n'a pas été approuvée. Nous avons dû refuser votre demande pour les raisons suivantes : il y a déjà un utilisateur ayant une autorisation chevauchée dans votre département. Nous vous encourageons à nous contacter si vous avez besoin de plus d'informations ou si vous souhaitez discuter de cette décision.</p>

    <p>Cordialement,</p>
    <p>Votre équipe RH</p>
</body>
</html>
