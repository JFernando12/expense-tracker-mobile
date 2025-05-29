import TransactionList from "@/components/TransactionList";
import icons from "@/constants/icons";
import { searchTransactions } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
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
  const { transactions } = useGlobalContext();
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
  }, [searchQuery, transactions]);

  const handleSearchChange = (text: string) => {
    setIsSearching(true);
    setSearchQuery(text);
  };

  return (
    <SafeAreaView className="bg-black h-full p-5">
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
        <Text className="text-white text-2xl font-bold">Search</Text>
      </View>
      <View className="flex-row items-center">
        <TextInput
          className="flex-1 bg-gray-800 text-white p-5 rounded-lg"
          placeholder="Search transactions..."
          placeholderTextColor="gray"
          value={searchQuery}
          onChangeText={handleSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            className="ml-3 p-3 bg-gray-800 rounded-lg"
            onPress={() => setSearchQuery("")}
          >
            <Text className="text-white font-medium">Clear</Text>
          </TouchableOpacity>
        )}
      </View>
      <View className="mt-5 flex-1">
        {searchQuery.trim() && !isSearching && searchResults.length > 0 && (
          <Text className="text-gray-400 text-sm mb-3">
            Found {searchResults.length} transaction
            {searchResults.length !== 1 ? "s" : ""}
          </Text>
        )}
        {isSearching ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="white" />
            <Text className="text-white mt-2">Searching...</Text>
          </View>
        ) : searchQuery.trim() && searchResults.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-400 text-lg">No transactions found</Text>
            <Text className="text-gray-500 text-sm mt-2 text-center">
              Try searching with different keywords
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
