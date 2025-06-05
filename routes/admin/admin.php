<?php
use Inertia\Inertia;
use App\Http\Controllers\LandingContentController;
use App\Http\Controllers\UserController;

// Dashboard Routes for Admin
Route::get('/dashboard', fn () => Inertia::render('Dashboard'))->name('dashboard');

// Langindg Page Routes
Route::get('/admin/landing', [LandingContentController::class, 'edit'])->name('landing.edit');
Route::post('/admin/landing', [LandingContentController::class, 'update'])->name('landing.update');

Route::get('/admin', [UserController::class, 'getAdmins'])->name('admin.index');
Route::post('admins/store', [UserController::class, 'store'])->name('admins.store');
Route::put('admins/update/{id}', [UserController::class, 'update'])->name('admins.update');
Route::delete('admins/{admin}', [UserController::class, 'destroy'])->name('admins.destroy');

Route::get('/student', [UserController::class, 'getStudents'])->name('students.index');