import type { Metadata } from 'next';
import { Page, PageHeader } from '@/components/ui';
import { NotificationList } from '@/features/notifications/NotificationList';
import { PushToggle } from '@/features/notifications/PushToggle';

export const metadata: Metadata = { title: 'Notifications' };

export default function NotificationsPage() {
  return (
    <Page>
      <PageHeader title="Alerts" description="Fare updates and announcements." />
      <PushToggle />
      <div className="mt-4">
        <NotificationList />
      </div>
    </Page>
  );
}
