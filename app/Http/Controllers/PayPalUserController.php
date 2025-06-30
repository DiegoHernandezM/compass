<?php

namespace App\Http\Controllers;

use App\Http\Services\PayPalService;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class PayPalUserController
{

    /**
     * Store a newly created resource in storage.
     */
    public function create(Request $request, PayPalService $service)
    {
        try {
            $service->create($request);
            $userId = $request->order['reference_id'] ?? null;
            if ($userId) {
                $user = User::find($userId);
                if ($user) {
                    Auth::login($user);
                    $request->session()->regenerate();
                }
            }
            return response()->json(['success' => true, 'message' => 'Pago procesado exitosamente']);
        } catch(\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function renovation(Request $request, PayPalService $service)
    {
        try {
            $service->paymentRenovation($request);
            $userId = $request->order['reference_id'] ?? null;
            if ($userId) {
                $user = User::find($userId);
                if ($user) {
                    Auth::login($user);
                    $request->session()->regenerate();
                }
            }
            return response()->json(['success' => true, 'message' => 'Pago procesado exitosamente']);
        } catch(\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function getClientId()
    {
        return response()->json([
            'client_id' => config('services.paypal.client_id')
        ]);
    }

}
