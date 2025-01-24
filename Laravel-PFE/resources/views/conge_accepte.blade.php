<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Demande de congé : Statut de la demande</title>
</head>
<body>
    <p>Bonjour {{ $user->name }},</p>

    <p>Nous sommes ravis de vous informer que votre demande de congé a été approuvé avec succès. Vous pouvez maintenant procéder en toute confiance avec votre plan de congé. Voici les détails :</p>
    <ul>
        <li>Type de congé : {{ $typeConge->type_nom_conge }}</li>
        <li>Date début : {{ $conge->date_debut_conge }} </li>
        <li>Date reprise : {{ $conge->date_fin_conge }} </li>
        <li>Durée : {{ $conge->duree }} jours</li>
    </ul>
    <p>Cordialement,</p>
    <p>Votre équipe RH</p>
</body>
</html>
