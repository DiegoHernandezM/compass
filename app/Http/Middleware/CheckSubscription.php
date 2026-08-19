<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckSubscription
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle($request, Closure $next)
    {
        $user = Auth::user();

        if ($user && $user->hasRole('student')) {
            $paypal = $user->paypal_user;
            $expired = ! $paypal || ! $paypal->expires_at || $paypal->expires_at->isPast();

            if ($expired) {
                session()->put('subscription_expired', true);

                if (! $request->routeIs('student.dashboard')) {
                    return redirect()->route('student.dashboard')
                        ->with('error', 'Tu suscripción ha expirado. Renuévala para continuar.');
                }
            } else {
                session()->forget('subscription_expired');
            }
        }

        return $next($request);
    }
}
