import { Text, View } from "react-native";

const WalletItem = ({ name, amount }: { name: string; amount: string }) => {
  return (
    <View className="flex-row items-center justify-between bg-black p-4 rounded-lg mb-2">
      <View>
        <Text className="text-white">Imagen</Text>
      </View>
      <View className="flex-1 ml-4">
        <Text className="text-white">{name}</Text>
        <Text className="text-gray-400">{amount}</Text>
      </View>
      <View>
        <Text className="text-white">Flecha</Text>
      </View>
    </View>
  );
};

export default WalletItem;