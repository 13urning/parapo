import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsService, stripQuery } from './analytics.service';
import { PageviewDto } from './dto';

const check = async (path: unknown) =>
  (await validate(plainToInstance(PageviewDto, { path }))).length === 0;

describe('pageview path validation', () => {
  it('accepts paths that start with /', async () => {
    expect(await check('/')).toBe(true);
    expect(await check('/trips/history')).toBe(true);
    expect(await check('/' + 'a'.repeat(199))).toBe(true);
  });

  it('rejects paths that do not start with /, are too long, or are not strings', async () => {
    expect(await check('trips')).toBe(false);
    expect(await check('http://evil.test/')).toBe(false);
    expect(await check('/' + 'a'.repeat(200))).toBe(false);
    expect(await check('/has space')).toBe(false);
    expect(await check('')).toBe(false);
    expect(await check(42)).toBe(false);
    expect(await check(undefined)).toBe(false);
  });
});

describe('AnalyticsService', () => {
  it('strips query string and fragment and stores only path + userId', async () => {
    const create = jest.fn().mockResolvedValue({});
    const svc = new AnalyticsService({ pageView: { create } } as unknown as PrismaService);
    await svc.record('/plan?token=secret#x', 'u1');
    expect(create).toHaveBeenCalledWith({ data: { path: '/plan', userId: 'u1' } });
    expect(stripQuery('/a/b')).toBe('/a/b');
  });
});
