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
  totalIncomesWeek: number | null;
  totalIncomesWeekLoading: boolean;
  totalExpensesWeek: number | null;
  totalExpensesWeekLoading: boolean;
  // Monthly totals
  totalIncomesMonth: number | null;
  totalIncomesMonthLoading: boolean;
  totalExpensesMonth: number | null;
  totalExpensesMonthLoading: boolean;
  // Annual totals
  totalIncomesYear: number | null;
  totalIncomesYearLoading: boolean;
  totalExpensesYear: number | null;
  totalExpensesYearLoading: boolean;
  categoryExpensesWeek: CategoryExpenseData[] | null;
  categoryExpensesWeekLoading: boolean;
  categoryExpensesMonth: CategoryExpenseData[] | null;
  categoryExpensesMonthLoading: boolean;
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
    data: totalIncomesWeek,
    loading: totalIncomesWeekLoading,
    refetch: refetchTotalIncomesWeek,
  } = useAppwrite({
    fn: getTotalIncomes,
    params: { period: PeriodTypes.WEEKLY },
  });

  const {
    data: totalExpensesWeek,
    loading: totalExpensesWeekLoading,
    refetch: refetchTotalExpensesWeek,
  } = useAppwrite({
    fn: getTotalExpenses,
    params: { period: PeriodTypes.WEEKLY },
  });

  const {
    data: totalIncomesMonth,
    loading: totalIncomesMonthLoading,
    refetch: refetchTotalIncomesMonth,
  } = useAppwrite({
    fn: getTotalIncomes,
    params: { period: PeriodTypes.MONTHLY },
  });

  const {
    data: totalExpensesMonth,
    loading: totalExpensesMonthLoading,
    refetch: refetchTotalExpensesMonth,
  } = useAppwrite({
    fn: getTotalExpenses,
    params: { period: PeriodTypes.MONTHLY },
  });

  const {
    data: totalIncomesYear,
    loading: totalIncomesYearLoading,
    refetch: refetchTotalIncomesYear,
  } = useAppwrite({
    fn: getTotalIncomes,
    params: { period: PeriodTypes.ANNUAL },
  });

  const {
    data: totalExpensesYear,
    loading: totalExpensesYearLoading,
    refetch: refetchTotalExpensesYear,
  } = useAppwrite({
    fn: getTotalExpenses,
    params: { period: PeriodTypes.ANNUAL },
  });

  const {
    data: categoryExpensesWeek,
    loading: categoryExpensesWeekLoading,
    refetch: refetchCategoryExpensesWeek,
  } = useAppwrite({
    fn: getExpensesByCategoryWithTimeFilter,
    params: { period: PeriodTypes.WEEKLY },
  });

  const {
    data: categoryExpensesMonth,
    loading: categoryExpensesMonthLoading,
    refetch: refetchCategoryExpensesMonth,
  } = useAppwrite({
    fn: getExpensesByCategoryWithTimeFilter,
    params: { period: PeriodTypes.MONTHLY },
  });

  const {
    data: categoryExpensesYear,
    loading: categoryExpensesYearLoading,
    refetch: refetchCategoryExpensesYear,
  } = useAppwrite({
    fn: getExpensesByCategoryWithTimeFilter,
    params: { period: PeriodTypes.ANNUAL },
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
        refetchTotalIncomesWeek(),
        refetchTotalExpensesWeek(),
        refetchTotalIncomesMonth(),
        refetchTotalExpensesMonth(),
        refetchTotalIncomesYear(),
        refetchTotalExpensesYear(),
        refetchCategoryExpensesWeek(),
        refetchCategoryExpensesMonth(),
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
        totalIncomesWeek,
        totalIncomesWeekLoading,
        totalExpensesWeek,
        totalExpensesWeekLoading,
        totalIncomesMonth,
        totalIncomesMonthLoading,
        totalExpensesMonth,
        totalExpensesMonthLoading,
        totalIncomesYear,
        totalIncomesYearLoading,
        totalExpensesYear,
        totalExpensesYearLoading,
        categoryExpensesWeek,
        categoryExpensesWeekLoading,
        categoryExpensesMonth,
        categoryExpensesMonthLoading,
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
