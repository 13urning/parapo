'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Select } from '@/components/ui';
import { errorMessage } from '@/lib/api/errors';
import { CATEGORY_LABELS, FARE_CATEGORIES } from '@/lib/format';
import { useSession } from '@/providers/session-provider';
import { registerSchema, type RegisterValues } from './schemas';

const categoryOptions = FARE_CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }));

export function RegisterForm() {
  const { register: signUp } = useSession();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', fareCategory: 'REGULAR' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await signUp(values);
      router.replace('/plan');
      router.refresh();
    } catch (err) {
      setServerError(errorMessage(err, 'Could not create your account.'));
    }
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-ink">Create your account</h1>
      <p className="mt-1 text-ink-soft">Your fare category decides which discount we apply.</p>

      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
        {serverError && (
          <p role="alert" className="rounded-lg border border-jeep-red/30 bg-jeep-red-soft px-3 py-2 text-sm font-medium text-jeep-red-dark">
            {serverError}
          </p>
        )}
        <Input label="Full name" autoComplete="name" error={errors.name?.message} {...register('name')} />
        <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters."
          error={errors.password?.message}
          {...register('password')}
        />
        <Select
          label="Fare category"
          options={categoryOptions}
          hint="Students, senior citizens and PWD get the discounted fare."
          error={errors.fareCategory?.message}
          {...register('fareCategory')}
        />
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-sm text-ink-soft">
        Already registered?{' '}
        <Link href="/login" className="font-semibold text-jeep-blue underline underline-offset-2">
          Sign in
        </Link>
      </p>
    </div>
  );
}
