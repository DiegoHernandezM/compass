@props(['url'])
<tr>
<td class="header">
<a href="{{ $url }}" style="display: inline-block;">
@if (trim($slot) === 'AIS-COMPASS')
<img src="{{ asset('assets/logos/ais-normal.png') }}" class="logo" alt="Compass">
@else
{!! $slot !!}
@endif
</a>
</td>
</tr>
