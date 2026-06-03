#!/bin/bash
PUBLIC_KEY="$1"
ALLOWED_IPS="$2"
sudo wg set wg0 peer "$PUBLIC_KEY" allowed-ips "$ALLOWED_IPS"
sudo wg-quick save wg0
echo "{\"status\":\"ok\",\"publicKey\":\"$PUBLIC_KEY\",\"allowedIPs\":\"$ALLOWED_IPS\"}"
