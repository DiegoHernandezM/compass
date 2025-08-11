<?php

use App\Http\Middleware\CheckSubscription;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\LandingContentController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;


Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});





Route::middleware(['auth', 'role:student', CheckSubscription::class,])->group(function () {
    Route::get('/student-dashboard', function () {
        return Inertia::render('StudentDashboard', [
            'subscriptionExpired' => session('subscription_expired', false),
            'user' => Auth::user(),
            'clientId' => config('services.paypal.client_id')
        ]);
    })->name('student.dashboard');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

//Public Routes
Route::get('/landing-content', [LandingContentController::class, 'getContent'])->name('landing.content');

//Admin Routes
Route::middleware(['web', 'auth', 'role:admin'])->group(function () {
    require base_path('routes/admin/admin.php');
});
//Student Routes
Route::middleware(['auth', 'role:student'])->group(function () {
    require base_path('routes/student/student.php');
});

//End Student Routes

require base_path('routes/paypal/paypal.php');

require __DIR__ . '/auth.php';
