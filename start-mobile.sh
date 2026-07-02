#!/bin/bash

# Starts the Expo mobile app, pointing it at the local API.
#
# Usage (from the repo root):
#   ./start-mobile.sh                 # Auto-detects the LAN IP
#   ./start-mobile.sh 192.168.1.5     # Uses a specific IP (physical device)

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

if [ ! -d app/node_modules ]; then
    echo "❌ Node dependencies missing"
    echo "   Run: cd app && pnpm install"
    exit 1
fi

if [ -z "$1" ]; then
    IP=$(detect_local_ip)
    if [ -z "$IP" ]; then
        echo "⚠️  Could not detect the LAN IP, using app/.env values..."
        echo ""
        (cd app && pnpm start -c)
        exit 0
    fi
    echo "📱 LAN IP detected automatically: $IP"
else
    IP="$1"
    echo "📱 Using IP: $IP"
fi

echo ""
echo "ℹ️  EXPO_PUBLIC_API_URL=http://$IP:8000/api"
echo ""
echo "💡 Make sure the API is running:"
if [ "$IP" != "127.0.0.1" ]; then
    echo "   ./start-api.sh $IP"
else
    echo "   ./start-api.sh"
fi
echo ""

cd app && EXPO_PUBLIC_API_URL="http://$IP:8000/api" pnpm start -c
