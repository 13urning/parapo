import * as webpush from 'web-push';
import { SecretsService } from '../config/secrets.service';
import { PrismaService } from '../prisma/prisma.service';
import { PushService } from './push.service';

jest.mock('web-push', () => ({ sendNotification: jest.fn() }));

const send = webpush.sendNotification as unknown as jest.Mock;
const payload = { title: 'T', body: 'B', url: '/' };
const sub = (n: number) => ({
  id: `s${n}`,
  endpoint: `https://push.test/${n}`,
  p256dh: `p${n}`,
  auth: `a${n}`,
});

function setup(subs = [sub(1), sub(2), sub(3)]) {
  const prisma = {
    pushSubscription: {
      findMany: jest.fn().mockResolvedValue(subs),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
  };
  const secrets = {
    getVapidKeys: jest
      .fn()
      .mockResolvedValue({ publicKey: 'pub', privateKey: 'priv', subject: 'mailto:a@b.test' }),
  };
  return {
    prisma,
    service: new PushService(
      prisma as unknown as PrismaService,
      secrets as unknown as SecretsService,
    ),
  };
}

describe('PushService', () => {
  beforeEach(() => send.mockReset());

  it('exposes the VAPID public key', async () => {
    expect(await setup().service.getPublicKey()).toBe('pub');
  });

  it('sends the JSON payload to every subscription', async () => {
    send.mockResolvedValue({ statusCode: 201 });
    const { prisma, service } = setup();
    await service.sendToAll(payload);
    expect(send).toHaveBeenCalledTimes(3);
    expect(send.mock.calls[0][0]).toEqual({
      endpoint: 'https://push.test/1',
      keys: { p256dh: 'p1', auth: 'a1' },
    });
    expect(send.mock.calls[0][1]).toBe(JSON.stringify(payload));
    expect(send.mock.calls[0][2]).toEqual(
      expect.objectContaining({
        vapidDetails: { subject: 'mailto:a@b.test', publicKey: 'pub', privateKey: 'priv' },
      }),
    );
    expect(prisma.pushSubscription.deleteMany).not.toHaveBeenCalled();
  });

  it('prunes subscriptions that answer 404 or 410', async () => {
    send
      .mockRejectedValueOnce({ statusCode: 404 })
      .mockResolvedValueOnce({ statusCode: 201 })
      .mockRejectedValueOnce({ statusCode: 410 });
    const { prisma, service } = setup();
    await service.sendToAll(payload);
    expect(prisma.pushSubscription.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ['s1', 's3'] } },
    });
  });

  it('keeps subscriptions on other errors and never throws', async () => {
    send
      .mockRejectedValueOnce({ statusCode: 500 })
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce({ statusCode: 201 });
    const { prisma, service } = setup();
    await expect(service.sendToAll(payload)).resolves.toBeUndefined();
    expect(prisma.pushSubscription.deleteMany).not.toHaveBeenCalled();
  });

  it('swallows failures loading subscriptions', async () => {
    const { prisma, service } = setup();
    prisma.pushSubscription.findMany.mockRejectedValue(new Error('db down'));
    await expect(service.sendToAll(payload)).resolves.toBeUndefined();
    expect(send).not.toHaveBeenCalled();
  });
});
