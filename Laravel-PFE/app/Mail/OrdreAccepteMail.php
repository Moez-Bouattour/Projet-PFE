<?php

namespace App\Mail;

use App\Models\Ordre_de_mission;
use App\Models\User;
use App\Models\Ville;
use App\Models\Voiture;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrdreAccepteMail extends Mailable
{
    use Queueable, SerializesModels;
    public $user;
    public $ordre;
    public $ville;
    public $ville_destination;
    public $voiture;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct(User $user , Ordre_de_mission $ordre,Ville $ville,Ville $ville_destination,Voiture $voiture)
    {
        $this->ordre = $ordre;
        $this->user=$user;
        $this->ville=$ville;
        $this->ville_destination=$ville_destination;
        $this->voiture=$voiture;
    }



    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
{
    return $this->view('ordre_accepte')
                ->subject("Confirmation : votre demande de déplacement a été approuvée");
}

}
