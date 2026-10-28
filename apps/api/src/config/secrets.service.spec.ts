import { PrismaService } from '../prisma/prisma.service';
import { AppConfig } from './app-config';
import { SecretsService } from './secrets.service';

const cfg = (over: Partial<AppConfig> = {}) =>
  ({ vapidSubject: 'mailto:a@b.test', ...over }) as AppConfig;

function setup(config: AppConfig) {
  const prisma = {
    appSecret: { findUnique: jest.fn(), createMany: jest.fn().mockResolvedValue({ count: 1 }) },
  };
  return { prisma, service: new SecretsService(prisma as unknown as PrismaService, config) };
}

describe('SecretsService', () => {
  it('uses JWT_SECRET from env and never touches the database', async () => {
    const { prisma, service } = setup(cfg({ jwtSecretEnv: 'from-env' }));
    expect(await service.getJwtSecret()).toBe('from-env');
    expect(prisma.appSecret.findUnique).not.toHaveBeenCalled();
    expect(prisma.appSecret.createMany).not.toHaveBeenCalled();
  });

  it('uses VAPID keys from env when both are set', async () => {
    const { prisma, service } = setup(cfg({ vapidPublicEnv: 'pub', vapidPrivateEnv: 'priv' }));
    expect(await service.getVapidKeys()).toEqual({
      publicKey: 'pub',
      privateKey: 'priv',
      subject: 'mailto:a@b.test',
    });
    expect(prisma.appSecret.createMany).not.toHaveBeenCalled();
  });

  it('returns the stored value when one already exists', async () => {
    const { prisma, service } = setup(cfg());
    prisma.appSecret.findUnique.mockResolvedValue({ key: 'JWT_SECRET', value: 'stored' });
    expect(await service.getJwtSecret()).toBe('stored');
    expect(prisma.appSecret.createMany).not.toHaveBeenCalled();
  });

  it('generates a 64-byte secret, persists it once with skipDuplicates, then re-reads the stored value', async () => {
    const { prisma, service } = setup(cfg());
    // Simulates losing a first-boot race: the re-read returns the winner's value.
    prisma.appSecret.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ key: 'JWT_SECRET', value: 'winner' });

    expect(await service.getJwtSecret()).toBe('winner');
    expect(prisma.appSecret.createMany).toHaveBeenCalledTimes(1);
    const arg = prisma.appSecret.createMany.mock.calls[0][0];
    expect(arg.skipDuplicates).toBe(true);
    expect(arg.data[0].key).toBe('JWT_SECRET');
    expect(arg.data[0].value).toMatch(/^[0-9a-f]{128}$/);

    // Cached afterwards: no further DB traffic.
    await service.getJwtSecret();
    expect(prisma.appSecret.findUnique).toHaveBeenCalledTimes(2);
  });

  it('generates and persists a VAPID pair as a single row', async () => {
    const { prisma, service } = setup(cfg());
    let saved = '';
    prisma.appSecret.findUnique.mockImplementation(() =>
      Promise.resolve(saved ? { key: 'VAPID_KEYPAIR', value: saved } : null),
    );
    prisma.appSecret.createMany.mockImplementation(({ data }: { data: { value: string }[] }) => {
      saved = data[0].value;
      return Promise.resolve({ count: 1 });
    });
    const keys = await service.getVapidKeys();
    expect(keys.publicKey.length).toBeGreaterThan(20);
    expect(keys.privateKey.length).toBeGreaterThan(20);
    expect(prisma.appSecret.createMany.mock.calls[0][0].data[0].key).toBe('VAPID_KEYPAIR');
  });

  it('fails if the secret cannot be read back after writing', async () => {
    const { prisma, service } = setup(cfg());
    prisma.appSecret.findUnique.mockResolvedValue(null);
    await expect(service.getJwtSecret()).rejects.toThrow('Failed to persist secret');
  });
});
