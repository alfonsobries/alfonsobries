@component('mail::message')
# {{ config('app.name')}} Contact Form

**Name:** {{ $name }}

**Email:** {{ $email }}

**Message:**

@component('mail::panel')
{{ $message }}
@endcomponent

@endcomponent
