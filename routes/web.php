<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\LandingContentController;
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

Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/admin/landing', [LandingContentController::class, 'edit'])->name('landing.edit');
    Route::post('/admin/landing', [LandingContentController::class, 'update'])->name('landing.update');
});

Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('Dashboard'))->name('dashboard');
});

Route::middleware(['auth', 'role:student'])->group(function () {
    Route::get('/student-dashboard', fn () => Inertia::render('StudentDashboard'))->name('student.dashboard');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

//Administrator Routes
Route::get('/admin', [UserController::class, 'getAdmins'])->name('admin.index');
Route::get('/student', [UserController::class, 'getStudents'])->name('students.index');

//End Administrator Routes

//Student Routes
Route::middleware(['auth', 'role:student'])->group(function () {
    Route::get('/student/subjects', fn () => dd('ok'));
    Route::get('/student/mock-test', fn () => dd('ok'));
    Route::get('/student/progress', fn () => dd('ok'));
});

//End Student Routes

require __DIR__.'/auth.php';
