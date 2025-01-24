<?php

namespace App\Mail;

use App\Models\Ordre_de_mission;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrdreRefusMail extends Mailable
{
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
    public function __construct(User $user , Ordre_de_mission $ordre)
    {
        $this->ordre = $ordre;
        $this->user=$user;
    }



    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
{
    return $this->view('ordre_refus')
                ->subject("Refus : votre demande d'autorisation n'a pas été approuvée");
}

}
