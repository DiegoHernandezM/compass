@component('mail::message')
# Tu suscripción está por vencer

Hola, {{ $user->name }}.

Tu acceso a Compass vence el **{{ $subscription->expires_at->format('d/m/Y') }}**. Faltan **{{ $daysRemaining }} {{ $daysRemaining === 1 ? 'día' : 'días' }}**.

Renueva ahora para mantener el acceso a tus exámenes y resultados. Si renuevas antes del vencimiento, el nuevo año se agregará al tiempo que todavía tienes disponible.

Si ya renovaste, puedes ignorar este mensaje.

Gracias,  
El equipo de **AviationInsight**
@endcomponent
