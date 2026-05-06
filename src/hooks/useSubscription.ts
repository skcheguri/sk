import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase';
import {
  mockSubscriptions,
  mockBillingHistory,
  mockSubscriptionFeatures,
  FREE_TIER_LIMITS,
  PRO_FEATURE_KEYS,
  type SubscriptionData,
  type BillingInvoice,
  type SubscriptionFeature,
} from '@/mocks/subscriptions';

export type SubscriptionPlan = 'free' | 'pro_monthly' | 'pro_annual';
export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired';

export interface SubscriptionContextValue {
  subscription: SubscriptionData | null;
  billingHistory: BillingInvoice[];
  features: SubscriptionFeature[];
  loading: boolean;
  isPro: boolean;
  plan: SubscriptionPlan;
  status: SubscriptionStatus | null;
  canUseFeature: (key: string) => boolean;
  hasReachedPropertyLimit: (currentCount: number) => boolean;
  hasReachedListingLimit: (currentCount: number) => boolean;
  hasReachedInquiryLimit: (currentCount: number) => boolean;
  currentPeriodEnd: string | null;
  nextBillingDate: string | null;
  totalSpent: number;
  isInGracePeriod: boolean;
  isInTrial: boolean;
  trialDaysLeft: number;
  upgradeToPro: (plan: 'pro_monthly' | 'pro_annual') => Promise<{ error: string | null }>;
  cancelSubscription: () => Promise<{ error: string | null }>;
  toggleAutoRenew: (enabled: boolean) => Promise<{ error: string | null }>;
  refresh: () => Promise<void>;
}

export const SubscriptionContext = createContext<SubscriptionContextValue>({
  subscription: null,
  billingHistory: [],
  features: [],
  loading: true,
  isPro: false,
  plan: 'free',
  status: null,
  canUseFeature: () => false,
  hasReachedPropertyLimit: () => false,
  hasReachedListingLimit: () => false,
  hasReachedInquiryLimit: () => false,
  currentPeriodEnd: null,
  nextBillingDate: null,
  totalSpent: 0,
  isInGracePeriod: false,
  isInTrial: false,
  trialDaysLeft: 0,
  upgradeToPro: async () => ({ error: null }),
  cancelSubscription: async () => ({ error: null }),
  toggleAutoRenew: async () => ({ error: null }),
  refresh: async () => {},
});

export function useSubscription() {
  return useContext(SubscriptionContext);
}

