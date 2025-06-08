import { TranslationKey } from '@/lib/i18n/types';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Ionicons } from '@expo/vector-icons';

export interface Category {
  id: string;
  type: 'expense' | 'income';
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  translationKey: TranslationKey;
}

// Static categories with Ionicons
export const CATEGORY_DEFINITIONS: Omit<Category, 'name'>[] = [
  {
    id: 'food',
    type: 'expense',
    icon: 'restaurant',
    translationKey: 'categories.food',
  },
  {
    id: 'transport',
    type: 'expense',
    icon: 'car',
    translationKey: 'categories.transport',
  },
  {
    id: 'entertainment',
    type: 'expense',
    icon: 'film',
    translationKey: 'categories.entertainment',
  },
  {
    id: 'shoping',
    type: 'expense',
    icon: 'bag',
    translationKey: 'categories.shopping',
  },
  {
    id: 'health',
    type: 'expense',
    icon: 'medical',
    translationKey: 'categories.health',
  },
  {
    id: 'utilities',
    type: 'expense',
    icon: 'flash',
    translationKey: 'categories.utilities',
  },
  {
    id: 'travel',
    type: 'expense',
    icon: 'airplane',
    translationKey: 'categories.travel',
  },
  {
    id: 'education',
    type: 'expense',
    icon: 'school',
    translationKey: 'categories.education',
  },
  {
    id: 'other_expense',
    type: 'expense',
    icon: 'ellipsis-horizontal',
    translationKey: 'categories.other_expense',
  },

  {
    id: 'salary',
    type: 'income',
    icon: 'wallet',
    translationKey: 'categories.salary',
  },
  {
    id: 'bonus',
    type: 'income',
    icon: 'gift',
    translationKey: 'categories.bonus',
  },
  {
    id: 'investment',
    type: 'income',
    icon: 'trending-up',
    translationKey: 'categories.investment',
  },
  {
    id: 'gift',
    type: 'income',
    icon: 'heart',
    translationKey: 'categories.gift',
  },
  {
    id: 'other_income',
    type: 'income',
    icon: 'add-circle',
    translationKey: 'categories.other_income',
  },
];

// Function to get categories with translations
export const getCategories = (
  t: (key: TranslationKey) => string
): Category[] => {
  return CATEGORY_DEFINITIONS.map((category) => ({
    ...category,
    name: t(category.translationKey),
  }));
};

// React hook to get translated categories
export const useTranslatedCategories = () => {
  const { t } = useTranslation();
  return getCategories(t);
};

// Helper function to get category by ID with translation
export const getCategoryById = (
  categoryId: string,
  t: (key: TranslationKey) => string
): Category | undefined => {
  const categories = getCategories(t);
  return categories.find((category) => category.id === categoryId);
};

// Helper hook to get a single category by ID
export const useCategory = (categoryId: string) => {
  const { t } = useTranslation();
  return getCategoryById(categoryId, t);
};

// Backward compatibility - static categories without translation
export const CATEGORIES = CATEGORY_DEFINITIONS.map((category) => ({
  ...category,
  name: category.translationKey.split('.')[1], // fallback to key without prefix
}));
