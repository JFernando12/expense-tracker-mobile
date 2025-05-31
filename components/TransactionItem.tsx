import icons from "@/constants/icons";
import { Transaction, TransactionType } from "@/types/types";
import { router } from "expo-router";
import {
  Image,
  ImagePropsBase,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
          pathname: "/(root)/(modals)/transactionModal/[id]",
          params: { id },
        })
      }
      className={`${
        type === TransactionType.INCOME
          ? "bg-secondary-200"
          : "bg-secondary-100"
      } flex-row items-center justify-between p-5 rounded-2xl mb-3 shadow-sm`}
    >
      <View className="flex-row items-center">
        <View
          className={`h-12 w-12 ${
            type === TransactionType.INCOME ? "bg-accent-200" : "bg-danger-100"
          } rounded-full items-center justify-center mr-3`}
        >
          <Image
            source={
              type === TransactionType.INCOME
                ? (icons.wallet as ImagePropsBase)
                : (icons.cutlery as ImagePropsBase)
            }
            tintColor="white"
            className="h-6 w-6"
          />
        </View>
        <View>
          <Text className="text-white text-lg font-bold">{category}</Text>
          <Text className="text-neutral-200">{description}</Text>
        </View>
      </View>

      <View className="items-end">
        <Text
          className={
            type === TransactionType.INCOME
              ? "text-accent-100 text-lg font-bold"
              : "text-danger text-lg font-bold"
          }
        >
          {type === TransactionType.INCOME ? "+" : "-"} $
          {Number(amount).toFixed(2)}
        </Text>
        <Text className="text-neutral-200 mt-1">{date}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default TransactionItem;
