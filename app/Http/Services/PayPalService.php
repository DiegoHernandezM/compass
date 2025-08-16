<?php

namespace App\Http\Services;

use App\Mail\WelcomeStudentMail;
use App\Models\PayPalUser;
use App\Models\Student;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;
use App\Mail\StudentWelcomeMail;
use Illuminate\Support\Facades\Mail;

class PayPalService
{
    protected $mUser;
    protected $mPayPal;
    protected $mStudent;

    public function __construct()
    {
        $this->mUser = new User();
        $this->mPayPal = new PayPalUser();
        $this->mStudent = new Student();
    }


    public function create($request)
    {
        $password = $request->password ?? 'password';
        $user = $this->mUser->find((int)$request->order['reference_id']);
        $user->assignRole('student');
        if ($user->stand_by === 1) {
            $user->password = Hash::make($password);
            $user->stand_by = false;
            $user->save();
        }

        $createTime = Carbon::parse($request->order['payments']['captures'][0]['create_time'])->format('Y-m-d H:i:s');
        $expiresAt = Carbon::parse($createTime)->addYear()->format('Y-m-d H:i:s');

        $savedPayPalInfo = $this->mPayPal->create([
            'user_id' => (int)$request->order['reference_id'],
            'address' => json_encode($request->order['shipping']['address']),
            'amount' => $request->order['amount']['value'],
            'payment_id' => $request->order['payments']['captures'][0]['id'],
            'status' => $request->order['payments']['captures'][0]['status'],
            'create_time' => $createTime,
            'expires_at' => $expiresAt
        ]);

        if ($savedPayPalInfo) {
            $studentRegistered = $user->student;
            if (empty($studentRegistered)) {
                $student = $this->mStudent->create([
                    'name' => $user->name,
                    'address' => $request->order['shipping']['address']['address_line_1'],
                    'zip_code' => $request->order['shipping']['address']['postal_code'],
                    'city' => $request->order['shipping']['address']['admin_area_2'],
                    'user_id' => $user->id,
                ]);
                if ($student) {
                    Mail::to($user->email)->send(
                        new StudentWelcomeMail(
                            $student->name,
                            $user->email,
                            $password,
                            $savedPayPalInfo->expires_at
                        )
                    );
                }
            }
        }
        return "Estudiante registrado";
    }

    public function paymentRenovation($request)
    {
        $referenceId = $request->order['reference_id'] ?? null;
        $createTime = $request->order['payments']['captures'][0]['create_time'] ?? null;

        if ($referenceId && $createTime) {
            $carbonDate = Carbon::parse($createTime);
            $this->mPayPal->create([
                'user_id' => (int)$request->order['reference_id'],
                'address' => json_encode($request->order['shipping']['address']),
                'amount' => $request->order['amount']['value'],
                'payment_id' => $request->order['payments']['captures'][0]['id'],
                'status' => $request->order['payments']['captures'][0]['status'],
                'create_time' => $carbonDate->format('Y-m-d H:i:s'),
                'expires_at' => $carbonDate->addYear()->format('Y-m-d H:i:s')
            ]);
            return true;
        }
        return false;
    }
}
