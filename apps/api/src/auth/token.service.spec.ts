import { JwtService } from '@nestjs/jwt';
import { SecretsService } from '../config/secrets.service';
import { TokenService } from './token.service';

const SECRET = 'unit-test-secret';

function setup(secret = SECRET) {
  const jwt = new JwtService();
  const secrets = { getJwtSecret: jest.fn().mockResolvedValue(secret) };
  return { jwt, service: new TokenService(jwt, secrets as unknown as SecretsService) };
}

describe('TokenService', () => {
  it('signs a token carrying sub, role, name and ver with a 24 hour expiry', async () => {
    const { jwt, service } = setup();
    const token = await service.sign({ sub: 'u1', role: 'ADMIN', name: 'Ann', ver: 2 });
    const decoded = jwt.decode(token) as {
      sub: string;
      role: string;
      name: string;
      exp: number;
      iat: number;
    };
    expect(decoded).toEqual(
      expect.objectContaining({ sub: 'u1', role: 'ADMIN', name: 'Ann', ver: 2 }),
    );
    expect(decoded.exp - decoded.iat).toBe(24 * 60 * 60);
  });

  it('verifies a valid token', async () => {
    const { service } = setup();
    const token = await service.sign({ sub: 'u1', role: 'COMMUTER', name: 'Juan', ver: 0 });
    expect(await service.verify(token)).toEqual(
      expect.objectContaining({ sub: 'u1', role: 'COMMUTER', name: 'Juan' }),
    );
  });

  it('rejects a validly signed token that has no integer ver', async () => {
    const { jwt, service } = setup();
    const legacy = await jwt.signAsync(
      { sub: 'u1', role: 'ADMIN', name: 'x' },
      { secret: SECRET, expiresIn: 60 },
    );
    expect(await service.verify(legacy)).toBeNull();
  });

  it('returns null (never throws) for missing, malformed, wrong-secret, alg=none and expired tokens', async () => {
    const { jwt, service } = setup();
    expect(await service.verify(undefined)).toBeNull();
    expect(await service.verify('')).toBeNull();
    expect(await service.verify('garbage')).toBeNull();

    const other = setup('another-secret');
    const foreign = await other.service.sign({ sub: 'u1', role: 'ADMIN', name: 'x', ver: 0 });
    expect(await service.verify(foreign)).toBeNull();

    const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
    const none = `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ sub: 'u1', role: 'ADMIN' })}.`;
    expect(await service.verify(none)).toBeNull();

    const expired = await jwt.signAsync(
      { sub: 'u1', role: 'COMMUTER', name: 'x' },
      { secret: SECRET, expiresIn: -10 },
    );
    expect(await service.verify(expired)).toBeNull();
  });
});
