<?php

namespace App\Mail;

use App\Models\PayPalUser;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SubscriptionExpirationReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public PayPalUser $subscription,
        public int $daysRemaining,
    ) {}

    public function build(): self
    {
        return $this->subject("Tu suscripción de Compass vence en {$this->daysRemaining} días")
            ->markdown('emails.subscriptions.expiration-reminder');
    }
}
