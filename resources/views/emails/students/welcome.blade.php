@component('mail::message')
# ¡Bienvenido a Compass, {{ $name }}! 🎉

Nos alegra tenerte como estudiante en nuestra plataforma.

## Datos de acceso:
- **Usuario (Email):** {{ $email }}
- **Contraseña:** {{ $password }}
- **Fecha de expiración:** {{ \Carbon\Carbon::parse($expires_at)->format('d/m/Y') }}

> Te recomendamos cambiar tu contraseña al iniciar sesión por primera vez.

@component('mail::button', ['url' => url('/login')])
Ingresar al sistema
@endcomponent

Si tienes alguna duda, no dudes en contactarnos.

Gracias,  
El equipo de **AviationInsight**
@endcomponent
