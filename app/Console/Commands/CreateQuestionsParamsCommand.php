<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Services\ParamsFactoryService;

class CreateQuestionsParamsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'compass:create-quiestions-params';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Crea preguinras de parametros';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $service = new ParamsFactoryService();
        $service->generateMemoryVisualQuestions(5);
        return true;
    }
}
