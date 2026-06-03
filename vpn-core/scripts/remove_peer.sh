#!/bin/bash
PUBLIC_KEY="$1"
sudo wg set wg0 peer "$PUBLIC_KEY" remove
sudo wg-quick save wg0
echo "{\"status\":\"ok\",\"publicKey\":\"$PUBLIC_KEY\"}"
