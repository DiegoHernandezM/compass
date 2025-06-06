<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});



Route::middleware(['auth', 'role:student'])->group(function () {
    Route::get('/student-dashboard', fn () => Inertia::render('StudentDashboard'))->name('student.dashboard');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

//Admin Routes
Route::middleware(['web','auth', 'role:admin'])->group(function () {
    require base_path('routes/admin/admin.php');
});
//Student Routes
Route::middleware(['auth', 'role:student'])->group(function () {
    require base_path('routes/student/student.php');
});

//End Student Routes

require __DIR__.'/auth.php';
