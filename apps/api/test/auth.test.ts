import { afterAll, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../src/app';
import { sql } from '../src/db';
import { sms } from '../src/lib/sms';

const app = buildApp();
const headers = { origin: 'http://localhost:8081' };

afterAll(async () => {
  await app.close();
  await sql.end();
});

async function requestCode(phoneNumber: string) {
  const send = vi.spyOn(sms, 'send').mockResolvedValue();
  const res = await app.inject({
    method: 'POST',
    url: '/api/auth/phone-number/send-otp',
    headers,
    payload: { phoneNumber },
  });
  const code = send.mock.calls.at(-1)?.[1].match(/\d{6}/)?.[0];
  send.mockRestore();
  return { res, code };
}

async function login(phoneNumber: string) {
  const { code } = await requestCode(phoneNumber);
  const res = await app.inject({
    method: 'POST',
    url: '/api/auth/phone-number/verify',
    headers,
    payload: { phoneNumber, code },
  });
  const setCookie = [res.headers['set-cookie'] ?? []].flat();
  const cookie = setCookie.map((c) => c.split(';')[0]).join('; ');
  return { res, cookie };
}

describe('login por telefone', () => {
  it('primeiro código verificado cria conta de cliente e abre sessão', async () => {
    const { res, cookie } = await login('+5565999990001');
    expect(res.statusCode).toBe(200);
    expect(cookie).toContain('session_token');

    const me = await app.inject({ method: 'GET', url: '/me', headers: { cookie } });
    expect(me.statusCode).toBe(200);
    expect(me.json()).toMatchObject({ phoneNumber: '+5565999990001', role: 'customer' });
  });

  it('código errado não abre sessão', async () => {
    await requestCode('+5565999990002');
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/phone-number/verify',
      headers,
      payload: { phoneNumber: '+5565999990002', code: '000000' },
    });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  it('recusa telefone fora do padrão E.164 de celular brasileiro', async () => {
    const { res, code } = await requestCode('65999990000');
    expect(res.statusCode).toBe(400);
    expect(code).toBeUndefined();
  });

  it('usuário não consegue promover o próprio papel', async () => {
    const { cookie } = await login('+5565999990003');
    await app.inject({
      method: 'POST',
      url: '/api/auth/update-user',
      headers: { ...headers, cookie },
      payload: { role: 'admin' },
    });

    const me = await app.inject({ method: 'GET', url: '/me', headers: { cookie } });
    expect(me.json().role).toBe('customer');
  });

  it('/me sem sessão responde 401', async () => {
    const res = await app.inject({ method: 'GET', url: '/me' });
    expect(res.statusCode).toBe(401);
  });
});
