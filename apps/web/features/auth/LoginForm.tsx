'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@/components/ui';
import { errorMessage } from '@/lib/api/errors';
import { safeNext } from '@/lib/safe-redirect';
import { useSession } from '@/providers/session-provider';
import { loginSchema, type LoginValues } from './schemas';

export const DEMO_ACCOUNTS = [
  { role: 'Commuter (student)', email: 'juan@parapo.local', password: 'Commuter#2026' },
  { role: 'Admin', email: 'admin@parapo.local', password: 'Admin#2026' },
];

export function LoginForm() {
  const { login } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setServerError(null);
    try {
      await login(email, password);
      router.replace(safeNext(params.get('next')));
      router.refresh();
    } catch (err) {
      setServerError(errorMessage(err, 'Could not sign in.'));
    }
  });

  return (
    <div>
      <h1 className="text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-ink">Welcome back</h1>
      <p className="mt-1 text-[15px] text-ink-soft">Sign in to plan your next ride.</p>

      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
        {params.get('reason') === 'expired' && !serverError && (
          <p role="status" className="rounded-[14px] bg-surface px-4 py-3 text-sm font-semibold text-ink">
            Your session has expired. Please sign in again.
          </p>
        )}
        {serverError && (
          <p role="alert" className="rounded-[14px] bg-danger-50 px-4 py-3 text-sm font-semibold text-danger">
            {serverError}
          </p>
        )}
        <Input
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Sign in
        </Button>
      </form>

      <p className="mt-5 text-[15px] text-ink-soft">
        New here?{' '}
        <Link href="/register" className="inline-flex min-h-11 items-center font-bold text-brand underline underline-offset-2">
          Create an account
        </Link>
      </p>

      <aside aria-labelledby="demo-heading" className="mt-6 border-t border-line pt-5">
        <h2 id="demo-heading" className="text-sm font-extrabold text-ink">
          Demo accounts
        </h2>
        <ul className="mt-2 divide-y divide-line">
          {DEMO_ACCOUNTS.map((a) => (
            <li key={a.email} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span className="min-w-0">
                <span className="block font-bold text-ink">{a.role}</span>
                <span className="block truncate text-ink-soft">
                  {a.email} / {a.password}
                </span>
              </span>
              <Button
                size="sm"
                variant="secondary"
                aria-label={`Fill in ${a.role} credentials`}
                onClick={() => {
                  setValue('email', a.email, { shouldValidate: true });
                  setValue('password', a.password, { shouldValidate: true });
                }}
              >
                Use
              </Button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
