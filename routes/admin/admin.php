<?php
use Inertia\Inertia;
use App\Http\Controllers\LandingContentController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\QuestionTypeController;

// Dashboard Routes for Admin
Route::get('/dashboard', fn () => Inertia::render('Dashboard'))->name('dashboard');

// Langindg Page Routes
Route::get('/admin/landing', [LandingContentController::class, 'edit'])->name('landing.edit');
Route::post('/admin/landing', [LandingContentController::class, 'update'])->name('landing.update');

Route::get('/admin', [UserController::class, 'getAdmins'])->name('admin.index');
Route::post('admins/store', [UserController::class, 'store'])->name('admins.store');
Route::put('admin/update/{id}', [UserController::class, 'update'])->name('admins.update');
Route::delete('admins/{admin}', [UserController::class, 'destroy'])->name('admins.destroy');

// Student Routes
Route::get('/student', [StudentController::class, 'index'])->name('students.index');
Route::post('/student/store', [StudentController::class, 'store'])->name('students.store');
Route::put('/student/update/{id}', [StudentController::class, 'update'])->name('students.update');
Route::delete('/student/{student}', [StudentController::class, 'destroy'])->name('students.destroy');
Route::put('/student/{student}', [StudentController::class, 'restore'])->name('students.restore');

// Subject Routes
Route::get('/admin/subject', [SubjectController::class, 'index'])->name('subject.index');
Route::post('/admin/subject/store', [SubjectController::class, 'store'])->name('subject.store');
Route::put('/admin/subject/update/{id}', [SubjectController::class, 'update'])->name('subject.update');
Route::delete('/admin/subject/destroy/{id}', [SubjectController::class, 'destroy'])->name('subject.destroy');

// Question Routes
Route::get('/admin/question', [QuestionController::class, 'index'])->name('question.index');
Route::get('/admin/question/subject/{id}', [QuestionController::class, 'getQuestions'])->name('question.subject');
Route::post('/admin/question/store', [QuestionController::class,'store'])->name('question.store');
Route::put('/admin/question/update/{id}', [QuestionController::class, 'update'])->name('question.update');
Route::delete('/admin/question/destroy/{id}', [QuestionController::class, 'destroy'])->name('question.destroy');
Route::post('/admin/question/import', [QuestionController::class,'import'])->name('question.import');
Route::get('/admin/question/export/{subjectId}',[QuestionController::class,'exportExcel'])->name('question.export');
Route::get('/admin/question/get/{typeId}/{levelId}',[QuestionController::class,'getQuestionSubjectType'])->name('question.show');
Route::put('/admin/type/update/{id}', [QuestionTypeController::class, 'update'])->name('type.update');
Route::put('/admin/question-multitask/update/{id}', [QuestionController::class, 'updateMultitask'])->name('question-multitask.update');

Route::post('/admin/question/savetest', [QuestionController::class,'generateTest'])->name('question.test');
Route::get('/admin/question/check-existence/{subjectId}/{levelId}/{typeId}', [QuestionController::class, 'checkIfTestExists']);


