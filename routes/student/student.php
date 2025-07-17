<?php
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\TestQuestionController;

Route::get('/student/subjects', [SubjectController::class, 'getSubjects'])->name('student.subject.index');
Route::post('/student/test', [TestQuestionController::class, 'createTest'])->name('student.test.create');
Route::get('/student/test/{testId}', [TestQuestionController::class, 'getTest'])->name('student.test.show');

Route::post('/student/showProgressTest', [TestQuestionController::class, 'showProgress'])->name('student.test.showProgress');
Route::get('/student/mock-test', fn () => dd('ok'));
Route::get('/student/progress', fn () => dd('ok'));