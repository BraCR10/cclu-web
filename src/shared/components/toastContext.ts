'use client';

import { createContext } from 'react';
import type { ToastTone } from './Toast';

export type ToastRequest = { tone: ToastTone; title: string; message?: string };

export type ToastContextValue = { showToast: (request: ToastRequest) => void };

export const ToastContext = createContext<ToastContextValue | null>(null);
