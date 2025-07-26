<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Services\MultitaskQuestionFactoryService;

class CreateQuestionsMultitaskCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'compass:create-questions-multitask';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Crea preguntas multitasking para examenes';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $service = new MultitaskQuestionFactoryService();
        $service->generate();
        return true;
    }
}
