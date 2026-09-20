'use client';

import { useEffect, useState } from 'react';
import { NotificationsMenu, type Notice } from '@/shared/components/NotificationsMenu';
import { describeWaitLength } from '@/shared/format';
import { fetchPendingApplications, type PendingApplication } from '../api/applications';

type AdminNotificationsProps = {
  loadApplications?: () => Promise<PendingApplication[]>;
};

// The chamber's only outstanding work today is the applications nobody has
// decided yet, so that is what the bell counts. Anything else would be an
// ornament with no source.
function toNotice(application: PendingApplication): Notice {
  return {
    id: application._id,
    title: application.businessName,
    detail: `Esperando ${describeWaitLength(application.createdAt)}`,
    href: '/admin',
  };
}

export function AdminNotifications({
  loadApplications = fetchPendingApplications,
}: AdminNotificationsProps) {
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    let stillMounted = true;

    loadApplications()
      .then((applications) => {
        if (stillMounted) {
          setNotices(applications.map(toNotice));
        }
      })
      .catch(() => {
        // The bell is not the place to report that a list could not be read.
      });

    return () => {
      stillMounted = false;
    };
    // Read once when the panel opens, like the identity beside it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <NotificationsMenu notices={notices} emptyMessage="No hay solicitudes esperando decisión." />
  );
}
