import { requestApi } from '@/shared/api/apiClient';

export type PlanKey = 'free' | 'lite' | 'pro' | 'premium';

export type BannerAllowance = 'none' | 'one_month' | 'unlimited';

export type PlanEntitlements = {
  publishInMarketplace: boolean;
  publishJobs: boolean;
  banner: BannerAllowance;
  onlineWorkshops: boolean;
  massMailing: boolean;
};

export type Plan = {
  key: PlanKey;
  name: string;
  monthlyFee: number;
  entitlements: PlanEntitlements;
};

export function readPlans() {
  return requestApi<Plan[]>('/api/plans');
}
