import { describe, it, expect } from 'vitest';
import { House, User } from 'lucide-react';
import { findActiveItem } from '@/shared/layouts/navigation';

const items = [
  { id: 'home', labelKey: 'member.nav.home', href: '/member', icon: House },
  { id: 'profile', labelKey: 'member.nav.profile', href: '/member/profile', icon: User },
] as const;

describe('findActiveItem', () => {
  it('picks the item whose address matches exactly', () => {
    expect(findActiveItem('/member', items)?.id).toBe('home');
  });

  it('picks the most specific item for a page below it', () => {
    expect(findActiveItem('/member/profile/edit', items)?.id).toBe('profile');
  });

  it('does not take a shared prefix for a match', () => {
    expect(findActiveItem('/members', items)).toBeUndefined();
  });

  it('answers nothing for an address outside every item', () => {
    expect(findActiveItem('/admin', items)).toBeUndefined();
  });
});
