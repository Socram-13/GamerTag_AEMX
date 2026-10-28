// Lee /users de Firebase (llave de servicio) y escribe game/mictlan/users.json solo con los campos que usa el mapa
import admin from 'firebase-admin';
import { writeFileSync, mkdirSync } from 'node:fs';

const sa = JSON.parse(process.env.FIREBASE_SA);
admin.initializeApp({
  credential: admin.credential.cert(sa),
  databaseURL: process.env.DB_URL || 'https://aemx-chat-default-rtdb.firebaseio.com',
});
const snap = await admin.database().ref('users').once('value');
const all = snap.val() || {};
const out = {};
for (const [uid, u] of Object.entries(all)) {
  if (!u || typeof u !== 'object') continue;
  out[uid] = {
    username: u.username || '',
    country: u.country || '',
    city: u.city || '',
    bannedLeaderboard: u.bannedLeaderboard === true,
    common: Number(u.common) || 0,
    rare: Number(u.rare) || 0,
    epic: Number(u.epic) || 0,
    legendary: Number(u.legendary) || 0,
    updatedAt: Number(u.updatedAt) || 0,
  };
}
if (!Object.keys(out).length) { console.error('Sin usuarios: no se escribe'); process.exit(1); }
mkdirSync('game/mictlan', { recursive: true });
writeFileSync('game/mictlan/users.json', JSON.stringify(out));
console.log('Usuarios exportados:', Object.keys(out).length);
process.exit(0);
