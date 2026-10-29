import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-dark disabled:bg-surface-deep disabled:text-ink-faint',
  secondary: 'bg-surface text-ink hover:bg-surface-deep disabled:text-ink-faint',
  danger: 'bg-danger text-white hover:brightness-95 disabled:bg-surface-deep disabled:text-ink-faint',
  // Ghost is a quiet text action: no fill until it is touched.
  ghost: 'bg-transparent text-ink hover:bg-surface disabled:text-ink-faint',
};
// Every size keeps a 44px minimum hit area.
const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-11 px-3.5 text-[15px]',
  md: 'min-h-12 px-5 text-base',
  lg: 'min-h-14 px-6 text-[17px]',
};

/** Class string for anything that should look like a button (links included). */
export const buttonClass = ({
  variant = 'primary',
  size = 'md',
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) =>
  cn(
    'press inline-flex items-center justify-center gap-2 rounded-[14px] font-bold transition-colors',
    'disabled:cursor-not-allowed',
    variants[variant],
    sizes[size],
    className,
  );

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClass({ variant, size, className })}
      {...rest}
    >
      {loading && <Spinner label="Working" />}
      {children}
    </button>
  );
});
