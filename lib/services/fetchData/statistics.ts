import { CATEGORIES } from '@/constants/categories';
import { CategoryExpenseData, PeriodTypes } from '@/constants/interfaces';
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
}: {
  period: PeriodTypes;
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

  return result.map((item, index) => {
    const category = CATEGORIES.find((cat) => cat.id === item.categoryId);
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
};