import { Category, TransactionType, Wallet } from '@/types/types';
import { createContext, useContext } from 'react';
import { getCategories, getCurrentUser, getWallets } from './appwrite';
import { useAppwrite } from './useAppwrite';

interface User {
  $id: string;
  name: string;
  email: string;
  avatar: string;
}

interface GlobalContextType {
  isLoggedIn: boolean;
  user: User | null | undefined;
  loading: boolean;
  refetch: (newParams?: Record<string, string | number>) => Promise<void>;
  // Added data properties
  expenseCategories: Category[] | null;
  incomeCategories: Category[] | null;
  wallets: Wallet[] | null;
  expenseCategoriesLoading: boolean;
  incomeCategoriesLoading: boolean;
  walletsLoading: boolean;
  refetchResources: () => Promise<void>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

interface GlobalProviderProps {
  children: React.ReactNode;
}

export const GlobalProvider = ({ children }: GlobalProviderProps) => {
  const {
    data: user,
    loading,
    refetch,
  } = useAppwrite({
    fn: getCurrentUser,
  });

  const {
    data: expenseCategories,
    loading: expenseCategoriesLoading,
    refetch: refetchExpenseCategories,
  } = useAppwrite({
    fn: getCategories,
    params: { type: TransactionType.EXPENSE },
  });

  const {
    data: incomeCategories,
    loading: incomeCategoriesLoading,
    refetch: refetchIncomeCategories,
  } = useAppwrite({
    fn: getCategories,
    params: { type: TransactionType.INCOME },
  });

  const {
    data: wallets,
    loading: walletsLoading,
    refetch: refetchWallets,
  } = useAppwrite({
    fn: getWallets,
    params: {},
  });

  const isLoggedIn = !!user;

  const refetchResources = async () => {
    if (isLoggedIn) {
      await Promise.all([
        refetchExpenseCategories(),
        refetchIncomeCategories(),
        refetchWallets(),
      ]);
    }
  };

  return (
    <GlobalContext.Provider
      value={{
        isLoggedIn,
        user,
        loading,
        refetch,
        expenseCategories,
        incomeCategories,
        wallets,
        expenseCategoriesLoading,
        incomeCategoriesLoading,
        walletsLoading,
        refetchResources,
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
