import { CategoryExpenseData, PeriodTypes } from "@/constants/interfaces";
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Transaction, Wallet } from '@/types/types';
import { useNetworkState } from 'expo-network';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  getExpensesByCategory,
  getTotalExpenses,
  getTotalIncomes,
} from './services/fetchData/statistics';
import { getTransactions } from './services/fetchData/transactions';
import { getTotalBalance, getWallets } from './services/fetchData/wallets';

import { syncData } from './services/syncData/syncData';
import { getUser } from './services/user/user';
import { UserLocal } from './storage/userLocalStorage';
import { useAppwrite } from './useAppwrite';

export interface User {
  id: string;
  name: string;
  email: string;
  appMode: 'free' | 'premium';
  subscriptionType?: 'monthly' | 'yearly';
  subscriptionExpiration?: Date;
}

interface RegistrationUserData {
  email: string;
  password: string;
  name: string;
  appMode: 'free' | 'premium';
  subscriptionType?: 'monthly' | 'yearly'; // Optional, defaults to 'monthly'
}

interface GlobalContextType {
  // Network state
  isNetworkEnabled: boolean;
  // Subscription modal state
  subscriptionModal: {
    visible: boolean;
    registrationUserData?: RegistrationUserData;
  };
  openSubscriptionModal: (params?: {
    registrationUserData?: RegistrationUserData;
  }) => void;
  closeSubscriptionModal: () => void;
  // User and login state
  userLocal: UserLocal | null;
  userLocalLoading: boolean;
  refetchUserLocal: () => Promise<void>;
  isOnlineMode: boolean;
  // Resources state
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
  refetchSyncedData: () => Promise<void>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

interface GlobalProviderProps {
  children: React.ReactNode;
}

export const GlobalProvider = ({ children }: GlobalProviderProps) => {
  const { t } = useTranslation();
  const networkState = useNetworkState();

  // Create wrapper functions with translation function captured in closure
  const getExpensesByCategoryWithTranslation = useCallback(
    (params: { period: PeriodTypes }) =>
      getExpensesByCategory({ ...params, t }),
    [t]
  );

  const [subscriptionModal, setSubscriptionModal] = useState<{
    visible: boolean;
    registrationUserData?: RegistrationUserData;
  }>({
    visible: false,
  });

  const closeSubscriptionModal = () => {
    setSubscriptionModal({
      visible: false,
    });
  };

  const openSubscriptionModal = (params?: {
    registrationUserData?: RegistrationUserData;
  }) => {
    const registrationUserData = params?.registrationUserData;
    setSubscriptionModal({
      visible: true,
      registrationUserData,
    });
  };

  const {
    data: userLocal,
    loading: userLocalLoading,
    refetch: refetchUserLocal,
  } = useAppwrite({
    fn: getUser,
  });

  const isNetworkEnabled =
    (networkState.isConnected && networkState.isInternetReachable) || false;
  const isOnlineMode =
    (userLocal?.appMode === 'premium' &&
      userLocal?.isLoggedIn &&
      userLocal?.syncMode === 'cloud' &&
      isNetworkEnabled) ||
    false;

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
    fn: getExpensesByCategoryWithTranslation,
    params: { period: PeriodTypes.SEVEN_DAYS },
  });

  const {
    data: categoryExpensesThirtyDays,
    loading: categoryExpensesThirtyDaysLoading,
    refetch: refetchCategoryExpensesThirtyDays,
  } = useAppwrite({
    fn: getExpensesByCategoryWithTranslation,
    params: { period: PeriodTypes.THIRTY_DAYS },
  });

  const {
    data: categoryExpensesYear,
    loading: categoryExpensesYearLoading,
    refetch: refetchCategoryExpensesYear,
  } = useAppwrite({
    fn: getExpensesByCategoryWithTranslation,
    params: { period: PeriodTypes.ALL_TIME },
  });

  const { refetch: refetchSyncData, loading: syncDataLoading } = useAppwrite({
    fn: syncData,
    params: {},
    skip: true,
  });

  const refetchResources = async () => {
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
    // Update last sync time on successful sync
    const { userLocalStorage } = await import('@/lib/storage/userLocalStorage');
    await userLocalStorage.updateLastSyncDate();
  };

  useEffect(() => {
    if (isOnlineMode) {
      refetchSyncedData()
        .then(() => console.log('Data synced successfully'))
        .catch((error) => console.error('Error syncing data:', error));
    }
  }, [isOnlineMode]);

  useEffect(() => {
    refetchStatistics();
  }, [wallets, transactions]);

  return (
    <GlobalContext.Provider
      value={{
        isNetworkEnabled,
        isOnlineMode,
        subscriptionModal,
        openSubscriptionModal,
        closeSubscriptionModal,
        userLocal,
        userLocalLoading,
        refetchUserLocal,
        refetchResources,
        refetchTransactions,
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
        refetchSyncedData,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (!context)
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  return context;
};

export default GlobalProvider;
