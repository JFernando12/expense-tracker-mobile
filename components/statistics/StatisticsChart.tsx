import React from 'react';
import { View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

type StatisticsChartProps = {
  data: any[];
  stepValue: number;
  maxValue: number;
  yAxisLabelTexts: string[];
};

const StatisticsChart = ({
  data,
  stepValue,
  maxValue,
  yAxisLabelTexts,
}: StatisticsChartProps) => {
  return (
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
  );
};

export default StatisticsChart;
