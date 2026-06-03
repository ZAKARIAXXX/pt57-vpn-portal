import crypto from 'crypto';
import { exec } from 'child_process';

const WG_HOST = process.env.WG_HOST || '192.168.17.132';
const WG_SCRIPTS = '/home/kali/vpn-core/scripts';

function ssh(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(`ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 kali@${WG_HOST} "${cmd}"`, (err, stdout, stderr) => {
      if (err) { reject(new Error(stderr || err.message)); return; }
      resolve(stdout.trim());
    });
  });
}

export function generateWireGuardKeys(): { publicKey: string; privateKey: string } {
  const privateKey = crypto.randomBytes(32).toString('base64');
  const publicKey = crypto.randomBytes(32).toString('base64');
  return { publicKey, privateKey };
}

export function generateClientConfig(allowedIPs: string, clientPrivateKey: string, serverPublicKey: string): string {
  return `[Interface]
PrivateKey = ${clientPrivateKey}
Address = ${allowedIPs}
DNS = 1.1.1.1

[Peer]
PublicKey = ${serverPublicKey}
Endpoint = ${WG_HOST}:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25`;
}

export async function fetchWireGuardStatus(): Promise<{ vpnStatus: string; totalPeers: number; activePeers: number; totalTxBytes: number; totalRxBytes: number }> {
  try {
    const raw = await ssh(`bash ${WG_SCRIPTS}/status.sh`);
    const lines = raw.trim().split('\n').filter(l => l.startsWith('{'));
    const peers = lines.map(l => JSON.parse(l));
    const active = peers.filter(p => p.latestHandshake !== 0);
    return {
      vpnStatus: 'ACTIVE',
      totalPeers: peers.length,
      activePeers: active.length,
      totalTxBytes: peers.reduce((s, p) => s + (Number(p.transferTx) || 0), 0),
      totalRxBytes: peers.reduce((s, p) => s + (Number(p.transferRx) || 0), 0),
    };
  } catch {
    return { vpnStatus: 'ACTIVE', totalPeers: 0, activePeers: 0, totalTxBytes: 0, totalRxBytes: 0 };
  }
}

export interface LivePeer {
  publicKey: string;
  txBytes: number;
  rxBytes: number;
  latestHandshake: number;
  endpoint: string;
  allowedIPs: string;
}

export async function fetchPeerTraffic(): Promise<LivePeer[]> {
  try {
    const raw = await ssh(`bash ${WG_SCRIPTS}/status.sh`);
    const lines = raw.trim().split('\n').filter(l => l.startsWith('{'));
    return lines.map(l => JSON.parse(l)).map((p: any) => ({
      publicKey: p.publicKey,
      txBytes: Number(p.transferTx) || 0,
      rxBytes: Number(p.transferRx) || 0,
      latestHandshake: Number(p.latestHandshake) || 0,
      endpoint: p.endpoint || '',
      allowedIPs: p.allowedIPs && p.allowedIPs !== '(none)' ? p.allowedIPs : '',
    }));
  } catch {
    return [];
  }
}

export async function addWireGuardPeer(publicKey: string, allowedIPs: string): Promise<void> {
  await ssh(`bash ${WG_SCRIPTS}/add_peer.sh "${publicKey}" "${allowedIPs}"`);
}

export async function removeWireGuardPeer(publicKey: string): Promise<void> {
  await ssh(`bash ${WG_SCRIPTS}/remove_peer.sh "${publicKey}"`);
}

export async function toggleWireGuardPeer(publicKey: string, action: 'activate' | 'revoke', allowedIPs?: string): Promise<void> {
  const ips = allowedIPs || '10.8.0.0/24';
  await ssh(`bash ${WG_SCRIPTS}/toggle_peer.sh "${publicKey}" "${action}" "${ips}"`);
}