function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export function useSubscriptionProvider(ownerId: string | undefined): SubscriptionContextValue {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingInvoice[]>([]);
  const [features, setFeatures] = useState<SubscriptionFeature[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = getSupabase();

  const fetchFromSupabase = useCallback(async () => {
    if (!supabase || !ownerId || !isValidUUID(ownerId)) return;

    const { data: subData, error: subError } = await supabase
      .from('owner_subscriptions')
      .select('*')
      .eq('owner_id', ownerId)
      .maybeSingle();

    if (subError) {
      console.error('Subscription fetch error:', subError);
      return;
    }

    const { data: billingData } = await supabase
      .from('billing_history')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    const { data: featuresData } = await supabase
      .from('subscription_features')
      .select('*')
      .eq('owner_id', ownerId);

    setSubscription(subData ?? null);
    setBillingHistory(billingData ?? []);
    setFeatures(featuresData ?? []);
  }, [supabase, ownerId]);

  const fetchFromMocks = useCallback(() => {
    const sub = mockSubscriptions.find((s) => s.owner_id === ownerId) ?? null;
    const billing = mockBillingHistory.filter((b) => b.owner_id === ownerId);
    const feats = mockSubscriptionFeatures.filter((f) => f.owner_id === ownerId);
    setSubscription(sub);
    setBillingHistory(billing);
    setFeatures(feats);
  }, [ownerId]);

  const refresh = useCallback(async () => {
    setLoading(true);
    if (supabase && ownerId && isValidUUID(ownerId)) {
      await fetchFromSupabase();
    } else {
      fetchFromMocks();
    }
    setLoading(false);
  }, [supabase, ownerId, fetchFromSupabase, fetchFromMocks]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isPro = subscription?.plan === 'pro_monthly' || subscription?.plan === 'pro_annual';
  const plan: SubscriptionPlan = subscription?.plan ?? 'free';
  const status: SubscriptionStatus | null = (subscription?.status as SubscriptionStatus) ?? null;

  const canUseFeature = useCallback(
    (key: string) => {
      if (isPro) return true;
      return features.some((f) => f.feature_key === key && f.enabled);
    },
    [isPro, features]
  );

  const hasReachedPropertyLimit = useCallback(
    () => false,
    []
  );

  const hasReachedListingLimit = useCallback(
    () => false,
    []
  );

  const hasReachedInquiryLimit = useCallback(
    () => false,
    []
  );

  const currentPeriodEnd = subscription?.current_period_end ?? null;
  const nextBillingDate = currentPeriodEnd;

  const totalSpent = billingHistory
    .filter((b) => b.status === 'paid')
    .reduce((sum, b) => sum + b.total_amount, 0);

  const isInGracePeriod = status === 'past_due';
  const isInTrial = status === 'trial' && subscription?.trial_ends_at != null;

  const trialDaysLeft = isInTrial && subscription?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(subscription.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const upgradeToPro = async (selectedPlan: 'pro_monthly' | 'pro_annual'): Promise<{ error: string | null }> => {
    if (!ownerId) return { error: 'Not authenticated' };

    if (supabase && isValidUUID(ownerId)) {
      const { error } = await supabase.functions.invoke('create-razorpay-subscription', {
        body: { owner_id: ownerId, plan: selectedPlan },
      });
      if (error) return { error: error.message };
    } else {
      const newSub: SubscriptionData = {
        id: `sub-${Date.now()}`,
        owner_id: ownerId,
        plan: selectedPlan,
        status: 'active',
        razorpay_subscription_id: `sub_mock_${Date.now()}`,
        razorpay_customer_id: `cust_mock_${Date.now()}`,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        trial_ends_at: null,
        cancel_at_period_end: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockSubscriptions.push(newSub);
      PRO_FEATURE_KEYS.forEach((key) => {
        mockSubscriptionFeatures.push({
          id: `sf-${Date.now()}-${key}`,
          owner_id: ownerId,
          feature_key: key,
          enabled: true,
          source: 'plan',
          expires_at: null,
          created_at: new Date().toISOString(),
        });
      });
    }
    await refresh();
    return { error: null };
  };

  const cancelSubscription = async (): Promise<{ error: string | null }> => {
    if (!ownerId || !subscription) return { error: 'No active subscription' };

    if (supabase && isValidUUID(ownerId)) {
      const { error } = await supabase.functions.invoke('cancel-razorpay-subscription', {
        body: { subscription_id: subscription.razorpay_subscription_id },
      });
      if (error) return { error: error.message };
    } else {
      const idx = mockSubscriptions.findIndex((s) => s.id === subscription.id);
      if (idx >= 0) {
        mockSubscriptions[idx] = { ...mockSubscriptions[idx], cancel_at_period_end: true, status: 'cancelled' };
      }
    }
    await refresh();
    return { error: null };
  };

  const toggleAutoRenew = async (enabled: boolean): Promise<{ error: string | null }> => {
    if (!ownerId || !subscription) return { error: 'No active subscription' };

    if (supabase && isValidUUID(ownerId)) {
      const { error } = await supabase
        .from('owner_subscriptions')
        .update({ cancel_at_period_end: !enabled })
        .eq('id', subscription.id);
      if (error) return { error: error.message };
    } else {
      const idx = mockSubscriptions.findIndex((s) => s.id === subscription.id);
      if (idx >= 0) {
        mockSubscriptions[idx] = { ...mockSubscriptions[idx], cancel_at_period_end: !enabled };
      }
    }
    await refresh();
    return { error: null };
  };

  return {
    subscription,
    billingHistory,
    features,
    loading,
    isPro,
    plan,
    status,
    canUseFeature,
    hasReachedPropertyLimit,
    hasReachedListingLimit,
    hasReachedInquiryLimit,
    currentPeriodEnd,
    nextBillingDate,
    totalSpent,
    isInGracePeriod,
    isInTrial,
    trialDaysLeft,
    upgradeToPro,
    cancelSubscription,
    toggleAutoRenew,
    refresh,
  };
}