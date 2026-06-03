#!/bin/bash
sudo wg show wg0 dump | tail -n +2 | awk -F'\t' '{
  pubKey = $1
  if (pubKey != "" && pubKey != "(none)") {
    endpoint = $2
    allowedIps = $4
    handshake = ($5 == "(none)" || $5 == "") ? 0 : $5
    rx = ($6 == "" || $6 == "(none)") ? 0 : $6
    tx = ($7 == "" || $7 == "(none)") ? 0 : $7
    printf "{\"publicKey\":\"%s\",\"endpoint\":\"%s\",\"allowedIPs\":\"%s\",\"latestHandshake\":%s,\"transferRx\":%s,\"transferTx\":%s}\n", pubKey, endpoint, allowedIps, handshake, rx, tx
  }
}'
