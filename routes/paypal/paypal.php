<?php

use App\Http\Controllers\PayPalUserController;

Route::post('/paypal/paypal-payment', [PayPalUserController::class, 'create'])->name('paypal.create');
Route::post('/paypal/paypal-payment-renovation', [PayPalUserController::class, 'renovation'])->name('paypal.renovation');
Route::get('/paypal-client-id', [PayPalUserController::class, 'getClientId']);
