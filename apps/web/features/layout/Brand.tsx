import Link from 'next/link';
import { cn } from '@/lib/cn';

/** The wordmark: "Para" in muted ink, "Po" in brand green. On the green login panel both go white. */
export function Brand({
  href = '/plan',
  tone = 'default',
  className,
}: {
  href?: string;
  tone?: 'default' | 'light';
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label="ParaPo home"
      className={cn(
        'press inline-flex min-h-11 items-center rounded-lg text-[17px] font-extrabold tracking-[-0.02em]',
        tone === 'light' ? 'text-white focus-visible:outline-white' : 'text-ink-soft',
        className,
      )}
    >
      Para<span className={tone === 'light' ? 'text-white' : 'text-brand'}>Po</span>
    </Link>
  );
}
