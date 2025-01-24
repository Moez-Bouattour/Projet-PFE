<?php

namespace App\Mail;

use App\Models\Autorisation;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AutorisationAcceptMail extends Mailable
{
    use Queueable, SerializesModels;
    public $user;
    public $autorisation;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct(User $user , Autorisation $autorisation)
    {
        $this->autorisation = $autorisation;
        $this->user=$user;
    }





    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
{
    return $this->view('autorisation_accepte')
                ->subject("Confirmation : votre demande d'autorisation a été approuvée");
}

}
