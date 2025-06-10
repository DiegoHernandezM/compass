<?php

use App\Http\Controllers\PayPalUserController;

Route::post('/paypal/paypal-payment', [PayPalUserController::class, 'create'])->name('paypal.create');
Route::get('/paypal-client-id', [PayPalUserController::class, 'getClientId']);
