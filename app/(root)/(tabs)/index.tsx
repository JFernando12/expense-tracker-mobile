import TransactionList from '@/components/TransactionList';
import icons from '@/constants/icons';
import { useGlobalContext } from '@/lib/global-provider';
import { router } from 'expo-router';
import {
  Image,
  ImagePropsBase,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
  const {
    user,
    transactions,
    transactionsLoading,
    totalBalance,
    totalBalanceLoading,
    totalIncomes,
    totalIncomesLoading,
    totalExpenses,
    totalExpensesLoading,
  } = useGlobalContext();

  if (
    transactionsLoading ||
    totalBalanceLoading ||
    totalIncomesLoading ||
    totalExpensesLoading
  ) {
    return (
      <SafeAreaView className="bg-primary-100 h-full p-5">
        <Text className="text-white">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-primary-100 h-full p-5 -pb-safe-offset-14">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <View>
          <Text className="text-neutral-200 text-lg">Hello,</Text>
          <Text className="text-white text-2xl font-bold">{user?.name}</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(root)/(modals)/profileModal')}
          className="h-12 w-12 rounded-full overflow-hidden bg-accent-200"
        >
          <Image source={{ uri: user?.avatar }} className="h-full w-full" />
        </TouchableOpacity>
      </View>
      {/* Balance Section */}
      <View className="bg-primary-300 p-6 rounded-3xl mb-6 shadow-lg">
        <Text className="text-neutral-200 text-lg mb-1">Total Balance</Text>
        <Text className="text-white text-4xl font-bold mb-6">
          ${totalBalance?.toFixed(2)}
        </Text>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="h-9 w-9 bg-accent-200 rounded-full items-center justify-center mr-3">
              <Image
                source={icons.wallet as ImagePropsBase}
                tintColor="white"
                className="h-5 w-5"
              />
            </View>
            <View>
              <Text className="text-neutral-200">Income</Text>
              <Text className="text-white text-lg font-bold">
                ${totalIncomes?.toFixed(2)}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <View className="h-9 w-9 bg-danger-100 rounded-full items-center justify-center mr-3">
              <Image
                source={icons.calendar as ImagePropsBase}
                tintColor="white"
                className="h-5 w-5"
              />
            </View>
            <View>
              <Text className="text-neutral-200">Expense</Text>
              <Text className="text-danger font-bold text-lg">
                ${totalExpenses?.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </View>
      {/* Today's Transactions Section */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-white text-2xl font-bold">Today</Text>
        <TouchableOpacity
          onPress={() => router.push('/(root)/(modals)/searchModal')}
          className="h-10 w-10 bg-primary-300 rounded-full items-center justify-center"
        >
          <Image
            source={icons.search as ImagePropsBase}
            tintColor="white"
            className="h-5 w-5"
          />
        </TouchableOpacity>
      </View>
      <View className="flex-1">
        <TransactionList transactions={transactions || []} />
      </View>
    </SafeAreaView>
  );
}
