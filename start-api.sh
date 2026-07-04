#!/bin/bash

# Starts the local API stack: Laravel (artisan serve), Horizon (queue worker,
# needed for the AI illustration jobs) and the scheduler.
#
# Usage (from the repo root):
#   ./start-api.sh                 # Auto-detects the LAN IP
#   ./start-api.sh 192.168.1.5     # Uses a specific IP (physical device)
#   ./start-api.sh 127.0.0.1       # Local only (simulator / web)

# Detects the IP of the interface with internet access — the one a physical
# device on the same network can reach.
detect_local_ip() {
    local iface ip

    iface=$(route get default 2>/dev/null | awk '/interface: /{print $2}')
    if [ -n "$iface" ]; then
        ip=$(ipconfig getifaddr "$iface" 2>/dev/null)
    fi

    if [ -z "$ip" ]; then
        for iface in en0 en1; do
            ip=$(ipconfig getifaddr "$iface" 2>/dev/null)
            [ -n "$ip" ] && break
        done
    fi

    echo "$ip"
}

if [ -z "$1" ]; then
    IP=$(detect_local_ip)
    if [ -z "$IP" ]; then
        IP="127.0.0.1"
        echo "⚠️  Could not detect the LAN IP, using local mode: $IP"
    else
        echo "📡 LAN IP detected automatically: $IP"
    fi
else
    IP="$1"
    echo "📡 Using IP: $IP"
fi
echo ""

if [ ! -f api/.env ]; then
    echo "❌ api/.env not found"
    echo "   Copy the example and configure it first:"
    echo "   cp api/.env.example api/.env && (cd api && php artisan key:generate)"
    exit 1
fi

if [ ! -d api/vendor ]; then
    echo "❌ Laravel dependencies missing"
    echo "   Run: cd api && composer install"
    exit 1
fi

# Horizon queues live in Redis; without it the illustration jobs never run.
if ! (cd api && php artisan tinker --execute='Illuminate\Support\Facades\Redis::connection()->ping();' >/dev/null 2>&1); then
    echo "⚠️  Redis doesn't answer — Horizon needs it (brew services start redis)."
fi

mkdir -p logs
# Start each run with empty logs so what you see belongs to this session.
LOG_FILES=(logs/api.log logs/horizon.log logs/schedule.log api/storage/logs/laravel.log)
rm -f "${LOG_FILES[@]}"
touch "${LOG_FILES[@]}"

PIDS=()

cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    for pid in "${PIDS[@]}"; do
        kill "$pid" 2>/dev/null || true
    done
    wait 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM SIGHUP

echo "📡 Starting Laravel API (http://$IP:8000)..."
(cd api && APP_URL="http://$IP:8000" php artisan serve --host="$IP" > ../logs/api.log 2>&1) &
PIDS+=($!)

echo "⚙️  Starting Laravel Horizon..."
(cd api && APP_URL="http://$IP:8000" php artisan horizon > ../logs/horizon.log 2>&1) &
PIDS+=($!)

echo "⏰ Starting Laravel scheduler..."
(cd api && APP_URL="http://$IP:8000" php artisan schedule:work > ../logs/schedule.log 2>&1) &
PIDS+=($!)

sleep 2

echo ""
echo "✨ Services running:"
echo "   - API:     http://$IP:8000"
echo "   - Health:  curl http://$IP:8000/api/status"
echo "   - Horizon: http://$IP:8000/horizon"
echo ""
echo "📱 Mobile app (in another terminal):"
if [ "$IP" != "127.0.0.1" ]; then
    echo "   ./start-mobile.sh $IP"
else
    echo "   ./start-mobile.sh"
fi
echo ""
echo "Logs:"
echo "   - API:      logs/api.log"
echo "   - Horizon:  logs/horizon.log"
echo "   - Schedule: logs/schedule.log"
echo "   - Laravel:  api/storage/logs/laravel.log"
echo ""
echo "Press Ctrl+C to stop."
echo ""

if command -v multitail &>/dev/null; then
    multitail -s 2 -t "API" logs/api.log -t "Horizon" logs/horizon.log -t "Schedule" logs/schedule.log -t "Laravel" api/storage/logs/laravel.log
else
    tail -f "${LOG_FILES[@]}"
fi
