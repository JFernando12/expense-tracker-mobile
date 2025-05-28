import TransactionList from "@/components/TransactionList";
import {
  statisticsMonth,
  statisticsWeek,
  statisticsYear,
} from '@/constants/statistics';
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import React, { useState } from "react";
import { Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";

const statisticsTypes = [
  {
    label: "Semanal",
    data: statisticsWeek,
    maxValue: 6000,
    stepValue: 1000,
    yAxisLabelTexts: ["0", "1k", "2k", "3k", "4k", "5k", "6k"],
  },
  {
    label: "Mensual",
    data: statisticsMonth,
    maxValue: 20000,
    stepValue: 5000,
    yAxisLabelTexts: ["0", "5k", "10k", "15k", "20k"],
  },
  {
    label: "Anual",
    data: statisticsYear,
    maxValue: 100000,
    stepValue: 20000,
    yAxisLabelTexts: ["0", "20k", "40k", "60k", "80k", "100k"],
  },
];

const Statistics = () => {
  const [data, setData] = useState(statisticsTypes[0].data);
  const [maxValue, setMaxValue] = useState(statisticsTypes[0].maxValue);
  const [stepValue, setStepValue] = useState(statisticsTypes[0].stepValue);
  const [yAxisLabelTexts, setYAxisLabelTexts] = useState(
    statisticsTypes[0].yAxisLabelTexts
  );

  const handleSegmentChange = (label: string) => {
    const selectedType = statisticsTypes.find((type) => type.label === label);
    if (selectedType) {
      setData(selectedType.data);
      setMaxValue(selectedType.maxValue);
      setStepValue(selectedType.stepValue);
      setYAxisLabelTexts(selectedType.yAxisLabelTexts);
    }
  };

  return (
    <SafeAreaView className="bg-black h-full -pb-safe-offset-20 p-5">
      <View className="flex-row items-center justify-center">
        <Text className="text-white text-2xl font-bold">Estadisticas</Text>
      </View>
      <View className="mt-5">
        <View>
          <SegmentedControl
            values={["Semanal", "Mensual", "Anual"]}
            selectedIndex={0}
            onChange={(event) => handleSegmentChange(event.nativeEvent.value)}
          />
        </View>
        <View className="mt-5">
          <BarChart
            data={data}
            barWidth={14}
            initialSpacing={10}
            spacing={14}
            barBorderRadius={4}
            hideRules
            showGradient
            yAxisTextStyle={{ color: "lightgray" }}
            stepValue={stepValue}
            maxValue={maxValue}
            yAxisLabelTexts={yAxisLabelTexts}
            labelWidth={40}
            xAxisLabelTextStyle={{ color: "lightgray", textAlign: "center" }}
          />
        </View>
      </View>
      <View className="flex-1 mb-5">
        <Text className="text-white text-xl font-bold mt-5">
          Recent Transactions
        </Text>
        <TransactionList />
      </View>
    </SafeAreaView>
  );
};

export default Statistics;
