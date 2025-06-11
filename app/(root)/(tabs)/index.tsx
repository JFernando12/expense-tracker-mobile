import Header from '@/components/Header';
import HomeSkeleton from '@/components/skeletons/HomeSkeleton';
import TransactionList from '@/components/TransactionList';
import icons from '@/constants/icons';
import { useGlobalContext } from '@/lib/global-provider';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { formatNumberWithCommas } from '@/lib/utils/numberUtils';
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
    transactions,
    transactionsLoading,
    totalBalance,
    totalBalanceLoading,
    totalIncomes,
    totalIncomesLoading,
    totalExpenses,
    totalExpensesLoading,
  } = useGlobalContext();

  const { t } = useTranslation();
  if (
    transactionsLoading ||
    totalBalanceLoading ||
    totalIncomesLoading ||
    totalExpensesLoading
  ) {
    return (
      <SafeAreaView className="bg-primary-100 h-full">
        <HomeSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-primary-100 h-full p-5 -pb-safe-offset-20">
      {/* Header */}
      <Header title="home.transactions" />
      {/* Balance Section */}
      <View className="bg-primary-300 p-6 rounded-3xl mt-3 shadow-lg">
        <Text className="text-neutral-200 text-lg mb-1">
          {t('home.totalBalance')}
        </Text>
        <Text className="text-white text-4xl font-bold mb-6">
          $
          {totalBalance
            ? formatNumberWithCommas(totalBalance.toFixed(2))
            : '0.00'}
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
                $
                {totalIncomes
                  ? formatNumberWithCommas(totalIncomes.toFixed(2))
                  : '0.00'}
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
                $
                {totalExpenses
                  ? formatNumberWithCommas(totalExpenses.toFixed(2))
                  : '0.00'}
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
