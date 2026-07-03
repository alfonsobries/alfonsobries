#!/bin/bash

# Starts the Laravel API for local development.
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

mkdir -p logs
# Start each run with empty logs so what you see belongs to this session.
LOG_FILES=(logs/api.log api/storage/logs/laravel.log)
rm -f "${LOG_FILES[@]}"
touch "${LOG_FILES[@]}"

cleanup() {
    echo ""
    echo "🛑 Stopping the API..."
    kill "$API_PID" 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM SIGHUP

echo "📡 Starting Laravel API (http://$IP:8000)..."
(cd api && APP_URL="http://$IP:8000" php artisan serve --host="$IP" > ../logs/api.log 2>&1) &
API_PID=$!

sleep 2

echo ""
echo "✨ API running:"
echo "   - API:     http://$IP:8000"
echo "   - Health:  curl http://$IP:8000/api/status"
echo ""
echo "📱 Mobile app (in another terminal):"
if [ "$IP" != "127.0.0.1" ]; then
    echo "   ./start-mobile.sh $IP"
else
    echo "   ./start-mobile.sh"
fi
echo ""
echo "Press Ctrl+C to stop."
echo ""

if command -v multitail &>/dev/null; then
    multitail -s 2 -t "API" logs/api.log -t "Laravel" api/storage/logs/laravel.log
else
    tail -f "${LOG_FILES[@]}"
fi
