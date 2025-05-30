import icons from '@/constants/icons';
import { router } from 'expo-router';
import {
  Image,
  ImagePropsBase,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const WalletItem = ({
  id,
  name,
  currentBalance,
}: {
  id: string;
  name: string;
  currentBalance: number;
}) => {
  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: '/(root)/(modals)/walletModal/[id]',
          params: { id },
        })
      }
      className="flex-row items-center justify-between bg-secondary-100 p-5 rounded-2xl mb-3"
    >
      <View className="flex-row items-center">
        <View className="h-12 w-12 bg-accent-200 rounded-full items-center justify-center mr-3">
          <Image
            source={icons.wallet as ImagePropsBase}
            className="h-6 w-6"
            tintColor="white"
          />
        </View>
        <View>
          <Text className="text-white text-lg font-bold">{name}</Text>
          <Text className="text-neutral-200">Main Account</Text>
        </View>
      </View>
      <View className="items-end">
        <Text className="text-accent-100 text-lg font-bold">
          ${currentBalance.toFixed(2)}
        </Text>
        <Image
          source={icons.rightArrow as ImagePropsBase}
          tintColor="#8C8E98"
          className="h-4 w-4 mt-1"
        />
      </View>
    </TouchableOpacity>
  );
};

export default WalletItem;
