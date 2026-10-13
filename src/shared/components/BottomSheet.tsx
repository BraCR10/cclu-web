'use client';

import type { ReactNode } from 'react';
import { ModalLayer } from './ModalLayer';

type BottomSheetProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function BottomSheet(props: BottomSheetProps) {
  return <ModalLayer presentation="sheet" {...props} />;
}
