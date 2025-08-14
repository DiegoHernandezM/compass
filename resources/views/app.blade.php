<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <link rel="manifest" href="/manifest.webmanifest">
        <meta name="theme-color" content="#0ea5e9">
        <link rel="apple-touch-icon" href="/assets/logos/logo-ais192x192.png">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx'])
        @inertiaHead
        <link rel="manifest" href="/manifest.json">
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
