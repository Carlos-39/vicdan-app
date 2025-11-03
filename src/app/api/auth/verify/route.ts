// src/app/api/auth/verify/route.ts
import { NextResponse } from 'next/server';
import { getTokenFromAuthHeader, verifyAuthToken } from '@/lib/jwt';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const auth = req.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return NextResponse.json({ error: 'Token requerido' }, { status: 401 });

  const claims = verifyAuthToken(token);
  if (!claims) {
    return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 });
  }
  return NextResponse.json({ ok: true, claims }, { status: 200 });
}