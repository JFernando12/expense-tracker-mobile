import { Category, Transaction, TransactionType, Wallet } from "@/types/types";
import { createContext, useContext } from "react";
import {
  CategoryExpenseData,
  getCategories,
  getCurrentUser,
  getExpensesByCategoryWithTimeFilter,
  getTotalBalance,
  getTotalExpenses,
  getTotalIncomes,
  getTransactions,
  getWallets,
  PeriodTypes,
} from './appwrite';
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
  userLoading: boolean;
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
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

interface GlobalProviderProps {
  children: React.ReactNode;
}

export const GlobalProvider = ({ children }: GlobalProviderProps) => {
  const {
    data: user,
    loading: userLoading,
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
    fn: getExpensesByCategoryWithTimeFilter,
    params: { period: PeriodTypes.SEVEN_DAYS },
  });

  const {
    data: categoryExpensesThirtyDays,
    loading: categoryExpensesThirtyDaysLoading,
    refetch: refetchCategoryExpensesThirtyDays,
  } = useAppwrite({
    fn: getExpensesByCategoryWithTimeFilter,
    params: { period: PeriodTypes.THIRTY_DAYS },
  });

  const {
    data: categoryExpensesYear,
    loading: categoryExpensesYearLoading,
    refetch: refetchCategoryExpensesYear,
  } = useAppwrite({
    fn: getExpensesByCategoryWithTimeFilter,
    params: { period: PeriodTypes.ALL_TIME },
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
        refetchTotalExpenses(),
        refetchTotalIncomesSevenDays(),
        refetchTotalExpensesSevenDays(),
        refetchTotalIncomesThirtyDays(),
        refetchTotalExpensesThirtyDays(),
        refetchCategoryExpensesSevenDays(),
        refetchCategoryExpensesThirtyDays(),
        refetchCategoryExpensesYear(),
      ]);
    }
  };
  return (
    <GlobalContext.Provider
      value={{
        refetchUser,
        refetchResources,
        refetchTransactions,
        isLoggedIn,
        user,
        userLoading,
        expenseCategories,
        expenseCategoriesLoading,
        incomeCategories,
        incomeCategoriesLoading,
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
