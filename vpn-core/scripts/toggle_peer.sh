#!/bin/bash
PUBLIC_KEY="$1"
ACTION="$2"
ALLOWED_IPS="$3"

if [ "$ACTION" = "activate" ]; then
  sudo wg set wg0 peer "$PUBLIC_KEY" allowed-ips "$ALLOWED_IPS"
elif [ "$ACTION" = "revoke" ]; then
  sudo wg set wg0 peer "$PUBLIC_KEY" remove
fi
sudo wg-quick save wg0
echo "{\"status\":\"ok\",\"action\":\"$ACTION\",\"publicKey\":\"$PUBLIC_KEY\"}"
