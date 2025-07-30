<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\MemoryIcon;

class MemoryIconsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $icons = [
            'Star',
            'WaterDrop',
            'SportsVolleyball',
            'Hub',
            'Recommend',
            'Square',
            'Favorite',
            'Bolt',
            'Waves',
            'EmojiEvents',
            'Rocket',
            'Pets',
            'Extension',
            'Anchor',
            'Diamond',
            'Cake',
            'CameraAlt',
            'EmojiNature',
            'Flight',
            'BeachAccess',
            'AcUnit',
            'Adb',
            'AirplanemodeActive',
            'AllInclusive',
            'Api',
            'Apple',
            'AutoAwesome',
            'Backpack',
            'BatteryChargingFull',
            'Bedtime',
            'BugReport',
            'Build',
            'Cabin',
            'Celebration',
            'Cloud',
            'Commute',
            'Construction',
            'Contrast',
            'Dashboard',
            'DarkMode',
            'DirectionsBoat',
            'ElectricCar',
            'EmojiObjects',
            'Engineering',
            'FireExtinguisher',
            'Flag',
            'Forest',
            'HealthAndSafety',
            'Headphones',
            'Icecream',
            'Landscape',
            'MapsUgc',
            'Nightlight'
        ];

        foreach ($icons as $icon) {
            MemoryIcon::create([
                'name' => $icon,
                'question_type_id' => 4,
            ]);
        }
    }
}
