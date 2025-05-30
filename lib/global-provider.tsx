import { Category, Transaction, TransactionType, Wallet } from "@/types/types";
import { createContext, useContext } from "react";
import {
  getCategories,
  getCurrentUser,
  getTotalBalance,
  getTotalExpenses,
  getTotalIncomes,
  getTransactions,
  getWallets,
} from "./appwrite";
import { useAppwrite } from "./useAppwrite";

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
  refetchUser: (newParams?: Record<string, string | number>) => Promise<void>;
  expenseCategories: Category[] | null;
  incomeCategories: Category[] | null;
  wallets: Wallet[] | null;
  transactions: Transaction[] | null;
  expenseCategoriesLoading: boolean;
  incomeCategoriesLoading: boolean;
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
    params: {},
  });

  const {
    data: totalExpenses,
    loading: totalExpensesLoading,
    refetch: refetchTotalExpenses,
  } = useAppwrite({
    fn: getTotalExpenses,
    params: {},
  });

  const isLoggedIn = !!user;

  const refetchUser = async () => {
    await refetch();
  };
  
  const refetchResources = async () => {
    if (isLoggedIn) {
      await Promise.all([
        refetchExpenseCategories(),
        refetchIncomeCategories(),
        refetchWallets(),
        refetchTransactions(),
        refetchTotalBalance(),
        refetchTotalIncomes(),
        refetchTotalExpenses()
      ]);
    }
  };
  return (
    <GlobalContext.Provider
      value={{
        isLoggedIn,
        user,
        loading,
        refetchUser,
        expenseCategories,
        expenseCategoriesLoading,
        incomeCategories,
        incomeCategoriesLoading,
        wallets,
        walletsLoading,
        transactions,
        transactionsLoading,
        refetchResources,
        refetchTransactions,
        totalBalance,
        totalBalanceLoading,
        totalIncomes,
        totalIncomesLoading,
        totalExpenses,
        totalExpensesLoading,
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
