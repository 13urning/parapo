import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decodeJwtPayload, isExpired } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

/** `/` has no UI of its own: send people where their session says they belong. */
export default async function Home() {
  const token = (await cookies()).get('parapo_session')?.value;
  const claims = decodeJwtPayload(token);
  redirect(token && !isExpired(claims) ? '/plan' : '/login');
}
