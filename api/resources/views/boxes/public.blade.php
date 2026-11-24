<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="robots" content="noindex, nofollow">
    <meta name="color-scheme" content="light dark">
    <meta name="theme-color" content="#fbf1de" media="(prefers-color-scheme: light)">
    <meta name="theme-color" content="#1c1813" media="(prefers-color-scheme: dark)">
    <title>{{ $box->emoji }} {{ $box->name }} · {{ __('boxes.box') }}</title>
    <style>
        :root {
            --background: #fbf1de;
            --dots: #ecdcbc;
            --surface: #fffaf0;
            --border: #ead8b4;
            --foreground: #2b2318;
            --muted: #8a7756;
            --accent: #f5b83d;
            --accent-foreground: #2b2318;
            --placeholder: #f4e6c8;
            --shadow: rgba(80, 56, 16, 0.22);
        }

        @media (prefers-color-scheme: dark) {
            :root {
                --background: #1c1813;
                --dots: #2a241b;
                --surface: #26201a;
                --border: #3a3126;
                --foreground: #f6ecda;
                --muted: #b29f80;
                --accent: #f5b83d;
                --accent-foreground: #1c1813;
                --placeholder: #322a20;
                --shadow: rgba(0, 0, 0, 0.5);
            }
        }

        * { box-sizing: border-box; }

        body {
            margin: 0;
            min-height: 100vh;
            background-color: var(--background);
            background-image: radial-gradient(var(--dots) 1.2px, transparent 1.2px);
            background-size: 18px 18px;
            color: var(--foreground);
            font-family: ui-rounded, "SF Pro Rounded", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
            -webkit-font-smoothing: antialiased;
        }

        main {
            max-width: 720px;
            margin: 0 auto;
            padding: max(24px, env(safe-area-inset-top)) 16px max(40px, env(safe-area-inset-bottom));
        }

        .label {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 24px;
            padding: 20px 22px;
            box-shadow: 0 10px 30px -18px var(--shadow);
        }

        .heading {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .heading > div { min-width: 0; }

        .emoji {
            flex: none;
            width: 72px;
            height: 72px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 22px;
            background: var(--placeholder);
            font-size: 42px;
            line-height: 1;
        }

        .eyebrow {
            margin: 0;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: var(--muted);
        }

        h1 {
            margin: 6px 0 0;
            font-size: clamp(28px, 8vw, 40px);
            line-height: 1.1;
            font-weight: 800;
            overflow-wrap: anywhere;
        }

        .meta {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 14px;
        }

        .chip {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            border-radius: 999px;
            background: var(--placeholder);
            font-size: 15px;
            font-weight: 600;
        }

        .chip svg { width: 16px; height: 16px; flex: none; }

        .grid {
            list-style: none;
            margin: 28px 0 0;
            padding: 0;
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 28px 16px;
        }

        @media (min-width: 560px) {
            .grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }

        .item { text-align: center; }

        .sticker {
            position: relative;
            aspect-ratio: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            transform: rotate(var(--tilt, 0deg));
        }

        .item:nth-child(4n + 1) .sticker { --tilt: -3deg; }
        .item:nth-child(4n + 2) .sticker { --tilt: 2deg; }
        .item:nth-child(4n + 3) .sticker { --tilt: 3.5deg; }
        .item:nth-child(4n + 4) .sticker { --tilt: -1.5deg; }

        .sticker::before {
            content: "";
            position: absolute;
            inset: 11%;
            border-radius: 28px;
            background: var(--placeholder);
            transition: opacity 0.2s;
        }

        .sticker.loaded::before,
        .sticker.bare::before { opacity: 0; }

        .sticker img {
            position: relative;
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            filter: drop-shadow(0 6px 10px var(--shadow));
        }

        .sticker .initial {
            width: 78%;
            height: 78%;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 28px;
            background: var(--placeholder);
            border: 6px solid var(--surface);
            box-shadow: 0 6px 14px -6px var(--shadow);
            font-size: 44px;
            font-weight: 800;
            color: var(--muted);
        }

        .quantity {
            position: absolute;
            top: 2%;
            right: 2%;
            min-width: 34px;
            height: 34px;
            padding: 0 9px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 999px;
            background: var(--accent);
            color: var(--accent-foreground);
            font-size: 15px;
            font-weight: 800;
            transform: rotate(calc(var(--tilt, 0deg) * -1));
            box-shadow: 0 3px 8px -2px var(--shadow);
        }

        .name {
            margin: 12px 0 0;
            font-size: 17px;
            font-weight: 700;
            line-height: 1.25;
            overflow-wrap: anywhere;
        }

        .notes {
            margin: 4px 0 0;
            font-size: 14px;
            line-height: 1.35;
            color: var(--muted);
            overflow-wrap: anywhere;
        }

        .empty {
            margin-top: 48px;
            text-align: center;
            font-size: 18px;
            color: var(--muted);
        }

        .empty svg { width: 64px; height: 64px; margin-bottom: 8px; opacity: 0.7; }

        .open-app {
            display: flex;
            justify-content: center;
            margin-top: 40px;
        }

        .open-app a {
            display: inline-flex;
            align-items: center;
            min-height: 48px;
            padding: 0 22px;
            border-radius: 999px;
            border: 1px solid var(--border);
            background: var(--surface);
            color: var(--foreground);
            font-size: 16px;
            font-weight: 700;
            text-decoration: none;
        }

        .open-app a:focus-visible {
            outline: 3px solid var(--accent);
            outline-offset: 3px;
        }
    </style>
</head>
<body>
<main>
    <header class="label">
        <div class="heading">
            <span class="emoji" aria-hidden="true">{{ $box->emoji }}</span>
            <div>
                <p class="eyebrow">{{ __('boxes.box') }}</p>
                <h1>{{ $box->name }}</h1>
            </div>
        </div>
        <div class="meta">
            @if ($box->location)
                <span class="chip">
                    <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M128 64a40 40 0 1 0 40 40 40 40 0 0 0-40-40Zm0 64a24 24 0 1 1 24-24 24 24 0 0 1-24 24Zm0-112a88.1 88.1 0 0 0-88 88c0 31.4 14.51 64.68 42 96.25a254.19 254.19 0 0 0 41.45 38.3 8 8 0 0 0 9.18 0 254.19 254.19 0 0 0 41.37-38.3c27.45-31.57 42-64.85 42-96.25a88.1 88.1 0 0 0-88-88Zm0 206c-16.53-13-72-60.75-72-118a72 72 0 0 1 144 0c0 57.23-55.47 105-72 118Z"/></svg>
                    {{ $box->location }}
                </span>
            @endif
            <span class="chip">{{ trans_choice('boxes.items', $box->items->count()) }}</span>
        </div>
    </header>

    @if ($box->items->isEmpty())
        <div class="empty">
            <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M223.68 66.15 135.68 18a15.88 15.88 0 0 0-15.36 0l-88 48.17a16 16 0 0 0-8.32 14v95.64a16 16 0 0 0 8.32 14l88 48.17a15.88 15.88 0 0 0 15.36 0l88-48.17a16 16 0 0 0 8.32-14V80.18a16 16 0 0 0-8.32-14.03ZM128 32l80.34 44L128 120 47.66 76ZM40 90l80 43.78v85.79l-80-43.75Zm96 129.57v-85.75L216 90v85.78Z"/></svg>
            <p>{{ __('boxes.empty') }}</p>
        </div>
    @else
        <ul class="grid">
            @foreach ($box->items as $item)
                <li class="item">
                    <div class="sticker{{ $item->stickerUrl() ? '' : ' bare' }}">
                        @if ($url = $item->stickerUrl())
                            <img src="{{ $url }}" alt="" width="512" height="512" loading="lazy" decoding="async" onload="this.parentNode.classList.add('loaded')">
                        @else
                            <span class="initial" aria-hidden="true">{{ mb_strtoupper(mb_substr($item->name, 0, 1)) }}</span>
                        @endif
                        @if ($item->quantity > 1)
                            <span class="quantity" aria-label="{{ __('boxes.quantity', ['count' => $item->quantity]) }}">×{{ $item->quantity }}</span>
                        @endif
                    </div>
                    <p class="name">{{ $item->name }}</p>
                    @if ($item->notes)
                        <p class="notes">{{ $item->notes }}</p>
                    @endif
                </li>
            @endforeach
        </ul>
    @endif

    <div class="open-app">
        <a href="{{ $appUrl }}">{{ __('boxes.open_in_app') }}</a>
    </div>
</main>
</body>
</html>
