import { ROLES } from './roles';
import { ACCOUNTS } from './accounts';

const MAX_FAILS = 3;
const LOCK_MS = 30000;
const fails = {};
const locks = {};

const clean = (v) => String(v == null ? '' : v).trim();

export function authenticate(role, typed, now = Date.now()) {
  const spec = ROLES[role];
  const account = ACCOUNTS[role];
  if (!spec || !account) return { ok: false, error: 'Unknown role.' };

  if (spec.special && locks[role] > now) {
    return { ok: false, lockedUntil: locks[role], error: 'Too many attempts. Wait a moment, then try again.' };
  }

  const matches = spec.credentials.every((field) => {
    const a = clean(typed[field.key]);
    const b = clean(account[field.key]);
    return field.key === 'id' ? a.toLowerCase() === b.toLowerCase() : a === b;
  });

  if (matches) {
    fails[role] = 0;
    return { ok: true, user: { role, id: account.id, name: account.name } };
  }

  if (spec.special) {
    fails[role] = (fails[role] || 0) + 1;
    if (fails[role] >= MAX_FAILS) {
      fails[role] = 0;
      locks[role] = now + LOCK_MS;
      return { ok: false, lockedUntil: locks[role], error: 'Too many attempts. Wait 30 seconds, then try again.' };
    }
    const left = MAX_FAILS - fails[role];
    return { ok: false, error: `Those details don't match. Check your ID, password and code. ${left} attempt${left === 1 ? '' : 's'} left.` };
  }
  return { ok: false, error: "That email or password doesn't match. Check both and try again." };
}

export function demoCredentials(role) {
  return { ...ACCOUNTS[role] };
}
