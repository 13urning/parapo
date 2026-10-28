import Link from 'next/link';

export function Brand({ href = '/plan' }: { href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jeep-blue"
      aria-label="ParaPo home"
    >
      <span className="sign-board text-lg">Para Po!</span>
    </Link>
  );
}
