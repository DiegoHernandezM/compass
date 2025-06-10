<?php
use App\Http\Controllers\SubjectController;

Route::get('/student/subjects', [SubjectController::class, 'getSubjects'])->name('student.subject.index');
Route::get('/student/mock-test', fn () => dd('ok'));
Route::get('/student/progress', fn () => dd('ok'));