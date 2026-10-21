'use client';

import type { Paginated } from '@/shared/api/pagination';
import { usePagedList } from '@/shared/hooks/usePagedList';
import {
  NO_DIRECTORY_FILTERS,
  readDirectory,
  type DirectoryFilters,
  type DirectoryListing,
} from '../api/directory';

export function useDirectory() {
  return usePagedList<DirectoryFilters, Paginated<DirectoryListing>>(
    readDirectory,
    NO_DIRECTORY_FILTERS,
  );
}
