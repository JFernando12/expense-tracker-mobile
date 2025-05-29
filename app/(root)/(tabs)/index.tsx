import TransactionList from "@/components/TransactionList";
import icons from "@/constants/icons";
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
  const { user, transactions, transactionsLoading } = useGlobalContext();

  if (transactionsLoading) {
    return (
      <SafeAreaView className="bg-black h-full p-5">
        <Text className="text-white">Loading...</Text>
      </SafeAreaView>
    );
  };

  return (
    <SafeAreaView className="bg-black h-full p-5 -pb-safe-offset-14">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-white">Hello,</Text>
          <Text className="text-white">{user?.name}</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(root)/(modals)/searchModal')}
        >
          <Image
            source={icons.search as ImagePropsBase}
            tintColor="white"
            className="size-9"
          />
        </TouchableOpacity>
      </View>
      {/* Balance Section */}
      <View className="mt-5 bg-white p-6 rounded-3xl">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl">Total Balance</Text>
          <Text>Opciones</Text>
        </View>
        <View className="mt-2">
          <Text className="text-3xl font-extrabold">$9,900.00</Text>
        </View>
        <View className="mt-5 flex-row items-center justify-between">
          <View>
            <Text className="text-xl font-bold">Ingresos</Text>
            <Text className="text-green-500 font-bold">$10,000.00</Text>
          </View>
          <View>
            <Text className="text-xl font-bold">Gastos</Text>
            <Text className="text-red-600 font-bold">$100.00</Text>
          </View>
        </View>
      </View>
      {/* Recent Transactions Section */}
      <View className="mt-5 flex-1">
        <Text className="text-white text-xl font-bold">
          Recent Transactions
        </Text>
        <TransactionList transactions={transactions || []} />
      </View>
      <TouchableOpacity
        onPress={() => router.push('/(root)/(modals)/transactionModal/create')}
        className="w-12 h-12 flex-col justify-center items-center bg-white rounded-full absolute bottom-5 right-5"
      >
        <Text className="text-3xl font-semibold">+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
