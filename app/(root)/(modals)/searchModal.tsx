import TransactionList from "@/components/TransactionList";
import icons from "@/constants/icons";
import { useGlobalContext } from "@/lib/global-provider";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { searchTransactions } from "@/lib/services/fetchData/transactions";
import { Transaction } from "@/types/types";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImagePropsBase,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SearchModal = () => {
  const { t } = useTranslation();
  const { transactions, isOnlineMode } = useGlobalContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Transaction[]>(
    transactions || []
  );
  const [isSearching, setIsSearching] = useState(false);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim()) {
        try {
          const results = await searchTransactions(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error("Search error:", error);
          setSearchResults([]);
        }
      } else {
        setSearchResults(transactions || []);
      }
      setIsSearching(false);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, transactions, isOnlineMode]);

  const handleSearchChange = (text: string) => {
    setIsSearching(true);
    setSearchQuery(text);
  };
  return (
    <SafeAreaView className="bg-primary-100 h-full p-5">
      <View className="relative flex-row items-center justify-center mb-5">
        <TouchableOpacity
          className="absolute left-0 p-2"
          onPress={() => router.back()}
        >
          <Image
            source={icons.backArrow as ImagePropsBase}
            className="size-9"
            tintColor="white"
          />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">
          {t("modals.searchModal.title")}
        </Text>
      </View>
      <View className="flex-row items-center">
        {" "}
        <TextInput
          className="flex-1 bg-primary-300 text-white p-5 rounded-3xl"
          placeholder={t("modals.searchModal.searchPlaceholder")}
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={handleSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            className="ml-3 p-3 bg-accent-200 rounded-full"
            onPress={() => setSearchQuery("")}
          >
            <Text className="text-white font-medium">{t("common.clear")}</Text>
          </TouchableOpacity>
        )}
      </View>
      <View className="mt-5 flex-1">
        {" "}
        {searchQuery.trim() && !isSearching && searchResults.length > 0 && (
          <Text className="text-neutral-200 text-sm mb-3">
            {t("modals.searchModal.foundResults", {
              count: searchResults.length,
              s: searchResults.length !== 1 ? "s" : "",
            })}
          </Text>
        )}{" "}
        {isSearching ? (
          <View className="flex-1 justify-center items-center bg-primary-300 p-6 rounded-3xl shadow-lg">
            <ActivityIndicator size="large" color="white" />
            <Text className="text-white mt-2 font-bold">
              {t("modals.searchModal.searching")}
            </Text>
          </View>
        ) : searchQuery.trim() && searchResults.length === 0 ? (
          <View className="flex-1 justify-center items-center bg-primary-300 p-6 rounded-3xl shadow-lg">
            <Text className="text-white text-lg font-bold">
              {t("modals.searchModal.noResults")}
            </Text>
            <Text className="text-neutral-200 text-sm mt-2 text-center">
              {t("modals.searchModal.noResultsDescription")}
            </Text>
          </View>
        ) : (
          <TransactionList transactions={searchResults} />
        )}
      </View>
    </SafeAreaView>
  );
};

export default SearchModal;
