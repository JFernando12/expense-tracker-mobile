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
      className="flex-row items-center justify-between bg-secondary-100 p-5 rounded-2xl shadow-sm mb-3"
    >
      <View className="flex-row items-center">
        <View className="bg-secondary-300 size-12 rounded-full items-center justify-center mr-3">
          <Image
            source={icons.wallet as ImagePropsBase}
            className="size-6"
            tintColor="white"
          />
        </View>
        <View>
          <Text className="text-white text-lg font-bold">{name}</Text>
          <Text className="text-neutral-200 text-sm font-semibold">
            {currentBalance.toFixed(2)}
          </Text>
        </View>
      </View>
      <View className="items-end">
        <Image
          source={icons.rightArrow as ImagePropsBase}
          tintColor="white"
          className="size-9"
        />
      </View>
    </TouchableOpacity>
  );
};

export default WalletItem;
