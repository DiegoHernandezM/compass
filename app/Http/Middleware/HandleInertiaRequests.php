<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user(),
            ],
            'subscription' => function () use ($request) {
                $user = $request->user();

                if (! $user || ! $user->hasRole('student')) {
                    return null;
                }

                $subscription = $user->paypal_user;
                $expiresAt = $subscription?->expires_at;
                $expired = ! $expiresAt || $expiresAt->isPast();
                $daysRemaining = $expiresAt && ! $expired
                    ? max(1, (int) now()->startOfDay()->diffInDays($expiresAt->copy()->startOfDay()))
                    : 0;

                return [
                    'expired' => $expired,
                    'expiresAt' => $expiresAt?->toIso8601String(),
                    'daysRemaining' => $daysRemaining,
                    'expiringSoon' => ! $expired && $daysRemaining <= 15,
                ];
            },
            'paypalClientId' => fn () => config('services.paypal.client_id'),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ]);
    }
}
