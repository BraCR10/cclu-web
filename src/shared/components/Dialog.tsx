'use client';

import type { ReactNode } from 'react';
import { ModalLayer } from './ModalLayer';

type DialogProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function Dialog(props: DialogProps) {
  return <ModalLayer presentation="popup" {...props} />;
}
