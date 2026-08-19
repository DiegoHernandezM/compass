<?php

namespace App\Console\Commands;

use App\Mail\SubscriptionExpirationReminderMail;
use App\Models\PayPalUser;
use App\Models\SubscriptionReminder;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Throwable;

class SendSubscriptionExpirationReminders extends Command
{
    protected $signature = 'subscriptions:send-expiration-reminders
        {--date= : Fecha de ejecución (Y-m-d), solo para pruebas/operación}
        {--user= : Limita el envío a un ID de usuario, solo para pruebas/operación}';

    protected $description = 'Envía recordatorios diarios a suscripciones que vencen dentro de los próximos 15 días';

    public function handle(): int
    {
        $today = $this->option('date') ? Carbon::parse($this->option('date'))->startOfDay() : today();
        $sent = 0;
        $failed = 0;

        $userId = $this->option('user');

        if ($userId !== null && (! ctype_digit((string) $userId) || (int) $userId < 1)) {
            $this->error('La opción --user debe ser un ID numérico válido.');

            return self::INVALID;
        }

        PayPalUser::query()
            ->with('user')
            ->when($userId, fn ($query) => $query->where('user_id', (int) $userId))
            ->whereNotNull('expires_at')
            ->whereDate('expires_at', '>', $today)
            ->whereDate('expires_at', '<=', $today->copy()->addDays(15))
            ->whereNotExists(function ($query) {
                $query->selectRaw('1')
                    ->from('paypal_user as newer_subscription')
                    ->whereColumn('newer_subscription.user_id', 'paypal_user.user_id')
                    ->where(function ($newer) {
                        $newer->whereColumn('newer_subscription.expires_at', '>', 'paypal_user.expires_at')
                            ->orWhere(function ($sameExpiration) {
                                $sameExpiration
                                    ->whereColumn('newer_subscription.expires_at', 'paypal_user.expires_at')
                                    ->whereColumn('newer_subscription.id', '>', 'paypal_user.id');
                            });
                    });
            })
            ->orderBy('id')
            ->each(function (PayPalUser $subscription) use ($today, &$failed, &$sent) {
                if (! $subscription->user || $subscription->user->trashed()) {
                    return;
                }

                $daysRemaining = (int) $today->diffInDays($subscription->expires_at->copy()->startOfDay());
                $reminder = SubscriptionReminder::firstOrCreate(
                    [
                        'paypal_user_id' => $subscription->id,
                        'reminder_date' => $today->toDateString(),
                    ],
                    ['days_remaining' => $daysRemaining],
                );

                if (! $reminder->wasRecentlyCreated && $reminder->sent_at) {
                    return;
                }

                try {
                    Mail::to($subscription->user->email)->send(
                        new SubscriptionExpirationReminderMail($subscription->user, $subscription, $daysRemaining)
                    );
                    $reminder->update(['sent_at' => now()]);
                    $sent++;
                } catch (Throwable $exception) {
                    $failed++;
                    if ($reminder->wasRecentlyCreated) {
                        $reminder->delete();
                    }

                    report($exception);
                    $this->error("No se pudo enviar a {$subscription->user->email}: {$exception->getMessage()}");
                }
            });

        $this->info("Recordatorios enviados: {$sent}");

        return $failed === 0 ? self::SUCCESS : self::FAILURE;
    }
}
