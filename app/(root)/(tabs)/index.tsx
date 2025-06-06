import TransactionList from '@/components/TransactionList';
import icons from '@/constants/icons';
import images from '@/constants/images';
import { useGlobalContext } from '@/lib/global-provider';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Image,
  ImagePropsBase,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
  const {
    userLoading,
    transactions,
    transactionsLoading,
    totalBalance,
    totalBalanceLoading,
    totalIncomes,
    totalIncomesLoading,
    totalExpenses,
    totalExpensesLoading,
    syncDataLoading,
  } = useGlobalContext();

  const { t } = useTranslation();

  if (
    syncDataLoading ||
    transactionsLoading ||
    userLoading ||
    totalBalanceLoading ||
    totalIncomesLoading ||
    totalExpensesLoading
  ) {
    return (
      <SafeAreaView className="bg-primary-100 h-full flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="white" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-primary-100 h-full p-5 -pb-safe-offset-20">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <Text className="text-white text-2xl font-bold">Transactions</Text>
        <TouchableOpacity
          onPress={() => router.push('/(root)/(tabs)/profile')}
          className="size-10 rounded-full overflow-hidden bg-accent-200 flex items-center justify-center"
        >
          <Image
            source={images.avatar as ImagePropsBase}
            className="size-5"
            tintColor="#6b7280"
          />
        </TouchableOpacity>
      </View>
      {/* Balance Section */}
      <View className="bg-primary-300 p-6 rounded-3xl mt-3 shadow-lg">
        <Text className="text-neutral-200 text-lg mb-1">
          {t('home.totalBalance')}
        </Text>
        <Text className="text-white text-4xl font-bold mb-6">
          ${totalBalance?.toFixed(2) || '0.00'}
        </Text>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="size-8 rounded-full border-accent-200 border-2 items-center justify-center mr-3">
              <Image
                source={icons.upArrow as ImagePropsBase}
                tintColor="#18C06A"
                className="size-5"
              />
            </View>
            <View>
              <Text className="text-neutral-200">{t('home.income')}</Text>
              <Text className="text-white text-lg font-bold">
                ${totalIncomes?.toFixed(2) || '0.00'}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <View className="size-8 rounded-full border-danger border-2 items-center justify-center mr-3">
              <Image
                source={icons.downArrow as ImagePropsBase}
                tintColor="#F75555"
                className="size-5"
              />
            </View>
            <View>
              <Text className="text-neutral-200">{t('home.expenses')}</Text>
              <Text className="text-danger font-bold text-lg">
                ${totalExpenses?.toFixed(2) || '0.00'}
              </Text>
            </View>
          </View>
        </View>
      </View>
      {/* Today's Transactions Section */}
      <View className="flex-row items-center justify-between mt-3">
        <Text className="text-white text-2xl font-bold">
          {t('home.recent')}
        </Text>
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
      <View className="flex-1 mt-3">
        <TransactionList transactions={transactions || []} />
      </View>
    </SafeAreaView>
  );
}
