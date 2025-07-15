<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Services\QuestionFactoryService;

class CreateQuiestionsMathCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'compass:create-quiestions-math';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'crea preguntas de matemáticas';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $service = new QuestionFactoryService();
        $service->generateMathQuestions(1);
        return true;
    }
}
