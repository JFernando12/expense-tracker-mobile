export interface CategoryExpenseData {
  categoryId: string;
  categoryName: string;
  total: number;
  percentage: number;
  color: string;
}

export enum PeriodTypes {
  SEVEN_DAYS = '7days',
  THIRTY_DAYS = '30days',
  ALL_TIME = 'all_time',
}

export interface ExtendedCategoryData extends CategoryExpenseData {
  value: number;
  text: string;
  name: string;
}