import { CATEGORIES } from '@/constants/categories';
import { CategoryExpenseData, PeriodTypes } from '@/constants/interfaces';
import { TransactionType } from '@/types/types';
import { Query } from 'react-native-appwrite';
import { getCurrentUser } from './auth';
import { config, databases } from './client';

export const getTotalIncomes = async ({
  period,
}: { period?: PeriodTypes } = {}): Promise<number> => {
  try {
    const user = await getCurrentUser();
    if (!user) return 0;

    const queries = [
      Query.equal('user_id', user.$id),
      Query.equal('type', TransactionType.INCOME),
    ];

    if (period !== PeriodTypes.ALL_TIME) {
      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      switch (period) {
        case PeriodTypes.WEEKLY:
          // Get current week (Monday to Sunday)
          const currentDay = now.getDay();
          const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // adjust when day is Sunday
          startDate = new Date(now.setDate(diff));
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
          break;

        case PeriodTypes.MONTHLY:
          // Get current month
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          endDate.setHours(23, 59, 59, 999);
          break;

        case PeriodTypes.ANNUAL:
          // Get current year
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31);
          endDate.setHours(23, 59, 59, 999);
          break;

        case PeriodTypes.SEVEN_DAYS:
          // Get last 7 days
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 6);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;

        case PeriodTypes.THIRTY_DAYS:
          // Get last 30 days
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 29);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;

        default:
          // No time filter for unknown period types
          break;
      }

      if (startDate! && endDate!) {
        queries.push(Query.greaterThanEqual('date', startDate.toISOString()));
        queries.push(Query.lessThanEqual('date', endDate.toISOString()));
      }
    }

    const response = await databases.listDocuments(
      config.databaseId,
      config.transactionCollectionId,
      queries
    );

    const totalIncome = response.documents.reduce(
      (acc, transaction: any) => acc + (transaction.amount as number),
      0
    );

    return totalIncome;
  } catch (error) {
    console.error('Error fetching total income:', error);
    return 0;
  }
};

export const getTotalExpenses = async ({
  period,
}: { period?: PeriodTypes } = {}): Promise<number> => {
  try {
    const user = await getCurrentUser();
    if (!user) return 0;

    const queries = [
      Query.equal('user_id', user.$id),
      Query.equal('type', TransactionType.EXPENSE),
    ];

    if (period !== PeriodTypes.ALL_TIME) {
      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      switch (period) {
        case PeriodTypes.WEEKLY:
          // Get current week (Monday to Sunday)
          const currentDay = now.getDay();
          const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // adjust when day is Sunday
          startDate = new Date(now.setDate(diff));
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
          break;

        case PeriodTypes.MONTHLY:
          // Get current month
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          endDate.setHours(23, 59, 59, 999);
          break;

        case PeriodTypes.ANNUAL:
          // Get current year
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31);
          endDate.setHours(23, 59, 59, 999);
          break;

        case PeriodTypes.SEVEN_DAYS:
          // Get last 7 days
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 6);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;

        case PeriodTypes.THIRTY_DAYS:
          // Get last 30 days
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 29);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;

        default:
          // No time filter for unknown period types
          break;
      }

      if (startDate! && endDate!) {
        queries.push(Query.greaterThanEqual('date', startDate.toISOString()));
        queries.push(Query.lessThanEqual('date', endDate.toISOString()));
      }
    }

    const response = await databases.listDocuments(
      config.databaseId,
      config.transactionCollectionId,
      queries
    );

    const totalExpenses = response.documents.reduce(
      (acc, transaction: any) => acc + (transaction.amount as number),
      0
    );

    return totalExpenses;
  } catch (error) {
    console.error('Error fetching total expenses:', error);
    return 0;
  }
};

export const getExpensesByCategoryWithTimeFilter = async ({
  period,
}: {
  period: PeriodTypes;
}): Promise<CategoryExpenseData[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    // Build queries based on time filter
    const queries = [
      Query.equal('user_id', user.$id),
      Query.equal('type', TransactionType.EXPENSE),
    ];
    if (period !== PeriodTypes.ALL_TIME) {
      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      switch (period) {
        case PeriodTypes.WEEKLY:
          // Get current week (Monday to Sunday)
          const currentDay = now.getDay();
          const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // adjust when day is Sunday
          startDate = new Date(now.setDate(diff));
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
          break;

        case PeriodTypes.MONTHLY:
          // Get current month
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          endDate.setHours(23, 59, 59, 999);
          break;

        case PeriodTypes.ANNUAL:
          // Get current year
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31);
          endDate.setHours(23, 59, 59, 999);
          break;

        case PeriodTypes.SEVEN_DAYS:
          // Get last 7 days
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 6);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;

        case PeriodTypes.THIRTY_DAYS:
          // Get last 30 days
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 29);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;

        default:
          // No time filter for unknown period types
          break;
      }

      if (startDate! && endDate!) {
        queries.push(Query.greaterThanEqual('date', startDate.toISOString()));
        queries.push(Query.lessThanEqual('date', endDate.toISOString()));
      }
    }

    queries.push(Query.orderDesc('date'));

    // Get filtered transactions
    const response = await databases.listDocuments(
      config.databaseId,
      config.transactionCollectionId,
      queries
    );

    if (!response?.documents?.length) return [];

    // Group transactions by category and calculate totals
    const categoryTotals = new Map<
      string,
      {
        name: string;
        total: number;
        color: string;
      }
    >();

    let totalExpenses = 0;

    response.documents.forEach((transaction: any) => {
      const categoryId = transaction.category as string;
      const category = CATEGORIES.find((cat) => cat.id === categoryId);
      const categoryName = category?.name || 'Uncategorized';
      const amount = transaction.amount as number;

      // Default colors for categories if color is not available
      const defaultColors = [
        '#f59e0b',
        '#3b82f6',
        '#ec4899',
        '#8b5cf6',
        '#ef4444',
        '#10b981',
        '#84cc16',
        '#94a3b8',
        '#f97316',
        '#06b6d4',
      ];

      const colorIndex = categoryTotals.size % defaultColors.length;
      const categoryColor = defaultColors[colorIndex];

      totalExpenses += amount;

      if (categoryTotals.has(categoryId)) {
        const existing = categoryTotals.get(categoryId)!;
        existing.total += amount;
      } else {
        categoryTotals.set(categoryId, {
          name: categoryName,
          total: amount,
          color: categoryColor,
        });
      }
    });

    // Convert to array and calculate percentages
    const categoryData: CategoryExpenseData[] = Array.from(
      categoryTotals.entries()
    ).map(([categoryId, data]) => ({
      categoryId,
      categoryName: data.name,
      totalAmount: data.total,
      percentage: totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0,
      color: data.color,
    }));

    // Sort by total amount (highest first)
    categoryData.sort((a, b) => b.totalAmount - a.totalAmount);

    return categoryData;
  } catch (error) {
    console.error(
      'Error fetching expenses by category with time filter:',
      error
    );
    return [];
  }
};
