<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

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
            $paypal = $user->paypal_user()->latest()->first();

            if (!$paypal || ($paypal->expires_at && Carbon::parse($paypal->expires_at)->isPast())) {
                session()->put('subscription_expired', true);
            } else {
                session()->forget('subscription_expired');
            }
        }

        return $next($request);
    }
}
