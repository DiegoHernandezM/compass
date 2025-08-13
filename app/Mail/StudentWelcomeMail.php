<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StudentWelcomeMail extends Mailable
{
    use Queueable, SerializesModels;
    
    public $name;
    public $email;
    public $password;
    public $expires_at;
    
    /**
     * Create a new message instance.
     */
    public function __construct($name, $email, $password, $expires_at)
    {
        $this->name = $name;
        $this->email = $email;
        $this->password = $password;
        $this->expires_at = $expires_at;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Bienvenido a Compass')
            ->markdown('emails.students.welcome');
    }
}
