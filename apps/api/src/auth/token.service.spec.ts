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
  it('signs a token carrying sub, role and name with a 7 day expiry', async () => {
    const { jwt, service } = setup();
    const token = await service.sign({ sub: 'u1', role: 'ADMIN', name: 'Ann' });
    const decoded = jwt.decode(token) as {
      sub: string;
      role: string;
      name: string;
      exp: number;
      iat: number;
    };
    expect(decoded).toEqual(expect.objectContaining({ sub: 'u1', role: 'ADMIN', name: 'Ann' }));
    expect(decoded.exp - decoded.iat).toBe(7 * 24 * 60 * 60);
  });

  it('verifies a valid token', async () => {
    const { service } = setup();
    const token = await service.sign({ sub: 'u1', role: 'COMMUTER', name: 'Juan' });
    expect(await service.verify(token)).toEqual(
      expect.objectContaining({ sub: 'u1', role: 'COMMUTER', name: 'Juan' }),
    );
  });

  it('returns null (never throws) for missing, malformed, wrong-secret, alg=none and expired tokens', async () => {
    const { jwt, service } = setup();
    expect(await service.verify(undefined)).toBeNull();
    expect(await service.verify('')).toBeNull();
    expect(await service.verify('garbage')).toBeNull();

    const other = setup('another-secret');
    const foreign = await other.service.sign({ sub: 'u1', role: 'ADMIN', name: 'x' });
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
