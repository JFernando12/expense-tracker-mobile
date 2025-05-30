import TransactionList from '@/components/TransactionList';
import {
  statisticsMonth,
  statisticsWeek,
  statisticsYear,
} from '@/constants/statistics';
import { useGlobalContext } from '@/lib/global-provider';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';

const statisticsTypes = [
  {
    label: 'Semanal',
    data: statisticsWeek,
    maxValue: 6000,
    stepValue: 1000,
    yAxisLabelTexts: ['0', '1k', '2k', '3k', '4k', '5k', '6k'],
  },
  {
    label: 'Mensual',
    data: statisticsMonth,
    maxValue: 20000,
    stepValue: 5000,
    yAxisLabelTexts: ['0', '5k', '10k', '15k', '20k'],
  },
  {
    label: 'Anual',
    data: statisticsYear,
    maxValue: 100000,
    stepValue: 20000,
    yAxisLabelTexts: ['0', '20k', '40k', '60k', '80k', '100k'],
  },
];

const Statistics = () => {
  const { transactions, user } = useGlobalContext();
  const router = require('expo-router').router;

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
    <SafeAreaView className="bg-primary-100 h-full p-5 -pb-safe-offset-14">
      {/* Header */}
      <View className="flex-row items-center justify-start">
        <Text className="text-white text-2xl font-bold">Estadísticas</Text>
        <TouchableOpacity
          onPress={() => router.push('/(root)/(modals)/profileModal')}
          className="absolute right-0 top-0 size-12 rounded-full overflow-hidden bg-accent-200"
        >
          <Image source={{ uri: user?.avatar }} className="h-full w-full" />
        </TouchableOpacity>
      </View>
      <View className="mt-8">
        <View className="">
          <SegmentedControl
            values={['Semanal', 'Mensual', 'Anual']}
            selectedIndex={0}
            onChange={(event) => handleSegmentChange(event.nativeEvent.value)}
            backgroundColor="#192A3A"
            tintColor="#18C06A"
            fontStyle={{ color: 'white' }}
          />
        </View>
        <View className="mt-5">
          <BarChart
            data={data}
            barWidth={12}
            initialSpacing={0}
            spacing={12}
            barBorderRadius={4}
            hideRules
            showGradient
            yAxisTextStyle={{ color: 'lightgray' }}
            yAxisColor={'transparent'}
            xAxisColor={'transparent'}
            stepValue={stepValue}
            maxValue={maxValue}
            yAxisLabelTexts={yAxisLabelTexts}
            labelWidth={40}
            xAxisLabelTextStyle={{ color: 'lightgray', textAlign: 'center' }}
          />
        </View>
      </View>
      <View className="flex-1">
        <Text className="text-white text-2xl font-bold mb-3">Hoy</Text>
        <TransactionList transactions={transactions || []} />
      </View>
    </SafeAreaView>
  );
};

export default Statistics;
