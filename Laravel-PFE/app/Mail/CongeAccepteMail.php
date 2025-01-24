<?php

namespace App\Mail;

use App\Models\TypeCongé;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

use App\Models\Congé;
use App\Models\User;

class CongeAccepteMail extends Mailable
{
    use Queueable, SerializesModels;

    public $conge;
    public $user;
    public $typeConge;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct(User $user , Congé $conge,TypeCongé $typeConge)
    {
        $this->conge = $conge;
        $this->user=$user;
        $this->typeConge = $typeConge;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->view('conge_accepte')
                    ->subject("Confirmation : votre demande de congé a été approuvée");

    }
}
