import { getCategoryById } from '@/constants/categories';
import { CategoryExpenseData, PeriodTypes } from '@/constants/interfaces';
import { TranslationKey } from '@/lib/i18n/types';
import { transactionLocalStorage } from '@/lib/storage/transactionLocalStorage';

export const getTotalIncomes = async ({
  period,
}: {
  period: PeriodTypes;
}): Promise<number> => {
  const result = transactionLocalStorage.getTotalIncome({ period });
  return result;
};

export const getTotalExpenses = async ({
  period,
}: {
  period: PeriodTypes;
}): Promise<number> => {
  const result = transactionLocalStorage.getTotalExpenses({ period });
  return result;
};

export const getExpensesByCategory = async ({
  period,
  t,
}: {
  period: PeriodTypes;
  t: (key: TranslationKey) => string;
}): Promise<CategoryExpenseData[]> => {
  const result = await transactionLocalStorage.getExpensesByCategory({
    period,
  });

  const colors = [
    '#FF5733', // Red
    '#33FF57', // Green
    '#3357FF', // Blue
    '#FFFF33', // Yellow
    '#FF33A1', // Pink
    '#33FFF5', // Cyan
    '#FF8C33', // Orange
  ];

  const totalExpenses = await getTotalExpenses({ period });

  const expensesByCategory = result.map((item, index) => {
    const category = getCategoryById(item.categoryId, t);
    const categoryId = item.categoryId;
    const categoryName = category?.name || 'Unknown';
    const percentage =
      totalExpenses > 0 ? (item.total / totalExpenses) * 100 : 0;
    const color = colors[index % colors.length];

    return {
      categoryId,
      categoryName,
      color,
      total: item.total,
      percentage: parseFloat(percentage.toFixed(2)),
    };
  });

  const expensesByCategorySorted = expensesByCategory.sort(
    (a, b) => b.total - a.total
  );
  return expensesByCategorySorted;
};
