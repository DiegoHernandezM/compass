<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use App\Http\Controllers\Controller;

class ZipLookupController extends Controller
{
    public function lookup(Request $request)
    {
        $request->validate([
            'zip'     => 'required|string|max:15',
            'country' => 'nullable|string|size:2', // ej. "mx", "us"
        ]);

        $zip     = $request->string('zip')->toString();
        $country = strtolower($request->input('country', 'mx'));

        // cache 1 día
        $cacheKey = "zip_lookup:{$country}:{$zip}";
        return Cache::remember($cacheKey, now()->addDay(), function () use ($country, $zip) {

            // ---- Opción 1: Zippopotam (normalizamos respuesta) ----
            $url = "https://api.zippopotam.us/{$country}/{$zip}";
            $resp = Http::timeout(6)->acceptJson()->get($url);

            if ($resp->successful()) {
                $data = $resp->json();

                // Normalizar a {country, cities[]}
                $countryName = $data['country'] ?? strtoupper($country);
                $cities = collect($data['places'] ?? [])
                    ->map(fn($p) => $p['place name'] ?? null)
                    ->filter()
                    ->unique()
                    ->values()
                    ->all();

                return response()->json([
                    'country' => $countryName,
                    'cities'  => $cities,
                    'source'  => 'zippopotam',
                ]);
            }

            // ---- Opción 2: SEPOMEX (por si algún país falla) ----
            // $url = "https://api-sepomex.hckdrk.mx/query/info_cp/{$zip}?type=simplified";
            // $resp = Http::timeout(6)->acceptJson()->get($url);
            // if ($resp->successful()) {
            //     $data = $resp->json();
            //     $cities = collect($data['response']['municipio'] ?? [])
            //         ->flatten()->unique()->values()->all();
            //     return response()->json([
            //         'country' => 'México',
            //         'cities'  => $cities,
            //         'source'  => 'sepomex',
            //     ]);
            // }

            // Si todo falla:
            return response()->json([
                'country' => null,
                'cities'  => [],
                'source'  => 'none',
            ], 404);
        });
    }
}
