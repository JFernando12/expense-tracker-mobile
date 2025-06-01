export interface CategoryExpenseData {
  categoryId: string;
  categoryName: string;
  totalAmount: number;
  percentage: number;
  color: string;
}

export enum PeriodTypes {
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  ANNUAL = "annual",
  SEVEN_DAYS = "7days",
  THIRTY_DAYS = "30days",
  ALL_TIME = "all_time",
}

export interface ExtendedCategoryData extends CategoryExpenseData {
  color: string;
  value: number;
  text: string;
  name: string;
}