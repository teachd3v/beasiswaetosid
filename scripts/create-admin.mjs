#!/usr/bin/env node
/**
 * Generate SQL statement untuk membuat / memperbarui akun admin di D1.
 *
 * Penggunaan:
 *   node scripts/create-admin.mjs admin@etos-id.net "PasswordKuat123!" "Admin ETOS ID" superadmin
 *
 * Output SQL dapat langsung dieksekusi dengan:
 *   npx wrangler d1 execute beasiswaetosid-db --local --command "<SQL>"
 *   npx wrangler d1 execute beasiswaetosid-db --remote --command "<SQL>"
 */
import crypto from 'node:crypto';

const ITERATIONS = 100_000;
const KEY_LENGTH = 32;
const DIGEST = 'sha256';

const [, , emailArg, passwordArg, nameArg = 'Admin ETOS ID', roleArg = 'superadmin'] = process.argv;

if (!emailArg || !passwordArg) {
  console.error(
    'Usage: node scripts/create-admin.mjs <email> <password> [name] [superadmin|editor]',
  );
  process.exit(1);
}

if (passwordArg.length < 8) {
  console.error('Error: Password minimal 8 karakter.');
  process.exit(1);
}

const role = roleArg === 'editor' ? 'editor' : 'superadmin';
const email = emailArg.trim().toLowerCase();
const salt = crypto.randomBytes(16);
const derived = crypto.pbkdf2Sync(passwordArg, salt, ITERATIONS, KEY_LENGTH, DIGEST);
const passwordHash = `pbkdf2$${ITERATIONS}$${salt.toString('hex')}$${derived.toString('hex')}`;
const id = `adm-${crypto.randomUUID().slice(0, 8)}`;

const esc = (v) => String(v).replace(/'/g, "''");

const sql = `INSERT INTO admin_users (id, email, name, password_hash, role, is_active) VALUES ('${esc(id)}', '${esc(email)}', '${esc(nameArg)}', '${esc(passwordHash)}', '${role}', 1) ON CONFLICT(email) DO UPDATE SET name = excluded.name, password_hash = excluded.password_hash, role = excluded.role, is_active = 1;`;

console.log(sql);
