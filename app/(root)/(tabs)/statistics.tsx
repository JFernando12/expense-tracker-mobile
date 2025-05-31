import {
  CategoryDistribution,
  SpendingTrends,
  SummaryCards,
  WalletDistribution,
} from "@/components/statistics";
import {
  CategoryExpenseData,
  getExpensesByCategoryWithTimeFilter,
  TimeFilterOptions,
} from "@/lib/appwrite/transactions";
import { useGlobalContext } from "@/lib/global-provider";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Statistics = () => {
  const { user, totalIncomes, totalExpenses } = useGlobalContext();
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "weekly" | "monthly" | "annual"
  >("monthly");

  const handleSegmentChange = (label: string) => {
    let period: "weekly" | "monthly" | "annual";
    switch (label) {
      case "Semanal":
        period = "weekly";
        break;
      case "Mensual":
        period = "monthly";
        break;
      case "Anual":
        period = "annual";
        break;
      default:
        period = "monthly";
    }
    setSelectedPeriod(period);
  };

  // Fetch real category data
  const fetchCategoryData = useCallback(async () => {
    try {
      setLoading(true);
      const timeFilter: TimeFilterOptions = {
        period: selectedPeriod,
        date: new Date(),
      };

      const expensesData = await getExpensesByCategoryWithTimeFilter(
        timeFilter
      );

      // Transform data for the PieChart component
      const transformedData = expensesData.map((item: CategoryExpenseData) => ({
        value: item.totalAmount,
        color: item.color,
        text: `${item.percentage.toFixed(1)}%`,
        name: item.categoryName,
      }));

      setCategoryData(transformedData);
    } catch (error) {
      console.error("Error fetching category data:", error);
      // Fallback to sample data if there's an error
      const fallbackData = [
        { value: 30, color: "#f59e0b", text: "30%", name: "Food & Dining" },
        { value: 20, color: "#3b82f6", text: "20%", name: "Transportation" },
        { value: 15, color: "#ec4899", text: "15%", name: "Shopping" },
        { value: 12, color: "#8b5cf6", text: "12%", name: "Entertainment" },
        { value: 10, color: "#ef4444", text: "10%", name: "Bills & Utilities" },
        { value: 8, color: "#10b981", text: "8%", name: "Healthcare" },
        { value: 5, color: "#84cc16", text: "5%", name: "Personal Care" },
      ];
      setCategoryData(fallbackData);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchCategoryData();
  }, [fetchCategoryData]);

  // Refresh data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchCategoryData();
    }, [fetchCategoryData])
  );

  // Sample wallet data
  const walletData = [
    { name: "Efectivo", balance: 1250, color: "#f59e0b", percentage: "25%" },
    { name: "Banco", balance: 2500, color: "#3b82f6", percentage: "50%" },
    { name: "Ahorros", balance: 1250, color: "#ec4899", percentage: "25%" },
  ];

  return (
    <SafeAreaView className="bg-primary-100 h-full p-5 -pb-safe-offset-20">
      {/* Header */}
      <View className="flex-row items-center justify-start">
        <Text className="text-white text-2xl font-bold">Estadísticas</Text>
        <TouchableOpacity
          onPress={() => router.push("/(root)/(modals)/profileModal")}
          className="absolute right-0 top-0 size-12 rounded-full overflow-hidden bg-accent-200"
        >
          <Image source={{ uri: user?.avatar }} className="h-full w-full" />
        </TouchableOpacity>
      </View>
      {/* Segmented Control */}
      <View className="mt-8">
        <SegmentedControl
          values={["Semanal", "Mensual", "Anual"]}
          selectedIndex={
            selectedPeriod === "weekly"
              ? 0
              : selectedPeriod === "monthly"
              ? 1
              : 2
          }
          onChange={(event) => handleSegmentChange(event.nativeEvent.value)}
          tintColor="#18C06A"
          fontStyle={{ color: "white" }}
        />
      </View>
      <ScrollView
        className="flex-1 mt-4 rounded-t-xl"
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Cards */}
        <View>
          <SummaryCards
            totalExpenses={totalExpenses}
            totalIncomes={totalIncomes}
          />
        </View>
        {/* Expenses Category Distribution */}
        <View className="mt-6">
          <Text className="text-white text-xl font-bold mb-4">
            Gastos por Categoría{" "}
            {selectedPeriod === "weekly"
              ? "(Semanal)"
              : selectedPeriod === "monthly"
              ? "(Mensual)"
              : "(Anual)"}
          </Text>
          <CategoryDistribution categoryData={categoryData} loading={loading} />
        </View>
        {/* Spending Trends */}
        <View className="mt-6">
          <SpendingTrends />
        </View>
        {/* Wallet Distribution */}
        <View className="mt-6 mb-10">
          <WalletDistribution walletData={walletData} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Statistics;
