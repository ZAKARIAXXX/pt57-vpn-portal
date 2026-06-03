import crypto from 'crypto';

/**
 * Generates a mock public and private key pair for WireGuard.
 * Returns valid-looking Base64 strings.
 */
export function generateWireGuardKeys(): { publicKey: string; privateKey: string } {
  const privateKey = crypto.randomBytes(32).toString('base64');
  const publicKey = crypto.randomBytes(32).toString('base64');
  return { publicKey, privateKey };
}

/**
 * Generates the WireGuard peer configuration string (.conf).
 */
export function generateClientConfig(allowedIPs: string, clientPrivateKey: string, serverPublicKey: string = 'wgServerPublicKeyDefault12345='): string {
  return `[Interface]
PrivateKey = ${clientPrivateKey}
Address = ${allowedIPs}
DNS = 1.1.1.1

[Peer]
PublicKey = ${serverPublicKey}
Endpoint = vpn.enterprise.com:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25`;
}
