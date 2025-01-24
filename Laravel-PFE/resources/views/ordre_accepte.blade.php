<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Demande de déplacement : Statut de la demande</title>
</head>
<body>
    <p>Bonjour {{ $user->name }},</p>

    <p>Nous sommes ravis de vous informer que votre demande de déplacement a été approuvé avec succès. Vous pouvez maintenant procéder en toute confiance avec votre plan de déplacement. Voici les détails :</p>

    <ul>
        <li>Voiture  : {{ $voiture->nom_voiture }} </li>
        <li>Date de sortie  : {{ $ordre->Date_sortie }} </li>
        <li>Date de retour  : {{ $ordre->Date_retour }} </li>
        <li>Ville de départ : {{$ville->nom_ville}} </li>
        <li>Ville de déstination : {{ $ville_destination->nom_ville }} </li>
    </ul>

    <p>Cordialement,</p>
    <p>Votre équipe RH</p>

</body>
</html>
