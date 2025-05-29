import { Transaction, TransactionType } from '@/types/types';
import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

const TransactionItem = ({
  id,
  category,
  description,
  amount,
  type,
  date,
}: Transaction) => {
  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: '/(root)/(modals)/transactionModal/[id]',
          params: { id },
        })
      }
      className="flex-row items-center justify-between bg-gray-800 p-4 rounded-lg mb-2"
    >
      <View>
        <Text className="text-white">{category}</Text>
        <Text className="text-gray-400">{description}</Text>
      </View>
      <View>
        <Text
          className={
            type === TransactionType.INCOME ? 'text-green-500' : 'text-red-600'
          }
        >
          {amount}
        </Text>
        <View className="flex-row items-center justify-end">
          <Text className="text-gray-400">{date}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default TransactionItem;
