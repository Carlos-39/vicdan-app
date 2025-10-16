import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';

const DEFAULT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);

async function hashPassword(plain: string, rounds = DEFAULT_ROUNDS) {
  return bcrypt.hash(plain, rounds);
}
async function comparePassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export { hashPassword, comparePassword };