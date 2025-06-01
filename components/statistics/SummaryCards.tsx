import icons from "@/constants/icons";
import React from "react";
import { Image, ImagePropsBase, Text, View } from "react-native";

type SummaryCardsProps = {
  totalExpenses: number | undefined | null;
  totalIncomes: number | undefined | null;
  period?: "7days" | "30days" | "total";
};

const SummaryCards = ({
  totalExpenses,
  totalIncomes,
  period,
}: SummaryCardsProps) => {
  const getPeriodText = () => {
    switch (period) {
      case "7days":
        return "últimos 7 días";
      case "30days":
        return "últimos 30 días";
      case "total":
        return "total acumulado";
      default:
        return "este período";
    }
  };

  return (
    <View className="flex-row justify-between">
      <View className="bg-primary-300 p-4 rounded-xl w-[48%] flex-row items-center justify-between">
        <View>
          <Text className="text-neutral-200 text-base">Ingresos</Text>
          <Text className="text-white text-xl font-bold">
            ${totalIncomes ? totalIncomes.toFixed(2) : "0.00"}
          </Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-neutral-200 text-xs">{getPeriodText()}</Text>
          </View>
        </View>
        <View className="size-8 rounded-full border-accent-200 border-2 items-center justify-center">
          <Image
            source={icons.upArrow as ImagePropsBase}
            tintColor="#18C06A"
            className="size-5"
          />
        </View>
      </View>
      <View className="bg-primary-300 p-4 rounded-xl w-[48%] flex-row items-center justify-between">
        <View>
          <Text className="text-neutral-200 text-base">Gastos</Text>
          <Text className="text-danger font-bold text-xl">
            ${totalExpenses ? totalExpenses.toFixed(2) : "0.00"}
          </Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-neutral-200 text-xs">{getPeriodText()}</Text>
          </View>
        </View>
        <View className="size-8 rounded-full border-danger border-2 items-center justify-center">
          <Image
            source={icons.downArrow as ImagePropsBase}
            tintColor="#F75555"
            className="size-5"
          />
        </View>
      </View>
    </View>
  );
};

export default SummaryCards;
