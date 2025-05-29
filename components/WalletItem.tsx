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
      className="flex-row items-center justify-between bg-black p-4 rounded-lg mb-2"
    >
      <View>
        <Image
          source={icons.wallet as ImagePropsBase}
          className="size-9"
          tintColor="white"
        />
      </View>
      <View className="flex-1 ml-4">
        <Text className="text-white">{name}</Text>
        <Text className="text-gray-400">{currentBalance}</Text>
      </View>
      <View>
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
