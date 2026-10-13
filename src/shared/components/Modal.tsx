'use client';

import type { ReactNode } from 'react';
import { useIsDesktop } from '@/shared/hooks/useMediaQuery';
import { BottomSheet } from './BottomSheet';
import { Dialog } from './Dialog';

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function Modal(props: ModalProps) {
  const isDesktop = useIsDesktop();

  return isDesktop ? <Dialog {...props} /> : <BottomSheet {...props} />;
}
