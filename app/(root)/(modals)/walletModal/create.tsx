import CustomField from "@/components/CustomField";
import icons from "@/constants/icons";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  ImagePropsBase,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

enum fieldTypes {
  TEXT = "text",
  NUMBER = "number",
  DATE = "date",
  SELECT = "select",
}

const fields = [
  { label: "Ingreso/Gasto", type: fieldTypes.SELECT, value: "" },
  { label: "Cartera", type: fieldTypes.SELECT, value: "" },
  { label: "Categoria", type: fieldTypes.SELECT, value: "" },
  { label: "Fecha", type: fieldTypes.DATE, value: "" },
  { label: "Monto", type: fieldTypes.NUMBER, value: "" },
  { label: "Descripcion", type: fieldTypes.TEXT, value: "" },
];

const WalletCreate = () => {
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
        <Text className="text-white text-2xl font-bold">
          Nueva Cartera
        </Text>
      </View>
      <ScrollView className="flex-1">
        <View className="mt-5">
          {fields.map((field, index) => (
            <CustomField
              key={index}
              label={field.label}
              value={field.value}
              type={field.type}
              onChangeText={(text) => {
                // Handle text change logic here
                console.log(`${field.label} changed to: ${text}`);
              }}
            />
          ))}
        </View>
      </ScrollView>
      <TouchableOpacity className="bg-blue-600 rounded-xl py-3 mt-5">
        <Text className="text-white text-center text-lg font-bold">
          Guardar
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default WalletCreate;
