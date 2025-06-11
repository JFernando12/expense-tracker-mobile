import { useCategory } from '@/constants/categories';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { formatNumberWithCommas } from '@/lib/utils/numberUtils';
import { Transaction, TransactionType } from '@/types/types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

const TransactionItem = ({
  id,
  categoryId,
  description,
  amount,
  type,
  date,
}: Transaction) => {
  const { t } = useTranslation();
  const category = useCategory(categoryId);

  // Function to get translated category name
  const getCategoryName = (categoryId: string) => {
    const categoryKey = `categories.${categoryId}` as any;
    try {
      return t(categoryKey);
    } catch {
      // Fallback to the original categoryId if translation not found
      return categoryId;
    }
  };

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: '/(root)/(modals)/transactionModal/[id]',
          params: { id },
        })
      }
      className={`${
        type === TransactionType.INCOME
          ? 'bg-secondary-200'
          : 'bg-secondary-100'
      } flex-row items-center justify-between p-5 rounded-2xl mb-3 shadow-sm`}
    >
      <View className="flex-row items-center">
        <View
          className={`h-12 w-12 ${
            type === TransactionType.INCOME ? 'bg-accent-200' : 'bg-danger-100'
          } rounded-full items-center justify-center mr-3`}
        >
          <Ionicons
            name={
              category?.icon ||
              (type === TransactionType.INCOME ? 'wallet' : 'restaurant')
            }
            size={24}
            color="white"
          />
        </View>
        <View>
          <Text className="text-white text-lg font-bold">
            {getCategoryName(categoryId)}
          </Text>
          <Text className="text-neutral-200">{description}</Text>
        </View>
      </View>

      <View className="items-end">
        <Text
          className={
            type === TransactionType.INCOME
              ? 'text-accent-100 text-lg font-bold'
              : 'text-danger text-lg font-bold'
          }
        >
          {type === TransactionType.INCOME ? '+' : '-'} $
          {formatNumberWithCommas(Number(amount).toFixed(2))}
        </Text>
        <Text className="text-neutral-200 mt-1">{date}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default TransactionItem;
