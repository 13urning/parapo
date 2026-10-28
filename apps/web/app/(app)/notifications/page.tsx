import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui';
import { NotificationList } from '@/features/notifications/NotificationList';
import { PushToggle } from '@/features/notifications/PushToggle';

export const metadata: Metadata = { title: 'Notifications' };

export default function NotificationsPage() {
  return (
    <>
      <PageHeader title="Notifications" description="Fare updates and announcements." />
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <NotificationList />
        <div>
          <PushToggle />
        </div>
      </div>
    </>
  );
}
