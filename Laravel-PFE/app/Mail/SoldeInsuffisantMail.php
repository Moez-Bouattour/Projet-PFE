<?php

namespace App\Mail;

use App\Models\User;
use App\Models\Congé;
use App\Models\TypeCongé;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SoldeInsuffisantMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $congé;
    public $typeCongé;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct(User $user, Congé $congé, TypeCongé $typeCongé)
    {
        $this->user = $user;
        $this->congé = $congé;
        $this->typeCongé = $typeCongé;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->view('solde_insuffisant')
                    ->subject("Refus : votre demande de congé n'a pas été approuvée");
    }
}
