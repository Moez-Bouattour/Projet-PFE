<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Demande d'autorisation : Statut de la demande</title>
</head>
<body>
    <p>Bonjour {{ $user->name }},</p>

    <p>Nous sommes ravis de vous informer que votre demande d'autorisation a été approuvé avec succès. Vous pouvez maintenant procéder en toute confiance avec votre plan d'autorisation. Voici les détails :</p>

    <ul>
        <li>Date de sortie : {{ $autorisation->Date_sortie }} </li>
        <li>Heure début : {{ substr($autorisation->Heure_debut, 0, 5) }} </li>
        <li>Heure fin : {{ substr($autorisation->Heure_fin, 0, 5) }} </li>
        <li>Durée : {{ formatDuree($autorisation->Duree) }}</li>
        <li>Raison : {{ $autorisation->raison }} </li>
    </ul>

    <p>Cordialement,</p>
    <p>Votre équipe RH</p>

    <?php
    function formatDuree($dureeEnMinutes) {
        if ($dureeEnMinutes === 0) {
            return "0 heure 0 minute";
        }

        $heures = floor($dureeEnMinutes / 60);
        $minutes = $dureeEnMinutes % 60;

        $formattedDuree = '';
        if ($heures > 0) {
            $formattedDuree .= $heures . ' heure';
            if ($heures > 1) {
                $formattedDuree .= 's';
            }
        }
        if ($minutes > 0) {
            if ($heures > 0) {
                $formattedDuree .= ' ';
            }
            $formattedDuree .= $minutes . ' minute';
            if ($minutes > 1) {
                $formattedDuree .= 's';
            }
        }

        return $formattedDuree;
    }
    ?>

</body>
</html>
