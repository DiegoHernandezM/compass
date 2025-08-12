<?php

use App\Http\Controllers\StudentController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\TestQuestionController;
use App\Http\Controllers\TestController;

Route::get('/student/profile', [StudentController::class, 'getInfoStudent'])->name('student.profile');
Route::get('/student/subjects', [SubjectController::class, 'getSubjects'])->name('student.subject.index');
Route::post('/student/test', [TestQuestionController::class, 'createTest'])->name('student.test.create');
Route::get('/student/test/{testId}/{subjectId}', [TestQuestionController::class, 'getTest'])->name('student.test.show');
Route::patch('/student/profile/update', [StudentController::class, 'updateProfile'])->name('student.profile.update');
Route::put('/student/password/update', [StudentController::class, 'updateStudentPassword'])->name('student.password.update');

Route::post('/student/showProgressTest', [TestQuestionController::class, 'showProgress'])->name('student.test.showProgress');
Route::get('/student/mock-test', fn () => dd('ok'));
Route::get('/student/progress', fn () => dd('ok'));


// Test answers
Route::post('/student/answer', [TestController::class,'saveAnswerNormal'])->name('answer.save');
