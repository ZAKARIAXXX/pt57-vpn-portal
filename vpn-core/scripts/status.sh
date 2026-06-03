#!/bin/bash
sudo wg show wg0 dump | tail -n +2 | while IFS=$'\t' read -r privateKey publicKey endpoint allowedIPs latestHandshake transferRx transferTx persistentKeepalive; do
  if [ "$publicKey" != "(none)" ]; then
    cat <<EOF
{
  "publicKey": "$publicKey",
  "endpoint": "$endpoint",
  "allowedIPs": "$allowedIPs",
  "latestHandshake": $latestHandshake,
  "transferRx": $transferRx,
  "transferTx": $transferTx,
  "persistentKeepalive": $persistentKeepalive
}
EOF
  fi
done
