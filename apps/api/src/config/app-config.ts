export class AppConfig {
  databaseUrl!: string;
  port!: number;
  webOrigin!: string;
  cookieSecure!: boolean;
  nodeEnv!: string;
  nominatimUserAgent!: string;
  nominatimBaseUrl!: string;
  osrmBaseUrl!: string;
  jwtSecretEnv?: string;
  vapidPublicEnv?: string;
  vapidPrivateEnv?: string;
  vapidSubject!: string;
}

const opt = (v: string | undefined): string | undefined => (v && v.trim() ? v.trim() : undefined);

/** Reads and validates the environment. Throws (fail closed) when DATABASE_URL is missing. */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const databaseUrl = opt(env.DATABASE_URL);
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }
  const nodeEnv = opt(env.NODE_ENV) ?? 'development';
  const cookieSecureEnv = opt(env.COOKIE_SECURE);
  const port = Number(opt(env.PORT) ?? 3001);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be a valid port number');
  }
  return {
    databaseUrl,
    port,
    nodeEnv,
    webOrigin: opt(env.WEB_ORIGIN) ?? 'http://localhost:3000',
    cookieSecure: cookieSecureEnv ? cookieSecureEnv === 'true' : nodeEnv === 'production',
    nominatimUserAgent: opt(env.NOMINATIM_USER_AGENT) ?? 'ParaPo/1.0 (tech exam)',
    nominatimBaseUrl: opt(env.NOMINATIM_BASE_URL) ?? 'https://nominatim.openstreetmap.org',
    osrmBaseUrl: opt(env.OSRM_BASE_URL) ?? 'https://router.project-osrm.org',
    jwtSecretEnv: opt(env.JWT_SECRET),
    vapidPublicEnv: opt(env.VAPID_PUBLIC_KEY),
    vapidPrivateEnv: opt(env.VAPID_PRIVATE_KEY),
    vapidSubject: opt(env.VAPID_SUBJECT) ?? 'mailto:admin@parapo.local',
  };
}
