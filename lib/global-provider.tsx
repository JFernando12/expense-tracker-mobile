import { CategoryExpenseData, PeriodTypes } from '@/constants/interfaces';
import { Transaction, Wallet } from '@/types/types';
import { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser } from './appwrite';
import {
  getExpensesByCategory,
  getTotalExpenses,
  getTotalIncomes,
} from './services/fetchData/statistics';
import { getTransactions } from './services/fetchData/transactions';
import { getTotalBalance, getWallets } from './services/fetchData/wallets';
import {
  AppMode,
  subscriptionService,
  UserSubscription,
} from './services/subscriptionService';
import { syncData } from './services/syncData/syncData';
import { useAppwrite } from './useAppwrite';

interface User {
  $id: string;
  name: string;
  email: string;
  avatar: string;
}

interface GlobalContextType {
  isLoggedIn: boolean;
  isOnlineMode: boolean; // Indicates if the app is running in local mode (no user logged in)
  user: User | null | undefined;
  userLoading: boolean;
  refetchUser: (newParams?: Record<string, string | number>) => Promise<void>;
  wallets: Wallet[] | null;
  transactions: Transaction[] | null;
  walletsLoading: boolean;
  transactionsLoading: boolean;
  refetchResources: () => Promise<void>;
  refetchTransactions: () => Promise<void>;
  totalBalance: number | null;
  totalBalanceLoading: boolean;
  totalIncomes: number | null;
  totalIncomesLoading: boolean;
  totalExpenses: number | null;
  totalExpensesLoading: boolean;
  // Weekly totals
  totalIncomesSevenDays: number | null;
  totalIncomesSevenDaysLoading: boolean;
  totalExpensesSevenDays: number | null;
  totalExpensesSevenDaysLoading: boolean;
  // Monthly totals
  totalIncomesThirtyDays: number | null;
  totalIncomesThirtyDaysLoading: boolean;
  totalExpensesThirtyDays: number | null;
  totalExpensesThirtyDaysLoading: boolean;
  // Annual totals
  categoryExpensesSevenDays: CategoryExpenseData[] | null;
  categoryExpensesSevenDaysLoading: boolean;
  categoryExpensesThirtyDays: CategoryExpenseData[] | null;
  categoryExpensesThirtyDaysLoading: boolean;
  categoryExpensesYear: CategoryExpenseData[] | null;
  categoryExpensesYearLoading: boolean;
  // Function to refetch sync data
  refetchSyncData: (
    newParams?: Record<string, string | number>
  ) => Promise<void>;
  syncDataLoading: boolean;
  // Subscription management
  subscription: UserSubscription;
  subscriptionLoading: boolean;
  appMode: AppMode;
  canAccessCloudSync: boolean;
  canAccessPremiumFeatures: boolean;
  isTrialActive: boolean;
  daysUntilExpiry: number | null;
  upgradeToPremium: (planType: 'monthly' | 'yearly') => Promise<void>;
  startTrial: () => Promise<void>;
  toggleCloudSync: (enabled: boolean) => Promise<void>;
  resetToFreeMode: () => Promise<void>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

interface GlobalProviderProps {
  children: React.ReactNode;
}

export const GlobalProvider = ({ children }: GlobalProviderProps) => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null
  );
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  const {
    data: user,
    loading: userLoading,
    refetch: refetchUser,
  } = useAppwrite({
    fn: getCurrentUser,
  });
  const isLoggedIn = !!user;
  const isOnlineMode =
    subscription?.syncMode === 'cloud' && subscription?.mode === 'premium';

  const {
    data: wallets,
    loading: walletsLoading,
    refetch: refetchWallets,
  } = useAppwrite({
    fn: getWallets,
    params: {},
  });

  const {
    data: transactions,
    loading: transactionsLoading,
    refetch: refetchTransactions,
  } = useAppwrite({
    fn: getTransactions,
    params: {},
  });

  const {
    data: totalBalance,
    loading: totalBalanceLoading,
    refetch: refetchTotalBalance,
  } = useAppwrite({
    fn: getTotalBalance,
    params: {},
  });

  const {
    data: totalIncomes,
    loading: totalIncomesLoading,
    refetch: refetchTotalIncomes,
  } = useAppwrite({
    fn: getTotalIncomes,
    params: {
      period: PeriodTypes.ALL_TIME,
    },
  });

  const {
    data: totalExpenses,
    loading: totalExpensesLoading,
    refetch: refetchTotalExpenses,
  } = useAppwrite({
    fn: getTotalExpenses,
    params: {
      period: PeriodTypes.ALL_TIME,
    },
  });

  const {
    data: totalIncomesSevenDays,
    loading: totalIncomesSevenDaysLoading,
    refetch: refetchTotalIncomesSevenDays,
  } = useAppwrite({
    fn: getTotalIncomes,
    params: { period: PeriodTypes.SEVEN_DAYS },
  });

  const {
    data: totalExpensesSevenDays,
    loading: totalExpensesSevenDaysLoading,
    refetch: refetchTotalExpensesSevenDays,
  } = useAppwrite({
    fn: getTotalExpenses,
    params: { period: PeriodTypes.SEVEN_DAYS },
  });

  const {
    data: totalIncomesThirtyDays,
    loading: totalIncomesThirtyDaysLoading,
    refetch: refetchTotalIncomesThirtyDays,
  } = useAppwrite({
    fn: getTotalIncomes,
    params: { period: PeriodTypes.THIRTY_DAYS },
  });

  const {
    data: totalExpensesThirtyDays,
    loading: totalExpensesThirtyDaysLoading,
    refetch: refetchTotalExpensesThirtyDays,
  } = useAppwrite({
    fn: getTotalExpenses,
    params: { period: PeriodTypes.THIRTY_DAYS },
  });

  const {
    data: categoryExpensesSevenDays,
    loading: categoryExpensesSevenDaysLoading,
    refetch: refetchCategoryExpensesSevenDays,
  } = useAppwrite({
    fn: getExpensesByCategory,
    params: { period: PeriodTypes.SEVEN_DAYS },
  });

  const {
    data: categoryExpensesThirtyDays,
    loading: categoryExpensesThirtyDaysLoading,
    refetch: refetchCategoryExpensesThirtyDays,
  } = useAppwrite({
    fn: getExpensesByCategory,
    params: { period: PeriodTypes.THIRTY_DAYS },
  });

  const {
    data: categoryExpensesYear,
    loading: categoryExpensesYearLoading,
    refetch: refetchCategoryExpensesYear,
  } = useAppwrite({
    fn: getExpensesByCategory,
    params: { period: PeriodTypes.ALL_TIME },
  });

  const {
    data: syncedData,
    refetch: refetchSyncData,
    loading: syncDataLoading,
  } = useAppwrite({
    fn: syncData,
    params: {},
    skip: true,
  });

  const refetchResources = async () => {
    console.log('Refetching resources...');
    await Promise.all([refetchWallets(), refetchTransactions()]);
  };

  const refetchStatistics = async () => {
    await Promise.all([
      refetchTotalBalance(),
      refetchTotalIncomes(),
      refetchTotalExpenses(),
      refetchTotalIncomesSevenDays(),
      refetchTotalExpensesSevenDays(),
      refetchTotalIncomesThirtyDays(),
      refetchTotalExpensesThirtyDays(),
      refetchCategoryExpensesSevenDays(),
      refetchCategoryExpensesThirtyDays(),
      refetchCategoryExpensesYear(),
    ]);
  };
  const refetchSyncedData = async () => {
    await refetchSyncData();
    await refetchResources();
    await refetchStatistics();
  };

  // Subscription management functions
  const initializeSubscription = async () => {
    setSubscriptionLoading(true);
    try {
      const sub = await subscriptionService.initialize();
      setSubscription(sub);
    } catch (error) {
      console.error('Error initializing subscription:', error);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const upgradeToPremium = async (planType: 'monthly' | 'yearly') => {
    await subscriptionService.upgradeToPremium(planType);
    const updatedSubscription = subscriptionService.getSubscription();
    setSubscription(updatedSubscription);
  };

  const startTrial = async () => {
    await subscriptionService.startTrial();
    const updatedSubscription = subscriptionService.getSubscription();
    setSubscription(updatedSubscription);
  };

  const toggleCloudSync = async (enabled: boolean) => {
    try {
      await subscriptionService.toggleCloudSync(enabled);
      const updatedSubscription = subscriptionService.getSubscription();
      setSubscription(updatedSubscription);
    } catch (error) {
      throw error; // Re-throw to handle in UI
    }
  };

  const resetToFreeMode = async () => {
    await subscriptionService.resetToFreeMode();
    const updatedSubscription = subscriptionService.getSubscription();
    setSubscription(updatedSubscription);
  };

  // Initialize subscription on component mount
  useEffect(() => {
    initializeSubscription();
  }, []);

  // Update subscription service when user login state changes
  useEffect(() => {
    if (!subscriptionLoading && subscription) {
      subscriptionService.setUserLoggedIn(isLoggedIn);
      const updatedSubscription = subscriptionService.getSubscription();
      setSubscription(updatedSubscription);
    }
  }, [isLoggedIn, subscriptionLoading]);

  useEffect(() => {
    console.log('useEffect: syncData');
    if (isOnlineMode) {
      refetchSyncedData()
        .then(() => console.log('Data synced successfully'))
        .catch((error) => console.error('Error syncing data:', error));
    }
  }, [isOnlineMode]);

  useEffect(() => {}, [syncedData]);

  useEffect(() => {
    console.log('useEffect: statistics');
    refetchStatistics();
  }, [wallets, transactions]);

  // Derived values from subscription
  const appMode = subscription?.mode || 'free';
  const canAccessCloudSync = subscription
    ? subscriptionService.canAccessCloudSync()
    : false;
  const canAccessPremiumFeatures = subscription
    ? subscriptionService.canAccessPremiumFeatures()
    : false;
  const isTrialActive = subscription
    ? subscriptionService.isInTrialPeriod()
    : false;
  const daysUntilExpiry = subscription
    ? subscriptionService.getDaysUntilExpiry()
    : null;
  return (
    <GlobalContext.Provider
      value={{
        isLoggedIn,
        isOnlineMode,
        refetchUser,
        refetchResources,
        refetchTransactions,
        user,
        userLoading,
        wallets,
        walletsLoading,
        transactions,
        transactionsLoading,
        totalBalance,
        totalBalanceLoading,
        totalIncomes,
        totalIncomesLoading,
        totalExpenses,
        totalExpensesLoading,
        totalIncomesSevenDays,
        totalIncomesSevenDaysLoading,
        totalExpensesSevenDays,
        totalExpensesSevenDaysLoading,
        totalIncomesThirtyDays,
        totalIncomesThirtyDaysLoading,
        totalExpensesThirtyDays,
        totalExpensesThirtyDaysLoading,
        categoryExpensesSevenDays,
        categoryExpensesSevenDaysLoading,
        categoryExpensesThirtyDays,
        categoryExpensesThirtyDaysLoading,
        categoryExpensesYear,
        categoryExpensesYearLoading,
        refetchSyncData,
        syncDataLoading,
        subscription: subscription || {
          mode: 'free',
          syncMode: 'local',
          isLoggedIn: false,
          isTrialActive: false,
        },
        subscriptionLoading,
        appMode,
        canAccessCloudSync,
        canAccessPremiumFeatures,
        isTrialActive,
        daysUntilExpiry,
        upgradeToPremium,
        startTrial,
        toggleCloudSync,
        resetToFreeMode,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (!context)
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  return context;
};

export default GlobalProvider;
